import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useAsync from 'react-use/lib/useAsync';
import useDebounce from 'react-use/lib/useDebounce';
import { useApi } from '@backstage/core-plugin-api';
import { searchApiRef } from '@backstage/plugin-search-react';

/**
 * Busca global pelo índice de busca do Backstage (catálogo e TechDocs). O
 * termo e o tipo ficam na URL (`?q=`, `?type=`): o link pode ser
 * compartilhado e o "voltar" do navegador volta para os resultados.
 */
export function useBusca() {
  const searchApi = useApi(searchApiRef);
  const [parametros, setParametros] = useSearchParams();
  const [termo, setTermo] = useState(parametros.get('q') ?? '');
  const [aplicado, setAplicado] = useState(termo);
  const tipo = parametros.get('type') ?? '';

  // Busca 300 ms depois de parar de digitar.
  useDebounce(() => setAplicado(termo.trim()), 300, [termo]);

  useEffect(() => {
    const proximos = new URLSearchParams(parametros);
    if (aplicado) proximos.set('q', aplicado);
    else proximos.delete('q');
    setParametros(proximos, { replace: true });
    // Só o termo aplicado escreve na URL; os outros parâmetros vêm junto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aplicado]);

  // A barra do topo navega para /search?q=… com a página já aberta.
  const daUrl = parametros.get('q') ?? '';
  useEffect(() => {
    if (daUrl !== aplicado) {
      setTermo(daUrl);
      setAplicado(daUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daUrl]);

  const mudarTipo = (valor: string) => {
    const proximos = new URLSearchParams(parametros);
    if (valor) proximos.set('type', valor);
    else proximos.delete('type');
    setParametros(proximos, { replace: true });
  };

  const { value, loading, error } = useAsync(async () => {
    if (!aplicado) return { results: [], semIndice: false };
    try {
      const resposta = await searchApi.query({
        term: aplicado,
        types: tipo ? [tipo] : undefined,
      });
      return { results: resposta.results, semIndice: false };
    } catch (falha) {
      // Um tipo sem índice (ex.: nenhuma documentação publicada ainda) faz o
      // backend responder 500. Para quem busca, isso é "não há o que achar".
      if (tipo) return { results: [], semIndice: true };
      throw falha;
    }
  }, [searchApi, aplicado, tipo]);

  const resultados = useMemo(() => value?.results ?? [], [value]);

  return {
    termo,
    setTermo,
    aplicado,
    tipo,
    mudarTipo,
    resultados,
    semIndice: Boolean(value?.semIndice),
    loading,
    error,
  };
}
