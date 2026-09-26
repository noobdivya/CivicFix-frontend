import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/command/Header";
import { Footer } from "@/components/landing/Footer";
import { TrackView } from "@/components/track/TrackView";

export const metadata: Metadata = {
  title: "Track your complaint — CivicFix",
  description: "Check the status of your civic complaint with your tracking ID and mobile number.",
};

export default function TrackPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Suspense>
          <TrackView />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
