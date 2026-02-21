# 🛒 Zelo Web App

**Zelo** is a modern, ultra-fast 10-minute grocery delivery web application built to enterprise industry standards. This project leverages the latest web technologies to deliver a seamless shopping, checkout, and live-tracking experience.

![Zelo Demo Preview](#) <!-- Add preview image link here when available -->

---

## 🚀 Tech Stack

Zelo is built on a robust, modern technology stack ensuring scalability, performance, and best-in-class developer experience:

- **Framework:** [Next.js 14+] App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Framer Motion (Glassmorphism & Micro-animations)
- **State Management:**
  - **Global/Local UI State:** Zustand
  - **Server State (Caching/Sync):** SWR / React Query (conceptually adopted)
- **Backend & Database:** Firebase (Firestore, Auth, Storage)

---

## 📁 File Structure & Architecture

We follow a feature-based, scalable architecture designed for easy onboarding and maintenance.

```text
zelo/
├── public/                 # Static assets (images, icons)
├── src/
│   ├── app/                # Next.js App Router (Pages & Layouts)
│   │   ├── admin/          # Admin Dashboard routes
│   │   ├── agent/          # Delivery Partner routes
│   │   ├── order/[id]/     # Live Order Tracking
│   │   ├── ...             # Other routes (home, profile, checkout)
│   ├── components/         # Reusable UI Components
│   │   ├── ui/             # Base level components (Buttons, Inputs, Dialogs)
│   │   ├── features/       # Complex domain-specific components
│   │   └── layouts/        # Page wrappers and structural components
│   ├── store/              # Zustand global state slices
│   │   ├── useAuthStore.ts
│   │   ├── useCartStore.ts
│   │   └── useOrderStore.ts
│   ├── lib/                # Core utilities, Firebase init & dispatch logic
│   ├── hooks/              # Custom React hooks (e.g., useRequireAuth)
│   └── types/              # Global TypeScript interfaces
└── README.md               # Project documentation
```

---

## 🏗 Industry Standards & Best Practices

When contributing to Zelo, please adhere to the following established standards:

### 1. State Management 🗃️
- **Zustand** is used for persistent UI state (e.g., Cart Items, Auth Session).
- Avoid Prop Drilling. Components should subscribe directly to the slices of state they need.
- **Local State** (`useState`) is strictly for UI-only ephemeral state (e.g., dropdown open/close).

### 2. Firebase & Data Fetching ⚡
- We use a **Flat NoSQL Structure** to minimize complex queries and avoid deep nesting.
- Favor specialized custom hooks for Firebase operations (separating UI from database logic).
- Security rules are paramount. Database reads/writes are strictly authenticated via Firebase Auth.

### 3. UI/UX Aesthetics 🎨
- **Visuals:** Embrace "Glassmorphism," vibrant yet accessible colors, and modern typography (Geist/Inter).
- **Animations:** Use `framer-motion` for page transitions, staggered list loading, and micro-interactions. Modals and drawers should slide or fade smoothly.
- **Performance:** Images must utilize native lazy loading (`loading="lazy"`) and optimized Next.js `<Image>` tags where applicable to reduce Time-to-Interactive (TTI).
- **Responsiveness:** All pages are mobile-first, ensuring parity across desktop, tablet, and mobile viewing.

---

## 💻 Getting Started (Local Development)

### Prerequisites

- Node.js (v18 or higher)
- npm, yarn, pnpm, or bun

### 1. Environment Setup

Create a `.env.local` file in the root directory and configure your Firebase project variables:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```
*(Contact an administrator for development environment keys if needed).*

### 2. Installation & Running

Install dependencies and start the local development server:

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. Pages auto-update as you edit the source files.

---

## 🛠 Deployment

Deployment is fully automated through Vercel or Netlify.
When pushing to the `main` branch, ensure your features are thoroughly tested. Check the deployment provider's dashboard for active CI/CD logs.

---
*Built with ❤️ by the Zelo Engineering Team.*
