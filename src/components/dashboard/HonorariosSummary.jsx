import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function HonorariosSummary({ processos, loading }) {
  const getHonorariosData = () => {
    const advogados = {
      "Advogado 1": 0,
      "Advogado 2": 0,
      "Advogado 3": 0
    };

    processos.forEach(processo => {
      const valorTotal = processo.valor_total_honorarios || 0;
      if (processo.divisao_advogado1 > 0) {
        advogados["Advogado 1"] += (valorTotal * processo.divisao_advogado1) / 100;
      }
      if (processo.divisao_advogado2 > 0) {
        advogados["Advogado 2"] += (valorTotal * processo.divisao_advogado2) / 100;
      }
      if (processo.divisao_advogado3 > 0) {
        advogados["Advogado 3"] += (valorTotal * processo.divisao_advogado3) / 100;
      }
    });

    return advogados;
  };

  const honorarios = getHonorariosData();
  const colors = ["bg-blue-500", "bg-emerald-500", "bg-purple-500"];

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader className="pb-4 border-b border-slate-100">
        <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-900">
          <DollarSign className="w-6 h-6 text-slate-700" />
          Resumo de Honorários
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(honorarios).map(([advogado, valor], index) => (
              <div key={advogado} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colors[index]} bg-opacity-20`}>
                    <Users className={`w-4 h-4 ${colors[index].replace('bg-', 'text-')}`} />
                  </div>
                  <span className="font-medium text-slate-900">{advogado}</span>
                </div>
                <span className="font-bold text-slate-900">
                  R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}