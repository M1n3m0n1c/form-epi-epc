import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Tables } from '@/lib/supabase/database.types';
import { formValidation } from '@/lib/utils/validation';
import type { FormData } from '../FormContainer';

type Formulario = Tables<'formularios'>;

interface IdentificacaoProps {
  data: FormData;
  onChange: (updates: Partial<FormData>) => void;
  errors: string[];
  formulario: Formulario;
}

// const empresas = [
//   'Icomon',
//   'Telequipe',
//   'Tel Telecomunicações',
//   'Eólen',
//   'Stein'
// ];

const regionais = [
  'Regional MG',
  'Regional CO/NO',
  'Regional RJ/ES'
];

export function Identificacao({ data, onChange, errors }: IdentificacaoProps) {

  const handleInputChange = (field: keyof FormData, value: string) => {
    // Passar valor diretamente sem sanitização em tempo real
    // A sanitização será feita apenas no envio do formulário
    onChange({ [field]: value });
  };

  const formatCPF = (value: string) => {
    // Remove tudo que não é dígito
    const digits = value.replace(/\D/g, '');

    // Aplica a máscara XXX.XXX.XXX-XX
    if (digits.length <= 11) {
      return digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }

    return digits.slice(0, 11)
      .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handleCPFChange = (value: string) => {
    const formattedCPF = formatCPF(value);
    onChange({ cpf: formattedCPF });
  };

  const validateField = (field: keyof FormData, value: string): string | null => {
    switch (field) {
      case 'nome_completo':
        return formValidation.nomeCompleto(value) ? null : 'Nome deve ter pelo menos 3 caracteres e incluir sobrenome';
      case 'cpf':
        return formValidation.cpf(value) ? null : 'CPF deve ter 11 dígitos';
      case 'funcao':
        return formValidation.funcao(value) ? null : 'Função deve ter pelo menos 2 caracteres';
      default:
        return null;
    }
  };

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

      <div className="grid gap-6 md:grid-cols-2">
        {/* Nome Completo */}
        <div className="space-y-2">
          <Label htmlFor="nome_completo" className="text-sm font-medium">
            Nome Completo *
          </Label>
          <Input
            id="nome_completo"
            type="text"
            placeholder="Digite seu nome completo"
            value={data.nome_completo}
            onChange={(e) => handleInputChange('nome_completo', e.target.value)}
            className={`${
              data.nome_completo && !formValidation.nomeCompleto(data.nome_completo)
                ? 'border-red-500 focus:border-red-500'
                : ''
            }`}
            maxLength={100}
          />
          {data.nome_completo && !formValidation.nomeCompleto(data.nome_completo) && (
            <p className="text-xs text-red-600">
              {validateField('nome_completo', data.nome_completo)}
            </p>
          )}
          <p className="text-xs text-gray-500">
            Ex: João Silva Santos
          </p>
        </div>

        {/* CPF */}
        <div className="space-y-2">
          <Label htmlFor="cpf" className="text-sm font-medium">
            CPF *
          </Label>
          <Input
            id="cpf"
            type="text"
            placeholder="000.000.000-00"
            value={data.cpf}
            onChange={(e) => handleCPFChange(e.target.value)}
            className={`${
              data.cpf && !formValidation.cpf(data.cpf)
                ? 'border-red-500 focus:border-red-500'
                : ''
            }`}
            maxLength={14}
          />
          {data.cpf && !formValidation.cpf(data.cpf) && (
            <p className="text-xs text-red-600">
              {validateField('cpf', data.cpf)}
            </p>
          )}
          <p className="text-xs text-gray-500">
            Informe apenas os números do seu CPF
          </p>
        </div>

        {/* Função */}
        <div className="space-y-2">
          <Label htmlFor="funcao" className="text-sm font-medium">
            Função/Cargo *
          </Label>
          <Input
            id="funcao"
            type="text"
            placeholder="Ex: Técnico de Telecomunicações"
            value={data.funcao}
            onChange={(e) => handleInputChange('funcao', e.target.value)}
            className={`${
              data.funcao && !formValidation.funcao(data.funcao)
                ? 'border-red-500 focus:border-red-500'
                : ''
            }`}
            maxLength={50}
          />
          {data.funcao && !formValidation.funcao(data.funcao) && (
            <p className="text-xs text-red-600">
              {validateField('funcao', data.funcao)}
            </p>
          )}
          <p className="text-xs text-gray-500">
            Informe sua função ou cargo atual
          </p>
        </div>

        {/* Regional */}
        <div className="space-y-2">
          <Label htmlFor="regional" className="text-sm font-medium">
            Regional *
          </Label>
          <select
            id="regional"
            value={data.regional}
            onChange={(e) => onChange({ regional: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Selecione uma regional</option>
            {regionais.map((regional) => (
              <option key={regional} value={regional}>
                {regional}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            Selecione a regional onde você trabalha
          </p>
        </div>
      </div>

      {/* Informações Adicionais */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">📋 Informações Importantes</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Todos os campos marcados com (*) são obrigatórios</li>
          <li>• Seus dados serão usados apenas para identificação no formulário</li>
          <li>• Certifique-se de que as informações estão corretas antes de prosseguir</li>
          <li>• O CPF será usado para validação e não será compartilhado</li>
        </ul>
      </div>

      {/* Preview dos dados */}
      {data.nome_completo && data.cpf && data.funcao && data.regional && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">✅ Resumo dos Dados</h4>
          <div className="text-sm text-green-800 space-y-1">
            <p><strong>Nome:</strong> {data.nome_completo}</p>
            <p><strong>CPF:</strong> {data.cpf}</p>
            <p><strong>Função:</strong> {data.funcao}</p>
            <p><strong>Regional:</strong> {data.regional}</p>
          </div>
        </div>
      )}
    </div>
  );
}
