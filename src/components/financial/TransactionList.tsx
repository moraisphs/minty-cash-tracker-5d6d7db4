import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ShoppingBag, Car, Home, Gamepad2, Heart, BookOpen, Briefcase, PiggyBank, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Transacao } from "@/lib/db";

const categoryIcons = {
  "Alimentação": ShoppingBag,
  "Transporte": Car,
  "Moradia": Home,
  "Lazer": Gamepad2,
  "Saúde": Heart,
  "Educação": BookOpen,
  "Salário": TrendingUp,
  "Freelance": Briefcase,
  "Investimentos": PiggyBank,
  "Outros": Plus,
};

interface TransactionListProps {
  transactions: Transacao[];
  loading: boolean;
}

export function TransactionList({ transactions, loading }: TransactionListProps) {

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Últimas Transações</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  const recentTransactions = transactions.slice(0, 10);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Últimas Transações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhuma transação encontrada</p>
            <p className="text-sm">Adicione sua primeira transação para começar</p>
          </div>
        ) : (
          recentTransactions.map((transaction) => {
            const Icon = categoryIcons[transaction.categoria as keyof typeof categoryIcons] || TrendingUp;
            const isIncome = transaction.tipo === "entrada";
            
            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "p-2 rounded-full",
                    isIncome ? "bg-income-light" : "bg-expense-light"
                  )}>
                    {isIncome ? (
                      <TrendingUp className="h-4 w-4 text-income" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-expense" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.descricao}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {transaction.categoria || "Outros"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(transaction.data).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={cn(
                  "font-semibold text-lg",
                  isIncome ? "text-income" : "text-expense"
                )}>
                  {isIncome ? "+" : "-"}R$ {transaction.valor.toFixed(2)}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}