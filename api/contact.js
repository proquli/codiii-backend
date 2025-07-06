export default function handler(req, res) {
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

    // Validate required fields
    if (!formData.email || !formData.firstName || !formData.lastName) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields'
      });
    }

    // For now, return success without Google Apps Script
    // We'll add that back once basic form is working
    res.status(200).json({
      status: 'success',
      message: 'Form received successfully!',
      data: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        company: formData.company,
        role: formData.role
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while processing your request'
    });
  }
}