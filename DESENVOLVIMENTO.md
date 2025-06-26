# Configurações de Desenvolvimento

Este documento descreve as configurações de desenvolvimento implementadas no projeto.

## Estrutura de Pastas

O projeto segue uma estrutura organizada por funcionalidade:

```
src/
├── components/          # Componentes React
│   ├── admin/          # Componentes do painel administrativo
│   ├── form/           # Componentes do formulário
│   │   └── sections/   # Seções específicas do formulário
│   ├── shared/         # Componentes compartilhados
│   └── ui/             # Componentes de interface (shadcn/ui)
├── pages/              # Páginas da aplicação
│   ├── admin/          # Páginas do painel administrativo
│   └── form/           # Páginas do formulário
├── hooks/              # Hooks personalizados
├── types/              # Definições de tipos TypeScript
├── lib/                # Bibliotecas e utilitários
│   ├── supabase/       # Configurações e utilitários do Supabase
│   └── utils/          # Funções utilitárias
└── assets/             # Recursos estáticos
```

## ESLint

Configuração robusta com regras para:
- **React**: Hooks e refresh de componentes
- **TypeScript**: Tipos e boas práticas
- **Qualidade de código**: Prevenção de bugs comuns
- **Testes**: Configuração específica para arquivos de teste

### Principais regras configuradas:
- Detecção de variáveis não utilizadas
- Prevenção de `any` explícito
- Uso preferencial de `const` e template literals
- Validação de hooks do React
- Organização automática de imports

## Prettier

Configuração para formatação consistente:
- **Aspas simples** para strings
- **Ponto e vírgula** obrigatório
- **Vírgula trailing** em objetos/arrays
- **Largura de linha** de 80 caracteres
- **Indentação** de 2 espaços
- **JSX** com aspas simples

## VSCode

### Configurações automáticas:
- Formatação ao salvar
- Correção automática do ESLint
- Organização de imports
- Configurações específicas por linguagem

### Extensões recomendadas:
- Prettier (formatação)
- ESLint (linting)
- Tailwind CSS (autocomplete)
- TypeScript (suporte avançado)
- Auto Rename Tag
- Path Intellisense
- Error Lens
- Supabase

## Variáveis de Ambiente

Arquivo `.env.example` com documentação completa:
- Configurações do Supabase
- Configurações de desenvolvimento
- Limites de upload
- Configurações de debug

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Servidor de desenvolvimento
npm run build           # Build de produção
npm run preview         # Preview do build

# Qualidade de código
npm run lint            # Executar ESLint
npm run lint:fix        # Corrigir problemas do ESLint automaticamente
npm run format          # Formatar código com Prettier
npm run format:check    # Verificar formatação
npm run type-check      # Verificar tipos TypeScript

# shadcn/ui
npm run ui:add          # Adicionar componente do shadcn/ui
npm run ui:init         # Inicializar shadcn/ui
```

## Fluxo de Desenvolvimento Recomendado

1. **Antes de commitar:**
   ```bash
   npm run lint:fix
   npm run format
   npm run type-check
   ```

2. **Configuração do editor:**
   - Instalar extensões recomendadas
   - Configurações aplicadas automaticamente via `.vscode/settings.json`

3. **Estrutura de arquivos:**
   - Seguir a organização por funcionalidade
   - Colocar testes ao lado dos arquivos testados
   - Usar nomes descritivos e consistentes

## Próximos Passos

Com a infraestrutura configurada, o projeto está pronto para:
- Configuração do Supabase (tarefa 1.6)
- Desenvolvimento do sistema de banco de dados (seção 2.0)
- Implementação dos componentes (seções 3.0 e 4.0)
