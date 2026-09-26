import Link from "next/link";
import { Logo } from "./Logo";

const links = [
  { href: "/#home", label: "Home" },
  { href: "/report", label: "Report an issue" },
  { href: "/track", label: "Track complaint" },
  { href: "/login", label: "Staff login" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Logo />
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-fg">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-8 text-center text-sm text-subtle">
          &copy; {new Date().getFullYear()} CivicFix. Making cities work better, together.
        </p>
      </div>
    </footer>
  );
}
