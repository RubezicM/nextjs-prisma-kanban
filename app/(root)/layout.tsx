import Header from "@/components/shared/header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <main className="w-full max-w-7xl flex-1 p-5 md:px-10 lg:mx-auto">{children}</main>
    </div>
  );
}
