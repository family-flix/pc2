import { media_request } from "@/biz/requests/index";
import { AuthCodeStep } from "@/constants/index";

export function createAuthQRCode() {
  return media_request.post<{ step: AuthCodeStep; code: string }>("/api/v2/wechat/auth/code/create", {});
}

type MutableRecord<U> = {
  [SubType in keyof U]: {
    step: SubType;
  } & U[SubType];
}[keyof U];
type QRCodeResp = MutableRecord<{
  [AuthCodeStep.Loading]: {
    step: AuthCodeStep;
  };
  [AuthCodeStep.Pending]: {
    step: AuthCodeStep;
  };
  [AuthCodeStep.Scanned]: {
    step: AuthCodeStep;
  };
  [AuthCodeStep.Confirmed]: {
    step: AuthCodeStep;
    id: string;
    email: string;
    token: string;
  };
  [AuthCodeStep.Expired]: {
    step: AuthCodeStep;
  };
  [AuthCodeStep.Error]: {
    step: AuthCodeStep;
    error: string;
  };
}>;
export function checkAuthQRCode(values: { code: string }) {
  return media_request.post<QRCodeResp>("/api/v2/wechat/auth/code/check", values);
}
