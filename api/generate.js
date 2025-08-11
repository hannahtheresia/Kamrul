const prompts = {
  linkedin: `Create a professional LinkedIn post about "[TOPIC]" with the goal "[GOAL]". The post should include a strong hook, 3 practical tips, and a clear call to action. Maximum 180 words, formal but personal tone.`,
  instagram: `Write an Instagram post about "[TOPIC]" with the goal "[GOAL]". Start with an emotional question, provide 2-3 simple tips, use a friendly tone, max 120 words. Do not include hashtags.`,
  facebook: `Create a Facebook post about "[TOPIC]" aimed at a casual community. The goal is "[GOAL]". Use a motivating intro, 3 concrete tips, simple language, max 150 words.`,
  tiktok: `Write a short TikTok script (max 100 words) about "[TOPIC]", goal "[GOAL]". Start with a strong hook, give 3 quick tips, end with a question to the viewers.`,
  twitter: `Create a Twitter post (max 280 characters) about "[TOPIC]", goal "[GOAL]". Use a catchy hook, 2 tips, and a clear call to action.`,
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST requests allowed' });

  const { platform, topic, goal } = req.body;

  if (!platform || !topic || !goal) {
    return res.status(400).json({ error: 'platform, topic and goal are required' });
  }

  const promptTemplate = prompts[platform.toLowerCase()];
  if (!promptTemplate) {
    return res.status(400).json({ error: 'Unsupported platform' });
  }

  const prompt = promptTemplate.replace('[TOPIC]', topic).replace('[GOAL]', goal);

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 400,
        temperature: 0.3,
      }),
    });

    const json = await openaiRes.json();

    if (json.error) {
      return res.status(500).json({ error: json.error.message || 'OpenAI API error' });
    }

    const output = json.choices?.[0]?.message?.content || 'No output received.';
    res.status(200).json({ output: output.trim() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
