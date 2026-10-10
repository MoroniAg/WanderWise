const SAVED_CITIES_KEY = "wanderwise-saved-cities";

export function getSavedCities() {
	try {
		const savedCities = JSON.parse(localStorage.getItem(SAVED_CITIES_KEY) || "[]");
		return Array.isArray(savedCities)
			? savedCities.filter((city) => typeof city === "string" && city.trim())
			: [];
	} catch {
		return [];
	}
}

export function saveCity(city) {
	const normalizedCity = city.trim();
	const savedCities = getSavedCities();
	const alreadySaved = savedCities.some(
		(savedCity) => savedCity.toLocaleLowerCase() === normalizedCity.toLocaleLowerCase(),
	);

	if (!alreadySaved) {
		savedCities.push(normalizedCity);
		localStorage.setItem(SAVED_CITIES_KEY, JSON.stringify(savedCities));
	}

	return savedCities;
}

export function removeSavedCity(city) {
	const savedCities = getSavedCities().filter(
		(savedCity) => savedCity.toLocaleLowerCase() !== city.toLocaleLowerCase(),
	);
	localStorage.setItem(SAVED_CITIES_KEY, JSON.stringify(savedCities));
	return savedCities;
}
