import { getCurrentWeather } from "./weatherApi.js";
import { getCountryInfo } from "./countryApi.js";
import { getCurrencyChanges, convertCurrency } from "./currencyApi.js";

const resultsPage = document.querySelector("#city-results");

if (resultsPage) {
  const params = new URLSearchParams(window.location.search);
  const cities = [params.get("city1")?.trim(), params.get("city2")?.trim()];
  const comparisonMessage = resultsPage.querySelector(
    "[data-comparison-message]",
  );

  if (cities.some((city) => !city)) {
    comparisonMessage.textContent =
      "Enter two cities to compare their conditions.";
  } else {
    resultsPage.querySelector("[data-city-one]").textContent = cities[0];
    resultsPage.querySelector("[data-city-two]").textContent = cities[1];
    comparisonMessage.textContent = `Comparing ${cities[0]} and ${cities[1]}.`;

    const getWeatherForCity = async (city) => {
      try {
        return await getCurrentWeather(city);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.";
        return { error: `Weather for ${city} could not be loaded: ${message}` };
      }
    };

    const getCountryInfoForCity = async (city) => {
      try {
        return await getCountryInfo(city);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.";
        return {
          error: `Country information for ${city} could not be loaded: ${message}`,
        };
      }
    };

    const getCurrencyTrends = async (currencyCodes) => {
      try {
        const validCodes = currencyCodes.filter(Boolean);
        if (validCodes.length === 0) return [];
        return await getCurrencyChanges(validCodes);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.";
        return { error: `Currency trends could not be loaded: ${message}` };
      }
    };

    const renderCountryInfo = (
      statusSelector,
      descriptionSelector,
      country,
      trends = [],
    ) => {
      const status = resultsPage.querySelector(statusSelector);
      const description = resultsPage.querySelector(descriptionSelector);
      if (country.error) {
        status.textContent = country.error;
        return;
      }

      const currencyCode = country.currencyCode;
      const trend = trends.find((t) => t.target === currencyCode);

      let currencyText = `Currency code: ${currencyCode}`;
      if (trend) {
        const arrow = trend.changePct >= 0 ? "↑" : "↓";
        const color = trend.changePct >= 0 ? "green" : "red";
        currencyText += ` <span style="color: ${color}">${arrow} ${trend.changePct.toFixed(2)}%</span>`;
      }

      status.innerHTML = currencyText;
      description.textContent = country.description;
    };

    const renderConversion = (selector, fromCode, toCode) => {
      const container = resultsPage.querySelector(selector);
      const amountInput = resultsPage.querySelector("#currency-amount");
      const unitDisplay = resultsPage.querySelector("[data-from-currency]");
      const section = resultsPage.querySelector(".currency-conversion-section");
      if (!container || !fromCode || !toCode) return;

      if (unitDisplay) unitDisplay.textContent = fromCode;
      if (section) section.style.display = "block";

      if (fromCode === toCode) {
        container.textContent = `Same currency: ${fromCode}`;
        return;
      }

      convertCurrency(fromCode, toCode)
        .then((rate) => {
          const updateResult = (amount) => {
            const converted = amount * rate;
            container.textContent = `1 ${fromCode} = ${rate.toFixed(4)} ${toCode} | ${amount} ${fromCode} = ${converted.toFixed(2)} ${toCode}`;
          };

          updateResult(amountInput ? parseFloat(amountInput.value) || 1 : 1);

          if (amountInput) {
            amountInput.addEventListener("input", () => {
              updateResult(parseFloat(amountInput.value) || 0);
            });
          }
        })
        .catch((err) => {
          container.textContent = "Conversion unavailable";
        });
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
      value === null || value === undefined || value === ""
        ? null
        : `${value}${unit}`;

    const renderWeather = (
      statusSelector,
      detailsSelector,
      contentSelector,
      weather,
    ) => {
      const status = resultsPage.querySelector(statusSelector);
      if (weather.error) {
        status.textContent = weather.error;
        return;
      }

      status.textContent = `${weather.city}: ${weather.temperature}°C, ${weather.description} (feels like ${weather.feelsLike}°C).`;

      const card = status.closest(".city-result");
      if (card) {
        card.classList.remove("weather-cold", "weather-warm", "weather-hot");
        if (weather.temperature <= 15) {
          card.classList.add("weather-cold");
        } else if (weather.temperature > 15 && weather.temperature <= 25) {
          card.classList.add("weather-warm");
        } else {
          card.classList.add("weather-hot");
        }
      }

      const { current, location } = weather.rawResponse;
      const airQuality = current.air_quality || {};
      const coordinates =
        location.lat && location.lon
          ? `${location.lat}, ${location.lon}`
          : null;
      const detailGroups = [
        createDetailGroup(
          "Current Conditions",
          [
            ["Temperature", displayValue(current.temperature, " °C")],
            ["Feels like", displayValue(current.feelslike, " °C")],
            ["Description", current.weather_descriptions?.[0]],
            [
              "Time of day",
              current.is_day === "yes"
                ? "Day"
                : current.is_day === "no"
                  ? "Night"
                  : null,
            ],
            ["Observation time", current.observation_time],
            ["Weather code", displayValue(current.weather_code)],
          ],
          current.weather_icons?.[0],
          current.weather_descriptions?.[0],
        ),
        createDetailGroup("Location and Time", [
          ["Country", location.country],
          ["Region", location.region],
          ["Coordinates", coordinates],
          ["Time zone", location.timezone_id],
          ["Local time", location.localtime],
          ["UTC offset", displayValue(location.utc_offset)],
        ]),
        createDetailGroup("Wind and Atmosphere", [
          ["Wind", displayValue(current.wind_speed, " km/h")],
          ["Wind direction", current.wind_dir],
          ["Wind degrees", displayValue(current.wind_degree, "°")],
          ["Pressure", displayValue(current.pressure, " mb")],
          ["Precipitation", displayValue(current.precip, " mm")],
          ["Humidity", displayValue(current.humidity, "%")],
          ["Cloud cover", displayValue(current.cloudcover, "%")],
          ["Visibility", displayValue(current.visibility, " km")],
          ["UV Index", displayValue(current.uv_index)],
        ]),
        createDetailGroup("Air Quality", [
          ["Carbon monoxide (CO)", airQuality.co],
          ["Nitrogen dioxide (NO₂)", airQuality.no2],
          ["Ozone (O₃)", airQuality.o3],
          ["Sulfur dioxide (SO₂)", airQuality.so2],
          ["PM2.5 Particles", airQuality.pm2_5],
          ["PM10 Particles", airQuality.pm10],
          ["EPA Index (USA)", airQuality["us-epa-index"]],
          ["DEFRA Index (UK)", airQuality["gb-defra-index"]],
        ]),
        createDetailGroup("Sun and Moon", [
          ["Sunrise", current.astro?.sunrise],
          ["Sunset", current.astro?.sunset],
          ["Moonrise", current.astro?.moonrise],
          ["Moonset", current.astro?.moonset],
          ["Moon phase", current.astro?.moon_phase],
          [
            "Moon illumination",
            displayValue(current.astro?.moon_illumination, "%"),
          ],
        ]),
      ];

      resultsPage
        .querySelector(contentSelector)
        .replaceChildren(...detailGroups);
      resultsPage.querySelector(detailsSelector).hidden = false;
    };

    getWeatherForCity(cities[0]).then((weather) => {
      renderWeather(
        "[data-weather-one]",
        "[data-weather-details-one]",
        "[data-weather-content-one]",
        weather,
      );
    });
    getWeatherForCity(cities[1]).then((weather) => {
      renderWeather(
        "[data-weather-two]",
        "[data-weather-details-two]",
        "[data-weather-content-two]",
        weather,
      );
    });

    Promise.all([
      getCountryInfoForCity(cities[0]),
      getCountryInfoForCity(cities[1]),
    ]).then(async ([country1, country2]) => {
      const currencyCodes = [country1.currencyCode, country2.currencyCode];
      const trends = await getCurrencyTrends(currencyCodes);

      renderCountryInfo(
        "[data-country-one]",
        "[data-country-description-one]",
        country1,
        trends,
      );
      renderCountryInfo(
        "[data-country-two]",
        "[data-country-description-two]",
        country2,
        trends,
      );

      if (country1.currencyCode && country2.currencyCode) {
        setTimeout(() => {
          renderConversion(
            "[data-currency-conversion]",
            country1.currencyCode,
            country2.currencyCode,
          );
        }, 5000);
      }
    });
  }
}
