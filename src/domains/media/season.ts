/**
 * @file 电视剧
 */
import { BaseDomain, Handler } from "@/domains/base";
import { MediaSourceFileCore } from "@/domains/source/index";
import { RequestCore } from "@/domains/request/index";
import { MediaResolutionTypes } from "@/domains/source/constants";
import { HttpClientCore } from "@/domains/http_client/index";
import { Result } from "@/domains/result/index";
import { debounce } from "@/utils/lodash/debounce";
import { MediaTypes } from "@/constants/index";

import {
  MediaSource,
  MediaSourceFile,
  updatePlayHistory,
  fetchMediaPlayingEpisode,
  SeasonEpisodeGroup,
  fetchSourceInGroup,
  CurMediaSource,
  fetchMediaSeries,
  fetchMediaPlayingEpisodeProcess,
  fetchSourceInGroupProcess,
} from "./services";

enum Events {
  /** 电视剧详情加载完成 */
  ProfileLoaded,
  /** 切换播放的剧集 */
  EpisodeChange,
  /** 剧集列表改变 */
  EpisodesChange,
  /** 切换视频文件 */
  SourceFileChange,
  BeforeNextEpisode,
  BeforePrevEpisode,
  BeforeChangeSource,
  StateChange,
}
type TheTypesOfEvents = {
  [Events.ProfileLoaded]: {
    profile: NonNullable<SeasonCoreState["profile"]>;
    curSource: NonNullable<MediaSource> & { currentTime: number };
  };
  [Events.SourceFileChange]: MediaSourceFile & { currentTime: number };
  [Events.EpisodeChange]: MediaSource & {
    currentTime: number;
  };
  [Events.EpisodesChange]: MediaSource[];
  [Events.BeforeNextEpisode]: void;
  [Events.BeforePrevEpisode]: void;
  [Events.BeforeChangeSource]: void;
  [Events.StateChange]: SeasonCoreState;
};
type SeasonCoreState = {
  profile: null | {
    id: string;
    name: string;
    overview: string;
    posterPath: string;
  };
  curSource: null | CurMediaSource;
  groups: SeasonEpisodeGroup[];
  curGroup: null | SeasonEpisodeGroup;
  playing: boolean;
};
type SeasonCoreProps = {
  resolution?: MediaResolutionTypes;
  client: HttpClientCore;
};

export class SeasonMediaCore extends BaseDomain<TheTypesOfEvents> {
  profile: null | {
    id: string;
    name: string;
    overview: string;
    posterPath: string;
  } = null;
  sourceGroups: SeasonEpisodeGroup[] = [];
  /** 当前播放的剧集 */
  curSource: null | CurMediaSource = null;
  curGroup: null | SeasonEpisodeGroup = null;
  /** 当前影片播放进度 */
  currentTime = 0;
  curResolutionType: MediaResolutionTypes = MediaResolutionTypes.SD;
  /** 正在播放中 */
  playing = false;
  /** 正在请求中（获取详情、视频源信息等） */
  private _pending = false;

  $source: MediaSourceFileCore;
  $client: HttpClientCore;
  $update: RequestCore<typeof updatePlayHistory>;

  get state(): SeasonCoreState {
    return {
      playing: this.playing,
      profile: this.profile,
      curSource: this.curSource,
      groups: this.sourceGroups,
      curGroup: this.curGroup,
    };
  }

  constructor(props: Partial<{ name: string }> & SeasonCoreProps) {
    super();

    const { client, resolution = MediaResolutionTypes.SD } = props;
    this.curResolutionType = resolution;
    this.$client = client;
    this.$source = new MediaSourceFileCore({
      resolution,
      client,
    });
    this.$update = new RequestCore(updatePlayHistory, { client });
  }

