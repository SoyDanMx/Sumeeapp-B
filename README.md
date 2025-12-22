# Sumee App B

A modern service marketplace platform built with Next.js that connects clients with professional service providers. Sumee App B features AI-powered assistance, real-time geolocation, secure payments, and comprehensive dashboards for both clients and professionals.

## ✨ Features

- **Service Marketplace**: Browse and book professional services across multiple categories
- **AI Assistant**: Intelligent chatbot powered by Google Gemini for service recommendations and support
- **Geolocation Services**: Find nearby professionals and optimize service delivery
- **Secure Payments**: Integrated Stripe payment processing with subscription management
- **Professional Dashboard**: Comprehensive tools for service providers to manage leads and bookings
- **Client Dashboard**: Easy-to-use interface for clients to track service requests and history
- **Real-time Notifications**: Live updates for new leads and service status changes
- **Mobile Responsive**: Optimized experience across all devices

## 🚀 Getting Started

### Prerequisites

Make sure you have Node.js 18+ installed on your machine.

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up your environment variables (see [Environment Setup](#environment-setup))

### Development

Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

You can start editing the pages by modifying files in `src/app/`. The application auto-updates as you edit files.

## 🛠️ Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# AI Configuration
GOOGLE_AI_API_KEY=your_gemini_api_key
```

## 🧪 Testing

Run the test suite:

```bash
npm run test
# or
yarn test
```

Run tests with UI:

```bash
npm run test:ui
# or
yarn test:ui
```

Generate coverage report:

```bash
npm run test:coverage
# or
yarn test:coverage
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # Reusable React components
├── lib/                   # Utility functions and configurations
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
├── context/               # React context providers
└── providers/             # Application providers
```

## 🔧 Built With

- **[Next.js 15](https://nextjs.org)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Supabase](https://supabase.com/)** - Backend as a Service with PostgreSQL
- **[Stripe](https://stripe.com/)** - Payment processing
- **[Google Maps API](https://developers.google.com/maps)** - Geolocation and mapping
- **[Google Gemini AI](https://ai.google.dev/)** - AI-powered assistance
- **[React Query](https://tanstack.com/query)** - Data fetching and caching
- **[Vitest](https://vitest.dev/)** - Testing framework

## 📚 Learn More

To learn more about the technologies used in this project:

- **[Next.js Documentation](https://nextjs.org/docs)** - Learn about Next.js features and API
- **[Learn Next.js](https://nextjs.org/learn)** - Interactive Next.js tutorial
- **[Supabase Docs](https://supabase.com/docs)** - Database and authentication guide
- **[Stripe Documentation](https://stripe.com/docs)** - Payment integration guide

## 🚀 Deployment

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Other Deployment Options

This application can also be deployed on:
- **Netlify**
- **Railway**
- **DigitalOcean App Platform**
- **AWS Amplify**

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.
