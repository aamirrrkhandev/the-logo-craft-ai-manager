import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "The Logo Craft | AI Website Manager",
  description: "Read-only AI website operations and SEO management dashboard."
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
