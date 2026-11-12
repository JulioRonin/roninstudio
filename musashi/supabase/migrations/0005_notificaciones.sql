-- Musashi · notificaciones push a tus dispositivos (celular o computadora con Musashi instalado).
-- Se corre una vez en el SQL Editor de Supabase, después de 0004.
-- Cada dispositivo que activa las notificaciones deja aquí su suscripción del navegador.
begin;
create table push_suscripciones (
  id uuid primary key default gen_random_uuid(),
  endpoint text unique not null,
  p256dh text not null,
  auth text not null,
  dispositivo text,
  creado_en timestamptz not null default now(),
  ultimo_envio timestamptz
);
alter table push_suscripciones enable row level security;
revoke all on push_suscripciones from anon, authenticated;
commit;
