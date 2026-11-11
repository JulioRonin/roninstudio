-- Musashi · mensualidad dentro de la cotización.
-- Se corre una vez en el SQL Editor de Supabase, después de 0002_mensualidades.sql.
-- Guarda el costo mensual que se cotiza junto con el desarrollo: monto sin IVA, concepto,
-- desde cuándo se cobra, qué incluye y qué costos de terceros paga el cliente.
-- Al aceptar la cotización, Musashi crea la mensualidad en pausa para activarla al salir en vivo.
alter table cotizaciones add column if not exists mensualidad jsonb;
