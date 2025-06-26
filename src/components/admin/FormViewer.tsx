import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import type { Tables } from '@/lib/supabase/database.types';
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

  const agruparFotosPorSecao = (fotos: Foto[]) => {
    return fotos.reduce((grupos, foto) => {
      const secao = foto.secao || 'outros';
      if (!grupos[secao]) {
        grupos[secao] = [];
      }
      grupos[secao].push(foto);
      return grupos;
    }, {} as Record<string, Foto[]>);
  };

  const nomeSecoes = {
    'identificacao': 'Identificação',
    'epi_basico': 'EPI Básico',
    'epi_altura': 'EPI para Trabalho em Altura',
    'epi_eletrico': 'EPI para Trabalhos Elétricos',
    'inspecao_geral': 'Inspeção Geral',
    'conclusao': 'Conclusão',
    'outros': 'Outras Fotos'
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

  const fotosAgrupadas = agruparFotosPorSecao(resposta.fotos);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>📄 Visualização da Resposta</CardTitle>
            {onBack && (
              <Button onClick={onBack} variant="outline">
                ← Voltar
              </Button>
            )}
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

      {/* Identificação */}
      <Card>
        <CardHeader>
          <CardTitle>👤 Identificação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div><strong>Nome:</strong> {resposta.nome_completo}</div>
            <div><strong>CPF:</strong> {resposta.cpf}</div>
            <div><strong>Função:</strong> {resposta.funcao}</div>
            <div><strong>Regional:</strong> {resposta.regional}</div>
          </div>
        </CardContent>
      </Card>

      {/* EPI Básico */}
      <Card>
        <CardHeader>
          <CardTitle>🦺 EPI Básico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            <div><strong>Capacete:</strong> {formatarBoolean(resposta.epi_capacete)}</div>
            <div><strong>Óculos:</strong> {formatarBoolean(resposta.epi_oculos)}</div>
            <div><strong>Protetor Auricular:</strong> {formatarBoolean(resposta.epi_protetor_auricular)}</div>
            <div><strong>Luvas:</strong> {formatarBoolean(resposta.epi_luvas)}</div>
            <div><strong>Calçado:</strong> {formatarBoolean(resposta.epi_calcado)}</div>
            <div><strong>Vestimenta:</strong> {formatarBoolean(resposta.epi_vestimenta)}</div>
          </div>
          {resposta.observacoes_epi_basico && (
            <div className="mt-4">
              <strong>Observações:</strong>
              <p className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                {resposta.observacoes_epi_basico}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* EPI para Trabalho em Altura */}
      {(resposta.epi_cinto_seguranca !== null || resposta.epi_talabarte !== null || resposta.epi_trava_quedas !== null) && (
        <Card>
          <CardHeader>
            <CardTitle>🏗️ EPI para Trabalho em Altura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2">
              {resposta.epi_cinto_seguranca !== null && (
                <div><strong>Cinto de Segurança:</strong> {formatarBoolean(resposta.epi_cinto_seguranca)}</div>
              )}
              {resposta.epi_talabarte !== null && (
                <div><strong>Talabarte:</strong> {formatarBoolean(resposta.epi_talabarte)}</div>
              )}
              {resposta.epi_trava_quedas !== null && (
                <div><strong>Trava Quedas:</strong> {formatarBoolean(resposta.epi_trava_quedas)}</div>
              )}
            </div>
            {resposta.observacoes_epi_altura && (
              <div className="mt-4">
                <strong>Observações:</strong>
                <p className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                  {resposta.observacoes_epi_altura}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* EPI para Trabalhos Elétricos */}
      {resposta.trabalho_eletrico && (
        <Card>
          <CardHeader>
            <CardTitle>⚡ EPI para Trabalhos Elétricos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2">
              {resposta.epi_luvas_isolantes !== null && (
                <div><strong>Luvas Isolantes:</strong> {formatarBoolean(resposta.epi_luvas_isolantes)}</div>
              )}
              {resposta.epi_calcado_isolante !== null && (
                <div><strong>Calçado Isolante:</strong> {formatarBoolean(resposta.epi_calcado_isolante)}</div>
              )}
              {resposta.epi_capacete_classe_b !== null && (
                <div><strong>Capacete Classe B:</strong> {formatarBoolean(resposta.epi_capacete_classe_b)}</div>
              )}
              {resposta.epi_vestimenta_antiarco !== null && (
                <div><strong>Vestimenta Anti-arco:</strong> {formatarBoolean(resposta.epi_vestimenta_antiarco)}</div>
              )}
            </div>
            {resposta.observacoes_epi_eletrico && (
              <div className="mt-4">
                <strong>Observações:</strong>
                <p className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                  {resposta.observacoes_epi_eletrico}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Inspeção Geral */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Inspeção Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <div><strong>Equipamentos Íntegros:</strong> {formatarBoolean(resposta.equipamentos_integros)}</div>
            <div><strong>Treinamento Adequado:</strong> {formatarBoolean(resposta.treinamento_adequado)}</div>
            <div><strong>Certificados Válidos:</strong> {formatarBoolean(resposta.certificados_validos)}</div>
          </div>
          {resposta.observacoes_inspecao && (
            <div className="mt-4">
              <strong>Observações:</strong>
              <p className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                {resposta.observacoes_inspecao}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conclusão */}
      <Card>
        <CardHeader>
          <CardTitle>✅ Conclusão</CardTitle>
        </CardHeader>
        <CardContent>
          <div><strong>Responsável Regional:</strong> {resposta.responsavel_regional}</div>
          {resposta.observacoes_gerais && (
            <div className="mt-4">
              <strong>Observações Gerais:</strong>
              <p className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                {resposta.observacoes_gerais}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fotos */}
      {Object.keys(fotosAgrupadas).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📸 Fotos ({resposta.fotos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(fotosAgrupadas).map(([secao, fotos]) => (
                <div key={secao}>
                  <h4 className="font-medium mb-3">
                    {nomeSecoes[secao as keyof typeof nomeSecoes] || secao} ({fotos.length})
                  </h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    {fotos.map((foto) => (
                      <div key={foto.id} className="border rounded-lg p-3">
                        <div className="aspect-video bg-gray-100 rounded-md mb-2 flex items-center justify-center">
                          <img
                            src={foto.url_storage}
                            alt={foto.nome_arquivo}
                            className="max-w-full max-h-full object-contain rounded-md"
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
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default FormViewer;
