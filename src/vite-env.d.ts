/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID: string;
  readonly VITE_BASE_URL: string;
  readonly VITE_EMAIL_VERIFICATION_REDIRECT_URL: string;
  readonly VITE_PASSWORD_RESET_REDIRECT_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}