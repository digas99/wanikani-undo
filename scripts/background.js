let fetched = false;

const saveSubjectInfo = data => {
	data.map(content => content.data)
		.flat(1)
		.map(content => content.data)
		.forEach(subject => {
			chrome.storage.local.set(
				{[subject.characters]:{
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
				chrome.storage.local.get(["last"+type+"update"], result => {
					const date = result["last"+type+"update"];
					const page = "https://api.wanikani.com/v2/subjects?types="+type;
					if (date) {
						modifiedSince(apiKey, date, page)
							.then(modified => {
								if (modified) {
									fetchAllPages(apiKey, page)
										.then(data => {
											saveSubjectInfo(data);
											chrome.storage.local.set({["last_"+type+"_update"]:formatDate(new Date())});
										})
										.catch(errorHandling);
								}
							})
							.catch(errorHandling);
					}
					else {
						fetchAllPages(apiKey, page)
							.then(data => {
								saveSubjectInfo(data);
								chrome.storage.local.set({["last_"+type+"_update"]:formatDate(new Date())});
							})
							.catch(errorHandling);
					}
				});
			});

			fetched = true;
		}
	}
});