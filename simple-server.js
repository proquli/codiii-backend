// simple-server.js - ES Module version
import dotenv from 'dotenv';
import http from 'http';
import { URL } from 'url';

dotenv.config();

const PORT = process.env.PORT || 3001;

// Simple rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5;

function checkRateLimit(clientId) {
  const now = Date.now();
  
  if (!rateLimitMap.has(clientId)) {
    rateLimitMap.set(clientId, []);
  }
  
  const requests = rateLimitMap.get(clientId);
  const validRequests = requests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (validRequests.length >= MAX_REQUESTS) {
    return false;
  }
  
  validRequests.push(now);
  rateLimitMap.set(clientId, validRequests);
  return true;
}

function setCORSHeaders(res, origin) {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    process.env.FRONTEND_URL
  ].filter(Boolean);

  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const origin = req.headers.origin;
  
  setCORSHeaders(res, origin);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Health check
  if (url.pathname === '/health' && req.method === 'GET') {
    sendJSON(res, 200, { 
      status: 'ok', 
      timestamp: new Date().toISOString() 
    });
    return;
  }
  
  // Contact form endpoint
  if (url.pathname === '/api/contact' && req.method === 'POST') {
    try {
      // Parse request body
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          const formData = JSON.parse(body);
          const clientId = req.socket.remoteAddress + (formData.email || '');
          
          console.log('Form submission received:', {
            email: formData.email,
            timestamp: new Date().toISOString(),
            ip: req.socket.remoteAddress
          });
          
          // Rate limiting
          if (!checkRateLimit(clientId)) {
            sendJSON(res, 429, {
              status: 'error',
              message: 'Too many requests. Please try again later.'
            });
            return;
          }
          
          // Validate required environment variable
          if (!process.env.GOOGLE_APP_SCRIPT) {
            console.error('GOOGLE_APP_SCRIPT environment variable not set');
            sendJSON(res, 500, {
              status: 'error',
              message: 'Server configuration error'
            });
            return;
          }
          
          // Validate request body
          if (!formData.email || !formData.firstName || !formData.lastName) {
            sendJSON(res, 400, {
              status: 'error',
              message: 'Missing required fields'
            });
            return;
          }
          
          // Forward to Google Apps Script
          const fetch = (await import('node-fetch')).default;
          const response = await fetch(process.env.GOOGLE_APP_SCRIPT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...formData,
              userAgent: req.headers['user-agent'],
              ipAddress: req.socket.remoteAddress,
              timestamp: new Date().toISOString()
            })
          });
          
          // Check if Google Apps Script responded
          if (!response.ok) {
            console.error('Google Apps Script error:', response.status, response.statusText);
            sendJSON(res, 500, {
              status: 'error',
              message: 'Form submission failed'
            });
            return;
          }
          
          // Parse response from Google Apps Script
          let result;
          try {
            result = await response.json();
          } catch (parseError) {
            console.error('Failed to parse Google Apps Script response:', parseError);
            sendJSON(res, 500, {
              status: 'error',
              message: 'Invalid response from form processor'
            });
            return;
          }
          
          console.log('Google Apps Script response:', result);
          
          // Forward the response back to frontend
          sendJSON(res, 200, result);
          
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          sendJSON(res, 400, {
            status: 'error',
            message: 'Invalid JSON in request body'
          });
        }
      });
      
    } catch (error) {
      console.error('Contact form error:', error);
      sendJSON(res, 500, {
        status: 'error',
        message: 'An error occurred while processing your request'
      });
    }
    return;
  }
  
  // 404 for all other routes
  sendJSON(res, 404, {
    status: 'error',
    message: 'Endpoint not found'
  });
});

server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Cleanup rate limit map periodically
setInterval(() => {
  const now = Date.now();
  for (const [clientId, requests] of rateLimitMap.entries()) {
    const validRequests = requests.filter(time => now - time < RATE_LIMIT_WINDOW);
    if (validRequests.length === 0) {
      rateLimitMap.delete(clientId);
    } else {
      rateLimitMap.set(clientId, validRequests);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes