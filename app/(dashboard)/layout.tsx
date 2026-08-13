'use client';

import { motion } from 'framer-motion';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { AuthGuard } from '@/features/identity/route-guards';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="lg:pl-64">
          <Topbar />
          <motion.main
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-[calc(100vh-4rem)] p-4 lg:p-6"
          >
            {children}
          </motion.main>
        </div>
      </div>
    </AuthGuard>
  );
}
