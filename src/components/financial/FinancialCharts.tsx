import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Transacao } from "@/lib/db";

interface FinancialChartsProps {
  transactions: Transacao[];
}

export function FinancialCharts({ transactions }: FinancialChartsProps) {
  const income = transactions
    .filter((t) => t.tipo === "entrada")
    .reduce((sum, t) => sum + t.valor, 0);
  
  const expenses = transactions
    .filter((t) => t.tipo === "saida")
    .reduce((sum, t) => sum + t.valor, 0);

  const pieData = [
    { name: "Receitas", value: income, color: "hsl(var(--income))" },
    { name: "Despesas", value: expenses, color: "hsl(var(--expense))" },
  ];

  const categoryExpenses = transactions
    .filter((t) => t.tipo === "saida")
    .reduce((acc, t) => {
      const categoryName = t.categoria || "Outros";
      acc[categoryName] = (acc[categoryName] || 0) + t.valor;
      return acc;
    }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryExpenses).map(([category, value]) => ({
    name: category,
    value,
  }));
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Entradas vs Saídas</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`R$ ${value.toFixed(2)}`, ""]}
                labelStyle={{ color: 'hsl(226 20% 15%)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-6 mt-4">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium">{entry.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Gastos por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: number) => [`R$ ${value.toFixed(2)}`, "Gasto"]}
                labelStyle={{ color: 'hsl(226 20% 15%)' }}
              />
              <Bar 
                dataKey="value" 
                radius={[4, 4, 0, 0]}
                fill="hsl(0 65% 55%)"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}