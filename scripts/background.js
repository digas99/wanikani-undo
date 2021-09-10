let fetched = false;

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
		});
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
	// if user is at reviews
	if (tabInfo.url == "https://www.wanikani.com/review/session" || tabInfo.url == "https://www.wanikani.com/review") {
		if (!fetched) {
			// fetch all subject data
			["radical", "kanji", "vocabulary"].forEach(type => {
				chrome.storage.local.get(["last"+type+"update", "api_key"], result => {
					const apiKey = result["api_key"];
					if (apiKey) {
						const date = result["last"+type+"update"];
						const page = "https://api.wanikani.com/v2/subjects?types="+type;
						if (date) {
							modifiedSince(apiKey, date, page)
								.then(modified => {
									if (modified) {
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
							fetchAllPages(apiKey, page)
								.then(data => {
									saveSubjectInfo(data, type[0]);
									chrome.storage.local.set({["last_"+type+"_update"]:formatDate(new Date())});
								})
								.catch(errorHandling);
						}	
					}
				});
			});

			fetched = true;
		}
	}
});