# 📱 Touch Social App - React Native Navigation Setup

This document explains how the navigation system is initialized and structured in the **Touch** mood-based social media app.

---

## 🚀 Project Goal

Initialize a React Native mobile app skeleton with:
- **Bottom tab navigation**
- **Stack navigation** for settings/profile sections
- Functional routes for all major screens

---

## 📁 Project Structure

```bash
app/
├── src/
│   ├── navigation/
│   │   ├── Navigation.tsx              # Bottom tab navigator with routes like Home, Profile, Reels
│   │   └── stack/
│   │       ├── ProfileStack.tsx        # Stack navigator for profile-related routes
│   │       └── CommunityStack.tsx      # (Optional) Stack for community screens
│   ├── screens/
│   │   ├── Feed.tsx                    # Home/Feed screen
│   │   ├── PostReels.tsx               # Reels posting/viewing
│   │   ├── SearchBar.tsx               # Mood-based search
│   │   ├── Communities.tsx             # List of communities
│   │   ├── ProfileTab.tsx              # Profile main screen
│   │   ├── Settings.tsx                # Settings menu
│   │   ├── EditProfile.tsx             # Profile editing
│   │   ├── ChangePassword.tsx          # Password management
│   │   ├── Notification.tsx            # Notifications settings
│   │   ├── Theme.tsx                   # Theme preference
│   │   ├── BlockedAccount.tsx          # Blocked users list
│   │   ├── Security.tsx                # Security controls
│   │   ├── AboutTouch.tsx              # About app screen
│   │   ├── Guildelines.tsx             # Community guidelines
│   │   └── Report.tsx                  # Bug reporting
```

---

## 📦 Libraries Installed

| Library                             | Purpose                                 |
|-------------------------------------|------------------------------------------|
| `@react-navigation/native`          | Core navigation handling                 |
| `@react-navigation/native-stack`    | Stack-based navigation                   |
| `@react-navigation/bottom-tabs`     | Bottom tab navigation for main layout    |
| `react-native-vector-icons`         | Icons throughout the app                 |
| `react-native-screens`              | Improves screen transition performance   |
| `react-native-safe-area-context`    | Handles device safe areas                |
| `react-native-gesture-handler`      | Touch gestures support                   |
| `react-native-reanimated`           | Required for animations in navigation    |
| `typescript`                        | Static typing in React Native            |
| `@types/*`                          | Type definitions for libraries           |

---

## 🧭 Navigation Setup

### Bottom Tab Routes (`Navigation.tsx`)
| Tab Name      | Component         | Description                 |
|---------------|------------------|-----------------------------|
| `Home`        | `Feed`           | Main feed of posts          |
| `Communities` | `CommunityStack` | Stack for group chats       |
| `Reels`       | `PostReels`      | Post or view reels          |
| `SearchBar`   | `SearchBar`      | Mood-filtered content       |
| `ProfileTab`  | `ProfileStack`   | Profile & settings section  |

### Stack Routes in `ProfileStack.tsx`
| Stack Name        | Description                          |
|-------------------|--------------------------------------|
| `ProfileHome`     | Main profile UI                      |
| `Settings`        | App preferences and user settings    |
| `EditProfile`     | Change username, bio, mood           |
| `ChangePassword`  | Update account password              |
| `Notifications`   | Control push alerts                  |
| `Theme`           | UI mode switching                    |
| `BlockedAccounts` | View and unblock users               |
| `Security`        | 2FA and session control              |
| `Touch`           | About the app                        |
| `Guildlines`      | Rules and policies                   |
| `Report`          | Submit bugs or feedback              |

---

## 🔄 Navigation Flow

- The `BottomTabNavigator` is the root navigator
- Each tab (like `ProfileTab`) contains its own nested `StackNavigator`
- Navigating from `ProfileHome` to `Settings`, then `ChangePassword`, and back uses `goBack()` to avoid duplicated stack entries

---

## ✅ Outcome

- App starts on Android device with bottom tab bar
- Each screen is accessible via navigation
- Back navigation is safe and prevents errors like `childCount may be incorrect`
- The architecture is modular and scalable for future features

---

## 🧠 Tips & Notes

- Always use unique names for nested screens to avoid conflicts (e.g., `ProfileHome` instead of `Profile`)
- Prefer `navigation.goBack()` for back navigation rather than re-navigating to a screen
- Use `SectionList` instead of `FlatList` when rendering settings with headers

---

🛠️ App skeleton complete — ready for feature integrations.
