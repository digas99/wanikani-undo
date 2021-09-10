'use strict';

(() => {		
	let questionType, character;
	let sendClicks = 0;

	// get input and button
	const input = document.getElementById("user-response");
	if (input) {
		const parent = input.parentElement;
		const btn = parent.getElementsByTagName("BUTTON")[0];
		if (btn) {
			const cloneInput = input.cloneNode();
			const cloneBtn = btn.cloneNode();
			const cloneBtnChild = btn.childNodes[0].cloneNode();

			const resetClones = () => {
				cloneInput.style.backgroundColor = "#fff";
				cloneInput.style.color = "black";
				cloneInput.value = "";
				cloneInput.style.pointerEvents = "all";
				cloneBtn.style.backgroundColor = "#fff";
				cloneBtn.style.color = "black";
				sendClicks = 0;
			}

			cloneInput.addEventListener("input", () => {
				if (!(questionType && character)) {
					// extra info fetched here, to make sure everything is loaded
					questionType = document.getElementById("question-type").classList[0];
					character = document.getElementById("character").getElementsByTagName("SPAN")[0].innerText;
				}

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
				sendClicks++;

				const value = cloneInput.value;
				// if ready to check answer
				if (value != '' && questionType && character) {
					chrome.storage.local.get([character], result => {
						const subjectInfo = result[character];
						console.log(subjectInfo);
						if (subjectInfo) {
							const mapInfo = type => {
								return subjectInfo[type+"s"]
									.filter(data => data["accepted_answer"])
									.map(data => data[type]);
							}

							const info = mapInfo(questionType);
							if (questionType == "reading") {
								// correct reading
								if (info.includes(value)) {
									cloneInput.style.backgroundColor = "#88cc00";
									cloneBtn.style.backgroundColor = "#88cc00";
									cloneInput.style.color = "#fff";
									cloneBtn.style.color = "#fff";
									// put user answer in the real input
									if (sendClicks == 1) input.value = value;

									// if user clicked 2 times while correct then reset styles for the next review
									if (sendClicks == 2)
										resetClones();

									btn.click();
								}
								// incorrect reading
								else {
									// if user confirms that answer is wrong
									if (sendClicks > 1) {
										// put user answer in the real input and click real button
										if (sendClicks == 2) {
											input.value = value;
											// prevent user from going back
											document.getElementById("option-undo").classList.add("disabled");
										}
										btn.click();
									}
									else {
										document.getElementById("option-undo").classList.remove("disabled");
	
										cloneInput.style.backgroundColor = "#f03";
										cloneInput.style.pointerEvents = "none";
										cloneInput.blur();
										cloneBtn.style.backgroundColor = "#f03";
										cloneInput.style.color = "#fff";
										cloneBtn.style.color = "#fff";
									}
								}

								// if user clicked 3 times while wrong then reset styles for the next review
								if (sendClicks == 3)
									resetClones();
							}
							else {

							}
						}
					});
				}
			}

			cloneBtn.addEventListener("click", sendAction);

			// update info in clones
			cloneInput.removeAttribute('id');
			cloneInput.removeAttribute('name');

			// add clones
			parent.appendChild(cloneInput);
			parent.appendChild(cloneBtn);
			cloneBtn.appendChild(cloneBtnChild);

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
						cloneInput.focus();
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
})();