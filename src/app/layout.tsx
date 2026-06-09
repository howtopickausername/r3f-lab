import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shader Lab | R3F Demo",
  description: "Interactive shader demos with React Three Fiber",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full m-0 p-0 overflow-hidden bg-black">{children}</body>
    </html>
  );
}