  async fetchProfile(season_id?: string) {
    if (season_id === undefined) {
      const msg = this.tip({ text: ["缺少季 id 参数"] });
      return Result.Err(msg);
    }
    const fetch = new RequestCore(fetchMediaPlayingEpisode, {
      process: fetchMediaPlayingEpisodeProcess,
      client: this.$client,
    });
    const res = await fetch.run({ media_id: season_id, type: MediaTypes.Season });
    if (res.error) {
      const msg = this.tip({ text: ["获取电视剧详情失败", res.error.message] });
      return Result.Err(msg);
    }
    const { id, name, overview, sourceCount, posterPath, curSource, sourceGroups } = res.data;
    // console.log("[DOMAIN]media/season - fetchProfile result", curSource);
    if (curSource === null) {
      const msg = this.tip({ text: ["该电视剧尚未收录影片"] });
      return Result.Err(msg);
    }
    this.profile = {
      id,
      name,
      overview,
      posterPath,
    };
    // this.fetchSeries(id);
    this.sourceGroups = sourceGroups;
    this.curGroup = sourceGroups.find((group) => group.cur) ?? null;
    this.emit(Events.ProfileLoaded, { profile: this.profile, curSource });
    this.emit(Events.StateChange, { ...this.state });
    return Result.Ok({ ...this.state });
  }
  fetchSeries(media_id: string) {
    fetchMediaSeries({
      media_id,
    });
  }
  /** 播放该电视剧下指定影片 */
  async playEpisode(source: MediaSource & { curFileId?: string }, extra: { currentTime: number }) {
    const { currentTime = 0 } = extra;
    console.log("[DOMAIN]media/season - playEpisode", source, this.curSource);
    const { id, files } = source;
    if (this.curSource && id === this.curSource.id) {
      this.tip({
        text: ["已经是该剧集了"],
      });
      return Result.Ok(this.curSource);
    }
    if (files.length === 0) {
      const tip = this.tip({
        text: ["该剧集缺少视频源"],
      });
      return Result.Err(tip);
    }
    const file = (() => {
      if (source.curFileId) {
        const matched = files.find((f) => f.id === source.curFileId);
        if (matched) {
          return matched;
        }
      }
      return files[0];
    })();
    // console.log("[DOMAIN]media/season - playEpisode before this.$source.load", source, file);
    this.curSource = { ...source, currentTime, thumbnailPath: source.stillPath, curFileId: file.id };
    const res = await this.$source.load(file);
    if (res.error) {
      this.tip({
        text: [res.error.message],
      });
      return Result.Err(res.error);
    }
    this.currentTime = currentTime;
    this.curSource = { ...source, currentTime, thumbnailPath: source.stillPath, curFileId: file.id };
    (async () => {
      const r = await this.$source.loadSubtitle({ extraSubtitleFiles: source.subtitles, currentTime });
      if (r.error) {
        console.log("[DOMAIN]media/season - loadSubtitle failed ", r.error.message);
        return;
      }
      // this.emit(Events.EpisodeChange, { ...this.curEpisode, currentTime });
    })();
    this.emit(Events.SourceFileChange, { ...res.data, currentTime });
    this.emit(Events.StateChange, { ...this.state });
    return Result.Ok(this.curSource);
  }
  /** 切换剧集 */
  switchEpisode(episode: MediaSource) {
    return this.playEpisode(episode, { currentTime: 0 });
  }
  /** 获取下一剧集 */
  async getNextEpisode() {
    if (this.profile === null) {
      return Result.Err("请先调用 fetchProfile 方法");
    }
    if (this.curSource === null) {
      return Result.Err("请先调用 fetchProfile 方法");
    }
    if (!this.curGroup) {
      return Result.Err("请先调用 fetchProfile 方法");
    }
    // const { id, order } = this.curEpisode;
    // const curGroupIndex = this.episodeGroups.findIndex((group) => group.cur);
    // if (curGroupIndex === -1) {
    //   return Result.Err("没有找到当前剧集组");
    // }
    const curSource = this.curSource;
    const curGroup = this.curGroup;
    const curGroupIndex = this.sourceGroups.findIndex((g) => g.text === curGroup.text);
    const curSourceIndex = curGroup.list.findIndex((source) => source.id === curSource.id);
    if (curSourceIndex === -1) {
      return Result.Err("在剧集组里没有找到当前剧集");
    }
    const isLastEpisode = curSourceIndex === curGroup.list.length - 1;
    if (!isLastEpisode) {
      let nextEpisode = curGroup.list[curSourceIndex + 1];
      if (!nextEpisode.id) {
        nextEpisode = curGroup.list[curSourceIndex + 2];
      }
      if (nextEpisode) {
        return Result.Ok(nextEpisode);
      }
      // curEpisode.cur = false;
      // nextEpisode.cur = true;
    }
    if (curGroupIndex === this.sourceGroups.length - 1) {
      return Result.Err("已经是最后一集了");
    }
    const nextGroup = this.sourceGroups[curGroupIndex + 1];
    if (!nextGroup) {
      return Result.Err("已经是最后一集了2");
    }
    const fetch = new RequestCore(fetchSourceInGroup, {
      process: fetchSourceInGroupProcess,
      client: this.$client,
    });
    const r = await fetch.run({ media_id: nextGroup.media_id, start: nextGroup.start, end: nextGroup.end });
    if (r.error) {
      return Result.Err(r.error);
    }
    if (r.data.length === 0) {
      return Result.Err("已经是最后一集了3");
    }
    nextGroup.list = r.data;
    curGroup.cur = false;
    nextGroup.cur = true;
    const nextEpisode = nextGroup.list[0];
    // curEpisode.cur = false;
    // nextEpisode.cur = true;
    return Result.Ok(nextEpisode);
  }
  /** 为播放下一集进行准备 */
  prepareNextEpisode() {}
  /** 播放下一集 */
  async playNextEpisode() {
    if (this._pending) {
      const msg = this.tip({ text: ["正在加载..."] });
      return Result.Err(msg);
    }
    this.emit(Events.BeforeNextEpisode);
    this._pending = true;
    const r = await this.getNextEpisode();
    this._pending = false;
    if (r.error) {
      const msg = this.tip({ text: [r.error.message] });
      return Result.Err(msg);
    }
    const nextEpisode = r.data;
    if (nextEpisode === null) {
      return Result.Err("没有找到可播放剧集");
    }
    await this.playEpisode(nextEpisode, { currentTime: 0 });
    return Result.Ok(null);
  }
  async fetchEpisodeOfGroup(group: { start: number; end: number }) {
    if (this.profile === null) {
      const msg = this.tip({
        text: ["请先调用 fetchProfile"],
      });
      return Result.Err(msg);
    }
    const matchedGroup = this.sourceGroups.find((g) => g.start === group.start && g.end === group.end);
    if (!matchedGroup) {
      const msg = this.tip({
        text: ["参数错误"],
      });
      return Result.Err(msg);
    }
    const fetch = new RequestCore(fetchSourceInGroup, {
      process: fetchSourceInGroupProcess,
      client: this.$client,
    });
    const r = await fetch.run({ media_id: this.profile.id, start: matchedGroup.start, end: matchedGroup.end });
    if (r.error) {
      return Result.Err(r.error);
    }
    if (r.data.length === 0) {
      return Result.Err("没有剧集");
    }
    if (this.curGroup) {
      this.curGroup.cur = false;
    }
    matchedGroup.list = r.data;
    matchedGroup.cur = true;
    this.curGroup = matchedGroup;
    this.emit(Events.StateChange, { ...this.state });
    return Result.Ok(null);
  }
  async changeSourceFile(sourceFile: { id: string }) {
    if (this.profile === null) {
      const msg = this.tip({ text: ["视频还未加载完成"] });
      return Result.Err(msg);
    }
    if (this.curSource === null) {
      const msg = this.tip({ text: ["视频还未加载完成"] });
      return Result.Err(msg);
    }
    const res = await this.$source.load({ id: sourceFile.id });
    this.curSource.curFileId = sourceFile.id;
    if (res.error) {
      this.tip({
        text: [res.error.message],
      });
      return Result.Err(res.error);
    }
    this.emit(Events.SourceFileChange, { ...res.data, currentTime: this.currentTime });
    return Result.Ok(null);
  }
  /** 切换分辨率 */
  changeResolution(targetType: MediaResolutionTypes) {
    // console.log("switchResolution 1");
    if (this.profile === null) {
      const msg = this.tip({ text: ["视频还未加载完成"] });
      return Result.Err(msg);
    }
    const r = this.$source.changeResolution(targetType);
    if (r.error) {
      const msg = this.tip({ text: [r.error.message] });
      return Result.Err(msg);
    }
    const target = r.data;
    // console.log("[DOMAIN]tv/index - changeResolution", this.currentTime);
    this.emit(Events.SourceFileChange, { ...target, currentTime: this.currentTime });
    return Result.Ok(target);
  }
  setCurrentTime(currentTime: number) {
    this.currentTime = currentTime;
  }
  setCurResolution(type: MediaResolutionTypes) {
    this.curResolutionType = type;
  }
  markFileInvalid(id: string) {
    if (!this.curSource) {
      return;
    }
    const matched = this.curSource.files.find((f) => f.id === id);
    if (!matched) {
      return;
    }
    this.curSource.files = this.curSource.files.map((f) => {
      if (f.id === id) {
        return {
          ...f,
          invalid: true,
        };
      }
      return f;
    });
  }
  updatePlayProgressForce(values: Partial<{ currentTime: number; duration: number }> = {}) {
    const { currentTime = this.currentTime, duration = 0 } = values;
    console.log(
      "[DOMAIN]media/season - update_play_progress",
      currentTime,
      this.profile,
      this.curSource,
      this.$source.profile
    );
    if (this.profile === null) {
      return;
    }
    if (this.curSource === null) {
      return;
    }
    if (this.$source.profile === null) {
      return;
    }
    this.$update.run({
      media_id: this.profile.id,
      media_source_id: this.curSource.id,
      current_time: parseFloat(currentTime.toFixed(2)),
      duration: parseFloat(duration.toFixed(2)),
      source_id: this.$source.profile.id,
    });
  }
  /** 更新观看进度 */
  updatePlayProgress = throttle_1(10 * 1000, (values: Partial<{ currentTime: number; duration: number }> = {}) => {
    this.updatePlayProgressForce(values);
  });
  /** 当前进度改变 */
  handleCurTimeChange(values: { currentTime: number; duration: number }) {
    this.playing = true;
    this._pause();
    const { currentTime = 0 } = values;
    // console.log("[DOMAIN]tv/index - handleCurTimeChange", currentTime);
    this.currentTime = currentTime;
    if (this.$source.subtitle?.visible) {
      this.$source.$subtitle?.handleTimeChange(currentTime);
    }
    this.updatePlayProgress(values);
  }
  /** 当 800 毫秒内没有播放，就表示暂停了 */
  _pause = debounce(800, () => {
    this.playing = false;
  });
  getTitle(): string[] {
    // console.log("[DOMAIN]media - getTitle", this.profile);
    if (this.profile && this.curSource) {
      const { name: episodeText } = this.curSource;
      const { name } = this.profile;
      return [episodeText, name];
    }
    if (this.profile) {
      const { name } = this.profile;
      return [name];
    }
    return [];
  }

