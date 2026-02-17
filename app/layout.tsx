export const metadata = {
  title: "Vedic Astrology GPT",
  description: "AI-powered Vedic astrology app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
