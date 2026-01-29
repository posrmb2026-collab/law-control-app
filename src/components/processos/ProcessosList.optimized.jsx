import React, { useRef, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, Edit, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useVirtualizer } from '@tanstack/react-virtual';

// Memoizar o card individual para evitar re-renders desnecessários
const ProcessoCard = memo(({ processo, onEdit }) => {
  const statusColors = {
    ativo: "bg-blue-100 text-blue-800 border-blue-200",
    finalizado: "bg-green-100 text-green-800 border-green-200"
  };

  return (
    <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start gap-6">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {processo.titulo_processo}
                </h3>
                <p className="text-slate-600 font-medium mb-1">
                  Processo: {processo.numero_processo}
                </p>
                <p className="text-slate-500">
                  <span className="font-medium">Vara/Comarca:</span> {processo.vara_comarca}
                </p>
              </div>
              <Badge className={`${statusColors[processo.status_processo]} border`}>
                {processo.status_processo === "ativo" ? "Ativo" : "Finalizado"}
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Partes do Processo</p>
                <p className="text-slate-900 font-medium">
                  {processo.parte_autora} <span className="text-slate-500">vs</span> {processo.parte_re}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Valor da Causa</p>
                <p className="text-slate-900 font-medium">
                  {processo.valor_causa ? 
                    `R$ ${processo.valor_causa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                    : 'Não informado'
                  }
                </p>
              </div>
            </div>

            {processo.valor_total_honorarios > 0 && (
              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Honorários: R$ {processo.valor_total_honorarios.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h4>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  {processo.divisao_advogado1 > 0 && (
                    <div>
                      <span className="text-slate-500">Advogado 1:</span>
                      <span className="font-medium text-slate-900 ml-1">{processo.divisao_advogado1}%</span>
                    </div>
                  )}
                  {processo.divisao_advogado2 > 0 && (
                    <div>
                      <span className="text-slate-500">Advogado 2:</span>
                      <span className="font-medium text-slate-900 ml-1">{processo.divisao_advogado2}%</span>
                    </div>
                  )}
                  {processo.divisao_advogado3 > 0 && (
                    <div>
                      <span className="text-slate-500">Advogado 3:</span>
                      <span className="font-medium text-slate-900 ml-1">{processo.divisao_advogado3}%</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button
                onClick={() => onEdit(processo)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Editar
              </Button>
              {processo.link_pasta && (
                <a
                  href={processo.link_pasta}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Ver Pasta
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ProcessoCard.displayName = 'ProcessoCard';

export default function ProcessosListOptimized({ processos, loading, onEdit }) {
  const parentRef = useRef(null);

  // Configurar virtualização
  const rowVirtualizer = useVirtualizer({
    count: processos.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 280, // Altura estimada de cada card
    overscan: 5, // Renderizar 5 itens extras fora da viewport
  });

  if (loading) {
    return (
      <div className="space-y-6">
        {Array(5).fill(0).map((_, i) => (
          <Card key={i} className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex justify-between items-start gap-6">
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-6 w-64" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-72" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (processos.length === 0) {
    return (
      <Card className="bg-white shadow-lg border-0">
        <CardContent className="p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-600 mb-2">Nenhum processo encontrado</h3>
          <p className="text-slate-500">Comece adicionando um novo processo ao sistema.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      ref={parentRef}
      className="space-y-6"
      style={{
        height: '800px',
        overflow: 'auto',
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const processo = processos[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <div className="pb-6">
                <ProcessoCard processo={processo} onEdit={onEdit} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
