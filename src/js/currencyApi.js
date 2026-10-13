const API_KEY = import.meta.env.VITE_CURRENCY_ACCESS_KEY;
const BASE_URL = 'https://api.exchangerate.host';

export async function getCurrencyChanges(currencies) {
    try {
        const currencyList = currencies.join(',');
        const url = `${BASE_URL}/change?access_key=${API_KEY}&currencies=${currencyList}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(`API Error: ${data.error?.info || 'Unknown error occurred'}`);
        }

        const source = data.source;
        const quotes = data.quotes;

        return Object.entries(quotes).map(([pair, details]) => {
            const targetCurrency = pair.replace(source, '');

            return {
                pair: pair,
                source: source,
                target: targetCurrency,
                currentRate: details.end_rate,
                startRate: details.start_rate,
                change: details.change,
                changePct: details.change_pct,
                startDate: data.start_date,
                endDate: data.end_date
            };
        });

    } catch (error) {
        console.error("Could not fetch currency changes:", error);
        throw error;
    }
}


export async function convertCurrency(from, to, amount = 1) {
    try {
        const url = `${BASE_URL}/convert?access_key=${API_KEY}&from=${from}&to=${to}&amount=${amount}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(`API Error: ${data.error?.info || 'Conversion failed'}`);
        }

        return data.result;
    } catch (error) {
        console.error(`Could not convert ${from} to ${to}:`, error);
        throw error;
    }
}
