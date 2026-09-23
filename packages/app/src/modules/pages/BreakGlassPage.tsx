import { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import WarningIcon from '@material-ui/icons/ReportProblemOutlined';
import TimerIcon from '@material-ui/icons/Timer';
import ClockIcon from '@material-ui/icons/AccessTime';
import AuditIcon from '@material-ui/icons/FindInPage';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import { atlasTokens } from '@internal/plugin-components';
import { AtlasPage } from '@internal/plugin-components';

const { brand, status, radius } = atlasTokens;

const PROFILES = [
  'ReadOnlyAccess',
  'PowerUserAccess',
  'DatabaseAdmin',
  'NetworkAdmin',
];

const INFO_ITEMS = [
  {
    icon: <TimerIcon fontSize="small" />,
    title: 'Tempo de execução',
    desc: 'O provisionamento do acesso leva em média 2 a 3 minutos após a solicitação.',
  },
  {
    icon: <ClockIcon fontSize="small" />,
    title: 'Tempo de liberação',
    desc: 'O acesso é concedido por tempo limitado e expira automaticamente ao fim do período.',
  },
  {
    icon: <AuditIcon fontSize="small" />,
    title: 'Auditoria',
    desc: 'Toda solicitação é registrada e auditada, notificando os responsáveis do squad.',
  },
  {
    icon: <InfoIcon fontSize="small" />,
    title: 'Como funciona',
    desc: 'Concede uma role temporária na conta AWS informada, seguindo o princípio do menor privilégio.',
  },
];

const useStyles = makeStyles(theme => ({
  alert: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
    background: `${status.warning}1f`,
    border: `1px solid ${status.warning}59`,
    borderRadius: radius.md,
    padding: '14px 16px',
    color: theme.palette.text.primary,
  },
  alertTitle: { fontWeight: 800, fontSize: '0.88rem', marginBottom: 2 },
  alertBody: { fontSize: '0.82rem', lineHeight: 1.5 },
  layout: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: 16,
    alignItems: 'start',
    [theme.breakpoints.down('sm')]: { gridTemplateColumns: '1fr' },
  },
  card: {
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: radius.lg,
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: '0.95rem',
    fontWeight: 700,
    margin: 0,
    color: theme.palette.text.primary,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  infoItem: {
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
    paddingBottom: 12,
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:last-child': { borderBottom: 0, paddingBottom: 0 },
  },
  infoTitle: {
    fontSize: '0.82rem',
    fontWeight: 700,
    color: theme.palette.text.primary,
  },
  infoDesc: {
    fontSize: '0.76rem',
    color: theme.palette.text.secondary,
    lineHeight: 1.45,
  },
  notice: {
    background: `${status.info}1f`,
    border: `1px solid ${status.info}59`,
    borderRadius: radius.md,
    padding: '12px 14px',
    fontSize: '0.82rem',
    lineHeight: 1.5,
    color: theme.palette.text.primary,
  },
  submit: { alignSelf: 'flex-start', background: brand.lime },
}));

/**
 * Solicitação de acesso emergencial.
 *
 * A tela está completa e valida a entrada, mas **não concede acesso**: não
 * existe backend de break glass no lab. O redesign simula sucesso com um
 * `setTimeout`; aqui a submissão diz a verdade.
 *
 * Fingir "acesso concedido" numa tela de segurança é a mentira mais cara que
 * este portal poderia contar — alguém acreditaria durante um incidente.
 */
export function BreakGlassPage() {
  const classes = useStyles();
  const [profile, setProfile] = useState(PROFILES[0]);
  const [accountId, setAccountId] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const idTouched = accountId.length > 0;
  const idValid = /^\d{12}$/.test(accountId);
  const canSubmit = idValid && reason.trim().length > 0;

  return (
    <AtlasPage
      eyebrow="Acesso emergencial"
      title="Break Glass"
      subtitle="Solicite acesso privilegiado temporário e auditado a contas AWS em situações de incidente."
    >
      <div className={classes.alert}>
        <WarningIcon style={{ color: status.warning }} />
        <div>
          <div className={classes.alertTitle}>Uso restrito e auditado</div>
          <div className={classes.alertBody}>
            Toda solicitação é registrada, notifica os responsáveis do squad e
            expira automaticamente. Utilize apenas durante incidentes.
          </div>
        </div>
      </div>

      <div className={classes.layout}>
        <section className={classes.card}>
          <h3 className={classes.cardTitle}>
            <WarningIcon fontSize="small" /> Nova solicitação
          </h3>

          <div className={classes.form}>
            <TextField
              select
              label="Perfil de acesso"
              variant="outlined"
              size="small"
              value={profile}
              onChange={event => setProfile(event.target.value)}
              helperText="Define o conjunto de permissões concedidas."
            >
              {PROFILES.map(p => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="ID da conta AWS"
              variant="outlined"
              size="small"
              value={accountId}
              onChange={event =>
                setAccountId(event.target.value.replace(/\D/g, '').slice(0, 12))
              }
              error={idTouched && !idValid}
              helperText={
                idTouched && !idValid
                  ? 'Precisa ter exatamente 12 dígitos.'
                  : 'Os 12 dígitos da conta onde o acesso será concedido.'
              }
            />

            <TextField
              label="Justificativa"
              variant="outlined"
              size="small"
              multiline
              minRows={3}
              value={reason}
              onChange={event => setReason(event.target.value)}
              helperText="Número do incidente e o que precisa ser feito. Vai para a auditoria."
            />

            <Button
              variant="contained"
              color="primary"
              className={classes.submit}
              disabled={!canSubmit}
              onClick={() => setSubmitted(true)}
            >
              Solicitar acesso
            </Button>

            {submitted && (
              <div className={classes.notice}>
                <strong>Nada foi concedido.</strong> Esta tela ainda não tem
                backend no lab — o formulário valida a entrada, mas não existe
                serviço que emita a role temporária. O que faltaria: um plugin
                que registre a solicitação, notifique o squad e chame o STS com
                prazo de expiração.
              </div>
            )}
          </div>
        </section>

        <section className={classes.card}>
          <h3 className={classes.cardTitle}>
            <InfoIcon fontSize="small" /> Como funciona
          </h3>
          <div>
            {INFO_ITEMS.map(item => (
              <div key={item.title} className={classes.infoItem}>
                <span style={{ color: brand.lime, marginTop: 2 }}>
                  {item.icon}
                </span>
                <div>
                  <div className={classes.infoTitle}>{item.title}</div>
                  <div className={classes.infoDesc}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AtlasPage>
  );
}
