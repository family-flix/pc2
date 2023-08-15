/**
 * @doc https://www.iso.org/standard/63545.html
 */
export enum MediaSource {
  US = "US", // 美国 (United States)
  CN = "CN", // 中国 (China)
  TW = "TW", // 中国台湾 (Taiwan)
  HK = "HK", // 中国香港 (Hong Kong)
  JP = "JP", // 日本 (Japan)
  DE = "DE", // 德国 (Germany)
  GB = "GB", // 英国 (United Kingdom)
  FR = "FR", // 法国 (France)
  IT = "IT", // 意大利 (Italy)
  BR = "BR", // 巴西 (Brazil)
  CA = "CA", // 加拿大 (Canada)
  AU = "AU", // 澳大利亚 (Australia)
  IN = "IN", // 印度 (India)
  RU = "RU", // 俄罗斯 (Russia)
  KR = "KR", // 韩国 (South Korea)
  BE = "BE", // 比利时
  ES = "ES", // 西班牙 (Spain)
  MX = "MX", // 墨西哥 (Mexico)
  ID = "ID", // 印度尼西亚 (Indonesia)
  TR = "TR", // 土耳其 (Turkey)
  SA = "SA", // 沙特阿拉伯 (Saudi Arabia)
  ZA = "ZA", // 南非 (South Africa)
  AR = "AR", // 阿根廷 (Argentina)
  TH = "TH", // 泰国 (Thailand)
  EG = "EG", // 埃及 (Egypt)
  NL = "NL", // 荷兰 (Netherlands)
  CH = "CH", // 瑞士 (Switzerland)
  SE = "SE", // 瑞典 (Sweden)
  PL = "PL", // 波兰 (Poland)
  PK = "PK", // 巴基斯坦 (Pakistan)
  NG = "NG", // 尼日利亚 (Nigeria)
  MY = "MY", // 马来西亚 (Malaysia)
  BD = "BD", // 孟加拉国 (Bangladesh)
}

export const TVSourceTexts: Record<MediaSource, string> = {
  [MediaSource.CN]: "国产剧",
  [MediaSource.TW]: "台剧",
  [MediaSource.HK]: "港剧",
  [MediaSource.JP]: "日剧",
  [MediaSource.KR]: "韩剧",
  [MediaSource.US]: "美剧",
  [MediaSource.GB]: "英剧",
  [MediaSource.FR]: "法国",
  [MediaSource.IT]: "意大利",
  [MediaSource.BR]: "巴西",
  [MediaSource.BE]: "比利时",
  [MediaSource.DE]: "德国",
  [MediaSource.CA]: "加拿大",
  [MediaSource.AU]: "澳大利亚",
  [MediaSource.IN]: "印度",
  [MediaSource.RU]: "俄罗斯",
  [MediaSource.ES]: "西班牙",
  [MediaSource.MX]: "墨西哥",
  [MediaSource.ID]: "印度尼西亚",
  [MediaSource.TR]: "土耳其",
  [MediaSource.SA]: "沙特阿拉伯",
  [MediaSource.ZA]: "南非",
  [MediaSource.AR]: "阿根廷",
  [MediaSource.TH]: "泰国",
  [MediaSource.EG]: "埃及",
  [MediaSource.NL]: "荷兰",
  [MediaSource.CH]: "瑞士",
  [MediaSource.SE]: "瑞典",
  [MediaSource.PL]: "波兰",
  [MediaSource.PK]: "巴基斯坦",
  [MediaSource.NG]: "尼日利亚",
  [MediaSource.MY]: "马来西亚",
  [MediaSource.BD]: "孟加拉国",
};
export const TVSourceOptions = Object.keys(TVSourceTexts)
  .slice(0, 7)
  .map((value) => {
    return {
      value,
      label: TVSourceTexts[value as MediaSource],
    };
  });
export const TVGenres = [
  "动作冒险",
  "动画",
  "喜剧",
  "犯罪",
  "纪录",
  "剧情",
  "家庭",
  "儿童",
  "悬疑",
  "新闻",
  "真人秀",
  "Sci-Fi & Fantasy",
  "肥皂剧",
  "脱口秀",
  "War & Politics",
  "西部",
];
export const TVGenresTexts: Record<string, string> = TVGenres.map((text) => {
  return {
    [text]: (() => {
      if (text === "Sci-Fi & Fantasy") {
        return "奇幻";
      }
      if (text === "War & Politics") {
        return "战争/政治";
      }
      return text;
    })(),
  };
}).reduce((r, c) => {
  return {
    ...r,
    ...c,
  };
}, {});
export const TVGenresOptions = TVGenres.map((text) => {
  return {
    label: TVGenresTexts[text],
    value: text,
  };
});

export const MovieSourceTexts: Record<MediaSource, string> = {
  [MediaSource.CN]: "中国大陆",
  [MediaSource.TW]: "中国台湾",
  [MediaSource.HK]: "中国香港",
  [MediaSource.JP]: "日本",
  [MediaSource.KR]: "韩国",
  [MediaSource.US]: "美国",
  [MediaSource.GB]: "英国",
  [MediaSource.FR]: "法国",
  [MediaSource.IT]: "意大利",
  [MediaSource.BR]: "巴西",
  [MediaSource.DE]: "德国",
  [MediaSource.CA]: "加拿大",
  [MediaSource.AU]: "澳大利亚",
  [MediaSource.IN]: "印度",
  [MediaSource.RU]: "俄罗斯",
  [MediaSource.BE]: "比利时",
  [MediaSource.ES]: "西班牙",
  [MediaSource.MX]: "墨西哥",
  [MediaSource.ID]: "印度尼西亚",
  [MediaSource.TR]: "土耳其",
  [MediaSource.SA]: "沙特阿拉伯",
  [MediaSource.ZA]: "南非",
  [MediaSource.AR]: "阿根廷",
  [MediaSource.TH]: "泰国",
  [MediaSource.EG]: "埃及",
  [MediaSource.NL]: "荷兰",
  [MediaSource.CH]: "瑞士",
  [MediaSource.SE]: "瑞典",
  [MediaSource.PL]: "波兰",
  [MediaSource.PK]: "巴基斯坦",
  [MediaSource.NG]: "尼日利亚",
  [MediaSource.MY]: "马来西亚",
  [MediaSource.BD]: "孟加拉国",
};
export const MovieSourceOptions = Object.keys(MovieSourceTexts)
  .slice(0, 7)
  .map((value) => {
    return {
      value,
      label: MovieSourceTexts[value as MediaSource],
    };
  });
export const MovieGenres = [
  "动作",
  "冒险",
  "动画",
  "喜剧",
  "犯罪",
  "纪录",
  "剧情",
  "家庭",
  "奇幻",
  "历史",
  "恐怖",
  "音乐",
  "悬疑",
  "爱情",
  "科幻",
  "电视电影",
  "惊悚",
  "战争",
  "西部",
];
export const MovieGenresTexts: Record<string, string> = TVGenres.map((text) => {
  return {
    [text]: text,
  };
}).reduce((t, c) => {
  return {
    ...t,
    ...c,
  };
}, {});
export const MovieGenresOptions = MovieGenres.map((text) => {
  return {
    label: text,
    value: text,
  };
});

export enum ReportTypes {
  /** 电视剧问题 */
  TV,
  /** 电影问题 */
  Movie,
  /** 问题与建议 */
  Question,
  /** 想看什么剧 */
  Want,
}
export const TVReportList = ["信息错误", "无法播放", "重复", "缺少字幕", "集/季数不全"];
export const MovieReportList = ["信息错误", "无法播放", "重复", "缺少字幕"];
export const CommonReportList = [""];
