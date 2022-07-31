'use strict';

(() => {	
	chrome.storage.local.get([... Object.keys(static_settings), "extension-disabled", "hotkeys"], result => {
		let sendClicks = 0;
		let undo = false;
		
		const extensionDisabled = result["extension-disabled"];
		const autoShowItemInfo = result["auto-show-item-info"] !== undefined ? result["auto-show-item-info"] : static_settings["auto-show-item-info"];
		const cloneInputMark = result["clone-input-mark"] !== undefined ? result["clone-input-mark"] : static_settings["clone-input-mark"];
		const skipAnswer = result["skip-answer"] !== undefined ? result["skip-answer"] : static_settings["skip-answer"];
		const hotkeys = result["hotkeys"] !== undefined ? result["hotkeys"] : static_hotkeysMap;
		const skipAnswerDelay = 1500;

		// get input and button
		let input = document.getElementById("user-response");
		const parent = input.parentElement;
		const btn = parent.getElementsByTagName("BUTTON")[0];
		let cloneParent;
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
						if (cloneInput) cloneInput.focus();
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
				const thisParent = cloneParent ? cloneParent : parent;
				if (thisParent && !["correct" ,"incorrect"].some(className => thisParent.classList.contains(className))) {
					if (!logo.classList.contains("wkundo-disabled")) {
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
				const thisParent = cloneParent ? cloneParent : parent;
				if (thisParent && ["correct" ,"incorrect"].some(className => thisParent.classList.contains(className)))
						logo.style.cursor = "not-allowed";
				else logo.style.removeProperty("cursor");
			});
		}

		const resetClones = () => {
			const cInput = document.getElementById("wkundo-input");
			const cBtn = document.getElementById("wkundo-sendButton");
			if (cInput && cBtn) {
				// reset send clicks
				sendClicks = 0;
				cInput.value = "";
				cInput.style.removeProperty("pointer-events")	
				cInput.focus();
				if (cloneParent) cloneParent.classList.remove(cloneParent.classList[0]);
				else document.getElementById("user-response").parentElement.remove(document.getElementById("user-response").classList[0]);
				// update question type and placeholder
				questionType = document.getElementById("question-type").classList[0];
				cInput.placeholder = questionType == 'reading' ? "答え" : "Your Response";
				// remove hidden text if it is the case
				cInput.classList.remove("wkundo-hide-text");
				// reset wkundo result
				document.getElementById("wkundo-result").innerText = '';
			}

			// activate skip button
			console.log("skip activated");
			setTimeout(() => {
				const skipBtn = document.getElementById("option-skip");
				if (skipBtn) skipBtn.classList.remove("disabled");
			}, skipAnswerDelay);
		}


		const submitAction = (wkSubmit) => {
			const cloneInput = document.getElementById("wkundo-input");
			const cloneBtn = document.getElementById("wkundo-sendButton");
			let value = cloneInput.value.toLowerCase();
			cloneInput.blur();

			console.log("input: ", input.value, "senclicks: ", sendClicks);

			if (value == '') cloneInput.focus();

			// if ready to check answer
			if (value != '' && cloneInput && cloneBtn) {
				console.log("here");
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

				if (sendClicks > 0) {
					const skipBtn = document.getElementById("option-skip");
					if (skipBtn) skipBtn.classList.add("disabled");
				}
				
				// correct answer
				if (document.getElementById("wkundo-result").innerText == "true") {
					if (sendClicks == 1) {
						if (cloneParent) cloneParent.classList.add("correct");
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
					// check if there is any non kana character in user's input
					if (questionType == 'reading') {
						for (let c of value) {
							if (!Object.values(kana).includes(c)) {
								sendClicks = 0;
								cloneInput.focus();
								return;
							}
						}
					}

					console.log(sendClicks, value);

					// first send, give the option to undo
					if (sendClicks == 1) {
						document.getElementById("option-undo").classList.remove("disabled");

						if (cloneParent) cloneParent.classList.add("incorrect");
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
							cloneInput.style.pointerEvents = "none";
							btn.click();
							
													
							// check for answer exception
							setTimeout(() => {
								if (document.getElementById("answer-exception"))
									document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Enter'})); // click enter to advance
							}, 500);
						}

						// if user clicked 3 times while wrong, then reset styles for the next review
						if (sendClicks == 3) {
							resetClones();
							questionType = document.getElementById("question-type").classList[0];
							if (!wkSubmit)
								btn.click();
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
			questionType = document.getElementById("question-type").classList[0];

			const answerForm = document.getElementById("answer-form");
			if (input && btn && answerForm) {
				const cloneForm = document.createElement("form");
				answerForm.appendChild(cloneForm);
				const cloneFieldset = document.createElement("fieldset");
				cloneParent = cloneFieldset;
				cloneForm.appendChild(cloneFieldset);
				const cloneInput = input.cloneNode();
				cloneInput.id = "wkundo-input";
				if (cloneInputMark) cloneInput.style.borderLeft = "8px solid #4eabf9";
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
					if (questionType == "reading")
						cloneInput.value = convertToKana(cloneInput.value);
				});
	
				cloneBtn.addEventListener("click", () => document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Enter'})));

				input.value = "";
				sendClicks = 0;

				if (answerForm.children.length >= 2) {
					// hide original elements
					answerForm.children[0].style.display = "none";

					// add clones
					cloneFieldset.appendChild(cloneInput);
					cloneFieldset.appendChild(cloneBtn);
				}

				// additional buttons
				const buttonsWrapper = document.getElementById("additional-content").getElementsByTagName("UL")[0];
				if (buttonsWrapper) {
					buttonsWrapper.style.textAlign = "center";
	
					// add undo button
					const undoLi = document.createElement("li");
					buttonsWrapper.appendChild(undoLi);
					undoLi.classList.add("disabled");
					undoLi.id = "option-undo";
					const undoSpan = document.createElement("span");
					undoLi.appendChild(undoSpan);
					undoSpan.title = "Undo";
					// event listener to undo button
					undoSpan.addEventListener("click", () => {
						if (!undoLi.classList.contains("disabled") && sendClicks == 1) {
							resetClones();
							undoLi.classList.add("disabled");
						}
					});
					const undoI = document.createElement("i");
					undoSpan.appendChild(undoI);
					undoI.classList.add("wkundo-icon", "wkundo-icon-undo");
	
					// add skip button
					if (skipAnswer) {
						const skipLi = document.createElement("li");
						buttonsWrapper.appendChild(skipLi);
						skipLi.classList.add("disabled");
						skipLi.id = "option-skip";
						const skipSpan = document.createElement("span");
						skipLi.appendChild(skipSpan);
						skipSpan.title = "Don't Know";
						// event listener to skip button
						skipSpan.addEventListener("click", () => {
							if (!skipLi.classList.contains("disabled") && sendClicks == 0) {
								// put dummy wrong value in input
								cloneInput.value = questionType == 'reading' ? 'っ' : ' ';
								sendClicks = 1;
								console.log(cloneInput);
								console.log(cloneInput.value);
								if (document.getElementById("wkundo-sendButton")) {
									document.getElementById("wkundo-sendButton").click();
									cloneInput.classList.add("wkundo-hide-text");
								}
							}
						});
						const skipI = document.createElement("i");
						skipSpan.appendChild(skipI);
						skipI.classList.add("wkundo-icon", "wkundo-icon-skip");					
						
						// activate skip button
						setTimeout(() => skipLi.classList.remove("disabled"), skipAnswerDelay);
					}
					
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
			
			const answerForm = document.getElementById("answer-form");
			if (answerForm && answerForm.children.length >= 2) {
				// remove clones
				answerForm.children[1].remove();

				// display original
				answerForm.children[0].style.removeProperty("display");
			}

			input.value = "";
			sendClicks = 0;
		}

		if (!extensionDisabled && input && btn) {
			setupExtensionContent();
		}

		document.addEventListener("keydown", e => {
			const key = e.key;
			// console.log(e);

			if (document.getElementById("wkundo-sendButton") && key == 'Enter')
				submitAction(true);

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

			if (key == 'Space') {
				if (document.getElementById("wkundo-input"))
					document.getElementById("wkundo-input").focus();
				else if (document.getElementById("user-response"))
					document.getElementById("user-response").focus();
			}

			if (skipAnswer) {
				const cloneInput = document.getElementById("wkundo-input");
				if (key == 'Enter' && cloneInput && cloneInput.value == '') {
					const skipBtn = document.getElementById("option-skip");
					if (skipBtn) skipBtn.firstChild.click();
				}
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
