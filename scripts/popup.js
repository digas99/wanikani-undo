const footer = () => {
	const wrapper = document.createElement("div");
	wrapper.id = "footer";

	const warning = document.createElement("p");
	warning.id = "footerWarning";
	warning.appendChild(document.createTextNode("This is NOT an official extension!"));
	wrapper.appendChild(warning);

	const ul = document.createElement("ul");
	ul.style.display = "inline-flex";
	wrapper.appendChild(ul);

	const labels = ["Github", "Contact Me", "WaniKani"];
	const links = ["https://github.com/digas99/wanikani-undo", "mailto:wkhighlighter@diogocorreia.com", "https://www.wanikani.com/"]
	for (let i = 0; i < labels.length; i++) {
		const li = document.createElement("li");
		li.style.padding = "0 3px";
		ul.appendChild(li);
		const a = document.createElement("a");
		a.href = links[i];
		a.target = "_blank";
		a.appendChild(document.createTextNode(labels[i]));
		li.appendChild(a);
	}

	const versionWrapper = document.createElement("div");
	wrapper.appendChild(versionWrapper);
	const version = document.createElement("a");
	versionWrapper.appendChild(version);

	reposFirstVersion("digas99", "wanikani-undo").then(result => {
		version.href = `https://github.com/digas99/wanikani-undo/releases/tag/${result}`;
		version.appendChild(document.createTextNode("beta-"+result));
		version.target = "_blank";
		versionWrapper.style.marginTop = "4px";
		version.style.color = "black";
	});

	return wrapper;
}

window.onload = () => {
	// setups
	chrome.storage.local.get([...Object.keys(static_settings), "hotkeys"], result => {
		console.log(result);

		for (let id in static_settings) {
			const checkbox = document.getElementById("settings-"+id);
			if (checkbox) checkbox.checked = result[id] ? result[id] : static_settings[id];
		}

		let hotkeys = result["hotkeys"];
		const hotkeysInputs = document.getElementsByClassName("settings-hotkey");
		if (!hotkeys) hotkeys = static_hotkeysMap;

		// check if all settings are updated
		let newSettings = {};
		Object.keys(static_settings).forEach(key => {
			if (!result[key]) newSettings[key] = static_settings[key];
		});
		if (Object.keys(newSettings).length > 0) chrome.storage.local.set(newSettings);

		// check if hotkeys are updated
		let keyChanges = false;
		Object.keys(static_hotkeysMap).forEach(key => {
			if (!hotkeys[key]) {
				hotkeys[key] = static_hotkeysMap[key];
				keyChanges = true;
			}
		});
		if (keyChanges) chrome.storage.local.set({"hotkeys": hotkeys});

		if (hotkeys && hotkeysInputs.length > 0) {
			Array.from(hotkeysInputs).forEach(input => document.styleSheets[0].insertRule(`#${input.id}:after { content:'${hotkeys[input.id]}';}`));
		}
	});

	document.body.appendChild(footer());
}

document.addEventListener("click", e => {
	const targetElem = e.target;

	if (Object.keys(static_settings).includes(targetElem.id.split("settings-")[1]))
		chrome.storage.local.set({[targetElem.id.split("settings-")[1]]:targetElem.checked ? true : false});

	if (targetElem.classList.contains("settings-hotkey") && targetElem.classList.contains("clickable")) {
		e.preventDefault();
	
		document.styleSheets[0].insertRule(`#${targetElem.id}:after { content:'_' !important;}`,document.styleSheets[0].cssRules.length);
		const settingsOptionsWrapper = document.getElementById("settingsOptionsWrapper");
		if (settingsOptionsWrapper) settingsOptionsWrapper.style.pointerEvents = "none";

		const wrapper = targetElem.parentElement.parentElement;
		if (wrapper) wrapper.classList.add("hotkey-selector");

		const superWrapper = document.getElementById("settingsContent");
		if (superWrapper && !document.getElementById("typeNewKey-msg")) {
			const hotkeyMsg = document.createElement("p");
			superWrapper.appendChild(hotkeyMsg);
			hotkeyMsg.id = "typeNewKey-msg";
			hotkeyMsg.appendChild(document.createTextNode("Type the new key now"));
		}
	}
});

document.addEventListener("keydown", e => {
	const key = e.key;

	const newHotkeyMsg = document.getElementById("typeNewKey-msg");
	if (newHotkeyMsg && key.length == 1) {
		chrome.storage.local.get(["hotkeys"], result => {
			const hotkeys = result["hotkeys"];
			if (hotkeys) {
				newHotkeyMsg.remove();
				const hotkeySelector = document.getElementsByClassName("hotkey-selector")[0];
				if (hotkeySelector) {
					const checkbox = hotkeySelector.getElementsByTagName("INPUT")[0];
					if (checkbox) document.styleSheets[0].insertRule(`#${checkbox.id}:after { content:'${key.toUpperCase()}' !important;}`, document.styleSheets[0].cssRules.length);
		
					const settingsWrapper = document.getElementById("settingsOptionsWrapper");
					if (settingsWrapper) settingsWrapper.style.removeProperty("pointer-events");
					hotkeySelector.classList.remove("hotkey-selector");
		
					const settingsInputs = document.getElementsByClassName("settingsItemInput");
					if (settingsInputs) Array.from(settingsInputs).forEach(input => {
						if (input !== checkbox && window.getComputedStyle(input, ':after').getPropertyValue('content') === '"'+key.toUpperCase()+'"') {
							document.styleSheets[0].insertRule(`#${input.id}:after { content:' ' !important;}`, document.styleSheets[0].cssRules.length);
							hotkeys[input.id] = '';
						}
					});

					hotkeys[checkbox.id] = key.toUpperCase();
					chrome.storage.local.set({"hotkeys":hotkeys});
				}
			}
		}); 
	}
});