// stores all current highlight nodes
var highlights = new Array();

document.addEventListener("mouseup", function(e) {
	if (e.ctrlKey) {
		highlightText();
	}
});

document.addEventListener("mousedown", function(e) {
	if (!e.ctrlKey) {
		removeHighlights();
	}
});

document.addEventListener("keydown", function(e) {
	alert(e.key);
});

function highlightText() {
	// create Range object of selected text
	var selectionRange = window.getSelection().getRangeAt(0);

	// create a node with a highlighted attribute
	var highlightNode = document.createElement("span");
	highlightNode.style.color = "white";
	highlightNode.style.backgroundColor = 'rgb(' + 51 + ',' + 144 + ',' + 255 + ')';
	
	// stores highlight node so it can be deleted later
	highlights.push(highlightNode);
	
	// RESTORE POSSIBLY highlightNode.appendChild(selectionRange.cloneContents());
	
	// surround the text with the highlighting node
	selectionRange.surroundContents(highlightNode);
}

function removeHighlights() {
	// called on each stored highlight
	for (var i = 0; i < highlights.length; i++) {
		var replacedNode = highlights[i];
		// replaces highlighted text with original text
		var text = document.createTextNode(replacedNode.textContent);
		replacedNode.parentNode.replaceChild( text, replacedNode);
	}
	// clears highlight
	highlights = new Array();


}