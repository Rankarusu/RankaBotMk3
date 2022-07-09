/* eslint-disable @typescript-eslint/no-explicit-any */
export interface EventHandler {
  process(...args: any[]): Promise<void>;
}
