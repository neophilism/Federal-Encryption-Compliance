import type {
  Metadata,
} from "next";
import "./globals.css";

export const metadata: Metadata = {
  title:
    "Federal Encryption Compliance",
  description:
    "Federal Data Encryption Act compliance administration and oversight",
};

export default function RootLayout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
