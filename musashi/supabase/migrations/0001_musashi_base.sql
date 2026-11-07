-- Musashi · esquema base (F0 + F1). Se aplica cuando exista el proyecto de Supabase.
-- Convenciones: tablas en español, ids uuid, timestamps con zona, RLS activo en todo.
create extension if not exists "pgcrypto";

-- ---------- Catálogos ----------
create type etapa_metodo as enum ('Mapear', 'Diseñar', 'Construir', 'Evolucionar');
create type estado_cotizacion as enum ('Borrador', 'Enviada', 'Abierta', 'Aceptada', 'Vencida', 'Perdida');
create type estado_hito as enum ('Planeado', 'En curso', 'En revisión', 'Aceptado', 'Atrasado');
create type estado_factura as enum ('Borrador', 'Vigente', 'Vencida', 'Pagada', 'Cancelada');
create type tipo_movimiento as enum ('Cobro', 'Gasto');
create type estado_tarea as enum ('Pendiente', 'Hecha', 'Cancelada');
create type estado_pieza as enum ('Idea', 'Guion', 'Producción', 'Aprobación', 'Programada', 'Publicada');
create type estado_propuesta as enum ('Pendiente', 'Aprobada', 'Editada', 'Descartada');

-- ---------- Clientes ----------
create table clientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  sector text not null,
  ciudad text,
  etapa_embudo text not null default 'Lead',           -- Lead, Contactado, Llamada, Diagnóstico, Propuesta, Cliente, Perdido
  origen text,                                          -- Instagram, LinkedIn, Referido, Diagnóstico exprés…
  siguiente_paso text,
  siguiente_fecha date,
  perfil_ia text,                                       -- cinco líneas del Perfilador
  razon_perdida text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);
create table contactos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  nombre text not null,
  puesto text,
  whatsapp text,
  correo text,
  decide boolean not null default false
);

-- ---------- Diagnóstico exprés (lo manda el sitio público) ----------
create table diagnosticos_expres (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references clientes(id) on delete set null,
  nombre text not null,
  negocio text not null,
  sector text,
  whatsapp text,
  correo text,
  respuestas jsonb not null,                            -- selecciones y texto libre por pregunta
  hallazgos jsonb,                                      -- lo que se le mostró al cliente
  lectura_interna jsonb,                                -- puntaje y notas internas
  contactado boolean not null default false,
  creado_en timestamptz not null default now()
);

-- ---------- Cotizaciones ----------
create table cotizaciones (
  id uuid primary key default gen_random_uuid(),
  folio text unique not null,
  cliente_id uuid not null references clientes(id),
  proyecto_nombre text not null,
  estado estado_cotizacion not null default 'Borrador',
  vigencia date,
  anticipo_pct int not null default 30,
  credito numeric(12,2) not null default 0,
  notas text,
  abierta_veces int not null default 0,
  abierta_ultima timestamptz,
  razon_perdida text,
  creado_en timestamptz not null default now()
);
create table cotizacion_lineas (
  id uuid primary key default gen_random_uuid(),
  cotizacion_id uuid not null references cotizaciones(id) on delete cascade,
  orden int not null,
  concepto text not null,
  etapa etapa_metodo not null,
  monto numeric(12,2) not null
);

-- ---------- Proyectos ----------
create table proyectos (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null,                          -- D2, D4…
  cliente_id uuid not null references clientes(id),
  cotizacion_id uuid references cotizaciones(id),
  nombre text not null,
  objetivo text,
  etapa etapa_metodo not null default 'Mapear',
  inicio date,
  fin date,
  avance int not null default 0,
  horas_estimadas numeric(8,1) not null default 0,
  presupuesto numeric(12,2) not null default 0,
  creado_en timestamptz not null default now()
);
create table hitos (
  id uuid primary key default gen_random_uuid(),
  proyecto_id uuid not null references proyectos(id) on delete cascade,
  orden int not null,
  nombre text not null,
  etapa etapa_metodo not null,
  fecha date,
  estado estado_hito not null default 'Planeado',
  monto numeric(12,2),
  aceptado_en timestamptz
);
create table horas (
  id uuid primary key default gen_random_uuid(),
  proyecto_id uuid not null references proyectos(id) on delete cascade,
  hito_id uuid references hitos(id) on delete set null,
  fecha date not null default current_date,
  horas numeric(5,1) not null,
  que_se_hizo text,
  registrado_por uuid
);
create table riesgos (
  id uuid primary key default gen_random_uuid(),
  proyecto_id uuid not null references proyectos(id) on delete cascade,
  descripcion text not null,
  probabilidad int not null default 2,                  -- 1 baja · 2 media · 3 alta
  impacto int not null default 2,
  plan text,
  abierto boolean not null default true
);

