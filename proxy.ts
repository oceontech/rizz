import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

const COOKIE_SESSAO = "rizz_sessao";

async function valida(token: string | undefined) {
  const segredo = process.env.AUTH_SECRET;
  if (!token || !segredo) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(segredo), { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}

/**
 * Checagem otimista do painel: quem não tem sessão vai para o login antes de
 * renderizar qualquer coisa. A verificação que vale é a de `exigirSessao()`.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const logado = await valida(request.cookies.get(COOKIE_SESSAO)?.value);
  const naTelaDeLogin = pathname === "/admin/login";

  if (!logado && !naTelaDeLogin) {
    const destino = new URL("/admin/login", request.url);
    if (pathname !== "/admin") destino.searchParams.set("de", pathname);
    return NextResponse.redirect(destino);
  }

  if (logado && naTelaDeLogin) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
