import type { Metadata } from "next";
import "./globals.css";
import { readSession } from "@/lib/auth/session";
import { SessionProvider } from "@/components/shared/SessionProvider";

export const metadata: Metadata = {
  title: "TrustMesh",
  description:
    "Companies fund a project up front, students do the work, and the payment releases itself once the work is checked.",
};

/*
  Fonts are not fetched at build time. next/font pulls from Google Fonts while
  building, which fails without a network connection, and we would rather not
  find that out the night before the deadline. Inter is used if the machine has
  it, otherwise the system sans stack.
*/

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const account = readSession();

  return (
    <html lang="en">
      <body className="min-h-screen bg-page font-sans text-ink antialiased">
        <SessionProvider account={account}>{children}</SessionProvider>
      </body>
    </html>
  );
}
