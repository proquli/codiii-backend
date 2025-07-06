export default function handler(req, res) {
    // Set CORS headers first
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
    console.log('Request method:', req.method);
    console.log('Request origin:', req.headers.origin);
  
    if (req.method === 'OPTIONS') {
      console.log('Handling OPTIONS preflight request');
      res.status(200).end();
      return;
    }
  
    if (req.method === 'POST') {
      console.log('Handling POST request');
      res.status(200).json({
        message: 'CORS test successful!',
        method: req.method,
        timestamp: new Date().toISOString(),
        body: req.body
      });
      return;
    }
  
    if (req.method === 'GET') {
      res.status(200).json({
        message: 'CORS test endpoint working!',
        method: req.method,
        timestamp: new Date().toISOString()
      });
      return;
    }
  
    res.status(405).json({ error: 'Method not allowed' });
  }