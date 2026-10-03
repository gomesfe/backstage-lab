import type { ReactNode } from 'react';
import AppsIcon from '@material-ui/icons/Apps';
import PeopleIcon from '@material-ui/icons/People';
import ApiIcon from '@material-ui/icons/Extension';
import CloudIcon from '@material-ui/icons/Cloud';
import SystemIcon from '@material-ui/icons/AccountTree';
import FolderIcon from '@material-ui/icons/Folder';
import { Link } from '@backstage/core-components';
import { useStyles } from './styles';

type Numero = {
  rotulo: string;
  sub: string;
  valor: number;
  para: string;
  icone: ReactNode;
};

type Props = {
  carregando: boolean;
  numeros: {
    aplicacoes: number;
    aplicacoesEmProducao: number;
    squads: number;
    apis: number;
    apisEmProducao: number;
    sistemas: number;
    aplicacoesEmSistemas: number;
    recursos: number;
    repositorios: number;
  };
};

/** Os três blocos de números, em pares; o do meio (APIs e Recursos) em verde. Cada linha leva à lista filtrada. */
export function MetricBlocks({ carregando, numeros }: Props) {
  const classes = useStyles();
  const icone = { fontSize: 18 };
  const blocos: { verde?: boolean; itens: Numero[] }[] = [
    {
      itens: [
        {
          rotulo: 'Aplicações',
          sub: `${numeros.aplicacoesEmProducao} em produção`,
          valor: numeros.aplicacoes,
          para: '/catalog?kind=Component',
          icone: <AppsIcon style={icone} />,
        },
        {
          rotulo: 'Squads no escopo',
          sub: 'grupos no catálogo',
          valor: numeros.squads,
          para: '/catalog?kind=Group',
          icone: <PeopleIcon style={icone} />,
        },
      ],
    },
    {
      verde: true,
      itens: [
        {
          rotulo: 'APIs',
          sub: `${numeros.apisEmProducao} em produção`,
          valor: numeros.apis,
          para: '/api-docs',
          icone: <ApiIcon style={icone} />,
        },
        {
          rotulo: 'Recursos',
          sub: 'bancos, filas e buckets',
          valor: numeros.recursos,
          para: '/provisioning-map',
          icone: <CloudIcon style={icone} />,
        },
      ],
    },
    {
      itens: [
        {
          rotulo: 'Sistemas',
          sub: `${numeros.aplicacoesEmSistemas} aplicações`,
          valor: numeros.sistemas,
          para: '/catalog?kind=System',
          icone: <SystemIcon style={icone} />,
        },
        {
          rotulo: 'Repositórios',
          sub: 'infra e aplicação',
          valor: numeros.repositorios,
          para: '/provisioning-map#repositorios',
          icone: <FolderIcon style={icone} />,
        },
      ],
    },
  ];

  return (
    <div className={classes.blocos}>
      {blocos.map(bloco => (
        <div
          key={bloco.itens[0].rotulo}
          className={`${classes.bloco} ${
            bloco.verde ? classes.blocoVerde : ''
          }`}
        >
          {bloco.itens.map(item => (
            <Link key={item.rotulo} to={item.para} className={classes.numero}>
              <span className={classes.numeroIcone}>{item.icone}</span>
              <span className={classes.numeroTexto}>
                <span className={classes.numeroRotulo}>{item.rotulo}</span>
                <span className={classes.numeroSub}>
                  {carregando ? '…' : item.sub}
                </span>
              </span>
              <span className={classes.numeroValor}>
                {carregando ? (
                  <span className={classes.esqueleto} aria-label="Carregando" />
                ) : (
                  item.valor
                )}
              </span>
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}
