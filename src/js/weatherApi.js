const WEATHERSTACK_URL = "https://api.weatherstack.com/current";
const WEATHERSTACK_ACCESS_KEY = import.meta.env.VITE_WEATHERSTACK_ACCESS_KEY;
const WEATHERSTACK_REQUEST_INTERVAL_MS = 5000;

let weatherRequestQueue = Promise.resolve();
let previousRequestFinishedAt = null;

function enqueueWeatherRequest(request) {
	const queuedRequest = weatherRequestQueue.then(async () => {
		if (previousRequestFinishedAt !== null) {
			const elapsed = Date.now() - previousRequestFinishedAt;
			const waitTime = WEATHERSTACK_REQUEST_INTERVAL_MS - elapsed;
			if (waitTime > 0) {
				await new Promise((resolve) => setTimeout(resolve, waitTime));
			}
		}

		try {
			return await request();
		} finally {
			previousRequestFinishedAt = Date.now();
		}
	});

	weatherRequestQueue = queuedRequest.then(() => undefined, () => undefined);
	return queuedRequest;
}

export async function getCurrentWeather(city) {
	if (!WEATHERSTACK_ACCESS_KEY) {
		throw new Error("Weatherstack is not configured. Set VITE_WEATHERSTACK_ACCESS_KEY.");
	}

	const params = new URLSearchParams({
		access_key: WEATHERSTACK_ACCESS_KEY,
		query: city,
		units: "m",
	});
	return enqueueWeatherRequest(async () => {
		const response = await fetch(`${WEATHERSTACK_URL}?${params}`);

		if (!response.ok) {
			throw new Error(`Weatherstack request failed with status ${response.status}.`);
		}

		const data = await response.json();

		if (data.error) {
			throw new Error(data.error.info || "Weatherstack could not retrieve this city's weather.");
		}

		if (
			!data.location?.name ||
			typeof data.current?.temperature !== "number" ||
			typeof data.current?.feelslike !== "number" ||
			!data.current?.weather_descriptions?.[0]
		) {
			throw new Error("Weatherstack returned an incomplete weather response.");
		}

		return {
			city: data.location.name,
			temperature: data.current.temperature,
			feelsLike: data.current.feelslike,
			description: data.current.weather_descriptions[0].trim(),
			rawResponse: data,
		};
	});
}