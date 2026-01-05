<template>
  <div class="container d-flex justify-content-center align-items-center vh-100">
    <div class="calculator card shadow-sm">
      <!-- Display -->
      <div class="p-3 text-end">
        <div class="expression">
          {{ expression || '0' }}
        </div>
        <div class="result">
          {{ result }}
        </div>
      </div>

      <!-- Keys -->
      <div class="keys p-3">
        <div class="row g-2">
          <div class="col-3">
            <button class="btn key-func" @click="clear">AC</button>
          </div>
          <div class="col-3">
            <button class="btn key-func" @click="backspace">⌫</button>
          </div>
          <div class="col-3" v-for="op in ['(', ')']" :key="op">
            <button class="btn key-func" @click="press(op)">
              {{ op }}
            </button>
          </div>

          <div v-for="k in keys" :key="k" class="col-3">
            <button class="btn key" :class="{ operator: isOperator(k) }" @click="press(k)">
              {{ k }}
            </button>
          </div>

          <div class="col-12">
            <button class="btn key-equals" @click="equals">=</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { calculate } from '@/utils/calculatorEngine'

const expression = ref('')
const result = ref('')

const keys = ['7', '8', '9', '+', '4', '5', '6', '-', '1', '2', '3', '*', '0', '.', '/', '%']

function isOperator(k) {
  return ['+', '-', '*', '/', '%'].includes(k)
}

function canPress(key) {
  const exp = expression.value
  const last = exp.slice(-1)

  if (key === '(') {
    return !exp || isOperator(last) || last === '('
  }

  if (key === ')') {
    const open = (exp.match(/\(/g) || []).length
    const close = (exp.match(/\)/g) || []).length
    return open > close && !isOperator(last) && last !== '('
  }

  return true
}

function press(key) {
  if (!canPress(key)) return
  expression.value += key
}

function backspace() {
  expression.value = expression.value.slice(0, -1)
}

function clear() {
  expression.value = ''
  result.value = ''
}

function equals() {
  const exp = expression.value
  if (!exp) return

  const open = (exp.match(/\(/g) || []).length
  const close = (exp.match(/\)/g) || []).length
  const last = exp.slice(-1)

  if (open !== close || isOperator(last)) {
    result.value = 'Error'
    return
  }

  try {
    result.value = calculate(exp)
  } catch {
    result.value = 'Error'
  }
}

/* Keyboard */
function handleKeydown(e) {
  const key = e.key

  if (/^[0-9]$/.test(key)) press(key)
  else if (['+', '-', '*', '/', '%', '.', '(', ')'].includes(key)) press(key)
  else if (key === 'Enter') {
    e.preventDefault()
    equals()
  } else if (key === 'Backspace') backspace()
  else if (key === 'Escape' || key === 'Delete') clear()
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<style scoped>
.calculator {
  width: 420px;
  border-radius: 18px;
  background: #f6f6f6;
}

/* Display */
.display {
  background: #000;
  color: #fff;
  border-radius: 14px;
  margin-bottom: 16px;
}

.expression {
  font-size: 1rem;
  color: #bbb;
  min-height: 22px;
}

.result {
  font-size: 2.2rem;
  font-weight: 500;
  min-height: 44px;
}

/* Keys */
.key,
.key-func,
.key-equals {
  width: 100%;
  height: 56px;
  border-radius: 10px;
  border: none;
  background: #e0e0e0;
  font-size: 1.2rem;
}

.key-func {
  background: #ededed;
  font-size: 1rem;
}

.key-equals {
  background: #222;
  color: #fff;
  font-size: 1.4rem;
}

button:active {
  transform: scale(0.97);
}
</style>
