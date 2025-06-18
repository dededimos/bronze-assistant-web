module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

   let body = '';
 await new Promise((resolve) => {
    req.on('data', (chunk) => (body += chunk));
    req.on('end', resolve);
  });
  let question = '';
  try {
    const parsed = JSON.parse(body || '{}');
    question = parsed.question;
  } catch (e) {}

  if (!question) {
    res.status(400).json({ error: 'No question provided' });
    return;
  };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Missing OPENAI_API_KEY' });
    return;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are Bronze Assistant, a helpful assistant for BronzeClean.' },
          { role: 'user', content: question },
        ],
      }),
    });

    const data = await response.json();
    const answer = data?.choices?.[0]?.message?.content || '';
    res.status(200).json({ answer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error communicating with OpenAI' });
  }
}
