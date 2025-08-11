const form = document.getElementById('postForm');
const outputSection = document.getElementById('outputSection');
const outputPre = document.getElementById('output');
const errorSection = document.getElementById('errorSection');
const errorMsg = document.getElementById('error');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  outputSection.hidden = true;
  errorSection.hidden = true;
  outputPre.textContent = '';
  errorMsg.textContent = '';

  const platform = document.getElementById('platform').value;
  const topic = document.getElementById('topic').value.trim();
  const goal = document.getElementById('goal').value.trim();

  if (!platform || !topic || !goal) {
    errorMsg.textContent = 'Please fill in all fields.';
    errorSection.hidden = false;
    return;
  }

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform, topic, goal }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'API error');
    }

    const data = await res.json();
    outputPre.textContent = data.output;
    outputSection.hidden = false;
  } catch (err) {
    errorMsg.textContent = err.message;
    errorSection.hidden = false;
  }
});
