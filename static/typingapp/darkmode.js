document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('dark-toggle');
  if (!toggle) return;

  if (localStorage.getItem('darkmode') === 'on') {
    document.body.classList.add('dark');
  }

  toggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem(
      'darkmode',
      document.body.classList.contains('dark') ? 'on' : 'off'
    );
  });
});
