import { Label } from '@/components/ui/label';
import type { Tables } from '@/lib/supabase/database.types';
import type { FormData } from '../FormContainer';

type Formulario = Tables<'formularios'>;

interface EpiEletricoProps {
  data: FormData;
  onChange: (updates: Partial<FormData>) => void;
  errors: string[];
  formulario: Formulario;
}

interface EpiEletricoItem {
  key: keyof FormData;
  label: string;
  description: string;
  icon: string;
}

const epiEletricoItems: EpiEletricoItem[] = [
  {
    key: 'epi_luvas_isolantes',
    label: 'Luvas Isolantes',
    description: 'Classe adequada à tensão, teste de isolação válido',
    icon: '🧤'
  },
  {
    key: 'epi_calcado_isolante',
    label: 'Calçado Isolante',
    description: 'Botina ou sapato isolante, certificação CA válida',
    icon: '👢'
  },
  {
    key: 'epi_capacete_classe_b',
    label: 'Capacete Classe B',
    description: 'Capacete dielétrico classe B, testado e certificado',
    icon: '⛑️'
  }
];

export function EpiEletrico({ data, onChange, errors }: EpiEletricoProps) {

  const handleTrabalhoEletricoChange = (value: boolean) => {
    onChange({ trabalho_eletrico: value });

    // Se não vai fazer trabalho elétrico, limpar os campos de EPI elétrico
    if (!value) {
      onChange({
        trabalho_eletrico: value,
        epi_luvas_isolantes: undefined,
        epi_calcado_isolante: undefined,
        epi_capacete_classe_b: undefined,
        observacoes_epi_eletrico: ''
      });
    }
  };

  const handleEpiChange = (key: keyof FormData, value: boolean) => {
    onChange({ [key]: value });
  };

  const handleObservacoesChange = (value: string) => {
    onChange({ observacoes_epi_eletrico: value });
  };

  const getCompletionStatus = () => {
    if (data.trabalho_eletrico === false) {
      return { completed: 1, total: 1 }; // Só precisa responder se fará trabalho elétrico
    }

    if (data.trabalho_eletrico === true) {
      const totalItems = epiEletricoItems.length;
      const completedItems = epiEletricoItems.filter(item =>
        data[item.key] !== undefined
      ).length;

      return { completed: completedItems, total: totalItems };
    }

    return { completed: 0, total: 1 };
  };

  const { completed, total } = getCompletionStatus();

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
          <h4 className="font-medium text-blue-900">⚡ Progresso - Trabalhos Elétricos</h4>
          <span className="text-sm text-blue-700 font-medium">
            {completed}/{total} itens verificados
          </span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Pergunta principal */}
      <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
        <h4 className="font-medium text-yellow-900 mb-3">⚡ Trabalho Elétrico</h4>
        <p className="text-sm text-yellow-800 mb-4">
          Você irá realizar trabalhos que envolvam sistemas elétricos, proximidade de redes energizadas
          ou manuseio de equipamentos elétricos?
        </p>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="trabalho_eletrico"
              value="true"
              checked={data.trabalho_eletrico === true}
              onChange={() => handleTrabalhoEletricoChange(true)}
              className="w-4 h-4 text-orange-600 focus:ring-orange-500"
            />
            <span className="text-sm font-medium text-orange-700">
              ⚡ Sim - Haverá trabalho elétrico
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="trabalho_eletrico"
              value="false"
              checked={data.trabalho_eletrico === false}
              onChange={() => handleTrabalhoEletricoChange(false)}
              className="w-4 h-4 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm font-medium text-green-700">
              ✅ Não - Apenas trabalhos convencionais
            </span>
          </label>
        </div>
      </div>

      {/* Seção condicional - só aparece se trabalho_eletrico = true */}
      {data.trabalho_eletrico === true && (
        <>
          {/* Alerta de Segurança Elétrica */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">⚠️ Trabalho Elétrico - NR 10</h4>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• Trabalhos em instalações elétricas exigem treinamento NR 10</li>
              <li>• Todos os equipamentos devem ter certificação CA válida</li>
              <li>• Teste de isolação obrigatório em luvas e calçados</li>
              <li>• Detector de tensão deve ser testado antes e após o uso</li>
              <li>• Desenergização é sempre a primeira opção de segurança</li>
            </ul>
          </div>

          {/* Lista de EPIs Elétricos */}
          <div className="space-y-4">
            {epiEletricoItems.map((item) => {
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
            <Label htmlFor="observacoes_epi_eletrico" className="text-sm font-medium">
              Observações sobre EPI Elétrico (opcional)
            </Label>
            <textarea
              id="observacoes_epi_eletrico"
              placeholder="Anote observações sobre equipamentos elétricos, testes realizados, validade de certificações, etc..."
              value={data.observacoes_epi_eletrico}
              onChange={(e) => handleObservacoesChange(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical min-h-[100px]"
              maxLength={500}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Detalhe testes de isolação e condições dos equipamentos</span>
              <span>{data.observacoes_epi_eletrico.length}/500</span>
            </div>
          </div>

          {/* Resumo da verificação */}
          {epiEletricoItems.every(item => data[item.key] !== null) && (
            <div className={`p-4 border rounded-lg ${
              epiEletricoItems.every(item => data[item.key] === true)
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <h4 className={`font-medium mb-2 ${
                epiEletricoItems.every(item => data[item.key] === true)
                  ? 'text-green-900'
                  : 'text-red-900'
              }`}>
                {epiEletricoItems.every(item => data[item.key] === true)
                  ? '✅ Todos os EPIs Elétricos Aprovados'
                  : '🚨 ATENÇÃO: EPIs Elétricos Reprovados'
                }
              </h4>

              <div className={`text-sm space-y-1 ${
                epiEletricoItems.every(item => data[item.key] === true)
                  ? 'text-green-800'
                  : 'text-red-800'
              }`}>
                <p><strong>Aprovados:</strong> {epiEletricoItems.filter(item => data[item.key] === true).length}</p>
                <p><strong>Reprovados:</strong> {epiEletricoItems.filter(item => data[item.key] === false).length}</p>

                {epiEletricoItems.filter(item => data[item.key] === false).length > 0 && (
                  <div className="mt-2">
                    <p><strong>Itens reprovados:</strong></p>
                    <ul className="list-disc list-inside ml-2">
                      {epiEletricoItems
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

          {/* Alerta crítico de segurança elétrica */}
          {epiEletricoItems.some(item => data[item.key] === false) && (
            <div className="p-4 bg-red-100 border-2 border-red-300 rounded-lg">
              <h4 className="font-bold text-red-900 mb-2">⚡ ALERTA CRÍTICO - RISCO ELÉTRICO</h4>
              <p className="text-sm text-red-800 font-medium">
                <strong>TRABALHO ELÉTRICO PROIBIDO!</strong> Equipamentos elétricos reprovados foram identificados.
                É <strong>TERMINANTEMENTE PROIBIDO</strong> realizar trabalhos elétricos sem os EPIs adequados.
                O risco de choque elétrico pode ser FATAL.
              </p>
              <p className="text-xs text-red-700 mt-2">
                Substitua imediatamente os equipamentos e realize novos testes antes de qualquer atividade elétrica.
              </p>
            </div>
          )}
        </>
      )}

      {/* Confirmação para trabalhos não elétricos */}
      {data.trabalho_eletrico === false && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">✅ Trabalhos Convencionais</h4>
          <p className="text-sm text-green-800">
            Confirmado que não haverá trabalhos elétricos. Os EPIs básicos e de altura (se aplicável)
            são suficientes para as atividades planejadas.
          </p>
        </div>
      )}
    </div>
  );
}
