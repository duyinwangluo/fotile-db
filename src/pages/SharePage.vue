<template>
  <div class="min-h-screen bg-gray-50 relative" :class="{ 'no-select': true }">
    <!-- 防截图水印 -->
    <div v-if="quote" class="fixed inset-0 z-50 pointer-events-none opacity-10">
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="text-6xl font-bold text-gray-400 transform -rotate-45 whitespace-nowrap">
          禁止截图
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

  // 检测移动端设备并应用防截图措施
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile) {
    // 对于iOS设备，添加额外的防截图措施
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      const bodyStyle = document.body.style as any;
      bodyStyle.webkitTouchCallout = 'none';
      bodyStyle.webkitUserSelect = 'none';
      bodyStyle.userSelect = 'none';
    }
  }
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
</style>