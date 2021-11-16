**Work in progress. Please do not clone yet!**

# fancySelect

<img src="https://raw.githubusercontent.com/mdbassit/fancySelect/gh-pages/images/examples.png" alt="fancySelect examples" width="544"/>

A tiny drop-in replacement for native HTML single select elements written in vanilla ES6.

[**View demo**](https://mdbassit.github.io/fancySelect/demo.html)

## Features

* Zero dependencies
* Very easy to use
* Customizable
* Icon support
* Fully accessible
* Works on all modern browsers (no IE support)
* No multi-select support (not accessible)

## Getting Started

### Basic usage

Download the [latest version](https://github.com/mdbassit/fancySelect/releases/latest), and add the script and style to your page:
```html
<link rel="stylesheet" href="fancyselect.min.css"/>
<script src="fancyselect.min.js"></script>
```

Or include from a CDN:
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/mdbassit/fancySelect@latest/dist/fancyselect.min.css"/>
<script src="https://cdn.jsdelivr.net/gh/mdbassit/fancySelect@latest/dist/fancyselect.min.js"></script>
```

The native select elements will be replaced automatically.

### Excluding specific elements

### Updating options

If there is a need to programmatically update a native select element's options, calling fancySelect.update() with the native select element as an argument will update the custom select box.

### Disabling and enabling

The disabled state is detected automatically. If a native select element's disabled state was updated after fancySelect initialization, calling fancySelect.update() as explained earlier will update it.

### Change and input events

### Customization

### Icons

### About multi-select

## Building from source

Install the development dependencies:
```bash
npm install
```

Run the build script:
```bash
npm run build
```
The built version will be in the `dist` directory in both minified and full copies.

## Credit

While this implementation may be different, most of the specifications were inspired by:

* [Collapsible Dropdown Listbox Example &#124; WAI-ARIA Authoring Practices 1.1](https://www.w3.org/TR/wai-aria-practices-1.1/examples/listbox/listbox-collapsible.html)
* [&lt;select> your poison](https://www.24a11y.com/2019/select-your-poison/)
* [&lt;select> your poison part 2: test all the things](https://www.24a11y.com/2019/select-your-poison-part-2/)

## License

Copyright (c) 2021 Momo Bassit.  
**fancySelect** is licensed under the [MIT license](https://github.com/mdbassit/fancySelect/blob/main/LICENSE).
