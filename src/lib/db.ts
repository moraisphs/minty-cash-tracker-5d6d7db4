import Dexie, { Table } from 'dexie';

export interface Transacao {
  id?: number;
  tipo: 'entrada' | 'saida';
  valor: number;
  data: Date;
  categoria?: string;
  descricao?: string;
}

export interface Categoria {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color?: string;
  budget_limit?: number;
  is_default: boolean;
}

export class MyCashDB extends Dexie {
  transacoes!: Table<Transacao>;
  categorias!: Table<Categoria>;

  constructor() {
    super('MyCashDB');
    
    // Versão 1: apenas transações
    this.version(1).stores({
      transacoes: '++id, tipo, valor, data, categoria, descricao'
    });
    
    // Versão 2: adiciona categorias
    this.version(2).stores({
      transacoes: '++id, tipo, valor, data, categoria, descricao',
      categorias: 'id, name, type, color, budget_limit, is_default'
    }).upgrade(async (tx) => {
      // Migrar dados existentes e adicionar categorias padrão
      try {
        console.log('Executando migração para versão 2...');
        console.log('Categorias padrão a serem adicionadas:', defaultCategories);
        await tx.table('categorias').bulkAdd(defaultCategories);
        console.log('Migração concluída com sucesso');
      } catch (error) {
        console.error('Erro na migração:', error);
      }
    });

    // Versão 3: corrige categorias existentes sem is_default
    this.version(3).stores({
      transacoes: '++id, tipo, valor, data, categoria, descricao',
      categorias: 'id, name, type, color, budget_limit, is_default'
    }).upgrade(async (tx) => {
      try {
        console.log('Executando migração para versão 3 - corrigindo is_default...');
        const existingCategories = await tx.table('categorias').toArray();
        console.log('Categorias existentes antes da correção:', existingCategories);
        
        for (const category of existingCategories) {
          // Verificar se é uma categoria padrão pelo nome
          const isDefaultCategory = defaultCategories.some(defaultCat => defaultCat.name === category.name);
          
          // Atualizar se is_default não está definido ou está incorreto
          if (category.is_default === undefined || category.is_default !== isDefaultCategory) {
            await tx.table('categorias').update(category.id, { is_default: isDefaultCategory });
            console.log(`Atualizada categoria ${category.name} com is_default: ${isDefaultCategory}`);
          }
        }
        console.log('Migração versão 3 concluída com sucesso');
      } catch (error) {
        console.error('Erro na migração versão 3:', error);
      }
    });
  }
}

export const db = new MyCashDB();

// Categorias padrão
const defaultCategories: Categoria[] = [
  { id: '1', name: 'Alimentação', type: 'expense', is_default: true },
  { id: '2', name: 'Transporte', type: 'expense', is_default: true },
  { id: '3', name: 'Moradia', type: 'expense', is_default: true },
  { id: '4', name: 'Lazer', type: 'expense', is_default: true },
  { id: '5', name: 'Saúde', type: 'expense', is_default: true },
  { id: '6', name: 'Educação', type: 'expense', is_default: true },
  { id: '7', name: 'Salário', type: 'income', is_default: true },
  { id: '8', name: 'Freelance', type: 'income', is_default: true },
  { id: '9', name: 'Investimentos', type: 'income', is_default: true },
  { id: '10', name: 'Outros', type: 'income', is_default: true },
];

// Função para inicializar dados de exemplo (apenas na primeira instalação)
export async function initializeSampleData() {
  try {
    console.log('=== INICIALIZANDO DADOS ===');
    
    const transactionCount = await db.transacoes.count();
    const categoryCount = await db.categorias.count();
    
    console.log('Contagem - Transações:', transactionCount, 'Categorias:', categoryCount);
    
    // Verificar marcador de primeira instalação
    const firstInstallMarker = localStorage.getItem('minty-first-install');
    console.log('Marcador primeira instalação:', firstInstallMarker);
    
    // Sempre garantir que as categorias existam
    if (categoryCount === 0) {
      console.log('Adicionando categorias padrão...');
      console.log('Categorias a serem adicionadas:', defaultCategories);
      await db.categorias.bulkAdd(defaultCategories);
      console.log('Categorias adicionadas com sucesso');
    } else {
      console.log('Categorias já existem');
      // Verificar se as categorias existentes têm is_default
      const existingCategories = await db.categorias.toArray();
      console.log('Categorias existentes:', existingCategories);
      
      // Corrigir categorias que não têm is_default definido
      await fixExistingCategories();
    }
    
    // Só adicionar transações de exemplo se for a primeira instalação
    const isFirstInstall = !firstInstallMarker;
    console.log('É primeira instalação?', isFirstInstall);
    
    if (isFirstInstall && transactionCount === 0) {
      console.log('Primeira instalação - Adicionando transações de exemplo...');
      const sampleData: Omit<Transacao, 'id'>[] = [
        {
          tipo: 'entrada',
          valor: 5000,
          data: new Date(),
          categoria: 'Salário',
          descricao: 'Salário mensal'
        },
        {
          tipo: 'saida',
          valor: 350,
          data: new Date(Date.now() - 86400000),
          categoria: 'Alimentação',
          descricao: 'Supermercado'
        },
        {
          tipo: 'saida',
          valor: 25,
          data: new Date(Date.now() - 172800000),
          categoria: 'Transporte',
          descricao: 'Uber'
        },
        {
          tipo: 'saida',
          valor: 1200,
          data: new Date(Date.now() - 259200000),
          categoria: 'Moradia',
          descricao: 'Aluguel'
        }
      ];

      await db.transacoes.bulkAdd(sampleData);
      console.log('Transações de exemplo adicionadas');
      
      // Marcar que a instalação inicial foi feita
      localStorage.setItem('minty-first-install', 'true');
      console.log('Marcador de primeira instalação definido');
    } else {
      console.log('Dados já existem ou não é primeira instalação');
    }
    
    console.log('=== FIM DA INICIALIZAÇÃO ===');
  } catch (error) {
    console.error('Erro ao inicializar dados:', error);
  }
}

