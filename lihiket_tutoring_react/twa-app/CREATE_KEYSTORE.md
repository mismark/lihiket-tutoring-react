# How to create your signing keystore

Run this command once on any machine with JDK 17 installed:

```bash
keytool -genkeypair \
  -v \
  -keystore keystore.jks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias lihiket \
  -storepass "YOUR_STORE_PASSWORD" \
  -keypass  "YOUR_KEY_PASSWORD" \
  -dname "CN=Lihiket Tutoring, OU=App, O=Lihiket, L=Addis Ababa, ST=Addis Ababa, C=ET"
```

Then get the SHA-256 fingerprint (needed for assetlinks.json):

```bash
keytool -list -v -keystore keystore.jks -alias lihiket -storepass "YOUR_STORE_PASSWORD"
```

Copy the SHA256 fingerprint and paste it into:
  client/public/.well-known/assetlinks.json

Then encode the keystore as base64 for GitHub Actions:

```bash
# Linux/macOS
base64 -i keystore.jks | tr -d '\n'

# Windows PowerShell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("keystore.jks"))
```

Paste the base64 output into GitHub → Settings → Secrets → Actions:
  - KEYSTORE_BASE64  = (the base64 string)
  - KEYSTORE_PASSWORD = YOUR_STORE_PASSWORD
  - KEY_ALIAS         = lihiket
  - KEY_PASSWORD      = YOUR_KEY_PASSWORD
