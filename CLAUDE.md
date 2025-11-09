# Bagpyp Portfolio Website - Developer Guide

## Overview

This is a Next.js-based portfolio website for Bagpyp Software Consultancy. The site features authentication via Auth0, payment processing via Stripe, and a project showcase.

## Technology Stack

- **Framework**: Next.js 15.5.6 (React 19.2.0)
- **Language**: TypeScript 5.9.3
- **Authentication**: Auth0 (@auth0/nextjs-auth0 ^4.12.0)
- **Payments**: Stripe (^9.8.0)
- **Styling**: Bootstrap 5.1.3 + CSS Modules
- **Testing**: Jest 29.7.0 + React Testing Library 16.3.0
- **Node Version**: >= 20.0.0 (23.10.0 recommended)

## Project Structure

```
bagpyp/
├── src/
│   ├── components/         # React components
│   │   ├── CheckoutForm.tsx
│   │   ├── ConsultancyService.tsx
│   │   ├── Layout.tsx
│   │   ├── LoginLogout.tsx
│   │   ├── ProjectDetail.tsx
│   │   └── Projects.tsx
│   ├── interfaces/
│   │   └── index.ts        # TypeScript interfaces
│   ├── pages/              # Next.js pages (file-based routing)
│   │   ├── api/            # API routes
│   │   │   ├── auth/[...auth0].js
│   │   │   └── make_payment/index.ts
│   │   ├── projects/
│   │   │   ├── [id].tsx
│   │   │   └── index.tsx
│   │   ├── _app.tsx
│   │   ├── contact.tsx
│   │   ├── error.tsx
│   │   ├── index.tsx
│   │   └── thanks.tsx
│   ├── styles/             # CSS modules & global styles
│   │   ├── ConsultancyService.module.css
│   │   ├── Layout.module.css
│   │   ├── LoginLogout.module.css
│   │   └── global.css
│   ├── utils/
│   │   ├── get-stripe.ts
│   │   └── sample-projects.ts
│   └── __tests__/          # Test files
│       ├── components/
│       └── pages/
├── public/                 # Static assets
│   ├── img/
│   │   ├── projects/
│   │   ├── defaultUser.png
│   │   └── logo.svg
│   └── favicon.ico
├── jest.config.js          # Jest configuration
├── jest.setup.js           # Jest setup
├── next.config.js          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
└── package.json
```

## Getting Started

### Prerequisites

- Node.js >= 20.0.0 (23.10.0 recommended)
- npm (comes with Node.js)
- asdf (optional - for version management)

If using asdf, the `.tool-versions` file specifies Node.js 23.10.0:
```bash
asdf install
```

### Environment Setup

1. Create a `.env.local` file in the root directory with the following variables:

```bash
# Auth0 Configuration
AUTH0_SECRET='your-auth0-secret'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://your-domain.auth0.com'
AUTH0_CLIENT_ID='your-client-id'
AUTH0_CLIENT_SECRET='your-client-secret'

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY='pk_test_...'
STRIPE_SECRET_KEY='sk_test_...'
STRIPE_API_VERSION='2020-08-27'
```

**IMPORTANT**: Never commit `.env.local` to version control!

### Installation

```bash
npm install
```

## Development

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Building for Production

```bash
npm run build
```

Creates an optimized production build in the `.next` directory.

### Starting Production Server

```bash
npm start
```

Runs the production server (requires `npm run build` first).

### Linting

```bash
npm run lint
```

Runs ESLint to check for code quality issues.

## Testing

### Running Tests

```bash
npm test
```

Runs all tests once.

### Watch Mode

```bash
npm run test:watch
```

Runs tests in watch mode for development.

### Test Coverage

Tests are located in `src/__tests__/` and mirror the structure of the source code:
- `src/__tests__/components/` - Component tests
- `src/__tests__/pages/` - Page tests

Current test suite includes:
- Layout component tests
- ConsultancyService component tests
- Index page tests
- Contact page tests
- Error page tests
- Thanks page tests

All tests use Jest and React Testing Library.

## Key Features

### 1. Authentication (Auth0)

- Login/logout functionality via Auth0
- User profile display when authenticated
- Protected contact information (requires login)

**Implementation**:
- Provider: `src/pages/_app.tsx` (uses `Auth0Provider` from `@auth0/nextjs-auth0/client`)
- Components: `src/components/LoginLogout.tsx` and `src/pages/contact.tsx` (use `useUser` hook from `@auth0/nextjs-auth0/client`)

### 2. Payment Processing (Stripe)

- Donation/payment form on homepage
- Stripe Checkout integration
- Success and error pages for payment flow

**Implementation**:
- Form: `src/components/CheckoutForm.tsx`
- API: `src/pages/api/make_payment/index.ts`
- Success page: `src/pages/thanks.tsx`
- Error page: `src/pages/error.tsx`

