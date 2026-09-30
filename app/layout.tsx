import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "미니 방명록",
  description: "이이삭 (202204258) 실기시험 - 미니 방명록",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body className="bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
