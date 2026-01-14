import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t border-slate-700/50 py-8 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-slate-400">
          © {new Date().getFullYear()} IGRS — All rights reserved.
        </div>
        <div className="flex gap-6">
          <Link
            href="/privacy"
            className="text-slate-400 hover:text-teal-400 transition-colors duration-300"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="text-slate-400 hover:text-teal-400 transition-colors duration-300"
          >
            Terms
          </Link>
          <Link
            href="/contact"
            className="text-slate-400 hover:text-teal-400 transition-colors duration-300"
          >
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
