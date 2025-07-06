export default async function handler(req, res) {
  // Set CORS headers for your domains
  const allowedOrigins = [
    'https://codiii.com',
    'https://www.codiii.com',
    'http://localhost:5173',
    'http://localhost:3000'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  try {
    const formData = req.body;
    
    console.log('Form submission received:', {
      email: formData.email,
      timestamp: new Date().toISOString(),
      origin: origin
    });

    // Validate required environment variable
    if (!process.env.GOOGLE_APP_SCRIPT) {
      console.error('GOOGLE_APP_SCRIPT environment variable not set');
      return res.status(500).json({
        status: 'error',
        message: 'Server configuration error'
      });
    }

    // Validate required fields
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