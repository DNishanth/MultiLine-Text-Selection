var newlineButton = document.getElementById("newlineButton");
var spaceButton = document.getElementById("spaceButton");
var bulletButton = document.getElementById("bulletButton");
var selectedColor = 'rgb(' + 0 + ',' + 162 + ',' + 232 + ')';
var unSelectedColor = "darkgrey";
var copyByNewLine = true; // default copy separates by newlines
var copyBySpaces = false;
var copyByBullet = false;

// initializes options menu and restores saved choices
// defaults to Copy With Newlines
chrome.storage.sync.get({copyByNewLine: true, copyBySpaces: false, copyByBullet: false}, function(result) {
	if (result.copyByNewLine == true) {
		newlineButton.style.background = selectedColor;
		copyByNewLine = true;
	}
	else if (result.copyByNewLine == false) {
		newlineButton.style.background = unSelectedColor;
		copyByNewLine = false;
	}	

	if (result.copyBySpaces == true) {
		spaceButton.style.background = selectedColor;
		copyBySpaces = true;
	}
	else if (result.copyBySpaces == false) {
		spaceButton.style.background = unSelectedColor;
		copyBySpaces = false;
	}

	if (result.copyByBullet == true) {
		bulletButton.style.background = selectedColor;
		copyByBullet = true;
	}
	else if (result.copyByBullet == false) {
		bulletButton.style.background = unSelectedColor;
		copyByBullet = false;
	}
});


newlineButton.onclick = function() {
	if (!copyByNewLine) {
		copyByNewLine = true;
		copyBySpaces = false;
		copyByBullet = false;
		newlineButton.style.background = selectedColor;
		spaceButton.style.background = unSelectedColor;
		bulletButton.style.background = unSelectedColor;
		chrome.storage.sync.set({"copyByNewLine": true,
			"copyBySpaces": false, "copyByBullet": false});
	}
};

spaceButton.onclick = function() {
	if (!copyBySpaces) {
		copyByNewLine = false;
		copyBySpaces = true;
		copyByBullet = false;
		newlineButton.style.background = unSelectedColor;
		spaceButton.style.background = selectedColor;
		bulletButton.style.background = unSelectedColor;
		chrome.storage.sync.set({"copyByNewLine": false,
			"copyBySpaces": true, "copyByBullet": false});
	}
};

bulletButton.onclick = function() {
	if (!copyByBullet) {
		copyByNewLine = false;
		copyBySpaces = false;
		copyByBullet = true;
		newlineButton.style.background = unSelectedColor;
		spaceButton.style.background = unSelectedColor;
		bulletButton.style.background = selectedColor;
		chrome.storage.sync.set({"copyByNewLine": false,
			"copyBySpaces": false, "copyByBullet": true});
	}
};