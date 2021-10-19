document.querySelectorAll('.fsb-select button').forEach(button => {
  button.addEventListener('click', event => {
    event.target.setAttribute('aria-expanded', 'true');
    event.stopPropagation();
  });
});

document.addEventListener('click', event => {
  document.querySelectorAll('.fsb-select button').forEach(button => {
    button.setAttribute('aria-expanded', 'false');
  });
});