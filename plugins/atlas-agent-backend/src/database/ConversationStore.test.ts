import { resolve as resolvePath } from 'node:path';
import { TestDatabases } from '@backstage/backend-test-utils';
import type { Knex } from 'knex';
import { ConversationStore, DEFAULT_TITLE } from './ConversationStore';

const MIGRATIONS_DIR = resolvePath(__dirname, '../../migrations');
const ANA = 'user:default/ana';
const BRUNO = 'user:default/bruno';

describe('ConversationStore', () => {
  const databases = TestDatabases.create({ ids: ['SQLITE_3'] });

  let knex: Knex;
  let store: ConversationStore;

  beforeEach(async () => {
    knex = await databases.init('SQLITE_3');
    await knex.migrate.latest({ directory: MIGRATIONS_DIR });
    store = new ConversationStore(knex);
  });

  afterEach(async () => {
    await knex.destroy();
  });

  it('lê as datas do SQLite como datas válidas', async () => {
    // O SQLite guarda milissegundos; ler isso como texto dava "Invalid Date"
    // e derrubava a resposta do agente na hora de gravar.
    const conversation = await store.create(ANA);
    const [listed] = await store.list(ANA);
    expect(Number.isNaN(listed.updatedAt.getTime())).toBe(false);
    expect(listed.createdAt.toISOString()).toBe(conversation.createdAt.toISOString());

    const message = await store.addMessage(conversation.id, 'user', 'oi');
    const [stored] = await store.messages(conversation.id);
    expect(stored.createdAt.toISOString()).toBe(message.createdAt.toISOString());
  });

  it('só devolve conversas do próprio dono', async () => {
    const deAna = await store.create(ANA);
    await store.create(BRUNO);

    expect((await store.list(ANA)).map(c => c.id)).toEqual([deAna.id]);
    expect(await store.get(BRUNO, deAna.id)).toBeUndefined();
    expect(await store.remove(BRUNO, deAna.id)).toBe(false);
    expect(await store.get(ANA, deAna.id)).toBeDefined();
  });

  it('guarda mensagens em ordem, com as consultas do agente', async () => {
    const conversation = await store.create(ANA);
    expect(conversation.title).toBe(DEFAULT_TITLE);

    await store.addMessage(conversation.id, 'user', 'quais APIs existem?');
    await store.addMessage(conversation.id, 'assistant', 'Encontrei duas.', [
      { tool: 'buscar_catalogo', label: 'Buscou no catálogo · API' },
    ]);

    const messages = await store.messages(conversation.id);
    expect(messages.map(m => m.role)).toEqual(['user', 'assistant']);
    expect(messages[1].activity).toEqual([{ tool: 'buscar_catalogo', label: 'Buscou no catálogo · API' }]);
    expect(messages[0].activity).toEqual([]);
  });

  it('lista da conversa mais recente para a mais antiga', async () => {
    const antiga = await store.create(ANA);
    const nova = await store.create(ANA);
    // Mensagem nova na conversa antiga a traz para o topo.
    await new Promise(r => setTimeout(r, 5));
    await store.addMessage(antiga.id, 'user', 'voltei');

    expect((await store.list(ANA)).map(c => c.id)).toEqual([antiga.id, nova.id]);
  });

  it('apagar leva as mensagens junto', async () => {
    const conversation = await store.create(ANA);
    await store.addMessage(conversation.id, 'user', 'oi');

    expect(await store.remove(ANA, conversation.id)).toBe(true);
    expect(await knex('agent_messages').where({ conversation_id: conversation.id })).toHaveLength(0);
  });
});
