import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Tables } from '@/lib/supabase/database.types';
import { useState } from 'react';
import { Conclusao } from './sections/Conclusao';
import { EpiAltura } from './sections/EpiAltura';
import { EpiBasico } from './sections/EpiBasico';
import { EpiEletrico } from './sections/EpiEletrico';
import { Identificacao } from './sections/Identificacao';
import { InspecaoGeral } from './sections/InspecaoGeral';

type Formulario = Tables<'formularios'>;

export interface FormData {
  // Identificação
  nome_completo: string;
  cpf: string;
  funcao: string;
  regional: string;

  // EPI Básico
  epi_capacete: boolean | null;
  epi_oculos: boolean | null;
  epi_protetor_auricular: boolean | null;
  epi_vestimenta: boolean | null; // máscara/vestimenta
  epi_luvas: boolean | null;
  epi_calcado: boolean | null;
  observacoes_epi_basico: string;

  // EPI Altura
  epi_cinto_seguranca: boolean | null;
  epi_talabarte: boolean | null;
  epi_capacete_jugular: boolean | null;
  observacoes_epi_altura: string;

  // EPI Elétrico
  trabalho_eletrico: boolean | null;
  epi_luvas_isolantes: boolean | null;
  epi_calcado_isolante: boolean | null;
  epi_capacete_classe_b: boolean | null; // detector de tensão -> capacete classe B
  observacoes_epi_eletrico: string;

  // Inspeção Geral
  equipamentos_integros: boolean | null;
  treinamento_adequado: boolean | null;
  certificados_validos: boolean | null;
  observacoes_inspecao: string;

  // Conclusão
  observacoes_gerais: string;
}

interface FormContainerProps {
  formulario: Formulario;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
}

type FormSection = 'identificacao' | 'epi_basico' | 'epi_altura' | 'epi_eletrico' | 'inspecao_geral' | 'conclusao';

const sectionTitles: Record<FormSection, string> = {
  identificacao: '👤 Identificação',
  epi_basico: '🦺 EPI Básico',
  epi_altura: '🪜 EPI para Trabalho em Altura',
  epi_eletrico: '⚡ EPI para Trabalhos Elétricos',
  inspecao_geral: '🔍 Inspeção Geral',
  conclusao: '✅ Conclusão'
};

