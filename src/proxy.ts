import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

export default auth((req) => {
  const session = req.auth;
  const { pathname } = req.nextUrl;

  // ---- /author routes: require AUTHOR or ADMIN ----
  if (pathname.startsWith("/author")) {
    if (!session?.user) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("login", "required");
      return NextResponse.redirect(url);
    }
    if (session.user.role !== Role.AUTHOR && session.user.role !== Role.ADMIN) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (!pathname.startsWith("/admin")) return NextResponse.next();

  // ยังไม่ login → redirect ไปหน้าหลักพร้อม query แจ้ง login
  if (!session?.user) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("login", "required");
    return NextResponse.redirect(url);
  }

  // Login แล้วแต่ไม่ใช่ ADMIN → กลับหน้าหลัก
  if (session.user.role !== Role.ADMIN) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/author/:path*"],
};
