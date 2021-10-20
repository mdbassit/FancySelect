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

  /**
   * Open a list box.
   * @param {object} button The button to which the list box is attached.
   */ 
  function openListBox(button) {
    const list = button.nextElementSibling;
    let selectedItem = list.querySelector('[aria-selected="true"]');

    if (!selectedItem) {
      selectedItem = list.firstElementChild;
    }

    button.setAttribute('aria-expanded', 'true');
    selectedItem.focus();
  }

  /**
   * Close the active list box.
   * @param {boolean} focusButton If true, set focus on the button to which the list box is attached.
   */ 
  function closeListBox(focusButton) {
    const activeListBox = document.querySelector('.fsb-select > button[aria-expanded="true"]');
    
    if (activeListBox) {
      activeListBox.setAttribute('aria-expanded', 'false');

      if (focusButton) {
        activeListBox.focus();
      }
    }
  }

  /**
   * Set the selected item.
   * @param {object} item The item to be selected.
   */ 
  function selectItem(item) {
    const list = item.parentNode;
    const button = list.previousElementSibling;
    const selectedItem = list.querySelector('[aria-selected="true"]');

    if (selectedItem) {
      selectedItem.setAttribute('aria-selected', 'false');
    }

    item.setAttribute('aria-selected', 'true');
    button.innerHTML = item.innerHTML;
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
    openListBox(event.target);
    event.stopImmediatePropagation();
  });

  addListener(document, 'keydown', '.fsb-select > button', event => {
    let preventDefault = true;

    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowDown':
      case 'Enter':
      case ' ':
        openListBox(event.target);
        break;
      default:
        preventDefault = false;
    }

    if (preventDefault) {
      event.preventDefault();
    }
  });

  addListener(document.documentElement, 'mousemove', '.fsb-select > ul > li', event => {
    event.target.focus();
  });

  addListener(document, 'click', '.fsb-select > ul > li', event => {
    selectItem(event.target);
    closeListBox(true);
  });

  addListener(document, 'keydown', '.fsb-select > ul > li', event => {
    const item = event.target;
    let preventDefault = true;

    switch (event.key) {
      case 'ArrowUp':
        if (item.previousElementSibling) {
          item.previousElementSibling.focus();
        }
        break;
      case 'ArrowDown':
        if (item.nextElementSibling) {
          item.nextElementSibling.focus();
        }
        break;
      case 'Home':
        item.parentNode.firstElementChild.focus();
        break;
      case 'End':
        item.parentNode.lastElementChild.focus();
        break;
      case 'Tab':
        selectItem(item);
        closeListBox();
        preventDefault = false;
        break;
      case 'Enter':
      case ' ':
        selectItem(item);
      case 'Escape':
        closeListBox(true);
        break;
      default:
        preventDefault = false;
    }

    if (preventDefault) {
      event.preventDefault();
    }
  });

  addListener(document, 'click', event => {
    closeListBox();
  });

})(document)
  