const API_KEY = "0ccd2e39ec334837be684218240812";
const BASE_URL = "http://api.weatherapi.com/v1";

document.getElementById("dataType").addEventListener("change", (e) => {
    const dateInput = document.getElementById("date");
    if (e.target.value === "history") {
        dateInput.style.display = "block"; // Show date input for history
    } else {
        dateInput.style.display = "none"; // Hide date input for current/forecast
    }
});

document.getElementById("getWeatherBtn").addEventListener("click", () => {
    const location = document.getElementById("location").value;
    const dataType = document.getElementById("dataType").value;
    const date = document.getElementById("date").value;

    if (!location) {
        alert("Please enter a location!");
        return;
    }

    if (dataType === "history" && !date) {
        alert("Please select a date for historical data!");
        return;
    }

    getWeather(location, dataType, date);
});

async function getWeather(location, dataType, date = null) {
    let endpoint;
    const params = { key: API_KEY, q: location };

    if (dataType === "current") {
        endpoint = `${BASE_URL}/current.json`;
    } else if (dataType === "forecast") {
        endpoint = `${BASE_URL}/forecast.json`;
        params.days = 7; // 7-day forecast
    } else if (dataType === "history") {
        endpoint = `${BASE_URL}/history.json`;
        params.dt = date; // Historical date
    }

    const url = `${endpoint}?${new URLSearchParams(params)}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Failed to fetch weather data");
        }
        const data = await response.json();
        displayWeather(data, dataType);
    } catch (error) {
        document.getElementById("result").innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
}

function displayWeather(data, dataType) {
    let resultHTML = "";

    if (dataType === "current") {
        const { name, country } = data.location;
        const { temp_c, condition } = data.current;

        resultHTML = `
            <h2>${name}, ${country}</h2>
            <p><strong>Temperature:</strong> ${temp_c}°C</p>
            <p><strong>Condition:</strong> ${condition.text}</p>
            <img src="https:${condition.icon}" alt="${condition.text}" />
        `;
    } else if (dataType === "forecast") {
        resultHTML = `<h2>7-Day Forecast for ${data.location.name}, ${data.location.country}</h2>`;
        data.forecast.forecastday.forEach((day) => {
            resultHTML += `
                <div>
                    <h3>${day.date}</h3>
                    <p><strong>Max Temp:</strong> ${day.day.maxtemp_c}°C</p>
                    <p><strong>Min Temp:</strong> ${day.day.mintemp_c}°C</p>
                    <p><strong>Condition:</strong> ${day.day.condition.text}</p>
                    <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}" />
                </div>
            `;
        });
    } else if (dataType === "history") {
        const { name, country } = data.location;
        const { temp_c, condition } = data.forecast.forecastday[0].day;

        resultHTML = `
            <h2>Historical Weather on ${data.forecast.forecastday[0].date} for ${name}, ${country}</h2>
            <p><strong>Average Temperature:</strong> ${temp_c}°C</p>
            <p><strong>Condition:</strong> ${condition.text}</p>
            <img src="https:${condition.icon}" alt="${condition.text}" />
        `;
    }

    document.getElementById("result").innerHTML = resultHTML;
}
