import type { ItemInterno, Recurso, Repositorio } from './types';

/**
 * Dados de exemplo do mapa — os mesmos da tela HTML que esta substitui. Com o
 * inventário real, troque por uma chamada à API (ver `useProvisioningMap`).
 */

/** Sigla → nome do serviço Núclea. */
export const SERVICOS: Record<string, string> = {
  ANF: 'Antifraude',
  BTG: 'Bitrago',
  ONB: 'Onboarding',
  PAG: 'Pagamentos',
  PLT: 'Plataforma'
};

export const RECURSOS: Recurso[] = [
  {
    nome: 'anf-eventos-fila',
    servico: 'ANF',
    oferta: 'Amazon SQS',
    gerenciadoPor: 'IaC (Terraform)',
    repositorio: 'anf-motor-infra',
    ambientes: {
      dev: {
        tipo: 'provisionado',
        exclusaoLivre: false,
        data: '04/09/26 12:00',
        versao: '1.3.0',
        promovidoPor: {
          nome: 'Bruno Lima',
          email: 'bruno.lima@nuclea.com.br',
          id: 'bruno.lima'
        }
      },
      perf: {
        tipo: 'provisionado',
        exclusaoLivre: false,
        data: '08/09/26 16:00',
        versao: '1.3.0',
        promovidoPor: {
          nome: 'Carla Mendes',
          email: 'carla.mendes@nuclea.com.br',
          id: 'carla.mendes'
        }
      },
      int: {
        tipo: 'provisionado',
        exclusaoLivre: false,
        data: '10/09/26 18:00',
        versao: '1.3.0',
        promovidoPor: {
          nome: 'Larissa Prado',
          email: 'larissa.prado@nuclea.com.br',
          id: 'larissa.prado'
        }
      },
      ext: {
        tipo: 'provisionado',
        exclusaoLivre: false,
        data: '12/09/26 20:00',
        versao: '1.3.0',
        promovidoPor: {
          nome: 'Carla Mendes',
          email: 'carla.mendes@nuclea.com.br',
          id: 'carla.mendes'
        }
      },
      prod: {
        tipo: 'vazio'
      },
      prdnv: {
        tipo: 'vazio'
      }
    }
  },
  {
    nome: 'anf-modelo-lambda',
    servico: 'ANF',
    oferta: 'AWS Lambda',
    gerenciadoPor: 'IaC (Terraform)',
    repositorio: 'anf-motor-infra',
    ambientes: {
      dev: {
        tipo: 'provisionado',
        exclusaoLivre: true,
        data: '27/09/26 00:00',
        versao: '1.4.0',
        promovidoPor: {
          nome: 'Matheus da Costa',
          email: 'matheus.costa@nuclea.com.br',
          id: 'matheus.costa'
        }
      },
      perf: {
        tipo: 'provisionado',
        exclusaoLivre: true,
        data: '27/09/26 20:00',
        versao: '1.4.0',
        promovidoPor: {
          nome: 'Bruno Lima',
          email: 'bruno.lima@nuclea.com.br',
          id: 'bruno.lima'
        }
      },
      int: {
        tipo: 'vazio'
      },
      ext: {
        tipo: 'vazio'
      },
      prod: {
        tipo: 'vazio'
      },
      prdnv: {
        tipo: 'vazio'
      }
    }
  },
  {
    nome: 'bitrago-teste-0004',
    servico: 'BTG',
    oferta: 'Amazon S3',
    gerenciadoPor: 'IaC (Terraform)',
    repositorio: 'btg-bitrago-infra',
    ambientes: {
      dev: {
        tipo: 'provisionado',
        exclusaoLivre: true,
        data: '28/09/26 16:00',
        versao: '2.0.4',
        promovidoPor: {
          nome: 'Diego Rocha',
          email: 'diego.rocha@nuclea.com.br',
          id: 'diego.rocha'
        }
      },
      perf: {
        tipo: 'vazio'
      },
      int: {
        tipo: 'vazio'
      },
      ext: {
        tipo: 'vazio'
      },
      prod: {
        tipo: 'vazio'
      },
      prdnv: {
        tipo: 'vazio'
      }
    }
  },
  {
    nome: 'onb-documentos-bucket',
    servico: 'ONB',
    oferta: 'Amazon S3',
    gerenciadoPor: 'IaC (Terraform)',
    repositorio: 'onb-cadastro-infra',
    ambientes: {
      dev: {
        tipo: 'provisionado',
        exclusaoLivre: false,
        data: '19/09/26 12:00',
        versao: '2.0.4',
        promovidoPor: {
          nome: 'Ana Souza',
          email: 'ana.souza@nuclea.com.br',
          id: 'ana.souza'
        }
      },
      perf: {
        tipo: 'vazio'
      },
      int: {
        tipo: 'exclusaoPendente',
        data: '24/09/26 12:00',
        versao: '2.0.4',
        promovidoPor: {
          nome: 'Carla Mendes',
          email: 'carla.mendes@nuclea.com.br',
          id: 'carla.mendes'
        }
      },
      ext: {
        tipo: 'vazio'
      },
      prod: {
        tipo: 'vazio'
      },
      prdnv: {
        tipo: 'vazio'
      }
    }
  },
  {
    nome: 'onb-notificacoes-topico',
    servico: 'ONB',
    oferta: 'Amazon SNS',
    gerenciadoPor: 'IaC (Terraform)',
    repositorio: 'onb-cadastro-infra',
    ambientes: {
      dev: {
        tipo: 'provisionado',
        exclusaoLivre: true,
        data: '29/09/26 02:00',
        versao: '1.2.1',
        promovidoPor: {
          nome: 'Bruno Lima',
          email: 'bruno.lima@nuclea.com.br',
          id: 'bruno.lima'
        }
      },
      perf: {
        tipo: 'vazio'
      },
      int: {
        tipo: 'vazio'
      },
      ext: {
        tipo: 'vazio'
      },
      prod: {
        tipo: 'vazio'
      },
      prdnv: {
        tipo: 'vazio'
      }
    }
  },
  {
    nome: 'pag-cache-sessoes',
    servico: 'PAG',
    oferta: 'ElastiCache Valkey',
    gerenciadoPor: 'IaC (Terraform)',
    repositorio: 'pag-conciliacao-infra',
    ambientes: {
      dev: {
        tipo: 'provisionado',
        exclusaoLivre: false,
        data: '12/09/26 20:00',
        versao: '1.0.6',
        promovidoPor: {
          nome: 'Carla Mendes',
          email: 'carla.mendes@nuclea.com.br',
          id: 'carla.mendes'
        }
      },
      perf: {
        tipo: 'provisionado',
        exclusaoLivre: false,
        data: '14/09/26 22:00',
        versao: '1.0.6',
        promovidoPor: {
          nome: 'Carla Mendes',
          email: 'carla.mendes@nuclea.com.br',
          id: 'carla.mendes'
        }
      },
      int: {
        tipo: 'provisionado',
        exclusaoLivre: false,
        data: '17/09/26 00:00',
        versao: '1.0.6',
        promovidoPor: {
          nome: 'Carla Mendes',
          email: 'carla.mendes@nuclea.com.br',
          id: 'carla.mendes'
        }
      },
      ext: {
        tipo: 'provisionado',
        exclusaoLivre: false,
        data: '21/09/26 04:00',
        versao: '1.0.6',
        promovidoPor: {
          nome: 'Diego Rocha',
          email: 'diego.rocha@nuclea.com.br',
          id: 'diego.rocha'
        }
      },
      prod: {
        tipo: 'provisionado',
        exclusaoLivre: false,
        data: '23/09/26 06:00',
        versao: '1.0.6',
        promovidoPor: {
          nome: 'Larissa Prado',
          email: 'larissa.prado@nuclea.com.br',
          id: 'larissa.prado'
        }
      },
      prdnv: {
        tipo: 'provisionado',
        exclusaoLivre: false,
        data: '25/09/26 08:00',
        versao: '1.0.6',
        promovidoPor: {
          nome: 'Bruno Lima',
          email: 'bruno.lima@nuclea.com.br',
          id: 'bruno.lima'
        }
      }
    }
  },
  {
    nome: 'pag-conciliacao-db',
    servico: 'PAG',
    oferta: 'Amazon RDS',
    gerenciadoPor: 'IaC (Terraform)',
    repositorio: 'pag-conciliacao-infra',
    ambientes: {
      dev: {
        tipo: 'provisionado',
        exclusaoLivre: false,
        data: '10/08/26 12:00',
        versao: '2.1.0',
        promovidoPor: {
          nome: 'Carla Mendes',
          email: 'carla.mendes@nuclea.com.br',
          id: 'carla.mendes'
        }
      },
      perf: {
        tipo: 'provisionado',
        exclusaoLivre: false,
        data: '14/08/26 16:00',
        versao: '2.1.0',
        promovidoPor: {
          nome: 'Diego Rocha',
          email: 'diego.rocha@nuclea.com.br',
          id: 'diego.rocha'
        }
      },
      int: {
        tipo: 'provisionado',
        exclusaoLivre: false,
        data: '18/08/26 20:00',
        versao: '2.1.0',
        promovidoPor: {
          nome: 'Matheus da Costa',
          email: 'matheus.costa@nuclea.com.br',
          id: 'matheus.costa'
        }
      },
      ext: {
        tipo: 'provisionado',
        exclusaoLivre: false,
        data: '27/08/26 04:00',
        versao: '2.1.0',
        promovidoPor: {
          nome: 'Diego Rocha',
          email: 'diego.rocha@nuclea.com.br',
          id: 'diego.rocha'
        }
      },
      prod: {
        tipo: 'aguardandoCloud',
        data: '04/09/26 12:00',
        versao: '2.1.0',
        promovidoPor: {
          nome: 'Matheus da Costa',
          email: 'matheus.costa@nuclea.com.br',
          id: 'matheus.costa'
        }
      },
      prdnv: {
        tipo: 'vazio'
      }
    }
  },
  {
    nome: 'pag-extratos-tabela',
    servico: 'PAG',
    oferta: 'Amazon DynamoDB',
    gerenciadoPor: 'IaC (Terraform)',
    repositorio: 'pag-extratos-infra',
    ambientes: {
      dev: {
        tipo: 'provisionado',
        exclusaoLivre: true,
        data: '27/09/26 10:00',
        versao: '1.5.2',
        promovidoPor: {
          nome: 'Matheus da Costa',
          email: 'matheus.costa@nuclea.com.br',
          id: 'matheus.costa'
        }
      },
      perf: {
        tipo: 'vazio'
      },
      int: {
        tipo: 'provisionado',
        exclusaoLivre: true,
        data: '28/09/26 06:00',
        versao: '1.5.2',
        promovidoPor: {
          nome: 'Matheus da Costa',
          email: 'matheus.costa@nuclea.com.br',
          id: 'matheus.costa'
        }
      },
      ext: {
        tipo: 'vazio'
      },
      prod: {
        tipo: 'vazio'
      },
      prdnv: {
        tipo: 'vazio'
      }
    }
  },
  {
    nome: 'plt-cache-portal',
    servico: 'PLT',
    oferta: 'ElastiCache Valkey',
    gerenciadoPor: 'IaC (Terraform)',
    repositorio: 'plt-portal-infra',
    ambientes: {
      dev: {
        tipo: 'provisionado',
        exclusaoLivre: true,
        data: '28/09/26 08:00',
        versao: '1.0.6',
        promovidoPor: {
          nome: 'Ana Souza',
          email: 'ana.souza@nuclea.com.br',
          id: 'ana.souza'
        }
      },
      perf: {
        tipo: 'vazio'
      },
      int: {
        tipo: 'vazio'
      },
      ext: {
        tipo: 'vazio'
      },
      prod: {
        tipo: 'vazio'
      },
      prdnv: {
        tipo: 'vazio'
      }
    }
  },
  {
    nome: 'plt-logs-bucket',
    servico: 'PLT',
    oferta: 'Amazon S3',
    gerenciadoPor: 'IaC (Terraform)',
    repositorio: 'plt-observabilidade-infra',
    ambientes: {
      dev: {
        tipo: 'provisionado',
        exclusaoLivre: false,
        data: '08/07/26 04:00',
        versao: '2.0.4',
        promovidoPor: {
          nome: 'Matheus da Costa',
          email: 'matheus.costa@nuclea.com.br',
          id: 'matheus.costa'
        }
      },
      perf: {
        tipo: 'provisionado',
        exclusaoLivre: false,
        data: '12/07/26 08:00',
        versao: '2.0.4',
        promovidoPor: {
          nome: 'Bruno Lima',
          email: 'bruno.lima@nuclea.com.br',
          id: 'bruno.lima'
        }
      },
      int: {
        tipo: 'provisionado',
        exclusaoLivre: false,
        data: '16/07/26 12:00',
        versao: '2.0.4',
        promovidoPor: {
          nome: 'Matheus da Costa',
          email: 'matheus.costa@nuclea.com.br',
          id: 'matheus.costa'
        }
      },
      ext: {
        tipo: 'provisionado',
        exclusaoLivre: false,
        data: '20/07/26 16:00',
        versao: '2.0.4',
        promovidoPor: {
          nome: 'Diego Rocha',
          email: 'diego.rocha@nuclea.com.br',
          id: 'diego.rocha'
        }
      },
      prod: {
        tipo: 'provisionado',
        exclusaoLivre: false,
        data: '24/07/26 20:00',
        versao: '2.0.4',
        promovidoPor: {
          nome: 'Carla Mendes',
          email: 'carla.mendes@nuclea.com.br',
          id: 'carla.mendes'
        }
      },
      prdnv: {
        tipo: 'provisionado',
        exclusaoLivre: false,
        data: '29/07/26 00:00',
        versao: '2.0.4',
        promovidoPor: {
          nome: 'Ana Souza',
          email: 'ana.souza@nuclea.com.br',
          id: 'ana.souza'
        }
      }
    }
  },
  {
    nome: 'plt-metricas-db',
    servico: 'PLT',
    oferta: 'Amazon RDS',
    gerenciadoPor: 'IaC (Terraform)',
    repositorio: 'plt-observabilidade-infra',
    ambientes: {
      dev: {
        tipo: 'provisionado',
        exclusaoLivre: false,
        data: '17/09/26 00:00',
        versao: '2.1.0',
        promovidoPor: {
          nome: 'Ana Souza',
          email: 'ana.souza@nuclea.com.br',
          id: 'ana.souza'
        }
      },
      perf: {
        tipo: 'vazio'
      },
      int: {
        tipo: 'provisionado',
        exclusaoLivre: true,
        data: '29/09/26 03:00',
        versao: '2.1.0',
        promovidoPor: {
          nome: 'Matheus da Costa',
          email: 'matheus.costa@nuclea.com.br',
          id: 'matheus.costa'
        }
      },
      ext: {
        tipo: 'vazio'
      },
      prod: {
        tipo: 'vazio'
      },
      prdnv: {
        tipo: 'vazio'
      }
    }
  },
  {
    nome: 'bitrago-arquivos',
    servico: 'BTG',
    oferta: 'Amazon S3',
    gerenciadoPor: 'IaC (Terraform)',
    repositorio: 'btg-bitrago-infra',
    ambientes: {
      dev: {
        tipo: 'provisionado',
        exclusaoLivre: false,
        data: '23/08/26 00:00',
        versao: '2.0.4',
        promovidoPor: {
          nome: 'Matheus da Costa',
          email: 'matheus.costa@nuclea.com.br',
          id: 'matheus.costa'
        }
      },
      perf: {
        tipo: 'provisionado',
        exclusaoLivre: false,
        data: '31/08/26 08:00',
        versao: '2.0.4',
        promovidoPor: {
          nome: 'Carla Mendes',
          email: 'carla.mendes@nuclea.com.br',
          id: 'carla.mendes'
        }
      },
      int: {
        tipo: 'provisionado',
        exclusaoLivre: false,
        data: '08/09/26 16:00',
        versao: '2.0.4',
        promovidoPor: {
          nome: 'Matheus da Costa',
          email: 'matheus.costa@nuclea.com.br',
          id: 'matheus.costa'
        }
      },
      ext: {
        tipo: 'vazio'
      },
      prod: {
        tipo: 'provisionado',
        exclusaoLivre: false,
        data: '17/09/26 00:00',
        versao: '2.0.4',
        promovidoPor: {
          nome: 'Larissa Prado',
          email: 'larissa.prado@nuclea.com.br',
          id: 'larissa.prado'
        }
      },
      prdnv: {
        tipo: 'vazio'
      }
    }
  },
  {
    nome: 'btg-relatorios-fila',
    servico: 'BTG',
    oferta: 'Amazon SQS',
    gerenciadoPor: 'IaC (Terraform)',
    repositorio: 'btg-bitrago-infra',
    ambientes: {
      dev: {
        tipo: 'provisionado',
        exclusaoLivre: true,
        data: '26/09/26 14:00',
        versao: '1.3.0',
        promovidoPor: {
          nome: 'Diego Rocha',
          email: 'diego.rocha@nuclea.com.br',
          id: 'diego.rocha'
        }
      },
      perf: {
        tipo: 'provisionado',
        exclusaoLivre: true,
        data: '26/09/26 18:00',
        versao: '1.3.0',
        promovidoPor: {
          nome: 'Bruno Lima',
          email: 'bruno.lima@nuclea.com.br',
          id: 'bruno.lima'
        }
      },
      int: {
        tipo: 'vazio'
      },
      ext: {
        tipo: 'vazio'
      },
      prod: {
        tipo: 'vazio'
      },
      prdnv: {
        tipo: 'vazio'
      }
    }
  }
];

