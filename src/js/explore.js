import { getSavedCities, saveCity } from "./storage.js";

const explorePage = document.querySelector(".explore-page");

if (explorePage) {
	const filters = explorePage.querySelectorAll("[data-region-filter]");
	const destinationCards = explorePage.querySelectorAll(".destination-card");
	const savedCities = getSavedCities();

	explorePage.querySelectorAll("[data-city]").forEach((button) => {
		const city = button.dataset.city;
		const isSaved = savedCities.some(
			(savedCity) => savedCity.toLocaleLowerCase() === city.toLocaleLowerCase(),
		);
		if (isSaved) {
			button.textContent = "Go to compare cities";
			button.dataset.saved = "true";
		}
	});

	filters.forEach((filter) => {
		filter.addEventListener("click", () => {
			filters.forEach((button) => {
				const isSelected = button === filter;
				button.classList.toggle("is-active", isSelected);
				button.setAttribute("aria-pressed", String(isSelected));
			});

			destinationCards.forEach((card) => {
				card.hidden = filter.dataset.regionFilter !== "all"
					&& card.dataset.region !== filter.dataset.regionFilter;
			});
		});
	});

	explorePage.querySelectorAll("[data-city]").forEach((button) => {
		button.addEventListener("click", () => {
			if (button.dataset.saved === "true") {
				window.location.assign("/compare-cities.html");
				return;
			}

			const city = button.dataset.city;
			saveCity(city);
			button.textContent = "Go to compare cities";
			button.dataset.saved = "true";
		});
	});
}