  onSourceFileChange(handler: Handler<TheTypesOfEvents[Events.SourceFileChange]>) {
    return this.on(Events.SourceFileChange, handler);
  }
  onProfileLoaded(handler: Handler<TheTypesOfEvents[Events.ProfileLoaded]>) {
    return this.on(Events.ProfileLoaded, handler);
  }
  onEpisodeChange(handler: Handler<TheTypesOfEvents[Events.EpisodeChange]>) {
    return this.on(Events.EpisodeChange, handler);
  }
  onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
    return this.on(Events.StateChange, handler);
  }
  onBeforeNextEpisode(handler: Handler<TheTypesOfEvents[Events.BeforeNextEpisode]>) {
    return this.on(Events.BeforeNextEpisode, handler);
  }
  onBeforePrevEpisode(handler: Handler<TheTypesOfEvents[Events.BeforePrevEpisode]>) {
    return this.on(Events.BeforePrevEpisode, handler);
  }
  onBeforeChangeSource(handler: Handler<TheTypesOfEvents[Events.BeforeChangeSource]>) {
    return this.on(Events.BeforeChangeSource, handler);
  }
}

function throttle_1(delay: number, fn: Function) {
  let canInvoke = true;

  setInterval(() => {
    canInvoke = true;
  }, delay);

  return (...args: unknown[]) => {
    if (canInvoke === false) {
      return;
    }
    fn(...args);
    canInvoke = false;
  };
}
