import { supabase } from '@/lib/supabase/client';
import type { Tables } from '@/lib/supabase/database.types';
import { z } from 'zod';

// Schema de validação para CPF
const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

/**
 * Valida se um CPF tem formato válido (XXX.XXX.XXX-XX)
 */
export function validateCPFFormat(cpf: string): boolean {
  return cpfRegex.test(cpf);
}

/**
 * Sanitiza e formata CPF
 */
export function sanitizeCPF(cpf: string): string {
  // Remove caracteres não numéricos
  const numbers = cpf.replace(/\D/g, '');

  // Aplica formatação XXX.XXX.XXX-XX
  if (numbers.length === 11) {
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  return cpf; // Retorna original se não tiver 11 dígitos
}

/**
 * Valida dígitos verificadores do CPF
 */
export function validateCPFDigits(cpf: string): boolean {
  const numbers = cpf.replace(/\D/g, '');

  if (numbers.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(numbers)) return false;

  // Calcula primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 >= 10) digit1 = 0;

  // Calcula segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 >= 10) digit2 = 0;

  // Verifica se os dígitos calculados são iguais aos informados
  return digit1 === parseInt(numbers[9]) && digit2 === parseInt(numbers[10]);
}

/**
 * Schema de validação para formulário de identificação
 */
export const identificacaoSchema = z.object({
  // Dados do técnico/engenheiro de segurança
  tecnico_nome_completo: z.string()
    .min(3, 'Nome do técnico deve ter pelo menos 3 caracteres')
    .max(255, 'Nome do técnico muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome do técnico deve conter apenas letras e espaços'),

  tecnico_cpf: z.string()
    .refine(validateCPFFormat, 'CPF do técnico deve ter formato XXX.XXX.XXX-XX')
    .refine(validateCPFDigits, 'CPF do técnico inválido'),

  tecnico_funcao: z.string()
    .min(2, 'Função do técnico muito curta')
    .max(255, 'Função do técnico muito longa')
    .regex(/^[a-zA-ZÀ-ÿ\s\/\-]+$/, 'Função do técnico deve conter apenas letras, espaços, hífens e barras'),

  // Dados da pessoa inspecionada
  nome_completo: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(255, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),

  cpf: z.string()
    .refine(validateCPFFormat, 'CPF deve ter formato XXX.XXX.XXX-XX')
    .refine(validateCPFDigits, 'CPF inválido'),

  empresa: z.string()
    .min(2, 'Nome da empresa muito curto')
    .max(255, 'Nome da empresa muito longo'),

  funcao: z.string()
    .min(2, 'Função muito curta')
    .max(255, 'Função muito longa')
    .regex(/^[a-zA-ZÀ-ÿ\s\/\-]+$/, 'Função deve conter apenas letras, espaços, hífens e barras'),

  regional: z.string()
    .max(255, 'Regional muito longa')
    .optional(),
});

/**
 * Schema de validação para seção EPI Básico
 */
export const epiBasicoSchema = z.object({
  epi_capacete: z.boolean(),
  epi_oculos: z.boolean(),
  epi_protetor_auricular: z.boolean(),
  epi_luvas: z.boolean(),
  epi_calcado: z.boolean(),
  epi_vestimenta: z.boolean(),
  observacoes_epi_basico: z.string().max(1000, 'Observações muito longas').optional(),
});

/**
 * Schema de validação para seção EPI Altura
 */
export const epiAlturaSchema = z.object({
  epi_cinto_seguranca: z.boolean().optional(),
  epi_talabarte: z.boolean().optional(),
  epi_trava_quedas: z.boolean().optional(),
  epi_capacete_jugular: z.boolean().optional(),
  observacoes_epi_altura: z.string().max(1000, 'Observações muito longas').optional(),
});

/**
 * Schema de validação para seção EPI Elétrico
 */
export const epiEletricoSchema = z.object({
  trabalho_eletrico: z.boolean().default(false),
  epi_luvas_isolantes: z.boolean().optional(),
  epi_calcado_isolante: z.boolean().optional(),
  epi_capacete_classe_b: z.boolean().optional(),
  epi_vestimenta_antiarco: z.boolean().optional(),
  observacoes_epi_eletrico: z.string().max(1000, 'Observações muito longas').optional(),
});

/**
 * Schema de validação para seção Inspeção Geral
 */
export const inspecaoGeralSchema = z.object({
  equipamentos_integros: z.boolean(),
  certificados_validos: z.boolean(),
  treinamento_adequado: z.boolean(),
  observacoes_inspecao: z.string().max(1000, 'Observações muito longas').optional(),
});

/**
 * Schema de validação para seção Conclusão
 */
export const conclusaoSchema = z.object({
  responsavel_regional: z.string()
    .min(3, 'Nome do responsável muito curto')
    .max(255, 'Nome do responsável muito longo'),
  observacoes_gerais: z.string().max(2000, 'Observações muito longas').optional(),
});

/**
 * Schema completo de validação do formulário
 */
export const formularioCompletoSchema = z.object({
  ...identificacaoSchema.shape,
  ...epiBasicoSchema.shape,
  ...epiAlturaSchema.shape,
  ...epiEletricoSchema.shape,
  ...inspecaoGeralSchema.shape,
  ...conclusaoSchema.shape,
});

/**
 * Schema de validação para criação de formulário
 */
export const criarFormularioSchema = z.object({
  empresa: z.string().min(2, 'Nome da empresa muito curto').max(255),
  regional: z.string().min(2, 'Regional muito curta').max(255),
  // data_expiracao removido - funcionalidade não utilizada
  ufsigla: z.string().max(5).regex(/^[A-Za-z0-9]{1,5}$/, 'UFSIGLA deve conter apenas letras e números (máximo 5 caracteres)').optional(),
});

/**
 * Sanitiza strings removendo caracteres perigosos
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < e >
    .replace(/javascript:/gi, '') // Remove javascript:
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

/**
 * Sanitiza objeto recursivamente
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = {} as T;

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeString(value) as T[keyof T];
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key as keyof T] = sanitizeObject(value) as T[keyof T];
    } else {
      sanitized[key as keyof T] = value;
    }
  }

  return sanitized;
}

/**
 * Valida e sanitiza dados do formulário
 */
export function validateAndSanitizeFormData(data: unknown) {
  // Primeiro sanitiza os dados
  const sanitizedData = sanitizeObject(data as Record<string, any>);

  // Depois valida com o schema
  return formularioCompletoSchema.parse(sanitizedData);
}

/**
 * Tipos derivados dos schemas
 */
export type IdentificacaoData = z.infer<typeof identificacaoSchema>;
export type EpiBasicoData = z.infer<typeof epiBasicoSchema>;
export type EpiAlturaData = z.infer<typeof epiAlturaSchema>;
export type EpiEletricoData = z.infer<typeof epiEletricoSchema>;
export type InspecaoGeralData = z.infer<typeof inspecaoGeralSchema>;
export type ConclusaoData = z.infer<typeof conclusaoSchema>;
export type FormularioCompletoData = z.infer<typeof formularioCompletoSchema>;
export type CriarFormularioData = z.infer<typeof criarFormularioSchema>;

type Formulario = Tables<'formularios'>;

export interface TokenValidationResult {
  isValid: boolean;
  formulario: Formulario | null;
  error: string | null;
  status: 'valid' | 'invalid' | 'expired' | 'answered' | 'not_found' | 'error';
}

/**
 * Valida um token de formulário e retorna o status completo
 * @param token Token único do formulário
 * @returns Resultado da validação com status detalhado
 */
export async function validateFormToken(token: string): Promise<TokenValidationResult> {
  try {
    // Validação básica do token
    if (!token || token.trim().length === 0) {
      return {
        isValid: false,
        formulario: null,
        error: 'Token não fornecido',
        status: 'invalid'
      };
    }

    // Buscar formulário pelo token
    console.log('🔍 Validando token:', token);
    const { data: formulario, error: fetchError } = await supabase
      .from('formularios')
      .select('*')
      .eq('token', token.trim())
      .single();

    if (fetchError) {
      console.log('❌ Erro ao buscar formulário:', fetchError);
      if (fetchError.code === 'PGRST116') {
        return {
          isValid: false,
          formulario: null,
          error: 'Token inválido ou formulário não encontrado',
          status: 'not_found'
        };
      }

      return {
        isValid: false,
        formulario: null,
        error: `Erro ao buscar formulário: ${fetchError.message}`,
        status: 'error'
      };
    }

    console.log('📋 Formulário encontrado:', {
      id: formulario.id,
      status: formulario.status,
      empresa: formulario.empresa
      // data_expiracao removido - funcionalidade não utilizada
    });

    // Verificar se já foi respondido
    if (formulario.status === 'respondido') {
      return {
        isValid: false,
        formulario,
        error: 'Este formulário já foi respondido',
        status: 'answered'
      };
    }

    // Funcionalidade de expiração removida

    // Token válido
    return {
      isValid: true,
      formulario,
      error: null,
      status: 'valid'
    };

  } catch (error) {
    console.error('Erro na validação do token:', error);
    return {
      isValid: false,
      formulario: null,
      error: error instanceof Error ? error.message : 'Erro desconhecido na validação',
      status: 'error'
    };
  }
}

/**
 * Funcionalidade de expiração removida - não utilizamos mais
 */
// export function checkTokenExpiration(formulario: Formulario): boolean { ... }

/**
 * Atualiza o status de um formulário no banco de dados
 * @param formularioId ID do formulário
 * @param status Novo status
 */
export async function updateFormularioStatus(
  formularioId: string,
  status: 'pendente' | 'respondido' | 'expirado'
): Promise<void> {
  try {
    // Tentar atualizar diretamente primeiro
    const { error: updateError } = await supabase
      .from('formularios')
      .update({ status })
      .eq('id', formularioId);

    if (updateError) {
      console.error('Erro ao atualizar status do formulário:', updateError);

      // Se falhar, tentar com RPC como fallback
      try {
        const { error: rpcError } = await supabase
          .rpc('updateformulariostatus', {
            formulario_id: formularioId,
            novo_status: status
          });

        if (rpcError) {
          throw new Error(`Erro ao atualizar status via RPC: ${rpcError.message}`);
        }
      } catch (rpcErr) {
        console.warn('⚠️ RPC também falhou, mas continuando...');
        // Não bloquear o processo se a atualização de status falhar
        return;
      }
    }

    console.log(`✅ Status do formulário ${formularioId} atualizado para: ${status}`);
  } catch (error) {
    console.error('Erro ao atualizar status do formulário:', error);
    // Não bloquear o processo principal se a atualização de status falhar
    console.warn('⚠️ Continuando sem atualizar status do formulário');
  }
}

/**
 * Valida formato de token (deve ter 12 caracteres alfanuméricos)
 * @param token Token a ser validado
 * @returns true se o formato é válido
 */
export function validateTokenFormat(token: string): boolean {
  if (!token) return false;

  // Token deve ter exatamente 12 caracteres
  if (token.length !== 12) return false;

  // Token deve conter apenas caracteres seguros (sem caracteres ambíguos)
  const safeAlphabetRegex = /^[23456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz]{12}$/;
  return safeAlphabetRegex.test(token);
}

/**
 * Funcionalidade de expiração removida - não utilizamos mais
 */
// export function getTimeUntilExpiration(formulario: Formulario): { ... }

/**
 * Validações de dados de entrada do formulário
 */
export const formValidation = {
  /**
   * Valida CPF (formato simples)
   */
  cpf: (cpf: string): boolean => {
    if (!cpf) return false;
    const cleanCpf = cpf.replace(/\D/g, '');
    return cleanCpf.length === 11;
  },

  /**
   * Valida nome completo
   */
  nomeCompleto: (nome: string): boolean => {
    if (!nome) return false;
    const trimmed = nome.trim();
    return trimmed.length >= 3 && trimmed.includes(' ');
  },

  /**
   * Valida função/cargo
   */
  funcao: (funcao: string): boolean => {
    if (!funcao) return false;
    return funcao.trim().length >= 2;
  },

  /**
   * Valida observações (opcional, mas se preenchido deve ter conteúdo)
   */
  observacoes: (observacoes: string): boolean => {
    if (!observacoes) return true; // Opcional
    return observacoes.trim().length >= 3;
  }
};

/**
 * Sanitiza dados de entrada removendo caracteres perigosos
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';

  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>&]/g, '') // Remove apenas caracteres realmente perigosos (preserva espaços, acentos e aspas)
    .substring(0, 1000); // Limita tamanho
}
