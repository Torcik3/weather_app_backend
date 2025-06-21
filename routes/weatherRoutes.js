const express = require('express');
const axios = require('axios');
const router = express.Router();


router.get('/forecast', async (req, res) => {
    const { latitude, longitude } = req.query;


    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Wymagane parametry: szerokość (latitude) i wysokość (longitude) geograficzna.' });
    }
    if (isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude))) {
        return res.status(400).json({ error: 'Parametry latitude i longitude muszą być liczbami.' });
    }

    const latNum = parseFloat(latitude);
    const lonNum = parseFloat(longitude);
    if (latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
        return res.status(400).json({ error: 'Nieprawidłowy zakres dla szerokości geograficznej (-90 do 90) lub długości geograficznej (-180 do 180).' });
    }

    try {

        const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
            params: {
                latitude: latNum,
                longitude: lonNum,
                daily: 'weathercode,temperature_2m_max,temperature_2m_min,sunshine_duration',
                timezone: 'auto',
                forecast_days: 7
            }
        });

        const dailyData = response.data.daily;
        const forecast = [];

        const installationPowerKw = 2.5;
        const panelEfficiency = 0.2;

        for (let i = 0; i < dailyData.time.length; i++) {
            const date = dailyData.time[i];
            const weathercode = dailyData.weathercode[i];
            const tempMin = dailyData.temperature_2m_min[i];
            const tempMax = dailyData.temperature_2m_max[i];
            const sunshineDurationSeconds = dailyData.sunshine_duration[i];


            const timeH = sunshineDurationSeconds / 3600;


            const wygenerowanaEnergiaKwh = installationPowerKw * timeH * panelEfficiency;

            const szacowanaEnergia = parseFloat(wygenerowanaEnergiaKwh.toFixed(2));

            forecast.push({
                date: date,
                weathercode: weathercode,
                temperature_min: tempMin,
                temperature_max: tempMax,
                estimated_energy_kwh: szacowanaEnergia
            });
        }


        res.json(forecast);

    } catch (error) {
        console.error('Błąd podczas pobierania danych pogodowych dla prognozy:', error.message);
        if (error.response) {

            res.status(error.response.status).json({
                error: 'Błąd podczas komunikacji z zewnętrznym API pogodowym.',
                details: error.response.data
            });
        } else if (error.request) {

            res.status(500).json({
                error: 'Brak odpowiedzi od zewnętrznego serwera API pogodowego. Sprawdź połączenie internetowe.'
            });
        } else {

            res.status(500).json({
                error: 'Wystąpił nieoczekiwany błąd serwera.',
                details: error.message
            });
        }
    }
});




router.get('/summary', async (req, res) => {
    const { latitude, longitude } = req.query;


    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Wymagane parametry: szerokość (latitude) i wysokość (longitude) geograficzna.' });
    }
    if (isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude))) {
        return res.status(400).json({ error: 'Parametry latitude i longitude muszą być liczbami.' });
    }

    const latNum = parseFloat(latitude);
    const lonNum = parseFloat(longitude);
    if (latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
        return res.status(400).json({ error: 'Nieprawidłowy zakres dla szerokości geograficznej (-90 do 90) lub długości geograficznej (-180 do 180).' });
    }

    try {

        const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
            params: {
                latitude: latNum,
                longitude: lonNum,
                daily: 'weathercode,temperature_2m_max,temperature_2m_min,sunshine_duration',
                timezone: 'auto',
                forecast_days: 7
            }
        });

        const dailyData = response.data.daily;


        let totalSunshineDurationSeconds = 0;
        let minTempOverall = Infinity;
        let maxTempOverall = -Infinity;
        let rainyDays = 0;

        for (let i = 0; i < dailyData.time.length; i++) {
            const tempMin = dailyData.temperature_2m_min[i];
            const tempMax = dailyData.temperature_2m_max[i];
            const sunshineDurationSeconds = dailyData.sunshine_duration[i];
            const weathercode = dailyData.weathercode[i];

            totalSunshineDurationSeconds += sunshineDurationSeconds;

            if (tempMin < minTempOverall) {
                minTempOverall = tempMin;
            }
            if (tempMax > maxTempOverall) {
                maxTempOverall = tempMax;
            }


            if (weathercode >= 51 && weathercode <= 67 || weathercode >= 80 && weathercode <= 82 || weathercode >= 95 && weathercode <= 99) {
                rainyDays++;
            }
        }

        const avgSunshineDurationHours = parseFloat((totalSunshineDurationSeconds / dailyData.time.length / 3600).toFixed(2));


        let weeklyWeatherComment;
        if (rainyDays >= Math.ceil(dailyData.time.length / 2)) {
            weeklyWeatherComment = 'Tydzień z opadami';
        } else {
            weeklyWeatherComment = 'Tydzień bez opadów';
        }

        const summary = {
            minTemperatureOverall: minTempOverall,
            maxTemperatureOverall: maxTempOverall,
            averageSunshineExposureHours: avgSunshineDurationHours,
            weeklyWeatherComment: weeklyWeatherComment
        };


        res.json(summary);

    } catch (error) {
        console.error('Błąd podczas pobierania danych pogodowych dla podsumowania:', error.message);
        if (error.response) {
            res.status(error.response.status).json({
                error: 'Błąd podczas komunikacji z zewnętrznym API pogodowym.',
                details: error.response.data
            });
        } else if (error.request) {
            res.status(500).json({
                error: 'Brak odpowiedzi od zewnętrznego serwera API pogodowego. Sprawdź połączenie internetowe.'
            });
        } else {
            res.status(500).json({
                error: 'Wystąpił nieoczekiwany błąd serwera.',
                details: error.message
            });
        }
    }
});

module.exports = router;