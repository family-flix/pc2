import { Component } from "vue";
// import { Response } from "@list-helper/core/typing";

import { Application } from "@/domains/app";
// import { BottomMenuCore } from "@/domains/bottom_menu";
import { BizError } from "@/domains/error";
import { NavigatorCore } from "@/domains/navigator";
import { RouteViewCore } from "@/domains/route_view";

export type Resp<T> = {
  data: T extends null ? null : T;
  error: T extends null ? BizError : null;
};
export type Result<T> = Resp<T> | Resp<null>;
export type UnpackedResult<T> = NonNullable<T extends Resp<infer U> ? (U extends null ? U : U) : T>;
/** 构造一个结果对象 */
export const Result = {
  /** 构造成功结果 */
  Ok: <T>(value: T) => {
    const result = {
      data: value,
      error: null,
    } as Result<T>;
    return result;
  },
  /** 构造失败结果 */
  Err: <T>(message: string | BizError | Error | Result<null>, code?: string | number, data: unknown = null) => {
    const result = {
      data,
      code,
      error: (() => {
        if (typeof message === "string") {
          const e = new BizError(message, code, data);
          return e;
        }
        if (message instanceof BizError) {
          return message;
        }
        if (typeof message === "object") {
          const e = new BizError((message as Error).message, code, data);
          return e;
        }
        const r = message as Result<null>;
        return r.error;
      })(),
    } as Result<null>;
    return result;
  },
};

export type Unpacked<T> = T extends (infer U)[]
  ? U
  : T extends (...args: any[]) => infer U
  ? U
  : T extends Promise<infer U>
  ? U
  : T extends Result<infer U>
  ? U
  : T;

export type BaseApiResp<T> = {
  code: number;
  msg: string;
  data: T;
};

export type ListResponse<T> = {
  total: number;
  page: number;
  page_size: number;
  no_more: boolean;
  list: T[];
};
export type ListResponseWithCursor<T> = {
  page_size: number;
  total: number;
  next_marker?: string;
  list: T[];
};

export type RequestedResource<T extends (...args: any[]) => any> = UnpackedResult<Unpacked<ReturnType<T>>>;

export type ViewComponent = (props: ViewComponentProps) => Component | null;
export type ViewComponentProps = {
  app: Application;
  router: NavigatorCore;
  view: RouteViewCore;
};

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
