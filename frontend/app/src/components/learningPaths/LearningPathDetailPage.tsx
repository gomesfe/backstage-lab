import { useState } from 'react';
import { useParams } from 'react-router-dom';
import CheckIcon from '@material-ui/icons/Check';
import { Content, Link, Page } from '@backstage/core-components';
import { BarraProgresso } from './PathCard';
import { StepDialog } from './StepDialog';
import { TRILHAS } from './data';
import { useProgresso } from './hooks/useProgresso';
import { contarFeitas, proximaTrilha } from './helpers';
import { useStyles } from './styles';

/** Uma trilha: etapas numeradas, progresso e o texto de cada etapa num pop-up. */
export function LearningPathDetailPage() {
  const classes = useStyles();
  const { pathId } = useParams();
  const { feitasEm, definir, recomecar } = useProgresso();
  const [aberta, setAberta] = useState<number | null>(null);

  const trilha = TRILHAS.find(item => item.id === pathId);

  if (!trilha) {
    return (
      <Page themeId="tool">
        <Content>
          <div className={classes.page}>
            <div className={classes.empty}>
              <h2 className={classes.toolbarTitle} style={{ justifyContent: 'center' }}>
                Trilha não encontrada
              </h2>
              <p>
                <Link to="/learning-paths" className={classes.link}>
                  Ver todas as trilhas
                </Link>
              </p>
            </div>
          </div>
        </Content>
      </Page>
    );
  }

  const feitas = feitasEm(trilha.id);
  const total = trilha.etapas.length;
  const quantas = contarFeitas(trilha, feitas);
  const proxima = trilha.etapas.findIndex(etapa => !feitas.has(etapa.id));
  const sugestao = proximaTrilha(TRILHAS, trilha);
  const etapaAberta = aberta === null ? null : trilha.etapas[aberta];

  return (
    <Page themeId="tool">
      <Content>
        <div className={classes.page}>
          <div className={classes.header}>
            <div>
              <nav className={classes.migalhas} aria-label="Você está em">
                <Link to="/">Home</Link> › <Link to="/learning-paths">Trilhas</Link> › <span>{trilha.titulo}</span>
              </nav>
              <span className={classes.eyebrow}>Trilha · {trilha.dificuldade}</span>
              <h1 className={classes.title}>{trilha.titulo}</h1>
              <p className={classes.subtitle}>{trilha.descricao}</p>
            </div>
            <div className={classes.acoes}>
              <Link to="/learning-paths" className={classes.button}>
                ‹ Todas as trilhas
              </Link>
              {quantas > 0 && (
                <button type="button" className={classes.button} onClick={() => recomecar(trilha.id)}>
                  Recomeçar
                </button>
              )}
            </div>
          </div>

          <section className={classes.card}>
            <BarraProgresso feitas={quantas} total={total} />
            <div className={classes.etapas}>
              {trilha.etapas.map((etapa, indice) => {
                const feita = feitas.has(etapa.id);
                return (
                  <div
                    key={etapa.id}
                    className={`${classes.etapa} ${feita ? classes.etapaFeita : ''} ${indice === proxima ? classes.etapaProxima : ''}`}
                  >
                    <button
                      type="button"
                      className={`${classes.check} ${feita ? classes.checkFeito : ''}`}
                      aria-pressed={feita}
                      aria-label={`${feita ? 'Desmarcar' : 'Marcar'} etapa ${indice + 1} como concluída`}
                      onClick={() => definir(trilha.id, etapa.id, !feita)}
                    >
                      {feita && <CheckIcon style={{ fontSize: 14 }} />}
                    </button>
                    <button type="button" className={classes.etapaCorpo} onClick={() => setAberta(indice)}>
                      <span className={classes.etapaTitulo}>
                        {indice + 1}. {etapa.titulo}
                      </span>
                      <span className={classes.etapaResumo}>{etapa.resumo}</span>
                    </button>
                    <button type="button" className={classes.ler} onClick={() => setAberta(indice)}>
                      Ler ↗
                    </button>
                  </div>
                );
              })}
            </div>

            {quantas >= total && (
              <div className={classes.concluida} role="status">
                <div style={{ flex: 1, minWidth: 200 }}>
                  <strong className={classes.alertTitle}>Trilha concluída</strong>
                  {sugestao && <span className={classes.heroSub}>Próxima sugestão: {sugestao.titulo}.</span>}
                </div>
                <span className={classes.acoes}>
                  <Link to="/learning-paths" className={classes.button}>
                    ‹ Voltar para trilhas
                  </Link>
                  {sugestao && (
                    <Link to={`/learning-paths/${sugestao.id}`} className={classes.buttonPrimary}>
                      Próxima trilha ›
                    </Link>
                  )}
                </span>
              </div>
            )}
          </section>
        </div>

        {etapaAberta && aberta !== null && (
          <StepDialog
            etapa={etapaAberta}
            numero={aberta + 1}
            total={total}
            feita={feitas.has(etapaAberta.id)}
            onAlternar={() => definir(trilha.id, etapaAberta.id, !feitas.has(etapaAberta.id))}
            onAnterior={() => setAberta(aberta - 1)}
            onConcluirESeguir={() => {
              definir(trilha.id, etapaAberta.id, true);
              setAberta(aberta + 1 < total ? aberta + 1 : null);
            }}
            onClose={() => setAberta(null)}
          />
        )}
      </Content>
    </Page>
  );
}
