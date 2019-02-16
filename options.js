var newlineButton = document.getElementById("newlineButton");
var copyButton = document.getElementById("copyButton");
var selectedColor = 'rgb(' + 0 + ',' + 162 + ',' + 232 + ')';
var unSelectedColor = "darkgrey";
var copyByNewLine = true; // default copy separates by newlines
// separates by spaces if false

// initializes options menu and restores saved choices
// defaults to Copy With Newlines
chrome.storage.sync.get({copyByNewLine: true}, function(result) {
	if (result.copyByNewLine == true) {
		newlineButton.style.background = selectedColor;	
		copyButton.style.background = unSelectedColor;
		copyByNewLine = true;		
	}
	else if (result.copyByNewLine == false) {
		newlineButton.style.background = unSelectedColor;	
		copyButton.style.background = selectedColor;
		copyByNewLine = false;
	}
});

newlineButton.onclick = function() {
	if (!copyByNewLine) {
		copyByNewLine = true;
		newlineButton.style.background = selectedColor;
		copyButton.style.background = unSelectedColor;
		chrome.storage.sync.set({"copyByNewLine": true});
	}
};

copyButton.onclick = function() {
	if (copyByNewLine) {
		copyByNewLine = false;
		copyButton.style.background = selectedColor;
		newlineButton.style.background = unSelectedColor;
		chrome.storage.sync.set({"copyByNewLine": false});
	}
};