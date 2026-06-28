// Services dropdown — click/tap to open on desktop & touch; hover also works via CSS.
(function () {
  const toggles = document.querySelectorAll('.nav-links .has-dropdown > .nav-drop-toggle');

  toggles.forEach((toggle) => {
    const li = toggle.closest('.has-dropdown');
    toggle.addEventListener('click', (e) => {
      // First click opens the menu (don't navigate yet); second click follows the link.
      if (!li.classList.contains('open')) {
        e.preventDefault();
        // close any other open dropdowns
        document.querySelectorAll('.nav-links .has-dropdown.open').forEach((o) => {
          if (o !== li) o.classList.remove('open');
        });
        li.classList.add('open');
      }
    });
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    document.querySelectorAll('.nav-links .has-dropdown.open').forEach((li) => {
      if (!li.contains(e.target)) li.classList.remove('open');
    });
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.nav-links .has-dropdown.open').forEach((li) => li.classList.remove('open'));
    }
  });
})();
