"use client";
import React from "react";
import { PaperDoc } from "@/components/paper";

const F = ({ children }: { children: string }) => <span className="field">{children}</span>;

export default function Terminos() {
  return (
    <PaperDoc title="Términos y condiciones" kicker="PLANTILLA · PLATAFORMAS Y SERVICIOS DE RONIN STUDIO · ÚLTIMA ACTUALIZACIÓN [FECHA]" file="terminos-y-condiciones-ronin-studio.html" back="/configuracion">
      <p>Estos términos regulan el uso de las plataformas y servicios de <strong>Ronin Studio</strong> (en adelante "Ronin"), incluidas las aplicaciones <F>[Andén, Kanri, Dojo, Vértice, Lana, Servirest, GENBA, Mono Atelier]</F> y los sistemas a la medida que Ronin opera para sus clientes. Al usar una plataforma de Ronin, el usuario acepta estos términos.</p>

      <h2>1 · Quién puede usar la plataforma</h2>
      <p>Las plataformas se contratan por negocios (el "Cliente"). El Cliente da acceso a sus colaboradores (los "Usuarios") y es responsable de que usen la plataforma conforme a estos términos. Cada Usuario mantiene sus credenciales en privado y responde por lo que se haga con ellas.</p>

      <h2>2 · El servicio</h2>
      <p>Ronin pone a disposición la plataforma contratada, su alojamiento, respaldos y las actualizaciones que decida liberar. El alcance específico de cada plataforma (módulos, usuarios, sucursales) es el definido en la cotización o contrato correspondiente.</p>

      <h2>3 · Cuentas, pagos y renovación</h2>
      <ul>
        <li>El servicio se paga por adelantado según el plan contratado: <F>[mensual / anual]</F>. Ronin emite CFDI por cada cobro.</li>
        <li>Si un pago no se cubre en <F>[10]</F> días naturales a partir de su vencimiento, Ronin puede suspender el acceso hasta regularizarlo; los datos se conservan durante la suspensión.</li>
        <li>El Cliente puede cancelar en cualquier momento con aviso escrito; el servicio continúa hasta el fin del periodo pagado y no hay reembolsos por periodos parciales.</li>
      </ul>

      <h2>4 · Datos del Cliente</h2>
      <p>Los datos que el Cliente y sus Usuarios cargan en la plataforma son del Cliente. Ronin los usa únicamente para operar el servicio, dar soporte y generar los reportes que el Cliente solicite. El Cliente puede pedir una exportación de sus datos en formato estándar en cualquier momento y, al terminar el servicio, Ronin los elimina en un plazo de <F>[30]</F> días salvo obligación legal de conservarlos.</p>

      <h2>5 · Datos personales</h2>
      <p>Ronin trata los datos personales conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares y a su aviso de privacidad, disponible en <F>[roninstudio.com.mx/privacidad]</F>. Cuando el Cliente carga datos de terceros (socios, pacientes, alumnos, clientes finales), el Cliente es responsable de contar con la base legal para hacerlo y Ronin actúa como encargado del tratamiento.</p>

      <h2>6 · Funciones con inteligencia artificial</h2>
      <p>Algunas plataformas incluyen agentes de IA que preparan mensajes, resúmenes, recordatorios o propuestas. Estas salidas son borradores: la decisión de enviarlas, publicarlas o actuar con base en ellas es del Usuario, salvo las automatizaciones que el Cliente active de forma expresa. Ronin no garantiza que las salidas de IA sean exactas y el Cliente debe revisarlas antes de usarlas con terceros. Cuando una pieza de comunicación se genere total o parcialmente con IA, Ronin lo indica.</p>

      <h2>7 · Disponibilidad y soporte</h2>
      <p>Ronin trabaja para mantener la plataforma disponible de forma continua, salvo mantenimientos programados avisados con anticipación y causas fuera de su control (proveedores de nube, conectividad, fuerza mayor). El soporte se atiende por <F>[WhatsApp y correo]</F> en horario de <F>[lunes a viernes, 9:00 a 18:00, hora de Ciudad Juárez]</F>, con respuesta inicial en <F>[un día hábil]</F>.</p>

      <h2>8 · Uso aceptable</h2>
      <p>No está permitido usar la plataforma para actividades ilícitas, intentar acceder a datos de otros clientes, revender el servicio sin autorización, ni someter la plataforma a cargas que afecten a otros usuarios. Ronin puede suspender cuentas que incumplan esta sección.</p>

      <h2>9 · Propiedad intelectual</h2>
      <p>La plataforma, su código, diseño, marcas y documentación son propiedad de Ronin y se licencian al Cliente de forma no exclusiva e intransferible mientras el servicio esté vigente. Los desarrollos a la medida se rigen por el contrato de servicios correspondiente.</p>

      <h2>10 · Servicios de terceros</h2>
      <p>La plataforma puede integrarse con servicios de terceros (mensajería, facturación electrónica, pagos, modelos de IA, alojamiento). Su uso está sujeto a los términos de cada proveedor y Ronin no responde por su disponibilidad ni por sus cambios de precio.</p>

      <h2>11 · Limitación de responsabilidad</h2>
      <p>La responsabilidad total de Ronin frente al Cliente por cualquier causa se limita al monto pagado por el servicio en los doce meses anteriores al hecho que la origine. Ronin no responde por daños indirectos, pérdida de ingresos o decisiones tomadas con base en la información de la plataforma.</p>

      <h2>12 · Cambios a estos términos</h2>
      <p>Ronin puede actualizar estos términos; avisará al Cliente con al menos quince días de anticipación por el correo registrado. Seguir usando la plataforma después de esa fecha implica aceptar la versión actualizada.</p>

      <h2>13 · Ley aplicable y contacto</h2>
      <p>Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Para cualquier controversia las partes se someten a los tribunales de Ciudad Juárez, Chihuahua. Dudas y solicitudes: project@roninstudio.com.mx.</p>

      <div className="note">Plantilla de referencia preparada por Ronin Studio. Antes de publicarla conviene que la revise un abogado y que se complete el aviso de privacidad al que hace referencia.</div>
    </PaperDoc>
  );
}
