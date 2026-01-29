import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertTriangle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isBefore, addDays, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function UpcomingDeadlines({ prazos, loading }) {
  const getUpcomingPrazos = () => {
    return prazos
      .filter(p => {
        const dataLimite = new Date(p.data_limite);
        const em10Dias = addDays(new Date(), 10);
        return isBefore(new Date(), dataLimite) && 
               isBefore(dataLimite, em10Dias) && 
               p.status !== "concluido";
      })
      .sort((a, b) => new Date(a.data_limite) - new Date(b.data_limite))
      .slice(0, 6);
  };

  const getStatusColor = (status) => {
    const colors = {
      aberto: "bg-red-100 text-red-800",
      em_andamento: "bg-yellow-100 text-yellow-800", 
      concluido: "bg-green-100 text-green-800"
    };
    return colors[status] || colors.aberto;
  };

  const getUrgencyLevel = (dataLimite) => {
    const hoje = new Date();
    const limite = new Date(dataLimite);
    const diasRestantes = differenceInDays(limite, hoje);
    
    if (diasRestantes <= 2) return { level: "urgent", color: "text-red-600", icon: AlertTriangle };
    if (diasRestantes <= 5) return { level: "warning", color: "text-amber-600", icon: Clock };
    return { level: "normal", color: "text-blue-600", icon: Calendar };
  };

  const upcomingPrazos = getUpcomingPrazos();

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader className="pb-4 border-b border-slate-100">
        <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-900">
          <Calendar className="w-6 h-6 text-slate-700" />
          Próximos Prazos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="p-6 border-b border-slate-50 last:border-b-0">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            ))
          ) : upcomingPrazos.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum prazo próximo</p>
            </div>
          ) : (
            upcomingPrazos.map((prazo) => {
              const urgency = getUrgencyLevel(prazo.data_limite);
              const UrgencyIcon = urgency.icon;
              
              return (
                <div key={prazo.id} className="p-6 border-b border-slate-50 last:border-b-0 hover:bg-slate-50 transition-colors duration-200">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-2 mb-2">
                        <UrgencyIcon className={`w-4 h-4 mt-1 ${urgency.color}`} />
                        <h3 className="font-semibold text-slate-900">
                          {prazo.descricao_prazo}
                        </h3>
                      </div>
                      <p className="text-sm text-slate-600 mb-1">
                        {format(new Date(prazo.data_limite), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                      <p className="text-xs text-slate-500">
                        Responsável: {prazo.responsavel}
                      </p>
                    </div>
                    <Badge className={getStatusColor(prazo.status)}>
                      {prazo.status === "aberto" && "Aberto"}
                      {prazo.status === "em_andamento" && "Em Andamento"}
                      {prazo.status === "concluido" && "Concluído"}
                    </Badge>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}