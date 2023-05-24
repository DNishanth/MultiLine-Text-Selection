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

// Creates a new tab for each entry in searchQueries
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
    for (const searchQuery of searchQueries) {
        chrome.tabs.create({
            url: searchURL + searchQuery,
            active: false
        });
    }
}

// Creates or removes context menu options on right click
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message === "addOptions") {
        addContextMenuOptions();
    }
    else if (message === "removeOptions") {
        chrome.contextMenus.removeAll();
    }
});

function addContextMenuOptions() {
    chrome.storage.sync.get(defaultSettings, ({settings}) => {
        chrome.contextMenus.removeAll(() => {
            if (settings["contextMenuChk"]) {
                for (const [optionID, optionTitle] of Object.entries(contextMenuOptions)) {
                    if (settings[optionID]) {
                        chrome.contextMenus.create({
                            id: optionID,
                            title:  optionTitle,
                            contexts: ["page", "selection"]
                        });
                    }
                }
            }
        })
    });
}

// creates a new google search tab for each line of text selected
// called when the context menu item is clicked
function onClickSearch(info, tab) {
    chrome.tabs.sendMessage(tab.id, "Request Selected Text", selectionArray => {
        var menuID = info.menuItemId;
        if (selectionArray.length > 0) {
            if (menuID.startsWith("multi")) {
                multiSearchHelper(selectionArray, menuID);
            }
            else if (menuID.startsWith("combined")) {
                multiSearchHelper([selectionArray.join(" ")], menuID);
            }
        }
    });
}

chrome.contextMenus.onClicked.addListener(onClickSearch);
