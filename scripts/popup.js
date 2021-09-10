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

const textInput = (id, iconSrc, placeholder, action) => {
	const searchArea = document.createElement("div");
	searchArea.classList.add("searchArea");

	const searchWrapper = document.createElement("div");
	searchWrapper.id = id+"InputWrapper";
	searchWrapper.classList.add("textInputWrapper");
	searchArea.appendChild(searchWrapper);

	const iconImg = document.createElement("img");
	iconImg.classList.add("textInputIcon");
	iconImg.src = iconSrc;
	searchWrapper.appendChild(iconImg);

	const textInput = document.createElement("input");
	textInput.type = "text";
	textInput.placeholder = placeholder;
	textInput.id = id+"Input";
	if (action) textInput.oninput = action;
	searchWrapper.appendChild(textInput);

	return searchArea;
}

const secundaryPage = (titleText, width) => {
	document.documentElement.style.setProperty('--body-base-width', width+"px");

	document.getElementById("main").style.display = "none";
	document.getElementById("footer").style.display = "none";

	const main = document.createElement("div");
	main.id = "secPageMain";
	document.body.prepend(main); 

	const navbar = document.createElement("div");
	navbar.classList.add("topNav");
	main.appendChild(navbar);

	// go back arrow
	const arrowWrapper = document.createElement("div");
	arrowWrapper.id = "goBack"
	const arrow = document.createElement("i");
	arrow.className = "left clickable";
	arrow.style.pointerEvents = "none";
	arrow.style.padding = "4px";
	arrowWrapper.appendChild(arrow);
	navbar.appendChild(arrowWrapper); 

	const title = document.createElement("h3");
	title.style.margin = "0 0 0 10px";
	title.appendChild(document.createTextNode(titleText));
	navbar.appendChild(title);

	const content = document.createElement("div");
	content.style.marginTop = "45px";
	main.appendChild(content);

	return content;
}

window.onload = () => {
	const main = document.createElement("div");
	main.id = "main";
	document.body.appendChild(main);

	// logo
	const logoDiv = document.createElement("div");
	main.appendChild(logoDiv);
	logoDiv.id = "logoWrapper";
	const logo = document.createElement("img");
	logo.src="logo/logo.png";
	logoDiv.appendChild(logo);

	// extension title
	const title = document.createElement("h2");
	title.textContent = "WaniKani Undo";
	logoDiv.appendChild(title);

	chrome.storage.local.get(["api_key"], result => {
		const apiKey = result["api_key"];
		// if the user did not add a key yet
		if (!apiKey) {
			// key input
			const apiInputWrapper = document.createElement("div");
			apiInputWrapper.classList.add("apiKey_wrapper");
			main.appendChild(apiInputWrapper);

			const apiLabel = document.createElement("p");
			apiLabel.style.marginBottom = "5px";
			apiLabel.style.fontSize = "14px";
			apiLabel.appendChild(document.createTextNode("API Key: "));
			apiInputWrapper.appendChild(apiLabel);
		
			const apiInput = textInput("apiKey", "../images/key.png", "Input the key here...");
			apiInputWrapper.appendChild(apiInput);

			// submit button
			const button = document.createElement("div");
			button.appendChild(document.createTextNode("Submit"));
			button.classList.add("button");
			button.id = "submit";
			apiInputWrapper.appendChild(button);

			// what is an api key
			const whatIsAPIKey = document.createElement("div");
			whatIsAPIKey.style.marginTop = "2px";
			apiInputWrapper.appendChild(whatIsAPIKey);
			const whatIsAPIKeyLink = document.createElement("a");
			whatIsAPIKeyLink.href = "#";
			whatIsAPIKeyLink.id = "whatIsAPIKey";
			whatIsAPIKeyLink.appendChild(document.createTextNode("What is an API Key?"));
			whatIsAPIKey.appendChild(whatIsAPIKeyLink);
		}
	});

	document.body.appendChild(footer());
}

