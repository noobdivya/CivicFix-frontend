import { Header } from "@/components/command/Header";
import { Footer } from "@/components/landing/Footer";

export default function ReportLayout({ children }: LayoutProps<"/report">) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
