# Splash Screen Insertion on Android

#### Documentation by IJ Roy

### Installing the dependencies
```
npm install react-native-splash-screen
```

### Define the splash screen style
1. Open the android/app/src/main/res/values/styles.xml file.
2. Added a custom SplashTheme  

***Code By ChatGPT***
```xml
<style name="SplashTheme" parent="Theme.AppCompat.Light.NoActionBar">
    <item name="android:windowBackground">@drawable/splash_screen</item>
</style>
```
***Final Code***
```xml
<resources>
    <!-- Base application theme. -->
    <style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar">
        <!-- Customize your theme here. -->
        <item name="android:editTextBackground">@drawable/rn_edit_text_material</item>
    </style>
    <style name="SplashTheme" parent="Theme.AppCompat.Light.NoActionBar">
    <item name="android:windowBackground">@drawable/splash_screen</item>
    </style>
</resources>
```
### Configure AndroidManifest.xml
1. Opened the file at **android/app/src/main/AndroidManifest.xml.**  
Add the Splash theme to the <application> tag:
```xml
android:theme="@style/SplashTheme"
```

2. Add a splash screen drawable

### Add a splash screen drawable
1. Add your splash logo png to the **android/app/src/main/res/drawable** folder (e.g., splash_logo.png).

2. Create a splash_screen.xml in the same folder with the following content:
```xml
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/splash_background" />
    <item>
        <bitmap
            android:gravity="center"
            android:src="@drawable/splash_logo" />
    </item>
</layer-list>
```

## My Mistake
Chatgpt told me to do few changes in **MainActivity.kt** File and in **App.tsx** file
that bug wasted my days but react library has already preinstalled that changes so no need to do that. And doing this will throw error