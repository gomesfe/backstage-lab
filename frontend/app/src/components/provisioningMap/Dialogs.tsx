import type { ReactNode } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { Link } from '@backstage/core-components';
import { AMBIENTES, FREE_DELETE_WINDOW_HOURS, precisaDoCloud } from './helpers';
import { useStyles } from './styles';
import type { Ambiente, Dialogo, Pessoa, Recurso } from './types';

type Props = {
  dialogo: Dialogo | null;
  servicos: Record<string, string>;
  onClose: () => void;
  /** Troca o diálogo atual por outro (ex.: Detalhes → Excluir). */
  onOpen: (dialogo: Dialogo) => void;
};

function iniciais(nome: string): string {
  const partes = nome.split(' ').filter(Boolean);
  return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
}

function Cabecalho({ eyebrow, titulo, children }: { eyebrow: string; titulo: string; children?: ReactNode }) {
  const classes = useStyles();
  return (
    <div style={{ padding: '22px 24px 8px' }}>
      <span className={classes.dialogEyebrow}>{eyebrow}</span>
      <h3 className={classes.dialogTitle}>{titulo}</h3>
      {children && <div className={classes.chips}>{children}</div>}
    </div>
  );
}

function SeloAmbiente({ ambiente }: { ambiente: Ambiente }) {
  const classes = useStyles();
  return <span className={`${classes.envBadge} ${precisaDoCloud(ambiente) ? classes.envBadgeHot : ''}`}>{ambiente}</span>;
}

function PessoaBloco({ titulo, pessoa, extra }: { titulo: string; pessoa: Pessoa; extra: [string, string][] }) {
  const classes = useStyles();
  return (
    <div className={classes.block}>
      <h4 className={classes.blockTitle}>{titulo}</h4>
      <div className={classes.person}>
        <Avatar className={classes.avatar}>{iniciais(pessoa.nome)}</Avatar>
        <div>
          <div className={classes.personName}>{pessoa.nome}</div>
          <div className={classes.personMeta}>{pessoa.email}</div>
        </div>
      </div>
      <dl className={classes.dl}>
        {extra.map(([rotulo, valor]) => (
          <span key={rotulo} style={{ display: 'contents' }}>
            <dt>{rotulo}</dt>
            <dd>{valor}</dd>
          </span>
        ))}
      </dl>
    </div>
  );
}

function Lista({ titulo, itens }: { titulo: string; itens: [string, ReactNode][] }) {
  const classes = useStyles();
  return (
    <div className={classes.block}>
      <h4 className={classes.blockTitle}>{titulo}</h4>
      <dl className={classes.dl}>
        {itens.map(([rotulo, valor]) => (
          <span key={rotulo} style={{ display: 'contents' }}>
            <dt>{rotulo}</dt>
            <dd>{valor}</dd>
          </span>
        ))}
      </dl>
    </div>
  );
}

function linkSolicitacoes(recurso: Recurso) {
  return `/approvals?q=${encodeURIComponent(recurso.nome)}&status=all#approver`;
}

