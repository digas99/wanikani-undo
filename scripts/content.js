'use strict';

(() => {	
	chrome.storage.local.get(["extension-disabled"], result => {
		let sendClicks = 0;
		
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
		
				console.log(disabled);
				if (disabled !== undefined)
					chrome.storage.local.set({"extension-disabled":disabled});
			});
			
			logo.addEventListener("mouseover", () => {
				if ((document.getElementById("wkundo-input") && document.getElementById("wkundo-input").style.backgroundColor)
					|| (document.getElementById("user-response") && document.getElementById("user-response").style.backgroundColor)) logo.style.cursor = "not-allowed";
				else logo.style.removeProperty("cursor");
			});
		}

		const resetClones = () => {
			const cInput = document.getElementById("wkundo-input");
			const cBtn = document.getElementById("wkundo-sendButton");
			if (cInput && cBtn) {
				cInput.style.removeProperty("background-color");
				cInput.style.removeProperty("color");
				cInput.value = "";
				cInput.style.removeProperty("pointer-events")
				cBtn.style.removeProperty("background-color");
				cBtn.style.removeProperty("color");
				sendClicks = 0;
				cInput.focus();
			}
		}

		const setupExtensionContent = () => {
			let questionType;

			// get input and button
			const input = document.getElementById("user-response");
			if (input) {
				const parent = input.parentElement;
				const btn = parent.getElementsByTagName("BUTTON")[0];
				if (btn) {
					const cloneInput = input.cloneNode();
					cloneInput.id = "wkundo-input";
					const cloneBtn = document.createElement("div");
					cloneBtn.id = "wkundo-sendButton";
					cloneBtn.style.backgroundColor = input.style.backgroundColor;
					cloneBtn.style.color = input.style.color;
					const cloneBtnChild = btn.childNodes[0].cloneNode();
					cloneBtnChild.style.pointerEvents = "none";
					cloneBtn.appendChild(cloneBtnChild);
		
					cloneInput.addEventListener("input", () => {
						// extra info fetched here, to make sure everything is loaded
						if (!(questionType))
							questionType = document.getElementById("question-type").classList[0];
		
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

					const submitAction = (wkSubmit) => {
						const value = cloneInput.value.toLowerCase();
						// if ready to check answer
						console.log("send");
						if (value != '') {
							sendClicks++;

							if (sendClicks == 1) {
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
							}
							
							// correct answer
							if (document.getElementById("wkundo-result").innerText !== "false") {
								if (sendClicks == 1) {
									cloneInput.style.backgroundColor = "#88cc00";
									cloneBtn.style.backgroundColor = "#88cc00";
									cloneInput.style.color = "#fff";
									cloneBtn.style.color = "#fff";
									cloneInput.style.pointerEvents = "none";

									input.value = value;

									// play audio
									document.getElementById("option-audio-player").click();

									btn.click();
								}

								cloneInput.blur();

								if (sendClicks == 2) {
									resetClones();
									questionType = document.getElementById("question-type").classList[0];
									if (!wkSubmit)
										btn.click();
								}					
							}
							// incorrect answer
							else {
								cloneInput.blur();

								// first send, give the option to undo
								if (sendClicks == 1) {
									document.getElementById("option-undo").classList.remove("disabled");

									cloneInput.style.backgroundColor = "#f03";
									cloneInput.style.pointerEvents = "none";
									cloneInput.style.color = "#fff";
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
										questionType = document.getElementById("question-type").classList[0];
									}
								}
							}
						}
					}
		
					cloneBtn.addEventListener("click", () => submitAction(false));
		
					cloneInput.name = "";

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
								//setTimeout(() => cloneInput.focus(), 200);
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

						if (document.getElementById("wkundo-sendButton") && key == 'Enter')
							submitAction(true);
							
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
			const undoSend = document.getElementById("wkundo-sendButton");
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

			if (key == 'u' || key == 'U') {
				var clickEvent = new MouseEvent("click", {
					"view": window,
					"bubbles": true,
					"cancelable": false
				});
				const optionUndo = document.getElementById("option-undo");
				if (optionUndo) 
					optionUndo.getElementsByTagName("SPAN")[0].dispatchEvent(clickEvent);
			}

			if ((key == 'x' || key == 'X') &&
				!((document.getElementById("wkundo-input") && document.getElementById("wkundo-input") === document.activeElement)
				|| (document.getElementById("user-response") && document.getElementById("user-response") === document.activeElement))) {
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
			
					if (disabled !== undefined) chrome.storage.local.set({"extension-disabled":disabled});
			}
		});
		
	});
})();