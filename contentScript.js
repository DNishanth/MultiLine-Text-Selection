// stores all currently highlighted nodes
var highlights = new Array();

// copy by newline if true, by spaces otherwise
var copyByNewLine = true;

// sends array of selected text to the background page
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	var selectedText = new Array();
  	for (var i = 0; i < highlights.length; i++) {
  		selectedText.push(highlights[i].textContent);
  	}
  	sendResponse({array: selectedText});
  });

// highlights selected text when mouseup and ctrl down
document.addEventListener("mouseup", function(e) {
	if (e.ctrlKey) {
		highlightText();
	}
});

// clears all selected text when left mousedown and ctrl up
document.addEventListener("mousedown", function(e) {
	if (!e.ctrlKey && (e.button == 0)) {
		removeHighlights();
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

// selected text is concatenated, separated by newlines
function getSelectedText() {
	// retrieves current copy option
	chrome.storage.sync.get({copyByNewLine: true}, function(result) {
		copyByNewLine = result.copyByNewLine;
	});
	var text = "";
 	for (var i = 0; i < highlights.length; i++) {
 		text += highlights[i].textContent;
 		if (i != highlights.length - 1) {
 			if (copyByNewLine) {
 				text += "\n";
 			}
 			else {
 				text += " ";
 			}
 		}
	}
	return text;
}

// highlights selected text in blue
function highlightText() {
	// create Range object of selected text
	var selectionRange = window.getSelection().getRangeAt(0);

	// create a node with a highlighted attribute
	var highlightNode = document.createElement("span");
	highlightNode.style.color = "white";
	highlightNode.style.backgroundColor = 'rgb(' + 51 + ',' + 144 + ',' + 255 + ')';
	
	// stores highlight node so it can be deleted later
	highlights.push(highlightNode);
		
	// surround the text with the highlighting node
	selectionRange.surroundContents(highlightNode);
}

// clears all selected text
function removeHighlights() {
	// called on each stored highlight
	for (var i = 0; i < highlights.length; i++) {
		var replacedNode = highlights[i];
		// replaces highlighted text with original text
		var text = document.createTextNode(replacedNode.textContent);
		replacedNode.parentNode.replaceChild(text, replacedNode);
	}
	// clears highlight
	highlights = new Array();
}