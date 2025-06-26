import { Label } from '@/components/ui/label';
import type { Tables } from '@/lib/supabase/database.types';
import type { FormData } from '../FormContainer';

type Formulario = Tables<'formularios'>;

interface ConclusaoProps {
  data: FormData;
  onChange: (updates: Partial<FormData>) => void;
  errors: string[];
  formulario: Formulario;
}

export function Conclusao({ data, onChange, errors, formulario }: ConclusaoProps) {

  const handleObservacoesChange = (value: string) => {
    onChange({ observacoes_gerais: value });
  };

  // Calcular estatísticas finais
  const getFormSummary = () => {
    const epiBasicoItems = ['epi_capacete', 'epi_oculos', 'epi_protetor_auricular', 'epi_vestimenta', 'epi_luvas', 'epi_calcado'];
    const epiAlturaItems = ['epi_cinto_seguranca', 'epi_talabarte', 'epi_capacete_jugular'];
    const epiEletricoItems = ['epi_luvas_isolantes', 'epi_calcado_isolante', 'epi_capacete_classe_b'];
    const inspecaoItems = ['equipamentos_integros', 'treinamento_adequado', 'certificados_validos'];

    const epiBasicoAprovados = epiBasicoItems.filter(item => data[item as keyof FormData] === true).length;
    const epiAlturaAprovados = epiAlturaItems.filter(item => data[item as keyof FormData] === true).length;
    const inspecaoAprovados = inspecaoItems.filter(item => data[item as keyof FormData] === true).length;

    let epiEletricoAprovados = 0;
    let epiEletricoTotal = 0;

    if (data.trabalho_eletrico === true) {
      epiEletricoAprovados = epiEletricoItems.filter(item => data[item as keyof FormData] === true).length;
      epiEletricoTotal = epiEletricoItems.length;
    }

    const totalAprovados = epiBasicoAprovados + epiAlturaAprovados + epiEletricoAprovados + inspecaoAprovados;
    const totalItens = epiBasicoItems.length + epiAlturaItems.length + epiEletricoTotal + inspecaoItems.length;

    const isApproved = totalAprovados === totalItens;

    return {
      epiBasico: { aprovados: epiBasicoAprovados, total: epiBasicoItems.length },
      epiAltura: { aprovados: epiAlturaAprovados, total: epiAlturaItems.length },
      epiEletrico: { aprovados: epiEletricoAprovados, total: epiEletricoTotal },
      inspecao: { aprovados: inspecaoAprovados, total: inspecaoItems.length },
      geral: { aprovados: totalAprovados, total: totalItens },
      isApproved,
      trabalhoEletrico: data.trabalho_eletrico
    };
  };

  const summary = getFormSummary();

  // Coletar todas as observações do técnico
  const getAllObservations = () => {
    const observacoes = [];

    if (data.observacoes_epi_basico?.trim()) {
      observacoes.push({
        secao: '🦺 EPI Básico',
        texto: data.observacoes_epi_basico
      });
    }

    if (data.observacoes_epi_altura?.trim()) {
      observacoes.push({
        secao: '🪜 EPI para Trabalho em Altura',
        texto: data.observacoes_epi_altura
      });
    }

    if (data.observacoes_epi_eletrico?.trim()) {
      observacoes.push({
        secao: '⚡ EPI para Trabalhos Elétricos',
        texto: data.observacoes_epi_eletrico
      });
    }

    if (data.observacoes_inspecao?.trim()) {
      observacoes.push({
        secao: '🔍 Inspeção Geral',
        texto: data.observacoes_inspecao
      });
    }

    return observacoes;
  };

  const observacoesTecnico = getAllObservations();

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

      {/* Resumo Final */}
      <div className={`p-6 border-2 rounded-lg ${
        summary.isApproved
          ? 'bg-green-50 border-green-300'
          : 'bg-red-50 border-red-300'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`text-4xl ${
            summary.isApproved ? 'text-green-600' : 'text-red-600'
          }`}>
            {summary.isApproved ? '✅' : '🚨'}
          </div>
          <div>
            <h3 className={`text-xl font-bold ${
              summary.isApproved ? 'text-green-900' : 'text-red-900'
            }`}>
              {summary.isApproved
                ? 'FORMULÁRIO APROVADO - APTO PARA TRABALHO'
                : 'FORMULÁRIO REPROVADO - NÃO APTO PARA TRABALHO'
              }
            </h3>
            <p className={`text-sm ${
              summary.isApproved ? 'text-green-700' : 'text-red-700'
            }`}>
              {summary.isApproved
                ? 'Todos os equipamentos foram aprovados na inspeção'
                : 'Equipamentos reprovados foram identificados'
              }
            </p>
          </div>
        </div>

        {/* Estatísticas detalhadas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-3 bg-white border rounded">
            <h5 className="font-medium text-gray-900 mb-1">🦺 EPI Básico</h5>
            <p className={`text-lg font-bold ${
              summary.epiBasico.aprovados === summary.epiBasico.total ? 'text-green-600' : 'text-red-600'
            }`}>
              {summary.epiBasico.aprovados}/{summary.epiBasico.total}
            </p>
          </div>

          <div className="p-3 bg-white border rounded">
            <h5 className="font-medium text-gray-900 mb-1">🪜 EPI Altura</h5>
            <p className={`text-lg font-bold ${
              summary.epiAltura.aprovados === summary.epiAltura.total ? 'text-green-600' : 'text-red-600'
            }`}>
              {summary.epiAltura.aprovados}/{summary.epiAltura.total}
            </p>
          </div>

          <div className="p-3 bg-white border rounded">
            <h5 className="font-medium text-gray-900 mb-1">⚡ EPI Elétrico</h5>
            <p className={`text-lg font-bold ${
              summary.trabalhoEletrico === false
                ? 'text-gray-600'
                : summary.epiEletrico.aprovados === summary.epiEletrico.total
                  ? 'text-green-600'
                  : 'text-red-600'
            }`}>
              {summary.trabalhoEletrico === false
                ? 'N/A'
                : `${summary.epiEletrico.aprovados}/${summary.epiEletrico.total}`
              }
            </p>
          </div>

          <div className="p-3 bg-white border rounded">
            <h5 className="font-medium text-gray-900 mb-1">🔍 Inspeção</h5>
            <p className={`text-lg font-bold ${
              summary.inspecao.aprovados === summary.inspecao.total ? 'text-green-600' : 'text-red-600'
            }`}>
              {summary.inspecao.aprovados}/{summary.inspecao.total}
            </p>
          </div>
        </div>
      </div>

      {/* Dados do colaborador */}
      <div className="p-4 bg-gray-50 border rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">👤 Dados do Colaborador</h4>
        <div className="grid gap-2 md:grid-cols-2 text-sm">
          <p><strong>Nome:</strong> {data.nome_completo || 'Não informado'}</p>
          <p><strong>CPF:</strong> {data.cpf || 'Não informado'}</p>
          <p><strong>Função:</strong> {data.funcao || 'Não informada'}</p>
          <p><strong>Regional:</strong> {data.regional || 'Não informada'}</p>
        </div>
      </div>

      {/* Dados do Formulário */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-3">📋 Dados do Formulário</h4>
        <div className="grid gap-2 md:grid-cols-2 text-sm">
          <p><strong>Responsável pela Criação:</strong> {formulario.criado_por || 'Não informado'}</p>
          <p><strong>Regional Responsável:</strong> {formulario.regional || 'Não informada'}</p>
          <p><strong>Data de Criação:</strong> {formulario.created_at ? new Date(formulario.created_at).toLocaleDateString('pt-BR') : 'Não informada'}</p>
          <p><strong>Data de Expiração:</strong> {formulario.data_expiracao ? new Date(formulario.data_expiracao).toLocaleDateString('pt-BR') : 'Não definida'}</p>
        </div>
      </div>

      {/* Observações do Técnico */}
      {observacoesTecnico.length > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-900 mb-3">📝 Observações do Técnico</h4>
          <div className="space-y-3">
            {observacoesTecnico.map((obs, index) => (
              <div key={index} className="p-3 bg-white border rounded">
                <h5 className="font-medium text-gray-900 mb-1">{obs.secao}</h5>
                <p className="text-sm text-gray-700">{obs.texto}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Observações Gerais */}
      <div className="space-y-2">
        <Label htmlFor="observacoes_gerais" className="text-sm font-medium">
          Observações Gerais (opcional)
        </Label>
        <textarea
          id="observacoes_gerais"
          placeholder="Anote observações gerais sobre a inspeção, recomendações especiais, pontos de atenção ou qualquer informação relevante..."
          value={data.observacoes_gerais}
          onChange={(e) => handleObservacoesChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical min-h-[120px]"
          maxLength={1000}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Campo para observações gerais e recomendações especiais</span>
          <span>{data.observacoes_gerais.length}/1000</span>
        </div>
      </div>

      {/* Declaração de responsabilidade */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-medium text-yellow-900 mb-2">📋 Declaração de Responsabilidade</h4>
        <div className="text-sm text-yellow-800 space-y-2">
          <p>
            <strong>Declaro que:</strong>
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Realizei a inspeção de todos os equipamentos de proteção individual</li>
            <li>As informações fornecidas são verdadeiras e precisas</li>
            <li>Estou ciente dos riscos envolvidos nas atividades a serem executadas</li>
            <li>Comprometo-me a utilizar adequadamente todos os EPIs aprovados</li>
            <li>Comunicarei imediatamente qualquer defeito ou problema nos equipamentos</li>
          </ul>
        </div>
      </div>

      {/* Informações sobre próximos passos */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">📋 Próximos Passos</h4>
        <div className="text-sm text-blue-800 space-y-1">
          {summary.isApproved ? (
            <>
              <p>✅ <strong>Formulário aprovado!</strong> Você está apto para iniciar as atividades.</p>
              <p>• Um relatório será gerado automaticamente após o envio</p>
              <p>• Mantenha os EPIs em bom estado durante todo o trabalho</p>
              <p>• Realize inspeções visuais antes de cada uso</p>
            </>
          ) : (
            <>
              <p>🚨 <strong>Formulário reprovado!</strong> Não inicie as atividades.</p>
              <p>• Substitua ou repare todos os equipamentos reprovados</p>
              <p>• Realize nova inspeção após as correções</p>
              <p>• Entre em contato com o responsável regional para orientações</p>
            </>
          )}
        </div>
      </div>

      {/* Botão de confirmação final */}
      <div className="p-4 bg-gray-50 border rounded-lg text-center">
        <p className="text-sm text-gray-600 mb-2">
          Clique em "Enviar Formulário" para finalizar a inspeção
        </p>
        <p className="text-xs text-gray-500">
          Após o envio, não será possível alterar as informações
        </p>
      </div>
    </div>
  );
}
