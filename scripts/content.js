'use strict';

(() => {	
	chrome.storage.local.get(["extension-disabled"], result => {
		chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
			if (request.reloadPage)
				window.location.reload();
		});

		const extensionDisabled = result["extension-disabled"];

		// element that will receive the result of the answer evaluation
		const ansEvalDiv = document.createElement("div");
		document.documentElement.appendChild(ansEvalDiv);
		ansEvalDiv.style.display = "none";
		ansEvalDiv.id = "wkundo-result";

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
				if (!logo.classList.contains("wkundo-disabled") && !document.getElementById("wkundo-input").style.backgroundColor) {
					logo.classList.add("wkundo-disabled");
					disabled = true;
					
					removeExtensionContent();
				}
				else {
					if (logo.classList.contains("wkundo-disabled") && !document.getElementById("user-response").style.backgroundColor) {
						logo.classList.remove("wkundo-disabled");
						disabled = false;

						setupExtensionContent();
					}	
				}
		
				if (disabled !== undefined)
					chrome.storage.local.set({"extension-disabled":disabled});
			});
			
			logo.addEventListener("mouseover", () => {
				if ((document.getElementById("wkundo-input") && document.getElementById("wkundo-input").style.backgroundColor)
					|| (document.getElementById("user-response") && document.getElementById("user-response").style.backgroundColor)) logo.style.cursor = "not-allowed";
				else logo.style.removeProperty("cursor");
			});
		}

		const setupExtensionContent = () => {
			let questionType;
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
					cloneBtn.style.backgroundColor = input.style.backgroundColor;
					cloneBtn.style.color = input.style.color;
					const cloneBtnChild = btn.childNodes[0].cloneNode();
					cloneBtnChild.style.pointerEvents = "none";
					cloneBtn.appendChild(cloneBtnChild);
		
					const resetClones = () => {
						cloneInput.style.removeProperty("background-color");
						cloneInput.style.removeProperty("color");
						cloneInput.value = "";
						cloneInput.style.pointerEvents = "all";
						cloneBtn.style.removeProperty("background-color");
						cloneBtn.style.removeProperty("color");
						sendClicks = 0;
					}
		
					const updateBasicInfo = () => {
						questionType = document.getElementById("question-type").classList[0];
						console.log(questionType);
					}
		
					cloneInput.addEventListener("input", () => {
						// extra info fetched here, to make sure everything is loaded
						if (!(questionType))
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
						console.log("send");
						if (value != '') {
							sendClicks++;

							const ansEval = () => {
								console.log(document.getElementById("wkundo-input").value);
								console.log(document.getElementById("question-type").classList[0]);
								const result = window.answerChecker.evaluate(document.getElementById("question-type").classList[0], document.getElementById("wkundo-input").value).passed;
								console.log(result);
								const div = document.getElementById("wkundo-result");
								div.innerText = result;
							}

							// script to call evaluation function from wanikani
							const script = document.createElement("script");
							script.text = `(${ansEval.toString()})();`;
							script.id = "wkundo-evalScript";
							const oldScript = document.getElementById("wkundo-evalScript");
							if (oldScript) oldScript.remove();
							document.documentElement.appendChild(script);
							
							const evalResult = document.getElementById("wkundo-result").innerText == "false" ? false : true;
							if (evalResult) {
								if (sendClicks == 1) {
									cloneInput.style.backgroundColor = "#88cc00";
									cloneBtn.style.backgroundColor = "#88cc00";
									cloneInput.style.color = "#fff";
									cloneBtn.style.color = "#fff";

									input.value = value;

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
										input.value = value;
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
					}

					cloneBtn.addEventListener("click", sendAction);
		
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
						buttonsWrapper.childNodes.forEach(btn => btn.style.width = (100/buttonsWrapper.childNodes.length)+"%");
					}

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
					});
				}
			}
		}

		const removeExtensionContent = () => {
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

		if (!extensionDisabled) {
			setupExtensionContent();
		}

		document.addEventListener("keydown", e => {
			const key = e.key;

			// if (key !== "Backspace" && e.repeat) return;

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

			if (key == 'x' || key == 'X') {
				const logo = document.getElementById("wkundo-extension-disable");
				let disabled;
				if (!logo.classList.contains("wkundo-disabled") && !document.getElementById("wkundo-input").style.backgroundColor) {
					logo.classList.add("wkundo-disabled");
					disabled = true;
					
					removeExtensionContent();
				}
				else {
					if (logo.classList.contains("wkundo-disabled") && !document.getElementById("user-response").style.backgroundColor) {
						logo.classList.remove("wkundo-disabled");
						disabled = false;

						setupExtensionContent();
					}	
				}
		
				if (disabled) chrome.storage.local.set({"extension-disabled":disabled});
			}
		});
		
	});
})();