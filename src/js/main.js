async function loadTemplate(placeholderSelector, templatePath) {
	const placeholder = document.querySelector(placeholderSelector);
	if (!placeholder) return;

	const response = await fetch(templatePath);
	if (!response.ok) {
		throw new Error(`Failed to load ${templatePath}: ${response.status}`);
	}

	placeholder.innerHTML = await response.text();
}

Promise.all([
	loadTemplate("#header-placeholder", "/header-template.html"),
	loadTemplate("#city-search-placeholder", "/city-search-template.html"),
]).catch((error) => console.error(error));
