// https://stackoverflow.com/questions/43676331/creating-a-css-class-with-a-javascript-object-or-var/43676931
// creates css class that will be applied to each selection
var element = document.createElement("style");
element.innerHTML = ".hiclass {background-color:" + "rgb(51, 144, 255)" + "; color: white}";
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
		for (var i = 0; i < highlighter.highlights.length; i++) {
			if (highlighter.highlights[i].getText() != null || highlighter.highlights[i].getText() != "" 
				|| highlighter.highlights[i].getText() != " ") {
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
			}
		}
			sendResponse({array: selectedText});
		});

// highlights selected text when mouseup and ctrl down
// ctrl not needed when selection lock is on
document.addEventListener("mouseup", function(e) { //(e.target.id != "HIGHLIGHT")// nodename != HIGHLIGHT originally
	if (lockSelect || ((!isMac && e.ctrlKey) || (isMac && e.metaKey)) ) {
		highlighter.highlightSelection("hiclass");
	}
});

// clears all selected text when left mousedown and ctrl up
// and adds options to context menu when a selection is clicked
// disabled when lock selection is on, clear by shift-L instead
document.addEventListener("mousedown", function(e) {
	if (lockSelect == false && (((!isMac && !e.ctrlKey) || (isMac && !e.metaKey)) && (e.button == 0))) {
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
	//
	var text = "";
	for (var i = 0; i < highlighter.highlights.length; i++) {
		var highlightEls = highlighter.highlights[i].getHighlightElements();
		text = text + "" + i + ". " + highlightEls.length + "\n";
		//text += highlighter.highlights[i].toString();
		for (var x = 0; x < highlightEls.length; x++) {
			text += highlightEls[x].innerText;// + "" + highlightEls[x].getRange();
			text += "\n";
			var rect = highlightEls[x].getBoundingClientRect();
			text += "T:" + rect.top + ", " + "B:" + rect.bottom + ", " + "L:" + rect.left + ", " + "R:" + rect.right + "\n";
		}
		text += "\n\n";
	}



	alert(text);
	//

	if (highlighter.highlights.length != 0) {
		e.clipboardData.setData('text/plain', extractSelectionText());
		e.preventDefault(); // prevents default copy event
	}
});

function extractSelectionText() {
	var elementA, elementB;
	var text = "";
	for (var i = 0; i < highlighter.highlights.length; i++) {
		var highlightEls = highlighter.highlights[i].getHighlightElements();
		if (copyByBullet) {
			text += "• ";
		}
		text += highlightEls[0].innerText;
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


function isElementOnNextLine(elA, elB) {
	// alert("elBtop: " + elB.top + "\nelAbot: " + elA.bottom);
	// alert(elB.top > elA.bottom);

	return (elB.top > elA.bottom) || (elB.bottom < elA.top);
	// !(((elB.top >= elA.top) && (elB.top <= elA.bot)) || ((elB.bot >= elA.top) && (elB.bot <= elA.bot)));
}


// removes the most recent selection when ctrl + z is pressed
document.addEventListener('keydown', function(e) {
	if (highlighter.highlights.length != 0 && ((!isMac && e.ctrlKey) || (isMac && e.metaKey)) && e.key == "z") {
		highlighter.removeHighlights([highlighter.highlights[highlighter.highlights.length-1]]);


		// var lastEntry = highlights[highlights.length - 1];
		// // stores id's of child selections to be removed
		// var removeArray = new Array();
		// //stores underlying highlights of the last selection
		// var childElements;
		// // removes underneath selections if they exist  
		// if (lastEntry != null) {
		// 	childElements = lastEntry.children;
		// 	for (var i = 0; i < childElements.length; i++) {
		// 		removeArray.push(childElements[i].id);
		// 	}
		// 	for (var i = 0; i < removeArray.length; i++) {
		// 		removeHighlight(removeArray[i]);
		// 	}
		// }
		// // removes most recent selection
		// for (var i = highlights.length - 1; i >= 0; i--) {
		// 	if (highlights[i] != null) {
		// 		removeHighlight(i);
		// 		highlights.pop();
		// 		break;
		// 	}
		// 	highlights.pop();
		// }
	}
});

// toggles selection lock so that ctrl isn't needed to select
// selections can only be removed by toggling again
// 76 = L
document.addEventListener('keydown', function(e) {
	if (e.shiftKey && ((!isMac && e.ctrlKey) || (isMac && e.metaKey)) && e.keyCode == 76) {
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