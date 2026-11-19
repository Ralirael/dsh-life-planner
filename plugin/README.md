# plugin/ —— dsh-life-planner 实现说明

版本见 `package.json`（当前 0.9.37）。需求、架构、界面、工具清单见上级文档：

- [需求台账](../docs/需求台账.md)
- [架构与数据](../docs/架构与数据.md)
- [界面与外观](../docs/界面与外观.md)
- [工具与路由](../docs/工具与路由.md)
- [开发与验证](../docs/开发与验证.md)

## 构建

```bash
node build-client.mjs      # src/client/** → client.js（带三重防回归断言）
node --check index.js
node --check client.js
node test/smoke.mjs        # 宿主，含 43 个工具、路由、去重索引、外观持久化
node test/smoke-client.mjs # 客户端，含 5 个插槽注册
```

`client.js` 是构建产物，**不要手改**；`src/client/**` 共享同一作用域，不是 ES 模块。

## 结构

```text
plugin/
├─ package.json        bundle 清单（dsh.bundle.patch + dsh.client）
├─ cordis.patch.yml    插入 life-planner 一行（插件级开关默认值）
├─ index.js            Host：SQLite 存储、/life-planner/api 路由、43 个工具
├─ client.js           **构建产物**：由 build-client.mjs 从 src/client/ 拼接
├─ build-client.mjs    零依赖构建脚本（固定加载顺序 + 占位符/产物断言 + 版本注入）
├─ assets/             随包分发的默认背景图（default-background.webp）
├─ src/client/         客户端源码
│  ├─ index.js         模块加载器契约 + /*__INCLUDES__*/ 构建入口
│  ├─ i18n.js          中英文词典（只放文案）
│  ├─ skin.js           CSS 与设计令牌（只放样式）
│  ├─ skins.js         内置皮肤令牌
│  ├─ appearance.js    外观模型：字号 8 档、背景/蒙版、皮肤、宿主持久化
│  ├─ api.js            /life-planner/api 调用封装（超时、重试、GET 去重）
│  ├─ helpers.js       日期、优先级、树结构等纯函数
│  ├─ ui.js            Icon / Dropdown / Switch / Modal 等通用组件
│  ├─ background.js    页面提醒的后台队列（唯一轮询源）
│  ├─ views/           calendar / tree / board / archive
│  ├─ dialogs/         item-editor / settings / shelf-picker
│  └─ panels/          planning（规划页）、study（学习页）及各 study 分区
├─ templates/          知识库模板（word-bank / outline / custom / ingest / teaching）
├─ locale/             插件卡片标题与描述（zh/en）
└─ test/               冒烟测试；诊断脚本在 test/tools/
```

## 关键约定

- **单一任务类型**：所有树节点都是 `task`；类别取自顶层祖先标题，创建时推导、之后可手改。
- **外观持久化在宿主**：`ui_state` 表（`appearance` / `skins`）。Web 端口每次启动会变，localStorage 只作首帧缓存。
- **学习任务不自动创建**：由学习对话调用 `study_register_task`，或学习页显式添加；一个会话最多一条（唯一索引）。
- **知识库在工作区**：`<workspace>/learning/knowledge.db` 平时只读，`study_run_program` 执行期间临时解封。
- **提醒**：宿主每分钟扫描写 `notifications`；页面打开时由 `background.js` 轮询并 ack，未投递通知不按年龄丢弃。
