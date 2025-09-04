import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Settings } from "lucide-react";
import { Category } from "@/hooks/useIndexedDB";

interface CategoryManagerProps {
  categories: Category[];
  onAddCategory: (data: {
    name: string;
    type: 'income' | 'expense';
    icon?: string;
    color?: string;
  }) => Promise<any>;
  onDeleteCategory: (categoryId: string) => Promise<any>;
}

const availableIcons = [
  'ShoppingBag', 'Car', 'Home', 'Gamepad2', 'Heart', 'BookOpen',
  'TrendingUp', 'Briefcase', 'PiggyBank', 'Plus', 'Coffee', 'Plane',
  'Gift', 'Music', 'Camera', 'Smartphone', 'Laptop', 'Shirt'
];

export function CategoryManager({ categories, onAddCategory, onDeleteCategory }: CategoryManagerProps) {
  const [open, setOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState<'income' | 'expense'>('expense');
  const [newCategoryIcon, setNewCategoryIcon] = useState("Plus");

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      await onAddCategory({
        name: newCategoryName.trim(),
        type: newCategoryType,
        icon: newCategoryIcon,
      });

      // Reset form
      setNewCategoryName("");
      setNewCategoryType("expense");
      setNewCategoryIcon("Plus");
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await onDeleteCategory(categoryId);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const userCategories = categories.filter(cat => !cat.is_default);
  const defaultCategories = categories.filter(cat => cat.is_default);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Gerenciar Categorias
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Categorias</DialogTitle>
          <DialogDescription>
            Adicione novas categorias ou exclua as existentes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Adicionar Nova Categoria */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Adicionar Nova Categoria</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Nome</Label>
                <Input
                  id="categoryName"
                  placeholder="Ex: Cinema"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryType">Tipo</Label>
                <Select value={newCategoryType} onValueChange={(value: 'income' | 'expense') => setNewCategoryType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Despesa</SelectItem>
                    <SelectItem value="income">Receita</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="categoryIcon">Ícone</Label>
              <Select value={newCategoryIcon} onValueChange={setNewCategoryIcon}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableIcons.map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      {icon}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleAddCategory} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Categoria
            </Button>
          </div>

          {/* Lista de Categorias */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Suas Categorias</h3>
            
            {/* Categorias do Usuário */}
            {userCategories.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Personalizadas</h4>
                <div className="grid grid-cols-1 gap-2">
                  {userCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center space-x-3">
                        <Badge variant={category.type === 'income' ? 'default' : 'secondary'}>
                          {category.type === 'income' ? 'Receita' : 'Despesa'}
                        </Badge>
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id!)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Categorias Padrão */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Padrão</h4>
              <div className="grid grid-cols-1 gap-2">
                {defaultCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                  >
                    <div className="flex items-center space-x-3">
                      <Badge variant={category.type === 'income' ? 'default' : 'secondary'}>
                        {category.type === 'income' ? 'Receita' : 'Despesa'}
                      </Badge>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Padrão</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
