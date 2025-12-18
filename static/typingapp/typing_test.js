// static/typingapp/typing_test.js
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

  /* ================= TEXT BANK ================= */
  const texts = {
    easy: [
      "The quick brown fox jumps over the lazy dog.",
      "Typing every day improves both speed and accuracy.",
      "Practice makes a person confident and focused."
    ],
    medium: [
      "Django is a powerful web framework that helps developers build applications quickly.",
      "Regular typing practice enhances muscle memory and reduces mistakes.",
      "Learning consistently leads to better performance over time."
    ],
    hard: [
      "For years, health enthusiasts have lived by the age-old motto that an apple a day keeps the doctor away.",
      "Optimization requires a deep understanding of algorithms, memory usage, and system behavior.",
      "Cognitive flexibility improves when individuals challenge their comfort zones regularly."
    ]
  };

  let duration = 60;
  let level = 'easy';
  let timer = null;
  let timeLeft = 0;
  let startTime = null;

  let sourceText = '';
  let totalTyped = 0;
  let correctChars = 0;
  let errors = 0;

  /* ================= HELPERS ================= */
  function formatTime(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  function getRandomParagraph() {
    const arr = texts[level];
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function appendNewParagraph() {
    const para = getRandomParagraph();
    sourceText += para + "\n\n";

    para.split('').forEach(char => {
      const span = document.createElement('span');
      span.textContent = char;
      sourceBox.appendChild(span);
    });

    // line break
    sourceBox.appendChild(document.createElement('br'));
    sourceBox.appendChild(document.createElement('br'));
  }

  /* ================= START TEST ================= */
  function startActualTest() {
    level = document.getElementById('level').value;
    duration = parseInt(document.getElementById('duration').value);

    sourceBox.innerHTML = '';
    sourceText = '';
    typingArea.value = '';
    typingArea.disabled = false;
    typingArea.focus();

    totalTyped = 0;
    correctChars = 0;
    errors = 0;

    appendNewParagraph();
    appendNewParagraph(); // start with multiple lines

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

  /* ================= COUNTDOWN ================= */
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

  /* ================= TYPING ================= */
  typingArea.addEventListener('input', () => {
    const typed = typingArea.value;
    const spans = sourceBox.querySelectorAll('span');

    correctChars = 0;

    spans.forEach((span, i) => {
      const typedChar = typed[i];
      if (!typedChar) {
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

    const elapsedMin = (Date.now() - startTime) / 60000;
    const wpm = (correctChars / 5) / Math.max(elapsedMin, 0.01);
    const accuracy = totalTyped ? (correctChars / totalTyped) * 100 : 0;

    wpmSpan.textContent = `WPM: ${Math.round(wpm)}`;
    accSpan.textContent = `Accuracy: ${Math.round(accuracy)}%`;

    /* 🔥 AUTO ADD MORE TEXT */
    if (typed.length > sourceText.length * 0.7) {
      appendNewParagraph();
    }
  });

  /* ================= FINISH ================= */
  function finishTest() {
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
          level,
          source_text: sourceText,
          typed_text: typingArea.value,
          correct_chars: correctChars,
          total_typed_chars: totalTyped,
          errors,
          wpm,
          accuracy
        })
      });
    }
  }

  submitBtn.addEventListener('click', () => {
    if (timer) clearInterval(timer);
    finishTest();
  });

});
