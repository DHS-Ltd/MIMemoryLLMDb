---
name: APK Deployment — Android Studio WebView Wrapper
description: BDC HMS is wrapped as an Android APK using a WebView in Android Studio. Key config: JavascriptInterface bridge for banner dismissal, localStorage for session persistence, configChanges for rotation.
type: project
---

The BDC HMS web app (GAS) is deployed as an Android APK using Android Studio with a single-Activity WebView wrapper.

**Package:** `com.bdchospital.management`
**Main class:** `MainActivity.java`
**App URL loaded:** GAS deployment URL (the `APP_URL` constant in MainActivity)

## WebView Configuration
- `setJavaScriptEnabled(true)` + `setDomStorageEnabled(true)` — required for GAS app to function
- `shouldOverrideUrlLoading` returns `false` — lets WebView follow GAS redirect chain (without this, white screen on load)
- `setCacheMode(LOAD_DEFAULT)` + `setMixedContentMode(MIXED_CONTENT_COMPATIBILITY_MODE)`
- `webView.saveState(outState)` / `restoreState(savedInstanceState)` — preserves WebView state across rotation

## Session Persistence Fix
`sessionStorage` was changed to `localStorage` in `JavaScript.html:242–254` (`saveSession`, `getToken`, `getUser`, `clearSession`).
**Why:** Android recreates the Activity on rotation by default, reloading the WebView and wiping `sessionStorage` → user logged out. `localStorage` survives reload. Server-side 8h TTL via `CacheService` still enforces expiry.

## Rotation Fix
`AndroidManifest.xml` activity tag has `android:configChanges="orientation|screenSize|keyboardHidden|screenLayout|uiMode"` — prevents Activity recreation on rotation, WebView stays alive.

## GAS Warning Banner Dismissal (JavascriptInterface Bridge)
**Problem:** The BDC app runs inside `<iframe id="sandboxFrame">` (origin: `googleusercontent.com`). The GAS warning banner (`#warning-bar-table`, `.warning-banner-close-icon`) lives in the parent Google frame (origin: `script.google.com`). Cross-origin — app JS cannot reach the banner DOM directly.

**Solution:** `BdcAndroidBridge` inner class in `MainActivity.java` with `@JavascriptInterface public void onLoginSuccess()`.
- Android injects the bridge into ALL WebView frames via `webView.addJavascriptInterface(new BdcAndroidBridge(), "BdcAndroid")`
- After login (and on `restoreSession`), `JavaScript.html` calls `window.BdcAndroid.onLoginSuccess()`
- The native method does `webView.post(() -> webView.evaluateJavascript(...))` — runs in the MAIN (outer) frame
- Injected JS: `document.querySelector('.warning-banner-close-icon').click()` — clicks the X button to dismiss banner
- Fallback: hides `#warning-bar-table` via CSS if close button not found

**JS.html entry points that call `hideGasBanner()`:**
1. `handleLogin()` — after `saveSession` + `showDashboard` on login success
2. `restoreSession()` — after `showDashboard` when token is still valid on app reopen

**Why:** `webView.evaluateJavascript()` always runs in the main WebView frame (the outer Google page), not in child iframes — this is how we cross the origin boundary safely from the Android side.
