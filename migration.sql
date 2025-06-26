-- Migração para adicionar campos faltantes na tabela respostas
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar campos do responsável pela inspeção (técnico/engenheiro de segurança)
ALTER TABLE respostas
ADD COLUMN IF NOT EXISTS responsavel_nome TEXT;

ALTER TABLE respostas
ADD COLUMN IF NOT EXISTS responsavel_cpf TEXT;

ALTER TABLE respostas
ADD COLUMN IF NOT EXISTS responsavel_funcao TEXT;

-- 2. Renomear campos existentes para seguir convenção (se existirem)
-- Campos da pessoa inspecionada já existem com nomes corretos:
-- nome_completo -> inspecionado_nome (renomear)
-- cpf -> inspecionado_cpf (renomear)
-- funcao -> inspecionado_funcao (renomear)

-- Renomear campos existentes
ALTER TABLE respostas RENAME COLUMN nome_completo TO inspecionado_nome;
ALTER TABLE respostas RENAME COLUMN cpf TO inspecionado_cpf;
ALTER TABLE respostas RENAME COLUMN funcao TO inspecionado_funcao;

-- 3. Adicionar campos de ferramental e equipamentos
ALTER TABLE respostas
ADD COLUMN IF NOT EXISTS ferramental BOOLEAN DEFAULT NULL;

ALTER TABLE respostas
ADD COLUMN IF NOT EXISTS corda_icamento BOOLEAN DEFAULT NULL;

-- 4. Adicionar campos de trabalho condicional
ALTER TABLE respostas
ADD COLUMN IF NOT EXISTS trabalho_altura BOOLEAN DEFAULT NULL;

ALTER TABLE respostas
ADD COLUMN IF NOT EXISTS trabalho_eletrico BOOLEAN DEFAULT NULL;

-- 5. Adicionar campo reforco_regras_ouro (pergunta sobre regras de ouro da Vivo/Vale)
ALTER TABLE respostas
ADD COLUMN IF NOT EXISTS reforco_regras_ouro BOOLEAN DEFAULT NULL;

-- 6. Adicionar campo declaracao_responsabilidade (checkbox de concordância)
ALTER TABLE respostas
ADD COLUMN IF NOT EXISTS declaracao_responsabilidade BOOLEAN DEFAULT FALSE;

-- 7. Verificar se todos os campos foram adicionados/renomeados corretamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'respostas'
  AND column_name IN (
    'responsavel_nome',
    'responsavel_cpf',
    'responsavel_funcao',
    'inspecionado_nome',
    'inspecionado_cpf',
    'inspecionado_funcao',
    'ferramental',
    'corda_icamento',
    'trabalho_altura',
    'trabalho_eletrico',
    'reforco_regras_ouro',
    'declaracao_responsabilidade'
  )
ORDER BY column_name;
