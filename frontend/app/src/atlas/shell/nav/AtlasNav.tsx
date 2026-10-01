import { useEffect, useState } from 'react';
import type { NavContentComponentProps } from '@backstage/plugin-app-react';
import { usePref } from '../prefs';
import { AtlasTopNav } from './AtlasTopNav';
import { AtlasSideNav } from './AtlasSideNav';

/** Largura mínima para o menu lateral; abaixo disso o menu volta para o topo. */
const SIDE_MIN_WIDTH = 900;

function useWide() {
  const query = `(min-width: ${SIDE_MIN_WIDTH}px)`;
  const [wide, setWide] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setWide(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [query]);
  return wide;
}

/** Posição do menu: preferência `nav` (Configurações › Aparência). */
export function AtlasNav({ navItems }: { navItems: NavContentComponentProps['navItems'] }) {
  const position = usePref('nav', 'top');
  const wide = useWide();
  return position === 'side' && wide ? <AtlasSideNav navItems={navItems} /> : <AtlasTopNav navItems={navItems} />;
}
