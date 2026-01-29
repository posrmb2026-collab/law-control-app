import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle2, Clock, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatsOverview({ stats, loading }) {
  const statsData = [
    {
      title: "Total de Processos",
      value: stats.totalProcessos,
      icon: FileText,
      color: "bg-blue-500",
      textColor: "text-blue-600"
    },
    {
      title: "Processos Ativos",
      value: stats.processosAtivos,
      icon: Clock,
      color: "bg-amber-500",
      textColor: "text-amber-600"
    },
    {
      title: "Processos Finalizados",
      value: stats.processosFinalizados,
      icon: CheckCircle2,
      color: "bg-green-500",
      textColor: "text-green-600"
    },
    {
      title: "Honorários Totais",
      value: `R$ ${stats.valorTotalHonorarios.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "bg-emerald-500",
      textColor: "text-emerald-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat) => (
        <Card key={stat.title} className="relative overflow-hidden bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300">
          <div className={`absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 ${stat.color} rounded-full opacity-10`} />
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                {loading ? (
                  <Skeleton className="h-8 w-20 mt-2" />
                ) : (
                  <CardTitle className="text-3xl font-bold mt-2 text-slate-900">
                    {stat.value}
                  </CardTitle>
                )}
              </div>
              <div className={`p-3 rounded-xl ${stat.color} bg-opacity-20`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}