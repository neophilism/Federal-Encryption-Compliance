import type {
  Metadata,
} from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default:
      "Federal Encryption Compliance",
    template:
      "%s · Federal Encryption Compliance",
  },
  description:
    "Federal encryption compliance operations, statutory oversight, remediation, certification, and reporting.",
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
