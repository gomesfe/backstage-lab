# Break Glass — `/break-glass`

Solicitação de acesso privilegiado, temporário e auditado a uma conta AWS
durante um incidente.

**Arquivos:** `index.html` (a tela, em HTML estático — abre direto no navegador) e `page.tsx` (rota no portal).

> **Versão HTML.** Os dados são de exemplo, escritos no próprio `index.html`, e os botões que gravariam algo só abrem o diálogo. O que este README descreve como vindo do catálogo ou de uma API é o que a tela deve mostrar quando essa fonte existir.

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
