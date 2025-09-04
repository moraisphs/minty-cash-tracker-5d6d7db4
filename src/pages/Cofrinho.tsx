import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PiggyBank, Target, TrendingUp, Calendar, Plus, Minus } from "lucide-react";
import { useIndexedDB } from "@/hooks/useIndexedDB";
import { useToast } from "@/hooks/use-toast";

interface MetaEconomia {
  id: string;
  nome: string;
  valorObjetivo: number;
  valorAtual: number;
  dataLimite: string;
  descricao?: string;
  cor: string;
  icone: string;
}

export default function Cofrinho() {
  const { transactions, getBalance } = useIndexedDB();
  const { toast } = useToast();
  const [metas, setMetas] = useState<MetaEconomia[]>([]);
  const [novaMeta, setNovaMeta] = useState({
    nome: "",
    valorObjetivo: "",
    dataLimite: "",
    descricao: "",
    cor: "#3B82F6",
    icone: "PiggyBank"
  });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const cores = [
    "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", 
    "#06B6D4", "#84CC16", "#F97316", "#EC4899", "#6366F1"
  ];

  const icones = [
    "PiggyBank", "Target", "Home", "Car", "Plane", "Gift", 
    "Heart", "BookOpen", "Smartphone", "Laptop"
  ];

  // Carregar metas do localStorage
  useEffect(() => {
    const metasSalvas = localStorage.getItem('metas-economia');
    if (metasSalvas) {
      setMetas(JSON.parse(metasSalvas));
    }
  }, []);

  // Salvar metas no localStorage
  useEffect(() => {
    localStorage.setItem('metas-economia', JSON.stringify(metas));
  }, [metas]);

  // Calcular economia total
  const { balance } = getBalance();
  const economiaTotal = Math.max(0, balance);

  // Adicionar nova meta
  const adicionarMeta = () => {
    if (!novaMeta.nome || !novaMeta.valorObjetivo || !novaMeta.dataLimite) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, valor objetivo e data limite.",
        variant: "destructive",
      });
      return;
    }

    const meta: MetaEconomia = {
      id: Date.now().toString(),
      nome: novaMeta.nome,
      valorObjetivo: parseFloat(novaMeta.valorObjetivo),
      valorAtual: 0,
      dataLimite: novaMeta.dataLimite,
      descricao: novaMeta.descricao,
      cor: novaMeta.cor,
      icone: novaMeta.icone
    };

    setMetas([...metas, meta]);
    setNovaMeta({
      nome: "",
      valorObjetivo: "",
      dataLimite: "",
      descricao: "",
      cor: "#3B82F6",
      icone: "PiggyBank"
    });
    setMostrarFormulario(false);

    toast({
      title: "Meta criada!",
      description: `A meta "${meta.nome}" foi adicionada com sucesso.`,
    });
  };

  // Adicionar valor à meta
  const adicionarValor = (metaId: string, valor: number) => {
    if (valor <= 0) return;

    setMetas(metas.map(meta => 
      meta.id === metaId 
        ? { ...meta, valorAtual: Math.min(meta.valorAtual + valor, meta.valorObjetivo) }
        : meta
    ));

    toast({
      title: "Valor adicionado!",
      description: `R$ ${valor.toFixed(2)} foi adicionado à meta.`,
    });
  };

  // Remover valor da meta
  const removerValor = (metaId: string, valor: number) => {
    if (valor <= 0) return;

    setMetas(metas.map(meta => 
      meta.id === metaId 
        ? { ...meta, valorAtual: Math.max(meta.valorAtual - valor, 0) }
        : meta
    ));

    toast({
      title: "Valor removido!",
      description: `R$ ${valor.toFixed(2)} foi removido da meta.`,
    });
  };

  // Excluir meta
  const excluirMeta = (metaId: string) => {
    setMetas(metas.filter(meta => meta.id !== metaId));
    toast({
      title: "Meta excluída!",
      description: "A meta foi removida com sucesso.",
    });
  };

  // Calcular progresso da meta
  const calcularProgresso = (meta: MetaEconomia) => {
    return Math.min((meta.valorAtual / meta.valorObjetivo) * 100, 100);
  };

  // Verificar se a meta foi atingida
  const metaAtingida = (meta: MetaEconomia) => {
    return meta.valorAtual >= meta.valorObjetivo;
  };

  // Calcular dias restantes
  const diasRestantes = (dataLimite: string) => {
    const hoje = new Date();
    const limite = new Date(dataLimite);
    const diffTime = limite.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-accent/5 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-3">
              <PiggyBank className="h-8 w-8" />
              Meu Cofrinho
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Monitore suas metas de economia e veja seu progresso
            </p>
          </div>
          
          <Button 
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Meta
          </Button>
        </div>

        {/* Resumo Geral */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Economia Total</CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {economiaTotal.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Saldo atual disponível
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Metas Ativas</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metas.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {metas.filter(meta => !metaAtingida(meta)).length} em andamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor em Metas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {metas.reduce((total, meta) => total + meta.valorAtual, 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total investido nas metas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Formulário de Nova Meta */}
        {mostrarFormulario && (
          <Card>
            <CardHeader>
              <CardTitle>Criar Nova Meta de Economia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Meta</Label>
                  <Input
                    id="nome"
                    placeholder="Ex: Viagem para Europa"
                    value={novaMeta.nome}
                    onChange={(e) => setNovaMeta({...novaMeta, nome: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor Objetivo (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    placeholder="5000.00"
                    value={novaMeta.valorObjetivo}
                    onChange={(e) => setNovaMeta({...novaMeta, valorObjetivo: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data">Data Limite</Label>
                  <Input
                    id="data"
                    type="date"
                    value={novaMeta.dataLimite}
                    onChange={(e) => setNovaMeta({...novaMeta, dataLimite: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cor">Cor</Label>
                  <div className="flex gap-2">
                    {cores.map(cor => (
                      <button
                        key={cor}
                        className={`w-8 h-8 rounded-full border-2 ${
                          novaMeta.cor === cor ? 'border-foreground' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: cor }}
                        onClick={() => setNovaMeta({...novaMeta, cor})}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição (opcional)</Label>
                <Input
                  id="descricao"
                  placeholder="Descreva sua meta..."
                  value={novaMeta.descricao}
                  onChange={(e) => setNovaMeta({...novaMeta, descricao: e.target.value})}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={adicionarMeta} className="flex-1">
                  Criar Meta
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setMostrarFormulario(false)}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Metas */}
        <div className="space-y-4">
          {metas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <PiggyBank className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma meta criada</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Crie sua primeira meta de economia para começar a guardar dinheiro
                </p>
                <Button onClick={() => setMostrarFormulario(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeira Meta
                </Button>
              </CardContent>
            </Card>
          ) : (
            metas.map((meta) => {
              const progresso = calcularProgresso(meta);
              const atingida = metaAtingida(meta);
              const dias = diasRestantes(meta.dataLimite);
              
              return (
                <Card key={meta.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-2 rounded-full"
                          style={{ backgroundColor: meta.cor + '20' }}
                        >
                          <PiggyBank className="h-5 w-5" style={{ color: meta.cor }} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{meta.nome}</CardTitle>
                          {meta.descricao && (
                            <p className="text-sm text-muted-foreground">{meta.descricao}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {atingida && (
                          <Badge className="bg-green-100 text-green-800">
                            Concluída!
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => excluirMeta(meta.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span>{progresso.toFixed(1)}%</span>
                      </div>
                      <Progress value={progresso} className="h-2" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>R$ {meta.valorAtual.toFixed(2)}</span>
                        <span>R$ {meta.valorObjetivo.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {dias > 0 ? `${dias} dias restantes` : 'Prazo vencido'}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const valor = prompt('Valor a adicionar (R$):');
                            if (valor) adicionarValor(meta.id, parseFloat(valor));
                          }}
                          className="flex-1"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Adicionar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const valor = prompt('Valor a remover (R$):');
                            if (valor) removerValor(meta.id, parseFloat(valor));
                          }}
                          className="flex-1"
                        >
                          <Minus className="h-4 w-4 mr-1" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
