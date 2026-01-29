import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecentProcesses({ processos, loading }) {
  const statusColors = {
    ativo: "bg-blue-100 text-blue-800",
    finalizado: "bg-green-100 text-green-800"
  };

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader className="pb-4 border-b border-slate-100">
        <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-900">
          <FileText className="w-6 h-6 text-slate-700" />
          Processos Recentes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="p-6 border-b border-slate-50 last:border-b-0">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <Skeleton className="h-5 w-64 mb-2" />
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            ))
          ) : processos.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum processo cadastrado ainda</p>
            </div>
          ) : (
            processos.map((processo) => (
              <div key={processo.id} className="p-6 border-b border-slate-50 last:border-b-0 hover:bg-slate-50 transition-colors duration-200">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1">
                      {processo.titulo_processo}
                    </h3>
                    <p className="text-sm text-slate-600 mb-1">
                      Processo: {processo.numero_processo}
                    </p>
                    <p className="text-sm text-slate-500">
                      {processo.parte_autora} vs {processo.parte_re}
                    </p>
                    {processo.link_pasta && (
                      <a 
                        href={processo.link_pasta} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-2"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Ver pasta
                      </a>
                    )}
                  </div>
                  <Badge className={statusColors[processo.status_processo]}>
                    {processo.status_processo === "ativo" ? "Ativo" : "Finalizado"}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}