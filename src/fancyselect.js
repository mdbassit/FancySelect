document.querySelectorAll('.fsb-select button').forEach(button => {
  const list = button.nextElementSibling;
  const widthAdjuster = list.nextElementSibling;

  // Used to force the select box to take the width of the longest item by default
  widthAdjuster.innerHTML = `<div style="width: ${list.firstElementChild.offsetWidth}px;"></div>`;

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