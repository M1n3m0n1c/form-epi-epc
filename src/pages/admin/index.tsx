import { AdminLayout } from '@/components/admin/AdminLayout';
import { Dashboard } from '@/components/admin/Dashboard';
import { FormGenerator } from '@/components/admin/FormGenerator';
import { FormList } from '@/components/admin/FormList';
import { FormViewer } from '@/components/admin/FormViewer';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import type { Tables } from '@/lib/supabase/database.types';
import { useState } from 'react';

type Formulario = Tables<'formularios'>;
type ActivePage = 'dashboard' | 'generator' | 'forms' | 'viewer';

interface AdminPageProps {
  onBack?: () => void;
}

export function AdminPage({ onBack }: AdminPageProps) {
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [selectedFormulario, setSelectedFormulario] = useState<Formulario | null>(null);

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;

      case 'generator':
        return (
          <FormGenerator
            onFormGenerated={() => {
              // Após gerar formulário, pode voltar para dashboard ou ir para lista
              setActivePage('forms');
            }}
          />
        );

      case 'forms':
        return (
          <FormList
            onViewForm={(formulario) => {
              setSelectedFormulario(formulario);
              setActivePage('viewer');
            }}
          />
        );

      case 'viewer':
        if (!selectedFormulario) {
          setActivePage('forms');
          return <FormList onViewForm={(formulario) => {
            setSelectedFormulario(formulario);
            setActivePage('viewer');
          }} />;
        }
        return (
          <FormViewer
            formulario={selectedFormulario}
            onBack={() => {
              setSelectedFormulario(null);
              setActivePage('forms');
            }}
          />
        );

      default:
        return <Dashboard />;
    }
  };

  const getBreadcrumb = () => {
    const breadcrumbItems = [
      {
        label: '🏠 Painel Administrativo',
        page: 'dashboard' as ActivePage,
        isHome: true
      }
    ];

    switch (activePage) {
      case 'dashboard':
        // Apenas o item home para dashboard
        break;

      case 'generator':
        breadcrumbItems.push({
          label: '➕ Gerar Formulário',
          page: 'generator' as ActivePage,
          isHome: false
        });
        break;

      case 'forms':
        breadcrumbItems.push({
          label: '📋 Lista de Formulários',
          page: 'forms' as ActivePage,
          isHome: false
        });
        break;

      case 'viewer':
        breadcrumbItems.push({
          label: '📋 Lista de Formulários',
          page: 'forms' as ActivePage,
          isHome: false
        });
        breadcrumbItems.push({
          label: selectedFormulario ? `👁️ Visualizar: ${selectedFormulario.token}` : '👁️ Visualizar Resposta',
          page: 'viewer' as ActivePage,
          isHome: false
        });
        break;
    }

    return (
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          {breadcrumbItems.map((item, index) => (
            <div key={item.page} className="flex items-center">
              <BreadcrumbItem>
                {index === breadcrumbItems.length - 1 ? (
                  // Página atual - não clicável
                  <BreadcrumbPage className="font-medium">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  // Páginas anteriores - clicáveis
                  <BreadcrumbLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (item.page === 'forms' && activePage === 'viewer') {
                        // Se voltando do viewer para forms, limpar formulário selecionado
                        setSelectedFormulario(null);
                      }
                      setActivePage(item.page);
                    }}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    {item.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    );
  };

  const getPageSubtitle = () => {
    switch (activePage) {
      case 'dashboard':
        return 'Visualize estatísticas e gerencie formulários EPI/EPC';
      case 'generator':
        return 'Crie novos links únicos para formulários EPI/EPC';
      case 'forms':
        return 'Visualize e gerencie todos os formulários criados';
      case 'viewer':
        return selectedFormulario ? `Detalhes da resposta do formulário ${selectedFormulario.token}` : 'Detalhes da resposta';
      default:
        return 'Sistema de Formulários EPI/EPC';
    }
  };

  return (
    <AdminLayout
      title="" // Título vazio pois usaremos o breadcrumb
      subtitle={getPageSubtitle()}
      onBack={onBack}
      activePage={activePage}
      onPageChange={setActivePage}
    >
      {getBreadcrumb()}
      {renderContent()}
    </AdminLayout>
  );
}

export default AdminPage;
