# ReCard Client

This is the frontend client for ReCard, built with React and Vite.

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

## Project Structure

```
recardclient/
├── public/           # Static files
├── src/             # Source files
│   ├── components/  # React components
│   ├── config/      # Configuration files
│   ├── context/     # React context providers
│   ├── pages/       # Page components
│   ├── services/    # API and service functions
│   ├── types/       # TypeScript type definitions
│   ├── utils/       # Utility functions
│   ├── App.jsx      # Root component
│   ├── App.scss     # App-specific styles
│   ├── main.tsx     # Application entry point
│   └── main.css     # Global styles
├── index.html       # Entry HTML file
├── vite.config.js   # Vite configuration
├── tsconfig.json    # TypeScript configuration
└── package.json     # Project dependencies and scripts
```

## Built With

- [React](https://reactjs.org/) - Frontend library
- [Vite](https://vitejs.dev/) - Build tool and development server
- [TypeScript](https://www.typescriptlang.org/) - Type safety
