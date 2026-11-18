#!/usr/bin/env bash
# Builds dist/b-sprache.apk without Gradle, using only the Android SDK tools.
# Requires: JDK 17 + Android SDK (platforms;android-34, build-tools;34.0.0).
set -euo pipefail
cd "$(dirname "$0")"

TOOLS="${ANDROID_TOOLS:-$HOME/android-tools}"
export JAVA_HOME="${JAVA_HOME:-$TOOLS/jdk}"
SDK="${ANDROID_HOME:-$TOOLS/sdk}"
BT="$SDK/build-tools/34.0.0"
PLATFORM="$SDK/platforms/android-34/android.jar"
KEYSTORE="${KEYSTORE:-$TOOLS/b-sprache-release.jks}"
KS_PASS="${KS_PASS:-bsprache}"
PATH="$JAVA_HOME/bin:$PATH"

rm -rf build && mkdir -p build/gen build/classes build/dex dist

# 1. Compile resources and link them with the manifest; generates R.java
"$BT/aapt2" compile --dir res -o build/res.zip
"$BT/aapt2" link -o build/unsigned.apk -I "$PLATFORM" \
  --manifest AndroidManifest.xml --java build/gen build/res.zip --auto-add-overlay

# 2. Compile Java against android.jar
javac --release 8 -nowarn -classpath "$PLATFORM" -d build/classes \
  $(find src build/gen -name '*.java') 2>&1 | grep -v 'bootstrap\|^warning\|^1 warning' || true

# 3. Convert to dex and add to the APK
"$BT/d8" --release --min-api 24 --lib "$PLATFORM" --output build/dex $(find build/classes -name '*.class')
python3 -c 'import zipfile,sys; zipfile.ZipFile(sys.argv[1],"a",zipfile.ZIP_DEFLATED).write(sys.argv[2],"classes.dex")' build/unsigned.apk build/dex/classes.dex

# 4. Align and sign
"$BT/zipalign" -f -p 4 build/unsigned.apk build/aligned.apk
if [ ! -f "$KEYSTORE" ]; then
  keytool -genkeypair -keystore "$KEYSTORE" -storepass "$KS_PASS" -keypass "$KS_PASS" \
    -alias bsprache -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=B-Sprache" >/dev/null 2>&1
fi
"$BT/apksigner" sign --ks "$KEYSTORE" --ks-pass "pass:$KS_PASS" --out dist/b-sprache.apk build/aligned.apk
"$BT/apksigner" verify dist/b-sprache.apk
echo "Fertig: $(pwd)/dist/b-sprache.apk ($(du -h dist/b-sprache.apk | cut -f1))"
