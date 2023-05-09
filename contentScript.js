// add option when script is loaded so it will appear in context menu on first use
chrome.runtime.sendMessage("addOptions"); // TODO: revisit this + message name

// checks if browser is running on MacOS
function isMacOS() {
	return navigator.platform.indexOf('Mac') > -1;
}

// used to replace ctrl with cmd when using a mac
var isMac = isMacOS();
var bgColor = "rgb(51, 144, 255)"; // windows blue
var textColor = "; color: white}"; // windows white

if (isMac) {
	bgColor = "rgb(172, 213, 255)"; // mac light blue
	textColor = "}"; // mac no text color
}

// var serializedSelections;

// https://stackoverflow.com/questions/43676331/creating-a-css-class-with-a-javascript-object-or-var/43676931
// creates css class that will be applied to each selection with rangy
var element = document.createElement("style");
element.innerHTML = ".hiclass {background-color:" + bgColor + textColor;
var header = document.getElementsByTagName("HEAD")[0];
header.appendChild(element);

rangy.init();
var highlighter = rangy.createHighlighter();

highlighter.addClassApplier(rangy.createClassApplier("hiclass", {
	elementTagName: "span",
	ignoreWhiteSpace: true,
	tagNames: ["span", "a"],
	elementProperties: {id: "HIGHLIGHT", draggable: "true"}
}));

// adds newlines after selections if true
var copyByNewLine = true;
// adds spaces after selections if true
var copyBySpaces = false;
// adds a bullet before selections if true
var copyByBullet = false;

chrome.storage.sync.get({copyByNewLine: true, copyBySpaces: false,
 copyByBullet: false}, result => {
 	copyByNewLine = result.copyByNewLine;
 	copyBySpaces = result.copyBySpaces;
 	copyByBullet = result.copyByBullet;
});

// allows selection without holding ctrl
var lockSelect = false;

// Sends array of selected text to the background page
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    sendResponse(extractSelectedText()
        .map(e => e.trim())
        .filter(Boolean)); // Remove all trailing whitespace
});

// when a highlight element is dragged, set the drag text to the selection
document.addEventListener('dragstart', function(e) {
	if (e.target.id == "HIGHLIGHT") {
		dragData = highlighter.getHighlightForElement(e.target).getText()
		e.dataTransfer.setData('text/plain', dragData)
	}
	else if (e.target.parentNode.id == "HIGHLIGHT") {
		dragData = highlighter.getHighlightForElement(e.target.parentNode).getText()
		e.dataTransfer.setData('text/plain', dragData)
	}
});

// highlights selected text when mouseup and ctrl down
// ctrl not needed when selection lock is on
document.addEventListener("mouseup", function(e) {
	// if (lockSelect || ((!isMac && !e.ctrlKey) || (isMac && !e.metaKey)) && highlighter.highlights.length == 0 ) {
	// 	// serializedSelections = rangy.serializeSelection();
	// 	// document.getSelection().removeAllRanges();
	// }
	if (lockSelect || ((!isMac && e.ctrlKey) || (isMac && e.metaKey)) ) {
		highlighter.highlightSelection("hiclass");
	}
});

// clears all selected text when left mousedown and ctrl up
// and adds options to context menu when a selection is clicked
// disabled when lock selection is on, clear by ctrl+shift+L instead
document.addEventListener("mousedown", function(e) {
	if (lockSelect == false) {
		if (((!isMac && e.ctrlKey) || (isMac && e.metaKey)) && (e.button == 0) && highlighter.highlights.length == 0) {
			// try {
			// 	rangy.deserializeSelection(serializedSelections);
			// }
			// catch(err) {
			// 	serializedSelections = ""
			// }
			if (window.getSelection() != "") {
				highlighter.highlightSelection("hiclass");
			}
		}
		else if (((!isMac && !e.ctrlKey) || (isMac && !e.metaKey)) && (e.button == 0) && (highlighter.highlights.length > 0) && (e.target.id != "HIGHLIGHT")) {
			// prevents outer element from being highlighted when there is a single highlight
			var currSelection = window.getSelection();
			if (currSelection != "") {
				currSelection.empty();
			}
			highlighter.removeAllHighlights();
		}
	}

	if (e.button == 2) {
		if (e.target.id == "HIGHLIGHT") {
			chrome.runtime.sendMessage("addOptions");
		}
		else {
			chrome.runtime.sendMessage("removeOptions");
		}
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
document.addEventListener('keydown', function(e) {
	var highlights = highlighter.highlights;
	if (highlights.length != 0 && ((!isMac && e.ctrlKey)
		|| (isMac && e.metaKey)) && e.key == "z") {
		var currSelection = window.getSelection();
		if (currSelection) {
			currSelection.empty();
		}
		highlighter.removeHighlights([highlights[highlights.length-1]]);
	}
});

// toggles selection lock so that ctrl isn't needed to select
// selections can only be removed by toggling again
// 76 = L
document.addEventListener('keydown', function(e) {
	if (e.shiftKey && ((!isMac && e.ctrlKey) || (isMac && e.metaKey))
		&& e.keyCode == 76) {
		if (lockSelect) {
			var currSelection = window.getSelection();
			if (currSelection != "") {
				currSelection.empty();
			}
			highlighter.removeAllHighlights();
		}
		lockSelect = !lockSelect;
	}
});

// updates copy option
chrome.storage.onChanged.addListener(function(changes, areaName) {
	for (var key in changes) {
		window[key] = changes[key].newValue;
	 }
});