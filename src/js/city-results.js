import { getCurrentWeather } from "./weatherApi.js";

const resultsPage = document.querySelector("#city-results");

if (resultsPage) {
	const params = new URLSearchParams(window.location.search);
	const cities = [params.get("city1")?.trim(), params.get("city2")?.trim()];
	const comparisonMessage = resultsPage.querySelector("[data-comparison-message]");

	if (cities.some((city) => !city)) {
		comparisonMessage.textContent = "Enter two cities to compare their conditions.";
	} else {
		resultsPage.querySelector("[data-city-one]").textContent = cities[0];
		resultsPage.querySelector("[data-city-two]").textContent = cities[1];
		comparisonMessage.textContent = `Comparing ${cities[0]} and ${cities[1]}.`;

		const getWeatherForCity = async (city) => {
			try {
				return await getCurrentWeather(city);
			} catch (error) {
				const message = error instanceof Error ? error.message : "An unexpected error occurred.";
				return { error: `Weather for ${city} could not be loaded: ${message}` };
			}
		};

		const createDetailGroup = (title, entries, iconUrl, iconDescription) => {
			const group = document.createElement("section");
			group.className = "weather-detail-group";

			const heading = document.createElement("h3");
			heading.textContent = title;
			if (iconUrl) {
				const icon = document.createElement("img");
				icon.className = "weather-detail-icon";
				icon.src = iconUrl;
				icon.alt = iconDescription || "";
				icon.loading = "lazy";
				heading.append(icon);
			}
			group.append(heading);

			const list = document.createElement("dl");
			for (const [label, value] of entries) {
				if (value === null || value === undefined || value === "") continue;

				const row = document.createElement("div");
				const term = document.createElement("dt");
				term.textContent = label;
				const description = document.createElement("dd");
				description.textContent = value;
				row.append(term, description);
				list.append(row);
			}
			group.append(list);
			return group;
		};

		const displayValue = (value, unit = "") =>
			value === null || value === undefined || value === "" ? null : `${value}${unit}`;

		const renderWeather = (statusSelector, detailsSelector, contentSelector, weather) => {
			const status = resultsPage.querySelector(statusSelector);
			if (weather.error) {
				status.textContent = weather.error;
				return;
			}

			status.textContent = `${weather.city}: ${weather.temperature}°C, ${weather.description} (feels like ${weather.feelsLike}°C).`;
			const { current, location } = weather.rawResponse;
			const airQuality = current.air_quality || {};
			const coordinates = location.lat && location.lon ? `${location.lat}, ${location.lon}` : null;
			const detailGroups = [
				createDetailGroup("Condiciones actuales", [
					["Temperatura", displayValue(current.temperature, " °C")],
					["Sensación térmica", displayValue(current.feelslike, " °C")],
					["Descripción", current.weather_descriptions?.[0]],
					["Momento del día", current.is_day === "yes" ? "Día" : current.is_day === "no" ? "Noche" : null],
					["Hora de observación", current.observation_time],
					["Código del clima", displayValue(current.weather_code)],
				], current.weather_icons?.[0], current.weather_descriptions?.[0]),
				createDetailGroup("Ubicación y hora", [
					["País", location.country],
					["Región", location.region],
					["Coordenadas", coordinates],
					["Zona horaria", location.timezone_id],
					["Hora local", location.localtime],
					["Diferencia UTC", displayValue(location.utc_offset)],
				]),
				createDetailGroup("Viento y atmósfera", [
					["Viento", displayValue(current.wind_speed, " km/h")],
					["Dirección del viento", current.wind_dir],
					["Grados del viento", displayValue(current.wind_degree, "°")],
					["Presión", displayValue(current.pressure, " mb")],
					["Precipitación", displayValue(current.precip, " mm")],
					["Humedad", displayValue(current.humidity, "%")],
					["Nubosidad", displayValue(current.cloudcover, "%")],
					["Visibilidad", displayValue(current.visibility, " km")],
					["Índice UV", displayValue(current.uv_index)],
				]),
				createDetailGroup("Calidad del aire", [
					["Monóxido de carbono (CO)", airQuality.co],
					["Dióxido de nitrógeno (NO₂)", airQuality.no2],
					["Ozono (O₃)", airQuality.o3],
					["Dióxido de azufre (SO₂)", airQuality.so2],
					["Partículas PM2.5", airQuality.pm2_5],
					["Partículas PM10", airQuality.pm10],
					["Índice EPA (EE. UU.)", airQuality["us-epa-index"]],
					["Índice DEFRA (Reino Unido)", airQuality["gb-defra-index"]],
				]),
				createDetailGroup("Sol y luna", [
					["Amanecer", current.astro?.sunrise],
					["Atardecer", current.astro?.sunset],
					["Salida de la luna", current.astro?.moonrise],
					["Puesta de la luna", current.astro?.moonset],
					["Fase lunar", current.astro?.moon_phase],
					["Iluminación lunar", displayValue(current.astro?.moon_illumination, "%")],
				]),
			];

			resultsPage.querySelector(contentSelector).replaceChildren(...detailGroups);
			resultsPage.querySelector(detailsSelector).hidden = false;
		};

		const getExchangeInformation = (firstCity, secondCity) =>
			`Currency exchange information for ${firstCity} and ${secondCity} is unavailable until a currency API is connected.`;

		getWeatherForCity(cities[0]).then((weather) => {
			renderWeather("[data-weather-one]", "[data-weather-details-one]", "[data-weather-content-one]", weather);
		});
		getWeatherForCity(cities[1]).then((weather) => {
			renderWeather("[data-weather-two]", "[data-weather-details-two]", "[data-weather-content-two]", weather);
		});
		resultsPage.querySelector("[data-exchange-status]").textContent = getExchangeInformation(cities[0], cities[1]);
	}
}