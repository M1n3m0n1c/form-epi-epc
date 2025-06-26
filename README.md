# Sistema de Formulário EPI/EPC

## 🚀 Tecnologias

Este projeto foi configurado com as seguintes tecnologias:

- **React 19** - Biblioteca JavaScript para construção de interfaces
- **TypeScript** - Superset do JavaScript com tipagem estática
- **Vite** - Build tool rápido e moderno
- **Tailwind CSS v4** - Framework CSS utilitário
- **Shadcn/UI** - Componentes React reutilizáveis e acessíveis
- **React Hook Form** - Biblioteca para gerenciamento de formulários
- **Zod** - Biblioteca de validação de schemas
- **Supabase** - Backend como serviço (BaaS)

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd form-epi
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o projeto em modo de desenvolvimento:
```bash
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

## 🎨 Shadcn/UI

Este projeto está configurado com Shadcn/UI, uma biblioteca de componentes React moderna e acessível.

### Configuração realizada:

- ✅ Tailwind CSS v4 configurado
- ✅ Shadcn/UI inicializado com tema Stone
- ✅ Componentes base instalados (Button, Card, Input, Label)
- ✅ Alias de importação configurado (`@/`)
- ✅ TypeScript paths configurados

### Adicionando novos componentes:

```bash
# Adicionar um componente específico
npx shadcn@latest add dialog

# Adicionar múltiplos componentes
npx shadcn@latest add form select textarea
```

### Componentes disponíveis:

- Button - Botões com diferentes variantes
- Card - Cartões para organizar conteúdo
- Input - Campos de entrada de texto
- Label - Rótulos para formulários

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run preview` - Visualiza o build de produção
- `npm run lint` - Executa verificação de linting
- `npm run lint:fix` - Corrige automaticamente erros de linting
- `npm run format` - Formata o código com Prettier
- `npm run type-check` - Verifica tipos TypeScript
- `npm run ui:add` - Atalho para adicionar componentes Shadcn/UI
- `npm run ui:init` - Atalho para inicializar Shadcn/UI

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   └── ui/             # Componentes Shadcn/UI
├── lib/                # Utilitários e configurações
├── assets/             # Recursos estáticos
├── App.tsx             # Componente principal
├── main.tsx            # Ponto de entrada
└── index.css           # Estilos globais
```

## 🎯 Próximos Passos

1. Desenvolver os formulários de EPI/EPC
2. Integrar com Supabase para persistência de dados
3. Implementar autenticação de usuários
4. Adicionar validações de formulários com Zod
5. Criar relatórios e dashboards

## 📚 Documentação

- [Shadcn/UI](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [Supabase](https://supabase.com/docs)
