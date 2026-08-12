export default async function handler(req, res) { 
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  if (req.method === 'OPTIONS') return res.status(200).end(); 
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' }); 
  if (!apiKey) return res.status(400).json({ error: 'No API key' }); 
  try { 
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey, { 
      method: 'POST', headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: req.body.prompt }] }] }) 
    }); 
    const data = await response.json(); 
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message }); 
    return res.status(200).json({ text }); 
  } catch (err) { 
    return res.status(500).json({ error: err.message }); 
  } 
} 
