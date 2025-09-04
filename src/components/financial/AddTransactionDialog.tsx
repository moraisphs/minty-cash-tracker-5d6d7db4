import { useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Category } from "@/hooks/useIndexedDB";
import { CategoryManager } from "./CategoryManager";

interface AddTransactionDialogProps {
  categories: Category[];
  onAddTransaction: (data: {
    description: string;
    amount: number;
    category_id: string;
    transaction_date: string;
    type: "income" | "expense";
    tags?: string[];
    notes?: string;
  }) => Promise<any>;
  onAddCategory: (data: {
    name: string;
    type: 'income' | 'expense';
    icon?: string;
    color?: string;
  }) => Promise<any>;
  onDeleteCategory: (categoryId: string) => Promise<any>;
  children: ReactNode;
}

export function AddTransactionDialog({ categories, onAddTransaction, onAddCategory, onDeleteCategory, children }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();

  const filteredCategories = categories.filter(cat => cat.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description || !category) return;

    try {
      await onAddTransaction({
        description,
        amount: parseFloat(amount),
        category_id: category,
        transaction_date: date,
        type,
      });

      // Reset form
      setAmount("");
      setDescription("");
      setCategory("");
      setDate(new Date().toISOString().split('T')[0]);
      setOpen(false);

      toast({
        title: "Transação adicionada!",
        description: `${type === 'income' ? 'Receita' : 'Despesa'} de R$ ${amount} foi registrada.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao adicionar transação",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Transação</DialogTitle>
          <DialogDescription>
            Registre uma nova receita ou despesa em sua conta.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-2">
            <Button
              type="button"
              variant={type === "income" ? "default" : "outline"}
              onClick={() => {
                setType("income");
                setCategory("");
              }}
              className={type === "income" ? "bg-income hover:bg-income/90" : ""}
            >
              Receita
            </Button>
            <Button
              type="button"
              variant={type === "expense" ? "default" : "outline"}
              onClick={() => {
                setType("expense");
                setCategory("");
              }}
              className={type === "expense" ? "bg-expense hover:bg-expense/90" : ""}
            >
              Despesa
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="category">Categoria</Label>
              <CategoryManager 
                categories={categories}
                onAddCategory={onAddCategory}
                onDeleteCategory={onDeleteCategory}
              />
            </div>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.icon && `${cat.icon} `}{cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva a transação..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full">
              Salvar Transação
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}