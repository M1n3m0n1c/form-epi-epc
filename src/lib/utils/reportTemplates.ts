import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import type { DadosRelatorio } from './reportGenerator';

export interface TemplateConfig {
  primaryColor: [number, number, number];
  secondaryColor: [number, number, number];
  accentColor: [number, number, number];
  logoText: string;
  companyName: string;
  reportTitle: string;
}

export const TEMPLATES = {
  TELEFONICA: {
    primaryColor: [0, 102, 204] as [number, number, number],
    secondaryColor: [240, 248, 255] as [number, number, number],
    accentColor: [0, 82, 164] as [number, number, number],
    logoText: 'TELEFÔNICA',
    companyName: 'Telefônica Brasil S.A.',
    reportTitle: 'RELATÓRIO DE INSPEÇÃO EPI/EPC'
  },
  GENERIC: {
    primaryColor: [52, 73, 94] as [number, number, number],
    secondaryColor: [236, 240, 241] as [number, number, number],
    accentColor: [41, 128, 185] as [number, number, number],
    logoText: 'EMPRESA',
    companyName: 'Nome da Empresa',
    reportTitle: 'RELATÓRIO DE INSPEÇÃO EPI/EPC'
  }
} as const;

export class ProfessionalTemplate {
  private doc: jsPDF;
  private config: TemplateConfig;
  private pageHeight: number;
  private pageWidth: number;
  private margin: number;

  constructor(doc: jsPDF, template: keyof typeof TEMPLATES = 'TELEFONICA') {
    this.doc = doc;
    this.config = TEMPLATES[template];
    this.pageHeight = doc.internal.pageSize.height;
    this.pageWidth = doc.internal.pageSize.width;
    this.margin = 20;
  }

  public addProfessionalHeader(dados: DadosRelatorio): void {
    // Fundo do cabeçalho
    this.doc.setFillColor(...this.config.primaryColor);
    this.doc.rect(0, 0, this.pageWidth, 35, 'F');

    // Logo/Marca da empresa
    this.doc.setFillColor(...this.config.accentColor);
    this.doc.roundedRect(this.margin, 8, 60, 18, 2, 2, 'F');

    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(this.config.logoText, this.margin + 30, 19, { align: 'center' });

    // Título do relatório
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(this.config.reportTitle, this.pageWidth / 2, 18, { align: 'center' });

    // Informações do documento
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    const dataGeracao = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    this.doc.text(`Gerado em: ${dataGeracao}`, this.pageWidth - this.margin, 12, { align: 'right' });
    this.doc.text(`Documento: ${dados.formulario.token}`, this.pageWidth - this.margin, 20, { align: 'right' });

    // Linha decorativa
    this.doc.setDrawColor(...this.config.accentColor);
    this.doc.setLineWidth(2);
    this.doc.line(this.margin, 40, this.pageWidth - this.margin, 40);

    // Reset colors
    this.doc.setTextColor(0, 0, 0);
  }

  public addSectionHeader(title: string, currentY: number): number {
    // Fundo da seção
    this.doc.setFillColor(...this.config.secondaryColor);
    this.doc.rect(this.margin - 5, currentY - 2, this.pageWidth - (this.margin * 2) + 10, 12, 'F');

    // Borda lateral colorida
    this.doc.setFillColor(...this.config.primaryColor);
    this.doc.rect(this.margin - 5, currentY - 2, 4, 12, 'F');

    // Título da seção
    this.doc.setTextColor(...this.config.primaryColor);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin + 5, currentY + 6);

    // Reset colors
    this.doc.setTextColor(0, 0, 0);

