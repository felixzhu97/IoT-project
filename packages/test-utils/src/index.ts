// Mock/Stub工具
export {
  createMockFunction,
  createAsyncMockFunction,
  createErrorMockFunction,
  createMockObject,
  createDeepMockObject,
  spyOnMethod,
} from "./mocks";

// 测试数据生成器
export {
  type FactoryFn,
  createFactory,
  createMany,
  deviceFactory,
  sensorDataFactory,
  userFactory,
} from "./fixtures";

// 断言辅助函数
export {
  expectArrayToContainEqual,
  expectObjectToContain,
  expectToBeInRange,
  expectDateToBeCloseTo,
  expectStringToMatch,
  expectPromiseToReject,
} from "./assertions";

// React组件测试工具
export {
  type TestProvider,
  createWrapper,
  renderWithProviders,
  mockComponent,
  createMockHook,
  waitForElement,
} from "./react";

// 异步测试辅助
export {
  waitFor,
  delay,
  timeout,
  retry,
  settleAll,
} from "./async";
