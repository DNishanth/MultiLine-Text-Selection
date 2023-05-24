// Cache settings
const settings = {};
const defaultSettings = {
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

// TODO: remove log

// Update settings on form change
settingsForm.addEventListener("change", (event) => {
    settings[event.target.id] = event.target.checked;
    chrome.storage.sync.set({settings});
    if (event.target.id === "contextMenuChk") {
        searchOptions.toggleAttribute("disabled");
    }
    console.log(settings);
});

// TODO: test settings work from clean state, rename
const data = await chrome.storage.sync.get({settings: defaultSettings});

console.log(data);
Object.assign(settings, data.settings);
console.log(settings);
for (const [checkboxID, checkboxState] of Object.entries(settings)) {
    settingsForm[checkboxID].checked = checkboxState;
}

// Disable suboptions if show right click options is unchecked
if (!settings.contextMenuChk) {
    searchOptions.setAttribute("disabled", "");
}