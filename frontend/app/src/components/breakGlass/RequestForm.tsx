import { useState } from 'react';
import { useAtlasStyles } from '../shared/styles';
import { DURACOES, JUSTIFICATIVA_MINIMA, PERFIS, rotuloDuracao, validar } from './helpers';
import type { Pedido } from './types';

type Props = {
  pedido: Pedido;
  onChange: (pedido: Pedido) => void;
  onSolicitar: () => void;
};

/** "Nova solicitação": perfil, duração, conta e justificativa, com validação. */
export function RequestForm({ pedido, onChange, onSolicitar }: Props) {
  const classes = useAtlasStyles();
  // Erro só aparece depois que a pessoa mexeu no campo.
  const [tocados, setTocados] = useState<{ conta?: boolean; justificativa?: boolean }>({});
  const erros = validar(pedido);
  const valido = !erros.conta && !erros.justificativa;

  return (
    <section className={classes.card}>
      <h3 className={classes.toolbarTitle}>Nova solicitação</h3>
      <div className={classes.blocks}>
        <label className={classes.field} style={{ marginTop: 0 }}>
          <span className={classes.fieldLabel}>Perfil de acesso</span>
          <select className={classes.input} value={pedido.perfil} onChange={evento => onChange({ ...pedido, perfil: evento.target.value })}>
            {PERFIS.map(perfil => (
              <option key={perfil} value={perfil}>
                {perfil}
              </option>
            ))}
          </select>
          <span className={classes.fieldHint}>Define o conjunto de permissões concedidas.</span>
        </label>
        <label className={classes.field} style={{ marginTop: 0 }}>
          <span className={classes.fieldLabel}>Duração</span>
          <select
            className={classes.input}
            value={pedido.horas}
            onChange={evento => onChange({ ...pedido, horas: Number(evento.target.value) })}
          >
            {DURACOES.map(duracao => (
              <option key={duracao.horas} value={duracao.horas}>
                {duracao.rotulo}
              </option>
            ))}
          </select>
          <span className={classes.fieldHint}>O acesso expira sozinho ao fim do prazo.</span>
        </label>
      </div>

      <label className={classes.field} style={{ marginTop: 0 }}>
        <span className={classes.fieldLabel}>ID da conta AWS</span>
        <input
          className={classes.input}
          inputMode="numeric"
          maxLength={12}
          placeholder="123456789012"
          value={pedido.conta}
          aria-invalid={Boolean(tocados.conta && erros.conta)}
          onChange={evento => onChange({ ...pedido, conta: evento.target.value.trim() })}
          onBlur={() => setTocados(atual => ({ ...atual, conta: true }))}
        />
        {tocados.conta && erros.conta ? (
          <span className={classes.fieldError}>
            {erros.conta}
          </span>
        ) : (
          <span className={classes.fieldHint}>Os 12 dígitos da conta onde o acesso será concedido.</span>
        )}
      </label>

      <label className={classes.field} style={{ marginTop: 0 }}>
        <span className={classes.fieldLabel}>Justificativa</span>
        <textarea
          className={classes.textarea}
          placeholder="INC-1234 — restaurar snapshot do RDS de pagamentos após falha no deploy."
          value={pedido.justificativa}
          aria-invalid={Boolean(tocados.justificativa && erros.justificativa)}
          onChange={evento => onChange({ ...pedido, justificativa: evento.target.value })}
          onBlur={() => setTocados(atual => ({ ...atual, justificativa: true }))}
        />
        {tocados.justificativa && erros.justificativa ? (
          <span className={classes.fieldError}>
            {erros.justificativa}
          </span>
        ) : (
          <span className={classes.fieldHint}>
            Número do incidente e o que precisa ser feito. Vai para a auditoria. Mínimo de {JUSTIFICATIVA_MINIMA} caracteres.
          </span>
        )}
      </label>

      {valido && (
        <div className={classes.hero} style={{ marginBottom: 0 }} role="status">
          <span className={classes.heroSub}>
            Você vai pedir <strong>{pedido.perfil}</strong> na conta <strong>{pedido.conta}</strong> por{' '}
            <strong>{rotuloDuracao(pedido.horas)}</strong>.
          </span>
        </div>
      )}

      <div>
        <button type="button" className={classes.buttonPrimary} disabled={!valido} onClick={onSolicitar}>
          Solicitar acesso
        </button>
      </div>
    </section>
  );
}
