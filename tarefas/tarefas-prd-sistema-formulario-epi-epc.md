# Tarefas - Sistema de Formulário EPI/EPC Web com Gestão de Links

## Arquivos Relevantes

- `package.json` - Configuração do projeto e dependências
- `vite.config.ts` - Configuração do Vite
- `tsconfig.json` - Configuração do TypeScript
- `eslint.config.js` - Configuração do ESLint com regras específicas para React e TypeScript
- `.prettierrc` - Configuração do Prettier para formatação de código
- `.prettierignore` - Arquivos ignorados pelo Prettier
- `.vscode/settings.json` - Configurações do VSCode para o projeto
- `.vscode/extensions.json` - Extensões recomendadas do VSCode
- `env.example` - Exemplo de variáveis de ambiente com valores do projeto form-epi-epc
- `.gitignore` - Configurado para ignorar arquivos .env
- `index.html` - Arquivo HTML principal
- `src/main.tsx` - Ponto de entrada da aplicação React (corrigido warning ESLint)
- `src/App.tsx` - Componente principal da aplicação com React Router configurado para roteamento dinâmico
- `src/lib/supabase/client.ts` - Cliente Supabase configurado com teste de conexão
- `src/components/` - Estrutura de componentes organizados por funcionalidade
  - `src/components/admin/` - Componentes do painel administrativo
  - `src/components/form/` - Componentes do formulário
  - `src/components/form/sections/` - Seções específicas do formulário
  - `src/components/shared/` - Componentes compartilhados
  - `src/components/ui/` - Componentes de interface (shadcn/ui)
- `src/pages/` - Páginas da aplicação
  - `src/pages/admin/` - Páginas do painel administrativo
  - `src/pages/form/` - Páginas do formulário
- `src/hooks/` - Hooks personalizados
- `src/types/` - Definições de tipos TypeScript
- `src/lib/` - Bibliotecas e utilitários
  - `src/lib/supabase/` - Configurações e utilitários do Supabase
  - `src/lib/utils/` - Funções utilitárias
- `src/components/admin/AdminLayout.tsx` - Layout base responsivo do painel administrativo com navegação
- `src/components/admin/Dashboard.tsx` - Componente principal do dashboard com estatísticas reais conectadas ao Supabase
- `src/components/admin/Dashboard.test.tsx` - Testes unitários para o Dashboard
- `src/components/admin/FormGenerator.tsx` - Componente completo para geração de links únicos com data de expiração e cópia automática
- `src/components/admin/FormGenerator.test.tsx` - Testes unitários para o FormGenerator
- `src/components/admin/FormList.tsx` - Componente de listagem de formulários com filtros avançados por status, empresa, data e busca por nome do criador
- `src/components/admin/FormViewer.tsx` - Componente completo para visualização detalhada de respostas com fotos organizadas por seção
- `src/components/admin/FormViewer.test.tsx` - Testes unitários para o FormViewer
- `src/components/form/FormContainer.tsx` - Container principal do formulário EPI/EPC com interface FormData atualizada para compatibilidade com schema do banco
- `src/components/form/FormContainer.test.tsx` - Testes unitários para o FormContainer
- `src/components/form/sections/Identificacao.tsx` - Seção de identificação do formulário
- `src/components/form/sections/EpiBasico.tsx` - Seção de EPI básico com checklist (atualizada com nomes de campos compatíveis com schema)
- `src/components/form/sections/EpiAltura.tsx` - Seção de EPI para trabalho em altura (atualizada com nomes de campos compatíveis com schema)
- `src/components/form/sections/EpiEletrico.tsx` - Seção de EPI para trabalhos elétricos (atualizada com nomes de campos compatíveis com schema)
- `src/components/form/sections/InspecaoGeral.tsx` - Seção de inspeção geral
- `src/components/form/sections/Conclusao.tsx` - Seção de conclusão com responsáveis regionais
- `src/components/shared/PhotoUpload.tsx` - Componente para upload e captura de fotos
- `src/components/shared/PhotoUpload.test.tsx` - Testes unitários para o PhotoUpload
- `src/lib/supabase/database.types.ts` - Tipos TypeScript gerados do banco Supabase (atualizado com schema completo)
- `src/lib/utils/tokenGenerator.ts` - Utilitários para geração de tokens únicos
- `src/lib/utils/tokenGenerator.test.ts` - Testes unitários para o tokenGenerator
- `src/lib/utils/validation.ts` - Funções completas de validação de tokens, verificação de expiração e sanitização de dados
- `src/lib/utils/photoCompression.ts` - Utilitários para compressão de fotos
- `src/lib/utils/photoCompression.test.ts` - Testes unitários para a compressão de fotos
- `src/lib/utils/reportGenerator.ts` - Utilitários para geração de relatórios PDF/DOCX
- `src/lib/utils/reportGenerator.test.ts` - Testes unitários para o reportGenerator
- `src/pages/admin/index.tsx` - Página principal do painel administrativo
- `src/pages/form/[token].tsx` - Página dinâmica do formulário baseada no token com validação completa e inserção no Supabase corrigida para compatibilidade com schema
- `src/hooks/useFormData.ts` - Hook personalizado para gerenciamento de dados do formulário
- `src/hooks/useFormData.test.ts` - Testes unitários para o useFormData
- `src/types/form.types.ts` - Tipos TypeScript para o sistema de formulários
- `supabase/migrations/001_initial_schema.sql` - Migration inicial do banco de dados

### Notas

