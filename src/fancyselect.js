(function (document) {
  document.querySelectorAll('.fsb-select > button').forEach(button => {
    const list = button.nextElementSibling;
    const selectedItem = list.querySelector('[aria-selected="true"]');
    const widthAdjuster = list.nextElementSibling;

    // Used to force the select box to take the width of the longest item by default
    widthAdjuster.innerHTML = `<div style="width: ${list.firstElementChild.offsetWidth}px;"></div>`;

    button.addEventListener('click', event => {
      event.target.setAttribute('aria-expanded', 'true');
      event.stopPropagation();
    });

    for (const item of list.children) {
      if (selectedItem) {
        button.innerHTML = selectedItem.innerHTML;
      }

      item.addEventListener('click', event => {
        if (selectedItem) {
          selectedItem.setAttribute('aria-selected', 'false');
        }

        item.setAttribute('aria-selected', 'true');
        button.innerHTML = item.innerHTML;
      });
    }
  });

  document.addEventListener('click', event => {
    document.querySelectorAll('.fsb-select > button').forEach(button => {
      button.setAttribute('aria-expanded', 'false');
    });
  });
})(document)
  