import { useState, useEffect } from 'react';
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

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  transaction_date: string;
  category_id: string;
  tags?: string[];
  notes?: string;
  categories?: Category;
}

// Dados mock iniciais
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

const defaultTransactions: Transaction[] = [
  {
    id: '1',
    description: 'Salário mensal',
    amount: 5000,
    type: 'income',
    transaction_date: new Date().toISOString().split('T')[0],
    category_id: '7',
    categories: defaultCategories.find(c => c.id === '7')
  },
  {
    id: '2',
    description: 'Supermercado',
    amount: 350,
    type: 'expense',
    transaction_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    category_id: '1',
    categories: defaultCategories.find(c => c.id === '1')
  },
  {
    id: '3',
    description: 'Uber',
    amount: 25,
    type: 'expense',
    transaction_date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    category_id: '2',
    categories: defaultCategories.find(c => c.id === '2')
  },
  {
    id: '4',
    description: 'Aluguel',
    amount: 1200,
    type: 'expense',
    transaction_date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
    category_id: '3',
    categories: defaultCategories.find(c => c.id === '3')
  },
];

export function useLocalTransactions() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados do localStorage ou usar dados padrão
  useEffect(() => {
    const loadData = () => {
      try {
        const savedTransactions = localStorage.getItem('minty-transactions');
        const savedCategories = localStorage.getItem('minty-categories');

        if (savedTransactions) {
          setTransactions(JSON.parse(savedTransactions));
        } else {
          setTransactions(defaultTransactions);
          localStorage.setItem('minty-transactions', JSON.stringify(defaultTransactions));
        }

        if (savedCategories) {
          setCategories(JSON.parse(savedCategories));
        } else {
          setCategories(defaultCategories);
          localStorage.setItem('minty-categories', JSON.stringify(defaultCategories));
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setTransactions(defaultTransactions);
        setCategories(defaultCategories);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        ...transactionData,
        categories: category
      };

      const updatedTransactions = [newTransaction, ...transactions];
      setTransactions(updatedTransactions);
      localStorage.setItem('minty-transactions', JSON.stringify(updatedTransactions));

      toast({
        title: "Transação adicionada!",
        description: `${transactionData.type === 'income' ? 'Receita' : 'Despesa'} de R$ ${transactionData.amount.toFixed(2)} foi registrada.`,
      });

      return newTransaction;
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
      const newCategory: Category = {
        id: Date.now().toString(),
        ...categoryData,
        is_default: false
      };

      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);
      localStorage.setItem('minty-categories', JSON.stringify(updatedCategories));

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

  // Calcular saldo
  const getBalance = () => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

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
      const transactionDate = new Date(transaction.transaction_date);
      return transactionDate >= startDate && transactionDate <= now;
    });
  };

  return {
    transactions,
    categories,
    loading,
    addTransaction,
    addCategory,
    getBalance,
    getTransactionsByPeriod,
  };
}