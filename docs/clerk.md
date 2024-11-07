Here's the guide in markdown format:

---

### **Setting Up Clerk Authentication in pto-matic**

#### **Overview**

You're just a couple of steps away from setting up your first user. Follow the steps below to get authenticated in less than 10 minutes.

For more information, check out [Clerk's docs on migrating existing users](https://clerk.dev/docs).

---

### **Framework Options**

Choose your framework to get started:

- **Next.js**
- **React**
- **Remix**
- **Astro**
- **Expo**
- **JavaScript**
- **TanStack Start**

---

### **Setup Instructions**

#### 1. Install `@clerk/nextjs`

Install the Clerk package for Next.js:

```bash
# Using npm
npm install @clerk/nextjs

# Using yarn
yarn add @clerk/nextjs

# Using pnpm
pnpm add @clerk/nextjs
```

---

#### 2. Set Your Environment Variables

Add the following keys to your `.env.local` file (create this file if it doesn’t exist). You can retrieve these keys anytime from the API keys page on Clerk’s dashboard.

**.env.local**

```plaintext
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bGliZXJhbC1tdWRmaXNoLTM2LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=••••••••••••••••••••••••••••••••••••••••••••••••••
```

---

#### 3. Update `middleware.ts`

Update or create a `middleware.ts` file in the root or `src/` directory of your project. This file configures Clerk's middleware for protected routes.

**middleware.ts**

```typescript
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
```

---

#### 4. Add `ClerkProvider` to Your App

Wrap your app with the `ClerkProvider` component. This enables Clerk’s hooks and components to manage authenticated content.

**Example: `/src/app/layout.tsx`**

```typescript
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
```

---

### **Create Your First User**

Run the app and visit `http://localhost:3000` to sign up your first user.

```bash
# Start the development server
npm run dev
```

---

### **Next Steps**

- **Custom Authentication Pages**: Use Clerk's customizable components to create a branded user experience.
- **Explore Clerk's Dashboard**: Manage users and view authentication activity directly in Clerk's [Dashboard](https://clerk.dev/dashboard).

---

This markdown file should provide a clean, step-by-step guide for setting up Clerk authentication in `pto-matic`. Let me know if you need further customization!
