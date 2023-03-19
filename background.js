const defaultSettings = {
    settings: {
        contextMenuChk: true,
        multiSearchChk: false,
        combinedSearchChk: false,
        multiYTSearchChk: false,
        combinedYTSearchChk: false,
        multiWikiSearchChk: false,
        combinedWikiSearchChk: false
    }
}

const contextMenuOptions = {
    multiSearchChk: "MultiSearch",
    combinedSearchChk: "CombinedSearch",
    multiYTSearchChk: "MultiYouTubeSearch",
    combinedYTSearchChk: "CombinedYouTubeSearch",
    multiWikiSearchChk: "MultiWikiSearch",
    combinedWikiSearchChk: "CombinedWikiSearch",
}

// creates a new tab for each entry in the searches array
function multiSearchHelper(searchQueries, menuID) {
    var searchURL;
    if (menuID.includes("YT")) {
        searchURL = "https://www.youtube.com/results?search_query=";
    }
    else if (menuID.includes("Wiki")) {
        searchURL = "https://en.wikipedia.org/w/index.php?search=";
    }
    else {
        searchURL = "https://www.google.com/search?q=";
    }
    for (const searchQuery of searchQueries) { // TODO: remove whitespace entries here or in content script
        chrome.tabs.create({
            url: searchURL + searchQuery,
            active: false
        });
    }
}

// creates context menu options when any of the selections are right clicked
chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        if (message === "addOptions") {
            addContextMenuOptions();
        }
        else if (message === "removeOptions") {
            chrome.contextMenus.removeAll();
        }
    });

function addContextMenuOptions() {
    chrome.storage.sync.get(defaultSettings, ({settings}) => {
        if (settings["contextMenuChk"]) {
            chrome.contextMenus.removeAll(() => {
                for (const [optionID, optionTitle] of Object.entries(contextMenuOptions)) {
                    if (settings[optionID]) {
                        chrome.contextMenus.create({
                            id: optionID,
                            title:  optionTitle,
                            contexts: ["page", "selection"]
                        });
                    }
                }
            })
        }
    });
}

// creates a new google search tab for each line of text selected
// called when the context menu item is clicked
function onClickSearch(info, tab) {
    chrome.tabs.sendMessage(tab.id, "Request Selected Text", selectionArray => {
        var menuID = info.menuItemId;
        if (selectionArray.length === 0) {
            defaultSelectionSearch(); // TODO: check if this is ever called
        }
        else if (menuID.startsWith("multi")) {
            multiSearchHelper(selectionArray, menuID);
        }
        else if (menuID.startsWith("combined")) {
            multiSearchHelper([selectionArray.join(" ")], menuID);
        }
    });
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

chrome.contextMenus.onClicked.addListener(onClickSearch);
