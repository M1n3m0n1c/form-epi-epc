import { FormContainer, type FormData } from '@/components/form/FormContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import {
    getTimeUntilExpiration,
    sanitizeInput,
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

      // Calcular informações de tempo se o formulário existir
      let timeInfo = null;
      if (validationResult.formulario) {
        timeInfo = getTimeUntilExpiration(validationResult.formulario);
      }

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
      // Buscar a resposta mais recente (caso haja múltiplas)
      const { data, error } = await supabase
        .from('respostas')
        .select('nome_completo, created_at')
        .eq('formulario_id', formularioId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Erro ao buscar informações da resposta:', error);
        return null;
      }

      // Buscar também a data de resposta do formulário
      const { data: formularioData, error: formularioError } = await supabase
        .from('formularios')
        .select('data_resposta')
        .eq('id', formularioId)
        .single();

      if (formularioError) {
        console.error('Erro ao buscar data de resposta:', formularioError);
      }

      return {
        nome_completo: data.nome_completo,
        data_resposta: formularioData?.data_resposta || data.created_at,
        created_at: data.created_at
      };
    } catch (error) {
      console.error('Erro ao buscar informações da resposta:', error);
      return null;
    }
  };

  const handleFormSubmit = async (formData: FormData) => {
    if (!state.validationResult?.formulario) return;

    try {
      setState(prev => ({ ...prev, isSubmitting: true }));

      const formulario = state.validationResult.formulario;

      console.log('📋 Dados recebidos do formulário:', formData);

      // Sanitizar dados de texto antes do envio
      const sanitizedFormData = {
        ...formData,
        nome_completo: sanitizeInput(formData.nome_completo),
        funcao: sanitizeInput(formData.funcao),
        observacoes_epi_basico: formData.observacoes_epi_basico ? sanitizeInput(formData.observacoes_epi_basico) : null,
        observacoes_epi_altura: formData.observacoes_epi_altura ? sanitizeInput(formData.observacoes_epi_altura) : null,
        observacoes_epi_eletrico: formData.observacoes_epi_eletrico ? sanitizeInput(formData.observacoes_epi_eletrico) : null,
        observacoes_inspecao: formData.observacoes_inspecao ? sanitizeInput(formData.observacoes_inspecao) : null,
        observacoes_gerais: formData.observacoes_gerais ? sanitizeInput(formData.observacoes_gerais) : null,
      };

      console.log('🧹 Dados sanitizados:', sanitizedFormData);

      // Verificar se já existe resposta para este formulário
      const { data: existingResponse, error: checkError } = await supabase
        .from('respostas')
        .select('id')
        .eq('formulario_id', formulario.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('❌ Erro ao verificar resposta existente:', checkError);
        throw new Error(`Erro ao verificar resposta: ${checkError.message}`);
      }

      if (existingResponse) {
        throw new Error('Este formulário já foi respondido. Recarregue a página para ver o status atualizado.');
      }

      // Inserir resposta no banco de dados
      console.log('📝 Inserindo resposta para formulário:', formulario.id);
      const { data: insertData, error: insertError } = await supabase
        .from('respostas')
        .insert({
          formulario_id: formulario.id,
          empresa: formulario.empresa,
          nome_completo: sanitizedFormData.nome_completo,
          cpf: sanitizedFormData.cpf,
          funcao: sanitizedFormData.funcao,
          regional: sanitizedFormData.regional,

          // EPI Básico (converter null para false para campos obrigatórios)
          epi_capacete: sanitizedFormData.epi_capacete ?? false,
          epi_oculos: sanitizedFormData.epi_oculos ?? false,
          epi_protetor_auricular: sanitizedFormData.epi_protetor_auricular ?? false,
          epi_vestimenta: sanitizedFormData.epi_vestimenta ?? false,
          epi_luvas: sanitizedFormData.epi_luvas ?? false,
          epi_calcado: sanitizedFormData.epi_calcado ?? false,
          observacoes_epi_basico: sanitizedFormData.observacoes_epi_basico,

          // EPI Altura (campos opcionais podem ser null)
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

          // Inspeção Geral (converter null para false para campos obrigatórios)
          equipamentos_integros: sanitizedFormData.equipamentos_integros ?? false,
          treinamento_adequado: sanitizedFormData.treinamento_adequado ?? false,
          certificados_validos: sanitizedFormData.certificados_validos ?? false,
          observacoes_inspecao: sanitizedFormData.observacoes_inspecao,

          // Conclusão
          responsavel_regional: formulario.criado_por || 'Sistema',
          observacoes_gerais: sanitizedFormData.observacoes_gerais
        })
        .select();

      if (insertError) {
        console.error('❌ Erro ao inserir resposta:', insertError);
        throw new Error(`Erro ao salvar resposta: ${insertError.message}`);
      }

      console.log('✅ Resposta inserida com sucesso:', insertData);

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
      alert(`Erro ao enviar formulário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
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
                  {validationResult.formulario.data_expiracao && (
                    <p><strong>Expirou em:</strong> {formatDate(validationResult.formulario.data_expiracao)}</p>
                  )}
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
