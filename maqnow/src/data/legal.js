// Textos legales de MAQNOW.
//
// ANTES DE PUBLICAR:
//   1. Rellena COMPANY con los datos reales de la empresa (todo lo que está entre corchetes).
//   2. Haz que un abogado revise los cuatro textos: son un punto de partida, no un dictamen.
//   3. Cuando esté revisado, pon LEGAL_DRAFT en false para quitar el aviso de borrador.
//
// Normas que se han tenido en cuenta:
//   · Ley 34/2002 de servicios de la sociedad de la información (LSSI-CE): arts. 10 y 22.2
//   · Reglamento (UE) 2016/679 (RGPD) y Ley Orgánica 3/2018 (LOPDGDD)
//   · Real Decreto Legislativo 1/1996, Ley de Propiedad Intelectual (programas de ordenador, arts. 95 a 104)
//   · Ley 7/1998 de condiciones generales de la contratación
//   · Reglamento (UE) 2022/2065 de servicios digitales (punto de contacto y aviso de contenidos ilícitos)
//   · Guía de la AEPD sobre el uso de cookies
import { CONTACT } from './providers';

export const LEGAL_DRAFT = true;
export const LEGAL_UPDATED = '7 de octubre de 2026';

export const COMPANY = {
  brand: 'MAQNOW',
  name: '[RAZÓN SOCIAL]',
  nif: '[NIF]',
  address: '[DOMICILIO SOCIAL, CÓDIGO POSTAL, MUNICIPIO Y PROVINCIA]',
  registry: '[REGISTRO MERCANTIL DE …, TOMO …, FOLIO …, HOJA …]',
  email: CONTACT.email,
  phone: CONTACT.phone,
  privacyEmail: '[EMAIL PARA PROTECCIÓN DE DATOS]',
  courts: '[CIUDAD DE LOS JUZGADOS]',
  web: 'https://luis-gr05.github.io/maqnow-v3-fixed/',
  // Proveedores técnicos que tratan datos por cuenta de MAQNOW (encargados del tratamiento)
  dbHost: 'Supabase, Inc. (base de datos y acceso de usuarios) [REGIÓN DEL SERVIDOR]',
  webHost: 'GitHub, Inc. (alojamiento de la web)',
};
const C = COMPANY;

// Almacenamiento que usa la web. Lo leen la política de cookies y el panel de configuración.
export const STORAGE = [
  { name: 'maqnow-demo-v4', kind: 'Técnica', where: 'Almacenamiento local', who: C.brand, time: 'Hasta que cierres sesión o borres los datos del navegador', why: 'Mantiene tu sesión y los datos con los que trabajas en la aplicación.' },
  { name: 'maqnow-consent', kind: 'Técnica', where: 'Almacenamiento local', who: C.brand, time: '24 meses', why: 'Recuerda qué has decidido sobre las cookies para no volver a preguntártelo.' },
  { name: 'maqnow-nav', kind: 'Técnica', where: 'Almacenamiento local', who: C.brand, time: 'Hasta que borres los datos del navegador', why: 'Recuerda si prefieres el menú lateral reducido.' },
  { name: 'sb-…-auth-token', kind: 'Técnica', where: 'Almacenamiento local', who: 'Supabase (por cuenta de MAQNOW)', time: 'Mientras dure la sesión', why: 'Te mantiene identificado si entras con una cuenta registrada.' },
];