// Função para exportar dados
export async function exportData() {
  const transacoes = await db.transacoes.toArray();
  const categorias = await db.categorias.toArray();
  const data = {
    transacoes,
    categorias,
    exportDate: new Date().toISOString(),
    version: '1.0'
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `mycash-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Função para importar dados
export async function importData(file: File): Promise<boolean> {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    if (!data.transacoes || !Array.isArray(data.transacoes)) {
      throw new Error('Formato de arquivo inválido');
    }
    
    // Limpar dados existentes
    await db.transacoes.clear();
    await db.categorias.clear();
    
    // Importar categorias se existirem
    if (data.categorias && Array.isArray(data.categorias)) {
      await db.categorias.bulkAdd(data.categorias);
    } else {
      // Se não houver categorias no arquivo, usar as padrão
      await db.categorias.bulkAdd(defaultCategories);
    }
    
    // Importar transações
    await db.transacoes.bulkAdd(data.transacoes);
    
    return true;
  } catch (error) {
    console.error('Erro ao importar dados:', error);
    return false;
  }
}

// Função para limpar dados fictícios
export async function clearSampleData() {
  try {
    await db.transacoes.clear();
    console.log('Dados fictícios removidos');
    return true;
  } catch (error) {
    console.error('Erro ao limpar dados fictícios:', error);
    return false;
  }
}

// Função para verificar se existem dados fictícios
export async function hasSampleData(): Promise<boolean> {
  try {
    const transactions = await db.transacoes.toArray();
    const sampleDescriptions = ['Salário mensal', 'Supermercado', 'Uber', 'Aluguel'];
    
    return transactions.some(t => 
      sampleDescriptions.includes(t.descricao || '')
    );
  } catch (error) {
    console.error('Erro ao verificar dados fictícios:', error);
    return false;
  }
}

// Função para resetar completamente o banco de dados
export async function resetDatabase() {
  try {
    console.log('=== RESETANDO BANCO DE DADOS ===');
    
    // Limpar todas as tabelas
    await db.transacoes.clear();
    await db.categorias.clear();
    
    // Limpar marcador de primeira instalação
    localStorage.removeItem('minty-first-install');
    
    console.log('Banco de dados resetado com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao resetar banco de dados:', error);
    return false;
  }
}

// Função para corrigir categorias existentes
export async function fixExistingCategories() {
  try {
    console.log('=== CORRIGINDO CATEGORIAS EXISTENTES ===');
    
    // Limpar todas as categorias existentes
    await db.categorias.clear();
    console.log('Categorias existentes removidas');
    
    // Recriar todas as categorias padrão com is_default: true
    const correctedDefaultCategories = defaultCategories.map(cat => ({
      ...cat,
      is_default: true
    }));
    
    await db.categorias.bulkAdd(correctedDefaultCategories);
    console.log('Categorias padrão recriadas com is_default: true');
    
    // Verificar resultado
    const correctedCategories = await db.categorias.toArray();
    console.log('Categorias após correção:', correctedCategories);
    console.log('Verificação is_default:', correctedCategories.map(cat => ({ 
      name: cat.name, 
      is_default: cat.is_default, 
      type: typeof cat.is_default 
    })));
    
    return true;
  } catch (error) {
    console.error('Erro ao corrigir categorias:', error);
    return false;
  }
}

// Função para verificar o status do banco de dados
export async function getDatabaseStatus() {
  try {
    const transactionCount = await db.transacoes.count();
    const categoryCount = await db.categorias.count();
    const firstInstallMarker = localStorage.getItem('minty-first-install');
    
    return {
      transactionCount,
      categoryCount,
      firstInstallMarker,
      hasFirstInstallMarker: !!firstInstallMarker
    };
  } catch (error) {
    console.error('Erro ao verificar status do banco:', error);
    return null;
  }
}
