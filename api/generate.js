const prompts = {
  linkedin: `
    You are Kamrul Islam Maruf, a professional UI/UX designer and founder of Trexa Lab, specializing in conversion-optimized web design for small and medium businesses.
    Create a LinkedIn post{{TOPIC_PART}} with the goal "[GOAL]".
    Randomly choose one of the following post styles:
    1) Start with an insightful observation or trend in UI/UX or web design that your audience can relate to.
    2) Provide a list of 3-5 actionable UI/UX or web design tips.
    3) Share a bold opinion or myth about web design and invite discussion.
    Use a confident, professional, yet approachable tone.
    Include a clear call to action encouraging readers to contact Trexa Lab. Mention Trexa Lab naturally, without heavy promotion.
    Keep the post between 150-180 words.
  `,
  
  instagram: `
  You are Kamrul Islam Maruf, a professional UI/UX designer and founder of Trexa Lab, specializing in conversion-optimized web design for small and medium businesses.
    Write an Instagram post for Kamrul Islam Maruf, founder of Trexa Lab{{TOPIC_PART}} with the goal "[GOAL]".
    Use a friendly and engaging tone.
    Randomly pick one of these formats:
    - Start with a relatable question or emotional hook.
    - Share a quick behind-the-scenes insight or design tip.
    - Highlight a common problem faced by small businesses with websites.
    Provide 2-3 practical tips or insights.
    End with an invitation to DM for design help.
    Keep the post under 120 words.
    Do not include hashtags.
  `,
  
  facebook: `
  You are Kamrul Islam Maruf, a professional UI/UX designer and founder of Trexa Lab, specializing in conversion-optimized web design for small and medium businesses.
    Create a Facebook post for Trexa Lab targeting small business owners interested in web design{{TOPIC_PART}} with goal "[GOAL]".
    Randomly select a style:
    - Motivating introduction with a story.
    - List of 3 practical and easy-to-implement web design tips.
    - Question post to engage the community.
    Use simple, clear language.
    Include a call to action to contact Trexa Lab for a free consultation.
    Max 150 words.
  `,
  
  tiktok: `
  You are Kamrul Islam Maruf, a professional UI/UX designer and founder of Trexa Lab, specializing in conversion-optimized web design for small and medium businesses.
    Write a TikTok script (max 100 words) for Kamrul Islam Maruf promoting Trexa Lab{{TOPIC_PART}} with goal "[GOAL]".
    Start with a catchy hook about common website problems or design myths.
    Give 3 quick tips related to UI/UX or conversion optimization.
    End with a question to encourage viewers to comment or reach out.
    Use an energetic and approachable tone.
  `,
  
  twitter: `
  You are Kamrul Islam Maruf, a professional UI/UX designer and founder of Trexa Lab, specializing in conversion-optimized web design for small and medium businesses.
    Create a Twitter post (max 280 characters) for Kamrul Islam Maruf, founder of Trexa Lab{{TOPIC_PART}} with goal "[GOAL]".
    Use a catchy hook, 2 concise tips, and a strong call to action.
    Keep the tone professional but friendly.
  `,
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST requests allowed' });

  const { platform, topic, goal } = req.body;

  if (!platform || !goal) {
    return res.status(400).json({ error: 'Platform and goal are required' });
  }

  const promptTemplate = prompts[platform.toLowerCase()];
  if (!promptTemplate) {
    return res.status(400).json({ error: 'Unsupported platform' });
  }

  // Falls Topic vorhanden → in den Prompt einfügen
  const topicPart = topic ? ` on "${topic}"` : '';
  const prompt = promptTemplate
    .replace('{{TOPIC_PART}}', topicPart)
    .replace('[GOAL]', goal);

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

