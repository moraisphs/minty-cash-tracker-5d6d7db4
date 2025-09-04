import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { TrendingUp, TrendingDown, ShoppingBag, Car, Home, Gamepad2, Heart, BookOpen, Briefcase, PiggyBank, Plus, MoreVertical, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Transacao } from "@/lib/db";
import { Category } from "@/hooks/useIndexedDB";
import { EditTransactionDialog } from "./EditTransactionDialog";

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
  categories: Category[];
  onEditTransaction: (transactionId: number, data: {
    description: string;
    amount: number;
    type: 'income' | 'expense';
    transaction_date: string;
    category_id: string;
    tags?: string[];
    notes?: string;
  }) => Promise<Transacao>;
  onDeleteTransaction: (transactionId: number) => Promise<boolean>;
}

export function TransactionList({ 
  transactions, 
  loading, 
  categories, 
  onEditTransaction, 
  onDeleteTransaction 
}: TransactionListProps) {
  const [editingTransaction, setEditingTransaction] = useState<Transacao | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transacao | null>(null);

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
  
  const handleDelete = async () => {
    if (deletingTransaction?.id) {
      await onDeleteTransaction(deletingTransaction.id);
      setDeletingTransaction(null);
    }
  };

  return (
    <>
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
                  <div className="flex items-center space-x-3 flex-1">
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
                    <div className="flex-1">
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
                  
                  <div className="flex items-center space-x-2">
                    <div className={cn(
                      "font-semibold text-lg",
                      isIncome ? "text-income" : "text-expense"
                    )}>
                      {isIncome ? "+" : "-"}R$ {transaction.valor.toFixed(2)}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingTransaction(transaction)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeletingTransaction(transaction)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      {editingTransaction && (
        <EditTransactionDialog
          transaction={editingTransaction}
          categories={categories}
          open={!!editingTransaction}
          onOpenChange={(open) => !open && setEditingTransaction(null)}
          onEditTransaction={onEditTransaction}
        />
      )}

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!deletingTransaction} onOpenChange={(open) => !open && setDeletingTransaction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a transação "{deletingTransaction?.descricao}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}