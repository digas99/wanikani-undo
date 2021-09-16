'use strict';

(() => {	
	chrome.storage.local.get(["extension-disabled", "auto-show-item-info", "hotkeys"], result => {
		let sendClicks = 0;
		let undo = false;
		
		const extensionDisabled = result["extension-disabled"];
		const autoShowItemInfo = result["auto-show-item-info"];
		const hotkeys = result["hotkeys"] ? result["hotkeys"] : static_hotkeysMap; 

		// get input and button
		const input = document.getElementById("user-response");
		const parent = input.parentElement;
		const btn = parent.getElementsByTagName("BUTTON")[0];
		let questionType = document.getElementById("question-type").classList[0];
		// observe it until question type has the class
		const questionTypeElem = document.getElementById("question-type");
		if (questionTypeElem) {
			new MutationObserver((mutationsList, observer) => {
				mutationsList.forEach(mutation => {
					if (mutation.attributeName == "class") {
						questionType = mutation.target.classList[0];
						const cloneInput = document.getElementById("wkundo-input");
						if (questionType == 'reading') {
							if (cloneInput) {
								cloneInput.placeholder = "答え";
							}
						}
						cloneInput.focus();
						// observer served its purpose, so disconnect it
						observer.disconnect();
					}
				});
			}).observe(questionTypeElem, {attributes:true});
		}

		// element that will receive the result of the answer evaluation
		const ansEvalDiv = document.createElement("div");
		document.documentElement.appendChild(ansEvalDiv);
		ansEvalDiv.style.display = "none";
		ansEvalDiv.id = "wkundo-result";

		// extension disable button
		const stats = document.getElementById("stats");
		if (stats && input && btn) {
			const i = document.createElement("i");
			stats.appendChild(i);
			const logo = document.createElement("img");
			i.appendChild(logo);
			logo.id = "wkundo-extension-disable";
			logo.src = "https://i.imgur.com/NYZNega.png";
			logo.alt = "wkundo";
			if (extensionDisabled) logo.classList.add("wkundo-disabled");
			logo.addEventListener("click", () => {
				let disabled;
				if (parent && !parent.classList.contains("correct") && !parent.classList.contains("incorrect")) {
					if (!logo.classList.contains("wkundo-disabled") && (document.getElementById("wkundo-input") && !document.getElementById("wkundo-input").style.backgroundColor)) {
						logo.classList.add("wkundo-disabled");
						disabled = true;
						
						removeExtensionContent();
					}
					else {
						if (logo.classList.contains("wkundo-disabled") && !input.style.backgroundColor) {
							logo.classList.remove("wkundo-disabled");
							disabled = false;
	
							setupExtensionContent();
						}	
					}
			
					if (disabled !== undefined)
						chrome.storage.local.set({"extension-disabled":disabled});
				}
			});
			
			logo.addEventListener("mouseover", () => {
				const cloneInput = document.getElementById("wkundo-input");
				const input = document.getElementById("user-response");
				const parent = input.parentElement;
				if ((cloneInput && cloneInput.style.backgroundColor)
					|| (input && input.style.backgroundColor)
					|| (parent && (parent.classList.contains("correct") || parent.classList.contains("incorrect"))))
						logo.style.cursor = "not-allowed";
				else logo.style.removeProperty("cursor");
			});
		}

		const resetClones = () => {
			const cInput = document.getElementById("wkundo-input");
			const cBtn = document.getElementById("wkundo-sendButton");
			if (cInput && cBtn) {
				cInput.value = "";
				cInput.style.removeProperty("pointer-events")	
				sendClicks = 0;
				cInput.focus();
				if (parent) parent.classList.remove(parent.classList[0]);
				else document.getElementById("user-response").parentElement.remove(document.getElementById("user-response").classList[0]);
			}
		}


		const submitAction = (wkSubmit) => {
			const cloneInput = document.getElementById("wkundo-input");
			const cloneBtn = document.getElementById("wkundo-sendButton");
			const value = cloneInput.value.toLowerCase();
			cloneInput.blur();
			console.log("input: ", input.value, "senclicks: ", sendClicks);

			if (value == '') cloneInput.focus();

			// if ready to check answer
			if (value != '' && cloneInput && cloneBtn) {
				sendClicks++;

				if (sendClicks == 1) {
					const ansEval = () => {
						const result = window.answerChecker.evaluate(document.getElementById("question-type").classList[0], document.getElementById("wkundo-input").value).passed;
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
						if (parent) parent.classList.add("correct");
						else document.getElementById("user-response").parentElement.classList.add("correct");
						cloneInput.style.pointerEvents = "none";

						input.value = value;

						// play audio
						document.getElementById("option-audio-player").click();

						btn.click();
					}

					if (sendClicks == 2) {
						resetClones();
						questionType = document.getElementById("question-type").classList[0];
						if (!wkSubmit)
							btn.click();
					}					
				}
				// incorrect answer
				else {
					// first send, give the option to undo
					if (sendClicks == 1) {
						document.getElementById("option-undo").classList.remove("disabled");

						if (parent) parent.classList.add("incorrect");
						else document.getElementById("user-response").parentElement.classList.add("incorrect");
						cloneInput.style.pointerEvents = "none";
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

			// auto show item info
			if (autoShowItemInfo) {
				const itemInfo = document.getElementById("option-item-info");
				if (itemInfo && !itemInfo.classList.contains("disabled"))
					itemInfo.dispatchEvent(new MouseEvent("click", {
						"view": window,
						"bubbles": true,
						"cancelable": false
					})); 
			}
		}

		const setupExtensionContent = () => {
			if (!(questionType))
				questionType = document.getElementById("question-type").classList[0];

			if (input && btn) {
				const cloneInput = input.cloneNode();
				cloneInput.id = "wkundo-input";
				if (questionType == 'reading') cloneInput.placeholder = "答え";
				const cloneBtn = document.createElement("div");
				cloneBtn.id = "wkundo-sendButton";
				cloneBtn.style.backgroundColor = input.style.backgroundColor;
				cloneBtn.style.color = input.style.color;
				const cloneBtnChild = btn.childNodes[0].cloneNode();
				cloneBtnChild.style.pointerEvents = "none";
				cloneBtn.appendChild(cloneBtnChild);
	
				cloneInput.addEventListener("input", () => {	
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
	
				cloneBtn.addEventListener("click", () => submitAction(false));

				input.value = "";
				sendClicks = 0;

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
						}
					});
					const i = document.createElement("i");
					span.appendChild(i);
					i.classList.add("icon-undo");
	
					// fix all buttons width
					buttonsWrapper.childNodes.forEach(btn => btn.style.width = (100/buttonsWrapper.childNodes.length)+"%");
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

			input.value = "";
			sendClicks = 0;
		}

		if (!extensionDisabled && input && btn) {
			setupExtensionContent();
		}

		document.addEventListener("keydown", e => {
			const key = e.key;
			console.log(e);

			if (document.getElementById("wkundo-sendButton") && key == 'Enter') {
				console.log("here");
				submitAction(true);
			}

			// force char deleting with backspace
			if (key == "Backspace") {
				// make sure the user is writing in the clone button
				const cloneInput = document.getElementById("wkundo-input");
				if (cloneInput && document.activeElement === cloneInput)
					cloneInput.value = cloneInput.value.slice(0,-1);
			}

			if (key == 'Escape') {
				if (document.getElementById("wkundo-input"))
					document.getElementById("wkundo-input").blur();
				else if (document.getElementById("user-response"))
					document.getElementById("user-response").blur();
			}

			const undoElem = document.getElementById("option-undo");
			if ((key == hotkeys["settings-hotkey-undo-mistake"].toLowerCase() || key == hotkeys["settings-hotkey-undo-mistake"]) &&
				undoElem && !undoElem.classList.contains("disabled")) {
					const optionUndo = document.getElementById("option-undo");
					if (optionUndo) optionUndo.getElementsByTagName("SPAN")[0].dispatchEvent(new MouseEvent("click", {
						"view": window,
						"bubbles": true,
						"cancelable": false
					}));
					undo = true;
			}

			if ((key == hotkeys["settings-hotkey-extension"].toLowerCase() || key == hotkeys["settings-hotkey-extension"]) &&
				!((document.getElementById("wkundo-input") && document.getElementById("wkundo-input") === document.activeElement)
					|| (document.getElementById("user-response") && document.getElementById("user-response") === document.activeElement))) {
						const logo = document.getElementById("wkundo-extension-disable");
						if (logo) logo.dispatchEvent(new MouseEvent("click", {
								"view": window,
								"bubbles": true,
								"cancelable": false
							}));
			}

			if (key == hotkeys["settings-hotkey-item-info"].toLowerCase() || key == hotkeys["settings-hotkey-item-info"]) {
				const itemInfo = document.getElementById("option-item-info");
				if (itemInfo && !itemInfo.classList.contains("disabled"))
					itemInfo.dispatchEvent(new MouseEvent("click", {
						"view": window,
						"bubbles": true,
						"cancelable": false
					})); 
			}
		});
		

		document.addEventListener("keyup", e => {
			const key = e.key;

			if ((key == hotkeys["settings-hotkey-undo-mistake"].toLowerCase() || key == hotkeys["settings-hotkey-undo-mistake"]) && undo) {
				const cloneInput = document.getElementById("wkundo-input");
				if (cloneInput && ([hotkeys["settings-hotkey-undo-mistake"].toLowerCase(), hotkeys["settings-hotkey-undo-mistake"], kana[hotkeys["settings-hotkey-undo-mistake"].toLowerCase()]].includes(cloneInput.value.charAt(0))))
					cloneInput.value = cloneInput.value.slice(1);
				undo = false;
			}
		});
	});
})();