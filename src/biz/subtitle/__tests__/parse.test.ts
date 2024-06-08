import { expect, it, describe } from "vitest";

import { parseSubtitleContent } from "../utils";

const text1 = `[Script Info]
;SrtEdit 6.3.2012.1001
;Copyright(C) 2005-2012 Yuan Weiguo

Title: Subtitles
Original Script: Subtitles
Original Translation: 
Original Timing: 
Original Editing: 
Script Updated By: 
Update Details: 
ScriptType: v4.00+
Collisions: Normal
PlayResX: 384
PlayResY: 288
Timer: 100.0000
Synch Point: 0
WrapStyle: 0
ScaledBorderAndShadow: no

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,方正黑体_GBK,20,&H00FFFFFF,&HFF000000,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,1,2,5,5,2,1
Style: LOGO,方正黑体_GBK,21,&H00FFFFFF,&HF0000000,&H006C3300,&H00000000,-1,0,0,0,100,100,0,0,1,2,1,2,5,5,5,134

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:51.69,0:00:53.47,Default,NTP,0,0,0,,你是否也曾看着某人想过
Dialogue: 0,0:00:53.47,0:00:55.92,Default,NTP,0,0,0,,"他们脑子里到底在想什么"
Dialogue: 0,0:00:56.22,0:00:59.75,Default,NTP,0,0,0,,我知道  我知道莱莉在想什么
Dialogue: 0,0:01:44.43,0:01:46.35,Default,NTP,0,0,0,,就是这个可爱的小家伙
Dialogue: 0,0:01:48.26,0:01:49.44,Default,NTP,0,0,0,,你好吗
Dialogue: 0,0:01:51.23,0:01:52.65,Default,NTP,0,0,0,,莱莉`;

describe("ass 文件解析", () => {
  it("1", () => {
    const r = parseSubtitleContent(text1, "ass");
    expect(r).toStrictEqual([
      {
        line: "0",
        start: "0:00:51.69",
        end: "0:00:53.47",
        startTime: 51.69,
        endTime: 53.47,
        texts: ["你是否也曾看着某人想过"],
      },
      {
        line: "1",
        start: "0:00:53.47",
        end: "0:00:55.92",
        startTime: 53.47,
        endTime: 55.92,
        texts: ['"他们脑子里到底在想什么"'],
      },
      {
        line: "2",
        start: "0:00:56.22",
        end: "0:00:59.75",
        startTime: 56.22,
        endTime: 59.75,
        texts: ["我知道  我知道莱莉在想什么"],
      },
      {
        line: "3",
        start: "0:01:44.43",
        end: "0:01:46.35",
        startTime: 104.43,
        endTime: 106.35,
        texts: ["就是这个可爱的小家伙"],
      },
      {
        line: "4",
        start: "0:01:48.26",
        end: "0:01:49.44",
        startTime: 108.26,
        endTime: 109.44,
        texts: ["你好吗"],
      },
      {
        line: "5",
        start: "0:01:51.23",
        end: "0:01:52.65",
        startTime: 111.23,
        endTime: 112.65,
        texts: ["莱莉"],
      },
    ]);
  });
});
