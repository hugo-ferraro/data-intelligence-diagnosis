# Data Maturity Diagnosis - Next.js

This is a Next.js version of the data maturity diagnostic application, converted from the original Vite project.

## Features

- **Multi-step diagnostic form** with progress tracking
- **Real-time scoring** based on user responses
- **PDF generation** for diagnostic results
- **Responsive design** with modern UI components
- **Analytics integration** (Google Tag Manager, Google Analytics, Facebook Pixel)
- **Database integration** for storing diagnostic data

## Pages

- **Home** (`/`) - Landing page with diagnostic introduction
- **Diagnostic** (`/diagnostic`) - Multi-step form for data collection
- **Results** (`/results`) - Detailed analysis and scoring results

## Setup

1. Install dependencies:
```bash
npm install --legacy-peer-deps
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── diagnostic/        # Diagnostic form page
│   ├── results/           # Results display page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # UI components (shadcn/ui)
├── content/              # Static content and dictionaries
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and services
│   ├── database/         # Database configuration
│   ├── services/         # API services
│   ├── pdf-generator.tsx # PDF generation logic
│   ├── scoring.ts        # Scoring algorithms
│   └── utils.ts          # Utility functions
└── types/                # TypeScript type definitions
```

## Key Differences from Vite Version

- Uses Next.js App Router instead of React Router
- Client-side navigation with `useRouter` from Next.js
- Server-side rendering capabilities
- Optimized for production deployment
- Better SEO support

## Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Radix UI** - Accessible components
- **React Hook Form** - Form handling
- **PDF generation** - Client-side PDF creation
- **Analytics** - Google Tag Manager integration

## Development

The application maintains the same functionality as the original Vite version while leveraging Next.js features for better performance and developer experience.
