// stores all currently highlighted nodes
var highlights = new Array();

// adds newlines after selections if true
var copyByNewLine = true;
// adds spaces after selections if true
var copyBySpaces = false;
// adds a bullet before selections if true
var copyByBullet = false;

// checks if browser is running on MacOS
function isMacOS() {
	return navigator.platform.indexOf('Mac') > -1;
}

// used to replace ctrl with cmd when using a mac 
var isMac = isMacOS();

// allows selection without holding ctrl
var lockSelect = false;

// sends array of selected text to the background page
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		var selectedText = new Array();
		for (var i = 0; i < highlights.length; i++) {
			if (highlights[i] != null) {
				selectedText.push(highlights[i].textContent);
			}
		}
		sendResponse({array: selectedText});
	});

// highlights selected text when mouseup and ctrl down
// ctrl not needed when selection lock is on
document.addEventListener("mouseup", function(e) {
	if ((e.target.nodeName != "HIGHLIGHT") && (lockSelect || ((!isMac && e.ctrlKey) || (isMac && e.metaKey)) )) {
		highlightText();
	}
});

// clears all selected text when left mousedown and ctrl up
// and adds options to context menu when a selection is clicked
// disabled when lock selection is on, clear by shift-L instead
document.addEventListener("mousedown", function(e) {
	if (lockSelect == false && (((!isMac && !e.ctrlKey) || (isMac && !e.metaKey)) && (e.button == 0))) {
		removeHighlights();
	}

	if (e.button == 2) {
		if (e.target.nodeName == "HIGHLIGHT") {
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
	if (highlights.length != 0) {
		e.clipboardData.setData('text/plain', getSelectedText());
		e.preventDefault(); // prevents default copy event
	}
});

// removes the most recent selection when ctrl + z is pressed
document.addEventListener('keydown', function(e) {
	if (highlights.length != 0 && ((!isMac && e.ctrlKey) || (isMac && e.metaKey)) && e.key == "z") {
		var lastEntry = highlights[highlights.length - 1];
		// stores id's of child selections to be removed
		var removeArray = new Array();
		//stores underlying highlights of the last selection
		var childElements;
		// removes underneath selections if they exist  
		if (lastEntry != null) {
			childElements = lastEntry.children;
			for (var i = 0; i < childElements.length; i++) {
				removeArray.push(childElements[i].id);
			}
			for (var i = 0; i < removeArray.length; i++) {
				removeHighlight(removeArray[i]);
			}
		}
		// removes most recent selection
		for (var i = highlights.length - 1; i >= 0; i--) {
			if (highlights[i] != null) {
				removeHighlight(i);
				highlights.pop();
				break;
			}
			highlights.pop();
		}
	}
});

// toggles selection lock so that ctrl isn't needed to select
// selections can only be removed by toggling again
// 76 = L
document.addEventListener('keydown', function(e) {
	if (e.shiftKey && e.keyCode == 76) {
		if (lockSelect) {
			removeHighlights();
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

// selected text is concatenated, separated by newlines
function getSelectedText() {
	var text = "";
	for (var i = 0; i < highlights.length; i++) {
		if (highlights[i] != null) {
			if (copyByBullet) {
				text += "• "
			}
			text += highlights[i].textContent;
			if (i != highlights.length - 1) {
				if (copyByNewLine || copyByBullet) {
					text += "\n";
				}
				else {
					text += " ";
				}
			}
		}
	}
	return text;
}

// highlights selected text in blue
function highlightText() {
	var selection = window.getSelection();
	if (selection.toString() == "") {
		return;
	}
	// create Range object of selected text
	var selectionRange = selection.getRangeAt(0);

	// create a node with a highlighted attribute
	var highlightNode = document.createElement("highlight");
	highlightNode.style.color = "white";
	highlightNode.style.backgroundColor = 'rgb(' + 51 + ',' + 144 + ',' + 255 + ')';
	
	// catches error when partially selecting a non-text node
	try {
		// surround text with the highlighting node
		selectionRange.surroundContents(highlightNode);
		// stores highlight node so it can be deleted later
		// checks for empty selection from ctrl clicking on blank space
		if (highlightNode.textContent != "") {
			highlightNode.id = highlights.length;
			highlights.push(highlightNode);
			// console.log("Child Nodes: " + highlightNode.childNodes[0].childNodes.length);
		}
		// below can select partial non-text nodes but breaks formatting
		// highlightNode.appendChild(selectionRange.extractContents());
		// selectionRange.insertNode(highlightNode);
	}
	catch (error) {
		// console.log(error);
	}
}

// clears single selection 
function removeHighlight(x) {
	if (highlights[x] != null) {
		var replacedNode = highlights[x];

		// code below sometimes removes formatting (bold text, italics) 
		// var text = document.createTextNode(replacedNode.textContent);
		// replacedNode.parentNode.replaceChild(text, replacedNode);

		// replaces highlighted text with original text
		replacedNode.outerHTML = replacedNode.innerHTML;
		highlights[x] = null;
	}
}

// clears all selected text
function removeHighlights() {
	// called on each stored highlight
	for (var i = 0; i < highlights.length; i++) {
		removeHighlight(i);
	}
	// clears highlights
	highlights = new Array();
}