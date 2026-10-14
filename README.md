# TransConnect Landing

Independent public VieGo website built with React, Vite and TypeScript. Vietnamese responsive service introduction, FAQ and a real public partner-application form. No booking, payment, mobile downloads or public application-status lookup are implemented.

## Local development

Requires Node.js 22.12+ (or supported newer LTS) and npm.

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Set VITE_API_BASE_URL to the backend origin (without /organizations). The example uses http://localhost:5000; replace it with the actual backend URL. The backend must allow this frontend origin in its CORS policy. No credentials or API secrets belong in VITE_* values, which are public browser configuration. The site renders without a backend; submissions require one.

## API integration

Anonymous POST /organizations sends only name (required, max 200), registrationNumber (required, max 100), ownerEmail (required valid email, max 256). The client parses the backend ApiResponse envelope: succeeded, message, errorCode, data and errors. Successful data must include id, name and reviewStatus. The receipt shows the returned reference and submission status; it does not simulate ongoing tracking. No form or receipt data is persisted in browser storage.

The form prevents duplicate concurrent submits, trims input, disables fields while submitting and handles server field validation, conflicts, rate limits, non-JSON responses, network failures and a 20-second timeout. In an ambiguous network failure a request may already have reached the backend; check existing registration before repeating.

## Verification and deployment

```powershell
npm run typecheck
npm run build
npm run preview
```

Deploy the dist directory to a static host after configuring VITE_API_BASE_URL at build time. Use HTTPS for both production website and backend. This folder builds independently; no sibling source imports, Git initialization or deployment are required. Fonts are bundled locally using @fontsource/inter. Artwork is original code SVG/CSS and needs no external image service.