-- ---------- Tareas ----------
create table tareas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  cliente_id uuid references clientes(id) on delete set null,
  proyecto_id uuid references proyectos(id) on delete set null,
  cotizacion_id uuid references cotizaciones(id) on delete set null,
  origen text,                                          -- Lead, Llamada, Hito, Factura, Acompañamiento, Cotización, Investigación
  canal text,                                           -- WhatsApp, Correo, Llamada, Interno
  fecha date not null default current_date,
  hora time,
  estado estado_tarea not null default 'Pendiente',
  borrador_ia text,                                     -- mensaje propuesto por un agente
  agente text,
  creado_en timestamptz not null default now()
);

-- ---------- Facturación y movimientos ----------
create table facturas (
  id uuid primary key default gen_random_uuid(),
  folio text unique not null,
  cliente_id uuid not null references clientes(id),
  proyecto_id uuid references proyectos(id) on delete set null,
  hito_id uuid references hitos(id) on delete set null,
  cotizacion_id uuid references cotizaciones(id) on delete set null,
  monto numeric(12,2) not null,
  estado estado_factura not null default 'Borrador',
  emitida date,
  vence date,
  facturapi_id text,                                    -- id del CFDI en Facturapi
  uuid_sat text,
  creado_en timestamptz not null default now()
);
create table movimientos (
  id uuid primary key default gen_random_uuid(),
  tipo tipo_movimiento not null,
  fecha date not null default current_date,
  cliente_id uuid references clientes(id) on delete set null,
  factura_id uuid references facturas(id) on delete set null,
  concepto text not null,
  metodo text,                                          -- Transferencia, Efectivo, Tarjeta, Stripe
  referencia text,
  monto numeric(12,2) not null,
  creado_en timestamptz not null default now()
);

-- ---------- Marketing y contenido ----------
create table piezas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  gancho text,
  formato text not null,                                -- Video 9:16, Carrusel, Post, Foto
  canal text not null,                                  -- IG, LI, TT, YT
  estado estado_pieza not null default 'Idea',
  senal text,                                           -- de qué señal nació
  brief jsonb,
  guion jsonb,
  tomas jsonb,                                          -- prompts y resultados de Higgsfield / ElevenLabs
  textos jsonb,                                         -- por red
  publicar_en timestamptz,
  metricas jsonb,
  creado_en timestamptz not null default now()
);

-- ---------- Agentes (Hermes) ----------
create table propuestas_ia (
  id uuid primary key default gen_random_uuid(),
  agente text not null,                                 -- Cobrador, Seguimiento, Estratega…
  modelo text,
  tipo text not null,                                   -- Mensaje, Calendario, Guion, Reporte, Cotización…
  titulo text not null,
  cuerpo text not null,
  datos jsonb,                                          -- payload para ejecutar al aprobar
  estado estado_propuesta not null default 'Pendiente',
  resuelta_en timestamptz,
  creado_en timestamptz not null default now()
);
create table corridas_agente (
  id uuid primary key default gen_random_uuid(),
  agente text not null,
  disparo text,
  inicio timestamptz not null default now(),
  fin timestamptz,
  tokens_entrada int,
  tokens_salida int,
  costo_mxn numeric(10,2),
  resultado text
);

-- ---------- Vistas de balance ----------
create view balance_mensual as
select date_trunc('month', fecha)::date as mes,
  sum(case when tipo = 'Cobro' then monto else 0 end) as cobrado,
  sum(case when tipo = 'Gasto' then monto else 0 end) as gastos,
  sum(case when tipo = 'Cobro' then monto else -monto end) as utilidad
from movimientos group by 1 order by 1;

create view saldos_cliente as
select c.id as cliente_id, c.nombre,
  coalesce(sum(f.monto) filter (where f.estado in ('Vigente','Vencida','Pagada')), 0) as facturado,
  coalesce((select sum(m.monto) from movimientos m where m.cliente_id = c.id and m.tipo = 'Cobro'), 0) as pagado
from clientes c left join facturas f on f.cliente_id = c.id
group by c.id, c.nombre;

-- ---------- Seguridad ----------
-- Un solo equipo (Ronin Studio). Los usuarios autenticados ven y editan todo;
-- el sitio público sólo puede insertar diagnósticos exprés con la llave anónima.
do $$ declare t text; begin
  for t in select unnest(array['clientes','contactos','diagnosticos_expres','cotizaciones','cotizacion_lineas','proyectos','hitos','horas','riesgos','tareas','facturas','movimientos','piezas','propuestas_ia','corridas_agente']) loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "equipo lee %1$s" on %1$I for select to authenticated using (true)', t);
    execute format('create policy "equipo escribe %1$s" on %1$I for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;
create policy "sitio publico inserta diagnosticos" on diagnosticos_expres for insert to anon with check (true);

-- Triggers de actualizado_en
create or replace function set_actualizado() returns trigger language plpgsql as $$ begin new.actualizado_en = now(); return new; end $$;
create trigger clientes_actualizado before update on clientes for each row execute function set_actualizado();
