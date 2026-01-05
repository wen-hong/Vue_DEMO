// src/utils/calculatorEngine.js

const precedence = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
  '%': 2,
}

function tokenize(expr) {
  return expr.match(/(\d+(\.\d+)?)|[+\-*/()%]/g) || []
}

function toPostfix(tokens) {
  const output = []
  const stack = []

  tokens.forEach((token) => {
    if (!isNaN(token)) {
      output.push(token)
    } else if (token === '(') {
      stack.push(token)
    } else if (token === ')') {
      while (stack.length && stack.at(-1) !== '(') {
        output.push(stack.pop())
      }
      stack.pop()
    } else {
      while (stack.length && precedence[stack.at(-1)] >= precedence[token]) {
        output.push(stack.pop())
      }
      stack.push(token)
    }
  })

  return output.concat(stack.reverse())
}

function evaluatePostfix(postfix) {
  const stack = []

  postfix.forEach((token) => {
    if (!isNaN(token)) {
      stack.push(parseFloat(token))
    } else {
      const b = stack.pop()
      const a = stack.pop()
      switch (token) {
        case '+':
          stack.push(a + b)
          break
        case '-':
          stack.push(a - b)
          break
        case '*':
          stack.push(a * b)
          break
        case '/':
          stack.push(a / b)
          break
        case '%':
          stack.push(a % b)
          break
      }
    }
  })

  return stack[0]
}

export function calculate(expression) {
  const tokens = tokenize(expression)
  const postfix = toPostfix(tokens)
  return evaluatePostfix(postfix)
}
