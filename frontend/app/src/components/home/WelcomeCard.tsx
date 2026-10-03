import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAsync from 'react-use/lib/useAsync';
import Avatar from '@material-ui/core/Avatar';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import { setPref, usePref } from '../../atlas/shell/prefs/prefs';
import { TIME_PADRAO, TIMES } from './data';
import { iniciais, saudacao } from './helpers';
import { useStyles } from './styles';

/**
 * Boas-vindas: saudação pela hora do dia, a caixa "Pergunte ao Atlas" (abre o
 * Agente já com a pergunta) e o time da pessoa, com o champion dele. O time
 * fica na preferência `team` e filtra as aplicações e o "seu time" da Home.
 */
export function WelcomeCard() {
  const classes = useStyles();
  const navigate = useNavigate();
  const identityApi = useApi(identityApiRef);
  const { value: perfil } = useAsync(
    () => identityApi.getProfileInfo(),
    [identityApi],
  );
  const [pergunta, setPergunta] = useState('');
  const timeId = usePref('team', TIME_PADRAO);
  const time = TIMES.find(item => item.id === timeId);
  const primeiroNome = perfil?.displayName?.split(' ')[0];

  const perguntar = () => {
    const texto = pergunta.trim();
    navigate(texto ? `/agent?q=${encodeURIComponent(texto)}` : '/agent');
  };

  return (
    <div className={classes.boasVindas}>
      <span className={classes.boasVindasEyebrow}>Portal do desenvolvedor</span>
      <h1 className={classes.boasVindasTitulo}>
        {primeiroNome ? (
          <>
            {saudacao()}, <span className={classes.nome}>{primeiroNome}</span>
          </>
        ) : (
          <>
            {saudacao()}, bem-vindo ao{' '}
            <span className={classes.nome}>Atlas</span>
          </>
        )}
      </h1>
      <p className={classes.boasVindasTexto}>
        Provisione, descubra e governe recursos em um só lugar.
      </p>

      <form
        className={classes.pergunta}
        onSubmit={evento => {
          evento.preventDefault();
          perguntar();
        }}
      >
        <input
          type="text"
          placeholder="O que você quer fazer?"
          aria-label="Pergunte ao Atlas"
          value={pergunta}
          onChange={evento => setPergunta(evento.target.value)}
        />
        <button type="submit" className={classes.buttonPrimary}>
          Perguntar
        </button>
      </form>

      <div className={classes.time}>
        <span className={classes.rotulo}>Seu time</span>
        <select
          className={classes.seletorTime}
          aria-label="Seu time"
          value={timeId}
          onChange={evento =>
            setPref(
              'team',
              evento.target.value === TIME_PADRAO ? null : evento.target.value,
            )
          }
        >
          <option value="all">Todos os times</option>
          {TIMES.map(item => (
            <option key={item.id} value={item.id}>
              {item.nome}
            </option>
          ))}
        </select>
        <span className={classes.champion} title="Champion do time">
          <Avatar className={classes.avatarPequeno}>
            {time ? iniciais(time.champion) : '·'}
          </Avatar>
          <span>
            Champion: <strong>{time?.champion ?? '—'}</strong>
          </span>
        </span>
      </div>
    </div>
  );
}