export function FormContainer({ formulario, onSubmit, onCancel }: FormContainerProps) {
  const [currentSection, setCurrentSection] = useState<FormSection>('identificacao');
  const [formData, setFormData] = useState<FormData>({
    // Identificação
    nome_completo: '',
    cpf: '',
    funcao: '',
    regional: formulario.regional,

    // EPI Básico
    epi_capacete: null,
    epi_oculos: null,
    epi_protetor_auricular: null,
    epi_vestimenta: null,
    epi_luvas: null,
    epi_calcado: null,
    observacoes_epi_basico: '',

    // EPI Altura
    epi_cinto_seguranca: null,
    epi_talabarte: null,
    epi_capacete_jugular: null,
    observacoes_epi_altura: '',

    // EPI Elétrico
    trabalho_eletrico: null,
    epi_luvas_isolantes: null,
    epi_calcado_isolante: null,
    epi_capacete_classe_b: null,
    observacoes_epi_eletrico: '',

    // Inspeção Geral
    equipamentos_integros: null,
    treinamento_adequado: null,
    certificados_validos: null,
    observacoes_inspecao: '',

    // Conclusão
    observacoes_gerais: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sectionErrors, setSectionErrors] = useState<Partial<Record<FormSection, string[]>>>({});

  // Ordem das seções
  const sectionOrder: FormSection[] = [
    'identificacao',
    'epi_basico',
    'epi_altura',
    'epi_eletrico',
    'inspecao_geral',
    'conclusao'
  ];

  const currentSectionIndex = sectionOrder.indexOf(currentSection);
  const isFirstSection = currentSectionIndex === 0;
  const isLastSection = currentSectionIndex === sectionOrder.length - 1;

  // Validação de seção
  const validateSection = (section: FormSection): string[] => {
    const errors: string[] = [];

    switch (section) {
      case 'identificacao':
        if (!formData.nome_completo.trim()) errors.push('Nome completo é obrigatório');
        if (!formData.cpf.trim()) errors.push('CPF é obrigatório');
        if (!formData.funcao.trim()) errors.push('Função é obrigatória');
        if (!formData.regional.trim()) errors.push('Regional é obrigatória');
        break;

      case 'epi_basico':
        const epiBasicoFields = [
          'epi_capacete', 'epi_oculos', 'epi_protetor_auricular',
          'epi_vestimenta', 'epi_luvas', 'epi_calcado'
        ];
        const hasNullEpiBasico = epiBasicoFields.some(field =>
          formData[field as keyof FormData] === null
        );
        if (hasNullEpiBasico) errors.push('Todos os itens de EPI básico devem ser verificados');
        break;

      case 'epi_altura':
        const epiAlturaFields = ['epi_cinto_seguranca', 'epi_talabarte', 'epi_capacete_jugular'];
        const hasNullEpiAltura = epiAlturaFields.some(field =>
          formData[field as keyof FormData] === null
        );
        if (hasNullEpiAltura) errors.push('Todos os itens de EPI para altura devem ser verificados');
        break;

      case 'epi_eletrico':
        if (formData.trabalho_eletrico === null) {
          errors.push('Deve indicar se realizará trabalho elétrico');
        } else if (formData.trabalho_eletrico) {
          const epiEletricoFields = ['epi_luvas_isolantes', 'epi_calcado_isolante', 'epi_capacete_classe_b'];
          const hasNullEpiEletrico = epiEletricoFields.some(field =>
            formData[field as keyof FormData] === null
          );
          if (hasNullEpiEletrico) errors.push('Todos os itens de EPI elétrico devem ser verificados');
        }
        break;

      case 'inspecao_geral':
        const inspecaoFields = ['equipamentos_integros', 'treinamento_adequado', 'certificados_validos'];
        const hasNullInspecao = inspecaoFields.some(field =>
          formData[field as keyof FormData] === null
        );
        if (hasNullInspecao) errors.push('Todos os itens de inspeção devem ser verificados');
        break;

      case 'conclusao':
        // Não há validações obrigatórias para a seção de conclusão
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
      case 'epi_basico':
        return <EpiBasico {...sectionProps} />;
      case 'epi_altura':
        return <EpiAltura {...sectionProps} />;
      case 'epi_eletrico':
        return <EpiEletrico {...sectionProps} />;
      case 'inspecao_geral':
        return <InspecaoGeral {...sectionProps} />;
      case 'conclusao':
        return <Conclusao {...sectionProps} />;
      default:
        return null;
    }
  };

  // Função para calcular progresso de seções específicas
  const getSectionProgress = (section: FormSection) => {
    switch (section) {
      case 'epi_basico': {
        const epiBasicoFields = ['epi_capacete', 'epi_oculos', 'epi_protetor_auricular', 'epi_vestimenta', 'epi_luvas', 'epi_calcado'];
        const completed = epiBasicoFields.filter(field => formData[field as keyof FormData] !== null).length;
        return { completed, total: epiBasicoFields.length };
      }
      case 'epi_altura': {
        const epiAlturaFields = ['epi_cinto_seguranca', 'epi_talabarte', 'epi_capacete_jugular'];
        const completed = epiAlturaFields.filter(field => formData[field as keyof FormData] !== null).length;
        return { completed, total: epiAlturaFields.length };
      }
      case 'epi_eletrico': {
        if (!formData.trabalho_eletrico) return { completed: 1, total: 1 }; // Só precisa responder se faz trabalho elétrico
        const epiEletricoFields = ['epi_luvas_isolantes', 'epi_calcado_isolante', 'epi_capacete_classe_b'];
        const completed = epiEletricoFields.filter(field => formData[field as keyof FormData] !== null).length + 1; // +1 pelo trabalho_eletrico
        return { completed, total: epiEletricoFields.length + 1 };
      }
      case 'inspecao_geral': {
        const inspecaoFields = ['equipamentos_integros', 'treinamento_adequado', 'certificados_validos'];
        const completed = inspecaoFields.filter(field => formData[field as keyof FormData] !== null).length;
        return { completed, total: inspecaoFields.length };
      }
      default:
        return { completed: 1, total: 1 }; // Seções que não têm progresso específico
    }
  };

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
                        {isActive && '👤'} {isCompleted && '✅'} {hasErrors && '⚠️'}
                      </div>
                      <div className="text-xs mt-0.5">
                        {section === 'identificacao' && 'ID'}
                        {section === 'epi_basico' && 'Básico'}
                        {section === 'epi_altura' && 'Altura'}
                        {section === 'epi_eletrico' && 'Elétrico'}
                        {section === 'inspecao_geral' && 'Inspeção'}
                        {section === 'conclusao' && 'Conclusão'}
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
                    {currentSection === 'epi_basico' && '🦺 EPI Básico'}
                    {currentSection === 'epi_altura' && '🪜 Trabalho em Altura'}
                    {currentSection === 'epi_eletrico' && '⚡ Trabalhos Elétricos'}
                    {currentSection === 'inspecao_geral' && '🔍 Inspeção Geral'}
                  </h4>
                  <span className="text-xs text-blue-700">
                    {(() => {
                      const progress = getSectionProgress(currentSection);
                      return `${progress.completed}/${progress.total}`;
                    })()}
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
              {currentSection === 'identificacao' && '👤'}
              {currentSection === 'epi_basico' && '🦺'}
              {currentSection === 'epi_altura' && '🪜'}
              {currentSection === 'epi_eletrico' && '⚡'}
              {currentSection === 'inspecao_geral' && '🔍'}
              {currentSection === 'conclusao' && '✅'}
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

                {isLastSection ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                  >
                    {isSubmitting ? '⏳ Enviando...' : '✅ Enviar Formulário'}
                  </Button>
                ) : (
                  <Button
                    onClick={goToNextSection}
                    className="flex items-center gap-2"
                  >
                    Próximo →
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
