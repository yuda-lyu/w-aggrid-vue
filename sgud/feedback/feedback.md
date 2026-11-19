# 回饋(feedback)

任務結束時之回饋紀錄與提案(自有套件、全域技能、全域設定),一條一列;實際修改仍依全域設定走通報管道,不在本套件內直接動他套件或全域檔.

| 日期 | 類別 | 對象 | 內容 | 依據 |
|---|---|---|---|---|
| 2026-11-19 | 自有套件 | wsemi(下游盤點方法) | wsemi 1.9.69 使 `isstr`／`isestr` 對包裝物件為 false 後,下游之連動不只在「傳包裝物件進函數」處(字面 `new String(`),也在**以 `isstr(v) ? 顯示原值 : Object.prototype.toString.call(v)` 組訊息**之處:本套件 `descInvalid` 使 `new String('boxed')` 之提示由 `boxed` 變為 `[object String]`,致 e2e 期望字串失配.建議下游盤點除字面外,另盤「以 isstr／isestr／isnum 分流之訊息或序列化」站點 | `src/components/WAggridVue.vue:185-187`;`test/e2e-download-extended.test.mjs:91`(全套跑出 1 紅) |
