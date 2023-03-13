// Cache settings
const settings = {};
const settingsForm = document.getElementById("settingsForm");

// Immediately persist options changes
settingsForm.contextMenuChk.addEventListener("change", (event) => {
    settings.contextMenuEnabled = event.target.checked;
    chrome.storage.sync.set({ settings });
});

// TODO: cache needed? add more settings
const data = await chrome.storage.sync.get("settings");
Object.assign(settings, data.settings);
settingsForm.contextMenuChk.checked = Boolean(settings.contextMenuEnabled);