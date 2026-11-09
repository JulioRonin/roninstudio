// Cómo abordar a un cliente según su perfil (sector). Lo usan la ficha del cliente,
// el mapa de flujos y la guía imprimible de primer acercamiento.
// Son guías de conversación y observación, no promesas: nada aquí es una cifra medida.

export type Opcion = { nombre: string; cuando: string; implica: string };
export type Abordaje = {
  perfil: string;        // quién suele ser este cliente
  pide: string;          // lo que dice que quiere
  entender: string;      // lo que hay que entender antes de proponer
  preguntas: string[];   // primer acercamiento (llamada o visita corta)
  observar: string[];    // en el piso, durante la visita
  pedir: string[];       // datos que conviene pedirle
  opciones?: Opcion[];   // escalera de solución, de menor a mayor compromiso
  quick: string[];       // quick wins típicos, sin software nuevo
  alertas: string[];     // señales de que no conviene o no es el momento
  cierre: string;        // cómo cerrar el primer acercamiento
};

export const ABORDAJE: Record<string, Abordaje> = {
  "Tienda de ropa y comercio local": {
    perfil: "Tienda física con la dueña o el dueño al frente, una o dos personas en piso y una parte de la venta que ya ocurre por WhatsApp e Instagram.",
    pide: "Un catálogo en línea, una tienda en línea o una app para su tienda.",
    entender: "Pide una herramienta. Antes hay que saber cómo vende hoy y si su inventario aguanta vender en línea: si no sabe qué tallas y colores tiene, cualquier catálogo va a ofrecer lo que no hay.",
    preguntas: [
      "De cada diez ventas, ¿cuántas llegan por mensaje (WhatsApp, Instagram, Facebook) y cuántas entran caminando?",
      "Cuando alguien pregunta por mensaje si hay una prenda en su talla, ¿quién contesta, cuánto tarda y cómo sabe si hay?",
      "¿Cómo llevan el inventario: sistema, Excel, libreta o de memoria? ¿Por modelo o por talla y color?",
      "¿Cada cuánto entra mercancía nueva y cuántos modelos manejan al mismo tiempo?",
      "¿Hacen apartados o pagos en abonos? ¿Dónde se anotan y quién les da seguimiento?",
      "¿Entregan a domicilio o envían fuera de la ciudad? ¿Quién lo hace y cómo se cobra?",
      "¿Quién tomaría las fotos y daría de alta cada prenda nueva? ¿Cuánto tiempo tiene esa persona a la semana?",
      "¿Qué quiere lograr en concreto: venderle más a quien ya la sigue, llegar a gente nueva o dejar de contestar lo mismo todo el día?",
      "¿Ya probó algo (catálogo de WhatsApp Business, tienda de Instagram, una página)? ¿Por qué lo dejó?",
      "¿Quién decide, con qué presupuesto y para qué fecha o temporada lo quiere listo?",
    ],
    observar: [
      "Un mensaje real de venta de principio a fin: cuenta los pasos, las idas a bodega y el tiempo sin respuesta.",
      "Dónde se anota una venta, un apartado y un abono, y si esos papeles coinciden con lo que hay en piso.",
      "Cómo se recibe, etiqueta y acomoda la mercancía nueva; si cada prenda tiene clave.",
      "El teléfono de la tienda: conversaciones abiertas, sin contestar y preguntas que se repiten.",
      "El cierre de caja: efectivo, terminal y transferencias, y cuánto tarda en cuadrar.",
    ],
    pedir: [
      "Ventas de las últimas cuatro semanas por canal, aunque sea aproximado.",
      "Lista de productos o fotos de las etiquetas: cuántos modelos y cuántas variantes por modelo.",
      "Capturas de diez conversaciones de venta por mensaje, sin datos personales.",
      "Estadísticas de Instagram: seguidores de la ciudad y mensajes por semana.",
    ],
    opciones: [
      { nombre: "Catálogo en línea con pedido por WhatsApp", cuando: "La venta por mensaje ya existe y el dolor es contestar precio, talla y disponibilidad uno por uno. El inventario se lleva al menos por modelo.", implica: "Fotos y precios al día, alguien que confirme existencia y cobre por transferencia o en tienda. Es el primer escalón: cuesta poco y comprueba si hay demanda." },
      { nombre: "Tienda en línea con pago y existencias", cuando: "El inventario ya se controla por talla y color, los pedidos en línea son constantes y quiere cobrar sin intervenir en cada venta.", implica: "Punto de venta e inventario en un solo lugar, pasarela de pago, política de cambios y un proceso de envío o entrega." },
      { nombre: "App propia", cuando: "Hay clientas recurrentes que compran seguido y un programa de lealtad o de apartados que la justifique.", implica: "Costo de publicar y mantener en las tiendas de apps. Para una sola tienda casi nunca es el primer paso: una web que se instala en el teléfono cubre lo mismo." },
    ],
    quick: [
      "Activar el catálogo y las respuestas rápidas de WhatsApp Business con los modelos que más se preguntan.",
      "Una sola hoja de existencias por talla y color que se actualice al cierre del día.",
      "Clave por prenda en la etiqueta, para que el mensaje, la venta y el inventario hablen de lo mismo.",
      "Formato único de apartado con fecha límite y recordatorio.",
    ],
    alertas: [
      "Nadie tiene tiempo para fotos y altas: el catálogo se queda viejo en pocas semanas.",
      "Quiere app porque se ve profesional, sin clientas recurrentes que la usen.",
      "No hay forma de saber qué hay en existencia: primero se ordena el inventario.",
      "Espera que la página traiga clientes sola, sin plan de contenido ni presupuesto de difusión.",
    ],
    cierre: "Cierra proponiendo el diagnóstico: una visita en horario de venta para mapear pedidos por mensaje, existencias, entrada de mercancía y apartados. De ahí sale el reporte con el escalón que conviene y la cotización por hitos.",
  },
  "Restaurante con sucursales": {
    perfil: "Dueño con dos o más sucursales, gerentes de piso y un punto de venta que no habla con cocina ni con compras.",
    pide: "Un sistema de comandas, un reporte diario o controlar inventario.",
    entender: "Dónde se reescribe la misma orden y qué número no puede ver hoy sin pedirlo por WhatsApp.",
    preguntas: ["¿Cómo llega una orden de la mesa a cocina y de ahí a la cuenta?", "¿Qué revisa cada noche y quién se lo manda?", "¿Cómo se pide a proveedores y quién decide cuánto?", "¿Qué pasa cuando sale un platillo equivocado?", "¿Qué han probado antes y por qué se dejó de usar?"],
    observar: ["Una orden completa en hora pico.", "El cierre de caja de un turno.", "El conteo de inventario y el pedido de la semana."],
    pedir: ["Cierres de las últimas dos semanas.", "Mesas y órdenes por día por sucursal.", "Lista de proveedores y frecuencia de compra."],
    quick: ["Formato único de cierre de caja para todas las sucursales.", "Comanda con número de mesa y hora, aunque sea en papel."],
    alertas: ["El dueño no quiere tocar el punto de venta actual ni permitir integraciones.", "Los gerentes no fueron parte de la conversación."],
    cierre: "Propón la visita en hora de operación a la sucursal con más problemas; el mapa se replica después a las demás.",
  },
  "Clínica": {
    perfil: "Consultorio o clínica con recepción que agenda por WhatsApp y expedientes en papel o en un sistema que nadie usa completo.",
    pide: "Agenda en línea, expediente digital o recordatorios automáticos.",
    entender: "Cuántas citas se pierden o se empalman y qué información del paciente se captura más de una vez.",
    preguntas: ["¿Cómo pide cita un paciente y quién la confirma?", "¿Cuántas citas no llegan en una semana normal?", "¿Dónde vive el expediente y quién lo consulta?", "¿Cómo se cobra y se factura?", "¿Qué exige su aviso de privacidad sobre datos de pacientes?"],
    observar: ["La recepción durante una hora con consulta.", "La búsqueda de un expediente.", "El corte del día."],
    pedir: ["Citas agendadas y atendidas de las últimas cuatro semanas.", "Un expediente en blanco y un formato de receta."],
    quick: ["Plantilla de confirmación y recordatorio por WhatsApp.", "Una sola agenda compartida en lugar de libreta y teléfono."],
    alertas: ["Los médicos no van a capturar en pantalla durante la consulta.", "No hay claridad sobre quién es responsable de los datos personales."],
    cierre: "Propón mapear agenda, expediente y cobro en una mañana de consulta.",
  },
  "Escuela privada": {
    perfil: "Dirección con control escolar y administración que viven en hojas de cálculo separadas.",
    pide: "Un sistema de control escolar o de cobranza de colegiaturas.",
    entender: "Dónde se captura dos veces al alumno y cuánto tarda en saberse quién debe.",
    preguntas: ["¿Cómo se inscribe un alumno y quién captura sus datos?", "¿Cómo saben hoy quién debe colegiatura?", "¿Cómo se comunican con los padres?", "¿Qué sistema probaron antes y por qué se abandonó?", "¿Quién lo va a usar todos los días?"],
    observar: ["Una inscripción o reinscripción.", "La conciliación de pagos del banco.", "La elaboración de boletas."],
    pedir: ["Número de alumnos por nivel.", "Formato de inscripción y hoja de cobranza."],
    quick: ["Una sola lista maestra de alumnos.", "Recordatorio de pago con referencia por alumno."],
    alertas: ["Se quiere arrancar a mitad de ciclo con cambio de todo.", "Control escolar no participa en la decisión."],
    cierre: "Propón la visita con dirección, control escolar y administración en la misma sesión.",
  },
  "Gimnasio": {
    perfil: "Dueño que también atiende recepción, con membresías en Excel y renovaciones que se persiguen por WhatsApp.",
    pide: "Control de acceso, cobro recurrente o una app para socios.",
    entender: "Cuántas membresías vencen sin que nadie avise y cómo se sabe quién puede entrar.",
    preguntas: ["¿Cómo se da de alta un socio y cómo se cobra?", "¿Cómo saben quién está vencido cuando llega?", "¿Quién hace los recordatorios de renovación?", "¿Hay clases con cupo? ¿Cómo se reservan?", "¿Qué han probado antes?"],
    observar: ["La recepción en hora pico.", "Una renovación de principio a fin.", "La reserva de una clase."],
    pedir: ["Socios activos y vencidos del último mes.", "Lista de planes y precios."],
    quick: ["Lista de vencimientos de la semana pegada en recepción.", "Mensaje de renovación con liga de pago."],
    alertas: ["Quiere app sin tener ordenadas las membresías.", "No hay quién opere el sistema en recepción."],
    cierre: "Propón mapear alta, acceso y renovación en una tarde de operación.",
  },
  "Taller": {
    perfil: "Encargado que recibe, cotiza y cobra, con órdenes en papel y avisos al cliente por WhatsApp.",
    pide: "Órdenes de trabajo digitales o cotizaciones más rápidas.",
    entender: "Cuánto tarda una cotización en llegar al cliente y dónde se pierde el avance de cada trabajo.",
    preguntas: ["¿Cómo se abre una orden y quién la llena?", "¿Cuánto tarda en salir una cotización?", "¿Cómo se entera el cliente del avance?", "¿Cómo se controlan refacciones por trabajo?", "¿Cómo se cobra y se factura?"],
    observar: ["La recepción de un trabajo.", "Una cotización desde el diagnóstico hasta el envío.", "La entrega y el cobro."],
    pedir: ["Órdenes de las últimas dos semanas.", "Un formato de orden y una cotización enviada."],
    quick: ["Orden con folio, fotos de entrada y firma.", "Plantilla de cotización con vigencia."],
    alertas: ["Los técnicos no usarán teléfono o pantalla en el área de trabajo.", "El encargado es el único que sabe los precios."],
    cierre: "Propón seguir tres trabajos reales de la recepción a la entrega.",
  },
  "Notaría": {
    perfil: "Notaría con recepción, abogados y administración; expedientes físicos y seguimiento por correo y teléfono.",
    pide: "Expediente digital, agenda de firmas o seguimiento de trámites.",
    entender: "Dónde se detiene un trámite por un documento faltante y cómo se entera el cliente.",
    preguntas: ["¿Cómo se abre un trámite y quién revisa requisitos?", "¿Cómo se sabe en qué va cada expediente?", "¿Cómo se agenda una firma?", "¿Cómo se calculan y cobran honorarios y derechos?", "¿Qué restricciones tienen sobre guardar documentos en la nube?"],
    observar: ["El alta de un trámite.", "La búsqueda del estado de un expediente.", "La programación de una firma."],
    pedir: ["Trámites abiertos por tipo.", "Lista de requisitos por trámite."],
    quick: ["Lista de requisitos por tipo de trámite para enviar al cliente.", "Tablero de trámites por etapa."],
    alertas: ["No hay permiso del notario para digitalizar expedientes.", "Cada abogado lleva su propio control y no quiere cambiarlo."],
    cierre: "Propón mapear un tipo de trámite de principio a fin, el más frecuente.",
  },
  "Manufactura": {
    perfil: "Planta o taller de producción con supervisor por turno, hojas de papel por estación y captura en Excel al final del día.",
    pide: "Indicadores del turno en tiempo real o control de producción.",
    entender: "Qué decisión se toma tarde por no tener el dato a tiempo y quién captura hoy.",
    preguntas: ["¿Cómo se programa el día y quién lo decide?", "¿Dónde se anota la producción y cada cuánto?", "¿Cómo se registran rechazos y paros?", "¿Qué indicador revisa la gerencia y cuándo lo recibe?", "¿Hay sistema de planta o ERP con el que haya que convivir?"],
    observar: ["Un arranque de turno.", "El registro en una estación durante una hora.", "La junta de producción."],
    pedir: ["Hojas de producción de una semana.", "Reporte de turno actual."],
    quick: ["Hoja de producción por hora visible en la estación.", "Código de causas de paro acordado."],
    alertas: ["No hay red en piso ni permiso para dispositivos.", "El dato se usa para castigar y los operadores no van a capturar."],
    cierre: "Propón el recorrido de una línea con el supervisor y el responsable de calidad.",
  },
  "Otro": {
    perfil: "Negocio en operación con procesos que dependen de una o dos personas y de mensajes sueltos.",
    pide: "Una herramienta concreta: un sistema, una página, una app o un agente de IA.",
    entender: "Qué trabajo quiere dejar de hacer a mano y qué pasa hoy cuando ese trabajo sale mal.",
    preguntas: ["¿Qué proceso le quita más tiempo a su gente cada semana?", "¿Dónde se escribe dos veces la misma información?", "¿Qué número le gustaría ver cada mañana y hoy no puede?", "¿Qué han probado antes y por qué se dejó de usar?", "¿Quién decide, quién lo usaría y para cuándo lo necesita?"],
    observar: ["El proceso que más duele, siguiendo a la persona que lo hace.", "Las herramientas reales: papel, Excel, mensajes.", "Qué pasa cuando hay un error."],
    pedir: ["Volumen aproximado: cuántas veces por semana ocurre cada proceso.", "Un ejemplo real de cada formato que usan."],
    quick: ["Un formato único donde hoy hay tres.", "Una regla escrita para lo que hoy se decide por mensaje."],
    alertas: ["Quiere la herramienta sin revisar el proceso.", "Quien lo usaría no está en la conversación."],
    cierre: "Propón el diagnóstico: visita, mapa de flujos y reporte con lo que conviene, lo que no y cuánto vale.",
  },
};

export const abordajeDe = (sector?: string | null): Abordaje => ABORDAJE[sector ?? ""] ?? ABORDAJE["Otro"];
