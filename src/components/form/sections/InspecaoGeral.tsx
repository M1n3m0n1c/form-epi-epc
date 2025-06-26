import { Label } from '@/components/ui/label';
import type { Tables } from '@/lib/supabase/database.types';
import type { FormData } from '../FormContainer';

type Formulario = Tables<'formularios'>;

interface InspecaoGeralProps {
  data: FormData;
  onChange: (updates: Partial<FormData>) => void;
  errors: string[];
  formulario: Formulario;
}

interface InspecaoItem {
  key: keyof FormData;
  label: string;
  description: string;
  icon: string;
}

const inspecaoItems: InspecaoItem[] = [
  {
    key: 'equipamentos_integros',
    label: 'Equipamentos Íntegros',
    description: 'Todos os EPIs estão em perfeito estado, sem rachaduras, desgastes ou defeitos',
    icon: '🔧'
  },
  {
    key: 'treinamento_adequado',
    label: 'Treinamento Adequado',
    description: 'Colaborador possui treinamento adequado para usar todos os EPIs verificados',
    icon: '📚'
  },
  {
    key: 'certificados_validos',
    label: 'Certificados Válidos',
    description: 'Todos os equipamentos possuem Certificado de Aprovação (CA) dentro da validade',
    icon: '📋'
  },
  {
    key: 'reforco_regras_ouro',
    label: 'Reforço Regras de Ouro',
    description: 'Foi realizado reforço sobre as regras de ouro da Vivo/Vale',
    icon: '🥇'
  }
];

