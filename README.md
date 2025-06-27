# Sistema de Formulários EPI/EPC (SISFEE)

Sistema web para criação e gerenciamento de formulários de inspeção de Equipamentos de Proteção Individual (EPI) e Equipamentos de Proteção Coletiva (EPC).

## ✨ Novidades

### 🎨 Sidebar Moderno com shadcn/ui

O sistema agora utiliza um sidebar moderno e profissional baseado no shadcn/ui, oferecendo:

- **Design responsivo**: Funciona perfeitamente em desktop e mobile
- **Sidebar colapsável**: Pode ser minimizado para economizar espaço
- **Atalho de teclado**: `Ctrl/Cmd + B` para alternar o sidebar
- **Navegação intuitiva**: Ícones modernos e estado ativo visual
- **Tema consistente**: Integrado com o sistema de temas do projeto

#### Componentes do Sidebar

- `AppSidebar`: Componente principal do sidebar
- `SidebarProvider`: Contexto para gerenciar estado do sidebar
- `SidebarTrigger`: Botão para alternar o sidebar
- `SidebarMenu`: Sistema de navegação com ícones

#### Funcionalidades

- 📊 **Dashboard**: Visão geral do sistema
- 📋 **Formulários**: Lista e gerenciamento de formulários
- 🔗 **Gerar Link**: Criação de novos formulários

## 🚀 Tecnologias Utilizadas

- **React 18** - Biblioteca principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS
- **shadcn/ui** - Componentes UI modernos
- **Lucide React** - Ícones
- **Supabase** - Backend as a Service

## 🛠️ Instalação

```bash
# Clone o repositório
git clone <repo-url>
cd form-epi

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp env.example .env

# Inicie o servidor de desenvolvimento
npm run dev
```

## 📱 Responsividade

O sidebar é totalmente responsivo:

- **Desktop**: Sidebar fixo na lateral esquerda
- **Mobile**: Sidebar em overlay (sheet) que pode ser aberto/fechado
- **Tablet**: Comportamento adaptativo baseado no tamanho da tela

## 🎨 Personalização

O sidebar pode ser personalizado através das variáveis CSS:

```css
:root {
  --sidebar: oklch(0.985 0.001 106.423);
  --sidebar-foreground: oklch(0.147 0.004 49.25);
  --sidebar-primary: oklch(0.216 0.006 56.043);
  --sidebar-accent: oklch(0.97 0.001 106.424);
  /* ... outras variáveis */
}
```

## 🔧 Desenvolvimento

Para adicionar novos itens ao sidebar, edite o arquivo `src/components/admin/AppSidebar.tsx`:

```typescript
const menuItems = [
  {
    id: 'dashboard',
    title: "Dashboard",
    icon: BarChart3,
  },
  // Adicione novos itens aqui
]
```

## 📄 Licença

Este projeto está sob a licença MIT.

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
