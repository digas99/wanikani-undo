'use strict';

(() => {	
	chrome.storage.local.get(["api_key", "extension-disabled"], result => {
		const apiKey = result["api_key"];
		const extensionDisabled = result["extension-disabled"];
		if (apiKey) {
			chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
				// if background is fetching data
				if (request.fetchData) {
					const backgroundMask = document.createElement("div");
					document.body.appendChild(backgroundMask);
					backgroundMask.id = "wkundo-backgroundMask";

					const dataLoadingWrapper = document.createElement("div");
					document.body.appendChild(dataLoadingWrapper);
					dataLoadingWrapper.id = "wkundo-dataLoading";
					const dataLoading = document.createElement("div");
					dataLoadingWrapper.appendChild(dataLoading);

					backgroundMask.addEventListener("click", () => {
						backgroundMask.remove();
						dataLoadingWrapper.remove();
					});
				}
			});

			// extension disable button
			const stats = document.getElementById("stats");
			if (stats) {
				const i = document.createElement("i");
				stats.appendChild(i);
				const logo = document.createElement("img");
				i.appendChild(logo);
				logo.id = "wkundo-extension-disable";
				logo.src = "https://i.imgur.com/NYZNega.png";
				if (extensionDisabled) logo.classList.add("wkundo-disabled");
				logo.addEventListener("click", () => {
					let disabled;
					if (!(logo.classList.contains("wkundo-disabled"))) {
						logo.classList.add("wkundo-disabled");
						disabled = true;
						const undoButton = document.getElementById("option-undo");
						if (undoButton && undoButton.parentElement) {
							undoButton.parentElement.childNodes.forEach(node => node.style.removeProperty('width'));
							undoButton.remove();
						}
						const undoInput = document.getElementById("wkundo-input");
						if (undoInput) undoInput.remove();
						const undoSend = document.getElementById("wkundo-sendbutton");
						if (undoSend) undoSend.remove();

						const realInput = document.getElementById("user-response");
						if (realInput) realInput.style.removeProperty('display');
						const realButton = realInput.parentElement.getElementsByTagName("BUTTON")[0];
						if (realButton) realButton.style.removeProperty('display');
					}
					else {
						logo.classList.remove("wkundo-disabled");
						disabled = false;

						setupPage();
					}
					chrome.storage.local.set({"extension-disabled":disabled});
				});
			}

			const setupPage = () => {
				let questionType, character, prefix;
				let sendClicks = 0;
			
				// get input and button
				const input = document.getElementById("user-response");
				if (input) {
					const parent = input.parentElement;
					const btn = parent.getElementsByTagName("BUTTON")[0];
					if (btn) {
						const cloneInput = input.cloneNode();
						cloneInput.id = "wkundo-input";
						const cloneBtn = document.createElement("div");
						cloneBtn.id = "wkundo-sendbutton";
						const cloneBtnChild = btn.childNodes[0].cloneNode();
						cloneBtnChild.style.pointerEvents = "none";
						cloneBtn.appendChild(cloneBtnChild);
			
						const resetClones = () => {
							cloneInput.style.backgroundColor = "#fff";
							cloneInput.style.color = "black";
							cloneInput.value = "";
							cloneInput.style.pointerEvents = "all";
							cloneBtn.style.backgroundColor = "#fff";
							cloneBtn.style.color = "black";
							sendClicks = 0;
						}
			
						const updateBasicInfo = () => {
							questionType = document.getElementById("question-type").classList[0];
							character = document.getElementById("character").getElementsByTagName("SPAN")[0].innerText;
							prefix = document.getElementById("question-type").children[0].innerText.split(" ")[0][0].toLowerCase();
							console.log(questionType);
							console.log(character);
							console.log(prefix);
						}
			
						cloneInput.addEventListener("input", () => {
							// extra info fetched here, to make sure everything is loaded
							if (!(questionType && character))
								updateBasicInfo();
			
							// change text to kana
							if (questionType == "reading") {
								let finalValue = "";
								const split = separateRomaji(cloneInput.value);
								for (const word of split) {
									const kanaValue = kana[word];
									finalValue += kanaValue ? kanaValue : word;
								}
								cloneInput.value = finalValue;
							}
						});
			
						const sendAction = () => {
							const value = cloneInput.value.toLowerCase();
							// if ready to check answer
							if (value != '' && questionType && character) {
								sendClicks++;
			
								chrome.storage.local.get([prefix+character], result => {
									const subjectInfo = result[prefix+character];
									console.log(subjectInfo);
									if (subjectInfo) {
										const mapInfo = type => {
											return subjectInfo[type+"s"]
												.filter(data => data["accepted_answer"])
												.map(data => data[type]);
										}
			
										// map answers and put all in lower case
										let info = mapInfo(questionType).map(value => value.toLowerCase());
			
										// correct answer
										// - checking if the answer is exactly the same
										// - using levenshtein distance to accept aproximate answers
										if (info.includes(value) || (questionType != "reading" && info.some(answer => length_condition(levenshtein(answer, value), answer.length)))) {
											if (sendClicks == 1) {
												cloneInput.style.backgroundColor = "#88cc00";
												cloneBtn.style.backgroundColor = "#88cc00";
												cloneInput.style.color = "#fff";
												cloneBtn.style.color = "#fff";
			
												// the answer to be sent is something that is always right (not the user's answer),
												// to prevent conflicts with the wanikani's evaluation system. This only applies for
												// meanings, because of the answer acceptance method
												input.value = questionType == "meaning" ? info[0] : value;
			
												// play audio
												document.getElementById("option-audio-player").click();
											}			
			
											btn.click();
			
											if (sendClicks == 2) {
												resetClones();
												updateBasicInfo();
											}					
										}
										// incorrect answer
										else {
											// first send, give the option to undo
											if (sendClicks == 1) {
												document.getElementById("option-undo").classList.remove("disabled");
			
												cloneInput.style.backgroundColor = "#f03";
												cloneInput.style.pointerEvents = "none";
												cloneInput.style.color = "#fff";
												cloneInput.blur();
												cloneBtn.style.backgroundColor = "#f03";
												cloneBtn.style.color = "#fff";
											}
											// if user confirms that the answer is wrong
											else {
												// put the answer in the real input and click the real button
												if (sendClicks == 2) {
													// the answer to be sent is something that is always wrong (not the user's answer),
													// to prevent conflicts with the wanikani's evaluation system. This only applies
													// for meanings
													input.value = questionType == "meaning" ? "wasd" : value;
													// prevent user from going back
													document.getElementById("option-undo").classList.add("disabled");
												}
			
												btn.click();
			
												// if user clicked 3 times while wrong, then reset styles for the next review
												if (sendClicks == 3) {
													resetClones();
													updateBasicInfo();
												}
											}
										}
									}
								});
							}
						}
			
						cloneBtn.addEventListener("click", sendAction);
			
						document.addEventListener("keydown", e => {
							const key = e.key;
			
							if (document.getElementById("wkundo-sendbutton") && key == 'Enter')
								sendAction();
			
							// force char deleting with backspace
							if (key == "Backspace") {
								// make sure the user is writing in the clone button
								if (document.getElementById("wkundo-input") && document.activeElement === cloneInput)
									cloneInput.value = cloneInput.value.slice(0,-1);
							}
	
							if (key == 'u' || key == 'U') {
								console.log("here");
								var clickEvent = new MouseEvent("click", {
									"view": window,
									"bubbles": true,
									"cancelable": false
								});
								const optionUndo = document.getElementById("option-undo");
								if (optionUndo)
									optionUndo.getElementsByTagName("SPAN")[0].dispatchEvent(clickEvent);
							}
						});
			
						// add clones
						parent.appendChild(cloneInput);
						parent.appendChild(cloneBtn);
			
						// hide original elements
						input.style.display = "none";
						btn.style.display = "none";
			
						// additional button
						const buttonsWrapper = document.getElementById("additional-content").getElementsByTagName("UL")[0];
						if (buttonsWrapper) {
							buttonsWrapper.style.textAlign = "center";
			
							// add undo button
							const li = document.createElement("li");
							buttonsWrapper.appendChild(li);
							li.classList.add("disabled");
							li.id = "option-undo";
							const span = document.createElement("span");
							li.appendChild(span);
							span.title = "Undo";
							// event listener to undo button
							span.addEventListener("click", () => {
								if (!li.classList.contains("disabled") && sendClicks == 1) {
									resetClones();
									li.classList.add("disabled");
									setTimeout(() => cloneInput.focus(), 200);
								}
							});
							const i = document.createElement("i");
							span.appendChild(i);
							i.classList.add("icon-undo");
			
							// fix all buttons width
							buttonsWrapper.childNodes.forEach(btn => btn.style.width = "16%");
						}
					}
				}
			}

			if (!extensionDisabled) {
				setupPage();
			}
		}
	});
})();