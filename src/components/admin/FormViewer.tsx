import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import type { Tables } from '@/lib/supabase/database.types';
import { downloadPDFReport } from '@/lib/utils/reportGenerator';
import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';

type Formulario = Tables<'formularios'>;
type Resposta = Tables<'respostas'>;
type Foto = Tables<'fotos'>;

interface FormViewerProps {
  formulario: Formulario;
  onBack?: () => void;
}

interface RespostaCompleta extends Resposta {
  fotos: Foto[];
}

export function FormViewer({ formulario, onBack }: FormViewerProps) {
  const [resposta, setResposta] = useState<RespostaCompleta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    loadResposta();
  }, [formulario.id]);

  const loadResposta = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar resposta do formulário
      const { data: respostaData, error: respostaError } = await supabase
        .from('respostas')
        .select('*')
        .eq('formulario_id', formulario.id)
        .single();

      if (respostaError) {
        throw respostaError;
      }

      // Buscar fotos relacionadas
      const { data: fotosData, error: fotosError } = await supabase
        .from('fotos')
        .select('*')
        .eq('formulario_id', formulario.id)
        .order('secao', { ascending: true });

      if (fotosError) {
        console.error('Erro ao carregar fotos:', fotosError);
      }

      console.log('🔍 Debug - Fotos carregadas:', fotosData?.length || 0);
      if (fotosData && fotosData.length > 0) {
        console.log('📸 Primeira foto exemplo:', fotosData[0]);
      }

      setResposta({
        ...respostaData,
        fotos: fotosData || []
      });

    } catch (err) {
      console.error('Erro ao carregar resposta:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar resposta');
    } finally {
      setIsLoading(false);
    }
  };

  const formatarBoolean = (valor: boolean | null) => {
    if (valor === null) return 'N/A';
    return valor ? '✅ Sim' : '❌ Não';
  };

    // Função para buscar fotos de uma pergunta específica
  const getFotosParaPergunta = (secao: string, questionKey?: string) => {
    if (!resposta?.fotos) return [];

    return resposta.fotos.filter(foto => {
      if (foto.secao !== secao) return false;

      // Se não especificar questionKey, retorna todas as fotos da seção
      if (!questionKey) return true;

      // Verifica se a foto tem metadata com questionKey
      try {
        const metadata = foto.metadata as any;
        return metadata?.questionKey === questionKey;
      } catch {
        return false;
      }
    });
  };

  // Componente para renderizar fotos de uma pergunta específica
  const renderFotosPergunta = (secao: string, questionKey?: string, titulo?: string) => {
    const fotos = getFotosParaPergunta(secao, questionKey);

    if (fotos.length === 0) return null;

    return (
      <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
        <h5 className="font-medium mb-3 text-gray-700">
          📸 {titulo ? `${titulo} - ` : ''}Fotos ({fotos.length})
        </h5>
        <div className="grid gap-3 md:grid-cols-3">
          {fotos.map((foto) => (
            <div key={foto.id} className="border rounded-lg p-2 bg-white">
              <div className="aspect-video bg-gray-100 rounded-md mb-2 flex items-center justify-center">
                <img
                  src={foto.url_storage}
                  alt={foto.nome_arquivo}
                  className="max-w-full max-h-full object-contain rounded-md"
                  onError={(e) => {
                    console.error('Erro ao carregar imagem:', foto.url_storage);
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDEyQzIxIDEwLjg5NTQgMjAuMTA0NiAxMCAxOSAxMEg1QzMuODk1NCAxMCAzIDEwLjg5NTQgMyAxMlYxOUMzIDIwLjEwNDYgMy44OTU0IDIxIDUgMjFIMTlDMjAuMTA0NiAyMSAyMSAyMC4xMDQ2IDIxIDE5VjEyWiIgc3Ryb2tlPSIjOTk5OTk5IiBzdHJva2Utd2lkdGg9IjIiLz4KPHBhdGggZD0iTTggMTRMMTEgMTdMMTYgMTJMMjEgMTciIHN0cm9rZT0iIzk5OTk5OSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+';
                    e.currentTarget.alt = 'Erro ao carregar imagem';
                  }}
                />
              </div>
              <div className="text-xs text-gray-500">
                <div className="truncate">{foto.nome_arquivo}</div>
                {foto.tamanho_bytes && (
                  <div>{Math.round(foto.tamanho_bytes / 1024)} KB</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleGenerateReport = async () => {
    if (!resposta) return;

    try {
      setIsGeneratingReport(true);
      await downloadPDFReport({
        formulario,
        resposta
      });
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      setError('Erro ao gerar relatório PDF');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <span className="text-2xl">⚠️</span>
            <h3 className="mt-2 font-medium text-red-600">Erro ao Carregar</h3>
            <p className="text-sm text-gray-500 mt-1">{error}</p>
            <div className="flex gap-2 justify-center mt-4">
              <Button onClick={loadResposta} variant="outline">
                Tentar Novamente
              </Button>
              {onBack && (
                <Button onClick={onBack} variant="outline">
                  ← Voltar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <span className="text-2xl">⏳</span>
            <p className="text-sm text-gray-500 mt-2">Carregando resposta...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!resposta) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <span className="text-2xl">📭</span>
            <h3 className="mt-2 font-medium">Resposta não encontrada</h3>
            {onBack && (
              <Button onClick={onBack} variant="outline" className="mt-4">
                ← Voltar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>📄 Relatório de Inspeção EPI/EPC</CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {isGeneratingReport ? 'Gerando...' : 'Baixar PDF'}
              </Button>
              {onBack && (
                <Button onClick={onBack} variant="outline">
                  ← Voltar
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm">
            <div><strong>Token:</strong> {formulario.token}</div>
            <div><strong>Empresa:</strong> {formulario.empresa}</div>
            <div><strong>Regional:</strong> {formulario.regional}</div>
            <div><strong>Respondido em:</strong> {new Date(resposta.created_at || '').toLocaleString('pt-BR')}</div>
          </div>
        </CardContent>
      </Card>

      {/* 1. Dados do Responsável pela Inspeção */}
      <Card>
        <CardHeader>
          <CardTitle>👨‍💼 Dados do Responsável pela Inspeção</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div><strong>Nome:</strong> {resposta.responsavel_nome}</div>
            <div><strong>CPF:</strong> {resposta.responsavel_cpf}</div>
            <div><strong>Função:</strong> {resposta.responsavel_funcao}</div>
            <div><strong>Regional:</strong> {resposta.responsavel_regional}</div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Dados do Inspecionado */}
      <Card>
        <CardHeader>
          <CardTitle>👤 Dados do Inspecionado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div><strong>Nome:</strong> {resposta.inspecionado_nome}</div>
            <div><strong>CPF:</strong> {resposta.inspecionado_cpf}</div>
            <div><strong>Função:</strong> {resposta.inspecionado_funcao}</div>
            <div><strong>Empresa:</strong> {resposta.empresa}</div>
          </div>

          {/* Fotos da seção Dados do Inspecionado */}
          {renderFotosPergunta('dados_inspecionado', undefined, 'Dados do Inspecionado')}
        </CardContent>
      </Card>

      {/* 3. EPI Básico - Respostas detalhadas por item */}
      <Card>
        <CardHeader>
          <CardTitle>🦺 EPI Básico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Capacete */}
            <div className="border-l-4 border-blue-200 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">⛑️</span>
                <strong>Capacete de Proteção:</strong> {formatarBoolean(resposta.epi_capacete)}
              </div>
              {renderFotosPergunta('epi_basico', 'epi_capacete', 'Capacete')}
            </div>

            {/* Capacete com Jugular */}
            <div className="border-l-4 border-blue-200 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">⛑️</span>
                <strong>Capacete com Jugular:</strong> {formatarBoolean(resposta.epi_capacete_jugular)}
              </div>
              {renderFotosPergunta('epi_basico', 'epi_capacete_jugular', 'Capacete com Jugular')}
            </div>

            {/* Óculos */}
            <div className="border-l-4 border-blue-200 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🥽</span>
                <strong>Óculos de Proteção:</strong> {formatarBoolean(resposta.epi_oculos)}
              </div>
              {renderFotosPergunta('epi_basico', 'epi_oculos', 'Óculos de Proteção')}
            </div>

            {/* Protetor Auricular */}
            <div className="border-l-4 border-blue-200 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🎧</span>
                <strong>Protetor Auricular:</strong> {formatarBoolean(resposta.epi_protetor_auricular)}
              </div>
              {renderFotosPergunta('epi_basico', 'epi_protetor_auricular', 'Protetor Auricular')}
            </div>

            {/* Luvas */}
            <div className="border-l-4 border-blue-200 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🧤</span>
                <strong>Luvas de Proteção:</strong> {formatarBoolean(resposta.epi_luvas)}
              </div>
              {renderFotosPergunta('epi_basico', 'epi_luvas', 'Luvas de Proteção')}
            </div>

            {/* Calçado */}
            <div className="border-l-4 border-blue-200 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">👢</span>
                <strong>Calçado de Segurança:</strong> {formatarBoolean(resposta.epi_calcado)}
              </div>
              {renderFotosPergunta('epi_basico', 'epi_calcado', 'Calçado de Segurança')}
            </div>

            {/* Vestimenta */}
            <div className="border-l-4 border-blue-200 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">😷</span>
                <strong>Vestimenta/Máscara:</strong> {formatarBoolean(resposta.epi_vestimenta)}
              </div>
              {renderFotosPergunta('epi_basico', 'epi_vestimenta', 'Vestimenta/Máscara')}
            </div>

            {/* Ferramental */}
            <div className="border-l-4 border-blue-200 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🔧</span>
                <strong>Ferramental:</strong> {formatarBoolean(resposta.ferramental)}
              </div>
              {renderFotosPergunta('epi_basico', 'ferramental', 'Ferramental')}
            </div>

            {/* Corda de Içamento */}
            <div className="border-l-4 border-blue-200 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🪢</span>
                <strong>Corda de Içamento:</strong> {formatarBoolean(resposta.corda_icamento)}
              </div>
              {renderFotosPergunta('epi_basico', 'corda_icamento', 'Corda de Içamento')}
            </div>

            {/* Observações */}
            {resposta.observacoes_epi_basico && (
              <div className="mt-6">
                <strong>💬 Observações e Comentários:</strong>
                <p className="mt-1 p-3 bg-blue-50 rounded-md text-sm border-l-4 border-blue-400">
                  {resposta.observacoes_epi_basico}
                </p>
              </div>
            )}

            {/* Fotos gerais da seção (sem questionKey específico) */}
            {renderFotosPergunta('epi_basico', undefined, 'Fotos Gerais - EPI Básico')}
          </div>
        </CardContent>
      </Card>

      {/* 4. EPI para Trabalho em Altura */}
      <Card>
        <CardHeader>
          <CardTitle>🏗️ EPI para Trabalho em Altura</CardTitle>
        </CardHeader>
        <CardContent>
          {resposta.trabalho_altura ? (
            <div className="space-y-6">
              <div className="mb-4">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                  ⚠️ Trabalho em altura identificado
                </div>
              </div>

              {/* Cinto de Segurança */}
              <div className="border-l-4 border-orange-200 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🦺</span>
                  <strong>Cinto de Segurança:</strong> {formatarBoolean(resposta.epi_cinto_seguranca)}
                </div>
                {renderFotosPergunta('epi_altura', 'epi_cinto_seguranca', 'Cinto de Segurança')}
              </div>

              {/* Talabarte */}
              <div className="border-l-4 border-orange-200 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🔗</span>
                  <strong>Talabarte:</strong> {formatarBoolean(resposta.epi_talabarte)}
                </div>
                {renderFotosPergunta('epi_altura', 'epi_talabarte', 'Talabarte')}
              </div>

              {/* Trava Quedas */}
              <div className="border-l-4 border-orange-200 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🛡️</span>
                  <strong>Trava Quedas:</strong> {formatarBoolean(resposta.epi_trava_quedas)}
                </div>
                {renderFotosPergunta('epi_altura', 'epi_trava_quedas', 'Trava Quedas')}
              </div>

              {/* Observações */}
              {resposta.observacoes_epi_altura && (
                <div className="mt-6">
                  <strong>💬 Observações e Comentários:</strong>
                  <p className="mt-1 p-3 bg-orange-50 rounded-md text-sm border-l-4 border-orange-400">
                    {resposta.observacoes_epi_altura}
                  </p>
                </div>
              )}

              {/* Fotos gerais da seção */}
              {renderFotosPergunta('epi_altura', undefined, 'Fotos Gerais - EPI Altura')}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-gray-100 text-gray-600">
                ℹ️ Não Aplicável - Trabalho em altura declarado como não aplicável
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Este funcionário não executa trabalhos em altura
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5. EPI para Trabalhos Elétricos */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ EPI para Trabalhos Elétricos</CardTitle>
        </CardHeader>
        <CardContent>
          {resposta.trabalho_eletrico ? (
            <div className="space-y-6">
              <div className="mb-4">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                  ⚡ Trabalho elétrico identificado
                </div>
              </div>

              {/* Luvas Isolantes */}
              <div className="border-l-4 border-yellow-200 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🧤</span>
                  <strong>Luvas Isolantes:</strong> {formatarBoolean(resposta.epi_luvas_isolantes)}
                </div>
                {renderFotosPergunta('epi_eletrico', 'epi_luvas_isolantes', 'Luvas Isolantes')}
              </div>

              {/* Calçado Isolante */}
              <div className="border-l-4 border-yellow-200 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">👢</span>
                  <strong>Calçado Isolante:</strong> {formatarBoolean(resposta.epi_calcado_isolante)}
                </div>
                {renderFotosPergunta('epi_eletrico', 'epi_calcado_isolante', 'Calçado Isolante')}
              </div>

              {/* Capacete Classe B */}
              <div className="border-l-4 border-yellow-200 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">⛑️</span>
                  <strong>Capacete Classe B:</strong> {formatarBoolean(resposta.epi_capacete_classe_b)}
                </div>
                {renderFotosPergunta('epi_eletrico', 'epi_capacete_classe_b', 'Capacete Classe B')}
              </div>

              {/* Vestimenta Anti-arco */}
              <div className="border-l-4 border-yellow-200 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🦺</span>
                  <strong>Vestimenta Anti-arco:</strong> {formatarBoolean(resposta.epi_vestimenta_antiarco)}
                </div>
                {renderFotosPergunta('epi_eletrico', 'epi_vestimenta_antiarco', 'Vestimenta Anti-arco')}
              </div>

              {/* Observações */}
              {resposta.observacoes_epi_eletrico && (
                <div className="mt-6">
                  <strong>💬 Observações e Comentários:</strong>
                  <p className="mt-1 p-3 bg-yellow-50 rounded-md text-sm border-l-4 border-yellow-400">
                    {resposta.observacoes_epi_eletrico}
                  </p>
                </div>
              )}

              {/* Fotos gerais da seção */}
              {renderFotosPergunta('epi_eletrico', undefined, 'Fotos Gerais - EPI Elétrico')}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-gray-100 text-gray-600">
                ℹ️ Não Aplicável - Trabalho elétrico declarado como não aplicável
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Este funcionário não executa trabalhos elétricos
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 6. Inspeção Geral */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Inspeção Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Equipamentos Íntegros */}
            <div className="border-l-4 border-gray-200 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🔧</span>
                <strong>Equipamentos Íntegros:</strong> {formatarBoolean(resposta.equipamentos_integros)}
              </div>
              {renderFotosPergunta('inspecao_geral', 'equipamentos_integros', 'Equipamentos Íntegros')}
            </div>

            {/* Treinamento Adequado */}
            <div className="border-l-4 border-gray-200 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">📚</span>
                <strong>Treinamento Adequado:</strong> {formatarBoolean(resposta.treinamento_adequado)}
              </div>
              {renderFotosPergunta('inspecao_geral', 'treinamento_adequado', 'Treinamento Adequado')}
            </div>

            {/* Certificados Válidos */}
            <div className="border-l-4 border-gray-200 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">📜</span>
                <strong>Certificados Válidos:</strong> {formatarBoolean(resposta.certificados_validos)}
              </div>
              {renderFotosPergunta('inspecao_geral', 'certificados_validos', 'Certificados Válidos')}
            </div>

            {/* Reforço das Regras de Ouro */}
            <div className="border-l-4 border-gray-200 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🏆</span>
                <strong>Reforço das Regras de Ouro:</strong> {formatarBoolean(resposta.reforco_regras_ouro)}
              </div>
              {renderFotosPergunta('inspecao_geral', 'reforco_regras_ouro', 'Reforço das Regras de Ouro')}
            </div>

            {/* Declaração de Responsabilidade */}
            <div className="border-l-4 border-gray-200 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">📝</span>
                <strong>Declaração de Responsabilidade:</strong> {formatarBoolean(resposta.declaracao_responsabilidade)}
              </div>
              {renderFotosPergunta('inspecao_geral', 'declaracao_responsabilidade', 'Declaração de Responsabilidade')}
            </div>

            {/* Observações */}
            {resposta.observacoes_inspecao && (
              <div className="mt-6">
                <strong>💬 Observações da Inspeção:</strong>
                <p className="mt-1 p-3 bg-gray-50 rounded-md text-sm border-l-4 border-gray-400">
                  {resposta.observacoes_inspecao}
                </p>
              </div>
            )}

            {/* Fotos gerais da seção */}
            {renderFotosPergunta('inspecao_geral', undefined, 'Fotos Gerais - Inspeção Geral')}
          </div>
        </CardContent>
      </Card>

      {/* 7. Conclusão */}
      <Card>
        <CardHeader>
          <CardTitle>✅ Conclusão</CardTitle>
        </CardHeader>
        <CardContent>
          {resposta.observacoes_gerais && (
            <div className="mb-4">
              <strong>💬 Observações Gerais:</strong>
              <p className="mt-1 p-3 bg-green-50 rounded-md text-sm border-l-4 border-green-400">
                {resposta.observacoes_gerais}
              </p>
            </div>
          )}

          {/* Fotos da conclusão */}
          {renderFotosPergunta('conclusao', undefined, 'Conclusão')}
        </CardContent>
      </Card>

      {/* Fotos não categorizadas */}
      {getFotosParaPergunta('outros').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📸 Outras Fotos ({getFotosParaPergunta('outros').length})</CardTitle>
          </CardHeader>
          <CardContent>
            {renderFotosPergunta('outros', undefined, 'Outras Fotos')}
          </CardContent>
        </Card>
      )}

      {/* Resumo Final */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">📋 Resumo da Inspeção</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm">
            <div><strong>Total de Fotos:</strong> {resposta.fotos.length}</div>
            <div><strong>Trabalho em Altura:</strong> {resposta.trabalho_altura ? '✅ Sim' : '❌ Não'}</div>
            <div><strong>Trabalho Elétrico:</strong> {resposta.trabalho_eletrico ? '✅ Sim' : '❌ Não'}</div>
            <div><strong>Status Geral:</strong>
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                resposta.equipamentos_integros && resposta.treinamento_adequado && resposta.certificados_validos
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {resposta.equipamentos_integros && resposta.treinamento_adequado && resposta.certificados_validos
                  ? '✅ Aprovado'
                  : '⚠️ Requer Atenção'
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default FormViewer;
