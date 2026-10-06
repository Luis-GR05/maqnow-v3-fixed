// Conexión opcional con Supabase. Si existen VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
// (archivo .env), el registro y el inicio de sesión usan Supabase Auth y el rol sale de la
// tabla `profiles`. Si no existen, la aplicación funciona en modo demostración local.
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabaseEnabled = Boolean(url && key);

let client;
export async function sb() {
  if (!supabaseEnabled) throw new Error('Supabase no está configurado');
  if (!client) {
    const { createClient } = await import('@supabase/supabase-js'); // solo se descarga si se usa
    client = createClient(url, key);
  }
  return client;
}

const MESSAGES = [
  [/already registered|already exists/i, 'Ya existe una cuenta con ese email. Inicia sesión.'],
  [/invalid login credentials/i, 'Email o contraseña incorrectos.'],
  [/email not confirmed/i, 'Confirma tu email con el enlace que te enviamos antes de entrar.'],
  [/password.*(short|least|weak)/i, 'La contraseña es demasiado débil.'],
  [/rate limit|too many/i, 'Demasiados intentos. Espera un momento y vuelve a probar.'],
  [/network|fetch/i, 'No hay conexión con el servidor. Inténtalo de nuevo.'],
];
export const authMessage = (error) => (MESSAGES.find(([re]) => re.test(error?.message || '')) || [null, 'No se ha podido completar la operación. Inténtalo de nuevo.'])[1];
