import { AppSidebar } from '@/components/admin/AppSidebar';
import { Footer } from '@/components/shared/Footer';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import React from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  activePage?: string;
  onPageChange?: (page: any) => void;
}

export function AdminLayout({ children, title, subtitle, activePage, onPageChange }: AdminLayoutProps) {
  const [activeTab, setActiveTab] = React.useState(activePage || 'dashboard');

  React.useEffect(() => {
    if (activePage) {
      setActiveTab(activePage);
    }
  }, [activePage]);

  const handlePageChange = (page: string) => {
    setActiveTab(page);
    if (onPageChange) {
      onPageChange(page);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full">
        <AppSidebar activePage={activeTab} onPageChange={handlePageChange} />

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-background border-b">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div className="flex items-center gap-3">


                </div>
              </div>

              <div className="flex items-center gap-4">
                <img
                  src="/logo_tlf.png"
                  alt="Logo TLF"
                  className="h-8 w-auto"
                />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {title && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground">{title}</h2>
                {subtitle && (
                  <p className="mt-2 text-muted-foreground">{subtitle}</p>
                )}
              </div>
            )}

            <div className="space-y-6">
              {children}
            </div>
          </main>

          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}

export default AdminLayout;