export const REPOSITORIOS: Repositorio[] = [
  {
    nome: 'anf-motor-infra',
    servico: 'ANF',
    oferta: 'Repositório de IaC',
    versao: '1.6.0',
    visibilidade: 'privado',
    recursos: 2,
    criadoEm: '18/08/26 20:00',
    criadoPor: {
      nome: 'Ana Souza',
      email: 'ana.souza@nuclea.com.br',
      id: 'ana.souza'
    }
  },
  {
    nome: 'btg-bitrago-api',
    servico: 'BTG',
    oferta: 'Serviço Node.js',
    versao: '3.2.1',
    visibilidade: 'interno',
    recursos: 0,
    criadoEm: '25/06/26 16:00',
    criadoPor: {
      nome: 'Diego Rocha',
      email: 'diego.rocha@nuclea.com.br',
      id: 'diego.rocha'
    }
  },
  {
    nome: 'btg-bitrago-infra',
    servico: 'BTG',
    oferta: 'Repositório de IaC',
    versao: '1.6.0',
    visibilidade: 'interno',
    recursos: 3,
    criadoEm: '21/06/26 12:00',
    criadoPor: {
      nome: 'Diego Rocha',
      email: 'diego.rocha@nuclea.com.br',
      id: 'diego.rocha'
    }
  },
  {
    nome: 'onb-cadastro-infra',
    servico: 'ONB',
    oferta: 'Repositório de IaC',
    versao: '1.6.0',
    visibilidade: 'interno',
    recursos: 2,
    criadoEm: '29/07/26 00:00',
    criadoPor: {
      nome: 'Ana Souza',
      email: 'ana.souza@nuclea.com.br',
      id: 'ana.souza'
    }
  },
  {
    nome: 'onb-cadastro-web',
    servico: 'ONB',
    oferta: 'Frontend React',
    versao: '2.4.0',
    visibilidade: 'interno',
    recursos: 0,
    criadoEm: '02/08/26 04:00',
    criadoPor: {
      nome: 'Matheus da Costa',
      email: 'matheus.costa@nuclea.com.br',
      id: 'matheus.costa'
    }
  },
  {
    nome: 'pag-conciliacao-infra',
    servico: 'PAG',
    oferta: 'Repositório de IaC',
    versao: '1.6.0',
    visibilidade: 'privado',
    recursos: 2,
    criadoEm: '27/05/26 12:00',
    criadoPor: {
      nome: 'Bruno Lima',
      email: 'bruno.lima@nuclea.com.br',
      id: 'bruno.lima'
    }
  },
  {
    nome: 'pag-conciliacao-worker',
    servico: 'PAG',
    oferta: 'Serviço Java',
    versao: '1.0.0',
    visibilidade: 'privado',
    recursos: 0,
    criadoEm: '31/05/26 16:00',
    criadoPor: {
      nome: 'Carla Mendes',
      email: 'carla.mendes@nuclea.com.br',
      id: 'carla.mendes'
    }
  },
  {
    nome: 'pag-extratos-infra',
    servico: 'PAG',
    oferta: 'Repositório de IaC',
    versao: '1.6.0',
    visibilidade: 'privado',
    recursos: 1,
    criadoEm: '24/09/26 12:00',
    criadoPor: {
      nome: 'Carla Mendes',
      email: 'carla.mendes@nuclea.com.br',
      id: 'carla.mendes'
    }
  },
  {
    nome: 'plt-observabilidade-infra',
    servico: 'PLT',
    oferta: 'Repositório de IaC',
    versao: '1.6.0',
    visibilidade: 'interno',
    recursos: 2,
    criadoEm: '15/04/26 20:00',
    criadoPor: {
      nome: 'Diego Rocha',
      email: 'diego.rocha@nuclea.com.br',
      id: 'diego.rocha'
    }
  },
  {
    nome: 'plt-portal-infra',
    servico: 'PLT',
    oferta: 'Repositório de IaC',
    versao: '1.6.0',
    visibilidade: 'interno',
    recursos: 1,
    criadoEm: '21/09/26 04:00',
    criadoPor: {
      nome: 'Larissa Prado',
      email: 'larissa.prado@nuclea.com.br',
      id: 'larissa.prado'
    }
  }
];

/** Recursos e repositórios que o próprio time do Atlas usa (aba "Interno do Atlas"). */
export const INTERNOS: ItemInterno[] = [
  {
    nome: 'atlas-portal-db',
    tipo: 'Recurso',
    oferta: 'Amazon RDS',
    ambientes: [
      'dev',
      'int',
      'prod'
    ]
  },
  {
    nome: 'atlas-eventos-fila',
    tipo: 'Recurso',
    oferta: 'Amazon SQS',
    ambientes: [
      'dev',
      'prod'
    ]
  },
  {
    nome: 'atlas-logs-bucket',
    tipo: 'Recurso',
    oferta: 'Amazon S3',
    ambientes: [
      'dev',
      'int',
      'prod'
    ]
  },
  {
    nome: 'atlas-agent-cache',
    tipo: 'Recurso',
    oferta: 'ElastiCache Valkey',
    ambientes: [
      'dev'
    ]
  },
  {
    nome: 'atlas-portal',
    tipo: 'Repositório',
    oferta: 'Serviço Node.js',
    ambientes: []
  },
  {
    nome: 'atlas-ofertas',
    tipo: 'Repositório',
    oferta: 'Repositório de IaC',
    ambientes: []
  }
];
