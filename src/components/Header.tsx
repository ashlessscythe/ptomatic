"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "@/components/auth/SessionProvider";
import { Role } from "@prisma/client";
import { signOut } from "next-auth/react";

const Header = () => {
  const { session } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: process.env.NEXT_PUBLIC_BASE_URL });
  };

  const getRoleBasedLinks = () => {
    if (!session?.user) return null;

    const links = [];
    const { role } = session.user;

    switch (role) {
      case Role.ADMIN:
        links.push(
          <Link key="admin" href="/admin">
            <Button variant="ghost">Admin Panel</Button>
          </Link>,
          <Link key="manager" href="/manager">
            <Button variant="ghost">Team Dashboard</Button>
          </Link>,
          <Link key="approver" href="/approver">
            <Button variant="ghost">Department Requests</Button>
          </Link>
        );
        break;
      case Role.MANAGER:
        links.push(
          <Link key="manager" href="/manager">
            <Button variant="ghost">Team Dashboard</Button>
          </Link>
        );
        break;
      case Role.APPROVER:
        links.push(
          <Link key="approver" href="/approver">
            <Button variant="ghost">Department Requests</Button>
          </Link>
        );
        break;
    }

    // All authenticated users get access to their dashboard
    if (session.user.status !== "PENDING") {
      links.push(
        <Link key="dashboard" href="/dashboard">
          <Button variant="ghost">My Dashboard</Button>
        </Link>
      );
    }

    return links;
  };

  return (
    <header className="flex justify-between items-center p-4 bg-white border-b">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold">
          <Link href="/">PTO-matic</Link>
        </h1>
        {session && <div className="flex gap-2">{getRoleBasedLinks()}</div>}
      </div>
      <div>
        {session ? (
          <div className="flex items-center gap-4">
            <span>{session.user.name}</span>
            <Button onClick={handleSignOut} variant="outline">
              Sign out
            </Button>
          </div>
        ) : (
          <Link href="/auth/signin">
            <Button variant="outline">Sign in</Button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
