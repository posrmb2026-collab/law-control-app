import { QueryClient } from '@tanstack/react-query';


export const queryClientInstance = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 1,
			// Cache otimizado para alta performance
			staleTime: 5 * 60 * 1000, // 5 minutos - dados considerados frescos
			cacheTime: 10 * 60 * 1000, // 10 minutos - dados mantidos em cache
			refetchOnMount: false, // Não refetch se dados estão em cache
			refetchOnReconnect: false, // Não refetch ao reconectar
		},
	},
});