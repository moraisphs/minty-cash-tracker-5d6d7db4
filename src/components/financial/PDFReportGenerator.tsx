import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FileText, Download, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Transacao } from "@/lib/db";

interface PDFReportGeneratorProps {
  transactions: Transacao[];
  getTransactionsByPeriod: (period: string) => Transacao[];
}

export function PDFReportGenerator({ transactions, getTransactionsByPeriod }: PDFReportGeneratorProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const generatePDF = async (period: string) => {
    setLoading(period);
    
    try {
      // Validar se os dados estão carregados
      if (!transactions || !Array.isArray(transactions)) {
        throw new Error('Dados de transações não carregados');
      }

      const periodTransactions = getTransactionsByPeriod(period);
      
      if (!periodTransactions || !Array.isArray(periodTransactions)) {
        throw new Error('Erro ao carregar transações do período');
      }

      const doc = new jsPDF();
      
      // Configurações do documento
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      
      // Título
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Relatório Financeiro", margin, 30);
      
      // Período
      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      const periodText = getPeriodText(period);
      doc.text(`Período: ${periodText}`, margin, 45);
      
      // Data de geração
      doc.setFontSize(10);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, margin, 55);
      
      // Resumo financeiro
      const summary = calculateSummary(periodTransactions);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Resumo Financeiro", margin, 75);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Total de Receitas: R$ ${summary.totalIncome.toFixed(2)}`, margin, 85);
      doc.text(`Total de Despesas: R$ ${summary.totalExpenses.toFixed(2)}`, margin, 95);
      doc.text(`Saldo: R$ ${summary.balance.toFixed(2)}`, margin, 105);
      doc.text(`Número de Transações: ${periodTransactions.length}`, margin, 115);
      
      // Tabela de transações
      if (periodTransactions.length > 0) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Transações", margin, 135);
        
        const tableData = periodTransactions.map(transaction => [
          transaction?.data ? new Date(transaction.data).toLocaleDateString('pt-BR') : '',
          transaction?.descricao || '',
          transaction?.categoria || 'Outros',
          transaction?.tipo === 'entrada' ? 'Receita' : 'Despesa',
          `R$ ${(transaction?.valor ?? 0).toFixed(2)}`
        ]);
        
        autoTable(doc, {
          startY: 145,
          head: [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']],
          body: tableData,
          styles: {
            fontSize: 8,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: [59, 130, 246], // blue-500
            textColor: 255,
            fontStyle: 'bold',
          },
          alternateRowStyles: {
            fillColor: [248, 250, 252], // gray-50
          },
          columnStyles: {
            4: { halign: 'right' }, // Alinhar valores à direita
          },
        });
      } else {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Nenhuma transação encontrada para este período.", margin, 145);
      }
      
      // Gráfico de categorias (se houver transações)
      if (periodTransactions.length > 0) {
        const categoryData = getCategoryData(periodTransactions);
        const chartY = 145 + (periodTransactions.length * 8) + 40; // Posição aproximada após a tabela
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Gastos por Categoria", margin, chartY);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        let yPos = chartY + 10;
        
        categoryData.forEach((category, index) => {
          if (yPos > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.text(`${category.name}: R$ ${category.amount.toFixed(2)} (${category.percentage.toFixed(1)}%)`, margin, yPos);
          yPos += 8;
        });
      }
      
      // Rodapé
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(
          `Página ${i} de ${pageCount}`,
          pageWidth - 30,
          doc.internal.pageSize.getHeight() - 10
        );
      }
      
      // Download do arquivo
      const fileName = `relatorio-financeiro-${period}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setLoading(null);
    }
  };

  const getPeriodText = (period: string): string => {
    const now = new Date();
    switch (period) {
      case 'week':
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return `Semana (${weekStart.toLocaleDateString('pt-BR')} - ${now.toLocaleDateString('pt-BR')})`;
      case 'month':
        return `Mês de ${now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3) + 1;
        return `${quarter}º Trimestre de ${now.getFullYear()}`;
      case 'year':
        return `Ano de ${now.getFullYear()}`;
      default:
        return 'Período personalizado';
    }
  };

  const calculateSummary = (transactions: Transacao[]) => {
    if (!transactions || !Array.isArray(transactions)) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
      };
    }

    const totalIncome = transactions
      .filter(t => t?.tipo === 'entrada')
      .reduce((sum, t) => sum + (t?.valor ?? 0), 0);
    
    const totalExpenses = transactions
      .filter(t => t?.tipo === 'saida')
      .reduce((sum, t) => sum + (t?.valor ?? 0), 0);
    
    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
    };
  };

  const getCategoryData = (transactions: Transacao[]) => {
    if (!transactions || !Array.isArray(transactions)) {
      return [];
    }

    const categoryMap = new Map<string, number>();
    
    transactions.forEach(transaction => {
      if (transaction?.valor && transaction?.categoria) {
        const category = transaction.categoria || 'Outros';
        const current = categoryMap.get(category) || 0;
        categoryMap.set(category, current + (transaction.valor ?? 0));
      }
    });
    
    const total = Array.from(categoryMap.values()).reduce((sum, amount) => sum + amount, 0);
    
    if (total === 0) {
      return [];
    }
    
    return Array.from(categoryMap.entries())
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: (amount / total) * 100
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 w-full sm:w-auto"
          disabled={loading !== null}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          <span className="hidden xs:inline">{loading ? 'Gerando...' : 'Gerar PDF'}</span>
          <span className="xs:hidden">{loading ? '...' : 'PDF'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => generatePDF('week')} disabled={loading !== null}>
          <Download className="mr-2 h-4 w-4" />
          Relatório Semanal
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => generatePDF('month')} disabled={loading !== null}>
          <Download className="mr-2 h-4 w-4" />
          Relatório Mensal
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => generatePDF('quarter')} disabled={loading !== null}>
          <Download className="mr-2 h-4 w-4" />
          Relatório Trimestral
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => generatePDF('year')} disabled={loading !== null}>
          <Download className="mr-2 h-4 w-4" />
          Relatório Anual
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
