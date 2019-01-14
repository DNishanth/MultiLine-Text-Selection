// creates a new tab for each entry in the searches array
function multiSearchHelper(searches) {
    for (var x in searches) {
        // getSelection().split(\n) sometimes results in blank spaces
        // between entries
        if (searches[x] != "") {
            chrome.tabs.create({
            url: "http://www.google.com/search?q=" + searches[x],
            active: false
            });
        }
    }
}

// creates a new google search tab for each line of text selected
// called when the context menu item is clicked
function onClickSearch(info, tab) {
    var searches;

    // splits selected text by newlines
    chrome.tabs.executeScript( {
        code: "window.getSelection().toString();"
    }, function(selection) {
        searches = selection[0].split("\n");
        multiSearchHelper(searches);
    });
    
    // splits selected text by spaces, using onClicked info
    // searches = info.selectionText.split("  ");
    // multiSearchHelper(searches);
}

chrome.contextMenus.onClicked.addListener(onClickSearch);

chrome.runtime.onInstalled.addListener(function() {
  chrome.contextMenus.create({
	id: "10",
    title: "MultiSearch Google",
    contexts: ["selection"]
  });
});