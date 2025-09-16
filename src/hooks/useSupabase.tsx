import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Transaction = Database['public']['Tables']['transactions']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
type TransactionUpdate = Database['public']['Tables']['transactions']['Update'];
type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

export interface CategoryWithId extends Omit<Category, 'id'> {
  id: string;
}

export interface TransactionWithId extends Omit<Transaction, 'id'> {
  id: string;
  category_name?: string;
}

// UUID fixo para desenvolvimento
const DEFAULT_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

// Verificar se o Supabase está configurado corretamente
const isSupabaseConfigured = () => {
  const hasValidConfig = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const isPlaceholderKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.includes('REPLACE_WITH_ACTUAL_KEY');
  return hasValidConfig && !isPlaceholderKey;
};

export function useSupabase() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<TransactionWithId[]>([]);
  const [categories, setCategories] = useState<CategoryWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string } | null>(null);

  // Carregar dados locais como fallback
  const loadLocalData = useCallback(async () => {
    try {
      // Criar categorias padrão localmente
      const defaultCategories: CategoryWithId[] = [
        { id: '1', name: 'Alimentação', type: 'expense', is_default: true, user_id: DEFAULT_USER_ID, created_at: new Date().toISOString(), budget_limit: null, icon: null, color: null },
        { id: '2', name: 'Transporte', type: 'expense', is_default: true, user_id: DEFAULT_USER_ID, created_at: new Date().toISOString(), budget_limit: null, icon: null, color: null },
        { id: '3', name: 'Moradia', type: 'expense', is_default: true, user_id: DEFAULT_USER_ID, created_at: new Date().toISOString(), budget_limit: null, icon: null, color: null },
        { id: '4', name: 'Lazer', type: 'expense', is_default: true, user_id: DEFAULT_USER_ID, created_at: new Date().toISOString(), budget_limit: null, icon: null, color: null },
        { id: '5', name: 'Saúde', type: 'expense', is_default: true, user_id: DEFAULT_USER_ID, created_at: new Date().toISOString(), budget_limit: null, icon: null, color: null },
        { id: '6', name: 'Educação', type: 'expense', is_default: true, user_id: DEFAULT_USER_ID, created_at: new Date().toISOString(), budget_limit: null, icon: null, color: null },
        { id: '7', name: 'Salário', type: 'income', is_default: true, user_id: DEFAULT_USER_ID, created_at: new Date().toISOString(), budget_limit: null, icon: null, color: null },
        { id: '8', name: 'Freelance', type: 'income', is_default: true, user_id: DEFAULT_USER_ID, created_at: new Date().toISOString(), budget_limit: null, icon: null, color: null },
        { id: '9', name: 'Investimentos', type: 'income', is_default: true, user_id: DEFAULT_USER_ID, created_at: new Date().toISOString(), budget_limit: null, icon: null, color: null },
        { id: '10', name: 'Outros', type: 'expense', is_default: true, user_id: DEFAULT_USER_ID, created_at: new Date().toISOString(), budget_limit: null, icon: null, color: null },
      ];

      // Criar transações de exemplo com category_name
      const sampleTransactions: TransactionWithId[] = [
        {
          id: '1',
          description: 'Salário mensal',
          amount: 5000,
          type: 'income',
          transaction_date: new Date().toISOString().split('T')[0],
          category_id: '7',
          category_name: 'Salário',
          user_id: DEFAULT_USER_ID,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tags: null,
          notes: null,
          is_recurring: false,
          recurring_config: null,
          attachment_url: null,
        },
        {
          id: '2',
          description: 'Supermercado',
          amount: 350,
          type: 'expense',
          transaction_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          category_id: '1',
          category_name: 'Alimentação',
          user_id: DEFAULT_USER_ID,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tags: null,
          notes: null,
          is_recurring: false,
          recurring_config: null,
          attachment_url: null,
        },
        {
          id: '3',
          description: 'Uber',
          amount: 25,
          type: 'expense',
          transaction_date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
          category_id: '2',
          category_name: 'Transporte',
          user_id: DEFAULT_USER_ID,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tags: null,
          notes: null,
          is_recurring: false,
          recurring_config: null,
          attachment_url: null,
        },
      ];

      setTransactions(sampleTransactions);
      setCategories(defaultCategories);
      
      console.log('Dados locais carregados');
    } catch (error) {
      console.error('Erro ao carregar dados locais:', error);
    }
  }, []);

  // Carregar dados do Supabase
  const loadData = useCallback(async (userId: string) => {
    try {
      console.log('=== CARREGANDO DADOS ===');
      console.log('User ID:', userId);
      
      if (!isSupabaseConfigured()) {
        console.log('Supabase não configurado, usando dados locais');
        await loadLocalData();
        return;
      }
      
      // Carregar transações com informações de categoria
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select(`
          *,
          categories!inner(name)
        `)
        .eq('user_id', userId)
        .order('transaction_date', { ascending: false });

      if (transactionsError) {
        console.error('Erro ao carregar transações:', transactionsError);
        throw transactionsError;
      }

      // Carregar categorias
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (categoriesError) {
        console.error('Erro ao carregar categorias:', categoriesError);
        throw categoriesError;
      }

      console.log('Transações carregadas:', transactionsData?.length || 0);
      console.log('Categorias carregadas:', categoriesData?.length || 0);

      // Processar transações para incluir category_name
      const processedTransactions = (transactionsData || []).map(transaction => ({
        ...transaction,
        category_name: transaction.categories?.name || 'Outros'
      }));

      setTransactions(processedTransactions);
      setCategories(categoriesData || []);

      // Se não há categorias, criar categorias padrão
      if (!categoriesData || categoriesData.length === 0) {
        await createDefaultCategories(userId);
      }

    } catch (error) {
      console.error('Erro ao carregar dados do Supabase, usando dados locais:', error);
      await loadLocalData();
    }
  }, [loadLocalData]);

  // Inicializar usuário e carregar dados
  useEffect(() => {
    const initUser = async () => {
      try {
        const userId = DEFAULT_USER_ID;
        setUser({ id: userId });
        await loadData(userId);
      } catch (error) {
        console.error('Erro ao inicializar usuário:', error);
        toast({
          title: "Erro de inicialização",
          description: "Não foi possível carregar os dados.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    initUser();
  }, [toast, loadData]);

  // Criar categorias padrão
  const createDefaultCategories = async (userId: string) => {
    if (!isSupabaseConfigured()) {
      return;
    }

    const defaultCategories = [
      { name: 'Alimentação', type: 'expense', is_default: true },
      { name: 'Transporte', type: 'expense', is_default: true },
      { name: 'Moradia', type: 'expense', is_default: true },
      { name: 'Lazer', type: 'expense', is_default: true },
      { name: 'Saúde', type: 'expense', is_default: true },
      { name: 'Educação', type: 'expense', is_default: true },
      { name: 'Salário', type: 'income', is_default: true },
      { name: 'Freelance', type: 'income', is_default: true },
      { name: 'Investimentos', type: 'income', is_default: true },
      { name: 'Outros', type: 'expense', is_default: true },
    ];

    try {
      const categoriesToInsert = defaultCategories.map(cat => ({
        ...cat,
        user_id: userId,
      }));

      const { data, error } = await supabase
        .from('categories')
        .insert(categoriesToInsert)
        .select();

      if (error) {
        console.error('Erro ao criar categorias padrão:', error);
        throw error;
      }

      console.log('Categorias padrão criadas:', data?.length || 0);
      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao criar categorias padrão:', error);
    }
  };

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
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      console.log('=== ADICIONANDO TRANSAÇÃO ===');
      console.log('Dados recebidos:', transactionData);
      
      if (!isSupabaseConfigured()) {
        // Usar armazenamento local
        const newTransaction: TransactionWithId = {
          id: Date.now().toString(),
          description: transactionData.description,
          amount: transactionData.amount,
          type: transactionData.type,
          transaction_date: transactionData.transaction_date,
          category_id: transactionData.category_id,
          tags: transactionData.tags || null,
          notes: transactionData.notes || null,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_recurring: false,
          recurring_config: null,
          attachment_url: null,
        };

        setTransactions(prev => [newTransaction, ...prev]);

        toast({
          title: "Transação adicionada!",
          description: `${transactionData.type === 'income' ? 'Receita' : 'Despesa'} de R$ ${transactionData.amount.toFixed(2)} foi registrada.`,
        });

        return newTransaction;
      }
      
      const newTransaction: TransactionInsert = {
        description: transactionData.description,
        amount: transactionData.amount,
        type: transactionData.type,
        transaction_date: transactionData.transaction_date,
        category_id: transactionData.category_id,
        tags: transactionData.tags || null,
        notes: transactionData.notes || null,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert(newTransaction)
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar transação:', error);
        throw error;
      }

      console.log('Transação adicionada:', data);
      setTransactions(prev => [data, ...prev]);

      toast({
        title: "Transação adicionada!",
        description: `${transactionData.type === 'income' ? 'Receita' : 'Despesa'} de R$ ${transactionData.amount.toFixed(2)} foi registrada.`,
      });

      return data;
    } catch (error: unknown) {
      console.error('Erro ao adicionar transação:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro ao adicionar transação",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Editar transação
  const editTransaction = async (transactionId: string, transactionData: {
    description: string;
    amount: number;
    type: 'income' | 'expense';
    transaction_date: string;
    category_id: string;
    tags?: string[];
    notes?: string;
  }) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      if (!isSupabaseConfigured()) {
        // Usar armazenamento local
        const updatedTransaction: TransactionWithId = {
          id: transactionId,
          description: transactionData.description,
          amount: transactionData.amount,
          type: transactionData.type,
          transaction_date: transactionData.transaction_date,
          category_id: transactionData.category_id,
          tags: transactionData.tags || null,
          notes: transactionData.notes || null,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_recurring: false,
          recurring_config: null,
          attachment_url: null,
        };

        setTransactions(prev => 
          prev.map(t => t.id === transactionId ? updatedTransaction : t)
        );

        toast({
          title: "Transação editada!",
          description: `${transactionData.type === 'income' ? 'Receita' : 'Despesa'} foi atualizada com sucesso.`,
        });

        return updatedTransaction;
      }

      const updatedTransaction: TransactionUpdate = {
        description: transactionData.description,
        amount: transactionData.amount,
        type: transactionData.type,
        transaction_date: transactionData.transaction_date,
        category_id: transactionData.category_id,
        tags: transactionData.tags || null,
        notes: transactionData.notes || null,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('transactions')
        .update(updatedTransaction)
        .eq('id', transactionId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao editar transação:', error);
        throw error;
      }

      setTransactions(prev => 
        prev.map(t => t.id === transactionId ? data : t)
      );

      toast({
        title: "Transação editada!",
        description: `${transactionData.type === 'income' ? 'Receita' : 'Despesa'} foi atualizada com sucesso.`,
      });

      return data;
    } catch (error: unknown) {
      console.error('Erro ao editar transação:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro ao editar transação",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Excluir transação
  const deleteTransaction = async (transactionId: string) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      if (!isSupabaseConfigured()) {
        // Usar armazenamento local
        setTransactions(prev => prev.filter(t => t.id !== transactionId));

        toast({
          title: "Transação excluída!",
          description: "A transação foi removida com sucesso.",
        });

        return true;
      }

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao excluir transação:', error);
        throw error;
      }

      setTransactions(prev => prev.filter(t => t.id !== transactionId));

      toast({
        title: "Transação excluída!",
        description: "A transação foi removida com sucesso.",
      });

      return true;
    } catch (error: unknown) {
      console.error('Erro ao excluir transação:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro ao excluir transação",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Adicionar categoria
  const addCategory = async (categoryData: {
    name: string;
    type: 'income' | 'expense';
    color?: string;
  }) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      if (!isSupabaseConfigured()) {
        // Usar armazenamento local
        const existingCategory = categories.find(
          cat => cat.name.toLowerCase() === categoryData.name.toLowerCase() && 
                 cat.type === categoryData.type
        );

        if (existingCategory) {
          throw new Error('Já existe uma categoria com este nome e tipo');
        }

        const newCategory: CategoryWithId = {
          id: Date.now().toString(),
          name: categoryData.name,
          type: categoryData.type,
          color: categoryData.color || null,
          is_default: false,
          user_id: user.id,
          created_at: new Date().toISOString(),
          budget_limit: null,
          icon: null,
        };

        setCategories(prev => [...prev, newCategory]);

        toast({
          title: "Categoria criada",
          description: `A categoria "${categoryData.name}" foi criada com sucesso.`,
        });

        return newCategory;
      }

      // Verificar se já existe uma categoria com o mesmo nome e tipo
      const { data: existingCategory } = await supabase
        .from('categories')
        .select('id')
        .eq('name', categoryData.name)
        .eq('type', categoryData.type)
        .eq('user_id', user.id)
        .single();

      if (existingCategory) {
        throw new Error('Já existe uma categoria com este nome e tipo');
      }

      const newCategory: CategoryInsert = {
        name: categoryData.name,
        type: categoryData.type,
        color: categoryData.color || null,
        is_default: false,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('categories')
        .insert(newCategory)
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar categoria:', error);
        throw error;
      }

      setCategories(prev => [...prev, data]);

      toast({
        title: "Categoria criada",
        description: `A categoria "${categoryData.name}" foi criada com sucesso.`,
      });

      return data;
    } catch (error: unknown) {
      console.error('Erro ao criar categoria:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro ao criar categoria",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Editar categoria
  const editCategory = async (categoryId: string, categoryData: {
    name: string;
    type: 'income' | 'expense';
    color?: string;
  }) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      if (!isSupabaseConfigured()) {
        // Usar armazenamento local
        const existingCategory = categories.find(
          cat => cat.id !== categoryId &&
                 cat.name.toLowerCase() === categoryData.name.toLowerCase() && 
                 cat.type === categoryData.type
        );

        if (existingCategory) {
          throw new Error('Já existe uma categoria com este nome e tipo');
        }

        const updatedCategory: CategoryWithId = {
          id: categoryId,
          name: categoryData.name,
          type: categoryData.type,
          color: categoryData.color || null,
          is_default: false,
          user_id: user.id,
          created_at: new Date().toISOString(),
          budget_limit: null,
          icon: null,
        };

        setCategories(prev => prev.map(cat => cat.id === categoryId ? updatedCategory : cat));

        toast({
          title: "Categoria editada",
          description: `A categoria "${categoryData.name}" foi atualizada com sucesso.`,
        });

        return updatedCategory;
      }

      // Verificar se já existe uma categoria com o mesmo nome e tipo (excluindo a atual)
      const { data: existingCategory } = await supabase
        .from('categories')
        .select('id')
        .eq('name', categoryData.name)
        .eq('type', categoryData.type)
        .eq('user_id', user.id)
        .neq('id', categoryId)
        .single();

      if (existingCategory) {
        throw new Error('Já existe uma categoria com este nome e tipo');
      }

      const updatedCategory: CategoryUpdate = {
        name: categoryData.name,
        type: categoryData.type,
        color: categoryData.color || null,
      };

      const { data, error } = await supabase
        .from('categories')
        .update(updatedCategory)
        .eq('id', categoryId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao editar categoria:', error);
        throw error;
      }

      setCategories(prev => prev.map(cat => cat.id === categoryId ? data : cat));

      toast({
        title: "Categoria editada",
        description: `A categoria "${categoryData.name}" foi atualizada com sucesso.`,
      });

      return data;
    } catch (error: unknown) {
      console.error('Erro ao editar categoria:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro ao editar categoria",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Excluir categoria
  const deleteCategory = async (categoryId: string) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      if (!isSupabaseConfigured()) {
        // Usar armazenamento local
        setCategories(prev => prev.filter(cat => cat.id !== categoryId));

        toast({
          title: "Categoria excluída!",
          description: "A categoria foi removida com sucesso.",
        });

        return true;
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao excluir categoria:', error);
        throw error;
      }

      setCategories(prev => prev.filter(cat => cat.id !== categoryId));

      toast({
        title: "Categoria excluída!",
        description: "A categoria foi removida com sucesso.",
      });

      return true;
    } catch (error: unknown) {
      console.error('Erro ao excluir categoria:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro ao excluir categoria",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Calcular saldo
  const getBalance = () => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

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
      case 'quarter': {
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStart, 1);
        break;
      }
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return transactions;
    }

    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.transaction_date);
      return transactionDate >= startDate && transactionDate <= now;
    });
  };

  return {
    transactions,
    categories,
    loading,
    user,
    addTransaction,
    editTransaction,
    deleteTransaction,
    addCategory,
    editCategory,
    deleteCategory,
    getBalance,
    getTransactionsByPeriod,
  };
}