const COUNTRY_API_URL = "https://geocoding-api.open-meteo.com/v1/search";

export async function getCountryInfo(city) {
  const response = await fetch(
    `${COUNTRY_API_URL}?name=${encodeURIComponent(city)}`,
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();

  if (result.results && result.results.length > 0) {
    const countryData = result.results[0];
    const countryCode = countryData.country_code;

    const currencyResponse = await fetch("/currencies.json");
    if (!currencyResponse.ok) {
      throw new Error("Could not load local currency data");
    }
    const currencies = await currencyResponse.json();
    const countryCurrency = currencies[countryCode] || {
      currency: "N/A",
      name: "Unknown Currency",
    };

    return {
      currencyCode: countryCurrency.currency,
      description: `Country: ${countryData.country || "Unknown"}`,
    };
  } else {
    throw new Error("No country information found for the given city.");
  }
}
