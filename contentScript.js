// checks if browser is running on MacOS
function isMacOS() {
	return navigator.platform.indexOf('Mac') > -1;
}

// Initialize
var copyByNewLine = true; // add newlines after selections if true
var copyBySpaces = false; // add spaces after selections if true
var copyByBullet = false; // add a bullet before selections if true
chrome.storage.sync.get({copyByNewLine: true, copyBySpaces: false,
    copyByBullet: false}, result => {
    var {copyByNewLine, copyBySpaces, copyByBullet} = result;
});

var lockSelect = false; // allow selection without holding ctrl if true
const isMac = isMacOS(); // used to replace ctrl with cmd when using a mac
var bgColor = "rgb(51, 144, 255)"; // windows blue
var textColor = "; color: white}"; // windows white

if (isMac) {
	bgColor = "rgb(172, 213, 255)"; // mac light blue
	textColor = "}"; // mac no text color
}

// https://stackoverflow.com/questions/43676331/creating-a-css-class-with-a-javascript-object-or-var/43676931
// creates css class that will be applied to each selection with rangy
var element = document.createElement("style");
const HIGHLIGHT_CLASS = "hiclass";
const HIGHLIGHT_ID = "HIGHLIGHT";
element.innerHTML = `.${HIGHLIGHT_CLASS} {background-color: ${bgColor}${textColor}`;
var header = document.getElementsByTagName("HEAD")[0];
header.appendChild(element);

rangy.init();
var highlighter = rangy.createHighlighter();
highlighter.addClassApplier(rangy.createClassApplier(HIGHLIGHT_CLASS, {
	elementTagName: "span",
	ignoreWhiteSpace: true,
	tagNames: ["span", "a"],
	elementProperties: {id: HIGHLIGHT_ID, draggable: "true"}
}));

// Sends array of selected text to the background page
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    sendResponse(extractSelectedText()
        .map(e => e.trim())
        .filter(Boolean)); // Remove all trailing whitespace and empty strings
});

// when a highlight element is dragged, set the drag text to the selection
document.addEventListener('dragstart', e => {
	if (e.target.id == HIGHLIGHT_ID) {
		dragData = highlighter.getHighlightForElement(e.target).getText();
		e.dataTransfer.setData('text/plain', dragData);
	}
	else if (e.target.parentNode.id == HIGHLIGHT_ID) { // get parent if normal selection is active
		dragData = highlighter.getHighlightForElement(e.target.parentNode).getText();
		e.dataTransfer.setData('text/plain', dragData);
	}
});

// Clear selected text
function clearSelection() {
    const selection = window.getSelection();
    if (selection) {
        selection.empty();
    }
}

// Return true if ctrl or cmd is pressed for Windows/Mac
function selectKeyDown(e) {
    return (!isMac && e.ctrlKey) || (isMac && e.metaKey);
}

// highlights selected text when mouseup and ctrl down
// ctrl not needed when selection lock is on
document.addEventListener("mouseup", e => {
	if (lockSelect || selectKeyDown(e)) {
		highlighter.highlightSelection(HIGHLIGHT_CLASS);
	}
});

// clears all selected text when left mousedown and ctrl up
// and adds options to context menu when a selection is clicked
// disabled when lock selection is on, clear by ctrl+shift+L instead
document.addEventListener("mousedown", e => {
    const LEFT_CLICK = 0;
    const RIGHT_CLICK = 2;
    const selectKey = selectKeyDown(e);
    if (e.button == RIGHT_CLICK) {
		if (e.target.id == HIGHLIGHT_ID) {
			chrome.runtime.sendMessage("addOptions");
		}
		else {
			chrome.runtime.sendMessage("removeOptions");
		}
	}
    if (lockSelect) {
        return;
    }
    if (selectKey && e.button == LEFT_CLICK && highlighter.highlights.length == 0
        && window.getSelection() != "") {
        highlighter.highlightSelection(HIGHLIGHT_CLASS);
    }
    else if (!selectKey && e.button == LEFT_CLICK && highlighter.highlights.length > 0
        && e.target.id != HIGHLIGHT_ID) {
        clearSelection();
        highlighter.removeAllHighlights();
    }
});

// Formats selection using copy settings and copies to clipboard
document.addEventListener('copy', e => {
	if (highlighter.highlights.length > 0) {
        const selectionArray = extractSelectedText();
        let clipboardText = "";
        if (copyByBullet) {
		    clipboardText = "• " + selectionArray.join("\n• ");
        }
        else if (copyByNewLine) {
		    clipboardText = selectionArray.join("\n");
        }
        else {
		    clipboardText = selectionArray.join(" ");
        }
		e.clipboardData.setData('text/plain', clipboardText);
		e.preventDefault(); // prevent default copy event
	}
});

// Extracts array of selected text from highlights
function extractSelectedText() {
    const selectionArray = [];
    for (const highlight of highlighter.highlights) {
        const highlightElements = highlight.getHighlightElements();
        let selection = highlightElements[0].innerText;
        let elementA, elementB; // Separate highlights that span multiple elements e.g. bullets
        for (let i = 0; i < highlightElements.length - 1; i++) {
            elementA = highlightElements[i];
            elementB = highlightElements[i + 1];
            if (isElementOnNextLine(elementA, elementB)) {
                selectionArray.push(selection);
                selection = elementB.innerText;
            }
            else {
                selection += elementB.innerText;
            }
        }
        selectionArray.push(selection);
    }
    return selectionArray;
}

// returns true if element B is below element A and false if beside
function isElementOnNextLine(elA, elB) {
    const rectA = elA.getBoundingClientRect();
    const rectB = elB.getBoundingClientRect();
	return (rectB.top > rectA.bottom) || (rectB.bottom < rectA.top);
}

// removes the most recent selection when ctrl + z is pressed
document.addEventListener('keydown', e => {
	var highlights = highlighter.highlights;
	if (highlights.length != 0 && selectKeyDown(e) && e.key == "z") {
		clearSelection();
		highlighter.removeHighlights([highlights[highlights.length-1]]);
	}
});

// toggles selection lock so that ctrl isn't needed to select
// selections can only be removed by toggling again
// 76 = L
document.addEventListener('keydown', e => {
	if (selectKeyDown(e) && e.shiftKey && e.keyCode == 76) {
		if (lockSelect) {
			clearSelection();
			highlighter.removeAllHighlights();
		}
		lockSelect = !lockSelect;
	}
});

// updates copy option
chrome.storage.onChanged.addListener((changes, areaName) => {
	for (var key in changes) {
		window[key] = changes[key].newValue;
	 }
});