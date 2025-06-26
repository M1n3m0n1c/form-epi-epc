import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

// type Formulario = Tables<'formularios'>;

interface DashboardStats {
  totalGerados: number;
  respondidos: number;
  pendentes: number;
  expirados: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalGerados: 0,
    respondidos: 0,
    pendentes: 0,
    expirados: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar todos os formulários
      const { data: formularios, error: formError } = await supabase
        .from('formularios')
        .select('*');

      if (formError) {
        throw formError;
      }

      if (!formularios) {
        setStats({
          totalGerados: 0,
          respondidos: 0,
          pendentes: 0,
          expirados: 0,
        });
        return;
      }

      const now = new Date();

      // Calcular estatísticas
      const totalGerados = formularios.length;
      const respondidos = formularios.filter(f => f.status === 'respondido').length;

      // Formulários expirados (data_expiracao passou e status não é respondido)
      const expirados = formularios.filter(f => {
        if (f.status === 'respondido') return false;
        if (!f.data_expiracao) return false;
        return new Date(f.data_expiracao) < now;
      }).length;

      // Formulários pendentes (não respondidos e não expirados)
      const pendentes = formularios.filter(f => {
        if (f.status === 'respondido') return false;
        if (!f.data_expiracao) return true; // Sem expiração = sempre pendente
        return new Date(f.data_expiracao) >= now;
      }).length;

      setStats({
        totalGerados,
        respondidos,
        pendentes,
        expirados,
      });
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
      setError('Erro ao carregar estatísticas do dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Gerados',
      value: stats.totalGerados,
      icon: '📋',
      description: 'Formulários criados',
      color: 'text-blue-600',
    },
    {
      title: 'Respondidos',
      value: stats.respondidos,
      icon: '✅',
      description: 'Formulários preenchidos',
      color: 'text-green-600',
    },
    {
      title: 'Pendentes',
      value: stats.pendentes,
      icon: '⏳',
      description: 'Aguardando resposta',
      color: 'text-yellow-600',
    },
    {
      title: 'Expirados',
      value: stats.expirados,
      icon: '❌',
      description: 'Links vencidos',
      color: 'text-red-600',
    },
  ];

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <span className="text-2xl">⚠️</span>
            <h3 className="mt-2 font-medium text-red-600">Erro no Dashboard</h3>
            <p className="text-sm text-gray-500 mt-1">{error}</p>
            <button
              onClick={loadDashboardStats}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Tentar Novamente
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <span className="text-2xl">{card.icon}</span>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.color}`}>
                {isLoading ? '...' : card.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resumo Geral */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">
              <span className="text-2xl">⏳</span>
              <p className="text-sm text-gray-500 mt-2">Carregando estatísticas...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-blue-600">
                    {stats.totalGerados}
                  </div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-green-600">
                    {stats.respondidos}
                  </div>
                  <div className="text-xs text-gray-500">Concluídos</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-yellow-600">
                    {stats.pendentes}
                  </div>
                  <div className="text-xs text-gray-500">Pendentes</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-red-600">
                    {stats.expirados}
                  </div>
                  <div className="text-xs text-gray-500">Expirados</div>
                </div>
              </div>

              {stats.totalGerados > 0 && (
                <div className="pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Taxa de Resposta:</span>
                    <span className="font-medium">
                      {Math.round((stats.respondidos / stats.totalGerados) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>Taxa de Expiração:</span>
                    <span className="font-medium">
                      {Math.round((stats.expirados / stats.totalGerados) * 100)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
              <span className="text-2xl">🔗</span>
              <div>
                <h3 className="font-medium">Gerar Novo Link</h3>
                <p className="text-sm text-muted-foreground">
                  Criar formulário para técnico
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
              <span className="text-2xl">📋</span>
              <div>
                <h3 className="font-medium">Ver Formulários</h3>
                <p className="text-sm text-muted-foreground">
                  Listar todos os formulários
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Dashboard;
