# Android Fix Report

## Kotlin Upgrade
- Updated `android/build.gradle` so `kotlinVersion` is now pinned to `2.0.20` and used for the Kotlin Gradle plugin dependency.

## Dependency Reinstall
1. `npm install`
   - **Result:** Failed with peer-dependency conflict (`@betterat/domains-yachtracing` wants React 18 but the workspace overrides React 19).
2. `npm install --legacy-peer-deps`
   - **Result:** Succeeded; `undici` and other Expo CLI deps are now present again (warnings only).

## Cache & Build Maintenance
1. `./gradlew clean` (from `android/`)
   - **Result:** Still fails immediately with `xargs: sysconf(_SC_ARG_MAX) failed` followed by `Unable to locate a Java Runtime`. No Gradle tasks run because a JDK is missing in this environment.
2. `rm -rf android/.gradle android/build`
   - **Result:** Succeeded.
3. `rm -rf node_modules/.cache`
   - **Result:** Succeeded.
4. `npx expo start --port 8090 --reset-cache`
   - **Result:** Successfully booted Metro on a custom port (8081 was occupied). Process was terminated after cache reset since this CLI session must remain non-interactive.

## Android Build Attempt
- Command: `npm run android`
- **Result:** Expo CLI now gets far enough to spawn Gradle, but Gradle immediately aborts with `Unable to locate a Java Runtime`. The JDK requirement therefore remains the primary blocker; until Java (e.g., Temurin 17) is installed, any Android build or `./gradlew` command will fail regardless of the Kotlin version.

## Recommendation
- Because the Android toolchain is currently blocked by the missing JDK, continue focusing on iOS builds until Java is installed. After installing a Java 17+ runtime, rerun the cleanup commands (`./gradlew clean`, `npx expo start --port 8090 --reset-cache`), keep Metro running in another terminal, and retry `npm run android`.
