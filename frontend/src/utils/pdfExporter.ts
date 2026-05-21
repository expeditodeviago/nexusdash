import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ExportOptions {
  element: HTMLElement;
  logo: string | null;
  totalRegistros: number;
  darkMode: boolean;
}

export const exportDashboardToPDF = async ({ element, logo, totalRegistros, darkMode }: ExportOptions) => {
  // 1. Criar um CLONE do dashboard em uma div oculta com largura fixa para evitar distorção responsiva
  const clone = element.cloneNode(true) as HTMLElement;
  
  // Estilizar o clone para exportação perfeita
  Object.assign(clone.style, {
    position: 'fixed',
    top: '0',
    left: '-5000px', // Fora da tela
    width: '1200px', // Largura fixa ideal para PDF
    height: 'auto',
    padding: '40px',
    backgroundColor: darkMode ? '#020617' : '#f8fafc',
    color: darkMode ? '#f1f5f9' : '#0f172a',
    zIndex: '-1000'
  });

  // Ajustar todos os cards no clone para não serem flex/grid dinâmicos que quebram
  const cards = clone.querySelectorAll('[id^="chart-card-"]');
  cards.forEach((card: any) => {
    card.style.width = '100%';
    card.style.height = '500px';
    card.style.marginBottom = '30px';
    card.style.breakInside = 'avoid';
    
    // Forçar quebra de linha em títulos longos
    const title = card.querySelector('h4');
    if (title) {
      title.style.whiteSpace = 'normal';
      title.style.wordBreak = 'break-word';
      title.style.overflow = 'visible';
    }
  });

  document.body.appendChild(clone);

  try {
    const canvas = await html2canvas(clone, {
      scale: 2, // Alta qualidade
      useCORS: true,
      logging: false,
      backgroundColor: darkMode ? '#020617' : '#f8fafc',
      windowWidth: 1200
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'px',
      format: [canvas.width / 2, canvas.height / 2] // Ajustar tamanho do PDF ao conteúdo
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    // Adicionar Rodapé com Metadados
    pdf.setFontSize(10);
    pdf.setTextColor(darkMode ? 150 : 100);
    pdf.text(`Nexus Dash - Relatório Analítico | Registros: ${totalRegistros} | Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, pdfHeight - 20);

    pdf.save(`NexusDash_Relatorio_${Date.now()}.pdf`);
  } finally {
    document.body.removeChild(clone);
  }
};
