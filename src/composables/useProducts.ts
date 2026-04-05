import { ref, computed, onMounted } from 'vue';
import type { Product } from '../types';

export function useProducts() {
  const products = ref<Product[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);
  const selectedCategory = ref<string>('all');
  const searchQuery = ref<string>('');

  // 加载产品数据
  const loadProducts = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await fetch('/products.json');
      if (!response.ok) {
        throw new Error('Failed to load products');
      }
      const data = await response.json();
      products.value = data.products;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load products';
      console.error('Error loading products:', err);
    } finally {
      loading.value = false;
    }
  };

  // 过滤后的产品列表
  const filteredProducts = computed(() => {
    let result = [...products.value];

    // 按类别过滤
    if (selectedCategory.value !== 'all') {
      result = result.filter(product => product.category === selectedCategory.value);
    }

    // 按搜索关键词过滤
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    }

    return result;
  });

  // 所有可用的类别
  const categories = computed(() => {
    const uniqueCategories = new Set(products.value.map(product => product.category));
    return ['all', ...Array.from(uniqueCategories)];
  });

  // 初始化加载产品数据
  onMounted(() => {
    loadProducts();
  });

  return {
    products,
    loading,
    error,
    selectedCategory,
    searchQuery,
    filteredProducts,
    categories,
    loadProducts
  };
}