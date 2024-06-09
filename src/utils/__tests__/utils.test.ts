import { expect, it, describe } from "vitest";

import { seconds_to_minute } from "../../utils";

describe("秒数转 xx分钟xx秒", () => {
  it("1", () => {
    const r = seconds_to_minute(131.55);
    expect(r).toStrictEqual("2分11秒");
  });
});
