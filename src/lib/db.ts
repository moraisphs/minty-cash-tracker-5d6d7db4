import Dexie, { Table } from 'dexie';

export interface Transacao {
  id?: number;
  tipo: 'entrada' | 'saida';
  valor: number;
  data: Date;
  categoria?: string;
  descricao?: string;
}

export class MyCashDB extends Dexie {
  transacoes!: Table<Transacao>;

  constructor() {
    super('MyCashDB');
    this.version(1).stores({
      transacoes: '++id, tipo, valor, data, categoria, descricao'
    });
  }
}

export const db = new MyCashDB();

// Função para inicializar dados de exemplo
export async function initializeSampleData() {
  const count = await db.transacoes.count();
  
  if (count === 0) {
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
  }
}

// Função para exportar dados
export async function exportData() {
  const transacoes = await db.transacoes.toArray();
  const data = {
    transacoes,
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
    
    // Importar novos dados
    await db.transacoes.bulkAdd(data.transacoes);
    
    return true;
  } catch (error) {
    console.error('Erro ao importar dados:', error);
    return false;
  }
}
