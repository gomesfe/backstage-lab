import { contem, passaColunas, type FiltrosColuna } from '../shared/filtros';
import type { Etapa, Filtros, FiltroStatus, Solicitacao, Status } from './types';

/** Quem está usando a tela, como aparece nos dados. */
export const VOCE = 'você';

/** Rejeitar exige um motivo de pelo menos isto de caracteres. */
export const MOTIVO_MINIMO = 5;

export const ROTULO_STATUS: Record<Status, string> = {
  aguardando: 'aguardando aprovação',
  execucao: 'em execução',
  concluido: 'concluído',
  rejeitado: 'rejeitado',
  cancelado: 'cancelado',
  falhou: 'falhou',
};

export type Tom = 'warning' | 'info' | 'lime' | 'danger' | 'purple' | 'neutral';

export const TOM_STATUS: Record<Status, Tom> = {
  aguardando: 'warning',
  execucao: 'info',
  concluido: 'lime',
  rejeitado: 'danger',
  cancelado: 'purple',
  falhou: 'danger',
};

export const ABAS_STATUS: { id: FiltroStatus; rotulo: string }[] = [
  { id: 'pendentes', rotulo: 'Pendentes' },
  { id: 'execucao', rotulo: 'Em execução' },
  { id: 'historico', rotulo: 'Histórico' },
  { id: 'todos', rotulo: 'Todos' },
];

/** Em que aba de status a solicitação cai. */
export function abaDoStatus(status: Status): FiltroStatus {
  if (status === 'aguardando') return 'pendentes';
  if (status === 'execucao') return 'execucao';
  return 'historico';
}

export function contar(lista: Solicitacao[]) {
  return {
    pendentes: lista.filter(item => abaDoStatus(item.status) === 'pendentes').length,
    execucao: lista.filter(item => abaDoStatus(item.status) === 'execucao').length,
    historico: lista.filter(item => abaDoStatus(item.status) === 'historico').length,
    concluidos: lista.filter(item => item.status === 'concluido').length,
    todos: lista.length,
  };
}

export function textoAprovacoes(solicitacao: Solicitacao): string {
  return `${solicitacao.aprovacoes.feitas} de ${solicitacao.aprovacoes.total}`;
}

/** O que aparece ao passar o mouse em "1 de 2". */
export function quemAprovou(solicitacao: Solicitacao): string {
  const { feitas, por } = solicitacao.aprovacoes;
  if (por.length) return `Aprovado por ${por.join(', ')}`;
  return feitas ? 'Aprovado' : 'Ninguém aprovou ainda';
}

export function podeAprovar(solicitacao: Solicitacao): boolean {
  return solicitacao.lado === 'aprovacao' && solicitacao.status === 'aguardando' && !solicitacao.aprovacoes.por.includes(VOCE);
}

export function podeCancelar(solicitacao: Solicitacao): boolean {
  return solicitacao.lado === 'solicitacao' && solicitacao.status === 'aguardando';
}

/** Valor de cada coluna — é nele que o funil da coluna procura. */
export function valorDaColuna(solicitacao: Solicitacao, coluna: string): string {
  switch (coluna) {
    case 'recurso':
      return `${solicitacao.recurso} ${solicitacao.oferta}`;
    case 'ambiente':
      return solicitacao.ambiente;
    case 'grupo':
      return solicitacao.grupo;
    case 'dono':
      return solicitacao.dono;
    case 'solicitante':
      return solicitacao.solicitante;
    case 'data':
      return solicitacao.data;
    case 'aprovacoes':
      return `${textoAprovacoes(solicitacao)} ${solicitacao.aprovacoes.por.join(' ')}`;
    case 'status':
      return ROTULO_STATUS[solicitacao.status];
    default:
      return '';
  }
}

export function filtrar(lista: Solicitacao[], filtros: Filtros, colunas: FiltrosColuna): Solicitacao[] {
  return lista.filter(
    item =>
      (filtros.status === 'todos' || abaDoStatus(item.status) === filtros.status) &&
      (!filtros.busca || contem(`${item.recurso} ${item.solicitante}`, filtros.busca)) &&
      (!filtros.ambiente || item.ambiente === filtros.ambiente) &&
      (!filtros.grupo || item.grupo === filtros.grupo) &&
      passaColunas(item, colunas, valorDaColuna),
  );
}

/** Faixa colorida no topo dos Detalhes: título e frase de cada status. */
export function situacao(solicitacao: Solicitacao): { tom: Tom; titulo: string; texto: string } {
  const { feitas, total } = solicitacao.aprovacoes;
  const faltam = total - feitas;
  switch (solicitacao.status) {
    case 'aguardando':
      return {
        tom: 'warning',
        titulo: 'Aguardando aprovação',
        texto: faltam === 1 ? `Falta 1 aprovação de ${total}.` : `Faltam ${faltam} de ${total} aprovações.`,
      };
    case 'execucao':
      return { tom: 'info', titulo: 'Deleção em andamento', texto: 'Aprovada. O workflow está removendo o recurso.' };
    case 'concluido':
      return { tom: 'lime', titulo: 'Recurso excluído', texto: 'O recurso foi removido e saiu do catálogo.' };
    case 'rejeitado':
      return { tom: 'danger', titulo: 'Deleção rejeitada', texto: 'A deleção não foi executada. O recurso continua existindo.' };
    case 'falhou':
      return {
        tom: 'danger',
        titulo: 'Deleção falhou',
        texto: 'Aprovada, mas o workflow não terminou. O recurso continua existindo.',
      };
    default:
      return { tom: 'neutral', titulo: 'Solicitação cancelada', texto: 'Cancelada por quem pediu. O recurso continua existindo.' };
  }
}

