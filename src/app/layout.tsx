import type { Metadata } from "next";
import { Noto_Sans_Thai, Noto_Serif_Thai } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-sans",
  subsets: ["thai"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const notoSerifThai = Noto_Serif_Thai({
  variable: "--font-serif",
  subsets: ["thai"],
  weight: ["400", "600", "700"],
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
      className={`${notoSansThai.variable} ${notoSerifThai.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-gray-800">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
