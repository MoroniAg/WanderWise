function toLocalDate(value) {
	if (value instanceof Date) {
		return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
	}

	if (typeof value === "string") {
		const localDateMatch = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/.exec(value.trim());
		if (localDateMatch) {
			const [, year, month, day, hour = "0", minute = "0", second = "0"] = localDateMatch;
			const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
			if (
				date.getFullYear() !== Number(year) ||
				date.getMonth() !== Number(month) - 1 ||
				date.getDate() !== Number(day) ||
				date.getHours() !== Number(hour) ||
				date.getMinutes() !== Number(minute) ||
				date.getSeconds() !== Number(second)
			) {
				return null;
			}
			return date;
		}
	}

	if (typeof value !== "string" && typeof value !== "number") return null;
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}

function formatLocal(value, options) {
	const date = toLocalDate(value);
	return date ? new Intl.DateTimeFormat(undefined, options).format(date) : "";
}

export function formatLocalDate(value, options = {}) {
	return formatLocal(value, {
		year: "numeric",
		month: "long",
		day: "numeric",
		...options,
	});
}

export function formatLocalTime(value, options = {}) {
	return formatLocal(value, {
		hour: "numeric",
		minute: "2-digit",
		...options,
	});
}

export function formatLocalDateTime(value, options = {}) {
	return formatLocal(value, {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
		...options,
	});
}
