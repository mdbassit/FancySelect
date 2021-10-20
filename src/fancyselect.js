(function (window, document) {

  let searchString = '';
  let searchTimeout = null;

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
    const activeListBox = document.querySelector('.fsb-button[aria-expanded="true"]');
    
    if (activeListBox) {
      activeListBox.setAttribute('aria-expanded', 'false');

      if (focusButton) {
        activeListBox.focus();
      }

      // Clear the search string in case someone is a ninja!!!
      searchString = '';
      searchTimeout = null;
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

  /**
   * Check if the the user is typing printable characters.
   * @param {object} event A keydown event.
   * @return {boolean} True if the key pressed is a printable character.
   */ 
  function isTyping(event) {
    const { key, altKey, ctrlKey, metaKey } = event;

    if (key.length === 1 && !altKey && !ctrlKey && !metaKey) {
      if (searchTimeout) {
        window.clearTimeout(searchTimeout);
      }

      searchTimeout = window.setTimeout(() => {
        searchString = '';
      }, 500);

      searchString += key;
      return true;
    }

    return false;
  }

  /**
   * Check if a string is the same character repeated multiple times.
   * @param {string} str The string to check.
   * @return {boolean} True if the string the same character repeated multiple times (e.g "aaa").
   */ 
  function isRepeatedCharacter(str) {
    const characters = str.split('');
    return characters.every(char => char === characters[0]);
  }

  /**
   * Filter an array of string.
   * @param {array} items.
   * @param {string} filter The filter string.
   * @return {array} The array items that matches the filter.
   */ 
  function filterItems(items, filter) {
    return items.filter(item => item.indexOf(filter.toLowerCase()) === 0);
  }

  /**
   * Get the next item that matches a string.
   * @param {object} list The active list box.
   * @param {string} search The search string.
   * @return {object} The item that matches the string.
   */ 
  function getMatchingItem(list, search) {
    const items = [].map.call(list.children, item => item.textContent.trim().toLowerCase());
    const firstMatch = filterItems(items, search)[0];

    // If an exact match is found, return it
    if (firstMatch) {
      return list.children[items.indexOf(firstMatch)];

    // If the search string is the same character repeated multiple times
    } else if (isRepeatedCharacter(search)) {
      const matches = filterItems(items, search[0]);
      const matchIndex = (search.length - 1) % matches.length;
      const match = matches[matchIndex];
      return list.children[items.indexOf(match)];
    }

    return null;
  }

  /**
   * Focus the next item that matches a string.
   * @param {object} list The active list box.
   */ 
  function focusMatchingItem(list) {
    const item = getMatchingItem(list, searchString);

    if (item) {
      item.focus();
    }    
  }

  document.querySelectorAll('.fsb-button').forEach(button => {
    const list = button.nextElementSibling;
    const selectedItem = list.querySelector('[aria-selected="true"]');
    const widthAdjuster = list.nextElementSibling;

    // Used to force the select box to take the width of the longest item by default
    widthAdjuster.innerHTML = `<span style="width: ${list.firstElementChild.offsetWidth}px;"></span>`;

    if (selectedItem) {
      button.innerHTML = selectedItem.innerHTML;
    }
  });  

  addListener(document, 'click', '.fsb-button', event => {
    openListBox(event.target);
    event.stopImmediatePropagation();
  });

  addListener(document, 'keydown', '.fsb-button', event => {
    const button = event.target;
    const list = button.nextElementSibling;
    let preventDefault = true;

    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowDown':
      case 'Enter':
      case ' ':
        openListBox(button);
        break;
      default:
        if (isTyping(event)) {
          openListBox(button);
          focusMatchingItem(list);
        } else {
          preventDefault = false;
        }
    }

    if (preventDefault) {
      event.preventDefault();
    }
  });

  addListener(document.documentElement, 'mousemove', '.fsb-option', event => {
    event.target.focus();
  });

  addListener(document, 'click', '.fsb-option', event => {
    selectItem(event.target);
    closeListBox(true);
  });

  addListener(document, 'keydown', '.fsb-option', event => {
    const item = event.target;
    const list = item.parentNode;
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
        list.firstElementChild.focus();
        break;
      case 'End':
        list.lastElementChild.focus();
        break;
      case 'PageUp':
      case 'PageDown':
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
        if (isTyping(event)) {
          focusMatchingItem(list);
        } else {
          preventDefault = false;
        }
    }

    if (preventDefault) {
      event.preventDefault();
    }
  });

  addListener(document, 'click', event => {
    closeListBox();
  });

})(window, document)
  