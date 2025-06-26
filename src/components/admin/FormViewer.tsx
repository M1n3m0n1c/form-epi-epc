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

  // const nomeSecoes = {
  //   'dados_inspecionado': 'Dados do Inspecionado',
  //   'epi_basico': 'EPI Básico',
  //   'epi_altura': 'EPI para Trabalho em Altura',
  //   'epi_eletrico': 'EPI para Trabalhos Elétricos',
  //   'inspecao_geral': 'Inspeção Geral',
  //   'conclusao': 'Conclusão',
  //   'outros': 'Outras Fotos'
  // };

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
            <CardTitle>📄 Relatório de Inspeção EPI/EPC</CardTitle>
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
          {fotosAgrupadas['dados_inspecionado'] && fotosAgrupadas['dados_inspecionado'].length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium mb-3">📸 Fotos ({fotosAgrupadas['dados_inspecionado'].length})</h4>
              <div className="grid gap-4 md:grid-cols-3">
                {fotosAgrupadas['dados_inspecionado'].map((foto) => (
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
          )}
        </CardContent>
      </Card>

      {/* 3. EPI Básico - Respostas e Comentários */}
      <Card>
        <CardHeader>
          <CardTitle>🦺 EPI Básico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div><strong>Capacete:</strong> {formatarBoolean(resposta.epi_capacete)}</div>
            <div><strong>Capacete com Jugular:</strong> {formatarBoolean(resposta.epi_capacete_jugular)}</div>
            <div><strong>Óculos de Proteção:</strong> {formatarBoolean(resposta.epi_oculos)}</div>
            <div><strong>Protetor Auricular:</strong> {formatarBoolean(resposta.epi_protetor_auricular)}</div>
            <div><strong>Luvas:</strong> {formatarBoolean(resposta.epi_luvas)}</div>
            <div><strong>Calçado de Segurança:</strong> {formatarBoolean(resposta.epi_calcado)}</div>
            <div><strong>Vestimenta:</strong> {formatarBoolean(resposta.epi_vestimenta)}</div>
          </div>

          {resposta.observacoes_epi_basico && (
            <div className="mt-4">
              <strong>💬 Observações e Comentários:</strong>
              <p className="mt-1 p-3 bg-blue-50 rounded-md text-sm border-l-4 border-blue-400">
                {resposta.observacoes_epi_basico}
              </p>
            </div>
          )}

          {/* Fotos da seção EPI Básico */}
          {fotosAgrupadas['epi_basico'] && fotosAgrupadas['epi_basico'].length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium mb-3">📸 Fotos ({fotosAgrupadas['epi_basico'].length})</h4>
              <div className="grid gap-4 md:grid-cols-3">
                {fotosAgrupadas['epi_basico'].map((foto) => (
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
          )}
        </CardContent>
      </Card>

            {/* 4. EPI para Trabalho em Altura - Respostas e Comentários */}
      <Card>
        <CardHeader>
          <CardTitle>🏗️ EPI para Trabalho em Altura</CardTitle>
        </CardHeader>
        <CardContent>
          {resposta.trabalho_altura ? (
            <>
              <div className="mb-4">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                  ⚠️ Trabalho em altura identificado
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div><strong>Cinto de Segurança:</strong> {formatarBoolean(resposta.epi_cinto_seguranca)}</div>
                <div><strong>Talabarte:</strong> {formatarBoolean(resposta.epi_talabarte)}</div>
                <div><strong>Trava Quedas:</strong> {formatarBoolean(resposta.epi_trava_quedas)}</div>
                <div><strong>Corda de Içamento:</strong> {formatarBoolean(resposta.corda_icamento)}</div>
              </div>

              {resposta.observacoes_epi_altura && (
                <div className="mt-4">
                  <strong>💬 Observações e Comentários:</strong>
                  <p className="mt-1 p-3 bg-orange-50 rounded-md text-sm border-l-4 border-orange-400">
                    {resposta.observacoes_epi_altura}
                  </p>
                </div>
              )}

              {/* Fotos da seção EPI Altura */}
              {fotosAgrupadas['epi_altura'] && fotosAgrupadas['epi_altura'].length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">📸 Fotos ({fotosAgrupadas['epi_altura'].length})</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    {fotosAgrupadas['epi_altura'].map((foto) => (
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
              )}
            </>
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

            {/* 5. EPI para Trabalhos Elétricos - Respostas e Comentários */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ EPI para Trabalhos Elétricos</CardTitle>
        </CardHeader>
        <CardContent>
          {resposta.trabalho_eletrico ? (
            <>


              <div className="grid gap-3 md:grid-cols-2">
                <div><strong>Luvas Isolantes:</strong> {formatarBoolean(resposta.epi_luvas_isolantes)}</div>
                <div><strong>Calçado Isolante:</strong> {formatarBoolean(resposta.epi_calcado_isolante)}</div>
                <div><strong>Capacete Classe B:</strong> {formatarBoolean(resposta.epi_capacete_classe_b)}</div>
                <div><strong>Vestimenta Anti-arco:</strong> {formatarBoolean(resposta.epi_vestimenta_antiarco)}</div>
                <div><strong>Ferramental:</strong> {formatarBoolean(resposta.ferramental)}</div>
              </div>

              {resposta.observacoes_epi_eletrico && (
                <div className="mt-4">
                  <strong>💬 Observações e Comentários:</strong>
                  <p className="mt-1 p-3 bg-yellow-50 rounded-md text-sm border-l-4 border-yellow-400">
                    {resposta.observacoes_epi_eletrico}
                  </p>
                </div>
              )}

              {/* Fotos da seção EPI Elétrico */}
              {fotosAgrupadas['epi_eletrico'] && fotosAgrupadas['epi_eletrico'].length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">📸 Fotos ({fotosAgrupadas['epi_eletrico'].length})</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    {fotosAgrupadas['epi_eletrico'].map((foto) => (
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
              )}
            </>
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
          <div className="grid gap-3">
            <div><strong>Equipamentos Íntegros:</strong> {formatarBoolean(resposta.equipamentos_integros)}</div>
            <div><strong>Treinamento Adequado:</strong> {formatarBoolean(resposta.treinamento_adequado)}</div>
            <div><strong>Certificados Válidos:</strong> {formatarBoolean(resposta.certificados_validos)}</div>
            <div><strong>Reforço das Regras de Ouro:</strong> {formatarBoolean(resposta.reforco_regras_ouro)}</div>
            <div><strong>Declaração de Responsabilidade:</strong> {formatarBoolean(resposta.declaracao_responsabilidade)}</div>
          </div>

          {resposta.observacoes_inspecao && (
            <div className="mt-4">
              <strong>💬 Observações da Inspeção:</strong>
              <p className="mt-1 p-3 bg-gray-50 rounded-md text-sm border-l-4 border-gray-400">
                {resposta.observacoes_inspecao}
              </p>
            </div>
          )}

          {/* Fotos da seção Inspeção Geral */}
          {fotosAgrupadas['inspecao_geral'] && fotosAgrupadas['inspecao_geral'].length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium mb-3">📸 Fotos ({fotosAgrupadas['inspecao_geral'].length})</h4>
              <div className="grid gap-4 md:grid-cols-3">
                {fotosAgrupadas['inspecao_geral'].map((foto) => (
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
          )}
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

          {/* Fotos da seção Conclusão */}
          {fotosAgrupadas['conclusao'] && fotosAgrupadas['conclusao'].length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium mb-3">📸 Fotos ({fotosAgrupadas['conclusao'].length})</h4>
              <div className="grid gap-4 md:grid-cols-3">
                {fotosAgrupadas['conclusao'].map((foto) => (
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
          )}
        </CardContent>
      </Card>

      {/* Outras Fotos (se houver) */}
      {fotosAgrupadas['outros'] && fotosAgrupadas['outros'].length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📸 Outras Fotos ({fotosAgrupadas['outros'].length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {fotosAgrupadas['outros'].map((foto) => (
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
