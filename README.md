# ReCard Client

This is the frontend client for ReCard, built with React and Vite.

*Last Updated: May 28, 2025*

## Getting Started

### Prerequisites

- Node.js (version 14.18+ or 16+)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in development mode.\
Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

The page will automatically reload when you make changes.\
You'll see any lint errors in the console.

### `npm run build`

Builds the app for production to the `dist` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include hashes for cache busting.\
Your app is ready to be deployed!

### `npm run preview`

Locally preview the production build.\
This command will serve your built assets from the `dist` folder.

### `npm run lint`

Runs ESLint to check for code style issues and potential errors.

## Environment Variables

Create a `.env` file in the root of the project with the following variables:

```
# API Configuration
VITE_BASE_URL=your_api_base_url

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

# Authentication Redirects
VITE_EMAIL_VERIFICATION_REDIRECT_URL=your_email_verification_redirect_url
VITE_PASSWORD_RESET_REDIRECT_URL=your_password_reset_redirect_url
```

## Project Structure

```
recardclient/
├── public/           # Static files
├── src/              # Source files
│   ├── components/   # React components
│   ├── config/       # Configuration files (including Firebase config)
│   ├── context/      # React context providers
│   ├── elements/     # Reusable UI elements
│   │   ├── Dropdown/
│   │   ├── InfoDisplay/
│   │   └── ToggleSwitch/
│   ├── pages/        # Page components
│   ├── services/     # API and service functions
│   ├── styling/      # Global styles and styling utilities
│   │   ├── globals.scss
│   │   ├── mixins.scss
│   │   └── variables.scss
│   ├── types/        # TypeScript type definitions
│   ├── utils/        # Utility functions
│   ├── App.tsx       # Root component
│   ├── App.scss      # App-specific styles
│   ├── main.tsx      # Application entry point
│   └── main.css      # Global styles
├── index.html        # Entry HTML file
├── vite.config.js    # Vite configuration
├── tsconfig.json     # TypeScript configuration
└── package.json      # Project dependencies and scripts
```

## Built With

- [React](https://reactjs.org/) - Frontend library
- [Vite](https://vitejs.dev/) - Build tool and development server
- [TypeScript](https://www.typescriptlang.org/) - Type safety
