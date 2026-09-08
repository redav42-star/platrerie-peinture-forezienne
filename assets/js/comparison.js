(() => {
  document.querySelectorAll('[data-comparison]').forEach(root => {
    root.querySelectorAll('button[data-mode]').forEach(button => {
      button.addEventListener('click', () => {
        const mode = button.dataset.mode;
        root.dataset.view = mode;
        root.querySelectorAll('button[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
        root.querySelectorAll('figure[data-state]').forEach(figure => {
          figure.hidden = mode !== 'both' && figure.dataset.state !== mode;
        });
      });
    });
  });
})();
