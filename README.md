# MultiLine Text Selection
Allows the user to make multiple text selections in noncontiguous areas of a Chrome webpage. Text can be copied to clipboard through ctrl+c or the right-click copy option.
You can also search the text on Google, YouTube, and Wikipedia through the right click selection menu.

## Getting Started

### Installing
Enable Developer Mode at chrome://extensions. Select 'Load unpacked' and choose the directory of this project. 

You can also install the extension directly from the Chrome Web Store at: https://chrome.google.com/webstore/detail/multiline-text-selection/ajbomhojbckleofgngogoecoaefclnol

### Usage
Make additional text selections while holding down ctrl. Clear all selections by clicking without holding ctrl. Undo the most recent selection with ctrl+z. On Macs, use cmd instead of ctrl. 

Lock selections with ctrl+shift+L. When selections are locked, they will not disappear when left-clicking. This prevents accidentally clicking out and clearing your selections. While locked, ctrl/cmd is not needed to make selections. Leave locked mode and clear all highlighted text by pressing ctrl+shift+L again.

Right click any selection for search options.
Select MultiSearch to open a search tab for each selection.
Select CombinedSearch to open a single search tab for each selection separated by a space.

Select the extension icon in the Chrome toolbar (top-right of the browser) to toggle copy options.
If 'Copy With Newline' is selected, each selection will be separated by a newline when copying.
If 'Copy With Spaces' is selected, each selection will be separated by spaces when copying.
If 'Copy With Bullets' is selected, each selection will be copied as a separate bullet.

### Notes
- This extension is automatically disabled on the Chrome store page. Try it out on other sites.
- Refresh any current tabs when first installing to activate the extension on those pages. This is not necessary for new tabs.
- When selecting separate words throughout a web page, you can double-click while holding ctrl instead of dragging to select.
- Selections are sent to the clipboard and searched in the order they are selected.
- When making overlapping selections, ctrl+z will remove the combined selection.
- A single selection containing text on separate lines will be treated as multiple selections when MultiSearching. This keeps you from having to individually select multiple lines that are grouped together.
- This extension as of 6/20/19 used only my own system of displaying multiple selections. The current version uses Rangy, a more robust selection system, to support selections in areas where they previously failed. (https://github.com/timdown/rangy/)


### Issues
- The current version now uses Rangy, a selection library based on Range objects, to make more areas accessible for selection. This sometimes leads to issues with selections on dynamic text areas. 
- Selections crossing multiple elements can rarely include collapsed text.
- Some types of selections cannot be copied or searched. Undo such a selection or refresh to continue.
- Selections made with ctrl will be in plain text.
- Selections are rarely not cleared after clicking. Re-select the text and clear, or refresh the page if this happens.

## License
This project is licensed under GNU GPLv3.