/** "29/09/26 11:00" → Date. */
export function lerData(data: string): Date {
  const [dia, hora = '00:00'] = data.split(' ');
  const [d, m, a] = dia.split('/').map(Number);
  const [h, min] = hora.split(':').map(Number);
  return new Date(2000 + a, m - 1, d, h, min);
}

/** Date → "29/09/26 11:00". */
export function formatarData(data: Date): string {
  const dois = (valor: number) => String(valor).padStart(2, '0');
  return `${dois(data.getDate())}/${dois(data.getMonth() + 1)}/${dois(data.getFullYear() % 100)} ${dois(data.getHours())}:${dois(
    data.getMinutes(),
  )}`;
}

/** Há quanto tempo a solicitação está aberta: "há 3 dias", "há 5 h". */
export function haQuanto(data: string, agora: Date = new Date()): string {
  const minutos = Math.max(0, Math.round((agora.getTime() - lerData(data).getTime()) / 60000));
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `há ${horas} h`;
  const dias = Math.round(horas / 24);
  return dias === 1 ? 'há 1 dia' : `há ${dias} dias`;
}

// ---- ações da sessão (sem o serviço de aprovações, só mudam o que está na tela)

/** Fecha a etapa atual e as que vierem depois com `fim`. */
function encerrar(andamento: Etapa[], fim: Etapa): Etapa[] {
  const atual = andamento.findIndex(etapa => etapa.estado === 'agora');
  const ate = atual >= 0 ? atual : andamento.findIndex(etapa => etapa.estado === 'pendente');
  return [...andamento.slice(0, ate >= 0 ? ate : andamento.length), fim];
}

/** Os grupos que ainda não decidiram passam a "sem resposta". */
function semResposta(solicitacao: Solicitacao) {
  return solicitacao.aprovadores.map(grupo =>
    grupo.situacao === 'pendente' ? { ...grupo, situacao: 'sem resposta' as const, nota: 'Não chegou a avaliar' } : grupo,
  );
}

export function aprovar(solicitacao: Solicitacao, agora: Date = new Date()): Solicitacao {
  const quando = formatarData(agora);
  const feitas = solicitacao.aprovacoes.feitas + 1;
  const { total } = solicitacao.aprovacoes;
  const concluiu = feitas >= total;
  let decidiu = false;
  const aprovadores = solicitacao.aprovadores.map(grupo => {
    if (decidiu || grupo.situacao !== 'pendente') return grupo;
    decidiu = true;
    return { ...grupo, situacao: 'aprovou' as const, nota: `Aprovado por ${VOCE}` };
  });
  const andamento = solicitacao.andamento.map((etapa): Etapa => {
    if (etapa.titulo.startsWith('Aprovação concedida')) {
      return { titulo: `Aprovação concedida · ${feitas} de ${total}`, nota: concluiu ? quando : `Por ${VOCE}.`, estado: concluiu ? 'feito' : 'agora' };
    }
    if (!concluiu) return etapa;
    if (etapa.titulo === 'Aprovação concluída' || etapa.titulo === 'Deleção iniciada' || etapa.titulo === 'Workflow disparado') {
      return { ...etapa, nota: quando, estado: 'feito' };
    }
    if (etapa.titulo === 'Workflow concluído') return { ...etapa, nota: 'Em andamento.', estado: 'agora' };
    return etapa;
  });
  return {
    ...solicitacao,
    status: concluiu ? 'execucao' : 'aguardando',
    aprovacoes: { feitas, total, por: [...solicitacao.aprovacoes.por, VOCE] },
    aprovadores,
    andamento,
  };
}

export function rejeitar(solicitacao: Solicitacao, motivo: string): Solicitacao {
  let decidiu = false;
  const aprovadores = solicitacao.aprovadores.map(grupo => {
    if (decidiu || grupo.situacao !== 'pendente') return grupo;
    decidiu = true;
    return { ...grupo, situacao: 'rejeitou' as const, nota: motivo };
  });
  return {
    ...solicitacao,
    status: 'rejeitado',
    aprovadores: semResposta({ ...solicitacao, aprovadores }),
    andamento: encerrar(solicitacao.andamento, { titulo: 'Aprovação rejeitada', nota: motivo, estado: 'falhou' }),
  };
}

export function cancelar(solicitacao: Solicitacao, motivo: string): Solicitacao {
  return {
    ...solicitacao,
    status: 'cancelado',
    aprovadores: semResposta(solicitacao),
    andamento: encerrar(solicitacao.andamento, {
      titulo: 'Solicitação cancelada',
      nota: motivo.trim() || 'Cancelada por quem pediu.',
      estado: 'cancelado',
    }),
  };
}
