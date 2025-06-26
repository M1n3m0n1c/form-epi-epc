# PRD - Sistema de Formulário EPI/EPC Web com Gestão de Links

## 1. Introdução/Visão Geral

O Sistema de Formulário EPI/EPC Web é uma aplicação responsiva que resolve o problema atual de formulários Microsoft Forms que não permitem anexo de fotos. Atualmente, os técnicos enviam fotos separadamente por email para as regionais, resultando em relatórios finais incompletos sem as evidências fotográficas necessárias.

**Objetivo:** Criar uma solução web que permita aos técnicos preencherem checklists EPI/EPC com anexo de fotos diretamente no formulário, gerando relatórios completos com todas as evidências visuais integradas.

## 2. Objetivos

- **Eliminar** a necessidade de envio de fotos por email separadamente
- **Integrar** fotos diretamente nos relatórios finais de EPI/EPC
- **Simplificar** o processo para técnicos sem necessidade de cadastros
- **Centralizar** a gestão de formulários em um painel administrativo
- **Garantir** que todos os relatórios contenham evidências fotográficas completas
- **Otimizar** a experiência mobile para uso em campo

## 3. Histórias de Usuário

### Administrador do Sistema
- **Como** administrador, **eu quero** gerar links únicos de formulários **para que** possa distribuí-los aos técnicos sem necessidade de cadastros
- **Como** administrador, **eu quero** monitorar o status dos formulários em tempo real **para que** possa acompanhar o progresso das inspeções
- **Como** administrador, **eu quero** visualizar relatórios completos com fotos **para que** tenha evidências visuais das condições dos EPIs
- **Como** administrador, **eu quero** exportar relatórios em PDF/DOCX **para que** possa compartilhar e arquivar adequadamente

### Técnico de Campo
- **Como** técnico, **eu quero** acessar o formulário via link direto **para que** não precise fazer cadastros ou logins
- **Como** técnico, **eu quero** anexar fotos diretamente em cada seção **para que** as evidências sejam organizadas corretamente
- **Como** técnico, **eu quero** preencher o formulário no celular **para que** possa fazer a inspeção diretamente em campo
- **Como** técnico, **eu quero** receber confirmação de envio **para que** tenha certeza de que o relatório foi submetido

### Responsável Regional
- **Como** responsável regional, **eu quero** receber relatórios completos com fotos **para que** possa avaliar adequadamente as condições de segurança
- **Como** responsável regional, **eu quero** acessar relatórios por período e empresa **para que** possa fazer análises regionais

## 4. Requisitos Funcionais

### 4.1 Painel Administrativo
1. O sistema deve permitir a geração de links únicos para formulários EPI/EPC
2. O sistema deve permitir configuração opcional de data de expiração para links
3. O sistema deve copiar automaticamente o link gerado para o clipboard
4. O sistema deve exibir dashboard com estatísticas (total gerados, respondidos, pendentes, expirados)
5. O sistema deve listar todos os formulários com filtros por status e data
6. O sistema deve permitir visualização detalhada de cada resposta
7. O sistema deve organizar fotos anexadas por seção do formulário
8. O sistema deve permitir exportação de relatórios para PDF/DOCX
9. O sistema deve permitir filtros por empresa, período e regional

### 4.2 Interface de Preenchimento
10. O sistema deve validar tokens de acesso únicos
11. O sistema deve verificar expiração de links automaticamente
12. O sistema deve redirecionar para formulário ativo quando link válido
13. O sistema deve ser responsivo com design mobile-first
14. O sistema deve incluir seção de Identificação com campos obrigatórios:
    - Empresa (dropdown): Icomon, Telequipe, Tel Telecomunicações, Eólen, Stein
    - Matrícula, Nome completo, Data do registro, Local da atividade, UF/Sigla do site, Nome do supervisor
15. O sistema deve incluir seção EPI Básico com checklist Sim/Não para 6 itens
16. O sistema deve incluir seção EPI para Trabalho em Altura com checklist específico
17. O sistema deve incluir seção EPI para Trabalhos Elétricos (quando aplicável)
18. O sistema deve incluir seção Inspeção Geral com validações finais
19. O sistema deve incluir seção Conclusão com dropdown de responsáveis regionais:
    - Regional MG: aretha.silva@telefonica.com
    - Regional CO/NO: alessandro.oliveira@telefonica.com
    - Regional RJ/ES: renato.fittipaldi@telefonica.com
20. O sistema deve permitir observações em texto livre em cada seção

