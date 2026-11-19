-- Musashi · cada vez que se abre la liga de una cotización queda un registro.
-- Se corre una vez en el SQL Editor de Supabase, después de 0005.
-- "propia" = se abrió desde un navegador que marcaste como tuyo (Configuración → Tus dispositivos):
-- se guarda para que la veas, pero no cuenta como apertura del cliente.
begin;
create table cotizacion_aperturas (
  id uuid primary key default gen_random_uuid(),
  cotizacion_id uuid not null references cotizaciones(id) on delete cascade,
  abierta_en timestamptz not null default now(),
  propia boolean not null default false,
  dispositivo text,
  navegador text,
  ciudad text
);
create index cotizacion_aperturas_cotizacion on cotizacion_aperturas (cotizacion_id, abierta_en desc);
alter table cotizacion_aperturas enable row level security;
revoke all on cotizacion_aperturas from anon, authenticated;
commit;
