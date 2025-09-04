import { useEffect, useState } from "react";
import { Wallet, TrendingUp, PiggyBank, Shield } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 5000; // 5 segundos
    const interval = 50; // Atualizar a cada 50ms
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          onComplete();
          return 100;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl text-center space-y-8">
        {/* Logo e Título */}
        <div className="space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center shadow-2xl">
            <Wallet className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Minty Cash Tracker
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transforme sua vida financeira com inteligência e simplicidade
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="flex flex-col items-center space-y-3 p-4 rounded-lg bg-card/50 backdrop-blur">
            <div className="p-3 rounded-lg bg-income-light">
              <Wallet className="h-6 w-6 text-income" />
            </div>
            <h3 className="font-semibold">Controle Total</h3>
            <p className="text-sm text-muted-foreground text-center">
              Gerencie receitas, despesas e metas em um só lugar
            </p>
          </div>

          <div className="flex flex-col items-center space-y-3 p-4 rounded-lg bg-card/50 backdrop-blur">
            <div className="p-3 rounded-lg bg-expense-light">
              <TrendingUp className="h-6 w-6 text-expense" />
            </div>
            <h3 className="font-semibold">Relatórios Inteligentes</h3>
            <p className="text-sm text-muted-foreground text-center">
              Insights automáticos e visualizações claras
            </p>
          </div>

          <div className="flex flex-col items-center space-y-3 p-4 rounded-lg bg-card/50 backdrop-blur">
            <div className="p-3 rounded-lg bg-primary/10">
              <PiggyBank className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Metas & Conquistas</h3>
            <p className="text-sm text-muted-foreground text-center">
              Acompanhe seus objetivos financeiros
            </p>
          </div>

          <div className="flex flex-col items-center space-y-3 p-4 rounded-lg bg-card/50 backdrop-blur">
            <div className="p-3 rounded-lg bg-accent/10">
              <Shield className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-semibold">Seguro & Privado</h3>
            <p className="text-sm text-muted-foreground text-center">
              Seus dados protegidos e organizados
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Carregando...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
