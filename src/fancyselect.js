document.querySelector('.fsb-select button').addEventListener('click', event => {
  const expended = event.target.getAttribute('aria-expanded');
  event.target.setAttribute('aria-expanded', `${ (expended === "true") ? "false" : true }`);
});