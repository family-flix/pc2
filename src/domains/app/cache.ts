import debounce from "lodash/fp/debounce";

const GLOBAL_KEY = "m_global";

export class LocalCache {
  _values: Record<string, unknown> = {};

  constructor() {
    // @todo localStorage 是端相关 API，应该在外部传入
    this._values = JSON.parse(localStorage.getItem(GLOBAL_KEY) || "{}");
    console.log("[DOMAIN]Cache - constructor", this._values);
  }

  get values() {
    return this._values;
  }

  get<T>(key: string, defaultValue?: T) {
    const v = this._values[key];
    if (v === undefined && defaultValue) {
      return defaultValue;
    }
    return v as T;
  }
  set = debounce(100, (key: string, values: unknown) => {
    // console.log("cache set", key, values);
    const nextValues = {
      ...this._values,
      [key]: values,
    };
    this._values = nextValues;
    localStorage.setItem(GLOBAL_KEY, JSON.stringify(this._values));
  }) as (key: string, value: unknown) => void;

  merge = (key: string, values: unknown) => {
    console.log("[]merge", key, values);
    const prevValues = this.get(key) || {};
    if (typeof prevValues === "object" && typeof values === "object") {
      const nextValues = {
        ...prevValues,
        ...values,
      };
      this.set(key, nextValues);
      return nextValues;
    }
    console.warn("the params of merge must be object");
    return prevValues;
  };

  clear<T>(key: string) {
    const v = this._values[key];
    if (v === undefined) {
      return null;
    }
    const nextValues = {
      ...this._values,
    };
    delete nextValues[key];
    this._values = { ...nextValues };
    localStorage.setItem(GLOBAL_KEY, JSON.stringify(this._values));
  }
}
