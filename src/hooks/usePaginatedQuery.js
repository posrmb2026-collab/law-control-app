import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook customizado para queries paginadas com performance otimizada
 * @param {string} queryKey - Chave única para a query
 * @param {Function} queryFn - Função que retorna os dados (recebe page e limit)
 * @param {number} initialLimit - Limite inicial de itens por página
 */
export function usePaginatedQuery(queryKey, queryFn, initialLimit = 20) {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(initialLimit);

  const query = useQuery({
    queryKey: [queryKey, page, limit],
    queryFn: () => queryFn(page, limit),
    keepPreviousData: true, // Mantém dados anteriores durante carregamento
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const nextPage = () => setPage(prev => prev + 1);
  const prevPage = () => setPage(prev => Math.max(0, prev - 1));
  const goToPage = (pageNumber) => setPage(pageNumber);
  const resetPage = () => setPage(0);

  return {
    ...query,
    page,
    limit,
    nextPage,
    prevPage,
    goToPage,
    resetPage,
    setLimit,
  };
}
