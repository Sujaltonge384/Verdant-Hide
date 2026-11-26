// src/app/layout.tsx
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/context/StoreContext';
import Drawers from '@/components/Drawers';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Verdant Hide — 100% Plant-Based Leather Carry',
  description: 'Cruelty-free cactus, apple, and pineapple leather bags & accessories.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={jakarta.className}>
        <StoreProvider>
          {children}
          <Drawers />
        </StoreProvider>
      </body>
    </html>
  );
}