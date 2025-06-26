import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

// type Formulario = Tables<'formularios'>;

interface DashboardStats {
  totalGerados: number;
  respondidos: number;
  pendentes: number;
}



interface DailyActivity {
  data: string;
  criados: number;
  respondidos: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalGerados: 0,
    respondidos: 0,
    pendentes: 0,
  });

  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros para o gráfico
  const [filtroGraficoEmpresa, setFiltroGraficoEmpresa] = useState('');
  const [filtroGraficoRegional, setFiltroGraficoRegional] = useState('');
  const [empresasDisponiveis, setEmpresasDisponiveis] = useState<string[]>([]);
  const [regionaisDisponiveis, setRegionaisDisponiveis] = useState<string[]>([]);
  const [periodoGrafico, setPeriodoGrafico] = useState<number>(15); // Últimos 15 dias

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    // Recarregar dados do gráfico quando filtros mudarem
    loadDailyActivityData();
  }, [filtroGraficoEmpresa, filtroGraficoRegional, periodoGrafico]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar todos os formulários
      const { data: formularios, error: formError } = await supabase
        .from('formularios')
        .select('*')
        .order('created_at', { ascending: false });

      if (formError) {
        throw formError;
      }

      if (!formularios || formularios.length === 0) {
        setStats({ totalGerados: 0, respondidos: 0, pendentes: 0 });
        setDailyActivity([]);
        setEmpresasDisponiveis([]);
        setRegionaisDisponiveis([]);
        return;
      }

      // Calcular estatísticas gerais
      const totalGerados = formularios.length;
      const respondidos = formularios.filter(f => f.status === 'respondido').length;
      const pendentes = totalGerados - respondidos;

      setStats({
        totalGerados,
        respondidos,
        pendentes,
      });

      // Extrair empresas e regionais únicas para os filtros
      const empresasUnicas = [...new Set(formularios.map(f => f.empresa))].sort();
      const regionaisUnicas = [...new Set(formularios.map(f => f.regional))].sort();

      setEmpresasDisponiveis(empresasUnicas);
      setRegionaisDisponiveis(regionaisUnicas);



      // Carregar dados do gráfico
      await loadDailyActivityData();

    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDailyActivityData = async () => {
    try {
      // Construir query com filtros
      let query = supabase
        .from('formularios')
        .select('*')
        .gte('created_at', new Date(Date.now() - periodoGrafico * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

      if (filtroGraficoEmpresa) {
        query = query.eq('empresa', filtroGraficoEmpresa);
      }

      if (filtroGraficoRegional) {
        query = query.eq('regional', filtroGraficoRegional);
      }

      const { data: formularios, error } = await query;

      if (error) {
        throw error;
      }

      if (!formularios) {
        setDailyActivity([]);
        return;
      }

      // Calcular atividade diária para o período selecionado
      const dailyMap = new Map<string, { criados: number; respondidos: number }>();
      const today = new Date();
      const days = Array.from({ length: periodoGrafico }, (_, i) => {
        const date = new Date(today);
        // Garantir que sempre incluímos o dia atual (i=0 é hoje, i=1 é ontem, etc.)
        date.setDate(today.getDate() - i);
        return date.toISOString().split('T')[0];
            }).reverse(); // Reverter para ordem cronológica (mais antigo primeiro)

      // Inicializar todos os dias com 0
      days.forEach(date => {
        dailyMap.set(date, { criados: 0, respondidos: 0 });
      });

      // Contar formulários criados por dia
      formularios.forEach(form => {
        if (form.created_at) {
          const date = new Date(form.created_at).toISOString().split('T')[0];
          if (dailyMap.has(date)) {
            dailyMap.get(date)!.criados += 1;
          }
        }

        // Contar formulários respondidos por dia
        if (form.data_resposta && form.status === 'respondido') {
          const date = new Date(form.data_resposta).toISOString().split('T')[0];
          if (dailyMap.has(date)) {
            dailyMap.get(date)!.respondidos += 1;
          }
        }
      });

      const dailyActivityArray: DailyActivity[] = Array.from(dailyMap.entries())
        .map(([data, counts]) => ({
          data,
          criados: counts.criados,
          respondidos: counts.respondidos,
        }))
        .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

      setDailyActivity(dailyActivityArray);

    } catch (err) {
      console.error('Erro ao carregar dados do gráfico:', err);
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
      title: 'Taxa de Resposta',
      value: stats.totalGerados > 0 ? `${Math.round((stats.respondidos / stats.totalGerados) * 100)}%` : '0%',
      icon: '📊',
      description: 'Percentual de conclusão',
      color: 'text-purple-600',
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const limparFiltrosGrafico = () => {
    setFiltroGraficoEmpresa('');
    setFiltroGraficoRegional('');
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <span className="text-2xl">⚠️</span>
            <h3 className="mt-2 font-medium text-red-600">Erro no Dashboard</h3>
            <p className="text-sm text-gray-500 mt-1">{error}</p>
            <button
              onClick={loadDashboardData}
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
            <CardContent className="text-center">
              <div className={`text-2xl font-bold ${card.color}`}>
                {isLoading ? '...' : card.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>





      {/* Gráfico de Atividade Diária */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Quantidade de Questionários (Últimos {periodoGrafico} dias)
          </CardTitle>
          <p className="text-sm text-gray-600">
            Acompanhamento diário de questionários criados e respondidos.
          </p>
        </CardHeader>
        <CardContent>
          {/* Filtros do Gráfico */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Período</Label>
                <select
                  value={periodoGrafico}
                  onChange={(e) => setPeriodoGrafico(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value={7}>Últimos 7 dias</option>
                  <option value={15}>Últimos 15 dias</option>
                  <option value={30}>Últimos 30 dias</option>
                  <option value={60}>Últimos 60 dias</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Empresa</Label>
                <select
                  value={filtroGraficoEmpresa}
                  onChange={(e) => setFiltroGraficoEmpresa(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Todas as empresas</option>
                  {empresasDisponiveis.map((empresa) => (
                    <option key={empresa} value={empresa}>
                      {empresa}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Regional</Label>
                <select
                  value={filtroGraficoRegional}
                  onChange={(e) => setFiltroGraficoRegional(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Todas as regionais</option>
                  {regionaisDisponiveis.map((regional) => (
                    <option key={regional} value={regional}>
                      {regional}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button
                  onClick={limparFiltrosGrafico}
                  variant="outline"
                  className="w-full text-sm"
                >
                  🔄 Limpar Filtros
                </Button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <span className="text-2xl">⏳</span>
              <p className="text-sm text-gray-500 mt-2">Carregando gráfico...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Legenda */}
              <div className="flex justify-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span>Criados</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Respondidos</span>
                </div>
              </div>

              {/* Gráfico de Barras Agrupadas */}
              <div className="relative">
                {/* Escala Y */}
                <div className="flex">
                  <div className="w-8 flex flex-col-reverse justify-between text-xs text-gray-500 mr-2">
                    {Array.from({ length: 6 }, (_, i) => {
                      const maxValue = Math.max(...dailyActivity.map(d => Math.max(d.criados, d.respondidos)), 1);
                      const value = Math.ceil((maxValue / 5) * i);
                      return (
                        <div key={i} className="h-6 flex items-center">
                          {value}
                        </div>
                      );
                    })}
                  </div>

                  {/* Área do gráfico */}
                  <div className="flex-1">
                    {/* Grid de fundo */}
                    <div className="relative h-64 border-l border-b border-gray-300 bg-white">
                      {/* Linhas horizontais do grid */}
                      {Array.from({ length: 6 }, (_, i) => (
                        <div
                          key={i}
                          className="absolute w-full border-t border-gray-200"
                          style={{ bottom: `${(i / 5) * 100}%` }}
                        />
                      ))}

                      {/* Barras */}
                      <div className="absolute inset-0 flex items-end justify-around px-1">
                        {dailyActivity.map((day, index) => {
                          const maxValue = Math.max(...dailyActivity.map(d => Math.max(d.criados, d.respondidos)), 1);
                          // Calcular altura corretamente para alinhar com a escala Y
                          const criadosHeight = day.criados > 0 ? Math.max((day.criados / maxValue) * 100, 2) : 0;
                          const respondidosHeight = day.respondidos > 0 ? Math.max((day.respondidos / maxValue) * 100, 2) : 0;

                          const barWidth = periodoGrafico > 30 ? 'w-1.5' : periodoGrafico > 15 ? 'w-2' : 'w-3';
                          const spaceX = periodoGrafico > 30 ? 'space-x-0.5' : 'space-x-1';

                          return (
                            <div key={index} className={`flex items-end ${spaceX} h-full justify-center`}>
                              {/* Barra Criados */}
                              <div className="relative group">
                                <div
                                  className={`bg-blue-500 ${barWidth} transition-all duration-200 hover:bg-blue-600`}
                                  style={{
                                    height: `${criadosHeight}%`,
                                    minHeight: day.criados > 0 ? '2px' : '0px'
                                  }}
                                />
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                  {day.criados} criados
                                </div>
                              </div>

                              {/* Barra Respondidos */}
                              <div className="relative group">
                                <div
                                  className={`bg-green-500 ${barWidth} transition-all duration-200 hover:bg-green-600`}
                                  style={{
                                    height: `${respondidosHeight}%`,
                                    minHeight: day.respondidos > 0 ? '2px' : '0px'
                                  }}
                                />
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                  {day.respondidos} respondidos
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Eixo X - Datas */}
                    <div className="flex justify-around mt-4 text-xs text-gray-500 h-12 overflow-hidden px-1">
                      {dailyActivity.map((day, index) => (
                        <div key={index} className="text-center flex items-start justify-center">
                          <div className="transform -rotate-45 origin-center whitespace-nowrap text-[10px]">
                            {formatDate(day.data)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Resumo dos dados filtrados */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-800">
                  <strong>Resumo do período:</strong> {' '}
                  {dailyActivity.reduce((acc, day) => acc + day.criados, 0)} criados | {' '}
                  {dailyActivity.reduce((acc, day) => acc + day.respondidos, 0)} respondidos
                  {(filtroGraficoEmpresa || filtroGraficoRegional) && (
                    <span className="ml-2 text-xs">
                      (filtrado por {filtroGraficoEmpresa && `empresa: ${filtroGraficoEmpresa}`}
                      {filtroGraficoEmpresa && filtroGraficoRegional && ', '}
                      {filtroGraficoRegional && `regional: ${filtroGraficoRegional}`})
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>


    </div>
  );
}

export default Dashboard;
