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

chrome.tabs.query({
	active: true,
	currentWindow: true,
}, tabs => {
	const currentTab = tabs[0];
	const currentDomain = new URL(currentTab.url).host;
	document.getElementById('domain').innerText = currentDomain;

	const forbidCheckbox = document.getElementById('forbid-checkbox');

	forbidCheckbox.addEventListener('change', evt => {
		if (evt.target.checked) {
			TargetDomains.add(currentDomain);
		} else {
			TargetDomains.remove(currentDomain);
		}
	});

	const updateCheckboxStatus = targetDomains => {
		forbidCheckbox.checked = targetDomains.includes(currentDomain);
	};

	TargetDomains.load().then(updateCheckboxStatus);

	chrome.storage.onChanged.addListener((changes, areaName) => {
		if (areaName !== 'local') return;
		if (!changes.targetDomains) return;
		updateCheckboxStatus(changes.targetDomains.newValue || []);
	});
});
