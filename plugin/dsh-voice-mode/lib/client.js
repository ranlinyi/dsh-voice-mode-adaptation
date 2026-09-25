window.__ModuleLoader__.load({ id: "dsh-voice-mode-adaptation", factory: (require) => {
var module = { exports: {} }; var exports = module.exports;
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client.tsx
var client_exports = {};
__export(client_exports, {
  ReadMessageButton: () => ReadMessageButton,
  ReadToggleButton: () => ReadToggleButton,
  ReadingStatusBar: () => ReadingStatusBar,
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(client_exports);
var React = __toESM(require("react"), 1);
var import_react2 = require("react");

// src/strings.ts
var zh = {
  // 通用
  stateVoiceMode: "\u8BED\u97F3\u6717\u8BFB",
  buildLabel: "\u8BED\u97F3\u6717\u8BFB",
  // 朗读总开关（原麦克风按钮位置）
  readToggle: "\u6717\u8BFB",
  readToggleOn: "\u5173\u95ED\u81EA\u52A8\u6717\u8BFB",
  readToggleOff: "\u5F00\u542F\u81EA\u52A8\u6717\u8BFB",
  readTitleOn: "\u81EA\u52A8\u6717\u8BFB\u4E2D\uFF1AAI \u6BCF\u8F6E\u65B0\u56DE\u590D\u4F1A\u81EA\u52A8\u6717\u8BFB\uFF0C\u65B0\u56DE\u590D\u4F1A\u6253\u65AD\u4E0A\u4E00\u6761\uFF1B\u70B9\u51FB\u5173\u95ED",
  readTitleOff: "\u5F00\u542F\u81EA\u52A8\u6717\u8BFB\uFF1A\u6B64\u540E AI \u6BCF\u8F6E\u65B0\u56DE\u590D\u81EA\u52A8\u6717\u8BFB\uFF08\u65B0\u56DE\u590D\u4F1A\u6253\u65AD\u4E0A\u4E00\u6761\uFF09",
  // 每条回复的朗读键
  readOne: "\u6717\u8BFB",
  readOneTitle: "\u6717\u8BFB\u8FD9\u6761\u56DE\u590D",
  readOneEmpty: "\u8FD9\u6761\u56DE\u590D\u6682\u65E0\u53EF\u6717\u8BFB\u6587\u5B57",
  // 状态条
  readPlaying: "\u6717\u8BFB\u4E2D\u2026",
  readStop: "\u505C\u6B62",
  readFail: "\u6717\u8BFB\u5931\u8D25\uFF1A\u8BF7\u68C0\u67E5\u7F51\u7EDC\u6216\u6717\u8BFB\u5F15\u64CE\u8BBE\u7F6E",
  ttsNoticeFail: "\u6717\u8BFB\u8FDE\u63A5\u5931\u8D25\uFF1A\u6B63\u5728\u91CD\u8BD5\u2026",
  configUnavailable: "\u914D\u7F6E\u6682\u4E0D\u53EF\u7528",
  configUnavailableNote: "\uFF08\u8BBE\u7F6E\u6587\u6863\u672A\u5C31\u7EEA\uFF0C\u9762\u677F\u5C31\u7EEA\u540E\u4F1A\u81EA\u52A8\u51FA\u73B0\uFF09\u3002",
  // 设置面板
  settingsCardDesc: "\u6717\u8BFB\u5F15\u64CE / \u97F3\u8272 / \u8BED\u901F / \u6570\u5B66\u6717\u8BFB\u6A21\u5F0F / \u8BED\u97F3\u6539\u7F16\u7AD9",
  settingsEffectiveNote: "\u6717\u8BFB\u5F15\u64CE / \u97F3\u8272 / \u8BED\u901F / \u6A21\u578B\u7CBE\u5EA6 / \u6392\u7248\u63D0\u793A\u8BCD \u5373\u65F6\u751F\u6548\uFF1B\u81EA\u52A8\u6717\u8BFB\u5F00\u5173\u5728\u8F93\u5165\u6846\u65C1\u6309\u94AE\u4E2D\u968F\u65F6\u5207\u6362\u3002",
  secRead: "\u6717\u8BFB\u4E0E\u97F3\u8272",
  secAdaptation: "\u8BED\u97F3\u6539\u7F16\u7AD9",
  // 设置行标签
  ttsEngine: "\u6717\u8BFB\u5F15\u64CE",
  descTtsEngine: "\u672C\u5730 VITS\uFF08\u7EAF\u4E2D\u6587\uFF09/ \u672C\u5730 Kokoro\uFF08\u4E2D\u82F1\u5747\u53EF\uFF09/ Edge \u4E91\u7AEF\uFF08\u97F3\u8D28\u6700\u81EA\u7136\uFF0C\u6587\u672C\u4E0A\u5FAE\u8F6F\uFF09/ Azure \u4E91\u7AEF\uFF08\u4ED8\u8D39\uFF0C\u652F\u6301\u97F3\u7D20\u7EA7\u591A\u97F3\u5B57\uFF09",
  engineVits: "\u672C\u5730 VITS",
  engineKokoro: "\u672C\u5730\u4E2D\u82F1",
  engineEdge: "Edge \u4E91\u7AEF",
  engineAzure: "Azure \u4E91\u7AEF\uFF08\u4ED8\u8D39\uFF09",
  kokoroModel: "Kokoro \u6A21\u578B\u7CBE\u5EA6",
  kokoroModelInt8: "int8\uFF08\u9ED8\u8BA4\uFF09",
  kokoroModelFp32: "fp32\uFF08\u97F3\u8D28\u66F4\u597D\uFF09",
  descKokoroModel: "Kokoro \u6A21\u578B\u7CBE\u5EA6\uFF1Aint8 \u4F53\u79EF\u5C0F/\u52A0\u8F7D\u5FEB\uFF08\u7EAF CPU \u670D\u52A1\u5668\u6216\u4F4E\u5E26\u5BBD\u63A8\u8350\uFF0C\u9ED8\u8BA4\uFF09\uFF1Bfp32 \u97F3\u8D28\u66F4\u597D\u4F46\u7EA6 311MB\u3001\u66F4\u6162\uFF08\u6709\u72EC\u7ACB\u663E\u5361\u6216\u5927\u5185\u5B58\u673A\u5668\u63A8\u8350\uFF09\u3002\u4E24\u6863\u5171\u7528\u540C\u4E00\u5957 103 \u97F3\u8272\uFF0C\u5207\u6362\u5373\u65F6\u751F\u6548\u3002",
  descVoice: "Edge \u4E91\u7AEF\u97F3\u8272\uFF08\u8FDB\u5165\u65F6\u81EA\u52A8\u52A0\u8F7D\u5FAE\u8F6F\u5168\u90E8\u97F3\u8272\uFF0C\u5E38\u7528\u4E2D\u6587\u97F3\u8272\u7F6E\u9876\uFF0C\u4E0B\u62C9\u6216 \u25C0\u25B6 \u9009\uFF1B\u4E5F\u53EF\u300C\u81EA\u5B9A\u4E49\u300D\u586B ShortName\uFF09",
  descVoiceLocal: "\u672C\u5730\u97F3\u8272\uFF08vits \u4E94\u4E2A\u8BF4\u8BDD\u4EBA\u5168\u90E8\u5217\u51FA\uFF0C\u4E0B\u62C9\u9009\u6216 \u25C0\u25B6 \u5207\u6362\uFF1B\u65E0\u9700\u81EA\u5B9A\u4E49\uFF09",
  descVoiceKokoro: "Kokoro \u4E2D\u82F1\u97F3\u8272\uFF08103 \u4E2A\u5168\u90E8\u5217\u51FA\uFF0C\u4E0B\u62C9\u9009\u6216 \u25C0\u25B6 \u5207\u6362\uFF1B48-51 \u4E2D\u6587\u540D\uFF0C\u5176\u4F59\u6309\u7F16\u53F7+\u5B9E\u6D4B\u6027\u522B\u6807\u6CE8\uFF0C\u4E2D\u82F1\u6DF7\u8BFB\u5747\u53EF\uFF09",
  descVoiceAzure: "Azure \u97F3\u8272\uFF08\u4E0E Edge \u540C\u540D ShortName\uFF0C\u6CBF\u7528\u4E0B\u65B9\u97F3\u8272\u9009\u62E9\uFF1B\u6587\u672C\u53D1\u9001\u5230\u4F60\u7684 Azure \u8BED\u97F3\u8D44\u6E90\uFF09",
  descRate: "\u6717\u8BFB\u8BED\u901F\u500D\u7387\uFF080.5 \u6162\u901F \uFF5E 2.0 \u5FEB\u901F\uFF0C1.0 \u6B63\u5E38\uFF09",
  descSpokenFormat: "\u81EA\u52A8\u6717\u8BFB\u4F1A\u8BDD\u6CE8\u5165\u6392\u7248\u4E0E\u516C\u5F0F\u63D0\u793A\u8BCD\uFF08\u4FDD\u7559\u5B8C\u6574 Markdown \u4E0E LaTeX \u6392\u7248\uFF0C\u5E76\u8981\u6C42\u5B57\u9762\u7F8E\u5143\u7B26\u53F7\u8F6C\u4E49\u4E3A \\$\uFF1B\u9ED8\u8BA4\u5173\uFF0C\u6539\u52A8\u5373\u65F6\u751F\u6548\uFF09",
  voicePrev: "\u4E0A\u4E00\u97F3\u8272",
  voiceNext: "\u4E0B\u4E00\u97F3\u8272",
  custom: "\u81EA\u5B9A\u4E49",
  preview: "\u8BD5\u542C",
  synthesizing: "\u5408\u6210\u4E2D\u2026",
  previewBtnTitle: "\u8BD5\u542C\u5F53\u524D\u97F3\u8272\uFF08\u5F53\u524D\u8BED\u901F\uFF09",
  previewNameFirst: "\u8BF7\u5148\u586B\u5199\u97F3\u8272\u540D\uFF08ShortName\uFF09",
  previewDisabled: "\u8BED\u97F3\u6717\u8BFB\u5DF2\u7981\u7528\uFF08\u63D2\u4EF6 enabled=false\uFF09\uFF0C\u65E0\u6CD5\u8BD5\u542C",
  previewPlayFail: "\u8BD5\u542C\u5931\u8D25\uFF1A\u65E0\u6CD5\u64AD\u653E\u8BE5\u97F3\u8272",
  previewAutoplay: "\u6D4F\u89C8\u5668\u62E6\u622A\u4E86\u81EA\u52A8\u64AD\u653E\uFF0C\u8BF7\u518D\u70B9\u4E00\u6B21\u8BD5\u542C",
  previewCheck: "\u8BD5\u542C\u5931\u8D25\uFF1A\u8BF7\u68C0\u67E5\u7F51\u7EDC\u6216\u97F3\u8272\u540D\uFF08ShortName\uFF09\u662F\u5426\u6B63\u786E",
  previewRateLimited: "\u8BD5\u542C\u592A\u9891\u7E41\u4E86\uFF0C\u7A0D\u5019\u51E0\u79D2\u518D\u70B9\uFF08\u6BCF\u5206\u949F\u9650 20 \u6B21\uFF09",
  previewTimeout: "\u5408\u6210\u8D85\u65F6\uFF1A\u6A21\u578B\u4ECD\u5728\u52A0\u8F7D\uFF0C\u8BF7\u7A0D\u5019\u51E0\u79D2\u518D\u8BD5",
  previewSynthesisFail: "\u5408\u6210\u5931\u8D25",
  // Azure
  descAzureEndpoint: "Azure \u8BED\u97F3\u8D44\u6E90\u7AEF\u70B9\uFF1A\u586B\u533A\u57DF\u540D\uFF08\u5982 eastasia\uFF09\u6216\u5B8C\u6574\u94FE\u63A5\uFF08https://<region>.tts.speech.microsoft.com\uFF09",
  descAzureKeyRef: "Azure \u5BC6\u94A5\u7684\u51ED\u636E\u5F15\u7528\u540D\uFF08\u5982 AZURE_SPEECH_KEY\uFF09\uFF1B\u771F\u5B9E\u5BC6\u94A5\u5199\u8FDB DSH \u51ED\u636E\u5E93\uFF0C\u914D\u7F6E\u6587\u4EF6\u53EA\u7559\u5F15\u7528\u540D",
  descAzureSecret: "\u5728\u4E0B\u65B9\u7C98\u8D34 Azure \u8BA2\u9605\u5BC6\u94A5\u5E76\u4FDD\u5B58\uFF1A\u5BBF\u4E3B\u5199\u5165 DSH \u51ED\u636E\u5E93\uFF0C\u660E\u6587\u4E0D\u843D\u914D\u7F6E\u6587\u4EF6",
  descAzurePhonemes: "\u591A\u97F3\u5B57\u62FC\u97F3\u8868\uFF1A\u6BCF\u884C\u300C\u8BCD => \u62FC\u97F3\u300D\uFF08\u5982 \u884C => hang2\u3001\u94F6\u884C => yin2 hang2\uFF09\uFF0C# \u8D77\u9996\u4E3A\u6CE8\u91CA\uFF1B\u7ECF SSML <phoneme> \u7CBE\u786E\u53D1\u97F3\uFF0C\u4EC5 Azure \u5F15\u64CE\u751F\u6548",
  // 改编站
  descRewriteEnabled: "\u8BED\u97F3\u6539\u7F16\u7AD9\u603B\u5F00\u5173\uFF08\u9ED8\u8BA4\u5173\uFF09\uFF1A\u5F00\u542F\u540E\u516C\u5F0F/\u8868\u683C/\u4EE3\u7801\u5148\u6539\u5199\u6210\u53E3\u64AD\u7A3F\u518D\u6717\u8BFB\uFF1B\u6B63\u6587\u6717\u8BFB\u4E0D\u53D7\u5F71\u54CD\u3002\u5F00\u542F\u524D\u4E0D\u6539\u52A8\u4EFB\u4F55\u73B0\u6709\u884C\u4E3A\u3002",
  descRewriteBaseUrl: "\u6539\u5199\u6A21\u578B OpenAI \u517C\u5BB9\u7AEF\u70B9\uFF08\u9ED8\u8BA4\u667A\u8C31 GLM\uFF09\u3002\u8BF7\u6C42\u4ECE\u5BBF\u4E3B\u53D1\u51FA\uFF0C\u5BC6\u94A5\u4E0D\u4E0A\u6D4F\u89C8\u5668\u3002",
  descRewriteApiKeyRef: "\u6539\u5199\u6A21\u578B\u5BC6\u94A5\u7684\u51ED\u636E\u5F15\u7528\uFF1A\u586B\u73AF\u5883\u53D8\u91CF\u540D\uFF08\u5982 GLM_API_KEY\uFF09\u3002\u5BC6\u94A5\u4E0D\u5199\u5165\u914D\u7F6E\u6587\u4EF6\u660E\u6587\u3002",
  descRewriteSecret: "\u5728\u4E0B\u65B9\u8F93\u5165\u6846\u7C98\u8D34 API \u5BC6\u94A5\u5E76\u70B9\u300C\u4FDD\u5B58\u5230\u51ED\u636E\u5E93\u300D\uFF1A\u5BBF\u4E3B\u5199\u5165 DSH \u51ED\u636E\u5B58\u50A8\uFF0C\u8BBE\u7F6E\u6587\u4EF6\u53EA\u4FDD\u7559\u4E0A\u9762\u7684\u5F15\u7528\u540D\uFF0C\u660E\u6587\u4E0D\u843D\u914D\u7F6E\u3002",
  descRewriteModel: "\u6539\u5199\u6A21\u578B\u540D\uFF08\u9ED8\u8BA4 glm-4.5-air\uFF09\u3002",
  descRewriteTimeout: "\u6539\u5199\u8BF7\u6C42\u8D85\u65F6\u6BEB\u79D2\uFF08\u9ED8\u8BA4 8000\uFF09\uFF1B\u8D85\u65F6\u81EA\u52A8\u56DE\u9000\u786E\u5B9A\u6027\u8BFB\u6CD5\u3002",
  descRewriteMaxTokens: "\u6539\u5199\u8F93\u51FA token \u57FA\u7EBF\uFF08\u9ED8\u8BA4 400\uFF09\uFF1A\u63D2\u4EF6\u4F1A\u6309\u7247\u6BB5\u957F\u5EA6\u81EA\u52A8\u4E0A\u8C03\uFF08\u4E0A\u9650 2048\uFF09\uFF0C\u907F\u514D\u957F\u8868\u683C/\u591A\u7B26\u53F7\u65F6 JSON \u88AB\u622A\u65AD\u800C\u56DE\u9000\u3002",
  descRewriteTemperature: "\u6539\u5199\u6E29\u5EA6\uFF08\u9ED8\u8BA4 0\uFF0C\u8D8A\u4F4E\u8D8A\u7A33\u5B9A\uFF09\u3002",
  descRewriteCache: "\u76F8\u540C\u7247\u6BB5\u590D\u7528\u8BB2\u7A3F\uFF08\u9ED8\u8BA4\u5F00\uFF0C\u51CF\u5C11\u91CD\u590D\u8BF7\u6C42\uFF09\u3002",
  descRewriteDisableThinking: "\u5173\u95ED\u6539\u5199\u6A21\u578B\u7684\u601D\u8003\u94FE\uFF08\u9ED8\u8BA4\u5F00\uFF09\uFF1AGLM-4.5 \u7B49\u601D\u8003\u578B\u6A21\u578B\u4E0D\u5173\u601D\u8003\u4F1A\u53EA\u8F93\u51FA\u63A8\u7406\u3001\u6B63\u6587\u4E3A\u7A7A\uFF0C\u8FEB\u4F7F\u6539\u5199\u56DE\u9000\uFF1B\u4EC5\u7AEF\u70B9\u652F\u6301 thinking \u53C2\u6570\u65F6\u6709\u6548\u3002",
  descRewriteContextChars: "\u4F20\u7ED9\u6539\u5199\u6A21\u578B\u7684\u524D\u6587\u5B57\u7B26\u4E0A\u9650\uFF08\u9ED8\u8BA4 800\uFF09\uFF1A\u5B9E\u9645\u957F\u5EA6\u6309\u7247\u6BB5\u52A8\u6001\u4F38\u7F29\u2014\u2014\u77ED\u516C\u5F0F\u5C11\u7ED9\u524D\u6587\uFF0C\u5927\u4EE3\u7801\u5757/\u5927\u8868\u683C\u591A\u7ED9\uFF0C\u5E76\u603B\u662F\u4ECE\u6574\u53E5\u5F00\u59CB\u30020 = \u4E0D\u7ED9\u524D\u6587\uFF0C\u53EA\u4FDD\u7559\u5DF2\u786E\u8BA4\u7684\u7B26\u53F7\u8868\u3002",
  descPronunciationEnabled: "\u542F\u7528\u591A\u97F3\u5B57\u7528\u6237\u8BCD\u8868\uFF08\u9ED8\u8BA4\u5F00\uFF09\u3002\u5173 = \u5B8C\u5168\u4E0D\u6539\u4EFB\u4F55\u6717\u8BFB\u6587\u672C\uFF1B\u5C4F\u5E55\u663E\u793A\u672C\u6765\u5C31\u4E0D\u53D7\u5F71\u54CD\u3002",
  descPronunciationFixes: "\u591A\u97F3\u5B57\u7528\u6237\u8BCD\u8868\uFF08\u53EF\u589E\u5220/\u6E05\u7A7A\uFF09\uFF1A\u6BCF\u884C\u300C\u539F\u8BCD => \u540C\u97F3\u66FF\u8EAB\u300D\uFF0C\u66FF\u8EAB\u5FC5\u987B\u4E0E\u539F\u8BCD\u7B49\u5B57\u6570\uFF1B\u53EA\u7EA0\u6B63\u8BFB\u97F3\uFF0C\u4E0D\u5141\u8BB8\u589E\u5220\u5B57\u6216\u6539\u6210\u540C\u4E49\u8BCD\uFF0C\u683C\u5F0F/\u5B57\u6570\u4E0D\u7B26\u7684\u884C\u4F1A\u88AB\u5FFD\u7565\u5E76\u56DE\u62A5\u3002\u539F\u8BCD\u4E5F\u53EF\u5199\u6210\u6B63\u5219 /pattern/flags\uFF08\u4F8B\uFF1A/\u7B2C\\s*(\\d+)\\s*\u884C/ => \u7B2C$1\u822A\uFF0C\u7528\u4E8E\u300C\u7B2C N \u884C\u300D\u8FD9\u7C7B\u52A8\u6001\u4E0A\u4E0B\u6587\uFF1B\u6B64\u65F6\u8DF3\u8FC7\u7B49\u5B57\u6570\u6821\u9A8C\uFF0C\u6B63\u5219\u7531\u4F60\u81EA\u8D1F\u98CE\u9669\uFF09\u3002\u9ED8\u8BA4\u503C\u662F\u4E00\u4EFD\u300C\u884C(h\xE1ng)\u300D\u540C\u97F3\u8BCD\u8868\uFF0C\u4E0D\u662F\u9690\u85CF\u5185\u7F6E\uFF0C\u968F\u65F6\u53EF\u6539\u3002",
  descGuardMode: "\u6539\u5199\u5B88\u536B\u5F3A\u5EA6\uFF1Astandard \u9ED8\u8BA4 / lenient \u653E\u5BBD\uFF08\u66F4\u96BE\u89E6\u53D1\u56DE\u9000\uFF0C\u4F46\u590D\u8FF0/\u91CD\u590D\u6717\u8BFB\u98CE\u9669\u66F4\u9AD8\uFF09/ strict \u6536\u7D27 / off \u5168\u5173\uFF08\u53EA\u4FDD\u7559 JSON \u534F\u8BAE\u89E3\u6790\uFF0C\u8BFB\u5230\u6307\u4EE4\u6587\u672C\u7B49\u98CE\u9669\u81EA\u8D1F\uFF09\u3002",
  guardModeOff: "\u5168\u5173",
  guardModeLenient: "\u653E\u5BBD",
  guardModeStandard: "\u6807\u51C6",
  guardModeStrict: "\u4E25\u683C",
  descGuardAllowRules: "\u5B88\u536B\u653E\u884C\u89C4\u5219\uFF08\u6BCF\u884C\u4E00\u6761\uFF0C# \u6CE8\u91CA\uFF09\uFF1A\u6574\u884C\u5199 /\u6B63\u5219/flags \u2192 \u547D\u4E2D\u300C\u6539\u5199\u7A3F\u300D\u5373\u653E\u884C\uFF1B\u52A0 seg: \u524D\u7F00 \u2192 \u547D\u4E2D\u300C\u539F\u59CB\u7247\u6BB5\u300D\uFF0C\u8BE5\u7247\u6BB5\u8DF3\u8FC7\u5168\u90E8\u5B88\u536B\uFF1B\u5176\u5B83\u5199\u6CD5\u6309\u5B57\u9762\u6587\u5B57\u505A\u5B50\u4E32\u5339\u914D\u3002\u7528\u4E8E\u628A\u5B88\u536B\u8BEF\u6740\u7684\u8BFB\u6CD5\u653E\u884C\uFF08\u653E\u884C\u540E\u76F4\u63A5\u91C7\u7528\u6A21\u578B\u8F93\u51FA\uFF0C\u4E0D\u518D\u505A\u957F\u5EA6/\u590D\u8FF0/\u6570\u5B57\u6821\u9A8C\uFF09\u3002",
  descWholeSentenceMath: "\u542B\u884C\u5185\u516C\u5F0F\u7684\u6574\u53E5\u4EA4\u7ED9\u6A21\u578B\u51FA\u7A3F\uFF08\u9ED8\u8BA4\u5F00\uFF09\uFF1A\u6574\u53E5\u4E00\u6B21\u6210\u578B\uFF0C\u6B63\u6587\u548C\u516C\u5F0F\u4E0D\u4F1A\u5404\u5FF5\u4E00\u904D\uFF0C\u6839\u6CBB\u91CD\u590D\u6717\u8BFB\u3002\u5173\u6389\u5219\u9000\u56DE\u300C\u516C\u5F0F\u7247\u6BB5\u5355\u72EC\u6539\u5199 + \u6B63\u6587\u5355\u72EC\u5FF5\u300D\uFF0C\u957F\u53E5\u5BB9\u6613\u91CD\u590D\u3002\u4EC5 mathMode=model \u65F6\u751F\u6548\u3002",
  descBlockPause: "\u6BB5\u843D\u4E4B\u95F4\u7684\u505C\u987F\u6BEB\u79D2\uFF08\u9ED8\u8BA4 350\uFF1B0 = \u5173\u95ED\uFF09\u3002\u6807\u9898\u4E4B\u540E\u7528 1.6 \u500D\uFF1B\u89E3\u51B3\u300C\u6362\u6BB5\u3001\u6807\u9898\u5230\u6B63\u6587\u6CA1\u6709\u505C\u987F\u3001\u4E00\u53E3\u6C14\u5FF5\u5B8C\u300D\u7684\u4E0D\u81EA\u7136\u3002\u4EC5\u8BED\u97F3\u6539\u7F16\u7AD9\u5F00\u542F\u65F6\u751F\u6548\u3002",
  descMathMode: "\u6570\u5B66\u6717\u8BFB\u6A21\u5F0F\uFF1A\u786E\u5B9A\u6027\u89C4\u5219\u96F6\u5BB9\u9519\uFF08\u9ED8\u8BA4\uFF09/ \u4EA4\u7ED9\u6539\u5199\u6A21\u578B / \u539F\u6837\u5FF5\u51FA\u3002",
  mathModeRules: "\u786E\u5B9A\u6027\u89C4\u5219",
  mathModeModel: "\u4EA4\u7ED9\u6A21\u578B",
  mathModeVerbatim: "\u539F\u6837\u5FF5\u51FA",
  // 用量统计
  descUsageStats: "\u8BED\u97F3\u6539\u7F16\u7AD9\u8C03\u7528\u5916\u90E8\u6539\u5199\u6A21\u578B\u7D2F\u8BA1\u6D88\u8017\u7684 token\uFF08\u4EC5\u8FDB\u7A0B\u5185\u7D2F\u8BA1\uFF0C\u91CD\u542F\u6E05\u96F6\uFF09",
  usageRequests: "\u8BF7\u6C42",
  usagePrompt: "\u8F93\u5165",
  usageCompletion: "\u8F93\u51FA",
  usageTotal: "\u5408\u8BA1",
  usageReset: "\u6E05\u96F6",
  // 引擎/模型状态
  engineLoading: "\u52A0\u8F7D\u4E2D\u2026",
  engineReady: "\u5C31\u7EEA",
  engineError: "\u52A0\u8F7D\u5931\u8D25",
  engineIdle: "\u53EF\u8BD5\u542C",
  ttsModelsMissing: "\u672C\u5730\u6A21\u578B\u672A\u5C31\u7EEA",
  ttsRedownload: "\u91CD\u65B0\u4E0B\u8F7D",
  ttsRedownloadHint: "\u6E05\u7406\u8BE5\u5F15\u64CE\u6A21\u578B\u7F13\u5B58\u5E76\u91CD\u65B0\u4E0B\u8F7D",
  ttsCleaning: "\u6E05\u7406\u4E2D\u2026",
  ttsDownload: "\u4E0B\u8F7D",
  ttsDelete: "\u5220\u9664",
  ttsDownloading: "\u4E0B\u8F7D\u4E2D\u2026",
  ttsDeleting: "\u5220\u9664\u4E2D\u2026",
  ttsDownloadHint: "\u4E0B\u8F7D\u8BE5\u5F15\u64CE\u7684\u672C\u5730\u6A21\u578B\uFF1B\u4E0B\u8F7D\u5B8C\u6210\u540E\u7ACB\u5373\u5C31\u7EEA\uFF0C\u53EF\u8BD5\u542C/\u6717\u8BFB",
  ttsDeleteHint: "\u5220\u9664\u672C\u5730\u6A21\u578B\uFF08\u91CA\u653E\u7A7A\u95F4\uFF1B\u4E0B\u6B21\u4F7F\u7528\u4F1A\u81EA\u52A8\u91CD\u65B0\u4E0B\u8F7D\uFF09"
};
var en = {
  stateVoiceMode: "Read Aloud",
  buildLabel: "Read Aloud",
  readToggle: "Read",
  readToggleOn: "Turn off auto read-aloud",
  readToggleOff: "Turn on auto read-aloud",
  readTitleOn: "Auto read-aloud is on: every new assistant reply is read, and a new reply interrupts the previous one. Click to turn off.",
  readTitleOff: "Turn on auto read-aloud: every new assistant reply will be read (a new reply interrupts the previous one).",
  readOne: "Read",
  readOneTitle: "Read this reply aloud",
  readOneEmpty: "This reply has no readable text",
  readPlaying: "Reading\u2026",
  readStop: "Stop",
  readFail: "Read-aloud failed: check the network or the engine settings",
  ttsNoticeFail: "Read-aloud connection lost: retrying\u2026",
  configUnavailable: "Configuration unavailable",
  configUnavailableNote: " (settings document not ready; the panel will appear when it is).",
  settingsCardDesc: "Engine / voice / rate / math mode / speech adaptation station",
  settingsEffectiveNote: "Engine / voice / rate / model precision / formatting prompt apply immediately; toggle auto read-aloud from the button beside the composer.",
  secRead: "Reading & voice",
  secAdaptation: "Speech adaptation",
  ttsEngine: "Read-aloud engine",
  descTtsEngine: "Local VITS (Chinese only) / Local Kokoro (Chinese + English) / Edge cloud (most natural, text sent to Microsoft) / Azure cloud (paid, phoneme-level polyphone control)",
  engineVits: "Local VITS",
  engineKokoro: "Local zh-en",
  engineEdge: "Edge cloud",
  engineAzure: "Azure cloud (paid)",
  kokoroModel: "Kokoro model precision",
  kokoroModelInt8: "int8 (default)",
  kokoroModelFp32: "fp32 (better quality)",
  descKokoroModel: "Kokoro model precision: int8 is smaller/faster (CPU server or low bandwidth; default); fp32 sounds better but ~311MB and slower (GPU or large memory). Both share the same 103 voices; switches live.",
  descVoice: "Edge cloud voices (auto-loads all Microsoft voices; common Chinese voices pinned on top; \u25C0\u25B6 or dropdown; custom ShortName allowed)",
  descVoiceLocal: "Local voice (vits, all 5 speakers listed; dropdown or \u25C0\u25B6; no custom needed)",
  descVoiceKokoro: "Kokoro zh-en voices (103; \u25C0\u25B6 to cycle; 48-51 named Chinese, others numbered with measured gender; mixed zh-en supported)",
  descVoiceAzure: "Azure voice (same ShortName as Edge; text is sent to your Azure Speech resource)",
  descRate: "Speech rate (0.5 slow \u2013 2.0 fast, 1.0 normal)",
  descSpokenFormat: "Inject formatting & formula guidance into auto-read replies (keep full Markdown/LaTeX; escape literal dollar signs as \\$; default off, live)",
  voicePrev: "Previous voice",
  voiceNext: "Next voice",
  custom: "Custom",
  preview: "Preview",
  synthesizing: "Synthesizing\u2026",
  previewBtnTitle: "Preview voice (current rate)",
  previewNameFirst: "Enter a voice ShortName first",
  previewDisabled: "Read-aloud disabled; preview unavailable",
  previewPlayFail: "Preview failed: cannot play this voice",
  previewAutoplay: "Autoplay blocked \u2014 click preview again",
  previewCheck: "Preview failed: check network or ShortName",
  previewRateLimited: "Preview too frequent \u2014 wait a few seconds (20/min limit)",
  previewTimeout: "Synthesis timed out: model still loading, retry in a few seconds",
  previewSynthesisFail: "Synthesis failed",
  descAzureEndpoint: "Azure Speech endpoint: region name (e.g. eastasia) or full URL (https://<region>.tts.speech.microsoft.com)",
  descAzureKeyRef: "Credential reference name for the Azure key (e.g. AZURE_SPEECH_KEY); the secret is stored in the DSH credential store, never in config",
  descAzureSecret: "Paste the Azure subscription key below and save: the host stores it in the DSH credential store; the settings file keeps only the reference name",
  descAzurePhonemes: 'Polyphone table: one rule per line, "word => pinyin" (e.g. \u884C => hang2, \u94F6\u884C => yin2 hang2); # starts a comment. Applied via SSML <phoneme>, Azure engine only',
  descRewriteEnabled: "Speech adaptation master switch (default off): rewrite formulas/tables/code into spoken scripts before reading; normal prose is unaffected.",
  descRewriteBaseUrl: "OpenAI-compatible endpoint for the rewrite model (default Zhipu GLM). Requests are sent from the host; the key never reaches the browser.",
  descRewriteApiKeyRef: "Credential reference for the rewrite key: an environment-variable name (e.g. GLM_API_KEY). The secret is never written to config.",
  descRewriteSecret: "Paste the API key below and click Save: the host stores it in the DSH credential store; the settings file keeps only the reference name above.",
  descRewriteModel: "Rewrite model name (default glm-4.5-air).",
  descRewriteTimeout: "Rewrite request timeout in ms (default 8000); on timeout it falls back to deterministic reading.",
  descRewriteMaxTokens: "Baseline output tokens for rewriting (default 400): raised automatically with segment size (cap 2048) so long tables/symbol lists do not truncate the JSON and force a fallback.",
  descRewriteTemperature: "Rewrite temperature (default 0, lower is more stable).",
  descRewriteCache: "Reuse the script for identical fragments (default on; fewer requests).",
  descRewriteDisableThinking: "Disable the rewrite model thinking chain (default on): thinking models like GLM-4.5 otherwise emit only reasoning with empty content, forcing a fallback. Only effective when the endpoint supports the thinking parameter.",
  descRewriteContextChars: "Upper bound of preceding prose sent to the rewrite model (default 800). The actual size scales dynamically with the segment: short formulas get little prose, large code blocks/tables get more, always starting at a sentence boundary. 0 = no prose, symbol table only.",
  descPronunciationEnabled: "Enable the user pronunciation word list (default on). Off = no spoken text is changed at all; the on-screen text is never affected.",
  descPronunciationFixes: 'User pronunciation word list (edit or clear freely): one entry per line, term => same-length homophone. Only pronunciation is corrected; adding/removing characters or using a synonym is rejected and reported. The term may also be a regex /pattern/flags; regex entries skip the length check and are used at your own risk. The default value is a "\u884C(h\xE1ng)" homophone list, not a hidden built-in.',
  descGuardMode: "Rewrite guard strength: standard (default) / lenient (rarely falls back, higher risk of echo or repeated reading) / strict / off (only JSON protocol parsing remains; reading instruction text back is at your own risk).",
  guardModeOff: "Off",
  guardModeLenient: "Lenient",
  guardModeStandard: "Standard",
  guardModeStrict: "Strict",
  descGuardAllowRules: "Guard allow rules (one per line, # comment): a bare /regex/flags line matches the rewritten speech; a seg: prefix matches the original segment (that whole segment skips all guards); anything else is a literal substring match on the speech.",
  descWholeSentenceMath: "Hand any sentence containing inline math to the model as a whole (default on): the sentence is produced once, so prose and formulas are never read twice. Only effective when mathMode=model.",
  descBlockPause: "Silence inserted between paragraphs in ms (default 350; 0 = off). Headings use 1.6x. Only applies while the speech adaptation station is on.",
  descMathMode: "Math reading mode: deterministic rules (default, zero-tolerance) / let the rewrite model handle it / read verbatim.",
  mathModeRules: "Deterministic rules",
  mathModeModel: "Let the model",
  mathModeVerbatim: "Verbatim",
  descUsageStats: "Cumulative tokens consumed by the speech adaptation station external rewrite model (in-memory only; resets on restart)",
  usageRequests: "Requests",
  usagePrompt: "Prompt",
  usageCompletion: "Completion",
  usageTotal: "Total",
  usageReset: "Reset",
  engineLoading: "loading\u2026",
  engineReady: "ready",
  engineError: "failed",
  engineIdle: "ready to preview",
  ttsModelsMissing: "local models missing",
  ttsRedownload: "Re-download",
  ttsRedownloadHint: "Clear this engine model cache and re-download",
  ttsCleaning: "Clearing\u2026",
  ttsDownload: "Download",
  ttsDelete: "Delete",
  ttsDownloading: "Downloading\u2026",
  ttsDeleting: "Deleting\u2026",
  ttsDownloadHint: "Download this engine's local model; becomes ready immediately after",
  ttsDeleteHint: "Delete local models (frees space; auto re-downloads on next use)"
};
var guess = () => /^zh\b/i.test(
  typeof document !== "undefined" && document.documentElement.lang || (typeof navigator !== "undefined" ? navigator.language : "") || ""
) ? "zh" : "en";
var t = (key) => guess() === "zh" ? zh[key] : en[key] ?? zh[key];

// src/settings-form.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var t2 = {
  bg: "var(--dsw-alias-bg-layer-3)",
  bgOpen: "var(--dsw-alias-bg-layer-2)",
  border: "var(--dsw-alias-border-l2)",
  label: "var(--dsw-alias-label-primary)",
  term: "var(--dsw-alias-label-tertiary)",
  brand: "var(--dsw-alias-brand-primary)"
};
var BASE_PATH = "/voice-mode-adaptation";
var cardStyle = {
  border: `1px solid ${t2.border}`,
  background: t2.bg,
  borderRadius: 12,
  overflow: "hidden"
};
var FIELD_LABELS = {
  ttsEngine: "\u6717\u8BFB\u5F15\u64CE",
  kokoroModel: "Kokoro \u6A21\u578B\u7CBE\u5EA6",
  voice: "\u97F3\u8272",
  rate: "\u8BED\u901F",
  spokenFormat: "\u6392\u7248\u4E0E\u516C\u5F0F\u63D0\u793A\u8BCD",
  rewriteEnabled: "\u6539\u7F16\u7AD9\u603B\u5F00\u5173",
  rewriteBaseUrl: "\u6539\u5199\u7AEF\u70B9",
  rewriteApiKeyRef: "\u5BC6\u94A5\u51ED\u636E\u5F15\u7528",
  rewriteModel: "\u6539\u5199\u6A21\u578B",
  mathMode: "\u6570\u5B66\u6717\u8BFB\u6A21\u5F0F",
  rewriteTimeoutMs: "\u6539\u5199\u8D85\u65F6",
  rewriteMaxTokens: "\u6539\u5199 token \u4E0A\u9650",
  rewriteTemperature: "\u6539\u5199\u6E29\u5EA6",
  rewriteCache: "\u8BB2\u7A3F\u7F13\u5B58",
  rewriteDisableThinking: "\u5173\u95ED\u601D\u8003\u94FE",
  rewriteContextChars: "\u4E0A\u4E0B\u6587\u957F\u5EA6",
  pronunciationEnabled: "\u542F\u7528\u591A\u97F3\u5B57\u8BCD\u8868",
  pronunciationFixes: "\u591A\u97F3\u5B57\u7528\u6237\u8BCD\u8868",
  guardMode: "\u6539\u5199\u5B88\u536B\u5F3A\u5EA6",
  guardAllowRules: "\u5B88\u536B\u653E\u884C\u89C4\u5219",
  blockPauseMs: "\u6BB5\u843D\u505C\u987F",
  wholeSentenceMath: "\u6574\u53E5\u516C\u5F0F\u51FA\u7A3F",
  rewriteSecret: "\u5199\u5165\u5BC6\u94A5",
  azureEndpoint: "Azure \u7AEF\u70B9",
  azureKeyRef: "Azure \u5BC6\u94A5\u5F15\u7528",
  azureSecret: "\u5199\u5165 Azure \u5BC6\u94A5",
  azurePhonemes: "Azure \u591A\u97F3\u5B57\u62FC\u97F3\u8868",
  usageStats: "\u7D2F\u8BA1 token \u6D88\u8017"
};
var setHeader = {
  appearance: "none",
  width: "100%",
  font: "inherit",
  color: "inherit",
  textAlign: "left",
  cursor: "pointer",
  background: "transparent",
  border: 0,
  borderRadius: 12,
  alignItems: "center",
  gap: 12,
  padding: "14px 16px",
  display: "flex"
};
var setHeadText = { flexDirection: "column", flex: 1, gap: 4, minWidth: 0, display: "flex" };
var setName = { color: t2.label, fontSize: 15, fontWeight: 600, lineHeight: 1.4 };
var setDesc = { color: t2.term, fontSize: 13, lineHeight: 1.5 };
var setChevron = { color: t2.term, flex: "none", transition: "transform .16s", display: "inline-flex" };
var setBody = { borderTop: `1px solid ${t2.border}`, margin: "0 16px", paddingBottom: 8 };
var setRow = { alignItems: "center", gap: 12, padding: "12px 0", display: "flex" };
var setLabelBox = { flexDirection: "column", flex: 1, gap: 3, minWidth: 0, display: "flex" };
var setLabel = { fontSize: 13, lineHeight: "20px" };
var setHint = { color: t2.term, fontSize: 12, lineHeight: "18px" };
var setSeg = { border: `1px solid ${t2.border}`, borderRadius: 8, flexShrink: 0, gap: 2, padding: 2, display: "inline-flex" };
var setSegBtn = (on) => ({
  font: "inherit",
  color: on ? t2.label : "var(--dsw-alias-label-secondary)",
  cursor: "pointer",
  background: on ? "var(--dsw-alias-bg-layer-2)" : "transparent",
  border: "none",
  borderRadius: 6,
  padding: "4px 12px",
  fontSize: 12,
  lineHeight: "18px",
  fontWeight: on ? 600 : 400
});
var inputStyle = {
  boxSizing: "border-box",
  width: 280,
  maxWidth: "100%",
  padding: "7px 10px",
  borderRadius: 8,
  border: `1px solid ${t2.border}`,
  background: "var(--dsw-alias-bg-layer-2)",
  color: t2.label,
  fontSize: 13,
  fontFamily: "inherit",
  outline: "none"
};
var focusVisibleCss = `
[data-dshvma-settings="card"] input:focus-visible,
[data-dshvma-settings="card"] select:focus-visible,
[data-dshvma-settings="card"] button:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary);
  outline-offset: 1px;
}
@media (prefers-reduced-motion: reduce) {
  [data-dshvma-settings="card"], [data-dshvma-settings="card"] * { transition: none !important; }
}`;
var VOICE_OPTIONS = [
  { v: "zh-CN-XiaoxiaoNeural", label: "\u6653\u6653 \xB7 \u5973 \xB7 \u7B80\u4F53\u4E2D\u6587" },
  { v: "zh-CN-XiaoyiNeural", label: "\u6653\u4F0A \xB7 \u5973 \xB7 \u7B80\u4F53\u4E2D\u6587" },
  { v: "zh-CN-YunxiNeural", label: "\u4E91\u5E0C \xB7 \u7537 \xB7 \u7B80\u4F53\u4E2D\u6587" },
  { v: "zh-CN-YunjianNeural", label: "\u4E91\u5065 \xB7 \u7537 \xB7 \u7B80\u4F53\u4E2D\u6587" },
  { v: "zh-CN-YunyangNeural", label: "\u4E91\u626C \xB7 \u7537 \xB7 \u7B80\u4F53\u4E2D\u6587" },
  { v: "zh-CN-YunxiaNeural", label: "\u4E91\u590F \xB7 \u7537 \xB7 \u7B80\u4F53\u4E2D\u6587" },
  { v: "zh-CN-liaoning-XiaobeiNeural", label: "\u5C0F\u5317 \xB7 \u5973 \xB7 \u4E1C\u5317\u8BDD" },
  { v: "zh-CN-shaanxi-XiaoniNeural", label: "\u5C0F\u59AE \xB7 \u5973 \xB7 \u9655\u897F\u8BDD" },
  { v: "zh-HK-HiuMaanNeural", label: "\u6653\u66FC \xB7 \u5973 \xB7 \u7CA4\u8BED" },
  { v: "zh-HK-WanLungNeural", label: "\u4E91\u9F99 \xB7 \u7537 \xB7 \u7CA4\u8BED" },
  { v: "zh-TW-HsiaoYuNeural", label: "\u5C0F\u96E8 \xB7 \u5973 \xB7 \u53F0\u6E7E\u8154" },
  { v: "zh-TW-YunJheNeural", label: "\u4E91\u54F2 \xB7 \u7537 \xB7 \u53F0\u6E7E\u8154" },
  { v: "en-US-AriaNeural", label: "Aria \xB7 \u5973 \xB7 English" },
  { v: "en-US-GuyNeural", label: "Guy \xB7 \u7537 \xB7 English" }
];
var VOICE_OPTIONS_LOCAL = [
  { v: "suyingxue", label: "\u7D20\u6620\u96EA \xB7 \u5973" },
  { v: "gunian", label: "\u987E\u5FF5 \xB7 \u7537" },
  { v: "fushiyu", label: "\u5085\u65AF\u9047 \xB7 \u5973" },
  { v: "bingjiao", label: "\u51B0\u5A07 \xB7 \u7537" },
  { v: "bazong", label: "\u9738\u603B \xB7 \u7537" }
];
var KOKORO_F0 = [
  224,
  189,
  154,
  261,
  226,
  222,
  220,
  229,
  198,
  186,
  212,
  293,
  233,
  161,
  247,
  207,
  218,
  216,
  220,
  238,
  242,
  229,
  198,
  286,
  211,
  190,
  264,
  261,
  226,
  147,
  216,
  240,
  233,
  188,
  222,
  247,
  253,
  270,
  276,
  276,
  279,
  320,
  247,
  296,
  276,
  235,
  139,
  240,
  282,
  282,
  238,
  226,
  273,
  216,
  286,
  270,
  198,
  179,
  117,
  130,
  114,
  128,
  108,
  106,
  122,
  136,
  190,
  112,
  108,
  128,
  131,
  111,
  110,
  132,
  138,
  189,
  137,
  148,
  151,
  127,
  135,
  111,
  138,
  114,
  125,
  158,
  128,
  156,
  132,
  162,
  131,
  136,
  142,
  124,
  129,
  136,
  126,
  135,
  161,
  150,
  124,
  104,
  124
];
var KOKORO_NAMED = {
  48: { v: "zf_xiaobei", label: "\u5C0F\u5317 \xB7 \u4E2D\u6587\u5973" },
  49: { v: "zf_xiaoni", label: "\u5C0F\u59AE \xB7 \u4E2D\u6587\u5973" },
  50: { v: "zf_xiaoxiao", label: "\u5C0F\u5C0F \xB7 \u4E2D\u6587\u5973" },
  51: { v: "zf_xiaoyi", label: "\u5C0F\u827A \xB7 \u4E2D\u6587\u5973" }
};
var KOKORO_LABEL_OVERRIDES = {
  62: "62 \xB7 \u6DF1\u6C89 \xB7 \u5E38\u7528\u7537\u58F0",
  68: "68 \xB7 \u6D51\u539A \xB7 \u5E38\u7528\u7537\u58F0",
  75: "75 \xB7 \u6E05\u4EAE \xB7 \u5E38\u7528\u7537\u58F0",
  76: "76 \xB7 \u78C1\u6027 \xB7 \u5E38\u7528\u7537\u58F0"
};
var KOKORO_PINNED = [62, 68, 75, 76];
function kokoroOption(sid) {
  const custom = KOKORO_LABEL_OVERRIDES[sid];
  if (custom) return { v: String(sid), label: custom };
  const named = KOKORO_NAMED[sid];
  if (named) return { v: named.v, label: named.label };
  const hz = KOKORO_F0[sid] ?? null;
  if (hz === null) return { v: String(sid), label: `${sid} \xB7 \u97F3\u8272` };
  return { v: String(sid), label: `${sid} \xB7 ${hz < 180 ? "\u7537\u58F0" : "\u5973\u58F0"} \xB7 ${hz}Hz` };
}
var VOICE_OPTIONS_KOKORO = [
  ...KOKORO_PINNED.map((sid) => kokoroOption(sid)),
  ...KOKORO_F0.map((_, sid) => kokoroOption(sid)).filter((o) => !KOKORO_PINNED.includes(Number(o.v)))
];
var ENGINE_DEFAULT_VOICE = {
  // 与 host 侧引擎 defaultVoice 对齐（VITS suyingxue / Kokoro zf_xiaobei），
  // 避免「config 直连」与「面板切引擎」落到不同默认音色。
  vits: "suyingxue",
  kokoro: "zf_xiaobei",
  edge: "zh-CN-XiaoxiaoNeural",
  azure: "zh-CN-XiaoxiaoNeural"
};
function NumberField({
  score,
  field,
  value,
  min,
  max,
  step
}) {
  const [draft, setDraft] = (0, import_react.useState)(String(value ?? ""));
  (0, import_react.useEffect)(() => {
    setDraft((d) => d === String(value ?? "") ? d : String(value ?? ""));
  }, [value]);
  const commit = () => {
    const n = Number(draft);
    if (!Number.isFinite(n) || draft.trim() === "") return;
    const clamped = Math.min(max, Math.max(min, n));
    setDraft(String(clamped));
    void score.set(field, clamped);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "input",
    {
      style: inputStyle,
      type: "number",
      step,
      min,
      max,
      value: draft,
      onChange: (e) => setDraft(e.target.value),
      onBlur: commit,
      onKeyDown: (e) => {
        if (e.key === "Enter") commit();
      }
    }
  );
}
function TextField({
  score,
  field,
  value,
  placeholder
}) {
  const [draft, setDraft] = (0, import_react.useState)(String(value ?? ""));
  (0, import_react.useEffect)(() => {
    setDraft((d) => d === String(value ?? "") ? d : String(value ?? ""));
  }, [value]);
  const commit = () => {
    void score.set(field, draft);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "input",
    {
      style: inputStyle,
      value: draft,
      placeholder,
      onChange: (e) => setDraft(e.target.value),
      onBlur: commit,
      onKeyDown: (e) => {
        if (e.key === "Enter") commit();
      }
    }
  );
}
function TextAreaField({
  score,
  field,
  value,
  placeholder,
  rows = 3
}) {
  const [draft, setDraft] = (0, import_react.useState)(String(value ?? ""));
  (0, import_react.useEffect)(() => {
    setDraft((d) => d === String(value ?? "") ? d : String(value ?? ""));
  }, [value]);
  const commit = () => {
    void score.set(field, draft);
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "textarea",
    {
      style: { ...inputStyle, width: 260, minHeight: 62, resize: "vertical", lineHeight: 1.5 },
      rows,
      value: draft,
      placeholder,
      onChange: (e) => setDraft(e.target.value),
      onBlur: commit
    }
  );
}
function CredentialKeyField({ score, field, refValue, defaultRef }) {
  const [secret, setSecret] = (0, import_react.useState)("");
  const [status, setStatus] = (0, import_react.useState)("");
  const [busy, setBusy] = (0, import_react.useState)(false);
  const save = async () => {
    const ref = /^[A-Za-z_][A-Za-z0-9_]*$/.test(refValue.trim()) ? refValue.trim() : defaultRef;
    const value = secret.trim();
    if (!value) {
      setStatus("\u8BF7\u5148\u8F93\u5165\u5BC6\u94A5");
      return;
    }
    setBusy(true);
    setStatus("\u4FDD\u5B58\u4E2D\u2026");
    try {
      const res = await fetch(location.origin + BASE_PATH + "/rewrite-key", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ref, value })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setSecret("");
        if (refValue.trim() !== ref) void score.set(field, ref);
        setStatus("\u5DF2\u4FDD\u5B58\u5230 DSH \u51ED\u636E\u5E93\uFF08" + ref + "\uFF09");
      } else {
        setStatus("\u4FDD\u5B58\u5931\u8D25\uFF1A" + String(data.error ?? res.status));
      }
    } catch (e) {
      setStatus("\u4FDD\u5B58\u5931\u8D25\uFF1A" + String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "input",
      {
        type: "password",
        autoComplete: "off",
        style: inputStyle,
        value: secret,
        placeholder: "\u7C98\u8D34 API \u5BC6\u94A5",
        onChange: (e) => setSecret(e.target.value),
        onKeyDown: (e) => {
          if (e.key === "Enter") void save();
        }
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "button",
      {
        type: "button",
        disabled: busy,
        onClick: () => void save(),
        style: {
          appearance: "none",
          border: "1px solid " + t2.border,
          background: t2.bgOpen,
          color: t2.label,
          borderRadius: 8,
          padding: "6px 12px",
          font: "inherit",
          fontSize: 12,
          cursor: busy ? "default" : "pointer",
          opacity: busy ? 0.6 : 1
        },
        children: "\u4FDD\u5B58\u5230\u51ED\u636E\u5E93"
      }
    ),
    status ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { fontSize: 11, color: t2.term }, children: status }) : null
  ] });
}
function TokenUsageInline() {
  const [u, setU] = (0, import_react.useState)(null);
  const [busy, setBusy] = (0, import_react.useState)(false);
  const load = async () => {
    try {
      const res = await fetch(location.origin + BASE_PATH + "/usage");
      if (res.ok) setU(await res.json());
    } catch {
    }
  };
  (0, import_react.useEffect)(() => {
    void load();
    const timer = setInterval(() => void load(), 5e3);
    return () => clearInterval(timer);
  }, []);
  const reset = async () => {
    setBusy(true);
    try {
      await fetch(location.origin + BASE_PATH + "/usage", { method: "POST" });
      await load();
    } catch {
    } finally {
      setBusy(false);
    }
  };
  const n = (x) => Number(x ?? 0).toLocaleString("en-US");
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { name: "usageStats", desc: t("descUsageStats"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: { fontSize: 12, color: t2.label }, children: [
      t("usageRequests"),
      " ",
      n(u?.requests),
      " \xB7 ",
      t("usagePrompt"),
      " ",
      n(u?.promptTokens),
      " \xB7 ",
      t("usageCompletion"),
      " ",
      n(u?.completionTokens),
      " \xB7 ",
      t("usageTotal"),
      " ",
      n(u?.totalTokens)
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "button",
      {
        type: "button",
        disabled: busy,
        onClick: () => void reset(),
        style: {
          appearance: "none",
          border: "1px solid " + t2.border,
          background: t2.bgOpen,
          color: t2.label,
          borderRadius: 8,
          padding: "3px 10px",
          font: "inherit",
          fontSize: 11,
          cursor: busy ? "default" : "pointer",
          opacity: busy ? 0.6 : 1
        },
        children: t("usageReset")
      }
    )
  ] }) });
}
var stepBtn = {
  boxSizing: "border-box",
  width: 36,
  flex: "0 0 auto",
  cursor: "pointer",
  border: `1px solid ${t2.border}`,
  borderRadius: 8,
  background: "var(--dsw-alias-bg-layer-2)",
  color: t2.label,
  fontSize: 16,
  lineHeight: "28px",
  textAlign: "center",
  padding: 0,
  fontFamily: "inherit"
};
function VoiceSelect({
  score,
  field,
  value,
  options,
  placeholder,
  footer,
  showCustom = true
}) {
  const cur = String(value ?? "");
  const inOptions = options.some((o) => o.v === cur);
  const idx = options.findIndex((o) => o.v === cur);
  const [custom, setCustom] = (0, import_react.useState)(inOptions ? "" : cur);
  (0, import_react.useEffect)(() => {
    if (!options.some((o) => o.v === cur)) setCustom(cur);
  }, [cur, options]);
  const move = (delta) => {
    if (options.length === 0) return;
    if (inOptions) {
      const n = options.length;
      const next = options[((idx + delta) % n + n) % n];
      void score.set(field, next.v);
    } else {
      void score.set(field, options[0].v);
    }
  };
  const selectStyle = {
    ...inputStyle,
    // 下拉主控件占满剩余宽度（覆盖 inputStyle 固定 280，避免与 ‹› 并排时被压窄导致长名截断）。
    width: "auto",
    minWidth: 0,
    flex: "1 1 auto",
    appearance: "none",
    cursor: "pointer",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%2381858C' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundPosition: "right 12px center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "12px 12px",
    paddingRight: 32
  };
  const label = inOptions ? options[idx].label : custom || placeholder || "";
  const selectValue = inOptions ? cur : showCustom ? "__custom__" : options[0]?.v ?? "";
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: { display: "flex", flexDirection: "column", gap: 6, width: "100%", maxWidth: "100%", alignItems: "stretch" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: { display: "flex", gap: 6, alignItems: "center" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", "aria-label": t("voicePrev"), onClick: () => move(-1), style: stepBtn, children: "\u2039" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        "select",
        {
          style: selectStyle,
          value: selectValue,
          "aria-label": label,
          onChange: (e) => {
            const v = e.target.value;
            if (v === "__custom__") setCustom(inOptions ? "" : custom);
            else void score.set(field, v);
          },
          children: [
            options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: o.v, children: o.label }, o.v)),
            showCustom && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", { value: "__custom__", children: [
              t("custom"),
              "\u2026"
            ] })
          ]
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", "aria-label": t("voiceNext"), onClick: () => move(1), style: stepBtn, children: "\u203A" })
    ] }),
    showCustom && !inOptions && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "input",
      {
        style: inputStyle,
        value: custom,
        placeholder,
        onChange: (e) => setCustom(e.target.value),
        onBlur: () => void score.set(field, custom),
        onKeyDown: (e) => {
          if (e.key === "Enter") void score.set(field, custom);
        }
      }
    ),
    footer?.(inOptions ? cur : showCustom ? custom : cur)
  ] });
}
function VoicePreviewButton({ voice, rate }) {
  const [busy, setBusy] = (0, import_react.useState)(false);
  const [note, setNote] = (0, import_react.useState)(null);
  const audioRef = (0, import_react.useRef)(null);
  const play = () => {
    if (busy) return;
    const v = voice.trim();
    if (!v) {
      setNote(t("previewNameFirst"));
      return;
    }
    setBusy(true);
    setNote(null);
    const audio = new Audio();
    const prev = audioRef.current;
    if (prev) {
      prev.pause();
      if (prev.src.startsWith("blob:")) URL.revokeObjectURL(prev.src);
    }
    audioRef.current = audio;
    void (async () => {
      try {
        const res = await fetch(`${BASE_PATH}/preview`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ voice: v, rate }),
          signal: AbortSignal.timeout(9e4)
        });
        if (res.status === 403) {
          setNote(t("previewDisabled"));
          return;
        }
        if (res.status === 429) {
          setNote(t("previewRateLimited"));
          return;
        }
        if (!res.ok) {
          let detail = "";
          try {
            const parsed = await res.json();
            if (parsed && typeof parsed.error === "string") detail = parsed.error;
          } catch {
          }
          setNote(detail ? `${t("previewSynthesisFail")}\uFF1A${detail}` : t("previewCheck"));
          return;
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        audio.src = url;
        audio.onended = () => URL.revokeObjectURL(url);
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          setNote(t("previewPlayFail"));
        };
        try {
          await audio.play();
        } catch (e) {
          URL.revokeObjectURL(url);
          setNote(
            e instanceof DOMException && e.name === "NotAllowedError" ? t("previewAutoplay") : t("previewPlayFail")
          );
        }
      } catch (e) {
        setNote(e instanceof DOMException && e.name === "TimeoutError" ? t("previewTimeout") : t("previewCheck"));
      } finally {
        setBusy(false);
      }
    })();
  };
  const btnStyle = {
    font: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    cursor: busy ? "default" : "pointer",
    color: t2.label,
    background: "var(--dsw-alias-bg-layer-2)",
    border: `1px solid ${t2.border}`,
    borderRadius: 6,
    padding: "4px 10px",
    fontSize: 12,
    lineHeight: "18px"
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: { display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", onClick: play, disabled: busy, style: btnStyle, title: t("previewBtnTitle"), children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { viewBox: "0 0 16 16", width: 11, height: 11, "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { fill: "currentColor", d: "M4 3l9 5-9 5z" }) }),
      busy ? t("synthesizing") : t("preview")
    ] }),
    note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { color: "var(--dsw-alias-state-error-primary)", fontSize: 12, lineHeight: "18px" }, children: note })
  ] });
}
function Row({ name, desc, children }) {
  const label = FIELD_LABELS[name] ?? name;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: setRow, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: setLabelBox, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: setLabel, children: label }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: setHint, children: desc })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { flexShrink: 0, maxWidth: 300 }, children })
  ] });
}
function Section({ title, children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: 2 }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: "10px 0 2px" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--dsw-alias-label-secondary)" }, children: title }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { flex: 1, height: 1, background: t2.border } })
    ] }),
    children
  ] });
}
function SegGroup({
  score,
  field,
  value,
  options,
  onSelect
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { role: "group", style: setSeg, children: options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    "button",
    {
      style: setSegBtn(value === o.v),
      "aria-pressed": value === o.v,
      onClick: () => {
        void score.set(field, o.v);
        onSelect?.(o.v);
      },
      children: o.label
    },
    String(o.v)
  )) });
}
function EngineStatusInline() {
  const [st, setSt] = (0, import_react.useState)(null);
  const [acting, setActing] = (0, import_react.useState)(null);
  (0, import_react.useEffect)(() => {
    let alive = true;
    const poll = async () => {
      try {
        const res = await fetch(location.origin + BASE_PATH + "/models/status");
        if (res.ok && alive) setSt(await res.json());
      } catch {
      }
    };
    void poll();
    const timer = setInterval(() => void poll(), 3e3);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);
  const tts = st?.tts;
  if (!tts) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, {});
  const engineName = tts.engine === "vits" ? t("engineVits") : tts.engine === "kokoro" ? t("engineKokoro") : tts.engine === "azure" ? t("engineAzure") : t("engineEdge");
  const isLocal = !!tts.local;
  const localReady = isLocal ? !!tts.local?.ready : false;
  let statusText;
  let statusColor;
  if (tts.loading) {
    statusText = t("engineLoading");
    statusColor = t2.term;
  } else if (tts.error) {
    statusText = t("engineError");
    statusColor = "var(--dsw-alias-state-error-primary)";
  } else if (isLocal && !localReady) {
    statusText = t("ttsModelsMissing");
    statusColor = "var(--dsw-alias-state-error-primary)";
  } else {
    statusText = t("engineReady");
    statusColor = "var(--dsw-alias-state-success-primary)";
  }
  const act = (kind) => {
    setActing(kind);
    void fetch(location.origin + BASE_PATH + (kind === "clean" ? "/models/clean" : "/models/download"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ engine: tts.engine })
    }).catch(() => void 0).finally(() => setTimeout(() => setActing(null), 1500));
  };
  const action = localReady ? "clean" : "download";
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, padding: "2px 0 10px" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { fontSize: 12, color: t2.term }, children: engineName }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { fontSize: 12, fontWeight: statusText === t("engineReady") || statusText === t("engineError") ? 600 : 400, color: statusColor }, children: statusText }),
    tts.loading && tts.progress?.file && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: { fontSize: 12, color: t2.term }, children: [
      tts.progress.file,
      " ",
      tts.progress.percent,
      "%"
    ] }),
    isLocal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "button",
      {
        type: "button",
        onClick: () => act(action),
        disabled: !!acting || tts.loading,
        style: {
          font: "inherit",
          fontSize: 12,
          cursor: tts.loading ? "default" : "pointer",
          color: t2.label,
          background: "var(--dsw-alias-bg-layer-2)",
          border: `1px solid ${t2.border}`,
          borderRadius: 8,
          padding: "3px 10px",
          flexShrink: 0
        },
        title: action === "clean" ? t("ttsDeleteHint") : t("ttsDownloadHint"),
        children: acting ? acting === "clean" ? t("ttsDeleting") : t("ttsDownloading") : action === "clean" ? t("ttsDelete") : t("ttsDownload")
      }
    ),
    tts.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { fontSize: 11, color: "var(--dsw-alias-state-error-primary)", flexBasis: "100%" }, children: tts.error })
  ] });
}
function VoiceSettingsCard({ scope }) {
  const [snap, setSnap] = (0, import_react.useState)(() => scope.getSnapshot());
  const [collapsed, setCollapsed] = (0, import_react.useState)(true);
  (0, import_react.useEffect)(
    () => scope.subscribe(() => {
      setSnap({ ...scope.getSnapshot() });
    }),
    [scope]
  );
  const value = snap?.value ?? {};
  const unavailable = snap?.status === "unavailable" || snap?.status === "error";
  const engine = value.ttsEngine === "edge" ? "edge" : value.ttsEngine === "azure" ? "azure" : value.ttsEngine === "kokoro" ? "kokoro" : "vits";
  const [edgeVoices, setEdgeVoices] = (0, import_react.useState)(null);
  (0, import_react.useEffect)(() => {
    if (engine !== "edge" && engine !== "azure") return;
    let alive = true;
    void fetch(location.origin + BASE_PATH + "/voices").then((res) => res.ok ? res.json() : null).then((data) => {
      if (!alive || !data?.voices) return;
      const genderName = (g) => g === "Female" ? "\u5973" : g === "Male" ? "\u7537" : g === "Neutral" ? "\u4E2D\u6027" : g;
      const voiceName = (fn) => fn.replace(/^Microsoft\s+/, "").replace(/\s+Online\s+\(Natural\)/, "").split(/\s*-\s*/)[0].trim();
      const mkLabel = (v) => (
        // 精简标签：只留说话人名 + 性别（去掉尾部区域与 ShortName 冗余），避免 Edge 长名被截断。
        (voiceName(v.FriendlyName) || v.ShortName) + " \xB7 " + genderName(v.Gender)
      );
      const all = data.voices.map((v) => ({ v: v.ShortName, label: mkLabel(v) })).sort((a, b) => a.label.localeCompare(b.label));
      const commonKeys = new Set(VOICE_OPTIONS.map((o) => o.v));
      const pinned = VOICE_OPTIONS.filter((o) => all.some((a) => a.v === o.v));
      setEdgeVoices([...pinned, ...all.filter((a) => !commonKeys.has(a.v))]);
    }).catch(() => void 0);
    return () => {
      alive = false;
    };
  }, [engine]);
  const voiceOptions = engine === "edge" || engine === "azure" ? edgeVoices ?? VOICE_OPTIONS : engine === "kokoro" ? VOICE_OPTIONS_KOKORO : VOICE_OPTIONS_LOCAL;
  if (unavailable) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { "data-dshvma-settings": "card", style: { color: t2.term, fontSize: 12, padding: "14px 16px", ...cardStyle }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { color: "var(--dsw-alias-state-error-primary)" }, children: t("configUnavailable") }),
      t("configUnavailableNote")
    ] });
  }
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { "data-dshvma-settings": "card", style: cardStyle, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: focusVisibleCss }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", "aria-expanded": !collapsed, onClick: () => setCollapsed((c) => !c), style: { ...setHeader, background: collapsed ? "transparent" : t2.bgOpen }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: setHeadText, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: setName, children: t("stateVoiceMode") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: setDesc, children: t("settingsCardDesc") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { ...setChevron, transform: collapsed ? "rotate(0deg)" : "rotate(180deg)" }, "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { viewBox: "0 0 16 16", width: 14, height: 14, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { fill: "currentColor", d: "M4 6l4 4 4-4z" }) }) })
    ] }),
    !collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: setBody, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: 4 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: t("secRead"), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { name: "ttsEngine", desc: t("descTtsEngine"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          SegGroup,
          {
            score: scope,
            field: "ttsEngine",
            value: engine,
            options: [
              { v: "vits", label: t("engineVits") },
              { v: "kokoro", label: t("engineKokoro") },
              { v: "edge", label: t("engineEdge") },
              { v: "azure", label: t("engineAzure") }
            ],
            onSelect: (v) => {
              if (v !== engine) {
                void scope.set("voice", ENGINE_DEFAULT_VOICE[String(v)] ?? "zh-CN-XiaoxiaoNeural");
              }
            }
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EngineStatusInline, {}),
        engine === "azure" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { name: "azureEndpoint", desc: t("descAzureEndpoint"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, { score: scope, field: "azureEndpoint", value: String(value.azureEndpoint ?? ""), placeholder: "eastasia \u6216 https://eastasia.tts.speech.microsoft.com" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { name: "azureKeyRef", desc: t("descAzureKeyRef"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, { score: scope, field: "azureKeyRef", value: String(value.azureKeyRef ?? ""), placeholder: "AZURE_SPEECH_KEY" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { name: "azureSecret", desc: t("descAzureSecret"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CredentialKeyField, { score: scope, field: "azureKeyRef", refValue: String(value.azureKeyRef ?? ""), defaultRef: "AZURE_SPEECH_KEY" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { name: "azurePhonemes", desc: t("descAzurePhonemes"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextAreaField, { score: scope, field: "azurePhonemes", value: String(value.azurePhonemes ?? ""), placeholder: "\u884C => hang2\n\u94F6\u884C => yin2 hang2", rows: 4 }) })
        ] }),
        engine === "kokoro" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { name: "kokoroModel", desc: t("descKokoroModel"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          SegGroup,
          {
            score: scope,
            field: "kokoroModel",
            value: value.kokoroModel,
            options: [
              { v: "int8", label: t("kokoroModelInt8") },
              { v: "fp32", label: t("kokoroModelFp32") }
            ]
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          Row,
          {
            name: "voice",
            desc: engine === "edge" ? t("descVoice") : engine === "azure" ? t("descVoiceAzure") : engine === "kokoro" ? t("descVoiceKokoro") : t("descVoiceLocal"),
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              VoiceSelect,
              {
                score: scope,
                field: "voice",
                value: value.voice ?? "",
                options: voiceOptions,
                placeholder: ENGINE_DEFAULT_VOICE[engine] ?? "zh-CN-XiaoxiaoNeural",
                showCustom: engine === "edge" || engine === "azure",
                footer: (v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoicePreviewButton, { voice: v, rate: Number(value.rate ?? 1) })
              }
            )
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { name: "rate", desc: t("descRate"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, { score: scope, field: "rate", value: value.rate ?? 1, min: 0.5, max: 2, step: 0.1 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { name: "spokenFormat", desc: t("descSpokenFormat"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: Boolean(value.spokenFormat), onChange: (e) => void scope.set("spokenFormat", e.target.checked) }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: t("secAdaptation"), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { name: "rewriteEnabled", desc: t("descRewriteEnabled"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: Boolean(value.rewriteEnabled), onChange: (e) => void scope.set("rewriteEnabled", e.target.checked) }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { name: "rewriteBaseUrl", desc: t("descRewriteBaseUrl"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, { score: scope, field: "rewriteBaseUrl", value: value.rewriteBaseUrl ?? "", placeholder: "https://open.bigmodel.cn/api/paas/v4" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { name: "rewriteApiKeyRef", desc: t("descRewriteApiKeyRef"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, { score: scope, field: "rewriteApiKeyRef", value: value.rewriteApiKeyRef ?? "", placeholder: "GLM_API_KEY" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { name: "rewriteSecret", desc: t("descRewriteSecret"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CredentialKeyField, { score: scope, field: "rewriteApiKeyRef", refValue: String(value.rewriteApiKeyRef ?? ""), defaultRef: "GLM_API_KEY" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { name: "rewriteModel", desc: t("descRewriteModel"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextField, { score: scope, field: "rewriteModel", value: value.rewriteModel ?? "", placeholder: "glm-4.5-air" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { name: "mathMode", desc: t("descMathMode"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          SegGroup,
          {
            score: scope,
            field: "mathMode",
            value: value.mathMode,
            options: [
              { v: "rules", label: t("mathModeRules") },
              { v: "model", label: t("mathModeModel") },
              { v: "verbatim", label: t("mathModeVerbatim") }
            ]
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { name: "rewriteTimeoutMs", desc: t("descRewriteTimeout"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, { score: scope, field: "rewriteTimeoutMs", value: value.rewriteTimeoutMs ?? 8e3, min: 500, max: 6e4, step: 500 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { name: "rewriteMaxTokens", desc: t("descRewriteMaxTokens"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, { score: scope, field: "rewriteMaxTokens", value: value.rewriteMaxTokens ?? 400, min: 64, max: 4e3, step: 64 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { name: "rewriteTemperature", desc: t("descRewriteTemperature"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, { score: scope, field: "rewriteTemperature", value: value.rewriteTemperature ?? 0, min: 0, max: 2, step: 0.1 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { name: "rewriteCache", desc: t("descRewriteCache"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: Boolean(value.rewriteCache), onChange: (e) => void scope.set("rewriteCache", e.target.checked) }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { name: "rewriteDisableThinking", desc: t("descRewriteDisableThinking"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: Boolean(value.rewriteDisableThinking), onChange: (e) => void scope.set("rewriteDisableThinking", e.target.checked) }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { name: "rewriteContextChars", desc: t("descRewriteContextChars"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, { score: scope, field: "rewriteContextChars", value: value.rewriteContextChars ?? 800, min: 0, max: 4e3, step: 50 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { name: "pronunciationEnabled", desc: t("descPronunciationEnabled"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: value.pronunciationEnabled !== false, onChange: (e) => void scope.set("pronunciationEnabled", e.target.checked) }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { name: "pronunciationFixes", desc: t("descPronunciationFixes"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextAreaField, { score: scope, field: "pronunciationFixes", value: value.pronunciationFixes ?? "", placeholder: "\u8BCD => \u540C\u97F3\u66FF\u8BCD\uFF1B/\u6B63\u5219/ => \u66FF\u6362", rows: 4 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { name: "guardMode", desc: t("descGuardMode"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          SegGroup,
          {
            score: scope,
            field: "guardMode",
            value: value.guardMode,
            options: [
              { v: "off", label: t("guardModeOff") },
              { v: "lenient", label: t("guardModeLenient") },
              { v: "standard", label: t("guardModeStandard") },
              { v: "strict", label: t("guardModeStrict") }
            ]
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { name: "guardAllowRules", desc: t("descGuardAllowRules"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextAreaField, { score: scope, field: "guardAllowRules", value: value.guardAllowRules ?? "", placeholder: "\u5927 O\uFF1Bseg:/^O\\(/\uFF1B/^\u5927 Omega/", rows: 3 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { name: "wholeSentenceMath", desc: t("descWholeSentenceMath"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: value.wholeSentenceMath !== false, onChange: (e) => void scope.set("wholeSentenceMath", e.target.checked) }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, { name: "blockPauseMs", desc: t("descBlockPause"), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberField, { score: scope, field: "blockPauseMs", value: value.blockPauseMs ?? 350, min: 0, max: 3e3, step: 50 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TokenUsageInline, {})
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { fontSize: 12, color: t2.term, lineHeight: "18px", padding: "4px 0 8px" }, children: t("settingsEffectiveNote") })
    ] }) })
  ] });
}

// src/client.tsx
var inject = ["slots", "sessions", "settingsScope"];
var BUILD_TAG = "8fa4ff5";
console.log("[dsh-voice-mode-adaptation] build=" + BUILD_TAG);
var BASE_PATH2 = "/voice-mode-adaptation";
function getTabId() {
  try {
    const KEY = "dshvma-tabId";
    let id = sessionStorage.getItem(KEY);
    if (!id) {
      id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}
var TAB_ID = getTabId();
var seenAudioFrames = /* @__PURE__ */ new Map();
function audioFrameSeen(key) {
  const now = Date.now();
  if (seenAudioFrames.size > 4e3) {
    for (const [k, ts] of seenAudioFrames) {
      if (now - ts > 6e4) seenAudioFrames.delete(k);
    }
    if (seenAudioFrames.size > 4e3) seenAudioFrames.clear();
  }
  if (seenAudioFrames.has(key)) return true;
  seenAudioFrames.set(key, now);
  return false;
}
function createAudioEngine(setUi, onAllPlayed) {
  const pending = [];
  const fallbackAudio = new Audio();
  let fallback = false;
  let ctx = null;
  let duckGain = null;
  let nextEndAt = 0;
  const activeSrcs = /* @__PURE__ */ new Set();
  let decoding = false;
  const captionQueue = [];
  const warm = () => {
    if (ctx) {
      void ctx.resume?.();
      return;
    }
    try {
      const AC = window.AudioContext ?? window.webkitAudioContext;
      ctx = new AC();
      duckGain = ctx.createGain();
      duckGain.gain.value = 1;
      duckGain.connect(ctx.destination);
      void ctx.resume?.();
    } catch {
      ctx = null;
    }
  };
  const playFallback = () => {
    const frame = pending.shift() ?? null;
    if (!frame) {
      setUi({ playing: false, caption: null });
      return;
    }
    const url = URL.createObjectURL(new Blob([frame.audio], { type: frame.mime === "audio/wav" ? "audio/wav" : "audio/mpeg" }));
    fallbackAudio.src = url;
    fallbackAudio.onended = () => {
      URL.revokeObjectURL(url);
      playFallback();
    };
    fallbackAudio.onerror = () => {
      URL.revokeObjectURL(url);
      playFallback();
    };
    setUi({ playing: true, caption: frame.text, ttsNotice: null });
    const gap = Math.max(0, frame.pauseBeforeMs ?? 0);
    const startFallback = () => void fallbackAudio.play().catch(() => playFallback());
    if (gap > 0) setTimeout(startFallback, gap);
    else startFallback();
  };
  const drainPending = () => {
    if (decoding || !ctx || !duckGain || pending.length === 0) return;
    decoding = true;
    void (async () => {
      try {
        while (pending.length > 0) {
          const frame = pending[0];
          const buf = await ctx.decodeAudioData(frame.audio.buffer.slice(0));
          if (pending.length === 0 || pending[0] !== frame) return;
          pending.shift();
          const t0 = ctx.currentTime;
          const gapS = Math.max(0, frame.pauseBeforeMs ?? 0) / 1e3;
          const at = Math.max(t0 + 0.02, nextEndAt + gapS);
          const src = ctx.createBufferSource();
          src.buffer = buf;
          src.connect(duckGain);
          activeSrcs.add(src);
          src.onended = () => {
            activeSrcs.delete(src);
            captionQueue.shift();
            if (activeSrcs.size === 0 && pending.length === 0) {
              setUi({ playing: false, caption: null });
              onAllPlayed?.();
            } else if (captionQueue.length > 0) {
              setUi({ caption: captionQueue[0] });
            }
          };
          src.start(at);
          nextEndAt = at + buf.duration;
          captionQueue.push(frame.text);
          setUi({ playing: true, caption: captionQueue[0], ttsNotice: null });
        }
      } catch {
        for (const src of activeSrcs) {
          try {
            src.stop();
          } catch {
          }
        }
        activeSrcs.clear();
        captionQueue.length = 0;
        fallback = true;
        playFallback();
      } finally {
        decoding = false;
      }
    })();
  };
  return {
    push(frame) {
      if (fallback || !ctx) {
        pending.push(frame);
        if (fallbackAudio.paused) playFallback();
        return;
      }
      pending.push(frame);
      drainPending();
    },
    skip() {
      pending.length = 0;
      nextEndAt = 0;
      fallbackAudio.pause();
      fallbackAudio.onended = null;
      fallbackAudio.onerror = null;
      for (const src of activeSrcs) {
        try {
          src.stop();
        } catch {
        }
      }
      activeSrcs.clear();
      captionQueue.length = 0;
      setUi({ playing: false, caption: null });
    },
    warm,
    unduck() {
      if (!ctx || !duckGain) return;
      const now = ctx.currentTime;
      duckGain.gain.cancelScheduledValues(now);
      duckGain.gain.setTargetAtTime(1, now, 0.035);
    }
  };
}
function createReader() {
  const listeners = /* @__PURE__ */ new Set();
  const state = { autoRead: null, ownerTabId: null, playing: false, caption: null, ttsNotice: null, notice: null, speakingKey: null };
  let source = null;
  let currentSessionId = null;
  const notify = () => {
    for (const fn of listeners) {
      try {
        fn({ ...state });
      } catch {
      }
    }
  };
  const setUi = (patch) => {
    Object.assign(state, patch);
    notify();
  };
  const engine = createAudioEngine(setUi, () => setUi({ speakingKey: null }));
  const rejectSeqUpTo = /* @__PURE__ */ new Map();
  const lastFinalSeq = /* @__PURE__ */ new Map();
  let curSentenceId = null;
  let curChunks = [];
  let curBytes = 0;
  let curChunkCount = 0;
  let curGen = null;
  const doSkipAudio = (sidArg) => {
    const sid = sidArg ?? currentSessionId;
    if (sid) rejectSeqUpTo.set(sid, Math.max(lastFinalSeq.get(sid) ?? -1, curSentenceId ?? -1));
    curSentenceId = null;
    curChunks = [];
    curBytes = 0;
    curChunkCount = 0;
    engine.skip();
    setUi({ speakingKey: null });
  };
  const connect = () => {
    if (source) return;
    source = new EventSource(location.origin + BASE_PATH2 + "/stream?tabId=" + encodeURIComponent(TAB_ID));
    source.addEventListener("open", () => {
      rejectSeqUpTo.clear();
      lastFinalSeq.clear();
    });
    source.addEventListener("read", (e) => {
      try {
        const data = JSON.parse(e.data);
        state.autoRead = data.active ?? null;
        state.ownerTabId = data.ownerTabId ?? null;
        notify();
      } catch {
      }
    });
    source.addEventListener("audio", (e) => {
      try {
        const frame = JSON.parse(e.data);
        frame.sessionId = frame.sessionId ?? "";
        for (const fn of audioListeners) {
          try {
            fn(frame);
          } catch {
          }
        }
      } catch {
      }
    });
    source.addEventListener("tts-error", (e) => {
      try {
        const p = JSON.parse(e.data);
        if (p.sessionId === currentSessionId) setUi({ ttsNotice: t("ttsNoticeFail") });
      } catch {
      }
    });
  };
  const audioListeners = /* @__PURE__ */ new Set();
  audioListeners.add((frame) => {
    if (frame.sessionId !== currentSessionId) return;
    if (state.ownerTabId !== null && state.ownerTabId !== TAB_ID) return;
    const rejectLine = rejectSeqUpTo.get(frame.sessionId);
    if (rejectLine !== void 0 && frame.sentenceId <= rejectLine) return;
    const dedupKey = frame.sessionId + "#" + (frame.gen ?? 0) + "#" + frame.sentenceId + "#" + frame.chunkId + "#" + (frame.final ? 1 : 0);
    if (audioFrameSeen(dedupKey)) return;
    const gen = frame.gen ?? 0;
    if (gen !== curGen) {
      curGen = gen;
      engine.skip();
      curSentenceId = null;
      curChunks = [];
      curBytes = 0;
      curChunkCount = 0;
    }
    if (frame.sentenceId !== curSentenceId) {
      curSentenceId = frame.sentenceId;
      curChunks = [];
      curBytes = 0;
      curChunkCount = 0;
    }
    if (frame.final) {
      if (frame.chunkId !== curChunkCount) {
        curSentenceId = null;
        curChunks = [];
        curBytes = 0;
        curChunkCount = 0;
        return;
      }
      const buf = new Uint8Array(curBytes);
      let off = 0;
      for (const c of curChunks) {
        buf.set(c, off);
        off += c.length;
      }
      curSentenceId = null;
      curChunks = [];
      curBytes = 0;
      curChunkCount = 0;
      if (buf.length === 0) return;
      const isMp3 = buf[0] === 255;
      const isWav = buf.length >= 4 && buf[0] === 82 && buf[1] === 73 && buf[2] === 70 && buf[3] === 70;
      if (!isMp3 && !isWav) return;
      engine.push({
        sessionId: frame.sessionId,
        seq: frame.sentenceId,
        text: frame.text ?? "",
        audio: buf,
        mime: frame.mime,
        pauseBeforeMs: frame.pauseBeforeMs
      });
      lastFinalSeq.set(frame.sessionId, frame.sentenceId);
      return;
    }
    const bin = atob(frame.audio);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    curChunks.push(bytes);
    curBytes += bytes.length;
    curChunkCount += 1;
  });
  connect();
  const reclaimOwner = () => {
    if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
    const sid = state.autoRead;
    if (!sid || state.ownerTabId === TAB_ID) return;
    setUi({ ownerTabId: TAB_ID });
    void fetch(location.origin + BASE_PATH2 + "/read", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId: sid, on: true, tabId: TAB_ID })
    }).catch(() => void 0);
  };
  if (typeof document !== "undefined") document.addEventListener("visibilitychange", reclaimOwner);
  if (typeof window !== "undefined") window.addEventListener("focus", reclaimOwner);
  return {
    get state() {
      return state;
    },
    subscribe(fn) {
      listeners.add(fn);
      fn({ ...state });
      return () => {
        listeners.delete(fn);
      };
    },
    setCurrentSession(id) {
      if (id === currentSessionId) return;
      doSkipAudio(currentSessionId);
      currentSessionId = id;
      curGen = null;
    },
    async enter(sessionId) {
      doSkipAudio(sessionId);
      setUi({ ownerTabId: TAB_ID });
      try {
        const res = await fetch(location.origin + BASE_PATH2 + "/read", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ sessionId, on: true, tabId: TAB_ID })
        });
        const out = await res.json();
        if (!res.ok) return { ok: false, error: out.error ?? t("readFail") };
        state.autoRead = out.active ?? null;
        state.ownerTabId = out.ownerTabId ?? TAB_ID;
        notify();
        return { ok: true };
      } catch {
        return { ok: false, error: t("readFail") };
      }
    },
    async exit(sessionId) {
      doSkipAudio(sessionId);
      try {
        const res = await fetch(location.origin + BASE_PATH2 + "/read", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ sessionId, on: false, tabId: TAB_ID })
        });
        const out = await res.json();
        state.autoRead = out.active ?? null;
        state.ownerTabId = null;
        notify();
      } catch {
      }
    },
    async speak(sessionId, text, key) {
      doSkipAudio(sessionId);
      setUi({ notice: null, speakingKey: key ?? null, ownerTabId: TAB_ID });
      try {
        const res = await fetch(location.origin + BASE_PATH2 + "/speak", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ sessionId, text, tabId: TAB_ID })
        });
        if (!res.ok) {
          const out = await res.json().catch(() => ({}));
          setUi({ notice: out.error ?? t("readFail"), speakingKey: null });
          return { ok: false };
        }
        return { ok: true };
      } catch {
        setUi({ notice: t("readFail"), speakingKey: null });
        return { ok: false };
      }
    },
    stop(sessionId) {
      doSkipAudio(sessionId);
      void fetch(location.origin + BASE_PATH2 + "/cancel", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId, tabId: TAB_ID })
      }).catch(() => void 0);
    },
    dispose() {
      try {
        source?.close();
      } catch {
      }
      source = null;
      if (typeof document !== "undefined") document.removeEventListener("visibilitychange", reclaimOwner);
      if (typeof window !== "undefined") window.removeEventListener("focus", reclaimOwner);
      doSkipAudio();
      listeners.clear();
    }
  };
}
var EMPTY_NODES = [];
function useAssistantNodes(useChat) {
  const hook = typeof useChat === "function" ? useChat : null;
  if (!hook) return EMPTY_NODES;
  const nodes = hook((s) => {
    const conv = s;
    return conv?.legacy?.nodes ?? EMPTY_NODES;
  });
  return Array.isArray(nodes) ? nodes : EMPTY_NODES;
}
function extractAssistantText(nodes, messageId) {
  const parts = [];
  for (const raw of nodes) {
    const n = raw;
    if (!n || n.kind !== "assistant" || n.messageId !== messageId) continue;
    for (const b of n.blocks ?? []) {
      if (b && b.kind === "text" && typeof b.text === "string") parts.push(b.text);
    }
  }
  return parts.join("\n").trim();
}
function SpeakerIcon({ active }) {
  return React.createElement(
    "svg",
    { viewBox: "0 0 24 24", width: 16, height: 16, "aria-hidden": "true" },
    React.createElement("path", {
      fill: "currentColor",
      d: active ? "M4 9v6h4l5 4V5L8 9H4Zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4Z" : "M4 9v6h4l5 4V5L8 9H4Zm12 3a4 4 0 0 0-2-3.46v6.92A4 4 0 0 0 16 12Zm-2-7.7v2.06a6 6 0 0 1 0 11.28v2.06a8 8 0 0 0 0-15.4Z"
    })
  );
}
function SpeakerGlyph({ filled }) {
  const stroke = { stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round" };
  return React.createElement(
    "svg",
    { viewBox: "0 0 16 16", width: 15, height: 15, fill: "none", "aria-hidden": "true" },
    React.createElement(
      "path",
      filled ? { d: "M8.4 2.4 4.9 5.3H2.3v5.4h2.6l3.5 2.9V2.4Z", fill: "currentColor" } : { d: "M8.4 2.4 4.9 5.3H2.3v5.4h2.6l3.5 2.9V2.4Z", ...stroke }
    ),
    React.createElement("path", { d: "M10.7 5.9a3 3 0 0 1 0 4.2", ...stroke }),
    React.createElement("path", { d: "M12.6 3.9a5.4 5.4 0 0 1 0 8.2", ...stroke })
  );
}
function iconButtonStyle(on, disabled) {
  return {
    border: "1px solid " + (on ? "rgba(63, 185, 80, 0.45)" : "rgba(139, 148, 158, 0.35)"),
    background: on ? "rgba(63, 185, 80, 0.16)" : "rgba(139, 148, 158, 0.08)",
    cursor: disabled ? "default" : "pointer",
    padding: "5px 10px",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    fontFamily: "system-ui, sans-serif",
    color: disabled ? "#6e7681" : on ? "#3fb950" : "#8b949e",
    opacity: disabled ? 0.5 : 1,
    transition: "background 0.15s ease, color 0.2s ease, border-color 0.15s ease"
  };
}
function ReadToggleButton({ reader, sessionId }) {
  const [s, setS] = (0, import_react2.useState)(reader.state);
  (0, import_react2.useEffect)(() => reader.subscribe(setS), [reader]);
  (0, import_react2.useEffect)(() => reader.setCurrentSession(sessionId ?? null), [reader, sessionId]);
  const on = sessionId !== void 0 && s.autoRead === sessionId;
  return React.createElement(
    "button",
    {
      type: "button",
      "data-dshvm": "read-toggle",
      "aria-label": on ? t("readToggleOn") : t("readToggleOff"),
      "aria-pressed": on,
      title: on ? t("readTitleOn") : t("readTitleOff"),
      onClick: () => {
        if (!sessionId) return;
        void (on ? reader.exit(sessionId) : reader.enter(sessionId));
      },
      style: iconButtonStyle(on, sessionId === void 0)
    },
    React.createElement(SpeakerIcon, { active: on }),
    s.playing ? t("readPlaying") : t("readToggle")
  );
}
var buttonCssInjected = false;
function injectButtonCss() {
  if (buttonCssInjected || typeof document === "undefined") return;
  buttonCssInjected = true;
  const el = document.createElement("style");
  el.setAttribute("data-dshvm", "css");
  el.textContent = [
    ".dshvma-mbtn{width:calc(28px + var(--dsh-content-font-delta,0px));height:calc(28px + var(--dsh-content-font-delta,0px));color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:none;border-radius:28px;justify-content:center;align-items:center;padding:6px;display:inline-flex;transition:background .15s ease,color .15s ease,transform .08s ease}",
    ".dshvma-mbtn svg{width:calc(15px + var(--dsh-content-font-delta,0px));height:calc(15px + var(--dsh-content-font-delta,0px))}",
    ".dshvma-mbtn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}",
    ".dshvma-mbtn:active{transform:scale(.88)}",
    ".dshvma-mbtn:disabled{cursor:default;opacity:.4}",
    ".dshvma-mbtn:disabled:hover{background:0 0;color:var(--dsw-alias-label-tertiary)}",
    '.dshvma-mbtn[data-active="true"]{color:var(--dsw-alias-brand-primary)}',
    '.dshvma-mbtn[data-pulse="true"]{animation:dshvma-mbtn-pulse .5s ease-out}',
    "@keyframes dshvma-mbtn-pulse{0%{box-shadow:0 0 0 0 rgba(88,166,255,.5)}100%{box-shadow:0 0 0 9px rgba(88,166,255,0)}}"
  ].join("");
  document.head.appendChild(el);
}
function ReadMessageButton(props) {
  const { reader, messageId, sessionId, useChat } = props;
  const [s, setS] = (0, import_react2.useState)(reader.state);
  const [pulse, setPulse] = (0, import_react2.useState)(false);
  (0, import_react2.useEffect)(() => reader.subscribe(setS), [reader]);
  (0, import_react2.useEffect)(() => reader.setCurrentSession(sessionId ?? null), [reader, sessionId]);
  const nodes = useAssistantNodes(useChat);
  const text = React.useMemo(() => extractAssistantText(nodes, messageId), [nodes, messageId]);
  const disabled = !sessionId || !text;
  const key = messageId === void 0 ? null : String(messageId);
  const active = key !== null && s.speakingKey === key && s.playing;
  return React.createElement(
    "button",
    {
      type: "button",
      className: "dshvma-mbtn",
      "data-dshvm": "read-one",
      "data-active": active ? "true" : void 0,
      "data-pulse": pulse ? "true" : void 0,
      "aria-label": t("readOneTitle"),
      "aria-pressed": active,
      title: disabled ? t("readOneEmpty") : t("readOneTitle"),
      disabled,
      onClick: () => {
        if (disabled) return;
        setPulse(true);
        setTimeout(() => setPulse(false), 520);
        void reader.speak(sessionId, text, key ?? void 0);
      }
    },
    React.createElement(SpeakerGlyph, { filled: active })
  );
}
function ReadingStatusBar({ reader, sessionId }) {
  const [s, setS] = (0, import_react2.useState)(reader.state);
  (0, import_react2.useEffect)(() => reader.subscribe(setS), [reader]);
  (0, import_react2.useEffect)(() => reader.setCurrentSession(sessionId ?? null), [reader, sessionId]);
  if (!s.playing && !s.notice && !s.ttsNotice) return React.createElement(React.Fragment, null);
  const text = s.notice ?? s.ttsNotice ?? s.caption ?? t("readPlaying");
  return React.createElement(
    "div",
    {
      "data-dshvm": "reading-bar",
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 12px",
        borderRadius: 10,
        fontSize: 12,
        fontFamily: "system-ui, sans-serif",
        color: s.notice ? "#ffa657" : "#3fb950",
        background: s.notice ? "rgba(255, 166, 87, 0.08)" : "rgba(63, 185, 80, 0.08)",
        border: "1px solid " + (s.notice ? "rgba(255, 166, 87, 0.3)" : "rgba(63, 185, 80, 0.25)")
      }
    },
    React.createElement("span", { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexGrow: 1 } }, text),
    React.createElement(
      "button",
      {
        type: "button",
        onClick: () => {
          if (sessionId) reader.stop(sessionId);
        },
        style: {
          font: "inherit",
          cursor: "pointer",
          color: "inherit",
          background: "transparent",
          border: "1px solid currentColor",
          borderRadius: 8,
          padding: "2px 10px",
          flexShrink: 0
        }
      },
      t("readStop")
    )
  );
}
function apply(ctx) {
  injectButtonCss();
  const g = globalThis;
  try {
    g.__dshvmaReader__?.dispose();
  } catch {
  }
  const reader = createReader();
  g.__dshvmaReader__ = reader;
  ctx.slots.inject(
    "conversation.input.right",
    () => ctx.slots.register(
      {
        name: "conversation.input.right",
        id: "voice-mode-adaptation-read",
        order: 80,
        inject: () => ({ reader })
      },
      ReadToggleButton
    )
  );
  ctx.slots.inject(
    "conversation.input.dock",
    () => ctx.slots.register(
      {
        name: "conversation.input.dock",
        id: "voice-mode-adaptation-reading",
        order: 10,
        inject: () => ({ reader })
      },
      ReadingStatusBar
    )
  );
  ctx.slots.inject(
    "conversation.chat.assistant-actions",
    () => ctx.slots.register(
      {
        name: "conversation.chat.assistant-actions",
        id: "voice-mode-adaptation-speak",
        order: 20,
        inject: () => ({ reader })
      },
      ReadMessageButton
    )
  );
  if (ctx.settingsScope) {
    ctx.slots.inject(
      "settings.plugin.item",
      () => ctx.slots.register(
        {
          name: "settings.plugin.item",
          id: "voice-mode-adaptation",
          key: "voice-mode-adaptation",
          order: 100,
          label: t("stateVoiceMode")
        },
        () => React.createElement(VoiceSettingsCard, { scope: ctx.settingsScope.bind({ namespace: "voice-mode-adaptation" }) })
      )
    );
  }
  if (typeof ctx.effect === "function") {
    ctx.effect(() => () => {
      if (g.__dshvmaReader__ === reader) g.__dshvmaReader__ = void 0;
      reader.dispose();
    });
  }
}
return module.exports; } });