- Os testes unitários geralmente devem ser colocados ao lado dos arquivos de código que estão testando (ex: `MeuComponente.tsx` e `MeuComponente.test.tsx` no mesmo diretório).
- Use `npx jest [caminho/opcional/para/arquivo/de/teste]` para executar os testes. Executar sem um caminho executa todos os testes encontrados pela configuração do Jest.

## Tarefas

- [x] 1.0 Configuração Inicial do Projeto e Infraestrutura
  - [x] 1.1 Criar projeto React com Vite e TypeScript
  - [x] 1.2 Configurar dependências principais (shadcn/ui, Tailwind CSS, React Hook Form, Zod)
  - [x] 1.3 Configurar estrutura de pastas do projeto (components, pages, lib, hooks, types)
  - [x] 1.4 Configurar ESLint, Prettier e configurações de desenvolvimento
  - [x] 1.6 Criar projeto no Supabase e configurar variáveis de ambiente

- [x] 2.0 Desenvolvimento do Sistema de Banco de Dados e Backend
  - [x] 2.1 Criar schema do banco de dados (tabelas: formularios, respostas, fotos)
  - [x] 2.2 Configurar Row Level Security (RLS) no Supabase
  - [x] 2.3 Criar migration inicial com estrutura completa do banco
  - [x] 2.4 Configurar bucket de storage para fotos no Supabase
  - [x] 2.5 Implementar cliente Supabase no frontend
  - [x] 2.6 Gerar tipos TypeScript do banco de dados
  - [x] 2.7 Criar utilitários para geração de tokens únicos criptograficamente seguros
  - [x] 2.8 Implementar validação e sanitização de dados de entrada

- [x] 3.0 Desenvolvimento do Painel Administrativo
  - [x] 3.1 Criar layout base do painel administrativo
  - [x] 3.2 Implementar dashboard com estatísticas (total gerados, respondidos, pendentes, expirados)
  - [x] 3.3 Desenvolver componente de geração de links únicos com data de expiração opcional
  - [x] 3.4 Implementar funcionalidade de copiar link para clipboard automaticamente
  - [x] 3.5 Criar listagem de formulários com filtros por status e data
  - [x] 3.6 Desenvolver visualização detalhada de respostas individuais
  - [x] 3.7 Implementar organização e exibição de fotos por seção do formulário
  - [x] 3.8 Criar filtros por empresa, período e regional
  - [x] 3.9 Implementar navegação responsiva para o painel administrativo

- [x] 4.0 Desenvolvimento da Interface de Preenchimento do Formulário
  - [x] 4.1 Criar página dinâmica de formulário baseada em token ([token].tsx)
  - [x] 4.2 Implementar validação de token único e verificação de expiração
  - [x] 4.3 Desenvolver seção de Identificação com campos obrigatórios e dropdown de regionais
  - [x] 4.4 Criar seção EPI Básico com checklist Sim/Não para 6 itens
  - [x] 4.5 Implementar seção EPI para Trabalho em Altura com checklist específico
  - [x] 4.6 Desenvolver seção EPI para Trabalhos Elétricos (condicional)
  - [x] 4.7 Criar seção Inspeção Geral com validações finais
  - [x] 4.8 Implementar seção Conclusão com dropdown de responsáveis regionais
  - [x] 4.9 Adicionar campos de observações em texto livre para cada seção
  - [x] 4.10 Implementar navegação entre seções e validação em tempo real
  - [x] 4.11 Criar design mobile-first responsivo com botões acessíveis
  - [x] 4.12 Implementar confirmação de envio bem-sucedido

- [x] 4.13 Adicionar filtro de busca por nome do criador na listagem de formulários
  - [x] 4.13.1 Implementar campo de busca de texto para filtrar por nome do criador
  - [x] 4.13.2 Integrar filtro na função de filtragem existente
  - [x] 4.13.3 Adicionar limpeza do filtro na função limparFiltros

- [x] 5.0 Sistema de Upload e Gerenciamento de Fotos
  - [x] 5.1 Desenvolver componente PhotoUpload para captura via câmera
  - [x] 5.2 Implementar upload de fotos da galeria do dispositivo
  - [x] 5.3 Criar sistema de compressão automática de fotos (máximo 2MB)
  - [x] 5.4 Implementar preview das fotos antes do upload
  - [x] 5.5 Desenvolver organização automática de fotos por seção
  - [x] 5.6 Criar estrutura de armazenamento `/formularios/{formulario_id}/{secao}/`
  - [x] 5.7 Implementar associação de metadados das fotos com resposta e seção
  - [x] 5.8 Adicionar validação de tipos de arquivo e tamanho
  - [x] 5.9 Implementar feedback visual para upload em progresso
  - [x] 5.10 Criar funcionalidade de remoção de fotos antes do envio

- [ ] 6.0 Sistema de Geração de Relatórios e Funcionalidades Finais
  - [ ] 6.1 Implementar geração de relatórios em PDF com fotos integradas
  - [ ] 6.2 Criar templates de relatório com layout profissional
  - [ ] 6.3 Desenvolver exportação de relatórios em formato DOCX
  - [ ] 6.4 Implementar download automático de relatórios após resposta
  - [ ] 6.5 Adicionar funcionalidade de envio por email (opcional)
  - [ ] 6.6 Criar sistema de logs e monitoramento de erros
  - [ ] 6.7 Implementar validação final de todos os campos obrigatórios
  - [ ] 6.8 Adicionar testes de integração para fluxo completo
  - [ ] 6.9 Configurar backup automático de dados e fotos
  - [ ] 6.10 Realizar testes de performance e otimização
  - [ ] 6.11 Documentar APIs e componentes principais
  - [ ] 6.12 Preparar deploy de produção com configurações de segurança