### 3. Project Showcase

- Static project gallery
- Individual project detail pages
- Dynamic routing via Next.js

**Implementation**:
- Data: `src/utils/sample-projects.ts`
- List: `src/pages/projects/index.tsx`
- Detail: `src/pages/projects/[id].tsx`

## API Routes

### `/api/auth/[...auth0]`
Auth0 authentication endpoints (login, logout, callback)

### `/api/make_payment`
POST endpoint for creating Stripe checkout sessions

**Request Body**:
```json
{
  "amount": 100  // Amount in cents
}
```

**Response**:
```json
{
  "id": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

## Making Changes

### Adding a New Page

1. Create a new file in `src/pages/` (e.g., `about.tsx`)
2. Use the `Layout` component for consistent header/footer
3. Export a default React component

Example:
```tsx
import Layout from "../components/Layout";

const About = () => {
  return (
    <Layout title="About">
      <h1>About Us</h1>
      <p>Content here</p>
    </Layout>
  );
};

export default About;
```

### Adding a New Component

1. Create a new file in `src/components/` (e.g., `MyComponent.tsx`)
2. Create corresponding CSS module in `src/styles/` if needed
3. Write tests in `src/__tests__/components/MyComponent.test.tsx`

### Modifying Styles

- **Global styles**: Edit `src/styles/global.css`
- **Component styles**: Edit corresponding `.module.css` file
- **Bootstrap**: Already imported globally in `src/pages/_app.tsx`

### Adding New Projects

Edit `src/utils/sample-projects.ts` and add new project objects with:
- `id`: Unique number
- `title`: Project name
- `description`: Short description
- `long_description`: Detailed description
- `tech_used`: Array of technologies
- `images`: Image filename(s) (in `/public/img/projects/`)

## Common Tasks

### Update Dependencies

```bash
npm update
```

**Note**: When updating major versions, be aware of breaking changes:
- Next.js 15+ requires updating `<Link>` components (no nested `<a>` tags)
- Auth0 v4+ uses new import paths (`@auth0/nextjs-auth0/client`)
- Next.js 14+ requires updating image config to use `remotePatterns`

### Check for Vulnerabilities

```bash
npm audit
```

### Format Code

The project uses Prettier for formatting. Configuration is in `.prettierrc`.

## Deployment

The site is configured for deployment on Vercel (see git history for deployment triggers).

### Environment Variables in Production

Set all environment variables from `.env.local` in your hosting platform's dashboard.

## Troubleshooting

### Build Fails

1. Clear the `.next` directory: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Try building again: `npm run build`

### Tests Fail

1. Make sure all mocks are properly configured
2. Check that React Testing Library queries are correct
3. Run tests in watch mode to debug: `npm run test:watch`

### Auth0 Issues

- Verify all Auth0 environment variables are set correctly
- Check that callback URLs are configured in Auth0 dashboard
- Ensure `AUTH0_BASE_URL` matches your deployment URL

### Stripe Issues

- Verify Stripe API keys are correct
- Check that you're using test keys in development
- Ensure webhook endpoints are configured if using webhooks

## Code Style Guidelines

- Use TypeScript for all new files
- Use functional components with hooks
- Use CSS Modules for component-specific styles
- Follow the existing naming conventions
- Write tests for new components and pages
- Keep components small and focused
- Use Next.js 13+ Link patterns (no nested `<a>` tags)
- Import Auth0 hooks from `@auth0/nextjs-auth0/client`

## Recent Changes

### Latest Update (2025)
- **Updated to Next.js 15.5.6** with React 19.2.0
- **Updated Auth0 to v4.12.0** with new import paths:
  - `Auth0Provider` from `@auth0/nextjs-auth0/client` (previously `UserProvider`)
  - `useUser` hook from `@auth0/nextjs-auth0/client`
- **Updated TypeScript to 5.9.3** with modern config (bundler moduleResolution)
- **Updated all Link components** to remove nested `<a>` tags (Next.js 13+ pattern)
- **Updated image configuration** to use `remotePatterns` instead of deprecated `domains`
- **Fixed Jest configuration** to handle ESM modules from Auth0
- **Added `.tool-versions` file** for asdf version management

### Previous Cleanup
- Removed unnecessary files (yarn.lock, temp files, .DS_Store)
- Deleted unused API endpoint (`/api/projects`)
- Converted all `.jsx` files to `.tsx` for consistency
- Fixed import path bugs
- Removed unnecessary React imports (React 17+ doesn't require them)
- Simplified fetch options in CheckoutForm
- Added comprehensive test suite with Jest and React Testing Library

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Auth0 Next.js SDK](https://github.com/auth0/nextjs-auth0)
- [Stripe Documentation](https://stripe.com/docs)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

## Support

For questions or issues, contact the development team or open an issue in the repository.
