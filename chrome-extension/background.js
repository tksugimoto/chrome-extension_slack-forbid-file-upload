
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


const ContextMenusId = {
	REGISTRATION: 'registration',
	DEREGISTRATION: 'deregistration',
};

const updateContextMenu = (currentTargetDomains) => {
	chrome.contextMenus.removeAll(() => {
		chrome.contextMenus.create({
			id: ContextMenusId.REGISTRATION,
			title: 'このSlackへのファイルアップロードを禁止する',
			documentUrlPatterns: [
				'*://*.slack.com/*',
			],
		});
		chrome.contextMenus.create({
			id: ContextMenusId.DEREGISTRATION,
			title: 'このSlackへのファイルアップロード禁止を解除する',
			documentUrlPatterns: currentTargetDomains.concat('dummy').map(domain => `*://${domain}/*`),
		});
	});
};

chrome.contextMenus.onClicked.addListener(info => {
	const url = new URL(info.pageUrl);
	if (info.menuItemId === ContextMenusId.REGISTRATION) {
		TargetDomains.add(url.host).then(updateContextMenu);
		return;
	}
	if (info.menuItemId === ContextMenusId.DEREGISTRATION) {
		TargetDomains.remove(url.host).then(updateContextMenu);
		return;
	}
});

const TargetDomains = (() => {
	let promise = Promise.resolve();
	const key = 'targetDomains';
	const load = () => {
		return promise = promise.then(() => {
			return new Promise(resolve => {
				chrome.storage.local.get({
					[key]: [],
				}, items => {
					resolve(items[key]);
				});
			});
		});
	};
	const add = domain => {
		return promise = load().then(targetDomains => {
			const newTargetDomains = targetDomains.filter(d => d !== domain).concat(domain);
			return new Promise(resolve => {
				chrome.storage.local.set({
					[key]: newTargetDomains,
				}, () => {
					resolve(newTargetDomains);
				});
			});
		});
	};
	const remove = domain => {
		return promise = load().then(targetDomains => {
			const newTargetDomains = targetDomains.filter(d => d !== domain);
			return new Promise(resolve => {
				chrome.storage.local.set({
					[key]: newTargetDomains,
				}, () => {
					resolve(newTargetDomains);
				});
			});
		});
	};
	return {
		load,
		add,
		remove,
	};
})();

TargetDomains.load().then(updateContextMenu);
