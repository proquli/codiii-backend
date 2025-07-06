export default function handler(req, res) {
    // Set CORS headers immediately - BEFORE any other logic
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
    console.log('Contact2 endpoint - Method:', req.method);
    console.log('Contact2 endpoint - Origin:', req.headers.origin);
  
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      console.log('Contact2: Handling OPTIONS preflight');
      res.status(200).end();
      return;
    }
  
    // Only allow POST
    if (req.method !== 'POST') {
      return res.status(405).json({ status: 'error', message: 'Method not allowed' });
    }
  
    try {
      const formData = req.body;
      
      console.log('Contact2 form submission received:', {
        email: formData.email,
        timestamp: new Date().toISOString()
      });
  
      // Basic validation
      if (!formData.email || !formData.firstName || !formData.lastName) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing required fields'
        });
      }
  
      // Return success
      res.status(200).json({
        status: 'success',
        message: 'Contact2 endpoint working!',
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
      console.error('Contact2 form error:', error);
      res.status(500).json({
        status: 'error',
        message: 'An error occurred while processing your request'
      });
    }
  }