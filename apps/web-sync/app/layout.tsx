import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NoAzul",
  description: "Backend de pagamento e sincronização do NoAzul.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
