'use strict';

(() => {			
	// get input and button
	const input = document.getElementById("user-response");
	if (input) {
		const parent = input.parentElement;
		const btn = parent.getElementsByTagName("BUTTON")[0];
		if (btn) {
			const cloneInput = input.cloneNode();
			const cloneBtn = btn.cloneNode();
			const cloneBtnChild = btn.childNodes[0].cloneNode();

			// update info in clones
			cloneInput.removeAttribute('id');
			cloneInput.removeAttribute('name');
			cloneInput.style.borderBottom = "4px solid #41b9c5";
			cloneBtn.style.borderBottom = "4px solid #41b9c5";

			// add clones
			parent.appendChild(cloneInput);
			parent.appendChild(cloneBtn);
			cloneBtn.appendChild(cloneBtnChild);

			// hide original elements
			input.style.display = "none";
			btn.style.display = "none";
		}
	}

	// additional button
	const buttonsWrapper = document.getElementById("additional-content").getElementsByTagName("UL")[0];
	if (buttonsWrapper) {
		buttonsWrapper.style.textAlign = "center";

		// add undo button
		const li = document.createElement("li");
		buttonsWrapper.appendChild(li);
		li.classList.add("disabled");
		const span = document.createElement("span");
		li.appendChild(span);
		span.title = "Undo";
		const i = document.createElement("i");
		span.appendChild(i);
		i.classList.add("icon-undo");

		// fix all buttons width
		buttonsWrapper.childNodes.forEach(btn => btn.style.width = "16%");
	}
})();