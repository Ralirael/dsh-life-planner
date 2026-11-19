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
    studyNoTodayPlan: '今天还没有安排',
    studyFinish: '完成',
    studyMistakeReview: '错题复习',
    studyNoMistake: '暂时没有到期的错题',
    studyTaskList: '学习任务',
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
    sectionSize: '尺寸',
    sectionMistake: '错题集',
    fMistakeCols: '每行显示几张（0 = 自动铺满）',
    fMistakeHeight: '卡片高度（0 = 自适应；超出截断）',
    fMistakeTitleFs: '题目字号',
    fMistakeAnswerFs: '正确答案字号',
    fMistakeReasonFs: '错因字号',
    fMistakeHint: '卡片横向铺满页面；高度不足时答案与错因按行截断并显示省略号，双击卡片可查看全文',
    sectionAccent: '分区主题色',
    sectionBackground: '背景图',
    fSurface: '面板透明度',
    fSurfaceHint: '有背景图时，日历与卡片等面板的透明程度；默认 15%',
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
    fCalHeightHint: '0 = 自动填满可用空间；任务行高与标签高度会按字号自动适配',
    fAccentPlanning: '规划分区主题色',
    fAccentStudy: '学习分区主题色',
    fBgPlanning: '规划页背景',
    fBgStudy: '学习页背景',
    fBgImport: '导入图片',
    fBgOpen: '打开背景文件夹',
    fBgClear: '移除背景',
    fBgOpacity: '图片透明度',
    bgSyncAsk: '要把这张背景同时用到学习页吗？',
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
    taskTypeAutoHint: '类别名取自任务树最顶层节点的标题（在「学习」下就是学习），这里只维护类别名与颜色',
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
    fLeadProjectDays: '项目提前天数',
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
    studyNoTodayPlan: 'Nothing planned for today',
    studyFinish: 'Finish',
    studyMistakeReview: 'Mistake review',
    studyNoMistake: 'No mistakes are due',
    studyTaskList: 'Study tasks',
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
    sectionSize: 'Sizes',
    sectionMistake: 'Mistake cards',
    fMistakeCols: 'Cards per row (0 = fill the width)',
    fMistakeHeight: 'Card height (0 = fit content; overflow is clipped)',
    fMistakeTitleFs: 'Question size',
    fMistakeAnswerFs: 'Correct answer size',
    fMistakeReasonFs: 'Reason size',
    fMistakeHint: 'Cards fill the page width; when the height is too small the answer and reason are clamped with an ellipsis. Double-click a card for the full text.',
    sectionAccent: 'Area colours',
    sectionBackground: 'Background image',
    fSurface: 'Panel transparency',
    fSurfaceHint: 'How see-through panels such as the calendar and cards are over a background; 15% by default',
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
    fCalHeightHint: '0 = fill the available space; task row and tag heights follow the font sizes',
    fAccentPlanning: 'Planning accent',
    fAccentStudy: 'Study accent',
    fBgPlanning: 'Planning background',
    fBgStudy: 'Study background',
    fBgImport: 'Import image',
    fBgOpen: 'Open background folder',
    fBgClear: 'Remove background',
    fBgOpacity: 'Image opacity',
    bgSyncAsk: 'Use this background on the study page too?',
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
    fLeadProjectDays: 'Project lead time (days)',
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
.lp-study .lp-tree-row{min-height:var(--lp-row);padding:4px 8px;border-color:transparent;border-radius:var(--lp-r-sm);gap:var(--lp-gap);}
.lp-study .lp-tree-row:hover{background:color-mix(in srgb,var(--dsw-alias-label-primary) 7%,transparent);border-color:transparent;}
.lp-study-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px;margin-top:8px;}
/* Mistakes must never be clipped or push the panel sideways. */
.lp-mistake-grid{grid-template-columns:repeat(var(--lp-mistake-cols,auto-fill),minmax(260px,1fr));}
.lp-mistake-grid .lp-card{min-width:0;max-width:100%;height:var(--lp-mistake-h,auto);overflow:hidden;}
.lp-mistake-grid .lp-card-title{white-space:normal;overflow:visible;text-overflow:clip;overflow-wrap:anywhere;line-height:1.45;font-size:var(--lp-mistake-title-fs,15px);}
.lp-mistake-grid .lp-card-meta{white-space:normal;overflow-wrap:anywhere;}
/* Answer and reason have their own size; clamping only applies when the user
   fixes the card height, otherwise the full text stays visible. */
