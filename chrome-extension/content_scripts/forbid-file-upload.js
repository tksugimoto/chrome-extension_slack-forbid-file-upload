chrome.storage.local.get({
	allowedDomains: [],
}, ({
	allowedDomains,
}) => {
	const isAllowedDomain = () => allowedDomains.includes(location.host);

	const notifyMessage = message => {
		chrome.runtime.sendMessage({
			method: 'notify-message',
			message,
		});
	};

	const updateCss = () => {
		if (!isAllowedDomain()) {
			// ファイルアップロードボタンを非表示
			document.body.classList.add(`chrome-extension-${chrome.runtime.id}-enabled`);
		} else {
			document.body.classList.remove(`chrome-extension-${chrome.runtime.id}-enabled`);
		}
	};

	updateCss();

	document.body.addEventListener('paste', evt => {
		if (isAllowedDomain()) return;
		if (evt.clipboardData.types.includes('text/plain')) return;
		if (evt.clipboardData.files.length) {
			notifyMessage('ファイル paste は禁止されています');
			evt.stopPropagation();
			evt.preventDefault();
		}
	}, true);

	document.body.addEventListener('dragenter', evt => {
		if (isAllowedDomain()) return;
		if (evt.dataTransfer.types.includes('Files')) {
			evt.stopPropagation();
		}
	}, true);

	document.body.addEventListener('drop', evt => {
		if (isAllowedDomain()) return;
		if (evt.dataTransfer.files.length) {
			notifyMessage('ファイル drop は禁止されています');
			evt.stopPropagation();
			evt.preventDefault();
		}
	}, true);


	document.body.addEventListener('click', evt => {
		if (isAllowedDomain()) return;
		if (evt.path.some(e => e.id === 'primary_file_button')) {
			notifyMessage('ファイル アップロード は禁止されています');
			evt.stopPropagation();
			evt.preventDefault();
		}
	}, true);

	chrome.storage.onChanged.addListener((changes, areaName) => {
		if (areaName !== 'local') return;
		if (!changes.allowedDomains) return;
		allowedDomains = changes.allowedDomains.newValue || [];
		updateCss();
	});
});
