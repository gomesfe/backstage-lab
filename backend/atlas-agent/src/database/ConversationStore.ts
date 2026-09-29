import type { Knex } from 'knex';
import { v4 as uuid } from 'uuid';

export type Conversation = {
  id: string;
  owner: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
};

/** Uma consulta que o agente fez para responder — mostrada acima da resposta. */
export type Activity = { tool: string; label: string };

export type StoredMessage = {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  activity: Activity[];
  createdAt: Date;
};

export const DEFAULT_TITLE = 'Nova conversa';

/**
 * Cada banco devolve data de um jeito: Postgres traz `Date`, o SQLite do lab
 * guarda milissegundos (número, ou texto numérico) e às vezes texto ISO.
 */
const toDate = (value: unknown): Date => {
  if (value instanceof Date) return value;
  if (typeof value === 'number') return new Date(value);
  const text = String(value);
  return /^\d+$/.test(text) ? new Date(Number(text)) : new Date(text);
};

function toConversation(row: any): Conversation {
  return {
    id: row.id,
    owner: row.owner,
    title: row.title,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
}

function toMessage(row: any): StoredMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    role: row.role,
    content: row.content,
    activity: row.activity ? JSON.parse(row.activity) : [],
    createdAt: toDate(row.created_at),
  };
}

/** Persistência das conversas. Toda leitura é filtrada pelo dono. */
export class ConversationStore {
  constructor(private readonly db: Knex) {}

  async list(owner: string): Promise<Conversation[]> {
    const rows = await this.db('agent_conversations')
      .where({ owner })
      .orderBy('updated_at', 'desc')
      .limit(200);
    return rows.map(toConversation);
  }

  async get(owner: string, id: string): Promise<Conversation | undefined> {
    const row = await this.db('agent_conversations').where({ owner, id }).first();
    return row ? toConversation(row) : undefined;
  }

  async create(owner: string, title = DEFAULT_TITLE): Promise<Conversation> {
    const now = new Date();
    const conversation = { id: uuid(), owner, title, createdAt: now, updatedAt: now };
    await this.db('agent_conversations').insert({
      id: conversation.id,
      owner,
      title,
      created_at: now,
      updated_at: now,
    });
    return conversation;
  }

  async rename(owner: string, id: string, title: string): Promise<void> {
    await this.db('agent_conversations').where({ owner, id }).update({ title });
  }

  async remove(owner: string, id: string): Promise<boolean> {
    // Mensagens primeiro: nem todo banco do lab aplica o ON DELETE CASCADE
    // (SQLite só com foreign_keys ligado).
    const conversation = await this.get(owner, id);
    if (!conversation) return false;
    await this.db('agent_messages').where({ conversation_id: id }).delete();
    await this.db('agent_conversations').where({ owner, id }).delete();
    return true;
  }

  async messages(conversationId: string): Promise<StoredMessage[]> {
    const rows = await this.db('agent_messages')
      .where({ conversation_id: conversationId })
      .orderBy('created_at', 'asc');
    return rows.map(toMessage);
  }

  async addMessage(
    conversationId: string,
    role: StoredMessage['role'],
    content: string,
    activity: Activity[] = [],
  ): Promise<StoredMessage> {
    const now = new Date();
    const message: StoredMessage = { id: uuid(), conversationId, role, content, activity, createdAt: now };
    await this.db('agent_messages').insert({
      id: message.id,
      conversation_id: conversationId,
      role,
      content,
      activity: activity.length ? JSON.stringify(activity) : null,
      created_at: now,
    });
    await this.db('agent_conversations').where({ id: conversationId }).update({ updated_at: now });
    return message;
  }
}
