import { PontoSituacao } from './ServicesList';
import { useStyles } from './styles';
import type { Incidente } from './types';

/** Incidentes recentes: em andamento em âmbar, resolvidos em verde. */
export function IncidentsList({ incidentes }: { incidentes: Incidente[] }) {
  const classes = useStyles();

  return (
    <section className={classes.card}>
      <h3 className={classes.toolbarTitle}>Incidentes recentes</h3>
      <div>
        {incidentes.map(incidente => (
          <div
            key={`${incidente.titulo}-${incidente.quando}`}
            className={classes.incidente}
          >
            <span style={{ marginTop: 5 }}>
              <PontoSituacao
                situacao={incidente.emAndamento ? 'degradado' : 'operacional'}
              />
            </span>
            <div>
              <div className={classes.incidenteTitulo}>{incidente.titulo}</div>
              <div className={classes.incidenteTexto}>
                {incidente.descricao}
              </div>
              <div className={classes.incidenteQuando}>{incidente.quando}</div>
            </div>
          </div>
        ))}
        {incidentes.length === 0 && (
          <div className={classes.empty}>Nenhum incidente recente.</div>
        )}
      </div>
    </section>
  );
}
