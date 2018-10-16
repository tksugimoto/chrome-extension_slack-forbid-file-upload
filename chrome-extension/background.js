
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
