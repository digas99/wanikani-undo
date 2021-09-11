let checked = false;
let fetched = false;
console.log("new script");

const saveSubjectInfo = (data, prefix) => {
	data.map(content => content.data)
		.flat(1)
		.map(content => content.data)
		.forEach(subject => {
			chrome.storage.local.set(
				{[prefix+subject.characters]:{
					"meanings":subject.meanings,
					"readings":subject.readings
				}}
			);
			console.log("saving");
		});
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
	// if user is at reviews
	if (tabInfo.url == "https://www.wanikani.com/review/session" || tabInfo.url == "https://www.wanikani.com/review") {
		console.log("again ", checked, fetched);
		console.log(tabId);
		chrome.tabs.sendMessage(tabId, {fetchData:fetched});
		if (!checked) {
			chrome.storage.local.get(["api_key", "extension-disabled"], info => {
				const apiKey = info["api_key"];
				if (apiKey && !checked) {
					checked = true;

					const extensionDisabled = info["extension-disabled"];
					if (!extensionDisabled)
						chrome.storage.local.set({"extension-disabled":false});
					
					// fetch all subject data
					["radical", "kanji", "vocabulary"].forEach(type => {
						chrome.storage.local.get(["last_"+type+"_update"], result => {
							const date = result["last_"+type+"_update"];
							const page = "https://api.wanikani.com/v2/subjects?types="+type;
							if (date) {
								modifiedSince(apiKey, date, page)
									.then(modified => {
										if (modified) {
											fetched = true;
											console.log("modiefied; fetching...");
											fetchAllPages(apiKey, page)
												.then(data => {
													saveSubjectInfo(data, type[0]);
													chrome.storage.local.set({["last_"+type+"_update"]:formatDate(new Date())});
												})
												.catch(errorHandling);
										}
									})
									.catch(errorHandling);
							}
							else {
								console.log("no data; fetching...");
								fetched = true;
								fetchAllPages(apiKey, page)
									.then(data => {
										saveSubjectInfo(data, type[0]);
										chrome.storage.local.set({["last_"+type+"_update"]:formatDate(new Date())});
									})
									.catch(errorHandling);
							}	
						});
					});
				}
			});
		}
	}
});