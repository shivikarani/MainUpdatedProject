document.addEventListener('DOMContentLoaded', () => {

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

  const texts = {
    easy: [
      "The quick brown fox jumps over the lazy dog.",
      "Typing is a skill that gets better with practice."
    ],
    medium: [
      "Django is a high-level Python web framework that encourages rapid development and clean design.",
      "Consistency in practice improves speed and reduces errors."
    ],
    hard: [
      "Optimization often demands understanding of algorithmic complexity and system level behavior.",
      "The axiomatic lattice of cognition collapses whenever certainty masquerades as completion."
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
  let testFinished = false;   // 🔥 IMPORTANT

  function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function pickText() {
  const arr = texts[level];
  let finalText = '';

  for (let i = 0; i < 6; i++) {
    finalText += arr[Math.floor(Math.random() * arr.length)] + '\n\n';
  }

  return finalText.trim();
}

   // 🔥 RESET OLD STATS
  

  function startActualTest() {
    if (timer) clearInterval(timer);
    wpmSpan.textContent = 'WPM: 0';
    accSpan.textContent = 'Accuracy: 0%';
    timerSpan.textContent = formatTime(duration);

    resultDiv.style.display = 'none';
    resultDiv.innerHTML = '';

    typingArea.scrollTop = 0;
    sourceBox.scrollTop = 0;
    testFinished = false;

    // ✅ PROBLEM 3 FIX: purana result hatao
    resultDiv.style.display = 'none';
    resultDiv.innerHTML = '';

    level = document.getElementById('level').value;
    duration = parseInt(document.getElementById('duration').value);

    sourceText = pickText();
    sourceBox.innerHTML = '';

    sourceText.split('').forEach(char => {
       const span = document.createElement('span');

          if (char === '\n') {
            span.innerHTML = '<br>';
          } else {
            span.textContent = char;
          }

          sourceBox.appendChild(span);
        });


    // ✅ scroll fix
    sourceBox.scrollTop = sourceBox.scrollHeight;

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

    if (timer) clearInterval(timer);

    timer = setInterval(() => {
      timeLeft--;
      timerSpan.textContent = formatTime(timeLeft);
      if (timeLeft <= 0) {
        finishTest();
      }
    }, 1000);
  }

  // ✅ Start button with countdown
  startBtn.addEventListener('click', () => {
    let count = 3;
    countdownDiv.style.display = 'block';
    countdownDiv.textContent = count;

    const cd = setInterval(() => {
      count--;
      if (count === 0) {
        clearInterval(cd);
        countdownDiv.style.display = 'none';
        startActualTest();
      } else {
        countdownDiv.textContent = count;
      }
    }, 1000);
  });

  // Typing logic
  typingArea.addEventListener('input', () => {
    const typed = typingArea.value;
    const spans = sourceBox.querySelectorAll('span');
    correctChars = 0;

    spans.forEach((span, i) => {
      const ch = typed[i];
      if (ch == null) {
        span.classList.remove('correct', 'wrong');
      } else if (ch === span.textContent) {
        span.classList.add('correct');
        span.classList.remove('wrong');
        correctChars++;
      } else {
        span.classList.add('wrong');
        span.classList.remove('correct');
      }
    });

    const currentIndex = typingArea.value.length;
    const currentSpan = sourceBox.querySelectorAll('span')[currentIndex];

    if (currentSpan) {
      currentSpan.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }

    totalTyped = typed.length;
    errors = totalTyped - correctChars;

    const elapsedMin = (Date.now() - startTime) / 60000;
    const wpm = (correctChars / 5) / Math.max(elapsedMin, 0.01);
    const accuracy = totalTyped ? (correctChars / totalTyped) * 100 : 0;

    wpmSpan.textContent = `WPM: ${Math.round(wpm)}`;
    accSpan.textContent = `Accuracy: ${Math.round(accuracy)}%`;
    const index = typingArea.value.length;

    if (spans[index]) {
      spans[index].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }

  });

  // ✅ PROBLEM 1 FIX: force submit anytime
  submitBtn.addEventListener('click', () => {
    finishTest();
  });

  function finishTest() {
    if (testFinished) return;
    testFinished = true;

    clearInterval(timer);
    typingArea.disabled = true;

    const minutes = duration / 60;
    const wpm = (correctChars / 5) / minutes;
    const accuracy = totalTyped ? (correctChars / totalTyped) * 100 : 0;

    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
      <h3>Result</h3>
      <p>WPM: ${wpm.toFixed(1)}</p>
      <p>Accuracy: ${accuracy.toFixed(1)}%</p>
      <p>Errors: ${errors}</p>
    `;

    if (modeSelect.value === 'test') {
      fetch('/save-result/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': CSRF_TOKEN
        },
        body: JSON.stringify({
          duration_seconds: duration,
          level: level,
          source_text: sourceText,
          typed_text: typingArea.value,
          correct_chars: correctChars,
          total_typed_chars: totalTyped,
          errors: errors,
          wpm: wpm,
          accuracy: accuracy
        })
      });
    }
  }

});
