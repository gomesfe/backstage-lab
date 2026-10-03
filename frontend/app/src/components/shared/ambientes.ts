export type Ambiente = 'dev' | 'perf' | 'int' | 'ext' | 'prod' | 'prdnv';

export const AMBIENTES: Ambiente[] = [
  'dev',
  'perf',
  'int',
  'ext',
  'prod',
  'prdnv',
];

/** Promoções e deleções nestes ambientes passam pelo time de cloud. */
export const AMBIENTES_COM_CLOUD: Ambiente[] = ['prod', 'prdnv'];

export function precisaDoCloud(ambiente: Ambiente): boolean {
  return AMBIENTES_COM_CLOUD.includes(ambiente);
}

/** Cor do selo do ambiente: produção em âmbar, ext em roxo, o resto em azul. */
export function tomDoAmbiente(
  ambiente: Ambiente,
): 'warning' | 'purple' | 'info' {
  if (precisaDoCloud(ambiente)) return 'warning';
  if (ambiente === 'ext') return 'purple';
  return 'info';
}
