"use client";

import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Tooltip,
  Badge
} from 'antd';
import { css } from '@emotion/css';
import { getApiKeyUsageLogs } from '@/services/apiKey';
import { ApiKeyUsageLog } from '@/types/apiKey';
import { App } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import { 
  ReloadOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

// 配置dayjs
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

interface ApiKeyUsageLogsModalProps {
  visible: boolean;
  apiKeyId: string;
  apiKeyName: string;
  onCancel: () => void;
}

const ApiKeyUsageLogsModal: React.FC<ApiKeyUsageLogsModalProps> = ({
  visible,
  apiKeyId,
  apiKeyName,
  onCancel,
}) => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState<boolean>(false);
  const [usageLogs, setUsageLogs] = useState<ApiKeyUsageLog[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  // 获取使用日志
  const fetchUsageLogs = async (page = 1) => {
    try {
      setLoading(true);
      const data = await getApiKeyUsageLogs(apiKeyId, {
        page,
        page_size: pagination.pageSize,
        ordering: '-timestamp',
      });
      
      setUsageLogs(data.results);
      setPagination({
        ...pagination,
        current: data.current_page,
        pageSize: data.page_size,
        total: data.total
      });
    } catch (error: any) {
      console.error('获取API密钥使用日志失败:', error);
      message.error(`获取使用日志失败: ${error.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // 首次加载和参数变化时获取使用日志
  useEffect(() => {
    if (visible && apiKeyId) {
      fetchUsageLogs();
    }
  }, [visible, apiKeyId]);
  
  // 获取状态码对应的标签颜色
  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'success';
    if (status >= 300 && status < 400) return 'processing';
    if (status >= 400 && status < 500) return 'warning';
    if (status >= 500) return 'error';
    return 'default';
  };
  
  // 处理表格分页变化
  const handleTableChange = (pagination: any) => {
    setPagination({
      ...pagination,
      current: pagination.current
    });
    fetchUsageLogs(pagination.current);
  };
  
  // 表格列定义
  const columns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text: string) => (
        <Tooltip title={dayjs(text).format('YYYY-MM-DD HH:mm:ss')}>
          <Space>
            <ClockCircleOutlined />
            {dayjs(text).fromNow()}
          </Space>
        </Tooltip>
      )
    },
    {
      title: '请求路径',
      dataIndex: 'request_path',
      key: 'request_path',
      ellipsis: true,
    },
    {
      title: '方法',
      dataIndex: 'request_method',
      key: 'request_method',
      render: (text: string) => {
        const methodColor = {
          GET: 'blue',
          POST: 'green',
          PUT: 'orange',
          PATCH: 'purple',
          DELETE: 'red',
        }[text] || 'default';
        
        return <Tag color={methodColor}>{text}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'response_status',
      key: 'response_status',
      render: (status: number) => (
        <Badge 
          status={getStatusColor(status)} 
          text={status.toString()} 
        />
      )
    },
    {
      title: '客户端IP',
      dataIndex: 'client_ip',
      key: 'client_ip',
    },
    {
      title: '请求ID',
      dataIndex: 'request_id',
      key: 'request_id',
      ellipsis: true,
    }
  ];
  
  return (
    <Modal
      title={`API密钥使用日志 - ${apiKeyName}`}
      open={visible}
      width={1000}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          关闭
        </Button>
      ]}
    >
      <div className={css`
        display: flex;
        justify-content: flex-end;
        margin-bottom: 16px;
      `}>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => fetchUsageLogs(pagination.current)}
          loading={loading}
        >
          刷新
        </Button>
      </div>
      
      <Table
        rowKey="id"
        columns={columns}
        dataSource={usageLogs}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`
        }}
        onChange={handleTableChange}
      />
    </Modal>
  );
};

export default ApiKeyUsageLogsModal; 