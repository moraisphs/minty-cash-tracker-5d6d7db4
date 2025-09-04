import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, User } from "lucide-react";
import { DashboardCard } from "@/components/financial/DashboardCard";
import { FinancialCharts } from "@/components/financial/FinancialCharts";
import { TransactionList } from "@/components/financial/TransactionList";
import { FilterTabs } from "@/components/financial/FilterTabs";
import { AddTransactionDialog } from "@/components/financial/AddTransactionDialog";
import { PDFReportGenerator } from "@/components/financial/PDFReportGenerator";
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useIndexedDB } from "@/hooks/useIndexedDB";

export default function Dashboard() {
  const [period, setPeriod] = useState("month");
  const { toast } = useToast();
  const { 
    transactions, 
    categories, 
    loading, 
    addTransaction, 
    editTransaction,
    deleteTransaction,
    addCategory,
    deleteCategory,
    getBalance, 
    getTransactionsByPeriod
  } = useIndexedDB();


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-primary/5">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  const { income, expenses, balance } = getBalance();
  const periodTransactions = getTransactionsByPeriod(period);
  
  const periodIncome = periodTransactions
    .filter((t) => t.tipo === "entrada")
    .reduce((sum, t) => sum + t.valor, 0);
  
  const periodExpenses = periodTransactions
    .filter((t) => t.tipo === "saida")
    .reduce((sum, t) => sum + t.valor, 0);

  // Wrapper functions para compatibilidade de tipos
  const handleEditTransaction = async (transactionId: number, data: {
    description: string;
    amount: number;
    type: 'income' | 'expense';
    transaction_date: string;
    category_id: string;
    tags?: string[];
    notes?: string;
  }) => {
    return await editTransaction(transactionId, data);
  };

  const handleDeleteTransaction = async (transactionId: number) => {
    return await deleteTransaction(transactionId);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-accent/5 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              My Cash
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Bem-vindo ao seu controle financeiro pessoal!
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <PDFReportGenerator 
              transactions={transactions}
              getTransactionsByPeriod={getTransactionsByPeriod}
            />

            <AddTransactionDialog 
              categories={categories}
              onAddTransaction={addTransaction}
              onAddCategory={addCategory}
              onDeleteCategory={deleteCategory}
            >
              <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden xs:inline">Adicionar Transação</span>
                <span className="xs:hidden">Adicionar</span>
              </Button>
            </AddTransactionDialog>
          </div>
        </div>


        {/* Welcome Section & Period Filter */}
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold">Visão Geral Financeira</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Acompanhe seus gastos e receitas</p>
          </div>
          <div className="max-w-md mx-auto px-4">
            <FilterTabs value={period} onValueChange={setPeriod} />
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <DashboardCard
            title="Saldo Atual"
            value={`R$ ${balance.toFixed(2)}`}
            icon={Wallet}
            trend={{ 
              value: balance >= 0 ? "Positivo" : "Negativo", 
              isPositive: balance >= 0 
            }}
          />
          <DashboardCard
            title="Receitas"
            value={`R$ ${periodIncome.toFixed(2)}`}
            icon={TrendingUp}
            variant="income"
            trend={{ 
              value: `Período atual`, 
              isPositive: true 
            }}
          />
          <DashboardCard
            title="Despesas"
            value={`R$ ${periodExpenses.toFixed(2)}`}
            icon={TrendingDown}
            variant="expense"
            trend={{ 
              value: `Período atual`, 
              isPositive: false 
            }}
          />
          <DashboardCard
            title="Economia"
            value={`R$ ${(periodIncome - periodExpenses).toFixed(2)}`}
            icon={PiggyBank}
            trend={{ 
              value: periodIncome > periodExpenses ? "Poupando" : "Gastando", 
              isPositive: periodIncome > periodExpenses 
            }}
          />
        </div>

        {/* Charts */}
        <FinancialCharts transactions={periodTransactions} />

        {/* Recent Transactions */}
        <TransactionList 
          transactions={transactions} 
          loading={loading}
          categories={categories}
          onEditTransaction={handleEditTransaction}
          onDeleteTransaction={handleDeleteTransaction}
        />
      </div>
    </div>
  );
}