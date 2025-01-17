/* global SunCalc */

/* MagicMirror²
 * Module: Weather
 *
 * By Michael Teeuw https://michaelteeuw.nl
 * MIT Licensed.
 *
 * This class is the blueprint for a day which includes weather information.
 *
 * Currently this is focused on the information which is necessary for the current weather.
 * As soon as we start implementing the forecast, mode properties will be added.
 */
class WeatherObject {
	/**
	 * Constructor for a WeatherObject
	 *
	 * @param {string} units what units to use, "imperial" or "metric"
	 * @param {string} tempUnits what tempunits to use
	 * @param {string} windUnits what windunits to use
	 * @param {boolean} useKmh use kmh if true, mps if false
	 */
	constructor(units, tempUnits, windUnits, useKmh) {
		this.units = units;
		this.tempUnits = tempUnits;
		this.windUnits = windUnits;
		this.useKmh = useKmh;
		this.date = null;
		this.windSpeed = null;
		this.windDirection = null;
		this.sunrise = null;
		this.sunset = null;
		this.temperature = null;
		this.minTemperature = null;
		this.maxTemperature = null;
		this.weatherType = null;
		this.humidity = null;
		this.rain = null;
		this.snow = null;
		this.precipitation = null;
		this.precipitationUnits = null;
		this.feelsLikeTemp = null;
	}

	cardinalWindDirection() {
		if (this.windDirection > 11.25 && this.windDirection <= 33.75) {
			return "NNE";
		} else if (this.windDirection > 33.75 && this.windDirection <= 56.25) {
			return "NE";
		} else if (this.windDirection > 56.25 && this.windDirection <= 78.75) {
			return "ENE";
		} else if (this.windDirection > 78.75 && this.windDirection <= 101.25) {
			return "E";
		} else if (this.windDirection > 101.25 && this.windDirection <= 123.75) {
			return "ESE";
		} else if (this.windDirection > 123.75 && this.windDirection <= 146.25) {
			return "SE";
		} else if (this.windDirection > 146.25 && this.windDirection <= 168.75) {
			return "SSE";
		} else if (this.windDirection > 168.75 && this.windDirection <= 191.25) {
			return "S";
		} else if (this.windDirection > 191.25 && this.windDirection <= 213.75) {
			return "SSW";
		} else if (this.windDirection > 213.75 && this.windDirection <= 236.25) {
			return "SW";
		} else if (this.windDirection > 236.25 && this.windDirection <= 258.75) {
			return "WSW";
		} else if (this.windDirection > 258.75 && this.windDirection <= 281.25) {
			return "W";
		} else if (this.windDirection > 281.25 && this.windDirection <= 303.75) {
			return "WNW";
		} else if (this.windDirection > 303.75 && this.windDirection <= 326.25) {
			return "NW";
		} else if (this.windDirection > 326.25 && this.windDirection <= 348.75) {
			return "NNW";
		} else {
			return "N";
		}
	}

	beaufortWindSpeed() {
		const windInKmh = this.windUnits === "imperial" ? this.windSpeed * 1.609344 : this.useKmh ? this.windSpeed : (this.windSpeed * 60 * 60) / 1000;
		const speeds = [1, 5, 11, 19, 28, 38, 49, 61, 74, 88, 102, 117, 1000];
		for (const [index, speed] of speeds.entries()) {
			if (speed > windInKmh) {
				return index;
			}
		}
		return 12;
	}

	kmhWindSpeed() {
		return this.windUnits === "imperial" ? this.windSpeed * 1.609344 : (this.windSpeed * 60 * 60) / 1000;
	}

	nextSunAction() {
		return moment().isBetween(this.sunrise, this.sunset) ? "sunset" : "sunrise";
	}

