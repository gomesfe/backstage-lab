import { useState } from 'react';
import WarningIcon from '@material-ui/icons/ReportProblemOutlined';
import TimerIcon from '@material-ui/icons/HourglassEmpty';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import RoleIcon from '@material-ui/icons/VerifiedUser';
import ClockIcon from '@material-ui/icons/TimerOff';
import AuditIcon from '@material-ui/icons/History';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import { AtlasPage, Alert, Field } from '../../components';

const PROFILES = [
  'ReadOnlyAccess',
  'PowerUserAccess',
  'DatabaseAdmin',
  'NetworkAdmin',
];

// Janela curta por padrão: acesso emergencial não deve sobreviver ao incidente.
const DURATIONS = [
  { value: '1', label: '1 hora' },
  { value: '2', label: '2 horas' },
  { value: '4', label: '4 horas' },
  { value: '8', label: '8 horas (máximo)' },
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
    icon: <RoleIcon fontSize="small" />,
    title: 'Como funciona',
    desc: 'Concede uma role temporária na conta AWS informada, seguindo o princípio do menor privilégio.',
  },
];

/**
 * Solicitação de acesso emergencial. O que a tela deve conter está em
 * `README.md`.
 *
 * A tela valida a entrada mas **não concede acesso**: não existe backend de
 * break glass no lab. O redesign simula sucesso com um `setTimeout`; aqui a
 * submissão diz a verdade. Fingir "acesso concedido" numa tela de segurança
 * é a mentira mais cara que este portal poderia contar — alguém acreditaria
 * durante um incidente.
 */
export function BreakGlassPage() {
  const [profile, setProfile] = useState(PROFILES[0]);
  const [duration, setDuration] = useState(DURATIONS[0].value);
  const [accountId, setAccountId] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const idTouched = accountId.length > 0;
  const idValid = /^\d{12}$/.test(accountId);
  const reasonValid = reason.trim().length >= 20;
  const canSubmit = idValid && reasonValid;

  return (
    <AtlasPage
      eyebrow="Acesso emergencial"
      title="Break Glass"
      subtitle="Solicite acesso privilegiado temporário e auditado a contas AWS em situações de incidente."
    >
      <Alert variant="warning" title="Uso restrito e auditado" icon={<WarningIcon fontSize="small" />}>
        Toda solicitação é registrada, notifica os responsáveis do squad e
        expira automaticamente. Utilize apenas durante incidentes.
      </Alert>

      <div className="atlas-breakGlassLayout">
        <section className="atlas-tableContainerCard">
          <div className="atlas-sectionCardHeader">
            <h3 className="atlas-sectionCardTitle">
              <LockOpenIcon fontSize="small" /> Nova solicitação
            </h3>
          </div>

          <div className="atlas-formGrid">
            <Field label="Perfil de acesso" hint="Define o conjunto de permissões concedidas.">
              <select
                className="atlas-select"
                value={profile}
                onChange={e => setProfile(e.target.value)}
              >
                {PROFILES.map(p => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Duração" hint="O acesso expira sozinho ao fim do prazo.">
              <select
                className="atlas-select"
                value={duration}
                onChange={e => setDuration(e.target.value)}
              >
                {DURATIONS.map(d => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="atlas-field">
            <label className="atlas-fieldLabel" htmlFor="bg-account">ID da conta AWS</label>
            <input
              id="bg-account"
              className={`atlas-input ${idTouched && !idValid ? 'atlas-inputError' : ''}`}
              inputMode="numeric"
              placeholder="123456789012"
              aria-invalid={idTouched && !idValid}
              value={accountId}
              onChange={e => setAccountId(e.target.value.replace(/\D/g, '').slice(0, 12))}
            />
            <span className={`atlas-fieldHint ${idTouched && !idValid ? 'atlas-fieldHintError' : ''}`}>
              {idTouched && !idValid
                ? `Precisa ter exatamente 12 dígitos (${accountId.length}/12).`
                : 'Os 12 dígitos da conta onde o acesso será concedido.'}
            </span>
          </div>

          <Field
            label="Justificativa"
            hint={`Número do incidente e o que precisa ser feito. Vai para a auditoria. ${
              reasonValid ? '' : `Mínimo de 20 caracteres (${reason.trim().length}/20).`
            }`}
          >
            <textarea
              className="atlas-textarea"
              placeholder="INC-1234 — restaurar snapshot do RDS de pagamentos após falha no deploy."
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </Field>

          {canSubmit && (
            <p className="atlas-text">
              Você vai pedir <strong>{profile}</strong> na conta{' '}
              <span className="atlas-costMono">{accountId}</span> por{' '}
              <strong>{DURATIONS.find(d => d.value === duration)?.label}</strong>.
            </p>
          )}

          <button
            type="button"
            className="atlas-btnPill atlas-btnPillLime"
            style={{ alignSelf: 'flex-start' }}
            disabled={!canSubmit}
            onClick={() => setSubmitted(true)}
          >
            Solicitar acesso
          </button>

          {submitted && (
            <Alert variant="info" icon={<InfoIcon fontSize="small" />}>
              <strong>Nada foi concedido.</strong> Esta tela ainda não tem
              backend no lab — o formulário valida a entrada, mas não existe
              serviço que emita a role temporária. O que faltaria: um plugin
              que registre a solicitação, notifique o squad e chame o STS com
              prazo de expiração.
            </Alert>
          )}
        </section>

        <section className="atlas-tableContainerCard">
          <div className="atlas-sectionCardHeader">
            <h3 className="atlas-sectionCardTitle">
              <InfoIcon fontSize="small" /> Como funciona
            </h3>
          </div>
          <div className="atlas-infoList">
            {INFO_ITEMS.map(item => (
              <div key={item.title} className="atlas-infoItem">
                <span style={{ color: 'var(--lime)', marginTop: 2 }}>
                  {item.icon}
                </span>
                <div>
                  <div className="atlas-infoItemTitle">{item.title}</div>
                  <div className="atlas-infoItemDesc">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AtlasPage>
  );
}
