document.addEventListener('DOMContentLoaded', () => {

  const startBtn = document.getElementById('start-btn');
  const submitBtn = document.getElementById('submit-btn');
  const typingArea = document.getElementById('typing-area');
  typingArea.rows = 10;      // initial height in rows
  typingArea.wrap = 'soft';   // allow text to wrap naturally

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
      "Typing is a skill that gets better with practice.",
      "Typing skills improve with regular and focused practice.",
      "Fast typing requires accuracy more than speed.",
      "Daily practice helps build strong muscle memory.",
      "Good posture makes typing more comfortable.",
      "Touch typing saves time and effort.",
      "Accuracy comes before speed in typing.",
      "Consistent effort leads to better typing results.",
      "Relaxed hands help reduce typing mistakes.",
      "Typing fluency increases with repetition.",
      "Using all fingers improves typing efficiency.",
      "Short practice sessions are very effective.",
      "Typing without looking boosts confidence.",
      "Steady rhythm improves typing flow.",
      "Proper hand placement increases speed.",
      "Typing practice sharpens keyboard control.",
      "Focused practice leads to fewer errors."
    ],
    medium: [
      "Django is a high-level Python web framework that encourages rapid development and clean design.",
      "Consistency in practice improves speed and reduces errors.",
      "Comfortable seating improves typing sessions.",
      "Typing daily builds long term skills.",
      "Clean keyboards improve typing comfort.",
      "Slow typing helps build accuracy first.",
      "Correct technique makes typing easier.",
      "Typing skills are useful in many jobs.",
      "Patience is key when learning typing.",
      "Typing games make learning more fun.",
      "Good lighting improves typing accuracy.",
      "Typing efficiency grows with experience.",
      "Regular drills strengthen finger memory.",
      "Typing smoothly reduces fatigue.",
      "Strong typing skills save time.",
      "Practice builds typing confidence.",
      "Typing becomes faster with time.",
      "Errors decrease with careful practice.",
      "Typing focus improves overall speed.",
      "Keyboard familiarity boosts performance."
    ],
    hard: [
      "Optimization often demands understanding of algorithmic complexity and system level behavior.",
      "The axiomatic lattice of cognition collapses whenever certainty masquerades as completion.",
      "Typing is a skill that improves significantly when you practice regularly and pay attention to both speed and accuracy, which helps in everyday computer tasks.",
      "The quick brown fox jumps over the lazy dog repeatedly, showing that even a simple sentence can be used to practice every letter on the keyboard efficiently.",
      "Practice daily not only increases your typing speed but also strengthens your muscle memory and builds confidence in using all your fingers without looking at the keys.",
      "Learning to type using touch typing techniques allows you to type quickly, smoothly, and accurately while keeping your eyes on the screen rather than the keyboard.",
      "Typing games, structured exercises, and timed drills can make practice engaging and help maintain a balance between fun and the development of professional typing skills.",
      "Every typing session, no matter how short, adds to your overall improvement, especially if you focus on eliminating errors and maintaining a steady rhythm for better consistency.",
      "Consistent and focused typing exercises, combined with correct posture and hand positioning, can dramatically reduce mistakes and increase overall efficiency over time."
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
  let globalIndex = 0;   // sourceText ka overall index


  function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function pickText() {
    const arr = texts[level];
    let finalText = '';

    for (let i = 0; i < 100; i++) {
      finalText += arr[Math.floor(Math.random() * arr.length)] + '\n';
    }

    return finalText.trim();
  }

   
  

  function startActualTest() {
    if (timer) clearInterval(timer);
    globalIndex = 0;   // 🔥 reset on every new test
    typingArea.value = '';

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
    // sourceBox.scrollTop = sourceBox.scrollHeight;

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

      if (ch === undefined) {
        // 🔥 BACKSPACE CASE → clean state
        span.classList.remove('correct', 'wrong');
      }
      else if (ch === span.textContent) {
        span.classList.add('correct');
        span.classList.remove('wrong');
        correctChars++;
      }
      else {
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

    // 🔥 cursor follow fix
    const currentSpan = spans[typed.length];
    if (currentSpan) {
      currentSpan.scrollIntoView({
        behavior: 'auto',
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
