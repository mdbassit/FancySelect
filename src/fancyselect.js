(function (document) {

  /**
   * Shortcut for addEventListener with delegation support.
   * @param {object} context The context to which the listener is attached.
   * @param {string} type Event type.
   * @param {(string|function)} selector Event target if delegation is used, event handler if not.
   * @param {function} [fn] Event handler if delegation is used.
   */ 
  function addListener(context, type, selector, fn) {
    const matches = Element.prototype.matches || Element.prototype.msMatchesSelector;

    // Delegate event to the target of the selector
    if (typeof selector === 'string') {
      context.addEventListener(type, event => {
        if (matches.call(event.target, selector)) {
          fn.call(event.target, event);
        }
      });

    // If the selector is not a string then it's a function
    // in which case we need regular event listener
    } else {
      fn = selector;
      context.addEventListener(type, fn);
    }
  }

  document.querySelectorAll('.fsb-select > button').forEach(button => {
    const list = button.nextElementSibling;
    const selectedItem = list.querySelector('[aria-selected="true"]');
    const widthAdjuster = list.nextElementSibling;

    // Used to force the select box to take the width of the longest item by default
    widthAdjuster.innerHTML = `<div style="width: ${list.firstElementChild.offsetWidth}px;"></div>`;

    if (selectedItem) {
      button.innerHTML = selectedItem.innerHTML;
    }
  });  

  addListener(document, 'click', '.fsb-select > button', event => {
    event.target.setAttribute('aria-expanded', 'true');
    event.stopImmediatePropagation();
  });

  addListener(document, 'click', '.fsb-select > ul > li', event => {
    const item = event.target;
    const list = item.parentNode;
    const button = list.previousElementSibling;
    const selectedItem = list.querySelector('[aria-selected="true"]');

    if (selectedItem) {
      selectedItem.setAttribute('aria-selected', 'false');
    }

    event.target.setAttribute('aria-selected', 'true');
    button.innerHTML = item.innerHTML;
  });

  addListener(document, 'click', event => {
    document.querySelectorAll('.fsb-select > button').forEach(button => {
      button.setAttribute('aria-expanded', 'false');
    });
  });
})(document)
  