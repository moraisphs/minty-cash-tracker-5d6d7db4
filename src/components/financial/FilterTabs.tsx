import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FilterTabsProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function FilterTabs({ value, onValueChange }: FilterTabsProps) {
  return (
    <Tabs value={value} onValueChange={onValueChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
        <TabsTrigger value="week" className="text-xs sm:text-sm py-2">Semana</TabsTrigger>
        <TabsTrigger value="month" className="text-xs sm:text-sm py-2">Mês</TabsTrigger>
        <TabsTrigger value="quarter" className="text-xs sm:text-sm py-2">Trimestre</TabsTrigger>
        <TabsTrigger value="year" className="text-xs sm:text-sm py-2">Ano</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}