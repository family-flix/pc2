import { HttpClientCore } from "@/domains/http_client/index";
import { connect } from "@/domains/http_client/connect.axios";
import { Result } from "@/types/index";
import { __VERSION__ } from "@/constants/index";

const _client = new HttpClientCore({
  hostname: window.location.origin,
  headers: {
    'client-version': __VERSION__,
  }
});
connect(_client);

// @ts-ignore
export const client: HttpClientCore = {
  hostname: _client.hostname,
  headers: _client.headers,
  async setHeaders<T>(...args: Parameters<typeof _client.setHeaders>) {
    return _client.setHeaders(...args);
  },
  async appendHeaders<T>(...args: Parameters<typeof _client.appendHeaders>) {
    return _client.appendHeaders(...args);
  },
  async get<T>(...args: Parameters<typeof _client.get>) {
    const r = await _client.get<{ code: number; msg: string; data: T }>(...args);
    if (r.error) {
      return Result.Err(r.error.message);
    }
    const { code, msg, data } = r.data;
    if (code !== 0) {
      return Result.Err(msg, code, data);
    }
    return Result.Ok(data);
  },
  async post<T>(...args: Parameters<typeof _client.post>) {
    const r = await _client.post<{ code: number; msg: string; data: T }>(...args);
    if (r.error) {
      return Result.Err(r.error.message);
    }
    const { code, msg, data } = r.data;
    if (code !== 0) {
      return Result.Err(msg, code, data);
    }
    return Result.Ok(data);
  },
  async cancel<T>(...args: Parameters<typeof _client.cancel>) {
    return _client.cancel(...args);
  },
};
