/**
 * 工厂函数类型
 */
export type FactoryFn<T> = (overrides?: Partial<T>) => T;

/**
 * 创建数据工厂
 * @template T 数据类型
 * @param defaultData 默认数据生成函数
 * @returns 工厂函数
 * 
 * @example
 * ```ts
 * const deviceFactory = createFactory<Device>(() => ({
 *   id: 'device-1',
 *   name: 'Test Device',
 *   status: 'online',
 *   temperature: 25,
 * }));
 * 
 * const device1 = deviceFactory();
 * const device2 = deviceFactory({ name: 'Custom Device', temperature: 30 });
 * ```
 */
export function createFactory<T extends Record<string, any>>(
  defaultData: () => T
): FactoryFn<T> {
  return (overrides?: Partial<T>): T => {
    const data = defaultData();
    return { ...data, ...overrides } as T;
  };
}

/**
 * 创建数组工厂（生成多个实例）
 * @template T 数据类型
 * @param factory 单个数据的工厂函数
 * @param count 生成数量
 * @param overrides 每个实例的可选覆盖，可以是函数
 * @returns 数据数组
 * 
 * @example
 * ```ts
 * const devices = createMany(deviceFactory, 3);
 * const customDevices = createMany(deviceFactory, 3, (index) => ({
 *   id: `device-${index}`,
 * }));
 * ```
 */
export function createMany<T extends Record<string, any>>(
  factory: FactoryFn<T>,
  count: number,
  overrides?: Partial<T> | ((index: number) => Partial<T>)
): T[] {
  return Array.from({ length: count }, (_, index) => {
    const override = typeof overrides === 'function' 
      ? overrides(index) 
      : overrides;
    return factory(override);
  });
}

/**
 * IoT设备数据工厂（预设）
 */
export const deviceFactory = createFactory(() => ({
  id: `device-${Math.random().toString(36).substring(7)}`,
  name: 'Test Device',
  status: 'online' as 'online' | 'offline' | 'error',
  type: 'sensor' as 'sensor' | 'actuator' | 'gateway',
  location: 'Building A - Room 101',
  firmwareVersion: '1.0.0',
  lastSeen: new Date().toISOString(),
  metadata: {} as Record<string, any>,
}));

/**
 * 传感器数据工厂（预设）
 */
export const sensorDataFactory = createFactory(() => ({
  deviceId: `device-${Math.random().toString(36).substring(7)}`,
  timestamp: new Date().toISOString(),
  temperature: 25 + Math.random() * 10,
  humidity: 50 + Math.random() * 20,
  pressure: 1013.25 + Math.random() * 10,
  value: Math.random() * 100,
}));

/**
 * 用户数据工厂（预设）
 */
export const userFactory = createFactory(() => ({
  id: `user-${Math.random().toString(36).substring(7)}`,
  name: 'Test User',
  email: `test${Math.random().toString(36).substring(7)}@example.com`,
  role: 'user' as 'user' | 'admin' | 'viewer',
  createdAt: new Date().toISOString(),
}));
