import { useState, useEffect } from 'react';
import { db, Transacao, initializeSampleData, exportData, importData } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
  budget_limit?: number;
  is_default?: boolean;
}

// Categorias padrão
const defaultCategories: Category[] = [
  { id: '1', name: 'Alimentação', type: 'expense', icon: 'ShoppingBag', is_default: true },
  { id: '2', name: 'Transporte', type: 'expense', icon: 'Car', is_default: true },
  { id: '3', name: 'Moradia', type: 'expense', icon: 'Home', is_default: true },
  { id: '4', name: 'Lazer', type: 'expense', icon: 'Gamepad2', is_default: true },
  { id: '5', name: 'Saúde', type: 'expense', icon: 'Heart', is_default: true },
  { id: '6', name: 'Educação', type: 'expense', icon: 'BookOpen', is_default: true },
  { id: '7', name: 'Salário', type: 'income', icon: 'TrendingUp', is_default: true },
  { id: '8', name: 'Freelance', type: 'income', icon: 'Briefcase', is_default: true },
  { id: '9', name: 'Investimentos', type: 'income', icon: 'PiggyBank', is_default: true },
  { id: '10', name: 'Outros', type: 'income', icon: 'Plus', is_default: true },
];

export function useIndexedDB() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transacao[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [loading, setLoading] = useState(true);

  // Carregar dados do IndexedDB
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Inicializar dados de exemplo se necessário
        await initializeSampleData();
        
        // Carregar transações
        const transacoes = await db.transacoes.orderBy('data').reverse().toArray();
        setTransactions(transacoes);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados do banco local.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  // Adicionar transação
  const addTransaction = async (transactionData: {
    description: string;
    amount: number;
    type: 'income' | 'expense';
    transaction_date: string;
    category_id: string;
    tags?: string[];
    notes?: string;
  }) => {
    try {
      const category = categories.find(c => c.id === transactionData.category_id);
      
      const newTransacao: Omit<Transacao, 'id'> = {
        tipo: transactionData.type === 'income' ? 'entrada' : 'saida',
        valor: transactionData.amount,
        data: new Date(transactionData.transaction_date),
        categoria: category?.name || 'Outros',
        descricao: transactionData.description
      };

      const id = await db.transacoes.add(newTransacao);
      const savedTransacao = { ...newTransacao, id };
      
      setTransactions(prev => [savedTransacao, ...prev]);

      toast({
        title: "Transação adicionada!",
        description: `${transactionData.type === 'income' ? 'Receita' : 'Despesa'} de R$ ${transactionData.amount.toFixed(2)} foi registrada.`,
      });

      return savedTransacao;
    } catch (error: any) {
      console.error('Erro ao adicionar transação:', error);
      toast({
        title: "Erro ao adicionar transação",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Adicionar categoria
  const addCategory = async (categoryData: {
    name: string;
    type: 'income' | 'expense';
    icon?: string;
    color?: string;
  }) => {
    try {
      // Verificar se já existe uma categoria com o mesmo nome e tipo
      const existingCategory = categories.find(
        cat => cat.name.toLowerCase() === categoryData.name.toLowerCase() && 
               cat.type === categoryData.type
      );

      if (existingCategory) {
        throw new Error('Já existe uma categoria com este nome e tipo');
      }

      const newCategory: Category = {
        id: Date.now().toString(),
        ...categoryData,
        is_default: false
      };

      setCategories(prev => [...prev, newCategory]);

      toast({
        title: "Categoria criada",
        description: `A categoria "${categoryData.name}" foi criada com sucesso.`,
      });

      return newCategory;
    } catch (error: any) {
      console.error('Erro ao criar categoria:', error);
      toast({
        title: "Erro ao criar categoria",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Excluir categoria
  const deleteCategory = async (categoryId: string) => {
    try {
      const category = categories.find(cat => cat.id === categoryId);
      
      if (!category) {
        throw new Error('Categoria não encontrada');
      }

      if (category.is_default) {
        throw new Error('Não é possível excluir categorias padrão');
      }

      // Verificar se há transações usando esta categoria
      const transactionsUsingCategory = transactions.filter(
        t => t.categoria === category.name
      );

      if (transactionsUsingCategory.length > 0) {
        throw new Error(`Não é possível excluir. Existem ${transactionsUsingCategory.length} transação(ões) usando esta categoria.`);
      }

      setCategories(prev => prev.filter(cat => cat.id !== categoryId));

      toast({
        title: "Categoria excluída",
        description: `A categoria "${category.name}" foi excluída com sucesso.`,
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao excluir categoria:', error);
      toast({
        title: "Erro ao excluir categoria",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Calcular saldo
  const getBalance = () => {
    const income = transactions
      .filter(t => t.tipo === 'entrada')
      .reduce((sum, t) => sum + t.valor, 0);
    
    const expenses = transactions
      .filter(t => t.tipo === 'saida')
      .reduce((sum, t) => sum + t.valor, 0);

    return {
      balance: income - expenses,
      income,
      expenses,
    };
  };

  // Filtrar transações por período
  const getTransactionsByPeriod = (period: string) => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStart, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return transactions;
    }

    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.data);
      return transactionDate >= startDate && transactionDate <= now;
    });
  };

  // Exportar dados
  const handleExportData = async () => {
    try {
      await exportData();
      toast({
        title: "Dados exportados!",
        description: "Seus dados foram baixados com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar dados",
        description: "Não foi possível exportar os dados.",
        variant: "destructive",
      });
    }
  };

  // Editar transação
  const editTransaction = async (transactionId: number, transactionData: {
    description: string;
    amount: number;
    type: 'income' | 'expense';
    transaction_date: string;
    category_id: string;
    tags?: string[];
    notes?: string;
  }) => {
    try {
      const category = categories.find(c => c.id === transactionData.category_id);
      
      const updatedTransacao: Transacao = {
        id: transactionId,
        tipo: transactionData.type === 'income' ? 'entrada' : 'saida',
        valor: transactionData.amount,
        data: new Date(transactionData.transaction_date),
        categoria: category?.name || 'Outros',
        descricao: transactionData.description
      };

      await db.transacoes.update(transactionId, updatedTransacao);
      
      setTransactions(prev => 
        prev.map(t => t.id === transactionId ? updatedTransacao : t)
      );

      toast({
        title: "Transação editada!",
        description: `${transactionData.type === 'income' ? 'Receita' : 'Despesa'} foi atualizada com sucesso.`,
      });

      return updatedTransacao;
    } catch (error: any) {
      console.error('Erro ao editar transação:', error);
      toast({
        title: "Erro ao editar transação",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Excluir transação
  const deleteTransaction = async (transactionId: number) => {
    try {
      await db.transacoes.delete(transactionId);
      
      setTransactions(prev => prev.filter(t => t.id !== transactionId));

      toast({
        title: "Transação excluída!",
        description: "A transação foi removida com sucesso.",
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao excluir transação:', error);
      toast({
        title: "Erro ao excluir transação",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Importar dados
  const handleImportData = async (file: File) => {
    try {
      const success = await importData(file);
      if (success) {
        // Recarregar dados
        const transacoes = await db.transacoes.orderBy('data').reverse().toArray();
        setTransactions(transacoes);
        
        toast({
          title: "Dados importados!",
          description: "Seus dados foram restaurados com sucesso.",
        });
      } else {
        throw new Error('Falha na importação');
      }
    } catch (error) {
      toast({
        title: "Erro ao importar dados",
        description: "Não foi possível importar os dados. Verifique o arquivo.",
        variant: "destructive",
      });
    }
  };

  return {
    transactions,
    categories,
    loading,
    addTransaction,
    editTransaction,
    deleteTransaction,
    addCategory,
    deleteCategory,
    getBalance,
    getTransactionsByPeriod,
    exportData: handleExportData,
    importData: handleImportData,
  };
}
