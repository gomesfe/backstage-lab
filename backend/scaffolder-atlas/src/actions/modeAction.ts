import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import type { Config } from '@backstage/config';
import { readProvisioningMode } from './provisioningMode';

/**
 * Publica o modo de provisionamento como saída, para os passos seguintes
 * poderem se condicionar a ele.
 *
 * Existe porque o `if:` de um passo só enxerga parâmetros e saídas de outros
 * passos — não enxerga o app-config. Sem esta ação, a escolha entre abrir PR
 * e escrever local viraria um campo do formulário, que é o lugar errado.
 */
export function createAtlasModeAction(options: { config: Config }) {
  return createTemplateAction({
    id: 'atlas:mode',
    description:
      'Lê o modo de provisionamento do app-config e expõe como saída.',
    schema: {
      output: {
        mode: z => z.string().describe('github ou local'),
        isGithub: z => z.boolean(),
        isLocal: z => z.boolean(),
      },
    },
    async handler(ctx) {
      const mode = readProvisioningMode(options.config);

      ctx.logger.info(
        mode === 'github'
          ? 'Modo github: este template vai abrir um Pull Request de verdade.'
          : 'Modo local: nada remoto será tocado, os arquivos ficam em disco.',
      );

      ctx.output('mode', mode);
      ctx.output('isGithub', mode === 'github');
      ctx.output('isLocal', mode === 'local');
    },
  });
}
