# Especificação Técnica - Sistema de Formulário EPI/EPC Web com Gestão de Links

## Visão Geral do Projeto

O sistema será uma aplicação web responsiva que permite a geração de links únicos para formulários de checklist EPI/EPC, sem necessidade de cadastro pelos técnicos de campo. A solução incluirá um painel administrativo para gestão e monitoramento dos formulários, com backend em Supabase/Python e frontend otimizado para dispositivos móveis.

## Arquitetura Técnica

### **Backend**

- **Supabase**: Banco de dados PostgreSQL com autenticação e APIs automáticas


### **Frontend**

- **Framework**: **React 18** com **TypeScript** para desenvolvimento robusto e tipado
- **UI Components**: **shadcn/ui** para componentes acessíveis e customizáveis
- **Styling**: **Tailwind CSS** para estilização utilitária e responsiva
- **Build Tool**: **Vite** para desenvolvimento rápido e build otimizado
- **State Management**: **Zustand** ou **React Query** para gerenciamento de estado
- **Form Handling**: **React Hook Form** com **Zod** para validação de formulários
- **Responsividade**: Design mobile-first com breakpoints otimizados
- **Deploy**: Vercel para hospedagem do frontend React


## Funcionalidades Principais

### **1. Painel Administrativo**

#### **Geração de Links**

- Interface para criar novos formulários
- Configuração de data de expiração (opcional)
- Geração automática de token único para cada link
- Cópia automática do link gerado para clipboard


#### **Dashboard de Monitoramento**

- **Visão Geral**: Cards com estatísticas (total gerados, respondidos, pendentes, expirados)
- **Lista de Formulários**: Tabela com filtros por status e data
- **Detalhes por Formulário**:
    - Status atual (Pendente/Respondido/Expirado)
    - Data de criação e expiração
    - Link de acesso
    - Botão para visualizar resposta (se respondido)


#### **Gestão de Respostas**

- Visualização detalhada de cada resposta
- Galeria de fotos anexadas organizadas por seção
- Exportação para PDF/DOCX
- Filtros por empresa, período, regional


### **2. Interface de Preenchimento (Mobile-First)**

#### **Acesso via Link**

- Validação do token de acesso
- Verificação de expiração
- Redirecionamento para formulário ativo


#### **Formulário Responsivo**

- **Seção 1 - Identificação**:
    - Empresa (dropdown): Icomon, Telequipe, Tel Telecomunicações, Eólen, Stein
    - Matrícula (texto obrigatório)
    - Nome completo (texto obrigatório)
    - Data do registro (seletor de data)
    - Local da atividade (texto obrigatório)
    - UF/Sigla do site (texto obrigatório)
    - Nome do supervisor (texto obrigatório)
- **Seção 2 - EPI Básico**:
    - Capacete jugular (Sim/Não)
    - Óculos de proteção (Sim/Não)
    - Protetor auricular (Sim/Não)
    - Luvas de segurança (Sim/Não)
    - Calçado de segurança (Sim/Não)
    - Uniforme com faixa refletiva (Sim/Não)
    - Observações (texto livre)
    - **Anexo de fotos**: Interface para captura/upload
- **Seção 3 - EPI para Trabalho em Altura**:
    - Cinto de segurança tipo paraquedista (Sim/Não)
    - Talabarte de segurança duplo com absorvedor (Sim/Não)
    - Trava quedas deslizante (Sim/Não)
    - Mosquetão com trava de segurança (Sim/Não)
    - Observações (texto livre)
    - **Anexo de fotos**: Interface para captura/upload
- **Seção 4 - EPI para Trabalhos Elétricos** (se aplicável):
    - Luvas isolantes de borracha (Sim/Não)
    - Mangote isolante (Sim/Não)
    - Tapete isolante (Sim/Não)
    - Observações (texto livre)
    - **Anexo de fotos**: Interface para captura/upload
- **Seção 5 - Inspeção Geral**:
    - EPIs em boas condições de uso (Sim/Não)
    - Instruções sobre uso correto recebidas (Sim/Não)
    - EPIs fornecidos conforme necessidade (Sim/Não)
    - Observações (texto livre)
- **Seção 6 - Conclusão**:
    - Responsável regional (dropdown):
        - Regional MG: aretha.silva@telefonica.com
        - Regional CO/NO: alessandro.oliveira@telefonica.com
        - Regional RJ/ES: renato.fittipaldi@telefonica.com
    - Observações gerais (texto livre)
    - Auto-avaliação de aptidão (escala 0-5)

### **3. Sistema de Anexo de Fotos**

#### **Funcionalidades de Upload**

- **Captura direta**: Acesso à câmera do dispositivo
- **Seleção de galeria**: Upload de fotos existentes
- **Compressão automática**: Otimização para web (máximo 2MB por foto)
- **Preview**: Visualização antes do upload
- **Organização por seção**: Fotos categorizadas automaticamente


#### **Armazenamento**

- **Supabase Storage**: Bucket público para armazenamento de imagens
- **Estrutura de pastas**: `/formularios/{formulario_id}/{secao}/`
- **Metadados**: Associação com resposta e seção específica


## Fluxo de Trabalho

### **Processo Administrativo**

1. **Geração**: Admin acessa painel e gera novo link de formulário
2. **Distribuição**: Link é enviado para técnicos via WhatsApp/Email
3. **Monitoramento**: Admin acompanha status em tempo real no dashboard
4. **Análise**: Visualização de respostas e exportação de relatórios

### **Processo do Técnico**

1. **Acesso**: Técnico clica no link recebido
2. **Preenchimento**: Responde formulário seção por seção
3. **Fotos**: Anexa fotos diretamente de cada seção
4. **Envio**: Submete formulário completo
5. **Confirmação**: Recebe confirmação de envio bem-sucedido

## Recursos de Segurança

- **Tokens únicos**: Links com tokens criptograficamente seguros
- **Expiração automática**: Formulários expiram automaticamente
- **Validação de dados**: Sanitização de inputs no backend
- **Rate limiting**: Proteção contra spam e ataques
- **HTTPS obrigatório**: Comunicação criptografada


## Entregáveis

- **Aplicação web responsiva** com interface mobile-first
- **Painel administrativo** completo para gestão
- **APIs RESTful** documentadas com FastAPI
- **Banco de dados** configurado no Supabase
- **Sistema de upload** de fotos integrado
- **Geração de relatórios** PDF/DOCX
- **Documentação técnica** e manual do usuário
- **Deploy automatizado** em plataforma cloud

Esta especificação atende completamente aos requisitos apresentados, oferecendo uma solução moderna, escalável e otimizada para o uso em campo pelos técnicos, sem necessidade de cadastros complexos e com total controle administrativo sobre os formulários gerados