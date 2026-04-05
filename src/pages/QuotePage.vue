<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 导航栏 -->
    <nav class="bg-blue-900 text-white shadow-md">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold">产品报价系统</h1>
        <router-link 
          to="/" 
          class="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-md transition-colors"
        >
          返回产品选择
        </router-link>
      </div>
    </nav>

    <!-- 主内容区 -->
    <div class="container mx-auto px-4 py-8">
      <h2 class="text-2xl font-bold mb-6">报价单</h2>

      <!-- 空状态 -->
      <div v-if="quoteStore.totalItems === 0" class="bg-white rounded-lg shadow-md p-8 text-center">
        <h3 class="text-xl font-semibold mb-4">报价单为空</h3>
        <p class="text-gray-600 mb-6">请先添加产品到报价单</p>
        <router-link 
          to="/" 
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors"
        >
          去选择产品
        </router-link>
      </div>

      <!-- 报价单内容 -->
      <div v-else class="bg-white rounded-lg shadow-md p-6">
        <!-- 报价单头部 -->
        <div class="mb-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold">{{ quoteStore.quote.name }}</h3>
            <span class="text-sm text-gray-500">创建时间: {{ formatDate(quoteStore.quote.createdAt) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <input
              v-model="quoteName"
              type="text"
              placeholder="报价单名称"
              class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              @blur="updateQuoteName"
            />
          </div>
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
                  <th class="border px-4 py-3 text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in quoteStore.quote.items" :key="item.productId">
                  <td class="border px-4 py-3">{{ item.name }}</td>
                  <td class="border px-4 py-3 text-right">¥{{ item.price }}</td>
                  <td class="border px-4 py-3">
                    <div class="flex justify-center items-center gap-2">
                      <button
                        @click="updateQuantity(item.productId, item.quantity - 1)"
                        :disabled="item.quantity <= 1"
                        class="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center transition-colors disabled:opacity-50"
                      >
                        -
                      </button>
                      <span class="min-w-8 text-center">{{ item.quantity }}</span>
                      <button
                        @click="updateQuantity(item.productId, item.quantity + 1)"
                        class="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded flex items-center justify-center transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td class="border px-4 py-3 text-right font-semibold">¥{{ item.price * item.quantity }}</td>
                  <td class="border px-4 py-3 text-center">
                    <button
                      @click="removeProduct(item.productId)"
                      class="text-red-600 hover:text-red-800 transition-colors"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 总计 -->
        <div class="border-t pt-4 mb-8">
          <div class="flex justify-between items-center">
            <span class="text-xl font-semibold">总计</span>
            <span class="text-2xl font-bold text-blue-900">¥{{ quoteStore.totalPrice }}</span>
          </div>
        </div>

        <!-- 分享功能 -->
        <div class="border-t pt-6">
          <h4 class="font-semibold mb-4">分享报价单</h4>
          <div class="space-y-4">
            <!-- 阅后即焚设置 -->
            <div class="flex flex-col md:flex-row md:items-center gap-4">
              <label class="font-medium">阅后即焚时间:</label>
              <select
                v-model="expireMinutes"
                class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="30">30分钟</option>
                <option value="60">1小时</option>
                <option value="120">2小时</option>
                <option value="1440">24小时</option>
              </select>
            </div>

            <!-- 生成链接按钮 -->
            <button
              @click="generateShareLink"
              :disabled="isLoading"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md transition-colors disabled:opacity-70"
            >
              <span v-if="isLoading">生成中...</span>
              <span v-else>生成分享链接</span>
            </button>

            <!-- 分享链接结果 -->
            <div v-if="shareLink" class="bg-gray-50 p-4 rounded-md">
              <div class="flex flex-col md:flex-row gap-4">
                <input
                  :value="shareLink"
                  readonly
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-md bg-white"
                />
                <button
                  @click="copyLink"
                  class="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md transition-colors"
                >
                  {{ copySuccess ? '已复制' : '复制链接' }}
                </button>
              </div>
              <p class="text-sm text-gray-500 mt-2">
                链接将在 {{ expireMinutes }} 分钟后过期，且仅可查看一次
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuoteStore } from '../store/quote';
import { useShare } from '../composables/useShare';

// 使用报价单 store
const quoteStore = useQuoteStore();

// 使用分享 composable
const { 
  shareLink, 
  isLoading, 
  generateShareLink: createShareLink, 
  copyToClipboard 
} = useShare();

// 响应式数据
const quoteName = ref('');
const expireMinutes = ref(60);
const copySuccess = ref(false);

// 格式化日期
const formatDate = (date: Date) => {
  return new Date(date).toLocaleString('zh-CN');
};

// 更新报价单名称
const updateQuoteName = () => {
  if (quoteName.value) {
    quoteStore.quote.name = quoteName.value;
    quoteStore.saveQuote();
  }
};

// 更新产品数量
const updateQuantity = (productId: string, quantity: number) => {
  if (quantity < 1) return;
  quoteStore.updateQuantity(productId, quantity);
  quoteStore.saveQuote();
};

// 删除产品
const removeProduct = (productId: string) => {
  quoteStore.removeProduct(productId);
  quoteStore.saveQuote();
};

// 生成分享链接
const generateShareLink = () => {
  createShareLink(quoteStore.quote, expireMinutes.value);
};

// 复制链接到剪贴板
const copyLink = async () => {
  if (shareLink.value) {
    const success = await copyToClipboard(shareLink.value);
    if (success) {
      copySuccess.value = true;
      setTimeout(() => {
        copySuccess.value = false;
      }, 2000);
    }
  }
};

// 初始化
onMounted(() => {
  quoteStore.loadQuote();
  quoteName.value = quoteStore.quote.name;
});
</script>

<style scoped>
/* 自定义样式 */
</style>