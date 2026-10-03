import { useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { Content, Page } from '@backstage/core-components';
import { RequestForm } from './RequestForm';
import { PEDIDO_VAZIO } from './helpers';
import { useStyles } from './styles';
import type { Pedido } from './types';

const COMO_FUNCIONA: [string, string][] = [
  [
    'Tempo de execução',
    'O provisionamento do acesso leva em média 2 a 3 minutos após a solicitação.',
  ],
  [
    'Tempo de liberação',
    'O acesso é concedido por tempo limitado e expira automaticamente ao fim do período.',
  ],
  [
    'Auditoria',
    'Toda solicitação é registrada e auditada, notificando os responsáveis do squad.',
  ],
  [
    'Menor privilégio',
    'Concede uma role temporária na conta AWS informada, seguindo o princípio do menor privilégio.',
  ],
];

/**
 * Break Glass: pedido de acesso privilegiado, temporário e auditado a uma
 * conta AWS. Não existe backend no lab: ao enviar, a tela diz que nada foi
 * concedido — fingir "acesso concedido" numa tela de segurança seria pior.
 */
export function BreakGlassPage() {
  const classes = useStyles();
  const [pedido, setPedido] = useState<Pedido>(PEDIDO_VAZIO);
  const [enviado, setEnviado] = useState(false);

  return (
    <Page themeId="tool">
      <Content>
        <div className={classes.page}>
          <div className={classes.header}>
            <div>
              <span className={classes.eyebrow}>Acesso emergencial</span>
              <h1 className={classes.title}>Break Glass</h1>
              <p className={classes.subtitle}>
                Solicite acesso privilegiado temporário e auditado a contas AWS
                em situações de incidente.
              </p>
            </div>
          </div>

          <div
            className={`${classes.alert} ${classes.alertWarn}`}
            role="note"
            style={{ marginTop: 0 }}
          >
            <strong className={classes.alertTitle}>
              Uso restrito e auditado
            </strong>
            Toda solicitação é registrada, notifica os responsáveis do squad e
            expira automaticamente. Utilize apenas durante incidentes.
          </div>

          <div className={classes.layout}>
            <RequestForm
              pedido={pedido}
              onChange={setPedido}
              onSolicitar={() => setEnviado(true)}
            />
            <section className={classes.card}>
              <h3 className={classes.toolbarTitle}>Como funciona</h3>
              <div>
                {COMO_FUNCIONA.map(([titulo, texto]) => (
                  <div key={titulo} className={classes.item}>
                    <span className={classes.ponto} aria-hidden>
                      ●
                    </span>
                    <div>
                      <strong className={classes.alertTitle}>{titulo}</strong>
                      <span className={classes.heroSub}>{texto}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <Dialog
          open={enviado}
          onClose={() => setEnviado(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ className: classes.dialogPaper }}
        >
          <div className={classes.dialogHead}>
            <span className={classes.dialogEyebrow}>Break Glass</span>
            <h3 className={classes.dialogTitle}>Solicitação de acesso</h3>
          </div>
          <DialogContent>
            <div
              className={`${classes.alert} ${classes.alertWarn}`}
              style={{ marginTop: 0 }}
            >
              <strong className={classes.alertTitle}>Nada foi concedido</strong>
              Esta tela ainda não tem backend — não existe serviço que emita a
              role temporária. O que faltaria: um plugin que registre a
              solicitação, notifique o squad e chame o STS com prazo de
              expiração.
            </div>
          </DialogContent>
          <DialogActions
            className={classes.dialogActions}
            style={{ justifyContent: 'flex-end' }}
          >
            <button
              type="button"
              className={classes.button}
              onClick={() => setEnviado(false)}
            >
              Fechar
            </button>
          </DialogActions>
        </Dialog>
      </Content>
    </Page>
  );
}
