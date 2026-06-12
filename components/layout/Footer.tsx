import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="w-full bg-surface border-t border-border py-8 px-6">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="JobPilot Logo" width={32} height={32} />
          <span className="text-[19px] font-bold text-text-darkest">JobPilot</span>
        </Link>
        <div className="flex items-center gap-8 mt-4 md:mt-0">
          <Link href="/dashboard" className="text-[14px] font-medium text-text-dark">Dashboard</Link>
          <Link href="#" className="text-[14px] font-medium text-text-dark">Privacy Policy</Link>
          <Link href="#" className="text-[14px] font-medium text-text-dark">Terms & Condition</Link>
        </div>
      </div>
    </footer>
  );
}
