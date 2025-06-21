    # Użyj oficjalnego obrazu Node.js 18 LTS jako podstawy
    FROM node:18-alpine

    # Ustaw katalog roboczy wewnątrz kontenera
    WORKDIR /app

    # Skopiuj package.json i package-lock.json (jeśli dostępne) do katalogu roboczego
    COPY package*.json ./

    # Zainstaluj zależności produkcyjne
    RUN npm install --production

    # Skopiuj resztę kodu aplikacji do katalogu roboczego
    COPY . .

    # Ustaw zmienną środowiskową PORT, na której nasłuchuje aplikacja Express
    ENV PORT 5000

    # Ujawnij port, na którym działa Twoja aplikacja
    EXPOSE 5000

    # Komenda do uruchomienia aplikacji
    CMD ["node", "server.js"]
