import React from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { vi } from "vitest";

/**
 * 测试Provider的类型
 */
export type TestProvider<T = {}> = React.ComponentType<{ children: React.ReactNode } & T>;

/**
 * 创建测试Wrapper组件
 * @param providers Provider组件数组
 * @returns Wrapper组件
 * 
 * @example
 * ```ts
 * const Wrapper = createWrapper([ThemeProvider, QueryClientProvider]);
 * const { container } = render(<MyComponent />, { wrapper: Wrapper });
 * ```
 */
export function createWrapper(
  providers: TestProvider[] = []
): React.ComponentType<{ children: React.ReactNode }> {
  return ({ children }) => {
    return providers.reduceRight(
      (acc, Provider) => React.createElement(Provider, {}, acc),
      React.createElement(React.Fragment, {}, children)
    );
  };
}

/**
 * 带Provider渲染组件
 * @param ui 要渲染的React元素
 * @param options 渲染选项
 * @returns 渲染结果和工具函数
 * 
 * @example
 * ```ts
 * const { container, getByText } = renderWithProviders(
 *   <MyComponent />,
 *   {
 *     providers: [ThemeProvider],
 *   }
 * );
 * ```
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options: Omit<RenderOptions, 'wrapper'> & {
    providers?: TestProvider[];
    wrapper?: React.ComponentType<{ children: React.ReactNode }>;
  } = {}
) {
  const { providers = [], wrapper, ...renderOptions } = options;
  
  let Wrapper = wrapper;
  if (providers.length > 0) {
    Wrapper = createWrapper(providers);
  }
  
  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Mock React组件
 * @param displayName 组件显示名称
 * @param implementation 可选的实现
 * @returns Mock组件
 * 
 * @example
 * ```ts
 * const MockButton = mockComponent('Button', ({ children }) => (
 *   <button data-testid="mock-button">{children}</button>
 * ));
 * ```
 */
export function mockComponent<P extends Record<string, any>>(
  displayName: string,
  implementation?: React.ComponentType<P>
): React.ComponentType<P> {
  const MockedComponent = (props: P) => {
    if (implementation) {
      return React.createElement(implementation, props);
    }
    return React.createElement('div', { 'data-testid': `mock-${displayName.toLowerCase()}` }, props.children);
  };
  
  MockedComponent.displayName = `Mock${displayName}`;
  return MockedComponent;
}

/**
 * 创建Mock的React Hook
 * @template T Hook返回类型
 * @param mockReturnValue Mock返回值
 * @returns Mock函数
 * 
 * @example
 * ```ts
 * const useMockData = createMockHook(() => ({ data: 'test' }));
 * vi.mock('./hooks', () => ({ useData: useMockData }));
 * ```
 */
export function createMockHook<T extends (...args: any[]) => any>(
  mockReturnValue?: ReturnType<T> | ((...args: Parameters<T>) => ReturnType<T>)
): T {
  const mockFn = vi.fn();
  if (mockReturnValue !== undefined) {
    if (typeof mockReturnValue === 'function') {
      mockFn.mockImplementation(mockReturnValue as any);
    } else {
      mockFn.mockReturnValue(mockReturnValue);
    }
  }
  return mockFn as T;
}

/**
 * 等待元素出现（基于查询函数）
 * @param queryFn 查询函数
 * @param options 选项
 * @returns Promise，解析为找到的元素
 * 
 * @example
 * ```ts
 * const element = await waitForElement(() => getByTestId('my-element'));
 * ```
 */
export async function waitForElement<T>(
  queryFn: () => T,
  options: { timeout?: number; interval?: number } = {}
): Promise<T> {
  const { timeout = 5000, interval = 50 } = options;
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      const element = queryFn();
      if (element) {
        return element;
      }
    } catch {
      // 元素未找到，继续等待
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  
  throw new Error(`Element not found within ${timeout}ms`);
}
