# ReCard Client

This is the frontend client for ReCard, built with React and Vite.

*Last Updated: February 12, 2025*

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
├── public/                    # Static files and assets
│   ├── account.png
│   ├── credit-card-*.png      # App icons
│   ├── favicon.ico
│   ├── loader-circle.svg
│   └── manifest.json
├── src/                       # Source files
│   ├── components/            # React components
│   │   ├── AppHeader/         # Application header component
│   │   ├── AppSidebar/        # Application sidebar navigation
│   │   ├── CreditCardDetailView/  # Credit card details display
│   │   ├── CreditCardManager/     # Credit card management interface
│   │   ├── CreditCardPreviewList/ # Credit card list previews
│   │   ├── CreditCardSelector/    # Credit card selection components
│   │   ├── HistoryPanel/          # Transaction history display
│   │   ├── Modal/                 # Modal components and hooks
│   │   ├── MyCardsList/           # User's credit cards list
│   │   ├── PageFooter/            # Application footer
│   │   ├── PageHeader/            # Page header component
│   │   ├── PreferencesModule/     # User preferences management
│   │   ├── PromptWindow/          # AI chat interface
│   │   ├── ui/                    # Reusable UI components (shadcn/ui)
│   │   │   ├── dialog/            # Dialog components
│   │   │   └── dropdown-menu/     # Dropdown menu components
│   │   └── UniversalContentWrapper/ # Content wrapper component
│   ├── config/                # Configuration files
│   │   └── firebase.jsx       # Firebase configuration
│   ├── context/               # React context providers
│   │   ├── AuthContext.tsx    # Authentication context
│   │   ├── ProtectedRoute.tsx # Route protection wrapper
│   │   └── RedirectIfAuthenticated.tsx # Auth redirect logic
│   ├── elements/              # Reusable UI elements
│   │   ├── Dropdown/          # Custom dropdown component
│   │   ├── InfoDisplay/       # Information display component
│   │   └── ToggleSwitch/      # Toggle switch component
│   ├── hooks/                 # Custom React hooks
│   │   ├── useFullHeight.ts   # Full height management hook
│   │   ├── usePageBackground.ts # Page background management
│   │   └── useScrollHeight.ts # Scroll height utilities
│   ├── icons/                 # SVG icons and icon components
│   │   ├── cards.tsx          # Credit card icons
│   │   └── index.tsx          # Icon exports
│   ├── lib/                   # Library utilities
│   │   └── utils.ts           # Utility functions (shadcn/ui utils)
│   ├── pages/                 # Page components
│   │   ├── account/           # Account management page
│   │   ├── authentication/    # Auth pages (signin, signup, etc.)
│   │   ├── history/           # Transaction history page
│   │   ├── my-cards/          # Credit cards management page
│   │   └── preferences/       # User preferences page
│   ├── services/              # API and service functions
│   │   ├── AuthService.ts     # Authentication service
│   │   ├── CardService.ts     # Credit card operations
│   │   ├── ChatService.ts     # AI chat service
│   │   └── UserService.ts     # User management service
│   ├── styling/               # Global styles and styling utilities
│   │   ├── globals.scss       # Global style definitions
│   │   ├── mixins.scss        # SCSS mixins
│   │   └── variables.scss     # SCSS variables
│   ├── types/                 # TypeScript type definitions
│   │   ├── AuthTypes.ts       # Authentication types
│   │   ├── ChatTypes.ts       # Chat/AI related types
│   │   ├── Constants.ts       # Application constants
│   │   ├── CreditCardTypes.ts # Credit card types
│   │   ├── Pages.ts           # Page-related types
│   │   └── UserTypes.ts       # User management types
│   ├── utils/                 # Utility functions
│   │   └── index.ts           # Utility exports
│   ├── App.tsx                # Root component
│   ├── App.scss               # App-specific styles
│   ├── main.tsx               # Application entry point
│   └── main.css               # Global styles
├── components.json            # shadcn/ui component configuration
├── index.html                 # Entry HTML file
├── postcss.config.js          # PostCSS configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
├── vite.config.js             # Vite configuration
└── package.json               # Project dependencies and scripts
```

## Built With

- [React](https://reactjs.org/) - Frontend library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vite](https://vitejs.dev/) - Build tool and development server
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Re-usable component library
- [Firebase](https://firebase.google.com/) - Authentication and backend services
- [SCSS](https://sass-lang.com/) - CSS preprocessor
