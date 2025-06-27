import type { PhotoData } from '@/components/shared/PhotoUpload';
import { QuestionPhotoUpload } from '@/components/shared/PhotoUpload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Tables } from '@/lib/supabase/database.types';
import { formValidation } from '@/lib/utils/validation';
import { useCallback } from 'react';
import type { FormData } from '../FormContainer';

type Formulario = Tables<'formularios'>;

interface IdentificacaoProps {
  data: FormData;
  onChange: (updates: Partial<FormData>) => void;
  errors: string[];
  formulario: Formulario;
}

export function Identificacao({ data, onChange, errors, formulario }: IdentificacaoProps) {

  // Handler para fotos da seção - REMOVIDO onChange das dependências para evitar loop
  const handlePhotosChange = useCallback((_questionKey: string, photos: PhotoData[]) => {
    onChange({ fotos_identificacao: photos });
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

  const handleCPFChange = (field: 'responsavel_cpf', value: string) => {
    const formattedCPF = formatCPF(value);
    onChange({ [field]: formattedCPF });
  };

  const validateField = (field: keyof FormData, value: string): string | null => {
    switch (field) {
      case 'responsavel_nome':
        return formValidation.nomeCompleto(value) ? null : 'Nome deve ter pelo menos 3 caracteres e incluir sobrenome';
      case 'responsavel_cpf':
        return formValidation.cpf(value) ? null : 'CPF deve ter 11 dígitos';
      case 'responsavel_funcao':
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

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">👨‍🔧 Identificação do Técnico/Engenheiro de Segurança</h4>
        <p className="text-sm text-blue-800">
          Preencha seus dados como responsável pela inspeção de EPI/EPC
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Nome Completo do Técnico */}
        <div className="space-y-2">
          <Label htmlFor="responsavel_nome" className="text-sm font-medium">
            Seu Nome Completo *
          </Label>
          <Input
            id="responsavel_nome"
            type="text"
            placeholder="Digite seu nome completo"
            value={data.responsavel_nome}
            onChange={(e) => handleInputChange('responsavel_nome', e.target.value)}
            className={`${
              data.responsavel_nome && !formValidation.nomeCompleto(data.responsavel_nome)
                ? 'border-red-500 focus:border-red-500'
                : ''
            }`}
            maxLength={100}
          />
          {data.responsavel_nome && !formValidation.nomeCompleto(data.responsavel_nome) && (
            <p className="text-xs text-red-600">
              {validateField('responsavel_nome', data.responsavel_nome)}
            </p>
          )}
          <p className="text-xs text-gray-500">
            Ex: João Silva Santos
          </p>
        </div>

        {/* CPF do Técnico */}
        <div className="space-y-2">
          <Label htmlFor="responsavel_cpf" className="text-sm font-medium">
            Seu CPF *
          </Label>
          <Input
            id="responsavel_cpf"
            type="text"
            placeholder="000.000.000-00"
            value={data.responsavel_cpf}
            onChange={(e) => handleCPFChange('responsavel_cpf', e.target.value)}
            className={`${
              data.responsavel_cpf && !formValidation.cpf(data.responsavel_cpf)
                ? 'border-red-500 focus:border-red-500'
                : ''
            }`}
            maxLength={14}
          />
          {data.responsavel_cpf && !formValidation.cpf(data.responsavel_cpf) && (
            <p className="text-xs text-red-600">
              {validateField('responsavel_cpf', data.responsavel_cpf)}
            </p>
          )}
          <p className="text-xs text-gray-500">
            Informe apenas os números do seu CPF
          </p>
        </div>

        {/* Função do Técnico */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="responsavel_funcao" className="text-sm font-medium">
            Sua Função/Cargo *
          </Label>
          <Input
            id="responsavel_funcao"
            type="text"
            placeholder="Ex: Técnico de Segurança do Trabalho, Engenheiro de Segurança"
            value={data.responsavel_funcao}
            onChange={(e) => handleInputChange('responsavel_funcao', e.target.value)}
            className={`${
              data.responsavel_funcao && !formValidation.funcao(data.responsavel_funcao)
                ? 'border-red-500 focus:border-red-500'
                : ''
            }`}
            maxLength={50}
          />
          {data.responsavel_funcao && !formValidation.funcao(data.responsavel_funcao) && (
            <p className="text-xs text-red-600">
              {validateField('responsavel_funcao', data.responsavel_funcao)}
            </p>
          )}
          <p className="text-xs text-gray-500">
            Informe sua função ou cargo atual
          </p>
        </div>
      </div>

      {/* Upload de fotos da seção */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Fotos do Técnico/Engenheiro (opcional)
        </Label>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600 mb-3">
            Você pode adicionar fotos relacionadas à identificação do técnico responsável pela inspeção.
          </p>
          <QuestionPhotoUpload
            questionKey="identificacao_geral"
            secao="identificacao"
            formularioId={formulario.id}
            maxPhotos={2}
            photos={data.fotos_identificacao || []}
            onPhotosChange={handlePhotosChange}
          />
        </div>
      </div>

      {/* Informações Adicionais */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">📋 Informações Importantes</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Todos os campos marcados com (*) são obrigatórios</li>
          <li>• Seus dados serão usados para identificar o responsável pela inspeção</li>
          <li>• Certifique-se de que as informações estão corretas antes de prosseguir</li>
          <li>• O CPF será usado para validação e não será compartilhado</li>
        </ul>
      </div>
    </div>
  );
}
