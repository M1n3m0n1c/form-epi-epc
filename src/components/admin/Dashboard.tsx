import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

// type Formulario = Tables<'formularios'>;

interface DailyActivity {
  data: string;
  criados: number;
  respondidos: number;
}

export function Dashboard() {
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Período do gráfico
  const [periodoGrafico, setPeriodoGrafico] = useState<number>(7); // Últimos 7 dias

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    // Recarregar dados do gráfico quando período mudar
    loadDailyActivityData();
  }, [periodoGrafico]);

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
        setDailyActivity([]);
        return;
      }





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
      // Buscar formulários do período selecionado
      const { data: formularios, error } = await supabase
        .from('formularios')
        .select('*')
        .gte('created_at', new Date(Date.now() - periodoGrafico * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

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



  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
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
      {/* Estatísticas do Período */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📈 Estatísticas do Período ({periodoGrafico} dias)
          </CardTitle>
          <p className="text-sm text-gray-600">
            Resumo dos dados dos últimos {periodoGrafico} dias selecionados.
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-sm text-gray-500">Carregando estatísticas...</p>
            </div>
          ) : dailyActivity.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum dado disponível para o período selecionado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {dailyActivity.reduce((acc, day) => acc + day.criados, 0)}
                </div>
                <div className="text-sm text-blue-700 font-medium">Total Criados</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {dailyActivity.reduce((acc, day) => acc + day.respondidos, 0)}
                </div>
                <div className="text-sm text-green-700 font-medium">Total Respondidos</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {dailyActivity.reduce((acc, day) => acc + day.criados + day.respondidos, 0)}
                </div>
                <div className="text-sm text-purple-700 font-medium">Total Geral</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {(() => {
                    const totalCriados = dailyActivity.reduce((acc, day) => acc + day.criados, 0);
                    const totalRespondidos = dailyActivity.reduce((acc, day) => acc + day.respondidos, 0);
                    return totalCriados > 0 ? `${((totalRespondidos / totalCriados) * 100).toFixed(1)}%` : '0%';
                  })()}
                </div>
                <div className="text-sm text-orange-700 font-medium">Taxa de Resposta</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de Barras Lado a Lado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Relatórios por Dia (Últimos {periodoGrafico} dias)
          </CardTitle>
          <p className="text-sm text-gray-600">
            Gráfico de barras lado a lado mostrando relatórios criados e respondidos por dia.
          </p>
        </CardHeader>
        <CardContent>
          {/* Controle de Período */}
          <div className="mb-6 flex justify-center">
            <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
              {[7, 15, 30].map((dias) => (
                <button
                  key={dias}
                  onClick={() => setPeriodoGrafico(dias)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    periodoGrafico === dias
                      ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {dias} dias
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-sm text-gray-500">Carregando dados do gráfico...</p>
            </div>
          ) : dailyActivity.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-gray-500">Nenhum dado encontrado para o período selecionado</p>
              <p className="text-xs text-gray-400 mt-2">Verifique se há formulários criados nos últimos {periodoGrafico} dias</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Legenda */}
              <div className="flex justify-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="font-medium">Criados</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="font-medium">Respondidos</span>
                </div>
              </div>


              {/* Gráfico de Barras Lado a Lado */}
              <div className="relative bg-white rounded-lg border p-4">
                <div className="flex h-80">
                  {/* Eixo Y - Escala */}
                  <div className="w-12 flex flex-col-reverse justify-between text-xs text-gray-500 mr-4 py-2">
                    {Array.from({ length: 6 }, (_, i) => {
                      // Calcular valor máximo individual (criados ou respondidos)
                      const maxValue = Math.max(...dailyActivity.map(d => Math.max(d.criados, d.respondidos)), 1);
                      const maxScale = Math.ceil(maxValue / 5) * 5; // Arredondar para múltiplo de 5
                      const value = Math.round((maxScale / 5) * i);
                      return (
                        <div key={i} className="text-right pr-2 leading-none">
                          {value}
                        </div>
                      );
                    })}
                  </div>

                  {/* Área do Gráfico */}
                  <div className="flex-1 relative">
                    {/* Grid horizontal */}
                    <div className="absolute inset-0 flex flex-col justify-between py-2">
                      {Array.from({ length: 6 }, (_, i) => (
                        <div key={i} className="border-t border-gray-200 w-full" />
                      ))}
                    </div>

                                                            {/* Barras Lado a Lado */}
                    <div className="absolute inset-0 flex items-end justify-around px-2 py-2">
                      {dailyActivity.map((day, index) => {
                        const maxValue = Math.max(...dailyActivity.map(d => Math.max(d.criados, d.respondidos)), 1);
                        const maxScale = Math.ceil(maxValue / 5) * 5;

                        // Calcular alturas individuais baseadas no valor máximo (ajustado para altura disponível)
                        const availableHeight = 100; // 100% da altura do container
                        const criadosHeight = day.criados > 0 ? Math.max((day.criados / maxScale) * availableHeight, 3) : 0;
                        const respondidosHeight = day.respondidos > 0 ? Math.max((day.respondidos / maxScale) * availableHeight, 3) : 0;

                        // Largura das barras baseada no período
                        const barWidth = periodoGrafico === 7 ? 'w-6' : periodoGrafico === 15 ? 'w-4' : 'w-3';
                        const spacing = periodoGrafico === 7 ? 'gap-2' : 'gap-1';

                        return (
                          <div key={index} className={`flex items-end ${spacing} h-full justify-center group relative`}>
                            {/* Container para as barras */}
                            <div className="flex items-end gap-1 h-full">
                              {/* Barra Criados */}
                              <div className="relative h-full flex items-end">
                                <div
                                  className={`${barWidth} bg-blue-500 hover:bg-blue-600 transition-colors rounded-t-sm`}
                                  style={{
                                    height: `${criadosHeight}%`,
                                    minHeight: day.criados > 0 ? '4px' : '0px'
                                  }}
                                  title={`${day.criados} criados`}
                                />
                              </div>

                              {/* Barra Respondidos */}
                              <div className="relative h-full flex items-end">
                                <div
                                  className={`${barWidth} bg-green-500 hover:bg-green-600 transition-colors rounded-t-sm`}
                                  style={{
                                    height: `${respondidosHeight}%`,
                                    minHeight: day.respondidos > 0 ? '4px' : '0px'
                                  }}
                                  title={`${day.respondidos} respondidos`}
                                />
                              </div>
                            </div>

                            {/* Tooltip */}
                            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                              <div className="font-medium">{formatDate(day.data)}</div>
                              <div className="text-blue-300">Criados: {day.criados}</div>
                              <div className="text-green-300">Respondidos: {day.respondidos}</div>
                              <div className="text-gray-300 border-t border-gray-600 mt-1 pt-1">Total: {day.criados + day.respondidos}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Linha base do gráfico */}
                    <div className="absolute bottom-2 left-0 right-0 border-b-2 border-gray-300" />
                  </div>
                </div>

                {/* Eixo X - Datas */}
                <div className="ml-16 mt-4 flex justify-around text-xs text-gray-600">
                  {dailyActivity.map((day, index) => (
                    <div key={index} className="text-center font-medium">
                      {formatDate(day.data)}
                    </div>
                  ))}
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
