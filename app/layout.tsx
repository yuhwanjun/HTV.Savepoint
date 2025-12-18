import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Save Point",
  description: "Interactive Point Cloud Exhibition",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <div className="kiosk-container">
          <div className="kiosk-frame">{children}</div>
        </div>
      </body>
    </html>
  );
}
