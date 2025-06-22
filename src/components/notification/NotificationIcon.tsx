"use client";

import React from 'react';
import { Badge, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { BellOutlined } from '@ant-design/icons';

interface NotificationIconProps {
  count?: number;
  onClick?: () => void;
  className?: string;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({
  count = 0,
  onClick,
  className = ''
}) => {
  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <div className="px-4 py-2">
          <div className="font-medium">暂无新通知</div>
        </div>
      ),
    },
  ];

  return (
    <Dropdown menu={{ items }} placement="bottomRight" arrow trigger={['click']}>
      <Badge count={count} size="small" offset={[-2, 2]} className={className}>
        <div 
          className="flex items-center justify-center w-8 h-8 rounded-full cursor-pointer hover:bg-gray-100"
          onClick={onClick}
        >
          <BellOutlined style={{ fontSize: '18px' }} />
        </div>
      </Badge>
    </Dropdown>
  );
};

export default NotificationIcon; 