import React, { useState, useEffect, useMemo } from "react";
import { Processo } from "@/entities/Processo";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import ProcessosListOptimized from "../components/processos/ProcessosList.optimized";
import ProcessoForm from "../components/processos/ProcessoForm";
import ProcessoFilters from "../components/processos/ProcessoFilters";

const ITEMS_PER_PAGE = 20;

export default function ProcessosOptimized() {
  const [showForm, setShowForm] = useState(false);
  const [editingProcesso, setEditingProcesso] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState({
    status: "todos",
    advogado: "todos"
  });
  const [page, setPage] = useState(0);

  // Debounce da busca para evitar queries excessivas
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0); // Reset page quando busca muda
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Query otimizada com cache
  const { data: processos = [], isLoading, refetch } = useQuery({
    queryKey: ['processos', debouncedSearch, filters, page],
    queryFn: async () => {
      // Carregar todos os processos (idealmente deveria ter paginação no backend)
      const data = await Processo.list("-created_date");
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
  });

  // Aplicar filtros e paginação no cliente (memoizado para performance)
  const { filteredProcessos, totalPages } = useMemo(() => {
    let filtered = processos;

    // Filtro de busca
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(p => 
        p.titulo_processo?.toLowerCase().includes(searchLower) ||
        p.numero_processo?.toLowerCase().includes(searchLower) ||
        p.parte_autora?.toLowerCase().includes(searchLower) ||
        p.parte_re?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro de status
    if (filters.status !== "todos") {
      filtered = filtered.filter(p => p.status_processo === filters.status);
    }

    // Calcular paginação
    const total = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const start = page * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const paginated = filtered.slice(start, end);

    return {
      filteredProcessos: paginated,
      totalPages: total,
      totalItems: filtered.length
    };
  }, [processos, debouncedSearch, filters, page]);

  const handleSaveProcesso = async (processoData) => {
    try {
      if (editingProcesso) {
        await Processo.update(editingProcesso.id, processoData);
      } else {
        await Processo.create(processoData);
      }
      setShowForm(false);
      setEditingProcesso(null);
      refetch(); // Recarregar dados
    } catch (error) {
      console.error("Erro ao salvar processo:", error);
    }
  };

  const handleEditProcesso = (processo) => {
    setEditingProcesso(processo);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProcesso(null);
  };

  const nextPage = () => {
    if (page < totalPages - 1) {
      setPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevPage = () => {
    if (page > 0) {
      setPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Processos</h1>
            <p className="text-slate-600 text-lg">Gerencie todos os processos do escritório</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Processo
          </Button>
        </div>

        {showForm && (
          <ProcessoForm
            processo={editingProcesso}
            onSave={handleSaveProcesso}
            onCancel={handleCancelForm}
          />
        )}

        {!showForm && (
          <>
            {/* Filtros e Busca */}
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <Input
                        placeholder="Buscar por título, número, partes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 py-3 rounded-xl"
                      />
                    </div>
                  </div>
                  <ProcessoFilters filters={filters} setFilters={setFilters} />
                </div>
                
                {/* Contador de resultados */}
                {!isLoading && (
                  <div className="mt-4 text-sm text-slate-600">
                    Mostrando {filteredProcessos.length} de {processos.length} processos
                    {debouncedSearch && ` (filtrado por "${debouncedSearch}")`}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lista de Processos com Virtualização */}
            <ProcessosListOptimized
              processos={filteredProcessos}
              loading={isLoading}
              onEdit={handleEditProcesso}
            />

            {/* Paginação */}
            {totalPages > 1 && (
              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <Button
                      onClick={prevPage}
                      disabled={page === 0}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anterior
                    </Button>
                    
                    <div className="text-sm text-slate-600">
                      Página {page + 1} de {totalPages}
                    </div>
                    
                    <Button
                      onClick={nextPage}
                      disabled={page >= totalPages - 1}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      Próxima
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
