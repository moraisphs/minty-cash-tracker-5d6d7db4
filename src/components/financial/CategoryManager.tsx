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
import { Plus, Trash2, Settings, Edit } from "lucide-react";
import { CategoryWithId } from "@/hooks/useSupabase";
import { useToast } from "@/hooks/use-toast";

interface CategoryManagerProps {
  categories: CategoryWithId[];
  onAddCategory: (data: {
    name: string;
    type: 'income' | 'expense';
    color?: string;
  }) => Promise<void>;
  onEditCategory: (categoryId: string, data: {
    name: string;
    type: 'income' | 'expense';
    color?: string;
  }) => Promise<void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
}


export function CategoryManager({ categories, onAddCategory, onEditCategory, onDeleteCategory }: CategoryManagerProps) {
  const [open, setOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState<'income' | 'expense'>('expense');
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryWithId | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryType, setEditCategoryType] = useState<'income' | 'expense'>('expense');
  const { toast } = useToast();

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      await onAddCategory({
        name: newCategoryName.trim(),
        type: newCategoryType,
      });

      // Reset form
      setNewCategoryName("");
      setNewCategoryType("expense");
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !editCategoryName.trim()) return;

    try {
      await onEditCategory(editingCategory.id, {
        name: editCategoryName.trim(),
        type: editCategoryType,
      });

      // Reset form
      setEditingCategory(null);
      setEditCategoryName("");
      setEditCategoryType("expense");
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const startEditCategory = (category: CategoryWithId) => {
    setEditingCategory(category);
    setEditCategoryName(category.name);
    setEditCategoryType(category.type);
  };

  const cancelEditCategory = () => {
    setEditingCategory(null);
    setEditCategoryName("");
    setEditCategoryType("expense");
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    console.log('=== INICIANDO EXCLUSÃO ===');
    console.log('ID da categoria:', categoryId);
    console.log('Nome da categoria:', categoryName);
    console.log('Função onDeleteCategory:', typeof onDeleteCategory);
    
    try {
      if (!onDeleteCategory) {
        throw new Error('Função onDeleteCategory não está definida');
      }
      
      setDeletingCategoryId(categoryId);
      console.log('Chamando onDeleteCategory...');
      await onDeleteCategory(categoryId);
      console.log('Categoria excluída com sucesso');
      
      toast({
        title: "Categoria excluída!",
        description: `A categoria "${categoryName}" foi removida com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      toast({
        title: "Erro ao excluir categoria",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive",
      });
    } finally {
      setDeletingCategoryId(null);
    }
  };

  // Filtrar categorias de forma mais robusta
  const userCategories = categories.filter(cat => {
    // Categoria personalizada: não é uma das categorias padrão conhecidas
    const isDefaultCategory = [
      'Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação',
      'Salário', 'Freelance', 'Investimentos', 'Outros'
    ].includes(cat.name);
    
    return !isDefaultCategory;
  });
  
  const defaultCategories = categories.filter(cat => {
    // Categoria padrão: é uma das categorias padrão conhecidas
    const isDefaultCategory = [
      'Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação',
      'Salário', 'Freelance', 'Investimentos', 'Outros'
    ].includes(cat.name);
    
    return isDefaultCategory;
  });
  
  console.log('=== DEBUG CATEGORIAS ===');
  console.log('Categorias recebidas:', categories.length);
  console.log('Categorias personalizadas:', userCategories.length);
  console.log('Categorias padrão:', defaultCategories.length);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Gerenciar Categorias
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] max-w-[500px] max-h-[85vh] overflow-y-auto mx-2 xs:mx-4">
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
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4">
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
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditCategory(category)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            type="button"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              console.log('Botão de excluir clicado para categoria:', category.name);
                              console.log('ID da categoria:', category.id);
                              if (confirm(`Tem certeza que deseja excluir a categoria "${category.name}"? Esta ação não pode ser desfeita.`)) {
                                console.log('Confirmação aceita, chamando handleDeleteCategory');
                                handleDeleteCategory(category.id!, category.name);
                              } else {
                                console.log('Confirmação cancelada');
                              }
                            }}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            type="button"
                            disabled={deletingCategoryId === category.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditCategory(category)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          type="button"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            console.log('Botão de excluir clicado para categoria padrão:', category.name);
                            console.log('ID da categoria:', category.id);
                            if (confirm(`Tem certeza que deseja excluir a categoria padrão "${category.name}"? Esta ação não pode ser desfeita.`)) {
                              console.log('Confirmação aceita, chamando handleDeleteCategory');
                              handleDeleteCategory(category.id!, category.name);
                            } else {
                              console.log('Confirmação cancelada');
                            }
                          }}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          type="button"
                          disabled={deletingCategoryId === category.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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

      {/* Dialog de Edição de Categoria */}
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && cancelEditCategory()}>
        <DialogContent className="w-[95vw] max-w-[400px] mx-2 xs:mx-4">
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
            <DialogDescription>
              Edite os dados da categoria selecionada.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editCategoryName">Nome</Label>
              <Input
                id="editCategoryName"
                placeholder="Ex: Cinema"
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editCategoryType">Tipo</Label>
              <Select value={editCategoryType} onValueChange={(value: 'income' | 'expense') => setEditCategoryType(value)}>
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

          <DialogFooter>
            <Button variant="outline" onClick={cancelEditCategory}>
              Cancelar
            </Button>
            <Button onClick={handleEditCategory} disabled={!editCategoryName.trim()}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
