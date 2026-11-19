# 模板：题库（bank，旧名 outline-bank）

用于"知识点树 + 题库"的科目（医学、法考、考研、行测等）：知识点仍按章节树组织，题目按**覆盖的知识点**归类，
可以挂在任意根节点或叶子节点上，一道题可以覆盖多个知识点。

其余规则（熟练度、每日目标、错题、批改格式、每周检查）与其它模板完全一致。

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

-- 题库：宿主优先把它当作取题池（题目本身就是被问的"条目"）
CREATE TABLE questions (
  id          TEXT PRIMARY KEY,
  prompt      TEXT NOT NULL,              -- 题干
  answer      TEXT NOT NULL,              -- 标准答案（短答/选择项原文）
  options     TEXT NOT NULL DEFAULT '[]', -- 选择题选项 JSON 数组；非选择题留 '[]'
  explanation TEXT DEFAULT '',            -- 解析
  kind        TEXT DEFAULT 'short',       -- choice / short / cloze / essay
  difficulty  INTEGER NOT NULL DEFAULT 3, -- 1-5，用于难度分层（可选）
  proficiency INTEGER NOT NULL DEFAULT 4, -- 与知识点同一套 0-10 规则
  learned     INTEGER NOT NULL DEFAULT 0,
  source      TEXT DEFAULT '',
  created_at  TEXT NOT NULL,
  updated_at  TEXT
);

-- 覆盖关系：一道题可以覆盖多个知识点（根或叶都可以）
CREATE TABLE question_points (
  question_id TEXT NOT NULL,
  point_id    TEXT NOT NULL,
  weight      REAL NOT NULL DEFAULT 1,   -- 该题对这一知识点的代表程度（0-1）
  PRIMARY KEY (question_id, point_id)
);

CREATE TABLE sources (
  path TEXT PRIMARY KEY, signature TEXT NOT NULL,
  extracted TEXT NOT NULL DEFAULT '[]', count INTEGER NOT NULL DEFAULT 0,
  checked_at TEXT NOT NULL
);

CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT);
```

索引建议：

```sql
CREATE INDEX idx_questions_proficiency ON questions(proficiency);
CREATE INDEX idx_question_points_point ON question_points(point_id);
CREATE UNIQUE INDEX idx_questions_prompt ON questions(prompt);
```

## 建库流程

1. 先按 `outline` 的方式生成章节树与知识点（细节见 `outline` 模板），知识点要能对应到可考的范围。
2. 再导入题目：来源可以是题库文件（Excel/CSV/PDF）、教材课后题、用户提供的真题。
3. 每题必须建立**至少一条** `question_points` 覆盖关系：
   - 章节综合题可挂到该章的所有核心知识点（`weight` 取小值，如 0.5）；
   - 单一知识点的选择/填空题挂到对应叶子（`weight = 1`）；
   - 不要挂到完全没有对应知识的章节上，否则复习排序失去意义。
4. 去重：`questions.prompt` 唯一；同一题多来源时保留最先导入的一条，补充 `explanation` 即可。
5. 写 `meta.template = 'outline-bank'` 与 `meta.learning_mode`。

## 出题与计分（宿主行为，不要自己实现）

- 取题池是 `questions` 表：
  - **新题**：`learned = 0` 的题，随机；
  - **复习**：`learned = 1` 且 `proficiency < 10` 的题，按**它覆盖的最弱知识点**排序（同一题挂多个点时取最低的那个）。
- 判分：题目自身 `proficiency` 按 ±1 变化（0-10，0 分锁 3 天不加分）；
  同时把它覆盖的**每个知识点**也按同方向 ±1（知识点到 10 视为掌握）。
- 熟练度到 10：该题不再出现，并自动删除对应错题。
- 错题记录里的 `itemId` 是**题目 id**，对话侧不需要区分题目与知识点。

## 学习方式（写入 meta.learning_mode）

- `problem` 以题带点（默认）：先做题，再回到知识点讲原因
- `lecture` 先讲后测
- `recall` 主动回忆

## 导入脚本示例（study_run_program）

```js
import { DatabaseSync } from 'node:sqlite'
const db = new DatabaseSync('learning/knowledge.db')
const insertQ = db.prepare(
  'INSERT OR IGNORE INTO questions (id,prompt,answer,options,explanation,kind,difficulty,source,created_at) VALUES (?,?,?,?,?,?,?,?,?)',
)
const insertLink = db.prepare('INSERT OR IGNORE INTO question_points (question_id,point_id,weight) VALUES (?,?,?)')
// 每个题目对象带 pointTitles，用来查 points.title 得到 id 再建立覆盖关系
console.log('imported', insertQ.run('q1', '…题干…', '…答案…', '["A","B"]', '…解析…', 'choice', 3, '教材 p12', new Date().toISOString()).changes)
db.close()
```

## 熟练度与对话规则

与 `outline` / `word-bank` 相同：

- 初始 4，范围 0–10；首次作答把 `learned` 置 1
- 到 0：仍每天出题，3 天内答对不加分
- 到 10：已掌握，移出错题
- 分数只在库里变化，对话里不得展示

## 与其它模板的差异

| 模板 | 取题池 | 适合 |
|---|---|---|
| `word-bank` | `cards` | 单词、术语、缩写 |
| `outline` | `points` | 章节化的知识点讲解与复述 |
| `outline-bank` | `questions` | 有题库、按知识点覆盖分类的科目 |
| `custom` | `cards` 或 `points` | 自定义字段，但表名必须一致 |
