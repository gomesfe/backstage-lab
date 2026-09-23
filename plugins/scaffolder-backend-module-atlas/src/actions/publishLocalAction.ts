import { cp, mkdir, readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { findPaths } from '@backstage/cli-common';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { resolveSafeChildPath } from '@backstage/backend-plugin-api';
import type { Config } from '@backstage/config';

/**
 * Escreve o resultado do template numa pasta local, em vez de abrir PR.
 *
 * É o que permite exercitar um template inteiro — do "Choose" até o log da
 * tarefa — sem token do GitHub e sem repositório alvo. O que aparece na pasta
 * é exatamente o que iria no Pull Request.
 */
export function createAtlasPublishLocalAction(options: { config: Config }) {
  const { config } = options;

  return createTemplateAction({
    id: 'atlas:publish:local',
    description:
      'Copia o workspace do template para uma pasta local e lista o que foi gerado.',
    schema: {
      input: {
        subdirectory: z =>
          z
            .string()
            .optional()
            .describe('Parte do workspace a publicar. Padrão: tudo.'),
        name: z =>
          z
            .string()
            .optional()
            .describe('Nome da pasta de saída. Padrão: o nome do template.'),
      },
      output: {
        path: z => z.string().describe('Pasta onde os arquivos foram escritos'),
        files: z => z.array(z.string()).describe('Arquivos gerados'),
        remoteUrl: z =>
          z.string().describe('URL file:// da pasta, para o link de saída'),
      },
    },
    async handler(ctx) {
      // O backend roda com cwd em packages/backend; resolver por cwd
      // esconderia a saída lá dentro em vez da raiz do repo.
      const outputRoot = findPaths(process.cwd()).resolveTargetRoot(
        config.getOptionalString('atlas.provisioning.localOutputDir') ??
          '.atlas-out',
      );

      const source = ctx.input.subdirectory
        ? resolveSafeChildPath(ctx.workspacePath, ctx.input.subdirectory)
        : ctx.workspacePath;

      // O id da tarefa entra no nome para que duas execuções do mesmo template
      // não se sobrescrevam — comparar duas saídas é metade do uso disto.
      const folder = `${ctx.input.name ?? ctx.templateInfo?.entity?.metadata.name ?? 'template'}-${ctx.task.id.slice(0, 8)}`;
      const target = join(outputRoot, folder);

      await mkdir(target, { recursive: true });
      await cp(source, target, { recursive: true });

      const files = await listFiles(target);

      ctx.logger.info(`${files.length} arquivo(s) escrito(s) em ${target}:`);
      for (const file of files) {
        ctx.logger.info(`  ${file}`);
      }

      ctx.output('path', target);
      ctx.output('files', files);
      ctx.output('remoteUrl', `file:///${target.replace(/\\/g, '/')}`);
    },
  });
}

async function listFiles(dir: string): Promise<string[]> {
  const out: string[] = [];

  const walk = async (current: string) => {
    for (const entry of await readdir(current)) {
      const full = join(current, entry);
      if ((await stat(full)).isDirectory()) {
        await walk(full);
      } else {
        out.push(relative(dir, full).split('\\').join('/'));
      }
    }
  };

  await walk(dir);
  return out.sort();
}
