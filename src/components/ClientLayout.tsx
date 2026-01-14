'use client'

import Navbar from './Navbar';
import Footer from './Footer';
import AnnouncementPopup from './AnnouncementPopup';
import { usePathname } from 'next/navigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');
  const isStudentPage = pathname?.startsWith('/student');

  return (
    <>
      <div className={isAdminPage ? 'hidden md:block' : ''}>
        <Navbar />
      </div>
      <div className={isAdminPage ? 'pt-0 md:pt-20' : 'pt-16 md:pt-20 m-0'}>
        {children}
      </div>
      {!isStudentPage && <Footer />}
      <AnnouncementPopup />
    </>
  );
}
