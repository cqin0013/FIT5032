<template>
  <div class="container py-4">
    <h1 class="mb-3">Weather Check</h1>

    <div class="row g-2 align-items-center mb-3">
      <div class="col-sm-6">
        <input
          v-model="city"
          type="text"
          class="form-control"
          placeholder="Enter a city (e.g., Melbourne)"
          @keyup.enter="getWeather"
        />
      </div>
      <div class="col-sm-auto">
        <button class="btn btn-primary" @click="getWeather" :disabled="loading">
          {{ loading ? 'Fetching...' : 'Get Weather' }}
        </button>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-if="result" class="card">
      <div class="card-body">
        <h5 class="card-title mb-2">
          {{ result.cityName }} ({{ result.latitude.toFixed(3) }}, {{ result.longitude.toFixed(3) }})
        </h5>
        <p class="mb-2">Timezone: {{ result.timezone }}</p>
        <p class="mb-2">Current temperature: {{ result.currentTemp }} °C</p>
        <p class="mb-2">Wind speed: {{ result.windSpeed }} m/s</p>
        <p class="mb-0 small text-muted">Data source: Open-Meteo</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref } from "vue";

const city = ref("");
const loading = ref(false);
const error = ref("");
const result = ref(null);

/**
 * 逻辑：
 * 1) geocoding: https://geocoding-api.open-meteo.com/v1/search?name=Melbourne
 * 2) weather:   https://api.open-meteo.com/v1/forecast?latitude=..&longitude=..&current_weather=true
 * 都是无需密钥、支持 CORS 的公开接口
 */
async function getWeather() {
  error.value = "";
  result.value = null;

  const q = city.value.trim();
  if (!q) {
    error.value = "Please enter a city name.";
    return;
  }
  loading.value = true;
  try {
    // 1) Geocoding
    const geo = await axios.get(
      "https://geocoding-api.open-meteo.com/v1/search",
      { params: { name: q, count: 1 } }
    );
    const place = geo.data && geo.data.results && geo.data.results[0];
    if (!place) {
      throw new Error("City not found.");
    }

    // 2) Current weather
    const weather = await axios.get(
      "https://api.open-meteo.com/v1/forecast",
      {
        params: {
          latitude: place.latitude,
          longitude: place.longitude,
          current_weather: true,
        },
      }
    );

    const cw = weather.data.current_weather;
    result.value = {
      cityName: `${place.name}${place.country ? ", " + place.country : ""}`,
      latitude: place.latitude,
      longitude: place.longitude,
      timezone: weather.data.timezone,
      currentTemp: cw?.temperature ?? "N/A",
      windSpeed: cw?.windspeed ?? "N/A",
    };
  } catch (e) {
    error.value = e?.message || "Failed to fetch weather.";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.container { max-width: 800px; }
</style>
