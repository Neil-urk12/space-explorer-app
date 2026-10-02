# Space Explorer

Space Explorer is an Expo (React Native) app for NASA Astronomy Picture of the Day. The full UI covers a welcome orbit scene, Home, Gallery, Search, plate details, and a Saved vault. Dark and Light appearance stay selected after refresh.

Home shows today’s APOD with recent nights. Gallery and Search filter galaxies, nebulae, planets, Earth, and the Moon. Details open credit, explanation, Keep / Share / Save, and neighboring nights.

## Setup

Copy `.env.example` to `.env` and set a key from [api.nasa.gov](https://api.nasa.gov). The key is used by the main data source, `api.nasa.gov` (see [Data sources](#data-sources)). Restart with `--clear` after changing `.env`; Expo builds `EXPO_PUBLIC_*` values into the app bundle.


| Location          | Command                      | Notes                               |
| ----------------- | ---------------------------- | ----------------------------------- |
| `space_explorer/` | `npm install`                | Install app dependencies            |
| `space_explorer/` | copy `.env.example` → `.env` | `EXPO_PUBLIC_NASA_API_KEY` for `api.nasa.gov` |




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

## Data sources

APOD moved from `apod.nasa.gov` to [science.nasa.gov/apod](https://science.nasa.gov/apod/). Since then, `api.nasa.gov/planetary/apod` has returned a placeholder entry (title "NASA Science", the NASA logo as the image) for every date. The app loads APOD from NASA in this order ([src/services/apod.ts](src/services/apod.ts)):

| Order | Source | Key | Notes |
| ----- | ------ | --- | ----- |
| 1 | `api.nasa.gov/planetary/apod` | `EXPO_PUBLIC_NASA_API_KEY` | Main source. Skipped when it errors, hits the rate limit, takes longer than 2 s, returns only placeholder (logo) entries, or no key is set. |
| 2 | `science.nasa.gov/wp-json/wp/v2/image-article?search=apod` | None | Live NASA data. Date, title, explanation, credit, and image are parsed from each post. |
| 3 | Device cache, then the built-in catalog | None | Used offline or when both sources fail. Home shows a banner with the api.nasa.gov error. |

While `api.nasa.gov` returns placeholders, every load falls through to `science.nasa.gov`. Home then shows a dismissible "Switched Source" notice with the reason. Once NASA fixes the API, it becomes the source again with no code change.

- **Daily updates:** NASA posts each new picture around 00:00 US Eastern time (04:00 UTC). Before then, the newest entry is the previous day's. Pull to refresh on Home to load a new post.
- **Timeout:** Change `API_TIMEOUT_MS` in `src/services/apod.ts` to adjust how long the app waits on `api.nasa.gov`.
- **Video days:** From `science.nasa.gov`, shown as their preview image.
- **First load from science.nasa.gov:** About 800 KB for 30 days.

## Tech stack


| Layer         | Technologies                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| Languages     | TypeScript, JavaScript                                                                                 |
| App           | React Native 0.86, React 19, Expo SDK 57, Expo Router                                                  |
| UI and motion | Space Grotesk, expo-image, expo-linear-gradient, react-native-reanimated, react-native-gesture-handler |
| Tooling       | npm, Metro bundler, TypeScript                                                                         |
| Data          | NASA APOD via `api.nasa.gov`, with science.nasa.gov as fallback                                          |


