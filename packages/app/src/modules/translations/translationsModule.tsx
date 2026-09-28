import {
  createFrontendModule,
  createTranslationMessages,
} from '@backstage/frontend-plugin-api';
import { TranslationBlueprint } from '@backstage/plugin-app-react';
import { scaffolderTranslationRef } from '@backstage/plugin-scaffolder/alpha';
import { coreComponentsTranslationRef } from '@backstage/core-components/alpha';

/**
 * Textos das telas internas do scaffolder, no vocabulário do Atlas.
 *
 * O índice de Ofertas é nosso (`screens/create`), mas o formulário da oferta,
 * a execução e a lista de tarefas continuam sendo do plugin. Em vez de
 * reescrever essas telas, trocamos só as mensagens: no Atlas, template se
 * chama **oferta**. `full: false` — o que não está aqui segue o padrão.
 */
const scaffolderMessages = TranslationBlueprint.make({
  name: 'scaffolder-atlas',
  params: {
    resource: createTranslationMessages({
      ref: scaffolderTranslationRef,
      full: false,
      messages: {
        'templateWizardPage.title': 'Nova oferta',
        'templateWizardPage.subtitle': 'Preencha o formulário para executar a oferta.',
        'templateWizardPage.pageTitle': 'Nova oferta',
        'templateWizardPage.templateWithTitle': '{{templateTitle}}',
        'templateWizardPage.pageContextMenu.editConfigurationTitle': 'Editar configuração',

        'templateListPage.title': 'Ofertas',
        'templateListPage.subtitle': 'Escolha uma oferta para provisionar recursos, criar repositórios ou registrar entidades.',
        'templateListPage.pageTitle': 'Ofertas',
        'templateListPage.templateGroups.defaultTitle': 'Ofertas',
        'templateListPage.templateGroups.otherTitle': 'Outras ofertas',
        'templateListPage.contentHeader.registerExistingButtonTitle': 'Registrar componente existente',

        'ongoingTask.title': 'Execução de',
        'ongoingTask.pageTitle.hasTemplateName': 'Execução de {{templateName}}',
        'ongoingTask.pageTitle.noTemplateName': 'Execução da oferta',
        'ongoingTask.subtitle': 'Tarefa {{taskId}}',
        'ongoingTask.cancelButtonTitle': 'Cancelar',
        'ongoingTask.retryButtonTitle': 'Tentar de novo',
        'ongoingTask.startOverButtonTitle': 'Recomeçar',
        'ongoingTask.hideLogsButtonTitle': 'Ocultar logs',
        'ongoingTask.showLogsButtonTitle': 'Mostrar logs',

        'listTaskPage.title': 'Tarefas das ofertas',
        'listTaskPage.pageTitle': 'Tarefas das ofertas',
        'listTaskPage.subtitle': 'Todas as ofertas executadas',
        'listTaskPage.content.tableTitle': 'Tarefas',
        'listTaskPage.content.tableCell.taskID': 'Tarefa',
        'listTaskPage.content.tableCell.template': 'Oferta',
        'listTaskPage.content.tableCell.created': 'Criada em',
        'listTaskPage.content.tableCell.owner': 'Dono',
        'listTaskPage.content.tableCell.status': 'Status',
        'listTaskPage.content.emptyState.title': 'Nada para mostrar',
        'listTaskPage.content.emptyState.description': 'Nenhuma oferta executada ainda, ou o backend não respondeu.',
      },
    }),
  },
});

/** Tela de login: o cartão do convidado vem do Backstage, em inglês. */
const signInMessages = TranslationBlueprint.make({
  name: 'core-components-atlas',
  params: {
    resource: createTranslationMessages({
      ref: coreComponentsTranslationRef,
      full: false,
      messages: {
        'signIn.title': 'Entrar',
        'signIn.loginFailed': 'Não foi possível entrar',
        'signIn.guestProvider.title': 'Convidado',
        'signIn.guestProvider.subtitle':
          'Entrar como convidado.\n Sem identidade verificada: algumas funções podem ficar indisponíveis.',
        'signIn.guestProvider.enter': 'Entrar',
      },
    }),
  },
});

export const translationsModule = createFrontendModule({
  pluginId: 'app',
  extensions: [scaffolderMessages, signInMessages],
});
