import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-background border-t border-border overflow-hidden">
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <h3 className="text-xl font-semibold tracking-tight text-foreground">FINX</h3>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
              A secure, minimal finance workspace built for clear decisions.
            </p>
          </div>

          <p className="text-muted-foreground text-sm md:text-right">
            © {currentYear} FINX. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
