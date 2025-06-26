import { Label } from '@/components/ui/label';
import type { Tables } from '@/lib/supabase/database.types';
import type { FormData } from '../FormContainer';

type Formulario = Tables<'formularios'>;

interface EpiBasicoProps {
  data: FormData;
  onChange: (updates: Partial<FormData>) => void;
  errors: string[];
  formulario: Formulario;
}

interface EpiItem {
  key: keyof FormData;
  label: string;
  description: string;
  icon: string;
  allowNA?: boolean; // Permite "Não Aplicável"
}

const epiBasicoItems: EpiItem[] = [
  {
    key: 'epi_capacete',
    label: 'Capacete de Proteção',
    description: 'Verificar integridade, ajuste e certificação CA',
    icon: '⛑️',
    allowNA: true
  },
  {
    key: 'epi_oculos',
    label: 'Óculos de Proteção',
    description: 'Lentes sem riscos, armação íntegra e certificação CA',
    icon: '🥽',
    allowNA: true
  },
  {
    key: 'epi_protetor_auricular',
    label: 'Protetor Auricular',
    description: 'Tipo plug ou concha, em bom estado e certificação CA',
    icon: '🎧',
    allowNA: true
  },
  {
    key: 'epi_vestimenta',
    label: 'Máscara/Vestimenta de Proteção',
    description: 'Contra poeiras/vapores, filtros válidos e certificação CA',
    icon: '😷',
    allowNA: true
  },
  {
    key: 'epi_luvas',
    label: 'Luvas de Proteção',
    description: 'Adequadas ao trabalho, sem furos e certificação CA',
    icon: '🧤',
    allowNA: true
  },
  {
    key: 'epi_calcado',
    label: 'Calçado de Proteção',
    description: 'Biqueira de aço, solado antiderrapante e certificação CA',
    icon: '👢',
    allowNA: true
  },
  {
    key: 'ferramental',
    label: 'Ferramental',
    description: 'Em boas condições e em acordo com as NRs aplicáveis',
    icon: '🔧',
    allowNA: true
  },
  {
    key: 'corda_icamento',
    label: 'Corda de Içamento',
    description: 'Corda suporta carga de trabalho e possui certificado',
    icon: '🪢',
    allowNA: true
  }
];

export function EpiBasico({ data, onChange, errors }: EpiBasicoProps) {

  const handleEpiChange = (key: keyof FormData, value: boolean | 'na') => {
    // Convertemos 'na' para null para representar "Não Aplicável"
    const finalValue = value === 'na' ? null : value;
    onChange({ [key]: finalValue });
  };

  const handleObservacoesChange = (value: string) => {
    onChange({ observacoes_epi_basico: value });
  };

  const getCompletionStatus = () => {
    const totalItems = epiBasicoItems.length;
    // Um item está completo quando foi "tocado" pelo usuário
    // Consideramos que o estado inicial (undefined) significa não respondido
    // E null significa "Não Aplicável" (resposta válida)
    const completedItems = epiBasicoItems.filter(item => {
      const value = data[item.key];
      return value === true || value === false || value === null;
    }).length;

    return { completed: completedItems, total: totalItems };
  };

  const { completed, total } = getCompletionStatus();
  const isComplete = completed === total;

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

      {/* Instruções */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-medium text-yellow-900 mb-2">📝 Instruções de Verificação</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Verifique cada item de EPI individualmente</li>
          <li>• Marque "Sim" apenas se o equipamento estiver em perfeitas condições</li>
          <li>• Verifique sempre o Certificado de Aprovação (CA) válido</li>
          <li>• Use "Não Aplicável" apenas quando o EPI/equipamento não for necessário para a atividade</li>
          <li>• Em caso de dúvida, marque "Não" e anote nas observações</li>
          <li>• Todos os itens devem ser respondidos antes de prosseguir</li>
        </ul>
      </div>

      {/* Lista de EPIs */}
      <div className="space-y-4">
        {epiBasicoItems.map((item) => {
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

                  <div className="flex flex-wrap gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={item.key}
                        value="true"
                        checked={currentValue === true}
                        onChange={() => handleEpiChange(item.key, true)}
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-green-700">
                        ✅ Sim - Aprovado
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={item.key}
                        value="false"
                        checked={currentValue === false}
                        onChange={() => handleEpiChange(item.key, false)}
                        className="w-4 h-4 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm font-medium text-red-700">
                        ❌ Não - Reprovado
                      </span>
                    </label>

                    {item.allowNA && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={item.key}
                          value="na"
                          checked={currentValue === null}
                          onChange={() => handleEpiChange(item.key, 'na')}
                          className="w-4 h-4 text-gray-600 focus:ring-gray-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          ➖ Não Aplicável
                        </span>
                      </label>
                    )}
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
                  {currentValue === null && (
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-sm">N/A</span>
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
        <Label htmlFor="observacoes_epi_basico" className="text-sm font-medium">
          Observações sobre EPI Básico e Equipamentos (opcional)
        </Label>
        <textarea
          id="observacoes_epi_basico"
          placeholder="Anote aqui qualquer observação sobre os equipamentos verificados, problemas encontrados ou recomendações..."
          value={data.observacoes_epi_basico}
          onChange={(e) => handleObservacoesChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical min-h-[100px]"
          maxLength={500}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Use este campo para detalhar problemas ou fazer recomendações</span>
          <span>{data.observacoes_epi_basico.length}/500</span>
        </div>
      </div>

      {/* Resumo da verificação */}
      {isComplete && (
        <div className={`p-4 border rounded-lg ${
          epiBasicoItems.every(item => data[item.key] === true || data[item.key] === null)
            ? 'bg-green-50 border-green-200'
            : 'bg-orange-50 border-orange-200'
        }`}>
          <h4 className={`font-medium mb-2 ${
            epiBasicoItems.every(item => data[item.key] === true || data[item.key] === null)
              ? 'text-green-900'
              : 'text-orange-900'
          }`}>
            {epiBasicoItems.every(item => data[item.key] === true || data[item.key] === null)
              ? '✅ Verificação Completa'
              : '⚠️ Atenção: Itens Reprovados'
            }
          </h4>

          <div className={`text-sm space-y-1 ${
            epiBasicoItems.every(item => data[item.key] === true || data[item.key] === null)
              ? 'text-green-800'
              : 'text-orange-800'
          }`}>
            <p><strong>Aprovados:</strong> {epiBasicoItems.filter(item => data[item.key] === true).length}</p>
            <p><strong>Reprovados:</strong> {epiBasicoItems.filter(item => data[item.key] === false).length}</p>
            <p><strong>Não Aplicáveis:</strong> {epiBasicoItems.filter(item => data[item.key] === null).length}</p>

            {epiBasicoItems.filter(item => data[item.key] === false).length > 0 && (
              <div className="mt-2">
                <p><strong>Itens reprovados:</strong></p>
                <ul className="list-disc list-inside ml-2">
                  {epiBasicoItems
                    .filter(item => data[item.key] === false)
                    .map(item => (
                      <li key={item.key}>{item.label}</li>
                    ))
                  }
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alertas de segurança */}
      {epiBasicoItems.some(item => data[item.key] === false) && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-medium text-red-900 mb-2">🚨 Alerta de Segurança</h4>
          <p className="text-sm text-red-800">
            Equipamentos reprovados foram identificados. É <strong>obrigatório</strong> substituir
            ou reparar os EPIs/equipamentos antes de iniciar qualquer atividade de campo.
            A segurança do trabalhador é prioridade absoluta.
          </p>
        </div>
      )}
    </div>
  );
}
