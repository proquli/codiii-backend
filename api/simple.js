export default function handler(req, res) {
    // Use the same CORS pattern as your working health.js
    const allowedOrigins = [
      'http://localhost:5173',
      'https://codiii.com',
      'https://www.codiii.com',
      'https://www.google.com'  // Add Google for testing
    ];
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    res.status(200).json({ 
      message: 'Simple test works!', 
      method: req.method,
      origin: origin,
      timestamp: new Date().toISOString()
    });
  }