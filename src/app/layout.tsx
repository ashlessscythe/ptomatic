import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { Providers } from "@/components/auth/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PTO-matic",
  description: "PTO Management System",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <header className="flex justify-between items-center p-4 bg-white border-b">
            <h1 className="text-xl font-semibold">
              <Link href="/">PTO-matic</Link>
            </h1>
            <div>
              {session ? (
                <div className="flex items-center gap-4">
                  <span>{session.user.name}</span>
                  <form action="/api/auth/signout" method="POST">
                    <Button type="submit" variant="outline">
                      Sign out
                    </Button>
                  </form>
                </div>
              ) : (
                <Link href="/auth/signin">
                  <Button variant="outline">Sign in</Button>
                </Link>
              )}
            </div>
          </header>
          {children}
        </Providers>
      </body>
    </html>
  );
}
