import { useMemo, useState } from 'react';
import AddIcon from '@material-ui/icons/Add';
import HelpIcon from '@material-ui/icons/HelpOutline';
import RefreshIcon from '@material-ui/icons/Refresh';
import SearchIcon from '@material-ui/icons/Search';
import { Content, Page, Progress } from '@backstage/core-components';
import { Dialogs } from './Dialogs';
import { SkillCard } from './SkillCard';
import { useSkills } from './hooks/useSkills';
import { ABAS_AMBIENTE, filtrarSkills } from './helpers';
import { useStyles } from './styles';
import type { Dialogo, FiltroAmbiente } from './types';

/**
 * Skills: o catálogo de IA (repositório nuclea-ia-skills). A página guarda
 * o estado (ambiente, busca, diálogo); SkillCard e Dialogs só desenham.
 */
export function SkillsPage() {
  const classes = useStyles();
  const { skills, loading, refresh } = useSkills();
  const [ambiente, setAmbiente] = useState<FiltroAmbiente>('todos');
  const [busca, setBusca] = useState('');
  const [dialogo, setDialogo] = useState<Dialogo | null>(null);

  const filtradas = useMemo(() => filtrarSkills(skills, ambiente, busca), [skills, ambiente, busca]);

  return (
    <Page themeId="tool">
      <Content>
        <div className={classes.page}>
          <div className={classes.header}>
            <div>
              <span className={classes.eyebrow}>Catálogo de IA</span>
              <h1 className={classes.title}>Skills</h1>
              <p className={classes.subtitle}>Instruções especializadas e fluxos de automação reutilizáveis para agentes e assistentes de IA.</p>
            </div>
            <div className={classes.headerActions}>
              <button type="button" className={classes.button} onClick={() => setDialogo('ajuda')}>
                <HelpIcon style={{ fontSize: 16 }} /> Ajuda
              </button>
              <button type="button" className={classes.buttonPrimary} onClick={() => setDialogo('cadastrar')}>
                <AddIcon style={{ fontSize: 16 }} /> Cadastrar Skill
              </button>
              <button type="button" className={classes.button} title="Busca as skills de novo no repositório" onClick={refresh}>
                <RefreshIcon style={{ fontSize: 16 }} /> Atualizar
              </button>
            </div>
          </div>

          <div className={classes.bar}>
            <span className={classes.badgeLime}>
              {filtradas.length} {filtradas.length === 1 ? 'skill' : 'skills'}
            </span>
            <div className={classes.tabs} role="group" aria-label="Ambiente">
              {ABAS_AMBIENTE.map(aba => (
                <button
                  key={aba.id}
                  type="button"
                  aria-pressed={ambiente === aba.id}
                  className={`${classes.tab} ${ambiente === aba.id ? classes.tabActive : ''}`}
                  onClick={() => setAmbiente(aba.id)}
                >
                  {aba.rotulo}
                </button>
              ))}
            </div>
            <label className={classes.search}>
              <SearchIcon style={{ fontSize: 18 }} />
              <input
                type="search"
                placeholder="Buscar skill por nome ou descrição"
                aria-label="Buscar skill por nome ou descrição"
                value={busca}
                onChange={event => setBusca(event.target.value)}
              />
            </label>
          </div>

          {loading && <Progress />}
          {!loading && filtradas.length > 0 && (
            <div className={classes.grid}>
              {filtradas.map(skill => (
                <SkillCard key={skill.slug} skill={skill} />
              ))}
            </div>
          )}
          {!loading && filtradas.length === 0 && <div className={classes.empty}>Nenhuma skill encontrada com esses filtros.</div>}
        </div>
        <Dialogs dialogo={dialogo} onClose={() => setDialogo(null)} />
      </Content>
    </Page>
  );
}
