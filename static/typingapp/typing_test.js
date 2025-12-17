// static/typingapp/typing_test.js
document.addEventListener('DOMContentLoaded', () => {
  

  // Elements
  const startBtn = document.getElementById('start-btn');
  const submitBtn = document.getElementById('submit-btn');
  const typingArea = document.getElementById('typing-area');
  const sourceBox = document.getElementById('source-text');
  const timerSpan = document.getElementById('timer');
  const wpmSpan = document.getElementById('wpm');
  const accSpan = document.getElementById('accuracy');
  const resultDiv = document.getElementById('result');
  const countdownDiv = document.getElementById('countdown');
  const modeSelect = document.getElementById('mode');

  // Sample texts
  const texts = {
    easy: [
      "The quick brown fox jumps over the lazy dog.",
      "Typing is a skill that gets better with practice."
    ],
    medium: [
      "Django is a high-level Python web framework that encourages rapid development and clean, pragmatic design.",
      "Consistency in practice improves speed and reduces errors over time."
    ],
    hard: [
      "The axiomatic lattice of cognition collapses whenever certainty masquerades as completion, for ontological inertia ensures that meaning decays faster than matter.",
      "Optimization often demands understanding of algorithmic complexity as well as system level behaviour and caching strategies."
    ]
  };

  let duration = 60;
  let level = 'easy';
  let totalTyped = 0;
  let correctChars = 0;
  let errors = 0;
  let timer = null;
  let timeLeft = 0;
  let startTime = null;
  let sourceText = '';

  // Helper functions
  function formatTime(s) {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  function pickText(level) {
    const arr = texts[level];
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function startActualTest() {
    level = document.getElementById('level').value;
    duration = parseInt(document.getElementById('duration').value);
    sourceText = pickText(level);
    sourceBox.innerHTML = '';

    // wrap each character in span
    sourceText.split('').forEach(char => {
      const span = document.createElement('span');
      span.textContent = char;
      sourceBox.appendChild(span);
    });

    typingArea.value = '';
    typingArea.disabled = false;
    typingArea.focus();
    submitBtn.disabled = false;

    totalTyped = 0;
    correctChars = 0;
    errors = 0;
    timeLeft = duration;
    startTime = Date.now();

    timerSpan.textContent = formatTime(timeLeft);

    timer = setInterval(() => {
      timeLeft--;
      timerSpan.textContent = formatTime(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(timer);
        finishTest();
      }
    }, 1000);
  }

  // Start button click with 3-second countdown
  startBtn.addEventListener('click', () => {
    let count = 3;
    countdownDiv.style.display = 'block';
    countdownDiv.textContent = count;

    const interval = setInterval(() => {
      count--;
      if (count === 0) {
        clearInterval(interval);
        countdownDiv.style.display = 'none';
        startActualTest();
      } else {
        countdownDiv.textContent = count;
      }
    }, 1000);
  });

  // Typing input event
  typingArea.addEventListener('input', () => {
    const typed = typingArea.value;
    const spans = sourceBox.querySelectorAll('span');
    correctChars = 0;

    spans.forEach((span, index) => {
      const typedChar = typed[index];
      if (typedChar == null) {
        span.classList.remove('correct', 'wrong');
      } else if (typedChar === span.textContent) {
        span.classList.add('correct');
        span.classList.remove('wrong');
        correctChars++;
      } else {
        span.classList.add('wrong');
        span.classList.remove('correct');
      }
    });

    totalTyped = typed.length;
    errors = totalTyped - correctChars;

    const elapsed = (Date.now() - startTime) / 1000 / 60;
    const wpm = (correctChars / 5) / Math.max(elapsed, 0.01);
    const accuracy = totalTyped ? (correctChars / totalTyped) * 100 : 0;

    wpmSpan.textContent = `WPM: ${Math.round(wpm)}`;
    accSpan.textContent = `Accuracy: ${Math.round(accuracy)}%`;
  });

  // Finish test
  function finishTest() {
    if (typingArea.disabled) return;
    typingArea.disabled = true;
    submitBtn.disabled = false;

    const typed = typingArea.value;
    const minutes = duration / 60;
    const wpm = (correctChars / 5) / minutes;
    const accuracy = totalTyped > 0 ? (correctChars / totalTyped) * 100 : 0;

    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `<h3>Result</h3>
      <p>WPM: ${wpm.toFixed(1)}</p>
      <p>Accuracy: ${accuracy.toFixed(1)}%</p>
      <p>Errors: ${errors}</p>`;

    // Send result to server only in Test mode
    if (modeSelect.value === 'test') {
      sendResult({
        duration_seconds: duration,
        level: level,
        source_text: sourceText,
        typed_text: typed,
        correct_chars: correctChars,
        total_typed_chars: totalTyped,
        errors: errors,
        wpm: parseFloat(wpm.toFixed(2)),
        accuracy: parseFloat(accuracy.toFixed(2))
      });
    }
  }

  // Submit button
  submitBtn.addEventListener('click', () => {
    if (timer) clearInterval(timer);
    finishTest();
  });

  // Send result to Django backend
  function sendResult(payload) {
    fetch('/save-result/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': CSRF_TOKEN
      },
      body: JSON.stringify(payload)
    })
      .then(r => r.json())
      .then(data => console.log('saved', data))
      .catch(e => console.error(e));
  }
});
