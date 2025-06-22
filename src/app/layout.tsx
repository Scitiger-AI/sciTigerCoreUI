import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./critical.css"; // 导入关键CSS
import ClientRootLayout from "@/layout/ClientRootLayout";
import InlineStyles from "@/layout/common/InlineStyles";
import ClientLoadingIndicator from "@/layout/common/ClientLoadingIndicator";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "科虎多租户应用基础服务管理平台 - 企业级多租户管理系统",
  description: "本平台提供租户管理、用户权限管理、审计日志管理、通知中心管理、订单订阅管理、微服务管理以及工作流管理等核心功能,为企业提供完整的多租户应用管理解决方案。",
  applicationName: "科虎多租户应用基础服务管理平台",
  authors: [{ name: "科虎多租户应用基础服务管理平台团队" }],
  keywords: ["多租户", "权限管理", "审计日志", "通知中心", "订单订阅", "微服务", "工作流"],
  creator: "科虎多租户应用基础服务管理平台",
  publisher: "科虎多租户应用基础服务管理平台",
  formatDetection: {
    telephone: false,
  },
  metadataBase: new URL("https://link-tiger.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "科虎多租户应用基础服务管理平台 - 企业级多租户管理系统",
    description: "本平台提供租户管理、用户权限管理、审计日志管理、通知中心管理、订单订阅管理、微服务管理以及工作流管理等核心功能,为企业提供完整的多租户应用管理解决方案。",
    url: "https://link-tiger.com",
    siteName: "科虎多租户应用基础服务管理平台",
    locale: "zh_CN",
    type: "website",
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 800,
        alt: '科虎多租户应用基础服务管理平台'
      }
    ]
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        {/* 预加载关键CSS */}
        <link 
          rel="preload" 
          href="/reset.min.css" 
          as="style" 
          crossOrigin="anonymous" 
        />
        {/* 立即加载Ant Design样式 */}
        <link
          rel="stylesheet"
          href="/reset.min.css"
          crossOrigin="anonymous"
        />
        {/* 直接设置 favicon */}
        <link rel="icon" href="/logo.png" />
        <link rel="shortcut icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        {/* 内联关键CSS */}
        <InlineStyles />
      </head>
      <body className={inter.className}>
        {/* 添加初始加载指示器 */}
        <div id="initial-loader" className="loading-container">
          <div style={{ textAlign: 'center' }}>
            <div className="ant-spin ant-spin-lg ant-spin-spinning">
              <span className="ant-spin-dot ant-spin-dot-spin">
                <i className="ant-spin-dot-item"></i>
                <i className="ant-spin-dot-item"></i>
                <i className="ant-spin-dot-item"></i>
                <i className="ant-spin-dot-item"></i>
              </span>
            </div>
            <div style={{ marginTop: '16px', fontSize: '16px', color: 'rgba(0, 0, 0, 0.65)' }}>
              科虎多租户应用基础服务管理平台加载中...
            </div>
          </div>
        </div>
        <ClientRootLayout>{children}</ClientRootLayout>
        <ClientLoadingIndicator />
      </body>
    </html>
  );
}
