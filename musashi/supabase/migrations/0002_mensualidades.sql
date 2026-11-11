-- Musashi · cobros mensuales recurrentes (igualas, hospedaje y soporte).
-- Se corre una vez en el SQL Editor de Supabase, después de 0001_musashi_base.sql.
-- Cada mensualidad activa genera sola la factura de su mes el día de cobro.
begin;

create table mensualidades (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  proyecto_id uuid references proyectos(id) on delete set null,
  concepto text not null,
  monto numeric(12,2) not null check (monto > 0),         -- con IVA, igual que facturas.monto
  dia_cobro int not null default 1 check (dia_cobro between 1 and 28),
  dias_para_pagar int not null default 5 check (dias_para_pagar between 0 and 90),
  inicio date not null default current_date,              -- el primer cobro es el primer día de cobro en o después de esta fecha
  fin date,                                               -- último día en que puede caer un cobro; vacío = sin fecha de término
  activa boolean not null default true,
  reanudada date,                                         -- al reanudar una pausa: no se cobran los meses que estuvo en pausa
  notas text,
  creado_en timestamptz not null default now()
);
create index mensualidades_cliente on mensualidades (cliente_id);

-- La factura de cada mes queda ligada a su mensualidad y a su periodo (AAAA-MM).
alter table facturas add column mensualidad_id uuid references mensualidades(id) on delete set null;
alter table facturas add column periodo text check (periodo ~ '^\d{4}-\d{2}$');
-- Una sola factura por mensualidad y mes, aunque dos pantallas la pidan al mismo tiempo.
create unique index facturas_mensualidad_periodo on facturas (mensualidad_id, periodo) where mensualidad_id is not null;

-- Misma seguridad que el resto: RLS activo y sin políticas; sólo el servidor de Musashi entra.
alter table mensualidades enable row level security;
revoke all on mensualidades from anon, authenticated;

commit;
