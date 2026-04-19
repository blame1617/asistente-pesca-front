import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Asistente de Pesca Local",
  description: "Fase 1 - IA MultiCloud",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-900 antialiased m-0 p-0">
        {children}
      </body>
    </html>
  );
}