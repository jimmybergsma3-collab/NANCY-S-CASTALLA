import type { Locale } from "./config";

const copy = {
  en: { login: "Login", account: "My account", signIn: "Sign in", register: "Register", forgot: "Forgot password", email: "Email", password: "Password", reset: "Send reset link", logout: "Sign out", history: "Order history" },
  nl: { login: "Inloggen", account: "Mijn account", signIn: "Inloggen", register: "Registreren", forgot: "Wachtwoord vergeten", email: "E-mail", password: "Wachtwoord", reset: "Stuur herstellink", logout: "Uitloggen", history: "Bestelgeschiedenis" },
  de: { login: "Anmelden", account: "Mein Konto", signIn: "Anmelden", register: "Registrieren", forgot: "Passwort vergessen", email: "E-Mail", password: "Passwort", reset: "Link senden", logout: "Abmelden", history: "Bestellverlauf" },
  es: { login: "Iniciar sesión", account: "Mi cuenta", signIn: "Iniciar sesión", register: "Registrarse", forgot: "Olvidé mi contraseña", email: "Correo electrónico", password: "Contraseña", reset: "Enviar enlace", logout: "Cerrar sesión", history: "Historial de pedidos" },
  sv: { login: "Logga in", account: "Mitt konto", signIn: "Logga in", register: "Registrera", forgot: "Glömt lösenord", email: "E-post", password: "Lösenord", reset: "Skicka återställningslänk", logout: "Logga ut", history: "Orderhistorik" },
} as const;

export function getAuthCopy(locale: Locale) { return copy[locale]; }
