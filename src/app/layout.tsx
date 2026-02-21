import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import StoreInitializer from "@/components/layout/StoreInitializer";
import PageTransition from "@/components/layout/PageTransition";

export const metadata: Metadata = {
  title: "Zelo | Groceries at Lowest Prices",
  description: "Fresh groceries delivered right to your door in 10 minutes",
  icons: {
    icon: '/zelo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <StoreInitializer />
        <Header />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
