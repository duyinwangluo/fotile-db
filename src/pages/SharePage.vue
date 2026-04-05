<template>
  <div class="min-h-screen bg-gray-50 relative" :class="{ 'no-select': true }" @keydown="handleKeydown">
    <!-- 防截图水印 -->
    <div v-if="quote" class="fixed inset-0 z-50 pointer-events-none">
      <!-- 主水印 -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="text-6xl font-bold text-gray-400 transform -rotate-45 whitespace-nowrap opacity-10">
          禁止截图
        </div>
      </div>
      <!-- 动态水印网格 -->
      <div class="absolute inset-0">
        <div v-for="i in 20" :key="i" class="absolute" :style="getWatermarkStyle(i)">
          <div class="text-2xl font-bold text-gray-300 transform -rotate-45 opacity-5">
            禁止截图
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="container mx-auto px-4 py-8 relative z-10">
      <!-- 链接失效状态 -->
      <div v-if="!quote" class="bg-white rounded-lg shadow-md p-8 text-center">
        <h3 class="text-xl font-semibold mb-4">链接已失效</h3>
        <p class="text-gray-600 mb-6">该链接可能已被查看或已过期</p>
        <router-link 
          to="/" 
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors"
        >
          返回首页
        </router-link>
      </div>

      <!-- 报价单内容 -->
      <div v-else class="bg-white rounded-lg shadow-md p-6">
        <!-- 头部 -->
        <div class="mb-6 text-center">
          <h2 class="text-2xl font-bold mb-2">{{ quote.name }}</h2>
          <p class="text-sm text-gray-500">创建时间: {{ formatDate(quote.createdAt) }}</p>
        </div>

        <!-- 产品列表 -->
        <div class="mb-8">
          <h4 class="font-semibold mb-3">产品清单</h4>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="bg-gray-100">
                  <th class="border px-4 py-3 text-left">产品名称</th>
                  <th class="border px-4 py-3 text-right">单价</th>
                  <th class="border px-4 py-3 text-center">数量</th>
                  <th class="border px-4 py-3 text-right">小计</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in quote.items" :key="item.productId">
                  <td class="border px-4 py-3">{{ item.name }}</td>
                  <td class="border px-4 py-3 text-right">¥{{ item.price }}</td>
                  <td class="border px-4 py-3 text-center">{{ item.quantity }}</td>
                  <td class="border px-4 py-3 text-right font-semibold">¥{{ item.price * item.quantity }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 总计 -->
        <div class="border-t pt-4 mb-8">
          <div class="flex justify-between items-center">
            <span class="text-xl font-semibold">总计</span>
            <span class="text-2xl font-bold text-blue-900">¥{{ quote.totalPrice }}</span>
          </div>
        </div>

        <!-- 阅后即焚提示 -->
        <div class="bg-yellow-50 border border-yellow-200 p-4 rounded-md mb-6">
          <div class="flex items-center">
            <div class="text-yellow-500 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.667-1.5-2.5-1.5H7.268c-.833 0-1.73.667-2.5 1.5L2.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h5 class="font-medium text-yellow-800">阅后即焚</h5>
              <p class="text-sm text-yellow-700">此链接仅可查看一次，关闭页面后将失效</p>
            </div>
          </div>
        </div>

        <!-- 倒计时 -->
        <div v-if="timeLeft > 0" class="text-center mb-6">
          <p class="text-sm text-gray-600">
            链接将在 <span class="font-semibold">{{ timeLeft }} 秒</span> 后自动失效
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useShare } from '../composables/useShare';
import type { Quote } from '../types';

// 使用路由
const route = useRoute();

// 使用分享 composable
const { getSharedQuote } = useShare();

// 响应式数据
const quote = ref<Quote | null>(null);
const timeLeft = ref(300); // 5分钟倒计时
let countdownInterval: number | null = null;

// 格式化日期
const formatDate = (date: Date) => {
  return new Date(date).toLocaleString('zh-CN');
};

// 开始倒计时
const startCountdown = () => {
  countdownInterval = window.setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      // 倒计时结束，清理数据
      cleanup();
    }
  }, 1000);
};

// 清理数据
const cleanup = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  // 这里可以添加清理LocalStorage的逻辑
  quote.value = null;
};

// 键盘事件处理
const handleKeydown = (e: KeyboardEvent) => {
  // 禁用Print Screen键
  if (e.key === 'PrintScreen') {
    e.preventDefault();
    alert('截图功能已被禁用');
  }
  // 禁用Ctrl+S (保存)
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault();
  }
  // 禁用Ctrl+P (打印)
  if (e.ctrlKey && e.key === 'p') {
    e.preventDefault();
  }
  // 禁用Ctrl+C (复制)
  if (e.ctrlKey && e.key === 'c') {
    e.preventDefault();
  }
};

// 生成水印样式
const getWatermarkStyle = (index: number) => {
  const x = (index % 5) * 25;
  const y = Math.floor(index / 5) * 25;
  return {
    left: `${x}%`,
    top: `${y}%`,
    transform: `rotate(${Math.random() * 45 - 22.5}deg)`,
  };
};

// 防截图措施
const preventScreenshot = () => {
  // 禁用右键菜单
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });

  // 禁用选择
  document.addEventListener('selectstart', (e) => {
    e.preventDefault();
  });

  // 禁用复制
  document.addEventListener('copy', (e) => {
    e.preventDefault();
  });

  // 禁用打印
  window.addEventListener('beforeprint', (e) => {
    e.preventDefault();
    alert('打印功能已被禁用');
    return false;
  });

  // 检测截图事件
  const detectScreenshot = () => {
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;

    setInterval(() => {
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;

      // 检测屏幕尺寸变化（可能是截图工具）
      if (Math.abs(currentWidth - lastWidth) > 100 || Math.abs(currentHeight - lastHeight) > 100) {
        // 可以在这里添加提示或其他措施
        console.log('可能的截图尝试');
      }

      lastWidth = currentWidth;
      lastHeight = currentHeight;
    }, 1000);
  };

  // 检测移动端设备并应用防截图措施
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile) {
    // 对于iOS设备，添加额外的防截图措施
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      const bodyStyle = document.body.style as any;
      bodyStyle.webkitTouchCallout = 'none';
      bodyStyle.webkitUserSelect = 'none';
      bodyStyle.userSelect = 'none';
      // 添加iOS特定的防截图CSS
      document.body.classList.add('ios-no-screenshot');
    }
  }

  // 启动截图检测
  detectScreenshot();
};

// 初始化
onMounted(() => {
  const shareId = route.params.id as string;
  if (shareId) {
    quote.value = getSharedQuote(shareId);
    if (quote.value) {
      startCountdown();
      preventScreenshot();
    }
  }
});

// 清理
onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  // 页面关闭时标记为已查看
  if (quote.value) {
    cleanup();
  }
});
</script>

<style scoped>
/* 自定义样式 */
.no-select {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  pointer-events: auto;
}

/* 防止打印 */
@media print {
  body {
    display: none !important;
  }
}

/* iOS防截图样式 */
:global(.ios-no-screenshot) {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  pointer-events: none;
}

/* 增强防截图效果 */
.prevent-screenshot {
  position: relative;
  overflow: hidden;
}

/* 动态水印效果 */
.watermark-grid {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
}

/* 屏蔽常见的截图快捷键 */
@supports (-webkit-touch-callout: none) {
  /* iOS设备 */
  body {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
  }
}

/* 防止通过开发者工具查看 */
@media screen and (max-width: 100px) {
  body {
    display: none !important;
  }
}
</style>