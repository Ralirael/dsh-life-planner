# 模板：自定义（custom）

用于用户自己定义结构的学习任务（如错题集、案例库、语言写作素材）。

## 流程

1. 与用户确认三件事：
   - 记录什么（字段列表与含义）
   - 熟练度怎么算（0–10 的推进规则）
   - 一次学习交互长什么样（问什么、答什么、怎样算完成）
2. 在 `<工作区>/learning/knowledge.db` 建表，**必须包含**：
   - `sources(path, signature, extracted, count, checked_at)`
   - `meta(key, value)`，至少写 `template=custom`、`learning_mode=<描述>`
   - 主表**必须是 `cards`（front/back/extra）或 `points`（title/detail）之一**，并含
     `id / proficiency / learned / source / created_at / updated_at`；宿主按这两个表名出题与判题
   - 自定义主表名宿主无法识别，出题会返回 `kind: "unknown"` 的空题目列表（不会报错，更难排查）
3. 把字段说明写进 `index.md`，供后续对话加载

## 约束

- 事件类数据（每次练习记录）放 `events` 表，别塞进主表
- 熟练度统一 0–10，规则写入 `meta`
- 文件签名与提取记录必须维护，否则无法增量更新
