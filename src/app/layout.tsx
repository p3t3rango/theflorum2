import type { Metadata } from "next";
import { Inter, Press_Start_2P } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Florum Protocol",
  description: "A mystical character creation experience",
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" 
        />
      </head>
      <body className={`${inter.className} bg-black text-white min-h-screen min-h-[-webkit-fill-available]`}>
        <div className="fixed inset-0 overflow-y-auto">
          {children}
        </div>
      </body>
    </html>
  );
}
