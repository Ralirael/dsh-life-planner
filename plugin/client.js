// Entry: the DSH module loader contract plus the shared factory scope.
// Build with: node build-client.mjs   (writes ../client.js)
window.__ModuleLoader__.load({
  id: '@local/dsh-life-planner',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const NS = 'life-planner';

// ---- i18n.js ----
// i18n.js — dictionaries for both locales; edit only the strings here.
const DICTS = {
  zh: {
    studyStatusManaged: '完成状态由学习进度管理',
    studyDoubleClick: '双击打开设置',
    studyNoSubjectLink: '未关联科目',
    boardDragHint: "拖动卡片排序或换列 · Alt + 方向键也可移动",
    studyNoActive: "暂无进行中的学习任务",
    studyDropFuture: "将学习任务拖到这里，安排稍后开始",
    studyStartOptional: "开始时间（选填）",
    studyStartHint: "到点自动开始并发送系统通知。留空时，可之后手动开始。",
    studySetStart: "设置开始时间",
    studyStartNow: "现在开始",
    studySchedule: "安排稍后",
    studyUnscheduledStart: "未设开始时间",
    studyMoveUp: "科目上移",
    studyMoveDown: "科目下移",
    studyExistingPlans: "之前生成的计划",
    studyGrading: "部分正确的判定",
    studyGrading_strict: "严格 · 判错",
    studyGrading_neutral: "适中 · 熟练度不变",
    studyGrading_lenient: "宽松 · 判对",
    notifyStudy: "学习任务开始",
    habitSessions: "按学习对话统计",
    habitHourly: "常用学习时段",
    habitCompletion: "近 14 天完成情况",
    habitStudyDone: "学习目标达成日数",
    habitTaskDone: "完成规划任务",
    habitOnTime: "到期前完成",
    habitNoTime: "进入学习模式对话并保持窗口活动后，会记录使用时长。",
    tipPending: "今日建议正在准备",
    tipLocal: "本地综合建议",
    tipDeepSeek: "DeepSeek 今日建议",
    tipRegion: "所在地区",
    tipRegionAuto: "自动识别",
    tipRegionHint: "例如：上海或 Shanghai，留空自动识别",
    calendarTodayInfo: "今日日期、天气与生活建议",
    calendarTodayShort: "今日详情",
    calendarFullDate: "{y}年{m}月{d}日",
    calendarLunar: "农历",
    calendarTemperature: "最低 / 最高",
    calendarRain: "最高降水概率",
    calendarWind: "最大风速",
    calendarSun: "日出 / 日落",
    calendarRegionUnknown: "地区待设置",
    calendarLifeAdvice: "生活建议",
    calendarAdviceUpdated: "更新于",
    calendarRefreshing: "正在刷新日历信息…",
    calendarAdvicePending: "刷新后会根据天气和规划给出建议。",
    calendarAdviceTask: "优先安排「{n}」，并留出一段不被打断的时间。",
    calendarAdviceOverdue: "有 {n} 项任务已过期。先决定哪些今天处理，哪些需要重新排期。",
    calendarAdviceBlocked: "检查今天的任务有没有要先完成的事项，并为后续任务留出时间。",
    calendarAdviceNoTasks: "今天没有待开始或到期的任务，可以留一段时间处理长期事项或休息。",
    weatherClear: "晴",
    weatherPartly: "晴间多云",
    weatherCloud: "阴",
    weatherFog: "雾",
    weatherStorm: "雷阵雨",
    weatherSnow: "雪",
    weatherRain: "有雨",
    weatherUnavailable: "暂无天气预报",
    calendarAdvice_storm: "雷雨时段尽量安排室内事项，外出前看一下临近预报。",
    calendarAdvice_snow: "如需出门，为步行和通勤留出余量。",
    calendarAdvice_rain: "外出时带伞，给路上的安排多留些时间。",
    calendarAdvice_heat: "需要外出的话，尽量安排在较凉爽的时段并带水。",
    calendarAdvice_cold: "早晚外出多带一层衣物，给通勤留出时间。",
    calendarAdvice_wind: "风较大，外出前确认交通和户外安排。",
    calendarAdvice_fair: "可以把短散步安排在工作或学习间隙。",
    settingsLocation: "地区与日历",
    settingsCurrentRegion: "当前使用",
    calendarRefreshMode: "日历刷新方式",
    calendarRefreshAuto: "自动 · 每天中午 12 点",
    calendarRefreshManual: "仅手动刷新",
    calendarLockRegion: "锁定地区",
    calendarLockHint: "保留已识别的地区，刷新时继续更新该地天气。手动填写可更改地区。",
    calendarRefreshHint: "可随时手动更新日历天气与生活建议。",
    calendarRefreshOnSave: "先保存此处改动。更改地区会立即刷新日历和学习建议。",
    calendarRefreshNow: "立即刷新",
    settingsStudyAdviceHint: "每天凌晨 4 点更新；手动更改地区时，用新地区重新生成一次。",
    settingsNotifyWindows: "提醒时段与频率",
    settingsNotifyLead: "提前提醒",
    notifyPermission_granted: "已允许",
    notifyPermission_denied: "已拒绝",
    notifyPermission_default: "待授权",
    notifyPermission_unsupported: "当前环境不支持",
    navLabel: '规划',
    loading: '正在加载…',
    tabCalendar: '日历',
    tabTree: '工作树',
    tabPlan: '规划书',
    tabArchive: '已归档的任务',
    tabBoard: '看板',
    colTodo: '待办',
    colDoing: '进行中',
    colBlocked: '被阻塞',
    colDone: '已完成',
    emptyArchive: '还没有归档的任务。',
    restore: '恢复到原计划',
    archivedAt: '归档于',
    exportData: '导出 JSON',
    importData: '导入 JSON',
    exported: '已导出',
    imported: '导入完成：新增 {a} 条，覆盖 {u} 条',
    invalidWindows: '时段格式不对，应形如 10:00-13:00,19:00-02:00',
    typeLabel: '任务类型',
    typeNone: '未分类',
    tagsLabel: '标签',
    tagsEmpty: '还没有任何标签，先添加一个',
    tagsNewHint: '输入新标签后回车',
    tagsAdd: '添加',
    groupHierarchy: '按层级',
    groupTag: '按标签',
    groupType: '按类型',
    untagged: '未标签',
    untyped: '未分类',
    studyNav: '学习',
    studyTabToday: '今日学习',
    studyTipTitle: '今日建议',
    studyTabPlan: '学习规划',
    studyTabShelf: '书架',
    studyTabMistakes: '错题集',
    studyTabHabit: '习惯',
    habitStreak: '连续',
    habitDays: '天',
    habitAvg: '平均',
    habitRate: '完成率',
    habitEmpty: '还没有学习记录，打开学习页即可开始计时',
    habitSegments: '{n} 段',
    timePlanTitle: '本周学习时间规划',
    timePlanTotal: '合计',
    timePlanActual: '实际',
    timePlanAgentHint: '这份时间表由学习模式对话根据你的实际学习记录自动规划，无需手动填写',
    timePlanLoading: '正在读取本周规划…',
    habitRecent: '最近学习记录',
    studySubjects: '科目',
    studyNoSubject: '还没有科目',
    studyExam: '考试',
    studyNoExam: '无考试',
    studySubjectEdit: '编辑科目',
    studySubjectTitle: '科目名称',
    studyExamDate: '考试日期',
    studyExamDateHint: 'YYYY-MM-DD，留空表示无考试',
    studyNote: '备注',
    studyGenerate: '生成计划',
    studyGenerateAsk: '将删除该学科现有的未完成计划与对应任务，然后重新生成，继续吗？',
    studyGenerated: '已生成',
    studyUnscheduled: '排不下',
    studyUpcoming: '未来安排',
    studyNoPlan: '还没有安排',
    studyMinuteUnit: ' 分钟',
    studyDone: '已完成',
    studyTodayPlan: '今日计划',
    studyTodayTasks: '今日学习任务',
    studyTodayCompleted: '{n}/{total} 已完成',
    studyNoTodayPlan: '今天还没有安排',
    studyFinish: '完成',
    studyMistakeReview: '错题复习',
    studyNoMistake: '暂时没有到期的错题',
    studyTaskList: '进行中的学习任务',
    studyNewLabel: '新学',
    studyReviewLabel: '复习',
    studyWeekPlan: '本周计划 {n} 分钟',
    studyNoTask: '还没有学习模式对话对应的任务',
    studyEntries: '条',
    studyTaskTitle: '任务标题',
    studyTaskPath: '工作区绝对路径',
    studyTaskAdd: '添加',
    studyTaskEditHint: '点击编辑标题、路径与书架',
    studyTaskDeleteConfirm: '确认删除这个学习任务？工作区里的资料文件不会被删除。',
    studyTaskEdit: '编辑学习任务',
    studyTaskNew: '新建学习任务',
    studyTaskTemplate: '数据模板',
    studyTaskShelf: '书架资料',
    studyTaskNoShelf: '书架为空，先去书架添加资料',
    studyTaskMissing: '工作区路径不存在',
    studyTaskDoneToday: '今日已完成',
    studyTaskOverdue: '逾期 {n} 天',
    shelfUrl: '网站',
    shelfFile: '文件',
    shelfDir: '目录',
    shelfAuto: '自动判断',
    shelfPathHint: '粘贴路径或网址',
    shelfTagsHint: '标签，逗号分隔',
    shelfEmpty: '书架是空的',
    shelfFiles: '个文件',
    shelfPending: '待抓取',
    shelfNotFetched: '未抓取',
    shelfTruncated: '已截断',
    shelfTruncatedHint: '目录超过 800 项，列表只保留前 800 项；拷贝到学习任务时仍会全量复制',
    shelfEditHint: '双击编辑名称、路径与标签',
    shelfEdit: '编辑书架条目',
    shelfName: '名称',
    shelfPath: '路径',
    shelfTags: '标签',
    shelfNote: '备注',
    shelfLocked: '已锁定：agent 不再自动修改名称与标签',
    shelfAutoHint: '保存后将锁定名称与标签，agent 不再自动改写',
    shelfUnlock: '恢复自动更新',
    shelfOpen: '打开',
    shelfMissing: '文件或目录不存在',
    shelfOpenFailed: '无法打开',
    shelfDeleteAsk: '删除这个书架条目？已挂到学习任务的材料关联也会一并移除。',
    mistakeQuestion: '题目',
    mistakeAnswer: '正确答案',
    mistakeReason: '错误原因',
    mistakeEmpty: '还没有错题',
    mistakeAllTasks: '全部学习对话',
    mistakeNoTask: '未关联学习任务',
    mistakeFrom: '开始日期',
    mistakeTo: '结束日期',
    mistakeEdit: '编辑错题',
    mistakePreview: '错题详情',
    mistakeMemoryTip: '记忆提示',
    mistakeMaterialSource: '资料来源',
    mistakePdfPage: 'PDF 第 {n} 页',
    mistakeBookPage: '印刷页 {n}',
    mistakeDblClick: '双击放大查看',
    mistakeDeleteAsk: '删除这道错题？删除后不可恢复。',
    close: '关闭',
    mistakeExplain: '快速讲解',
    mistakeCopied: '讲解请求已复制，粘贴到「{name}」对话发送即可',
    mistakeSource: '来源对话',
    edit: '编辑',
    clear: '清除',
    studyAddSubject: '新建科目',
    studyDue: '待复习',
    studyNoDue: '暂时没有需要复习的内容',
    masteryReadOnly: '掌握度由教学对话维护，不可手动修改',
    masteryLearning: '学习中',
    masteryReview: '需复习',
    filterNone: '不筛选',
    filterTag: '按标签',
    filterType: '按类型',
    filterPriority: '按优先级',
    filterDue: '按截止日期',
    filterValue: '选择筛选内容',
    filterClear: '清除筛选',
    toneLow: '低',
    toneMedium: '中',
    toneHigh: '高',
    toneHighest: '最高',
    dueOverdue: '已逾期',
    dueToday: '今天',
    dueSoon: '3 天内',
    dueNone: '无截止',
    dueBefore: '某日期之前',
    colorReset: '恢复自动',
    addPlaceholder: '加一件要做的事，回车保存',
    addButton: '添加',
    newItem: '新建',
    planPlaceholder: '写下长期计划和个人情况。',
    saveButton: '保存规划书',
    emptyDay: '这一天没有安排。',
    emptyTree: '还没有任何条目，先建一个领域或项目。',
    search: '搜索标题',
    filter_all: '全部',
    filter_open: '未完成',
    filter_blocked: '被阻塞',
    filter_done: '已完成',
    expandAll: '展开全部',
    expandCalendar: '展开日历',
    collapseAll: '折叠全部',
    newChild: '在此项下新建',
    newChildPlaceholder: '输入标题，回车创建；Esc 取消',
    blockedBy: '被 {n} 项阻塞',
    rename: '重命名',
    delete: '删除',
    treeDeleteAsk: '删除「{name}」？',
    treeDeleteMove: '它下面的 {n} 项会上移到上一级',
    previousMonth: '上个月',
    nextMonth: '下个月',
    outdent: '上移一级',
    blockedChildren: '还有未完成的子任务：',
    blockedDeps: '还有未完成的前置任务：',
    forceComplete: '仍要标记完成吗？',
    forceCompleteTitle: '无法完成',
    deletedHint: '已删除',
    freqLabel: '重复',
    freqNone: '不重复',
    freqDaily: '每天',
    freqWeekly: '每周',
    freqMonthly: '每月',
    undoHint: '点击这条提醒可撤销（5 分钟内有效）',
    notifyShort: '近期任务提醒',
    notifyLong: '长期计划提醒',
    noDueDate: '无截止日期',
    overdueLabel: '已逾期',
    markDone: '标记完成',
    markUndone: '取消完成',
    doneLabel: '已完成',
    noMatch: '没有匹配的条目。',
    blocked: '被阻塞',
    archive: '归档',
    moveUp: '上移',
    moveDown: '下移',
    titleLabel: '标题',
    parentLabel: '父级',
    dueLabel: '截止',
    sectionBasic: '基本信息',
    sectionClass: '分类',
    sectionTime: '时间与地点',
    sectionExtra: '说明与其他',
    tabTags: '分类与标签',
    tabGeneral: '通用设置',
    tabNotify: '通知设置',
    tabAppearance: '外观与皮肤',
    sectionSkin: '皮肤预设',
    skinDefault: '默认',
    skinClawd: 'Clawd 风格',
    sectionFont: '文字大小',
    fFontTab: '页签（日历 / 工作树 / 看板 / 归档）',
    fFontTitle: '标题与月份',
    fFontCalendar: '日历格子（日期与条目）',
    fFontTask: '任务行与卡片',
    fFontType: '任务类型',
    fFontTag: '任务标签',
    fFontMeta: '辅助文字（时间、地点、提示）',
    fFontBase: '其它文本（基础字号）',
    fFontHint: '按日历页从上到下的顺序排列；单位统一为像素，改动即时生效。输入框跟随所在区块，图标不随字号缩放',
    sectionSize: '布局与间距',
    sectionMistake: '错题集',
    fMistakeCols: '每行显示几张（0 = 自动铺满）',
    fMistakeHeight: '卡片高度（0 = 自适应；超出截断）',
    fMistakeTitleFs: '题目字号',
    fMistakeAnswerFs: '正确答案字号',
    fMistakeReasonFs: '错因字号',
    fMistakeHint: '卡片横向铺满页面；高度不足时答案与错因按行截断并显示省略号，双击卡片可查看全文',
    sectionAccent: '分区主题色',
    sectionBackground: '背景图',
    skinAppearanceOwner: '当前编辑「{name}」。外观改动即时预览并自动保存。',
    skinOverwrite: '覆盖现有的同名自定义皮肤？',
    skinDeleteConfirm: '移除自定义皮肤「{name}」？',
    settingsPreview: '查看页面效果',
    settingsReturn: '返回设置',
    layoutCalendar: '日历与当天清单',
    layoutStudyToday: '今日学习布局',
    layoutStudyPlan: '学习规划布局',
    layoutSpacing: '页面间距',
    layoutFontFamily: '字体风格',
    layout_auto: '宽屏并排',
    layout_stacked: '始终上下排列',
    layout_compact: '紧凑',
    layout_standard: '标准',
    layout_roomy: '宽松',
    layout_system: '系统字体',
    layout_serif: '衬线字体',
    settingsNumberRange: '请输入 {min} 到 {max} 之间的整数。',
    settingsRetentionOrder: '自动删除天数须大于或等于自动归档天数。',
    settingsQuotaOrder: '每时段的非紧急提醒数须小于或等于总提醒数。',
    settingsLeadHint: '父任务使用单独的提前天数，三天内到期的任务按短期规则提醒。长期提醒间隔设为 0 可关闭长期提醒。',
    tagLibraryColor: '标签颜色',
    fSurface: '面板透明度',
    fSurfaceHint: '使用图片或纯色背景时，控制日历和卡片的透明程度。',
    tagNamePlaceholder: '输入类别名称',
    addTag: '添加类别',
    existingTags: '已有类别',
    tagColor: '类别颜色',
    noTags: '还没有类别，先在上方输入名称',
    fSkinPreset: '皮肤',
    skinExport: '导出皮肤',
    skinImport: '导入皮肤',
    skinImported: '皮肤已导入',
    skinSaveAs: '命名并保存当前状态为皮肤',
    skinDelete: '删除该皮肤',
    skinNamePlaceholder: '皮肤名称',
    skinNameRequired: '先输入皮肤名称',
    skinSaved: '已保存为皮肤',
    skinDeleted: '皮肤已删除',
    bgModeNone: '不使用背景',
    bgModeColor: '纯色填充',
    bgModeImage: '图片背景',
    bgColor: '背景色',
    bgColorHint: '说明',
    bgColorHintText: '纯色会铺满整页，面板保持半透明以便层次感',
    fMaskOn: '启用蒙版',
    fMaskSide: '蒙版方向',
    fMaskWidth: '蒙版范围',
    fMaskStrength: '蒙版浓度',
    sideLeft: '左', sideRight: '右', sideTop: '上', sideBottom: '下',
    fCalHeight: '日历高度（像素）',
    fCalHeightHint: '高度设为 0 时自动适配窗口。手动可设 320–1600 像素，按窗口可用空间显示。',
    fAccentPlanning: '规划分区主题色',
    fAccentStudy: '学习分区主题色',
    fBgPlanning: '规划页背景',
    fBgStudy: '学习页背景',
    fBgImport: '导入图片',
    fBgOpen: '打开背景文件夹',
    fBgClear: '移除背景',
    fBgOpacity: '图片透明度',
    bgSyncAsk: '也把这张背景用于当前皮肤的学习页吗？',
    bgLoadFailed: '背景已保存，但图片读取失败（可尝试重启 DSH）',
    on: '开',
    off: '关',
    sectionNotify: '通知参数',
    fSystemNotify: '启用系统通知',
    fSystemNotifyHint: '关闭后提醒只在 DSH 窗口内显示，不再弹系统通知',
    sectionTask: '任务参数',
    sectionData: '数据',
    generalHint: '学习模式、学习面板与每日学习分钟数属于插件级开关，在插件管理页修改，重启生效',
    sectionTags: '任务类别',
    sectionTagLibrary: '标签',
    tagLibName: '输入标签名称',
    tagLibAdd: '添加标签',
    tagLibExisting: '已有标签',
    tagLibEmpty: '还没有标签，先在上方输入名称',
    taskTypeAutoHint: '这里维护任务编辑器中的类别选项和颜色。工作树的分组标题随最上层任务变化。',
    startLabel: '开始时间',
    locationLabel: '地点',
    locationHint: '如 图书馆三楼',
    priorityLabel: '优先级',
    noteLabel: '备注',
    depsLabel: '前置任务',
    depsHint: '勾选的任务全部完成后，本任务才会解锁',
    noDeps: '暂无可选任务',
    save: '保存',
    cancel: '取消',
    kindTask: '任务',
    priorityHigh: '高',
    priorityMedium: '中',
    priorityLow: '低',
    rootParent: '无依赖',
    switchLabel: '计划',
    stateOn: '开',
    stateOff: '关',
    switchTipOn: '本会话可以使用计划工具，点击关闭',
    switchTipOff: '本会话不能使用计划工具，点击开启',
    today: '今天',
    unscheduled: '长期任务',
    settings: '设置',
    noticeTitle: '计划提醒',
    enableNotify: '启用系统通知',
    notifyTest: '发送测试通知',
    notifyState: '系统通知：{s}',
    notifyDefault: '尚未授权',
    notifyGranted: '已允许系统通知',
    notifyDenied: '系统拒绝了通知权限，请在系统设置里允许 DSH 通知',
    notifyUnsupported: '当前环境不支持系统通知，提醒只会显示在页面右上角',
    notifySent: '已发送测试通知；没看到请检查系统「勿扰模式」',
    notifyTestBody: '如果你看到这条通知，说明系统通知可用。',
    notifyFailed: '失败：{e}',
    fWeekdayWindows: '工作日提醒时段（如 10:00-13:00,19:00-02:00）',
    fWeekendWindows: '周末提醒时段',
    fLeadTaskDays: '任务提前天数',
    fLeadProjectDays: '父任务提前天数',
    fGapMinutes: '两条提醒最小间隔（分钟）',
    fQuota: '每个时段非紧急提醒上限',
    fMaxDefer: '顺延上限（小时）',
    fArchiveDays: '完成后多少天自动归档',
    fDeleteDays: '归档后多少天自动删除',
    fLongTermHours: '长期任务提醒周期（小时）',
    fMaxPerWindow: '每个时段最多提醒几条',
    dayLabel: '{m} 月 {d} 日',
    monthLabel: '{y} 年 {m} 月',
    itemsCount: '{n} 项',
    wd0: '一',
    wd1: '二',
    wd2: '三',
    wd3: '四',
    wd4: '五',
    wd5: '六',
    wd6: '日',
  },
  en: {
    studyStatusManaged: 'Completion follows study progress',
    studyDoubleClick: 'Double-click to open settings',
    studyNoSubjectLink: 'No subject',
    boardDragHint: "Drag to reorder or move between columns · Alt + arrow keys also work",
    studyNoActive: "No active study tasks",
    studyDropFuture: "Drop a study task here to schedule it for later",
    studyStartOptional: "Start time (optional)",
    studyStartHint: "Scheduled tasks start automatically and send a notification. Leave blank to start manually.",
    studySetStart: "Set start time",
    studyStartNow: "Start now",
    studySchedule: "Schedule for later",
    studyUnscheduledStart: "No start time",
    studyMoveUp: "Move subject up",
    studyMoveDown: "Move subject down",
    studyExistingPlans: "Previously generated plans",
    studyGrading: "Grading for partially correct answers",
    studyGrading_strict: "Strict · mark incorrect",
    studyGrading_neutral: "Balanced · leave mastery unchanged",
    studyGrading_lenient: "Lenient · mark correct",
    notifyStudy: "Study task starting",
    habitSessions: "By study conversation",
    habitHourly: "Usual study hours",
    habitCompletion: "Completion in the past 14 days",
    habitStudyDone: "Study goal days achieved",
    habitTaskDone: "Planning tasks completed",
    habitOnTime: "Completed on time",
    habitNoTime: "Time is recorded while a study conversation is open and the window is active.",
    tipPending: "Preparing today’s advice",
    tipLocal: "Local daily advice",
    tipDeepSeek: "DeepSeek daily advice",
    tipRegion: "Region",
    tipRegionAuto: "Auto-detect",
    tipRegionHint: "For example: Shanghai. Leave blank for automatic detection.",
    calendarTodayInfo: "Today’s date, weather and life tips",
    calendarTodayShort: "Today’s details",
    calendarFullDate: "{y}/{m}/{d}",
    calendarLunar: "Chinese lunar date",
    calendarTemperature: "Low / High",
    calendarRain: "Peak chance of rain",
    calendarWind: "Peak wind",
    calendarSun: "Sunrise / Sunset",
    calendarRegionUnknown: "Set your region",
    calendarLifeAdvice: "Life tips",
    calendarAdviceUpdated: "Updated",
    calendarRefreshing: "Refreshing calendar information…",
    calendarAdvicePending: "Refresh to get tips based on weather and your plan.",
    calendarAdviceTask: "Set aside an uninterrupted block for “{n}” first.",
    calendarAdviceOverdue: "{n} tasks are overdue. Decide which to do today and which to reschedule.",
    calendarAdviceBlocked: "Check what needs to happen before today’s tasks and reserve time for what follows.",
    calendarAdviceNoTasks: "Nothing is due or scheduled to start today. Leave time for longer-term work or rest.",
    weatherClear: "Clear",
    weatherPartly: "Partly cloudy",
    weatherCloud: "Overcast",
    weatherFog: "Fog",
    weatherStorm: "Thunderstorms",
    weatherSnow: "Snow",
    weatherRain: "Rain",
    weatherUnavailable: "Forecast unavailable",
    calendarAdvice_storm: "Plan indoor activities around thunderstorms and check the latest forecast before heading out.",
    calendarAdvice_snow: "Allow extra time for walking and commuting if you need to go out.",
    calendarAdvice_rain: "Take an umbrella and allow more travel time.",
    calendarAdvice_heat: "If you need to go out, choose a cooler part of the day and bring water.",
    calendarAdvice_cold: "Bring an extra layer in the morning or evening and leave time for travel.",
    calendarAdvice_wind: "Expect strong winds. Check travel and outdoor plans before going out.",
    calendarAdvice_fair: "Consider taking a short walk between work or study blocks.",
    settingsLocation: "Region & calendar",
    settingsCurrentRegion: "Current location",
    calendarRefreshMode: "Calendar refresh",
    calendarRefreshAuto: "Automatic · noon daily",
    calendarRefreshManual: "Manual only",
    calendarLockRegion: "Lock region",
    calendarLockHint: "Keep the detected location while refreshing its forecast. You can still enter a different location.",
    calendarRefreshHint: "You can refresh calendar weather and life tips at any time.",
    calendarRefreshOnSave: "Save these changes first. A new location refreshes calendar and study advice immediately.",
    calendarRefreshNow: "Refresh now",
    settingsStudyAdviceHint: "Updates at 4 am. Entering a new region triggers one update using that region.",
    settingsNotifyWindows: "Reminder windows & frequency",
    settingsNotifyLead: "Advance reminders",
    notifyPermission_granted: "Allowed",
    notifyPermission_denied: "Denied",
    notifyPermission_default: "Permission pending",
    notifyPermission_unsupported: "Unavailable in this environment",
    navLabel: 'Planner',
    loading: 'Loading…',
    tabCalendar: 'Calendar',
    tabTree: 'Work tree',
    tabPlan: 'Plan',
    tabArchive: 'Archived',
    tabBoard: 'Board',
    colTodo: 'To do',
    colDoing: 'Doing',
    colBlocked: 'Blocked',
    colDone: 'Done',
    emptyArchive: 'Nothing archived yet.',
    restore: 'Restore',
    archivedAt: 'Archived',
    exportData: 'Export JSON',
    importData: 'Import JSON',
    exported: 'Exported',
    imported: 'Imported: {a} added, {u} replaced',
    invalidWindows: 'Window format must look like 10:00-13:00,19:00-02:00',
    typeLabel: 'Task type',
    typeNone: 'Unclassified',
    tagsLabel: 'Tags',
    tagsEmpty: 'No tags yet — add the first one',
    tagsNewHint: 'Type a new tag and press Enter',
    tagsAdd: 'Add',
    groupHierarchy: 'By hierarchy',
    groupTag: 'By tag',
    groupType: 'By type',
    untagged: 'Untagged',
    untyped: 'Unclassified',
    studyNav: 'Study',
    studyTabToday: 'Today',
    studyTipTitle: "Today's advice",
    studyTabPlan: 'Plan',
    studyTabShelf: 'Shelf',
    studyTabMistakes: 'Mistakes',
    studyTabHabit: 'Habits',
    habitStreak: 'Streak',
    habitDays: 'days',
    habitAvg: 'Average',
    habitRate: 'Completion',
    habitEmpty: 'No study time recorded yet — keep this page open to start counting',
    habitSegments: '{n} segments',
    timePlanTitle: 'This week’s study time',
    timePlanTotal: 'Total',
    timePlanActual: 'Actual',
    timePlanAgentHint: 'This timetable is planned by your study conversation from real study time; there is nothing to fill in',
    timePlanLoading: 'Loading this week…',
    habitRecent: 'Recent study',
    studySubjects: 'Subjects',
    studyNoSubject: 'No subjects yet',
    studyExam: 'Exam',
    studyNoExam: 'No exam',
    studySubjectEdit: 'Edit subject',
    studySubjectTitle: 'Subject name',
    studyExamDate: 'Exam date',
    studyExamDateHint: 'YYYY-MM-DD; leave empty for no exam',
    studyNote: 'Note',
    studyGenerate: 'Generate plan',
    studyGenerateAsk: 'This replaces the subject\u2019s unfinished plan and its tasks, then regenerates. Continue?',
    studyGenerated: 'Generated',
    studyUnscheduled: 'left out',
    studyUpcoming: 'Upcoming',
    studyNoPlan: 'Nothing scheduled yet',
    studyMinuteUnit: ' min',
    studyDone: 'done',
    studyTodayPlan: "Today's plan",
    studyTodayTasks: "Today's study tasks",
    studyTodayCompleted: '{n}/{total} completed',
    studyNoTodayPlan: 'Nothing planned for today',
    studyFinish: 'Finish',
    studyMistakeReview: 'Mistake review',
    studyNoMistake: 'No mistakes are due',
    studyTaskList: 'Active study tasks',
    studyNewLabel: 'New',
    studyReviewLabel: 'Review',
    studyWeekPlan: 'Week plan {n} min',
    studyNoTask: 'No study-mode conversation is registered yet',
    studyEntries: 'entries',
    studyTaskTitle: 'Task title',
    studyTaskPath: 'Absolute workspace path',
    studyTaskAdd: 'Add',
    studyTaskEditHint: 'Click to edit title, path and shelf materials',
    studyTaskDeleteConfirm: 'Delete this study task? Files in the workspace are kept.',
    studyTaskEdit: 'Edit study task',
    studyTaskNew: 'New study task',
    studyTaskTemplate: 'Data template',
    studyTaskShelf: 'Shelf materials',
    studyTaskNoShelf: 'The shelf is empty — add materials first',
    studyTaskMissing: 'Workspace path not found',
    studyTaskDoneToday: 'Done today',
    studyTaskOverdue: 'Overdue {n}d',
    shelfUrl: 'Web',
    shelfFile: 'File',
    shelfDir: 'Folder',
    shelfAuto: 'Detect automatically',
    shelfPathHint: 'Path or URL',
    shelfTagsHint: 'Tags, comma separated',
    shelfEmpty: 'The shelf is empty',
    shelfFiles: 'files',
    shelfTruncated: 'truncated',
    shelfTruncatedHint: 'The folder has more than 800 entries, so the list keeps the first 800; copying to a study task still copies everything.',
    shelfPending: 'pending fetch',
    shelfNotFetched: 'not fetched',
    shelfEditHint: 'Double-click to edit its name, path and tags',
    shelfEdit: 'Edit shelf item',
    shelfName: 'Name',
    shelfPath: 'Path',
    shelfTags: 'Tags',
    shelfNote: 'Note',
    shelfLocked: 'Locked: the agent no longer changes the name or tags',
    shelfAutoHint: 'Saving locks the name and tags against automatic updates',
    shelfUnlock: 'Allow automatic updates',
    shelfOpen: 'Open',
    shelfMissing: 'File or folder not found',
    shelfOpenFailed: 'Could not open',
    shelfDeleteAsk: 'Delete this shelf item? Materials already attached to study tasks lose the link too.',
    mistakeQuestion: 'Question',
    mistakeAnswer: 'Answer',
    mistakeReason: 'Why wrong',
    mistakeEmpty: 'No mistakes yet',
    mistakeAllTasks: 'All study conversations',
    mistakeNoTask: 'No study task',
    mistakeFrom: 'From',
    mistakeTo: 'To',
    mistakeEdit: 'Edit mistake',
    mistakePreview: 'Mistake details',
    mistakeMemoryTip: 'Memory tip',
    mistakeMaterialSource: 'Material sources',
    mistakePdfPage: 'PDF page {n}',
    mistakeBookPage: 'Print page {n}',
    mistakeDblClick: 'Double-click to enlarge',
    mistakeDeleteAsk: 'Delete this mistake? This cannot be undone.',
    close: 'Close',
    mistakeExplain: 'Explain',
    mistakeCopied: 'Explanation request copied — paste it into "{name}" and send',
    mistakeSource: 'Source conversation',
    edit: 'Edit',
    clear: 'Clear',
    studyAddSubject: 'New subject',
    studyDue: 'Due for review',
    studyNoDue: 'Nothing due right now',
    masteryReadOnly: 'Mastery is maintained by the tutoring conversation and cannot be edited here',
    masteryLearning: 'Learning',
    masteryReview: 'Review',
    filterNone: 'No filter',
    filterTag: 'By tag',
    filterType: 'By type',
    filterPriority: 'By priority',
    filterDue: 'By due date',
    filterValue: 'Pick a value',
    filterClear: 'Clear filter',
    toneLow: 'Low',
    toneMedium: 'Medium',
    toneHigh: 'High',
    toneHighest: 'Highest',
    dueOverdue: 'Overdue',
    dueToday: 'Today',
    dueSoon: 'Within 3 days',
    dueNone: 'No due date',
    dueBefore: 'Before a date',
    colorReset: 'Back to automatic',
    addPlaceholder: 'Add something to do, press Enter',
    addButton: 'Add',
    newItem: 'New',
    planPlaceholder: 'Write down your long-term plan and situation.',
    saveButton: 'Save plan',
    emptyDay: 'Nothing planned for this day.',
    emptyTree: 'No items yet. Create an area or project first.',
    search: 'Search titles',
    filter_all: 'All',
    filter_open: 'Open',
    filter_blocked: 'Blocked',
    filter_done: 'Done',
    expandCalendar: 'Expand calendar',
    expandAll: 'Expand all',
    collapseAll: 'Collapse all',
    newChild: 'New inside',
    newChildPlaceholder: 'Title, then Enter; Esc cancels',
    blockedBy: 'blocked by {n}',
    rename: 'Rename',
    delete: 'Delete',
    treeDeleteAsk: 'Delete \u201c{name}\u201d?',
    treeDeleteMove: 'Its {n} child items move up one level.',
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    outdent: 'Move out one level',
    blockedChildren: 'Unfinished subtasks:',
    blockedDeps: 'Unfinished prerequisites:',
    forceComplete: 'Mark it done anyway?',
    forceCompleteTitle: 'Cannot complete yet',
    deletedHint: 'Deleted',
    freqLabel: 'Repeat',
    freqNone: 'No repeat',
    freqDaily: 'Daily',
    freqWeekly: 'Weekly',
    freqMonthly: 'Monthly',
    undoHint: 'Click to undo (within 5 minutes)',
    notifyShort: 'Upcoming reminder',
    notifyLong: 'Long-term reminder',
    noDueDate: 'no due date',
    overdueLabel: 'overdue',
    markDone: 'Mark done',
    markUndone: 'Mark not done',
    doneLabel: 'Done',
    noMatch: 'No matching items.',
    blocked: 'blocked',
    archive: 'Archive',
    moveUp: 'Move up',
    moveDown: 'Move down',
    titleLabel: 'Title',
    parentLabel: 'Parent',
    dueLabel: 'Due',
    sectionBasic: 'Basics',
    sectionClass: 'Classification',
    sectionTime: 'Time and place',
    sectionExtra: 'Notes and more',
    tabTags: 'Categories & tags',
    tabGeneral: 'General',
    tabNotify: 'Notifications',
    tabAppearance: 'Appearance & skin',
    sectionSkin: 'Skin presets',
    skinDefault: 'Default',
    skinClawd: 'Clawd style',
    sectionFont: 'Font sizes',
    fFontTab: 'Tabs (calendar / tree / board / archive)',
    fFontTitle: 'Titles and month',
    fFontCalendar: 'Calendar cells (dates and entries)',
    fFontTask: 'Task rows and cards',
    fFontType: 'Task type',
    fFontTag: 'Task tags',
    fFontMeta: 'Supporting text (time, place, hints)',
    fFontBase: 'Everything else (base size)',
    fFontHint: 'Ordered like the calendar page from top to bottom; every value is in pixels and applies at once. Inputs follow their block and icons do not scale',
    sectionSize: 'Layout & spacing',
    sectionMistake: 'Mistake cards',
    fMistakeCols: 'Cards per row (0 = fill the width)',
    fMistakeHeight: 'Card height (0 = fit content; overflow is clipped)',
    fMistakeTitleFs: 'Question size',
    fMistakeAnswerFs: 'Correct answer size',
    fMistakeReasonFs: 'Reason size',
    fMistakeHint: 'Cards fill the page width; when the height is too small the answer and reason are clamped with an ellipsis. Double-click a card for the full text.',
    sectionAccent: 'Area colours',
    sectionBackground: 'Background image',
    skinAppearanceOwner: 'Editing “{name}”. Appearance changes preview live and save automatically.',
    skinOverwrite: 'Replace the custom skin with this name?',
    skinDeleteConfirm: 'Remove the custom skin “{name}”?',
    settingsPreview: 'Preview page',
    settingsReturn: 'Return to settings',
    layoutCalendar: 'Calendar and daily list',
    layoutStudyToday: 'Today’s study layout',
    layoutStudyPlan: 'Study planner layout',
    layoutSpacing: 'Page spacing',
    layoutFontFamily: 'Font style',
    layout_auto: 'Side by side on wide screens',
    layout_stacked: 'Always stacked',
    layout_compact: 'Compact',
    layout_standard: 'Standard',
    layout_roomy: 'Roomy',
    layout_system: 'System font',
    layout_serif: 'Serif font',
    settingsNumberRange: 'Enter a whole number between {min} and {max}.',
    settingsRetentionOrder: 'The deletion threshold must be at least the archive threshold.',
    settingsQuotaOrder: 'The non-urgent quota must fit within the total per-window limit.',
    settingsLeadHint: 'Parent tasks have their own lead time. Short-term rules apply within three days. Set the long-term interval to 0 to turn it off.',
    tagLibraryColor: 'Tag color',
    fSurface: 'Panel transparency',
    fSurfaceHint: 'Controls calendar and card transparency over an image or solid color.',
    tagNamePlaceholder: 'Category name',
    addTag: 'Add category',
    existingTags: 'Existing categories',
    tagColor: 'Category colour',
    noTags: 'No categories yet — type a name above',
    fSkinPreset: 'Skin',
    skinExport: 'Export skin',
    skinImport: 'Import skin',
    skinImported: 'Skin imported',
    skinSaveAs: 'Name and save current state as a skin',
    skinDelete: 'Delete this skin',
    skinNamePlaceholder: 'Skin name',
    skinNameRequired: 'Type a skin name first',
    skinSaved: 'Skin saved',
    skinDeleted: 'Skin deleted',
    bgModeNone: 'No background',
    bgModeColor: 'Solid colour',
    bgModeImage: 'Image',
    bgColor: 'Background colour',
    bgColorHint: 'Note',
    bgColorHintText: 'A solid colour fills the page; panels stay translucent for depth',
    fMaskOn: 'Mask',
    fMaskSide: 'Mask side',
    fMaskWidth: 'Mask reach',
    fMaskStrength: 'Mask strength',
    sideLeft: 'Left', sideRight: 'Right', sideTop: 'Top', sideBottom: 'Bottom',
    fCalHeight: 'Calendar height (px)',
    fCalHeightHint: 'Set 0 to fit the window, or enter 320–1600 pixels. The window limits the displayed height.',
    fAccentPlanning: 'Planning accent',
    fAccentStudy: 'Study accent',
    fBgPlanning: 'Planning background',
    fBgStudy: 'Study background',
    fBgImport: 'Import image',
    fBgOpen: 'Open background folder',
    fBgClear: 'Remove background',
    fBgOpacity: 'Image opacity',
    bgSyncAsk: 'Also use this background on the study page for this skin?',
    bgLoadFailed: 'Background saved, but the image could not be read (a DSH restart may help)',
    on: 'On',
    off: 'Off',
    sectionNotify: 'Notifications',
    fSystemNotify: 'System notifications',
    fSystemNotifyHint: 'When off, reminders only show inside the DSH window',
    sectionTask: 'Tasks',
    sectionData: 'Data',
    generalHint: 'Study mode, the study panel and daily study minutes are plugin-level switches in the plugin manager; a restart applies them',
    sectionTags: 'Task categories',
    sectionTagLibrary: 'Tags',
    tagLibName: 'Tag name',
    tagLibAdd: 'Add tag',
    tagLibExisting: 'Existing tags',
    tagLibEmpty: 'No tags yet — type a name above',
    taskTypeAutoHint: 'A category name is the title of the topmost node (under 学习 it becomes 学习); this list only holds names and colours',
    startLabel: 'Start',
    locationLabel: 'Location',
    locationHint: 'e.g. Library, 3rd floor',
    priorityLabel: 'Priority',
    noteLabel: 'Note',
    depsLabel: 'Prerequisites',
    depsHint: 'This task unlocks once every checked task is done',
    noDeps: 'No selectable tasks',
    save: 'Save',
    cancel: 'Cancel',
    kindTask: 'Task',
    priorityHigh: 'High',
    priorityMedium: 'Medium',
    priorityLow: 'Low',
    rootParent: 'No dependency',
    switchLabel: 'Planner',
    stateOn: 'On',
    stateOff: 'Off',
    switchTipOn: 'Planner tools are available in this chat; click to turn off',
    switchTipOff: 'Planner tools are unavailable in this chat; click to turn on',
    today: 'Today',
    unscheduled: 'Long-term',
    settings: 'Settings',
    noticeTitle: 'Plan reminder',
    enableNotify: 'Enable system notifications',
    notifyTest: 'Send a test notification',
    notifyState: 'System notifications: {s}',
    notifyDefault: 'not requested',
    notifyGranted: 'allowed',
    notifyDenied: 'denied by the system; allow DSH notifications in system settings',
    notifyUnsupported: 'this environment has no system notifications; reminders stay in the panel corner',
    notifySent: 'Test notification sent; check Do Not Disturb if it did not appear',
    notifyTestBody: 'Seeing this means system notifications work.',
    notifyFailed: 'failed: {e}',
    fWeekdayWindows: 'Weekday reminder windows (e.g. 10:00-13:00,19:00-02:00)',
    fWeekendWindows: 'Weekend reminder windows',
    fLeadTaskDays: 'Task lead time (days)',
    fLeadProjectDays: 'Parent task lead time (days)',
    fGapMinutes: 'Gap between reminders (minutes)',
    fQuota: 'Non-urgent reminders per window',
    fMaxDefer: 'Deferral ceiling (hours)',
    fArchiveDays: 'Auto-archive after (days)',
    fDeleteDays: 'Auto-delete after archiving (days)',
    fLongTermHours: 'Long-term reminder cycle (hours)',
    fMaxPerWindow: 'Max reminders per window',
    dayLabel: '{m}/{d}',
    monthLabel: '{m}/{y}',
    itemsCount: '{n}',
    wd0: 'Mon',
    wd1: 'Tue',
    wd2: 'Wed',
    wd3: 'Thu',
    wd4: 'Fri',
    wd5: 'Sat',
    wd6: 'Sun',
  },
};

// ---- skin.js ----
// skin.js — generated from the original single-file client; edit here, then run node build-client.mjs.
const CSS = `
.lp-page{position:relative;display:flex;flex-direction:column;height:100%;min-height:0;background-color:var(--lp-bg-color,var(--dsw-alias-bg-base));background-image:var(--lp-bg-fade,none),var(--lp-bg-overlay,none),var(--lp-bg-image,none);background-size:cover,cover,cover;background-position:center,center,center;background-repeat:no-repeat;color:var(--dsw-alias-label-primary);position:relative;}
.lp-page input[type="checkbox"],.lp-page input[type="radio"]{accent-color:var(--dsw-alias-brand-primary);}
.lp-page :focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px;}
.lp-page ::placeholder{color:var(--dsw-alias-label-secondary);opacity:.85;}
.lp-head{display:flex;align-items:center;gap:8px;padding:12px 16px;border-bottom:1px solid var(--dsw-alias-border-l2);-webkit-app-region:drag;app-region:drag;}
/* Frameless hosts drag the window by this bar; controls must stay clickable. */
.lp-head button,.lp-head input,.lp-head select,.lp-head textarea,.lp-head a,.lp-head [role="button"],.lp-head .lp-dd,.lp-head .lp-select{-webkit-app-region:no-drag;app-region:no-drag;}
.lp-tabs{display:flex;gap:4px;flex:1;}
.lp-tab{border:1px solid transparent;background:transparent;color:var(--dsw-alias-label-secondary);border-radius:8px;padding:6px 12px;font:inherit;cursor:pointer;}
.lp-tab[data-active="true"]{background:var(--dsw-alias-bg-layer-2);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 18%,transparent);color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-brand-primary);}
.lp-body{flex:1;min-height:0;overflow:auto;padding:16px;}
.lp-cal-scroll{flex:1;min-height:0;overflow:auto;position:relative;overflow-anchor:none;overscroll-behavior:contain;}
.lp-cal-sticky{position:sticky;top:0;z-index:5;overflow:hidden;background:var(--lp-surface-bg,var(--dsw-alias-bg-base));border:1px solid var(--dsw-alias-border-l2);border-radius:var(--lp-r-lg,12px);margin:8px 10px 0;height:var(--lp-cal-h,420px);transition:height .2s ease;}
.lp-cal-month{position:absolute;left:0;right:0;top:0;display:flex;flex-direction:column;transition:opacity .18s ease;}
.lp-cal-expand{position:absolute;right:10px;top:50%;transform:translateY(-50%);z-index:6;width:26px;height:26px;border-radius:50%;border:1px solid var(--dsw-alias-border-l2);background:var(--lp-control-bg,var(--dsw-alias-bg-layer-2));color:var(--dsw-alias-label-secondary);cursor:pointer;line-height:1;font-size:12px;display:inline-flex;align-items:center;justify-content:center;}
.lp-cal-expand:hover{color:var(--dsw-alias-label-primary);}
.lp-cal-week{position:absolute;left:0;right:0;top:0;height:64px;display:flex;align-items:center;gap:6px;padding:0 12px;box-sizing:border-box;transition:opacity .18s ease;}
.lp-cal-bar{display:flex;align-items:center;gap:8px;padding:10px 14px;border-bottom:1px solid var(--dsw-alias-border-l2);}
.lp-cal-side{flex:1;display:flex;align-items:center;gap:6px;}
.lp-cal-side[data-right="true"]{justify-content:flex-end;}
.lp-iconbtn{width:28px;height:28px;border-radius:7px;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;padding:0;line-height:1;}
.lp-iconbtn:hover{background:var(--dsw-alias-bg-layer-2);background:color-mix(in srgb,var(--dsw-alias-label-primary) 10%,transparent);}
.lp-cal-title{font-weight:600;font-size:var(--lp-title-fs,15px);text-align:center;white-space:nowrap;}
.lp-wd{display:grid;grid-template-columns:repeat(7,1fr);color:var(--dsw-alias-label-secondary);font-size:var(--lp-cal-fs,12px);text-align:center;padding:7px 0;border-bottom:1px solid var(--dsw-alias-border-l2);}
.lp-grid{display:grid;grid-template-columns:repeat(7,1fr);grid-auto-rows:1fr;flex:1;min-height:0;}
.lp-cell{border-right:1px solid var(--dsw-alias-border-l2);border-bottom:1px solid var(--dsw-alias-border-l2);border-right-color:color-mix(in srgb,var(--dsw-alias-label-primary) 25%,transparent);border-bottom-color:color-mix(in srgb,var(--dsw-alias-label-primary) 25%,transparent);padding:6px 8px;box-sizing:border-box;cursor:pointer;display:flex;flex-direction:column;gap:2px;overflow:hidden;min-height:0;}
.lp-cell:nth-child(7n){border-right:none;}
.lp-cell[data-edge-left="true"]{border-left:1px solid var(--dsw-alias-border-l2);border-left-color:color-mix(in srgb,var(--dsw-alias-label-primary) 25%,transparent);}
.lp-cell[data-edge-right="true"]{border-right:1px solid var(--dsw-alias-border-l2);border-right-color:color-mix(in srgb,var(--dsw-alias-label-primary) 25%,transparent);}
.lp-cell[data-edge-top="true"]{border-top:1px solid var(--dsw-alias-border-l2);border-top-color:color-mix(in srgb,var(--dsw-alias-label-primary) 25%,transparent);}
.lp-cell[data-edge-bottom="true"]{border-bottom:1px solid var(--dsw-alias-border-l2);border-bottom-color:color-mix(in srgb,var(--dsw-alias-label-primary) 25%,transparent);}
.lp-cell[data-dim="true"]{border-right-color:color-mix(in srgb,var(--dsw-alias-label-primary) 10%,transparent);border-bottom-color:color-mix(in srgb,var(--dsw-alias-label-primary) 10%,transparent);}
.lp-cell[data-dim="true"] .lp-num,
.lp-cell[data-dim="true"] .lp-cell-title,
.lp-cell[data-dim="true"] .lp-cell-more,
.lp-cell[data-dim="true"] .lp-count{opacity:.5;}
.lp-cell[data-selected="true"]{background:var(--dsw-alias-bg-layer-2);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 16%,transparent);}
.lp-cell[data-selected="true"] .lp-cell-title{color:var(--dsw-alias-label-primary);}
.lp-cell[data-today="true"]{box-shadow:inset 0 0 0 2px var(--dsw-alias-brand-primary);}
.lp-cell:hover{background:var(--dsw-alias-bg-layer-1);background:color-mix(in srgb,var(--dsw-alias-label-primary) 9%,transparent);}
.lp-cell-top{display:flex;align-items:center;justify-content:space-between;gap:4px;}
.lp-num{font-size:var(--lp-cal-fs,12px);font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-primary);}
.lp-count{font-size:var(--lp-cal-fs,12px);line-height:1;padding:2px 5px;border-radius:999px;background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-bg-base);}
.lp-cell-title{font-size:var(--lp-cal-fs,12px);color:var(--dsw-alias-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left;}
.lp-cell-more{font-size:var(--lp-cal-fs,12px);color:var(--dsw-alias-label-secondary);}
.lp-weekcell{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:2px;padding:4px 0;border-radius:8px;border:1px solid transparent;cursor:pointer;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;}
.lp-weekcell[data-today="true"]{border-color:var(--dsw-alias-brand-primary);}
.lp-weekcell[data-selected="true"]{background:var(--dsw-alias-bg-layer-2);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 20%,transparent);}
.lp-weekcell span{font-size:var(--lp-meta-fs,11px);color:var(--dsw-alias-label-secondary);}
/* The strip's generic span rule must not repaint the count badge. */
.lp-weekcell .lp-count{font-size:var(--lp-meta-fs,11px);line-height:1;padding:2px 5px;border-radius:999px;background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-bg-base);}
.lp-day{padding:56px 16px 28px;}
.lp-day-title{display:flex;align-items:center;gap:8px;margin-bottom:10px;font-weight:600;font-size:var(--lp-title-fs,15px);}
.lp-day-sub{color:var(--dsw-alias-label-secondary);font-weight:400;font-size:var(--lp-fs-sm,12px);}
.lp-add{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;}
.lp-input{flex:1;min-width:140px;padding:8px 10px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;}
.lp-select{padding:8px 10px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;}
.lp-btn{padding:8px 12px;border-radius:8px;border:1px solid var(--dsw-alias-brand-primary);background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-bg-base);font:inherit;cursor:pointer;}
.lp-btn[disabled]{opacity:.5;cursor:default;}
.lp-btn-ghost{padding:6px 10px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;}
.lp-page[data-scheme="dark"] .lp-btn{background:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-base);}
.lp-page[data-scheme="dark"] .lp-modal{box-shadow:0 14px 56px rgba(0,0,0,.5);}
/* The study page reuses the planning page's components; one shared scale keeps
   the two panels identical in rhythm. */
.lp-study .lp-toolbar{padding:10px 0;border-bottom:1px solid var(--dsw-alias-border-l2);margin-bottom:4px;}
.lp-study .lp-toolbar .lp-input{flex:1;min-width:140px;max-width:none;}
.lp-study .lp-head .lp-meta{font-variant-numeric:tabular-nums;}
.lp-board .lp-card[draggable],.lp-drag-handle{cursor:grab;}
.lp-board .lp-col[data-drop="inside"],.lp-study-planner [data-drop="inside"]{outline:2px solid var(--lp-accent,var(--dsw-alias-brand-primary));outline-offset:-2px;}
.lp-board .lp-card[data-drop="before"],.lp-study-subject-head[data-drop="before"]{box-shadow:0 -3px var(--lp-accent,var(--dsw-alias-brand-primary));}
.lp-board .lp-card[data-drop="after"],.lp-study-subject-head[data-drop="after"]{box-shadow:0 3px var(--lp-accent,var(--dsw-alias-brand-primary));}
.lp-study-planner,.lp-card.lp-study-section{display:grid;gap:12px;}
.lp-study-planner-grid{display:grid;grid-template-columns:minmax(0,1fr);gap:var(--lp-layout-gap,12px);align-items:stretch;}
.lp-study-section{align-content:start;padding:12px;min-width:0;}
.lp-study-section-head,.lp-study-subject-head,.lp-study-link{display:flex;gap:8px;align-items:center;min-width:0;}
.lp-study-section-head h3{font-size:var(--lp-title-fs,15px);margin:0;}
.lp-study-section-head>button{margin-inline-start:auto;}
.lp-row.lp-study-task{display:grid;grid-template-columns:16px minmax(0,1fr) auto;align-items:center;min-width:0;}
.lp-study-task + .lp-study-task{border-top:1px solid var(--dsw-alias-border-l2);}
.lp-study-subject-head{border-bottom:1px solid var(--dsw-alias-border-l2);}
.lp-study-task[data-status="done"]>.lp-drag-handle{cursor:default;color:var(--dsw-alias-state-success-primary);}
.lp-study-actions>.lp-mini{min-width:24px;}
.lp-study-planner .lp-row:hover .lp-actions,.lp-study-planner .lp-row:focus-within .lp-actions{opacity:1;}
.lp-study-planner .lp-empty{min-height:80px;padding:12px;}
.lp-study-task-main,.lp-study-subject-head>.lp-study-task-title,.lp-study-link>.lp-study-task-title{flex:1 1 120px;min-width:0;}
.lp-study-task-title{border:0;background:none;color:inherit;font:inherit;font-weight:600;text-align:start;cursor:pointer;padding:0;overflow-wrap:anywhere;}
.lp-study-task-title{max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.lp-study-task-title:hover{text-decoration:underline;}
.lp-study-task-detail{display:flex;flex-wrap:wrap;gap:4px 8px;margin-top:2px;}
.lp-study-links{margin:4px 0 0 15px;padding-left:12px;}
.lp-study-link{justify-content:space-between;}
.lp-study-link>.lp-input[type=date]{flex:0 1 160px;}
.lp-study-section summary{cursor:pointer;}
.lp-today-study-progress{margin-bottom:14px;}
.lp-today-study-head{gap:8px;flex-wrap:wrap;}
.lp-today-study-task{flex-wrap:wrap;}
.lp-today-study-task .lp-title{min-width:min(100%, 130px);}
.lp-today-study-targets{display:flex;flex-wrap:wrap;gap:4px 10px;font-variant-numeric:tabular-nums;}
.lp-today-study-done{color:var(--dsw-alias-state-success-primary,var(--dsw-alias-label-primary));}
.lp-cal-side{min-width:0;}
.lp-cal-side>.lp-btn-ghost,.lp-cal-side>.lp-iconbtn{flex:none;}
.lp-day-title{flex-wrap:wrap;}
.lp-cal-lunar{white-space:normal;}
.lp-weather{min-width:0;}
.lp-weather-trigger{display:inline-flex;align-items:center;gap:6px;max-width:100%;min-height:30px;padding:3px 8px;border:1px solid var(--dsw-alias-border-l2);border-radius:var(--lp-r,8px);background:var(--lp-control-bg);color:var(--dsw-alias-label-primary);font:inherit;font-size:var(--lp-fs-sm,12px);font-variant-numeric:tabular-nums;white-space:nowrap;cursor:pointer;}
.lp-weather-trigger:hover,.lp-weather-trigger[aria-expanded="true"]{border-color:var(--lp-accent,var(--dsw-alias-brand-primary));}
.lp-weather-icon{display:inline-grid;place-items:center;flex:none;width:1.65em;height:1.65em;font-size:16px;line-height:1;border-radius:7px;background:color-mix(in srgb,var(--lp-accent,var(--dsw-alias-brand-primary)) 12%,transparent);}
.lp-weather-compact{overflow:hidden;text-overflow:ellipsis;min-width:0;}
.lp-weather-popup{position:fixed;z-index:80;display:flex;flex-direction:column;gap:7px;overflow:auto;overscroll-behavior:contain;box-sizing:border-box;padding:14px;border:1px solid var(--dsw-alias-border-l2);border-radius:var(--lp-r-lg,12px);background:var(--lp-modal-bg,var(--dsw-alias-bg-base));box-shadow:0 10px 30px #0003;font-size:var(--lp-fs,13px);text-align:left;}
.lp-weather-date{font-weight:650;font-size:var(--lp-title-fs,15px);}
.lp-weather-heading{display:flex;align-items:center;gap:9px;padding:9px 0 2px;border-top:1px solid var(--dsw-alias-border-l2);}
.lp-weather-heading .lp-weather-icon{font-size:21px;}
.lp-weather-heading button{margin-inline-start:auto;white-space:nowrap;}
.lp-weather-details{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin:0;}
.lp-weather-details>div{min-width:0;padding:7px 8px;border-radius:var(--lp-r-sm,6px);background:var(--lp-control-bg,var(--dsw-alias-bg-layer-2));}
.lp-weather-details dt{color:var(--dsw-alias-label-secondary);font-size:var(--lp-fs-sm,12px);}
.lp-weather-details dd{margin:1px 0 0;font-variant-numeric:tabular-nums;}
.lp-weather-advice{border-top:1px solid var(--dsw-alias-border-l2);padding-top:8px;overflow-wrap:anywhere;}
.lp-weather-advice ul{padding-inline-start:18px;margin:5px 0 1px;}
.lp-weather-advice li+li{margin-top:4px;}
.lp-weather-advice p{margin:4px 0 0;}

.lp-page .lp-modal.lp-settings{box-sizing:border-box;width:min(850px,100%);max-height:min(88vh,830px);gap:0;padding:0;overflow:hidden;}
.lp-settings>.lp-modal-title{padding:16px 20px;border-bottom:1px solid var(--dsw-alias-border-l2);}
.lp-settings-layout{display:grid;grid-template-columns:minmax(132px,20%) minmax(0,1fr);min-height:0;}
.lp-settings-nav{display:flex;flex-direction:column;gap:4px;min-width:0;padding:12px;border-inline-end:1px solid var(--dsw-alias-border-l2);background:color-mix(in srgb,var(--dsw-alias-label-primary) 3%,transparent);}
.lp-settings-nav-button{width:100%;border:1px solid transparent;border-radius:var(--lp-r,8px);padding:8px 9px;background:transparent;color:var(--dsw-alias-label-secondary);text-align:start;font:inherit;cursor:pointer;}
.lp-settings-nav-button:hover{color:var(--dsw-alias-label-primary);background:var(--lp-control-bg,var(--dsw-alias-bg-layer-2));}
.lp-settings-nav-button[aria-current="page"]{background:color-mix(in srgb,var(--lp-accent,var(--dsw-alias-brand-primary)) 13%,transparent);border-color:color-mix(in srgb,var(--lp-accent,var(--dsw-alias-brand-primary)) 35%,transparent);color:var(--dsw-alias-label-primary);font-weight:650;}
.lp-page .lp-settings .lp-settings-body{min-height:min(42vh,330px);max-height:none;padding:14px 16px;}
.lp-settings-sections,.lp-settings-group{display:grid;gap:10px;min-width:0;}
.lp-settings-group{padding:12px;border:1px solid var(--dsw-alias-border-l2);border-radius:var(--lp-r-lg,12px);}
.lp-settings-group .lp-form-section{margin:0;padding:0;border:0;color:var(--dsw-alias-label-primary);font:inherit;font-weight:650;}
.lp-settings-switch{display:flex;justify-content:space-between;align-items:center;gap:12px;min-width:0;}
.lp-settings-switch>div{min-width:0;}
.lp-settings-switch .lp-meta{margin-top:2px;}
.lp-settings-switch .lp-toggle{flex:none;}
.lp-settings-classification{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center;}
.lp-settings-classification>.lp-field{grid-column:1 / -1;}
.lp-settings-classification .lp-swatch-panel{border-radius:var(--lp-r-sm,6px);}
.lp-settings-status{display:inline-block;border-radius:var(--lp-r-sm,6px);padding:3px 7px;color:var(--dsw-alias-label-secondary);background:var(--lp-control-bg,var(--dsw-alias-bg-layer-2));font-size:var(--lp-fs-sm,12px);}
.lp-page .lp-settings>.lp-modal-actions{position:static;flex:none;margin:0;padding:10px 16px;background:transparent;}
@media (max-width:660px){
  .lp-settings-layout{grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr);}
  .lp-settings-nav{flex-direction:row;overflow:auto;padding:6px 8px;border-inline-end:0;border-bottom:1px solid var(--dsw-alias-border-l2);}
  .lp-settings-nav-button{width:auto;flex:none;white-space:nowrap;}
  .lp-page .lp-settings .lp-settings-body{min-height:0;padding:10px;}
  .lp-cal-bar .lp-weather-compact{display:none;}
}
.lp-study .lp-tree-row{min-height:var(--lp-row);padding:4px 8px;border-color:transparent;border-radius:var(--lp-r-sm);gap:var(--lp-gap);}
.lp-study .lp-tree-row:hover{background:color-mix(in srgb,var(--dsw-alias-label-primary) 7%,transparent);border-color:transparent;}
.lp-study-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px;margin-top:8px;}
/* Mistakes must never be clipped or push the panel sideways. */
.lp-mistake-grid{--lp-mistake-gap:var(--lp-layout-gap,12px);gap:var(--lp-mistake-gap);grid-template-columns:repeat(auto-fit,minmax(max(min(260px,100%),calc((100% + var(--lp-mistake-gap))/var(--lp-mistake-cols,6) - var(--lp-mistake-gap))),1fr));}
.lp-mistake-grid .lp-card{min-width:0;max-width:100%;height:var(--lp-mistake-h,auto);overflow:hidden;}
.lp-mistake-grid .lp-card-title{white-space:normal;overflow:visible;text-overflow:clip;overflow-wrap:anywhere;line-height:1.45;font-size:var(--lp-mistake-title-fs,15px);}
.lp-mistake-grid .lp-card-meta{white-space:normal;overflow-wrap:anywhere;}
/* Answer and reason have their own size; clamping only applies when the user
   fixes the card height, otherwise the full text stays visible. */
.lp-mistake-grid .lp-mistake-answer{font-size:var(--lp-mistake-answer-fs,13px);white-space:normal;overflow-wrap:anywhere;}
.lp-mistake-grid .lp-mistake-reason{font-size:var(--lp-mistake-reason-fs,12px);white-space:normal;overflow-wrap:anywhere;}
html[data-lp-mistake-fixed="true"] .lp-mistake-grid :is(.lp-mistake-title,.lp-mistake-answer,.lp-mistake-reason){display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden;}
html[data-lp-mistake-fixed="true"] .lp-mistake-grid .lp-mistake-title{-webkit-line-clamp:2;}
html[data-lp-mistake-fixed="true"] .lp-mistake-grid .lp-mistake-answer{-webkit-line-clamp:3;}
html[data-lp-mistake-fixed="true"] .lp-mistake-grid .lp-mistake-reason{-webkit-line-clamp:4;}
.lp-body .lp-toolbar .lp-input{min-width:0;}
.lp-mistake-preview{width:min(760px,100%);max-height:80vh;overflow:auto;}
.lp-mistake-preview .lp-pre-block{margin-top:10px;}
.lp-mistake-preview .lp-pre-body{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.6;padding:10px 12px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);}
.lp-mistake-preview .lp-mistake-sources{margin:4px 0 0;padding-inline-start:28px;}
.lp-bar{display:block;height:8px;min-width:2px;border-radius:4px;background:color-mix(in srgb,var(--dsw-alias-brand-primary) 55%,transparent);}
.lp-dd{position:relative;display:flex;min-width:0;width:100%;}
.lp-dd-btn{width:100%;min-width:0;display:flex;align-items:center;justify-content:space-between;gap:8px;text-align:left;cursor:pointer;}
.lp-dd-value{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.lp-dd-caret{color:var(--dsw-alias-label-secondary);font-size:var(--lp-meta-fs,11px);}
.lp-dd-menu{position:fixed;box-sizing:border-box;z-index:70;max-height:240px;overflow:auto;padding:6px;border-radius:12px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);box-shadow:0 12px 32px rgba(0,0,0,.28);display:flex;flex-direction:column;gap:2px;}
.lp-dd-item{flex:0 0 auto;padding:7px 10px;border:none;border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:var(--lp-fs,13px);line-height:1.4;text-align:left;cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.lp-dd-item:hover{background:color-mix(in srgb,var(--dsw-alias-label-primary) 10%,transparent);}
.lp-dd-item[data-active="true"]{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 16%,transparent);}
/* aria-selected marks the chosen option when the keyboard highlight is elsewhere. */
.lp-dd-item[aria-selected="true"]{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 10%,transparent);}
.lp-toolbar{display:flex;align-items:center;gap:6px;padding:10px 14px;border-bottom:1px solid var(--dsw-alias-border-l2);flex-wrap:wrap;}
.lp-chip{padding:4px 10px;border-radius:999px;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:var(--lp-tag-fs,12px);cursor:pointer;}
.lp-chip[data-active="true"]{background:var(--dsw-alias-bg-layer-2);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 18%,transparent);color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-brand-primary);}
.lp-search{padding:6px 10px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;min-width:150px;}
.lp-node{position:relative;}
.lp-row{display:flex;align-items:center;gap:6px;padding:7px 8px;border-radius:6px;position:relative;}
.lp-row:hover{background:var(--dsw-alias-bg-layer-1);background:color-mix(in srgb,var(--dsw-alias-label-primary) 7%,transparent);}
.lp-row[data-selected="true"]{background:var(--dsw-alias-bg-layer-2);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 16%,transparent);box-shadow:inset 2px 0 0 var(--dsw-alias-brand-primary);}
.lp-row[data-context="true"]{opacity:.72;}
.lp-row[data-done="true"] .lp-title{opacity:.55;text-decoration:line-through;}
.lp-row[data-drop="before"]{box-shadow:inset 0 2px 0 var(--dsw-alias-brand-primary);}
.lp-row[data-drop="after"]{box-shadow:inset 0 -2px 0 var(--dsw-alias-brand-primary);}
.lp-row[data-drop="inside"]{box-shadow:inset 0 0 0 1px var(--dsw-alias-brand-primary);}
.lp-row[data-dragging="true"]{opacity:.45;}
.lp-ico{width:16px;text-align:center;color:var(--dsw-alias-label-secondary);font-size:var(--lp-meta-fs,11px);flex:none;}
/* Hierarchy is already visible as indentation; colour is reserved for task types. */
.lp-children{margin-left:18px;border-left:1px solid var(--dsw-alias-border-l2);}
.lp-actions{display:flex;gap:2px;opacity:0;transition:opacity .12s;flex:none;}
.lp-row:hover .lp-actions{opacity:1;}
.lp-mini{width:22px;height:22px;border:none;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;font:inherit;padding:0;}
.lp-mini:hover{background:var(--dsw-alias-bg-layer-2);background:color-mix(in srgb,var(--dsw-alias-label-primary) 10%,transparent);color:var(--dsw-alias-label-primary);}
.lp-inline{flex:1;min-width:0;padding:4px 8px;border-radius:6px;border:1px solid var(--dsw-alias-brand-primary);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;}
.lp-progress{font-size:var(--lp-meta-fs,11px);color:var(--dsw-alias-label-secondary);white-space:nowrap;flex:none;}
.lp-fill{flex:1;min-width:8px;align-self:stretch;}
.lp-caret{width:18px;height:18px;border:none;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;font:inherit;padding:0;flex:none;}
.lp-caret[data-empty="true"]{cursor:default;opacity:0;}
.lp-title{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:default;}
.lp-meta{color:var(--dsw-alias-label-secondary);font-size:var(--lp-meta-fs,11px);white-space:nowrap;}
.lp-meta[data-overdue="true"]{color:var(--dsw-alias-state-error-primary);}
.lp-badge{font-size:var(--lp-meta-fs,11px);padding:1px 6px;border-radius:999px;border:1px solid var(--dsw-alias-state-warn-primary);color:var(--dsw-alias-state-warn-primary);white-space:nowrap;}
.lp-menu{position:fixed;box-sizing:border-box;z-index:70;overflow:auto;padding:4px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);box-shadow:0 6px 24px rgba(0,0,0,.18);}
.lp-menu button{display:block;width:100%;text-align:left;padding:6px 10px;border:none;border-radius:6px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;}
.lp-menu button:hover,.lp-menu button[data-active="true"]{background:var(--dsw-alias-bg-layer-2);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 14%,transparent);}
.lp-tree-row{position:relative;display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:8px;border:1px solid transparent;}
.lp-tree-row:hover{background:var(--dsw-alias-bg-layer-1);border-color:var(--dsw-alias-border-l2);}
.lp-tree-row[data-done="true"] .lp-title{opacity:.5;text-decoration:line-through;}
.lp-tree-row[data-overdue="true"] .lp-title{color:var(--dsw-alias-state-error-primary);}
.lp-backdrop{position:fixed;inset:0;z-index:40;background:rgba(0,0,0,.58);display:flex;align-items:center;justify-content:center;padding:24px;}
.lp-modal{width:min(560px,100%);max-height:85vh;overflow:auto;border-radius:14px;border:1px solid var(--dsw-alias-border-l2);background:var(--lp-modal-bg,var(--lp-surface-bg,var(--dsw-alias-bg-base))) !important;padding:18px;display:flex;flex-direction:column;gap:12px;box-shadow:0 12px 48px rgba(0,0,0,.32);}
.lp-modal-title{font-weight:600;font-size:var(--lp-title-fs,15px);}
.lp-field{display:flex;flex-direction:column;gap:4px;}
.lp-field label{font-size:var(--lp-meta-fs,11px);color:var(--dsw-alias-label-secondary);}
.lp-row2{display:flex;gap:12px;}
.lp-row2 > *{flex:1;min-width:0;}
.lp-deps{max-height:160px;overflow:auto;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:8px;display:flex;flex-direction:column;gap:6px;}
.lp-deps label{display:flex;align-items:center;gap:8px;font-size:var(--lp-fs,13px);color:var(--dsw-alias-label-primary);}
.lp-modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:4px;}
.lp-form-section{display:flex;align-items:center;gap:10px;font-size:var(--lp-meta-fs,11px);color:var(--dsw-alias-label-secondary);margin:10px 0 0;}
.lp-settings-body{display:flex;flex-direction:column;gap:8px;max-height:min(70vh,620px);overflow-y:auto;overflow-x:hidden;padding:2px 4px 2px 2px;}
/* Settings never scrolls sideways: rows reflow instead. */
.lp-page .lp-settings{width:min(720px,100%);overflow-x:hidden;}
.lp-page .lp-settings .lp-settings-body{width:100%;box-sizing:border-box;}
.lp-page .lp-settings .lp-row2{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;align-items:start;}
/* Compact field groups: as many columns as the width allows. */
.lp-page .lp-settings .lp-setting-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px 14px;align-items:start;}
.lp-page .lp-settings .lp-setting-grid .lp-field{min-width:0;}
.lp-page .lp-settings .lp-field{min-width:0;}
.lp-page .lp-settings .lp-field label{white-space:normal;overflow-wrap:anywhere;}
.lp-page .lp-settings .lp-toolbar{flex-wrap:wrap;padding:0;border:0;}
.lp-page .lp-settings .lp-input,
.lp-page .lp-settings .lp-select,
.lp-page .lp-settings .lp-search{min-width:0;max-width:100%;width:100%;flex:0 0 auto;box-sizing:border-box;}
/* Only a horizontal row lets an input share space with its neighbours. */
.lp-page .lp-settings .lp-toolbar .lp-input,
.lp-page .lp-settings .lp-toolbar .lp-select,
.lp-page .lp-settings .lp-toolbar .lp-search{flex:1 1 140px;width:auto;}
.lp-page .lp-settings input[type="range"]{flex:1 1 120px;width:auto;}
.lp-page .lp-settings .lp-btn,
.lp-page .lp-settings .lp-btn-ghost{flex:none;white-space:nowrap;}
.lp-page .lp-settings .lp-taglist{flex-wrap:wrap;}
.lp-page .lp-settings .lp-meta{white-space:normal;overflow-wrap:anywhere;}
.lp-page .lp-settings .lp-section{white-space:normal;overflow-wrap:anywhere;}
.lp-page .lp-settings .lp-week{grid-template-columns:repeat(auto-fit,minmax(72px,1fr));}
/* Study panels follow the same surface rule so a background shows through. */
.lp-page .lp-study .lp-input,
.lp-page .lp-study .lp-select,
.lp-page .lp-study .lp-search{background:var(--lp-control-bg,var(--lp-surface-bg,var(--dsw-alias-bg-layer-1))) !important;backdrop-filter:blur(6px);}
/* Planning controls follow the same rule so one background looks consistent. */
.lp-page:not(.lp-study) .lp-input,
.lp-page:not(.lp-study) .lp-select,
.lp-page:not(.lp-study) .lp-search,
.lp-page:not(.lp-study) .lp-dd-btn{background:var(--lp-control-bg,var(--lp-surface-bg,var(--dsw-alias-bg-layer-1))) !important;backdrop-filter:blur(6px);}
.lp-page .lp-study .lp-dd-btn{background:var(--lp-control-bg,var(--lp-surface-bg,var(--dsw-alias-bg-layer-1))) !important;backdrop-filter:blur(6px);}
.lp-page .lp-study .lp-card{background:var(--lp-surface-bg,var(--dsw-alias-bg-layer-1));}
.lp-week{display:grid;grid-template-columns:repeat(7,minmax(64px,1fr));gap:6px;margin:6px 0;}
.lp-week-day{display:flex;flex-direction:column;gap:4px;padding:6px;border:1px solid var(--dsw-alias-border-l1);border-radius:var(--lp-r-sm,#6px);}
.lp-week-day .lp-input{width:100%;min-width:0;}
.lp-week-day .lp-week-value{font-size:var(--lp-task-fs,13px);color:var(--dsw-alias-label-primary);}
.lp-form-section::after{content:'';flex:1;height:1px;background:var(--dsw-alias-border-l2);}
.lp-page .lp-modal-actions{position:sticky;bottom:-20px;z-index:2;background:var(--dsw-alias-bg-base);padding:12px 0 0;border-top:1px solid var(--dsw-alias-border-l2);}
.lp-plan{width:100%;box-sizing:border-box;padding:12px;border-radius:10px;border:1px solid var(--dsw-alias-border-l2);background:var(--lp-surface-bg,var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-label-primary);font:inherit;line-height:1.6;resize:vertical;}
.lp-empty{color:var(--dsw-alias-label-secondary);padding:24px 0;text-align:center;}
.lp-section{color:var(--dsw-alias-label-secondary);font-size:var(--lp-meta-fs,11px);margin:12px 0 4px;padding:0 0 6px;border-top:none;border-bottom:1px solid var(--dsw-alias-border-l2);font-weight:500;}
.lp-page .lp-tree-row[data-selected="true"]{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 16%,transparent);box-shadow:inset 2px 0 0 var(--dsw-alias-brand-primary);}
.lp-longterm{margin-top:26px;}
.lp-err{color:var(--dsw-alias-state-error-primary);font-size:var(--lp-fs-sm,12px);margin:8px 0;}
.lp-feedback{color:var(--dsw-alias-brand-primary);margin:8px 0;font-size:var(--lp-fs-sm,12px);}
.lp-notices{position:absolute;right:16px;top:64px;z-index:30;display:flex;flex-direction:column;gap:6px;max-width:340px;}
.lp-notice{padding:8px 10px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);box-shadow:0 8px 24px rgba(0,0,0,.18);font-size:var(--lp-fs,13px);cursor:pointer;}
.lp-notice:hover{background:var(--dsw-alias-bg-layer-2);background:color-mix(in srgb,var(--dsw-alias-label-primary) 10%,transparent);}
.lp-notice-title{font-weight:600;font-size:var(--lp-fs-sm,12px);margin-bottom:2px;}
.lp-notice-body{font-size:var(--lp-fs-sm,12px);color:var(--dsw-alias-label-secondary);}
.lp-prio{width:3px;align-self:stretch;min-height:14px;border-radius:2px;flex:none;opacity:.9;}
.lp-tag{font-size:var(--lp-tag-fs,12px);padding:0 6px;border-radius:6px;white-space:nowrap;flex:none;}
.lp-taglist{display:flex;flex-wrap:wrap;gap:6px;}
.lp-type{font-size:var(--lp-type-fs,11px);line-height:1.5;padding:0 6px;border-radius:6px;border:1px solid currentColor;opacity:.9;white-space:nowrap;flex:none;}
.lp-filters{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:8px var(--lp-pad);border-bottom:1px solid var(--dsw-alias-border-l2);}
.lp-filters .lp-dd{width:150px;flex:none;}
.lp-group{margin-top:6px;}
.lp-group-toggle{cursor:pointer;user-select:none;}
.lp-group-add{margin-left:auto;width:22px;height:22px;padding:0;font-size:14px;line-height:1;display:inline-flex;align-items:center;justify-content:center;opacity:.65;}
.lp-group-toggle:hover .lp-group-add{opacity:1;}
.lp-caret{display:inline-block;width:12px;text-align:center;font-size:10px;transition:transform .15s ease;}
.lp-caret[data-open="false"]{transform:rotate(-90deg);}
.lp-group-head{display:flex;align-items:center;gap:6px;font-size:var(--lp-type-fs,11px);color:var(--dsw-alias-label-secondary);padding:6px 8px;border-bottom:1px solid var(--dsw-alias-border-l2);}
.lp-group-dot{width:9px;height:9px;border-radius:50%;flex:none;}
.lp-swatch-panel{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:8px;}
.lp-swatch{width:18px;height:18px;border-radius:5px;border:1px solid var(--dsw-alias-border-l2);cursor:pointer;padding:0;}
.lp-swatch[data-active="true"]{outline:2px solid var(--dsw-alias-label-primary);outline-offset:1px;}
.lp-cell[data-priority="low"]:not([data-selected="true"]){background:color-mix(in srgb,var(--lp-tone-low) 12%,transparent);}
.lp-cell[data-priority="medium"]:not([data-selected="true"]){background:color-mix(in srgb,var(--lp-tone-medium) 12%,transparent);}
.lp-cell[data-priority="high"]:not([data-selected="true"]){background:color-mix(in srgb,var(--lp-tone-high) 12%,transparent);}
.lp-cell[data-priority="highest"]:not([data-selected="true"]){background:color-mix(in srgb,var(--lp-tone-highest) 14%,transparent);}
.lp-modal.lp-confirm-modal{box-sizing:border-box;width:min(380px,100%);}
.lp-pop-list{font-size:var(--lp-fs-sm,12px);color:var(--dsw-alias-label-secondary);max-height:180px;overflow:auto;display:flex;flex-direction:column;gap:2px;}
.lp-pop-actions{display:flex;justify-content:flex-end;gap:6px;}
.lp-board{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;padding:12px;align-items:stretch;}
.lp-col{display:flex;flex-direction:column;gap:8px;min-width:0;min-height:min(60vh,640px);border-radius:var(--lp-r,8px);}
.lp-col-space{flex:1;min-height:52px;}
.lp-col-head{font-size:var(--lp-title-fs,15px);color:var(--dsw-alias-label-secondary);padding:4px 2px;border-bottom:1px solid var(--dsw-alias-border-l2);}.lp-card{border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:8px;background:var(--lp-surface-bg,var(--dsw-alias-bg-layer-1));cursor:pointer;display:flex;flex-direction:column;gap:4px;align-items:flex-start;}
.lp-card:hover{border-color:var(--dsw-alias-brand-primary);}
.lp-card[data-done="true"]{opacity:.6;}
.lp-card-title{font-size:var(--lp-task-fs,13px);max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.lp-card-meta{display:flex;gap:8px;align-items:center;color:var(--dsw-alias-label-secondary);font-size:var(--lp-meta-fs,11px);}
.lp-card-prio{font-variant-numeric:tabular-nums;font-weight:600;min-width:22px;flex:none;}
.lp-switch{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 8px;border-radius:8px;border:1px solid transparent;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:var(--lp-meta-fs,11px);cursor:pointer;white-space:nowrap;}
.lp-switch:hover{background:var(--dsw-alias-bg-layer-2);background:color-mix(in srgb,var(--dsw-alias-label-primary) 10%,transparent);}
.lp-switch[data-on="true"]{color:var(--dsw-alias-brand-primary);}
.lp-switch-track{position:relative;display:inline-block;width:28px;height:16px;border-radius:999px;background:var(--dsw-alias-state-idle-primary);transition:background .15s ease;}
.lp-switch-knob{position:absolute;top:2px;left:2px;width:12px;height:12px;border-radius:50%;background:var(--dsw-alias-bg-base);transition:transform .15s ease;}
.lp-switch[data-on="true"] .lp-switch-track{background:var(--dsw-alias-brand-primary);}
.lp-switch[data-on="true"] .lp-switch-knob{transform:translateX(12px);}
.lp-switch-state{min-width:1em;line-height:1;}
/* The label keeps the switch's own 11px scale so the header control never grows. */
.lp-switch-label{font-size:var(--lp-meta-fs,11px);white-space:nowrap;}
/* Per-area font tokens: each block of the calendar page follows its own setting. */
.lp-tab{font-size:var(--lp-tab-fs,13px);}
.lp-modal-title,.lp-cal-title{font-size:var(--lp-title-fs,15px);}
.lp-cal-sticky,.lp-cell,.lp-weekcell{font-size:var(--lp-cal-fs,12px);}
.lp-tree-row,.lp-row,.lp-card,.lp-plan{font-size:var(--lp-task-fs,13px);}
.lp-type{font-size:var(--lp-type-fs,11px);}
.lp-tag,.lp-chip{font-size:var(--lp-tag-fs,12px);}
.lp-meta{font-size:var(--lp-meta-fs,11px);}
.lp-chip{height:var(--lp-tag-h,22px);display:inline-flex;align-items:center;}
/* Default boolean control: oval slider, right aligned in its row. */
.lp-switch-row{display:flex;align-items:center;justify-content:space-between;gap:12px;}
/* A switch that follows its label on the same line. */
.lp-switch-inline{display:inline-flex;align-items:center;gap:8px;}
.lp-switch-inline label{white-space:nowrap;}
.lp-toggle{flex:none;display:inline-flex;align-items:center;justify-content:flex-end;padding:0;border:0;background:transparent;cursor:pointer;}
/* Off state needs a visible groove: a plain layer colour disappears on dark pages. */
.lp-toggle-track{position:relative;width:42px;height:24px;border-radius:999px;background:color-mix(in srgb, var(--dsw-alias-label-primary) 30%, transparent);box-shadow:inset 0 0 0 1.5px color-mix(in srgb, var(--dsw-alias-label-primary) 45%, transparent);transition:background .18s ease,box-shadow .18s ease;}
.lp-toggle-knob{position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 2px 5px rgba(0,0,0,.5),0 0 0 1px rgba(0,0,0,.22);transition:transform .18s ease;}
.lp-toggle[data-on="true"] .lp-toggle-track{background:var(--dsw-alias-brand-primary);box-shadow:inset 0 0 0 1.5px color-mix(in srgb, var(--dsw-alias-brand-primary) 70%, #000);}
.lp-toggle[data-on="true"] .lp-toggle-knob{transform:translateX(18px);}
.lp-toggle:hover .lp-toggle-track{box-shadow:inset 0 0 0 1.5px color-mix(in srgb, var(--dsw-alias-label-primary) 65%, transparent);}
.lp-toggle[disabled]{opacity:.5;cursor:default;}
/* --- polish pass: one type/spacing scale, consistent controls --- */
.lp-page{--lp-tone-low:#60a5fa;--lp-tone-medium:#34d399;--lp-tone-high:#fbbf24;--lp-tone-highest:#f87171;--lp-fs-sm:12px;--lp-fs:13px;--lp-fs-lg:15px;--lp-h:28px;--lp-r-sm:6px;--lp-r:8px;--lp-r-lg:12px;--lp-gap:8px;--lp-pad:14px;--lp-row:30px;--lp-cal-fs:12px;--lp-task-fs:13px;--lp-tag-fs:12px;--lp-title-fs:15px;--lp-type-fs:11px;--lp-meta-fs:11px;--lp-tab-fs:13px;--lp-tag-h:22px;--lp-cal-h:420px;background-image:var(--lp-bg-fade,none),var(--lp-bg-overlay,none),var(--lp-bg-image,none);background-size:cover,cover,var(--lp-bg-size,cover);background-position:center,center,var(--lp-bg-pos,center);background-repeat:no-repeat;font-size:var(--lp-fs,13px);line-height:1.5;}
.lp-page .lp-head{padding:10px var(--lp-pad);gap:10px;flex-wrap:nowrap;}
.lp-page .lp-tabs{gap:2px;overflow-x:auto;overflow-y:hidden;scrollbar-width:thin;scrollbar-color:var(--dsw-alias-border-l2) transparent;min-width:0;align-items:center;padding-block:2px;}
.lp-page .lp-tabs::-webkit-scrollbar{height:6px;}
.lp-page .lp-tabs::-webkit-scrollbar-thumb{background:var(--dsw-alias-border-l2);border-radius:999px;}
.lp-page .lp-tabs::-webkit-scrollbar-track{background:transparent;}
/* The settings dialog keeps a fixed 13px tab size and wraps instead of scrolling:
   settings tabs must not follow the panel's --lp-tab-fs, so 13px stays literal. */
.lp-page .lp-modal .lp-tabs{flex-wrap:wrap;overflow:visible;gap:6px;padding-block:0;}
.lp-page .lp-modal .lp-tab{height:auto;min-height:28px;font-size:13px;padding:6px 12px;line-height:1.25;}
.lp-page .lp-tab{flex:none;white-space:nowrap;}
.lp-page .lp-head > .lp-btn-ghost{flex:none;}
.lp-page .lp-tab{height:auto;min-height:calc(var(--lp-tab-fs,13px) + 16px);padding:4px 12px;border-radius:var(--lp-r);font-size:var(--lp-tab-fs,13px);line-height:1.3;display:inline-flex;align-items:center;justify-content:center;transition:background .12s ease,color .12s ease,border-color .12s ease;}
.lp-page .lp-body{padding:var(--lp-pad);}
.lp-page .lp-btn,.lp-page .lp-btn-ghost,.lp-page .lp-input,.lp-page .lp-select,.lp-page .lp-search,.lp-page .lp-dd-btn{box-sizing:border-box;font-size:var(--lp-fs);line-height:1.25;transition:background .12s ease,border-color .12s ease,color .12s ease;}
.lp-page .lp-btn,.lp-page .lp-btn-ghost{display:inline-flex;align-items:center;justify-content:center;height:var(--lp-h);padding:0 12px;border-radius:var(--lp-r);white-space:nowrap;}
.lp-page .lp-input,.lp-page .lp-select,.lp-page .lp-search{min-height:var(--lp-h);padding:5px 10px;border-radius:var(--lp-r);}
.lp-page .lp-dd-btn{min-height:var(--lp-h);padding:5px 10px;border-radius:var(--lp-r);}
.lp-page .lp-search{min-width:180px;}
.lp-page .lp-toolbar{gap:var(--lp-gap);padding:8px var(--lp-pad);}
.lp-page .lp-chip{height:var(--lp-tag-h,22px);padding:0 10px;line-height:1;font-size:var(--lp-tag-fs,12px);transition:background .12s ease,border-color .12s ease,color .12s ease;}
.lp-page .lp-row .lp-title,.lp-page .lp-tree-row .lp-title{font-size:var(--lp-task-fs,13px);}
.lp-page .lp-cal-scroll{font-size:var(--lp-cal-fs,12px);}
.lp-page .lp-badge{font-size:var(--lp-meta-fs,11px);}
.lp-page .lp-row,.lp-page .lp-tree-row{min-height:var(--lp-row);padding:4px 8px;gap:var(--lp-gap);border-radius:var(--lp-r-sm);transition:background .12s ease;}
.lp-page .lp-actions:focus-within{opacity:1;}
.lp-page .lp-ico{font-size:var(--lp-fs);}
.lp-page .lp-meta{font-size:var(--lp-meta-fs,11px);}
.lp-page .lp-empty{display:flex;align-items:center;justify-content:center;min-height:180px;padding:24px;font-size:var(--lp-fs);}
.lp-page .lp-section{margin:12px 0 4px;padding:0 0 6px;font-size:var(--lp-meta-fs,11px);}
.lp-page .lp-card{padding:10px;border-radius:var(--lp-r);gap:6px;transition:border-color .12s ease;}
.lp-page .lp-col-head{position:sticky;top:0;z-index:2;background:var(--lp-surface-bg,var(--dsw-alias-bg-base));padding:9px 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:var(--lp-r-lg,12px);text-align:center;color:var(--dsw-alias-label-primary);font-weight:600;box-shadow:0 1px 2px rgba(0,0,0,.08);}
.lp-page .lp-board{padding:var(--lp-pad);gap:12px;}
.lp-page .lp-modal{padding:20px;gap:14px;}
.lp-page .lp-modal-title{font-size:var(--lp-title-fs,15px);}
.lp-page .lp-notices{top:56px;gap:8px;}
.lp-page .lp-notice{padding:9px 11px;border-radius:var(--lp-r);}
.lp-page .lp-menu{padding:5px;border-radius:var(--lp-r-lg);}
.lp-page .lp-menu button{padding:6px 10px;border-radius:var(--lp-r-sm);font-size:var(--lp-fs);}
.lp-page .lp-dd-menu{padding:5px;border-radius:var(--lp-r-lg);}
.lp-page .lp-cal-bar{padding:10px var(--lp-pad);}
.lp-page *::-webkit-scrollbar{width:10px;height:10px;}
.lp-page *::-webkit-scrollbar-thumb{background:color-mix(in srgb,var(--dsw-alias-label-primary) 20%,transparent);border-radius:999px;border:3px solid transparent;background-clip:padding-box;}
.lp-page *::-webkit-scrollbar-track{background:transparent;}
.lp-page .lp-tab[data-active="true"]{background:color-mix(in srgb,var(--lp-accent,var(--dsw-alias-brand-primary)) 18%,transparent);color:var(--dsw-alias-label-primary);border-color:var(--lp-accent,var(--dsw-alias-brand-primary));} 
.lp-page .lp-row[data-done="true"] .lp-ico,.lp-page .lp-tree-row[data-done="true"] .lp-ico{color:var(--dsw-alias-state-success-primary);}
.lp-page .lp-row[data-done="true"] .lp-prio{opacity:.35;}
.lp-page{font-family:var(--lp-font-family,inherit);}
.lp-page .lp-head{padding-inline:var(--lp-content-pad,16px);}
.lp-page .lp-body{padding:var(--lp-content-pad,16px);}
.lp-page .lp-week-day{font-size:var(--lp-cal-fs,13px);}
.lp-page .lp-btn{color:var(--lp-accent-ink,var(--dsw-alias-bg-base));}
.lp-page .lp-cell-title{line-height:1.25;}
.lp-cal-scroll[data-layout="split"]{display:grid;grid-template-columns:minmax(0,1.75fr) minmax(270px,1fr);gap:var(--lp-layout-gap,12px);align-items:start;align-content:start;padding:var(--lp-content-pad,16px);box-sizing:border-box;}
.lp-cal-scroll[data-layout="split"] .lp-cal-sticky{position:relative;top:auto;margin:0;min-width:0;}
.lp-cal-scroll[data-layout="split"] .lp-cal-title{order:-1;margin-inline-end:auto;}
.lp-cal-scroll[data-layout="split"] .lp-cal-bar{flex-wrap:wrap;row-gap:4px;}
.lp-cal-scroll[data-layout="split"] .lp-cal-side{flex:0 0 auto;}
.lp-cal-scroll[data-layout="split"] .lp-day{min-width:0;padding:var(--lp-content-pad,16px);border:1px solid var(--lp-clawd-outline,var(--dsw-alias-border-l2));border-radius:var(--lp-r-lg);background:var(--lp-clawd-card,var(--lp-surface-bg));}
.lp-cal-scroll[data-layout="split"] .lp-day-title{flex-wrap:wrap;}
.lp-cal-scroll[data-layout="split"] .lp-cal-lunar{flex-basis:100%;}
.lp-cal-scroll[data-layout="split"] .lp-add{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px;}
.lp-cal-scroll[data-layout="split"] .lp-add .lp-input{min-width:0;}
.lp-cal-scroll[data-layout="split"] .lp-empty,
.lp-page .lp-study-today-primary .lp-empty{min-height:104px;padding:16px;border-radius:var(--lp-r);background:color-mix(in srgb,var(--dsw-alias-label-primary) 4%,transparent);}
.lp-page .lp-study-today{container-type:inline-size;display:grid;align-content:start;gap:var(--lp-layout-gap,12px);}
.lp-study-today-head{display:flex;justify-content:space-between;align-items:center;gap:var(--lp-layout-gap,12px);}
.lp-study-today-head h2{margin:0;font-size:var(--lp-title-fs,24px);}
.lp-study-today-head small{margin-inline-start:.4em;color:var(--dsw-alias-label-secondary);font-size:var(--lp-meta-fs,14px);font-weight:400;}
.lp-study-today-grid,.lp-study-today-review{display:grid;min-width:0;gap:var(--lp-layout-gap,12px);}
.lp-study-today-grid{grid-template-columns:minmax(0,1fr);align-items:stretch;}
@container (min-width: 740px){
  .lp-study-today-grid{grid-template-columns:var(--lp-study-today-cols,minmax(0,1fr));}
}
.lp-page .lp-study-today .lp-card,.lp-page .lp-study-planner .lp-card{padding:var(--lp-layout-gap,12px);border-radius:var(--lp-r-lg);}
.lp-page .lp-study-today .lp-card-title,.lp-study-today-card-title strong,.lp-study-advice strong{font-size:var(--lp-title-fs,15px);}
.lp-study-today-card-title{display:flex;justify-content:space-between;align-items:baseline;gap:8px;}
.lp-study-advice summary{cursor:pointer;}
.lp-study-advice summary .lp-meta{margin-inline-start:.8em;}
.lp-advice-excerpt{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary);font-size:var(--lp-meta-fs,14px);}
.lp-study-advice[open] .lp-advice-excerpt{display:none;}
.lp-advice-copy{margin-block-start:8px;white-space:pre-wrap;overflow-wrap:anywhere;}
.lp-page .lp-study-planner{container-type:inline-size;gap:var(--lp-layout-gap,12px);align-content:start;}
@container (min-width: 700px){
  .lp-study-planner-grid{grid-template-columns:var(--lp-study-plan-cols,repeat(2,minmax(0,1fr)));}
}
.lp-page .lp-study-planner .lp-empty{min-height:96px;margin:0;}
.lp-study-section-head{min-height:var(--lp-row);flex-wrap:wrap;}
.lp-study-section-head h3{overflow-wrap:anywhere;}
.lp-study-section-count{display:inline-grid;place-items:center;min-width:1.9em;padding:2px 5px;border-radius:var(--lp-r-sm);background:color-mix(in srgb,var(--lp-accent,var(--dsw-alias-brand-primary)) 9%,transparent);color:var(--dsw-alias-label-secondary);font:500 var(--lp-meta-fs,13px)/1.5 system-ui,sans-serif;font-variant-numeric:tabular-nums;}
.lp-study-lane-meta{min-height:1lh;}
.lp-study-lane-spacer{display:none;}
@container (min-width: 700px){
  .lp-study-lane-spacer{display:var(--lp-study-plan-spacer,block);}
}
.lp-settings-color{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;}
.lp-settings-color .lp-input{width:100%;min-width:0;padding:4px;height:34px;}
.lp-settings-preview{position:absolute;z-index:39;inset:auto 20px 20px auto;padding:6px;border-radius:var(--lp-r);background:var(--lp-modal-bg,var(--dsw-alias-bg-base));box-shadow:0 4px 18px #0003;}
.lp-settings-background+.lp-settings-background{border-top:1px solid var(--dsw-alias-border-l2);padding-top:12px;}
.lp-settings-group .lp-field>span:first-child{display:block;min-height:1lh;}
.lp-settings-group .lp-field>.lp-input,.lp-settings-group .lp-field>.lp-select{min-width:0;width:100%;}
@media (prefers-reduced-motion: reduce){.lp-page *{transition:none !important;}}
`;

// The stylesheet must exist for every panel, not only while the planning
// panel happens to be mounted, so it is attached to the document once.
if (typeof document !== 'undefined' && !document.getElementById('life-planner-styles')) {
  const sheet = document.createElement('style');
  sheet.id = 'life-planner-styles';
  sheet.textContent = CSS;
  document.head.appendChild(sheet);
}

// ---- skins.js ----
// Skins use their own stylesheet. The saved appearance stays independent.
const LP_SKIN_STORAGE = 'lpSkin';
const LP_SKIN_CHOICE = 'lpSkinChoice.v1';
let selectedSkin;
let selectedSkinChoice;
let skinPreferenceChanged = false;

const SKINS = {
  default: { label: '默认' },
  clawd: { label: 'Clawd' },
  compact: {
    label: '紧凑',
    values: {
      '--lp-fs': '12px',
      '--lp-fs-lg': '13px',
      '--lp-fs-sm': '11px',
      '--lp-h': '24px',
      '--lp-row': '26px',
      '--lp-pad': '12px',
      '--lp-gap': '6px',
      '--lp-r': '6px',
      '--lp-r-sm': '4px',
      '--lp-r-lg': '10px',
    },
  },
  large: {
    label: '大字',
    values: {
      '--lp-fs': '14px',
      '--lp-fs-lg': '16px',
      '--lp-fs-sm': '12px',
      '--lp-h': '32px',
      '--lp-row': '34px',
      '--lp-pad': '20px',
      '--lp-gap': '10px',
      '--lp-r': '10px',
      '--lp-r-sm': '6px',
      '--lp-r-lg': '16px',
    },
  },
};

const CLAWD_CSS = `
html[data-lp-skin="clawd"] .lp-page {
  --lp-clawd-base-accent: #a35039;
  --lp-clawd-surface: #fff3e8;
  --lp-clawd-accent: var(--lp-accent, var(--lp-clawd-base-accent));
  --lp-clawd-on-accent: var(--lp-accent-ink, #fff9f3);
  --lp-clawd-outline: color-mix(in srgb, var(--lp-clawd-accent) 22%, var(--dsw-alias-border-l2));
  --lp-clawd-tint: color-mix(in srgb, var(--lp-clawd-accent) 13%, transparent);
  --lp-surface-base: color-mix(in srgb, var(--lp-clawd-surface) 22%, var(--dsw-alias-bg-base));
  --lp-clawd-card: var(--lp-surface-bg, var(--lp-surface-base));
  --lp-preset-page-bg: color-mix(in srgb, var(--lp-clawd-surface) 28%, var(--dsw-alias-bg-base));
  --dsw-alias-brand-primary: var(--lp-clawd-accent);
  --lp-r: 9px;
  --lp-r-lg: 13px;
}
html[data-lp-skin="clawd"] .lp-page[data-scheme="dark"] {
  --lp-clawd-base-accent: #f29b78;
  --lp-clawd-surface: #342620;
  --lp-clawd-on-accent: var(--lp-accent-ink, #2b1812);
}
html[data-lp-skin="clawd"] .lp-page .lp-head {
  border-color: var(--lp-clawd-outline);
  background: color-mix(in srgb, var(--lp-clawd-surface) 84%, transparent);
  gap: 8px;
  padding-block: 8px;
}
html[data-lp-skin="clawd"] .lp-page .lp-head .lp-tab {
  min-height: 31px;
  padding-inline: 11px;
}
html[data-lp-skin="clawd"] .lp-page .lp-grid {
  gap: 4px;
  padding: 0 10px 10px;
}
html[data-lp-skin="clawd"] .lp-page .lp-cell {
  border: 1px solid var(--lp-clawd-outline);
  border-radius: var(--lp-r);
}
html[data-lp-skin="clawd"] .lp-page .lp-cell[data-weekend="true"]:not([data-selected="true"]) {
  background: color-mix(in srgb, var(--lp-clawd-surface) 56%, transparent);
}
html[data-lp-skin="clawd"] .lp-page .lp-cell[data-dim="true"] {
  border-color: color-mix(in srgb, var(--lp-clawd-outline) 55%, transparent);
}
html[data-lp-skin="clawd"] .lp-page .lp-tab[data-active="true"],
html[data-lp-skin="clawd"] .lp-page .lp-settings-nav-button[aria-current="page"],
html[data-lp-skin="clawd"] .lp-page .lp-cell[data-selected="true"],
html[data-lp-skin="clawd"] .lp-page .lp-weekcell[data-selected="true"] {
  background: var(--lp-clawd-tint);
  border-color: var(--lp-clawd-outline);
}
html[data-lp-skin="clawd"] .lp-page :is(.lp-cal-sticky, .lp-card, .lp-col-head, .lp-weather-details > div, .lp-settings-group) {
  border-color: var(--lp-clawd-outline);
  background: var(--lp-clawd-card);
}
html[data-lp-skin="clawd"] .lp-page[data-scheme="light"] .lp-backdrop:has(> .lp-settings) {
  background: rgba(24, 17, 13, 0.36);
}
html[data-lp-skin="clawd"] .lp-page :is(.lp-cal-bar, .lp-group-head, .lp-settings-nav) {
  border-color: var(--lp-clawd-outline);
}
html[data-lp-skin="clawd"] .lp-page .lp-cell[data-today="true"] {
  box-shadow: inset 0 0 0 1px var(--lp-clawd-accent);
}
html[data-lp-skin="clawd"] .lp-page .lp-cell[data-today="true"] .lp-num {
  padding-inline: .34em;
  border-radius: 6px;
  background: var(--lp-clawd-accent);
  color: var(--lp-clawd-on-accent);
}
html[data-lp-skin="clawd"] .lp-page .lp-btn {
  color: var(--lp-clawd-on-accent);
  background: var(--lp-clawd-accent);
  border-color: var(--lp-clawd-accent);
}
`;

function currentSkin() {
  if (selectedSkin) return selectedSkin;
  try {
    const name = localStorage.getItem(LP_SKIN_STORAGE) || 'default';
    return Object.hasOwn(SKINS, name) ? name : 'default';
  } catch {
    return 'default';
  }
}

function currentSkinChoice() {
  if (selectedSkinChoice) return selectedSkinChoice;
  try {
    const choice = localStorage.getItem(LP_SKIN_CHOICE);
    if (choice?.startsWith('user:') && choice.length > 5) return choice;
    if (choice?.startsWith('builtin:') && Object.hasOwn(SKINS, choice.slice(8))) return choice;
  } catch {}
  return `builtin:${currentSkin()}`;
}

function rememberSkinChoice(choice) {
  selectedSkinChoice = choice;
  try { localStorage.setItem(LP_SKIN_CHOICE, choice); } catch {}
}

function applySkin(name) {
  selectedSkin = Object.hasOwn(SKINS, name) ? name : 'default';
  if (typeof document === 'undefined') return selectedSkin;
  const skin = SKINS[selectedSkin];
  // Tokens live on `.lp-page`, so the override sheet must target it as well;
  // setting them on <html> would be shadowed by the page's own declarations.
  let sheet = document.getElementById('life-planner-skin');
  if (!sheet) {
    sheet = document.createElement('style');
    sheet.id = 'life-planner-skin';
    document.head.appendChild(sheet);
  }
  const body = Object.entries(skin.values || {})
    .map(([key, value]) => `${key}:${value};`)
    .join('');
  sheet.textContent = selectedSkin === 'clawd' ? CLAWD_CSS : body ? `.lp-page{${body}}` : '';
  document.documentElement.dataset.lpSkin = selectedSkin;
  try {
    localStorage.setItem(LP_SKIN_STORAGE, selectedSkin);
  } catch {
    // Storage may be unavailable; the skin still applies for this session.
  }
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('lp-skin-change'));
  return selectedSkin;
}

function restoreHostSkin(name, choice) {
  if (skinPreferenceChanged || !Object.hasOwn(SKINS, name)) return;
  const builtin = `builtin:${name}`;
  const saved = typeof choice === 'string' && choice.startsWith('user:') && Object.hasOwn(userSkins(), choice.slice(5));
  const selected = saved ? choice : builtin;
  rememberSkinChoice(selected);
  applySkin(profileForSkin(selected).skin);
}

function saveActiveSkin() {
  skinPreferenceChanged = true;
  const activeSkin = currentSkin();
  const skinChoice = currentSkinChoice();
  return flushAppearanceSave({ activeSkin, skinChoice });
}

// ---- appearance.js ----
// Appearance model: fonts, sizes, per-area accents, backgrounds and skins.
const APPEARANCE_KEY = 'lpAppearance.v1';
const SKIN_BACKGROUNDS_KEY = 'lpSkinBackgrounds.v1';
const SKIN_PROFILES_KEY = 'lpSkinProfiles.v2';
const DEFAULT_SKIN_CHOICE = 'builtin:default';
const APPEARANCE_AREAS = ['planning', 'study'];

// The artwork ships with the plugin, so every install starts with a background.
const BUILTIN_BACKGROUND_URL = '/life-planner/api/background?area=default&v=1'

const APPEARANCE_DEFAULTS = {
  // Ordered like the calendar page: tabs → titles → calendar → task rows →
  // type → tags → supporting text → mistake cards → everything else.
  font: {
    base: 16,
    tab: 24,
    title: 24,
    calendar: 18,
    task: 20,
    type: 20,
    tag: 20,
    meta: 16,
    mistakeTitle: 26,
    mistakeAnswer: 22,
    mistakeReason: 24,
  },
  // Mistake cards: 0 columns = as many as fit; 0 height = grow with the text.
  size: { calendarHeight: 580, mistakeColumns: 2, mistakeHeight: 0 },
  layout: { calendar: 'stacked', studyToday: 'stacked', studyPlan: 'auto', spacing: 'standard', fontFamily: 'system' },
  accent: { planning: '', study: '' },
  // How see-through the panels over a background image are: 0.15 = 15%.
  surface: 0.15,
  background: {
    planning: {
      mode: 'image',
      color: '#1b1e24',
      // Bundled artwork: served by the host, works for every install.
      imageUrl: BUILTIN_BACKGROUND_URL,
      opacity: 0.35,
      mask: { on: false, side: 'left', width: 25, strength: 0.35 },
    },
    study: {
      mode: 'image',
      color: '#1b1e24',
      imageUrl: BUILTIN_BACKGROUND_URL,
      opacity: 0.35,
      mask: { on: false, side: 'left', width: 25, strength: 0.6 },
    },
  },
};


// The shell changes port on every launch, so localStorage is only a paint
// cache: the durable copy of appearance and skins lives in the host database.
let HOST_UI = null;
let legacyBackgroundAssets = {};
let localSkinProfiles = {};
let changedSkinProfiles = {};

function setHostUi(ui) {
  HOST_UI = ui && typeof ui === 'object' ? ui : null;
}

function setLegacyBackgroundAssets(assets) {
  legacyBackgroundAssets = assets || {};
}

let hostSaveTimer = null;
let hostAppearanceSave = Promise.resolve();

function scheduleHostSave() {
  clearTimeout(hostSaveTimer);
  hostSaveTimer = setTimeout(() => {
    flushAppearanceSave().catch(() => {});
  }, 240);
}

function flushAppearanceSave(selection) {
  clearTimeout(hostSaveTimer);
  hostSaveTimer = null;
  hostAppearanceSave = hostAppearanceSave.catch(() => {}).then(async () => {
    const profiles = changedSkinProfiles;
    const hasProfiles = Object.keys(profiles).length > 0;
    if (!selection && !hasProfiles) return;
    await api('ui.save', { ...selection, ...(hasProfiles ? { skinProfiles: profiles } : {}) });
    if (HOST_UI && hasProfiles) HOST_UI.skinProfiles = { ...HOST_UI.skinProfiles, ...profiles };
    for (const [choice, profile] of Object.entries(profiles)) {
      if (changedSkinProfiles[choice] !== profile) continue;
      const next = { ...changedSkinProfiles };
      delete next[choice];
      changedSkinProfiles = next;
    }
  });
  return hostAppearanceSave;
}

function cloneAppearance(value) {
  return JSON.parse(JSON.stringify(value));
}

function cachedAppearanceValue(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '{}');
    if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  } catch {
    // A corrupt cache must not prevent the host copy from loading.
  }
  return {};
}

function skinProfiles() {
  return { ...cachedAppearanceValue(SKIN_PROFILES_KEY), ...HOST_UI?.skinProfiles, ...localSkinProfiles };
}

function legacyImageArea(value) {
  if (!value) return '';
  try {
    const url = new URL(value, 'http://dsh.internal/');
    const area = url.searchParams.get('area');
    if (url.pathname === '/life-planner/api/background' && APPEARANCE_AREAS.includes(area)) return area;
  } catch {}
  return '';
}

const APPEARANCE_LIMITS = {
  calendarHeight: [0, 1600], mistakeColumns: [0, 6], mistakeHeight: [0, 1200],
};
const APPEARANCE_LAYOUTS = {
  calendar: ['auto', 'stacked'], studyToday: ['auto', 'stacked'], studyPlan: ['auto', 'stacked'],
  spacing: ['compact', 'standard', 'roomy'], fontFamily: ['system', 'serif'],
};

function skinDefaults(skin) {
  const appearance = cloneAppearance(APPEARANCE_DEFAULTS);
  if (skin === 'clawd') {
    appearance.layout = { ...appearance.layout, calendar: 'auto', studyToday: 'auto', fontFamily: 'serif' };
    appearance.font = { ...appearance.font, base: 15, tab: 16, calendar: 15, task: 16, type: 14, tag: 14, meta: 14 };
    for (const layer of Object.values(appearance.background)) Object.assign(layer, { mode: 'none', imageUrl: '' });
  } else if (skin === 'compact' || skin === 'large') {
    appearance.layout.spacing = skin === 'compact' ? 'compact' : 'roomy';
  }
  return appearance;
}

function appearanceNumber(value, min, max, fallback) {
  const number = typeof value === 'number' || (typeof value === 'string' && value.trim()) ? Number(value) : NaN;
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
}

function skinImageUrl(value) {
  if (typeof value !== 'string') return '';
  const local = /^\/life-planner\/api\/background\?(?:area=(?:planning|study|default)(?:&v=\d+)?|asset=[a-f0-9]{64}\.(?:png|jpe?g|gif|webp))$/;
  return local.test(value) ? value : '';
}

function normalizeAppearance(raw, defaults) {
  const appearance = cloneAppearance(defaults);
  const validColor = (value) => typeof value === 'string' && /^#[a-f0-9]{6}$/i.test(value);
  for (const key of Object.keys(appearance.font)) {
    appearance.font[key] = Math.round(appearanceNumber(raw?.font?.[key], 8, 64, appearance.font[key]));
  }
  for (const [key, [min, max]] of Object.entries(APPEARANCE_LIMITS)) {
    appearance.size[key] = Math.round(appearanceNumber(raw?.size?.[key], min, max, appearance.size[key]));
  }
  if (appearance.size.calendarHeight > 0) appearance.size.calendarHeight = Math.max(320, appearance.size.calendarHeight);
  for (const [key, options] of Object.entries(APPEARANCE_LAYOUTS)) {
    if (options.includes(raw?.layout?.[key])) appearance.layout[key] = raw.layout[key];
  }
  appearance.surface = appearanceNumber(raw?.surface, 0, 0.9, appearance.surface);
  for (const area of APPEARANCE_AREAS) {
    const layer = appearance.background[area];
    const incoming = raw?.background?.[area] || {};
    if (['image', 'none', 'color'].includes(incoming.mode)) layer.mode = incoming.mode;
    else if (incoming.imageUrl) layer.mode = 'image';
    if (Object.hasOwn(incoming, 'imageUrl')) layer.imageUrl = skinImageUrl(incoming.imageUrl);
    if (validColor(incoming.color)) layer.color = incoming.color;
    layer.opacity = appearanceNumber(incoming.opacity, 0, 0.9, layer.opacity);
    const mask = incoming.mask || {};
    if (typeof mask.on === 'boolean') layer.mask.on = mask.on;
    if (['left', 'right', 'top', 'bottom'].includes(mask.side)) layer.mask.side = mask.side;
    layer.mask.width = appearanceNumber(mask.width, 5, 90, layer.mask.width);
    layer.mask.strength = appearanceNumber(mask.strength, 0.05, 0.9, layer.mask.strength);
    const oldArea = legacyImageArea(layer.imageUrl);
    if (oldArea && legacyBackgroundAssets[oldArea]) layer.imageUrl = legacyBackgroundAssets[oldArea];
    if (raw?.accent?.[area] === '' || validColor(raw?.accent?.[area])) appearance.accent[area] = raw.accent[area];
  }
  return appearance;
}

function profileForSkin(choice) {
  const profiles = skinProfiles();
  const saved = Object.hasOwn(profiles, choice) ? profiles[choice] : null;
  const named = choice.startsWith('user:') ? legacyUserSkins()[choice.slice(5)] : null;
  const skin = saved?.skin || named?.skin || (choice.startsWith('builtin:') ? choice.slice(8) : 'default');
  const base = Object.hasOwn(SKINS, skin) ? skin : 'default';
  const defaults = skinDefaults(base);
  if (saved?.appearance) return { skin: base, appearance: normalizeAppearance(saved.appearance, defaults) };
  const legacy = { ...cachedAppearanceValue(APPEARANCE_KEY), ...HOST_UI?.appearance };
  const legacyBackgrounds = { ...cachedAppearanceValue(SKIN_BACKGROUNDS_KEY), ...HOST_UI?.skinBackgrounds };
  const owned = legacyBackgrounds[choice];
  const activeNamed = named && HOST_UI?.skinChoice === choice;
  const raw = activeNamed
    ? { ...named.appearance, ...legacy, background: named.appearance?.background }
    : named?.appearance || (choice === DEFAULT_SKIN_CHOICE
      ? legacy : HOST_UI?.activeSkin === base && !HOST_UI?.skinChoice?.startsWith('user:') ? { ...legacy, background: undefined } : {});
  const appearance = normalizeAppearance({ ...raw, background: owned || raw.background }, defaults);
  if (!owned && choice === DEFAULT_SKIN_CHOICE) {
    for (const area of APPEARANCE_AREAS) {
      const layer = appearance.background[area];
      if (layer.mode === 'image' && (!layer.imageUrl || layer.imageUrl === BUILTIN_BACKGROUND_URL) && legacyBackgroundAssets[area]) {
        layer.imageUrl = legacyBackgroundAssets[area];
      }
    }
  }
  return { skin: base, appearance };
}

function loadAppearance() {
  return profileForSkin(currentSkinChoice()).appearance;
}

function saveSkinProfile(choice, profile) {
  localSkinProfiles = { ...localSkinProfiles, [choice]: profile };
  changedSkinProfiles = { ...changedSkinProfiles, [choice]: profile };
  try { localStorage.setItem(SKIN_PROFILES_KEY, JSON.stringify(skinProfiles())); } catch {}
  scheduleHostSave();
}

function saveAppearance(value) {
  saveSkinProfile(currentSkinChoice(), { skin: currentSkin(), appearance: value });
}

function migrateSkinProfiles() {
  if (!HOST_UI) return;
  const stored = HOST_UI.skinProfiles || {};
  for (const [choice, profile] of Object.entries(cachedAppearanceValue(SKIN_PROFILES_KEY))) {
    if (!Object.hasOwn(stored, choice) && !Object.hasOwn(localSkinProfiles, choice)) saveSkinProfile(choice, profile);
  }
  if (!HOST_UI.appearance && !HOST_UI.skinBackgrounds && !Object.values(legacyBackgroundAssets).some(Boolean)) return;
  const profiles = skinProfiles();
  for (const skin of new Set(['default', 'clawd', currentSkin()])) {
    const choice = 'builtin:' + skin;
    if (!Object.hasOwn(profiles, choice)) saveSkinProfile(choice, profileForSkin(choice));
  }
  const active = HOST_UI?.skinChoice;
  if (active?.startsWith('user:') && Object.hasOwn(legacyUserSkins(), active.slice(5)) && !Object.hasOwn(profiles, active)) {
    saveSkinProfile(active, profileForSkin(active));
  }
}

function updateSkinBackground(choice, layers) {
  const active = choice === currentSkinChoice();
  const profile = active ? { skin: currentSkin(), appearance: currentAppearance() } : profileForSkin(choice);
  const background = { ...profile.appearance.background };
  for (const [area, patch] of Object.entries(layers)) background[area] = { ...background[area], ...patch };
  const next = normalizeAppearance({ ...profile.appearance, background }, skinDefaults(profile.skin));
  if (active) {
    applyAppearance(next);
    return next;
  }
  if (!choice.startsWith('user:') || Object.hasOwn(userSkins(), choice.slice(5))) {
    saveSkinProfile(choice, { skin: profile.skin, appearance: next });
  }
  return null;
}

/**
 * The mask is a soft wash that covers one edge of the page and fades outwards.
 * It defaults to the left 25% so text on that side stays readable.
 */
function maskGradient(mask) {
  if (!mask || !mask.on) return 'none';
  const width = Math.min(90, Math.max(5, Number(mask.width) || 25));
  const strength = Math.min(1, Math.max(0.05, Number(mask.strength) || 0.6));
  const color = `color-mix(in srgb, var(--dsw-alias-bg-base) ${Math.round(strength * 100)}%, transparent)`;
  const direction =
    { left: 'to right', right: 'to left', top: 'to bottom', bottom: 'to top' }[mask.side] || 'to right';
  return `linear-gradient(${direction}, ${color} 0%, transparent ${width}%)`;
}

/**
 * Apply the appearance by writing one stylesheet plus per-page layers. Sizes are
 * emitted as variables so the tree, board and study panels inherit them.
 */
// Background bytes are fetched once and exposed as blob URLs. A plain CSS url
// cannot carry the page's request headers, so this is what actually works in
// the desktop shell.
const BACKGROUND_BLOBS = { planning: '', study: '' };
// The URL a blob belongs to, so a reload never fetches the same image twice.
const BACKGROUND_SOURCES = { planning: '', study: '' };
const BACKGROUND_PENDING = Object.create(null);

async function hydrateBackgrounds(appearance, onlyAreas) {
  const areas = Array.isArray(onlyAreas) && onlyAreas.length > 0 ? onlyAreas : ['planning', 'study'];
  const tasks = areas.map(async (area) => {
    const layer = appearance && appearance.background && appearance.background[area];
    const url = layer && layer.imageUrl;
    if (!url || layer.mode !== 'image') return { area, ok: true, skipped: true };
    if (BACKGROUND_SOURCES[area] === url && BACKGROUND_BLOBS[area]) return { area, ok: true, cached: true };
    const absolute = (() => {
      try {
        const base = (typeof document !== 'undefined' && document.baseURI) || 'http://dsh.internal/'
        return new URL(url, base).toString()
      } catch {
        return url
      }
    })()
    if (!BACKGROUND_PENDING[url]) {
      BACKGROUND_PENDING[url] = fetch(absolute).then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const blob = await response.blob();
        if (!blob || blob.size === 0) throw new Error('empty image');
        return blob;
      }).finally(() => { delete BACKGROUND_PENDING[url]; });
    }
    try {
      const blob = await BACKGROUND_PENDING[url];
      if (currentAppearance().background[area]?.imageUrl !== url) return { area, ok: true, skipped: true };
      if (BACKGROUND_SOURCES[area] === url && BACKGROUND_BLOBS[area]) return { area, ok: true, cached: true };
      if (BACKGROUND_BLOBS[area]) URL.revokeObjectURL(BACKGROUND_BLOBS[area]);
      BACKGROUND_BLOBS[area] = URL.createObjectURL(blob);
      BACKGROUND_SOURCES[area] = url;
      return { area, ok: true };
    } catch (error) {
      console.error('[life-planner] background could not be loaded', area, error);
      return { area, ok: false };
    }
  });
  const results = await Promise.all(tasks);
  const current = CURRENT_APPEARANCE;
  if (current && results.some(({ area, ok, cached, skipped }) => ok && !cached && !skipped &&
    current.background[area].mode === 'image' && current.background[area].imageUrl === BACKGROUND_SOURCES[area])) {
    applyAppearance(current, { persist: false });
  }
  return {
    loaded: results.filter((entry) => entry.ok && !entry.skipped).map((entry) => entry.area),
    failed: results.filter((entry) => !entry.ok).map((entry) => entry.area),
  };
}

// Last applied appearance, so layout code can read a configured size, plus a
// subscription so layout can follow a change made in the settings dialog.
let CURRENT_APPEARANCE = null;
const APPEARANCE_LISTENERS = new Set();

function onAppearanceChange(listener) {
  APPEARANCE_LISTENERS.add(listener);
  return () => APPEARANCE_LISTENERS.delete(listener);
}

function currentAppearance() {
  if (CURRENT_APPEARANCE) return CURRENT_APPEARANCE;
  try {
    return loadAppearance();
  } catch {
    return cloneAppearance(APPEARANCE_DEFAULTS);
  }
}

/**
 * Changing a stylesheet does not always invalidate the paint in the desktop
 * shell, which left the panel looking unchanged until a dialog forced a
 * repaint. Toggling a compositing hint and a resize event forces it.
 */
function nudgePaint() {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  const page = document.querySelector('.lp-page');
  if (page) {
    page.style.transform = 'translateZ(0)';
    // Reading layout flushes the style change before the hint is removed.
    void page.offsetHeight;
    window.requestAnimationFrame(() => {
      page.style.transform = '';
    });
  }
  window.dispatchEvent(new Event('resize'));
}

/**
 * The control fill as an inline-ready colour. Reading the theme colour here
 * avoids depending on a stylesheet rule being present and winning the cascade.
 */
function controlSurface(alpha = 0.45) {
  return 'color-mix(in srgb, var(--dsw-alias-bg-base) ' + Math.round(alpha * 100) + '%, transparent)';
}

function accentInk(color) {
  const [r, g, b] = color.slice(1).match(/../g).map((pair) => {
    const channel = parseInt(pair, 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return r * 0.2126 + g * 0.7152 + b * 0.0722 > 0.179 ? '#171717' : '#ffffff';
}

function applyAppearance(value, { persist = true } = {}) {
  if (typeof document === 'undefined') return;
  const appearance = persist
    ? normalizeAppearance(value || loadAppearance(), skinDefaults(currentSkin()))
    : value || loadAppearance();
  CURRENT_APPEARANCE = appearance;
  const { font, size, accent, background, layout } = appearance;
  const sheetId = 'life-planner-appearance';
  let sheet = document.getElementById(sheetId);
  if (!sheet) {
    sheet = document.createElement('style');
    sheet.id = sheetId;
    document.head.appendChild(sheet);
  } else if (sheet.parentNode === document.head) {
    // Re-append so this sheet stays after every other plugin stylesheet: the
    // appearance must win the cascade even when a skin sheet was added later.
    document.head.appendChild(sheet);
  }
  const mix = (percent) => `color-mix(in srgb, var(--dsw-alias-bg-base) ${percent}%, transparent)`;
  const surfaceBase = 'var(--lp-surface-base, var(--dsw-alias-bg-base))';
  const spacing = { compact: [12, 8, 11], standard: [16, 12, 17], roomy: [22, 16, 23] }[layout.spacing];
  const fontFamily = layout.fontFamily === 'serif'
    ? 'Georgia, "Songti SC", "Noto Serif CJK SC", "SimSun", serif' : 'inherit';
  const css = [];
  const px = (value, fallback) => `${Number(value) || fallback}px`;
  css.push(
    `.lp-page{--lp-fs:${px(font.base, 13)};--lp-font-family:${fontFamily};` +
      `--lp-content-pad:${spacing[0]}px;--lp-layout-gap:${spacing[1]}px;` +
      (layout.studyPlan === 'stacked' ? '--lp-study-plan-cols:minmax(0,1fr);--lp-study-plan-spacer:none;' : '') +
      (layout.studyToday === 'auto' ? '--lp-study-today-cols:minmax(0,1.65fr) minmax(0,1fr);' : '') +
      // Two steps around the base keep every size a plain pixel value.
      `--lp-fs-sm:${Math.max(10, (Number(font.base) || 13) - 1)}px;` +
      `--lp-fs-xs:${Math.max(9, (Number(font.base) || 13) - 2)}px;` +
      `--lp-fs-lg:${(Number(font.base) || 13) + 2}px;` +
      `--lp-tab-fs:${px(font.tab, 13)};--lp-title-fs:${px(font.title, 15)};` +
      `--lp-cal-fs:${px(font.calendar, 12)};--lp-task-fs:${px(font.task, 13)};` +
      `--lp-type-fs:${px(font.type, 11)};--lp-tag-fs:${px(font.tag, 12)};--lp-meta-fs:${px(font.meta, 11)};` +
      // Mistake cards: three separate sizes plus a column count and card height.
      `--lp-mistake-title-fs:${px(font.mistakeTitle, 15)};` +
      `--lp-mistake-answer-fs:${px(font.mistakeAnswer, 13)};` +
      `--lp-mistake-reason-fs:${px(font.mistakeReason, 12)};` +
      (size.mistakeColumns > 0 ? `--lp-mistake-cols:${size.mistakeColumns};` : '') +
      `--lp-mistake-h:${Number(size.mistakeHeight) > 0 ? `${Math.round(Number(size.mistakeHeight))}px` : 'auto'};` +
      // Row and tag heights follow their text instead of being hand-tuned.
      `--lp-row:${Math.round((Number(font.task) || 13) + spacing[2])}px;` +
      `--lp-tag-h:${Math.round((Number(font.tag) || 12) + 10)}px;` +
      `--lp-cal-h:${Number(size.calendarHeight) > 0 ? `${Number(size.calendarHeight)}px` : '420px'};}`,
  );
  for (const area of APPEARANCE_AREAS) {
    if (!accent[area]) continue;
    const selector = area === 'study' ? '.lp-page.lp-study' : '.lp-page:not(.lp-study)';
    css.push(`${selector}{--lp-accent:${accent[area]};--lp-accent-ink:${accentInk(accent[area])};--dsw-alias-brand-primary:${accent[area]};}`);
  }
  for (const area of ['planning', 'study']) {
    const layer = background[area] || {};
    const mask = layer.mask || { on: false };
    const selector = area === 'study' ? '.lp-page.lp-study' : '.lp-page:not(.lp-study)';
    const source = layer.mode === 'image'
      ? (BACKGROUND_SOURCES[area] === layer.imageUrl && BACKGROUND_BLOBS[area]) || layer.imageUrl : '';
    const solid = layer.mode === 'color' && layer.color ? layer.color : '';
    const keep = Math.round((1 - appearance.surface) * 100);
    const surface = `color-mix(in srgb, ${surfaceBase} ${keep}%, transparent)`;
    if (!source) {
      // A solid fill still paints, so only the image layers are cleared.
      css.push(
        `${selector}{--lp-bg-image:none;--lp-bg-overlay:none;--lp-bg-fade:none;` +
          `--lp-bg-color:${solid || 'var(--lp-preset-page-bg, var(--dsw-alias-bg-base))'};` +
          `--lp-surface-bg:${solid ? surface : surfaceBase};` +
          `--lp-control-bg:var(--dsw-alias-bg-layer-1);` +
          `--lp-modal-bg:var(--dsw-alias-bg-base);}`,
      );
      continue;
    }
    // Panels over a background go translucent so the image stays visible.
    // Controls sit on top of panels and are small, so they need a much lighter
    // fill: 45% of the base colour reads as translucent, 85% looks solid.
    const keepControl = 45;
    // `background-image` only accepts images, so a tint must be a gradient:
    // a bare colour there invalidates the whole declaration.
    const tint = mix(Math.round((1 - layer.opacity) * 100));
    const overlay = `linear-gradient(${tint}, ${tint})`;
    const fade = maskGradient(mask);
    css.push(
      `${selector}{--lp-surface-bg:${surface};` +
        `--lp-control-bg:color-mix(in srgb, var(--dsw-alias-bg-base) ${keepControl}%, transparent);` +
        // Dialogs stay almost opaque so the page behind cannot distract reading or input.
        `--lp-modal-bg:color-mix(in srgb, var(--dsw-alias-bg-base) 97%, transparent);` +
        `--lp-bg-color:var(--dsw-alias-bg-base);--lp-bg-image:url("${source}");--lp-bg-overlay:${overlay};--lp-bg-fade:${fade};}`,
    );
  }
  sheet.textContent = css.join('\n');
  document.documentElement.dataset.lpAccent = accent.planning || accent.study ? 'custom' : 'default';
  document.documentElement.dataset.lpMistakeFixed = String(size.mistakeHeight > 0);
  if (persist) {
    saveAppearance(appearance);
  }
  nudgePaint();
  // Layout that depends on a size (the calendar) re-measures on change.
  for (const listener of APPEARANCE_LISTENERS) {
    try {
      listener(appearance);
    } catch {
      // A listener must never break the appearance pass.
    }
  }
}

function skinLabel(name) {
  const entry = SKINS[name];
  return entry && entry.label ? entry.label : String(name || '');
}

// --- named skins ------------------------------------------------------------
// The skin dropdown lists the built-in token skins plus whatever the user saved.
// A saved skin is a full snapshot: appearance (fonts, sizes, background) + skin.
const USER_SKINS_KEY = 'lpUserSkins.v1';

function legacyUserSkins() {
  return { ...cachedAppearanceValue(USER_SKINS_KEY), ...HOST_UI?.skins };
}

function userSkins() {
  const skins = legacyUserSkins();
  for (const [choice, profile] of Object.entries(skinProfiles())) {
    if (!choice.startsWith('user:')) continue;
    const name = choice.slice(5);
    if (profile === null) delete skins[name];
    else Object.defineProperty(skins, name, { value: profile, configurable: true, enumerable: true });
  }
  return skins;
}

function listSkinOptions(t) {
  const options = [
    { value: 'builtin:default', label: t('skinDefault') },
    { value: 'builtin:clawd', label: t('skinClawd') },
  ];
  if (!['default', 'clawd'].includes(currentSkin())) {
    options.push({ value: `builtin:${currentSkin()}`, label: skinLabel(currentSkin()) });
  }
  for (const name of Object.keys(userSkins())) options.push({ value: `user:${name}`, label: name });
  return options;
}

function saveUserSkin(name, profile = { skin: currentSkin(), appearance: currentAppearance() }) {
  const clean = Array.from(String(name || '').trim()).slice(0, 24).join('');
  if (!clean || /[\u0000-\u001f]/.test(clean)) throw new Error('invalid skin name');
  saveSkinProfile(`user:${clean}`, { skin: profile.skin, appearance: cloneAppearance(profile.appearance) });
  return clean;
}

function deleteUserSkin(name) {
  if (!Object.hasOwn(userSkins(), name)) return false;
  saveSkinProfile(`user:${name}`, null);
  return true;
}

function applySkinChoice(value) {
  if (value.startsWith('user:') && !Object.hasOwn(userSkins(), value.slice(5))) return currentAppearance();
  const profile = profileForSkin(value);
  rememberSkinChoice(value);
  applySkin(profile.skin);
  applyAppearance(profile.appearance, { persist: false });
  return profile.appearance;
}

function readImageData(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function exportAppearance(name) {
  const skin = currentSkin();
  const appearance = cloneAppearance(currentAppearance());
  const urls = new Set(Object.values(appearance.background).map((layer) => layer.imageUrl).filter(
    (url) => url && url !== BUILTIN_BACKGROUND_URL,
  ));
  const assets = {};
  for (const url of urls) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    assets[url] = await readImageData(await response.blob());
  }
  return JSON.stringify({ version: 2, name, skin, appearance, assets }, null, 2);
}

async function importAppearance(text, fallbackName, legacySkin) {
  const parsed = JSON.parse(text);
  const incoming = parsed?.appearance || parsed;
  if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming) ||
    !Object.keys(APPEARANCE_DEFAULTS).some((section) => Object.hasOwn(incoming, section))) {
    throw new Error('invalid appearance file');
  }
  const skin = parsed.version === 2 && Object.hasOwn(SKINS, parsed.skin) ? parsed.skin : legacySkin;
  const appearance = normalizeAppearance(incoming, skinDefaults(skin));
  if (parsed.version === 2) {
    const images = new Map();
    for (const area of APPEARANCE_AREAS) {
      const layer = appearance.background[area];
      const oldUrl = skinImageUrl(incoming.background?.[area]?.imageUrl);
      if (!oldUrl || oldUrl === BUILTIN_BACKGROUND_URL) continue;
      const dataUrl = parsed.assets?.[oldUrl];
      if (typeof dataUrl !== 'string' || !/^data:image\/(png|jpeg|jpg|gif|webp);base64,/i.test(dataUrl)) {
        throw new Error('skin file is missing a background image');
      }
      if (!images.has(oldUrl)) {
        const saved = await api('background.set', { area, dataUrl, forPreset: true });
        images.set(oldUrl, saved.url);
      }
      layer.imageUrl = images.get(oldUrl);
    }
  }
  const desired = typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name.trim() : fallbackName;
  const names = userSkins();
  let name = Array.from(desired).slice(0, 24).join('');
  for (let index = 2; Object.hasOwn(names, name); index += 1) {
    const suffix = ' ' + index;
    name = Array.from(desired).slice(0, 24 - suffix.length).join('') + suffix;
  }
  return saveUserSkin(name, { skin, appearance });
}

// ---- helpers.js ----
// helpers.js — shared helpers for the panels and views.
function usePageScheme() {
  const pageRef = React.useRef(null);
  const [scheme, setScheme] = React.useState('light');
  React.useEffect(() => {
    const host = pageRef.current?.parentElement;
    if (!host) return undefined;
    // Resolve the host's base color outside the page's skin and custom background.
    const probe = document.createElement('span');
    probe.style.color = 'color-mix(in srgb, var(--dsw-alias-bg-base, white) 100%, transparent)';
    probe.style.display = 'none';
    host.appendChild(probe);
    const read = () => {
      const color = getComputedStyle(probe).color;
      const srgb = /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/.exec(color);
      const rgb = srgb || /^rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/.exec(color);
      if (!rgb) return;
      const [r, g, b] = rgb.slice(1, 4).map(Number);
      setScheme(r * 0.299 + g * 0.587 + b * 0.114 > (srgb ? 0.5 : 128) ? 'light' : 'dark');
    };
    const observer = new MutationObserver(read);
    const attributeFilter = ['class', 'data-theme', 'data-color-scheme', 'style'];
    for (let node = host; node; node = node.parentElement) {
      observer.observe(node, { attributeFilter });
    }
    const preference = window.matchMedia('(prefers-color-scheme: dark)');
    preference.addEventListener('change', read);
    read();
    return () => {
      observer.disconnect();
      preference.removeEventListener('change', read);
      probe.remove();
    };
  }, []);
  return [pageRef, scheme];
}
const pad = (value) => String(value).padStart(2, '0');

function dayKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function studyLocalDayKey(now = new Date()) {
  const date = new Date(now);
  if (date.getHours() < 4) date.setDate(date.getDate() - 1);
  return dayKey(date);
}

function toLocalInput(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${dayKey(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromLocalInput(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function timeLabel(item) {
  const timestamp = item.dueAt || item.startAt;
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function isOverdue(item) {
  return Boolean(item.dueAt) && !item.derived.done && new Date(item.dueAt).getTime() < Date.now();
}

// Semantic priority colours: four levels, readable on both themes.
const priorityOf = (item) => (Number.isFinite(Number(item.priority)) ? Number(item.priority) : 5);

const priorityBucket = (value) => (value >= 7 ? 'high' : value >= 3 ? 'medium' : 'low');
// Priority is an ordered ramp and owns the warm end (urgency). Low is a
// neutral so it never competes with the "done" green.
const PRIORITY_TONES = [
  { max: 2, key: 'low', color: '#8A8F98' }, // 中性灰
  { max: 5, key: 'medium', color: '#5976BA' }, // 苍苍
  { max: 8, key: 'high', color: '#EA5514' }, // 黄丹
  { max: 9, key: 'highest', color: '#D12920' }, // 银朱
];

const toneOf = (priority) => {
  const value = Number(priority);
  const safe = Number.isFinite(value) ? value : 5;
  return PRIORITY_TONES.find((tone) => safe <= tone.max) || PRIORITY_TONES[3];
};

// Categorical colours for task types and tags stay on the cool side so they
// never read as urgency (red/orange) or completion (green).
const PALETTE = [
  '#2E59A7', // 群青
  '#178069', // 石绿
  '#108B96', // 吉翠
  '#A6559D', // 紫蒲
  '#CB5C83', // 琅玕紫
  '#2B2E77', // 青金石
  '#B6A014', // 苍黄
  '#75C1C4', // 松石
];

const colorOfName = (name, overrides, kind = 'type') => {
  const scoped = kind + ':' + name;
  const saved = Object.hasOwn(overrides || {}, scoped) ? overrides[scoped] : overrides?.[name];
  if (typeof saved === 'string' && /^#[0-9a-f]{6}$/i.test(saved)) return saved;
  let hash = 0;
  const text = String(name || '');
  for (let index = 0; index < text.length; index += 1) hash = (hash * 31 + text.charCodeAt(index)) % 100000;
  return PALETTE[hash % PALETTE.length];
};

/** Every unfinished, unarchived entry due on a day (projects included). */
function openEntries(items) {
  return items.filter((item) => !item.derived.archived && !item.derived.done);
}

function topTask(items) {
  let best = null;
  for (const item of openEntries(items)) {
    if (!best) {
      best = item;
      continue;
    }
    const rank = priorityOf(item);
    const bestRank = priorityOf(best);
    if (rank > bestRank) best = item;
    else if (rank === bestRank) {
      const a = item.dueAt ? new Date(item.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
      const b = best.dueAt ? new Date(best.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
      if (a < b) best = item;
    }
  }
  return best;
}

function groupByDay(items) {
  const map = new Map();
  for (const item of items) {
    const timestamp = item.dueAt || item.startAt;
    if (!timestamp) continue;
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) continue;
    const key = dayKey(date);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  for (const list of map.values()) {
    list.sort((a, b) => {
      const rank = priorityOf(b) - priorityOf(a);
      if (rank !== 0) return rank;
      return String(a.dueAt || a.startAt).localeCompare(String(b.dueAt || b.startAt));
    });
  }
  return map;
}

function monthMatrix(anchor) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - offset);
  const todayK = dayKey(new Date());
  const cells = [];
  for (let index = 0; index < 42; index += 1) {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
    cells.push({
      key: dayKey(date),
      day: date.getDate(),
      inMonth: date.getMonth() === anchor.getMonth(),
      isToday: dayKey(date) === todayK,
      date,
    });
  }
  return cells;
}

function weekMatrix(selectedKey) {
  const base = new Date(`${selectedKey}T12:00:00`);
  const offset = (base.getDay() + 6) % 7;
  const monday = new Date(base.getFullYear(), base.getMonth(), base.getDate() - offset);
  const todayK = dayKey(new Date());
  const cells = [];
  for (let index = 0; index < 7; index += 1) {
    const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index);
    cells.push({
      key: dayKey(date),
      day: date.getDate(),
      inMonth: true,
      isToday: dayKey(date) === todayK,
      date,
    });
  }
  return cells;
}

function weekdayLabels(t) {
  return [0, 1, 2, 3, 4, 5, 6].map((index) => t(`wd${index}`));
}

function monthTitle(t, anchor) {
  return t('monthLabel').replace('{y}', String(anchor.getFullYear())).replace('{m}', String(anchor.getMonth() + 1));
}

function childrenMap(items) {
  const map = new Map();
  for (const item of items) {
    const key = item.parentId || null;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  for (const list of map.values()) {
    list.sort((a, b) => (a.order || 0) - (b.order || 0) || String(a.createdAt).localeCompare(String(b.createdAt)));
  }
  return map;
}

function descendantIds(items, rootId) {
  const map = childrenMap(items);
  const out = new Set();
  const stack = [rootId];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const child of map.get(current) || []) {
      if (!out.has(child.id)) {
        out.add(child.id);
        stack.push(child.id);
      }
    }
  }
  return out;
}

/**
 * Prerequisites worth showing: explicit ones that are not inside this node's
 * own subtree. A parent already waits for its descendants implicitly, so
 * repeating that as "blocked" would be noise.
 */
function displayBlockers(item, byId, items) {
  const below = descendantIds(items, item.id);
  return (item.dependsOn || [])
    .map((id) => byId.get(id))
    .filter((dep) => dep && !dep.derived.done && !below.has(dep.id));
}

// One node type only, so every label resolves to the same word.
// A tiny stale-while-revalidate cache: the panel paints the previous snapshot
// instantly, then the network answer replaces it.
const PLANNER_CACHE_KEY = 'lpPlannerCache.v1';

function readPlannerCache() {
  try {
    const raw = localStorage.getItem(PLANNER_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writePlannerCache(patch) {
  try {
    const current = readPlannerCache() || {};
    const next = { ...current, ...patch };
    const text = JSON.stringify(next);
    // The snapshot can grow large; keep well inside the storage quota.
    if (text.length > 3_500_000) return;
    localStorage.setItem(PLANNER_CACHE_KEY, text);
  } catch {
    // A full quota only costs the cache, never correctness.
  }
}

/** Numeric form fields: an empty box keeps the fallback instead of saving 0. */
function clampNumber(value, min, max, fallback) {
  const number = Number(value)
  if (value === '' || value === null || value === undefined || !Number.isFinite(number)) return fallback
  return Math.min(max, Math.max(min, Math.round(number)))
}

function kindLabel(t) {
  return t('kindTask');
}

/** "10:00-13:00,19:00-02:00" → ranges, or null when the text is malformed. */
function parseWindowsText(text) {
  const parts = String(text || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 0) return [];
  const ranges = [];
  for (const part of parts) {
    const match = /^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/.exec(part);
    if (!match) return null;
    const [sh, sm, eh, em] = match.slice(1).map(Number);
    if (sh > 23 || eh > 23 || sm > 59 || em > 59) return null;
    ranges.push({ start: sh * 60 + sm, end: eh * 60 + em });
  }
  return ranges;
}

const KIND_GLYPH = { area: '○', project: '○', task: '○' };

// ---- ui.js ----
function Icon(props) {
  const size = props.size || 18;
  return h(
    'svg',
    { width: size, height: size, viewBox: '0 0 24 24', 'aria-hidden': true, style: { display: 'block' } },
    h('path', {
      d: 'M4 5.5A1.5 1.5 0 0 1 5.5 4h4l1.6 2H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.6,
      strokeLinejoin: 'round',
    }),
    h('path', {
      d: 'M8.5 13.5l2 2 4-4.5',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.6,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    }),
  );
}

// The default boolean control: an oval slider, placed at the right edge of its
// row by the caller (`lp-switch-row`).
function Switch(props) {
  const on = Boolean(props.value);
  return h(
    'button',
    {
      type: 'button',
      role: 'switch',
      'aria-label': props.label,
      'aria-checked': String(on),
      className: 'lp-toggle',
      'data-on': String(on),
      disabled: props.disabled ? true : undefined,
      onClick: () => props.onChange && props.onChange(!on),
    },
    h('span', { className: 'lp-toggle-track' }, h('span', { className: 'lp-toggle-knob' })),
  );
}

/** Enter/Space on a custom row or card re-runs its click behaviour. */
function keyActivate(handler) {
  return (event) => {
    if (event.target !== event.currentTarget) return;
    if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return;
    event.preventDefault();
    handler(event);
  };
}

/**
 * One dialog shell for every modal: a fixed backdrop, Esc to close, the first
 * focusable child focused on open, Tab cycling inside, and a click on the
 * backdrop closing it. Callers keep their own title and action buttons.
 */
function Modal(props) {
  const panelRef = React.useRef(null);
  const closeRef = React.useRef(props.onClose);
  React.useEffect(() => {
    closeRef.current = props.onClose;
  });
  React.useEffect(() => {
    const node = panelRef.current;
    if (!node || typeof document === 'undefined') return undefined;
    const previous = document.activeElement;
    const focusables = () =>
      Array.from(
        node.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]',
        ),
      ).filter((element) => element.getClientRects().length > 0 && element.tabIndex >= 0);
    const first = focusables()[0];
    if (first && typeof first.focus === 'function') first.focus();
    const onKeyDown = (event) => {
      const dialogs = document.querySelectorAll('.lp-backdrop .lp-modal');
      if (dialogs[dialogs.length - 1] !== node || event.defaultPrevented) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        if (typeof closeRef.current === 'function') closeRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const list = focusables();
      if (list.length === 0) {
        event.preventDefault();
        return;
      }
      const index = list.indexOf(document.activeElement);
      const last = list.length - 1;
      if (event.shiftKey) {
        if (index <= 0) {
          event.preventDefault();
          list[last].focus();
        }
        return;
      }
      if (index === -1 || index === last) {
        event.preventDefault();
        list[0].focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (previous && typeof previous.focus === 'function') previous.focus();
    };
  }, []);
  const className = props.className ? `lp-modal ${props.className}` : 'lp-modal';
  const children = Array.isArray(props.children)
    ? props.children
    : props.children === undefined
      ? []
      : [props.children];
  return h(
    'div',
    {
      className: 'lp-backdrop',
      onClick: (event) => {
        if (event.target === event.currentTarget && typeof props.onClose === 'function') props.onClose();
      },
    },
    h(
      'div',
      {
        className,
        role: 'dialog',
        'aria-modal': 'true',
        'aria-label': typeof props.title === 'string' ? props.title : undefined,
        'data-lp-confirm': props.confirm ? 'centered' : undefined,
        ref: panelRef,
        style: props.wide ? { width: 'min(760px,100%)' } : undefined,
        onClick: (event) => event.stopPropagation(),
      },
      // Spread the children back into argument position: an array child would
      // make React ask for keys on dialog content that never needs any.
      ...[props.title ? h('div', { className: 'lp-modal-title' }, props.title) : null, ...children],
    ),
  );
}

// Anchored menus share one placement model: fixed coordinates measured from
// the trigger, recomputed while the page scrolls (capture, so inner scrollers
// count) or resizes, and removed as soon as the menu closes.
let anchoredMenuSeq = 0;

function anchoredMenuPosition(rect, viewport, { minWidth, maxHeight, height, align }) {
  const margin = 8;
  const gap = 4;
  const width = Math.min(Math.max(rect.width, minWidth), Math.max(0, viewport.width - 2 * margin));
  const left = Math.max(margin, Math.min(align === 'end' ? rect.right - width : rect.left, viewport.width - width - margin));
  const below = Math.max(0, viewport.height - margin - rect.bottom - gap);
  const above = Math.max(0, rect.top - gap - margin);
  const desired = Math.min(maxHeight, height);
  const openBelow = below >= desired || below >= above;
  const cap = Math.min(maxHeight, openBelow ? below : above);
  const top = openBelow ? rect.bottom + gap : rect.top - gap - Math.min(desired, cap);
  return { left, top, width, maxHeight: cap };
}

function useAnchoredMenu(config) {
  const options = React.useRef(config);
  options.current = config;
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState(null);
  const [active, setActive] = React.useState(-1);
  const [menuId] = React.useState(() => `lp-menu-${(anchoredMenuSeq += 1)}`);
  const anchorRef = React.useRef(null);
  const menuRef = React.useRef(null);

  const measure = () => {
    const node = anchorRef.current;
    if (!node || !node.isConnected || typeof window === 'undefined') return null;
    const current = options.current || {};
    const count = Number(current.count) || 0;
    const rect = node.getBoundingClientRect();
    if (rect.bottom <= 0 || rect.top >= window.innerHeight || rect.right <= 0 || rect.left >= window.innerWidth) return null;
    return anchoredMenuPosition(rect, { width: window.innerWidth, height: window.innerHeight }, {
      minWidth: Number(current.minWidth) || 190,
      maxHeight: Number(current.maxHeight) || 240,
      height: menuRef.current ? menuRef.current.scrollHeight + 2 : Math.max(1, count) * (Number(current.itemHeight) || 34) + 12,
      align: current.align,
    });
  };

  const show = (anchor) => {
    if (typeof anchor?.getBoundingClientRect === 'function') anchorRef.current = anchor;
    const current = options.current || {};
    const next = measure();
    if (next) setPos(next);
    const count = Number(current.count) || 0;
    const start = Number(current.activeIndex);
    setActive(Number.isInteger(start) && start >= 0 && start < count ? start : -1);
    setOpen(true);
  };

  const hide = (restoreFocus = false) => {
    setOpen(false);
    setActive(-1);
    options.current.onClose?.();
    if (restoreFocus === true) anchorRef.current?.focus();
  };

  const toggle = () => (open ? hide() : show());

  const choose = (index) => {
    const current = options.current || {};
    const count = Number(current.count) || 0;
    if (index < 0 || index >= count) return;
    if (typeof current.onChoose === 'function') current.onChoose(index);
    if (current.closeOnChoose !== false) hide();
  };

  const onKeyDown = (event) => {
    const current = options.current || {};
    const count = Number(current.count) || 0;
    if (event.key === 'Escape') {
      if (!open) return;
      // Keep Esc inside the popup so an enclosing Modal stays open; the native
      // stop covers React delegating keydown at the document root.
      event.preventDefault();
      event.stopPropagation();
      if (event.nativeEvent && typeof event.nativeEvent.stopImmediatePropagation === 'function') {
        event.nativeEvent.stopImmediatePropagation();
      }
      hide(true);
      return;
    }
    if (open && event.key === 'Tab') {
      hide();
      return;
    }
    if (!open) {
      if (
        event.key === 'Enter' ||
        event.key === ' ' ||
        event.key === 'Spacebar' ||
        event.key === 'ArrowDown' ||
        event.key === 'ArrowUp'
      ) {
        event.preventDefault();
        show();
        if (event.key === 'ArrowUp') setActive(count > 0 ? count - 1 : -1);
      }
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((index) => (count === 0 ? -1 : (index + 1 + count) % count));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((index) => (count === 0 ? -1 : (index - 1 + count) % count));
      return;
    }
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      choose(active);
    }
  };

  React.useEffect(() => {
    if (!open) return undefined;
    const place = () => {
      const next = measure();
      if (!next) {
        hide();
        return;
      }
      setPos((previous) =>
        previous && previous.left === next.left && previous.top === next.top && previous.width === next.width &&
          previous.maxHeight === next.maxHeight
          ? previous
          : next,
      );
    };
    const outside = (event) => {
      if (!anchorRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) hide();
    };
    const escape = (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopImmediatePropagation();
      hide(true);
    };
    place();
    document.addEventListener('pointerdown', outside, true);
    document.addEventListener('keydown', escape, true);
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    const observer = anchorRef.current && typeof IntersectionObserver === 'function'
      ? new IntersectionObserver(([entry]) => { if (entry && !entry.isIntersecting) hide(); })
      : null;
    if (observer) observer.observe(anchorRef.current);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
      document.removeEventListener('pointerdown', outside, true);
      document.removeEventListener('keydown', escape, true);
      observer?.disconnect();
    };
  }, [open, config.count]);

  return {
    open,
    pos,
    active,
    anchorRef,
    menuRef,
    menuId,
    show,
    hide,
    toggle,
    onKeyDown,
    getItemProps: (index, selected) => ({
      key: `${menuId}-opt-${index}`,
      id: `${menuId}-opt-${index}`,
      className: 'lp-dd-item',
      type: 'button',
      role: 'option',
      tabIndex: -1,
      'aria-selected': String(Boolean(selected)),
      'data-active': String(active === index),
      onMouseEnter: () => setActive(index),
      onClick: () => choose(index),
    }),
  };
}

function Dropdown(props) {
  const options = Array.isArray(props.options) ? props.options : [];
  const selectedIndex = options.findIndex((option) => option.value === props.value);
  const current = options[selectedIndex];
  const menu = useAnchoredMenu({
    count: options.length,
    activeIndex: selectedIndex,
    minWidth: 190,
    itemHeight: 34,
    maxHeight: 240,
    onChoose: (index) => {
      const option = options[index];
      if (!option) return;
      if (option.value !== props.value) props.onChange(option.value);
    },
  });

  return h(
    'div',
    { className: 'lp-dd' },
    h(
      'button',
      {
        className: 'lp-select lp-dd-btn',
        type: 'button',
        ref: menu.anchorRef,
        // Inline fill: the toolbar control must be visibly translucent even if
        // an outer stylesheet rule is missing or loses the cascade.
        style: { background: controlSurface(0.45), backdropFilter: 'blur(6px)' },
        'data-lp-surface': 'control',
        'aria-haspopup': 'listbox',
        'aria-expanded': String(menu.open),
        'aria-controls': menu.open ? menu.menuId : undefined,
        'aria-activedescendant':
          menu.open && menu.active >= 0 && menu.active < options.length
            ? `${menu.menuId}-opt-${menu.active}`
            : undefined,
        onClick: menu.toggle,
        onKeyDown: menu.onKeyDown,
      },
      h('span', { className: 'lp-dd-value' }, current ? current.label : props.placeholder || ''),
      h('span', { className: 'lp-dd-caret', 'aria-hidden': true }, '▾'),
    ),
    menu.open && menu.pos
      ? h(
          'div',
          null,
          h(
            'div',
            {
              className: 'lp-dd-menu',
              role: 'listbox',
              ref: menu.menuRef,
              id: menu.menuId,
              tabIndex: -1,
              style: menu.pos,
              onKeyDown: menu.onKeyDown,
            },
            options.map((option, index) =>
              h('button', menu.getItemProps(index, option.value === props.value), option.label),
            ),
          ),
        )
      : null,
  );
}

/** Tag chips plus the location marker, shown wherever a task appears. */
function TagChips(props) {
  const item = props.item || {};
  const list = props.tags || item.tags || [];
  const location = item.location;
  if (list.length === 0 && !location) return null;
  const max = props.max || 2;
  const shown = list.slice(0, max);
  const rest = list.length - shown.length;
  return h(
    React.Fragment,
    null,
    shown.map((tag) =>
      h(
        'span',
        {
          key: tag,
          className: 'lp-tag',
          title: tag,
          style: { color: colorOfName(tag, props.colorOverrides, 'tag'), border: `1px solid ${colorOfName(tag, props.colorOverrides, 'tag')}` },
        },
        tag,
      ),
    ),
    rest > 0 ? h('span', { className: 'lp-meta' }, `+${rest}`) : null,
    location ? h('span', { className: 'lp-meta', title: location }, `📍${location}`) : null,
  );
}

/** Task type chip; an unset type still shows so the slot stays readable. */
function TypeChip(props) {
  const type = props.type || '';
  return h(
    'span',
    {
      className: 'lp-type',
      title: props.fallback,
      style: { color: type ? colorOfName(type, props.colorOverrides) : 'var(--dsw-alias-label-secondary)' },
    },
    type || props.fallback,
  );
}

// ---- background.js ----
const background = { listeners: new Set(), systemSent: new Set() };

const describeReminder = (note, t) => {
  const title = note.kind === 'study' ? t('notifyStudy') : note.kind === 'long' ? t('notifyLong') : t('notifyShort');
  if (note.kind === 'study') return { title, body: note.title };
  const parts = [note.title];
  if (note.dueAt) {
    parts.push(`${t('dueLabel')} ${toLocalInput(note.dueAt).replace('T', ' ')}`);
    if (new Date(note.dueAt).getTime() < Date.now()) parts.push(t('overdueLabel'));
  } else {
    parts.push(t('noDueDate'));
  }
  if (note.priority !== undefined && note.priority !== null) {
    const bucket = priorityBucket(Number(note.priority));
    parts.push(t(`priority${bucket.charAt(0).toUpperCase()}${bucket.slice(1)}`));
  }
  return { title, body: parts.join(' · ') };
};

const pullReminders = (t) => {
  if (typeof document === 'undefined') return;
  api('notifications')
    .then((list) => {
      if (!Array.isArray(list) || list.length === 0) return;
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        const note = list.find((entry) => entry.browserFallback && !background.systemSent.has(entry.id));
        if (note) {
          try {
            const notice = describeReminder(note, t);
            new Notification(notice.title, { body: notice.body, tag: note.id });
            background.systemSent.add(note.id);
            if (background.systemSent.size > 100) background.systemSent.delete(background.systemSent.values().next().value);
            api('notifications.system', { id: note.id }).catch(() => {});
          } catch {
            // The in-app reminder remains available.
          }
        }
      }
      const pending = list.filter((entry) => entry.inAppPending !== false);
      if (!pending.length) return;
      for (const listener of Array.from(background.listeners)) {
        try {
          listener(pending);
        } catch {
          // One broken panel must not stop the reminder loop.
        }
      }
    })
    .catch(() => {});
};

const startBackgroundReminders = (t) => {
  pullReminders(t);
  return setInterval(() => pullReminders(t), 30000);
};

// ---- api.js ----
// api.js — generated from the original single-file client; edit here, then run node build-client.mjs.
// Requests are retried on transport and 5xx failures, de-duplicated per GET and
// bounded in time so a hung socket can never freeze a panel.
const API_TIMEOUT_MS = 15000;
const API_INFLIGHT = new Map();

function api(method, body, { fresh = false } = {}) {
  const key = body === undefined && !fresh ? `GET ${method}` : '';
  if (key && API_INFLIGHT.has(key)) return API_INFLIGHT.get(key);
  const request = apiRequest(method, body, 2);
  if (key) {
    API_INFLIGHT.set(key, request);
    request.then(
      () => API_INFLIGHT.delete(key),
      () => API_INFLIGHT.delete(key),
    );
  }
  return request;
}

async function apiRequest(method, body, retriesLeft) {
  const url = new URL('life-planner/api/' + method, document.baseURI);
  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), API_TIMEOUT_MS) : null;
  const init =
    body === undefined
      ? { method: 'GET', signal: controller ? controller.signal : undefined }
      : {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller ? controller.signal : undefined,
        };
  let response;
  try {
    response = await fetch(url, init);
  } catch (error) {
    // A boot-time race makes the first calls fail; retry before surfacing it.
    if (retriesLeft > 0) {
      await new Promise((resolve) => setTimeout(resolve, 250 * (3 - retriesLeft)));
      return apiRequest(method, body, retriesLeft - 1);
    }
    throw error;
  } finally {
    if (timer) clearTimeout(timer);
  }
  if (response.status >= 500 && retriesLeft > 0) {
    await new Promise((resolve) => setTimeout(resolve, 250 * (3 - retriesLeft)));
    return apiRequest(method, body, retriesLeft - 1);
  }
  const payload = await response
    .json()
    .catch(() => ({ ok: false, error: `HTTP ${response.status}: ${url.pathname}` }));
  if (!payload.ok) throw new Error(payload.error || 'request failed');
  return payload.data;
}

// ---- views/archive.js ----
function ArchiveView(props) {
  const t = props.t;
  const byId = new Map(props.items.map((item) => [item.id, item]));
  const [collapsed, setCollapsed] = React.useState(new Set());

  // Keep archived nodes plus the ancestors that explain where they sat; the
  // rest of the tree stays hidden so the page reads like a pruned work tree.
  const keep = new Set();
  for (const item of props.items) {
    if (!item.derived.archived) continue;
    keep.add(item.id);
    let node = item.parentId ? byId.get(item.parentId) : null;
    while (node) {
      keep.add(node.id);
      node = node.parentId ? byId.get(node.parentId) : null;
    }
  }
  const items = props.items.filter((item) => keep.has(item.id));
  const map = childrenMap(items);

  if (items.length === 0) return h('div', { className: 'lp-empty' }, t('emptyArchive'));

  const toggle = (id) => {
    const next = new Set(collapsed);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCollapsed(next);
  };

  const renderLevel = (parentId) => {
    const list = map.get(parentId) || [];
    if (list.length === 0) return null;
    return h('div', { className: parentId ? 'lp-children' : undefined }, list.map(renderNode));
  };

  const renderNode = (item) => {
    const kids = map.get(item.id) || [];
    const open = !collapsed.has(item.id);
    const archived = Boolean(item.derived.archived);
    return h(
      'div',
      { key: item.id, className: 'lp-node' },
      h(
        'div',
        {
          className: 'lp-row',
          'data-context': String(!archived),
          'data-done': String(item.derived.done),
        },
        kids.length > 0
          ? h(
              'button',
              { className: 'lp-caret', onClick: () => toggle(item.id), 'aria-label': item.title },
              open ? '▾' : '▸',
            )
          : h('span', { className: 'lp-caret', 'data-empty': 'true' }, '▸'),
        h('span', { className: 'lp-ico', 'data-kind': item.kind, style: item.taskType ? { color: colorOfName(item.taskType, props.colorOverrides) } : undefined }, KIND_GLYPH[item.kind] || '○'),
        h('span', { className: 'lp-title', title: item.title }, item.title),
        archived
          ? h(
              'span',
              { className: 'lp-meta' },
              `${t('archivedAt')} ${item.archivedAt ? new Date(item.archivedAt).toLocaleDateString() : '-'}`,
            )
          : null,
        archived
          ? h(
              'span',
              { className: 'lp-actions', style: { opacity: 1 } },
              h('button', { className: 'lp-btn-ghost', onClick: () => props.onRestore(item) }, t('restore')),
            )
          : null,
      ),
      kids.length > 0 && open ? renderLevel(item.id) : null,
    );
  };

  return h('div', { style: { padding: '8px 12px 28px' } }, renderLevel(null));
}

// ---- views/board.js ----
function BoardView(props) {
  const t = props.t;
  const byId = new Map(props.items.map((item) => [item.id, item]));
  const [filterDim, setFilterDim] = React.useState('');
  const [filterValue, setFilterValue] = React.useState('');
  const [beforeDate, setBeforeDate] = React.useState('');
  const dragging = React.useRef(null);
  const [dropTarget, setDropTarget] = React.useState('');
  const canMove = (item, from, to) => {
    if (from === to) return true;
    if (item.derived.studyTask) return from !== 'done' && (to === 'todo' || to === 'doing');
    return !item.derived.studyManaged || (from !== 'done' && to !== 'done');
  };
  const endDrag = () => {
    dragging.current = null;
    setDropTarget('');
  };
  const drop = (event, column, anchorId, after) => {
    const source = dragging.current;
    if (!source) return;
    event.preventDefault();
    event.stopPropagation();
    endDrag();
    if (source.item.id !== anchorId && canMove(source.item, source.column, column)) {
      props.onMove({ id: source.item.id, column, anchorId, after });
    }
  };
  const dragOver = (event, column, key) => {
    const source = dragging.current;
    if (!source) return;
    event.preventDefault();
    event.stopPropagation();
    const allowed = canMove(source.item, source.column, column);
    event.dataTransfer.dropEffect = allowed ? 'move' : 'none';
    setDropTarget(allowed ? key : '');
  };
  const afterMiddle = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return event.clientY >= bounds.top + bounds.height / 2;
  };
  const tagSet = new Set();
  const typeSet = new Set();
  for (const item of props.items) {
    for (const tag of item.tags || []) tagSet.add(tag);
    if (item.taskType) typeSet.add(item.taskType);
  }
  const valueOptions =
    filterDim === 'tag'
      ? Array.from(tagSet).map((name) => ({ value: name, label: name }))
      : filterDim === 'type'
        ? Array.from(typeSet).map((name) => ({ value: name, label: name }))
        : filterDim === 'priority'
          ? [
              { value: 'low', label: t('toneLow') },
              { value: 'medium', label: t('toneMedium') },
              { value: 'high', label: t('toneHigh') },
              { value: 'highest', label: t('toneHighest') },
            ]
          : filterDim === 'due'
            ? [
                { value: 'overdue', label: t('dueOverdue') },
                { value: 'today', label: t('dueToday') },
                { value: 'soon', label: t('dueSoon') },
                { value: 'none', label: t('dueNone') },
                { value: 'before', label: t('dueBefore') },
              ]
            : [];
  const matchesFilter = (item) => {
    if (!filterDim || !filterValue) return true;
    if (filterDim === 'tag') return (item.tags || []).includes(filterValue);
    if (filterDim === 'type') return item.taskType === filterValue;
    if (filterDim === 'priority') return toneOf(item.priority).key === filterValue;
    if (filterDim === 'due') {
      if (filterValue === 'overdue') return isOverdue(item);
      if (filterValue === 'none') return !item.dueAt;
      if (filterValue === 'before') {
        if (!beforeDate) return true;
        if (!item.dueAt) return false;
        return dayKey(new Date(item.dueAt)) < beforeDate;
      }
      if (!item.dueAt) return false;
      const days = (new Date(item.dueAt).getTime() - Date.now()) / 86400000;
      if (filterValue === 'today') return days >= 0 && days < 1;
      if (filterValue === 'soon') return days >= 0 && days <= 3;
    }
    return true;
  };
  const buckets = { todo: [], doing: [], blocked: [], done: [] };
  for (const item of props.items) {
    if (item.derived.archived) continue;
    if (!matchesFilter(item)) continue;
    const column = item.derived.boardColumn || (item.derived.done ? 'done' :
      item.status === 'blocked' || displayBlockers(item, byId, props.items).length > 0 ? 'blocked' :
        item.status === 'doing' ? 'doing' : 'todo');
    buckets[column].push(item);
  }
  for (const list of Object.values(buckets)) {
    list.sort(
      (a, b) =>
        (a.boardOrder ?? Infinity) - (b.boardOrder ?? Infinity) ||
        Number(isOverdue(b)) - Number(isOverdue(a)) ||
        priorityOf(b) - priorityOf(a) ||
        String(a.dueAt || '~').localeCompare(String(b.dueAt || '~')) ||
        a.id.localeCompare(b.id),
    );
  }
  const columns = [
    { key: 'todo', label: t('colTodo') },
    { key: 'doing', label: t('colDoing') },
    { key: 'blocked', label: t('colBlocked') },
    { key: 'done', label: t('colDone') },
  ];
  const onCardKey = (item, column, index, event) => {
    const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (!event.altKey || !keys.includes(event.key)) return keyActivate(() => props.onEdit(item))(event);
    event.preventDefault();
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      const after = event.key === 'ArrowDown';
      const anchor = buckets[column][index + (after ? 1 : -1)];
      if (anchor) props.onMove({ id: item.id, column, anchorId: anchor.id, after });
      return;
    }
    const position = columns.findIndex((entry) => entry.key === column);
    const target = columns[position + (event.key === 'ArrowRight' ? 1 : -1)];
    if (target && canMove(item, column, target.key)) props.onMove({ id: item.id, column: target.key });
  };
  return h(
    'div',
    { className: 'lp-board' },
    h(
      'div',
      { className: 'lp-filters', style: { gridColumn: '1 / -1' } },
      h(Dropdown, {
        value: filterDim,
        onChange: (next) => {
          setFilterDim(next);
          setFilterValue('');
        },
        options: [
          { value: '', label: t('filterNone') },
          { value: 'tag', label: t('filterTag') },
          { value: 'type', label: t('filterType') },
          { value: 'priority', label: t('filterPriority') },
          { value: 'due', label: t('filterDue') },
        ],
      }),
      filterDim
        ? h(Dropdown, {
            value: filterValue,
            onChange: setFilterValue,
            placeholder: t('filterValue'),
            options: valueOptions,
          })
        : null,
      filterDim === 'due' && filterValue === 'before'
        ? h('input', {
            className: 'lp-input',
            type: 'date',
            style: { width: 160, flex: 'none' },
            value: beforeDate,
            onChange: (event) => setBeforeDate(event.target.value),
          })
        : null,
      filterValue
        ? h(
            'button',
            {
              className: 'lp-btn-ghost',
              onClick: () => {
                setFilterDim('');
                setFilterValue('');
              },
            },
            t('filterClear'),
          )
        : null,
      h('span', { className: 'lp-meta' }, t('boardDragHint')),
    ),
    columns.map((column) =>
      h(
        'div',
        {
          key: column.key,
          className: 'lp-col',
          'data-column': column.key,
          'data-drop': dropTarget === column.key ? 'inside' : undefined,
          onDragOver: (event) => dragOver(event, column.key, column.key),
          onDragLeave: (event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setDropTarget('');
          },
          onDrop: (event) => drop(event, column.key),
        },
        h('div', { className: 'lp-col-head' }, `${column.label} · ${buckets[column.key].length}`),
        buckets[column.key].map((item, index) =>
          h(
            'div',
            {
              key: item.id,
              className: 'lp-card',
              tabIndex: 0,
              role: 'button',
              draggable: true,
              'data-item-id': item.id,
              'aria-keyshortcuts': 'Alt+ArrowUp Alt+ArrowDown Alt+ArrowLeft Alt+ArrowRight',
              'data-drop': dropTarget === item.id + ':after' ? 'after' : dropTarget === item.id + ':before' ? 'before' : undefined,
              'data-done': String(item.derived.done),
              style: { borderLeft: `3px solid ${toneOf(item.priority).color}` },
              onClick: () => props.onEdit(item),
              onKeyDown: (event) => onCardKey(item, column.key, index, event),
              onDragStart: (event) => {
                dragging.current = { item, column: column.key };
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('application/x-life-planner-board-task', item.id);
              },
              onDragEnd: endDrag,
              onDragOver: (event) => dragOver(event, column.key, item.id + (afterMiddle(event) ? ':after' : ':before')),
              onDrop: (event) => drop(event, column.key, item.id, afterMiddle(event)),
            },
            h(TypeChip, {
              type: item.taskType,
              fallback: t('typeNone'),
              colorOverrides: props.colorOverrides,
            }),
            h('div', { className: 'lp-card-title', title: item.title }, item.title),
            h(TagChips, { item, colorOverrides: props.colorOverrides }),
            h(
              'div',
              { className: 'lp-card-meta' },
              item.priority !== undefined && item.priority !== null
                ? h(
                    'span',
                    { className: 'lp-card-prio', style: { color: toneOf(item.priority).color } },
                    `P${item.priority}`,
                  )
                : h('span', { className: 'lp-card-prio' }, '—'),
              item.dueAt
                ? h(
                    'span',
                    { className: 'lp-meta', 'data-overdue': String(isOverdue(item)) },
                    toLocalInput(item.dueAt).replace('T', ' '),
                  )
                : null,
            ),
          ),
        ),
        h('div', { className: 'lp-col-space', 'aria-hidden': true }),
      ),
    ),
  );
}

// ---- views/calendar-today.js ----
function lunarDateLabel(date) {
  const parts = new Intl.DateTimeFormat('zh-CN-u-ca-chinese', {
    year: 'numeric', month: 'long', day: 'numeric',
  }).formatToParts(date);
  const year = parts.find((part) => part.type === 'yearName')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = Number(parts.find((part) => part.type === 'day')?.value);
  if (!month || day < 1 || day > 30 || !Number.isInteger(day)) return '';
  const numbers = '一二三四五六七八九十';
  const label = day <= 10 ? '初' + numbers[day - 1]
    : day === 20 ? '二十' : day === 30 ? '三十'
      : (day < 20 ? '十' : '廿') + numbers[day % 10 - 1];
  return (year ? year + '年 ' : '') + month + label;
}

function weatherAppearance(code) {
  if (code === 0) return ['☀️', 'weatherClear'];
  if (code === 1 || code === 2) return ['🌤️', 'weatherPartly'];
  if (code === 3) return ['☁️', 'weatherCloud'];
  if (code === 45 || code === 48) return ['🌫️', 'weatherFog'];
  if (code >= 95) return ['⛈️', 'weatherStorm'];
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return ['🌨️', 'weatherSnow'];
  if (code >= 51) return ['🌧️', 'weatherRain'];
  return ['◌', 'weatherUnavailable'];
}

function CalendarToday({ t, data, date, lunar, onSettings }) {
  const popup = useAnchoredMenu({ count: 10, minWidth: 330, maxHeight: 480 });
  const weather = data?.weather;
  const [icon, condition] = weatherAppearance(weather?.wmoCode);
  const temperature = Number.isFinite(weather?.minC) && Number.isFinite(weather?.maxC)
    ? `${Math.round(weather.minC)}–${Math.round(weather.maxC)} °C` : '';
  const format = (key, value) => t(key).replace('{n}', String(value));
  const details = [
    [t('calendarTemperature'), temperature],
    [t('calendarRain'), Number.isFinite(weather?.precipitationProbability) ? weather.precipitationProbability + '%' : ''],
    [t('calendarWind'), Number.isFinite(weather?.windKph) ? Math.round(weather.windKph) + ' km/h' : ''],
    [t('calendarSun'), weather?.sunrise && weather?.sunset ? weather.sunrise + ' / ' + weather.sunset : ''],
  ].filter(([, value]) => value);
  const advice = data?.advice;
  const updated = data?.updatedAt ? new Date(data.updatedAt) : null;
  const fullDate = t('calendarFullDate').replace('{y}', date.getFullYear())
    .replace('{m}', date.getMonth() + 1).replace('{d}', date.getDate()) +
    ' · ' + weekdayLabels(t)[(date.getDay() + 6) % 7];
  return h(
    'div', { className: 'lp-weather' },
    h('button', {
      className: 'lp-weather-trigger', ref: popup.anchorRef, type: 'button',
      onClick: popup.toggle, 'aria-expanded': popup.open, 'aria-controls': popup.open ? popup.menuId : undefined,
      'aria-label': t('calendarTodayInfo'), title: t('calendarTodayInfo'),
    },
    h('span', { className: 'lp-weather-icon', 'aria-hidden': true }, icon),
    h('span', { className: 'lp-weather-compact' }, temperature || t('calendarTodayShort'))),
    popup.open && popup.pos ? h('section', {
      ref: popup.menuRef, id: popup.menuId, className: 'lp-weather-popup', 'aria-label': t('calendarTodayInfo'),
      style: popup.pos,
    },
    h('div', { className: 'lp-weather-date' }, fullDate),
    lunar ? h('div', { className: 'lp-meta' }, t('calendarLunar') + ' · ' + lunar) : null,
    data?.holiday?.name ? h('div', { className: 'lp-meta' }, data.holiday.name) : null,
    h('div', { className: 'lp-weather-heading' },
      h('span', { className: 'lp-weather-icon', 'aria-hidden': true }, icon),
      h('div', null, h('strong', null, t(condition)), h('div', { className: 'lp-meta' }, data?.region || t('calendarRegionUnknown'))),
      h('button', { className: 'lp-btn-ghost', type: 'button', onClick: () => { popup.hide(); onSettings(); } }, t('tipRegion'))),
    details.length ? h('dl', { className: 'lp-weather-details' }, details.map(([label, value]) =>
      h('div', { key: label }, h('dt', null, label), h('dd', null, value)))) : null,
    h('div', { className: 'lp-weather-advice' },
      h('strong', null, t('calendarLifeAdvice')),
      updated ? h('div', { className: 'lp-meta' }, t('calendarAdviceUpdated') + ' ' +
        (data.adviceDay !== data.day ? data.adviceDay + ' · ' : '') +
        updated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) : null,
      data?.updating ? h('div', { className: 'lp-meta', role: 'status' }, t('calendarRefreshing')) : null,
      advice ? h('ul', null,
        advice.weatherAdvice ? h('li', null, t('calendarAdvice_' + advice.weatherAdvice)) : null,
        h('li', null, advice.top ? format('calendarAdviceTask', advice.top)
          : t(advice.due || advice.starting ? 'calendarAdviceBlocked' : 'calendarAdviceNoTasks')),
        advice.overdue > 0 ? h('li', null, format('calendarAdviceOverdue', advice.overdue)) : null)
        : !data?.updating ? h('p', { className: 'lp-meta' }, t('calendarAdvicePending')) : null,
    )) : null,
  );
}

// ---- views/calendar.js ----
function CalendarView(props) {
  const t = props.t;
  const items = props.items;
  const selectedKey = props.selectedKey;
  const anchor = props.anchor;
  const scrollRef = React.useRef(null);
  const band = React.useRef(0);
  const collapsedRef = React.useRef(false);
  const [split, setSplit] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const [expanded, setExpanded] = React.useState(420);
  // Collapsed always parks at scrollTop 0 so the sticky bar sits above the
  // day list instead of covering it.
  const ANCHOR = 0;

  const setCollapse = (next) => {
    collapsedRef.current = next;
    setCollapsed(next);
  };
  const byDay = groupByDay(items);
  const [selectedId, setSelectedId] = React.useState('');
  const [renaming, setRenaming] = React.useState(null);
  // A row selected on one day should not stay highlighted on another.
  React.useEffect(() => {
    setSelectedId('');
    setRenaming(null);
  }, [selectedKey]);
  const commitRename = () => {
    if (!renaming) return;
    const next = renaming.value.trim();
    const target = renaming.id;
    setRenaming(null);
    if (next && target) props.onRename(target, next);
  };
  // Click selects, double-click on the name renames, double-click elsewhere
  // opens the editor — the same gestures as the work tree.
  const dayRow = (item) =>
    h(
      'div',
      {
        key: item.id,
        className: 'lp-tree-row',
        'data-done': String(item.derived.done),
        'data-selected': String(selectedId === item.id),
        'data-overdue': String(isOverdue(item)),
        onClick: () => setSelectedId(item.id),
        onDoubleClick: () => props.onEdit(item),
      },
      h('input', {
        type: 'checkbox',
        checked: Boolean(item.derived.done),
        disabled: Boolean(item.derived.studyManaged),
        title: item.derived.studyManaged ? t('studyStatusManaged') : undefined,
        onClick: (event) => event.stopPropagation(),
        onChange: (event) => props.onToggle(item, event.target.checked, event),
        'aria-label': item.title,
      }),
      h(
        TypeChip,
        { type: item.taskType, fallback: t('typeNone'), colorOverrides: props.colorOverrides },
      ),
      renaming && renaming.id === item.id
        ? h('input', {
            className: 'lp-inline',
            autoFocus: true,
            value: renaming.value,
            onClick: (event) => event.stopPropagation(),
            onChange: (event) => setRenaming({ id: item.id, value: event.target.value }),
            onBlur: commitRename,
            onKeyDown: (event) => {
              if (event.key === 'Enter') commitRename();
              if (event.key === 'Escape') setRenaming(null);
            },
          })
        : h(
            'span',
            {
              className: 'lp-title',
              title: item.title,
              onClick: (event) => event.stopPropagation(),
              onDoubleClick: (event) => {
                event.stopPropagation();
                setRenaming({ id: item.id, value: item.title });
              },
            },
            item.title,
          ),
      h(TagChips, { item, colorOverrides: props.colorOverrides }),
      item.derived.blocked
        ? h('span', { className: 'lp-badge' }, t('blocked'))
        : null,
      item.dueAt || item.startAt
        ? h('span', { className: 'lp-meta', 'data-overdue': String(isOverdue(item)) }, timeLabel(item))
        : null,
    );
  const cells = monthMatrix(anchor);
  const week = weekMatrix(selectedKey);
  const labels = weekdayLabels(t);
  const [today, setToday] = React.useState(() => new Date());
  const [todayInfo, setTodayInfo] = React.useState(null);
  React.useEffect(() => {
    let stopped = false;
    let timer;
    let generation = 0;
    const refresh = async () => {
      clearTimeout(timer);
      const requested = ++generation;
      let next;
      try {
        next = await api('calendar.context', undefined, { fresh: true });
      } catch {}
      if (!stopped && requested === generation) {
        if (next) setTodayInfo(next);
        setToday((previous) => dayKey(previous) === dayKey(new Date()) ? previous : new Date());
        timer = setTimeout(refresh, next?.updating ? 2500 : 30000);
      }
    };
    refresh();
    window.addEventListener('lp-calendar-context-change', refresh);
    return () => {
      stopped = true;
      clearTimeout(timer);
      window.removeEventListener('lp-calendar-context-change', refresh);
    };
  }, []);
  const todayKey = dayKey(today);
  const lunar = React.useMemo(() => lunarDateLabel(today), [today]);
  const renderTodayInfo = () => h(CalendarToday, {
    t, data: todayInfo?.day === todayKey ? todayInfo : null, date: today, lunar, onSettings: props.onRegionSettings,
  });

  // The month fills whatever height the panel gives us, leaving a strip of
  // the day list visible so it is obvious there is more below.
  React.useEffect(() => {
    const node = scrollRef.current;
    if (!node) return undefined;
    const measure = () => {
      const height = Math.round(node.clientHeight || 0);
      if (height <= 0) return;
      const room = Math.max(320, height - 150);
      const appearance = currentAppearance();
      const sideBySide = appearance.layout.calendar === 'auto' && node.clientWidth >= 860;
      setSplit(sideBySide);
      if (sideBySide && collapsedRef.current) setCollapse(false);
      const configured = appearance.size.calendarHeight;
      // A configured height wins, clamped to sane bounds so the day list below
      // always keeps a scrollable surface.
      const capped = Math.max(320, height - 40);
      const next = configured > 0 ? Math.min(Math.max(320, configured), capped) : room;
      setExpanded(Number.isFinite(next) && next >= 200 ? Math.round(next) : room);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    const off = onAppearanceChange(measure);
    return () => {
      observer.disconnect();
      off();
    };
  }, []);

  const onScroll = (event) => {
    if (split) return;
    const node = event.currentTarget;
    const at = node.scrollTop;
    if (!collapsedRef.current) {
      if (at > 4) {
        setCollapse(true);
        // Park at the top so the collapsed bar never overlaps the day list;
        // the same wheel then continues scrolling the list.
        node.scrollTop = 0;
      }
      return;
    }
  };

  // Expanding deliberately costs more: reach the top, then keep pushing up
  // through an elastic band before the month comes back.
  const onWheel = (event) => {
    if (split) return;
    const node = scrollRef.current;
    if (!node) return;
    if (!collapsedRef.current) {
      if (event.deltaY > 0) band.current = 0;
      return;
    }
    // Upward scrolling expands once the list is back at the top; the explicit
    // expand button covers hosts that eat wheel events.
    if (event.deltaY < 0) {
      // Only accumulate once the list is back at the top: scrolling up first
      // reveals the top, then expands.
      if (node.scrollTop > 0) {
        band.current = 0;
        return;
      }
      band.current += -event.deltaY;
      if (band.current >= 90) {
        band.current = 0;
        setCollapse(false);
      }
    } else {
      band.current = 0;
    }
  };

  const pick = (cell) => {
    props.onSelect(cell.key);
    if (!cell.inMonth) props.onAnchor(new Date(cell.date.getFullYear(), cell.date.getMonth(), 1));
  };

  const dayItems = (byDay.get(selectedKey) || []).filter((item) => !item.derived.archived);
  const openCount = openEntries(dayItems).length;
  const selectedDate = new Date(`${selectedKey}T12:00:00`);
  // Long-term work plus anything that blew its deadline: overdue tasks keep
  // their red date and join the long-term cycle instead of disappearing.
  const longTerm =
    selectedKey === todayKey
      ? items
          .filter(
            (item) =>
              item.kind === 'task' &&
              !item.derived.archived &&
              !item.derived.done &&
              !(item.derived.studyTask && item.derived.boardColumn === 'todo') &&
              (item.dueAt ? isOverdue(item) && dayKey(new Date(item.dueAt)) < todayKey :
                !item.startAt || dayKey(new Date(item.startAt)) < todayKey),
          )
          .sort((a, b) => {
            const ao = isOverdue(a) ? 0 : 1;
            const bo = isOverdue(b) ? 0 : 1;
            if (ao !== bo) return ao - bo;
            return String(a.dueAt || '~').localeCompare(String(b.dueAt || '~'));
          })
      : [];

  return h(
    'div',
    { className: 'lp-cal-scroll', 'data-layout': split ? 'split' : 'stacked', ref: scrollRef, onScroll, onWheel },
    h(
      'div',
      {
        className: 'lp-cal-sticky',
        style: { height: collapsed ? 64 : expanded, transition: 'height .2s ease' },
      },
      h(
        'div',
        {
          className: 'lp-cal-month',
          style: {
            height: expanded,
            opacity: collapsed ? 0 : 1,
            pointerEvents: collapsed ? 'none' : 'auto',
            transition: 'opacity .18s ease',
          },
          'aria-hidden': collapsed,
          inert: collapsed,
        },
        h(
          'div',
          { className: 'lp-cal-bar' },
          h(
            'div',
            { className: 'lp-cal-side' },
            h(
              'button',
              {
                className: 'lp-btn-ghost',
                onClick: () => {
                  const now = new Date();
                  props.onAnchor(new Date(now.getFullYear(), now.getMonth(), 1));
                  props.onSelect(dayKey(now));
                },
              },
              t('today'),
            ),
            collapsed ? null : renderTodayInfo(),
          ),
          h('div', { className: 'lp-cal-title' }, monthTitle(t, anchor)),
          h(
            'div',
            { className: 'lp-cal-side', 'data-right': 'true' },
            h(
              'button',
              {
                className: 'lp-iconbtn',
                onClick: () => props.onAnchor(new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1)),
                'aria-label': t('previousMonth'),
              },
              '‹',
            ),
            h(
              'button',
              {
                className: 'lp-iconbtn',
                onClick: () => props.onAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1)),
                'aria-label': t('nextMonth'),
              },
              '›',
            ),
          ),
        ),
        h('div', { className: 'lp-wd' }, labels.map((label) => h('div', { key: label }, label))),
        h(
          'div',
          { className: 'lp-grid' },
          cells.map((cell, index) => {
            const list = byDay.get(cell.key) || [];
            const open = openEntries(list);
            const shown = open.slice(0, 2);
            const hidden = open.length - shown.length;
            // The month block is a staircase, not a rectangle: give each
            // in-month cell the sides its dimmed neighbours cannot draw.
            const leftEdge = cell.inMonth && (index % 7 === 0 || !(cells[index - 1] || {}).inMonth);
            const rightEdge = cell.inMonth && (index % 7 === 6 || !(cells[index + 1] || {}).inMonth);
            const topEdge = cell.inMonth && (index < 7 || !(cells[index - 7] || {}).inMonth);
            const bottomEdge = cell.inMonth && (index >= 35 || !(cells[index + 7] || {}).inMonth);
            const topPriority = open.reduce((best, entry) => Math.max(best, priorityOf(entry)), -1);
            return h(
              'div',
              {
                key: cell.key,
                className: 'lp-cell',
                tabIndex: 0,
                role: 'button',
                'data-priority': topPriority >= 0 && cell.inMonth ? toneOf(topPriority).key : undefined,
                'data-dim': String(!cell.inMonth),
                'data-today': String(cell.isToday),
                'data-selected': String(cell.key === selectedKey),
                'data-weekend': String(index % 7 >= 5),
                'data-edge-left': String(leftEdge),
                'data-edge-right': String(rightEdge),
                'data-edge-top': String(topEdge),
                'data-edge-bottom': String(bottomEdge),
                onClick: () => pick(cell),
                onKeyDown: keyActivate(() => pick(cell)),
              },
              h(
                'div',
                { className: 'lp-cell-top' },
                h('span', { className: 'lp-num' }, String(cell.day)),
                open.length > 0 ? h('span', { className: 'lp-count' }, String(open.length)) : null,
              ),
              shown.map((entry) =>
                h('div', { key: entry.id, className: 'lp-cell-title', title: entry.title }, entry.title),
              ),
              hidden > 0 ? h('div', { className: 'lp-cell-more' }, `+${hidden}`) : null,
            );
          }),
        ),
      ),
      h(
        'div',
        {
          className: 'lp-cal-week',
          style: {
            opacity: collapsed ? 1 : 0,
            pointerEvents: collapsed ? 'auto' : 'none',
            transition: 'opacity .18s ease',
          },
          'aria-hidden': !collapsed,
          inert: !collapsed,
        },
        week.map((cell) => {
          const list = byDay.get(cell.key) || [];
          const count = openEntries(list).length;
          return h(
            'button',
            {
              key: cell.key,
              className: 'lp-weekcell',
              type: 'button',
              'data-today': String(cell.isToday),
              'data-selected': String(cell.key === selectedKey),
              onClick: () => {
                props.onSelect(cell.key);
                if (cell.date.getMonth() !== anchor.getMonth() || cell.date.getFullYear() !== anchor.getFullYear()) {
                  props.onAnchor(new Date(cell.date.getFullYear(), cell.date.getMonth(), 1));
                }
              },
            },
            h('span', null, labels[(cell.date.getDay() + 6) % 7]),
            h('strong', { className: 'lp-week-day' }, String(cell.day)),
            count > 0 ? h('span', { className: 'lp-count' }, String(count)) : null,
          );
        }),
      ),
      // Explicit affordance: the collapsed bar can always be opened by click,
      // even if a host eats wheel events or the page is mid-scroll.
      collapsed
        ? h(
            'button',
            {
              className: 'lp-cal-expand',
              type: 'button',
              title: t('expandCalendar'),
              'aria-label': t('expandCalendar'),
              onClick: () => {
                setCollapse(false);
                const node = scrollRef.current;
                if (node) node.scrollTop = 0;
              },
            },
            '▾',
          )
        : null,
    ),
    h(
      'div',
      { className: 'lp-day', style: split ? undefined : { minHeight: expanded } },
      h(
        'div',
        { className: 'lp-day-title' },
        h(
          'span',
          null,
          `${t('dayLabel').replace('{m}', String(selectedDate.getMonth() + 1)).replace('{d}', String(selectedDate.getDate()))} · ${labels[(selectedDate.getDay() + 6) % 7]}`,
        ),
        h('span', { className: 'lp-day-sub' }, t('itemsCount').replace('{n}', String(openCount))),
        selectedKey === todayKey && lunar ? h('span', { className: 'lp-day-sub lp-cal-lunar' }, lunar) : null,
        collapsed ? renderTodayInfo() : null,
      ),
      h(
        'form',
        { className: 'lp-add', onSubmit: props.onQuickAdd },
        h('input', {
          className: 'lp-input',
          value: props.draft,
          placeholder: t('addPlaceholder'),
          onChange: (event) => props.onDraft(event.target.value),
          // Focusing the box collapses the calendar so the whole plan area
          // is visible instead of the box sitting half under the bar.
          onFocus: () => {
            const node = scrollRef.current;
            if (!split && node && node.scrollTop < 48) node.scrollTo({ top: 48, behavior: 'smooth' });
          },
        }),
        h('button', { className: 'lp-btn', type: 'submit', disabled: !props.draft.trim() }, t('addButton')),
      ),
      dayItems.length === 0
        ? h('div', { className: 'lp-empty' }, t('emptyDay'))
        : dayItems.map((item) => dayRow(item)),
      longTerm.length > 0
        ? h(
            'div',
            { className: 'lp-longterm' },
            h('div', { className: 'lp-section' }, t('unscheduled')),
            longTerm.map((item) => dayRow(item)),
          )
        : null,
    ),
  );
}

// ---- views/tree.js ----
function TreeView(props) {
  const t = props.t;
  const items = props.items.filter((item) => !item.derived.archived);
  const [collapsed, setCollapsed] = React.useState(new Set());
  const [filter, setFilter] = React.useState('all');
  const [query, setQuery] = React.useState('');
  const [menuFor, setMenuFor] = React.useState('');
  const [renaming, setRenaming] = React.useState(null);
  const [creating, setCreating] = React.useState(null);
  const [selectedId, setSelectedId] = React.useState('');
  const [draggingId, setDraggingId] = React.useState('');
  const [dropHint, setDropHint] = React.useState(null);
  const [groupBy, setGroupBy] = React.useState('hierarchy');
  // The dragged id must be readable synchronously inside dragover; React
  // state is not guaranteed to have committed by then, and without
  // preventDefault the browser refuses the drop entirely.
  const dragRef = React.useRef('');
  const cancelled = React.useRef(false);
  const map = childrenMap(items);
  const byId = new Map(items.map((item) => [item.id, item]));
  const menuItem = byId.get(menuFor);
  const actions = menuItem ? [
    { label: t('edit'), run: () => props.onEdit(menuItem) },
    !menuItem.derived.studyManaged && { label: t(menuItem.derived.done ? 'markUndone' : 'markDone'),
      run: () => props.onToggle(menuItem, !menuItem.derived.done) },
    { label: t('rename'), run: () => setRenaming({ id: menuItem.id, value: menuItem.title }) },
    { label: t('moveUp'), run: () => props.onReorder(menuItem, 'up') },
    { label: t('moveDown'), run: () => props.onReorder(menuItem, 'down') },
    menuItem.parentId && { label: t('outdent'), run: () => props.onOutdent(menuItem) },
    !menuItem.derived.studyTask && { label: t('delete'), run: () => remove(menuItem) },
  ].filter(Boolean) : [];
  const rowMenu = useAnchoredMenu({
    count: actions.length, minWidth: 150, maxHeight: 300, align: 'end',
    onChoose: (index) => actions[index]?.run(),
    onClose: () => setMenuFor(''),
  });
  const openRowMenu = (item, event) => {
    event.stopPropagation();
    setSelectedId(item.id);
    if (rowMenu.open && menuFor === item.id) {
      rowMenu.hide();
      return;
    }
    setMenuFor(item.id);
    rowMenu.show(event.currentTarget);
  };
  const focusId = props.focusId || '';
  const text = query.trim().toLowerCase();
  const filtering = text !== '' || filter !== 'all';

  // A restored item asks the tree to reveal it: select it, open its path,
  // and bring the row into view. The snapshot may still be stale when this
  // runs, so a missing target waits for the next items update instead of
  // consuming the request.
  React.useEffect(() => {
    if (!focusId) return undefined;
    const target = byId.get(focusId);
    if (!target) return undefined;
    setSelectedId(focusId);
    const chain = [];
    let node = target.parentId ? byId.get(target.parentId) : null;
    while (node) {
      chain.push(node.id);
      node = node.parentId ? byId.get(node.parentId) : null;
    }
    if (chain.length > 0) {
      setCollapsed((current) => {
        const next = new Set(current);
        for (const id of chain) next.delete(id);
        return next;
      });
    }
    requestAnimationFrame(() => {
      const element = document.querySelector(`[data-item-id="${focusId}"]`);
      if (element && element.scrollIntoView) element.scrollIntoView({ block: 'center' });
    });
    props.onFocusHandled();
    return undefined;
  }, [focusId, items]);

  if (items.length === 0) {
    return h(
      'div',
      { className: 'lp-empty' },
      h('div', null, t('emptyTree')),
      h('button', { className: 'lp-btn', style: { marginTop: 12 }, onClick: () => props.onNew() }, `+ ${t('newItem')}`),
    );
  }

  const matches = (item) => {
    if (text && !item.title.toLowerCase().includes(text)) return false;
    if (filter === 'open') return !item.derived.done;
    if (filter === 'blocked') return item.derived.blocked;
    if (filter === 'done') return item.derived.done;
    return true;
  };

  // Filtering keeps every ancestor of a match, so the tree never loses the
  // path that explains where a hit lives.
  const visible = new Set();
  if (filtering) {
    for (const item of items) {
      if (!matches(item)) continue;
      let node = item;
      while (node) {
        visible.add(node.id);
        node = node.parentId ? byId.get(node.parentId) : null;
      }
    }
  } else {
    for (const item of items) visible.add(item.id);
  }

  // Flat grouping across the whole filtered set: a task with three tags
  // appears under each of them.
  const renderGroups = () => {
    const groups = new Map();
    for (const item of items) {
      if (!visible.has(item.id)) continue;
      const keys =
        groupBy === 'tag'
          ? item.tags && item.tags.length > 0
            ? item.tags
            : [t('untagged')]
          : [item.taskType || t('untyped')];
      for (const key of keys) {
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(item);
      }
    }
    return [...groups.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, list]) =>
        h(
          'div',
          { key, className: 'lp-group' },
          h(
            'div',
            { className: 'lp-group-head' },
            h('span', {
              className: 'lp-group-dot',
              style: { background: colorOfName(key, props.colorOverrides) },
            }),
            h('span', null, `${key} · ${list.length}`),
          ),
          list.map((item) =>
            h(
              'div',
              {
                key: item.id,
                className: 'lp-row',
                tabIndex: 0,
                role: 'button',
                'data-done': String(item.derived.done),
                'data-selected': String(selectedId === item.id),
                onClick: () => setSelectedId(item.id),
                onKeyDown: keyActivate(() => setSelectedId(item.id)),
                onDoubleClick: () => props.onEdit(item),
              },
              h('span', { className: 'lp-prio', style: { background: toneOf(item.priority).color } }),
              h('span', { className: 'lp-ico', 'data-kind': item.kind, style: item.taskType ? { color: colorOfName(item.taskType, props.colorOverrides) } : undefined }, KIND_GLYPH[item.kind] || '○'),
              h('span', { className: 'lp-title', title: item.title }, item.title),
              item.dueAt
                ? h(
                    'span',
                    { className: 'lp-meta', 'data-overdue': String(isOverdue(item)) },
                    toLocalInput(item.dueAt).replace('T', ' '),
                  )
                : null,
            ),
          ),
        ),
      );
  };

  // Only prerequisites outside this node's own subtree count as blockers; a
  // parent already depends on its children implicitly.
  const blockersOf = (item) => displayBlockers(item, byId, items);

  const progressOf = (item) => {
    let total = 0;
    let done = 0;
    const stack = [item.id];
    while (stack.length > 0) {
      const id = stack.pop();
      for (const child of map.get(id) || []) {
        if (child.kind === 'task') {
          total += 1;
          if (child.derived.done) done += 1;
        } else {
          stack.push(child.id);
        }
      }
    }
    return { total, done };
  };

  const toggle = (id) => {
    const next = new Set(collapsed);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCollapsed(next);
  };

  const remove = (item, event) => {
    const kids = (map.get(item.id) || []).length;
    props.onConfirm(event, {
      title: t('treeDeleteAsk').replace('{name}', item.title),
      lines: kids > 0 ? [t('treeDeleteMove').replace('{n}', String(kids))] : [],
      confirmLabel: t('delete'),
      onConfirm: () => props.onDelete(item.id),
    });
  };

  const commitCreate = () => {
    if (cancelled.current) {
      cancelled.current = false;
      return;
    }
    const draft = creating;
    if (!draft) return;
    setCreating(null);
    const title = draft.value.trim();
    if (title) props.onCreate(draft.parentId, title, 'task');
  };

  const commitRename = () => {
    if (cancelled.current) {
      cancelled.current = false;
      return;
    }
    const draft = renaming;
    if (!draft) return;
    setRenaming(null);
    const title = draft.value.trim();
    const current = byId.get(draft.id);
    if (title && (!current || title !== current.title)) props.onRename(draft.id, title);
  };

  const zoneOf = (event, node) => {
    const rect = node.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    // Right of 25% nests; everything left of it reorders by vertical
    // position, so an up/down drag never turns into a child drop.
    const xRatio = (event.clientX - rect.left) / width;
    if (xRatio > 0.25) return 'inside';
    const yRatio = (event.clientY - rect.top) / height;
    return yRatio < 0.5 ? 'before' : 'after';
  };

  const canDropOn = (target) => {
    const dragged = dragRef.current;
    if (!dragged || dragged === target.id) return false;
    let node = target.parentId ? byId.get(target.parentId) : null;
    while (node) {
      if (node.id === dragged) return false;
      node = node.parentId ? byId.get(node.parentId) : null;
    }
    return !descendantIds(items, dragged).has(target.id);
  };

  const dropOn = (event, target) => {
    event.preventDefault();
    event.stopPropagation();
    const dragged = dragRef.current || event.dataTransfer.getData('text/plain');
    dragRef.current = '';
    setDraggingId('');
    setDropHint(null);
    if (!dragged || dragged === target.id) return;
    if (descendantIds(items, dragged).has(target.id)) return;
    const zone = zoneOf(event, event.currentTarget);
    const parentId = target.parentId || null;
    if (zone === 'inside') {
      props.onMove(dragged, target.id, null);
      return;
    }
    const siblings = (map.get(parentId) || []).filter((item) => visible.has(item.id));
    const index = siblings.findIndex((item) => item.id === target.id);
    const beforeId = zone === 'before' ? target.id : siblings[index + 1] ? siblings[index + 1].id : null;
    props.onMove(dragged, parentId, beforeId);
  };

  const renderCreateRow = (parentId) =>
    h(
      'div',
      { key: '__create', className: 'lp-row' },
      h('span', { className: 'lp-caret', 'data-empty': 'true' }, '▸'),
      h('span', { className: 'lp-ico', 'data-kind': 'task' }, KIND_GLYPH.task),
      h('input', {
        className: 'lp-inline',
        autoFocus: true,
        value: creating.value,
        placeholder: t('newChildPlaceholder'),
        onChange: (event) => setCreating({ parentId, value: event.target.value }),
        onKeyDown: (event) => {
          if (event.key === 'Enter') event.currentTarget.blur();
          if (event.key === 'Escape') {
            cancelled.current = true;
            setCreating(null);
          }
        },
        onBlur: commitCreate,
      }),
    );

  // The first level is the task category, not a task: every root task is
  // grouped under its type, and an empty category simply never exists.
  const renderHierarchy = () => {
    const roots = (map.get(null) || []).filter((item) => visible.has(item.id));
    const byType = new Map();
    for (const item of roots) {
      const key = item.taskType || '';
      if (!byType.has(key)) byType.set(key, []);
      byType.get(key).push(item);
    }
    const blocks = [...byType.entries()]
      .sort((a, b) => (a[0] || '').localeCompare(b[0] || ''))
      .map(([type, list]) => {
        const label = type || t('untyped');
        const groupId = `cat:${type}`;
        const open = filtering || !collapsed.has(groupId);
        return h(
          'div',
          { key: groupId, className: 'lp-group' },
          h(
            'div',
            {
              className: 'lp-group-head lp-group-toggle',
              'data-open': String(open),
              onClick: () => {
                const next = new Set(collapsed);
                if (next.has(groupId)) next.delete(groupId);
                else next.add(groupId);
                setCollapsed(next);
              },
            },
            h('span', { className: 'lp-caret', 'data-open': String(open) }, '▾'),
            h('span', {
              className: 'lp-group-dot',
              style: { background: colorOfName(label, props.colorOverrides) },
            }),
            h('span', null, `${label} · ${list.length}`),
            // Creating here pre-fills the category; the editor still lets you change it.
            h(
              'button',
              {
                className: 'lp-iconbtn lp-group-add',
                type: 'button',
                title: t('newItem'),
                onClick: (event) => {
                  event.stopPropagation();
                  if (typeof props.onNew === 'function') props.onNew({ taskType: type });
                },
              },
              '+',
            ),
          ),
          open ? h('div', { className: 'lp-children' }, list.map((item) => renderNode(item))) : null,
        );
      });
    const createRow = creating && creating.parentId === null ? renderCreateRow(null) : null;
    if (blocks.length === 0 && !createRow) return null;
    return h('div', null, blocks, createRow);
  };

  const renderLevel = (parentId) => {
    const list = (map.get(parentId) || []).filter((item) => visible.has(item.id));
    const rows = list.map((item) => renderNode(item));
    if (creating && creating.parentId === parentId) rows.push(renderCreateRow(parentId));
    if (rows.length === 0) return null;
    return h('div', { className: parentId ? 'lp-children' : undefined }, rows);
  };

  const renderNode = (item) => {
    const kids = (map.get(item.id) || []).filter((child) => visible.has(child.id));
    const expanded = filtering || !collapsed.has(item.id);
    const progress = item.kind === 'task' ? null : progressOf(item);
    const blockers = item.derived.studyTask ? [] : blockersOf(item);
    const selected = selectedId === item.id;
    const hint = dropHint && dropHint.id === item.id ? dropHint.zone : '';
    return h(
      'div',
      { key: item.id, className: 'lp-node' },
      h(
        'div',
        {
          className: 'lp-row',
          tabIndex: 0,
          role: 'button',
          'data-done': String(item.derived.done),
          'data-selected': String(selected),
          'data-drop': hint,
          'data-item-id': item.id,
          draggable: true,
          onClick: () => setSelectedId(item.id),
          onKeyDown: keyActivate(() => setSelectedId(item.id)),
          'data-dragging': String(draggingId === item.id),
          onDragStart: (event) => {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', item.id);
            dragRef.current = item.id;
            setDraggingId(item.id);
            // Dragging folds its own subtree so the target rows stay visible.
            if (!collapsed.has(item.id)) {
              const next = new Set(collapsed);
              next.add(item.id);
              setCollapsed(next);
            }
          },
          onDragEnd: () => {
            dragRef.current = '';
            setDraggingId('');
            setDropHint(null);
          },
          onDragEnter: (event) => {
            if (!canDropOn(item)) return;
            event.preventDefault();
            event.stopPropagation();
          },
          onDragOver: (event) => {
            if (!canDropOn(item)) return;
            event.preventDefault();
            event.stopPropagation();
            event.dataTransfer.dropEffect = 'move';
            const zone = zoneOf(event, event.currentTarget);
            if (!dropHint || dropHint.id !== item.id || dropHint.zone !== zone) {
              setDropHint({ id: item.id, zone });
            }
          },
          onDragLeave: () => {
            if (dropHint && dropHint.id === item.id) setDropHint(null);
          },
          onDrop: (event) => dropOn(event, item),
        },
        kids.length > 0
          ? h(
              'button',
              {
                className: 'lp-caret',
                onClick: (event) => {
                  event.stopPropagation();
                  toggle(item.id);
                },
                'aria-label': item.title,
              },
              expanded ? '▾' : '▸',
            )
          : h('span', { className: 'lp-caret', 'data-empty': 'true' }, '▸'),
        item.kind === 'task'
          ? h('span', {
              className: 'lp-prio',
              style: { background: toneOf(item.priority).color },
              title: `P${item.priority ?? 5}`,
            })
          : null,
        item.kind === 'task'
          ? h('input', {
              type: 'checkbox',
              checked: Boolean(item.derived.done),
              disabled: Boolean(item.derived.studyManaged),
              title: item.derived.studyManaged ? t('studyStatusManaged') : undefined,
              onClick: (event) => event.stopPropagation(),
              onChange: (event) => props.onToggle(item, event.target.checked, event),
              'aria-label': item.title,
            })
          : h('span', { style: { width: 13, flex: 'none' } }),
        h('span', { className: 'lp-ico', 'data-kind': item.kind, style: item.taskType ? { color: colorOfName(item.taskType, props.colorOverrides) } : undefined }, KIND_GLYPH[item.kind] || '○'),
        item.recurrence && item.recurrence.freq
          ? h('span', { className: 'lp-meta', title: t('freqLabel') }, '⟳')
          : null,
        h(TypeChip, {
          type: item.taskType,
          fallback: t('typeNone'),
          colorOverrides: props.colorOverrides,
        }),
        renaming && renaming.id === item.id
          ? h('input', {
              className: 'lp-inline',
              autoFocus: true,
              value: renaming.value,
              onChange: (event) => setRenaming({ id: item.id, value: event.target.value }),
              onKeyDown: (event) => {
                if (event.key === 'Enter') event.currentTarget.blur();
                if (event.key === 'Escape') {
                  cancelled.current = true;
                  setRenaming(null);
                }
              },
              onBlur: commitRename,
            })
          : h(
              'span',
              {
                className: 'lp-title',
                title: item.title,
                onClick: (event) => {
                  event.stopPropagation();
                  setSelectedId(item.id);
                },
                onDoubleClick: (event) => {
                  event.stopPropagation();
                  setRenaming({ id: item.id, value: item.title });
                },
              },
              item.title,
            ),
        h(TagChips, { item, colorOverrides: props.colorOverrides }),
        h('span', {
          className: 'lp-fill',
          onDoubleClick: (event) => {
            event.stopPropagation();
            props.onEdit(item);
          },
        }),
        progress && progress.total > 0
          ? h('span', { className: 'lp-progress' }, `${progress.done}/${progress.total}`)
          : null,
        blockers.length > 0
          ? h(
              'span',
              { className: 'lp-badge', title: blockers.map((dep) => dep.title).join('、') },
              t('blockedBy').replace('{n}', String(blockers.length)),
            )
          : item.derived.blocked ? h('span', { className: 'lp-badge' }, t('blocked')) : null,
        item.dueAt ? h('span', { className: 'lp-meta', 'data-overdue': String(isOverdue(item)) }, toLocalInput(item.dueAt).replace('T', ' ')) : null,
        h(
          'span',
          { className: 'lp-actions' },
          h(
            'button',
            {
              className: 'lp-mini',
              title: t('newChild'),
              onClick: (event) => {
                event.stopPropagation();
                if (collapsed.has(item.id)) {
                  const next = new Set(collapsed);
                  next.delete(item.id);
                  setCollapsed(next);
                }
                setSelectedId(item.id);
                setCreating({ parentId: item.id, value: '' });
              },
            },
            '+',
          ),
          h(
            'button',
            {
              className: 'lp-mini',
              title: t('edit'),
              'aria-haspopup': 'menu',
              'aria-expanded': rowMenu.open && menuFor === item.id,
              'aria-controls': rowMenu.open && menuFor === item.id ? rowMenu.menuId : undefined,
              onClick: (event) => openRowMenu(item, event),
              onKeyDown: (event) => {
                if (rowMenu.open && menuFor === item.id) rowMenu.onKeyDown(event);
                else if (event.key === 'ArrowDown') {
                  event.preventDefault();
                  openRowMenu(item, event);
                } else if (event.key === 'Enter' || event.key === ' ') event.stopPropagation();
              },
            },
            '⋯',
          ),
        ),
      ),
      rowMenu.open && rowMenu.pos && menuFor === item.id
        ? h(
            'div',
            { className: 'lp-menu', id: rowMenu.menuId, role: 'menu', ref: rowMenu.menuRef,
              style: rowMenu.pos, onKeyDown: rowMenu.onKeyDown },
            actions.map((action, index) => h('button', {
              ...rowMenu.getItemProps(index, false), className: 'lp-menu-item',
              role: 'menuitem', 'aria-selected': undefined,
            }, action.label)),
          )
        : null,
      kids.length > 0 && expanded ? renderLevel(item.id) : null,
      kids.length === 0 && creating && creating.parentId === item.id ? renderLevel(item.id) : null,
    );
  };

  const filters = ['all', 'open', 'blocked', 'done'];

  return h(
    'div',
    null,
    h(
      'div',
      { className: 'lp-toolbar' },
      h('button', { className: 'lp-btn-ghost', onClick: () => props.onNew() }, `+ ${t('newItem')}`),
      filters.map((value) =>
        h(
          'button',
          {
            key: value,
            className: 'lp-chip',
            'data-active': String(filter === value),
            onClick: () => setFilter(value),
          },
          t(`filter_${value}`),
        ),
      ),
      h('div', { style: { flex: 1 } }),
      h(
        'div',
        { style: { width: 132 } },
        h(Dropdown, {
          value: groupBy,
          onChange: setGroupBy,
          options: [
            { value: 'hierarchy', label: t('groupHierarchy') },
            { value: 'tag', label: t('groupTag') },
            { value: 'type', label: t('groupType') },
          ],
        }),
      ),
      h('button', { className: 'lp-btn-ghost', onClick: () => setCollapsed(new Set()) }, t('expandAll')),
      h(
        'button',
        {
          className: 'lp-btn-ghost',
          onClick: () =>
            setCollapsed(new Set(items.filter((item) => (map.get(item.id) || []).length > 0).map((item) => item.id))),
        },
        t('collapseAll'),
      ),
      h('input', {
        className: 'lp-search',
        placeholder: t('search'),
        value: query,
        onChange: (event) => setQuery(event.target.value),
      }),
    ),
    h(
      'div',
      {
        style: { padding: '8px 12px 28px', minHeight: 200 },
        onDragOver: (event) => {
          if (!dragRef.current) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = 'move';
        },
        onDrop: (event) => {
          if (!dragRef.current) return;
          event.preventDefault();
          const dragged = dragRef.current;
          dragRef.current = '';
          setDraggingId('');
          setDropHint(null);
          props.onMove(dragged, null, null);
        },
      },
      groupBy === 'hierarchy' ? renderHierarchy() : renderGroups(),
      visible.size === 0 ? h('div', { className: 'lp-empty' }, t('noMatch')) : null,
    ),
  );
}

// ---- dialogs/item-editor.js ----
function ItemEditor(props) {
  const t = props.t;
  const item = props.item;
  const items = props.items;
  const isNew = !item.id;
  const studyManaged = Boolean(item.derived?.studyManaged);
  const studyTask = Boolean(item.derived?.studyTask);

  const [title, setTitle] = React.useState(item.title || '');
  const [kind, setKind] = React.useState(item.kind || 'task');
  // One node type: the kind selector is gone, the value only feeds legacy calls.
  void setKind;
  const [taskType, setTaskType] = React.useState(item.taskType || '');
  const [parentId, setParentId] = React.useState(item.parentId || '');
  const [due, setDue] = React.useState(toLocalInput(item.dueAt));
  const [start, setStart] = React.useState(toLocalInput(item.startAt));
  const [location, setLocation] = React.useState(item.location || '');
  const [priority, setPriority] = React.useState(item.priority ?? 5);
  const [note, setNote] = React.useState(item.note || '');
  const [tags, setTags] = React.useState(item.tags || []);
  const [tagDraft, setTagDraft] = React.useState('');
  const existingTags = Array.from(
    new Set((props.items || []).flatMap((entry) => entry.tags || [])),
  ).sort();
  // The library comes from settings; already-used tags stay available so old
  // items are not cut off from their own data.
  const tagChoices = Array.from(
    new Set([...(props.tagLibrary || []), ...existingTags, ...tags]),
  ).sort();
  const toggleTag = (tag) =>
    setTags((current) => (current.includes(tag) ? current.filter((one) => one !== tag) : [...current, tag]));
  const commitTag = () => {
    const tag = tagDraft.trim().slice(0, 24);
    setTagDraft('');
    if (tag && !tags.includes(tag)) setTags((current) => [...current, tag]);
  };
  const [freq, setFreq] = React.useState((item.recurrence && item.recurrence.freq) || '');
  const [done, setDone] = React.useState(Boolean(item.derived && item.derived.done));
  const [deps, setDeps] = React.useState(new Set(item.dependsOn || []));
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  const blockedParents = React.useMemo(() => {
    const set = item.id ? descendantIds(items, item.id) : new Set();
    if (item.id) set.add(item.id);
    return set;
  }, [items, item.id]);

  const parentOptions = items.filter((entry) => !entry.derived.archived && !blockedParents.has(entry.id));
  // A descendant is already an implicit prerequisite through the tree, so it
  // is not offered as an explicit one.
  const dependencyOptions = items.filter(
    (entry) =>
      entry.kind === 'task' && !entry.derived.archived && entry.id !== item.id && !blockedParents.has(entry.id),
  );

  const toggleDep = (id) => {
    const next = new Set(deps);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setDeps(next);
  };

  const save = () => {
    if (!title.trim()) {
      setError(t('titleLabel'));
      return;
    }
    setBusy(true);
    const existingDeps = item.dependsOn || [];
    const depsChanged = existingDeps.length !== deps.size || existingDeps.some((id) => !deps.has(id));
    const payload = {
      title: title.trim(),
      kind,
      parentId: parentId || null,
      ...(!studyTask ? { dueAt: fromLocalInput(due), startAt: fromLocalInput(start), recurrence: freq ? { freq } : null } : {}),
      location: location.trim() || null,
      priority: kind === 'task' ? priority : null,
      note,
      tags,
      taskType: taskType || null,
      ...(isNew || depsChanged ? { dependsOn: kind === 'task' ? Array.from(deps) : [] } : {}),
    };
    const request = isNew
      ? api('item.add', payload)
      : api('item.update', { id: item.id, patch: payload });
    request
      .then(() => props.onSaved())
      .catch((err) => setError(err.message))
      .finally(() => setBusy(false));
  };

  return h(
    Modal,
    { title: isNew ? t('newItem') : t('edit'), onClose: props.onClose },
    error ? h('div', { className: 'lp-err' }, error) : null,
    h('div', { className: 'lp-form-section' }, t('sectionBasic')),
      h(
        'div',
        { className: 'lp-field' },
        h('label', null, t('titleLabel')),
        h('input', { className: 'lp-input', value: title, onChange: (event) => setTitle(event.target.value) }),
      ),
      h('div', { className: 'lp-form-section' }, t('sectionClass')),
      h(
        'div',
        { className: 'lp-field' },
        h('label', null, t('parentLabel')),
        h(Dropdown, {
          value: parentId,
          onChange: setParentId,
          placeholder: t('rootParent'),
          options: [
            { value: '', label: t('rootParent') },
            ...parentOptions.map((entry) => ({ value: entry.id, label: entry.title })),
          ],
        }),
      ),
      h('div', { className: 'lp-form-section' }, t('sectionTime')),
      h(
        'div',
        { className: 'lp-row2' },
        h(
          'div',
          { className: 'lp-field' },
          h('label', null, t('startLabel')),
          h('input', {
            className: 'lp-input',
            type: 'datetime-local',
            value: start,
            disabled: studyTask,
            onChange: (event) => setStart(event.target.value),
          }),
        ),
        h(
          'div',
          { className: 'lp-field' },
          h('label', null, t('dueLabel')),
          h('input', {
            className: 'lp-input',
            type: 'datetime-local',
            value: due,
            disabled: studyTask,
            onChange: (event) => setDue(event.target.value),
          }),
        ),
        h(
          'div',
          { className: 'lp-field' },
          h('label', null, t('locationLabel')),
          h('input', {
            className: 'lp-input',
            value: location,
            placeholder: t('locationHint'),
            onChange: (event) => setLocation(event.target.value),
          }),
        ),
        kind === 'task'
          ? h(
              'div',
              { className: 'lp-field' },
              h('label', null, t('priorityLabel')),
              h(Dropdown, {
                value: priority,
                onChange: setPriority,
                options: Array.from({ length: 10 }, (_, value) => ({ value, label: String(value) })),
              }),
            )
          : null,
      ),
      kind === 'task' && !studyTask
        ? h(
            'div',
            { className: 'lp-field' },
            h('label', null, t('freqLabel')),
            h(Dropdown, {
              value: freq,
              onChange: setFreq,
              options: [
                { value: '', label: t('freqNone') },
                { value: 'daily', label: t('freqDaily') },
                { value: 'weekly', label: t('freqWeekly') },
                { value: 'monthly', label: t('freqMonthly') },
              ],
            }),
          )
        : null,
      h('div', { className: 'lp-form-section' }, t('sectionExtra')),
      h(
        'div',
        { className: 'lp-field' },
        h('label', null, t('noteLabel')),
        h('textarea', { className: 'lp-input', rows: 3, value: note, onChange: (event) => setNote(event.target.value) }),
      ),
      h(
        'div',
        { className: 'lp-row2' },
        h(
          'div',
          { className: 'lp-field' },
          h('label', null, t('typeLabel')),
          h(Dropdown, {
            value: taskType,
            onChange: setTaskType,
            placeholder: t('typeNone'),
            options: [
              { value: '', label: t('typeNone') },
              ...Array.from(
                new Set([...(props.taskTypes || []), item.taskType].filter(Boolean)),
              ).map((name) => ({ value: name, label: name })),
            ],
          }),
        ),
        h(
          'div',
          { className: 'lp-field' },
          h('label', null, t('tagsLabel')),
          h(
            'div',
            { className: 'lp-taglist' },
            tagChoices.length === 0
              ? h('span', { className: 'lp-meta' }, t('tagsEmpty'))
              : tagChoices.map((tag) =>
                  h(
                    'button',
                    {
                      key: tag,
                      type: 'button',
                      className: 'lp-chip',
                      'data-active': String(tags.includes(tag)),
                      style: { color: colorOfName(tag, props.colorOverrides, 'tag') },
                      onClick: () => toggleTag(tag),
                    },
                    tag,
                  ),
                ),
          ),
          h(
            'div',
            { style: { display: 'flex', gap: 6, marginTop: 4 } },
            h('input', {
              className: 'lp-input',
              value: tagDraft,
              placeholder: t('tagsNewHint'),
              onChange: (event) => setTagDraft(event.target.value),
              onKeyDown: (event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  commitTag();
                }
              },
            }),
            h('button', { className: 'lp-btn-ghost', type: 'button', onClick: commitTag }, t('tagsAdd')),
          ),
        ),
      ),
      !isNew && kind === 'task' && !studyManaged
        ? h(
            'label',
            { className: 'lp-field', style: { flexDirection: 'row', alignItems: 'center', gap: 8 } },
            h('input', {
              type: 'checkbox',
              checked: done,
              onChange: (event) => {
                const next = event.target.checked;
                setDone(next);
                props.onToggle(item, next, event);
              },
            }),
            t('doneLabel'),
          )
        : studyManaged ? h('p', { className: 'lp-meta' }, t('studyStatusManaged')) : null,
      kind === 'task'
        ? h(
            'div',
            { className: 'lp-field' },
            h('label', null, `${t('depsLabel')} · ${t('depsHint')}`),                dependencyOptions.length === 0
              ? h('div', { className: 'lp-meta' }, t('noDeps'))
              : h(
                  'div',
                  { className: 'lp-deps' },
                  dependencyOptions.map((entry) =>
                    h(
                      'label',
                      { key: entry.id },
                      h('input', {
                        type: 'checkbox',
                        checked: deps.has(entry.id),
                        onChange: () => toggleDep(entry.id),
                      }),
                      entry.title,
                    ),
                  ),
                ),
          )
        : null,
      h(
        'div',
        { className: 'lp-modal-actions' },
        !isNew
          ? h(
              'button',
              {
                className: 'lp-btn-ghost',
                disabled: busy,
                onClick: () => {
                  setBusy(true);
                  api('item.archive', { id: item.id })
                    .then(() => props.onSaved())
                    .catch((err) => setError(err.message))
                    .finally(() => setBusy(false));
                },
              },
              t('archive'),
            )
          : null,
        h('button', { className: 'lp-btn-ghost', onClick: props.onClose, disabled: busy }, t('cancel')),
        h('button', { className: 'lp-btn', onClick: save, disabled: busy || !title.trim() }, t('save')),
      ),
  );
}

// ---- dialogs/settings.js ----
function AppearanceNumber({ label, value, min, max, positiveMin = min, onChange }) {
  const [draft, setDraft] = React.useState(String(value));
  React.useEffect(() => setDraft(String(value)), [value]);
  return h('label', { className: 'lp-field' },
    h('span', null, label),
    h('input', {
      className: 'lp-input', type: 'number', min, max, step: 1, value: draft,
      onChange: (event) => {
        const text = event.target.value;
        setDraft(text);
        const number = Number(text);
        if (text && Number.isInteger(number) && number >= min && number <= max && (number === 0 || number >= positiveMin)) {
          onChange(number);
        }
      },
      onBlur: () => setDraft(String(value)),
    }),
  );
}

const SETTINGS_NUMBERS = {
  leadTaskDays: [0, 60], leadProjectDays: [0, 120], notifyGapMinutes: [1, 720],
  nonUrgentQuotaPerWindow: [0, 50], maxRemindersPerWindow: [1, 50], maxDeferHours: [0, 720],
  longTermReminderHours: [0, 720], archiveAfterDays: [1, 3650], deleteAfterDays: [7, 3650],
};

function SettingsModal(props) {
  const t = props.t;
  const [form, setForm] = React.useState(props.settings || {});
  React.useEffect(() => {
    if (props.settings) setForm(props.settings);
  }, [props.settings]);
  const [appearance, setAppearance] = React.useState(() => currentAppearance());
  const [page, setPage] = React.useState(props.initialPage || 'tags');
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [preview, setPreview] = React.useState(false);
  const [calendarInfo, setCalendarInfo] = React.useState(null);
  const [refreshingRegion, setRefreshingRegion] = React.useState(false);
  React.useEffect(() => {
    if (page !== 'general') return undefined;
    let active = true;
    let timer;
    const read = () => api('calendar.context').then((data) => {
      if (!active) return;
      setCalendarInfo(data);
      if (data.updating) timer = setTimeout(read, 2000);
    }).catch(() => {});
    read();
    return () => { active = false; clearTimeout(timer); };
  }, [page, refreshingRegion]);
  const [permission, setPermission] = React.useState(
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission,
  );
  const [feedback, setFeedback] = React.useState('');
  const [types, setTypes] = React.useState(props.settings?.taskTypes || []);
  const [tags, setTags] = React.useState(props.settings?.tags || []);
  const [tagDraft, setTagDraft] = React.useState('');
  const [selectedTag, setSelectedTag] = React.useState('');
  const [tagLibDraft, setTagLibDraft] = React.useState('');
  const [selectedTagLib, setSelectedTagLib] = React.useState('');
  const [studyMode, setStudyMode] = React.useState(true);
  const [skinChoice, setSkinChoice] = React.useState(() => currentSkinChoice());
  const [skinName, setSkinName] = React.useState('');
  React.useEffect(() => {
    const sync = () => setSkinChoice(currentSkinChoice());
    window.addEventListener('lp-skin-change', sync);
    return () => window.removeEventListener('lp-skin-change', sync);
  }, []);
  React.useEffect(() => onAppearanceChange(setAppearance), []);
  React.useEffect(() => {
    // Plugin-level switches live in the plugin manager; read them for gating only.
    api('config')
      .then((next) => {
        setStudyMode(next.studyPanel !== false);
      })
      .catch(() => {});
  }, []);
  const fileRef = React.useRef(null);
  const skinRef = React.useRef(null);
  const bgPlanningRef = React.useRef(null);
  const bgStudyRef = React.useRef(null);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const textField = (key, label) =>
    h(
      'label',
      { className: 'lp-field' },
      h('span', null, label),
      h('input', {
        className: 'lp-input',
        value: form[key] ?? '',
        onChange: (event) => set(key, event.target.value),
      }),
    );

  const numberField = (key, label) =>
    h(
      'label',
      { className: 'lp-field' },
      h('span', null, label),
      h('input', {
        className: 'lp-input',
        type: 'number',
        min: SETTINGS_NUMBERS[key][0],
        max: SETTINGS_NUMBERS[key][1],
        step: 1,
        value: form[key] ?? 0,
        onChange: (event) => set(key, event.target.value),
      }),
    );

  const colorOverrides = form.colorOverrides || {};
  const setColor = (kind, name, color) => setForm((current) =>
    ({ ...current, colorOverrides: { ...current.colorOverrides, [kind + ':' + name]: color } }));

  const colorSwatches = (kind, name) =>
    h(
      'div',
      { className: 'lp-field' },
      h('label', null, `${t(kind === 'tag' ? 'tagLibraryColor' : 'tagColor')} · ${name}`),
      h(
        'div',
        { className: 'lp-swatch-panel' },
        PALETTE.map((color) =>
          h('button', {
            key: color,
            type: 'button',
            className: 'lp-swatch',
            'data-active': String(colorOfName(name, colorOverrides, kind) === color),
            'aria-label': color,
            style: { background: color },
            onClick: () => setColor(kind, name, color),
          }),
        ),
        h('button', { className: 'lp-btn-ghost', type: 'button', onClick: () => setColor(kind, name, null) }, t('colorReset')),
      ),
    );

  const addTag = () => {
    const name = tagDraft.trim();
    if (!name) return;
    if (!types.includes(name)) {
      setTypes([...types, name]);
      setColor('type', name, PALETTE[types.length % PALETTE.length]);
    }
    setSelectedTag(name);
    setTagDraft('');
  };

  const addTagLib = () => {
    const name = tagLibDraft.trim();
    if (!name) return;
    if (!tags.includes(name)) {
      setTags([...tags, name]);
      setColor('tag', name, PALETTE[tags.length % PALETTE.length]);
    }
    setSelectedTagLib(name);
    setTagLibDraft('');
  };

  const removeType = (name) => {
    setTypes(types.filter((entry) => entry !== name));
    setSelectedTag('');
  };

  const removeTagLib = (name) => {
    setTags(tags.filter((entry) => entry !== name));
    setSelectedTagLib('');
  };

  const save = () => {
    const weekday = parseWindowsText(form.weekdayWindows);
    const weekend = parseWindowsText(form.weekendWindows);
    if (weekday === null || weekend === null) {
      setError(t('invalidWindows'));
      setPage('notify');
      return;
    }
    const previous = props.settings || {};
    for (const [key, [min, max]] of Object.entries(SETTINGS_NUMBERS)) {
      if (String(form[key]) === String(previous[key])) continue;
      const number = Number(form[key]);
      if (form[key] === '' || !Number.isInteger(number) || number < min || number > max) {
        setError(t('settingsNumberRange').replace('{min}', min).replace('{max}', max));
        setPage('notify');
        return;
      }
    }
    const changed = (keys) => keys.some((key) => String(form[key]) !== String(previous[key]));
    if (changed(['archiveAfterDays', 'deleteAfterDays']) && Number(form.deleteAfterDays) < Number(form.archiveAfterDays)) {
      setError(t('settingsRetentionOrder'));
      setPage('notify');
      return;
    }
    if (changed(['nonUrgentQuotaPerWindow', 'maxRemindersPerWindow']) &&
      Number(form.nonUrgentQuotaPerWindow) > Number(form.maxRemindersPerWindow)) {
      setError(t('settingsQuotaOrder'));
      setPage('notify');
      return;
    }
    setBusy(true);
    setError('');
    const patch = {
      weekdayWindows: String(form.weekdayWindows ?? ''),
      weekendWindows: String(form.weekendWindows ?? ''),
      leadTaskDays: Number(form.leadTaskDays ?? 3),
      leadProjectDays: Number(form.leadProjectDays ?? 8),
      notifyGapMinutes: clampNumber(form.notifyGapMinutes, 1, 720, 3),
      nonUrgentQuotaPerWindow: Number(form.nonUrgentQuotaPerWindow ?? 2),
      maxDeferHours: Number(form.maxDeferHours ?? 48),
      archiveAfterDays: clampNumber(form.archiveAfterDays, 1, 3650, 30),
      deleteAfterDays: clampNumber(form.deleteAfterDays, 7, 3650, 90),
      longTermReminderHours: Number(form.longTermReminderHours ?? 12),
      maxRemindersPerWindow: Number(form.maxRemindersPerWindow ?? 6),
      systemNotify: form.systemNotify !== false,
      taskTypes: types,
      tags,
      colorOverrides,
      adviceRegion: (form.adviceRegion || '').trim(),
      calendarAutoRefresh: form.calendarAutoRefresh !== false,
      adviceRegionLocked: form.adviceRegionLocked === true,
      dailyAdvice: form.dailyAdvice !== false,
    };
    for (const key of Object.keys(patch)) {
      if (JSON.stringify(previous[key]) === JSON.stringify(patch[key])) delete patch[key];
    }
    flushAppearanceSave()
      .then(() => Object.keys(patch).length ? api('settings.save', { patch }) : previous)
      .then((data) => {
        props.onSaved(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setBusy(false));
  };

  const close = () => {
    if (busy) return;
    flushAppearanceSave().then(props.onClose).catch((err) => setError(err.message));
  };

  const report = (value) => {
    setPermission(value);
    setFeedback(
      value === 'granted'
        ? t('notifyGranted')
        : value === 'denied'
          ? t('notifyDenied')
          : value === 'unsupported'
            ? t('notifyUnsupported')
            : t('notifyDefault'),
    );
  };

  const askPermission = () => {
    if (typeof Notification === 'undefined') {
      report('unsupported');
      return;
    }
    try {
      const result = Notification.requestPermission();
      if (result && typeof result.then === 'function') {
        result
          .then((value) => report(value))
          .catch((error) =>
            setFeedback(t('notifyFailed').replace('{e}', (error && error.message) || 'request failed')),
          );
      } else {
        report(Notification.permission);
      }
    } catch (error) {
      setFeedback(t('notifyFailed').replace('{e}', (error && error.message) || 'request failed'));
    }
  };

  const testNotify = async () => {
    const title = t('noticeTitle');
    const message = t('notifyTestBody');
    try {
      const result = await api('notifications.test', { title, message });
      if (!result.sent) {
        if (typeof Notification === 'undefined') { report('unsupported'); return; }
        if (Notification.permission !== 'granted') { report(Notification.permission); return; }
        new Notification(title, { body: message });
      }
      setFeedback(t('notifySent'));
    } catch (error) {
      setFeedback(t('notifyFailed').replace('{e}', (error && error.message) || 'send failed'));
    }
  };

  const doExport = () => {
    api('export')
      .then((data) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `life-planner-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        setFeedback(t('exported'));
      })
      .catch((err) => setError(err.message));
  };

  const doImport = (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!file) return;
    file
      .text()
      .then((text) => {
        let payload;
        try {
          payload = JSON.parse(text);
        } catch {
          throw new Error('JSON parse failed');
        }
        return api('import', { payload });
      })
      .then((result) => {
        setFeedback(t('imported').replace('{a}', String(result.added)).replace('{u}', String(result.updated)));
        if (props.onImported) props.onImported();
      })
      .catch((err) => setError(err.message));
  };

  const pickBackground = (area) => (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!file) return;
    const owner = currentSkinChoice();
    readImageData(file).then((dataUrl) => api('background.set', { area, dataUrl, forPreset: true }))
        .then((saved) => {
          const layer = { mode: 'image', imageUrl: saved.url };
          const layers = { [area]: layer };
          if (area === 'planning' && currentSkinChoice() === owner && window.confirm(t('bgSyncAsk'))) layers.study = layer;
          const next = updateSkinBackground(owner, layers);
          if (!next) return;
          return hydrateBackgrounds(next, Object.keys(layers)).then((result) => {
            if (currentSkinChoice() !== owner) return;
            if (result.failed.length > 0) setError(t('bgLoadFailed'));
            else setError('');
          });
        })
        .catch((err) => setError(err.message));
  };

  const clearBackground = (area) => {
    updateSkinBackground(currentSkinChoice(), { [area]: { mode: 'none', imageUrl: '' } });
  };

  const setBackgroundLayer = (area, patch) => {
    const layer = appearance.background[area];
    const next = updateSkinBackground(currentSkinChoice(), {
      [area]: { ...patch, mask: { ...layer.mask, ...patch.mask } },
    });
    if (next) hydrateBackgrounds(next, [area]).catch(() => {});
  };

  const chooseSkin = (value) => {
    migrateSkinProfiles();
    const next = applySkinChoice(value);
    setSkinChoice(currentSkinChoice());
    setAppearance(next);
    setError('');
    saveActiveSkin().catch((err) => setError(err.message));
    hydrateBackgrounds(next).catch(() => {});
  };

  const saveCurrentSkin = () => {
    const name = String(skinName || '').trim();
    if (!name) {
      setFeedback(t('skinNameRequired'));
      return;
    }
    try {
      const clean = Array.from(name).slice(0, 24).join('');
      if (Object.hasOwn(userSkins(), clean) && !window.confirm(t('skinOverwrite'))) return;
      const saved = saveUserSkin(name);
      chooseSkin(`user:${saved}`);
      setSkinName('');
      setFeedback(t('skinSaved'));
    } catch (err) {
      setError(err.message);
    }
  };


  const removeCurrentSkin = () => {
    const name = skinChoice.slice(5);
    if (!window.confirm(t('skinDeleteConfirm').replace('{name}', name))) return;
    if (!deleteUserSkin(name)) return;
    chooseSkin(`builtin:${currentSkin()}`);
    setFeedback(t('skinDeleted'));
  };

  const setFont = (key, value) => {
    const current = currentAppearance();
    applyAppearance({ ...current, font: { ...current.font, [key]: value } });
  };

  const setSize = (key, value) => {
    const current = currentAppearance();
    applyAppearance({ ...current, size: { ...current.size, [key]: value } });
  };

  const setAccent = (area, value) => {
    const current = currentAppearance();
    applyAppearance({ ...current, accent: { ...current.accent, [area]: value } });
  };

  const setLayout = (key, value) => {
    const current = currentAppearance();
    applyAppearance({ ...current, layout: { ...current.layout, [key]: value } });
  };

  const layoutInput = (key, label) => h('label', { className: 'lp-field' },
    h('span', null, t(label)),
    h('select', { className: 'lp-select', value: appearance.layout[key], onChange: (event) => setLayout(key, event.target.value) },
      APPEARANCE_LAYOUTS[key].map((option) => h('option', { key: option, value: option }, t('layout_' + option))),
    ),
  );

  const skinNameLabel = () => listSkinOptions(t).find((option) => option.value === skinChoice)?.label || t('skinDefault');

  const exportSkin = async () => {
    try {
      const blob = new Blob([await exportAppearance(skinNameLabel())], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'life-planner-skin-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) { setError(err.message); }
  };

  const numberInput = (key, label, value, onChange) => {
    const [min, max] = APPEARANCE_LIMITS[key] || [8, 64];
    return h(AppearanceNumber, { key: skinChoice + ':' + key, label, value, min, max,
      positiveMin: key === 'calendarHeight' ? 320 : min,
      onChange: (next) => onChange(key, next) });
  };

  const backgroundFields = (area) => {
    const layer = appearance.background[area];
    const mask = layer.mask || {};
    const inputRef = area === 'study' ? bgStudyRef : bgPlanningRef;
    const setLayer = (patch) => setBackgroundLayer(area, patch);
    return h(
      'div',
      { className: 'lp-field lp-settings-background' },
      h('label', null, area === 'study' ? t('fBgStudy') : t('fBgPlanning')),
      h(Dropdown, {
        value: layer.mode || 'none',
        onChange: (value) => setLayer({ mode: value }),
        options: [
          { value: 'none', label: t('bgModeNone') },
          { value: 'color', label: t('bgModeColor') },
          { value: 'image', label: t('bgModeImage') },
        ],
      }),
      layer.mode === 'color'
        ? h(
            'div',
            { className: 'lp-row2', style: { marginTop: 6 } },
            h(
              'div',
              { className: 'lp-field' },
              h('label', null, t('bgColor')),
              h('input', {
                className: 'lp-input',
                type: 'color',
                value: layer.color || '#1b1e24',
                onChange: (event) => setLayer({ color: event.target.value }),
              }),
            ),
            h(
              'div',
              { className: 'lp-field' },
              h('label', null, t('bgColorHint')),
              h('div', { className: 'lp-meta' }, t('bgColorHintText')),
            ),
          )
        : null,
      layer.mode === 'image'
        ? h(
            'div',
            null,
            h(
              'div',
              { className: 'lp-toolbar', style: { marginTop: 6 } },
              h('button', { className: 'lp-btn-ghost', type: 'button', onClick: () => inputRef.current && inputRef.current.click() }, t('fBgImport')),
              h('button', { className: 'lp-btn-ghost', type: 'button', onClick: () => api('background.open', {}).catch((err) => setError(err.message)) }, t('fBgOpen')),
              layer.imageUrl ? h('button', { className: 'lp-btn-ghost', type: 'button', onClick: () => clearBackground(area) }, t('fBgClear')) : null,
              h('input', {
                ref: inputRef,
                type: 'file',
                accept: 'image/*',
                style: { display: 'none' },
                onChange: pickBackground(area),
              }),
            ),
            h(
              'div',
              { className: 'lp-setting-grid' },
              h(
                'div',
                { className: 'lp-field' },
                h('label', null, t('fBgOpacity')),
                h('input', {
                  className: 'lp-input',
                  type: 'range',
                  min: 0,
                  max: 0.9,
                  step: 0.05,
                  value: layer.opacity,
                  onChange: (event) => setLayer({ opacity: Number(event.target.value) }),
                }),
              ),
              h(
                'div',
                { className: 'lp-field' },
                h('label', null, t('fMaskOn')),
                h(Switch, { value: mask.on !== false, onChange: (next) => setLayer({ mask: { ...mask, on: next } }) }),
              ),
            ),
            mask.on !== false
              ? h(
                  'div',
                  { className: 'lp-setting-grid' },
                  h(
                    'div',
                    { className: 'lp-field' },
                    h('label', null, t('fMaskSide')),
                    h(Dropdown, {
                      value: mask.side || 'left',
                      onChange: (value) => setLayer({ mask: { ...mask, side: value } }),
                      options: [
                        { value: 'left', label: t('sideLeft') },
                        { value: 'right', label: t('sideRight') },
                        { value: 'top', label: t('sideTop') },
                        { value: 'bottom', label: t('sideBottom') },
                      ],
                    }),
                  ),
                  h(
                    'div',
                    { className: 'lp-field' },
                    h('label', null, t('fMaskWidth')),
                    h('input', {
                      className: 'lp-input',
                      type: 'range',
                      min: 5,
                      max: 90,
                      step: 5,
                      value: mask.width || 25,
                      onChange: (event) => setLayer({ mask: { ...mask, width: Number(event.target.value) } }),
                    }),
                    h('div', { className: 'lp-meta' }, `${mask.width || 25}%`),
                  ),
                  h(
                    'div',
                    { className: 'lp-field' },
                    h('label', null, t('fMaskStrength')),
                    h('input', {
                      className: 'lp-input',
                      type: 'range',
                      min: 0.1,
                      max: 1,
                      step: 0.05,
                      value: mask.strength || 0.6,
                      onChange: (event) => setLayer({ mask: { ...mask, strength: Number(event.target.value) } }),
                    }),
                  ),
                )
              : null,
          )
        : null,
    );
  };


  const group = (title, ...children) => h('section', { className: 'lp-settings-group' },
    h('h3', { className: 'lp-form-section' }, t(title)), ...children);
  const switchRow = (label, hint, value, onChange) => h('div', { className: 'lp-settings-switch' },
    h('div', null, h('strong', null, t(label)), hint ? h('div', { className: 'lp-meta' }, t(hint)) : null),
    h(Switch, { label: t(label), value, onChange }));

  const classification = ({ kind, title, hint, list, draft, onDraft, onAdd, placeholder, addLabel, selected, onSelect, empty, onRemove }) => {
    const active = list.includes(selected) ? selected : list[0];
    return group(title,
      h('form', { className: 'lp-toolbar', onSubmit: (event) => { event.preventDefault(); onAdd(); } },
        h('input', {
          className: 'lp-input', 'aria-label': t(placeholder), placeholder: t(placeholder),
          value: draft, onChange: (event) => onDraft(event.target.value),
        }),
        h('button', { className: 'lp-btn', type: 'submit', disabled: !draft.trim() }, t(addLabel))),
      active ? h('div', { className: 'lp-settings-classification' },
        h(Dropdown, { value: active, onChange: onSelect, options: list.map((name) => ({ value: name, label: name })) }),
        h('button', { className: 'lp-btn-ghost', type: 'button', onClick: () => onRemove(active) }, t('delete')),
        colorSwatches(kind, active))
      : h('div', { className: 'lp-meta' }, t(empty)),
      hint ? h('div', { className: 'lp-meta' }, t(hint)) : null,
    );
  };

  const tagsPage = () => h('div', { className: 'lp-settings-sections' },
    classification({
      kind: 'type', title: 'sectionTags', hint: 'taskTypeAutoHint', list: types, draft: tagDraft, onDraft: setTagDraft,
      onAdd: addTag, placeholder: 'tagNamePlaceholder', addLabel: 'addTag', selected: selectedTag, onSelect: setSelectedTag,
      empty: 'noTags', onRemove: removeType,
    }),
    classification({
      kind: 'tag', title: 'sectionTagLibrary', list: tags, draft: tagLibDraft, onDraft: setTagLibDraft,
      onAdd: addTagLib, placeholder: 'tagLibName', addLabel: 'tagLibAdd', selected: selectedTagLib, onSelect: setSelectedTagLib,
      empty: 'tagLibEmpty', onRemove: removeTagLib,
    }));

  const regionDraftChanged = (form.adviceRegion || '').trim() !== (props.settings?.adviceRegion || '') ||
    (form.calendarAutoRefresh !== false) !== (props.settings?.calendarAutoRefresh !== false) ||
    Boolean(form.adviceRegionLocked) !== Boolean(props.settings?.adviceRegionLocked);
  const refreshNow = () => {
    setRefreshingRegion(true);
    setError('');
    api('calendar.refresh', {}).then((data) => {
      setCalendarInfo(data);
      window.dispatchEvent(new Event('lp-calendar-context-change'));
    }).catch((err) => setError(err.message)).finally(() => setRefreshingRegion(false));
  };

  const generalPage = () =>
    h(
      'div',
      { className: 'lp-settings-sections' },
      group('settingsLocation',
        h('div', { className: 'lp-setting-grid' },
          h('label', { className: 'lp-field' }, h('span', null, t('tipRegion')),
            h('input', { className: 'lp-input', value: form.adviceRegion || '', maxLength: 80,
              placeholder: t('tipRegionHint'), onChange: (event) => set('adviceRegion', event.target.value) })),
          h('label', { className: 'lp-field' }, h('span', null, t('calendarRefreshMode')),
            h('select', { className: 'lp-select', value: form.calendarAutoRefresh !== false ? 'auto' : 'manual',
              onChange: (event) => set('calendarAutoRefresh', event.target.value === 'auto') },
              h('option', { value: 'auto' }, t('calendarRefreshAuto')),
              h('option', { value: 'manual' }, t('calendarRefreshManual'))))),
        calendarInfo?.region ? h('div', { className: 'lp-meta' }, t('settingsCurrentRegion') + ' · ' + calendarInfo.region) : null,
        switchRow('calendarLockRegion', 'calendarLockHint', form.adviceRegionLocked === true, (next) => set('adviceRegionLocked', next)),
        h('div', { className: 'lp-settings-switch' },
          h('div', { className: 'lp-meta', role: 'status' },
            t(regionDraftChanged ? 'calendarRefreshOnSave' : calendarInfo?.updating ? 'calendarRefreshing' : 'calendarRefreshHint')),
          h('button', { type: 'button', className: 'lp-btn-ghost', onClick: refreshNow, disabled: refreshingRegion || regionDraftChanged }, t('calendarRefreshNow')))),
      group('studyTipTitle',
        switchRow('tipDeepSeek', 'settingsStudyAdviceHint', form.dailyAdvice !== false, (next) => set('dailyAdvice', next))),
      group('sectionData',
        h(
          'div',
          { className: 'lp-toolbar' },
          h('button', { className: 'lp-btn-ghost', type: 'button', onClick: doExport }, t('exportData')),
          h(
            'button',
            { className: 'lp-btn-ghost', type: 'button', onClick: () => fileRef.current && fileRef.current.click() },
            t('importData'),
          ),
          h('input', { ref: fileRef, type: 'file', accept: 'application/json', style: { display: 'none' }, onChange: doImport }),
        ), h('div', { className: 'lp-meta' }, t('generalHint')),
      ),
    );

  const notifyPage = () =>
    h(
      'div',
      { className: 'lp-settings-sections' },
      group('sectionNotify',
        switchRow('fSystemNotify', 'fSystemNotifyHint', form.systemNotify !== false, (next) => set('systemNotify', next)),
        h(
          'div',
          { className: 'lp-toolbar', style: { marginTop: 6 } },
          h('button', { className: 'lp-btn-ghost', type: 'button', onClick: testNotify }, t('notifyTest')),
          permission === 'granted'
            ? null
            : h('button', { className: 'lp-btn-ghost', type: 'button', onClick: askPermission }, t('enableNotify')),
          h('span', { className: 'lp-settings-status' }, t('notifyState').replace('{s}', t('notifyPermission_' + permission))),
        ),
      ),
      group('settingsNotifyWindows',
        h('div', { className: 'lp-setting-grid' },
          textField('weekdayWindows', t('fWeekdayWindows')),
          textField('weekendWindows', t('fWeekendWindows')),
          numberField('notifyGapMinutes', t('fGapMinutes')),
          numberField('nonUrgentQuotaPerWindow', t('fQuota')),
          numberField('maxRemindersPerWindow', t('fMaxPerWindow')),
          numberField('maxDeferHours', t('fMaxDefer')))),
      group('settingsNotifyLead',
        h('div', { className: 'lp-setting-grid' },
          numberField('leadTaskDays', t('fLeadTaskDays')),
          numberField('leadProjectDays', t('fLeadProjectDays')),
          numberField('longTermReminderHours', t('fLongTermHours'))),
        h('div', { className: 'lp-meta' }, t('settingsLeadHint'))),
      group('sectionTask', h('div', { className: 'lp-setting-grid' },
        numberField('archiveAfterDays', t('fArchiveDays')),
        numberField('deleteAfterDays', t('fDeleteDays')))),
    );

  const appearancePage = () =>
    h(
      'div',
      { className: 'lp-settings-sections' },
      group('sectionSkin',
      h(
        'div',
        { className: 'lp-field' },
        h('label', null, t('fSkinPreset')),
        h(Dropdown, {
          value: skinChoice,
          onChange: chooseSkin,
          options: listSkinOptions(t),
        }),
        h('div', { className: 'lp-meta' }, t('skinAppearanceOwner').replace('{name}', skinNameLabel())),
        h(
          'div',
          { className: 'lp-toolbar', style: { marginTop: 6 } },
          h('input', {
            className: 'lp-input',
            value: skinName,
            maxLength: 24,
            'aria-label': t('skinNamePlaceholder'),
            placeholder: t('skinNamePlaceholder'),
            onChange: (event) => setSkinName(event.target.value),
          }),
          h('button', { className: 'lp-btn', type: 'button', onClick: saveCurrentSkin, disabled: !skinName.trim() }, t('skinSaveAs')),
          skinChoice.indexOf('user:') === 0
            ? h('button', { className: 'lp-btn-ghost', type: 'button', onClick: removeCurrentSkin }, t('skinDelete'))
            : null,
        ),
        h(
          'div',
          { className: 'lp-toolbar' },
          h(
            'button',
            {
              className: 'lp-btn-ghost',
              type: 'button',
              onClick: exportSkin,
            },
            t('skinExport'),
          ),
          h('button', { className: 'lp-btn-ghost', type: 'button', onClick: () => skinRef.current && skinRef.current.click() }, t('skinImport')),
          h('input', {
            ref: skinRef,
            type: 'file',
            accept: 'application/json',
            style: { display: 'none' },
            onChange: (event) => {
              const file = event.target.files && event.target.files[0];
              event.target.value = '';
              if (!file) return;
              const legacySkin = currentSkin();
              file
                .text()
                .then((text) => importAppearance(text, file.name.replace(/\.json$/i, '') || t('skinImport'), legacySkin))
                .then((name) => {
                  chooseSkin('user:' + name);
                  setFeedback(t('skinImported'));
                })
                .catch((err) => setError(err.message));
            },
          }),
        ),
      )),

      group('sectionFont',
      h(
        'div',
        { className: 'lp-setting-grid' },
        numberInput('tab', t('fFontTab'), appearance.font.tab, setFont),
        numberInput('title', t('fFontTitle'), appearance.font.title, setFont),
        numberInput('calendar', t('fFontCalendar'), appearance.font.calendar, setFont),
        numberInput('task', t('fFontTask'), appearance.font.task, setFont),
        numberInput('type', t('fFontType'), appearance.font.type, setFont),
        numberInput('tag', t('fFontTag'), appearance.font.tag, setFont),
        numberInput('meta', t('fFontMeta'), appearance.font.meta, setFont),
        numberInput('base', t('fFontBase'), appearance.font.base, setFont),
      ),
      h('div', { className: 'lp-meta' }, t('fFontHint'))),
      group('sectionSize',
      h(
        'div',
        { className: 'lp-setting-grid' },
        layoutInput('calendar', 'layoutCalendar'),
        numberInput('calendarHeight', t('fCalHeight'), appearance.size.calendarHeight, setSize),
        studyMode ? layoutInput('studyToday', 'layoutStudyToday') : null,
        studyMode ? layoutInput('studyPlan', 'layoutStudyPlan') : null,
        layoutInput('spacing', 'layoutSpacing'),
        layoutInput('fontFamily', 'layoutFontFamily'),
      ),
      h('div', { className: 'lp-meta' }, t('fCalHeightHint'))),
      studyMode ? group('sectionMistake',
      h(
        'div',
        { className: 'lp-setting-grid' },
        numberInput('mistakeColumns', t('fMistakeCols'), appearance.size.mistakeColumns, setSize),
        numberInput('mistakeHeight', t('fMistakeHeight'), appearance.size.mistakeHeight, setSize),
      ),
      h(
        'div',
        { className: 'lp-setting-grid' },
        numberInput('mistakeTitle', t('fMistakeTitleFs'), appearance.font.mistakeTitle, setFont),
        numberInput('mistakeAnswer', t('fMistakeAnswerFs'), appearance.font.mistakeAnswer, setFont),
        numberInput('mistakeReason', t('fMistakeReasonFs'), appearance.font.mistakeReason, setFont),
      ),
      h('div', { className: 'lp-meta' }, t('fMistakeHint'))) : null,
      group('sectionAccent',
      h(
        'div',
        { className: 'lp-row2' },
        APPEARANCE_AREAS.filter((area) => studyMode || area === 'planning').map((area) => {
          const title = t(area === 'study' ? 'fAccentStudy' : 'fAccentPlanning');
          const value = appearance.accent[area];
          return h('div', { className: 'lp-field', key: area },
            h('label', null, title),
            h('div', { className: 'lp-settings-color' },
              h('input', { className: 'lp-input', type: 'color', 'aria-label': title,
                value: value || (currentSkin() === 'clawd' ? '#a35039' : '#4f7cff'), onChange: (event) => setAccent(area, event.target.value) }),
              h('button', { className: 'lp-btn-ghost', type: 'button', onClick: () => setAccent(area, ''), disabled: !value }, t('colorReset'))));
        }),
      )),
      group('sectionBackground',
      h(
        'div',
        { className: 'lp-field' },
        h('label', null, t('fSurface')),
        h(
          'div',
          { className: 'lp-toolbar' },
          h('input', {
            className: 'lp-input',
            type: 'range',
            min: 0,
            max: 0.9,
            step: 0.05,
            value: appearance.surface ?? 0.15,
            'aria-label': t('fSurface'),
            disabled: !APPEARANCE_AREAS.some((area) => (area === 'planning' || studyMode) &&
              (appearance.background[area].mode === 'color' || (appearance.background[area].mode === 'image' && appearance.background[area].imageUrl))),
            onChange: (event) => {
              applyAppearance({ ...currentAppearance(), surface: Number(event.target.value) });
            },
          }),
          h('span', { className: 'lp-meta' }, `${Math.round((appearance.surface ?? 0.15) * 100)}%`),
        ),
        h('div', { className: 'lp-meta' }, t('fSurfaceHint')),
      ),
      backgroundFields('planning'),
      studyMode ? backgroundFields('study') : null),
    );

  const tabs = [
    { key: 'tags', label: t('tabTags') },
    { key: 'general', label: t('tabGeneral') },
    { key: 'notify', label: t('tabNotify') },
    { key: 'appearance', label: t('tabAppearance') },
  ];
  const hasPendingSettings = JSON.stringify(form) !== JSON.stringify(props.settings || {}) ||
    JSON.stringify(types) !== JSON.stringify(props.settings?.taskTypes || []) ||
    JSON.stringify(tags) !== JSON.stringify(props.settings?.tags || []);

  if (preview) {
    return h('div', { className: 'lp-settings-preview' },
      h('button', { type: 'button', className: 'lp-btn', autoFocus: true, onClick: () => setPreview(false) }, t('settingsReturn')));
  }

  return h(
    Modal,
    {
      title: `${t('settings')} · v0.9.41`,
      className: 'lp-settings',
      onClose: close,
    },
    h('div', { className: 'lp-settings-layout' },
      h('nav', { className: 'lp-settings-nav', 'aria-label': t('settings') },
        tabs.map((tab) =>
          h(
            'button',
            {
              key: tab.key,
              className: 'lp-settings-nav-button',
              type: 'button',
              'aria-current': page === tab.key ? 'page' : undefined,
              onClick: () => { setPage(tab.key); setFeedback(''); },
            },
            tab.label,
          ),
        ),
      ),
      h('div', { className: 'lp-settings-body', key: page },
        error ? h('div', { className: 'lp-err', role: 'alert' }, error) : null,
        feedback ? h('div', { className: 'lp-meta lp-feedback', role: 'status' }, feedback) : null,
        page === 'tags' ? tagsPage() : page === 'general' ? generalPage() : page === 'notify' ? notifyPage() : appearancePage()),
    ),
      h(
        'div',
        { className: 'lp-modal-actions' },
        page === 'appearance' ? h('button', { type: 'button', className: 'lp-btn-ghost', onClick: () => setPreview(true), disabled: busy }, t('settingsPreview')) : null,
        h('button', { className: 'lp-btn-ghost', onClick: close, disabled: busy }, t(page === 'appearance' ? 'close' : 'cancel')),
        page !== 'appearance' || hasPendingSettings
          ? h('button', { className: 'lp-btn', onClick: save, disabled: busy }, t('save'))
          : null,
      ),
  );
}

// ---- dialogs/shelf-picker.js ----
function ShelfPicker(props) {
  const t = props.t;
  const items = props.items || [];
  const selected = props.selected || [];
  const toggle = (id) =>
    props.onChange(selected.includes(id) ? selected.filter((one) => one !== id) : [...selected, id]);
  const menu = useAnchoredMenu({
    count: items.length,
    activeIndex: -1,
    minWidth: 260,
    itemHeight: 30,
    maxHeight: 260,
    // Picking here toggles one item; the menu stays open for the next one.
    closeOnChoose: false,
    onChoose: (index) => {
      const item = items[index];
      if (item) toggle(item.id);
    },
  });
  const chosen = items.filter((item) => selected.includes(item.id));
  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 } },
    chosen.length === 0
      ? null
      : h(
          'div',
          { className: 'lp-taglist' },
          chosen.map((item) =>
            h(
              'button',
              {
                key: item.id,
                type: 'button',
                className: 'lp-chip',
                'data-active': 'true',
                onClick: () => toggle(item.id),
              },
              `${item.title} ×`,
            ),
          ),
        ),
    h(
      'div',
      { className: 'lp-dd' },
      h(
        'button',
        {
          className: 'lp-select lp-dd-btn',
          type: 'button',
          ref: menu.anchorRef,
          'aria-haspopup': 'listbox',
          'aria-expanded': String(menu.open),
          'aria-controls': menu.open ? menu.menuId : undefined,
          'aria-activedescendant':
            menu.open && menu.active >= 0 && menu.active < items.length
              ? `${menu.menuId}-opt-${menu.active}`
              : undefined,
          onClick: menu.toggle,
          onKeyDown: menu.onKeyDown,
        },
        h('span', { className: 'lp-dd-value' }, `${t('studyTaskShelf')} · ${selected.length}`),
        h('span', { className: 'lp-dd-caret', 'aria-hidden': true }, '▾'),
      ),
      menu.open && menu.pos
        ? h(
            'div',
            null,
            h(
              'div',
              {
                className: 'lp-dd-menu',
                role: 'listbox',
                ref: menu.menuRef,
                'aria-multiselectable': 'true',
                id: menu.menuId,
                tabIndex: -1,
                style: {
                  ...menu.pos,
                  overflow: 'auto',
                  display: 'block',
                },
                onKeyDown: menu.onKeyDown,
              },
              items.length === 0
                ? h('div', { className: 'lp-meta', style: { padding: '6px 10px' } }, t('studyTaskNoShelf'))
                : items.map((item, index) =>
                    h(
                      'button',
                      Object.assign({}, menu.getItemProps(index, selected.includes(item.id)), {
                        className: 'lp-dd-item',
                        style: {
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'stretch',
                          gap: 2,
                          width: '100%',
                        },
                      }),
                      h(
                        'span',
                        { style: { display: 'flex', alignItems: 'center', gap: 6 } },
                        h(
                          'span',
                          {
                            style: {
                              flex: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              color: 'var(--dsw-alias-label-primary)',
                            },
                          },
                          item.title,
                        ),
                        (item.tags || []).map((tag) =>
                          h(
                            'span',
                            {
                              key: tag,
                              className: 'lp-badge',
                              style: {
                                fontSize: 'var(--lp-meta-fs, 11px)',
                                color: 'var(--dsw-alias-brand-primary)',
                                borderColor: 'color-mix(in srgb, var(--dsw-alias-brand-primary) 45%, transparent)',
                              },
                            },
                            tag,
                          ),
                        ),
                        selected.includes(item.id)
                          ? h(
                              'span',
                              { className: 'lp-meta', style: { color: 'var(--dsw-alias-state-success-primary)' } },
                              '✓',
                            )
                          : null,
                      ),
                      h(
                        'span',
                        {
                          className: 'lp-meta',
                          style: {
                            fontSize: 'var(--lp-meta-fs, 11px)',
                            textAlign: 'left',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            opacity: 0.75,
                          },
                        },
                        item.path,
                      ),
                    ),
                  ),
            ),
          )
        : null,
    ),
  );
}

// ---- panels/planning.js ----
function Panel(props) {
  const t = props.t;
  // The last snapshot and settings are cached so the first paint has content
  // while the real request is still in flight.
  const [cached] = React.useState(() => readPlannerCache());
  // The host slot sometimes keeps the first commit invisible until something
  // re-renders the tree; a couple of forced ticks make the panel paint itself.
  const [, forceTick] = React.useState(0);
  React.useEffect(() => {
    const first = setTimeout(() => forceTick((n) => n + 1), 40);
    const second = setTimeout(() => forceTick((n) => n + 1), 500);
    return () => {
      clearTimeout(first);
      clearTimeout(second);
    };
  }, []);
  const [tab, setTab] = React.useState('calendar');
  const [pageRef, scheme] = usePageScheme();

  const [snapshot, setSnapshot] = React.useState(cached ? cached.snapshot : null);
  const [error, setError] = React.useState('');
  const [draft, setDraft] = React.useState('');
  const [planText, setPlanText] = React.useState(cached && cached.snapshot ? cached.snapshot.plan.bodyMarkdown || '' : '');
  const [busy, setBusy] = React.useState(false);
  const [editor, setEditor] = React.useState(null);
  const [settings, setSettings] = React.useState(cached ? cached.settings : null);
  const [settingsOpen, setSettingsOpen] = React.useState(null);
  const [notices, setNotices] = React.useState([]);
  const [focusItem, setFocusItem] = React.useState('');
  const [confirmCard, setConfirmCard] = React.useState(null);
  const snapshotGeneration = React.useRef(0);

  // An in-app floating confirmation anchored to the control that asked, so
  // the desktop shell never needs to render a native dialog.
  const askConfirm = (event, options) => {
    // The card is centered by CSS: anchoring to the click kept drifting inside
    // the host shell, and a centered dialog reads the same everywhere.
    setConfirmCard({
      title: options.title,
      lines: options.lines || [],
      confirmLabel: options.confirmLabel,
      onConfirm: options.onConfirm,
    });
  };
  const [selectedKey, setSelectedKey] = React.useState(dayKey(new Date()));
  const [anchor, setAnchor] = React.useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const reloadData = React.useCallback(
    (background = false) => {
      const generation = ++snapshotGeneration.current;
      return api('snapshot', undefined, { fresh: !background }).then((data) => {
        if (generation !== snapshotGeneration.current) return data;
        setSnapshot(data);
        if (!background) {
          setPlanText((current) => (current === '' ? data.plan.bodyMarkdown || '' : current));
          setError('');
        }
        writePlannerCache({ snapshot: data });
        return data;
      });
    },
    [],
  );

  const reload = React.useCallback(() => {
    reloadData().catch((err) => setError(err.message));
  }, [reloadData]);

  React.useEffect(() => {
    if (typeof document === 'undefined' || !['board', 'tree', 'calendar'].includes(tab)) return undefined;
    const refresh = () => {
      if (document.visibilityState !== 'hidden') reloadData(true).catch(() => {});
    };
    const timer = setInterval(refresh, 15000);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [tab, reloadData]);

  React.useEffect(() => {
    // The panel can mount before the Web carrier accepts requests, so the first
    // load is retried instead of leaving the page empty.
    let alive = true;
    let attempt = 0;
    const tryLoad = () => {
      reloadData().catch((err) => {
        if (!alive) return;
        setError(err.message);
        attempt += 1;
        if (attempt <= 6) setTimeout(tryLoad, Math.min(4000, 200 * 2 ** attempt));
      });
    };
    tryLoad();
    return () => {
      alive = false;
    };
  }, [reloadData]);

  React.useEffect(() => {
    let alive = true;
    let attempt = 0;
    const trySettings = () => {
      api('settings')
        .then((data) => {
          if (!alive) return;
          setSettings(data);
          writePlannerCache({ settings: data });
        })
        .catch(() => {
          attempt += 1;
          if (alive && attempt <= 5) setTimeout(trySettings, Math.min(3000, 200 * 2 ** attempt));
        });
    };
    trySettings();
    return () => {
      alive = false;
    };
  }, []);


  React.useEffect(() => {
    const onBatch = (list) => {
      setNotices((current) => {
        const seen = new Set(current.map((note) => note.id));
        const fresh = list.filter((note) => !seen.has(note.id));
        return fresh.length ? [...fresh, ...current].slice(0, 8) : current;
      });
      api('notifications.ack', { ids: list.map((note) => note.id) }).catch(() => {});
    };
    background.listeners.add(onBatch);
    pullReminders(t);
    return () => background.listeners.delete(onBatch);
  }, []);

  const run = React.useCallback(
    (promise) => {
      setBusy(true);
      promise
        .then(() => reload())
        .catch((err) => setError(err.message))
        .finally(() => setBusy(false));
    },
    [reload],
  );

  const items = (snapshot && snapshot.items) || [];
  const taskTypes =
    settings && Array.isArray(settings.taskTypes)
      ? settings.taskTypes
      : ['学习', '工作', '生活', '其他'];
  const colorOverrides = (settings && settings.colorOverrides) || {};

  const toggleComplete = (item, done, event) => {
    if (item.derived?.studyManaged) return;
    if (!done) {
      run(api('item.complete', { id: item.id, done: false }));
      return;
    }
    setBusy(true);
    api('item.complete', { id: item.id, done: true })
      .then((outcome) => {
        if (outcome && outcome.blocked) {
          askConfirm(event, {
            title: t('forceCompleteTitle'),
            lines: [
              ...(outcome.blockers.children.length > 0
                ? [t('blockedChildren'), ...outcome.blockers.children.map((one) => `· ${one.title}`)]
                : []),
              ...(outcome.blockers.depends.length > 0
                ? [t('blockedDeps'), ...outcome.blockers.depends.map((one) => `· ${one.title}`)]
                : []),
              t('forceComplete'),
            ],
            confirmLabel: t('markDone'),
            onConfirm: () => {
              setBusy(true);
              api('item.complete', { id: item.id, done: true, force: true })
                .then(() => reload())
                .catch((err) => setError(err.message))
                .finally(() => setBusy(false));
            },
          });
          return;
        }
        reload();
      })
      .catch((err) => setError(err.message))
      .finally(() => setBusy(false));
  };

  const moveBoardItem = (move) => {
    api('item.board', move)
      .then((result) => {
        if (!result.blocked) return reloadData();
        const tasks = [...result.blockers.children, ...result.blockers.depends];
        askConfirm(null, {
          title: t('forceCompleteTitle'),
          lines: [...tasks.map((item) => '· ' + item.title), t('forceComplete')],
          confirmLabel: t('markDone'),
          onConfirm: () => run(api('item.board', { ...move, force: true })),
        });
      })
      .catch((error) => setError(error.message));
  };

  const restoreItem = (item) => {
    setBusy(true);
    api('item.restore', { id: item.id })
      // Refresh first: the tree can only reveal a row it already lists.
      .then(() => reloadData())
      .then(() => {
        setFocusItem(item.id);
        setTab('tree');
      })
      .catch((err) => setError(err.message))
      .finally(() => setBusy(false));
  };

  const dismissNotice = (note) => {
    if (note.undoId) {
      api('item.undelete', { id: note.undoId })
        .then(() => {
          setNotices((current) => current.filter((entry) => entry.id !== note.id));
          reload();
        })
        .catch((err) => setError(err.message));
      return;
    }
    setNotices((current) => current.filter((entry) => entry.id !== note.id));
  };

  const quickAdd = (event) => {        event.preventDefault();
    const title = draft.trim();
    if (!title) return;
    setDraft('');
    // Adding to today after 09:00 should not create an already-past deadline.
    const now = new Date();
    const nine = new Date(`${selectedKey}T09:00:00`);
    const target =
      selectedKey === dayKey(now) && nine.getTime() <= now.getTime() ? new Date(now.getTime() + 3600000) : nine;
    run(api('item.add', { kind: 'task', title, dueAt: target.toISOString() }));
  };

  return h(
    'div',
    {
      className: 'lp-page',
      ref: pageRef,
      'data-scheme': scheme,
      style: {
        colorScheme: scheme,
        '--lp-tone-low': PRIORITY_TONES[0].color,
        '--lp-tone-medium': PRIORITY_TONES[1].color,
        '--lp-tone-high': PRIORITY_TONES[2].color,
        '--lp-tone-highest': PRIORITY_TONES[3].color,
      },
    },
    h(
      'div',
      { className: 'lp-head' },
      h(
        'div',
        {
          className: 'lp-tabs',
          // A wheel scrolls the strip sideways once it no longer fits.
          onWheel: (event) => {
            const strip = event.currentTarget;
            if (strip.scrollWidth <= strip.clientWidth) return;
            if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
            strip.scrollLeft += event.deltaY;
          },
        },
        h('button', { className: 'lp-tab', 'data-active': String(tab === 'calendar'), onClick: () => setTab('calendar') }, t('tabCalendar')),
        h('button', { className: 'lp-tab', 'data-active': String(tab === 'tree'), onClick: () => setTab('tree') }, t('tabTree')),
        h('button', { className: 'lp-tab', 'data-active': String(tab === 'board'), onClick: () => setTab('board') }, t('tabBoard')),
        h('button', { className: 'lp-tab', 'data-active': String(tab === 'plan'), onClick: () => setTab('plan') }, t('tabPlan')),
        h('button', { className: 'lp-tab', 'data-active': String(tab === 'archive'), onClick: () => setTab('archive') }, t('tabArchive')),
      ),
      h('button', { className: 'lp-btn-ghost', onClick: () => setSettingsOpen('tags') }, t('settings')),
      h('button', { className: 'lp-btn-ghost', onClick: () => setEditor({ kind: 'task', title: '' }) }, t('newItem')),
    ),
    error ? h('div', { className: 'lp-err', style: { padding: '0 16px' } }, error) : null,
    !snapshot && !error ? h('div', { className: 'lp-meta', style: { padding: '10px 16px' } }, t('loading')) : null,
    tab === 'calendar'
      ? h(CalendarView, {
          t,
          items,
          onRename: (id, title) => run(api('item.update', { id, patch: { title } })),
          selectedKey,
          anchor,
          draft,
          onDraft: setDraft,
          onSelect: setSelectedKey,
          onAnchor: setAnchor,
          onQuickAdd: quickAdd,
          onToggle: toggleComplete,
          onEdit: (item) => setEditor(item),
          onRegionSettings: () => setSettingsOpen('general'),
        })
      : null,
    tab === 'tree'
      ? h(
          'div',
          { className: 'lp-body', style: { padding: 0 } },
          h(TreeView, {
            t,
            items,
            taskTypes,
            colorOverrides,
            onToggle: toggleComplete,
            onEdit: (item) => setEditor(item),
            onArchive: (item) => run(api('item.archive', { id: item.id })),
            onReorder: (item, direction) => run(api('item.reorder', { id: item.id, direction })),
            onDelete: (id) => {
              const target = items.find((entry) => entry.id === id);
              api('item.delete', { id })
                .then(() => {
                  reload();
                  setNotices((current) =>
                    [
                      { id: `undo-${id}`, undoId: id, title: t('deletedHint'), body: target ? target.title : '' },
                      ...current,
                    ].slice(0, 8),
                  );
                })
                .catch((err) => setError(err.message));
            },
            onConfirm: askConfirm,
            onMove: (id, parentId, beforeId) => run(api('item.move', { id, parentId, beforeId })),
            onOutdent: (item) => {
              const parent = item.parentId ? items.find((entry) => entry.id === item.parentId) : null;
              run(api('item.move', { id: item.id, parentId: parent ? parent.parentId : null }));
            },
            onNew: (preset) => setEditor({ kind: 'task', title: '', ...(preset || {}) }),
            onCreate: (parentId, title, kind) => run(api('item.add', { kind, title, parentId })),
            onRename: (id, title) => run(api('item.update', { id, patch: { title } })),
            focusId: focusItem,
            onFocusHandled: () => setFocusItem(''),
          }),
        )
      : null,
    tab === 'archive'
      ? h(
          'div',
          { className: 'lp-body', style: { padding: 0 } },
          h(ArchiveView, { t, items, onRestore: restoreItem }),
        )
      : null,
    tab === 'board'
      ? h(
          'div',
          { className: 'lp-body', style: { padding: 0 } },
          h(BoardView, { t, items, colorOverrides, onEdit: (item) => setEditor(item), onMove: moveBoardItem }),
        )
      : null,
    tab === 'plan'
      ? h(
          'div',
          { className: 'lp-body' },
          h('textarea', {
            className: 'lp-plan',
            rows: 18,
            value: planText,
            placeholder: t('planPlaceholder'),
            onChange: (event) => setPlanText(event.target.value),
          }),
          h(
            'div',
            { style: { display: 'flex', justifyContent: 'flex-end', marginTop: 12 } },
            h('button', { className: 'lp-btn', onClick: () => run(api('plan.save', { bodyMarkdown: planText })), disabled: busy }, t('saveButton')),
          ),
        )
      : null,
    editor
      ? h(ItemEditor, {
          t,
          item: editor,
          items,
          taskTypes,
          tagLibrary: (settings && settings.tags) || [],
          colorOverrides,
          onClose: () => setEditor(null),
          onToggle: toggleComplete,
          onSaved: () => {
            setEditor(null);
            reload();
          },
        })
      : null,
    notices.length > 0
      ? h(
          'div',
          { className: 'lp-notices' },
          notices.map((note) =>
            h(
              'div',
              {
                key: note.id,
                className: 'lp-notice',
                title: new Date(note.createdAt).toLocaleString(),
                tabIndex: 0,
                role: 'button',
                onClick: () => dismissNotice(note),
                onKeyDown: keyActivate(() => dismissNotice(note)),
              },
              note.undoId
                ? h('div', { className: 'lp-notice-title' }, `${t('deletedHint')} ${note.body}`)
                : h('div', { className: 'lp-notice-title' }, describeReminder(note, t).title),
              h(
                'div',
                { className: 'lp-notice-body' },
                note.undoId ? t('undoHint') : describeReminder(note, t).body,
              ),
            ),
          ),
        )
      : null,
    settingsOpen
      ? h(SettingsModal, {
          t,
          initialPage: settingsOpen,
          settings:
            settings || {
              weekdayWindows: '10:00-13:00,19:00-02:00',
              weekendWindows: '10:00-02:00',
              leadTaskDays: 3,
              leadProjectDays: 8,
              notifyGapMinutes: 3,
              nonUrgentQuotaPerWindow: 2,
              maxRemindersPerWindow: 6,
              longTermReminderHours: 12,
              maxDeferHours: 48,
              archiveAfterDays: 30,
              deleteAfterDays: 90,
            },
          onClose: () => setSettingsOpen(false),
          onSaved: (data) => {
            setSettings(data);
            writePlannerCache({ settings: data });
            window.dispatchEvent(new Event('lp-calendar-context-change'));
            setSettingsOpen(false);
          },
          onImported: () => {
            setSettingsOpen(false);
            reload();
          },
        })
      : null,
    confirmCard
      ? h(
          Modal,
          { title: confirmCard.title, className: 'lp-confirm-modal', confirm: true, onClose: () => setConfirmCard(null) },
          h(
            'div',
            { className: 'lp-pop-list' },
            confirmCard.lines.map((line, index) => h('div', { key: index }, line)),
          ),
          h(
            'div',
            { className: 'lp-pop-actions' },
            h('button', { className: 'lp-btn-ghost', onClick: () => setConfirmCard(null) }, t('cancel')),
            h(
              'button',
              {
                className: 'lp-btn',
                onClick: () => {
                  const action = confirmCard.onConfirm;
                  setConfirmCard(null);
                  if (action) action();
                },
              },
              confirmCard.confirmLabel || t('save'),
            ),
          ),
        )
      : null,
  );
}

// ---- panels/session-switch.js ----
function SessionSwitch(props) {
  const t = props.t;
  const sessionId = props.sessionId;
  const [enabled, setEnabled] = React.useState(false);
  const [trackedSession, setTrackedSession] = React.useState('');

  React.useEffect(() => {
    if (!sessionId) return undefined;
    let alive = true;
    api('session?sessionId=' + encodeURIComponent(sessionId))
      .then((data) => {
        if (alive) {
          setEnabled(Boolean(data.enabled));
          setTrackedSession(data.studyTracking ? sessionId : '');
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [sessionId]);

  React.useEffect(() => {
    if (!sessionId || trackedSession !== sessionId) return undefined;
    const tracker = globalThis.crypto.randomUUID();
    let lastActivity = Date.now();
    let running = false;
    const post = (active) => {
      if (!active && !running) return;
      running = active;
      fetch(new URL('life-planner/api/habit.beat', document.baseURI), {
        method: 'POST', keepalive: true,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId, tracker, active }),
      }).catch(() => {});
    };
    const tick = () => post(document.visibilityState === 'visible' && document.hasFocus() && Date.now() - lastActivity < 300000);
    const activity = () => { lastActivity = Date.now(); if (!running) tick(); };
    const stop = () => post(false);
    const events = ['pointerdown', 'keydown', 'wheel'];
    for (const event of events) document.addEventListener(event, activity, { passive: true });
    document.addEventListener('visibilitychange', tick);
    window.addEventListener('focus', activity);
    window.addEventListener('blur', stop);
    window.addEventListener('pagehide', stop);
    const timer = setInterval(tick, 20000);
    tick();
    return () => {
      clearInterval(timer);
      for (const event of events) document.removeEventListener(event, activity);
      document.removeEventListener('visibilitychange', tick);
      window.removeEventListener('focus', activity);
      window.removeEventListener('blur', stop);
      window.removeEventListener('pagehide', stop);
      stop();
    };
  }, [sessionId, trackedSession]);

  const flip = () => {
    const next = !enabled;
    setEnabled(next);
    api('session.toggle', { sessionId, enabled: next }).catch(() => setEnabled(!next));
  };

  return h(
    'button',
    {
      className: 'lp-switch',
      type: 'button',
      role: 'switch',
      'aria-checked': String(enabled),
      'data-on': String(enabled),
      title: enabled ? t('switchTipOn') : t('switchTipOff'),
      onClick: flip,
    },
    h('span', { className: 'lp-switch-label' }, t('switchLabel')),
    h('span', { className: 'lp-switch-track' }, h('span', { className: 'lp-switch-knob' })),
    h('span', { className: 'lp-switch-state' }, enabled ? t('stateOn') : t('stateOff')),
  );
}

// ---- panels/study-habits.js ----
function StudyHabitTab(props) {
  const t = props.t;
  const fallback = { days: [], totalMinutes: 0, streak: 0, averageMinutes: 0, completionRate: 0 };
  const data = { ...fallback, ...(props.data || {}) };
  if (!Array.isArray(data.days)) data.days = [];
  const [week, setWeek] = React.useState(null);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    api('study-time')
      .then(setWeek)
      .catch((err) => setError(err.message));
  }, []);

  const labels = weekdayLabels(t);
  const max = Math.max(30, ...data.days.map((day) => Number(day.minutes) || 0));
  const plannedTotal = week
    ? (week.days || []).reduce((sum, day) => sum + (Number(day.planned) || 0), 0)
    : 0;
  const popularHours = (data.hours || []).filter((hour) => hour.seconds > 0)
    .sort((a, b) => b.seconds - a.seconds).slice(0, 3);
  const duration = (seconds) => seconds >= 60 ? Math.round(seconds / 60) + t('studyMinuteUnit') : '< 1' + t('studyMinuteUnit');

  return h(
    'div',
    { className: 'lp-body' },
    h(
      'div',
      { className: 'lp-toolbar' },
      h('span', { className: 'lp-meta' }, `${t('habitStreak')} ${data.streak} ${t('habitDays')}`),
      h('span', { className: 'lp-meta' }, `${t('habitAvg')} ${data.averageMinutes}${t('studyMinuteUnit')}`),
      h('span', { className: 'lp-meta' }, `${t('habitRate')} ${data.completionRate}%`),
    ),
    error ? h('div', { className: 'lp-err' }, error) : null,
    h('div', { className: 'lp-card lp-study-section' },
      h('div', { className: 'lp-card-title' }, t('habitCompletion')),
      h('div', { className: 'lp-meta' }, t('habitStudyDone') + ' ' + (data.studyDoneDays || 0) + '/' + (data.studyGoalDays || 0)),
      h('div', { className: 'lp-meta' }, t('habitTaskDone') + ' ' + (data.planningCompleted || 0) +
        ' · ' + t('habitOnTime') + ' ' + (data.planningOnTime || 0) + '/' + (data.planningWithDeadline || 0)),
      popularHours.length ? h('div', { className: 'lp-meta' }, t('habitHourly') + ' · ' + popularHours.map((slot) =>
        String(slot.hour).padStart(2, '0') + ':00 (' + duration(slot.seconds) + ')').join(' · ')) : null),
    h('div', { className: 'lp-section' }, t('habitSessions')),
    (data.sessions || []).length ? data.sessions.map((session, index) =>
      h('div', { key: session.id, className: 'lp-tree-row' },
        h('span', { className: 'lp-title' }, session.title || t('studyNav') + ' ' + (index + 1)),
        h('span', { className: 'lp-meta' }, duration(session.seconds)))) :
      h('div', { className: 'lp-empty' }, t('habitNoTime')),
    h(
      'div',
      { className: 'lp-section' },
      `${t('timePlanTitle')} · ${t('timePlanTotal')} ${plannedTotal}${t('studyMinuteUnit')}`,
    ),
    week
      ? h(
          'div',
          { className: 'lp-week' },
          week.days.map((day, index) =>
            h(
              'div',
              { key: day.day, className: 'lp-week-day', 'data-planned': String(day.planned !== null) },
              h('div', { className: 'lp-meta' }, `${labels[index] || ''} ${day.day.slice(5)}`),
              h(
                'div',
                { className: 'lp-week-value' },
                day.planned === null ? '—' : `${day.planned}${t('studyMinuteUnit')}`,
              ),
              h('div', { className: 'lp-meta' }, `${t('timePlanActual')} ${day.actual}`),
            ),
          ),
        )
      : h('div', { className: 'lp-meta' }, t('timePlanLoading')),
    h('div', { className: 'lp-meta' }, t('timePlanAgentHint')),
    h('div', { className: 'lp-section' }, `${t('habitRecent')} · ${data.days.length}`),
    data.days.length === 0
      ? null
      : data.days.map((day) =>
          h(
            'div',
            { key: day.day, className: 'lp-tree-row' },
            h('span', { className: 'lp-meta' }, day.day.slice(5)),
            h(
              'span',
              { className: 'lp-fill', style: { display: 'flex', alignItems: 'center' } },
              h('span', {
                className: 'lp-bar',
                style: { width: `${Number.isFinite(day.minutes / max) ? Math.round((day.minutes / max) * 100) : 0}%` },
              }),
            ),
            h('span', { className: 'lp-meta' }, `${day.minutes}${t('studyMinuteUnit')}`),
            h(
              'span',
              { className: 'lp-meta' },
              day.segments > 1 ? t('habitSegments').replace('{n}', String(day.segments)) : '',
            ),
          ),
        ),
  );
}

// ---- panels/study-mistakes.js ----
function MistakeTab(props) {
  const t = props.t;
  const [filterTask, setFilterTask] = React.useState('all');
  const [dateFrom, setDateFrom] = React.useState('');
  const [dateTo, setDateTo] = React.useState('');
  const [editing, setEditing] = React.useState(null);
  const [preview, setPreview] = React.useState(null);
  const [form, setForm] = React.useState({ question: '', answer: '', reason: '' });
  const [hint, setHint] = React.useState('');
  const items = props.items || [];
  const taskOptions = [{ value: 'all', label: t('mistakeAllTasks') }];
  const seen = new Set();
  for (const item of items) {
    if (!item.taskId || seen.has(item.taskId)) continue;
    seen.add(item.taskId);
    taskOptions.push({ value: item.taskId, label: item.taskTitle || item.taskId });
  }
  const filtered = items.filter((item) => {
    if (filterTask !== 'all' && item.taskId !== filterTask) return false;
    const day = item.createdAt ? dayKey(new Date(item.createdAt)) : '';
    if (dateFrom && day < dateFrom) return false;
    if (dateTo && day > dateTo) return false;
    return true;
  });
  const filtering = filterTask !== 'all' || Boolean(dateFrom) || Boolean(dateTo);
  const ordered = React.useMemo(() => (filtering
    ? [...filtered].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
    : (() => {
        const pool = [...filtered];
        for (let index = pool.length - 1; index > 0; index -= 1) {
          const swap = Math.floor(Math.random() * (index + 1));
          [pool[index], pool[swap]] = [pool[swap], pool[index]];
        }
        return pool;
      })()), [items, filterTask, dateFrom, dateTo]);
  const groups = new Map();
  for (const item of ordered) {
    const key = item.taskId || '';
    if (!groups.has(key)) groups.set(key, { title: item.taskTitle || t('mistakeNoTask'), items: [] });
    groups.get(key).items.push(item);
  }
  const [, forceAppearance] = React.useReducer((value) => value + 1, 0);
  React.useEffect(() => onAppearanceChange(forceAppearance), []);

  React.useEffect(() => {
    if (filterTask !== 'all' && !taskOptions.some((option) => option.value === filterTask)) {
      setFilterTask('all');
    }
  }, [filterTask, items.length]);

  const openEdit = (item) => {
    setEditing(item);
    setForm({ question: item.question, answer: item.answer || '', reason: item.reason || '' });
  };
  const saveEdit = () => {
    if (!editing) return;
    api('mistake.update', { id: editing.id, patch: form })
      .then(() => {
        setEditing(null);
        return props.onReload();
      })
      .catch((err) => props.onError(err.message));
  };
  const removeMistake = (item) => {
    if (typeof window !== 'undefined' && !window.confirm(t('mistakeDeleteAsk'))) return Promise.resolve(false);
    return api('mistake.delete', { id: item.id })
      .then(() => props.onReload())
      .then(() => true)
      .catch((err) => {
        props.onError(err.message);
        return false;
      });
  };

  const explain = (item) => {
    api('mistake.brief', { id: item.id })
      .then((brief) => {
        const text = brief.prompt || '';
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).catch(() => {});
        }
        setHint(t('mistakeCopied').replace('{name}', brief.taskTitle || t('mistakeNoTask')));
      })
      .catch((err) => props.onError(err.message));
  };
  const sourcesFor = (item) => {
    const citations = Array.isArray(item.sources) ? item.sources.map((source) =>
      [...new Set([source.title, source.url || source.path, source.file,
        source.pdfPage ? t('mistakePdfPage').replace('{n}', source.pdfPage) : '',
        source.bookPage ? t('mistakeBookPage').replace('{n}', source.bookPage) : '',
        source.section].filter(Boolean))].join(' · ')).filter(Boolean) : [];
    if (citations.length === 0 && item.source) citations.push(item.source);
    return citations;
  };
  const sourceList = (item, className, label) => {
    const citations = sourcesFor(item);
    if (citations.length === 0) return null;
    const list = h('ul', { className }, citations.map((citation, index) => h('li', { key: index }, citation)));
    return label ? h('div', { className: 'lp-pre-block' }, h('div', { className: 'lp-meta' }, label), list) : list;
  };
  return h(
    'div',
    { className: 'lp-body' },
    h(
      'div',
      { className: 'lp-toolbar' },
      h(Dropdown, { value: filterTask, onChange: setFilterTask, options: taskOptions }),
      h(
        'div',
        { className: 'lp-field', style: { margin: 0 } },
        h('label', null, t('mistakeFrom')),
        h('input', {
          className: 'lp-input',
          style: { background: controlSurface(0.45), backdropFilter: 'blur(6px)' },
          type: 'date',
          value: dateFrom,
          onChange: (event) => setDateFrom(event.target.value),
        }),
      ),
      h(
        'div',
        { className: 'lp-field', style: { margin: 0 } },
        h('label', null, t('mistakeTo')),
        h('input', {
          className: 'lp-input',
          style: { background: controlSurface(0.45), backdropFilter: 'blur(6px)' },
          type: 'date',
          value: dateTo,
          onChange: (event) => setDateTo(event.target.value),
        }),
      ),
      dateFrom || dateTo || filterTask !== 'all'
        ? h(
            'button',
            {
              className: 'lp-btn-ghost',
              type: 'button',
              onClick: () => {
                setFilterTask('all');
                setDateFrom('');
                setDateTo('');
              },
            },
            t('clear'),
          )
        : null,
      h('span', { className: 'lp-meta' }, `${filtered.length}/${items.length}`),
    ),
    hint ? h('div', { className: 'lp-meta' }, hint) : null,
    filtered.length === 0
      ? h('div', { className: 'lp-empty' }, t('mistakeEmpty'))
      : Array.from(groups.entries()).map(([taskId, group]) =>
          h(
            'div',
            { key: taskId || 'none', className: 'lp-group' },
            h(
              'div',
              { className: 'lp-group-head' },
              h('span', null, group.title),
              h('span', { className: 'lp-meta' }, String(group.items.length)),
            ),
            h(
              'div',
              {
                className: 'lp-study-grid lp-mistake-grid',
              },
              group.items.map((item) =>
                h(
                  'div',
                  {
                    key: item.id,
                    className: 'lp-card',
                    title: t('mistakeDblClick'),
                    onDoubleClick: () => setPreview(item),
                  },
                  h('div', { className: 'lp-card-title lp-mistake-title' }, item.question),
                  item.answer
                    ? h('div', { className: 'lp-card-meta lp-mistake-answer' }, `${t('mistakeAnswer')}: ${item.answer}`)
                    : null,
                  item.reason
                    ? h('div', { className: 'lp-card-meta lp-mistake-reason' }, `${t('mistakeReason')}: ${item.reason}`)
                    : null,
                  item.memoryTip ? h('div', { className: 'lp-card-meta lp-mistake-reason' }, item.memoryTip) : null,
                  sourceList(item, 'lp-card-meta'),
                  h('div', { className: 'lp-card-meta' }, item.createdAt ? dayKey(new Date(item.createdAt)) : ''),
                  h(TagChips, { tags: item.tags }),
                  h(
                    'div',
                    { style: { display: 'flex', gap: 6, justifyContent: 'flex-end' } },
                    h(
                      'button',
                      {
                        className: 'lp-btn-ghost',
                        onClick: (event) => {
                          event.stopPropagation();
                          explain(item);
                        },
                      },
                      t('mistakeExplain'),
                    ),
                    h(
                      'button',
                      {
                        className: 'lp-btn-ghost',
                        onClick: (event) => {
                          event.stopPropagation();
                          openEdit(item);
                        },
                      },
                      t('edit'),
                    ),
                    h(
                      'button',
                      {
                        className: 'lp-btn-ghost',
                        onClick: (event) => {
                          event.stopPropagation();
                          removeMistake(item);
                        },
                      },
                      t('delete'),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
    editing
      ? h(
          Modal,
          { title: t('mistakeEdit'), onClose: () => setEditing(null) },
            h(
              'div',
              { className: 'lp-field' },
              h('label', null, t('mistakeQuestion')),
              h('textarea', {
                className: 'lp-input',
                rows: 4,
                value: form.question,
                onChange: (event) => setForm({ ...form, question: event.target.value }),
              }),
            ),
            h(
              'div',
              { className: 'lp-field' },
              h('label', null, t('mistakeAnswer')),
              h('textarea', {
                className: 'lp-input',
                rows: 3,
                value: form.answer,
                onChange: (event) => setForm({ ...form, answer: event.target.value }),
              }),
            ),
            h(
              'div',
              { className: 'lp-field' },
              h('label', null, t('mistakeReason')),
              h('textarea', {
                className: 'lp-input',
                rows: 3,
                value: form.reason,
                onChange: (event) => setForm({ ...form, reason: event.target.value }),
              }),
            ),
            editing.taskTitle
              ? h('div', { className: 'lp-meta' }, `${t('mistakeSource')}: ${editing.taskTitle}`)
              : null,
            h(
              'div',
              { className: 'lp-modal-actions' },
              h('button', { className: 'lp-btn-ghost', onClick: () => setEditing(null) }, t('cancel')),
              h('button', { className: 'lp-btn', onClick: saveEdit }, t('save')),
            ),
        )
      : null,
    preview
      ? h(
          Modal,
          { title: t('mistakePreview'), className: 'lp-mistake-preview', onClose: () => setPreview(null) },
            preview.taskTitle ? h('div', { className: 'lp-meta' }, `${t('mistakeSource')}: ${preview.taskTitle}`) : null,
            h(
              'div',
              { className: 'lp-pre-block' },
              h('div', { className: 'lp-meta' }, t('mistakeQuestion')),
              h('div', { className: 'lp-pre-body' }, preview.question),
            ),
            preview.answer
              ? h(
                  'div',
                  { className: 'lp-pre-block' },
                  h('div', { className: 'lp-meta' }, t('mistakeAnswer')),
                  h('div', { className: 'lp-pre-body' }, preview.answer),
                )
              : null,
            preview.reason
              ? h(
                  'div',
                  { className: 'lp-pre-block' },
                  h('div', { className: 'lp-meta' }, t('mistakeReason')),
                  h('div', { className: 'lp-pre-body' }, preview.reason),
                )
              : null,
            preview.memoryTip ? h('div', { className: 'lp-pre-block' },
              h('div', { className: 'lp-meta' }, t('mistakeMemoryTip')),
              h('div', { className: 'lp-pre-body' }, preview.memoryTip)) : null,
            sourceList(preview, 'lp-pre-body lp-mistake-sources', t('mistakeMaterialSource')),
            h('div', { className: 'lp-meta' }, preview.createdAt ? dayKey(new Date(preview.createdAt)) : ''),
            h(
              'div',
              { className: 'lp-modal-actions' },
              h('button', { className: 'lp-btn-ghost', onClick: () => explain(preview) }, t('mistakeExplain')),
              h(
                'button',
                {
                  className: 'lp-btn-ghost',
                  onClick: () => {
                    openEdit(preview);
                    setPreview(null);
                  },
                },
                t('edit'),
              ),
              h(
                'button',
                {
                  className: 'lp-btn-ghost',
                  onClick: () => {
                    removeMistake(preview).then((removed) => {
                      if (removed) setPreview(null);
                    });
                  },
                },
                t('delete'),
              ),
              h('button', { className: 'lp-btn', onClick: () => setPreview(null) }, t('close')),
            ),
        )
      : null,
  );
}

// ---- panels/study-overview.js ----
function TodayStudyProgress({ t, tasks }) {
  if (!tasks.length) return null;
  const done = (task) => task.state === 'done' || task.doneToday === true;
  const completed = tasks.filter(done).length;
  const label = t('studyTodayCompleted').replace('{n}', completed).replace('{total}', tasks.length);
  return h('div', { className: 'lp-group lp-today-study-progress' },
    h('div', { className: 'lp-group-head lp-today-study-head' },
      h('strong', null, t('studyTodayTasks')),
      h('span', { className: 'lp-meta', role: 'status' }, label),
    ),
    tasks.map((task) =>
      h('div', { key: task.id, className: 'lp-tree-row lp-today-study-task', 'data-done': String(done(task)) },
        h('span', { className: 'lp-title', title: task.title }, task.title),
        h('div', { className: 'lp-today-study-targets lp-meta' },
          h('span', null, `${t('studyNewLabel')} ${task.answeredNew ?? 0}/${task.targetNew ?? task.dailyNew ?? 0}`),
          h('span', null, `${t('studyReviewLabel')} ${task.answeredReview ?? 0}/${task.targetReview ?? task.dailyReview ?? 0}`),
          done(task) ? h('span', { className: 'lp-today-study-done' }, t('studyDone')) : null,
        ),
      ),
    ),
  );
}

function StudyOverview(props) {
  const t = props.t;
  // The learning data comes from the parent page, which every tab shares.
  const data = props.data || null;
  const [tip, setTip] = React.useState(null);
  const [error, setError] = React.useState('');
  const [studyTasks, setStudyTasks] = React.useState(null);
  const [progressError, setProgressError] = React.useState('');
  const loadTip = () => api('tip').then(setTip).catch((err) => setError(err.message));
  const reload = () => {
    if (typeof props.onReload === 'function') props.onReload();
    return loadTip();
  };
  React.useEffect(() => {
    loadTip();
    const timer = setInterval(loadTip, 30000);
    return () => clearInterval(timer);
  }, []);
  React.useEffect(() => {
    let active = true;
    const loadProgress = () => {
      if (document.visibilityState === 'hidden') return;
      api('study-tasks').then((rows) => {
        if (!active) return;
        setStudyTasks(Array.isArray(rows) ? rows : []);
        setProgressError('');
      }).catch((err) => {
        if (active) setProgressError(err.message);
      });
    };
    loadProgress();
    const timer = setInterval(loadProgress, 10000);
    document.addEventListener('visibilitychange', loadProgress);
    return () => {
      active = false;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', loadProgress);
    };
  }, []);
  const finishPlan = (entry) =>
    api('plan.done', { id: entry.id })
      .then(reload)
      .catch((err) => setError(err.message));
  const finishMistake = (mistake) =>
    api('mistake.review', { id: mistake.id, days: 3 })
      .then(reload)
      .catch((err) => setError(err.message));
  const subjects = (data && data.subjects) || [];
  const topics = (data && data.topics) || [];
  const due = topics.filter((topic) => topic.due);
  // Study days roll over at 04:00, like the host-side scheduler.
  const todayKey = studyLocalDayKey();
  const todayPlan = ((data && data.plan) || []).filter((entry) => entry.date === todayKey);
  const todayTasks = (studyTasks || []).filter((task) => task.state !== 'todo' && !task.scheduled);
  const dueMistakes = ((data && data.mistakes) || []).filter((entry) => entry.due);
  const date = new Date(todayKey + 'T12:00:00');
  // Mastery is owned by the tutor: the page only displays it.
  const masteryLabel = (value) => `${Math.min(10, Math.max(0, Number(value) || 0))}/10`;
  return h(
    'div',
    { className: 'lp-body lp-study-today' },
    error ? h('div', { className: 'lp-err' }, error) : null,
    progressError ? h('div', { className: 'lp-err', role: 'alert' }, progressError) : null,
    h('header', { className: 'lp-study-today-head' },
      h('h2', null, t('dayLabel').replace('{m}', String(date.getMonth() + 1)).replace('{d}', String(date.getDate())),
        h('small', null, weekdayLabels(t)[(date.getDay() + 6) % 7])),
      h('button', { className: 'lp-btn-ghost', type: 'button', onClick: props.onOpenPlan }, t('studyTabPlan') + ' ›')),
    h('div', { className: 'lp-study-today-grid' },
    h('section', { className: 'lp-card lp-study-today-primary' },
    h('div', { className: 'lp-card-title' }, t('studyTodayPlan')),
    h(TodayStudyProgress, { t, tasks: todayTasks }),
    todayPlan.length ? h(
      'div',
      { className: 'lp-toolbar' },
          h('span', { className: 'lp-meta' }, t('studyTodayCompleted').replace('{n}', todayPlan.filter((entry) => entry.doneAt).length).replace('{total}', todayPlan.length)),
    ) : null,
    todayPlan.length === 0
      ? studyTasks && !todayTasks.length ? h('div', { className: 'lp-empty' }, t('studyNoTodayPlan')) : null
      : todayPlan.map((entry) =>
          h(
            'div',
            { key: entry.id, className: 'lp-tree-row', 'data-done': String(Boolean(entry.doneAt)) },
            h(
              'span',
              { className: 'lp-title' },
              (topics.find((topic) => topic.id === entry.topicId) || {}).title || entry.kind,
            ),
            h('span', { className: 'lp-badge' }, entry.kind === 'review' ? t('masteryReview') : t('masteryLearning')),
            h('span', { className: 'lp-meta' }, `${entry.minutes}${t('studyMinuteUnit')}`),
            entry.materials && entry.materials.length > 0
              ? h(
                  'span',
                  { className: 'lp-meta', title: entry.materials.map((one) => one.title).join('、') },
                  `📎${entry.materials.length}`,
                )
              : null,
            entry.doneAt
              ? h('span', { className: 'lp-meta' }, t('studyDone'))
              : h('button', { className: 'lp-btn-ghost', onClick: () => finishPlan(entry) }, t('studyFinish')),
          ),
        ),
    ),
    h('aside', { className: 'lp-study-today-review' },
    h('section', { className: 'lp-card' },
    h('div', { className: 'lp-study-today-card-title' }, h('strong', null, t('studyDue')), h('span', { className: 'lp-meta' }, due.length)),
    due.length === 0
      ? h('div', { className: 'lp-meta' }, t('studyNoDue'))
      : due.map((topic) =>
          h(
            'div',
            { key: topic.id, className: 'lp-tree-row' },
            h('span', { className: 'lp-title' }, topic.title),
          ),
        ),
    ),
    h('section', { className: 'lp-card' },
    h('div', { className: 'lp-study-today-card-title' }, h('strong', null, t('studyMistakeReview')), h('span', { className: 'lp-meta' }, dueMistakes.length)),
    dueMistakes.length === 0
      ? h('div', { className: 'lp-meta' }, t('studyNoMistake'))
      : dueMistakes.map((mistake) =>
          h(
            'div',
            { key: mistake.id, className: 'lp-tree-row' },
            h('span', { className: 'lp-title', title: mistake.reason || '' }, mistake.question),
            h('span', { className: 'lp-meta' }, mistake.answer),
            h('button', { className: 'lp-btn-ghost', onClick: () => finishMistake(mistake) }, t('studyFinish')),
          ),
        ),
    )),
    ),
    h('details', { className: 'lp-card lp-study-advice' },
      h('summary', null,
        h('strong', null, t('studyTipTitle')),
        tip ? h('span', { className: 'lp-meta' }, t(tip.source === 'deepseek' ? 'tipDeepSeek' : 'tipLocal')) : null,
        h('span', { className: 'lp-advice-excerpt' }, tip?.text?.split('\n').find((line) => line.trim()) || t('tipPending'))),
      h('div', { className: 'lp-advice-copy' }, tip?.text || t('tipPending'))),
    subjects.map((subject) =>
      h(
        'div',
        { key: subject.id, className: 'lp-group' },
        h('div', { className: 'lp-group-head' }, h('span', null, subject.title)),
        topics
          .filter((topic) => topic.subjectId === subject.id)
          .map((topic) =>
            h(
              'div',
              { key: topic.id, className: 'lp-tree-row' },
              h('span', { className: 'lp-title' }, topic.title),
              h(
                'span',
                { className: 'lp-badge', 'data-mastery': topic.mastery, title: t('masteryReadOnly') },
                masteryLabel(topic.mastery),
              ),
            ),
          ),
      ),
    ),
  );
}

// ---- panels/study-plan.js ----
// The knowledge-base types the host ships; shared by the create and edit dialogs.
const TEMPLATE_OPTIONS = [
  { value: 'list', label: 'list · 列表库' },
  { value: 'tree', label: 'tree · 知识树' },
  { value: 'bank', label: 'bank · 题库' },
  { value: 'custom', label: 'custom · 自定义' },
];
// Tasks created before the rename keep their old id; show the canonical one.
const TEMPLATE_ALIASES = { 'word-bank': 'list', outline: 'tree', 'outline-bank': 'bank' };
const normalizeTemplate = (value) => TEMPLATE_ALIASES[value] || value;

function StudyPlanTab(props) {
  const t = props.t;
  const data = props.data || { subjects: [], topics: [], plan: [] };
  const [draft, setDraft] = React.useState('');
  const [collapsedSubjects, setCollapsedSubjects] = React.useState(new Set());
  const [showSubjectAdd, setShowSubjectAdd] = React.useState(false);
  const drag = React.useRef(null);
  const [dropTarget, setDropTarget] = React.useState('');
  const [scheduling, setScheduling] = React.useState(null);
  const [startAt, setStartAt] = React.useState('');
  const [savingSchedule, setSavingSchedule] = React.useState(false);
  const [scheduleError, setScheduleError] = React.useState('');
  const [tasks, setTasks] = React.useState([]);
  const [weekMinutes, setWeekMinutes] = React.useState(null);
  const [newTitle, setNewTitle] = React.useState(() => `学习任务 ${dayKey(new Date()).slice(5)}`);
  const [newPath, setNewPath] = React.useState(() => {
    try {
      return localStorage.getItem('lpStudyPath') || '';
    } catch {
      return '';
    }
  });
  const [newTemplate, setNewTemplate] = React.useState('list');
  const [editingTask, setEditingTask] = React.useState(null);
  const [showNew, setShowNew] = React.useState(false);
  const [newShelf, setNewShelf] = React.useState([]);
  const [subjectEditing, setSubjectEditing] = React.useState(null);
  const [subjectForm, setSubjectForm] = React.useState({ title: '', examDate: '', note: '' });
  const [taskForm, setTaskForm] = React.useState({ title: '', workspacePath: '', template: 'list' });
  const [taskShelf, setTaskShelf] = React.useState([]);
  const reloadTasks = (fresh = false) =>
    api('study-tasks', undefined, { fresh })
      .then((list) => setTasks(Array.isArray(list) ? list : []))
      .catch((error) => props.onError(error.message));
  React.useEffect(() => {
    reloadTasks();
    const timer = setInterval(reloadTasks, 5000);
    return () => clearInterval(timer);
  }, []);
  // The week plan is written by the study conversation; this panel only shows it,
  // refreshed on the same beat as the task list.
  React.useEffect(() => {
    const loadWeek = () =>
      api('study-time')
        .then((week) => {
          const total = (week.days || []).reduce((sum, day) => sum + (Number(day.planned) || 0), 0);
          setWeekMinutes(total);
        })
        .catch(() => {});
    loadWeek();
    const timer = setInterval(loadWeek, 30000);
    return () => clearInterval(timer);
  }, []);
  const createTask = (event) => {
    event.preventDefault();
    const title = newTitle.trim();
    const path = newPath.trim();
    if (!title || !path) return;
    api('studytask.register', { title, workspacePath: path, template: newTemplate })
      .then((result) => {
        const taskId = result && result.id;
        if (taskId && newShelf.length > 0) {
          return api('studytask.materials', { id: taskId, shelfIds: newShelf }).then(() => result);
        }
        return result;
      })
      .then(() => {
        try {
          localStorage.setItem('lpStudyPath', path);
        } catch {
          /* storage may be unavailable */
        }
        setNewTitle(`学习任务 ${dayKey(new Date()).slice(5)}`);
        setNewPath(path);
        setShowNew(false);
        setNewShelf([]);
        return reloadTasks(true);
      })
      .catch((err) => props.onError(err.message));
  };
  const openTask = (task) => {
    setEditingTask(task);
    setTaskForm({ title: task.title, workspacePath: task.workspacePath, template: normalizeTemplate(task.template), grading: task.grading || 'neutral', subjectId: task.subjectId || '' });
    setTaskShelf((task.materials || []).map((one) => one.id));
  };
  const saveTask = () => {
    if (!editingTask) return;
    api('studytask.update', {
      id: editingTask.id,
      patch: {
        title: taskForm.title.trim(),
        workspacePath: taskForm.workspacePath.trim(),
        template: taskForm.template,
        grading: taskForm.grading,
        ...(taskForm.subjectId !== (editingTask.subjectId || '') ? { subjectId: taskForm.subjectId || null } : {}),
      },
    })
      .then(() => api('studytask.materials', { id: editingTask.id, shelfIds: taskShelf }))
      .then(() => {
        setEditingTask(null);
        return reloadTasks(true);
      })
      .catch((err) => props.onError(err.message));
  };
  const addSubject = (event) => {
    event.preventDefault();
    const title = draft.trim();
    if (!title) return;
    setDraft('');
    api('subject.add', { title })
      .then(() => { setShowSubjectAdd(false); return props.onReload(); })
      .catch((err) => props.onError(err.message));
  };


  const taskState = (task) => task.state || (task.doneToday ? 'done' : task.scheduled ? 'todo' : 'doing');
  const active = tasks.filter((task) => taskState(task) === 'doing');
  const done = tasks.filter((task) => taskState(task) === 'done');
  const future = tasks.filter((task) => taskState(task) === 'todo').sort((a, b) =>
    String(a.scheduledAt || '~').localeCompare(String(b.scheduledAt || '~')));
  const taskById = new Map(tasks.map((task) => [task.id, task]));
  const todayKey = studyLocalDayKey();
  const upcoming = data.plan.filter((entry) => !entry.doneAt && entry.date >= todayKey);
  const fail = (error) => props.onError(error.message);
  const change = (method, body, reload) => {
    props.onError('');
    return api(method, body).then(reload).catch(fail);
  };
  const startDrag = (event, kind, id) => {
    drag.current = { kind, id };
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', id);
  };
  const endDrag = () => {
    drag.current = null;
    setDropTarget('');
  };
  const showDrop = (event, key, kind) => {
    if (drag.current?.kind !== kind) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'move';
    setDropTarget(key);
  };
  const readDrop = (event, kind) => {
    if (drag.current?.kind !== kind) return '';
    event.preventDefault();
    event.stopPropagation();
    const id = drag.current.id;
    endDrag();
    return id;
  };
  const dropZone = (key) => ({
    'data-drop': dropTarget === key ? 'inside' : undefined,
    onDragOver: (event) => showDrop(event, key, 'task'),
    onDragLeave: (event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setDropTarget('');
    },
    onDrop: (event) => {
      const task = taskById.get(readDrop(event, 'task'));
      if (!task || taskState(task) === 'done' || (taskState(task) === 'todo') === (key === 'future')) return;
      if (key === 'future') showSchedule(task);
      else change('studytask.schedule', { id: task.id, future: false }, () => reloadTasks(true));
    },
  });
  const showSchedule = (task) => {
    setScheduling(task);
    setStartAt(task.scheduledAt ? toLocalInput(task.scheduledAt) : '');
    setScheduleError('');
  };
  const saveSchedule = (event) => {
    event.preventDefault();
    if (!scheduling) return;
    const task = scheduling;
    const timestamp = startAt ? new Date(startAt).toISOString() : '';
    props.onError('');
    setSavingSchedule(true);
    setScheduleError('');
    api('studytask.schedule', { id: task.id, future: true, startAt: timestamp })
      .then(() => {
        setScheduling(null);
        return reloadTasks(true);
      })
      .catch((error) => setScheduleError(error.message))
      .finally(() => setSavingSchedule(false));
  };

  const sectionTitle = (label, count, action) => h('div', { className: 'lp-study-section-head' },
    h('h3', null, label), h('span', { className: 'lp-study-section-count' }, count), action);
  const editTitle = (value, action) => h('button', {
    type: 'button',
    className: 'lp-title lp-study-task-title',
    title: value + ' · ' + t('studyDoubleClick'),
    onDoubleClick: action,
    onClick: (event) => { if (event.detail === 0) action(); },
  }, value);

  const renderTask = (task) => {
    const state = taskState(task);
    const schedule = state === 'todo' ? (task.scheduledAt ?
      toLocalInput(task.scheduledAt).replace('T', ' ') : t('studyUnscheduledStart')) : null;
    return h('div', {
      key: task.id, className: 'lp-row lp-study-task', 'data-status': state,
      draggable: state !== 'done',
      onDragStart: (event) => startDrag(event, 'task', task.id),
      onDragEnd: endDrag,
    },
      h('span', { className: 'lp-drag-handle', 'aria-hidden': true }, state === 'done' ? '✓' : '⠿'),
      h('div', { className: 'lp-study-task-main' },
        editTitle(task.title, () => openTask(task)),
        h('div', { className: 'lp-study-task-detail lp-meta' },
          schedule || (t('studyNewLabel') + ' ' + (task.answeredNew || 0) + '/' + (task.targetNew || 0) +
            ' · ' + t('studyReviewLabel') + ' ' + (task.answeredReview || 0) + '/' + (task.targetReview || 0)),
          task.missing ? h('span', { className: 'lp-badge' }, t('studyTaskMissing')) : null)),
      h('span', { className: 'lp-actions lp-study-actions' },
        state === 'done' ? null : h('button', {
          className: 'lp-mini', type: 'button', title: t(state === 'todo' ? 'studySetStart' : 'studySchedule'),
          'aria-label': t(state === 'todo' ? 'studySetStart' : 'studySchedule'), onClick: () => showSchedule(task),
        }, '◷'),
        state === 'todo' ? h('button', {
          className: 'lp-mini', type: 'button', title: t('studyStartNow'), 'aria-label': t('studyStartNow'),
          onClick: () => change('studytask.schedule', { id: task.id, future: false }, () => reloadTasks(true)),
        }, '▶') : null,
        h('button', {
          className: 'lp-mini', type: 'button', title: t('studyTaskEdit'), 'aria-label': t('studyTaskEdit'), onClick: () => openTask(task),
        }, '⋯')));
  };
  const moveSubject = (id, anchorId, after) => change('subject.move', { id, anchorId, after }, props.onReload);
  const linkTask = (subjectId, taskId) => change('subject.task', { subjectId, taskId }, () => reloadTasks(true));
  const afterMiddle = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return event.clientY >= bounds.top + bounds.height / 2;
  };
  const toggleSubject = (id) => setCollapsedSubjects((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
  const editSubject = (subject) => {
    setSubjectEditing(subject);
    setSubjectForm({ title: subject.title, examDate: subject.examDate || '', note: subject.note || '' });
  };
  const renderSubject = (subject, index) => {
    const linked = tasks.filter((task) => task.subjectId === subject.id);
    const open = !collapsedSubjects.has(subject.id);
    return h('div', { key: subject.id, className: 'lp-study-subject' },
      h('div', {
        className: 'lp-row lp-study-subject-head',
        draggable: true,
        'data-drop': dropTarget === subject.id + ':before' ? 'before' :
          dropTarget === subject.id + ':after' ? 'after' : dropTarget === subject.id ? 'inside' : undefined,
        onDragStart: (event) => startDrag(event, 'subject', subject.id),
        onDragEnd: endDrag,
        onDragOver: (event) => {
          if (drag.current?.kind === 'task') showDrop(event, subject.id, 'task');
          else if (drag.current?.id !== subject.id) {
            showDrop(event, subject.id + (afterMiddle(event) ? ':after' : ':before'), 'subject');
          }
        },
        onDragLeave: (event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setDropTarget('');
        },
        onDrop: (event) => {
          if (drag.current?.kind === 'task') {
            const id = readDrop(event, 'task');
            if (!id) return;
            setCollapsedSubjects((current) => {
              const next = new Set(current);
              next.delete(subject.id);
              return next;
            });
            linkTask(subject.id, id);
          } else {
            const id = readDrop(event, 'subject');
            if (id && id !== subject.id) moveSubject(id, subject.id, afterMiddle(event));
          }
        },
      },
        h('button', {
          className: 'lp-caret', type: 'button', disabled: !linked.length,
          'data-open': String(open), 'data-empty': String(!linked.length),
          'aria-expanded': open, 'aria-label': t(open ? 'collapseAll' : 'expandAll'),
          onClick: () => toggleSubject(subject.id),
        }, '▾'),
        editTitle(subject.title, () => editSubject(subject)),
        h('span', { className: 'lp-meta' }, linked.length),
        subject.examDate ? h('span', { className: 'lp-meta' }, t('studyExam') + ' ' + subject.examDate) : null,
        h('span', { className: 'lp-actions lp-study-actions' },
          h('button', {
            className: 'lp-mini', type: 'button', title: t('studyMoveUp'), 'aria-label': t('studyMoveUp'),
            disabled: index === 0, onClick: () => moveSubject(subject.id, data.subjects[index - 1].id, false),
          }, '↑'),
          h('button', {
            className: 'lp-mini', type: 'button', title: t('studyMoveDown'), 'aria-label': t('studyMoveDown'),
            disabled: index === data.subjects.length - 1, onClick: () => moveSubject(subject.id, data.subjects[index + 1].id, true),
          }, '↓'),
          h('button', {
            className: 'lp-mini', type: 'button', title: t('studySubjectEdit'), 'aria-label': t('studySubjectEdit'), onClick: () => editSubject(subject),
          }, '⋯'))),
      open && linked.length ? h('div', { className: 'lp-children lp-study-links' },
        linked.map((task) => h('div', { key: task.id, className: 'lp-row lp-study-link', 'data-status': taskState(task) },
          editTitle(task.title, () => openTask(task)),
          h('span', { className: 'lp-meta' }, t('col' + ({ todo: 'Todo', doing: 'Doing', done: 'Done' }[taskState(task)])))))) : null);
  };
  return h(
    'div',
    { className: 'lp-body lp-study-planner' },
    h('div', { className: 'lp-study-planner-grid' },
      h('section', { className: 'lp-card lp-study-section', ...dropZone('active') },
        sectionTitle(t('studyTaskList'), active.length,
          h('button', { className: 'lp-btn', type: 'button', onClick: () => setShowNew(true) }, '+ ' + t('studyTaskAdd'))),
        weekMinutes !== null ? h('div', { className: 'lp-meta lp-study-lane-meta' }, t('studyWeekPlan').replace('{n}', weekMinutes)) : null,
        active.length ? active.map(renderTask) : h('div', { className: 'lp-empty' }, t('studyNoActive'))),
      h('section', { className: 'lp-card lp-study-section', ...dropZone('future') },
        sectionTitle(t('studyUpcoming'), future.length),
        weekMinutes !== null ? h('div', { className: 'lp-meta lp-study-lane-meta lp-study-lane-spacer', 'aria-hidden': true }) : null,
        future.length ? future.map(renderTask) : h('div', { className: 'lp-empty' }, t('studyDropFuture')))),
    h('section', { className: 'lp-card lp-study-section' },
      sectionTitle(t('studySubjects'), data.subjects.length, h('button', {
        className: 'lp-btn-ghost', type: 'button', 'aria-expanded': showSubjectAdd,
        onClick: () => setShowSubjectAdd(!showSubjectAdd),
      }, showSubjectAdd ? t('cancel') : '+ ' + t('studyAddSubject'))),
      showSubjectAdd ? h('form', { className: 'lp-toolbar', onSubmit: addSubject },
        h('input', {
          className: 'lp-input', autoFocus: true, value: draft, placeholder: t('studyAddSubject'), 'aria-label': t('studyAddSubject'),
          onChange: (event) => setDraft(event.target.value),
        }),
        h('button', { className: 'lp-btn', type: 'submit' }, t('addButton'))) : null,
      data.subjects.length ? data.subjects.map(renderSubject) : h('div', { className: 'lp-empty' }, t('studyNoSubject'))),
    done.length ? h('details', { className: 'lp-study-section lp-card' },
      h('summary', null, t('studyTaskDoneToday') + ' · ' + done.length), done.map(renderTask)) : null,
    upcoming.length ? h('details', { className: 'lp-study-section lp-card' },
      h('summary', null, t('studyExistingPlans')),
      upcoming.map((entry) => h('label', { key: entry.id, className: 'lp-study-link' },
        h('span', null, entry.title || data.topics.find((topic) => topic.id === entry.topicId)?.title || entry.kind),
        h('input', {
          type: 'date', className: 'lp-input', value: entry.date,
          onChange: (event) => {
            if (event.target.value) change('plan.move', { id: entry.id, date: event.target.value }, props.onReload);
          },
        })))) : null,
    scheduling ? h(Modal, { title: t('studySetStart') + ' · ' + scheduling.title, onClose: () => setScheduling(null) },
      h('form', { onSubmit: saveSchedule },
        h('label', { className: 'lp-field' }, t('studyStartOptional'), h('input', {
          className: 'lp-input', type: 'datetime-local', value: startAt,
          onChange: (event) => setStartAt(event.target.value),
        })),
        h('p', { className: 'lp-meta' }, t('studyStartHint')),
        scheduleError ? h('p', { className: 'lp-err', role: 'alert' }, scheduleError) : null,
        h('div', { className: 'lp-modal-actions' },
          h('button', { className: 'lp-btn-ghost', type: 'button', onClick: () => setScheduling(null) }, t('cancel')),
          h('button', { className: 'lp-btn', type: 'submit', disabled: savingSchedule }, t('save'))))) : null,
    editingTask
      ? h(
          Modal,
          { title: `${t('studyTaskEdit')} · ${editingTask.title}`, onClose: () => setEditingTask(null) },
            h(
              'div',
              { className: 'lp-field' },
              h('label', null, t('studyTaskTitle')),
              h('input', {
                className: 'lp-input',
                value: taskForm.title,
                onChange: (event) => setTaskForm({ ...taskForm, title: event.target.value }),
              }),
            ),
            h(
              'div',
              { className: 'lp-field' },
              h('label', null, t('studyTaskPath')),
              h('input', {
                className: 'lp-input',
                value: taskForm.workspacePath,
                onChange: (event) => setTaskForm({ ...taskForm, workspacePath: event.target.value }),
              }),
            ),
            h(
              'div',
              { className: 'lp-field' },
              h('label', null, t('studyTaskTemplate')),
              h(Dropdown, {
                value: taskForm.template,
                onChange: (value) => setTaskForm({ ...taskForm, template: value }),
                options: TEMPLATE_OPTIONS,
              }),
            ),

            h('div', { className: 'lp-field' },
              h('label', null, t('studyGrading')),
              h(Dropdown, {
                value: taskForm.grading,
                onChange: (grading) => setTaskForm({ ...taskForm, grading }),
                options: ['strict', 'neutral', 'lenient'].map((value) => ({ value, label: t('studyGrading_' + value) })),
              }),
            ),

            h('div', { className: 'lp-field' },
              h('label', null, t('studySubjects')),
              h(Dropdown, {
                value: taskForm.subjectId,
                onChange: (subjectId) => setTaskForm({ ...taskForm, subjectId }),
                options: [{ value: '', label: t('studyNoSubjectLink') },
                  ...data.subjects.map((subject) => ({ value: subject.id, label: subject.title }))],
              }),
            ),
            h(ShelfPicker, {
              t,
              items: props.shelf,
              selected: taskShelf,
              onChange: setTaskShelf,
            }),
            h(
              'div',
              { className: 'lp-modal-actions' },
              h(
                'button',
                {
                  className: 'lp-btn-ghost',
                  onClick: () => {
                    const id = editingTask.id;
                    if (!window.confirm(t('studyTaskDeleteConfirm'))) return;
                    api('studytask.delete', { id })
                      .then(() => {
                        setEditingTask(null);
                        return reloadTasks(true);
                      })
                      .catch((err) => props.onError(err.message));
                  },
                },
                t('delete'),
              ),
              h('button', { className: 'lp-btn-ghost', onClick: () => setEditingTask(null) }, t('cancel')),
              h('button', { className: 'lp-btn', onClick: saveTask }, t('save')),
            ),
        )
      : null,
    showNew
      ? h(
          Modal,
          { title: t('studyTaskNew'), onClose: () => setShowNew(false) },
            h(
              'div',
              { className: 'lp-field' },
              h('label', null, t('studyTaskTitle')),
              h('input', {
                className: 'lp-input',
                value: newTitle,
                onChange: (event) => setNewTitle(event.target.value),
              }),
            ),
            h(
              'div',
              { className: 'lp-field' },
              h('label', null, t('studyTaskPath')),
              h('input', {
                className: 'lp-input',
                value: newPath,
                onChange: (event) => setNewPath(event.target.value),
              }),
            ),
            h(
              'div',
              { className: 'lp-field' },
              h('label', null, t('studyTaskTemplate')),
              h(Dropdown, {
                value: newTemplate,
                onChange: setNewTemplate,
                options: TEMPLATE_OPTIONS,
              }),
            ),
            h(ShelfPicker, {
              t,
              items: props.shelf,
              selected: newShelf,
              onChange: setNewShelf,
            }),
            h(
              'div',
              { className: 'lp-modal-actions' },
              h('button', { className: 'lp-btn-ghost', onClick: () => setShowNew(false) }, t('cancel')),
              h('button', { className: 'lp-btn', onClick: createTask }, t('studyTaskAdd')),
            ),
        )
      : null,
    subjectEditing
      ? h(
          Modal,
          { title: t('studySubjectEdit'), onClose: () => setSubjectEditing(null) },
            h(
              'div',
              { className: 'lp-field' },
              h('label', null, t('studySubjectTitle')),
              h('input', {
                className: 'lp-input',
                value: subjectForm.title,
                onChange: (event) => setSubjectForm({ ...subjectForm, title: event.target.value }),
              }),
            ),
            h(
              'div',
              { className: 'lp-field' },
              h('label', null, t('studyExamDate')),
              h('input', {
                className: 'lp-input',
                value: subjectForm.examDate,
                placeholder: t('studyExamDateHint'),
                onChange: (event) => setSubjectForm({ ...subjectForm, examDate: event.target.value }),
              }),
            ),
            h(
              'div',
              { className: 'lp-field' },
              h('label', null, t('studyNote')),
              h('input', {
                className: 'lp-input',
                value: subjectForm.note,
                onChange: (event) => setSubjectForm({ ...subjectForm, note: event.target.value }),
              }),
            ),
            h(
              'div',
              { className: 'lp-modal-actions' },
              h('button', { className: 'lp-btn-ghost', onClick: () => setSubjectEditing(null) }, t('cancel')),
              h(
                'button',
                {
                  className: 'lp-btn',
                  onClick: () => {
                    const id = subjectEditing.id;
                    api('subject.update', {
                      id,
                      patch: {
                        title: subjectForm.title.trim(),
                        examDate: subjectForm.examDate.trim(),
                        note: subjectForm.note,
                      },
                    })
                      .then(() => {
                        setSubjectEditing(null);
                        return props.onReload();
                      })
                      .catch((err) => props.onError(err.message));
                  },
                },
                t('save'),
              ),
            ),
        )
      : null,
  );
}

// ---- panels/study-shelf.js ----
function ShelfTab(props) {
  const t = props.t;
  const [kind, setKind] = React.useState('auto');
  const [path, setPath] = React.useState('');
  const [tags, setTags] = React.useState('');
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState({ title: '', path: '', tags: '', note: '' });
  const openEditor = (item) => {
    setEditing(item);
    setForm({
      title: item.title,
      path: item.path,
      tags: (item.tags || []).join(', '),
      note: item.note || '',
    });
  };
  const saveEditor = () => {
    if (!editing) return;
    api('shelf.update', {
      id: editing.id,
      patch: {
        title: form.title.trim(),
        path: form.path.trim(),
        tags: form.tags.split(',').map((entry) => entry.trim()).filter(Boolean),
        note: form.note,
      },
    })
      .then(() => {
        setEditing(null);
        return props.onReload();
      })
      .catch((err) => props.onError(err.message));
  };
  const unlockEditor = () => {
    if (!editing) return;
    api('shelf.update', { id: editing.id, patch: { manual: false } })
      .then(() => {
        setEditing(null);
        return props.onReload();
      })
      .catch((err) => props.onError(err.message));
  };
  const items = props.items || [];
  const add = (event) => {
    event.preventDefault();
    if (!path.trim()) return;
    api('shelf.add', {
      kind,
      path: path.trim(),
      tags: tags.split(',').map((entry) => entry.trim()).filter(Boolean),
    })
      .then(() => {
        setPath('');
        setTags('');
        return props.onReload();
      })
      .catch((err) => props.onError(err.message));
  };
  return h(
    'div',
    { className: 'lp-body' },
    h(
      'form',
      { className: 'lp-toolbar', onSubmit: add },
      h(Dropdown, {
        value: kind,
        onChange: setKind,
        options: [
          { value: 'auto', label: t('shelfAuto') },
          { value: 'dir', label: t('shelfDir') },
          { value: 'file', label: t('shelfFile') },
          { value: 'url', label: t('shelfUrl') },
        ],
      }),
      h('input', {
        className: 'lp-input',
        style: { background: controlSurface(0.45), backdropFilter: 'blur(6px)' },
        value: path,
        placeholder: t('shelfPathHint'),
        onChange: (event) => setPath(event.target.value),
      }),
      h('input', {
        className: 'lp-input',
        value: tags,
        placeholder: t('shelfTagsHint'),
        style: { maxWidth: 160 },
        onChange: (event) => setTags(event.target.value),
      }),
      h('button', { className: 'lp-btn', type: 'submit' }, t('addButton')),
    ),
    items.length === 0
      ? h('div', { className: 'lp-empty' }, t('shelfEmpty'))
      : h(
          'div',
          { className: 'lp-study-grid' },
          items.map((item) =>
            h(
              'div',
              {
                key: item.id,
                className: 'lp-card',
                style: { cursor: 'pointer' },
                title: t('shelfEditHint'),
                onDoubleClick: () => openEditor(item),
              },
              h(
                'div',
                { className: 'lp-card-meta' },
                h('span', { className: 'lp-badge' }, item.kind),
                item.kind === 'url' && !item.fetchedAt
                  ? h('span', { className: 'lp-badge' }, t('shelfNotFetched'))
                  : null,
                item.manual ? h('span', { className: 'lp-badge', title: t('shelfLocked') }, '🔒') : null,
                (item.listing || []).length > 0
                  ? h('span', { className: 'lp-meta' }, `${(item.listing || []).length} ${t('shelfFiles')}`)
                  : null,
                item.truncated
                  ? h('span', { className: 'lp-badge', title: t('shelfTruncatedHint') }, t('shelfTruncated'))
                  : null,
              ),
              h('div', { className: 'lp-card-title', title: item.path }, item.title),
              h(TagChips, { tags: item.tags }),
              h(
                'div',
                { style: { display: 'flex', justifyContent: 'flex-end', gap: 6, width: '100%' } },
                h(
                  'button',
                  {
                    className: 'lp-btn-ghost',
                    onClick: (event) => {
                      event.stopPropagation();
                      props.onOpen(item);
                    },
                  },
                  t('shelfOpen'),
                ),
                h(
                  'button',
                  {
                    className: 'lp-btn-ghost',
                    onClick: (event) => {
                      event.stopPropagation();
                      if (typeof window !== 'undefined' && !window.confirm(t('shelfDeleteAsk'))) return;
                      api('shelf.delete', { id: item.id })
                        .then(props.onReload)
                        .catch((err) => props.onError(err.message));
                    },
                  },
                  t('delete'),
                ),
              ),
            ),
          ),
        ),
    editing
      ? h(
          Modal,
          { title: t('shelfEdit'), onClose: () => setEditing(null) },
            h(
              'div',
              { className: 'lp-field' },
              h('label', null, t('shelfName')),
              h('input', {
                className: 'lp-input',
                value: form.title,
                onChange: (event) => setForm({ ...form, title: event.target.value }),
              }),
            ),
            h(
              'div',
              { className: 'lp-field' },
              h('label', null, t('shelfPath')),
              h('input', {
                className: 'lp-input',
                value: form.path,
                onChange: (event) => setForm({ ...form, path: event.target.value }),
              }),
            ),
            h(
              'div',
              { className: 'lp-field' },
              h('label', null, t('shelfTags')),
              h('input', {
                className: 'lp-input',
                value: form.tags,
                onChange: (event) => setForm({ ...form, tags: event.target.value }),
              }),
            ),
            h(
              'div',
              { className: 'lp-field' },
              h('label', null, t('shelfNote')),
              h('input', {
                className: 'lp-input',
                value: form.note,
                onChange: (event) => setForm({ ...form, note: event.target.value }),
              }),
            ),
            h('div', { className: 'lp-meta' }, editing.manual ? t('shelfLocked') : t('shelfAutoHint')),
            h(
              'div',
              { className: 'lp-modal-actions' },
              editing.manual
                ? h('button', { className: 'lp-btn-ghost', onClick: unlockEditor }, t('shelfUnlock'))
                : null,
              h('button', { className: 'lp-btn-ghost', onClick: () => setEditing(null) }, t('cancel')),
              h('button', { className: 'lp-btn', onClick: saveEditor }, t('save')),
            ),
        )
      : null,
  );
}

// ---- panels/study.js ----
function StudyPanel(props) {
  const t = props.t;
  const [tab, setTab] = React.useState('today');
  const [pageRef, scheme] = usePageScheme();
  const [settings, setSettings] = React.useState(null);
  const [data, setData] = React.useState(null);
  const [shelf, setShelf] = React.useState([]);
  const [mistakes, setMistakes] = React.useState([]);
  const [habits, setHabits] = React.useState(null);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState({ learning: true, shelf: true, mistakes: true, habits: true });
  const markLoaded = (key) => setLoading((state) => (state[key] ? { ...state, [key]: false } : state));
  const loadHabits = () =>
    api('habits')
      .then((next) => {
        setHabits(next);
        markLoaded('habits');
      })
      .catch(() => markLoaded('habits'));
  React.useEffect(() => {
    loadHabits();
    const timer = setInterval(loadHabits, 60000);
    return () => clearInterval(timer);
  }, []);
  const loadLearning = () =>
    api('learning')
      .then((next) => {
        setData(next);
        markLoaded('learning');
      })
      .catch((err) => {
        setError(err.message);
        markLoaded('learning');
      });
  const loadShelf = () =>
    api('shelf')
      .then((next) => {
        setShelf(next);
        markLoaded('shelf');
      })
      .catch((err) => {
        setError(err.message);
        markLoaded('shelf');
      });
  const loadMistakes = () =>
    api('mistakes')
      .then((next) => {
        setMistakes(next);
        markLoaded('mistakes');
      })
      .catch((err) => {
        setError(err.message);
        markLoaded('mistakes');
      });
  React.useEffect(() => {
    loadLearning();
    loadShelf();
    loadMistakes();
  }, []);
  const openShelf = (item) =>
    api('shelf.open', { id: item.id })
      .then((result) => {
        if (result && result.opened === false) {
          setError(
            result.reason === 'missing'
              ? `${t('shelfMissing')}：${result.path}`
              : `${t('shelfOpenFailed')}：${result.path}`,
          );
          return;
        }
        setError('');
      })
      .catch((err) => setError(err.message));
  const tabs = [
    { key: 'today', label: t('studyTabToday') },
    { key: 'plan', label: t('studyTabPlan') },
    { key: 'shelf', label: t('studyTabShelf') },
    { key: 'mistakes', label: t('studyTabMistakes') },
    { key: 'habits', label: t('studyTabHabit') },
  ];
  return h(
    'div',
    {
      className: 'lp-page lp-study',
      ref: pageRef,
      'data-scheme': scheme,
      style: {
        colorScheme: scheme || 'light dark',
        '--lp-tone-low': PRIORITY_TONES[0].color,
        '--lp-tone-medium': PRIORITY_TONES[1].color,
        '--lp-tone-high': PRIORITY_TONES[2].color,
        '--lp-tone-highest': PRIORITY_TONES[3].color,
      },
    },
    h(
      'div',
      { className: 'lp-head' },
      h(
        'div',
        { className: 'lp-tabs' },
        tabs.map((item) =>
          h(
            'button',
            {
              key: item.key,
              className: 'lp-tab',
              'data-active': String(tab === item.key),
              onClick: () => setTab(item.key),
            },
            item.label,
          ),
        ),
      ),
      h('button', { className: 'lp-btn-ghost', type: 'button',
        onClick: () => api('settings').then(setSettings).catch((err) => setError(err.message)) }, t('settings')),
    ),
    error
      ? h('div', { className: 'lp-err', style: { padding: '8px 14px', margin: 0 } }, error)
      : null,
    loading.learning && !data
      ? h('div', { className: 'lp-empty' }, t('loading'))
      : tab === 'today'
        ? h(StudyOverview, { t, data, onReload: loadLearning, onOpenPlan: () => setTab('plan') })
        : null,
    tab === 'plan' ? h(StudyPlanTab, { t, data, shelf, onReload: loadLearning, onError: setError }) : null,
    tab === 'shelf'
      ? loading.shelf && shelf.length === 0
        ? h('div', { className: 'lp-empty' }, t('loading'))
        : h(ShelfTab, { t, items: shelf, onReload: loadShelf, onOpen: openShelf, onError: setError })
      : null,
    tab === 'mistakes'
      ? loading.mistakes && mistakes.length === 0
        ? h('div', { className: 'lp-empty' }, t('loading'))
        : h(MistakeTab, { t, items: mistakes, onReload: loadMistakes, onError: setError })
      : null,
    tab === 'habits'
      ? loading.habits && !habits
        ? h('div', { className: 'lp-empty' }, t('loading'))
        : h(StudyHabitTab, { t, data: habits })
      : null,
    settings ? h(SettingsModal, { t, settings, initialPage: 'appearance',
      onClose: () => setSettings(null), onSaved: () => setSettings(null) }) : null,
  );
}

// ---- app.js ----
return {
  inject: ['slots', 'locale'],
  __internals: { dayKey, groupByDay, monthMatrix, weekMatrix, topTask, openEntries, lunarDateLabel },
  apply(ctx) {
    let t = (key) => DICTS.zh[key] || key;
    try {
      ctx.locale.register(NS, 'zh', DICTS.zh);
      ctx.locale.register(NS, 'en', DICTS.en);
      t = ctx.locale.bind(NS);
    } catch (error) {
      console.error('[life-planner] locale registration failed, falling back to Chinese labels', error);
    }

    const seat = (label, register) => {
      try {
        register();
      } catch (error) {
        console.error(`[life-planner] could not register ${label}`, error);
      }
    };

    // Apply the saved skin and the full appearance model before the first panel.
    seat('skin', () => applySkin(currentSkin()));
    seat('appearance', () => {
      const initial = loadAppearance();
      applyAppearance(initial, { persist: false });
      // Paint first, then warm the images in idle time: a 2 MB photo must never
      // delay the panel. The second one follows the first.
      const warm = () => {
        hydrateBackgrounds(initial, ['planning'])
          .then(() => {
            if (currentAppearance() === initial) return hydrateBackgrounds(initial, ['study']);
          })
          .catch(() => {});
      };
      // The durable appearance lives on the host, so adopt it when it arrives.
      const storedAppearance = api('ui')
        .then((ui) => {
          if (!ui) return;
          setHostUi(ui);
          restoreHostSkin(ui.activeSkin, ui.skinChoice);
          const merged = loadAppearance();
          applyAppearance(merged, { persist: false });
          hydrateBackgrounds(merged).catch(() => {});
        })
        .catch(() => {});
      // Read the stored images the same way the settings dialog does, so the
      // background is live on boot instead of only after opening settings.
      const syncBackgrounds = () =>
        storedAppearance.then(() => api('background.info'))
          .then((info) => {
            if (!info) return;
            setLegacyBackgroundAssets({
              planning: info.assets?.planning || info.planning,
              study: info.assets?.study || info.study,
            });
            migrateSkinProfiles();
            const next = loadAppearance();
            applyAppearance(next, { persist: false });
            hydrateBackgrounds(next).catch(() => {});
          })
          .catch(() => {});
      setTimeout(syncBackgrounds, 50);
      setTimeout(syncBackgrounds, 900);
      if (typeof requestIdleCallback === 'function') requestIdleCallback(warm, { timeout: 1500 });
      else setTimeout(warm, 200);
    });

    const reminderTicker = typeof document !== 'undefined' ? startBackgroundReminders(t) : null;
    if (reminderTicker && typeof ctx.effect === 'function') {
      ctx.effect(() => () => clearInterval(reminderTicker));
    }

    seat('sidebar.panellist', () =>
      ctx.slots.inject('sidebar.panellist', () =>
        ctx.slots.register(
          { name: 'sidebar.panellist', id: 'life-planner', order: 20, label: () => t('navLabel') },
          Icon,
        ),
      ),
    );

    seat('main', () =>
      ctx.slots.inject('main', () =>
        ctx.slots.register({ name: 'main', key: 'life-planner' }, () => h(Panel, { t })),
      ),
    );

    seat('main:study', () =>
      ctx.slots.inject('main', () =>
        ctx.slots.register({ name: 'main', key: 'life-planner-study' }, () =>
          h(StudyPanel, { t }),
        ),
      ),
    );

    seat('sidebar.panellist:study', () =>
      ctx.slots.inject('sidebar.panellist', () =>
        ctx.slots.register(
          { name: 'sidebar.panellist', id: 'life-planner-study', order: 21, label: () => t('studyNav') },
          Icon,
        ),
      ),
    );

    seat('conversation.session.header.utilities', () =>
      ctx.slots.inject('conversation.session.header.utilities', () =>
        ctx.slots.register(
          { name: 'conversation.session.header.utilities', id: 'life-planner-switch', order: -20 },
          (props) => h(SessionSwitch, { t, sessionId: props.sessionId }),
        ),
      ),
    );
  },
};

  },
});
