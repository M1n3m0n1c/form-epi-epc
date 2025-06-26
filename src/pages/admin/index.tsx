import { AdminLayout } from '@/components/admin/AdminLayout';
import { Dashboard } from '@/components/admin/Dashboard';
import { FormGenerator } from '@/components/admin/FormGenerator';
import { FormList } from '@/components/admin/FormList';
import { FormViewer } from '@/components/admin/FormViewer';
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

  const getPageInfo = () => {
    switch (activePage) {
      case 'dashboard':
        return {
          title: 'Dashboard',
          subtitle: 'Visualize estatísticas e gerencie formulários EPI/EPC'
        };
      case 'generator':
        return {
          title: 'Gerar Formulário',
          subtitle: 'Crie novos links únicos para formulários EPI/EPC'
        };
      case 'forms':
        return {
          title: 'Lista de Formulários',
          subtitle: 'Visualize e gerencie todos os formulários criados'
        };
      case 'viewer':
        return {
          title: 'Visualizar Resposta',
          subtitle: selectedFormulario ? `Formulário: ${selectedFormulario.token}` : 'Detalhes da resposta'
        };
      default:
        return {
          title: 'Painel Administrativo',
          subtitle: 'Sistema de Formulários EPI/EPC'
        };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <AdminLayout
      title={pageInfo.title}
      subtitle={pageInfo.subtitle}
      onBack={onBack}
      activePage={activePage}
      onPageChange={setActivePage}
    >
      {renderContent()}
    </AdminLayout>
  );
}

export default AdminPage;
