import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Transacao } from "@/lib/db";
import { Category } from "@/hooks/useIndexedDB";

interface EditTransactionDialogProps {
  transaction: Transacao;
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditTransaction: (transactionId: number, data: {
    description: string;
    amount: number;
    type: 'income' | 'expense';
    transaction_date: string;
    category_id: string;
  }) => Promise<void>;
}

export function EditTransactionDialog({
  transaction,
  categories,
  open,
  onOpenChange,
  onEditTransaction
}: EditTransactionDialogProps) {
  const [formData, setFormData] = useState({
    description: transaction.descricao || '',
    amount: transaction.valor.toString(),
    type: transaction.tipo === 'entrada' ? 'income' : 'expense' as 'income' | 'expense',
    transaction_date: new Date(transaction.data),
    category_id: ''
  });
  const [loading, setLoading] = useState(false);

  // Encontrar a categoria atual
  useEffect(() => {
    if (transaction.categoria) {
      const currentCategory = categories.find(cat => cat.name === transaction.categoria);
      if (currentCategory) {
        setFormData(prev => ({ ...prev, category_id: currentCategory.id }));
      }
    }
  }, [transaction.categoria, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim() || !formData.amount || !formData.category_id) {
      return;
    }

    setLoading(true);
    try {
      await onEditTransaction(transaction.id!, {
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        type: formData.type,
        transaction_date: formData.transaction_date.toISOString().split('T')[0],
        category_id: formData.category_id
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao editar transação:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Transação</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'income' | 'expense') => 
                setFormData(prev => ({ ...prev, type: value, category_id: '' }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Receita</SelectItem>
                <SelectItem value="expense">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Ex: Salário, Supermercado, etc."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0,00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.transaction_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.transaction_date ? (
                    format(formData.transaction_date, "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.transaction_date}
                  onSelect={(date) => date && setFormData(prev => ({ ...prev, transaction_date: date }))}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
