// Local state of copy options
const options = {
    copyByNewLine: true,
    copyBySpaces: false,
    copyByBullet: false
}

// Initialize options menu with saved settings
chrome.storage.sync.get(options, settings => {
    for (const option in settings) {
        if (settings[option]) {
            document.getElementById(option).classList.add("active");
        }
    }
});

// Update options object with new active setting
function toggleSettings(activeSetting) {
    for (const option in options) {
        options[option] = false;
    }
    options[activeSetting] = true;
}

// Update active css and save settings on button click
function changeSetting(e) {
    const prevActiveBtn = document.getElementsByClassName("active")[0];
    prevActiveBtn.classList.remove("active");
    const newActiveBtn = document.getElementById(e.target.id);
    newActiveBtn.classList.add("active");
    options[e.target.id] = true;
    toggleSettings(e.target.id);
    chrome.storage.sync.set(options);
}

const buttons = document.getElementsByClassName("button");
for (btn of buttons) {
    btn.addEventListener('click', changeSetting);
}