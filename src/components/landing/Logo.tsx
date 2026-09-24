import Image from "next/image";

export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <Image src="/logo.png" alt="" width={32} height={32} className="size-8" priority />
      <span className="text-lg font-bold tracking-tight text-fg">
        Civic<span className="text-accent">Fix</span>
      </span>
    </span>
  );
}