export function InspecaoGeral({ data, onChange, errors }: InspecaoGeralProps) {

  const handleInspecaoChange = (key: keyof FormData, value: boolean) => {
    onChange({ [key]: value });
  };

  const handleObservacoesChange = (value: string) => {
    onChange({ observacoes_inspecao: value });
  };

  const getCompletionStatus = () => {
    const totalItems = inspecaoItems.length;
    const completedItems = inspecaoItems.filter(item =>
      data[item.key] !== undefined
    ).length;

    return { completed: completedItems, total: totalItems };
  };

  const { completed, total } = getCompletionStatus();
  const isComplete = completed === total;

  // Calcular estatísticas gerais do formulário
  const getFormStatistics = () => {
    // EPI Básico - incluindo os novos campos ferramental e corda_icamento
    const epiBasicoItems = [
      'epi_capacete', 'epi_oculos', 'epi_protetor_auricular',
      'epi_vestimenta', 'epi_luvas', 'epi_calcado',
      'ferramental', 'corda_icamento'
    ];

    // EPI Altura - apenas quando há trabalho em altura
    const epiAlturaItems = ['epi_cinto_seguranca', 'epi_talabarte', 'epi_capacete_jugular'];

    // EPI Elétrico - apenas quando há trabalho elétrico
    const epiEletricoItems = ['epi_luvas_isolantes', 'epi_calcado_isolante', 'epi_capacete_classe_b'];

    // Função para contar aprovados (true ou null/N.A.)
    const countApproved = (items: string[]) => {
      return items.filter(item => {
        const value = data[item as keyof FormData];
        return value === true || value === null; // true = aprovado, null = N.A. (também conta como aprovado)
      }).length;
    };

    // EPI Básico - sempre conta todos os 8 itens
    const epiBasicoAprovados = countApproved(epiBasicoItems);
    const epiBasicoTotal = epiBasicoItems.length; // 8 itens

    // EPI Altura - depende se há trabalho em altura
    let epiAlturaAprovados = 0;
    let epiAlturaTotal = 0;

    if (data.trabalho_altura === true) {
      // Se há trabalho em altura, conta os EPIs específicos
      epiAlturaAprovados = countApproved(epiAlturaItems);
      epiAlturaTotal = epiAlturaItems.length; // 3 itens
    } else if (data.trabalho_altura === false) {
      // Se não há trabalho em altura, considera todos como N.A. (aprovados)
      epiAlturaAprovados = epiAlturaItems.length;
      epiAlturaTotal = epiAlturaItems.length; // 3 itens, todos N.A.
    }
    // Se trabalho_altura === undefined, não conta nada ainda

    // EPI Elétrico - depende se há trabalho elétrico
    let epiEletricoAprovados = 0;
    let epiEletricoTotal = 0;

    if (data.trabalho_eletrico === true) {
      // Se há trabalho elétrico, conta os EPIs específicos
      epiEletricoAprovados = countApproved(epiEletricoItems);
      epiEletricoTotal = epiEletricoItems.length; // 3 itens
    } else if (data.trabalho_eletrico === false) {
      // Se não há trabalho elétrico, considera todos como N.A. (aprovados)
      epiEletricoAprovados = epiEletricoItems.length;
      epiEletricoTotal = epiEletricoItems.length; // 3 itens, todos N.A.
    }
    // Se trabalho_eletrico === undefined, não conta nada ainda

    const totalAprovados = epiBasicoAprovados + epiAlturaAprovados + epiEletricoAprovados;
    const totalItens = epiBasicoTotal + epiAlturaTotal + epiEletricoTotal;

    return {
      epiBasico: { aprovados: epiBasicoAprovados, total: epiBasicoTotal },
      epiAltura: { aprovados: epiAlturaAprovados, total: epiAlturaTotal },
      epiEletrico: { aprovados: epiEletricoAprovados, total: epiEletricoTotal },
      geral: { aprovados: totalAprovados, total: totalItens }
    };
  };

  const stats = getFormStatistics();
  const hasReprovados = stats.geral.aprovados < stats.geral.total;

  return (
    <div className="space-y-6">
      {/* Erros gerais da seção */}
      {errors.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-medium text-red-800 mb-2">⚠️ Corrija os seguintes erros:</h4>
          <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Progress */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-blue-900">🔍 Progresso da Inspeção Geral</h4>
          <span className="text-sm text-blue-700 font-medium">
            {completed}/{total} itens verificados
          </span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completed / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Resumo estatístico */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 bg-gray-50 border rounded-lg">
          <h5 className="font-medium text-gray-900 mb-1">🦺 EPI Básico</h5>
          <p className="text-2xl font-bold text-gray-700">
            {stats.epiBasico.aprovados}/{stats.epiBasico.total}
          </p>
          <p className="text-xs text-gray-600">Aprovados</p>
        </div>

        <div className="p-4 bg-gray-50 border rounded-lg">
          <h5 className="font-medium text-gray-900 mb-1">🪜 EPI Altura</h5>
          <p className="text-2xl font-bold text-gray-700">
            {data.trabalho_altura === false
              ? `${stats.epiAltura.total}/${stats.epiAltura.total}`
              : data.trabalho_altura === true
                ? `${stats.epiAltura.aprovados}/${stats.epiAltura.total}`
                : 'N/A'
            }
          </p>
          <p className="text-xs text-gray-600">
            {data.trabalho_altura === false
              ? 'Não aplicável'
              : data.trabalho_altura === true
                ? 'Aprovados'
                : 'Aguardando definição'
            }
          </p>
        </div>

        <div className="p-4 bg-gray-50 border rounded-lg">
          <h5 className="font-medium text-gray-900 mb-1">⚡ EPI Elétrico</h5>
          <p className="text-2xl font-bold text-gray-700">
            {data.trabalho_eletrico === false
              ? `${stats.epiEletrico.total}/${stats.epiEletrico.total}`
              : data.trabalho_eletrico === true
                ? `${stats.epiEletrico.aprovados}/${stats.epiEletrico.total}`
                : 'N/A'
            }
          </p>
          <p className="text-xs text-gray-600">
            {data.trabalho_eletrico === false
              ? 'Não aplicável'
              : data.trabalho_eletrico === true
                ? 'Aprovados'
                : 'Aguardando definição'
            }
          </p>
        </div>

        <div className={`p-4 border rounded-lg ${
          hasReprovados ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
        }`}>
          <h5 className="font-medium text-gray-900 mb-1">📊 Total Geral</h5>
          <p className={`text-2xl font-bold ${
            hasReprovados ? 'text-red-700' : 'text-green-700'
          }`}>
            {stats.geral.aprovados}/{stats.geral.total}
          </p>
          <p className="text-xs text-gray-600">Aprovados</p>
        </div>
      </div>

      {/* Lista de verificações finais */}
      <div className="space-y-4">
        {inspecaoItems.map((item) => {
          const currentValue = data[item.key] as boolean | null | undefined;

          return (
            <div key={item.key} className="border rounded-lg p-4">
              <div className="flex items-start gap-4">
                <div className="text-2xl">{item.icon}</div>

                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 mb-1">
                    {item.label}
                  </h5>
                  <p className="text-sm text-gray-600 mb-3">
                    {item.description}
                  </p>

                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={item.key}
                        value="true"
                        checked={currentValue === true}
                        onChange={() => handleInspecaoChange(item.key, true)}
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-green-700">
                        ✅ Sim - Conforme
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={item.key}
                        value="false"
                        checked={currentValue === false}
                        onChange={() => handleInspecaoChange(item.key, false)}
                        className="w-4 h-4 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm font-medium text-red-700">
                        ❌ Não - Não Conforme
                      </span>
                    </label>
                  </div>
                </div>

                {/* Status visual */}
                <div className="flex items-center">
                  {currentValue === true && (
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                  )}
                  {currentValue === false && (
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 text-sm">✗</span>
                    </div>
                  )}
                  {currentValue === undefined && (
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-400 text-sm">?</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Observações */}
      <div className="space-y-2">
        <Label htmlFor="observacoes_inspecao" className="text-sm font-medium">
          Observações Gerais da Inspeção (opcional)
        </Label>
        <textarea
          id="observacoes_inspecao"
          placeholder="Anote observações gerais sobre a inspeção, recomendações de melhorias, pontos de atenção, etc..."
          value={data.observacoes_inspecao}
          onChange={(e) => handleObservacoesChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical min-h-[100px]"
          maxLength={500}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Inclua recomendações e observações gerais da inspeção</span>
          <span>{data.observacoes_inspecao.length}/500</span>
        </div>
      </div>

      {/* Declaração de Responsabilidade */}
      <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-4 text-lg">📋 Declaração de Responsabilidade</h4>

        <div className="bg-white p-4 rounded-lg border mb-4">
          <p className="text-sm text-gray-800 leading-relaxed">
            <strong>Eu, {data.responsavel_nome || '[Nome do Responsável]'}, CPF {data.responsavel_cpf || '[CPF]'},
            na função de {data.responsavel_funcao || '[Função]'}</strong>, declaro que:
          </p>

          <ul className="mt-3 space-y-2 text-sm text-gray-700">
            <li>• Realizei a inspeção de EPI/EPC de forma criteriosa e responsável</li>
            <li>• Todas as informações prestadas neste formulário são verdadeiras</li>
            <li>• Orientei adequadamente o colaborador sobre o uso correto dos equipamentos</li>
            <li>• Realizei o reforço das regras de ouro da Vivo/Vale conforme necessário</li>
            <li>• Assumo total responsabilidade pelas informações declaradas</li>
          </ul>
        </div>

        <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <input
            type="checkbox"
            id="declaracao_responsabilidade"
            checked={data.declaracao_responsabilidade || false}
            onChange={(e) => onChange({ declaracao_responsabilidade: e.target.checked })}
            className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-2 border-gray-300 rounded mt-0.5"
          />
          <label htmlFor="declaracao_responsabilidade" className="text-sm font-medium text-gray-900 cursor-pointer">
            <strong>Concordo com a declaração de responsabilidade acima e confirmo que todas as informações
            prestadas são verdadeiras e que a inspeção foi realizada de acordo com as normas de segurança.*</strong>
          </label>
        </div>

        {!data.declaracao_responsabilidade && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              ⚠️ <strong>Obrigatório:</strong> É necessário concordar com a declaração de responsabilidade para finalizar a inspeção.
            </p>
          </div>
        )}
      </div>

      {/* Resultado final da inspeção */}
      {isComplete && (
        <div className={`p-4 border-2 rounded-lg ${
          inspecaoItems.every(item => data[item.key] === true) && !hasReprovados
            ? 'bg-green-50 border-green-300'
            : 'bg-red-50 border-red-300'
        }`}>
          <h4 className={`font-bold mb-3 ${
            inspecaoItems.every(item => data[item.key] === true) && !hasReprovados
              ? 'text-green-900'
              : 'text-red-900'
          }`}>
            {inspecaoItems.every(item => data[item.key] === true) && !hasReprovados
              ? '✅ INSPEÇÃO APROVADA - APTO PARA TRABALHO'
              : '🚨 INSPEÇÃO REPROVADA - NÃO APTO PARA TRABALHO'
            }
          </h4>

          <div className={`text-sm space-y-2 ${
            inspecaoItems.every(item => data[item.key] === true) && !hasReprovados
              ? 'text-green-800'
              : 'text-red-800'
          }`}>
            <div className="grid gap-2 md:grid-cols-2">
              <p><strong>Inspeção Geral:</strong> {inspecaoItems.filter(item => data[item.key] === true).length}/{inspecaoItems.length} aprovados</p>
              <p><strong>EPIs Totais:</strong> {stats.geral.aprovados}/{stats.geral.total} aprovados</p>
            </div>

            {(inspecaoItems.some(item => data[item.key] === false) || hasReprovados) && (
              <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded">
                <p className="font-medium">Itens não conformes identificados:</p>
                <ul className="list-disc list-inside ml-2 mt-1">
                  {inspecaoItems
                    .filter(item => data[item.key] === false)
                    .map(item => (
                      <li key={item.key}>{item.label}</li>
                    ))
                  }
                  {hasReprovados && (
                    <li>EPIs reprovados nas seções anteriores</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Orientações finais */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">📋 Orientações Finais</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• A inspeção deve ser realizada antes de cada jornada de trabalho</li>
          <li>• Equipamentos reprovados devem ser substituídos imediatamente</li>
          <li>• Mantenha os certificados de aprovação (CA) sempre atualizados</li>
          <li>• Em caso de dúvida, consulte o responsável pela segurança</li>
          <li>• A segurança é responsabilidade de todos</li>
        </ul>
      </div>
    </div>
  );
}
