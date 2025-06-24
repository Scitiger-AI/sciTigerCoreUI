import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { STORAGE_KEYS } from '@/constants/api';

// 不需要登录就能访问的路径
const publicPaths = [
  '/privacy',
  '/activate',
  '/terms',
  '/login',
  '/register',
  '/forgot-password',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 检查标准键名和STORAGE_KEYS中定义的键名
  const token = 
    request.cookies.get(STORAGE_KEYS.ACCESS_TOKEN)?.value;
  
  const isAuthenticated = !!token;

  // 检查是否是公开的路径
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  // 任何不在公开路径列表中的路径都被视为受保护的路径
  const isProtectedPath = !isPublicPath;

  // 如果是受保护的路径但未登录，重定向到登录页面
  if (isProtectedPath && !isAuthenticated) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // 只有当用户已登录并尝试访问登录/注册页面时，才重定向到首页
  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// 配置中间件匹配的路径
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了:
     * - api 路由
     * - 静态文件
     * - favicon.ico
     * - 服务器端组件资源
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 