# Utilities

Các utility functions chung cho toàn bộ ứng dụng.

## Retry Utilities

### retryWithBackoff

Retry một async operation với exponential backoff.

```javascript
import { retryWithBackoff } from '../utils/retry.js';

// Sử dụng cơ bản
const result = await retryWithBackoff(async () => {
  return await someAsyncOperation();
});

// Sử dụng với options
const result = await retryWithBackoff(async () => {
  return await someAsyncOperation();
}, {
  maxRetries: 5,
  baseDelay: 2000,
  onRetry: (attempt, error, delay) => {
    console.log(`Retry attempt ${attempt} after ${delay}ms`);
  },
  logProgress: false
});
```

### retryWithCondition

Retry với điều kiện tùy chỉnh.

```javascript
import { retryWithCondition } from '../utils/retry.js';

const result = await retryWithCondition(
  async () => await someAsyncOperation(),
  (error, attempt) => {
    // Chỉ retry nếu là lỗi network
    return error.code === 'NETWORK_ERROR' && attempt < 3;
  }
);
```

### retryWithLinearBackoff

Retry với linear backoff (delay cố định).

```javascript
import { retryWithLinearBackoff } from '../utils/retry.js';

const result = await retryWithLinearBackoff(async () => {
  return await someAsyncOperation();
}, {
  maxRetries: 3,
  delay: 1000
});
```

## Options

Tất cả các retry functions đều hỗ trợ các options sau:

- `maxRetries` (number): Số lần retry tối đa (default: 3)
- `baseDelay` (number): Delay cơ bản tính bằng ms (default: 1000)
- `onRetry` (function): Callback được gọi trước mỗi lần retry
- `logProgress` (boolean): Có log progress hay không (default: true) 