import { ThemeConfig } from 'antd';

// 自定义主题配置
export const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: '#1677ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1677ff',
    borderRadius: 6,
    wireframe: false,
    fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
  },
  components: {
    Menu: {
      itemBg: 'transparent',
      itemColor: 'rgba(0, 0, 0, 0.65)',
      itemSelectedColor: '#1677ff',
      itemSelectedBg: 'rgba(22, 119, 255, 0.1)',
      itemHoverColor: '#1677ff',
    },
    Layout: {
      headerBg: '#ffffff',
      bodyBg: '#f0f2f5',
      triggerBg: '#002140',
    },
    Tag: {
      colorText: 'inherit',
      colorBgTextHover: 'rgba(0, 0, 0, 0.06)',
      colorBgTextActive: '#1677ff',
      fontWeightStrong: 500,
      algorithm: true,
    },
  },
};

// 导出深色模式主题配置
export const darkThemeConfig: ThemeConfig = {
  token: {
    ...themeConfig.token,
    colorBgBase: '#000',
    colorTextBase: 'rgba(255, 255, 255, 0.85)',
  },
  components: {
    ...themeConfig.components,
    Menu: {
      ...themeConfig.components?.Menu,
      itemColor: 'rgba(255, 255, 255, 0.65)',
      itemSelectedColor: '#1677ff',
      itemSelectedBg: 'rgba(22, 119, 255, 0.2)',
    },
    Layout: {
      ...themeConfig.components?.Layout,
      headerBg: '#141414',
      bodyBg: '#000',
    },
    Tag: {
      ...themeConfig.components?.Tag,
      colorBgTextHover: 'rgba(255, 255, 255, 0.12)',
    },
  },
}; 