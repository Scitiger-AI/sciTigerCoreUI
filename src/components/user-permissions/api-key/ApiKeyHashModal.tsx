import React, { useState } from 'react';
import { Modal, Input, Button, Alert, App } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { css } from '@emotion/css';
import { getApiKeyHash } from '@/services/apiKey';

interface ApiKeyHashModalProps {
  visible: boolean;
  apiKeyId: string;
  apiKeyName: string;
  onCancel: () => void;
}

const ApiKeyHashModal: React.FC<ApiKeyHashModalProps> = ({
  visible,
  apiKeyId,
  apiKeyName,
  onCancel
}) => {
  const { message } = App.useApp();
  const [passwordForHash, setPasswordForHash] = useState<string>('');
  const [keyHash, setKeyHash] = useState<string>('');
  const [loadingHash, setLoadingHash] = useState<boolean>(false);

  // 清空状态
  const handleCancel = () => {
    setPasswordForHash('');
    setKeyHash('');
    onCancel();
  };

  // 获取API密钥哈希
  const handleGetKeyHash = async () => {
    if (!passwordForHash) {
      message.error('请输入密码');
      return;
    }
    
    setLoadingHash(true);
    try {
      const result = await getApiKeyHash(apiKeyId, passwordForHash);
      setKeyHash(result.key_hash);
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        message.error('密码不正确');
      } else if (error.response && error.response.status === 403) {
        message.error('您没有权限查看此API密钥的哈希');
      } else {
        message.error(`获取密钥哈希失败: ${error.message || '未知错误'}`);
        console.error('获取API密钥哈希失败:', error);
      }
    } finally {
      setLoadingHash(false);
    }
  };
  
  // 复制完整密钥哈希
  const copyKeyHash = (hash: string) => {
    navigator.clipboard.writeText(hash)
      .then(() => {
        message.success('已复制API密钥哈希到剪贴板');
      })
      .catch(() => {
        message.error('复制失败，请手动复制');
      });
  };

  return (
    <Modal
      title="查看API密钥"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      maskClosable={true}
      destroyOnClose
    >
      <div className={css`margin-bottom: 16px;`}>
        <p>您正在查看API密钥 <strong>{apiKeyName}</strong> 的完整密钥。</p>
        <p>出于安全考虑，您需要输入您的账户密码进行验证。</p>
      </div>
      
      {!keyHash ? (
        <div>
          <Input.Password
            placeholder="请输入您的账户密码"
            value={passwordForHash}
            onChange={(e) => setPasswordForHash(e.target.value)}
            onPressEnter={handleGetKeyHash}
            style={{ marginBottom: 16 }}
          />
          <Button 
            type="primary" 
            onClick={handleGetKeyHash} 
            loading={loadingHash}
            block
          >
            验证密码并查看
          </Button>
        </div>
      ) : (
        <div>
          <Alert
            message="重要提示"
            description="这是API密钥的完整哈希值，请妥善保管，不要分享给无关人员。"
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <Input.TextArea
            value={keyHash}
            autoSize={{ minRows: 2, maxRows: 4 }}
            readOnly
            style={{ marginBottom: 16, fontFamily: 'monospace' }}
          />
          
          <div className={css`display: flex; justify-content: space-between;`}>
            <Button onClick={handleCancel}>
              关闭
            </Button>
            <Button 
              type="primary" 
              icon={<CopyOutlined />}
              onClick={() => copyKeyHash(keyHash)}
            >
              复制密钥哈希
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ApiKeyHashModal; 