import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fovelle — A quiet place for your images',
  description: 'A fast, minimal image viewer made for macOS.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