/** Todos os diálogos do mapa; abre o que estiver em `dialogo`. */
export function Dialogs({ dialogo, servicos, onClose, onOpen }: Props) {
  const classes = useStyles();
  if (!dialogo) return null;
  const servico = (sigla: string) => `${sigla} — ${servicos[sigla] ?? sigla}`;

  let largo = true;
  let conteudo: ReactNode = null;

  if (dialogo.tipo === 'promocao') {
    const { recurso, ambiente } = dialogo;
    const estado = recurso.ambientes[ambiente];
    if (estado.tipo !== 'vazio') {
      const pendente = estado.tipo !== 'provisionado';
      let sub = `Provisionado em ${estado.data}.`;
      if (estado.tipo === 'provisionado') sub += estado.exclusaoLivre ? ' Pode ser excluído direto.' : ' A exclusão precisa de aprovação.';
      if (estado.tipo === 'exclusaoPendente') sub = 'Solicitação registrada.';
      if (estado.tipo === 'aguardandoCloud') sub = 'Solicitação registrada, aguardando aprovação do time de cloud.';
      conteudo = (
        <>
          <Cabecalho eyebrow="Detalhes da promoção" titulo={recurso.nome}>
            <SeloAmbiente ambiente={ambiente} /> · {recurso.oferta}
          </Cabecalho>
          <DialogContent>
            <div className={`${classes.hero} ${pendente ? classes.heroWarn : ''}`}>
              <strong className={classes.heroTitle}>{pendente ? 'Deleção pendente' : 'Ativo neste ambiente'}</strong>
              <span className={classes.heroSub}>{sub}</span>
            </div>
            <div className={classes.blocks}>
              <Lista
                titulo="Deploy"
                itens={[
                  ['Oferta', recurso.oferta],
                  ['Versão', estado.versao],
                  ['Serviço Núclea', servico(recurso.servico)],
                  ['Ambiente', <SeloAmbiente key="a" ambiente={ambiente} />],
                  ['Promovido em', estado.data],
                ]}
              />
              <PessoaBloco titulo="Promovido por" pessoa={estado.promovidoPor} extra={[['ID do usuário', estado.promovidoPor.id]]} />
            </div>
          </DialogContent>
          <DialogActions className={classes.dialogActions}>
            <Link to={linkSolicitacoes(recurso)} className={classes.link}>
              Ver solicitações ↗
            </Link>
            <span className={classes.dialogButtons}>
              {!pendente && (
                <button type="button" className={classes.buttonDanger} onClick={() => onOpen({ tipo: 'excluir', recurso, ambiente })}>
                  Excluir
                </button>
              )}
              <button type="button" className={classes.button} onClick={onClose}>
                Fechar
              </button>
            </span>
          </DialogActions>
        </>
      );
    }
  } else if (dialogo.tipo === 'excluir') {
    largo = false;
    const { recurso, ambiente } = dialogo;
    const estado = recurso.ambientes[ambiente];
    const livre = estado.tipo === 'provisionado' && estado.exclusaoLivre;
    conteudo = (
      <>
        <Cabecalho eyebrow="Mapa de provisionamento" titulo="Excluir recurso" />
        <DialogContent>
          <p className={classes.heroSub}>
            <strong>{recurso.nome}</strong> em <strong>{ambiente}</strong>
            {estado.tipo !== 'vazio' ? `, provisionado em ${estado.data}.` : '.'}
          </p>
          {livre ? (
            <div className={`${classes.alert} ${classes.alertDanger}`}>
              <strong className={classes.alertTitle}>Sai sem aprovação</strong>
              Provisionado há menos de {FREE_DELETE_WINDOW_HOURS} horas: a exclusão é executada direto. Não dá para desfazer.
            </div>
          ) : (
            <div className={`${classes.alert} ${classes.alertWarn}`}>
              <strong className={classes.alertTitle}>Precisa de aprovação</strong>
              Provisionado há mais de {FREE_DELETE_WINDOW_HOURS} horas: a exclusão vira uma solicitação e aparece em Aprovações.
            </div>
          )}
        </DialogContent>
        <DialogActions className={classes.dialogActions} style={{ justifyContent: 'flex-end' }}>
          <span className={classes.dialogButtons}>
            <button type="button" className={classes.button} onClick={onClose}>
              Voltar
            </button>
            <button type="button" className={classes.buttonDanger} onClick={onClose}>
              Excluir
            </button>
          </span>
        </DialogActions>
      </>
    );
  } else if (dialogo.tipo === 'promover') {
    largo = false;
    const { recurso, ambiente } = dialogo;
    conteudo = (
      <>
        <Cabecalho eyebrow="Mapa de provisionamento" titulo="Promover recurso" />
        <DialogContent>
          <p className={classes.heroSub}>
            Provisionar <strong>{recurso.nome}</strong> em <strong>{ambiente}</strong>, com a mesma oferta ({recurso.oferta}).
          </p>
          {precisaDoCloud(ambiente) && (
            <div className={`${classes.alert} ${classes.alertWarn}`}>
              <strong className={classes.alertTitle}>Aprovação do time de cloud</strong>
              Promoções para {ambiente} esperam a aprovação do time de cloud antes de executar.
            </div>
          )}
        </DialogContent>
        <DialogActions className={classes.dialogActions} style={{ justifyContent: 'flex-end' }}>
          <span className={classes.dialogButtons}>
            <button type="button" className={classes.button} onClick={onClose}>
              Voltar
            </button>
            <button type="button" className={classes.buttonPrimary} onClick={onClose}>
              Pedir promoção
            </button>
          </span>
        </DialogActions>
      </>
    );
  } else if (dialogo.tipo === 'recurso') {
    const { recurso } = dialogo;
    conteudo = (
      <>
        <Cabecalho eyebrow="Recurso" titulo={recurso.nome}>
          {servico(recurso.servico)} · {recurso.oferta}
        </Cabecalho>
        <DialogContent>
          <div className={classes.blocks}>
            <Lista
              titulo="Recurso"
              itens={[
                ['Serviço Núclea', servico(recurso.servico)],
                ['Oferta', recurso.oferta],
                ['Gerenciado por', recurso.gerenciadoPor],
                ['Repositório', recurso.repositorio || '—'],
              ]}
            />
            <Lista
              titulo="Ambientes"
              itens={AMBIENTES.map(ambiente => {
                const estado = recurso.ambientes[ambiente];
                let situacao = 'não provisionado';
                if (estado.tipo === 'provisionado') situacao = `ativo · ${estado.data}`;
                if (estado.tipo === 'exclusaoPendente') situacao = 'exclusão pendente';
                if (estado.tipo === 'aguardandoCloud') situacao = 'aguardando cloud';
                return [ambiente, situacao];
              })}
            />
          </div>
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Link to={linkSolicitacoes(recurso)} className={classes.link}>
            Ver solicitações ↗
          </Link>
          <button type="button" className={classes.button} onClick={onClose}>
            Fechar
          </button>
        </DialogActions>
      </>
    );
  } else if (dialogo.tipo === 'repositorio') {
    const { repositorio } = dialogo;
    conteudo = (
      <>
        <Cabecalho eyebrow="Detalhe do repositório" titulo={repositorio.nome}>
          {servico(repositorio.servico)} · {repositorio.oferta}
        </Cabecalho>
        <DialogContent>
          <div className={classes.blocks}>
            <Lista
              titulo="Repositório"
              itens={[
                ['Serviço Núclea', servico(repositorio.servico)],
                ['Oferta', repositorio.oferta],
                ['Versão da oferta', repositorio.versao],
                ['Visibilidade', repositorio.visibilidade],
                ['Recursos', String(repositorio.recursos)],
              ]}
            />
            <PessoaBloco
              titulo="Criado por"
              pessoa={repositorio.criadoPor}
              extra={[
                ['ID do usuário', repositorio.criadoPor.id],
                ['Criado em', repositorio.criadoEm],
              ]}
            />
          </div>
        </DialogContent>
        <DialogActions className={classes.dialogActions} style={{ justifyContent: 'flex-end' }}>
          <span className={classes.dialogButtons}>
            <Link to="/create/tasks" className={classes.button}>
              Ver execução
            </Link>
            <button type="button" className={classes.buttonDanger} onClick={() => onOpen({ tipo: 'excluirRepositorio', repositorio })}>
              Excluir repositório
            </button>
            <button type="button" className={classes.button} onClick={onClose}>
              Fechar
            </button>
          </span>
        </DialogActions>
      </>
    );
  } else if (dialogo.tipo === 'excluirRepositorio') {
    largo = false;
    const { repositorio } = dialogo;
    conteudo = (
      <>
        <Cabecalho eyebrow="Mapa de provisionamento" titulo="Excluir repositório" />
        <DialogContent>
          <p className={classes.heroSub}>
            <strong>{repositorio.nome}</strong> ({repositorio.oferta}, {repositorio.servico}).
          </p>
          {repositorio.recursos > 0 && (
            <div className={`${classes.alert} ${classes.alertWarn}`}>
              <strong className={classes.alertTitle}>Há recursos ligados</strong>
              Este repositório tem {repositorio.recursos} recurso{repositorio.recursos !== 1 ? 's' : ''} provisionado
              {repositorio.recursos !== 1 ? 's' : ''} pelo Atlas. Confira antes de excluir.
            </div>
          )}
          <div className={`${classes.alert} ${classes.alertDanger}`}>
            <strong className={classes.alertTitle}>Não dá para desfazer</strong>O repositório e o histórico dele serão removidos.
          </div>
        </DialogContent>
        <DialogActions className={classes.dialogActions} style={{ justifyContent: 'flex-end' }}>
          <span className={classes.dialogButtons}>
            <button type="button" className={classes.button} onClick={onClose}>
              Voltar
            </button>
            <button type="button" className={classes.buttonDanger} onClick={onClose}>
              Excluir repositório
            </button>
          </span>
        </DialogActions>
      </>
    );
  }

  return (
    <Dialog open onClose={onClose} maxWidth={largo ? 'md' : 'sm'} fullWidth PaperProps={{ className: classes.dialogPaper }}>
      {conteudo}
    </Dialog>
  );
}
