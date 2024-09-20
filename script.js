
        const apiKey = 'b3a3cebc455d44e796950615242009'; // Replace with your WeatherAPI.com API key

        function getWeather(query) {
            const currentWeatherUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(query)}&days=7&aqi=no&alerts=no`;

            fetch(currentWeatherUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    // Current weather
                    document.getElementById('location').textContent = `${data.location.name}, ${data.location.country}`;
                    document.getElementById('temperature').textContent = `Temperature: ${data.current.temp_c}°C / ${data.current.temp_f}°F`;
                    document.getElementById('description').textContent = data.current.condition.text;
                    
                    const weatherIcon = document.getElementById('weather-icon');
                    weatherIcon.src = `https:${data.current.condition.icon}`;
                    weatherIcon.style.display = 'block';

                    // 7-day forecast
                    const forecastContainer = document.querySelector('.forecast');
                    forecastContainer.innerHTML = ''; // Clear previous forecast
                    data.forecast.forecastday.forEach(day => {
                        const date = new Date(day.date);
                        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                        const forecastDay = document.createElement('div');
                        forecastDay.className = 'forecast-day';
                        forecastDay.innerHTML = `
                            <p>${dayName}</p>
                            <img class="forecast-icon" src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
                            <p>${day.day.avgtemp_c}°C / ${day.day.avgtemp_f}°F</p>
                        `;
                        forecastContainer.appendChild(forecastDay);
                    });
                    
                    // Apply fade-in effect to all elements
                    document.querySelectorAll('#weather-container > *').forEach(el => {
                        el.classList.add('fade-in');
                    });
                    
                    // Change background based on temperature
                    const temp = data.current.temp_c;
                    if (temp < 10) {
                        document.body.style.background = 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)';
                    } else if (temp < 20) {
                        document.body.style.background = 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)';
                    } else {
                        document.body.style.background = 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)';
                    }

                    // Clear any previous error messages
                    document.getElementById('error-message').textContent = '';
                })
                .catch(error => {
                    console.error('Error fetching weather data:', error);
                    document.getElementById('location').textContent = '';
                    document.getElementById('temperature').textContent = '';
                    document.getElementById('description').textContent = '';
                    document.getElementById('weather-icon').style.display = 'none';
                    document.querySelector('.forecast').innerHTML = '';
                    document.getElementById('error-message').textContent = 'Unable to fetch weather data. Please check the address and try again.';
                });
        }

        function getAutocompleteSuggestions(query) {
            const autocompleteUrl = `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${encodeURIComponent(query)}`;

            fetch(autocompleteUrl)
                .then(response => response.json())
                .then(data => {
                    const suggestions = document.getElementById('suggestions');
                    suggestions.innerHTML = '';
                    data.forEach(item => {
                        const li = document.createElement('li');
                        li.textContent = `${item.name}, ${item.region}, ${item.country}`;
                        li.addEventListener('click', () => {
                            document.getElementById('address-input').value = li.textContent;
                            suggestions.innerHTML = '';
                            getWeather(item.name);
                        });
                        suggestions.appendChild(li);
                    });
                })
                .catch(error => console.error('Error fetching autocomplete suggestions:', error));
        }

        function getUserLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        getWeather(`${latitude},${longitude}`);
                    },
                    (error) => {
                        console.error("Error getting user location:", error);
                        let errorMessage = "Unable to get your precise location. ";
                        switch(error.code) {
                            case error.PERMISSION_DENIED:
                                errorMessage += "You denied the request for geolocation.";
                                break;
                            case error.POSITION_UNAVAILABLE:
                                errorMessage += "Location information is unavailable.";
                                break;
                            case error.TIMEOUT:
                                errorMessage += "The request to get your location timed out.";
                                break;
                            case error.UNKNOWN_ERROR:
                                errorMessage += "An unknown error occurred.";
                                break;
                        }
                        document.getElementById('error-message').textContent = errorMessage + " Falling back to IP-based location.";
                        getIPBasedLocation();
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 0
                    }
                );
            } else {
                document.getElementById('error-message').textContent = "Geolocation is not supported by your browser. Falling back to IP-based location.";
                getIPBasedLocation();
            }
        }

        function getIPBasedLocation() {
            getWeather('auto:ip');
        }

        document.getElementById('get-location').addEventListener('click', getUserLocation);

        document.getElementById('address-input').addEventListener('input', function() {
            if (this.value.length > 2) {
                getAutocompleteSuggestions(this.value);
            } else {
                document.getElementById('suggestions').innerHTML = '';
            }
        });

        document.getElementById('search-button').addEventListener('click', function() {
            const query = document.getElementById('address-input').value;
            if (query) {
                getWeather(query);
            }
        });

        document.getElementById('address-input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = this.value;
                if (query) {
                    getWeather(query);
                }
            }
        });

        // Attempt to get user's location on page load
        getUserLocation();
   