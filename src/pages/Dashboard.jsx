import React, { useState, useEffect } from "react";
import { Processo } from "@/entities/Processo";
import { Prazo } from "@/entities/Prazo";
import { useQuery } from "@tanstack/react-query";
import { isBefore, addDays } from "date-fns";
import { Clock, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

import StatsOverview from "../components/dashboard/StatsOverview";
import RecentProcesses from "../components/dashboard/RecentProcesses";
import UpcomingDeadlines from "../components/dashboard/UpcomingDeadlines";
import HonorariosSummary from "../components/dashboard/HonorariosSummary";

export default function Dashboard() {
  // Query otimizada para processos recentes (apenas os 5 mais recentes)
  const { data: processosData, isLoading: loadingProcessos } = useQuery({
    queryKey: ['processos-recentes'],
    queryFn: async () => {
      // Idealmente, o backend deveria suportar limit/offset
      // Por enquanto, vamos carregar e limitar no cliente
      const data = await Processo.list("-created_date");
      return data.slice(0, 50); // Limita a 50 mais recentes para cálculos
    },
    staleTime: 5 * 60 * 1000, // Cache de 5 minutos
  });

  // Query otimizada para prazos urgentes (apenas próximos 30 dias)
  const { data: prazosData, isLoading: loadingPrazos } = useQuery({
    queryKey: ['prazos-urgentes'],
    queryFn: async () => {
      const data = await Prazo.list("-created_date");
      // Filtrar apenas prazos dos próximos 30 dias
      const em30Dias = addDays(new Date(), 30);
      return data.filter(p => {
        const dataLimite = new Date(p.data_limite);
        return isBefore(new Date(), dataLimite) && isBefore(dataLimite, em30Dias);
      }).slice(0, 20); // Limita a 20 prazos mais próximos
    },
    staleTime: 2 * 60 * 1000, // Cache de 2 minutos (mais crítico)
  });

  const processos = processosData || [];
  const prazos = prazosData || [];
  const loading = loadingProcessos || loadingPrazos;

  // Memoizar cálculos de estatísticas para evitar recalcular a cada render
  const stats = React.useMemo(() => {
    const processosAtivos = processos.filter(p => p.status_processo === "ativo");
    const processosFinalizados = processos.filter(p => p.status_processo === "finalizado");
    const prazosVencendoEm5Dias = prazos.filter(p => {
      const dataLimite = new Date(p.data_limite);
      const em5Dias = addDays(new Date(), 5);
      return isBefore(new Date(), dataLimite) && isBefore(dataLimite, em5Dias) && p.status !== "concluido";
    });
    const valorTotalHonorarios = processos.reduce((sum, p) => sum + (p.valor_total_honorarios || 0), 0);

    return {
      totalProcessos: processos.length,
      processosAtivos: processosAtivos.length,
      processosFinalizados: processosFinalizados.length,
      prazosUrgentes: prazosVencendoEm5Dias.length,
      valorTotalHonorarios
    };
  }, [processos, prazos]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
            <p className="text-slate-600 text-lg">Visão geral do escritório de advocacia</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock className="w-4 h-4" />
            Atualizado agora
          </div>
        </div>

        {/* Stats Cards */}
        <StatsOverview stats={stats} loading={loading} />

        {/* Alertas de Prazo */}
        {stats.prazosUrgentes > 0 && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <AlertDescription className="text-amber-800 font-medium">
              Atenção! Você tem {stats.prazosUrgentes} prazo(s) vencendo nos próximos 5 dias.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-8">
            <RecentProcesses processos={processos.slice(0, 5)} loading={loading} />
            <UpcomingDeadlines prazos={prazos} loading={loading} />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <HonorariosSummary processos={processos} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}
