# Stress Tester

## Installation

1. Install javascript dependencies
```
npm install
```

2. K6 installation is needed to execute test, you can find its installation instructions [here](https://k6.io/docs/getting-started/installation).

3. Build the project

```
npm run build
```

4. [Environment variables](https://k6.io/docs/using-k6/environment-variables) needed:
```
WORKSPACE_ENDPOINT=xxxxxxxxxxxxxxxxx

API_TOKEN=xxxxxxxxxxxxxxxx

SHORTENER_URL=xxxxxxxxxxxxxxxxxxxxxx
```

5. After installation of K6 you can run test with command (with environment variables)

```
k6 run ./dist/shortener.bundle.js
```