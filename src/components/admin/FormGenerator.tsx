import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase/client';
import { generateFormToken } from '@/lib/utils/tokenGenerator';
import { useState } from 'react';

interface FormGeneratorProps {
  onFormGenerated?: (formId: string, token: string) => void;
}

export function FormGenerator({ onFormGenerated }: FormGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Campos do formulário
  const [empresa, setEmpresa] = useState('');
  const [regional, setRegional] = useState('');
  const [dataExpiracao, setDataExpiracao] = useState('');
  const [criadoPor, setCriadoPor] = useState('');

  const empresas = [
    'Icomon',
    'Telequipe',
    'Tel Telecomunicações',
    'Eólen',
    'Stein'
  ];

  const regionais = [
    'Regional MG',
    'Regional CO/NO',
    'Regional RJ/ES'
  ];

  const resetForm = () => {
    setEmpresa('');
    setRegional('');
    setDataExpiracao('');
    setCriadoPor('');
    setGeneratedLink(null);
    setError(null);
    setSuccess(null);
  };

  const generateForm = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      setSuccess(null);

      // Validações
      if (!empresa) {
        throw new Error('Selecione uma empresa');
      }
      if (!regional) {
        throw new Error('Selecione uma regional');
      }
      if (!criadoPor) {
        throw new Error('Informe quem está criando o formulário');
      }

      // Validar data de expiração se fornecida
      let dataExpiracaoFormatada = null;
      if (dataExpiracao) {
        const dataExp = new Date(dataExpiracao);
        const agora = new Date();

        if (dataExp <= agora) {
          throw new Error('Data de expiração deve ser futura');
        }

        dataExpiracaoFormatada = dataExp.toISOString();
      }

            // Gerar token único
      const token = generateFormToken();

      // Inserir no banco de dados
      const { data, error: insertError } = await supabase
        .from('formularios')
        .insert({
          token,
          empresa,
          regional,
          criado_por: criadoPor,
          data_expiracao: dataExpiracaoFormatada,
          status: 'pendente',
          data_criacao: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Gerar link completo
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/formulario/${token}`;

      setGeneratedLink(link);
      setSuccess('Link gerado com sucesso!');

      // Callback opcional
      if (onFormGenerated && data) {
        onFormGenerated(data.id, token);
      }

    } catch (err) {
      console.error('Erro ao gerar formulário:', err);
      setError(err instanceof Error ? err.message : 'Erro ao gerar formulário');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!generatedLink) return;

    try {
      await navigator.clipboard.writeText(generatedLink);
      setSuccess('Link copiado para a área de transferência!');
    } catch (err) {
      console.error('Erro ao copiar link:', err);
      setError('Erro ao copiar link. Tente selecionar e copiar manualmente.');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🔗</span>
            Gerar Novo Formulário
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Empresa */}
          <div className="space-y-2">
            <Label htmlFor="empresa">Empresa *</Label>
            <select
              id="empresa"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isGenerating}
            >
              <option value="">Selecione uma empresa</option>
              {empresas.map((emp) => (
                <option key={emp} value={emp}>
                  {emp}
                </option>
              ))}
            </select>
          </div>

          {/* Regional */}
          <div className="space-y-2">
            <Label htmlFor="regional">Regional *</Label>
            <select
              id="regional"
              value={regional}
              onChange={(e) => setRegional(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isGenerating}
            >
              <option value="">Selecione uma regional</option>
              {regionais.map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
          </div>

          {/* Criado Por */}
          <div className="space-y-2">
            <Label htmlFor="criadoPor">Criado por *</Label>
            <Input
              id="criadoPor"
              type="text"
              placeholder="Nome ou email de quem está criando"
              value={criadoPor}
              onChange={(e) => setCriadoPor(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          {/* Data de Expiração */}
          <div className="space-y-2">
            <Label htmlFor="dataExpiracao">Data de Expiração (opcional)</Label>
            <Input
              id="dataExpiracao"
              type="datetime-local"
              value={dataExpiracao}
              onChange={(e) => setDataExpiracao(e.target.value)}
              disabled={isGenerating}
              min={new Date().toISOString().slice(0, 16)}
            />
            <p className="text-xs text-gray-500">
              Se não informada, o link não expira automaticamente
            </p>
          </div>

          {/* Mensagens de erro e sucesso */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">❌ {error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">✅ {success}</p>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-2">
            <Button
              onClick={generateForm}
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? '⏳ Gerando...' : '🔗 Gerar Link'}
            </Button>

            {generatedLink && (
              <Button
                variant="outline"
                onClick={resetForm}
                disabled={isGenerating}
              >
                🔄 Novo
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Link Gerado */}
      {generatedLink && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>✅</span>
              Link Gerado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Link do Formulário</Label>
              <div className="flex gap-2">
                <Input
                  value={generatedLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className="shrink-0"
                >
                  📋 Copiar
                </Button>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="font-medium text-blue-900 mb-2">Instruções:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Envie este link para o técnico via WhatsApp ou email</li>
                <li>• O técnico pode acessar diretamente sem login</li>
                <li>• O formulário será salvo automaticamente ao ser enviado</li>
                {dataExpiracao && (
                  <li>• ⏰ Link expira em: {new Date(dataExpiracao).toLocaleString('pt-BR')}</li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default FormGenerator;
