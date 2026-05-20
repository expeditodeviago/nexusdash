import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ExportOptions {
  element: HTMLElement;
  logo: string | null;
  totalRegistros: number;
  darkMode: boolean;
}

export const exportDashboardToPDF = async ({ element, logo, totalRegistros, darkMode }: ExportOptions) => {
  try {
    // Captura o container original e prepara para o clone
    const originalWidth = element.scrollWidth;
    const originalHeight = element.scrollHeight;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: darkMode ? '#020617' : '#f8fafc',
      windowWidth: originalWidth,
      windowHeight: originalHeight,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(element.id);
        if (clonedElement) {
          // Forçar um layout vertical limpo para o PDF
          clonedElement.style.display = 'flex';
          clonedElement.style.flexDirection = 'column';
          clonedElement.style.gap = '40px';
          clonedElement.style.padding = '40px';
          clonedElement.style.height = 'auto';
          clonedElement.style.width = '1200px'; // Largura fixa para consistência no PDF
          clonedElement.style.overflow = 'visible';
          
          // Se o container usar Grid, transformamos em bloco para empilhar
          const grid = clonedElement.querySelector('.grid');
          if (grid instanceof HTMLElement) {
            grid.style.display = 'flex';
            grid.style.flexDirection = 'column';
            grid.style.gap = '30px';
            grid.style.width = '100%';
          }

          // Ajustar todos os cards para largura total
          const cards = clonedElement.querySelectorAll('[id^="chart-card-"]');
          cards.forEach((card) => {
            if (card instanceof HTMLElement) {
              card.style.width = '100%';
              card.style.height = '500px';
              card.style.marginBottom = '20px';
              card.style.breakInside = 'avoid';
              card.style.boxShadow = 'none';
              card.style.border = '1px solid #e2e8f0';
            }
          });
        }
      }
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    let yPos = 15;

    // Cabeçalho Executivo
    if (logo) {
      pdf.addImage(logo, 'PNG', 15, yPos, 30, 15);
      yPos += 20;
    }

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.setTextColor(22, 211, 238); // Ciano Nexus
    pdf.text("NEXUSDASH", 15, yPos);
    
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text("RELATÓRIO DE BUSINESS INTELLIGENCE", 15, yPos + 7);
    yPos += 25;

    // Informações da Análise
    pdf.setFontSize(10);
    pdf.setTextColor(80, 80, 80);
    pdf.text(`TOTAL DE REGISTROS: ${totalRegistros.toLocaleString('pt-BR')}`, 15, yPos);
    pdf.text(`EMISSÃO: ${new Date().toLocaleString('pt-BR')}`, pdfWidth - 70, yPos);
    yPos += 10;

    // Linha de Separação
    pdf.setDrawColor(22, 211, 238);
    pdf.setLineWidth(0.5);
    pdf.line(15, yPos, pdfWidth - 15, yPos);
    yPos += 15;

    // Adição da Imagem do Dashboard com suporte a múltiplas páginas se necessário
    const imgWidth = pdfWidth - 30;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Se a altura for maior que o espaço restante na página, podemos precisar de lógica de quebra
    // Mas para dashboards capturados como uma única imagem longa, vamos escalar ou quebrar em partes.
    // Lógica simplificada: se for muito longo, jsPDF permite adicionar mais páginas e "cortar" a imagem.
    
    let heightLeft = imgHeight;
    let position = yPos;

    // Primeira página
    pdf.addImage(imgData, 'PNG', 15, position, imgWidth, imgHeight);
    
    // Se quiser suporte real a multipáginas (opcional, mas recomendado para dashboards longos):
    /*
    while (heightLeft > 0) {
      pdf.addImage(imgData, 'PNG', 15, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 20);
      position -= (pdfHeight - 20);
      if (heightLeft > 0) {
        pdf.addPage();
      }
    }
    */

    pdf.save(`NexusDash_BI_Report_${Date.now()}.pdf`);
    return true;
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    throw error;
  }
};
