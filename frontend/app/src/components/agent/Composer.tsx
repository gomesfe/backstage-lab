import { useEffect, useRef } from 'react';
import SendIcon from '@material-ui/icons/ArrowUpward';
import StopIcon from '@material-ui/icons/Stop';
import { useStyles } from './styles';

type Props = {
  texto: string;
  podeConversar: boolean;
  ocupado: boolean;
  /** Pede o foco no campo (ex.: depois de "Nova conversa"). */
  focarEm: number;
  onTexto: (texto: string) => void;
  onEnviar: () => void;
  onParar: () => void;
};

/** Campo de mensagem: Enter envia, Shift + Enter quebra linha; durante a resposta vira Parar. */
export function Composer({ texto, podeConversar, ocupado, focarEm, onTexto, onEnviar, onParar }: Props) {
  const classes = useStyles();
  const campoRef = useRef<HTMLTextAreaElement>(null);

  // O campo cresce com o texto, até o limite do estilo.
  useEffect(() => {
    const campo = campoRef.current;
    if (!campo) return;
    campo.style.height = 'auto';
    campo.style.height = `${campo.scrollHeight}px`;
  }, [texto]);

  useEffect(() => {
    if (focarEm) campoRef.current?.focus();
  }, [focarEm]);

  return (
    <div>
      <form
        className={classes.campo}
        onSubmit={evento => {
          evento.preventDefault();
          onEnviar();
        }}
      >
        <textarea
          ref={campoRef}
          rows={1}
          value={texto}
          disabled={!podeConversar}
          placeholder={podeConversar ? 'Pergunte ao agente do Atlas' : 'Agente indisponível até a credencial ser configurada'}
          aria-label="Mensagem para o agente"
          onChange={evento => onTexto(evento.target.value)}
          onKeyDown={evento => {
            if (evento.key === 'Enter' && !evento.shiftKey) {
              evento.preventDefault();
              onEnviar();
            }
          }}
        />
        {ocupado ? (
          <button type="button" className={classes.button} onClick={onParar} aria-label="Parar resposta">
            <StopIcon style={{ fontSize: 16 }} /> Parar
          </button>
        ) : (
          <button type="submit" className={classes.buttonPrimary} disabled={!podeConversar || !texto.trim()} aria-label="Enviar">
            <SendIcon style={{ fontSize: 16 }} /> Enviar
          </button>
        )}
      </form>
      <div className={classes.dica}>Enter envia · Shift + Enter quebra a linha</div>
    </div>
  );
}
