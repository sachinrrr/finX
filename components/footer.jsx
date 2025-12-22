import Link from "next/link";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-black border-t border-white/10 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black"></div>
      <div className="absolute inset-0 bg-grid-pattern-dark opacity-10"></div>
      
      {/* Subtle glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full filter blur-3xl"></div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text">
                FINX
              </h3>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Smart financial management to help you stay ahead of your finances and achieve your goals.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 group"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 group"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 group"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 group"
                aria-label="Email"
              >
                <Mail className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="#features" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  Updates
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                  Security
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} FINX. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                Sitemap
              </Link>
              <Link href="#" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                Accessibility
              </Link>
              <Link href="#" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
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
