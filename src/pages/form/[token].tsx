import { FormContainer, type FormData } from '@/components/form/FormContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import type { TablesInsert } from '@/lib/supabase/database.types';
import {
  updateFormularioStatus,
  validateFormToken,
  validateTokenFormat,
  type TokenValidationResult
} from '@/lib/utils/validation';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface FormPageState {
  validationResult: TokenValidationResult | null;
  isLoading: boolean;
  timeInfo: {
    expired: boolean;
    timeLeft: string;
    hoursLeft: number;
  } | null;
  showForm: boolean;
  isSubmitting: boolean;
  submitSuccess: boolean;
  respostaInfo: {
    nome_completo: string;
    data_resposta: string | null;
    created_at: string | null;
  } | null;
}

export default function FormPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [state, setState] = useState<FormPageState>({
    validationResult: null,
    isLoading: true,
    timeInfo: null,
    showForm: false,
    isSubmitting: false,
    submitSuccess: false,
    respostaInfo: null
  });

  useEffect(() => {
    if (!token) {
      setState(prev => ({
        ...prev,
        validationResult: {
          isValid: false,
          formulario: null,
          error: 'Token não fornecido na URL',
          status: 'invalid'
        },
        isLoading: false,
        timeInfo: null
      }));
      return;
    }

    // Validação básica de formato antes de consultar o banco
    if (!validateTokenFormat(token)) {
      setState(prev => ({
        ...prev,
        validationResult: {
          isValid: false,
          formulario: null,
          error: 'Formato de token inválido',
          status: 'invalid'
        },
        isLoading: false,
        timeInfo: null
      }));
      return;
    }

    performTokenValidation();
  }, [token]);

  const performTokenValidation = async () => {
    if (!token) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Usar a nova função de validação
      const validationResult = await validateFormToken(token);

      // Funcionalidade de tempo/expiração removida
      let timeInfo = null;

      // Se o formulário já foi respondido, buscar informações da resposta
      let respostaInfo = null;
      if (validationResult.status === 'answered' && validationResult.formulario) {
        respostaInfo = await fetchRespostaInfo(validationResult.formulario.id);
      }

      setState(prev => ({
        ...prev,
        validationResult,
        isLoading: false,
        timeInfo,
        respostaInfo
      }));

    } catch (error) {
      console.error('Erro na validação:', error);
      setState(prev => ({
        ...prev,
        validationResult: {
          isValid: false,
          formulario: null,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          status: 'error'
        },
        isLoading: false,
        timeInfo: null,
        respostaInfo: null
      }));
    }
  };

  const fetchRespostaInfo = async (formularioId: string) => {
    try {
      const { data, error } = await supabase
        .from('respostas')
        .select('inspecionado_nome, created_at')
        .eq('formulario_id', formularioId)
        .single();

      if (error) {
        console.log('ℹ️ Nenhuma resposta encontrada ainda:', error.message);
        return null;
      }

      return {
        nome_completo: data.inspecionado_nome,
        data_resposta: data.created_at, // usando created_at como data_resposta
        created_at: data.created_at
      };
    } catch (error) {
      console.error('Erro ao buscar resposta:', error);
      return null;
    }
  };

  const uploadPhotos = async (photos: any[], respostaId: string, secao: string) => {
    const uploadedPhotos = [];

    for (const photo of photos) {
      try {
        // Upload para Supabase Storage
        const storagePath = `formularios/${state.validationResult?.formulario?.id}/${secao}/${photo.id}`;

        const { error: uploadError } = await supabase.storage
          .from('fotos')
          .upload(storagePath, photo.file, {
            cacheControl: '3600',
            upsert: true // Permitir substituir arquivos existentes
          });

        if (uploadError) {
          console.error('Erro no upload da foto:', uploadError);
          // Se for erro de duplicação, tentar obter a URL do arquivo existente
          if (uploadError.message?.includes('already exists') || uploadError.message?.includes('Duplicate')) {
            console.log('📸 Arquivo já existe, obtendo URL...');
          } else {
            // Para outros erros, pular esta foto
            continue;
          }
        }

        // Obter URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('fotos')
          .getPublicUrl(storagePath);

        // Salvar metadados no banco
        try {
          const { error: dbError } = await supabase
            .from('fotos')
            .insert({
              formulario_id: state.validationResult?.formulario?.id,
              resposta_id: respostaId,
              secao: secao,
              nome_arquivo: photo.metadata.fileName,
              url_storage: publicUrl,
              tamanho_bytes: photo.metadata.fileSize,
              tipo_mime: photo.metadata.mimeType,
              metadata: {
                width: photo.metadata.width,
                height: photo.metadata.height,
                aspectRatio: photo.metadata.aspectRatio,
                lastModified: photo.metadata.lastModified,
                compressionResult: photo.compressionResult,
                questionKey: photo.metadata.questionKey, // Incluir questionKey do metadata
                secao: photo.metadata.secao // Incluir seção do metadata
              }
            });

          if (dbError) {
            console.error('Erro ao salvar metadados da foto:', dbError);
            // Tentar com upsert se falhar
            const { error: upsertError } = await supabase
              .from('fotos')
              .upsert({
                formulario_id: state.validationResult?.formulario?.id,
                resposta_id: respostaId,
                secao: secao,
                nome_arquivo: photo.metadata.fileName,
                url_storage: publicUrl,
                tamanho_bytes: photo.metadata.fileSize,
                tipo_mime: photo.metadata.mimeType,
                metadata: {
                  width: photo.metadata.width,
                  height: photo.metadata.height,
                  aspectRatio: photo.metadata.aspectRatio,
                  lastModified: photo.metadata.lastModified,
                  compressionResult: photo.compressionResult,
                  questionKey: photo.metadata.questionKey,
                  secao: photo.metadata.secao
                }
              });

            if (upsertError) {
              console.error('Erro no upsert dos metadados da foto:', upsertError);
            } else {
              uploadedPhotos.push(photo);
            }
          } else {
            uploadedPhotos.push(photo);
          }
        } catch (metadataError) {
          console.error('Erro ao processar metadados da foto:', metadataError);
        }
      } catch (error) {
        console.error('Erro no upload da foto:', error);
      }
    }

    return uploadedPhotos;
  };

  const handleFormSubmit = async (formData: FormData) => {
    if (!state.validationResult?.formulario) return;

    // Evitar submissões múltiplas
    if (state.isSubmitting) {
      console.log('⚠️ Formulário já está sendo enviado...');
      return;
    }

    try {
      setState(prev => ({ ...prev, isSubmitting: true }));

      const formulario = state.validationResult.formulario;

      console.log('📋 Dados recebidos do formulário:', formData);

      // Sanitizar dados - converter undefined para null
      const sanitizedFormData = {
        ...formData,
        // Converter campos undefined para null para o banco de dados
        epi_capacete: formData.epi_capacete === undefined ? null : formData.epi_capacete,
        epi_oculos: formData.epi_oculos === undefined ? null : formData.epi_oculos,
        epi_protetor_auricular: formData.epi_protetor_auricular === undefined ? null : formData.epi_protetor_auricular,
        epi_vestimenta: formData.epi_vestimenta === undefined ? null : formData.epi_vestimenta,
        epi_luvas: formData.epi_luvas === undefined ? null : formData.epi_luvas,
        epi_calcado: formData.epi_calcado === undefined ? null : formData.epi_calcado,
        ferramental: formData.ferramental === undefined ? null : formData.ferramental,
        corda_icamento: formData.corda_icamento === undefined ? null : formData.corda_icamento,
        trabalho_altura: formData.trabalho_altura === undefined ? null : formData.trabalho_altura,
        epi_cinto_seguranca: formData.epi_cinto_seguranca === undefined ? null : formData.epi_cinto_seguranca,
        epi_talabarte: formData.epi_talabarte === undefined ? null : formData.epi_talabarte,
        epi_capacete_jugular: formData.epi_capacete_jugular === undefined ? null : formData.epi_capacete_jugular,
        trabalho_eletrico: formData.trabalho_eletrico === undefined ? null : formData.trabalho_eletrico,
        epi_luvas_isolantes: formData.epi_luvas_isolantes === undefined ? null : formData.epi_luvas_isolantes,
        epi_calcado_isolante: formData.epi_calcado_isolante === undefined ? null : formData.epi_calcado_isolante,
        epi_capacete_classe_b: formData.epi_capacete_classe_b === undefined ? null : formData.epi_capacete_classe_b,
        equipamentos_integros: formData.equipamentos_integros === undefined ? null : formData.equipamentos_integros,
        treinamento_adequado: formData.treinamento_adequado === undefined ? null : formData.treinamento_adequado,
        certificados_validos: formData.certificados_validos === undefined ? null : formData.certificados_validos,
        reforco_regras_ouro: formData.reforco_regras_ouro === undefined ? null : formData.reforco_regras_ouro,
      };

      console.log('🧹 Dados sanitizados:', sanitizedFormData);

      // Verificar se já existe resposta para este formulário
      try {
        const { data: existingResponse, error: checkError } = await supabase
          .from('respostas')
          .select('id')
          .eq('formulario_id', formulario.id)
          .maybeSingle(); // Usar maybeSingle() ao invés de single() para evitar erro 406

        if (checkError) {
          console.error('❌ Erro ao verificar resposta existente:', checkError);
          throw new Error(`Erro ao verificar resposta: ${checkError.message}`);
        }

        if (existingResponse) {
          throw new Error('Este formulário já foi respondido. Recarregue a página para ver o status atualizado.');
        }
      } catch (checkErr) {
        console.error('❌ Erro na verificação de resposta existente:', checkErr);
        // Se não conseguir verificar, continuar com cautela
      }

      // Inserir resposta no banco de dados
      console.log('📝 Inserindo resposta para formulário:', formulario.id);
      const insertPayload: TablesInsert<'respostas'> = {
        formulario_id: formulario.id,
        empresa: formulario.empresa,

        // Dados do responsável pela inspeção (técnico/engenheiro de segurança)
        responsavel_nome: sanitizedFormData.responsavel_nome,
        responsavel_cpf: sanitizedFormData.responsavel_cpf,
        responsavel_funcao: sanitizedFormData.responsavel_funcao,

        // Dados da pessoa inspecionada
        inspecionado_nome: sanitizedFormData.inspecionado_nome,
        inspecionado_cpf: sanitizedFormData.inspecionado_cpf,
        inspecionado_funcao: sanitizedFormData.inspecionado_funcao,
        regional: sanitizedFormData.regional || '',

        // EPI Básico (converter null para false para campos obrigatórios)
        epi_capacete: sanitizedFormData.epi_capacete ?? false,
        epi_oculos: sanitizedFormData.epi_oculos ?? false,
        epi_protetor_auricular: sanitizedFormData.epi_protetor_auricular ?? false,
        epi_vestimenta: sanitizedFormData.epi_vestimenta ?? true, // obrigatório
        epi_luvas: sanitizedFormData.epi_luvas ?? false,
        epi_calcado: sanitizedFormData.epi_calcado ?? false,
        observacoes_epi_basico: sanitizedFormData.observacoes_epi_basico,

        // Ferramental e Equipamentos
        ferramental: sanitizedFormData.ferramental,
        corda_icamento: sanitizedFormData.corda_icamento,

        // EPI Altura
        trabalho_altura: sanitizedFormData.trabalho_altura,
        epi_cinto_seguranca: sanitizedFormData.epi_cinto_seguranca,
        epi_talabarte: sanitizedFormData.epi_talabarte,
        epi_capacete_jugular: sanitizedFormData.epi_capacete_jugular,
        observacoes_epi_altura: sanitizedFormData.observacoes_epi_altura,

        // EPI Elétrico
        trabalho_eletrico: sanitizedFormData.trabalho_eletrico,
        epi_luvas_isolantes: sanitizedFormData.epi_luvas_isolantes,
        epi_calcado_isolante: sanitizedFormData.epi_calcado_isolante,
        epi_capacete_classe_b: sanitizedFormData.epi_capacete_classe_b,
        observacoes_epi_eletrico: sanitizedFormData.observacoes_epi_eletrico,

        // Inspeção Geral
        equipamentos_integros: sanitizedFormData.equipamentos_integros ?? true, // obrigatório
        treinamento_adequado: sanitizedFormData.treinamento_adequado ?? true, // obrigatório
        certificados_validos: sanitizedFormData.certificados_validos ?? false, // obrigatório
        reforco_regras_ouro: sanitizedFormData.reforco_regras_ouro,
        observacoes_inspecao: sanitizedFormData.observacoes_inspecao,

        // Declaração de Responsabilidade
        declaracao_responsabilidade: sanitizedFormData.declaracao_responsabilidade,

        // Conclusão
        responsavel_regional: formulario.ufsigla || 'Sistema',
      };

      const { data: insertData, error: insertError } = await supabase
        .from('respostas')
        .insert(insertPayload)
        .select();

      if (insertError) {
        console.error('❌ Erro ao inserir resposta:', insertError);
        throw new Error(`Erro ao salvar resposta: ${insertError.message}`);
      }

      console.log('✅ Resposta inserida com sucesso:', insertData);

      const respostaId = insertData[0].id;

      // Upload das fotos de todas as seções
      const allPhotos = [
        { photos: formData.fotos_identificacao || [], secao: 'identificacao' },
        { photos: formData.fotos_dados_inspecionado || [], secao: 'dados_inspecionado' },
        { photos: formData.fotos_epi_basico || [], secao: 'epi_basico' },
        { photos: formData.fotos_epi_altura || [], secao: 'epi_altura' },
        { photos: formData.fotos_epi_eletrico || [], secao: 'epi_eletrico' },
        { photos: formData.fotos_inspecao_geral || [], secao: 'inspecao_geral' }
      ];

      console.log('📸 Iniciando upload das fotos...');
      let totalPhotosUploaded = 0;
      for (const { photos, secao } of allPhotos) {
        if (photos.length > 0) {
          console.log(`📸 Uploading ${photos.length} fotos para seção: ${secao}`);
          try {
            const uploadedPhotos = await uploadPhotos(photos, respostaId, secao);
            totalPhotosUploaded += uploadedPhotos.length;
            console.log(`✅ ${uploadedPhotos.length}/${photos.length} fotos enviadas para seção: ${secao}`);
          } catch (uploadError) {
            console.error(`❌ Erro no upload das fotos da seção ${secao}:`, uploadError);
          }
        }
      }
      console.log(`✅ Upload das fotos concluído. Total: ${totalPhotosUploaded} fotos enviadas.`);

      // Atualizar status do formulário para "respondido"
      try {
        await updateFormularioStatus(formulario.id, 'respondido');
        console.log('✅ Formulário atualizado com sucesso:', formulario.id);
      } catch (updateError) {
        console.warn('⚠️ Não foi possível atualizar status automaticamente:', updateError);
        // Não bloquear o envio se não conseguir atualizar o status
        // A resposta já foi salva com sucesso
      }

      setState(prev => ({
        ...prev,
        isSubmitting: false,
        submitSuccess: true
      }));

    } catch (error) {
      console.error('Erro ao submeter formulário:', error);
      setState(prev => ({ ...prev, isSubmitting: false }));

      // Mensagem de erro mais específica
      let errorMessage = 'Erro desconhecido';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Se for erro de rede ou conexão, dar uma mensagem mais amigável
      if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('Failed to fetch')) {
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      }

      alert(`Erro ao enviar formulário: ${errorMessage}\n\nSe o problema persistir, entre em contato com o suporte.`);
    }
  };

  const handleFormCancel = () => {
    setState(prev => ({ ...prev, showForm: false }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Loading state
  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-4xl mb-4">⏳</div>
              <h2 className="text-xl font-semibold mb-2">Validando...</h2>
              <p className="text-gray-600">Verificando formulário...</p>
              {token && (
                <p className="text-xs text-gray-400 mt-2 font-mono">
                  Token: {token}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { validationResult, timeInfo } = state;

  // Success state
  if (state.submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-4xl mb-4">✅</div>
              <h2 className="text-xl font-semibold mb-2 text-green-600">
                Formulário Enviado com Sucesso!
              </h2>
              <p className="text-gray-600 mb-4">
                Sua inspeção de EPI foi registrada e será processada pela equipe responsável.
              </p>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Próximos Passos:</h4>
                <ul className="text-sm text-green-800 text-left space-y-1">
                  <li>• Um relatório será gerado automaticamente</li>
                  <li>• O responsável regional será notificado</li>
                  <li>• Mantenha os EPIs em bom estado</li>
                  <li>• Realize inspeções visuais antes de cada uso</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error states
  if (!validationResult || !validationResult.isValid) {
    const getErrorContent = () => {
      switch (validationResult?.status) {
        case 'not_found':
          return {
            icon: '🔍',
            title: 'Formulário Não Encontrado',
            message: 'Este token não corresponde a nenhum formulário válido.',
            color: 'text-red-600'
          };
        case 'invalid':
          return {
            icon: '❌',
            title: 'Token Inválido',
            message: validationResult.error || 'O token fornecido não é válido.',
            color: 'text-red-600'
          };
        case 'answered':
          return {
            icon: '✅',
            title: 'Já Respondido',
            message: 'Este formulário já foi preenchido e enviado.',
            color: 'text-green-600'
          };
        case 'expired':
          return {
            icon: '⏰',
            title: 'Formulário Expirado',
            message: 'Este formulário expirou e não pode mais ser preenchido.',
            color: 'text-orange-600'
          };
        default:
          return {
            icon: '⚠️',
            title: 'Erro',
            message: validationResult?.error || 'Erro desconhecido.',
            color: 'text-red-600'
          };
      }
    };

    const errorContent = getErrorContent();

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-4xl mb-4">{errorContent.icon}</div>
              <h2 className={`text-xl font-semibold mb-2 ${errorContent.color}`}>
                {errorContent.title}
              </h2>
              <p className="text-gray-600 mb-4">{errorContent.message}</p>

              {/* Informações do formulário se disponível */}
              {validationResult?.formulario && (
                <div className="text-sm text-gray-500 space-y-1 mb-4 p-3 bg-gray-100 rounded-lg">
                  <p><strong>Empresa:</strong> {validationResult.formulario.empresa}</p>
                  <p><strong>Regional:</strong> {validationResult.formulario.regional}</p>
                  <p><strong>Criado em:</strong> {formatDate(validationResult.formulario.created_at || '')}</p>
                          {/* Funcionalidade de expiração removida */}
                </div>
              )}

              {/* Informações de quem respondeu (se disponível) */}
              {validationResult?.status === 'answered' && state.respostaInfo && (
                <div className="text-sm text-green-700 space-y-1 mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">📝 Informações da Resposta</h4>
                  <p><strong>Respondido por:</strong> {state.respostaInfo.nome_completo}</p>
                  {state.respostaInfo.data_resposta && (
                    <p><strong>Data da resposta:</strong> {formatDate(state.respostaInfo.data_resposta)}</p>
                  )}
                  {state.respostaInfo.created_at && !state.respostaInfo.data_resposta && (
                    <p><strong>Enviado em:</strong> {formatDate(state.respostaInfo.created_at)}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Button onClick={performTokenValidation} variant="outline" className="w-full">
                  🔄 Tentar Novamente
                </Button>
                <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                  🏠 Voltar ao Início
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Valid form - show form or intro screen
  const formulario = validationResult.formulario!;

  if (!state.showForm) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-center text-green-600">
              ✅ Formulário Válido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Informações do formulário */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">📋 Informações do Formulário</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Empresa:</strong> {formulario.empresa}</p>
                <p><strong>Regional:</strong> {formulario.regional}</p>
                <p><strong>Criado em:</strong> {formatDate(formulario.created_at || '')}</p>
                {timeInfo && (
                  <p><strong>Tempo restante:</strong> {timeInfo.timeLeft}</p>
                )}
              </div>
            </div>

            {/* Instruções */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">📝 Instruções</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Este formulário é para inspeção de Equipamentos de Proteção Individual (EPI)</li>
                <li>• Verifique cuidadosamente cada item antes de marcar como aprovado</li>
                <li>• Todos os campos obrigatórios devem ser preenchidos</li>
                <li>• O formulário será salvo automaticamente ao final</li>
                <li>• Após o envio, não será possível alterar as respostas</li>
              </ul>
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <Button
                onClick={() => setState(prev => ({ ...prev, showForm: true }))}
                className="flex-1"
              >
                🚀 Iniciar Inspeção
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="flex-1"
              >
                🏠 Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show the actual form
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">
              🦺 Inspeção de Equipamentos de Proteção Individual (EPI)
            </CardTitle>
            <div className="text-center text-sm text-gray-600">
              <p><strong>Empresa:</strong> {formulario.empresa} | <strong>Regional:</strong> {formulario.regional}</p>
              {timeInfo && (
                <p className="text-blue-600"><strong>Tempo restante:</strong> {timeInfo.timeLeft}</p>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Form Container */}
        <FormContainer
          formulario={formulario}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      </div>
    </div>
  );
}
