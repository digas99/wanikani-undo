const static_hotkeysMap = {
	"settings-hotkey-undo-mistake":"U",
	"settings-hotkey-skip":"⏎",
	"settings-hotkey-extension":"X"
}

const static_settings = {
	"auto-show-item-info": false,
	"clone-input-mark": true,
	"skip-answer": false
}

chrome.storage.local.get([...Object.keys(static_settings), "hotkeys"], result => {
	// setup settings
	for (let id in static_settings) {
		if (result[id] == undefined)
			chrome.storage.local.set({[id]:static_settings[id]})
	}
	
	// setup hotkeys
	let hotkeys = result["hotkeys"];
	if (!hotkeys)
		chrome.storage.local.set({"hotkeys":static_hotkeysMap});
});