    return currentY + 18;
  }

  public addInfoBox(title: string, content: string[], currentY: number): number {
    const boxHeight = (content.length * 6) + 12;

    // Fundo da caixa
    this.doc.setFillColor(250, 250, 250);
    this.doc.rect(this.margin, currentY, this.pageWidth - (this.margin * 2), boxHeight, 'F');

    // Borda
    this.doc.setDrawColor(200, 200, 200);
    this.doc.rect(this.margin, currentY, this.pageWidth - (this.margin * 2), boxHeight);

    // Cabeçalho da caixa
    this.doc.setFillColor(...this.config.primaryColor);
    this.doc.rect(this.margin, currentY, this.pageWidth - (this.margin * 2), 8, 'F');

    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin + 3, currentY + 5);

    // Conteúdo
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);

    let y = currentY + 14;
    for (const line of content) {
      this.doc.text(line, this.margin + 3, y);
      y += 6;
    }

    return currentY + boxHeight + 8;
  }

  public addStatusBadge(status: 'CONFORME' | 'NAO_CONFORME' | 'ATENCAO', x: number, y: number): void {
    const badges = {
      CONFORME: {
        color: [34, 197, 94] as [number, number, number],
        text: '✓ CONFORME',
        textColor: [255, 255, 255] as [number, number, number]
      },
      NAO_CONFORME: {
        color: [239, 68, 68] as [number, number, number],
        text: '✗ NÃO CONFORME',
        textColor: [255, 255, 255] as [number, number, number]
      },
      ATENCAO: {
        color: [245, 158, 11] as [number, number, number],
        text: '⚠ ATENÇÃO',
        textColor: [255, 255, 255] as [number, number, number]
      }
    };

    const badge = badges[status];

    // Fundo do badge
    this.doc.setFillColor(...badge.color);
    this.doc.roundedRect(x, y, 35, 8, 2, 2, 'F');

    // Texto do badge
    this.doc.setTextColor(...badge.textColor);
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(badge.text, x + 17.5, y + 5, { align: 'center' });

    // Reset colors
    this.doc.setTextColor(0, 0, 0);
  }

  public addFooter(pageNumber: number, totalPages: number): void {
    // Linha superior
    this.doc.setDrawColor(...this.config.primaryColor);
    this.doc.setLineWidth(1);
    this.doc.line(this.margin, this.pageHeight - 20, this.pageWidth - this.margin, this.pageHeight - 20);

    // Informações do rodapé
    this.doc.setTextColor(100, 100, 100);
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');

    // Lado esquerdo - Nome da empresa
    this.doc.text(this.config.companyName, this.margin, this.pageHeight - 12);

    // Centro - Texto de geração automática
    this.doc.text(
      'Relatório gerado automaticamente pelo Sistema EPI/EPC',
      this.pageWidth / 2,
      this.pageHeight - 12,
      { align: 'center' }
    );

    // Lado direito - Numeração
    this.doc.text(
      `Página ${pageNumber} de ${totalPages}`,
      this.pageWidth - this.margin,
      this.pageHeight - 12,
      { align: 'right' }
    );

    // Reset colors
    this.doc.setTextColor(0, 0, 0);
  }

  public addWatermark(): void {
    // Marca d'água sutil
    this.doc.setTextColor(240, 240, 240);
    this.doc.setFontSize(60);
    this.doc.setFont('helvetica', 'bold');

    // Rotacionar texto
    this.doc.text(
      'CONFIDENCIAL',
      this.pageWidth / 2,
      this.pageHeight / 2,
      {
        align: 'center',
        angle: 45
      }
    );

    // Reset colors
    this.doc.setTextColor(0, 0, 0);
  }

  public addImageFrame(x: number, y: number, width: number, height: number, caption?: string): number {
    // Moldura da imagem
    this.doc.setDrawColor(200, 200, 200);
    this.doc.setLineWidth(1);
    this.doc.rect(x, y, width, height);

    // Fundo cinza claro
    this.doc.setFillColor(248, 248, 248);
    this.doc.rect(x + 1, y + 1, width - 2, height - 2, 'F');

    let finalY = y + height;

    // Caption se fornecido
    if (caption) {
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'italic');
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(caption, x, y + height + 8);
      finalY += 12;
    }

    // Reset colors
    this.doc.setTextColor(0, 0, 0);

    return finalY;
  }

  public addSummaryTable(data: Array<{label: string, value: string, status?: 'good' | 'warning' | 'error'}>, currentY: number): number {
    const rowHeight = 8;
    const tableHeight = (data.length + 1) * rowHeight;

    // Cabeçalho da tabela
    this.doc.setFillColor(...this.config.primaryColor);
    this.doc.rect(this.margin, currentY, this.pageWidth - (this.margin * 2), rowHeight, 'F');

    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Item', this.margin + 3, currentY + 5);
    this.doc.text('Status', this.pageWidth - this.margin - 30, currentY + 5);

    // Linhas da tabela
    let y = currentY + rowHeight;
    for (let i = 0; i < data.length; i++) {
      const item = data[i];

      // Cor de fundo alternada
      if (i % 2 === 0) {
        this.doc.setFillColor(248, 248, 248);
        this.doc.rect(this.margin, y, this.pageWidth - (this.margin * 2), rowHeight, 'F');
      }

      // Borda
      this.doc.setDrawColor(220, 220, 220);
      this.doc.rect(this.margin, y, this.pageWidth - (this.margin * 2), rowHeight);

      // Conteúdo
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(item.label, this.margin + 3, y + 5);

      // Status com cor
      if (item.status) {
        const colors = {
          good: [34, 197, 94],
          warning: [245, 158, 11],
          error: [239, 68, 68]
        };
        this.doc.setTextColor(...(colors[item.status] as [number, number, number]));
      }

      this.doc.text(item.value, this.pageWidth - this.margin - 30, y + 5);
      this.doc.setTextColor(0, 0, 0);

      y += rowHeight;
    }

    return currentY + tableHeight + 10;
  }
}

export const createProfessionalTemplate = (doc: jsPDF, template: keyof typeof TEMPLATES = 'TELEFONICA'): ProfessionalTemplate => {
  return new ProfessionalTemplate(doc, template);
};
