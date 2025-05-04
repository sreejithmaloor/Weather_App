document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('searchBtn');
    const cityInput = document.getElementById('cityInput');
    const weatherResult = document.getElementById('weatherResult');
    const loading = document.getElementById('loading');
    const recentSearchesList = document.getElementById('recentSearchesList');
    const clearBtn = document.getElementById('clearBtn');
    
    // Load last searched city from localStorage
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
        cityInput.value = lastCity;
        getWeather(lastCity);
    }

    // Search button click event
    searchBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (!city) {
            showError('Please enter a city name.');
            return;
        }
        getWeather(city);
    });

    // Recent search item click event
    recentSearchesList.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI' && e.target.dataset.city) {
            cityInput.value = e.target.dataset.city;
            getWeather(e.target.dataset.city);
        }
    });

    // Enter key press in input field
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = cityInput.value.trim();
            if (city) {
                getWeather(city);
            }
        }
    });

    // Clear button click event
    if (clearBtn) {
        clearBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('/clear/', {
                    method: 'GET',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken'),
                    }
                });

                if (response.ok) {
                    recentSearchesList.innerHTML = '<li>No recent searches</li>';
                    localStorage.removeItem('lastCity');
                    weatherResult.innerHTML = '';
                }
            } catch (error) {
                console.error('Error clearing searches:', error);
            }
        });
    }

    async function getWeather(city) {
        loading.style.display = 'block';
        weatherResult.innerHTML = '';
        
        try {
            const response = await fetch('/api/get-weather/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                body: JSON.stringify({ city })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Unable to fetch weather data');
            }
            
            const data = await response.json();
            displayWeather(data);
            localStorage.setItem('lastCity', city);
            fetchRecentSearches();
        } catch (error) {
            showError(error.message);
        } finally {
            loading.style.display = 'none';
        }
    }

    function displayWeather(data) {
        const weatherHTML = `
            <h2>${data.city}, ${data.country}</h2>
            <p><strong>Temperature:</strong> ${data.temp}°C</p>
            <p><strong>Feels like:</strong> ${data.feels_like}°C</p>
            <p><strong>Condition:</strong> ${data.condition}</p>
            <p><strong>Humidity:</strong> ${data.humidity}%</p>
            <p><strong>Wind speed:</strong> ${data.wind_speed} m/s</p>
            <img src="https://openweathermap.org/img/wn/${data.icon}@2x.png" alt="Weather Icon">
        `;
        weatherResult.innerHTML = weatherHTML;
        changeBackground(data.condition.toLowerCase());
    }

    function showError(message) {
        weatherResult.innerHTML = `<p class="error">${message}</p>`;
    }

    function changeBackground(condition) {
        const body = document.body;
        if (condition.includes('clear')) {
            body.style.background = "linear-gradient(to right, #ff7e5f, #feb47b)";
        } else if (condition.includes('rain') || condition.includes('drizzle')) {
            body.style.background = "linear-gradient(to right, #5f2c82, #49a09d)";
        } else if (condition.includes('cloud')) {
            body.style.background = "linear-gradient(to right, #2c3e50, #bdc3c7)";
        } else if (condition.includes('thunder')) {
            body.style.background = "linear-gradient(to right, #34495e, #7f8c8d)";
        } else if (condition.includes('snow')) {
            body.style.background = "linear-gradient(to right, #ecf0f1, #bdc3c7)";
        } else {
            body.style.background = "linear-gradient(to right, #83a4d4, #b6fbff)";
        }
    }

    async function fetchRecentSearches() {
        try {
            const response = await fetch('/');
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const newList = doc.getElementById('recentSearchesList').innerHTML;
            recentSearchesList.innerHTML = newList;
        } catch (error) {
            console.error('Error fetching recent searches:', error);
        }
    }

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});
