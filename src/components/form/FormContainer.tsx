import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Tables } from '@/lib/supabase/database.types';
import { useEffect, useState } from 'react';
import type { PhotoData } from '../shared/PhotoUpload';
import { DadosInspecionado } from './sections/DadosInspecionado';
import { EpiAltura } from './sections/EpiAltura';
import { EpiBasico } from './sections/EpiBasico';
import { EpiEletrico } from './sections/EpiEletrico';
import { Identificacao } from './sections/Identificacao';
import { InspecaoGeral } from './sections/InspecaoGeral';

type Formulario = Tables<'formularios'>;

export interface FormData {
  // Identificação do Responsável pela Inspeção (Técnico/Engenheiro de Segurança)
  responsavel_nome: string;
  responsavel_cpf: string;
  responsavel_funcao: string;

  // Identificação da Pessoa Inspecionada
  inspecionado_nome: string;
  inspecionado_cpf: string;
  inspecionado_funcao: string;
  regional: string; // Não obrigatório mais

  // EPI Básico
  epi_capacete: boolean | null | undefined;
  epi_oculos: boolean | null | undefined;
  epi_protetor_auricular: boolean | null | undefined;
  epi_vestimenta: boolean | null | undefined; // máscara/vestimenta
  epi_luvas: boolean | null | undefined;
  epi_calcado: boolean | null | undefined;
  observacoes_epi_basico: string;

  // Ferramental e Equipamentos
  ferramental: boolean | null | undefined;
  corda_icamento: boolean | null | undefined;

  // EPI Altura
  trabalho_altura: boolean | null | undefined;
  epi_cinto_seguranca: boolean | null | undefined;
  epi_talabarte: boolean | null | undefined;
  epi_capacete_jugular: boolean | null | undefined;
  observacoes_epi_altura: string;

  // EPI Elétrico
  trabalho_eletrico: boolean | null | undefined;
  epi_luvas_isolantes: boolean | null | undefined;
  epi_calcado_isolante: boolean | null | undefined;
  epi_capacete_classe_b: boolean | null | undefined; // detector de tensão -> capacete classe B
  observacoes_epi_eletrico: string;

  // Inspeção Geral
  equipamentos_integros: boolean | null | undefined;
  treinamento_adequado: boolean | null | undefined;
  certificados_validos: boolean | null | undefined;
  reforco_regras_ouro: boolean | null | undefined;
  observacoes_inspecao: string;

  // Declaração de Responsabilidade
  declaracao_responsabilidade: boolean;

  // Fotos por seção
  fotos_identificacao: PhotoData[];
  fotos_dados_inspecionado: PhotoData[];
  fotos_epi_basico: PhotoData[];
  fotos_epi_altura: PhotoData[];
  fotos_epi_eletrico: PhotoData[];
  fotos_inspecao_geral: PhotoData[]; // Obrigatória pelo menos uma foto
}

interface FormContainerProps {
  formulario: Formulario;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
}

type FormSection = 'identificacao' | 'dados_inspecionado' | 'epi_basico' | 'epi_altura' | 'epi_eletrico' | 'inspecao_geral';

const sectionTitles: Record<FormSection, string> = {
  identificacao: 'Dados do Técnico/Engenheiro',
  dados_inspecionado: 'Dados da Pessoa Inspecionada',
  epi_basico: 'EPI Básico',
  epi_altura: 'EPI para Trabalho em Altura',
  epi_eletrico: 'EPI para Trabalhos Elétricos',
  inspecao_geral: 'Inspeção Geral'
};

