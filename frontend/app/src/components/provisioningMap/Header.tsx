import { usePermission } from '@backstage/plugin-permission-react';
import RefreshIcon from '@material-ui/icons/Refresh';
import { atlasProvisioningRefreshPermission } from '../../atlas/permissions';
import { FREE_DELETE_WINDOW_HOURS } from './helpers';
import { useStyles } from './styles';

type Props = {
  totalRecursos: number;
  totalServicos: number;
  totalOfertas: number;
  onRefresh: () => void;
};

/** Título, os três números e a regra de exclusão. "Refresh admin" só para quem tem a permissão. */
export function Header({
  totalRecursos,
  totalServicos,
  totalOfertas,
  onRefresh,
}: Props) {
  const classes = useStyles();
  const { allowed: canRefresh } = usePermission({
    permission: atlasProvisioningRefreshPermission,
  });

  return (
    <>
      <div className={classes.header}>
        <div>
          <span className={classes.eyebrow}>Provisionamento</span>
          <h1 className={classes.title}>Mapa de provisionamento</h1>
          <p className={classes.subtitle}>
            Onde cada recurso está provisionado, por qual oferta, e o que dá
            para promover ou excluir.
          </p>
        </div>
        {canRefresh && (
          <button
            type="button"
            className={classes.button}
            title="Relê o inventário. Só administradores."
            onClick={onRefresh}
          >
            <RefreshIcon style={{ fontSize: 16 }} /> Refresh admin
          </button>
        )}
      </div>

      <div className={classes.metrics}>
        <div className={classes.metric}>
          <div className={classes.metricTitle}>Recursos IaC</div>
          <div className={classes.metricValue}>{totalRecursos}</div>
          <div className={classes.metricSub}>provisionados por IaC</div>
        </div>
        <div className={classes.metric}>
          <div className={classes.metricTitle}>Serviços Núclea</div>
          <div className={classes.metricValue}>{totalServicos}</div>
          <div className={classes.metricSub}>com recurso provisionado</div>
        </div>
        <div className={classes.metric}>
          <div className={classes.metricTitle}>Ofertas</div>
          <div className={classes.metricValue}>{totalOfertas}</div>
          <div className={classes.metricSub}>em uso nos recursos</div>
        </div>
      </div>

      <div className={classes.rule} role="note">
        <strong className={classes.ruleTitle}>Regras</strong>
        Deleções solicitadas em até {FREE_DELETE_WINDOW_HOURS} horas não exigem
        aprovação. Alguns recursos podem exigir aprovação do time de cloud antes
        da execução — promoções para prod e prdnv passam por ele.
      </div>
    </>
  );
}
