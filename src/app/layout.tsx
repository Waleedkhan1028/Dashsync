import "./globals.css";
import Providers from "./providers";
import { Outfit } from "next/font/google";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} font-sans antialiased text-gray-900 bg-gray-50`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
