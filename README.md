# Space Explorer

Space Explorer is an Expo (React Native) app for NASA Astronomy Picture of the Day. The full UI covers a welcome orbit scene, Home, Gallery, Search, plate details, and a Saved vault. Dark and Light appearance stay selected after refresh.

Home shows today’s APOD with recent nights. Gallery and Search filter galaxies, nebulae, planets, Earth, and the Moon. Details open credit, explanation, Keep / Share / Save, and neighboring nights.

## Setup

Copy `.env.example` to `.env` and set a key from [api.nasa.gov](https://api.nasa.gov).


| Location          | Command                      | Notes                               |
| ----------------- | ---------------------------- | ----------------------------------- |
| `space_explorer/` | `npm install`                | Install app dependencies            |
| `space_explorer/` | copy `.env.example` → `.env` | `EXPO_PUBLIC_NASA_API_KEY` for APOD |




## Run


| Location               | Command                              | Notes                        |
| ---------------------- | ------------------------------------ | ---------------------------- |
| `space_explorer/ `      | `npx expo start --port 8081 --clear` | Start Metro                  |
| `Space Explorer/ ` | `npm start`                          | Start from the parent folder |
| `Space Explorer/ ` | `npm run web`                        | Open the web preview         |
| `Space Explorer/ ` | `npm run android`                    | Open Android                 |
| `Space Explorer/ ` | `npm run ios`                        | Open iOS                     |


After Metro starts:


| Key | Notes   |
| --- | ------- |
| `a` | Android |
| `i` | iOS     |
| `w` | Web     |
| `r` | Reload  |


Use Expo Go, an emulator, a simulator, or the web preview.

## Tech stack


| Layer         | Technologies                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| Languages     | TypeScript, JavaScript                                                                                 |
| App           | React Native 0.86, React 19, Expo SDK 57, Expo Router                                                  |
| UI and motion | Space Grotesk, expo-image, expo-linear-gradient, react-native-reanimated, react-native-gesture-handler |
| Tooling       | npm, Metro bundler, TypeScript                                                                         |
| Data          | NASA APOD (`EXPO_PUBLIC_NASA_API_KEY`)                                                                 |


