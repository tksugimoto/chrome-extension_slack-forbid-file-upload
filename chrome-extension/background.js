
chrome.runtime.onInstalled.addListener(details => {
	if (details.reason !== 'install') return;
	// インストール時に既存のタブで実行する
	chrome.tabs.query({
		url: '*://*.slack.com/*',
	}, tabs => {
		tabs.forEach(tab => {
			chrome.tabs.insertCSS(tab.id, {
				file: 'css/change-file-button-cursor.css',
			});
			chrome.tabs.executeScript(tab.id, {
				file: 'content_scripts/forbid-file-upload.js',
			});
		});
	});
});

chrome.runtime.onMessage.addListener((message) => {
	if (message.method === 'notify-message') {
		chrome.notifications.create({
			type: 'basic',
			iconUrl: '/icon/attention-icon128.png',
			title: 'Slackファイルアップロード禁止',
			message: message.message,
		});
	}
});

chrome.runtime.onInstalled.addListener(() => {
	chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
		chrome.declarativeContent.onPageChanged.addRules([
			{
				conditions: [
					new chrome.declarativeContent.PageStateMatcher({
						pageUrl: {
							hostSuffix: '.slack.com',
						},
					}),
				],
				actions: [
					new chrome.declarativeContent.ShowPageAction(),
				],
			},
		]);
	});
});
