import { CommandCenter } from "@/components/command/CommandCenter";
import { Header } from "@/components/command/Header";
import { About } from "@/components/landing/About";
import { Contact } from "@/components/landing/Contact";
import { Footer } from "@/components/landing/Footer";
import { LoginPortals } from "@/components/landing/LoginPortals";
import { OfficialMessages } from "@/components/landing/OfficialMessages";
import { ReportIssue } from "@/components/landing/ReportIssue";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <CommandCenter />
        <ReportIssue />
        <LoginPortals />
        <OfficialMessages />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
