import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SiteSense AI 🍁 | Autonomous Spatial Inspection & Memory Agent",
  description:
    "Enterprise Autonomous Spatial Inspection & Temporal Memory Agent for Canadian construction contractors, structural engineers, and home inspectors. Built for Build North Hackathon.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍁</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#060a12] text-slate-100 antialiased selection:bg-cyan-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
