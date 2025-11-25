# Configuracao do Webhook Stripe com Supabase Edge Function

Este guia explica como deployar a Edge Function para ativar o Premium automaticamente apos pagamento.

## Pre-requisitos

1. Supabase CLI instalado: `npm install -g supabase`
2. Projeto Supabase configurado
3. Conta Stripe com Payment Link criado

## Passo 1: Fazer Login no Supabase

```bash
supabase login
```

## Passo 2: Linkar com seu Projeto

```bash
supabase link --project-ref clwspdnaafuvjdhjhrpn
```

## Passo 3: Configurar Secrets da Edge Function

No Supabase Dashboard (https://supabase.com/dashboard):

1. Va em **Project Settings** > **Edge Functions**
2. Adicione os seguintes secrets:

| Nome | Valor |
|------|-------|
| `STRIPE_SECRET_KEY` | sk_live_... (sua chave secreta do Stripe) |
| `STRIPE_WEBHOOK_SECRET` | whsec_... (obtido no Stripe Dashboard) |
| `SUPABASE_URL` | https://clwspdnaafuvjdhjhrpn.supabase.co |
| `SUPABASE_SERVICE_ROLE_KEY` | eyJ... (encontrado em Project Settings > API) |

## Passo 4: Deployar a Edge Function

```bash
supabase functions deploy stripe-webhook --no-verify-jwt
```

A flag `--no-verify-jwt` e necessaria porque o Stripe chama o webhook diretamente.

## Passo 5: Configurar Webhook no Stripe Dashboard

1. Acesse: https://dashboard.stripe.com/webhooks
2. Clique em **Add endpoint**
3. Configure:
   - **Endpoint URL**: `https://clwspdnaafuvjdhjhrpn.supabase.co/functions/v1/stripe-webhook`
   - **Events to listen**: `checkout.session.completed`
4. Salve e copie o **Signing secret** (whsec_...)
5. Adicione esse secret no Supabase conforme Passo 3

## Passo 6: Testar

1. Faca um pagamento teste no app
2. No Stripe Dashboard, va em **Developers** > **Webhooks**
3. Clique no seu webhook e verifique os eventos recentes
4. O status deve ser **200 OK** e o Premium deve estar ativado

## Solucao de Problemas

### Erro 404
A Edge Function nao foi deployada. Execute o Passo 4 novamente.

### Erro 400 (Signature verification failed)
O `STRIPE_WEBHOOK_SECRET` esta incorreto. Verifique se voce copiou o valor correto do Stripe Dashboard.

### Erro 500 (Failed to update premium status)
Verifique se:
- O `SUPABASE_SERVICE_ROLE_KEY` esta correto
- A tabela `profiles` existe e tem a coluna `is_premium`
- O `client_reference_id` passado no checkout corresponde ao `id` do usuario

### Premium nao ativa no app
Apos o pagamento, clique em "Restaurar Compras" na tela Premium ou feche e reabra o app.

## Variaveis de Ambiente do App

As seguintes variaveis estao configuradas no `app.config.js` (seguras para o cliente):

- `supabaseUrl`: URL publica do projeto Supabase
- `supabaseAnonKey`: Chave anonima (publica) - protegida por RLS
- `stripePaymentLink`: Link de pagamento publico

**Nota de Seguranca**: As chaves secretas (`STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_WEBHOOK_SECRET`) NUNCA devem estar no codigo do app. Elas ficam apenas nas configuracoes da Edge Function no Supabase Dashboard.
