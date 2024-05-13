import dayjs from "dayjs";

import { MediaResolutionTypes } from "@/domains/source/constants";
import { StorageCore } from "@/domains/storage";
import { AuthCodeStep } from "@/constants/index";

const DEFAULT_CACHE_VALUES = {
  user: {
    id: "",
    username: "anonymous",
    email: "",
    avatar: "",
    token: "",
  },
  qrcode: {
    step: AuthCodeStep.Pending,
    text: "",
  },
  player_settings: {
    rate: 1,
    volume: 0.5,
    type: MediaResolutionTypes.SD,
  },
  tv_search: {
    language: [] as string[],
  },
  movie_search: {
    language: [] as string[],
  },
  media_search_histories: [] as {
    text: string;
    sort: number;
  }[],
  dialog_flags: {} as Record<string, { show_at: number }>,
};
const key = "m_global";
const e = globalThis.localStorage.getItem(key);
export const storage = new StorageCore<typeof DEFAULT_CACHE_VALUES>({
  key,
  defaultValues: DEFAULT_CACHE_VALUES,
  values: (() => {
    const prev = JSON.parse(e || "{}");
    if (prev.media_search_histories && prev.media_search_histories.length) {
      const first = prev.media_search_histories[0];
      if (typeof first === "string") {
        // 240324-搜索关键字增加时间字段用于排序
        const flag = dayjs("2024/03/20").valueOf();
        prev.media_search_histories = prev.media_search_histories.map((keyword: string, index: number) => {
          return {
            text: keyword,
            sort: flag + index,
          };
        });
      }
    }
    const histories = prev.media_search_histories
      ? prev.media_search_histories.sort((a: { sort: number }, b: { sort: number }) => b.sort - a.sort)
      : [];
    return {
      ...prev,
      media_search_histories: histories,
    };
  })(),
  client: globalThis.localStorage,
});
