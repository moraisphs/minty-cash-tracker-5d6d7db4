import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, User, Download, Upload } from "lucide-react";
import { DashboardCard } from "@/components/financial/DashboardCard";
import { FinancialCharts } from "@/components/financial/FinancialCharts";
import { TransactionList } from "@/components/financial/TransactionList";
import { FilterTabs } from "@/components/financial/FilterTabs";
import { AddTransactionDialog } from "@/components/financial/AddTransactionDialog";
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
    addCategory,
    deleteCategory,
    getBalance, 
    getTransactionsByPeriod,
    exportData,
    importData
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
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
  
  const periodExpenses = periodTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-accent/5 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Minty Cash Tracker
            </h1>
            <p className="text-muted-foreground mt-1">
              Bem-vindo ao seu controle financeiro pessoal!
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={exportData}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  importData(file);
                  e.target.value = ''; // Reset input
                }
              }}
              className="hidden"
              id="import-file"
            />
            <Button 
              variant="outline" 
              onClick={() => document.getElementById('import-file')?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Importar
            </Button>

            <AddTransactionDialog 
              categories={categories}
              onAddTransaction={addTransaction}
              onAddCategory={addCategory}
              onDeleteCategory={deleteCategory}
            >
              <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Transação
              </Button>
            </AddTransactionDialog>
          </div>
        </div>


        {/* Welcome Section & Period Filter */}
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Visão Geral Financeira</h2>
            <p className="text-muted-foreground">Acompanhe seus gastos e receitas</p>
          </div>
          <div className="max-w-md mx-auto">
            <FilterTabs value={period} onValueChange={setPeriod} />
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <TransactionList transactions={transactions} loading={loading} />
      </div>
    </div>
  );
}