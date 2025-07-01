# Page Background System

This system allows you to set different background colors for different pages while maintaining a default background.

## 🎯 Current Configuration

- **Home page (`/`, `/:chatId`)**: White background
- **Authentication pages (`/signin`, `/signup`, `/welcome`, `/forgotpassword`)**: White background  
- **All other pages**: Default light gray background (`$neutral-light-gray`)

## 🛠 How to Add/Change Page Backgrounds

### 1. Edit the Configuration

Open `src/hooks/usePageBackground.ts` and modify the `PAGE_BACKGROUNDS` object using the centralized `PAGES` configuration:

```typescript
const PAGE_BACKGROUNDS: Record<string, string> = {
  [PAGES.HOME.PATH]: 'bg-white',                    // Home page - white background
  [PAGES.SIGN_IN.PATH]: 'bg-white',                 // Sign in page - white background
  [PAGES.SIGN_UP.PATH]: 'bg-white',                 // Sign up page - white background
  [PAGES.WELCOME.PATH]: 'bg-white',                 // Welcome page - white background
  [PAGES.FORGOT_PASSWORD.PATH]: 'bg-white',         // Forgot password - white background
  
  // Add new page backgrounds here:
  [PAGES.PREFERENCES.PATH]: 'bg-primary',           // Primary color background
  [PAGES.ACCOUNT.PATH]: 'bg-dark',                  // Dark background
  [PAGES.HISTORY.PATH]: 'bg-light',                 // Light background (same as default)
  [PAGES.MY_CARDS.PATH]: 'bg-white',                // White background
};
```

> **Note**: Page paths are now centralized in `src/types/Pages.ts`. Always use `PAGES.[PAGE_NAME].PATH` instead of hardcoded strings to ensure consistency across your application.

### 2. Available Background Classes

- `bg-white` - White background (`$neutral-white`)
- `bg-light` - Light gray background (`$neutral-light-gray`) - same as default
- `bg-dark` - Dark gray background (`$neutral-dark-gray`) 
- `bg-primary` - Primary color background (`$primary-lightest`)

### 3. Adding New Background Colors

To add a new background color:

1. **Add the CSS class** in `src/styling/globals.scss`:
```scss
body.bg-custom {
  background-color: $your-custom-color;
}
```

2. **Add to the BACKGROUND_CLASSES** in `usePageBackground.ts`:
```typescript
export const BACKGROUND_CLASSES = {
  WHITE: 'bg-white',
  LIGHT: 'bg-light', 
  DARK: 'bg-dark',
  PRIMARY: 'bg-primary',
  CUSTOM: 'bg-custom',  // Add your new class
} as const;
```

3. **Use it in PAGE_BACKGROUNDS**:
```typescript
const PAGE_BACKGROUNDS: Record<string, string> = {
  [PAGES.MY_SPECIAL_PAGE.PATH]: 'bg-custom',  // Using centralized path configuration
  // ... other pages
};
```

## 🔧 Manual Background Control

You can also manually control backgrounds using the utility functions:

```typescript
import { setPageBackground, resetPageBackground, BACKGROUND_CLASSES } from '../hooks/usePageBackground';

// Set a specific background
setPageBackground(BACKGROUND_CLASSES.WHITE);

// Reset to default
resetPageBackground();
```

## 📝 How It Works

1. The `usePageBackground` hook monitors route changes using `useLocation`
2. When the route changes, it removes all background classes from `document.body`
3. It looks up the current route in the `PAGE_BACKGROUNDS` configuration
4. If a background is configured for that route, it adds the corresponding CSS class
5. If no background is configured, it falls back to the default CSS background

## ✨ Benefits

- **Easy to configure**: Just modify the `PAGE_BACKGROUNDS` object
- **Automatic cleanup**: Background classes are properly removed when switching pages
- **Fallback support**: Always falls back to default background if no specific one is set
- **TypeScript support**: Full type safety with `BACKGROUND_CLASSES` constants
- **Dynamic routes**: Handles routes like `/:chatId` automatically 