"use client";
import React from "react";
import { PaperDoc } from "@/components/paper";

const F = ({ children }: { children: string }) => <span className="field">{children}</span>;

export default function Contrato() {
  return (
    <PaperDoc title="Contrato de prestación de servicios" kicker="PLANTILLA · CONSULTORÍA, AGENTES DE IA Y SOFTWARE A LA MEDIDA · VERSIÓN 1.0" file="contrato-ronin-studio.html" back="/configuracion">
      <p>Contrato de prestación de servicios que celebran, por una parte, <strong>Ronin Studio</strong>, representada por <F>[NOMBRE Y RFC DEL PRESTADOR]</F>, con domicilio en <F>[DOMICILIO FISCAL]</F>, Ciudad Juárez, Chihuahua (en adelante, "Ronin"), y por la otra, <F>[RAZÓN SOCIAL DEL CLIENTE]</F>, representada por <F>[NOMBRE DEL REPRESENTANTE]</F>, con RFC <F>[RFC]</F> y domicilio en <F>[DOMICILIO]</F> (en adelante, "el Cliente"), conforme a las siguientes declaraciones y cláusulas.</p>

      <h2>Declaraciones</h2>
      <ol>
        <li>Ronin declara que se dedica a la consultoría de procesos, al desarrollo de software a la medida y a la implementación de agentes de inteligencia artificial, y que cuenta con la capacidad técnica para prestar los servicios objeto de este contrato.</li>
        <li>El Cliente declara que es un negocio legalmente constituido, que su representante cuenta con facultades para obligarlo y que requiere los servicios descritos en la cotización <F>[FOLIO DE COTIZACIÓN]</F>, que forma parte de este contrato como Anexo A.</li>
      </ol>

      <h2>Cláusulas</h2>
      <h3>Primera · Objeto</h3>
      <p>Ronin prestará al Cliente los servicios de consultoría, diseño y construcción descritos en el Anexo A para el proyecto <F>[NOMBRE DEL PROYECTO]</F>, con el objetivo de <F>[OBJETIVO EN UNA FRASE]</F>.</p>

      <h3>Segunda · Método y etapas</h3>
      <p>Los servicios se ejecutan en cuatro etapas: <strong>Mapear</strong> (visita, diagnóstico y mapa del flujo real), <strong>Diseñar</strong> (plan de trabajo, prototipo y entregables), <strong>Construir</strong> (desarrollo, pruebas con casos reales y arranque) y <strong>Evolucionar</strong> (acompañamiento, reportes y mejoras). Cada etapa cierra con un hito que el Cliente acepta por escrito, incluido el correo electrónico o WhatsApp registrados en este contrato.</p>

      <h3>Tercera · Entregables e hitos</h3>
      <table>
        <thead><tr><th>#</th><th>Hito</th><th>Entregable</th><th>Fecha</th><th className="num">Monto (MXN)</th></tr></thead>
        <tbody>
          <tr><td>H1</td><td><F>[Mapa de flujo y propuesta]</F></td><td><F>[Documento y sesión de revisión]</F></td><td><F>[dd/mm]</F></td><td className="num"><F>[0.00]</F></td></tr>
          <tr><td>H2</td><td><F>[Prototipo]</F></td><td><F>[Prototipo navegable]</F></td><td><F>[dd/mm]</F></td><td className="num"><F>[0.00]</F></td></tr>
          <tr><td>H3</td><td><F>[Construcción]</F></td><td><F>[Sistema en operación]</F></td><td><F>[dd/mm]</F></td><td className="num"><F>[0.00]</F></td></tr>
          <tr><td>H4</td><td><F>[Arranque y acompañamiento]</F></td><td><F>[Capacitación y reporte]</F></td><td><F>[dd/mm]</F></td><td className="num"><F>[0.00]</F></td></tr>
        </tbody>
      </table>
      <p>Un hito se considera aceptado cuando el Cliente lo confirma por escrito o cuando transcurren cinco días hábiles desde su entrega sin observaciones. Las observaciones se atienden en una ronda de ajustes incluida; rondas adicionales se cotizan aparte.</p>

      <h3>Cuarta · Precio y forma de pago</h3>
      <p>El precio total es de <F>[MONTO TOTAL]</F> pesos mexicanos más IVA, pagadero por hito conforme a la tabla anterior: <F>[__]</F> % al firmar este contrato como anticipo y el resto contra aceptación de cada hito. Ronin emite CFDI por cada pago; los pagos se realizan por transferencia a la cuenta indicada en la factura dentro de los <F>[5]</F> días naturales siguientes a su emisión. Los pagos atrasados causan un interés moratorio de <F>[1.5]</F> % mensual y Ronin puede pausar el trabajo hasta regularizarlos.</p>

      <h3>Quinta · Cambios de alcance</h3>
      <p>Cualquier trabajo no incluido en el Anexo A se documenta como solicitud de cambio con su efecto en tiempo y costo, y se ejecuta sólo con la aprobación escrita del Cliente. Las solicitudes de cambio aprobadas forman parte de este contrato.</p>

      <h3>Sexta · Obligaciones del Cliente</h3>
      <ul>
        <li>Designar una persona responsable con facultad para decidir y aceptar hitos.</li>
        <li>Dar acceso oportuno a las instalaciones, al personal y a los sistemas y datos necesarios.</li>
        <li>Responder observaciones y aprobaciones en los plazos acordados. Los retrasos atribuibles al Cliente recorren el calendario en la misma proporción.</li>
      </ul>

      <h3>Séptima · Propiedad intelectual</h3>
      <p>El software desarrollado específicamente para el Cliente, con su configuración y datos, es propiedad del Cliente una vez cubierto el precio total. Las herramientas, componentes, plantillas, agentes y conocimientos previos de Ronin (incluidos sus productos Andén, Kanri, Dojo, Vértice, Lana, Servirest, GENBA y Mono Atelier) siguen siendo propiedad de Ronin y se licencian al Cliente de forma no exclusiva, intransferible y sin límite de tiempo para el uso del sistema entregado. Ronin puede mencionar al Cliente como referencia sólo con su autorización escrita.</p>

      <h3>Octava · Confidencialidad y datos personales</h3>
      <p>Ambas partes mantienen confidencial la información no pública que conozcan por este contrato, durante su vigencia y tres años después. Ronin trata los datos personales a los que acceda únicamente para prestar los servicios, conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, y los devuelve o elimina al concluir el contrato cuando el Cliente lo solicite.</p>

      <h3>Novena · Uso de inteligencia artificial</h3>
      <p>Los servicios pueden incluir agentes de inteligencia artificial que redactan, clasifican o proponen acciones. Toda acción hacia terceros (mensajes, cotizaciones, publicaciones) queda sujeta a aprobación humana salvo que el Cliente autorice por escrito excepciones específicas. El Cliente es responsable del uso que dé a los resultados y Ronin no garantiza que los modelos de IA estén libres de errores; por eso el método exige revisión humana y pruebas con casos reales.</p>

      <h3>Décima · Garantía y soporte</h3>
      <p>Ronin corrige sin costo los defectos del software entregado que se reporten dentro de los <F>[30]</F> días naturales siguientes a la aceptación del hito correspondiente. El soporte y la evolución posteriores se contratan como acompañamiento mensual conforme al Anexo B, cuando exista.</p>

      <h3>Décima primera · Limitación de responsabilidad</h3>
      <p>La responsabilidad total de Ronin por cualquier causa derivada de este contrato se limita al monto efectivamente pagado por el Cliente por los servicios del hito en cuestión. Ninguna de las partes responde por daños indirectos o lucro cesante.</p>

      <h3>Décima segunda · Vigencia y terminación</h3>
      <p>Este contrato inicia en la fecha de firma y concluye con la aceptación del último hito. Cualquiera de las partes puede terminarlo con aviso escrito de quince días; el Cliente paga el trabajo realizado hasta la fecha de terminación y recibe los entregables correspondientes a los hitos pagados.</p>

      <h3>Décima tercera · Servicios de terceros</h3>
      <p>El sistema puede depender de servicios de terceros (alojamiento, base de datos, mensajería, facturación electrónica, modelos de IA). Sus costos se pagan por el Cliente directamente o se refacturan según el Anexo A, y su disponibilidad está sujeta a los términos de cada proveedor.</p>

      <h3>Décima cuarta · Jurisdicción</h3>
      <p>Para la interpretación y cumplimiento de este contrato las partes se someten a las leyes y a los tribunales competentes de Ciudad Juárez, Chihuahua, renunciando a cualquier otro fuero que pudiera corresponderles.</p>

      <div className="note">Plantilla de referencia preparada por Ronin Studio. Antes de firmar con un cliente conviene que la revise un abogado en Chihuahua, en especial las cláusulas de pago, propiedad intelectual y responsabilidad.</div>

      <p style={{ marginTop: 18 }}>Firmado por duplicado en Ciudad Juárez, Chihuahua, el <F>[FECHA]</F>.</p>
      <div className="sign"><div>Julio César Ibarra<br /><span className="mono">FUNDADOR · RONIN STUDIO</span></div><div><F>[NOMBRE DEL REPRESENTANTE]</F><br /><span className="mono">POR EL CLIENTE</span></div></div>
    </PaperDoc>
  );
}
