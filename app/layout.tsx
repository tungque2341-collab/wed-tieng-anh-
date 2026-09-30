import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Học Tiếng Anh Cùng Cô Giáo Trinh",
  description: "Website học tiếng Anh cho học sinh và giáo viên",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
