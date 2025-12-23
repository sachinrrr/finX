import Link from "next/link";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-white border-t border-gray-200 overflow-hidden">
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <h3 className="text-xl font-semibold tracking-tight text-slate-900">FINX</h3>
            </Link>
            <p className="text-slate-600 text-sm leading-relaxed">
              A secure, minimal finance workspace built for clear decisions.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              <a 
                href="#" 
                className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 group"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4 text-slate-600 group-hover:text-slate-900 transition-colors" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 group"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4 text-slate-600 group-hover:text-slate-900 transition-colors" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 group"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4 text-slate-600 group-hover:text-slate-900 transition-colors" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 group"
                aria-label="Email"
              >
                <Mail className="w-4 h-4 text-slate-600 group-hover:text-slate-900 transition-colors" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-slate-900 font-semibold tracking-tight mb-4">Product</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/dashboard" className="text-slate-600 hover:text-slate-900 transition-colors text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="#features" className="text-slate-600 hover:text-slate-900 transition-colors text-sm">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-600 hover:text-slate-900 transition-colors text-sm">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-600 hover:text-slate-900 transition-colors text-sm">
                  Updates
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-slate-900 font-semibold tracking-tight mb-4">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-slate-600 hover:text-slate-900 transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-600 hover:text-slate-900 transition-colors text-sm">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-600 hover:text-slate-900 transition-colors text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-600 hover:text-slate-900 transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-slate-900 font-semibold tracking-tight mb-4">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-slate-600 hover:text-slate-900 transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-600 hover:text-slate-900 transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-600 hover:text-slate-900 transition-colors text-sm">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-600 hover:text-slate-900 transition-colors text-sm">
                  Security
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-600 text-sm">
              © {currentYear} FINX. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-slate-600 hover:text-slate-900 transition-colors text-sm">
                Sitemap
              </Link>
              <Link href="#" className="text-slate-600 hover:text-slate-900 transition-colors text-sm">
                Accessibility
              </Link>
              <Link href="#" className="text-slate-600 hover:text-slate-900 transition-colors text-sm">
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
