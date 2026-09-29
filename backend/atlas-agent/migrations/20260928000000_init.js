/**
 * Conversas com o agente do Atlas e as mensagens de cada uma.
 *
 * Cada conversa pertence a um usuário (`owner`, o entityRef). O router só
 * devolve conversas do próprio dono — histórico de chat é pessoal.
 *
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('agent_conversations', table => {
    table.comment('Conversas com o agente do Atlas');
    table.uuid('id').primary().notNullable();
    table.string('owner').notNullable().comment('entityRef do dono, ex: user:default/gomesfe');
    table.string('title').notNullable();
    table.dateTime('created_at').notNullable();
    table.dateTime('updated_at').notNullable();
    table.index(['owner', 'updated_at'], 'agent_conversations_owner_idx');
  });

  await knex.schema.createTable('agent_messages', table => {
    table.comment('Mensagens de uma conversa com o agente');
    table.uuid('id').primary().notNullable();
    table
      .uuid('conversation_id')
      .notNullable()
      .references('id')
      .inTable('agent_conversations')
      .onDelete('CASCADE');
    table.string('role').notNullable().comment("'user' ou 'assistant'");
    table.text('content').notNullable();
    table
      .text('activity')
      .nullable()
      .comment('JSON: consultas que o agente fez para responder (ex.: buscas no catálogo)');
    table.dateTime('created_at').notNullable();
    table.index(['conversation_id', 'created_at'], 'agent_messages_conversation_idx');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('agent_messages');
  await knex.schema.dropTableIfExists('agent_conversations');
};
