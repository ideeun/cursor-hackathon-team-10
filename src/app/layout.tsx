import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SummerFlow — Лето без скуки",
  description:
    "Мобильное приложение для летних активностей, челленджей и сборов компании",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased">{children}</body>
    </html>
  );
}
