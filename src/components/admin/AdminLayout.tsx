import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  activePage?: string;
  onPageChange?: (page: any) => void;
}

export function AdminLayout({ children, title, subtitle, onBack, activePage, onPageChange }: AdminLayoutProps) {
  const [activeTab, setActiveTab] = React.useState(activePage || 'dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (activePage) {
      setActiveTab(activePage);
    }
  }, [activePage]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'forms', label: 'Formulários', icon: '📋' },
    { id: 'generator', label: 'Gerar Link', icon: '🔗' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">
                  Sistema EPI/EPC
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {onBack && (
                <Button variant="outline" onClick={onBack}>
                  ← Voltar
                </Button>
              )}
              <span className="text-sm text-gray-500">Painel Administrativo</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              variant="outline"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-full mb-4"
            >
              {isMobileMenuOpen ? '✕ Fechar Menu' : '☰ Menu de Navegação'}
            </Button>
          </div>

          {/* Sidebar Navigation */}
          <div className={`lg:w-64 flex-shrink-0 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Navegação</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {navItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={activeTab === item.id ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false); // Fechar menu mobile após seleção
                        if (onPageChange) {
                          onPageChange(item.id);
                        }
                      }}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.label}
                    </Button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {title && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                {subtitle && (
                  <p className="mt-2 text-gray-600">{subtitle}</p>
                )}
              </div>
            )}

            <div className="space-y-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
