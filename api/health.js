export default function handler(req, res) {
  // Add CORS headers
  const allowedOrigins = [
    'http://localhost:5173',
    'https://codiii.com',
    'https://www.codiii.com'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
}