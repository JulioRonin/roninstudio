import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";

const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ronin Studio — Software e IA para la manufactura del norte de México",
  description:
    "Estudio de producto que crea software de ingeniería industrial e IA para la maquila del norte de México. Productos: GENBA (estudios de tiempo y Yamazumi desde un video) y Kanri (ERP/CRM para talleres CNC). Hecho por ingenieros de planta en Ciudad Juárez.",
  metadataBase: new URL("https://roninstudio.com.mx"),
  openGraph: {
    title: "Ronin Studio — Software e IA para la manufactura",
    description:
      "Convierte el video de una estación de trabajo en estudios de tiempo, Yamazumi y capacidad — en minutos, con IA. Hecho por ingenieros de planta en Ciudad Juárez.",
    type: "website",
    locale: "es_MX",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={urbanist.className}>
      <body>{children}</body>
    </html>
  );
}
