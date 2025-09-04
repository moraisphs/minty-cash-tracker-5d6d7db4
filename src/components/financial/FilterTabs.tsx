import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FilterTabsProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function FilterTabs({ value, onValueChange }: FilterTabsProps) {
  return (
    <Tabs value={value} onValueChange={onValueChange} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="week">Semana</TabsTrigger>
        <TabsTrigger value="month">Mês</TabsTrigger>
        <TabsTrigger value="quarter">Trimestre</TabsTrigger>
        <TabsTrigger value="year">Ano</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}