import { Label } from '@/components/ui/label';
import type { Tables } from '@/lib/supabase/database.types';
import type { FormData } from '../FormContainer';

type Formulario = Tables<'formularios'>;

interface EpiAlturaProps {
  data: FormData;
  onChange: (updates: Partial<FormData>) => void;
  errors: string[];
  formulario: Formulario;
}

interface EpiAlturaItem {
  key: keyof FormData;
  label: string;
  description: string;
  icon: string;
}

const epiAlturaItems: EpiAlturaItem[] = [
  {
    key: 'epi_cinto_seguranca',
    label: 'Cinto de Segurança',
    description: 'Tipo paraquedista, com argolas em D, certificação CA válida',
    icon: '🪢'
  },
  {
    key: 'epi_talabarte',
    label: 'Talabarte',
    description: 'Duplo com absorvedor de energia, mosquetões funcionais',
    icon: '🔗'
  },
  {
    key: 'epi_capacete_jugular',
    label: 'Capacete com Jugular',
    description: 'Capacete com sistema de retenção jugular ajustável',
    icon: '⛑️'
  }
];

export function EpiAltura({ data, onChange, errors }: EpiAlturaProps) {

  const handleEpiChange = (key: keyof FormData, value: boolean) => {
    onChange({ [key]: value });
  };

  const handleObservacoesChange = (value: string) => {
    onChange({ observacoes_epi_altura: value });
  };

  const getCompletionStatus = () => {
    const totalItems = epiAlturaItems.length;
    const completedItems = epiAlturaItems.filter(item =>
      data[item.key] !== null
    ).length;

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



      {/* Alerta de Segurança */}
      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <h4 className="font-medium text-orange-900 mb-2">⚠️ Trabalho em Altura - NR 35</h4>
        <ul className="text-sm text-orange-800 space-y-1">
          <li>• Trabalho em altura é toda atividade executada acima de 2,00m do nível inferior</li>
          <li>• Todos os equipamentos devem ter certificação CA válida</li>
          <li>• Inspeção visual obrigatória antes do uso</li>
          <li>• Equipamentos com defeito devem ser imediatamente retirados de uso</li>
          <li>• Treinamento específico NR 35 é obrigatório</li>
        </ul>
      </div>

      {/* Lista de EPIs para Altura */}
      <div className="space-y-4">
        {epiAlturaItems.map((item) => {
          const currentValue = data[item.key] as boolean | null;

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
        <Label htmlFor="observacoes_epi_altura" className="text-sm font-medium">
          Observações sobre EPI para Altura (opcional)
        </Label>
        <textarea
          id="observacoes_epi_altura"
          placeholder="Anote observações sobre equipamentos de altura, condições dos mosquetões, desgaste dos cabos, etc..."
          value={data.observacoes_epi_altura}
          onChange={(e) => handleObservacoesChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical min-h-[100px]"
          maxLength={500}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Detalhe condições dos equipamentos e recomendações</span>
          <span>{data.observacoes_epi_altura.length}/500</span>
        </div>
      </div>

      {/* Resumo da verificação */}
      {isComplete && (
        <div className={`p-4 border rounded-lg ${
          epiAlturaItems.every(item => data[item.key] === true)
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <h4 className={`font-medium mb-2 ${
            epiAlturaItems.every(item => data[item.key] === true)
              ? 'text-green-900'
              : 'text-red-900'
          }`}>
            {epiAlturaItems.every(item => data[item.key] === true)
              ? '✅ Todos os EPIs de Altura Aprovados'
              : '🚨 ATENÇÃO: EPIs de Altura Reprovados'
            }
          </h4>

          <div className={`text-sm space-y-1 ${
            epiAlturaItems.every(item => data[item.key] === true)
              ? 'text-green-800'
              : 'text-red-800'
          }`}>
            <p><strong>Aprovados:</strong> {epiAlturaItems.filter(item => data[item.key] === true).length}</p>
            <p><strong>Reprovados:</strong> {epiAlturaItems.filter(item => data[item.key] === false).length}</p>

            {epiAlturaItems.filter(item => data[item.key] === false).length > 0 && (
              <div className="mt-2">
                <p><strong>Itens reprovados:</strong></p>
                <ul className="list-disc list-inside ml-2">
                  {epiAlturaItems
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

      {/* Alerta crítico de segurança */}
      {epiAlturaItems.some(item => data[item.key] === false) && (
        <div className="p-4 bg-red-100 border-2 border-red-300 rounded-lg">
          <h4 className="font-bold text-red-900 mb-2">🚨 ALERTA CRÍTICO DE SEGURANÇA</h4>
          <p className="text-sm text-red-800 font-medium">
            <strong>TRABALHO EM ALTURA PROIBIDO!</strong> Equipamentos reprovados foram identificados.
            É <strong>TERMINANTEMENTE PROIBIDO</strong> realizar trabalhos em altura com equipamentos
            defeituosos. Substitua imediatamente os equipamentos antes de qualquer atividade.
          </p>
          <p className="text-xs text-red-700 mt-2">
            Lembre-se: Acidentes em altura podem ser fatais. A segurança não é negociável.
          </p>
        </div>
      )}
    </div>
  );
}
