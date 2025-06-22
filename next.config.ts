import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // 在构建时忽略 TypeScript 错误
    ignoreBuildErrors: true,
  },
  eslint: {
    // 在构建时忽略 ESLint 错误
    ignoreDuringBuilds: true,
  },
  // 禁用匿名函数名称生成，避免 React 19 相关问题
  productionBrowserSourceMaps: true,
  // 配置 webpack 以处理 vendor chunks
  webpack: (config, { isServer }) => {
    // 确保 antd 模块被正确打包
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // 分离 ant design 相关模块
          antd: {
            name: 'antd-chunk',
            test: /[\\/]node_modules[\\/](antd|@ant-design)[\\/]/,
            priority: 30,
            reuseExistingChunk: true,
          },
          // 其他通用依赖
          commons: {
            name: 'commons',
            test: /[\\/]node_modules[\\/]/,
            priority: 20,
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
