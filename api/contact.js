export default async function handler(req, res) {
  // Set CORS headers for ALL requests (including OPTIONS)
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000', 
    'https://codiii.com',
    'https://www.codiii.com',
    'https://www.google.com' // For testing
  ];

  const origin = req.headers.origin;
  
  // Always set CORS headers
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // For testing, allow any origin temporarily
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight (OPTIONS) requests
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS preflight request from:', origin);
    res.status(200).end();
    return;
  }

  // Only allow POST for actual requests
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  try {
    const formData = req.body;
    
    console.log('Form submission received:', {
      email: formData.email,
      timestamp: new Date().toISOString(),
      origin: origin,
      ip: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown'
    });

    // Validate required environment variable
    if (!process.env.GOOGLE_APP_SCRIPT) {
      console.error('GOOGLE_APP_SCRIPT environment variable not set');
      return res.status(500).json({
        status: 'error',
        message: 'Server configuration error'
      });
    }

    // Validate request body
    if (!formData.email || !formData.firstName || !formData.lastName) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields'
      });
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
        ipAddress: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown',
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      console.error('Google Apps Script error:', response.status, response.statusText);
      return res.status(500).json({
        status: 'error',
        message: 'Form submission failed'
      });
    }

    const result = await response.json();
    console.log('Google Apps Script response:', result);

    res.status(200).json(result);

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while processing your request'
    });
  }
}