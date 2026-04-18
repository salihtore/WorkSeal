import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/contracts",
  "/escrow",
  "/disputes",
  "/invoices",
  "/profile",
];

const publicRoutes = ["/", "/connect", "/explore"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (!isProtected) return NextResponse.next();

  // Wallet bağlantısı cookie'de tutulacak (backend hazır olunca)
  // Şimdilik localStorage'dan okuyamayız (server-side), cookie kullanıyoruz
  const walletConnected = request.cookies.get("wallet_connected")?.value;

  if (!walletConnected) {
    return NextResponse.redirect(new URL("/connect", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};