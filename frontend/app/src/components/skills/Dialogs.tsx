import type { ReactNode } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { MarcadorAmbiente } from './SkillCard';
import { useStyles } from './styles';
import type { Dialogo } from './types';

type Props = {
  dialogo: Dialogo | null;
  onClose: () => void;
};

const EXEMPLO_SKILL = `---
name: aws-cost-optimize
description: Analisa recursos AWS e sugere otimizações de custo
---

# AWS Cost Optimize

1. Liste os recursos do ambiente informado.
2. Identifique recursos ociosos ou superdimensionados.
3. Sugira ações concretas de otimização, com estimativa de economia.`;

function Codigo({ children }: { children: ReactNode }) {
  const classes = useStyles();
  return <code className={classes.codigo}>{children}</code>;
}

function Ajuda() {
  const classes = useStyles();
  return (
    <>
      <h4 className={classes.subtitulo}>O que é uma Skill</h4>
      <p className={classes.texto}>
        As Skills são pacotes de conhecimento reutilizáveis, escritos em
        Markdown, que ensinam agentes de IA a executar tarefas específicas de
        forma consistente. Cada skill vive em sua própria pasta no repositório{' '}
        <strong>nuclea-ia-skills</strong> e é composta por um arquivo principal{' '}
        <Codigo>SKILL.md</Codigo>, além de arquivos auxiliares opcionais
        (scripts, modelos, exemplos etc.).
      </p>
      <p className={classes.texto}>
        <Codigo>skills/&lt;nome-da-skill&gt;/SKILL.md</Codigo>
      </p>
      <h4 className={classes.subtitulo}>Ambientes</h4>
      <p className={classes.texto}>
        As skills exibidas nesta página vêm de três branches do repositório,
        cada uma representando um ambiente:
      </p>
      <div className={classes.ambientesAjuda}>
        <div className={classes.ambienteAjuda}>
          <strong>DEV</strong>Skills em desenvolvimento, ainda em teste.
        </div>
        <div className={classes.ambienteAjuda}>
          <strong>HML</strong>Skills validadas em homologação.
        </div>
        <div className={classes.ambienteAjuda}>
          <strong>RELEASE</strong>Skills estáveis, liberadas para uso.
        </div>
      </div>
      <h4 className={classes.subtitulo}>Como usar a tela</h4>
      <p className={classes.texto}>
        Use a busca para filtrar por nome ou descrição e os marcadores de
        ambiente (dev, hml, release) para ver só as skills disponíveis naquele
        ambiente. Clicar num cartão abre o <Codigo>SKILL.md</Codigo> no GitHub,
        na versão mais estável disponível (release &gt; hml &gt; dev).
      </p>
      <p className={classes.texto}>
        Se uma skill não aparecer logo depois de publicada, use o botão{' '}
        <strong>Atualizar</strong> para buscar de novo no repositório.
      </p>
    </>
  );
}

function Cadastrar() {
  const classes = useStyles();
  return (
    <>
      <p className={classes.texto}>
        Para criar uma skill, siga os passos no repositório{' '}
        <strong>nuclea-ia-skills</strong>:
      </p>
      <ol className={classes.passos}>
        <li>
          Crie uma branch a partir de <Codigo>dev</Codigo>.
        </li>
        <li>
          Adicione uma pasta em <Codigo>skills/</Codigo> com um nome descritivo
          em kebab-case (ex.: <Codigo>skills/aws-cost-optimize</Codigo>).
        </li>
        <li>
          Dentro dela, crie o <Codigo>SKILL.md</Codigo> com o front-matter
          obrigatório (<Codigo>name</Codigo>, <Codigo>description</Codigo>)
          seguido das instruções que o agente deve seguir.
        </li>
        <li>
          Se precisar, adicione arquivos auxiliares (scripts, modelos de
          exemplo, imagens) na mesma pasta e referencie-os no{' '}
          <Codigo>SKILL.md</Codigo>.
        </li>
        <li>
          Abra um Pull Request para a branch <Codigo>dev</Codigo>.
        </li>
        <li>
          Depois de aprovada e testada em <Codigo>dev</Codigo>, promova para{' '}
          <Codigo>hml</Codigo> e, por fim, para <Codigo>release</Codigo>, pelos
          respectivos PRs.
        </li>
      </ol>
      <p className={classes.texto}>
        Um exemplo mínimo de <Codigo>SKILL.md</Codigo>:
      </p>
      <pre className={classes.blocoCodigo}>{EXEMPLO_SKILL}</pre>
      <p className={classes.texto}>
        Assim que o PR para <Codigo>dev</Codigo> for mesclado, a skill aparece
        nesta página com o marcador <MarcadorAmbiente ambiente="dev" />.
      </p>
      <p className={classes.texto}>
        O botão abaixo cria uma branch no repositório com um{' '}
        <Codigo>SKILL.md</Codigo> de exemplo já preenchido. Depois, edite o
        arquivo com as instruções reais e faça o merge em <Codigo>dev</Codigo>{' '}
        para a skill aparecer aqui; a partir daí, siga o fluxo normal até{' '}
        <Codigo>hml</Codigo> e <Codigo>release</Codigo>.
      </p>
    </>
  );
}

/** "Como funcionam as Skills" e "Como criar uma nova Skill". */
export function Dialogs({ dialogo, onClose }: Props) {
  const classes = useStyles();
  if (!dialogo) return null;
  const ajuda = dialogo === 'ajuda';

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ className: classes.dialogPaper }}
    >
      <div className={classes.dialogHead}>
        <span className={classes.dialogEyebrow}>Skills</span>
        <h3 className={classes.dialogTitle}>
          {ajuda ? 'Como funcionam as Skills' : 'Como criar uma nova Skill'}
        </h3>
      </div>
      <DialogContent>{ajuda ? <Ajuda /> : <Cadastrar />}</DialogContent>
      <DialogActions
        className={classes.dialogActions}
        style={{ justifyContent: 'flex-end' }}
      >
        {ajuda ? (
          <button
            type="button"
            className={classes.buttonPrimary}
            onClick={onClose}
          >
            Fechar
          </button>
        ) : (
          <span className={classes.dialogButtons}>
            <button type="button" className={classes.button} onClick={onClose}>
              Fechar
            </button>
            {/* No Atlas, cria a branch com o SKILL.md de exemplo; aqui só fecha. */}
            <button
              type="button"
              className={classes.buttonPrimary}
              onClick={onClose}
            >
              Criar Skill
            </button>
          </span>
        )}
      </DialogActions>
    </Dialog>
  );
}
