-- Musashi · números del negocio de cada cliente (calculadora de rentabilidad del diagnóstico).
-- Se corre una vez en el SQL Editor de Supabase, después de 0003.
-- Guarda los datos que da el cliente como rangos ({"rentas_mes": {"min": 50, "max": 80}}),
-- el modelo con que se calculan y las notas de la conversación.
begin;
create table numeros_negocio (
  cliente_id uuid primary key references clientes(id) on delete cascade,
  modelo text not null default 'venta',          -- renta (piezas que salen y regresan) o venta
  datos jsonb not null default '{}'::jsonb,
  notas text,
  actualizado_en timestamptz not null default now()
);
alter table numeros_negocio enable row level security;
revoke all on numeros_negocio from anon, authenticated;
commit;
