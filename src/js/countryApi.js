const COUNTRY_API_URL = 'https://api.restcountries.com/countries/v5';
const COUNTRY_API_KEY = import.meta.env.VITE_COUNTRY_ACESS_KEY;


export async function getCountryInfo(city) {
    try {
        const response = await fetch(`${COUNTRY_API_URL}?q=${encodeURIComponent(city)}&pretty=1`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${COUNTRY_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.data && result.data.objects && result.data.objects.length > 0) {
            const countryData = result.data.objects[0];

            const currencyCode = countryData.currencies && countryData.currencies.length > 0
                ? countryData.currencies[0].code
                : 'N/A';

            const description = countryData.descriptions && countryData.descriptions.long
                ? countryData.descriptions.long
                : 'No description available.';

            return {
                currencyCode,
                description
            };
        } else {
            throw new Error('No country information found for the given city.');
        }
    } catch (error) {
        console.error('Error fetching country info:', error);
        throw error;
    }
}