.lp-mistake-grid .lp-mistake-answer{font-size:var(--lp-mistake-answer-fs,13px);white-space:normal;overflow-wrap:anywhere;}
.lp-mistake-grid .lp-mistake-reason{font-size:var(--lp-mistake-reason-fs,12px);white-space:normal;overflow-wrap:anywhere;}
.lp-mistake-grid[data-fixed="true"] .lp-mistake-title,
.lp-mistake-grid[data-fixed="true"] .lp-mistake-answer,
.lp-mistake-grid[data-fixed="true"] .lp-mistake-reason{display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden;}
.lp-mistake-grid[data-fixed="true"] .lp-mistake-title{-webkit-line-clamp:2;}
.lp-mistake-grid[data-fixed="true"] .lp-mistake-answer{-webkit-line-clamp:3;}
.lp-mistake-grid[data-fixed="true"] .lp-mistake-reason{-webkit-line-clamp:4;}
.lp-body .lp-toolbar .lp-input{min-width:0;}
.lp-mistake-preview{width:min(760px,100%);max-height:80vh;overflow:auto;}
.lp-mistake-preview .lp-pre-block{margin-top:10px;}
.lp-mistake-preview .lp-pre-body{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.6;padding:10px 12px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);}
.lp-bar{display:block;height:8px;min-width:2px;border-radius:4px;background:color-mix(in srgb,var(--dsw-alias-brand-primary) 55%,transparent);}
.lp-dd{position:relative;display:flex;min-width:0;width:100%;}
.lp-dd-btn{width:100%;min-width:0;display:flex;align-items:center;justify-content:space-between;gap:8px;text-align:left;cursor:pointer;}
.lp-dd-value{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.lp-dd-caret{color:var(--dsw-alias-label-secondary);font-size:var(--lp-meta-fs,11px);}
.lp-dd-menu{position:fixed;z-index:70;max-height:240px;overflow:auto;padding:6px;border-radius:12px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);box-shadow:0 12px 32px rgba(0,0,0,.28);display:flex;flex-direction:column;gap:2px;}
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
.lp-menu{position:absolute;right:8px;top:32px;z-index:20;min-width:130px;padding:4px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);box-shadow:0 6px 24px rgba(0,0,0,.18);}
.lp-menu button{display:block;width:100%;text-align:left;padding:6px 10px;border:none;border-radius:6px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;}
.lp-menu button:hover{background:var(--dsw-alias-bg-layer-2);background:color-mix(in srgb,var(--dsw-alias-brand-primary) 14%,transparent);}
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
.lp-pop{position:absolute;z-index:60;left:50%;top:50%;transform:translate(-50%,-50%);width:min(320px,calc(100% - 24px));padding:12px;border-radius:10px;border:1px solid var(--dsw-alias-border-l2);background:var(--lp-modal-bg,var(--lp-surface-bg,var(--dsw-alias-bg-base))) !important;box-shadow:0 10px 30px rgba(0,0,0,.28);display:flex;flex-direction:column;gap:8px;}
.lp-pop-title{font-weight:600;font-size:var(--lp-fs,13px);}
.lp-pop-list{font-size:var(--lp-fs-sm,12px);color:var(--dsw-alias-label-secondary);max-height:180px;overflow:auto;display:flex;flex-direction:column;gap:2px;}
.lp-pop-actions{display:flex;justify-content:flex-end;gap:6px;}
.lp-pop-backdrop{position:absolute;inset:0;z-index:55;}
.lp-board{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;padding:12px;align-items:start;}
.lp-col{display:flex;flex-direction:column;gap:8px;min-width:0;}
.lp-col-head{font-size:var(--lp-title-fs,15px);color:var(--dsw-alias-label-secondary);padding:4px 2px;border-bottom:1px solid var(--dsw-alias-border-l2);}.lp-card{border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:8px;background:var(--lp-surface-bg,var(--dsw-alias-bg-layer-1));cursor:pointer;display:flex;flex-direction:column;gap:4px;align-items:flex-start;}
.lp-card:hover{border-color:var(--dsw-alias-brand-primary);}
.lp-card[data-done="true"]{opacity:.6;}
.lp-card-title{font-size:var(--lp-task-fs,13px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
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
.lp-page .lp-pop{padding:14px;}
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
// Skin layer: presets only override tokens, never layout code.
// Add a preset here and it becomes selectable in settings.
const LP_SKIN_STORAGE = 'lpSkin';

const SKINS = {
  default: { label: '默认' },
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

function currentSkin() {
  try {
    const name = localStorage.getItem(LP_SKIN_STORAGE) || 'default';
    return SKINS[name] ? name : 'default';
  } catch {
    return 'default';
  }
}

function applySkin(name) {
  if (typeof document === 'undefined') return name;
  const skin = SKINS[name] || SKINS.default;
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
  sheet.textContent = body ? `.lp-page{${body}}` : '';
  document.documentElement.dataset.lpSkin = name;
  try {
    localStorage.setItem(LP_SKIN_STORAGE, name);
  } catch {
    // Storage may be unavailable; the skin still applies for this session.
  }
  return name;
}

// ---- appearance.js ----
// Appearance model: fonts, sizes, per-area accents, backgrounds and skins.
// Everything here is presentation state, so it never reaches the host database.
const APPEARANCE_KEY = 'lpAppearance.v1';

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

function setHostUi(ui) {
  HOST_UI = ui && typeof ui === 'object' ? ui : null;
}

function hostAppearance() {
  return HOST_UI && HOST_UI.appearance && typeof HOST_UI.appearance === 'object' ? HOST_UI.appearance : null;
}

let hostSaveTimer = null;

function scheduleHostSave() {
  if (typeof api !== 'function') return;
  if (hostSaveTimer) clearTimeout(hostSaveTimer);
  hostSaveTimer = setTimeout(() => {
    hostSaveTimer = null;
    try {
      api('ui.save', { appearance: loadAppearance(), skins: userSkins() }).catch(() => {});
    } catch {
      // The host copy is best effort; the local cache still holds the state.
    }
  }, 400);
}

function cloneAppearance(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadAppearance() {
  // The built-in defaults above are the baseline; the host copy overlays them.
  const merged = cloneAppearance(APPEARANCE_DEFAULTS);
  // The host copy is the durable one, so it lands before the local cache.
  const host = hostAppearance();
  if (host) {
    for (const section of Object.keys(merged)) {
      if (host[section] === undefined) continue;
      merged[section] =
        typeof merged[section] === 'object' && merged[section] !== null
          ? { ...merged[section], ...host[section] }
          : host[section];
    }
  }
  try {
    const raw = localStorage.getItem(APPEARANCE_KEY);
    if (!raw) return merged;
    const saved = JSON.parse(raw);
    for (const section of Object.keys(merged)) {
      if (saved[section] === undefined) continue;
      if (typeof merged[section] === 'object' && merged[section] !== null) {
        merged[section] = { ...merged[section], ...saved[section] };
      } else {
        merged[section] = saved[section];
      }
    }
  } catch {
    // A corrupt value falls back to defaults rather than breaking the page.
  }
  // Older saves only had an image, so their mode is inferred from the file.
  for (const area of ['planning', 'study']) {
    const layer = merged.background[area] || {};
    merged.background[area] = { ...APPEARANCE_DEFAULTS.background[area], ...layer };
    const next = merged.background[area];
    if (!next.mode || next.mode === 'none') next.mode = next.imageUrl ? 'image' : 'none';
    next.mask = { ...APPEARANCE_DEFAULTS.background[area].mask, ...(layer.mask || {}) };
  }
  return merged;
}

function saveAppearance(value) {
  try {
    localStorage.setItem(APPEARANCE_KEY, JSON.stringify(value));
  } catch (error) {
    console.error('[life-planner] could not persist appearance', error);
  }
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
const BACKGROUND_PENDING = {};

async function hydrateBackgrounds(appearance, onlyAreas) {
  const areas = Array.isArray(onlyAreas) && onlyAreas.length > 0 ? onlyAreas : ['planning', 'study'];
  const tasks = areas.map(async (area) => {
    const layer = appearance && appearance.background && appearance.background[area];
    const url = layer && layer.imageUrl;
    if (!url) return { area, ok: true, skipped: true };
    if (BACKGROUND_SOURCES[area] === url && BACKGROUND_BLOBS[area]) return { area, ok: true, cached: true };
    if (BACKGROUND_PENDING[url]) {
      try {
        await BACKGROUND_PENDING[url];
        return { area, ok: true, cached: true };
      } catch {
        return { area, ok: false };
      }
    }
    const absolute = (() => {
      try {
        const base = (typeof document !== 'undefined' && document.baseURI) || 'http://dsh.internal/'
        return new URL(url, base).toString()
      } catch {
        return url
      }
    })()
    const pending = fetch(absolute).then(async (response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      if (!blob || blob.size === 0) throw new Error('empty image');
      return blob;
    });
    BACKGROUND_PENDING[url] = pending;
    try {
      const blob = await pending;
      if (BACKGROUND_BLOBS[area]) URL.revokeObjectURL(BACKGROUND_BLOBS[area]);
      BACKGROUND_BLOBS[area] = URL.createObjectURL(blob);
      BACKGROUND_SOURCES[area] = url;
      return { area, ok: true };
    } catch (error) {
      console.error('[life-planner] background could not be loaded', area, error);
      return { area, ok: false };
    } finally {
      delete BACKGROUND_PENDING[url];
    }
  });
  const results = await Promise.all(tasks);
  applyAppearance(appearance);
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
  try {
    const probe = document.createElement('span');
    probe.style.cssText = 'position:absolute;left:-9999px;top:-9999px;display:block';
    probe.style.backgroundColor = 'var(--dsw-alias-bg-base)';
    document.body.appendChild(probe);
    const colour = getComputedStyle(probe).backgroundColor;
    probe.remove();
    const match = /^rgba?\(([^)]+)\)$/.exec(colour || '');
    if (!match) return `rgba(24, 26, 32, ${alpha})`;
    const parts = match[1].split(',').map((part) => part.trim())
    const [r, g, b] = parts
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  } catch {
    return `rgba(24, 26, 32, ${alpha})`
  }
}

function applyAppearance(value) {
  if (typeof document === 'undefined') return;
  const appearance = value || loadAppearance();
  CURRENT_APPEARANCE = appearance;
  const { font, size, accent, background } = appearance;
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
  const css = [];
  const px = (value, fallback) => `${Number(value) || fallback}px`;
  css.push(
    `.lp-page{--lp-fs:${px(font.base, 13)};` +
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
      `--lp-mistake-cols:${Number(size.mistakeColumns) > 0 ? Math.min(6, Math.round(Number(size.mistakeColumns))) : 'auto-fill'};` +
      `--lp-mistake-h:${Number(size.mistakeHeight) > 0 ? `${Math.round(Number(size.mistakeHeight))}px` : 'auto'};` +
      // Row and tag heights follow their text instead of being hand-tuned.
      `--lp-row:${Math.round((Number(font.task) || 13) + 17)}px;` +
      `--lp-tag-h:${Math.round((Number(font.tag) || 12) + 10)}px;` +
      `--lp-cal-h:${Number(size.calendarHeight) > 0 ? `${Number(size.calendarHeight)}px` : '420px'};}`,
  );
  if (accent.planning) css.push(`.lp-page:not(.lp-study){--lp-accent:${accent.planning};}`);
  if (accent.study) css.push(`.lp-page.lp-study{--lp-accent:${accent.study};}`);
  for (const area of ['planning', 'study']) {
    const layer = background[area] || {};
    const mask = layer.mask || { on: false };
    const selector = area === 'study' ? '.lp-page.lp-study' : '.lp-page:not(.lp-study)';
    const source = layer.mode === 'image' ? BACKGROUND_BLOBS[area] || layer.imageUrl : '';
    const solid = layer.mode === 'color' && layer.color ? layer.color : '';
    if (!source) {
      // A solid fill still paints, so only the image layers are cleared.
      css.push(
        `${selector}{--lp-bg-image:none;--lp-bg-overlay:none;--lp-bg-fade:none;` +
          `--lp-bg-color:${solid || 'var(--dsw-alias-bg-base)'};` +
          `--lp-surface-bg:${solid ? mix(0) : 'var(--dsw-alias-bg-base)'};` +
          `--lp-control-bg:var(--dsw-alias-bg-layer-1);` +
          `--lp-modal-bg:var(--dsw-alias-bg-base);}`,
      );
      continue;
    }
    // Panels over a background go translucent so the image stays visible.
    const keep = Math.round((1 - Math.min(0.9, Math.max(0, Number(value.surface ?? 0.15)))) * 100);
    // Controls sit on top of panels and are small, so they need a much lighter
    // fill: 45% of the base colour reads as translucent, 85% looks solid.
    const keepControl = 45;
    // `background-image` only accepts images, so a tint must be a gradient:
    // a bare colour there invalidates the whole declaration.
    const tint = mix(Math.round((1 - layer.opacity) * 100));
    const overlay = `linear-gradient(${tint}, ${tint})`;
    const fade = maskGradient(mask);
    css.push(
      `${selector}{--lp-surface-bg:color-mix(in srgb, var(--dsw-alias-bg-base) ${keep}%, transparent);` +
        `--lp-control-bg:color-mix(in srgb, var(--dsw-alias-bg-base) ${keepControl}%, transparent);` +
        // Dialogs stay almost opaque so the page behind cannot distract reading or input.
        `--lp-modal-bg:color-mix(in srgb, var(--dsw-alias-bg-base) 97%, transparent);` +
        `--lp-bg-color:var(--dsw-alias-bg-base);--lp-bg-image:url("${source}");--lp-bg-overlay:${overlay};--lp-bg-fade:${fade};}`,
    );
  }
  sheet.textContent = css.join('\n');
  document.documentElement.dataset.lpAccent = accent.planning || accent.study ? 'custom' : 'default';
  saveAppearance(appearance);
  scheduleHostSave();
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
// One-time clean-up requested by the user: keep only the default skin.
const USER_SKINS_RESET_KEY = 'lpUserSkins.reset.v2';

function userSkins() {
  try {
    const host = HOST_UI && HOST_UI.skins && typeof HOST_UI.skins === 'object' ? HOST_UI.skins : {};
    if (!localStorage.getItem(USER_SKINS_RESET_KEY)) {
      localStorage.removeItem(USER_SKINS_KEY);
      localStorage.setItem(USER_SKINS_RESET_KEY, '1');
      return host;
    }
    const local = JSON.parse(localStorage.getItem(USER_SKINS_KEY) || '{}');
    return { ...host, ...(local && typeof local === 'object' ? local : {}) };
  } catch {
    return {};
  }
}

function listSkinOptions() {
  // Only the default skin is built in; everything else is user-saved.
  const options = [{ value: 'builtin:default', label: skinLabel('default') || '默认' }];
  for (const name of Object.keys(userSkins())) options.push({ value: `user:${name}`, label: name });
  return options;
}

function saveUserSkin(name) {
  const clean = String(name || '').trim().slice(0, 24);
  if (!clean) throw new Error('empty skin name');
  const skins = userSkins();
  skins[clean] = { appearance: loadAppearance(), skin: currentSkin() };
  localStorage.setItem(USER_SKINS_KEY, JSON.stringify(skins));
  scheduleHostSave();
  return clean;
}

function deleteUserSkin(name) {
  // The default skin is built in and must stay selectable.
  if (String(name) === 'default') return false;
  const skins = userSkins();
  if (!skins[name]) return false;
  delete skins[name];
  localStorage.setItem(USER_SKINS_KEY, JSON.stringify(skins));
  scheduleHostSave();
  return true;
}

function applySkinChoice(value) {
  const [kind, name] = String(value || '').split(':');
  if (kind === 'user') {
    const entry = userSkins()[name];
    if (!entry) return loadAppearance();
    applySkin(entry.skin || 'default');
    const merged = cloneAppearance(APPEARANCE_DEFAULTS);
    for (const section of Object.keys(merged)) {
      if (entry.appearance && entry.appearance[section] !== undefined) {
        merged[section] = { ...merged[section], ...entry.appearance[section] };
      }
    }
    applyAppearance(merged);
    return merged;
  }
  applySkin(name || 'default');
  return loadAppearance();
}


function exportAppearance() {
  return JSON.stringify({ version: 1, appearance: loadAppearance() }, null, 2);
}

function importAppearance(text) {
  const parsed = JSON.parse(text);
  const incoming = parsed && parsed.appearance ? parsed.appearance : parsed;
  if (!incoming || typeof incoming !== 'object') throw new Error('invalid appearance file');
  const merged = cloneAppearance(APPEARANCE_DEFAULTS);
  for (const section of Object.keys(merged)) {
    if (incoming[section] === undefined) continue;
    merged[section] = { ...merged[section], ...incoming[section] };
  }
  applyAppearance(merged);
  return merged;
}

// ---- helpers.js ----
// helpers.js — shared helpers for the panels and views.
function pageScheme() {
  try {
    const probe = document.createElement('span');
    probe.style.color = 'var(--dsw-alias-label-primary)';
    probe.style.display = 'none';
    document.body.appendChild(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    const match = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(color);
    if (!match) return 'light dark';
    const luminance = (Number(match[1]) * 299 + Number(match[2]) * 587 + Number(match[3]) * 114) / 1000;
    return luminance > 128 ? 'light' : 'dark';
  } catch {
    return 'light dark';
  }
}
const pad = (value) => String(value).padStart(2, '0');

function dayKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
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
  if (!item.dueAt) return '';
  const date = new Date(item.dueAt);
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

const colorOfName = (name, overrides) => {
  if (overrides && overrides[name]) return overrides[name];
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
    if (!item.dueAt) continue;
    const date = new Date(item.dueAt);
    if (Number.isNaN(date.getTime())) continue;
    const key = dayKey(date);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  for (const list of map.values()) {
    list.sort((a, b) => {
      const rank = priorityOf(b) - priorityOf(a);
      if (rank !== 0) return rank;
      return String(a.dueAt).localeCompare(String(b.dueAt));
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

function useAnchoredMenu(config) {
  const options = React.useRef(config);
  options.current = config;
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState(null);
  const [active, setActive] = React.useState(-1);
  const [menuId] = React.useState(() => `lp-menu-${(anchoredMenuSeq += 1)}`);
  const anchorRef = React.useRef(null);

  const measure = () => {
    const node = anchorRef.current;
    if (!node || typeof window === 'undefined') return null;
    const current = options.current || {};
    const count = Number(current.count) || 0;
    const rect = node.getBoundingClientRect();
    const width = Math.max(rect.width, Number(current.minWidth) || 190);
    const height = Math.min(
      Number(current.maxHeight) || 240,
      count * (Number(current.itemHeight) || 34) + 12,
    );
    const left = Math.min(Math.max(8, rect.left), Math.max(8, window.innerWidth - width - 8));
    const below = rect.bottom + 4;
    const top = below + height + 8 <= window.innerHeight ? below : Math.max(8, rect.top - height - 4);
    return { left, top, width };
  };

  const show = () => {
    const current = options.current || {};
    const next = measure();
    if (next) setPos(next);
    const count = Number(current.count) || 0;
    const start = Number(current.activeIndex);
    setActive(Number.isInteger(start) && start >= 0 && start < count ? start : -1);
    setOpen(true);
  };

  const hide = () => {
    setOpen(false);
    setActive(-1);
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
      if (!next) return;
      setPos((previous) =>
        previous && previous.left === next.left && previous.top === next.top && previous.width === next.width
          ? previous
          : next,
      );
    };
    place();
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [open]);

  return {
    open,
    pos,
    active,
    anchorRef,
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
          h('div', { className: 'lp-pop-backdrop', onClick: menu.hide }),
          h(
            'div',
            {
              className: 'lp-dd-menu',
              role: 'listbox',
              id: menu.menuId,
              tabIndex: -1,
              style: { left: menu.pos.left, top: menu.pos.top, width: menu.pos.width },
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
          style: { color: colorOfName(tag, props.colorOverrides), border: `1px solid ${colorOfName(tag, props.colorOverrides)}` },
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
// Reminders must keep firing while the page is open even if the planner
// panel is not the visible one, so the poller lives outside the component.
// The mounted panel owns delivery (toast list, throttled system notifications,
// ack); this module only decides when to ask the host for a new batch.
const background = { listeners: new Set() };

const describeReminder = (note, t) => {
  const title = note.kind === 'long' ? t('notifyLong') : t('notifyShort');
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

// Ask the host once and hand the whole batch to every mounted panel. The ack is
// the panel's job, so a batch that arrives while no panel is mounted simply
// stays queued on the host and is delivered again on the next poll.
const pullReminders = () => {
  if (typeof document === 'undefined') return;
  api('notifications')
    .then((list) => {
      if (!Array.isArray(list) || list.length === 0) return;
      for (const listener of Array.from(background.listeners)) {
        try {
          listener(list);
        } catch {
          // One broken panel must not stop the reminder loop.
        }
      }
    })
    .catch(() => {});
};

const startBackgroundReminders = () => {
  pullReminders();
  return setInterval(pullReminders, 30000);
};

// ---- api.js ----
// api.js — generated from the original single-file client; edit here, then run node build-client.mjs.
// Requests are retried on transport and 5xx failures, de-duplicated per GET and
// bounded in time so a hung socket can never freeze a panel.
const API_TIMEOUT_MS = 15000;
const API_INFLIGHT = new Map();

function api(method, body) {
  const key = body === undefined ? `GET ${method}` : '';
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
    if (item.derived.done) buckets.done.push(item);
    else if (displayBlockers(item, byId, props.items).length > 0) buckets.blocked.push(item);
    else if (item.status === 'doing') buckets.doing.push(item);
    else buckets.todo.push(item);
  }
  for (const list of Object.values(buckets)) {
    list.sort(
      (a, b) =>
        Number(isOverdue(b)) - Number(isOverdue(a)) ||
        priorityOf(b) - priorityOf(a) ||
        String(a.dueAt || '~').localeCompare(String(b.dueAt || '~')),
    );
  }
  const columns = [
    { key: 'todo', label: t('colTodo') },
    { key: 'doing', label: t('colDoing') },
    { key: 'blocked', label: t('colBlocked') },
    { key: 'done', label: t('colDone') },
  ];
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
    ),
    columns.map((column) =>
      h(
        'div',
        { key: column.key, className: 'lp-col' },
        h('div', { className: 'lp-col-head' }, `${column.label} · ${buckets[column.key].length}`),
        buckets[column.key].map((item) =>
          h(
            'div',
            {
              key: item.id,
              className: 'lp-card',
              tabIndex: 0,
              role: 'button',
              'data-done': String(item.derived.done),
              style: { borderLeft: `3px solid ${toneOf(item.priority).color}` },
              onClick: () => props.onEdit(item),
              onKeyDown: keyActivate(() => props.onEdit(item)),
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
      ),
    ),
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
  const calById = new Map(items.map((item) => [item.id, item]));
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
      displayBlockers(item, calById, items).length > 0
        ? h('span', { className: 'lp-badge' }, t('blocked'))
        : null,
      item.dueAt
        ? h('span', { className: 'lp-meta', 'data-overdue': String(isOverdue(item)) }, timeLabel(item))
        : null,
    );
  const cells = monthMatrix(anchor);
  const week = weekMatrix(selectedKey);
  const labels = weekdayLabels(t);
  const todayKey = dayKey(new Date());

  // The month fills whatever height the panel gives us, leaving a strip of
  // the day list visible so it is obvious there is more below.
  React.useEffect(() => {
    const node = scrollRef.current;
    if (!node) return undefined;
    const measure = () => {
      const height = Math.round(node.clientHeight || 0);
      if (height <= 0) return;
      const room = Math.max(320, height - 150);
      const configured = Number(((currentAppearance().size || {}).calendarHeight) || 0);
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
              (!item.dueAt || isOverdue(item)),
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
    { className: 'lp-cal-scroll', ref: scrollRef, onScroll, onWheel },
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
            h('strong', { style: { fontSize: 13 } }, String(cell.day)),
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
      { className: 'lp-day', style: { minHeight: expanded } },
      h(
        'div',
        { className: 'lp-day-title' },
        h(
          'span',
          null,
          `${t('dayLabel').replace('{m}', String(selectedDate.getMonth() + 1)).replace('{d}', String(selectedDate.getDate()))} · ${labels[(selectedDate.getDay() + 6) % 7]}`,
        ),
        h('span', { className: 'lp-day-sub' }, t('itemsCount').replace('{n}', String(openCount))),
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
            if (node && node.scrollTop < 48) node.scrollTo({ top: 48, behavior: 'smooth' });
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
    if (filter === 'blocked') return displayBlockers(item, byId, items).length > 0;
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
    const blockers = blockersOf(item);
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
          : null,
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
              onClick: (event) => {
                event.stopPropagation();
                setSelectedId(item.id);
                setMenuFor(menuFor === item.id ? '' : item.id);
              },
            },
            '⋯',
          ),
        ),
      ),
      menuFor === item.id
        ? h(
            'div',
            { className: 'lp-menu' },
            h('button', { onClick: () => { setMenuFor(''); props.onEdit(item); } }, t('edit')),
            item.kind === 'task'
              ? h(
                  'button',
                  {
                    onClick: (event) => {
                      setMenuFor('');
                      props.onToggle(item, !item.derived.done, event);
                    },
                  },
                  item.derived.done ? t('markUndone') : t('markDone'),
                )
              : null,
            h('button', { onClick: () => { setMenuFor(''); setRenaming({ id: item.id, value: item.title }); } }, t('rename')),
            h('button', { onClick: () => { setMenuFor(''); props.onReorder(item, 'up'); } }, t('moveUp')),
            h('button', { onClick: () => { setMenuFor(''); props.onReorder(item, 'down'); } }, t('moveDown')),
            item.parentId
              ? h('button', { onClick: () => { setMenuFor(''); props.onOutdent(item); } }, t('outdent'))
              : null,
            h('button', { onClick: (event) => { setMenuFor(''); remove(item, event); } }, t('delete')),
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
    const payload = {
      title: title.trim(),
      kind,
      parentId: parentId || null,
      dueAt: fromLocalInput(due),
      startAt: fromLocalInput(start),
      location: location.trim() || null,
      priority: kind === 'task' ? priority : null,
      note,
      tags,
      taskType: taskType || null,
      recurrence: freq ? { freq } : null,
    };
    const request = isNew
      ? api('item.add', payload).then((created) =>
          kind === 'task' && deps.size > 0
            ? api('item.depends', { id: created.id, dependsOn: Array.from(deps) })
            : created,
        )
      : api('item.update', { id: item.id, patch: payload }).then(() =>
          api('item.depends', { id: item.id, dependsOn: kind === 'task' ? Array.from(deps) : [] }),
        );
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
      kind === 'task'
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
                      style: { color: colorOfName(tag, props.colorOverrides) },
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
      !isNew && kind === 'task'
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
        : null,
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
function SettingsModal(props) {
  const t = props.t;
  const [form, setForm] = React.useState(props.settings || {});
  React.useEffect(() => {
    if (props.settings) setForm(props.settings);
  }, [props.settings]);
  const [appearance, setAppearance] = React.useState(() => loadAppearance());
  const [page, setPage] = React.useState('tags');
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [permission, setPermission] = React.useState(
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission,
  );
  const [feedback, setFeedback] = React.useState('');
  const [typesText, setTypesText] = React.useState(((props.settings || {}).taskTypes || []).join(', '));
  const [tagsText, setTagsText] = React.useState(((props.settings || {}).tags || []).join(', '));
  const [tagDraft, setTagDraft] = React.useState('');
  const [selectedTag, setSelectedTag] = React.useState('');
  const [tagLibDraft, setTagLibDraft] = React.useState('');
  const [selectedTagLib, setSelectedTagLib] = React.useState('');
  const [studyMode, setStudyMode] = React.useState(true);
  const [skinChoice, setSkinChoice] = React.useState(() => `builtin:${currentSkin()}`);
  const [skinName, setSkinName] = React.useState('');
  React.useEffect(() => {
    // Plugin-level switches live in the plugin manager; read them for gating only.
    api('config')
      .then((next) => {
        setStudyMode(next.studyMode !== false);
      })
      .catch(() => {});
    // Mirror the notification preference for the background reminder loop.
    try {
      const savedNotify = (props.settings || {}).systemNotify;
      if (savedNotify !== undefined) localStorage.setItem('lpSystemNotify', savedNotify === false ? 'off' : 'on');
    } catch {}
    // The host owns the files, so its answer wins over a stale local URL.
    api('background.info')
      .then((info) => {
        setAppearance((current) => {
          const next = {
            ...current,
            background: {
              planning: {
                ...current.background.planning,
                imageUrl: info.planning || current.background.planning.imageUrl || '',
              },
              study: { ...current.background.study, imageUrl: info.study || current.background.study.imageUrl || '' },
            },
          };
          applyAppearance(next);
          const areasWithImage = ['planning', 'study'].filter((area) => next.background[area] && next.background[area].imageUrl);
          hydrateBackgrounds(next, areasWithImage).catch(() => {});
          return next;
        });
      })
      .catch(() => {});
  }, []);
  const fileRef = React.useRef(null);
  const skinRef = React.useRef(null);
  const bgPlanningRef = React.useRef(null);
  const bgStudyRef = React.useRef(null);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const setAppear = (patch) => setAppearance((current) => ({ ...current, ...patch }));

  const textField = (key, label) =>
    h(
      'div',
      { className: 'lp-field' },
      h('label', null, label),
      h('input', {
        className: 'lp-input',
        value: form[key] ?? '',
        onChange: (event) => set(key, event.target.value),
      }),
    );

  const numberField = (key, label) =>
    h(
      'div',
      { className: 'lp-field' },
      h('label', null, label),
      h('input', {
        className: 'lp-input',
        type: 'number',
        value: form[key] ?? 0,
        onChange: (event) => set(key, Number(event.target.value)),
      }),
    );

  const parseList = (text) =>
    text
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);

  const colorOverrides = form.colorOverrides || {};
  const setColor = (name, color) => set('colorOverrides', { ...colorOverrides, [name]: color });
  const clearColor = (name) => {
    const next = { ...colorOverrides };
    delete next[name];
    set('colorOverrides', next);
  };

  const colorSwatches = (name) =>
    h(
      'div',
      { className: 'lp-field' },
      h('label', null, `${t('tagColor')} · ${name}`),
      h(
        'div',
        { className: 'lp-swatch-panel' },
        PALETTE.map((color) =>
          h('button', {
            key: color,
            type: 'button',
            className: 'lp-swatch',
            'data-active': String((colorOverrides[name] || colorOfName(name, colorOverrides)) === color),
            style: { background: color },
            onClick: () => setColor(name, color),
          }),
        ),
        h('button', { className: 'lp-btn-ghost', type: 'button', onClick: () => clearColor(name) }, t('colorReset')),
      ),
    );

  const addTag = () => {
    const name = tagDraft.trim();
    if (!name) return;
    const list = parseList(typesText);
    if (!list.includes(name)) {
      setTypesText([...list, name].join(', '));
      const color = PALETTE[list.length % PALETTE.length];
      setColor(name, color);
    }
    setSelectedTag(name);
    setTagDraft('');
  };

  const addTagLib = () => {
    const name = tagLibDraft.trim();
    if (!name) return;
    const list = parseList(tagsText);
    if (!list.includes(name)) {
      setTagsText([...list, name].join(', '));
      const color = PALETTE[list.length % PALETTE.length];
      setColor(name, color);
    }
    setSelectedTagLib(name);
    setTagLibDraft('');
  };

  const removeType = (name) => {
    setTypesText(parseList(typesText).filter((entry) => entry !== name).join(', '));
    setSelectedTag('');
  };

  const removeTagLib = (name) => {
    setTagsText(parseList(tagsText).filter((entry) => entry !== name).join(', '));
    setSelectedTagLib('');
  };

  const save = () => {
    const weekday = parseWindowsText(form.weekdayWindows);
    const weekend = parseWindowsText(form.weekendWindows);
    if (weekday === null || weekend === null) {
      setError(t('invalidWindows'));
      return;
    }
    setBusy(true);
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
      taskTypes: parseList(typesText),
      tags: parseList(tagsText),
      colorOverrides,
    };
    api('settings.save', { patch })
      .then((data) => {
        applyAppearance(appearance);
        props.onSaved(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setBusy(false));
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

  const testNotify = () => {
    if (typeof Notification === 'undefined') {
      report('unsupported');
      return;
    }
    try {
      new Notification(t('noticeTitle'), { body: t('notifyTestBody') });
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
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      api('background.set', { area, dataUrl })
        .then((saved) => {
          const next = {
            ...appearance,
            background: {
              ...appearance.background,
              [area]: { ...appearance.background[area], imageUrl: saved.url },
            },
          };
          if (area === 'planning' && window.confirm(t('bgSyncAsk'))) {
            return api('background.set', { area: 'study', dataUrl }).then((studySaved) => {
              next.background.study = { ...next.background.study, imageUrl: studySaved.url };
              return next;
            });
          }
          return next;
        })
        .then((next) => {
          setAppearance(next);
          // Only the area that just changed needs its bytes.
          return hydrateBackgrounds(next, [area]).then((result) => {
            if (result.failed.length > 0) setError(t('bgLoadFailed'));
            else setError('');
          });
        })
        .catch((err) => setError(err.message));
    };
    reader.readAsDataURL(file);
  };

  const clearBackground = (area) => {
    api('background.clear', { area })
      .then(() => {
        const next = {
          ...appearance,
          background: { ...appearance.background, [area]: { ...appearance.background[area], imageUrl: '' } },
        };
        setAppearance(next);
        applyAppearance(next);
      })
      .catch((err) => setError(err.message));
  };

  const setBackgroundLayer = (area, patch) => {
    const layer = appearance.background[area];
    const next = {
      ...appearance,
      background: {
        ...appearance.background,
        [area]: { ...layer, ...patch, mask: { ...(layer.mask || {}), ...(patch.mask || {}) } },
      },
    };
    setAppearance(next);
    applyAppearance(next);
  };

  const chooseSkin = (value) => {
    const next = applySkinChoice(value);
    setSkinChoice(value);
    setAppearance(next);
    hydrateBackgrounds(next).catch(() => {});
  };

  const saveCurrentSkin = () => {
    const name = String(skinName || '').trim();
    if (!name) {
      setFeedback(t('skinNameRequired'));
      return;
    }
    try {
      const saved = saveUserSkin(name);
      setSkinChoice(`user:${saved}`);
      setSkinName('');
      setFeedback(t('skinSaved'));
    } catch (err) {
      setError(err.message);
    }
  };


  const removeCurrentSkin = () => {
    const name = skinChoice.slice(5);
    if (!deleteUserSkin(name)) return;
    setSkinChoice(`builtin:${currentSkin()}`);
    setFeedback(t('skinDeleted'));
  };

  const setFont = (key, value) => {
    const fallback = Number((APPEARANCE_DEFAULTS.font || {})[key]) || 13;
    const next = { ...appearance, font: { ...appearance.font, [key]: Number(value) || fallback } };
    setAppearance(next);
    applyAppearance(next);
  };

  const setSize = (key, value) => {
    const next = { ...appearance, size: { ...appearance.size, [key]: Number(value) || 0 } };
    setAppearance(next);
    applyAppearance(next);
  };

  const setAccent = (area, value) => {
    const next = { ...appearance, accent: { ...appearance.accent, [area]: value } };
    setAppearance(next);
    applyAppearance(next);
  };

  const numberInput = (key, label, value, onChange) =>
    h(
      'div',
      { className: 'lp-field' },
      h('label', null, label),
      h('input', {
        className: 'lp-input',
        type: 'number',
        value,
        onChange: (event) => onChange(key, event.target.value),
      }),
    );

  const backgroundFields = (area) => {
    const layer = appearance.background[area];
    const mask = layer.mask || {};
    const inputRef = area === 'study' ? bgStudyRef : bgPlanningRef;
    const setLayer = (patch) => setBackgroundLayer(area, patch);
    return h(
      'div',
      { className: 'lp-field' },
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


  const tagsPage = () => {
    const tags = parseList(typesText);
    return h(
      'div',
      { className: 'lp-settings-body' },
      h('div', { className: 'lp-form-section' }, t('sectionTags')),
      h(
        'div',
        { className: 'lp-toolbar' },
        h('input', {
          className: 'lp-input',
          value: tagDraft,
          placeholder: t('tagNamePlaceholder'),
          onChange: (event) => setTagDraft(event.target.value),
        }),
        h('button', { className: 'lp-btn', type: 'button', onClick: addTag }, t('addTag')),
      ),
      tags.length === 0
        ? h('div', { className: 'lp-meta' }, t('noTags'))
        : h(
            'div',
            { className: 'lp-field' },
            h('label', null, t('existingTags')),
            h(Dropdown, {
              value: selectedTag || tags[0],
              onChange: setSelectedTag,
              options: tags.map((name) => ({ value: name, label: name })),
            }),
            colorSwatches(selectedTag || tags[0]),
            h(
              'button',
              { className: 'lp-btn-ghost', type: 'button', onClick: () => removeType(selectedTag || tags[0]) },
              t('delete'),
            ),
          ),
      h('div', { className: 'lp-meta' }, t('taskTypeAutoHint')),
      h('div', { className: 'lp-form-section' }, t('sectionTagLibrary')),
      h(
        'div',
        { className: 'lp-toolbar' },
        h('input', {
          className: 'lp-input',
          value: tagLibDraft,
          placeholder: t('tagLibName'),
          onChange: (event) => setTagLibDraft(event.target.value),
        }),
        h('button', { className: 'lp-btn', type: 'button', onClick: addTagLib }, t('tagLibAdd')),
      ),
      (() => {
        const tagList = parseList(tagsText);
        if (tagList.length === 0) return h('div', { className: 'lp-meta' }, t('tagLibEmpty'));
        const active = tagList.includes(selectedTagLib) ? selectedTagLib : tagList[0];
        return h(
          'div',
          { className: 'lp-field' },
          h('label', null, t('tagLibExisting')),
          h(Dropdown, {
            value: active,
            onChange: setSelectedTagLib,
            options: tagList.map((name) => ({ value: name, label: name })),
          }),
          colorSwatches(active),
          h(
            'button',
            { className: 'lp-btn-ghost', type: 'button', onClick: () => removeTagLib(active) },
            t('delete'),
          ),
        );
      })(),
    );
  };

  const generalPage = () =>
    h(
      'div',
      { className: 'lp-settings-body' },
      h('div', { className: 'lp-form-section' }, t('sectionData')),
      h(
        'div',
        { className: 'lp-field' },
        h('label', null, t('importData')),
        h(
          'div',
          { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
          h('button', { className: 'lp-btn-ghost', type: 'button', onClick: doExport }, t('exportData')),
          h(
            'button',
            { className: 'lp-btn-ghost', type: 'button', onClick: () => fileRef.current && fileRef.current.click() },
            t('importData'),
          ),
          h('input', { ref: fileRef, type: 'file', accept: 'application/json', style: { display: 'none' }, onChange: doImport }),
        ),
      ),
      h('div', { className: 'lp-meta' }, t('generalHint')),
    );

  const notifyPage = () =>
    h(
      'div',
      { className: 'lp-settings-body' },
      h('div', { className: 'lp-form-section' }, t('sectionNotify')),
      h(
        'div',
        { className: 'lp-field' },
        // The slider sits right after its label instead of being pushed to the
        // end of the row.
        h(
          'div',
          { className: 'lp-switch-inline' },
          h('label', null, t('fSystemNotify')),
          h(Switch, {
            value: form.systemNotify !== false,
            onChange: (next) => {
              set('systemNotify', next);
              try {
                localStorage.setItem('lpSystemNotify', next ? 'on' : 'off');
              } catch {}
            },
          }),
        ),
        h('div', { className: 'lp-meta' }, t('fSystemNotifyHint')),
        // Test and permission live with the switch; no second enable button.
        h(
          'div',
          { className: 'lp-toolbar', style: { marginTop: 6 } },
          h('button', { className: 'lp-btn-ghost', type: 'button', onClick: testNotify }, t('notifyTest')),
          permission === 'granted'
            ? null
            : h('button', { className: 'lp-btn-ghost', type: 'button', onClick: askPermission }, t('enableNotify')),
          h('span', { className: 'lp-meta' }, t('notifyState').replace('{s}', permission)),
        ),
        feedback ? h('div', { className: 'lp-meta' }, feedback) : null,
      ),
      textField('weekdayWindows', t('fWeekdayWindows')),
      textField('weekendWindows', t('fWeekendWindows')),
      h(
        'div',
        { className: 'lp-row2' },
        numberField('notifyGapMinutes', t('fGapMinutes')),
        numberField('nonUrgentQuotaPerWindow', t('fQuota')),
      ),
      h(
        'div',
        { className: 'lp-row2' },
        numberField('maxRemindersPerWindow', t('fMaxPerWindow')),
        numberField('maxDeferHours', t('fMaxDefer')),
      ),
      h(
        'div',
        { className: 'lp-row2' },
        numberField('leadTaskDays', t('fLeadTaskDays')),
        numberField('leadProjectDays', t('fLeadProjectDays')),
      ),
      numberField('longTermReminderHours', t('fLongTermHours')),
      h('div', { className: 'lp-form-section' }, t('sectionTask')),
      h(
        'div',
        { className: 'lp-row2' },
        numberField('archiveAfterDays', t('fArchiveDays')),
        numberField('deleteAfterDays', t('fDeleteDays')),
      ),
    );

  const appearancePage = () =>
    h(
      'div',
      { className: 'lp-settings-body' },
      h('div', { className: 'lp-form-section' }, t('sectionSkin')),
      h(
        'div',
        { className: 'lp-field' },
        h('label', null, t('fSkinPreset')),
        h(Dropdown, {
          value: skinChoice,
          onChange: chooseSkin,
          options: listSkinOptions(),
        }),
        h(
          'div',
          { className: 'lp-toolbar', style: { marginTop: 6 } },
          h('input', {
            className: 'lp-input',
            value: skinName,
            placeholder: t('skinNamePlaceholder'),
            onChange: (event) => setSkinName(event.target.value),
          }),
          h('button', { className: 'lp-btn', type: 'button', onClick: saveCurrentSkin }, t('skinSaveAs')),
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
              onClick: () => {
                const blob = new Blob([exportAppearance()], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `life-planner-skin-${new Date().toISOString().slice(0, 10)}.json`;
                document.body.appendChild(link);
                link.click();
                link.remove();
                URL.revokeObjectURL(url);
              },
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
              file
                .text()
                .then((text) => {
                  const next = importAppearance(text);
                  setAppearance(next);
                  hydrateBackgrounds(next).catch(() => {});
                  setFeedback(t('skinImported'));
                })
                .catch((err) => setError(err.message));
            },
          }),
        ),
      ),

      h('div', { className: 'lp-form-section' }, t('sectionFont')),
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
      h('div', { className: 'lp-meta' }, t('fFontHint')),
      h('div', { className: 'lp-form-section' }, t('sectionSize')),
      h(
        'div',
        { className: 'lp-setting-grid' },
        numberInput('calendarHeight', t('fCalHeight'), appearance.size.calendarHeight, setSize),
      ),
      h('div', { className: 'lp-meta' }, t('fCalHeightHint')),
      h('div', { className: 'lp-form-section' }, t('sectionMistake')),
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
      h('div', { className: 'lp-meta' }, t('fMistakeHint')),
      h('div', { className: 'lp-form-section' }, t('sectionAccent')),
      h(
        'div',
        { className: 'lp-row2' },
        h(
          'div',
          { className: 'lp-field' },
          h('label', null, t('fAccentPlanning')),
          h('input', {
            className: 'lp-input',
            type: 'color',
            value: appearance.accent.planning || '#4f7cff',
            onChange: (event) => setAccent('planning', event.target.value),
          }),
        ),
        h(
          'div',
          { className: 'lp-field' },
          h('label', null, t('fAccentStudy')),
          h('input', {
            className: 'lp-input',
            type: 'color',
            value: appearance.accent.study || '#3fa66a',
            onChange: (event) => setAccent('study', event.target.value),
          }),
        ),
      ),
      h('div', { className: 'lp-form-section' }, t('sectionBackground')),
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
            max: 0.6,
            step: 0.05,
            value: appearance.surface ?? 0.15,
            onChange: (event) => {
              const next = { ...appearance, surface: Number(event.target.value) };
              setAppearance(next);
              applyAppearance(next);
            },
          }),
          h('span', { className: 'lp-meta' }, `${Math.round((appearance.surface ?? 0.15) * 100)}%`),
        ),
        h('div', { className: 'lp-meta' }, t('fSurfaceHint')),
      ),
      backgroundFields('planning'),
      studyMode ? backgroundFields('study') : null,
    );

  const tabs = [
    { key: 'tags', label: t('tabTags') },
    { key: 'general', label: t('tabGeneral') },
    { key: 'notify', label: t('tabNotify') },
    { key: 'appearance', label: t('tabAppearance') },
  ];

  return h(
    Modal,
    {
      title: `${t('settings')} · v0.9.37`,
      className: 'lp-settings',
      onClose: props.onClose,
    },
    error ? h('div', { className: 'lp-err' }, error) : null,
      feedback ? h('div', { className: 'lp-meta lp-feedback' }, feedback) : null,
      h(
        'div',
        { className: 'lp-tabs' },
        tabs.map((tab) =>
          h(
            'button',
            {
              key: tab.key,
              className: 'lp-tab',
              type: 'button',
              'data-active': String(page === tab.key),
              onClick: () => setPage(tab.key),
            },
            tab.label,
          ),
        ),
      ),
      page === 'tags'
        ? tagsPage()
        : page === 'general'
          ? generalPage()
          : page === 'notify'
            ? notifyPage()
            : appearancePage(),
      h(
        'div',
        { className: 'lp-modal-actions' },
        h('button', { className: 'lp-btn-ghost', onClick: props.onClose, disabled: busy }, t('cancel')),
        h('button', { className: 'lp-btn', onClick: save, disabled: busy }, t('save')),
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
            h('div', { className: 'lp-pop-backdrop', onClick: menu.hide }),
            h(
              'div',
              {
                className: 'lp-dd-menu',
                role: 'listbox',
                'aria-multiselectable': 'true',
                id: menu.menuId,
                tabIndex: -1,
                style: {
                  left: menu.pos.left,
                  top: menu.pos.top,
                  width: menu.pos.width,
                  maxHeight: 260,
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
  // One reminder becomes a titled notification plus a detail line: the task,
  // its deadline (or the fact that it has none), and its priority.
  const describeNotice = (note) => describeReminder(note, t);
  const [tab, setTab] = React.useState('calendar');
  const pageRef = React.useRef(null);
  // Native controls (checkbox, datetime picker, select popup) follow the
  // `color-scheme` value, so sample the actual panel background instead of
  // trusting a media query: the app theme can differ from the OS theme.
  const [scheme, setScheme] = React.useState('light');

  React.useEffect(() => {
    const node = pageRef.current;
    if (!node) return undefined;
    const read = () => {
      const parts = window.getComputedStyle(node).backgroundColor.match(/\d+(\.\d+)?/g);
      if (!parts || parts.length < 3) return;
      const [r, g, b] = parts.map(Number);
      setScheme((r * 299 + g * 587 + b * 114) / 1000 > 128 ? 'light' : 'dark');
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme', 'style'] });
    return () => observer.disconnect();
  }, []);

  const [snapshot, setSnapshot] = React.useState(cached ? cached.snapshot : null);
  const [error, setError] = React.useState('');
  const [draft, setDraft] = React.useState('');
  const [planText, setPlanText] = React.useState(cached && cached.snapshot ? cached.snapshot.plan.bodyMarkdown || '' : '');
  const [busy, setBusy] = React.useState(false);
  const [editor, setEditor] = React.useState(null);
  const [settings, setSettings] = React.useState(cached ? cached.settings : null);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [notices, setNotices] = React.useState([]);
  // System notifications are paced: at most one every few seconds so a batch
  // never lands all at once.
  const notifQueue = React.useRef([]);
  const notifTimer = React.useRef(null);
  const systemNotifyEnabled = () => {
    try {
      return localStorage.getItem('lpSystemNotify') !== 'off';
    } catch {
      return true;
    }
  };
  const pumpNotifications = () => {
    notifTimer.current = null;
    const next = notifQueue.current.shift();
    if (!next) return;
    if (!systemNotifyEnabled()) return;
    try {
      new Notification(next.title, { body: next.body });
    } catch {
      // A blocked notification must not break the queue.
    }
    notifTimer.current = setTimeout(pumpNotifications, 7000);
  };
  const [focusItem, setFocusItem] = React.useState('');
  const [confirmCard, setConfirmCard] = React.useState(null);

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
    () =>
      api('snapshot').then((data) => {
        setSnapshot(data);
        setPlanText((current) => (current === '' ? data.plan.bodyMarkdown || '' : current));
        setError('');
        writePlannerCache({ snapshot: data });
        return data;
      }),
    [],
  );

  const reload = React.useCallback(() => {
    reloadData().catch((err) => setError(err.message));
  }, [reloadData]);

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

  React.useEffect(
    () => () => {
      if (notifTimer.current) clearTimeout(notifTimer.current);
    },
    [],
  );

  // Reminders arrive from the module-level poller as whole batches; the mounted
  // panel is the only place that shows them, paces the system notifications and
  // acknowledges the batch so the same reminder is never delivered twice.
  React.useEffect(() => {
    let alive = true;
    const onBatch = (list) => {
      if (!alive || !Array.isArray(list) || list.length === 0) return;
      setNotices((current) => {
        const seen = new Set(current.map((note) => note.id));
        const fresh = list.filter((note) => !seen.has(note.id));
        return fresh.length === 0 ? current : [...fresh, ...current].slice(0, 8);
      });
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && systemNotifyEnabled()) {
        for (const note of list) {
          if (note.hostNotified) continue;
          if (notifQueue.current.some((entry) => entry.id === note.id)) continue;
          notifQueue.current.push({ id: note.id, ...describeNotice(note) });
        }
        if (notifQueue.current.length > 0 && !notifTimer.current) pumpNotifications();
      }
      api('notifications.ack', { ids: list.map((note) => note.id) }).catch(() => {});
    };
    background.listeners.add(onBatch);
    // The module-level poller may have run before the panel mounted.
    pullReminders();
    return () => {
      alive = false;
      background.listeners.delete(onBatch);
    };
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
    settings && Array.isArray(settings.taskTypes) && settings.taskTypes.length > 0
      ? settings.taskTypes
      : ['学习', '工作', '生活', '其他'];
  const colorOverrides = (settings && settings.colorOverrides) || {};

  const toggleComplete = (item, done, event) => {
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
      h('button', { className: 'lp-btn-ghost', onClick: () => setSettingsOpen(true) }, t('settings')),
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
          h(BoardView, { t, items, colorOverrides, onEdit: (item) => setEditor(item) }),
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
                : h('div', { className: 'lp-notice-title' }, describeNotice(note).title),
              h(
                'div',
                { className: 'lp-notice-body' },
                note.undoId ? t('undoHint') : describeNotice(note).body,
              ),
            ),
          ),
        )
      : null,
    settingsOpen
      ? h(SettingsModal, {
          t,
          settings:
            settings || {
              weekdayWindows: '10:00-13:00,19:00-02:00',
              weekendWindows: '10:00-02:00',
              leadTaskDays: 3,
              leadProjectDays: 8,
              notifyGapMinutes: 3,
              nonUrgentQuotaPerWindow: 2,
              maxDeferHours: 48,
              archiveAfterDays: 30,
              deleteAfterDays: 90,
            },
          onClose: () => setSettingsOpen(false),
          onSaved: (data) => {
            setSettings(data);
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
          'div',
          null,
          h('div', { className: 'lp-pop-backdrop', onClick: () => setConfirmCard(null) }),
          h(
            'div',
            { className: 'lp-pop', role: 'dialog', 'aria-modal': 'true', 'data-lp-confirm': 'centered' },
            h('div', { className: 'lp-pop-title' }, confirmCard.title),
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

  React.useEffect(() => {
    if (!sessionId) return undefined;
    let alive = true;
    api('session?sessionId=' + encodeURIComponent(sessionId))
      .then((data) => {
        if (alive) setEnabled(Boolean(data.enabled));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [sessionId]);

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
      ? h('div', { className: 'lp-empty' }, t('habitEmpty'))
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
                // A fixed card height is what enables line clamping + ellipsis.
                'data-fixed': String(Number((currentAppearance().size || {}).mistakeHeight) > 0),
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
              h('input', {
                className: 'lp-input',
                value: form.question,
                onChange: (event) => setForm({ ...form, question: event.target.value }),
              }),
            ),
            h(
              'div',
              { className: 'lp-field' },
              h('label', null, t('mistakeAnswer')),
              h('input', {
                className: 'lp-input',
                value: form.answer,
                onChange: (event) => setForm({ ...form, answer: event.target.value }),
              }),
            ),
            h(
              'div',
              { className: 'lp-field' },
              h('label', null, t('mistakeReason')),
              h('input', {
                className: 'lp-input',
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
function StudyOverview(props) {
  const t = props.t;
  // The learning data comes from the parent page, which every tab shares.
  const data = props.data || null;
  const [tip, setTip] = React.useState(null);
  const [error, setError] = React.useState('');
  const reload = () => {
    if (typeof props.onReload === 'function') props.onReload();
    return api('tip')
      .then((next) => {
        setTip(next);
        setError('');
      })
      .catch((err) => setError(err.message));
  };
  React.useEffect(() => {
    reload();
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
  const todayKey = dayKey(new Date(Date.now() - 4 * 3600 * 1000));
  const todayPlan = ((data && data.plan) || []).filter((entry) => entry.date === todayKey);
  const dueMistakes = ((data && data.mistakes) || []).filter((entry) => entry.due);
  // Mastery is owned by the tutor: the page only displays it.
  const masteryLabel = (value) => `${Math.min(10, Math.max(0, Number(value) || 0))}/10`;
  return h(
    'div',
    { className: 'lp-body' },
    error ? h('div', { className: 'lp-err' }, error) : null,
    tip && tip.text
      ? h(
          'div',
          { className: 'lp-card', style: { marginBottom: 8 } },
          h('div', { className: 'lp-card-title' }, t('studyTipTitle')),
          h(
            'div',
            { className: 'lp-card-meta', style: { whiteSpace: 'pre-wrap', lineHeight: 1.6 } },
            tip.text,
          ),
        )
      : null,
    h(
      'div',
      { className: 'lp-toolbar' },
      h('span', { className: 'lp-meta' }, `1. ${t('studyTodayPlan')} ${todayPlan.filter((entry) => !entry.doneAt).length}/${todayPlan.length}`),
      h('span', { className: 'lp-meta' }, `· ${t('studyDue')} ${due.length}`),
      h('div', { style: { flex: 1 } }),
    ),
    todayPlan.length === 0
      ? h('div', { className: 'lp-empty' }, t('studyNoTodayPlan'))
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
    h('div', { className: 'lp-section' }, `2. ${t('studyDue')} · ${due.length}`),
    due.length === 0
      ? h('div', { className: 'lp-empty' }, t('studyNoDue'))
      : due.map((topic) =>
          h(
            'div',
            { key: topic.id, className: 'lp-tree-row' },
            h('span', { className: 'lp-title' }, topic.title),
          ),
        ),
    h('div', { className: 'lp-section' }, `3. ${t('studyMistakeReview')} · ${dueMistakes.length}`),
    dueMistakes.length === 0
      ? h('div', { className: 'lp-empty' }, t('studyNoMistake'))
      : dueMistakes.map((mistake) =>
          h(
            'div',
            { key: mistake.id, className: 'lp-tree-row' },
            h('span', { className: 'lp-title', title: mistake.reason || '' }, mistake.question),
            h('span', { className: 'lp-meta' }, mistake.answer),
            h('button', { className: 'lp-btn-ghost', onClick: () => finishMistake(mistake) }, t('studyFinish')),
          ),
        ),
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
  const [busy, setBusy] = React.useState('');
  const [result, setResult] = React.useState(null);
  const [draft, setDraft] = React.useState('');
  const dragPlan = React.useRef('');
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
  const reloadTasks = () =>
    api('study-tasks')
      .then((list) => setTasks(Array.isArray(list) ? list : []))
      .catch(() => {});
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
        return reloadTasks();
      })
      .catch((err) => props.onError(err.message));
  };
  const openTask = (task) => {
    setEditingTask(task);
    setTaskForm({ title: task.title, workspacePath: task.workspacePath, template: normalizeTemplate(task.template) });
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
      },
    })
      .then(() => api('studytask.materials', { id: editingTask.id, shelfIds: taskShelf }))
      .then(() => {
        setEditingTask(null);
        return reloadTasks();
      })
      .catch((err) => props.onError(err.message));
  };
  const addSubject = (event) => {
    event.preventDefault();
    const title = draft.trim();
    if (!title) return;
    setDraft('');
    api('subject.add', { title })
      .then(() => props.onReload())
      .catch((err) => props.onError(err.message));
  };
  const today = dayKey(new Date());
  const generate = (subjectId) => {
    if (typeof window !== 'undefined' && !window.confirm(t('studyGenerateAsk'))) return;
    setBusy(subjectId);
    api('plan.generate', { subjectId })
      .then((info) => {
        setResult(info);
        return props.onReload();
      })
      .catch((err) => props.onError(err.message))
      .finally(() => setBusy(''));
  };
  const upcoming = data.plan.filter((entry) => entry.date >= today).slice(0, 14);
  return h(
    'div',
    { className: 'lp-body' },
    h(
      'form',
      { className: 'lp-toolbar', onSubmit: addSubject },
      h('input', {
        className: 'lp-input',
        style: { background: controlSurface(0.45), backdropFilter: 'blur(6px)' },
        value: draft,
        placeholder: t('studyAddSubject'),
        onChange: (event) => setDraft(event.target.value),
      }),
      h('button', { className: 'lp-btn', type: 'submit' }, t('addButton')),
    ),
    h(
      'div',
      { className: 'lp-toolbar' },
      h(
        'div',
        { className: 'lp-section', style: { flex: 1, margin: 0 } },
          weekMinutes !== null
            ? `${t('studyTaskList')} · ${tasks.length} · ${t('studyWeekPlan').replace('{n}', String(weekMinutes))}`
            : `${t('studyTaskList')} · ${tasks.length}`,
      ),
      h(
        'button',
        { className: 'lp-btn-ghost', onClick: () => setShowNew(!showNew) },
        showNew ? t('cancel') : `+ ${t('studyTaskAdd')}`,
      ),
    ),
    tasks.length === 0
      ? h('div', { className: 'lp-empty' }, t('studyNoTask'))
      : tasks.map((task) =>
          h(
            'div',
            {
              key: task.id,
              className: 'lp-tree-row',
              style: { cursor: 'pointer' },
              title: t('studyTaskEditHint'),
              onClick: () => openTask(task),
            },
            h('span', { className: 'lp-title', title: task.workspacePath }, task.title),
            h('span', { className: 'lp-badge' }, normalizeTemplate(task.template)),
            task.materials && task.materials.length > 0
              ? h('span', { className: 'lp-meta' }, `📎${task.materials.length}`)
              : null,
            task.summary && task.summary.total
              ? h('span', { className: 'lp-meta' }, `${task.summary.total} ${t('studyEntries')}`)
              : null,
            task.missing ? h('span', { className: 'lp-badge' }, t('studyTaskMissing')) : null,
            task.doneToday
              ? h('span', { className: 'lp-badge' }, t('studyTaskDoneToday'))
              : task.overdueDays > 0
                ? h(
                    'span',
                    { className: 'lp-badge' },
                    t('studyTaskOverdue').replace('{n}', String(task.overdueDays)),
                  )
                : null,
            h(
              'span',
              { className: 'lp-meta' },
              `${t('studyNewLabel')} ${task.answeredNew || 0}/${task.targetNew || 0} · ${t('studyReviewLabel')} ${task.answeredReview || 0}/${task.targetReview || 0}`,
            ),
            h('span', { className: 'lp-meta' }, task.updatedAt ? task.updatedAt.slice(0, 10) : ''),
          ),
        ),
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
                        return reloadTasks();
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
    h('div', { className: 'lp-section' }, `1. ${t('studySubjects')}`),
    data.subjects.length === 0 ? h('div', { className: 'lp-empty' }, t('studyNoSubject')) : null,
    data.subjects.map((subject) => {
      const entries = data.plan.filter((entry) => entry.subjectId === subject.id);
      const done = entries.filter((entry) => entry.doneAt).length;
      return h(
        'div',
        { key: subject.id, className: 'lp-group' },
        h(
          'div',
          {
            className: 'lp-group-head',
            style: { cursor: 'pointer' },
            onClick: () => {
              setSubjectEditing(subject);
              setSubjectForm({
                title: subject.title,
                examDate: subject.examDate || '',
                note: subject.note || '',
              });
            },
          },
          h('span', null, subject.title),
          subject.examDate
            ? h('span', { className: 'lp-meta' }, `${t('studyExam')} ${subject.examDate}`)
            : h('span', { className: 'lp-meta' }, t('studyNoExam')),
          h('span', { className: 'lp-meta' }, `${done}/${entries.length}`),
          h(
            'button',
            {
              className: 'lp-btn-ghost',
              onClick: (event) => {
                event.stopPropagation();
                generate(subject.id);
              },
              disabled: busy === subject.id,
            },
            busy === subject.id ? '…' : t('studyGenerate'),
          ),
        ),
      );
    }),
    result
      ? h(
          'div',
          { className: 'lp-meta' },
          `${t('studyGenerated')} ${result.created}${
            result.unscheduled ? ` · ${t('studyUnscheduled')} ${result.unscheduled}` : ''
          }`,
        )
      : null,
    h('div', { className: 'lp-section' }, `2. ${t('studyUpcoming')}`),
    upcoming.length === 0
      ? h('div', { className: 'lp-empty' }, t('studyNoPlan'))
      : upcoming.map((entry) =>
          h(
            'div',
            {
              key: entry.id,
              className: 'lp-tree-row',
              draggable: true,
              onDragStart: (event) => {
                dragPlan.current = entry.id;
                event.dataTransfer.setData('text/plain', entry.id);
                event.dataTransfer.effectAllowed = 'move';
              },
              onDragOver: (event) => {
                if (!dragPlan.current) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
              },
              onDrop: (event) => {
                event.preventDefault();
                const moving = dragPlan.current || event.dataTransfer.getData('text/plain');
                dragPlan.current = '';
                if (!moving || moving === entry.id) return;
                api('plan.move', { id: moving, date: entry.date })
                  .then(() => props.onReload())
                  .catch((err) => props.onError(err.message));
              },
            },
            h('span', { className: 'lp-meta' }, entry.date.slice(5)),
            h(
              'span',
              { className: 'lp-title' },
              (data.topics.find((topic) => topic.id === entry.topicId) || {}).title || entry.kind,
            ),
            h('span', { className: 'lp-badge' }, `${entry.minutes}${t('studyMinuteUnit')}`),
            h('span', { className: 'lp-meta' }, entry.doneAt ? t('studyDone') : ''),
          ),
        ),
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
  const pageRef = React.useRef(null);
  const [scheme, setScheme] = React.useState(props.scheme || 'light');
  React.useEffect(() => {
    const node = pageRef.current;
    if (!node) return undefined;
    const read = () => {
      const parts = window.getComputedStyle(node).backgroundColor.match(/\d+(\.\d+)?/g);
      if (!parts || parts.length < 3) return;
      const [r, g, b] = parts.map(Number);
      setScheme((r * 299 + g * 587 + b * 114) / 1000 > 128 ? 'light' : 'dark');
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme', 'style'] });
    return () => observer.disconnect();
  }, []);
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
  // One beat per minute while the page is visible; the host caps each beat so
  // an idle tab cannot inflate the numbers.
  React.useEffect(() => {
    loadHabits();
    const beat = () => {
      if (document.visibilityState !== 'visible') return;
      api('habit.beat', {}).then(loadHabits).catch(() => {});
    };
    const timer = setInterval(beat, 60000);
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
    ),
    error
      ? h('div', { className: 'lp-err', style: { padding: '8px 14px', margin: 0 } }, error)
      : null,
    loading.learning && !data
      ? h('div', { className: 'lp-empty' }, t('loading'))
      : tab === 'today'
        ? h(StudyOverview, { t, data, onReload: loadLearning })
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
  );
}

// ---- app.js ----
return {
  inject: ['slots', 'locale'],
  __internals: { dayKey, groupByDay, monthMatrix, weekMatrix, topTask, openEntries },
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
      applyAppearance(initial);
      // Paint first, then warm the images in idle time: a 2 MB photo must never
      // delay the panel. The second one follows the first.
      const warm = () => {
        hydrateBackgrounds(initial, ['planning'])
          .then(() => hydrateBackgrounds(initial, ['study']))
          .catch(() => {});
      };
      // The durable appearance lives on the host, so adopt it when it arrives.
      api('ui')
        .then((ui) => {
          if (!ui || (!ui.appearance && !ui.skins)) return;
          setHostUi(ui);
          const merged = loadAppearance();
          applyAppearance(merged);
          hydrateBackgrounds(merged).catch(() => {});
        })
        .catch(() => {});
      // Read the stored images the same way the settings dialog does, so the
      // background is live on boot instead of only after opening settings.
      const syncBackgrounds = () =>
        api('background.info')
          .then((info) => {
            if (!info) return;
            const current = loadAppearance();
            const next = {
              ...current,
              background: {
                planning: { ...current.background.planning, imageUrl: info.planning || current.background.planning.imageUrl || '' },
                study: { ...current.background.study, imageUrl: info.study || current.background.study.imageUrl || '' },
              },
            };
            applyAppearance(next);
            hydrateBackgrounds(next).catch(() => {});
          })
          .catch(() => {});
      setTimeout(syncBackgrounds, 50);
      setTimeout(syncBackgrounds, 900);
      if (typeof requestIdleCallback === 'function') requestIdleCallback(warm, { timeout: 1500 });
      else setTimeout(warm, 200);
    });

    // Keeps reminding while the page is open, even on another panel. The poller
    // no longer depends on the Notification API: the mounted panel decides how
    // to show a batch.
    const reminderTicker = typeof document !== 'undefined' ? startBackgroundReminders() : null;
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
          h(StudyPanel, { t, scheme: pageScheme() }),
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
