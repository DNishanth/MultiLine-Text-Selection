contextMenuEnabled = true;

// creates a new tab for each entry in the searches array
function multiSearchHelper(searches, flag) {
    for (var x in searches) {
        // getSelection().split(\n) sometimes results in blank spaces
        // between entries
        if (searches[x] != "" && (flag == 1 || flag == 2)) {
            chrome.tabs.create({
                url: "http://www.google.com/search?q=" + searches[x],
                active: false
            });
        }
        else if (searches[x] != "" && (flag == 3 || flag == 4)) {
            chrome.tabs.create({
                url: "https://www.youtube.com/results?search_query=" + searches[x],
                active: false
            });
        }
        else if (searches[x] != "" && (flag == 5 || flag == 6)) {
            chrome.tabs.create({
                url: "https://en.wikipedia.org/w/index.php?search=" + searches[x],
                active: false
            });
        }
    }
}

// creates context menu options when any of the selections are right clicked
chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        console.log(contextMenuEnabled);
        if (message === "addOptions" && contextMenuEnabled) {
            console.log("adding options");
            chrome.contextMenus.removeAll(function() {
                chrome.contextMenus.create({
                    id: "1",
                    title: "MultiSearch",
                    contexts: ["page", "selection"]
                });
                chrome.contextMenus.create({
                    id: "2",
                    title: "CombinedSearch",
                    contexts: ["page", "selection"]
                });
                chrome.contextMenus.create({
                    id: "3",
                    title: "MultiYouTubeSearch",
                    contexts: ["page", "selection"]
                });
                // chrome.contextMenus.create({
                //     id: "4",
                //     title: "CombinedYouTubeSearch",
                //     contexts: ["page", "selection"]
                // });
                // chrome.contextMenus.create({
                //     id: "5",
                //     title: "MultiWikiSearch",
                //     contexts: ["page", "selection"]
                // });
                // chrome.contextMenus.create({
                //     id: "6",
                //     title: "CombinedWikiSearch",
                //     contexts: ["page", "selection"]
                // });
            });
        }
        else if (message === "removeOptions") {
            console.log("removing options");
            chrome.contextMenus.removeAll();
        }
    });

// creates a new google search tab for each line of text selected
// called when the context menu item is clicked
function onClickSearch(info, tab) {
    var searches;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {message: "Request Selected Text"},
            function(response) {
            	var flag = info.menuItemId;
            	if (response.array.length == 0) {
                    defaultSelectionSearch();
                }
            	else if (flag == 1 || flag == 3 || flag == 5) {
            		multipleSelectionSearch(response.array, flag);
            	}
            	else if (flag == 2 || flag == 4 || flag == 6) {
            		combinedSearch(response.array, flag);
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
    multiSearchHelper(searches, 1);
});
}

// creates a search tab for each line of multiple text selections
function multipleSelectionSearch(selections, flag) {
    var searches;
    for (var x in selections) {
        // splits selected text by newlines
        searches = selections[x].split("\n");
        multiSearchHelper(searches, flag);
    }
}

// combines multiple selections to create a single search tab
function combinedSearch(selections, flag) {
    var searches = new Array();
    var combinedSearch = "";
    for (var x in selections) {
        combinedSearch += (selections[x] + " ");
    }
    searches.push(combinedSearch);
    multiSearchHelper(searches, flag);
}

chrome.contextMenus.onClicked.addListener(onClickSearch);

chrome.storage.onChanged.addListener((changes, areaName) => {
    console.log("change");
    if (areaName === 'sync' && changes.settings?.newValue) {
        contextMenuEnabled = Boolean(changes.settings.newValue.contextMenuEnabled);
        console.log("content");
        console.log(contextMenuEnabled);
    }
});