import { ref } from 'vue';
import type { Quote, ShareLink } from '../types';
import { v4 as uuidv4 } from 'uuid';

export function useShare() {
  const shareLink = ref<string>('');
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // 生成分享链接
  const generateShareLink = (quote: Quote, expireMinutes: number = 60) => {
    try {
      isLoading.value = true;
      error.value = null;

      // 生成唯一分享ID
      const shareId = uuidv4();
      
      // 计算过期时间
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + expireMinutes);

      // 创建分享链接数据
      const shareData: ShareLink = {
        id: shareId,
        quoteId: quote.id,
        expiresAt,
        isViewed: false
      };

      // 存储报价单和分享链接数据到LocalStorage
      localStorage.setItem(`quote_${shareId}`, JSON.stringify({
        ...quote,
        createdAt: quote.createdAt.toISOString()
      }));
      localStorage.setItem(`share_${shareId}`, JSON.stringify({
        ...shareData,
        expiresAt: shareData.expiresAt.toISOString()
      }));

      // 生成分享链接
      const url = `${window.location.origin}/share/${shareId}`;
      shareLink.value = url;

      return url;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to generate share link';
      console.error('Error generating share link:', err);
      return '';
    } finally {
      isLoading.value = false;
    }
  };

  // 复制链接到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      return false;
    }
  };

  // 获取分享的报价单
  const getSharedQuote = (shareId: string) => {
    try {
      const quoteData = localStorage.getItem(`quote_${shareId}`);
      const shareData = localStorage.getItem(`share_${shareId}`);

      if (!quoteData || !shareData) {
        return null;
      }

      const parsedQuote = JSON.parse(quoteData);
      const parsedShare = JSON.parse(shareData);

      // 检查是否过期
      const expiresAt = new Date(parsedShare.expiresAt);
      if (expiresAt < new Date()) {
        // 清理过期数据
        localStorage.removeItem(`quote_${shareId}`);
        localStorage.removeItem(`share_${shareId}`);
        return null;
      }

      // 标记为已查看
      parsedShare.isViewed = true;
      localStorage.setItem(`share_${shareId}`, JSON.stringify({
        ...parsedShare,
        expiresAt: parsedShare.expiresAt
      }));

      return {
        ...parsedQuote,
        createdAt: new Date(parsedQuote.createdAt)
      };
    } catch (err) {
      console.error('Error getting shared quote:', err);
      return null;
    }
  };

  // 检查链接是否已查看
  const isLinkViewed = (shareId: string) => {
    try {
      const shareData = localStorage.getItem(`share_${shareId}`);
      if (!shareData) {
        return true; // 不存在视为已失效
      }
      const parsedShare = JSON.parse(shareData);
      return parsedShare.isViewed;
    } catch (err) {
      console.error('Error checking link status:', err);
      return true;
    }
  };

  // 清理过期的分享数据
  const cleanupExpiredShares = () => {
    try {
      const now = new Date();
      
      // 遍历LocalStorage中的所有键
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('share_')) {
          const shareData = localStorage.getItem(key);
          if (shareData) {
            try {
              const parsedShare = JSON.parse(shareData);
              const expiresAt = new Date(parsedShare.expiresAt);
              if (expiresAt < now) {
                // 清理过期数据
                const shareId = key.replace('share_', '');
                localStorage.removeItem(key);
                localStorage.removeItem(`quote_${shareId}`);
              }
            } catch (err) {
              // 解析错误，清理数据
              localStorage.removeItem(key);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error cleaning up expired shares:', err);
    }
  };

  // 初始化时清理过期数据
  cleanupExpiredShares();

  return {
    shareLink,
    isLoading,
    error,
    generateShareLink,
    copyToClipboard,
    getSharedQuote,
    isLinkViewed,
    cleanupExpiredShares
  };
}