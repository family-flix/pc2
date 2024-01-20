import dayjs from "dayjs";

import { FetchParams } from "@/domains/list/typing";
import { SubtitleFileResp } from "@/domains/subtitle/types";
import { MediaResolutionTypes, MediaResolutionTypeTexts } from "@/domains/source/constants";
import { ListResponse, ListResponseWithCursor, RequestedResource, Result, Unpacked, UnpackedResult } from "@/types";
import { request } from "@/utils/request";
import { MediaTypes, MediaOriginCountry, SeasonGenresTexts, SeasonMediaOriginCountryTexts } from "@/constants";
import { episode_to_chinese_num, minute_to_hour2, relative_time_from_now } from "@/utils";

/**
 * 获取季列表
 */
export async function fetchSeasonList(params: FetchParams & { name: string }) {
  const { page, pageSize, ...rest } = params;
  const resp = await request.post<
    ListResponse<{
      id: string;
      type: MediaTypes;
      name: string;
      poster_path: string;
      overview: string;
      season_number: string;
      air_date: string;
      genres: {
        value: number;
        label: string;
      }[];
      origin_country: string[];
      vote_average: number;
      episode_count: string;
      cur_episode_count: string;
      actors: {
        id: string;
        name: string;
      }[];
    }>
  >("/api/v2/wechat/season/list", {
    ...rest,
    page,
    page_size: pageSize,
  });
  if (resp.error) {
    return Result.Err(resp.error);
  }
  return Result.Ok({
    ...resp.data,
    list: resp.data.list.map((season) => {
      const {
        id,
        type,
        name,
        overview,
        poster_path,
        vote_average,
        air_date,
        genres,
        origin_country,
        episode_count,
        cur_episode_count,
        actors = [],
      } = season;
      return {
        id,
        type,
        name,
        // season_text: season_to_chinese_num(season_text),
        air_date: dayjs(air_date).year(),
        episode_count,
        cur_episode_count,
        episode_count_text: (() => {
          if (!episode_count) {
            return null;
          }
          if (cur_episode_count === episode_count) {
            return `全${episode_count}集`;
          }
          return `更新至${cur_episode_count}集`;
        })(),
        overview,
        poster_path,
        vote: (() => {
          if (!vote_average) {
            return "N/A";
          }
          return vote_average.toFixed(1);
        })(),
        origin_country: origin_country
          .map((country) => {
            return SeasonMediaOriginCountryTexts[country as MediaOriginCountry];
          })
          .filter(Boolean),
        genres: genres
          .map((g) => {
            return SeasonGenresTexts[g.label];
          })
          .filter(Boolean),
        actors: actors.map((actor) => actor.name).join(" / "),
      };
    }),
  });
}
export type SeasonItem = RequestedResource<typeof fetchSeasonList>["list"][0];

type MediaSourceProfileRes = {
  id: string;
  file_name: string;
  parent_paths: string;
  drive: {
    id: string;
    name: string;
    avatar: string;
  };
};
type CurSeasonEpisodeResp = {
  id: string;
  media_id: string;
  name: string;
  overview: string;
  order: number;
  air_date: string;
  runtime: number;
  still_path: string;
  current_time: number;
  cur_source_file_id: string;
  thumbnail_path: string;
};
type SeasonEpisodeResp = {
  id: string;
  media_id: string;
  name: string;
  overview: string;
  order: number;
  air_date: string;
  runtime: number;
  still_path: string;
  sources: {
    id: string;
    file_name: string;
    parent_paths: string;
  }[];
};
type SeasonAndCurEpisodeResp = {
  id: string;
  name: string;
  overview: string;
  poster_path: string;
  air_date: string;
  genres: string;
  origin_country: string;
  cur_source: CurSeasonEpisodeResp;
  sources: SeasonEpisodeResp[];
  source_count: number;
  vote_average: number;
  source_groups: {
    start: number;
    end: number;
  }[];
};
/**
 * 获取电视剧及当前播放的剧集详情
 * @param body
 */
