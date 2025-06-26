import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase/client';
import type { Tables } from '@/lib/supabase/database.types';
import { useEffect, useState } from 'react';

type Formulario = Tables<'formularios'>;

interface FormListProps {
  onViewForm?: (formulario: Formulario) => void;
  onRefresh?: () => void;
}

export function FormList({ onViewForm, onRefresh }: FormListProps) {
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroEmpresa, setFiltroEmpresa] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const [filtroCriador, setFiltroCriador] = useState('');

  const statusOptions = [
    { value: 'todos', label: 'Todos os Status' },
    { value: 'pendente', label: 'Pendentes' },
    { value: 'respondido', label: 'Respondidos' },
    { value: 'expirado', label: 'Expirados' },
  ];

  const empresas = [
    'Icomon',
    'Telequipe',
    'Tel Telecomunicações',
    'Eólen',
    'Stein'
  ];

  useEffect(() => {
    loadFormularios();
  }, []);

  const loadFormularios = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('formularios')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setFormularios(data || []);

      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error('Erro ao carregar formulários:', err);
      setError('Erro ao carregar lista de formulários');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = (formulario: Formulario) => {
    const now = new Date();

    if (formulario.status === 'respondido') {
      return {
        status: 'respondido',
        label: 'Respondido',
        color: 'text-green-600 bg-green-50',
        icon: '✅'
      };
    }

    if (formulario.data_expiracao && new Date(formulario.data_expiracao) < now) {
      return {
        status: 'expirado',
        label: 'Expirado',
        color: 'text-red-600 bg-red-50',
        icon: '❌'
      };
    }

    return {
      status: 'pendente',
      label: 'Pendente',
      color: 'text-yellow-600 bg-yellow-50',
      icon: '⏳'
    };
  };

  const filtrarFormularios = () => {
    return formularios.filter(formulario => {
      const statusInfo = getStatusInfo(formulario);

      // Filtro por status
      if (filtroStatus !== 'todos' && statusInfo.status !== filtroStatus) {
        return false;
      }

      // Filtro por empresa
      if (filtroEmpresa && !formulario.empresa.toLowerCase().includes(filtroEmpresa.toLowerCase())) {
        return false;
      }

      // Filtro por data de início
      if (filtroDataInicio) {
        const dataFormulario = new Date(formulario.created_at || formulario.data_criacao || '');
        const dataInicio = new Date(filtroDataInicio);
        if (dataFormulario < dataInicio) {
          return false;
        }
      }

      // Filtro por data de fim
      if (filtroDataFim) {
        const dataFormulario = new Date(formulario.created_at || formulario.data_criacao || '');
        const dataFim = new Date(filtroDataFim);
        dataFim.setHours(23, 59, 59, 999);
        if (dataFormulario > dataFim) {
          return false;
        }
      }

      // Filtro por nome do criador
      if (filtroCriador && formulario.criado_por) {
        if (!formulario.criado_por.toLowerCase().includes(filtroCriador.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  };

  const limparFiltros = () => {
    setFiltroStatus('todos');
    setFiltroEmpresa('');
    setFiltroDataInicio('');
    setFiltroDataFim('');
    setFiltroCriador('');
  };

  const copyLink = async (token: string) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/formulario/${token}`;

    try {
      await navigator.clipboard.writeText(link);
    } catch (err) {
      console.error('Erro ao copiar link:', err);
    }
  };

  const formulariosFiltered = filtrarFormularios();

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <span className="text-2xl">⚠️</span>
            <h3 className="mt-2 font-medium text-red-600">Erro ao Carregar</h3>
            <p className="text-sm text-gray-500 mt-1">{error}</p>
            <Button
              onClick={loadFormularios}
              className="mt-4"
              variant="outline"
            >
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Campo de busca por criador - destaque principal */}
          <div className="space-y-2">
            <Label>🔍 Buscar por Nome do Criador</Label>
            <Input
              type="text"
              placeholder="Digite o nome do criador do formulário..."
              value={filtroCriador}
              onChange={(e) => setFiltroCriador(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Empresa</Label>
              <select
                value={filtroEmpresa}
                onChange={(e) => setFiltroEmpresa(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Todas as empresas</option>
                {empresas.map((empresa) => (
                  <option key={empresa} value={empresa}>
                    {empresa}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input
                type="date"
                value={filtroDataInicio}
                onChange={(e) => setFiltroDataInicio(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={filtroDataFim}
                onChange={(e) => setFiltroDataFim(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={limparFiltros} variant="outline">
              🔄 Limpar Filtros
            </Button>
            <Button onClick={loadFormularios} variant="outline">
              ↻ Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Formulários ({formulariosFiltered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <span className="text-2xl">⏳</span>
              <p className="text-sm text-gray-500 mt-2">Carregando...</p>
            </div>
          ) : formulariosFiltered.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-2xl">📭</span>
              <p className="text-sm text-gray-500 mt-2">Nenhum formulário encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {formulariosFiltered.map((formulario) => {
                const statusInfo = getStatusInfo(formulario);
                const dataFormatada = formulario.created_at
                  ? new Date(formulario.created_at).toLocaleString('pt-BR')
                  : 'Data não disponível';

                return (
                  <div key={formulario.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.icon} {statusInfo.label}
                          </span>
                          <span className="text-sm text-gray-500">
                            Token: {formulario.token}
                          </span>
                        </div>

                        <div className="grid gap-1 text-sm">
                          <div>
                            <strong>Empresa:</strong> {formulario.empresa} |
                            <strong> Regional:</strong> {formulario.regional}
                          </div>
                          <div>
                            <strong>Criado em:</strong> {dataFormatada}
                            {formulario.criado_por && (
                              <span> | <strong>Por:</strong> {formulario.criado_por}</span>
                            )}
                          </div>
                          {formulario.data_expiracao && (
                            <div>
                              <strong>Expira em:</strong> {new Date(formulario.data_expiracao).toLocaleString('pt-BR')}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyLink(formulario.token)}
                        >
                          📋 Copiar Link
                        </Button>

                        {onViewForm && formulario.status === 'respondido' && (
                          <Button
                            size="sm"
                            onClick={() => onViewForm(formulario)}
                          >
                            👁️ Ver Resposta
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default FormList;
