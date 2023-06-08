// Local state of search settings
var settings = {
    contextMenuChk: true,
    multiSearchChk: true,
    combinedSearchChk: true,
    multiYTSearchChk: true,
    combinedYTSearchChk: true,
    multiWikiSearchChk: true,
    combinedWikiSearchChk: true
}
const settingsForm = document.getElementById("settingsForm");
const searchOptions = document.getElementById("searchOptions");

// Initialize with saved settings
settings = await chrome.storage.sync.get(settings);
for (const [checkboxID, checkboxState] of Object.entries(settings)) {
    settingsForm[checkboxID].checked = checkboxState;
}

// Update settings on form change
settingsForm.addEventListener("change", event => {
    settings[event.target.id] = event.target.checked;
    chrome.storage.sync.set({settings});
    if (event.target.id === "contextMenuChk") {
        searchOptions.toggleAttribute("disabled");
    }
});

// Disable suboptions if show right click options is unchecked
if (!settings.contextMenuChk) {
    searchOptions.setAttribute("disabled", "");
}