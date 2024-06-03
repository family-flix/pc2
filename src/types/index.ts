import { BizError } from "@/domains/error";
import { Resp, Result } from "@/domains/result/index";

export type UnpackedResult<T> = NonNullable<T extends Resp<infer U> ? (U extends null ? U : U) : T>;
export type Unpacked<T> = T extends (infer U)[]
  ? U
  : T extends (...args: any[]) => infer U
  ? U
  : T extends Promise<infer U>
  ? U
  : T extends Result<infer U>
  ? U
  : T;

/**
 * @example
 * type Shape = MutableRecord<{
 *   [ShapeType.Square]: Square;
 *   [ShapeType.Circle]: Circle;
 * }>;
 * const shape = {
 *   type: ShapeType.Square,
 *   data: {
 *     // 允许出现 size 而不允许出现 radius
 *   }
 * };
 */
export type MutableRecord<U> = {
  [SubType in keyof U]: {
    type: SubType;
    data: U[SubType];
  };
}[keyof U];
export type MutableRecord2<U> = {
  [SubType in keyof U]: {
    type: SubType;
  } & U[SubType];
}[keyof U];

export type RequestedResource<T extends (...args: any[]) => any> = UnpackedResult<Unpacked<ReturnType<T>>>;

export type Rect = {
  width: number;
  height: number;
  x: number;
  y: number;
  // scrollHeight: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export interface JSONArray extends Array<JSONValue> {}
export type JSONValue = string | number | boolean | JSONObject | JSONArray | null;
export type JSONObject = { [Key in string]?: JSONValue };