### 4.3 Sistema de Anexo de Fotos
21. O sistema deve permitir captura direta via câmera do dispositivo
22. O sistema deve permitir upload de fotos da galeria
23. O sistema deve comprimir automaticamente fotos para máximo 2MB
24. O sistema deve exibir preview das fotos antes do upload
25. O sistema deve organizar fotos automaticamente por seção
26. O sistema deve armazenar fotos com estrutura `/formularios/{formulario_id}/{secao}/`
27. O sistema deve associar metadados das fotos com resposta e seção específica

### 4.4 Funcionalidades Gerais
28. O sistema deve enviar confirmação de envio bem-sucedido ao técnico
29. O sistema deve utilizar tokens criptograficamente seguros
30. O sistema deve validar e sanitizar todos os inputs
31. O sistema deve utilizar comunicação HTTPS obrigatoriamente
32. O sistema deve disponibilizar relatórios finais para download após resposta

## 5. Não Objetivos (Fora do Escopo)

- **Funcionalidade offline**: O sistema não funcionará sem conexão à internet
- **Escalabilidade massiva**: Não é necessário suportar centenas de usuários simultâneos
- **Integração com sistemas externos**: Não haverá integração com outros sistemas corporativos
- **Cadastro de usuários**: Técnicos não precisarão se cadastrar ou fazer login
- **Versionamento de formulários**: Não haverá controle de versões dos formulários
- **Notificações automáticas**: Não enviará emails ou SMS automaticamente
- **Análise avançada de dados**: Não incluirá dashboards analíticos complexos

## 6. Considerações de Design

### Interface Mobile-First
- Design otimizado para dispositivos móveis (smartphones)
- Botões grandes e acessíveis para uso com luvas
- Interface limpa e intuitiva para uso em campo
- Progressão clara entre seções do formulário

### Usabilidade
- Navegação simples entre seções
- Validação em tempo real dos campos obrigatórios
- Feedback visual claro para ações do usuário
- Interface de upload de fotos intuitiva

### Acessibilidade
- Contraste adequado para uso em diferentes condições de luz
- Textos legíveis em telas pequenas
- Elementos touch adequados para uso com luvas

## 7. Considerações Técnicas

### Backend
- **Supabase**: Banco de dados PostgreSQL com autenticação e APIs automáticas
- **Supabase Storage**: Armazenamento de fotos com bucket público

### Frontend
- **Framework**: React 18 com TypeScript para desenvolvimento robusto e tipado
- **UI Components**: shadcn/ui para componentes acessíveis e customizáveis
- **Styling**: Tailwind CSS para estilização utilitária e responsiva
- **Build Tool**: Vite para desenvolvimento rápido e build otimizado
- **State Management**: Zustand ou React Query para gerenciamento de estado
- **Form Handling**: React Hook Form com Zod para validação de formulários
- **Responsividade**: Design mobile-first com breakpoints otimizados
- **Deploy**: Vercel para hospedagem do frontend React

### Hospedagem
- **Deploy**: Vercel para frontend React e backend Python

### Segurança
- Tokens únicos para cada formulário
- Validação e sanitização de dados
- Expiração automática de links

## 8. Métricas de Sucesso

### Métricas Primárias
- **100%** dos relatórios finais devem conter fotos integradas
- **Redução para zero** do envio de fotos por email separadamente
- **Tempo de preenchimento** inferior a 15 minutos por formulário

### Métricas Secundárias
- **Taxa de conclusão** de formulários superior a 95%
- **Satisfação dos técnicos** com a nova interface
- **Tempo de processamento** de relatórios reduzido em 50%

### Indicadores Técnicos
- **Disponibilidade** do sistema superior a 99%
- **Tempo de carregamento** inferior a 3 segundos
- **Upload de fotos** bem-sucedido em mais de 98% das tentativas

## 9. Questões em Aberto

### Definições Pendentes
- Definir período de retenção dos dados no sistema
- Estabelecer processo de backup dos formulários e fotos
- Determinar perfis de acesso ao painel administrativo

### Validações Necessárias
- Testar interface com técnicos em condições reais de campo
- Validar qualidade das fotos comprimidas para relatórios
- Confirmar compatibilidade com diferentes modelos de smartphones

### Aspectos Técnicos
- Definir estratégia de versionamento da aplicação
- Estabelecer processo de monitoramento e logs
- Confirmar limites de armazenamento no Supabase

---

**Nota:** Este PRD foi criado para orientar desenvolvedores júnior na implementação completa do sistema, fornecendo todos os detalhes necessários para substituir adequadamente o atual processo de formulários Microsoft Forms sem capacidade de anexo de fotos. 