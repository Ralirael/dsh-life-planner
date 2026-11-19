# 模板：列表库（list，旧名 word-bank）

用于背单词、术语、名解这类"正反两面"的知识。

## 目录布局

```
<工作区>/learning/
├── knowledge.db      # 本模板创建的 SQLite
├── index.md          # 人读目录：来源、条目数、最近更新、学习方式
└── materials/        # 资料文件（或引用记录）
```

## knowledge.db 结构

```sql
CREATE TABLE cards (
  id          TEXT PRIMARY KEY,
  front       TEXT NOT NULL,              -- 正面：单词 / 术语
  back        TEXT NOT NULL,              -- 反面：释义
  extra       TEXT DEFAULT '',            -- 例句、词性、备注
  proficiency INTEGER NOT NULL DEFAULT 4, -- 熟练度 0-10，新条目从 4 开始
  learned     INTEGER NOT NULL DEFAULT 0, -- 0=还没学过（算"新内容"），答题后由宿主置 1
  source      TEXT DEFAULT '',            -- 来源文件相对路径
  section     TEXT DEFAULT '',            -- 章节 / 单元
  created_at  TEXT NOT NULL,
  updated_at  TEXT
);
CREATE UNIQUE INDEX cards_front ON cards(front);

CREATE TABLE sources (
  path        TEXT PRIMARY KEY,           -- 相对 materials/ 的路径
  signature   TEXT NOT NULL,              -- md5 + 大小 + 修改时间
  extracted   TEXT NOT NULL DEFAULT '[]', -- 提取了什么：["word"] / ["word","example"]
  count       INTEGER NOT NULL DEFAULT 0,
  checked_at  TEXT NOT NULL
);

CREATE TABLE meta (
  key TEXT PRIMARY KEY,
  value TEXT
);  -- learning_mode / template / last_update 等
```

## 学习方式（写入 meta.learning_mode）

- `zh2en` 看中文说英文
- `en2zh` 看英文说中文
- `spell` 听写 / 拼写
- `mixed` 混合（默认）

## 入库流程

1. 遍历书架条目的文件（目录递归）
2. 对每个文件算签名（md5 + 大小 + mtime），与 `sources` 比对
3. 新文件 → 全量提取；签名变化 → 增量补入；已记录但 `extracted` 不全 → 补齐
4. 去重按 `front` 唯一索引，已存在则只补 `source`/`section`，不覆盖熟练度
5. 写回 `sources` 与 `meta.last_update`，再调用 `study_set_summary` 回写插件摘要

## 省 token 的复用

入库前先查其它学习任务工作区的 `sources.signature`，命中同一签名则直接复制条目，不重复解析。

## 熟练度自动调整

- **初始值 4**（新录入的条目一律 4，不要写 0）
- 答对：+1；答错：-1，并记入错题
- 到 **10**：视为已掌握，**不再出现**
- 到 **0**：仍然每天出题，但 **3 天内答对不加分**；3 天后恢复正常计分
- 熟练度变化**只写库，不在对话里展示**