	dewPointAdjustment() {
		const tempInF = this.tempUnits === "imperial" ? this.temperature : (this.temperature * 9) / 5 + 32;
		const tempInC = this.tempUnits === "imperial" ? (this.temperature-32) * 5 / 9 : this.temperature;

		let dewPointInC = tempInC - ((100 - this.humidity)/5);
		let dewPointInF = dewPointInC * 9 / 5 + 32;

		let index = tempInF + dewPointInF;
		console.log(index);

		let percentChange = (1/800*Math.pow(index-100,2)+1/40*(index-100))/100; //decimal units
		console.log(percentChange);

		if (index > 140)
			return percentChange;
		return 0;
	}
	oldPaces() {
		return ["5:00", "5:30", "6:00", "6:30", "7:00", "7:30", "8:00"]
	}

	newPaces() {
		let old_paces_string = this.oldPaces();
		let old_paces_float = [300, 330, 360, 390, 420, 450, 480];

		let change = this.dewPointAdjustment();

		let new_paces_float = old_paces_float.map((x) => x*(1+change));

		let new_paces_string = old_paces_string.map((x)=>x);
		for(let i = 0; i < new_paces_string.length; i++){
			new_paces_string[i] = Math.floor(new_paces_float[i]/60).toString() + ':';
		 	let seconds = Math.round(new_paces_float[i]%60);
			if(seconds > 9)
				new_paces_string[i] += seconds.toString();
			else
				new_paces_string[i] += '0' + seconds.toString();
		}
		console.log(new_paces_string);
		return new_paces_string;
	}

	feelsLike() {
		if (this.feelsLikeTemp) {
			return this.feelsLikeTemp;
		}
		const windInMph = this.windUnits === "imperial" ? this.windSpeed : this.windSpeed * 2.23694;
		const tempInF = this.tempUnits === "imperial" ? this.temperature : (this.temperature * 9) / 5 + 32;
		let feelsLike = tempInF;

		if (windInMph > 3 && tempInF < 50) {
			feelsLike = Math.round(35.74 + 0.6215 * tempInF - 35.75 * Math.pow(windInMph, 0.16) + 0.4275 * tempInF * Math.pow(windInMph, 0.16));
		} else if (tempInF > 80 && this.humidity > 40) {
			feelsLike =
				-42.379 +
				2.04901523 * tempInF +
				10.14333127 * this.humidity -
				0.22475541 * tempInF * this.humidity -
				6.83783 * Math.pow(10, -3) * tempInF * tempInF -
				5.481717 * Math.pow(10, -2) * this.humidity * this.humidity +
				1.22874 * Math.pow(10, -3) * tempInF * tempInF * this.humidity +
				8.5282 * Math.pow(10, -4) * tempInF * this.humidity * this.humidity -
				1.99 * Math.pow(10, -6) * tempInF * tempInF * this.humidity * this.humidity;
		}

		return this.tempUnits === "imperial" ? feelsLike : ((feelsLike - 32) * 5) / 9;
	}

	/**
	 * Checks if the weatherObject is at dayTime.
	 *
	 * @returns {boolean} true if it is at dayTime
	 */
	isDayTime() {
		return this.date.isBetween(this.sunrise, this.sunset, undefined, "[]");
	}

	/**
	 * Update the sunrise / sunset time depending on the location. This can be
	 * used if your provider doesnt provide that data by itself. Then SunCalc
	 * is used here to calculate them according to the location.
	 *
	 * @param {number} lat latitude
	 * @param {number} lon longitude
	 */
	updateSunTime(lat, lon) {
		let now = !this.date ? new Date() : this.date.toDate();
		let times = SunCalc.getTimes(now, lat, lon);
		this.sunrise = moment(times.sunrise, "X");
		this.sunset = moment(times.sunset, "X");
	}

	/**
	 * Clone to simple object to prevent mutating and deprecation of legacy library.
	 *
	 * Before being handed to other modules, mutable values must be cloned safely.
	 * Especially 'moment' object is not immutable, so original 'date', 'sunrise', 'sunset' could be corrupted or changed by other modules.
	 *
	 * @returns {object} plained object clone of original weatherObject
	 */
	simpleClone() {
		const toFlat = ["date", "sunrise", "sunset"];
		let clone = { ...this };
		for (const prop of toFlat) {
			clone[prop] = clone?.[prop]?.valueOf() ?? clone?.[prop];
		}
		return clone;
	}
}

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") {
	module.exports = WeatherObject;
}
