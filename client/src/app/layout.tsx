import type { Metadata } from 'next';
import { Poppins, Plus_Jakarta_Sans, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { SubscriptionProvider } from '@/context/SubscriptionContext';
import FloatingHelpCenter from '@/components/FloatingHelpCenter';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DocVault | Secure Document Management System',
  description: 'A modern, secure web application to store, organize, and manage personal documents, academic records, resumes, certificates, and client requirements in one central vault.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${plusJakartaSans.variable} ${inter.variable} ${jetbrainsMono.variable} dark scroll-smooth`}>
      <body className={`${poppins.className} bg-slate-50 text-slate-900 dark:bg-[#0b1120] dark:text-slate-100 transition-colors duration-200 antialiased selection:bg-[#FF6B00] selection:text-white`}>
        <AuthProvider>
          <ThemeProvider>
            <LanguageProvider>
              <SubscriptionProvider>
                {children}
                <FloatingHelpCenter />
              </SubscriptionProvider>
            </LanguageProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
