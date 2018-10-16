const notifyMessage = message => {
	chrome.runtime.sendMessage({
		method: 'notify-message',
		message,
	});
};

document.body.addEventListener('paste', evt => {
	if (evt.clipboardData.files.length) {
		notifyMessage('ファイル paste は禁止されています');
		evt.stopPropagation();
	}
}, true);

document.body.addEventListener('drop', evt => {
	if (evt.dataTransfer.files.length) {
		notifyMessage('ファイル drop は禁止されています');
		evt.stopPropagation();
		evt.preventDefault();
	}
}, true);


document.body.addEventListener('click', evt => {
	if (evt.path.some(e => e.id === 'primary_file_button')) {
		notifyMessage('ファイル アップロード は禁止されています');
		evt.stopPropagation();
		evt.preventDefault();
	}
}, true);
