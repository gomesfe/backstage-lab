import { ConfigReader } from '@backstage/config';
import { createAtlasEnv, AtlasEnvError } from './AtlasEnv';

const envFor = (atlas?: { env?: string; version?: string }) =>
  createAtlasEnv(new ConfigReader(atlas ? { atlas } : {}));

describe('createAtlasEnv', () => {
  it('assume local quando nada está configurado', () => {
    const env = envFor();

    expect(env.envName).toBe('local');
    expect(env.isLocal).toBe(true);
    expect(env.isProd).toBe(false);
    expect(env.version).toBe('0.0.0-dev');
  });

  it.each(['local', 'dev', 'lab', 'prod'] as const)(
    'reconhece o ambiente %s',
    name => {
      expect(envFor({ env: name }).envName).toBe(name);
    },
  );

  it('recusa um ambiente desconhecido em vez de assumir um', () => {
    // `prd` em vez de `prod` é o erro de digitação que desligaria as
    // proteções de produção em silêncio.
    expect(() => envFor({ env: 'prd' })).toThrow(AtlasEnvError);
    expect(() => envFor({ env: 'prd' })).toThrow(/prod/);
  });

  it('expõe diagnóstico fora de produção', () => {
    expect(envFor({ env: 'lab' }).showsDiagnostics).toBe(true);
    expect(envFor({ env: 'dev' }).showsDiagnostics).toBe(true);
    expect(envFor({ env: 'local' }).showsDiagnostics).toBe(true);
  });

  it('esconde diagnóstico em produção', () => {
    expect(envFor({ env: 'prod' }).showsDiagnostics).toBe(false);
  });

  it('só marca um ambiente por vez', () => {
    const env = envFor({ env: 'lab' });
    const flags = [env.isLocal, env.isDev, env.isLab, env.isProd];

    expect(flags.filter(Boolean)).toHaveLength(1);
    expect(env.isLab).toBe(true);
  });

  it('lê a versão quando informada', () => {
    expect(envFor({ env: 'lab', version: '1.4.2' }).version).toBe('1.4.2');
  });
});
