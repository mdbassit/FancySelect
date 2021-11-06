/*!
 * Copyright (c) 2021 Momo Bassit.
 * Licensed under the MIT License (MIT)
 * https://github.com/mdbassit/fancySelect
 */

(function (window, document) {

  let searchString = '';
  let searchTimeout = null;
  let counter = 0;

  /**
   * Initialize the custom select box elements.
   */
  function init() {

    // Replace native select elements with custom select boxes
    document.querySelectorAll('select:not(.fsb-ignore)').forEach(select => {

      // Skip if the native select has already been processed
      if (select.nextElementSibling && select.nextElementSibling.classList.contains('fsb-select')) {
        return;
      }

      const options = select.children;
      const parentNode = select.parentNode;
      const customSelect = document.createElement('span');
      const label = document.createElement('span');
      const button = document.createElement('button');
      const list = document.createElement('span');
      const widthAdjuster = document.createElement('span');
      const index = counter++;

      // Label for accessibility
      label.id = `fsb_${index}_label`;
      label.className = 'fsb-label';
      label.textContent = getNativeSelectLabel(select, parentNode);

      // List box button
      button.id = `fsb_${index}_button`;
      button.className = 'fsb-button';
      button.textContent = '&nbsp;';
      button.setAttribute('aria-disabled', select.disabled);
      button.setAttribute('aria-haspopup', 'listbox');
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-labelledby', `fsb_${index}_label fsb_${index}_button`);

      // List box
      list.className = 'fsb-list';
      list.setAttribute('role', 'listbox');
      list.setAttribute('tabindex', '-1');
      list.setAttribute('aria-labelledby', `fsb_${index}_label`);

      // List items
      for (let i = 0, len = options.length; i < len; i++) {
        const option = options[i];
        const item = document.createElement('span');
        const itemLabel = getItemLabel(option);
        const selected = option.selected;

        item.className = 'fsb-option';
        item.innerHTML = itemLabel;
        item.setAttribute('role', 'option');
        item.setAttribute('tabindex', '-1');
        item.setAttribute('aria-selected', selected);
        list.appendChild(item);

        if (selected) {
         button.innerHTML = itemLabel;
        }
      }

      // Custom select box container
      customSelect.className = 'fsb-select';
      customSelect.appendChild(label);
      customSelect.appendChild(button);
      customSelect.appendChild(list);
      customSelect.appendChild(widthAdjuster);

      // Hide the native select
      select.style.display = 'none';

      // Insert the custom select box after the native select
      if (select.nextSibling) {
        parentNode.insertBefore(customSelect, select.nextSibling);
      } else {
        parentNode.appendChild(customSelect);
      }

      // Force the select box to take the width of the longest item by default
      if (list.firstElementChild) {
        const span = document.createElement('span');

        span.setAttribute('style', `width: ${list.firstElementChild.offsetWidth}px;`);
        widthAdjuster.className = 'fsb-resize'
        widthAdjuster.appendChild(span);
      }
    });
  }

  /**
   * Try to guess the native select element's label if any.
   * @param {object} select The native select.
   * @param {object} parent The parent node.
   * @return {string} The native select's label or an empty string.
   */ 
  function getNativeSelectLabel(select, parent) {
    const id = select.id;
    let labelElement;

    // If the select element is inside a label element
    if (parent.nodeName === 'LABEL') {
      labelElement = parent;

    // Or if the select element has an ID, and there is a label element
    // with an attribute "for" that points to that ID
    } else if (id !== undefined) {
      labelElement = document.querySelector(`label[for="${id}"]`);
    }

    // If a label element is found, return the first non empty child text node
    if (labelElement) {
      const textNodes = [].filter.call(labelElement.childNodes, n => n.nodeType === 3);
      const texts = textNodes.map(n => n.textContent.replace(/\s+/g, ' ').trim());
      const label = texts.filter(l => l !== '')[0];

      if (label) {
        return label;
      }
    }

    return '';
  }

  /**
   * Infer the list item's label from the native select option.
   * @param {object} option The native select option.
   * @return {string} The list item's label.
   */ 
  function getItemLabel(option) {
    const text = option.text;
    const icon = option.getAttribute('data-icon');
    let label = text !== '' ? text : '&nbsp;';

    if (icon !== null) {
      label = `<svg aria-hidden="true"><use href="${icon}"></use></svg> <span>${label}</span>`;
    }

    return label;
  }

  /**
   * Open a list box.
   * @param {object} button The button to which the list box is attached.
   */ 
  function openListBox(button) {
    const rect = button.getBoundingClientRect();
    const list = button.nextElementSibling;
    let selectedItem = list.querySelector('[aria-selected="true"]');

    if (!selectedItem) {
      selectedItem = list.firstElementChild;
    }

    // Open the list box and focus the selected item
    button.parentNode.className = 'fsb-select';
    button.setAttribute('aria-expanded', 'true');
    selectedItem.focus();

    // Position the list box on top of the button if there isn't enough space on the bottom
    if (rect.y + rect.height + list.offsetHeight > document.documentElement.clientHeight) {
      button.parentNode.className = 'fsb-select fsb-top';
    }
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
    const itemIndex = [].indexOf.call(list.children, item);
    const selectedItem = list.querySelector('[aria-selected="true"]');
    const originalSelect = list.parentNode.previousElementSibling;


    if (selectedItem) {
      selectedItem.setAttribute('aria-selected', 'false');
    }

    item.setAttribute('aria-selected', 'true');
    button.innerHTML = item.innerHTML;

    // Update the original select
    originalSelect.selectedIndex = itemIndex;
    originalSelect.dispatchEvent(new Event('input', { bubbles: true }));
    originalSelect.dispatchEvent(new Event('change', { bubbles: true }));
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
    // we need to cycle through the items starting with that character
    } else if (isRepeatedCharacter(search)) {
      // Get all the items matching the character
      const matches = filterItems(items, search[0]);

      // The match we want depends on the length of the repeated string
      // e.g: "aa" means the second item starting with "a"
      const matchIndex = (search.length - 1) % matches.length;

      // Return the match
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
   * Call a function only when the DOM is ready.
   * @param {function} fn The function to call.
   */ 
  function DOMReady(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  // On click on the list box button
  addListener(document, 'click', '.fsb-button', event => {
    closeListBox();
    openListBox(event.target);
    event.preventDefault();
    event.stopImmediatePropagation();
  });

  // On key press on the list box button
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

  // When the mouse moves on an item, focus it.
  // Use mousemove instead of mouseover to prevent accidental focus on the wrong item,
  // namely when the list box is opened with a keyboard shortcut, and the mouse arrow
  // just happens to be on an item.
  addListener(document.documentElement, 'mousemove', '.fsb-option', event => {
    event.target.focus();
  });

  // On click on an item
  addListener(document, 'click', '.fsb-option', event => {
    selectItem(event.target);
    closeListBox(true);
  });

  // On key press on an item
  addListener(document, 'keydown', '.fsb-option', event => {
    const item = event.target;
    const list = item.parentNode;
    let preventDefault = true;

    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        if (item.previousElementSibling) {
          item.previousElementSibling.focus();
        }
        break;
      case 'ArrowDown':
      case 'ArrowRight':
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
        // Disable Page Up and Page Down keys
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

  // On click outside the custom select box, close it
  addListener(document, 'click', event => {
    closeListBox();
  });

  // Expose the constructor to the global scope
  window.FancySelect = (() => {
    function FancySelect() {
      DOMReady(init);
    }

    // Alternative method to initialize the custom select boxes
    FancySelect.init = FancySelect;

    return FancySelect;
  })();

  // Initialize the custom select boxes when the DOM is ready
  DOMReady(init);

})(window, document);
  