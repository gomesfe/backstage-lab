import type { Config } from '@backstage/config';
import { InputError } from '@backstage/errors';

export type ProvisioningMode = 'github' | 'local';

const MODES: readonly ProvisioningMode[] = ['github', 'local'];

/**
 * Como o portal publica o resultado de um template.
 *
 * `github` abre Pull Request de verdade — o modo do Atlas.
 * `local`  escreve os arquivos numa pasta e não toca em nada remoto, para
 *          exercitar um template sem token e sem repositório alvo.
 *
 * A escolha é do ambiente, não de quem preenche o formulário: se fosse um
 * campo do formulário, alguém escolheria `local` em produção achando que era
 * um ensaio e o recurso nunca seria provisionado.
 */
export function readProvisioningMode(config: Config): ProvisioningMode {
  const raw = config.getOptionalString('atlas.provisioning.mode') ?? 'github';

  if (!(MODES as readonly string[]).includes(raw)) {
    throw new InputError(
      `atlas.provisioning.mode="${raw}" inválido. Use um de: ${MODES.join(', ')}.`,
    );
  }

  const mode = raw as ProvisioningMode;
  const env = config.getOptionalString('atlas.env') ?? 'local';

  if (mode === 'local' && env === 'prod') {
    // Em produção, "local" significaria que o portal aceita o pedido, mostra
    // sucesso e não provisiona nada. É pior que falhar.
    throw new InputError(
      'atlas.provisioning.mode=local não é permitido com atlas.env=prod.',
    );
  }

  return mode;
}
