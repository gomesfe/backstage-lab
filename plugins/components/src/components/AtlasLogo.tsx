import { LOGO_PATHS } from './logoPaths';

export type AtlasLogoVariant = keyof typeof LOGO_PATHS;

/**
 * A marca do Atlas, desenhada com `currentColor`.
 *
 * Os arquivos oficiais vêm em duas cores (modo claro e escuro), mas dentro do
 * portal um único desenho que herda a cor do texto acompanha o tema sozinho:
 * branco no escuro, quase preto no claro. Os arquivos continuam em
 * `packages/app/public/brand/` para ícone da aba, manifest e uso externo.
 *
 * - `horizontal`: barra de navegação.
 * - `vertical`: tela de login, telas de abertura.
 * - `symbol`: espaços pequenos — avatar do agente, barra em tela estreita.
 */
export function AtlasLogo({
  variant = 'horizontal',
  height,
  className,
  title = 'Atlas',
}: {
  variant?: AtlasLogoVariant;
  /** Altura em px; a largura segue a proporção do desenho. */
  height?: number;
  className?: string;
  /** Texto para leitor de tela. Passe '' quando a marca for decorativa. */
  title?: string;
}) {
  const logo = LOGO_PATHS[variant];
  const [, , w, h] = logo.viewBox.split(' ').map(Number);
  return (
    <svg
      viewBox={logo.viewBox}
      height={height}
      width={height ? (height * w) / h : undefined}
      className={['atlas-logo', className].filter(Boolean).join(' ')}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? 'img' : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {logo.paths.map(d => (
        <path key={d.slice(0, 24)} d={d} />
      ))}
    </svg>
  );
}
