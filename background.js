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
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {message: "Request Selected Text"},
            function(response) {
                if (response.array.length == 0) {
                    defaultSelectionSearch();
                }
                else if (info.menuItemId == "1") {
                    multipleSelectionSearch(response.array);
                }
                else if (info.menuItemId == "2") {
                    combinedSearch(response.array);   
                }
            });
    });
    // splits selected text by spaces, using onClicked info
    // searches = info.selectionText.split("  ");
    // multiSearchHelper(searches);
}

// creates a search tab for each line of default selected text 
function defaultSelectionSearch() {
    var searches;
    chrome.tabs.executeScript( {
    code: "window.getSelection().toString();"
}, function(selection) {
    // splits selected text by newlines
    searches = selection[0].split("\n");
    multiSearchHelper(searches);
});
}

// creates a search tab for each line of multiple text selections
function multipleSelectionSearch(selections) {
    var searches;
    for (var x in selections) {
        // splits selected text by newlines
        searches = selections[x].split("\n");
        multiSearchHelper(searches);            
    }
}

// combines multiple selections to create a single search tab
function combinedSearch(selections) {
    var searches = new Array();
    var combinedSearch = "";
    for (var x in selections) {
        combinedSearch += (selections[x] + " ");
    }
    searches.push(combinedSearch);
    multiSearchHelper(searches);
}

chrome.contextMenus.onClicked.addListener(onClickSearch);

chrome.runtime.onInstalled.addListener(function() {
  chrome.contextMenus.create({
	id: "1",
    title: "MultiSearch",
    contexts: ["selection"]
  });
  chrome.contextMenus.create({
    id: "2",
    title: "CombinedSearch",
    contexts: ["selection"]
  });
});