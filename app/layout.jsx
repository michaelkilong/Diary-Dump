import './globals.css';

export const metadata = {
  title: 'Diary Dump',
  description: 'Write it down, let it go. Someone will find it someday.',
  themeColor: '#0D0B09',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
