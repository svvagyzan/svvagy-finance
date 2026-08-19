import './globals.css';

export const metadata = {
  title: 'Svvagy Finance',
  description: 'Manage keuanganmu sebagai Mahasiswa dengan mudah',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-zinc-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}