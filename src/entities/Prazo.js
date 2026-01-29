/**
 * Entidade Prazo
 * Mock para desenvolvimento e testes
 */

// Dados mock para demonstração
const mockPrazos = [
  {
    id: '1',
    titulo: 'Prazo para Contestação',
    descricao: 'Prazo para contestar ação trabalhista',
    data_limite: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 dias
    status: 'pendente',
    processo_id: '1',
    urgencia: 'alta',
    created_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    titulo: 'Prazo para Recurso',
    descricao: 'Prazo para interpor recurso de apelação',
    data_limite: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 dias
    status: 'pendente',
    processo_id: '2',
    urgencia: 'média',
    created_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    titulo: 'Audiência Inicial',
    descricao: 'Audiência inicial do processo de divórcio',
    data_limite: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 dias
    status: 'pendente',
    processo_id: '3',
    urgencia: 'média',
    created_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    titulo: 'Julgamento da Recuperação',
    descricao: 'Data do julgamento da recuperação judicial',
    data_limite: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 dias
    status: 'concluido',
    processo_id: '4',
    urgencia: 'alta',
    created_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    titulo: 'Prazo para Pagamento',
    descricao: 'Prazo para pagamento da dívida conforme sentença',
    data_limite: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 dia
    status: 'pendente',
    processo_id: '5',
    urgencia: 'crítica',
    created_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    titulo: 'Prazo para Manifestação',
    descricao: 'Prazo para manifestação sobre o mandado de segurança',
    data_limite: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias
    status: 'pendente',
    processo_id: '6',
    urgencia: 'alta',
    created_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    titulo: 'Prazo para Apresentação de Provas',
    descricao: 'Prazo para apresentação de provas documentais',
    data_limite: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 dias
    status: 'pendente',
    processo_id: '7',
    urgencia: 'média',
    created_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '8',
    titulo: 'Prazo para Desocupação',
    descricao: 'Prazo para desocupação do imóvel',
    data_limite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
    status: 'concluido',
    processo_id: '8',
    urgencia: 'baixa',
    created_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Simular delay de rede
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const Prazo = {
  /**
   * Listar prazos com ordenação
   * @param {string} sort - Campo de ordenação (ex: "-created_date")
   * @returns {Promise<Array>} Lista de prazos
   */
  list: async (sort = '-created_date') => {
    await delay(250); // Simular latência de rede
    
    let result = [...mockPrazos];
    
    // Aplicar ordenação
    if (sort === '-created_date') {
      result.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    } else if (sort === 'created_date') {
      result.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    } else if (sort === 'data_limite') {
      result.sort((a, b) => new Date(a.data_limite) - new Date(b.data_limite));
    }
    
    return result;
  },

  /**
   * Obter um prazo por ID
   * @param {string} id - ID do prazo
   * @returns {Promise<Object>} Prazo encontrado
   */
  get: async (id) => {
    await delay(200);
    return mockPrazos.find(p => p.id === id);
  },

  /**
   * Criar novo prazo
   * @param {Object} data - Dados do prazo
   * @returns {Promise<Object>} Prazo criado
   */
  create: async (data) => {
    await delay(500);
    const newPrazo = {
      id: String(mockPrazos.length + 1),
      ...data,
      created_date: new Date().toISOString(),
    };
    mockPrazos.unshift(newPrazo);
    return newPrazo;
  },

  /**
   * Atualizar prazo
   * @param {string} id - ID do prazo
   * @param {Object} data - Dados a atualizar
   * @returns {Promise<Object>} Prazo atualizado
   */
  update: async (id, data) => {
    await delay(500);
    const index = mockPrazos.findIndex(p => p.id === id);
    if (index !== -1) {
      mockPrazos[index] = { ...mockPrazos[index], ...data };
      return mockPrazos[index];
    }
    throw new Error(`Prazo ${id} não encontrado`);
  },

  /**
   * Deletar prazo
   * @param {string} id - ID do prazo
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    await delay(500);
    const index = mockPrazos.findIndex(p => p.id === id);
    if (index !== -1) {
      mockPrazos.splice(index, 1);
    }
  },
};
