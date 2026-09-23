/**
 * Tabela de API keys.
 *
 * Guardamos apenas o hash do segredo — a chave em claro é devolvida uma única
 * vez, na criação, e depois não existe mais em lugar nenhum. Se o banco vazar,
 * o atacante leva hashes, não credenciais.
 *
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('api_keys', table => {
    table.comment('API keys emitidas para acesso programático ao portal');

    table.uuid('id').primary().notNullable();
    table
      .string('prefix')
      .notNullable()
      .comment('Primeiros caracteres da chave, para o usuário reconhecê-la');
    table
      .string('secret_hash')
      .notNullable()
      .comment('SHA-256 do segredo completo');
    table.string('description').notNullable();
    table
      .string('owner')
      .notNullable()
      .comment('entityRef de quem emitiu, ex: user:default/gomesfe');
    table.dateTime('created_at').notNullable();
    table
      .dateTime('expires_at')
      .nullable()
      .comment('Nulo quando a chave não expira');
    table
      .dateTime('revoked_at')
      .nullable()
      .comment('Revogação é lógica: a linha fica para auditoria');
    table
      .dateTime('last_used_at')
      .nullable()
      .comment('Para achar chaves esquecidas');

    // A validação chega com o segredo em mãos; a busca é sempre pelo hash.
    table.unique(['secret_hash'], { indexName: 'api_keys_secret_hash_uniq' });
    table.index(['owner'], 'api_keys_owner_idx');
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists('api_keys');
};
