# Break Glass — `/break-glass`

Solicitação de acesso privilegiado, temporário e auditado a uma conta AWS
durante um incidente.

**Arquivos:** a tela do portal é React, em `components/breakGlass/` (página, componentes, `hooks/`, `helpers.ts`, `styles.ts`). `page.tsx` registra a rota; `index.html` fica como referência visual avulsa (abre direto no navegador).


## Deve conter

1. **Cabeçalho:** "Acesso emergencial" · Break Glass.
2. **Alerta de atenção:** uso restrito, auditado, expira sozinho.
3. **Formulário "Nova solicitação"**
   - **Perfil de acesso** (ReadOnly, PowerUser, DatabaseAdmin, NetworkAdmin);
   - **Duração** (1, 2, 4 ou 8 horas; padrão 1 hora);
   - **ID da conta AWS** — exatamente 12 dígitos, só números; erro em
     vermelho com contador enquanto estiver incompleto;
   - **Justificativa** — mínimo de 20 caracteres, com número do incidente;
   - **resumo** do pedido ("Você vai pedir X na conta Y por Z") quando tudo
     estiver válido;
   - botão **Solicitar acesso**, desabilitado até o formulário ser válido.
4. **Cartão "Como funciona":** tempo de execução, expiração, auditoria,
   menor privilégio.

## Estado atual no lab

Não existe backend de break glass. Ao enviar, a tela diz com todas as
letras que **nada foi concedido** e o que faltaria (registrar a
solicitação, notificar o squad, emitir a role temporária via STS). Fingir
"acesso concedido" numa tela de segurança seria a mentira mais cara que o
portal poderia contar — alguém acreditaria durante um incidente.
