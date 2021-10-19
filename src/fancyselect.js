document.querySelectorAll('.fsb-select button').forEach(button => {
  const list = button.nextElementSibling;

  button.addEventListener('click', event => {
    event.target.setAttribute('aria-expanded', 'true');
    event.stopPropagation();
  });

  for (const item of list.children) {
    button.innerHTML = list.querySelector('[aria-selected="true"]').innerHTML;

    item.addEventListener('click', event => {
      list.querySelector('[aria-selected="true"]').setAttribute('aria-selected', 'false');
      item.setAttribute('aria-selected', 'true');
      button.innerHTML = item.innerHTML;
    });
  }
});

document.addEventListener('click', event => {
  document.querySelectorAll('.fsb-select button').forEach(button => {
    button.setAttribute('aria-expanded', 'false');
  });
});