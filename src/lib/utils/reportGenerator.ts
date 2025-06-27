import type { Tables } from '@/lib/supabase/database.types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';

type Formulario = Tables<'formularios'>;
type Resposta = Tables<'respostas'>;
type Foto = Tables<'fotos'>;

export interface RespostaCompleta extends Resposta {
  fotos: Foto[];
}

export interface DadosRelatorio {
  formulario: Formulario;
  resposta: RespostaCompleta;
}

export class ReportGenerator {
  private doc: jsPDF;
  private pageHeight: number;
  private pageWidth: number;
  private currentY: number;
  private margin: number;
  private lineHeight: number;

  constructor() {
    this.doc = new jsPDF();
    this.pageHeight = this.doc.internal.pageSize.height;
    this.pageWidth = this.doc.internal.pageSize.width;
    this.currentY = 20;
    this.margin = 20;
    this.lineHeight = 7;
  }

  private checkPageBreak(requiredSpace: number = 20): void {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  private addTitle(text: string, fontSize: number = 16): void {
    this.checkPageBreak(15);
    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(text, this.margin, this.currentY);
    this.currentY += this.lineHeight + 5;
  }

  private addSubtitle(text: string, fontSize: number = 12): void {
    this.checkPageBreak(12);
    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(text, this.margin, this.currentY);
    this.currentY += this.lineHeight + 2;
  }

  private addText(text: string, fontSize: number = 10, isBold: boolean = false): void {
    this.checkPageBreak(8);
    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', isBold ? 'bold' : 'normal');

    // Quebra texto em múltiplas linhas se necessário
    const maxWidth = this.pageWidth - (this.margin * 2);
    const lines = this.doc.splitTextToSize(text, maxWidth);

    for (const line of lines) {
      this.checkPageBreak(8);
      this.doc.text(line, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    }
  }



  private formatBoolean(valor: boolean | null): string {
    if (valor === null) return 'N/A';
    return valor ? '✓ Sim' : '✗ Não';
  }

  private addSeparator(): void {
    this.checkPageBreak(10);
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 10;
  }

  private async addImage(imageUrl: string, caption: string, maxWidth: number = 120, maxHeight: number = 90): Promise<void> {
    try {
      // Converter URL para base64
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const base64 = await this.blobToBase64(blob);

      this.checkPageBreak(maxHeight + 15);

      // Adicionar imagem
      const imgProps = this.doc.getImageProperties(base64);
      const imgWidth = Math.min(maxWidth, imgProps.width * 0.1);
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      const finalHeight = Math.min(imgHeight, maxHeight);
      const finalWidth = (imgWidth * finalHeight) / imgHeight;

      this.doc.addImage(base64, 'JPEG', this.margin, this.currentY, finalWidth, finalHeight);

      // Adicionar legenda
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'italic');
      this.doc.text(caption, this.margin, this.currentY + finalHeight + 5);

      this.currentY += finalHeight + 12;
    } catch (error) {
      console.error('Erro ao adicionar imagem:', error);
      // Adicionar placeholder se falhar
      this.addText(`[Erro ao carregar imagem: ${caption}]`, 8, true);
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private addHeader(): void {
    // Logo da Telefônica e nome do sistema na mesma linha
    this.doc.setFillColor(0, 102, 204);
    this.doc.rect(this.margin, 10, 50, 15, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('TELEFONICA', this.margin + 2, 20);

    // Nome do sistema ao lado do logo
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('SISTEMA DE INSPEÇÃO EPI/EPC', this.margin + 55, 20);

    this.currentY = 35;
  }

    private addFormularioInfo(dados: DadosRelatorio): void {
    // Título principal do relatório
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('RELATÓRIO DE INSPEÇÃO EPI/EPC', this.pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += 20;

    // Criar tabela de informações principais
    this.addInformationTable(dados);

    this.currentY += 10;
    this.addSeparator();
  }

  private addInformationTable(dados: DadosRelatorio): void {
    const startY = this.currentY;
    const tableWidth = this.pageWidth - (this.margin * 2);
    const colWidth = tableWidth / 2;

    // Configurar estilo da tabela
    this.doc.setFontSize(10);
    this.doc.setLineWidth(0.5);
    this.doc.setDrawColor(100, 100, 100);

    let rowY = startY;
    const rowHeight = 8;

    // Função para adicionar linha da tabela
    const addTableRow = (label: string, value: string, isHeader: boolean = false) => {
      // Desenhar bordas
      this.doc.rect(this.margin, rowY, colWidth, rowHeight);
      this.doc.rect(this.margin + colWidth, rowY, colWidth, rowHeight);

      // Configurar fonte
      if (isHeader) {
        this.doc.setFont('helvetica', 'bold');
        this.doc.setFillColor(240, 240, 240);
        this.doc.rect(this.margin, rowY, tableWidth, rowHeight, 'F');
      } else {
        this.doc.setFont('helvetica', 'normal');
      }

      // Adicionar texto
      this.doc.text(label, this.margin + 2, rowY + 5);
      this.doc.text(value, this.margin + colWidth + 2, rowY + 5);

      rowY += rowHeight;
    };

    // Dados de criação e inspeção
    if (dados.formulario.created_at) {
      const dataCriacao = format(new Date(dados.formulario.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR });
      addTableRow('Data de Criação:', dataCriacao);
    }

    if (dados.formulario.data_resposta) {
      const dataResposta = format(new Date(dados.formulario.data_resposta), 'dd/MM/yyyy HH:mm', { locale: ptBR });
      addTableRow('Data da Inspeção:', dataResposta);
    }

    // Regional e empresa
    addTableRow('Regional/UF:', dados.resposta.regional || 'N/A');
    addTableRow('Empresa:', dados.resposta.empresa || 'N/A');

    // Seção do Inspecionador
    addTableRow('DADOS DO INSPECIONADOR', '', true);
    addTableRow('Nome:', dados.resposta.responsavel_nome || 'N/A');
    addTableRow('CPF:', dados.resposta.responsavel_cpf || 'N/A');
    addTableRow('Função:', dados.resposta.responsavel_funcao || 'N/A');

    // Seção do Inspecionado
    addTableRow('DADOS DO INSPECIONADO', '', true);
    addTableRow('Nome:', dados.resposta.inspecionado_nome || 'N/A');
    addTableRow('CPF:', dados.resposta.inspecionado_cpf || 'N/A');
    addTableRow('Função:', dados.resposta.inspecionado_funcao || 'N/A');

    // Data de geração
    const dataGeracao = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    addTableRow('Relatório Gerado em:', dataGeracao);

    this.currentY = rowY + 5;
  }

  private addTechnicalTable(items: [string, string][]): void {
    const startY = this.currentY;
    const tableWidth = this.pageWidth - (this.margin * 2);
    const colWidth = tableWidth / 2;

    // Configurar estilo da tabela
    this.doc.setFontSize(10);
    this.doc.setLineWidth(0.3);
    this.doc.setDrawColor(150, 150, 150);

    let rowY = startY;
    const rowHeight = 7;

    items.forEach(([label, value]) => {
      this.checkPageBreak(rowHeight + 2);

      // Desenhar bordas
      this.doc.rect(this.margin, rowY, colWidth, rowHeight);
      this.doc.rect(this.margin + colWidth, rowY, colWidth, rowHeight);

      // Configurar fonte
      this.doc.setFont('helvetica', 'normal');

      // Adicionar texto
      this.doc.text(label, this.margin + 2, rowY + 4.5);

      // Colorir status
      if (value.includes('✓')) {
        this.doc.setTextColor(0, 128, 0); // Verde
      } else if (value.includes('✗')) {
        this.doc.setTextColor(200, 0, 0); // Vermelho
      }

      this.doc.text(value, this.margin + colWidth + 2, rowY + 4.5);
      this.doc.setTextColor(0, 0, 0); // Volta para preto

      rowY += rowHeight;
    });

    this.currentY = rowY + 3;
  }

  private addFooter(pageNumber: number): void {
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(
      `Relatório gerado automaticamente - Página ${pageNumber}`,
      this.pageWidth / 2,
      this.pageHeight - 10,
      { align: 'center' }
    );
  }



  private addEpiBasicoSection(dados: DadosRelatorio): void {
    this.addTitle('3. EPI BÁSICO');

    this.addTechnicalTable([
      ['Capacete', this.formatBoolean(dados.resposta.epi_capacete)],
      ['Óculos de Proteção', this.formatBoolean(dados.resposta.epi_oculos)],
      ['Protetor Auricular', this.formatBoolean(dados.resposta.epi_protetor_auricular)],
      ['Luvas', this.formatBoolean(dados.resposta.epi_luvas)],
      ['Calçado de Segurança', this.formatBoolean(dados.resposta.epi_calcado)],
      ['Vestimenta', this.formatBoolean(dados.resposta.epi_vestimenta)]
    ]);

    if (dados.resposta.observacoes_epi_basico) {
      this.addSubtitle('Observações:');
      this.addText(dados.resposta.observacoes_epi_basico, 10);
    }

    this.currentY += 5;
    this.addSeparator();
  }

  private addEpiAlturaSection(dados: DadosRelatorio): void {
    this.addTitle('4. EPI PARA TRABALHO EM ALTURA');

    if (dados.resposta.trabalho_altura) {
      this.addTechnicalTable([
        ['Cinto de Segurança', this.formatBoolean(dados.resposta.epi_cinto_seguranca)],
        ['Trava-quedas', this.formatBoolean(dados.resposta.epi_trava_quedas)],
        ['Talabarte', this.formatBoolean(dados.resposta.epi_talabarte)],
        ['Capacete com Jugular', this.formatBoolean(dados.resposta.epi_capacete_jugular)],
        ['Corda de Içamento', this.formatBoolean(dados.resposta.corda_icamento)],
        ['Ferramental', this.formatBoolean(dados.resposta.ferramental)]
      ]);

      if (dados.resposta.observacoes_epi_altura) {
        this.addSubtitle('Observações:');
        this.addText(dados.resposta.observacoes_epi_altura, 10);
      }
    } else {
      this.addText('✗ Não aplicável - Funcionário não executa trabalhos em altura', 10, true);
    }

    this.currentY += 5;
    this.addSeparator();
  }

  private addEpiEletricoSection(dados: DadosRelatorio): void {
    this.addTitle('5. EPI PARA TRABALHOS ELÉTRICOS');

    if (dados.resposta.trabalho_eletrico) {
      this.addTechnicalTable([
        ['Luvas Isolantes', this.formatBoolean(dados.resposta.epi_luvas_isolantes)],
        ['Calçado Isolante', this.formatBoolean(dados.resposta.epi_calcado_isolante)],
        ['Capacete Classe B', this.formatBoolean(dados.resposta.epi_capacete_classe_b)],
        ['Vestimenta Anti-arco', this.formatBoolean(dados.resposta.epi_vestimenta_antiarco)]
      ]);

      if (dados.resposta.observacoes_epi_eletrico) {
        this.addSubtitle('Observações:');
        this.addText(dados.resposta.observacoes_epi_eletrico, 10);
      }
    } else {
      this.addText('✗ Não aplicável - Funcionário não executa trabalhos elétricos', 10, true);
    }

    this.currentY += 5;
    this.addSeparator();
  }

  private addInspecaoGeralSection(dados: DadosRelatorio): void {
    this.addTitle('6. INSPEÇÃO GERAL');

    this.addTechnicalTable([
      ['Equipamentos Íntegros', this.formatBoolean(dados.resposta.equipamentos_integros)],
      ['Treinamento Adequado', this.formatBoolean(dados.resposta.treinamento_adequado)],
      ['Certificados Válidos', this.formatBoolean(dados.resposta.certificados_validos)],
      ['Reforço das Regras de Ouro', this.formatBoolean(dados.resposta.reforco_regras_ouro)],
      ['Declaração de Responsabilidade', this.formatBoolean(dados.resposta.declaracao_responsabilidade)]
    ]);

    if (dados.resposta.observacoes_inspecao) {
      this.addSubtitle('Observações da Inspeção:');
      this.addText(dados.resposta.observacoes_inspecao, 10);
    }

    this.currentY += 5;
    this.addSeparator();
  }

  private addConclusaoSection(dados: DadosRelatorio): void {
        this.addTitle('7. CONCLUSÃO E RESUMO EXECUTIVO');

    // Resumo executivo em formato de tabela
    this.addSubtitle('Resumo da Inspeção:');

    const totalFotos = dados.resposta.fotos.length;
    const trabalhoAltura = dados.resposta.trabalho_altura ? 'Sim' : 'Não';
    const trabalhoEletrico = dados.resposta.trabalho_eletrico ? 'Sim' : 'Não';

    // Análise de conformidade
    const itensBasicos = [
      dados.resposta.epi_capacete,
      dados.resposta.epi_oculos,
      dados.resposta.epi_protetor_auricular,
      dados.resposta.epi_luvas,
      dados.resposta.epi_calcado,
      dados.resposta.epi_vestimenta
    ];

    const conformeBasico = itensBasicos.filter(item => item === true).length;
    const totalBasico = itensBasicos.length;

    // Tabela de resumo
    this.addTechnicalTable([
      ['Total de Fotos Anexadas', totalFotos.toString()],
      ['Trabalho em Altura', trabalhoAltura],
      ['Trabalho Elétrico', trabalhoEletrico],
      ['Conformidade EPI Básico', `${conformeBasico}/${totalBasico} itens`]
    ]);

    this.currentY += 8;

    // Status geral baseado nos itens críticos
    const statusGeral = dados.resposta.equipamentos_integros &&
                       dados.resposta.treinamento_adequado &&
                       dados.resposta.certificados_validos;

    this.addSubtitle('Resultado Final:');
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    if (statusGeral) {
      this.doc.setTextColor(0, 128, 0); // Verde
      this.doc.text('✓ INSPEÇÃO APROVADA', this.margin, this.currentY);
    } else {
      this.doc.setTextColor(255, 140, 0); // Laranja
      this.doc.text('⚠ INSPEÇÃO REQUER ATENÇÃO', this.margin, this.currentY);
    }
    this.doc.setTextColor(0, 0, 0); // Volta para preto
    this.currentY += 15;

    if (!statusGeral) {
      this.addText('ATENÇÃO: Esta inspeção requer acompanhamento e correções antes da liberação para trabalho.', 10, true);
      this.currentY += 5;
    }

    // Observações gerais se houver
    if (dados.resposta.observacoes_gerais) {
      this.addSubtitle('Observações Gerais:');
      this.addText(dados.resposta.observacoes_gerais, 10);
      this.currentY += 5;
    }

    // Assinatura digital
    this.addSubtitle('Assinatura Digital:');
    this.addText(`Este relatório foi gerado automaticamente pelo sistema em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}.`, 9);
    this.addText('A veracidade das informações é de responsabilidade do inspecionador identificado neste documento.', 9);

    this.currentY += 5;
    this.addSeparator();
  }

  private async addFotosSection(dados: DadosRelatorio): Promise<void> {
    if (dados.resposta.fotos.length === 0) return;

    this.addTitle('8. REGISTRO FOTOGRÁFICO');

    // Agrupar fotos por seção
    const fotosPorSecao = dados.resposta.fotos.reduce((acc, foto) => {
      if (!acc[foto.secao]) {
        acc[foto.secao] = [];
      }
      acc[foto.secao].push(foto);
      return acc;
    }, {} as Record<string, Foto[]>);

    const secoes = {
      'identificacao': 'Identificação',
      'epi_basico': 'EPI Básico',
      'epi_altura': 'EPI para Trabalho em Altura',
      'epi_eletrico': 'EPI para Trabalhos Elétricos',
      'inspecao_geral': 'Inspeção Geral',
      'conclusao': 'Conclusão',
      'outros': 'Outras Fotos'
    };

    for (const [secaoKey, fotos] of Object.entries(fotosPorSecao)) {
      if (fotos.length === 0) continue;

      const nomeSecao = secoes[secaoKey as keyof typeof secoes] || secaoKey;
      this.addSubtitle(`${nomeSecao} (${fotos.length} foto${fotos.length > 1 ? 's' : ''})`);

      for (const foto of fotos) {
        const caption = `${foto.nome_arquivo} (${Math.round((foto.tamanho_bytes || 0) / 1024)} KB)`;
        await this.addImage(foto.url_storage, caption);
      }

      this.currentY += 5;
    }
  }



  public async generateReport(dados: DadosRelatorio): Promise<Blob> {
    try {
      // Cabeçalho com logo e nome do sistema
      this.addHeader();

      // Informações principais do formulário
      this.addFormularioInfo(dados);

      // Seções técnicas do relatório
      this.addEpiBasicoSection(dados);
      this.addEpiAlturaSection(dados);
      this.addEpiEletricoSection(dados);
      this.addInspecaoGeralSection(dados);
      this.addConclusaoSection(dados);

      // Fotos (se houver)
      await this.addFotosSection(dados);

      // Adicionar numeração de páginas
      const totalPages = this.doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        this.doc.setPage(i);
        this.addFooter(i);
      }

      // Retornar como blob
      return this.doc.output('blob');

    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      throw new Error('Falha na geração do relatório PDF');
    }
  }

  public async downloadReport(dados: DadosRelatorio, filename?: string): Promise<void> {
    const blob = await this.generateReport(dados);

    const defaultFilename = `relatorio-epi-${dados.resposta.inspecionado_nome.replace(/\s+/g, '-').toLowerCase()}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    const finalFilename = filename || defaultFilename;

    // Criar link de download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Função utilitária para uso fácil
export const generatePDFReport = async (dados: DadosRelatorio): Promise<Blob> => {
  const generator = new ReportGenerator();
  return await generator.generateReport(dados);
};

export const downloadPDFReport = async (dados: DadosRelatorio, filename?: string): Promise<void> => {
  const generator = new ReportGenerator();
  await generator.downloadReport(dados, filename);
};
