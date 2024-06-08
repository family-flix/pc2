import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import relative_time from "dayjs/plugin/relativeTime";
import { twMerge } from "tailwind-merge";

import { JSONObject } from "@/types/index";

import { cn as nzhcn } from "./nzh";

dayjs.extend(relative_time);
dayjs.locale("zh-cn");

export function cn(...inputs: any[]) {
  // return twMerge(clsx(inputs));
  return twMerge(inputs);
}

export function padding_zero(str: number | string, options: { count: number; pos: number } = { count: 2, pos: 1 }) {
  const { count, pos } = options;
  if (String(str).length < count) {
    const num = count - String(str).length;
    if (pos === 1) {
      return `${"0".repeat(num)}${str}`;
    }
    if (pos === 2) {
      return `${str}${"0".repeat(num)}`;
    }
  }
  return String(str);
}
export function remove_str(filename: string, index: number = 0, length: number) {
  return filename.slice(0, index) + filename.slice(index + length);
}

export function episode_to_chinese_num(str: string | number) {
  if (typeof str === "number") {
    return `第${str}集`;
  }
  if (str.match(/^[0-9]/)) {
    return str;
  }
  const regex = /(\d+)/g;
  let s = str.replace(/[eE]/g, "");
  const matches = s.match(regex);
  if (!matches) {
    return str;
  }
  for (let i = 0; i < matches.length; i++) {
    const num = parseInt(matches[i], 10);
    const chinese_num = num_to_chinese(num);
    s = s.replace(matches[i], `第${chinese_num}集`);
  }
  return s;
}
export function season_to_chinese_num(str: string) {
  const num = str.match(/[0-9]{1,}/);
  if (!num) {
    return str;
  }
  const value = parseInt(num[0]);
  const chinese_num = num_to_chinese(value);
  const correct = chinese_num.match(/^一(十.{0,1})/);
  if (correct) {
    return `第${correct[1]}季`;
  }
  return `第${chinese_num}季`;
}
/**
 * 阿拉伯数字转中文数字
 * @param num
 * @returns
 */
export function num_to_chinese(num: number) {
  return nzhcn.encodeS(num);
}
export function chinese_num_to_num(str: string) {
  return nzhcn.decodeS(str);
}

export function update<T>(arr: T[], index: number, nextItem: T) {
  if (index === -1) {
    return [...arr];
  }
  return [...arr.slice(0, index), nextItem, ...arr.slice(index + 1)];
}

export function query_stringify(query: JSONObject) {
  return Object.keys(query)
    .filter((key) => {
      return query[key] !== undefined;
    })
    .map((key) => {
      // @ts-ignore
      return `${key}=${encodeURIComponent(query[key]!)}`;
    })
    .join("&");
}

const defaultRandomAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/**
 * 返回一个指定长度的随机字符串
 * @param length
 * @returns
 */
export function random_string(length: number) {
  return random_string_with_alphabet(length, defaultRandomAlphabet);
}
function random_string_with_alphabet(length: number, alphabet: string) {
  let b = new Array(length);
  let max = alphabet.length;
  for (let i = 0; i < b.length; i++) {
    let n = Math.floor(Math.random() * max);
    b[i] = alphabet[n];
  }
  return b.join("");
}

export function bytes_to_size(bytes: number) {
  if (bytes === 0) {
    return "0KB";
  }
  const symbols = ["bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  let exp = Math.floor(Math.log(bytes) / Math.log(1024));
  if (exp < 1) return bytes + " " + symbols[0];
  bytes = Number((bytes / Math.pow(1024, exp)).toFixed(2));
  const size = bytes;
  const unit = symbols[exp];
  if (Number.isInteger(size)) {
    return `${size}${unit}`;
  }
  function remove_zero(num: number | string) {
    let result = Number(num);
    if (String(num).indexOf(".") > -1) {
      result = parseFloat(num.toString().replace(/0+?$/g, ""));
    }
    return result;
  }
  return `${remove_zero(size.toFixed(2))}${unit}`;
}

/**
 * 秒数转时分秒
 * @param value
 * @returns
 */
export function seconds_to_hour(value: number) {
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value - hours * 3600) / 60);
  const seconds = Math.floor(value - hours * 3600 - minutes * 60);
  if (hours > 0) {
    return hours + ":" + padding_zero(minutes) + ":" + padding_zero(seconds);
  }
  return padding_zero(minutes) + ":" + padding_zero(seconds);
}
export function minute_to_hour(value: number) {
  const hours = Math.floor(value / 60);
  const minutes = Math.floor(value - hours * 60);
  if (hours > 0) {
    return [hours, minutes];
  }
  return [null, minutes];
}
export function minute_to_hour2(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(remainingMinutes).padStart(2, "0");
  return `${formattedHours}:${formattedMinutes}`;
}
export function relative_time_from_now(time: string) {
  const date = dayjs(time);
  const now = dayjs();
  const minute_diff = now.diff(date, "minute");
  let relativeTimeString;
  if (minute_diff >= 7 * 24 * 60) {
    relativeTimeString = "7天前";
  } else if (minute_diff >= 24 * 60) {
    relativeTimeString = now.diff(date, "day") + "天前"; // 显示天数级别的时间差
  } else if (minute_diff >= 60) {
    relativeTimeString = now.diff(date, "hour") + "小时前"; // 显示小时级别的时间差
  } else if (minute_diff > 0) {
    relativeTimeString = minute_diff + "分钟前"; // 显示分钟级别的时间差
  } else {
    relativeTimeString = "刚刚"; // 不到1分钟，显示“刚刚”
  }
  return relativeTimeString;
}

export function noop() {}
export function promise_noop() {
  return Promise.resolve();
}

/**
 * 延迟指定时间
 * @param delay 要延迟的时间，单位毫秒
 * @returns
 */
export function sleep(delay: number = 1000) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, delay);
  });
}
