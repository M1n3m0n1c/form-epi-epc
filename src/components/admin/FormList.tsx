import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase/client';
import type { Tables } from '@/lib/supabase/database.types';
import { useEffect, useState } from 'react';

type Formulario = Tables<'formularios'>;

interface RespostaParcial {
  responsavel_nome: string;
  responsavel_cpf: string;
  responsavel_funcao: string;
  responsavel_regional: string;
  inspecionado_nome: string;
  inspecionado_cpf: string;
  inspecionado_funcao: string;
}

interface FormularioComResposta extends Formulario {
  respostas?: RespostaParcial;
}

interface FormListProps {
  onViewForm?: (formulario: Formulario) => void;
  onRefresh?: () => void;
}

export function FormList({ onViewForm, onRefresh }: FormListProps) {
  const [formularios, setFormularios] = useState<FormularioComResposta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroEmpresa, setFiltroEmpresa] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const [filtroBusca, setFiltroBusca] = useState('');

  const statusOptions = [
    { value: 'todos', label: 'Todos os Status' },
    { value: 'pendente', label: 'Pendentes' },
    { value: 'respondido', label: 'Respondidos' }
  ];

  const empresas = [
    'Icomon',
    'Telequipe',
    'Tel Telecomunicações',
    'Eolen',
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
        .select(`
          *,
          respostas (
            responsavel_nome,
            responsavel_cpf,
            responsavel_funcao,
            responsavel_regional,
            inspecionado_nome,
            inspecionado_cpf,
            inspecionado_funcao
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Transformar os dados para o formato esperado
      const formulariosComResposta = data?.map(formulario => {
        // Se é um objeto (não array), usar diretamente
        // Se é array, pegar o primeiro item
        // Se é null/undefined, deixar undefined
        const respostaProcessada = formulario.respostas
          ? (Array.isArray(formulario.respostas)
              ? (formulario.respostas.length > 0 ? formulario.respostas[0] : undefined)
              : formulario.respostas)
          : undefined;

        return {
          ...formulario,
          respostas: respostaProcessada
        };
      }) || [];

      setFormularios(formulariosComResposta);

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
    if (formulario.status === 'respondido') {
      return {
        status: 'respondido',
        label: 'Respondido',
        color: 'text-green-600 bg-green-50',
        icon: '✅'
      };
    }

    // Funcionalidade de expiração removida

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

      // Filtro por busca (UF Sigla, Inspecionador e Inspecionado)
      if (filtroBusca) {
        const buscaLower = filtroBusca.toLowerCase();

        // Busca por UF Sigla
        if (formulario.ufsigla && formulario.ufsigla.toLowerCase().includes(buscaLower)) {
          return true;
        }

        // Busca por dados do Inspecionador e Inspecionado (se houver resposta)
        if (formulario.respostas) {
          const resposta = formulario.respostas;

          // Busca por nome do responsável (inspecionador)
          if (resposta.responsavel_nome && resposta.responsavel_nome.toLowerCase().includes(buscaLower)) {
            return true;
          }

          // Busca por CPF do responsável (inspecionador)
          if (resposta.responsavel_cpf && resposta.responsavel_cpf.includes(filtroBusca)) {
            return true;
          }

          // Busca por função do responsável (inspecionador)
          if (resposta.responsavel_funcao && resposta.responsavel_funcao.toLowerCase().includes(buscaLower)) {
            return true;
          }

          // Busca por regional do responsável (inspecionador)
          if (resposta.responsavel_regional && resposta.responsavel_regional.toLowerCase().includes(buscaLower)) {
            return true;
          }

          // Busca por nome do inspecionado
          if (resposta.inspecionado_nome && resposta.inspecionado_nome.toLowerCase().includes(buscaLower)) {
            return true;
          }

          // Busca por CPF do inspecionado
          if (resposta.inspecionado_cpf && resposta.inspecionado_cpf.includes(filtroBusca)) {
            return true;
          }

          // Busca por função do inspecionado
          if (resposta.inspecionado_funcao && resposta.inspecionado_funcao.toLowerCase().includes(buscaLower)) {
            return true;
          }
        }

        // Se não encontrou nada e há filtro de busca, não incluir
        return false;
      }

      return true;
    });
  };

  const limparFiltros = () => {
    setFiltroStatus('todos');
    setFiltroEmpresa('');
    setFiltroDataInicio('');
    setFiltroDataFim('');
    setFiltroBusca('');
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
          {/* Campo de busca - destaque principal */}
          <div className="space-y-2">
            <Label>🔍 Buscar por UFSigla, Nome, CPF, Função ou Regional do Inspecionador/Inspecionado</Label>
            <Input
              type="text"
              placeholder="Digite UFSigla, nome, CPF, função ou regional do inspecionador/inspecionado..."
              value={filtroBusca}
              onChange={(e) => setFiltroBusca(e.target.value)}
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
                  <div key={formulario.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Header com Status e Token */}
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.icon} {statusInfo.label}
                          </span>
                          <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            Token: {formulario.token}
                          </span>
                        </div>

                        {/* Informações principais em grid */}
                        <div className="grid gap-2 text-sm">
                          {/* Linha 1: Data de Criação e UF Sigla */}
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <strong>Criado em:</strong> {dataFormatada}
                            </div>
                            {formulario.ufsigla && (
                              <div className="flex items-center gap-1">
                                <strong>UF Sigla:</strong> {formulario.ufsigla}
                              </div>
                            )}
                          </div>

                          {/* Linha 2: Empresa e Regional */}
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <strong>Empresa:</strong> {formulario.empresa}
                            </div>
                            <div className="flex items-center gap-1">
                              <strong>Regional:</strong> {formulario.regional}
                            </div>
                          </div>

                          {/* Linha 3: Dados do Inspecionador e Inspecionado lado a lado */}
                          {formulario.respostas && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Inspecionador */}
                              <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-indigo-600">👨‍💼</span>
                                  <strong className="text-indigo-800">INSPECIONADOR</strong>
                                </div>
                                <div className="space-y-1 text-sm">
                                  <div>
                                    <strong>Nome:</strong> {formulario.respostas.responsavel_nome}
                                  </div>
                                  <div>
                                    <strong>CPF:</strong> {formulario.respostas.responsavel_cpf}
                                  </div>
                                  <div>
                                    <strong>Função:</strong> {formulario.respostas.responsavel_funcao}
                                  </div>
                                </div>
                              </div>

                              {/* Inspecionado */}
                              <div className="bg-teal-50 p-3 rounded-lg border-l-4 border-teal-400">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-teal-600">👷‍♂️</span>
                                  <strong className="text-teal-800">INSPECIONADO</strong>
                                </div>
                                <div className="space-y-1 text-sm">
                                  <div>
                                    <strong>Nome:</strong> {formulario.respostas.inspecionado_nome}
                                  </div>
                                  <div>
                                    <strong>CPF:</strong> {formulario.respostas.inspecionado_cpf}
                                  </div>
                                  <div>
                                    <strong>Função:</strong> {formulario.respostas.inspecionado_funcao}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Linha 4: Informação quando não há resposta */}
                          {!formulario.respostas && formulario.status === 'pendente' && (
                            <div className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                              <span>⏳</span>
                              <span className="text-sm">Aguardando preenchimento - Dados do inspecionador/inspecionado serão exibidos após resposta</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Botões de ação */}
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyLink(formulario.token)}
                          className="whitespace-nowrap"
                        >
                          📋 Copiar Link
                        </Button>

                        {onViewForm && formulario.status === 'respondido' && (
                          <Button
                            size="sm"
                            onClick={() => onViewForm(formulario)}
                            className="whitespace-nowrap"
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
