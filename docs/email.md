Here’s the markdown format for the Resend setup with Next.js and the Resend Node.js SDK:

---

### **Resend with Next.js**

#### **Overview**

Learn how to send your first email using **Next.js** and the **Resend Node.js SDK**. Follow these steps to quickly integrate email sending capabilities into your Next.js application.

---

### **Prerequisites**

To follow this guide, make sure you have:

- Created an API key on Resend.
- Verified your domain for sending emails.

---

### **Setup Steps**

#### 1. Install Resend SDK

Use the following command to install the Resend Node.js SDK:

```bash
# Using npm
npm install resend

# Using yarn
yarn add resend

# Using pnpm
pnpm add resend
```

---

#### 2. Create an Email Template

Define an email template to use for sending emails. Create the file in `components/email-template.tsx`:

```typescript
// components/email-template.tsx

import * as React from "react";

interface EmailTemplateProps {
  firstName: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
}) => (
  <div>
    <h1>Welcome, {firstName}!</h1>
  </div>
);
```

---

#### 3. Send Email Using React

Create an API route to handle sending emails. Use `pages/api/send.ts` if you’re using the Pages Router or `app/api/send/route.ts` if you’re using the App Router.

```typescript
// pages/api/send.ts or app/api/send/route.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { EmailTemplate } from "../../components/EmailTemplate";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { data, error } = await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: ["delivered@resend.dev"],
    subject: "Hello world",
    react: EmailTemplate({ firstName: "John" }),
  });

  if (error) {
    return res.status(400).json(error);
  }

  res.status(200).json(data);
};
```

---

#### 4. Try it Yourself

Run your project and test the email sending functionality by accessing the API route at `/api/send`.

- **Next.js Example (Pages Router)**: [Full source code](#)
- **Next.js Example (App Router)**: [Full source code](#)

---

### **Resources**

- **Resend Documentation**: [Documentation](https://resend.dev/docs)
- **API Reference**: [API Reference](https://resend.dev/api)

---

This guide covers the essential steps to configure Resend with Next.js for sending emails. Let me know if you’d like more details on any step!