export async function fetchSeasonPlayingEpisode(body: { media_id: string; type: MediaTypes }) {
  // console.log("[]fetch_tv_profile params", params);
  const r = await request.post<SeasonAndCurEpisodeResp>(`/api/v2/wechat/media/playing`, {
    media_id: body.media_id,
    type: body.type,
  });
  if (r.error) {
    return Result.Err(r.error);
  }
  const {
    id,
    name,
    overview,
    poster_path,
    genres,
    origin_country,
    source_count,
    cur_source,
    sources,
    vote_average,
    source_groups,
  } = r.data;
  const episodes = sources.map(normalizeEpisode);
  const sourceGroups = (() => {
    return source_groups.map((group) => {
      const { start, end } = group;
      const cur = cur_source.order >= start && cur_source.order <= end;
      return {
        text: start === end ? start : `${start}-${end}`,
        cur,
        media_id: body.media_id,
        start,
        end,
        list: cur ? episodes : [],
      };
    });
  })();
  const curMediaSource = episodes.find((episode) => episode.id === cur_source.id);
  // const curMediaSource = (() => {
  // const matched = sourceGroups.find((group) => group.cur);
  // if (matched) {
  //   const matchedEpisode = matched.list.find((episode) => episode.id === cur_source.id);
  //   if (matchedEpisode) {
  //     return matchedEpisode;
  //   }
  //   return matched.list[0];
  // }
  // const matchedEpisode = sourceGroups[0].list.find((episode) => episode.id === cur_source.id);
  // if (matchedEpisode) {
  //   return matchedEpisode;
  // }
  // return sourceGroups[0].list[0];
  // })();
  const curSource = (() => {
    if (curMediaSource) {
      return {
        ...curMediaSource,
        ...normalizeCurEpisode(cur_source),
      };
    }
    const first = episodes[0];
    if (!first) {
      return null;
    }
    return {
      ...first,
      ...normalizeCurEpisode({
        ...first,
        current_time: 0,
        thumbnail_path: "",
        cur_source_file_id: first.files[0]?.id,
      }),
    };
  })();
  return Result.Ok({
    id,
    name,
    overview,
    posterPath: poster_path,
    genres,
    originCountry: origin_country,
    voteAverage: vote_average,
    sourceCount: source_count,
    sourceGroups,
    curSource,
  });
}
function normalizeEpisode(episode: SeasonAndCurEpisodeResp["sources"][number]) {
  const {
    id,
    name,
    overview,
    air_date,
    // cur,
    order,
    media_id: season_id,
    still_path,
    runtime,
    // current_time,
    sources,
  } = episode;
  return {
    id,
    name: (() => {
      const r = /^第[0-9一二三四五六七八九十]{1,}[集期章]/;
      if (name.match(r)) {
        return name.replace(r, "");
      }
      return name;
    })(),
    overview,
    seasonId: season_id,
    // currentTime: current_time ?? null,
    // cur,
    order,
    airDae: air_date,
    runtime: (() => {
      if (!runtime) {
        return null;
      }
      return minute_to_hour2(runtime);
    })(),
    stillPath: still_path,
    files: sources,
    subtitles: [] as SubtitleFileResp[],
  };
}
function normalizeCurEpisode(episode: {
  id: string;
  current_time: number;
  thumbnail_path: string;
  cur_source_file_id: string;
}) {
  const { id, current_time, thumbnail_path, cur_source_file_id } = episode;
  return {
    id,
    currentTime: current_time,
    thumbnailPath: thumbnail_path,
    curSourceFileId: cur_source_file_id,
  };
}
/** 电视剧详情 */
export type MediaAndCurSource = UnpackedResult<Unpacked<ReturnType<typeof fetchSeasonPlayingEpisode>>>;
export type SeasonProfile = UnpackedResult<Unpacked<ReturnType<typeof fetchSeasonPlayingEpisode>>>;
export type SeasonEpisodeGroup = UnpackedResult<
  Unpacked<ReturnType<typeof fetchSeasonPlayingEpisode>>
>["sourceGroups"][number];
export type MediaSource = SeasonEpisodeGroup["list"][number];
export type CurMediaSource = NonNullable<
  UnpackedResult<Unpacked<ReturnType<typeof fetchSeasonPlayingEpisode>>>["curSource"]
>;
export async function fetchSourceInGroup(body: { media_id: string; start: number; end: number }) {
  const r = await request.post<{
    list: SeasonEpisodeResp[];
  }>("/api/v2/wechat/media/episode", {
    media_id: body.media_id,
    start: body.start,
    end: body.end,
  });
  if (r.error) {
    return Result.Err(r.error.message);
  }
  return Result.Ok(
    r.data.list.map((episode) => {
      return normalizeEpisode(episode);
    })
  );
}

/**
 * 获取视频源播放信息
 */
