export default async function handler(req, res) {
    // Enable CORS for all origins temporarily for testing
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
  
    if (req.method === 'GET') {
      res.status(200).json({ 
        message: 'Backend is working!',
        timestamp: new Date().toISOString(),
        origin: req.headers.origin,
        method: req.method
      });
      return;
    }
  
    if (req.method === 'POST') {
      res.status(200).json({ 
        message: 'POST request received!',
        body: req.body,
        timestamp: new Date().toISOString(),
        origin: req.headers.origin
      });
      return;
    }
  
    res.status(405).json({ error: 'Method not allowed' });
  }