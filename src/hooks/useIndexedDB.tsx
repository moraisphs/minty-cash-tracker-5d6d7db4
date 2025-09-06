import { useState, useEffect } from 'react';
import { db, Transacao, Categoria, initializeSampleData, exportData, importData, clearSampleData, hasSampleData, resetDatabase, getDatabaseStatus, fixExistingCategories } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color?: string;
  budget_limit?: number;
  is_default: boolean;
}

export function useIndexedDB() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transacao[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados do IndexedDB
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('=== CARREGANDO DADOS ===');
        setLoading(true);
        
        // Inicializar dados de exemplo se necessário
        await initializeSampleData();
        
        // Carregar transações e categorias
        console.log('Carregando transações e categorias...');
        const [transacoes, categorias] = await Promise.all([
          db.transacoes.orderBy('data').reverse().toArray(),
          db.categorias.toArray()
        ]);
        
        console.log('Transações carregadas:', transacoes.length);
        console.log('Categorias carregadas:', categorias.length);
        console.log('Transações:', transacoes);
        console.log('Categorias:', categorias);
        console.log('Verificação is_default das categorias:', categorias.map(cat => ({ 
          name: cat.name, 
          is_default: cat.is_default, 
          type: typeof cat.is_default 
        })));
        
        setTransactions(transacoes);
        setCategories(categorias);
        
        console.log('=== DADOS CARREGADOS COM SUCESSO ===');
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
      console.log('=== ADICIONANDO TRANSAÇÃO ===');
      console.log('Dados recebidos:', transactionData);
      
      const category = categories.find(c => c.id === transactionData.category_id);
      console.log('Categoria encontrada:', category);
      
      const newTransacao: Omit<Transacao, 'id'> = {
        tipo: transactionData.type === 'income' ? 'entrada' : 'saida',
        valor: transactionData.amount,
        data: new Date(transactionData.transaction_date),
        categoria: category?.name || 'Outros',
        descricao: transactionData.description
      };

      console.log('Nova transação a ser salva:', newTransacao);
      
      const id = await db.transacoes.add(newTransacao);
      console.log('ID da transação salva:', id);
      
      const savedTransacao = { ...newTransacao, id };
      
      setTransactions(prev => [savedTransacao, ...prev]);
      console.log('Estado local atualizado');

      toast({
        title: "Transação adicionada!",
        description: `${transactionData.type === 'income' ? 'Receita' : 'Despesa'} de R$ ${transactionData.amount.toFixed(2)} foi registrada.`,
      });

      console.log('=== TRANSAÇÃO ADICIONADA COM SUCESSO ===');
      return savedTransacao;
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

      const newCategory: Categoria = {
        id: Date.now().toString(),
        ...categoryData,
        is_default: false
      };

      // Salvar no IndexedDB
      await db.categorias.add(newCategory);
      
      // Atualizar estado local
      setCategories(prev => [...prev, newCategory]);

      toast({
        title: "Categoria criada",
        description: `A categoria "${categoryData.name}" foi criada com sucesso.`,
      });

      return newCategory;
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
    try {
      // Verificar se já existe uma categoria com o mesmo nome e tipo (excluindo a atual)
      const existingCategory = categories.find(
        cat => cat.id !== categoryId &&
               cat.name.toLowerCase() === categoryData.name.toLowerCase() && 
               cat.type === categoryData.type
      );

      if (existingCategory) {
        throw new Error('Já existe uma categoria com este nome e tipo');
      }

      const updatedCategory: Categoria = {
        id: categoryId,
        ...categoryData,
        is_default: false
      };

      // Atualizar no IndexedDB
      await db.categorias.update(categoryId, updatedCategory);
      
      // Atualizar estado local
      setCategories(prev => prev.map(cat => cat.id === categoryId ? updatedCategory : cat));

      toast({
        title: "Categoria editada",
        description: `A categoria "${categoryData.name}" foi atualizada com sucesso.`,
      });

      return updatedCategory;
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
    console.log('=== FUNÇÃO deleteCategory CHAMADA ===');
    console.log('categoryId recebido:', categoryId);
    console.log('Categorias disponíveis:', categories);
    
    try {
      const category = categories.find(cat => cat.id === categoryId);
      console.log('Categoria encontrada:', category);
      
      if (!category) {
        throw new Error('Categoria não encontrada');
      }

      console.log('Excluindo categoria do IndexedDB...');
      await db.categorias.delete(categoryId);
      console.log('Categoria excluída do IndexedDB');
      
      console.log('Atualizando estado local...');
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      console.log('Estado local atualizado');

      console.log('Categoria excluída com sucesso!');
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
  const deleteTransaction = async (transactionId: number) => {
    try {
      await db.transacoes.delete(transactionId);
      
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

  // Importar dados
  const handleImportData = async (file: File) => {
    try {
      const success = await importData(file);
      if (success) {
        // Recarregar dados
        const [transacoes, categorias] = await Promise.all([
          db.transacoes.orderBy('data').reverse().toArray(),
          db.categorias.toArray()
        ]);
        
        setTransactions(transacoes);
        setCategories(categorias);
        
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

  // Limpar dados fictícios
  const handleClearSampleData = async () => {
    try {
      const success = await clearSampleData();
      if (success) {
        // Recarregar dados
        const transacoes = await db.transacoes.orderBy('data').reverse().toArray();
        setTransactions(transacoes);
        
        toast({
          title: "Dados fictícios removidos!",
          description: "Os dados de exemplo foram removidos com sucesso.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao remover dados fictícios",
        description: "Não foi possível remover os dados de exemplo.",
        variant: "destructive",
      });
    }
  };

  // Resetar banco de dados
  const handleResetDatabase = async () => {
    try {
      const success = await resetDatabase();
      if (success) {
        // Recarregar dados
        const [transacoes, categorias] = await Promise.all([
          db.transacoes.orderBy('data').reverse().toArray(),
          db.categorias.toArray()
        ]);
        
        setTransactions(transacoes);
        setCategories(categorias);
        
        toast({
          title: "Banco resetado!",
          description: "O banco de dados foi resetado completamente.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao resetar banco",
        description: "Não foi possível resetar o banco de dados.",
        variant: "destructive",
      });
    }
  };

  // Verificar status do banco
  const handleCheckDatabaseStatus = async () => {
    try {
      const status = await getDatabaseStatus();
      console.log('=== STATUS DO BANCO DE DADOS ===');
      console.log('Status:', status);
      
      toast({
        title: "Status do banco",
        description: `Transações: ${status?.transactionCount}, Categorias: ${status?.categoryCount}`,
      });
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
  };

  const handleFixCategories = async () => {
    try {
      console.log('Corrigindo categorias...');
      await fixExistingCategories();
      // Recarregar dados após correção
      const [transacoes, categorias] = await Promise.all([
        db.transacoes.toArray(),
        db.categorias.toArray()
      ]);
      setTransactions(transacoes);
      setCategories(categorias);
      toast({
        title: "Categorias corrigidas",
        description: "As categorias foram corrigidas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao corrigir categorias:', error);
      toast({
        title: "Erro ao corrigir categorias",
        description: "Ocorreu um erro ao corrigir as categorias.",
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
    editCategory,
    deleteCategory,
    getBalance,
    getTransactionsByPeriod,
    exportData: handleExportData,
    importData: handleImportData,
    clearSampleData: handleClearSampleData,
    resetDatabase: handleResetDatabase,
    checkDatabaseStatus: handleCheckDatabaseStatus,
    fixCategories: handleFixCategories,
  };
}
