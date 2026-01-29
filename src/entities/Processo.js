/**
 * Entidade Processo
 * Mock para desenvolvimento e testes
 */

// Dados mock para demonstração
const mockProcessos = [
  {
    id: '1',
    titulo_processo: 'Ação Trabalhista - Horas Extras',
    numero_processo: '0001234-56.2024.1.23.4567',
    status_processo: 'ativo',
    vara_comarca: 'Vara do Trabalho de São Paulo',
    parte_autora: 'João Silva',
    parte_re: 'Empresa XYZ LTDA',
    valor_causa: 50000,
    valor_total_honorarios: 5000,
    divisao_advogado1: 60,
    divisao_advogado2: 40,
    divisao_advogado3: 0,
    link_pasta: 'https://drive.google.com/drive/folders/exemplo1',
    created_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    titulo_processo: 'Indenização por Danos Morais',
    numero_processo: '0002345-67.2024.1.23.4567',
    status_processo: 'ativo',
    vara_comarca: 'Vara Cível de São Paulo',
    parte_autora: 'Maria Santos',
    parte_re: 'Banco ABC S.A.',
    valor_causa: 100000,
    valor_total_honorarios: 15000,
    divisao_advogado1: 50,
    divisao_advogado2: 50,
    divisao_advogado3: 0,
    link_pasta: 'https://drive.google.com/drive/folders/exemplo2',
    created_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    titulo_processo: 'Divórcio Litigioso',
    numero_processo: '0003456-78.2024.1.23.4567',
    status_processo: 'ativo',
    vara_comarca: 'Vara de Família de São Paulo',
    parte_autora: 'Carlos Oliveira',
    parte_re: 'Ana Oliveira',
    valor_causa: 75000,
    valor_total_honorarios: 8000,
    divisao_advogado1: 100,
    divisao_advogado2: 0,
    divisao_advogado3: 0,
    link_pasta: 'https://drive.google.com/drive/folders/exemplo3',
    created_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    titulo_processo: 'Recuperação Judicial',
    numero_processo: '0004567-89.2024.1.23.4567',
    status_processo: 'finalizado',
    vara_comarca: 'Vara Comercial de São Paulo',
    parte_autora: 'Empresa DEF LTDA',
    parte_re: 'Credores',
    valor_causa: 500000,
    valor_total_honorarios: 50000,
    divisao_advogado1: 40,
    divisao_advogado2: 35,
    divisao_advogado3: 25,
    link_pasta: 'https://drive.google.com/drive/folders/exemplo4',
    created_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    titulo_processo: 'Ação de Cobrança',
    numero_processo: '0005678-90.2024.1.23.4567',
    status_processo: 'ativo',
    vara_comarca: 'Vara Cível de São Paulo',
    parte_autora: 'Fornecedor GHI',
    parte_re: 'Cliente JKL',
    valor_causa: 25000,
    valor_total_honorarios: 3000,
    divisao_advogado1: 70,
    divisao_advogado2: 30,
    divisao_advogado3: 0,
    link_pasta: 'https://drive.google.com/drive/folders/exemplo5',
    created_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    titulo_processo: 'Mandado de Segurança',
    numero_processo: '0006789-01.2024.1.23.4567',
    status_processo: 'ativo',
    vara_comarca: 'Tribunal de Justiça de São Paulo',
    parte_autora: 'Pessoa Física',
    parte_re: 'Órgão Público',
    valor_causa: 50000,
    valor_total_honorarios: 4000,
    divisao_advogado1: 100,
    divisao_advogado2: 0,
    divisao_advogado3: 0,
    link_pasta: 'https://drive.google.com/drive/folders/exemplo6',
    created_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    titulo_processo: 'Ação de Nulidade de Contrato',
    numero_processo: '0007890-12.2024.1.23.4567',
    status_processo: 'ativo',
    vara_comarca: 'Vara Cível de São Paulo',
    parte_autora: 'Pessoa A',
    parte_re: 'Pessoa B',
    valor_causa: 150000,
    valor_total_honorarios: 18000,
    divisao_advogado1: 50,
    divisao_advogado2: 50,
    divisao_advogado3: 0,
    link_pasta: 'https://drive.google.com/drive/folders/exemplo7',
    created_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '8',
    titulo_processo: 'Ação de Despejo',
    numero_processo: '0008901-23.2024.1.23.4567',
    status_processo: 'finalizado',
    vara_comarca: 'Vara Cível de São Paulo',
    parte_autora: 'Proprietário',
    parte_re: 'Inquilino',
    valor_causa: 30000,
    valor_total_honorarios: 3500,
    divisao_advogado1: 100,
    divisao_advogado2: 0,
    divisao_advogado3: 0,
    link_pasta: 'https://drive.google.com/drive/folders/exemplo8',
    created_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Simular delay de rede
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const Processo = {
  /**
   * Listar processos com ordenação
   * @param {string} sort - Campo de ordenação (ex: "-created_date")
   * @returns {Promise<Array>} Lista de processos
   */
  list: async (sort = '-created_date') => {
    await delay(300); // Simular latência de rede
    
    let result = [...mockProcessos];
    
    // Aplicar ordenação
    if (sort === '-created_date') {
      result.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    } else if (sort === 'created_date') {
      result.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    }
    
    return result;
  },

  /**
   * Obter um processo por ID
   * @param {string} id - ID do processo
   * @returns {Promise<Object>} Processo encontrado
   */
  get: async (id) => {
    await delay(200);
    return mockProcessos.find(p => p.id === id);
  },

  /**
   * Criar novo processo
   * @param {Object} data - Dados do processo
   * @returns {Promise<Object>} Processo criado
   */
  create: async (data) => {
    await delay(500);
    const newProcesso = {
      id: String(mockProcessos.length + 1),
      ...data,
      created_date: new Date().toISOString(),
    };
    mockProcessos.unshift(newProcesso);
    return newProcesso;
  },

  /**
   * Atualizar processo
   * @param {string} id - ID do processo
   * @param {Object} data - Dados a atualizar
   * @returns {Promise<Object>} Processo atualizado
   */
  update: async (id, data) => {
    await delay(500);
    const index = mockProcessos.findIndex(p => p.id === id);
    if (index !== -1) {
      mockProcessos[index] = { ...mockProcessos[index], ...data };
      return mockProcessos[index];
    }
    throw new Error(`Processo ${id} não encontrado`);
  },

  /**
   * Deletar processo
   * @param {string} id - ID do processo
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    await delay(500);
    const index = mockProcessos.findIndex(p => p.id === id);
    if (index !== -1) {
      mockProcessos.splice(index, 1);
    }
  },
};