const reloadPage = (message, color) => {
	const wrapper = document.createElement("div");
	
	const submitMessage = document.createElement("p");
	submitMessage.id = "message";
	submitMessage.style.marginTop = "5px";
	submitMessage.style.color = color;
	submitMessage.style.textAlign = "center";
	submitMessage.innerHTML = message;
	wrapper.appendChild(submitMessage);
	
	// button to ask to reload the page
	const reloadButton = document.createElement("div");
	reloadButton.appendChild(document.createTextNode("Reload Page"));
	reloadButton.className = "button centered";
	reloadButton.id = "reloadPage";
	wrapper.appendChild(reloadButton);

	return wrapper;
}

const submitAction = () => {
	let invalidKey = false;
	const msg = document.getElementById("message");
	if (msg)
		msg.remove();

	// check if key is valid
	const apiKey = document.getElementById("apiKeyInput").value.trim();
	const splitKey = apiKey.split("-");
	const keyPartsLength = [8, 4, 4, 4, 12];
	let keyPart, partLength;
	for (let i = 0; i < keyPartsLength.length; i++) {
		keyPart = splitKey[i];
		partLength = keyPartsLength[i];
		if (!keyPart || keyPart.length !== partLength) {
			invalidKey = true;
			break;
		}
	}

	const main = document.getElementById("main");

	if (!invalidKey) {
		chrome.storage.local.set({"api_key": apiKey});
		const apiInputWrapper = document.getElementsByClassName("apiKey_wrapper")[0];
		if (apiInputWrapper)
			apiInputWrapper.remove();

		main.appendChild(reloadPage("The API key was accepted!", "green"));
	}
	else {
		const submitMessage = document.createElement("p");
		main.appendChild(submitMessage);
		submitMessage.id = "message";
		submitMessage.style.marginTop = "5px";	
		submitMessage.style.color = "red";
		submitMessage.appendChild(document.createTextNode("The API key is invalid!"));
	}
}

document.addEventListener("click", e => {
	const targetElem = e.target;
	
	if (targetElem.id === "submit")
		submitAction();

	if (targetElem.id === "reloadPage") {
		chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
			var activeTab = tabs[0];
			chrome.tabs.sendMessage(activeTab.id, {reloadPage:"true"}, () => window.chrome.runtime.lastError);
			window.location.reload();
		});
	}

	if (targetElem.id === "whatIsAPIKey") {
		const content = secundaryPage("API Key", 250);

		for (const text of ["A WaniKani API Key is a token that is meant to give you access to all the content provided by WaniKani through a third party application (like this one).", "You can create your API Key on <a href='https://www.wanikani.com/' target='_blank'>WaniKani official website</a> through the following steps:"]) {
			const pWrapper = document.createElement("div");
			pWrapper.style.marginTop = "6px";
			content.appendChild(pWrapper);
			const p = document.createElement("p");
			p.innerHTML = text;
			pWrapper.appendChild(p);
		}

		const stepText = ["<strong>1-</strong> Click on your photo on the navigation bar anywhere on the website, and then click <strong>API Tokens</strong>.", "<strong>2-</strong>  Click on <strong>Generate a new token</strong>, give it any name you want, and then copy it and paste it here in the extension."];
		const imagesSrc = ["../images/apitoken_1.png", "../images/apitoken_2.png"]

		for (let i = 0; i < stepText.length; i++) {
			const wrapper = document.createElement("div");
			wrapper.classList.add("apiKeyStep");
			content.appendChild(wrapper);
			const p = document.createElement("p");
			p.style.padding = "3px";
			p.innerHTML = stepText[i];
			wrapper.appendChild(p);
	
			const img = document.createElement("img");
			img.src = imagesSrc[i];
			img.style.width = "100%";
			wrapper.appendChild(img);
		}
	}

	if (targetElem.id === "goBack") {
		document.getElementById("secPageMain").remove();
		document.getElementById("main").style.display = "inherit";
		document.getElementById("footer").style.display = "inherit";
		document.documentElement.style.setProperty('--body-base-width', '250px');
	}
});