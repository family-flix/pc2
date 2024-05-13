import { BaseDomain, Handler, base } from "@/domains/base";
import { HttpClientCore } from "@/domains/http_client/index";
import { RequestCoreV2 } from "@/domains/request/v2";
import { Result } from "@/types/index";
import { AuthCodeStep } from "@/constants/index";

import { createAuthQRCode, checkAuthQRCode } from "./services";

type QRCodeWithStateProps = {
  unique_id: string;
  step: AuthCodeStep;
  client: HttpClientCore;
};
// type QRCodeWithStateState = {
//   step: AuthCodeStep;
//   error: null | Error;
// };

export const QRCodeWithState = (props: QRCodeWithStateProps) => {
  const { unique_id, step: _step = AuthCodeStep.Loading, client } = props;

  let id = unique_id;
  let step = _step;
  let timer: null | NodeJS.Timer = null;
  let error: null | Error = null;

  const $check = new RequestCoreV2({
    fetch: checkAuthQRCode,
    client,
  });
  const $create = new RequestCoreV2({
    fetch: createAuthQRCode,
    client,
  });

  const state: { step: AuthCodeStep; error: null | Error } = {
    step,
    error,
  };
  enum Events {
    Scan,
    Confirm,
    Expired,
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.Scan]: void;
    [Events.Confirm]: { id: string; email: string; token: string };
    [Events.Expired]: void;
    [Events.StateChange]: typeof state;
  };
  const core = base<TheTypesOfEvents>();

  return {
    state,
    async refresh() {
      step = AuthCodeStep.Loading;
      error = null;
      core.emit(Events.StateChange, { step, error });
      const r = await $create.run();
      console.log("after $create.run", r);
      if (r.error) {
        step = AuthCodeStep.Error;
        error = r.error;
        // state.step = step;
        // state.error = error;
        // console.log('after $create.run', state.step);
        core.emit(Events.StateChange, { step, error });
        return Result.Err(r.error.message);
      }
      id = r.data.code;
      step = r.data.step;
      core.emit(Events.StateChange, { step, error });
      return Result.Ok({ id, step });
    },
    async startCheck() {
      if (timer !== null) {
        return;
      }
      timer = setInterval(() => {
        this.check();
      }, 2000);
    },
    async clearCheck() {
      if (timer === null) {
        return;
      }
      // @ts-ignore
      clearInterval(timer as number);
    },
    async check() {
      const r = await $check.run({ code: id });
      if (r.error) {
        return Result.Err(r.error);
      }
      // const { step } = r.data;
      if (r.data.step === AuthCodeStep.Scanned) {
        core.emit(Events.Scan);
      }
      if (r.data.step === AuthCodeStep.Confirmed) {
        const { id, email, token } = r.data;
        this.clearCheck();
        core.emit(Events.Confirm, { id, email, token });
      }
      if (r.data.step === AuthCodeStep.Expired) {
        this.clearCheck();
        core.emit(Events.Expired);
      }
      if (r.data.step !== step) {
        step = r.data.step;
        core.emit(Events.StateChange, { step, error });
      }
      return Result.Ok(r.data);
    },
    onScan(handler: Handler<TheTypesOfEvents[Events.Scan]>) {
      return core.on(Events.Scan, handler);
    },
    onConfirm(handler: Handler<TheTypesOfEvents[Events.Confirm]>) {
      return core.on(Events.Confirm, handler);
    },
    onExpired(handler: Handler<TheTypesOfEvents[Events.Expired]>) {
      return core.on(Events.Expired, handler);
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return core.on(Events.StateChange, handler);
    },
  };
};

// export class QRCodeWithState extends BaseDomain<TheTypesOfEvents> {
//   static async Create(opt: { client: HttpClientCore }) {
//     const { client } = opt;
//     const request = new RequestCoreV2({
//       fetch: createAuthQRCode,
//       client,
//     });
//     const ins = new QRCodeWithState({
//       unique_id: "",
//       step: AuthCodeStep.Pending,
//       client,
//     });
//     (async () => {
//       const r = await request.run();
//       if (r.error) {
//         ins.step = AuthCodeStep.Error;
//         ins.error = r.error;
//         return ins;
//       }
//       const { code, step } = r.data;
//       ins.id = code;
//       ins.step = step;
//     })();
//     return ins;
//   }

//   id: string;
//   step = AuthCodeStep.Loading;
//   timer: null | NodeJS.Timer = null;
//   error: null | Error = null;

//   $check: RequestCoreV2<{
//     fetch: typeof checkAuthQRCode;
//     client: HttpClientCore;
//   }>;
//   $client: HttpClientCore;

//   get state(): QRCodeState {
//     return {
//       step: this.step,
//       error: this.error,
//     };
//   }

//   constructor(props: Partial<{ _name: string }> & StateQRCodeProps) {
//     super(props);

//     const { unique_id, step, client } = props;
//     this.id = unique_id;
//     this.step = step;

//     this.$check = new RequestCoreV2({
//       fetch: checkAuthQRCode,
//       client,
//     });
//     this.$client = client;
//   }

//   async refresh() {
//     const r = await request.run();
//     if (r.error) {
//       ins.step = AuthCodeStep.Error;
//       ins.error = r.error;
//       return ins;
//     }
//     const { code, step } = r.data;
//     ins.id = code;
//     ins.step = step;
//   }

//   async startCheck() {
//     if (this.timer !== null) {
//       return;
//     }
//     this.timer = setInterval(() => {
//       this.check();
//     }, 2000);
//   }
//   async clearCheck() {
//     if (this.timer === null) {
//       return;
//     }
//     clearInterval(this.timer);
//   }
//   async check() {
//     const r = await this.$check.run({ code: this.id });
//     if (r.error) {
//       return Result.Err(r.error);
//     }
//     const { step } = r.data;
//     if (step === AuthCodeStep.Scanned) {
//       this.emit(Events.Scan);
//     }
//     if (step === AuthCodeStep.Confirmed) {
//       const { id, email, token } = r.data;
//       this.clearCheck();
//       this.emit(Events.Confirm, { id, email, token });
//     }
//     if (step === AuthCodeStep.Expired) {
//       this.clearCheck();
//       this.emit(Events.Expired);
//     }
//     if (step !== this.step) {
//       this.step = step;
//       this.emit(Events.StateChange, { ...this.state });
//     }
//     return Result.Ok(r.data);
//   }
//   // async refresh() {
//   //   const r = await QRCodeWithState.Create({ client: this.$client });
//   //   if (r.step === AuthCodeStep.Error) {
//   //     this.step = AuthCodeStep.Error;
//   //     this.emit(Events.StateChange, { ...this.state });
//   //     return Result.Ok(this);
//   //   }
//   //   this.id = r.id;
//   //   this.step = AuthCodeStep.Pending;
//   //   this.startCheck();
//   //   this.emit(Events.StateChange, { ...this.state });
//   //   return Result.Ok(this);
//   // }

//   onScan(handler: Handler<TheTypesOfEvents[Events.Scan]>) {
//     return this.on(Events.Scan, handler);
//   }
//   onConfirm(handler: Handler<TheTypesOfEvents[Events.Confirm]>) {
//     return this.on(Events.Confirm, handler);
//   }
//   onExpired(handler: Handler<TheTypesOfEvents[Events.Expired]>) {
//     return this.on(Events.Expired, handler);
//   }
//   onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
//     return this.on(Events.StateChange, handler);
//   }
// }
