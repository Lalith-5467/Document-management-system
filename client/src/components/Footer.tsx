'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Mail, Phone, MapPin, Github, Twitter, Linkedin, Youtube, Globe } from 'lucide-react';
import { cmsStore, CMSFooter, CMSSocial } from '@/lib/cmsStore';

export default function Footer() {
  const [footerInfo, setFooterInfo] = useState<CMSFooter>({
    companyName: 'DocVault Systems Inc.',
    logo: '🛡️ DocVault',
    address: '100 Cyber Vault Way, Tech District, SF, CA 94107',
    phone: '+1 (800) 555-DOCS',
    email: 'support@docvault.io',
    copyright: '© 2026 DocVault Systems Inc. All rights reserved.',
  });
  const [socials, setSocials] = useState<CMSSocial[]>([]);

  useEffect(() => {
    const unsub = cmsStore.subscribe((data) => {
      if (data.footer) setFooterInfo(data.footer);
      setSocials((data.socials || []).filter(s => s.status === 'active'));
    });
    return unsub;
  }, []);

  const renderSocialIcon = (iconName: string) => {
    const name = iconName.toLowerCase();
    if (name.includes('github')) return <Github className="w-4 h-4" />;
    if (name.includes('twitter') || name.includes('x')) return <Twitter className="w-4 h-4" />;
    if (name.includes('linkedin')) return <Linkedin className="w-4 h-4" />;
    if (name.includes('youtube')) return <Youtube className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
  };

  return (
    <footer className="bg-[#09090B] text-zinc-400 border-t border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF6B00] to-[#F97316] flex items-center justify-center text-white shadow-md shadow-orange-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-black text-lg text-white tracking-tight">{footerInfo.companyName || 'DocVault'}</span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              A secure, central document management system designed to organize personal records, academic credentials, resumes, and client requirements in one organized vault.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121215] border border-zinc-800 shadow-sm w-fit whitespace-nowrap mt-1">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs font-medium text-zinc-300 tracking-wide">
                AES-256 Encrypted <span className="text-zinc-600 mx-1">&bull;</span> Privacy First
              </span>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-wider mb-4">Contact Info</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5 text-zinc-300">
                <MapPin className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                <span>{footerInfo.address}</span>
              </li>
              <li className="flex items-center gap-2.5 text-zinc-300">
                <Phone className="w-4 h-4 text-[#FF6B00] shrink-0" />
                <span>{footerInfo.phone}</span>
              </li>
              <li className="flex items-center gap-2.5 text-zinc-300">
                <Mail className="w-4 h-4 text-[#FF6B00] shrink-0" />
                <span>{footerInfo.email}</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-[#FF6B00] transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#FF6B00] transition-colors">Sign In to Vault</Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#FF6B00] transition-colors">Create Account</Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#FF6B00] transition-colors">Admin Control Center</Link>
              </li>
            </ul>
          </div>

          {/* Social Media Links */}
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-wider mb-4">Connect With Us</h4>
            <p className="text-sm text-zinc-400 mb-4">
              Follow our official channels for platform updates, security releases, and news.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {socials.map((soc) => (
                <a
                  key={soc.id}
                  href={soc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-xl bg-[#121215] border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-[#FF6B00] hover:border-[#FF6B00]/50 transition-all"
                  title={soc.platform}
                >
                  {renderSocialIcon(soc.platform)}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 mt-12 border-t border-zinc-800/60 flex flex-col items-center justify-center gap-2 text-sm text-zinc-500">
          <p className="font-medium tracking-wide">{footerInfo.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
