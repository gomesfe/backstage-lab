import type { ReactNode } from 'react';
import { useStyles } from './styles';

type Props = { titulo: string; texto: string; children?: ReactNode };

/** Uma linha de ajuste: nome e explicação à esquerda, o controle à direita. */
export function SettingRow({ titulo, texto, children }: Props) {
  const classes = useStyles();
  return (
    <div className={classes.linha}>
      <div>
        <span className={classes.linhaTitulo}>{titulo}</span>
        <span className={classes.linhaTexto}>{texto}</span>
      </div>
      {children}
    </div>
  );
}

type OpcaoProps = {
  titulo: string;
  texto: string;
  marcada: boolean;
  antes?: ReactNode;
  onClick: () => void;
};

/** Cartão de escolha (tema, posição do menu), com o marcado em verde. */
export function OptionCard({
  titulo,
  texto,
  marcada,
  antes,
  onClick,
}: OpcaoProps) {
  const classes = useStyles();
  return (
    <button
      type="button"
      aria-pressed={marcada}
      className={`${classes.opcao} ${marcada ? classes.opcaoMarcada : ''}`}
      onClick={onClick}
    >
      {antes}
      <div>
        <div className={classes.opcaoTitulo}>{titulo}</div>
        <div className={classes.linhaTexto}>{texto}</div>
      </div>
      <span
        className={`${classes.marca} ${marcada ? classes.marcaCheia : ''}`}
        aria-hidden
      >
        {marcada ? '✓' : ''}
      </span>
    </button>
  );
}
