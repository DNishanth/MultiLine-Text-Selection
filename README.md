# Noncontiguous Text Selection
Allows the user to make concurrent noncontiguous text selections in Chrome. Text can be copied to clipboard through ctrl-c or the right-click copy option.
You can also Google search the text through the right click selection menu.

## Getting Started

### Installing
Enable Developer Mode at chrome://extensions. Select 'Load unpacked' and choose the directory of this project. 

You can also install the extension directly from the Chrome Web Store at: https://chrome.google.com/webstore/detail/noncontiguous-text-select/ajbomhojbckleofgngogoecoaefclnol

### Usage
Make each selection while holding down ctrl. Clear all selections by clicking without holding ctrl. Undo with ctrl-z. On Macs, use cmd instead of ctrl. Lock selections with shift-L. This prevents accidentally clearing selections by clicking. While locked, ctrl/cmd is not needed to make selections. All highlighted text will remain until cleared by pressing shift-L again.

Right click any selection for search options.
Select MultiSearch to open a search tab for each selection.
Select CombinedSearch to open a single search tab for each selection separated by a space.

Select the extension icon in the Chrome toolbar (top-right of the browser) to toggle copy options.
If 'Copy With Newline' is selected, each selection will be separated by a newline when copying.
If 'Copy With Spaces' is selected, each selection will be separated by spaces when copying.
If 'Copy With Bullets' is selected, each selection will be copied as a separate bullet.

### Notes
- When making overlapping selections, ctrl-z will remove the combined selection.
- Selections are sent to the clipboard and searched in the order they are selected
- Text containing new lines will be treated as separate selections when MultiSearching.
- This extension is intended to be used on text. Selections on non-text areas such as hyperlinks will fail.

### Issues
- Selections made with ctrl will be in plain text.
- Selections which only partially contain formatted text will fail.
- Selecting text will rarely remove spaces between words.
- Selections are rarely not cleared after clicking. Refresh the page if this happens.

## License
This project is licensed under GNU GPLv3.
