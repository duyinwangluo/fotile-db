<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 导航栏 -->
    <nav class="bg-blue-900 text-white shadow-md">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold">产品报价系统</h1>
        <router-link 
          to="/quote" 
          class="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-md transition-colors"
        >
          查看报价单 ({{ quoteStore.totalItems }})
        </router-link>
      </div>
    </nav>

    <!-- 主内容区 -->
    <div class="container mx-auto px-4 py-8">
      <!-- 搜索和筛选 -->
      <div class="mb-8">
        <div class="flex flex-col md:flex-row gap-4">
          <!-- 搜索框 -->
          <div class="flex-1">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索产品..."
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <!-- 类别筛选 -->
          <div>
            <select
              v-model="selectedCategory"
              class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部分类</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- 产品列表和报价单预览 -->
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- 产品列表 -->
        <div class="flex-1">
          <h2 class="text-xl font-semibold mb-4">产品列表</h2>
          
          <!-- 加载状态 -->
          <div v-if="loading" class="flex justify-center py-10">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>

          <!-- 错误状态 -->
          <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {{ error }}
          </div>

          <!-- 产品网格 -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="product in filteredProducts" :key="product.id" class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div class="relative">
                <img 
                  :src="product.image" 
                  :alt="product.name" 
                  class="w-full h-48 object-cover"
                />
                <div class="absolute top-2 right-2">
                  <input
                    type="checkbox"
                    :id="`product-${product.id}`"
                    :checked="isProductSelected(product.id)"
                    @change="toggleProduct(product)"
                    class="w-6 h-6 text-blue-600"
                  />
                </div>
              </div>
              <div class="p-4">
                <h3 class="font-semibold text-lg mb-2">{{ product.name }}</h3>
                <p class="text-gray-600 text-sm mb-3">{{ product.description }}</p>
                <div class="flex justify-between items-center">
                  <span class="text-lg font-bold text-blue-900">¥{{ product.price }}</span>
                  <button
                    @click="toggleProduct(product)"
                    :class="[
                      isProductSelected(product.id) 
                        ? 'bg-blue-700 hover:bg-blue-600' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    ]"
                    class="text-white px-4 py-2 rounded transition-colors"
                  >
                    {{ isProductSelected(product.id) ? '移除' : '添加' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 报价单预览 -->
        <div class="lg:w-1/4 bg-white rounded-lg shadow-md p-4 sticky top-4 self-start">
          <h2 class="text-xl font-semibold mb-4">报价单预览</h2>
          
          <div v-if="quoteStore.totalItems === 0" class="text-center py-8 text-gray-500">
            尚未添加产品
          </div>
          
          <div v-else>
            <div class="space-y-4 mb-6">
              <div v-for="item in quoteStore.quote.items" :key="item.productId" class="flex justify-between items-center pb-2 border-b">
                <div>
                  <p class="font-medium">{{ item.name }}</p>
                  <p class="text-sm text-gray-500">数量: {{ item.quantity }}</p>
                </div>
                <div class="text-right">
                  <p class="font-semibold">¥{{ item.price }}</p>
                  <p class="text-sm text-gray-500">小计: ¥{{ item.price * item.quantity }}</p>
                </div>
              </div>
            </div>
            
            <div class="border-t pt-4">
              <div class="flex justify-between items-center mb-4">
                <span class="font-semibold text-lg">总计</span>
                <span class="font-bold text-xl text-blue-900">¥{{ quoteStore.totalPrice }}</span>
              </div>
              <router-link 
                to="/quote" 
                class="block w-full bg-blue-900 hover:bg-blue-800 text-white text-center py-3 rounded-md transition-colors"
              >
                前往报价单
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProducts } from '../composables/useProducts';
import { useQuoteStore } from '../store/quote';
import type { Product } from '../types';

// 使用产品 composable
const { 
  loading, 
  error, 
  selectedCategory, 
  searchQuery, 
  filteredProducts, 
  categories 
} = useProducts();

// 使用报价单 store
const quoteStore = useQuoteStore();

// 检查产品是否已选中
const isProductSelected = (productId: string) => {
  return quoteStore.quote.items.some(item => item.productId === productId);
};

// 切换产品选择状态
const toggleProduct = (product: Product) => {
  if (isProductSelected(product.id)) {
    quoteStore.removeProduct(product.id);
  } else {
    quoteStore.addProduct(product);
  }
  quoteStore.saveQuote();
};
</script>

<style scoped>
/* 自定义样式 */
</style>