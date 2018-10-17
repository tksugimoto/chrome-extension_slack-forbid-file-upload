chrome.storage.local.get({
	targetDomains: [],
}, ({
	targetDomains,
}) => {
	const isTargetDomain = () => targetDomains.includes(location.host);

	const notifyMessage = message => {
		chrome.runtime.sendMessage({
			method: 'notify-message',
			message,
		});
	};

	const updateCss = () => {
		if (isTargetDomain()) {
			// ファイルアップロードボタンを非表示
			document.body.classList.add(`chrome-extension-${chrome.runtime.id}-enabled`);
		} else {
			document.body.classList.remove(`chrome-extension-${chrome.runtime.id}-enabled`);
		}
	};

	updateCss();

	document.body.addEventListener('paste', evt => {
		if (!isTargetDomain()) return;
		if (evt.clipboardData.files.length) {
			notifyMessage('ファイル paste は禁止されています');
			evt.stopPropagation();
		}
	}, true);

	document.body.addEventListener('dragenter', evt => {
		if (!isTargetDomain()) return;
		if (evt.dataTransfer.types.includes('Files')) {
			evt.stopPropagation();
		}
	}, true);

	document.body.addEventListener('drop', evt => {
		if (!isTargetDomain()) return;
		if (evt.dataTransfer.files.length) {
			notifyMessage('ファイル drop は禁止されています');
			evt.stopPropagation();
			evt.preventDefault();
		}
	}, true);


	document.body.addEventListener('click', evt => {
		if (!isTargetDomain()) return;
		if (evt.path.some(e => e.id === 'primary_file_button')) {
			notifyMessage('ファイル アップロード は禁止されています');
			evt.stopPropagation();
			evt.preventDefault();
		}
	}, true);

	chrome.storage.onChanged.addListener((changes, areaName) => {
		if (areaName !== 'local') return;
		if (!changes.targetDomains) return;
		targetDomains = changes.targetDomains.newValue || [];
		updateCss();
	});
});
