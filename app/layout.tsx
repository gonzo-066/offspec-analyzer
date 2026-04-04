import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Off-Spec Arrival Analyzer | Premium Fields",
  description:
    "Instant Accept or Reject decisions for fresh fruit arrivals — with full justification, claim guidance, and downloadable reports.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
