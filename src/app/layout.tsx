import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "IACREATIVATOOLS ",
  description: "INNOVATION BUSINESS TOOLS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
        
        {/* ✅ Chatbot de Elfsight - se mostrará */}
        <script src="https://static.elfsight.com/platform/platform.js" async></script>
        <div className="elfsight-app-3d6ceec1-90a2-4bfe-82a4-3c5e1c977041" data-elfsight-app-lazy></div>
      </body>
    </html>
  );
}