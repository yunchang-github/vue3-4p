/**
* 限制最大值 最小值 小数位
*<el-input v-number-input="{ min: -100, max: 100, precision: 2 }" v-model="amount1"  />
* 只处理小数位  
*<el-input v-number-input="{ precision: 2 }" v-model="amount2"  />
* 只验证数字 默认是整数
*<el-input v-number-input v-model="amount3"  />
* 
 */

import { DirectiveBinding } from 'vue';

function getDecimalPlaces(value: string): number {
  const parts = value.split('.');
  return parts.length > 1 ? parts[1].length : 0;
}

function isValidNumber(value: string, maxDecimalPlaces: number): boolean {
  const precision = getDecimalPlaces(value);
  return precision <= maxDecimalPlaces;
}

const vNumberInput = {
  beforeMount(el: HTMLElement, binding: DirectiveBinding) {
    // 设置最小值和最大值
    const min = binding.value?.min ?? -Infinity;
    const max = binding.value?.max ?? Infinity;
    // 设置小数位数
    const maxDecimalPlaces = binding.value?.precision !== undefined ? binding.value.precision : 0;

    el.addEventListener('input', (e) => {
      const input = e.target as HTMLInputElement;
      const value = input.value;
      if (!/^-?\d*\.?\d*$/.test(value)) {
        // 不是数字
        input.value = '';
      } else {
        const numericValue = parseFloat(value);
        if (numericValue < min) {
          // 小于最小值
          input.value = String(min);
        } else if (numericValue > max) {
          // 大于最大值
          input.value = String(max);
        } else if (maxDecimalPlaces > 0 && !isValidNumber(value, maxDecimalPlaces)) {
          // 小数位不符合
          input.value = String(value.match(/^-?\d*\.?\d{0,2}/)?.[0] ?? '');
        } else if (maxDecimalPlaces == 0) {
          input.value = String(value.match(/^-?\d+$/)?.[0] ?? '');
        }
      }
    });
  }
};

export default vNumberInput;