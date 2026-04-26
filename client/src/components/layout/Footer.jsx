import React from 'react';
import { Github, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-auto py-8 glass border-b-0 border-x-0 rounded-none bg-slate-50/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} VoteChain. Secure & Transparent E-Voting.
          </div>
          
          <div className="flex gap-4">
            <a href="#" className="p-2 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-full transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="p-2 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-full transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="p-2 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-full transition-colors">
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
