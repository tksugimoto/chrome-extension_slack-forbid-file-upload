document.body.addEventListener('paste', evt => {
	if (evt.clipboardData.files.length) {
		evt.stopPropagation();
	}
}, true);

document.body.addEventListener('drop', evt => {
	if (evt.dataTransfer.files.length) {
		evt.stopPropagation();
		evt.preventDefault();
	}
}, true);


document.body.addEventListener('click', evt => {
	if (evt.path.some(e => e.id === 'primary_file_button')) {
		evt.stopPropagation();
		evt.preventDefault();
	}
}, true);
