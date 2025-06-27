import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { supabase } from '@/lib/supabase/client';
import type { Tables } from '@/lib/supabase/database.types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
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
  const [filtroDataInicio, setFiltroDataInicio] = useState<Date | undefined>();
  const [filtroDataFim, setFiltroDataFim] = useState<Date | undefined>();
  const [filtroBusca, setFiltroBusca] = useState('');

  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5;

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
        if (dataFormulario < filtroDataInicio) {
          return false;
        }
      }

      // Filtro por data de fim
      if (filtroDataFim) {
        const dataFormulario = new Date(formulario.created_at || formulario.data_criacao || '');
        const dataFimAjustada = new Date(filtroDataFim);
        dataFimAjustada.setHours(23, 59, 59, 999);
        if (dataFormulario > dataFimAjustada) {
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
    setFiltroDataInicio(undefined);
    setFiltroDataFim(undefined);
    setFiltroBusca('');
    setPaginaAtual(1); // Reset página ao limpar filtros
  };

  const copyLink = async (token: string) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/form/${token}`;

    try {
      await navigator.clipboard.writeText(link);
    } catch (err) {
      console.error('Erro ao copiar link:', err);
    }
  };

  const formulariosFiltered = filtrarFormularios();

  // Cálculos de paginação
  const totalPaginas = Math.ceil(formulariosFiltered.length / itensPorPagina);
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const indiceFim = indiceInicio + itensPorPagina;
  const formulariosPaginados = formulariosFiltered.slice(indiceInicio, indiceFim);

  // Resetar página quando filtros mudam
  useEffect(() => {
    setPaginaAtual(1);
  }, [filtroStatus, filtroEmpresa, filtroDataInicio, filtroDataFim, filtroBusca]);

  const irParaPagina = (pagina: number) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaAtual(pagina);
    }
  };

  const gerarPaginasVisiveis = () => {
    const paginas: (number | 'ellipsis')[] = [];
    const maxPaginasVisiveis = 5;

    if (totalPaginas <= maxPaginasVisiveis) {
      // Se há poucas páginas, mostrar todas
      for (let i = 1; i <= totalPaginas; i++) {
        paginas.push(i);
      }
    } else {
      // Lógica mais complexa para muitas páginas
      if (paginaAtual <= 3) {
        // Início: 1, 2, 3, 4, ..., última
        for (let i = 1; i <= 4; i++) {
          paginas.push(i);
        }
        if (totalPaginas > 5) paginas.push('ellipsis');
        paginas.push(totalPaginas);
      } else if (paginaAtual >= totalPaginas - 2) {
        // Final: 1, ..., antepenúltima, penúltima, última
        paginas.push(1);
        if (totalPaginas > 5) paginas.push('ellipsis');
        for (let i = totalPaginas - 3; i <= totalPaginas; i++) {
          paginas.push(i);
        }
      } else {
        // Meio: 1, ..., atual-1, atual, atual+1, ..., última
        paginas.push(1);
        paginas.push('ellipsis');
        for (let i = paginaAtual - 1; i <= paginaAtual + 1; i++) {
          paginas.push(i);
        }
        paginas.push('ellipsis');
        paginas.push(totalPaginas);
      }
    }

    return paginas;
  };

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
      <Card className="w-full max-w-none border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="py-1">
          <div className="flex items-center justify-between w-full">
            <div className="flex-1 min-w-0">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="filtros" className="border-none">
                  <div className="flex items-center gap-2 w-full">
                    <AccordionTrigger className="hover:no-underline py-1 w-auto rounded-lg px-1 transition-colors [&>svg]:bg-blue-500 [&>svg]:text-white [&>svg]:p-0.5 [&>svg]:rounded-full [&>svg]:w-5 [&>svg]:h-5 [&>svg]:transition-all [&>svg]:duration-200 hover:[&>svg]:bg-blue-600 hover:[&>svg]:scale-110">
                    </AccordionTrigger>
                    <div className="bg-gray-100 text-gray-600 p-1.5 rounded-full">
                      🔍
                    </div>
                    <div className="flex flex-col items-start flex-1">
                      <CardTitle className="text-left text-gray-800 text-base font-bold">
                        Filtros Avançados
                      </CardTitle>
                      <span className="text-xs text-gray-600">
                        Clique para expandir opções de filtro
                      </span>
                    </div>
                  </div>
                  <AccordionContent className="space-y-4 pt-2 bg-white rounded-lg border border-blue-100 mx-2 mb-2 p-3">
                    {/* Botões de ação */}
                    <div className="flex gap-2 justify-end">
                      <Button
                        onClick={limparFiltros}
                        variant="outline"
                        size="sm"
                      >
                        Limpar Filtros
                      </Button>
                      <Button
                        onClick={loadFormularios}
                        variant="outline"
                        size="sm"
                      >
                        Atualizar
                      </Button>
                    </div>

                    {/* Campo de busca */}
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-gray-700">
                        Buscar por UFSigla, Nome, CPF, Função ou Regional do Inspecionador/Inspecionado
                      </Label>
                      <Input
                        type="text"
                        placeholder="Digite UFSigla, nome, CPF, função ou regional do inspecionador/inspecionado..."
                        value={filtroBusca}
                        onChange={(e) => setFiltroBusca(e.target.value)}
                        className="w-full border-blue-200 focus:border-blue-400 focus:ring-blue-200 h-8"
                      />
                    </div>

                    {/* Filtros */}
                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-gray-700">
                          Status
                        </Label>
                        <select
                          value={filtroStatus}
                          onChange={(e) => setFiltroStatus(e.target.value)}
                          className="w-full p-1.5 border border-blue-200 rounded-md text-sm focus:border-blue-400 focus:ring-blue-200 bg-white h-8"
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-gray-700">
                          Empresa
                        </Label>
                        <select
                          value={filtroEmpresa}
                          onChange={(e) => setFiltroEmpresa(e.target.value)}
                          className="w-full p-1.5 border border-blue-200 rounded-md text-sm focus:border-blue-400 focus:ring-blue-200 bg-white h-8"
                        >
                          <option value="">Todas as empresas</option>
                          {empresas.map((empresa) => (
                            <option key={empresa} value={empresa}>
                              {empresa}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-gray-700">
                          Data Início
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal text-sm h-8",
                                !filtroDataInicio && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {filtroDataInicio ? (
                                format(filtroDataInicio, "dd/MM/yyyy")
                              ) : (
                                <span>Selecionar data</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={filtroDataInicio}
                              onSelect={setFiltroDataInicio}
                              captionLayout="dropdown"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">

                          Data Fim
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal text-sm",
                                !filtroDataFim && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {filtroDataFim ? (
                                format(filtroDataFim, "dd/MM/yyyy")
                              ) : (
                                <span>Selecionar data</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={filtroDataFim}
                              onSelect={setFiltroDataFim}
                              captionLayout="dropdown"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Indicador de Filtros Ativos */}
                    {(filtroStatus !== 'todos' || filtroEmpresa || filtroDataInicio || filtroDataFim || filtroBusca) && (
                      <div className="flex items-center gap-3 text-sm bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 rounded-lg border-2 border-emerald-200 shadow-sm">
                        <div className="bg-emerald-500 text-white p-1.5 rounded-full">
                          ✨
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-emerald-800">Filtros Aplicados</span>
                          <span className="text-emerald-600">
                            Exibindo {formulariosFiltered.length} de {formularios.length} formulários
                          </span>
                        </div>
                        <div className="ml-auto">
                          <Button
                            onClick={limparFiltros}
                            size="sm"
                            variant="outline"
                          >
                            Limpar
                          </Button>
                        </div>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Conteúdo vazio - filtros agora estão no accordion do cabeçalho */}
        </CardContent>
      </Card>

      {/* Lista */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <CardTitle>📋 Formulários ({formulariosFiltered.length})</CardTitle>
              {formulariosFiltered.length > itensPorPagina && (
                <div className="text-sm text-gray-600">
                  Página {paginaAtual} de {totalPaginas} • Mostrando {formulariosPaginados.length} de {formulariosFiltered.length} formulários
                </div>
              )}
            </div>

            {/* Paginação no topo - só exibe se há mais de 5 formulários */}
            {formulariosFiltered.length > itensPorPagina && (
              <div className="flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          irParaPagina(paginaAtual - 1);
                        }}
                        className={paginaAtual === 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>

                    {gerarPaginasVisiveis().map((pagina, index) => (
                      <PaginationItem key={index}>
                        {pagina === 'ellipsis' ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              irParaPagina(pagina);
                            }}
                            isActive={pagina === paginaAtual}
                          >
                            {pagina}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          irParaPagina(paginaAtual + 1);
                        }}
                        className={paginaAtual === totalPaginas ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
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
              {formulariosPaginados.map((formulario) => {
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
                          Copiar Link
                        </Button>

                        {onViewForm && formulario.status === 'respondido' && (
                          <Button
                            size="sm"
                            onClick={() => onViewForm(formulario)}
                            className="whitespace-nowrap"
                          >
                            Ver Resposta
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Paginação - só exibe se há mais de 5 formulários */}
          {formulariosFiltered.length > itensPorPagina && (
            <div className="mt-6 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        irParaPagina(paginaAtual - 1);
                      }}
                      className={paginaAtual === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>

                  {gerarPaginasVisiveis().map((pagina, index) => (
                    <PaginationItem key={index}>
                      {pagina === 'ellipsis' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            irParaPagina(pagina);
                          }}
                          isActive={pagina === paginaAtual}
                        >
                          {pagina}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        irParaPagina(paginaAtual + 1);
                      }}
                      className={paginaAtual === totalPaginas ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default FormList;
