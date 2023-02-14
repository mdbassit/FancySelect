 /*!
 * Copyright (c) 2021 Momo Bassit.
 * Licensed under the MIT License (MIT)
 * https://github.com/mdbassit/fancySelect
 */

(function (window, document, autoInitialize) {

  var currentElement = null;
  var searchString = '';
  var searchTimeout = null;
  var counter = 0;

  /**
   * Initialize the custom select box elements.
   * @param {string} [selector] An optional selector representing native select elements.
   */
  function init(selector) {
    selector = selector || 'select:not(.fsb-ignore)';

    // Replace all eligible native select elements with custom select boxes
    document.querySelectorAll(selector).forEach(replaceNativeSelect);
  }

  /**
   * Replace a native select element with a custom select box.
   * @param {object} select The native select.
   * @param {function} [renderer] An optional custom item label renderer.
   */
  function replaceNativeSelect(select, renderer) {
    // Skip if the native select has already been processed
    if (select.nextElementSibling && select.nextElementSibling.classList.contains('fsb-select')) {
      return;
    }

    var options = select.children;
    var parentNode = select.parentNode;
    var customSelect = document.createElement('span');
    var label = document.createElement('span');
    var button = document.createElement('button');
    var list = document.createElement('span');
    var widthAdjuster = document.createElement('span');
    var index = counter++;

    // Add a custom CSS class to the native select element
    select.classList.add('fsb-original-select');

    // Label for accessibility
    label.id = "fsb_" + index + "_label";
    label.className = 'fsb-label';
    label.textContent = getNativeSelectLabel(select, parentNode);

    // List box button
    button.id = "fsb_" + index + "_button";
    button.className = 'fsb-button';
    button.textContent = '&nbsp;';
    button.setAttribute('type', 'button');
    button.setAttribute('aria-disabled', select.disabled);
    button.setAttribute('aria-haspopup', 'listbox');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-labelledby', "fsb_" + index + "_label fsb_" + index + "_button");

    // List box
    list.className = 'fsb-list';
    list.setAttribute('role', 'listbox');
    list.setAttribute('tabindex', '-1');
    list.setAttribute('aria-labelledby', "fsb_" + index + "_label");

    // List items
    for (var i = 0, len = options.length; i < len; i++) {
      var _getItemFromOption = getItemFromOption(options[i], renderer),item = _getItemFromOption.item,selected = _getItemFromOption.selected,itemLabel = _getItemFromOption.itemLabel;

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
      var span = document.createElement('span');

      span.setAttribute('style', "width: " + list.firstElementChild.offsetWidth + "px;");
      widthAdjuster.className = 'fsb-resize';
      widthAdjuster.appendChild(span);
    }
  }

  /**
   * Update the custom select box attached to a native select.
   * @param {object} select The native select.
   * @param {function} [renderer] An optional custom item label renderer.
   */
  function updateFromNativeSelect(select, renderer) {
    var options = select.children;
    var parentNode = select.parentNode;
    var customSelect = select.nextElementSibling;

    // Abort if this native select hasn't been initialized
    if (!customSelect || !customSelect.classList.contains('fsb-select')) {
      return;
    }

    var label = customSelect.firstElementChild;
    var button = label.nextElementSibling;
    var list = button.nextElementSibling;
    var widthAdjuster = list.nextElementSibling;
    var listContent = document.createDocumentFragment();

    // Update the accessibility label 
    label.textContent = getNativeSelectLabel(select, parentNode);

    // Update the button status
    button.setAttribute('aria-disabled', select.disabled);

    // Generate the list items
    for (var i = 0, len = options.length; i < len; i++) {
      var _getItemFromOption2 = getItemFromOption(options[i], renderer),item = _getItemFromOption2.item,selected = _getItemFromOption2.selected,itemLabel = _getItemFromOption2.itemLabel;

      listContent.appendChild(item);

      if (selected) {
        button.innerHTML = itemLabel;
      }
    }

    // Clear the list box
    while (list.firstChild) {
      list.removeChild(list.firstChild);
    }

    // Update the list items
    list.appendChild(listContent);

    // Force the select box to take the width of the longest item by default
    if (list.firstElementChild) {
      widthAdjuster.firstElementChild.setAttribute('style', "width: " + list.firstElementChild.offsetWidth + "px;");
    }
  }

  /**
   * Try to guess the native select element's label if any.
   * @param {object} select The native select.
   * @param {object} parent The parent node.
   * @return {string} The native select's label or an empty string.
   */
  function getNativeSelectLabel(select, parent) {
    var id = select.id;
    var labelElement;

    // If the select element is inside a label element
    if (parent.nodeName === 'LABEL') {
      labelElement = parent;

      // Or if the select element has an ID, and there is a label element
      // with an attribute "for" that points to that ID
    } else if (id !== undefined) {
      labelElement = document.querySelector("label[for=\"" + id + "\"]");
    }

    // If a label element is found, return the first non empty child text node
    if (labelElement) {
      var textNodes = [].filter.call(labelElement.childNodes, function (n) {return n.nodeType === 3;});
      var texts = textNodes.map(function (n) {return n.textContent.replace(/\s+/g, ' ').trim();});
      var label = texts.filter(function (l) {return l !== '';})[0];

      if (label) {
        // Open the list box on click on the label element
        labelElement.onclick = function (event) {
          select.nextElementSibling.querySelector('button').click();
          event.preventDefault();
          event.stopImmediatePropagation();
        };

        return label;
      }
    }

    return '';
  }

  /**
   * Generate a listbox item from a native select option.
   * @param {object} option The native select option.
   * @param {function} [renderer] An optional custom item label renderer.
   * @return {object} The listbox item, its selected state and its label.
   */
  function getItemFromOption(option, renderer) {
    var item = document.createElement('span');
    var selected = option.selected;
    var itemLabel = getItemLabel(option, renderer);

    item.className = 'fsb-option';
    item.innerHTML = itemLabel;
    item.setAttribute('role', 'option');
    item.setAttribute('tabindex', '-1');
    item.setAttribute('aria-selected', selected);

    return { item: item, selected: selected, itemLabel: itemLabel };
  }

  /**
   * Render a listbox item's label.
   * @param {object} option The native select option.
   * @param {function} [renderer] An optional custom item label renderer.
   * @return {string} The listbox item's label.
   */
  function getItemLabel(option, renderer) {
    if (typeof renderer === 'function') {
      return renderer(option);
    }

    var text = option.text;
    var icon = option.getAttribute('data-icon');
    var label = text !== '' ? text : '&nbsp;';

    // Wrap label in a span to better handle long text
    label = "<span>" + label + "</span>";

    if (icon !== null) {
      label = "<svg aria-hidden=\"true\"><use href=\"" + icon + "\"></use></svg> " + label;
    }

    return label;
  }

  /**
   * Open a list box.
   * @param {object} button The button to which the list box is attached.
   */
  function openListBox(button) {
    var rect = button.getBoundingClientRect();
    var list = button.nextElementSibling;
    var selectedItem = list.querySelector('[aria-selected="true"]');

    if (!selectedItem) {
      selectedItem = list.firstElementChild;
    }

    // Open the list box and focus the selected item
    button.parentNode.className = 'fsb-select';
    button.setAttribute('aria-expanded', 'true');
    selectedItem.focus();
    currentElement = button;

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
    var activeListBox = document.querySelector('.fsb-button[aria-expanded="true"]');

    if (activeListBox) {
      activeListBox.setAttribute('aria-expanded', 'false');

      if (focusButton) {
        activeListBox.focus();
      }

      // Clear the search string in case someone is a ninja!!!
      searchString = '';
      searchTimeout = null;
    }

    currentElement = null;
  }

  /**
   * Set the selected item.
   * @param {object} item The item to be selected.
   */
  function selectItem(item) {
    var list = item.parentNode;
    var button = list.previousElementSibling;
    var itemIndex = [].indexOf.call(list.children, item);
    var selectedItem = list.querySelector('[aria-selected="true"]');
    var originalSelect = list.parentNode.previousElementSibling;


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
    var items = [].map.call(list.children, function (item) {return item.textContent.trim().toLowerCase();});
    var firstMatch = filterItems(items, search)[0];

    // If an exact match is found, return it
    if (firstMatch) {
      return list.children[items.indexOf(firstMatch)];

      // If the search string is the same character repeated multiple times
      // we need to cycle through the items starting with that character
    } else if (isRepeatedCharacter(search)) {
      // Get all the items matching the character
      var matches = filterItems(items, search[0]);

      // The match we want depends on the length of the repeated string
      // e.g: "aa" means the second item starting with "a"
      var matchIndex = (search.length - 1) % matches.length;

      // Return the match
      var match = matches[matchIndex];
      return list.children[items.indexOf(match)];
    }

    return null;
  }

  /**
   * Focus the next item that matches a string.
   * @param {object} list The active list box.
   */
  function focusMatchingItem(list) {
    var item = getMatchingItem(list, searchString);

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
    return items.filter(function (item) {return item.indexOf(filter.toLowerCase()) === 0;});
  }

  /**
   * Check if the the user is typing printable characters.
   * @param {object} event A keydown event.
   * @return {boolean} True if the key pressed is a printable character.
   */
  function isTyping(event) {
    var key = event.key,altKey = event.altKey,ctrlKey = event.ctrlKey,metaKey = event.metaKey;

    if (key.length === 1 && !altKey && !ctrlKey && !metaKey) {
      if (searchTimeout) {
        window.clearTimeout(searchTimeout);
      }

      searchTimeout = window.setTimeout(function () {
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
    var characters = str.split('');
    return characters.every(function (char) {return char === characters[0];});
  }

  /**
   * Shortcut for addEventListener with delegation support.
   * @param {object} context The context to which the listener is attached.
   * @param {string} type Event type.
   * @param {(string|function)} selector Event target if delegation is used, event handler if not.
   * @param {function} [fn] Event handler if delegation is used.
   */
  function addListener(context, type, selector, fn) {
    var matches = Element.prototype.matches || Element.prototype.msMatchesSelector;

    // Delegate event to the target of the selector
    if (typeof selector === 'string') {
      context.addEventListener(type, function (event) {
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
   * @param {array} [args] Arguments to pass to the function.
   */
  function DOMReady(fn, args) {
    args = args !== undefined ? args : [];

    if (document.readyState !== 'loading') {
      fn.apply(void 0, args);
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        fn.apply(void 0, args);
      });
    }
  }

  // On click on the list box button
  addListener(document, 'click', '.fsb-button', function (event) {
    var isClickToClose = currentElement === event.target;

    closeListBox();

    if (!isClickToClose) {
      openListBox(event.target);
    }

    event.preventDefault();
    event.stopImmediatePropagation();
  });

  // On key press on the list box button
  addListener(document, 'keydown', '.fsb-button', function (event) {
    var button = event.target;
    var list = button.nextElementSibling;
    var preventDefault = true;

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
        }}


    if (preventDefault) {
      event.preventDefault();
    }
  });

  // When the mouse moves on an item, focus it.
  // Use mousemove instead of mouseover to prevent accidental focus on the wrong item,
  // namely when the list box is opened with a keyboard shortcut, and the mouse arrow
  // just happens to be on an item.
  addListener(document.documentElement, 'mousemove', '.fsb-option', function (event) {
    event.target.focus();
  });

  // On click on an item
  addListener(document, 'click', '.fsb-option', function (event) {
    selectItem(event.target);
    closeListBox(true);
  });

  // On key press on an item
  addListener(document, 'keydown', '.fsb-option', function (event) {
    var item = event.target;
    var list = item.parentNode;
    var preventDefault = true;

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
        }}


    if (preventDefault) {
      event.preventDefault();
    }
  });

  // On click outside the custom select box, close it
  addListener(document, 'click', function (event) {
    closeListBox();
  });

  // Expose the constructor to the global scope
  window.FancySelect = function () {
    function FancySelect() {
      DOMReady(init);
    }

    // Available methodes
    FancySelect.init = init;
    FancySelect.replace = replaceNativeSelect;
    FancySelect.update = updateFromNativeSelect;

    return FancySelect;
  }();

  // Initialize the custom select boxes when the DOM is ready
  if (autoInitialize) {
    DOMReady(init);
  }

})(window, document, typeof FancySelectAutoInitialize !== 'undefined' ? FancySelectAutoInitialize : true);