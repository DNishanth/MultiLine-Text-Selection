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
	elementProperties: {id: "HIGHLIGHT"}
}));

// adds newlines after selections if true
var copyByNewLine = true;
// adds spaces after selections if true
var copyBySpaces = false;
// adds a bullet before selections if true
var copyByBullet = false;

chrome.storage.sync.get({copyByNewLine: true, copyBySpaces: false,
 copyByBullet: false}, function(result) {
 	copyByNewLine = result.copyByNewLine;
 	copyBySpaces = result.copyBySpaces;
 	copyByBullet = result.copyByBullet;
});

// allows selection without holding ctrl
var lockSelect = false;

// sends array of selected text to the background page
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		var selectedText = new Array();
		// checks if selections are made up of elements that should be separate search items
		var elementA, elementB;
		var text = "";
		for (var i = 0; i < highlighter.highlights.length; i++) {
			var highlightEls = highlighter.highlights[i].getHighlightElements();
			text += highlightEls[0].innerText;
			if (highlightEls.length > 1) {
				for (var x = 0; x < highlightEls.length - 1; x++) {
					elementA = highlightEls[x].getBoundingClientRect();
					elementB = highlightEls[x + 1].getBoundingClientRect();
					if (isElementOnNextLine(elementA, elementB)) {
						selectedText.push(text);
						text = "";
					}
				text += highlightEls[x + 1].innerText;
			}
		}
		selectedText.push(text);
		text = "";
	}
	sendResponse({array: selectedText});
});

// highlights selected text when mouseup and ctrl down
// ctrl not needed when selection lock is on
document.addEventListener("mouseup", function(e) {
	if (lockSelect || ((!isMac && e.ctrlKey) || (isMac && e.metaKey)) ) {
		highlighter.highlightSelection("hiclass");
	}
});

// clears all selected text when left mousedown and ctrl up
// and adds options to context menu when a selection is clicked
// disabled when lock selection is on, clear by ctrl+shift+L instead
document.addEventListener("mousedown", function(e) {
	if (lockSelect == false && (((!isMac && !e.ctrlKey) 
		|| (isMac && !e.metaKey)) && (e.button == 0))) {
		highlighter.removeAllHighlights();
	}

	if (e.button == 2) {
		if (e.target.id == "HIGHLIGHT") {
			chrome.runtime.sendMessage({message: "addOptions"});
		}
		else {
			chrome.runtime.sendMessage({message: "removeOptions"});
		}
	}
});

// overrides copy event by sending selected text to
// the clipboard
document.addEventListener('copy', function(e) {
	if (highlighter.highlights.length != 0) {
		e.clipboardData.setData('text/plain', extractSelectionText());
		e.preventDefault(); // prevents default copy event
	}
});

// combines and formats the current selection based on clipboard copy settings
function extractSelectionText() {
	var elementA, elementB;
	var text = "";
	for (var i = 0; i < highlighter.highlights.length; i++) {
		var highlightEls = highlighter.highlights[i].getHighlightElements();
		if (copyByBullet) {
			text += "• ";
		}
		text += highlightEls[0].innerText;
		// checks if the next element should be placed below or beside
		// the current element
		if (highlightEls.length > 1) {
			for (var x = 0; x < highlightEls.length - 1; x++) {
				elementA = highlightEls[x].getBoundingClientRect();
				elementB = highlightEls[x + 1].getBoundingClientRect();
				if (isElementOnNextLine(elementA, elementB)) {
					text += "\n";
					if (copyByBullet) {
						text += "• ";
					}
				}
				text += highlightEls[x + 1].innerText;
			}
		}
		// adds separator between each selection except the last
		if (i != highlighter.highlights.length - 1) {
			if (copyByNewLine || copyByBullet) {
				text += "\n";
			}
			else {
				text += " ";
			}
		}
	}
	return text;
}

// returns true if element B is below element A and false if beside
function isElementOnNextLine(elA, elB) {
	return (elB.top > elA.bottom) || (elB.bottom < elA.top);
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