export async function fetchSourcePlayingInfo(body: { id: string; type: MediaResolutionTypes }) {
  const res = await request.post<{
    id: string;
    /** 缩略图 */
    thumbnail_path: string;
    /** 视频分辨率 */
    type: MediaResolutionTypes;
    /** 视频播放地址 */
    url: string;
    /** 视频宽度 */
    width: number;
    /** 视频高度 */
    height: number;
    /** 该视频其他分辨率 */
    other: {
      cur: boolean;
      /** 影片分辨率 */
      type: MediaResolutionTypes;
      /** 影片播放地址 */
      url: string;
      /** 影片宽度 */
      width: number;
      /** 影片高度 */
      height: number;
    }[];
    subtitles: SubtitleFileResp[];
  }>("/api/v2/wechat/source", {
    id: body.id,
  });
  if (res.error) {
    return Result.Err(res.error);
  }
  const { id, url, width, height, thumbnail_path, type, other, subtitles } = res.data;
  return Result.Ok({
    id,
    url,
    type,
    typeText: MediaResolutionTypeTexts[type],
    width,
    height,
    thumbnailPath: thumbnail_path,
    resolutions: other.map((t) => {
      const { cur, url, width, height, type } = t;
      return {
        cur,
        url,
        type,
        typeText: MediaResolutionTypeTexts[t.type],
        width,
        height,
      };
    }),
    subtitles,
  });
}
export type MediaSourceFile = UnpackedResult<Unpacked<ReturnType<typeof fetchSourcePlayingInfo>>>;

/**
 * 更新播放记录
 */
export async function updatePlayHistory(body: {
  media_id: string;
  media_source_id: string;
  /** 视频当前时间 */
  current_time: number;
  duration?: number;
  /** 视频源 */
  source_id: string;
}) {
  const { media_id, media_source_id, current_time, duration, source_id } = body;
  return request.post<null>("/api/v2/wechat/history/update", {
    media_id,
    media_source_id,
    current_time,
    duration,
    source_id,
  });
}

/**
 * 获取当前用户影片播放记录
 * @param params
 * @returns
 */
export async function fetchPlayingHistories(params: FetchParams) {
  const { page, pageSize, ...rest } = params;
  const r = await request.post<
    ListResponseWithCursor<{
      id: string;
      type: MediaTypes;
      /** 电视剧名称 */
      name: string;
      /** 电视剧海报地址 */
      poster_path: string;
      media_id: string;
      thumbnail_path: string;
      /** 该剧集当前季总集数 */
      episode_count: number;
      /** 当前集数 */
      cur_episode_number: number;
      cur_episode_count: number;
      /** 播放记录当前集进度 */
      current_time: number;
      /** 该集总时长 */
      duration: number;
      /** 播放记录更新时间 */
      updated: string;
      /** 首播日期 */
      air_date: string;
      /** 看过后是否有更新 */
      has_update: number;
    }>
  >("/api/v2/wechat/history/list", {
    ...rest,
    page,
    page_size: pageSize,
  });
  if (r.error) {
    return r;
  }
  const { list, total, page_size, next_marker } = r.data;
  return Result.Ok({
    page,
    page_size,
    total,
    next_marker,
    list: list.map((history) => {
      const {
        id,
        type,
        media_id,
        name,
        poster_path,
        has_update,
        episode_count,
        cur_episode_number,
        cur_episode_count,
        thumbnail_path,
        duration,
        current_time,
        air_date,
        updated,
      } = history;
      return {
        id,
        type,
        media_id,
        name,
        posterPath: poster_path,
        episodeCountText: (() => {
          if (type === MediaTypes.Movie) {
            return null;
          }
          if (!episode_count) {
            return null;
          }
          if (cur_episode_count === episode_count) {
            return `全${episode_count}集`;
          }
          return `更新至${cur_episode_count}集`;
        })(),
        episodeText: type === MediaTypes.Movie ? null : episode_to_chinese_num(String(cur_episode_number)),
        hasUpdate: !!has_update,
        airDate: air_date,
        currentTime: current_time,
        percent: current_time === 0 || duration === 0 ? 0 : parseFloat(((current_time / duration) * 100).toFixed(0)),
        updated: relative_time_from_now(updated),
        thumbnail_path,
      };
    }),
  });
}
export type PlayHistoryItem = RequestedResource<typeof fetchPlayingHistories>["list"][0];

export function delete_history(body: { history_id: string }) {
  return request.post(`/api/v2/wechat/history/delete`, {
    history_id: body.history_id,
  });
}

export async function fetchMediaSeries(body: { media_id: string }) {
  const r = await request.post<
    ListResponseWithCursor<{
      id: string;
      name: string;
      poster_path: string;
    }>
  >("/api/v2/wechat/media/series", {
    media_id: body.media_id,
  });
  return r;
}
