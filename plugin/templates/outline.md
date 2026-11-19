# 模板：知识树（tree，旧名 outline）

用于数学、计算机、医学等有明确章节结构的知识。

## knowledge.db 结构

```sql
CREATE TABLE chapters (
  id        TEXT PRIMARY KEY,
  title     TEXT NOT NULL,
  ord       INTEGER NOT NULL DEFAULT 0,
  source    TEXT DEFAULT ''
);

CREATE TABLE points (
  id          TEXT PRIMARY KEY,
  chapter_id  TEXT,
  title       TEXT NOT NULL,
  detail      TEXT DEFAULT '',            -- 要点 / 公式 / 定义
  proficiency INTEGER NOT NULL DEFAULT 4, -- 0-10，新知识点从 4 开始
  learned     INTEGER NOT NULL DEFAULT 0, -- 0=新内容，答题后由宿主置 1
  source      TEXT DEFAULT '',
  created_at  TEXT NOT NULL,
  updated_at  TEXT
);

CREATE TABLE sources (
  path TEXT PRIMARY KEY, signature TEXT NOT NULL,
  extracted TEXT NOT NULL DEFAULT '[]', count INTEGER NOT NULL DEFAULT 0,
  checked_at TEXT NOT NULL
);

CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT);
```

## 生成大纲

1. 先读书架内教材目录 / 网课大纲
2. 不足时按用户需求联网搜索，补全章节
3. 章节 → 知识点要**足够细**（一个知识点 30 分钟内可讲完）
4. 初始熟练度：新知识点一律从 **4** 开始（不要写 0；0 会进入 3 天不加分期，但仍每天出题）

## 学习方式（写入 meta.learning_mode）

- `lecture` 先讲后测（默认）
- `problem` 以题带点
- `recall` 主动回忆

## 入库流程

与 word-bank 相同：签名比对 → 新增/增量/补齐 → 去重按 `(chapter_id, title)` → 回写 `study_set_summary`。

## 熟练度调整

- **初始值 4**
- 讲完能复述要点：+1
- 做题正确：+1；错误：-1 并进错题
- 到 10：已掌握，不再出现；到 0：仍每天出题，但 3 天内答对不加分
- 变化只写库，不在对话里展示分数
