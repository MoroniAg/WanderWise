import { getSavedCities, removeSavedCity } from "./storage.js";

const savedCityList = document.querySelector("#saved-city-list");

if (savedCityList) {
	function createSavedCityRow(city) {
		const row = document.createElement("article");
		row.className = "saved-city-row";

		const cityName = document.createElement("h2");
		cityName.className = "saved-city-name";
		cityName.textContent = city;

		const form = document.createElement("form");
		form.className = "saved-city-form";

		const label = document.createElement("label");
		label.className = "search-field";

		const labelText = document.createElement("span");
		labelText.className = "field-label";
		labelText.textContent = `Compare ${city} with`;

		const input = document.createElement("input");
		input.type = "text";
		input.name = "secondCity";
		input.placeholder = "Enter another city";
		input.autocomplete = "off";
		input.required = true;
		input.setAttribute("aria-label", `Second city to compare with ${city}`);
		input.addEventListener("input", () => input.setCustomValidity(""));

		label.append(labelText, input);

		const compareButton = document.createElement("button");
		compareButton.className = "search-button";
		compareButton.type = "submit";
		compareButton.textContent = "Compare";

		form.addEventListener("submit", (event) => {
			event.preventDefault();
			const secondCity = input.value.trim();
			if (secondCity.toLocaleLowerCase() === city.toLocaleLowerCase()) {
				input.setCustomValidity("Choose a different city to compare.");
				input.reportValidity();
				return;
			}

			const params = new URLSearchParams({ city1: city, city2: secondCity });
			window.location.assign(`/city-results.html?${params.toString()}`);
		});

		form.append(label, compareButton);

		const removeButton = document.createElement("button");
		removeButton.className = "remove-saved-city";
		removeButton.type = "button";
		removeButton.textContent = "Remove";
		removeButton.setAttribute("aria-label", `Remove ${city} from saved cities`);
		removeButton.addEventListener("click", () => {
			removeSavedCity(city);
			renderSavedCities();
		});

		row.append(cityName, form, removeButton);
		return row;
	}

	function renderSavedCities() {
		const cities = getSavedCities();
		savedCityList.replaceChildren();

		if (!cities.length) {
			const emptyState = document.createElement("div");
			emptyState.className = "saved-cities-empty";
			const message = document.createElement("p");
			message.textContent = "No saved cities yet.";
			const exploreLink = document.createElement("a");
			exploreLink.href = "/explore.html";
			exploreLink.textContent = "Explore destinations";
			emptyState.append(message, exploreLink);
			savedCityList.append(emptyState);
			return;
		}

		cities.forEach((city) => savedCityList.append(createSavedCityRow(city)));
	}

	renderSavedCities();
}