// Cache settings
const settings = {};
const defaultSettings = {
    contextMenuChk: true,
    multiSearchChk: false,
    combinedSearchChk: false,
    multiYTSearchChk: false,
    combinedYTSearchChk: false,
    multiWikiSearchChk: false,
    combinedWikiSearchChk: false
}
console.log("cache:")
const settingsForm = document.getElementById("settingsForm");
console.log(settingsForm);
console.log(settingsForm.contextMenuChk);
console.log(settingsForm.multiYTSearchChk);
const searchOptions = document.getElementById("searchOptions");

// Immediately persist options changes
settingsForm.addEventListener("change", (event) => {
    settings[event.target.id] = event.target.checked;
    chrome.storage.sync.set({ settings });
    if (event.target.id === "contextMenuChk") {
        searchOptions.toggleAttribute("disabled");
    }
    console.log(settings);
});

// TODO: cache needed? add more settings
// TODO: test settings work from clean state, rename
const data = await chrome.storage.sync.get({settings: defaultSettings});

// chrome.storage.sync.get({settings: defaultSettings}, function(result) {
//     copyByBullet = result.copyByBullet;
// });

console.log(data);
Object.assign(settings, data.settings);
console.log(settings);
for (const [checkboxID, checkboxState] of Object.entries(settings)) {
    console.log(checkboxID);
    console.log(checkboxState);
    console.log(settingsForm[checkboxID]);
    settingsForm[checkboxID].checked = checkboxState;
}
settingsForm.contextMenuChk.checked = Boolean(settings.contextMenuEnabled);
if (!settings.contextMenuEnabled) {
    searchOptions.setAttribute("disabled", "");
}