export function FormContainer({ formulario, onSubmit, onCancel }: FormContainerProps) {
  const [currentSection, setCurrentSection] = useState<FormSection>('identificacao');
  const [formData, setFormData] = useState<FormData>({
    // Identificação do Responsável pela Inspeção (Técnico/Engenheiro de Segurança)
    responsavel_nome: '',
    responsavel_cpf: '',
    responsavel_funcao: '',

    // Identificação da Pessoa Inspecionada
    inspecionado_nome: '',
    inspecionado_cpf: '',
    inspecionado_funcao: '',
    regional: formulario.regional,

    // EPI Básico
    epi_capacete: undefined,
    epi_oculos: undefined,
    epi_protetor_auricular: undefined,
    epi_vestimenta: undefined,
    epi_luvas: undefined,
    epi_calcado: undefined,
    observacoes_epi_basico: '',

    // Ferramental e Equipamentos
    ferramental: undefined,
    corda_icamento: undefined,

    // EPI Altura
    trabalho_altura: undefined,
    epi_cinto_seguranca: undefined,
    epi_talabarte: undefined,
    epi_capacete_jugular: undefined,
    observacoes_epi_altura: '',

    // EPI Elétrico
    trabalho_eletrico: undefined,
    epi_luvas_isolantes: undefined,
    epi_calcado_isolante: undefined,
    epi_capacete_classe_b: undefined,
    observacoes_epi_eletrico: '',

    // Inspeção Geral
    equipamentos_integros: undefined,
    treinamento_adequado: undefined,
    certificados_validos: undefined,
    reforco_regras_ouro: undefined,
    observacoes_inspecao: '',

    // Declaração de Responsabilidade
    declaracao_responsabilidade: false,

    // Fotos por seção
    fotos_identificacao: [],
    fotos_dados_inspecionado: [],
    fotos_epi_basico: [],
    fotos_epi_altura: [],
    fotos_epi_eletrico: [],
    fotos_inspecao_geral: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sectionErrors, setSectionErrors] = useState<Partial<Record<FormSection, string[]>>>({});

  // Ordem das seções
  const sectionOrder: FormSection[] = [
    'identificacao',
    'dados_inspecionado',
    'epi_basico',
    'epi_altura',
    'epi_eletrico',
    'inspecao_geral'
  ];

  const currentSectionIndex = sectionOrder.indexOf(currentSection);
  const isFirstSection = currentSectionIndex === 0;
  const isLastSection = currentSectionIndex === sectionOrder.length - 1;

  // Validação de seção
  const validateSection = (section: FormSection): string[] => {
    const errors: string[] = [];

    switch (section) {
      case 'identificacao':
        if (!formData.responsavel_nome.trim()) errors.push('Nome do técnico é obrigatório');
        if (!formData.responsavel_cpf.trim()) errors.push('CPF do técnico é obrigatório');
        if (!formData.responsavel_funcao.trim()) errors.push('Função do técnico é obrigatória');
        break;

      case 'dados_inspecionado':
        if (!formData.inspecionado_nome.trim()) errors.push('Nome da pessoa inspecionada é obrigatório');
        if (!formData.inspecionado_cpf.trim()) errors.push('CPF da pessoa inspecionada é obrigatório');
        if (!formData.inspecionado_funcao.trim()) errors.push('Função da pessoa inspecionada é obrigatória');
        // Regional não é mais obrigatória
        break;

      case 'epi_basico':
        const epiBasicoFields = [
          'epi_capacete', 'epi_oculos', 'epi_protetor_auricular',
          'epi_vestimenta', 'epi_luvas', 'epi_calcado'
        ];
        const equipmentFields = ['ferramental', 'corda_icamento'];

        const hasUndefinedEpiBasico = epiBasicoFields.some(field =>
          formData[field as keyof FormData] === undefined
        );
        const hasUndefinedEquipment = equipmentFields.some(field =>
          formData[field as keyof FormData] === undefined
        );

        if (hasUndefinedEpiBasico) errors.push('Todos os itens de EPI básico devem ser verificados (pode usar "Não Aplicável")');
        if (hasUndefinedEquipment) errors.push('Ferramental e corda de içamento devem ser verificados');
        break;

      case 'epi_altura':
        if (formData.trabalho_altura === undefined) {
          errors.push('Deve indicar se realizará trabalho em altura');
        } else if (formData.trabalho_altura) {
          const epiAlturaFields = ['epi_cinto_seguranca', 'epi_talabarte', 'epi_capacete_jugular'];
          const hasUndefinedEpiAltura = epiAlturaFields.some(field =>
            formData[field as keyof FormData] === undefined
          );
          if (hasUndefinedEpiAltura) errors.push('Todos os itens de EPI para altura devem ser verificados');
        }
        break;

      case 'epi_eletrico':
        if (formData.trabalho_eletrico === undefined) {
          errors.push('Deve indicar se realizará trabalho elétrico');
        } else if (formData.trabalho_eletrico) {
          const epiEletricoFields = ['epi_luvas_isolantes', 'epi_calcado_isolante', 'epi_capacete_classe_b'];
          const hasUndefinedEpiEletrico = epiEletricoFields.some(field =>
            formData[field as keyof FormData] === undefined
          );
          if (hasUndefinedEpiEletrico) errors.push('Todos os itens de EPI elétrico devem ser verificados');
        }
        break;

      case 'inspecao_geral':
        const inspecaoFields = ['equipamentos_integros', 'treinamento_adequado', 'certificados_validos', 'reforco_regras_ouro'];
        const hasUndefinedInspecao = inspecaoFields.some(field =>
          formData[field as keyof FormData] === undefined
        );
        if (hasUndefinedInspecao) errors.push('Todos os itens de inspeção devem ser verificados');

        // Validar foto obrigatória na inspeção geral
        if (formData.fotos_inspecao_geral.length === 0) {
          errors.push('É obrigatório adicionar pelo menos uma foto do inspecionado usando os EPIs');
        }

        // Validar declaração de responsabilidade
        if (!formData.declaracao_responsabilidade) {
          errors.push('É obrigatório concordar com a declaração de responsabilidade');
        }
        break;
    }

    return errors;
  };

  // Navegação entre seções
  const goToNextSection = () => {
    const errors = validateSection(currentSection);

    if (errors.length > 0) {
      setSectionErrors({ ...sectionErrors, [currentSection]: errors });
      return;
    }

    // Limpar erros da seção atual
    setSectionErrors({ ...sectionErrors, [currentSection]: [] });

    if (!isLastSection) {
      setCurrentSection(sectionOrder[currentSectionIndex + 1]);
    }
  };

  const goToPreviousSection = () => {
    if (!isFirstSection) {
      setCurrentSection(sectionOrder[currentSectionIndex - 1]);
    }
  };

  // Atualizar dados do formulário
  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Submeter formulário
  const handleSubmit = async () => {
    // Validar todas as seções
    const allErrors: Record<FormSection, string[]> = {} as Record<FormSection, string[]>;
    let hasErrors = false;

    for (const section of sectionOrder) {
      const errors = validateSection(section);
      allErrors[section] = errors;
      if (errors.length > 0) hasErrors = true;
    }

    if (hasErrors) {
      setSectionErrors(allErrors);
      // Ir para a primeira seção com erro
      const firstErrorSection = sectionOrder.find(section => allErrors[section].length > 0);
      if (firstErrorSection) {
        setCurrentSection(firstErrorSection);
      }
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('Erro ao submeter formulário:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderizar seção atual
  const renderCurrentSection = () => {
    const sectionProps = {
      data: formData,
      onChange: updateFormData,
      errors: sectionErrors[currentSection] || [],
      formulario
    };

    switch (currentSection) {
      case 'identificacao':
        return <Identificacao {...sectionProps} />;
      case 'dados_inspecionado':
        return <DadosInspecionado {...sectionProps} />;
      case 'epi_basico':
        return <EpiBasico {...sectionProps} />;
      case 'epi_altura':
        return <EpiAltura {...sectionProps} />;
      case 'epi_eletrico':
        return <EpiEletrico {...sectionProps} />;
      case 'inspecao_geral':
        return <InspecaoGeral {...sectionProps} />;
      default:
        return null;
    }
  };

  // Função para calcular progresso de seções específicas
  const getSectionProgress = (section: FormSection) => {
    switch (section) {
      case 'epi_basico': {
        const epiBasicoFields = ['epi_capacete', 'epi_oculos', 'epi_protetor_auricular', 'epi_vestimenta', 'epi_luvas', 'epi_calcado', 'ferramental', 'corda_icamento'];
        const completed = epiBasicoFields.filter(field => formData[field as keyof FormData] !== undefined).length;
        return { completed, total: epiBasicoFields.length };
      }
      case 'epi_altura': {
        if (formData.trabalho_altura === false) return { completed: 1, total: 1 }; // Só precisa responder se fará trabalho em altura
        if (formData.trabalho_altura === true) {
          const epiAlturaFields = ['epi_cinto_seguranca', 'epi_talabarte', 'epi_capacete_jugular'];
          const completed = epiAlturaFields.filter(field => formData[field as keyof FormData] !== undefined).length + 1; // +1 pelo trabalho_altura
          return { completed, total: epiAlturaFields.length + 1 };
        }
        return { completed: 0, total: 1 }; // Ainda não respondeu se fará trabalho em altura
      }
      case 'epi_eletrico': {
        if (!formData.trabalho_eletrico) return { completed: 1, total: 1 }; // Só precisa responder se faz trabalho elétrico
        const epiEletricoFields = ['epi_luvas_isolantes', 'epi_calcado_isolante', 'epi_capacete_classe_b'];
        const completed = epiEletricoFields.filter(field => formData[field as keyof FormData] !== undefined).length + 1; // +1 pelo trabalho_eletrico
        return { completed, total: epiEletricoFields.length + 1 };
      }
      case 'inspecao_geral': {
        const inspecaoFields = ['equipamentos_integros', 'treinamento_adequado', 'certificados_validos', 'reforco_regras_ouro'];
        const completed = inspecaoFields.filter(field => formData[field as keyof FormData] !== undefined).length;
        const declaracaoCompleta = formData.declaracao_responsabilidade ? 1 : 0;
        return { completed: completed + declaracaoCompleta, total: inspecaoFields.length + 1 }; // +1 para declaração
      }
      default:
        return { completed: 1, total: 1 }; // Seções que não têm progresso específico
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentSection]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cabeçalho Estático Compacto */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-2">
          {/* Informações do Formulário - Compacto */}
          <div className="text-center mb-3">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-red-600 text-sm">🛡️</span>
              <h1 className="text-base font-semibold text-gray-900">
                Inspeção EPI
              </h1>
            </div>
            <div className="flex items-center justify-center gap-3 text-xs text-gray-600">
              <span><strong>Empresa:</strong> {formulario.empresa}</span>
              <span>•</span>
              <span><strong>Regional:</strong> {formulario.regional}</span>
              <span>•</span>
              <span className="text-blue-600"><strong>Status:</strong> Ativo</span>
            </div>
          </div>

          {/* Barra de Progresso Unificada Compacta */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            {/* Progresso Geral */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-medium text-blue-900">Progresso</h3>
                <span className="text-xs text-blue-700">
                  {currentSectionIndex + 1}/{sectionOrder.length}
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-1.5 mb-2">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${((currentSectionIndex + 1) / sectionOrder.length) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs">
                {sectionOrder.map((section, index) => {
                  const isActive = index === currentSectionIndex;
                  const isCompleted = index < currentSectionIndex;
                  const hasErrors = (sectionErrors[section]?.length || 0) > 0;

                  return (
                    <span
                      key={section}
                      className={`text-center flex-1 ${
                        isActive ? 'text-blue-700 font-semibold' :
                        isCompleted ? 'text-blue-600 font-medium' :
                        hasErrors ? 'text-red-600' : 'text-gray-500'
                      }`}
                    >
                      <div className="text-xs">
                        {isActive && '⏳'} {isCompleted && '✅'} {hasErrors && '⚠️'}
                      </div>
                      <div className="text-xs mt-0.5">
                        {section === 'identificacao' && 'Técnico'}
                        {section === 'dados_inspecionado' && 'Inspecionado'}
                        {section === 'epi_basico' && 'Básico'}
                        {section === 'epi_altura' && 'Altura'}
                        {section === 'epi_eletrico' && 'Elétrico'}
                        {section === 'inspecao_geral' && 'Inspeção'}
                      </div>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Progresso da Seção Atual (se aplicável) */}
            {['epi_basico', 'epi_altura', 'epi_eletrico', 'inspecao_geral'].includes(currentSection) && (
              <div className="border-t border-blue-300 pt-2">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-medium text-blue-800">
                    {currentSection === 'epi_basico' && 'EPI Básico'}
                    {currentSection === 'epi_altura' && 'Trabalho em Altura'}
                    {currentSection === 'epi_eletrico' && 'Trabalhos Elétricos'}
                    {currentSection === 'inspecao_geral' && 'Inspeção Geral'}
                  </h4>
                  <span className="text-xs text-blue-700">
                    {getSectionProgress(currentSection).completed}/{getSectionProgress(currentSection).total}
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-1">
                  <div
                    className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                    style={{
                      width: `${(() => {
                        const progress = getSectionProgress(currentSection);
                        return (progress.completed / progress.total) * 100;
                      })()}%`
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Seção Atual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentSection === 'identificacao' && '👨‍💼'}
              {currentSection === 'dados_inspecionado' && '👷‍♂️'}
              {currentSection === 'epi_basico' && '🦺'}
              {currentSection === 'epi_altura' && '🪜'}
              {currentSection === 'epi_eletrico' && '⚡'}
              {currentSection === 'inspecao_geral' && '🔍'}
              {sectionTitles[currentSection]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderCurrentSection()}
          </CardContent>
        </Card>

        {/* Navegação */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={goToPreviousSection}
                disabled={isFirstSection}
                className="flex items-center gap-2"
              >
                ← Anterior
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>

                {currentSectionIndex < sectionOrder.length - 1 ? (
                  <Button onClick={goToNextSection} className="px-6">
                    Próxima Seção →
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? '⏳ Enviando...' : '✅ Finalizar Inspeção'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
