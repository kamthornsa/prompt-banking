import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai, Anuphan } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  variable: "--font-sans",
  subsets: ["thai"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const anuphan = Anuphan({
  variable: "--font-serif",
  subsets: ["thai"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CARIA Classroom Prompt Banking",
  description:
    "ธนาคารพรอมต์สำหรับครูโครงการ Kalasin CRAFT AI — พัฒนา Reading Literacy และ Critical Thinking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${ibmPlexSansThai.variable} ${anuphan.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-gray-800">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
