import type { Metadata } from 'next';
import { Poppins, Plus_Jakarta_Sans, Outfit, Inter, JetBrains_Mono } from 'next/font/google';
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
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
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
    <html lang="en" className={`${poppins.variable} ${plusJakartaSans.variable} ${outfit.variable} ${inter.variable} ${jetbrainsMono.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                // Handle dark mode (defaults to light mode unless dark is explicitly saved)
                const savedTheme = localStorage.getItem('docvault-theme') || localStorage.getItem('dms_theme_mode') || localStorage.getItem('dms_theme');
                if (savedTheme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }

                // Handle custom themes
                const customThemeStr = localStorage.getItem('dms_custom_theme');
                if (customThemeStr) {
                  const colors = JSON.parse(customThemeStr);
                  const root = document.documentElement;
                  if (colors.primary_color) root.style.setProperty('--theme-primary', colors.primary_color);
                  if (colors.secondary_color) root.style.setProperty('--theme-secondary', colors.secondary_color);
                  if (colors.background_color) root.style.setProperty('--theme-bg', colors.background_color);
                  if (colors.sidebar_color) root.style.setProperty('--theme-sidebar', colors.sidebar_color);
                  if (colors.header_color) root.style.setProperty('--theme-header', colors.header_color);
                  if (colors.card_color) root.style.setProperty('--theme-card', colors.card_color);
                  if (colors.text_color) root.style.setProperty('--theme-text', colors.text_color);
                  if (colors.border_color) root.style.setProperty('--theme-border', colors.border_color);
                  if (colors.hover_color) root.style.setProperty('--theme-hover', colors.hover_color);
                  if (colors.button_color) root.style.setProperty('--theme-button', colors.button_color);
                  if (colors.button_text_color) root.style.setProperty('--theme-button-text', colors.button_text_color);
                  if (colors.success_color) root.style.setProperty('--theme-success', colors.success_color);
                  if (colors.warning_color) root.style.setProperty('--theme-warning', colors.warning_color);
                  if (colors.error_color) root.style.setProperty('--theme-error', colors.error_color);
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${poppins.className} bg-[var(--bg-app)] text-[var(--text-primary)] dark:bg-[#07110D] dark:text-[#F5F7F6] transition-colors duration-200 antialiased selection:bg-[#19A974] selection:text-white`}>
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
