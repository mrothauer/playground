# B-Sprache – Android-App

Native Android-App mit derselben Funktion wie `../b-sprache`: Der eingegebene Text wird
live übersetzt (nach jedem Vokal kommt der Hauptbuchstabe + Vokal, Doppellaute wie
„ei“ werden zu „eibei“).

- Hauptbuchstabe wählbar (Tippen auf den Buchstaben im Titel), wird gespeichert
- 🔊 Vorlesen der Übersetzung (Android-Sprachausgabe, deutsche Stimme)
- Kopieren, Teilen, Leeren, Zeichenzähler
- Text aus anderen Apps per „Teilen → B-Sprache“ empfangen
- Einhorn-Design mit Animationen, Dark Mode

**APK:** `dist/b-sprache.apk` (Android 7.0+)

## Bauen

Kein Gradle nötig – `build.sh` nutzt direkt aapt2, javac, d8 und apksigner.
Erwartet JDK 17 und Android SDK (platform 34, build-tools 34.0.0) unter `~/android-tools`
(oder `JAVA_HOME` / `ANDROID_HOME` setzen).

    ./build.sh

Signiert wird mit `~/android-tools/b-sprache-release.jks` (wird beim ersten Build erzeugt).
Updates einer installierten App gehen nur mit demselben Schlüssel.

## Test

`test/` vergleicht die Java-Übersetzung mit dem Original-JavaScript:

    javac -d /tmp/t src/de/rothauer/bsprache/BSprache.java test/Compare.java
    diff <(node test/compare.js test/cases.txt f) <(java -cp /tmp/t Compare test/cases.txt f)
