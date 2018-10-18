const AllowedDomains = (() => {
	let promise = Promise.resolve();
	const key = 'allowedDomains';
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
		return promise = load().then(allowedDomains => {
			const newAllowedDomains = allowedDomains.filter(d => d !== domain).concat(domain);
			return new Promise(resolve => {
				chrome.storage.local.set({
					[key]: newAllowedDomains,
				}, () => {
					resolve(newAllowedDomains);
				});
			});
		});
	};
	const remove = domain => {
		return promise = load().then(allowedDomains => {
			const newAllowedDomains = allowedDomains.filter(d => d !== domain);
			return new Promise(resolve => {
				chrome.storage.local.set({
					[key]: newAllowedDomains,
				}, () => {
					resolve(newAllowedDomains);
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

chrome.tabs.query({
	active: true,
	currentWindow: true,
}, tabs => {
	const currentTab = tabs[0];
	const currentDomain = new URL(currentTab.url).host;
	document.getElementById('domain').innerText = currentDomain;

	const allowCheckbox = document.getElementById('allow-checkbox');

	allowCheckbox.addEventListener('change', evt => {
		if (evt.target.checked) {
			AllowedDomains.add(currentDomain);
		} else {
			AllowedDomains.remove(currentDomain);
		}
	});

	const updateCheckboxStatus = allowedDomains => {
		allowCheckbox.checked = allowedDomains.includes(currentDomain);
	};

	const whiteListContainer = document.getElementById('white-list-container');

	const updateWhiteList = allowedDomains => {
		whiteListContainer.innerText = '';
		if (!allowedDomains.length) {
			const li = document.createElement('li');
			li.append('(なし)');
			whiteListContainer.append(li);
			return;
		}
		allowedDomains.forEach(allowedDomain => {
			const li = document.createElement('li');
			li.append(allowedDomain);
			whiteListContainer.append(li);
		});
	};

	AllowedDomains.load().then(allowedDomains => {
		updateCheckboxStatus(allowedDomains);
		updateWhiteList(allowedDomains);
	});

	chrome.storage.onChanged.addListener((changes, areaName) => {
		if (areaName !== 'local') return;
		if (!changes.allowedDomains) return;
		const allowedDomains = changes.allowedDomains.newValue || [];
		updateCheckboxStatus(allowedDomains);
		updateWhiteList(allowedDomains);
	});
});