// Cada documento: secciones con título y bloques. Un bloque es un párrafo (texto) o una lista (array).
export const LEGAL_DOCS = [
  {
    id: 'aviso-legal',
    title: 'Aviso legal',
    intro: 'Quién está detrás de esta web y en qué condiciones puedes usarla.',
    sections: [
      ['1. Titular de la web', [
        'En cumplimiento del artículo 10 de la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico, se informa de los datos del titular de esta web:',
        [`Denominación social: ${C.name}`, `NIF: ${C.nif}`, `Domicilio social: ${C.address}`, `Datos registrales: ${C.registry}`, `Correo electrónico: ${C.email}`, `Teléfono: ${C.phone}`],
        `${C.brand} es el nombre comercial con el que ${C.name} presta el servicio.`,
      ]],
      ['2. Objeto', [
        `${C.brand} es una plataforma en línea que pone en contacto a empresas y profesionales que necesitan alquilar maquinaria con empresas alquiladoras. El usuario envía una solicitud, la plataforma la traslada a proveedores de su zona y le presenta un comparativo de las ofertas recibidas.`,
        'El acceso a la web es libre. El uso del área privada requiere registro y la aceptación de las condiciones de uso.',
      ]],
      ['3. Propiedad intelectual e industrial', [
        `El programa de ordenador que hace funcionar la plataforma, su código fuente y objeto, su estructura, las bases de datos, el diseño, los textos, los gráficos y la marca ${C.brand} pertenecen a ${C.name} o a quienes le han concedido licencia, y están protegidos por el Real Decreto Legislativo 1/1996, por el que se aprueba la Ley de Propiedad Intelectual, y por la normativa de marcas.`,
        'El usuario recibe una licencia de uso no exclusiva, intransferible y revocable, limitada a utilizar la plataforma para su finalidad. No está permitido, salvo en los casos que la ley autoriza expresamente:',
        ['Reproducir, distribuir, transformar o comunicar públicamente la plataforma o sus contenidos.', 'Descompilar, desensamblar o aplicar ingeniería inversa al programa.', 'Extraer o reutilizar de forma sistemática los datos de la plataforma por medios automáticos.', 'Retirar o alterar los avisos de autoría y de marca.'],
        'Las fotografías de la web proceden de Unsplash y se usan conforme a su licencia. Las marcas de fabricantes de maquinaria que se mencionan pertenecen a sus titulares y se citan solo para describir los equipos.',
      ]],
      ['4. Responsabilidad', [
        `${C.name} trabaja para que la web esté disponible y su información sea correcta, pero no puede garantizar que funcione sin interrupciones ni que esté libre de errores. No responde de los daños derivados de un uso contrario a este aviso, de fallos de las redes de comunicación ni de la actuación de terceros.`,
        `${C.brand} actúa como intermediario. La disponibilidad, el estado y el precio de cada máquina son responsabilidad del proveedor que la ofrece.`,
      ]],
      ['5. Enlaces', [
        'La web puede enlazar a sitios de terceros. Esos sitios tienen sus propias condiciones y políticas, sobre las que no tenemos control.',
      ]],
      ['6. Contenidos ilícitos', [
        `Si encuentras en la plataforma un contenido que consideras ilícito o que vulnera tus derechos, escríbenos a ${C.email} indicando dónde está y por qué. Ese correo es también nuestro punto de contacto para usuarios y autoridades a efectos del Reglamento (UE) 2022/2065, de servicios digitales. Puedes escribirnos en español.`,
      ]],
      ['7. Ley aplicable y jurisdicción', [
        `Este aviso se rige por la ley española. Para cualquier controversia, las partes se someten a los juzgados y tribunales de ${C.courts}, salvo que una norma imperativa establezca otro fuero.`,
      ]],
    ],
  },
  {
    id: 'privacidad',
    title: 'Política de privacidad',
    intro: 'Qué datos personales tratamos, para qué, con quién los compartimos y qué puedes hacer al respecto.',
    sections: [
      ['1. Responsable del tratamiento', [
        [`Responsable: ${C.name}, NIF ${C.nif}`, `Dirección: ${C.address}`, `Contacto para protección de datos: ${C.privacyEmail}`],
      ]],
      ['2. Qué datos tratamos', [
        ['Datos de registro: nombre y apellidos, empresa, NIF de la empresa, teléfono, correo electrónico y contraseña (guardada cifrada).', 'Datos de las solicitudes y alquileres: maquinaria pedida, obra, municipio, fechas, ofertas, incidencias y valoraciones.', 'Datos de contacto en obra que nos facilites, como la persona que recibe la máquina.', 'Datos técnicos: dirección IP, tipo de navegador y registros de acceso que generan los servidores.', 'Conversaciones con el asistente y mensajes que nos envíes por correo, teléfono o WhatsApp.'],
        'La plataforma está dirigida a empresas y profesionales. No tratamos categorías especiales de datos ni datos de menores.',
      ]],
      ['3. Para qué los tratamos y con qué base legal', [
        ['Crear y gestionar tu cuenta y prestar el servicio: tramitar solicitudes, enviarlas a los proveedores, mostrarte las ofertas y hacer el seguimiento del alquiler. Base: ejecución del contrato (art. 6.1.b RGPD).', 'Homologar y valorar a los proveedores. Base: ejecución del contrato e interés legítimo en ofrecer un servicio fiable (art. 6.1.f).', 'Atender consultas e incidencias. Base: ejecución del contrato o medidas precontractuales.', 'Cumplir obligaciones contables, fiscales y de conservación. Base: obligación legal (art. 6.1.c).', 'Garantizar la seguridad de la plataforma y prevenir el fraude. Base: interés legítimo.', 'Enviarte comunicaciones comerciales sobre servicios propios parecidos a los que ya usas, mientras no te opongas (art. 21.2 LSSI), o cualquier otra comunicación comercial si nos has dado tu consentimiento (art. 6.1.a).'],
        'No tomamos decisiones con efectos jurídicos basadas únicamente en tratamientos automatizados. La ordenación de las ofertas es una ayuda: quien elige es siempre el usuario.',
      ]],
      ['4. Con quién los compartimos', [
        ['Proveedores de maquinaria: reciben los datos de tu solicitud necesarios para ofertar y, si aceptas una oferta, los datos necesarios para entregar la máquina y facturar.', 'Clientes: reciben los datos del proveedor cuya oferta comparan o aceptan.', `Empresas que nos prestan servicios técnicos y tratan los datos por nuestra cuenta, con contrato de encargo: ${C.dbHost} y ${C.webHost}.`, 'Administraciones, juzgados y fuerzas de seguridad, cuando una norma lo exige.'],
        'No vendemos tus datos.',
      ]],
      ['5. Transferencias internacionales', [
        'Algunos de nuestros proveedores técnicos tienen su sede en Estados Unidos. Cuando los datos salen del Espacio Económico Europeo, la transferencia se ampara en el Marco de Privacidad de Datos UE-EE. UU. o en las cláusulas contractuales tipo aprobadas por la Comisión Europea.',
      ]],
      ['6. Cuánto tiempo los conservamos', [
        ['Datos de la cuenta: mientras esté activa. Tras la baja, bloqueados durante los plazos de prescripción de las responsabilidades legales.', 'Solicitudes, alquileres y facturas: seis años, por obligación mercantil y fiscal.', 'Consultas sin cuenta: un año desde la última comunicación.', 'Registros técnicos: un máximo de doce meses.'],
      ]],
      ['7. Tus derechos', [
        `Puedes pedirnos acceder a tus datos, rectificarlos, suprimirlos, limitar u oponerte a su tratamiento y recibirlos en un formato portable. También puedes retirar en cualquier momento el consentimiento que hayas dado. Escribe a ${C.privacyEmail} indicando qué derecho ejerces; si tenemos dudas sobre tu identidad te pediremos que la acredites. Respondemos en el plazo de un mes.`,
        'Si crees que no hemos atendido bien tu petición, puedes reclamar ante la Agencia Española de Protección de Datos (www.aepd.es).',
      ]],
      ['8. Datos de otras personas', [
        'Si nos facilitas datos de terceros, por ejemplo el encargado de obra que recibirá la máquina, te comprometes a haberle informado antes de esta política.',
      ]],
      ['9. Seguridad', [
        'Aplicamos medidas técnicas y organizativas acordes al riesgo: conexiones cifradas, contraseñas guardadas con resumen criptográfico, acceso a los datos según el rol de cada usuario y copias de seguridad.',
      ]],
      ['10. Cambios en esta política', [
        'Si cambiamos esta política de forma relevante te avisaremos en la plataforma o por correo antes de que el cambio se aplique.',
      ]],
    ],
  },
  {
    id: 'cookies',
    title: 'Política de cookies',
    intro: 'Qué guarda esta web en tu dispositivo, para qué y cómo cambiar tu elección.',
    sections: [
      ['1. Qué son las cookies', [
        'Las cookies y tecnologías parecidas, como el almacenamiento local del navegador, son pequeños ficheros que una web guarda en tu dispositivo para recordar información entre una visita y otra. El artículo 22.2 de la Ley 34/2002 exige tu consentimiento para usarlas, salvo las que son estrictamente necesarias para prestar un servicio que has pedido.',
      ]],
      ['2. Qué usamos en esta web', [
        'Ahora mismo solo usamos almacenamiento técnico, necesario para que la web funcione. No necesita consentimiento y no se puede desactivar desde el panel:',
        { table: 'storage' },
        'No usamos cookies de analítica, de publicidad ni de redes sociales. Las fotografías se cargan desde los servidores de Unsplash sin enviar cookies.',
      ]],
      ['3. Cookies de analítica', [
        'El panel de configuración incluye la categoría de analítica, desactivada de entrada. Hoy no hay ninguna herramienta asociada. Si en el futuro incorporamos alguna para medir el uso de la web, solo se activará para quien haya aceptado esa categoría, y actualizaremos esta página con su nombre, titular y duración.',
      ]],
      ['4. Cómo cambiar tu elección', [
        'Puedes aceptar, rechazar o configurar las categorías en el aviso que aparece en tu primera visita, y cambiar de opinión cuando quieras:',
        { action: 'cookies' },
        'Tu elección se guarda durante 24 meses; después te volveremos a preguntar. También puedes borrar o bloquear el almacenamiento desde los ajustes de privacidad de tu navegador, aunque si bloqueas el almacenamiento técnico la aplicación no podrá mantener tu sesión.',
      ]],
      ['5. Más información', [
        `Para cualquier duda sobre esta política escribe a ${C.privacyEmail}. El tratamiento de tus datos personales se explica en la política de privacidad.`,
      ]],
    ],
  },
  {
    id: 'condiciones',
    title: 'Condiciones de uso',
    intro: 'Las reglas del servicio: qué hace MAQNOW, qué se espera de quien lo usa y de quien alquila sus máquinas.',
    sections: [
      ['1. Quién presta el servicio y a quién se dirige', [
        `El servicio lo presta ${C.name} (en adelante, ${C.brand}), cuyos datos figuran en el aviso legal. Está dirigido a empresas y profesionales que actúan en el ámbito de su actividad. Al registrarte declaras que actúas con ese carácter y que tienes capacidad para obligar a la empresa en cuyo nombre te registras.`,
        'Estas condiciones son condiciones generales de la contratación conforme a la Ley 7/1998. Se aceptan al crear la cuenta y puedes consultarlas y guardarlas en cualquier momento desde esta página.',
      ]],
      ['2. En qué consiste el servicio', [
        ['El cliente describe la maquinaria que necesita, la obra y las fechas.', `${C.brand} traslada la solicitud a un máximo de diez proveedores homologados que trabajan esa maquinaria en la zona.`, 'Los proveedores responden con su disponibilidad, precio y condiciones.', `${C.brand} presenta un comparativo con las mejores ofertas, hasta cinco, y el cliente elige.`, 'Tras la aceptación, la plataforma acompaña el alquiler: entrega, incidencias, documentación, baja, recogida y facturas.'],
        `Para quien solicita maquinaria el servicio es gratuito. Las condiciones de colaboración con cada proveedor se acuerdan con él por separado.`,
      ]],
      ['3. Cómo se ordenan las ofertas', [
        'El comparativo ordena las ofertas con una puntuación que combina cinco criterios: precio del alquiler, disponibilidad en la fecha pedida, coste del transporte, valoración del proveedor y servicio técnico. La puntuación es orientativa y no es una recomendación de contratación: el cliente ve los datos de cada oferta y decide.',
      ]],
      ['4. El contrato de alquiler', [
        `El alquiler se contrata entre el cliente y el proveedor cuya oferta acepta. ${C.brand} es un intermediario y no es parte de ese contrato: no es propietario de las máquinas ni las entrega. El proveedor responde del estado de la máquina, de su documentación, de la entrega, del servicio técnico y de la factura; el cliente, del uso correcto, del pago y de la devolución.`,
      ]],
      ['5. Cuenta de usuario', [
        ['Los datos del registro deben ser veraces y mantenerse al día.', 'Las credenciales son personales. Quien las custodia responde del uso que se haga de la cuenta y debe avisarnos si sospecha de un acceso no autorizado.', 'El acceso como invitado sirve para probar la plataforma con datos de ejemplo y no genera solicitudes reales.'],
      ]],
      ['6. Obligaciones del cliente', [
        ['Enviar solicitudes que respondan a una necesidad real.', 'Describir la obra y los accesos con exactitud.', 'Usar la maquinaria conforme a las instrucciones del proveedor y a la normativa de prevención.', 'Comunicar las averías y la baja por la plataforma, para que queden registradas.'],
      ]],
      ['7. Obligaciones del proveedor', [
        ['Superar la homologación y mantener al día su documentación y la de sus máquinas.', 'Ofertar solo equipos de los que dispone, a un precio completo y sin costes ocultos.', 'Mantener la oferta durante el plazo indicado y cumplirla si es aceptada.', 'Entregar la máquina revisada y con la documentación exigible.', 'Atender las incidencias en los plazos comprometidos.'],
        `${C.brand} puede suspender la homologación de un proveedor que incumpla estas obligaciones de forma grave o reiterada, explicándole los motivos.`,
      ]],
      ['8. Valoraciones', [
        'Las valoraciones deben reflejar una experiencia real con un alquiler gestionado en la plataforma. Podemos retirar las que sean falsas, ofensivas o ajenas al servicio.',
      ]],
      ['9. Asistente', [
        'El asistente es un sistema automático que ayuda a preparar la solicitud. No es una persona y sus propuestas son orientativas: revisa siempre la solicitud antes de enviarla. Si prefieres hablar con alguien del equipo, tienes el teléfono y el correo en el pie de la web.',
      ]],
      ['10. Licencia de uso del programa', [
        `${C.brand} concede al usuario una licencia no exclusiva e intransferible para usar la plataforma mientras su cuenta esté activa. El programa, las bases de datos y la marca siguen siendo de ${C.name}, en los términos del aviso legal. Los datos que el usuario introduce siguen siendo suyos y puede exportarlos desde su área.`,
      ]],
      ['11. Disponibilidad y responsabilidad', [
        `Procuramos que la plataforma esté disponible de forma continuada, con las paradas de mantenimiento imprescindibles. ${C.brand} no responde de los incumplimientos de clientes o proveedores en sus contratos de alquiler, ni de los daños causados por la maquinaria. En lo que la ley permite, su responsabilidad se limita a los daños directos causados por dolo o negligencia grave.`,
      ]],
      ['12. Baja y suspensión', [
        'Puedes darte de baja cuando quieras escribiéndonos. Los alquileres en curso se mantienen hasta su finalización. Podemos suspender o cancelar una cuenta que incumpla estas condiciones, avisando antes siempre que sea posible.',
      ]],
      ['13. Cambios en las condiciones', [
        'Si modificamos estas condiciones te avisaremos con al menos quince días de antelación. Si no estás de acuerdo puedes darte de baja antes de que entren en vigor.',
      ]],
      ['14. Ley aplicable y jurisdicción', [
        `Estas condiciones se rigen por la ley española. Las partes se someten a los juzgados y tribunales de ${C.courts}.`,
      ]],
    ],
  },
];

export const legalDoc = (id) => LEGAL_DOCS.find((d) => d.id === id);
