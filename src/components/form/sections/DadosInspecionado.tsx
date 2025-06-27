import type { PhotoData } from '@/components/shared/PhotoUpload';
import { QuestionPhotoUpload } from '@/components/shared/PhotoUpload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Tables } from '@/lib/supabase/database.types';
import { formValidation } from '@/lib/utils/validation';
import { useCallback } from 'react';
import type { FormData } from '../FormContainer';

type Formulario = Tables<'formularios'>;

interface DadosInspecionadoProps {
  data: FormData;
  onChange: (updates: Partial<FormData>) => void;
  errors: string[];
  formulario: Formulario;
}

export function DadosInspecionado({ data, onChange, errors, formulario }: DadosInspecionadoProps) {

  // Handler para fotos da seção - REMOVIDO onChange das dependências para evitar loop
  const handlePhotosChange = useCallback((_questionKey: string, photos: PhotoData[]) => {
    onChange({ fotos_dados_inspecionado: photos });
  }, []); // Removido onChange das dependências

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
    onChange({ inspecionado_cpf: formattedCPF });
  };

  const validateField = (field: keyof FormData, value: string): string | null => {
    switch (field) {
      case 'inspecionado_nome':
        return formValidation.nomeCompleto(value) ? null : 'Nome deve ter pelo menos 3 caracteres e incluir sobrenome';
      case 'inspecionado_cpf':
        return formValidation.cpf(value) ? null : 'CPF deve ter 11 dígitos';
      case 'inspecionado_funcao':
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

      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <h4 className="font-medium text-orange-900 mb-2">🔍 Dados da Pessoa Inspecionada</h4>
        <p className="text-sm text-orange-800">
          Preencha os dados da pessoa que está sendo inspecionada quanto ao uso de EPI/EPC
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Nome Completo da Pessoa Inspecionada */}
        <div className="space-y-2">
          <Label htmlFor="inspecionado_nome" className="text-sm font-medium">
            Nome Completo da Pessoa Inspecionada *
          </Label>
          <Input
            id="inspecionado_nome"
            type="text"
            placeholder="Digite o nome completo"
            value={data.inspecionado_nome}
            onChange={(e) => handleInputChange('inspecionado_nome', e.target.value)}
            className={`${
              data.inspecionado_nome && !formValidation.nomeCompleto(data.inspecionado_nome)
                ? 'border-red-500 focus:border-red-500'
                : ''
            }`}
            maxLength={100}
          />
          {data.inspecionado_nome && !formValidation.nomeCompleto(data.inspecionado_nome) && (
            <p className="text-xs text-red-600">
              {validateField('inspecionado_nome', data.inspecionado_nome)}
            </p>
          )}
          <p className="text-xs text-gray-500">
            Ex: Maria Silva Santos
          </p>
        </div>

        {/* CPF da Pessoa Inspecionada */}
        <div className="space-y-2">
          <Label htmlFor="inspecionado_cpf" className="text-sm font-medium">
            CPF da Pessoa Inspecionada *
          </Label>
          <Input
            id="inspecionado_cpf"
            type="text"
            placeholder="000.000.000-00"
            value={data.inspecionado_cpf}
            onChange={(e) => handleCPFChange(e.target.value)}
            className={`${
              data.inspecionado_cpf && !formValidation.cpf(data.inspecionado_cpf)
                ? 'border-red-500 focus:border-red-500'
                : ''
            }`}
            maxLength={14}
          />
          {data.inspecionado_cpf && !formValidation.cpf(data.inspecionado_cpf) && (
            <p className="text-xs text-red-600">
              {validateField('inspecionado_cpf', data.inspecionado_cpf)}
            </p>
          )}
          <p className="text-xs text-gray-500">
            Informe apenas os números do CPF
          </p>
        </div>

        {/* Função da Pessoa Inspecionada */}
        <div className="space-y-2">
          <Label htmlFor="inspecionado_funcao" className="text-sm font-medium">
            Função/Cargo da Pessoa Inspecionada *
          </Label>
          <Input
            id="inspecionado_funcao"
            type="text"
            placeholder="Ex: Técnico de Telecomunicações"
            value={data.inspecionado_funcao}
            onChange={(e) => handleInputChange('inspecionado_funcao', e.target.value)}
            className={`${
              data.inspecionado_funcao && !formValidation.funcao(data.inspecionado_funcao)
                ? 'border-red-500 focus:border-red-500'
                : ''
            }`}
            maxLength={50}
          />
          {data.inspecionado_funcao && !formValidation.funcao(data.inspecionado_funcao) && (
            <p className="text-xs text-red-600">
              {validateField('inspecionado_funcao', data.inspecionado_funcao)}
            </p>
          )}
          <p className="text-xs text-gray-500">
            Informe a função ou cargo da pessoa
          </p>
        </div>

      </div>

      {/* Upload de fotos da seção */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Fotos da Pessoa Inspecionada (opcional)
        </Label>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600 mb-3">
            Você pode adicionar fotos relacionadas à identificação da pessoa que está sendo inspecionada.
          </p>
          <QuestionPhotoUpload
            questionKey="dados_inspecionado_geral"
            secao="dados_inspecionado"
            formularioId={formulario.id}
            maxPhotos={2}
            photos={data.fotos_dados_inspecionado || []}
            onPhotosChange={handlePhotosChange}
          />
        </div>
      </div>

      {/* Informações Adicionais */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">📋 Informações Importantes</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Campos marcados com (*) são obrigatórios</li>
          <li>• Os dados serão usados para identificar a pessoa inspecionada</li>
          <li>• A regional é opcional, mas pode ajudar na organização dos dados</li>
          <li>• Certifique-se de que as informações estão corretas</li>
        </ul>
      </div>

      {/* Preview dos dados */}
      {data.inspecionado_nome && data.inspecionado_cpf && data.inspecionado_funcao && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">✅ Resumo dos Dados da Pessoa Inspecionada</h4>
          <div className="text-sm text-green-800 space-y-1">
            <p><strong>Nome:</strong> {data.inspecionado_nome}</p>
            <p><strong>CPF:</strong> {data.inspecionado_cpf}</p>
            <p><strong>Função:</strong> {data.inspecionado_funcao}</p>
            {data.regional && <p><strong>Regional:</strong> {data.regional}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
