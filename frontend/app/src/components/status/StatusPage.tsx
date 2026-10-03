import { Content, Page, Progress } from '@backstage/core-components';
import { IncidentsList } from './IncidentsList';
import { ServicesList } from './ServicesList';
import { usePlatformStatus } from './hooks/usePlatformStatus';
import { useStyles } from './styles';

/** Status da Plataforma: o que está no ar, disponibilidade e incidentes recentes. */
export function StatusPage() {
  const classes = useStyles();
  const { status, loading } = usePlatformStatus();
  const operacionais = status.servicos.filter(
    servico => servico.situacao === 'operacional',
  ).length;

  return (
    <Page themeId="tool">
      <Content>
        <div className={classes.page}>
          <div className={classes.header}>
            <div>
              <span className={classes.eyebrow}>Operação</span>
              <h1 className={classes.title}>Status da Plataforma</h1>
              <p className={classes.subtitle}>
                Saúde dos serviços do portal Atlas, atualizada a cada minuto.
              </p>
            </div>
            <span className={classes.badgeInfo} title="Time responsável">
              {status.time}
            </span>
          </div>

          {loading && <Progress />}
          {!loading && (
            <>
              {status.aviso && (
                <div
                  className={`${classes.alert} ${classes.alertWarn}`}
                  role="status"
                  style={{ marginTop: 0 }}
                >
                  <strong className={classes.alertTitle}>
                    {status.aviso.titulo}
                  </strong>
                  {status.aviso.texto}
                </div>
              )}

              <div className={classes.metrics}>
                <div className={`${classes.metric} ${classes.metricDestaque}`}>
                  <div className={classes.metricTitle}>
                    Serviços operacionais
                  </div>
                  <div className={classes.metricValue}>
                    {operacionais}/{status.servicos.length}
                  </div>
                </div>
                <div className={classes.metric}>
                  <div className={classes.metricTitle}>
                    Disponibilidade (30 dias)
                  </div>
                  <div className={classes.metricValue}>
                    {status.disponibilidade30Dias}
                  </div>
                </div>
                <div className={classes.metric}>
                  <div className={classes.metricTitle}>Incidentes no mês</div>
                  <div className={classes.metricValue}>
                    {status.incidentesNoMes}
                  </div>
                </div>
              </div>

              <div className={classes.cols}>
                <ServicesList servicos={status.servicos} />
                <IncidentsList incidentes={status.incidentes} />
              </div>
            </>
          )}
        </div>
      </Content>
    </Page>
  );
}
