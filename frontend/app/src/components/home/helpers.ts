import type { Ambiente } from '../shared/ambientes';
import { lerData } from '../approvals/helpers';
import type { Solicitacao } from '../approvals/types';
import type { Recurso, Repositorio } from '../provisioningMap/types';

/** "Bom dia" / "Boa tarde" / "Boa noite" pela hora local. */
export function saudacao(hora: number = new Date().getHours()): string {
  if (hora < 5) return 'Boa noite';
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function iniciais(nome: string): string {
  // Só palavras contam: "SRO-4777" vira "SR", não "S4".
  const partes = nome.split(/[\s-]+/).filter(parte => /^[^\d]/.test(parte));
  if (partes.length === 0) return nome.slice(0, 2).toUpperCase();
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase();
}

/** Como o tipo da aplicação aparece na Home, e a cor do selo. */
export const TIPO_APLICACAO: Record<
  string,
  { rotulo: string; tom: 'info' | 'lime' | 'purple' }
> = {
  service: { rotulo: 'Microsserviço', tom: 'info' },
  website: { rotulo: 'Site Estático', tom: 'lime' },
  serverless: { rotulo: 'Serverless', tom: 'purple' },
  worker: { rotulo: 'Worker', tom: 'info' },
};

export type Projeto = {
  sigla: string;
  nome: string;
  ofertas: string[];
  total: number;
};

function distintas(valores: string[]): string[] {
  return Array.from(new Set(valores));
}

/** Recursos por serviço Núclea; com ambiente, conta só o que está provisionado nele. */
export function projetosComRecursos(
  recursos: Recurso[],
  servicos: Record<string, string>,
  ambiente: Ambiente | '',
): Projeto[] {
  const siglas = distintas(recursos.map(recurso => recurso.servico)).sort();
  return siglas.map(sigla => {
    const doServico = recursos.filter(recurso => recurso.servico === sigla);
    return {
      sigla,
      nome: servicos[sigla] ?? sigla,
      ofertas: distintas(doServico.map(recurso => recurso.oferta)),
      total: ambiente
        ? doServico.filter(
            recurso => recurso.ambientes[ambiente].tipo !== 'vazio',
          ).length
        : doServico.length,
    };
  });
}

export function projetosComRepositorios(
  repositorios: Repositorio[],
  servicos: Record<string, string>,
): Projeto[] {
  const siglas = distintas(
    repositorios.map(repositorio => repositorio.servico),
  ).sort();
  return siglas.map(sigla => {
    const doServico = repositorios.filter(
      repositorio => repositorio.servico === sigla,
    );
    return {
      sigla,
      nome: servicos[sigla] ?? sigla,
      ofertas: distintas(doServico.map(repositorio => repositorio.oferta)),
      total: doServico.length,
    };
  });
}

export function plural(
  total: number,
  singular: string,
  pluralizado: string,
): string {
  return `${total} ${total === 1 ? singular : pluralizado}`;
}

/** As solicitações mais recentes, dos dois lados. */
export function ultimasTransacoes(
  solicitacoes: Solicitacao[],
  quantas = 5,
): Solicitacao[] {
  return [...solicitacoes]
    .sort((a, b) => lerData(b.data).getTime() - lerData(a.data).getTime())
    .slice(0, quantas);
}
