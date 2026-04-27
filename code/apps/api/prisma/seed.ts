import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ====== 维度定义 ======
// understanding: 基础理解 | thinking: 自主思考 | organization: 独立拆解
// execution: 基础执行 | judgment: 判断产出

type DimScores = [number, number, number, number, number]; // u, t, o, e, j

interface OptDef {
  label: string;
  riskLevel: string;
  dims: DimScores;
  signals: string[];
  triggers: string[];
}

interface QDef {
  id: string;
  sceneId: string;
  questionType: string;
  category: string;
  title: string;
  description?: string;
  depthLevels: string[];
  weight: number;
  isHighWeight: boolean;
  sortOrder: number;
  options: OptDef[];
}

// 工具：创建选项
function o(label: string, riskLevel: string, dims: DimScores, signals: string[] = [], triggers: string[] = []): OptDef {
  return { label, riskLevel, dims, signals, triggers };
}

// 工具：创建题目
function q(id: string, sceneId: string, qtype: string, cat: string, title: string, depths: string[], sort: number, opts: OptDef[], desc?: string, hw = true): QDef {
  return { id, sceneId, questionType: qtype, category: cat, title, description: desc, depthLevels: depths, weight: hw ? 2 : 1, isHighWeight: hw, sortOrder: sort, options: opts };
}

// ====== 写作与汇报场景 (writing-report) ======
const wrQuestions: QDef[] = [
  // Core 8 (quick + standard + deep)
  q('wr_q01', 'writing-report', 'behavioral', '起始方式', '你通常从哪里开始这类写作任务？', ['quick','standard','deep'], 1, [
    o('先自己思考要写什么，理清思路后再决定是否用 AI 辅助', 'continue', [1,1,1,0,1]),
    o('大概想一下方向，然后让 AI 先出一个框架看看', 'limit', [2,5,6,0,2], ['replacement'], ['first_process_replaced']),
    o('直接把任务要求告诉 AI，让它生成第一版', 'pause', [3,9,8,2,6], ['replacement','dependency'], ['core_step_fully_replaced','first_process_replaced']),
  ], '请选择最接近你真实习惯的一项。', true),
  q('wr_q02', 'writing-report', 'behavioral', '脱离AI可完成度', '如果现在不能用 AI 了，你还能写出一篇可接受的初稿吗？', ['quick','standard','deep'], 2, [
    o('没问题，最多多花点时间', 'continue', [0,1,1,1,1]),
    o('会比较吃力，但勉强能完成', 'limit', [1,3,4,3,3], ['weakening'], ['dependency_signal_detected']),
    o('很难，我基本已经不自己从头写了', 'pause', [2,8,8,7,8], ['replacement','dependency'], ['cannot_finish_without_ai','core_step_fully_replaced']),
  ]),
  q('wr_q03', 'writing-report', 'behavioral', 'AI介入位置', '你通常让 AI 在写作中承担什么角色？', ['quick','standard','deep'], 3, [
    o('润色、检查错别字、调整语气，写完才用', 'continue', [0,0,1,1,1]),
    o('起草框架和结构，然后我填充内容', 'limit', [1,3,5,3,2], ['replacement'], ['first_process_replaced']),
    o('几乎全程负责，我主要审核最终输出', 'pause', [2,7,8,6,7], ['replacement','dependency'], ['core_step_fully_replaced','cannot_finish_without_ai']),
  ], '请选择最接近你日常使用习惯的一项。'),
  q('wr_q04', 'writing-report', 'behavioral', '关键过程承担', '收到 AI 生成的初稿后，你通常怎么处理？', ['quick','standard','deep'], 4, [
    o('逐段仔细修改，加入自己的观点和例子', 'continue', [0,1,1,1,1]),
    o('大致看看，改几个词或句子就提交', 'limit', [1,4,3,3,2], ['dependency'], ['dependency_signal_detected']),
    o('基本不变，直接提交', 'pause', [2,8,5,5,7], ['replacement','dependency'], ['core_step_fully_replaced']),
  ]),
  q('wr_q05', 'writing-report', 'behavioral', '依赖惯性', '做这类写作任务时，如果不能先问 AI，你的第一反应是什么？', ['quick','standard','deep'], 5, [
    o('没什么特别的，就按以前的方式写', 'continue', [0,1,0,1,1]),
    o('会觉得有点不习惯，但还是能开始', 'limit', [1,3,2,2,2], ['weakening']),
    o('会明显感到无从下手，不太知道怎么开头', 'pause', [3,8,7,5,6], ['dependency'], ['cannot_finish_without_ai','dependency_signal_detected']),
  ]),
  q('wr_q06', 'writing-report', 'scenario', '起始方式', '你要写一篇课程总结，时间比较紧。老师说希望看到你自己的理解和反思。你通常会？', ['quick','standard','deep'], 6, [
    o('先快速列出自己想说的要点，再展开写', 'continue', [0,1,1,2,1]),
    o('先让 AI 针对主题出一版，我在 AI 的基础上改', 'limit', [3,5,5,2,3], ['replacement'], ['first_process_replaced']),
    o('直接让 AI 写完整版，我再挑几段改一改', 'pause', [4,8,7,5,7], ['replacement','dependency'], ['core_step_fully_replaced']),
  ], '请选择在时间压力下你最可能的选择。'),
  q('wr_q07', 'writing-report', 'self_check', '关键过程承担', '诚实评价：不用 AI 的情况下，你还能自己搭出一篇汇报的结构吗？', ['quick','standard','deep'], 7, [
    o('当然可以，我知道怎么写开头、中间、结尾', 'continue', [0,0,0,0,1]),
    o('大概可以，但可能会卡住，需要花更多时间', 'limit', [1,2,3,2,2], ['weakening']),
    o('不太行，我现在习惯 AI 给我框架了', 'pause', [2,6,7,4,5], ['replacement'], ['dependency_signal_detected']),
  ], '请根据实际情况选择，不是理想状态。'),
  q('wr_q08', 'writing-report', 'scenario', '依赖惯性', '如果要求你从现在开始，一整周不用 AI 做写作类任务，你觉得会怎样？', ['quick','standard','deep'], 8, [
    o('没问题，我之前也是这样做的', 'continue', [0,0,0,1,0]),
    o('效率会变低，但结果不会差太多', 'limit', [0,2,1,2,1], ['weakening']),
    o('会很焦虑，很多任务可能完不成', 'pause', [2,7,5,6,5], ['dependency'], ['cannot_finish_without_ai']),
  ]),

  // Standard 12 (standard + deep)
  q('wr_q09', 'writing-report', 'behavioral', '关键过程承担', '写文章时，你的观点从哪里来？', ['standard','deep'], 9, [
    o('主要来自我自己的思考和判断', 'continue', [0,0,1,0,0]),
    o('自己先想一个方向，然后用 AI 补充论据', 'limit', [0,2,1,1,1], ['weakening']),
    o('多数时候直接采纳 AI 给出的观点角度', 'pause', [3,8,4,1,6], ['replacement','dependency'], ['core_step_fully_replaced']),
  ]),
  q('wr_q10', 'writing-report', 'self_check', 'AI介入位置', '你会不会在还没想清楚要写什么之前就先打开 AI？', ['standard','deep'], 10, [
    o('不会，我总是先自己想清楚', 'continue', [0,0,0,0,0]),
    o('偶尔会，特别是遇到不熟悉的话题时', 'limit', [1,3,2,0,1], ['weakening']),
    o('经常这样，已经习惯先让 AI 帮我理思路', 'pause', [2,7,6,1,4], ['replacement'], ['first_process_replaced']),
  ]),
  q('wr_q11', 'writing-report', 'scenario', '起始方式', '你需要写一份工作汇报，里面涉及你自己负责的项目进展。你通常怎么做？', ['standard','deep'], 11, [
    o('先整理出项目的关键进展和数据，再组织语言', 'continue', [0,1,0,0,1]),
    o('让 AI 根据我提供的要点帮我扩展成文', 'limit', [0,2,4,3,2], ['replacement']),
    o('直接让 AI 写，然后我核对数据和事实', 'pause', [2,7,7,5,6], ['replacement','dependency'], ['core_step_fully_replaced']),
  ], '请选择最接近你真实做法的选项。'),
  q('wr_q12', 'writing-report', 'behavioral', '关键过程承担', '你在写作中通常如何组织文章的逻辑结构？', ['standard','deep'], 12, [
    o('自己画出大概框架，决定先写什么后写什么', 'continue', [0,0,1,1,1]),
    o('自己先想个大概，再让 AI 帮我调整结构', 'limit', [0,2,3,1,2], ['weakening']),
    o('直接让 AI 给我一个结构，我照着填内容', 'pause', [2,6,8,3,5], ['replacement'], ['first_process_replaced']),
  ]),
  q('wr_q13', 'writing-report', 'self_check', '脱离AI可完成度', '回忆一下，你最近一次完全不借助 AI 独立写出一篇文章是什么时候？', ['standard','deep'], 13, [
    o('最近一周内', 'continue', [0,0,0,0,0]),
    o('一个月以内', 'limit', [0,1,1,1,1], ['weakening']),
    o('一个月以前，或者记不清了', 'pause', [1,5,4,4,3], ['dependency']),
  ], '指不含任何 AI 辅助（包括润色）的独立完成。'),
  q('wr_q14', 'writing-report', 'scenario', 'AI介入位置', 'AI 给你一篇写好的文章，你能判断其中哪些观点站得住脚、哪些是拼凑的吗？', ['standard','deep'], 14, [
    o('能，我一直保持判断习惯', 'continue', [0,0,0,0,0]),
    o('大部分时候能，复杂话题可能会含糊', 'limit', [1,1,1,0,1], ['weakening']),
    o('不太能，我更多是看整体感觉好不好', 'pause', [4,5,3,2,5], ['dependency']),
  ]),
  q('wr_q15', 'writing-report', 'behavioral', '依赖惯性', '当你需要给朋友回一封重要邮件时，你会？', ['standard','deep'], 15, [
    o('自己写，这是个人交流', 'continue', [0,0,0,0,0]),
    o('自己写完之后再用 AI 改改措辞', 'limit', [0,1,0,1,1]),
    o('直接让 AI 写，再改改名字和细节', 'pause', [3,6,4,2,4], ['dependency'], ['dependency_signal_detected']),
  ]),
  q('wr_q16', 'writing-report', 'self_check', '起始方式', '当你面对一个完全陌生的写作主题，你的第一反应是？', ['standard','deep'], 16, [
    o('先去搜索资料，自己了解主题', 'continue', [0,0,0,0,0]),
    o('先让 AI 解释一下主题，然后自己再研究', 'limit', [1,2,0,0,1], ['weakening']),
    o('直接让 AI 写一版，从中了解这个主题', 'pause', [4,7,3,0,5], ['replacement'], ['first_process_replaced']),
  ]),
  q('wr_q17', 'writing-report', 'scenario', '关键过程承担', '你在修改 AI 生成的文章时，最大的改动通常是？', ['standard','deep'], 17, [
    o('加入自己的观点和亲身经历，这些 AI 替代不了', 'continue', [0,0,0,1,0]),
    o('调整措辞和语气，让文章更像我自己', 'limit', [0,0,2,2,1], ['weakening']),
    o('改几个明显不对的地方，其他的基本保留', 'pause', [2,4,4,3,4], ['dependency'], ['dependency_signal_detected']),
  ]),
  q('wr_q18', 'writing-report', 'behavioral', '脱离AI可完成度', '以下哪句话最能描述你现在和 AI 的协作方式？', ['standard','deep'], 18, [
    o('AI 是工具，我是主创', 'continue', [0,0,0,0,0]),
    o('AI 是搭档，我们配合做', 'limit', [1,2,3,3,2], ['weakening']),
    o('AI 是主力，我更多是编辑', 'pause', [2,6,6,5,6], ['replacement','dependency'], ['core_step_fully_replaced']),
  ]),
  q('wr_q19', 'writing-report', 'self_check', '依赖惯性', '你觉得在写作这件事上，如果离开 AI，你的个人能力与两年前比如何？', ['standard','deep'], 19, [
    o('基本持平或更强', 'continue', [0,0,0,0,0]),
    o('在某些方面有所下降，但还能找回来', 'limit', [0,2,2,2,2], ['weakening']),
    o('明显退步，基本依赖 AI 了', 'pause', [2,6,6,6,5], ['dependency'], ['dependency_signal_detected']),
  ], '请根据真实感受选择，不是在批评你。'),
  q('wr_q20', 'writing-report', 'scenario', 'AI介入位置', '你要写一封重要的申请信。以下最接近你做法的是？', ['standard','deep'], 20, [
    o('自己先打草稿，然后让 AI 帮我修饰和润色', 'continue', [0,0,1,1,0]),
    o('让 AI 出一个模板，然后我在上面修改', 'limit', [1,3,4,2,2], ['replacement']),
    o('直接让 AI 写，我检查一下格式和姓名', 'pause', [2,7,7,4,6], ['replacement','dependency'], ['first_process_replaced']),
  ]),

  // Deep 25 (deep only)
  q('wr_q21', 'writing-report', 'behavioral', '起始方式', '当 AI 给你提供一个写作框架时，你会不会质疑它的结构？', ['deep'], 21, [
    o('会，我会仔细评估它是否符合我的表达意图', 'continue', [0,0,0,0,1]),
    o('大概看看，只要不太离谱就用', 'limit', [1,3,2,0,2], ['weakening']),
    o('基本不质疑，AI 的结构一般都还可以', 'pause', [3,6,5,0,4], ['dependency','replacement']),
  ]),
  q('wr_q22', 'writing-report', 'self_check', '关键过程承担', '你写作时，以下哪个环节最常交给 AI？', ['deep'], 22, [
    o('基本只用于检查语法和润色', 'continue', [0,0,0,0,0]),
    o('帮助我扩展段落和丰富措辞', 'limit', [0,2,1,2,1]),
    o('从找角度、定结构到写初稿，全程参与', 'pause', [3,7,6,5,6], ['replacement','dependency'], ['core_step_fully_replaced']),
  ]),
  q('wr_q23', 'writing-report', 'scenario', '依赖惯性', '你的同事发现你总是能快速交报告，想知道秘诀。你心里清楚是什么？', ['deep'], 23, [
    o('我自己写得快而已', 'continue', [0,0,0,0,0]),
    o('我让 AI 帮忙，但核心内容还是我的', 'limit', [0,0,1,1,1]),
    o('基本都是 AI 写的，我主要做审核', 'pause', [2,6,6,5,7], ['replacement','dependency'], ['core_step_fully_replaced']),
  ]),
  q('wr_q24', 'writing-report', 'behavioral', 'AI介入位置', '你在用 AI 辅助写作时，通常在什么时候让它介入？', ['deep'], 24, [
    o('写完之后让它帮我检查和完善', 'continue', [0,0,0,0,0]),
    o('写到一半卡住了，让它帮我继续', 'limit', [1,3,2,2,2], ['weakening']),
    o('开头就让 AI 介入，从第一步就开始', 'pause', [3,7,7,4,5], ['replacement','dependency'], ['first_process_replaced']),
  ]),
  q('wr_q25', 'writing-report', 'self_check', '脱离AI可完成度', '当你的 AI 工具不可用时，你写出来的东西质量和效率会下降多少？', ['deep'], 25, [
    o('最多 10-20%，主要是慢了', 'continue', [0,0,0,0,0]),
    o('大概会降 30-50%，但核心内容还在', 'limit', [0,2,2,3,2], ['weakening']),
    o('会降 50% 以上，甚至可能写不出来', 'pause', [2,7,6,7,7], ['dependency'], ['cannot_finish_without_ai']),
  ]),
  q('wr_q26', 'writing-report', 'scenario', '起始方式', '你要写一篇关于你所在行业的分析文章。以下做法最接近你的是？', ['deep'], 26, [
    o('先自己做研究，形成自己的分析框架', 'continue', [0,0,0,0,1]),
    o('先让 AI 帮我搜资料和梳理框架', 'limit', [2,4,4,0,2], ['replacement'], ['first_process_replaced']),
    o('直接让 AI 写，我来补充数据和调整结论', 'pause', [4,8,7,2,6], ['replacement','dependency'], ['core_step_fully_replaced']),
  ]),
  q('wr_q27', 'writing-report', 'behavioral', '关键过程承担', '你在写文章时，怎么处理 AI 给出的例子和论据？', ['deep'], 27, [
    o('自己核实，替换成自己的例子', 'continue', [0,0,0,1,0]),
    o('大部分用 AI 的，偶尔替换几个', 'limit', [1,3,1,2,2], ['weakening','dependency']),
    o('基本直接用，AI 给的例子挺好的', 'pause', [3,6,2,4,5], ['dependency'], ['dependency_signal_detected']),
  ]),
  q('wr_q28', 'writing-report', 'self_check', 'AI介入位置', '你是否经常让 AI 代替你\"第一次阅读\"和\"第一次理解\"你需要写的主题材料？', ['deep'], 28, [
    o('不会，我坚持自己先读一遍', 'continue', [0,0,0,0,0]),
    o('忙的时候会让 AI 先总结，但我也会看原文', 'limit', [2,2,0,0,1]),
    o('习惯让 AI 帮我消化，我只看它总结的', 'pause', [6,6,2,0,4], ['replacement','dependency'], ['first_process_replaced']),
  ]),
  q('wr_q29', 'writing-report', 'scenario', '依赖惯性', '你要准备一个 5 分钟的发言稿。不靠 AI，你能马上开始写吗？', ['deep'], 29, [
    o('能，5 分钟发言稿不算难', 'continue', [0,0,0,1,0]),
    o('能写，但可能想一会儿结构再下笔', 'limit', [0,2,2,1,1]),
    o('不太好下手，平时都是 AI 写的', 'pause', [1,6,6,4,5], ['dependency'], ['cannot_finish_without_ai']),
  ]),
  q('wr_q30', 'writing-report', 'behavioral', '起始方式', '当有多个写作任务要完成时，你的工作流程是？', ['deep'], 30, [
    o('逐个任务自己理清思路，再逐个完成', 'continue', [0,0,1,0,0]),
    o('先让 AI 给每个任务一个提纲，然后我再写', 'limit', [1,3,4,2,2], ['replacement']),
    o('全部任务让 AI 生成，我再审核', 'pause', [3,7,7,4,6], ['replacement','dependency'], ['core_step_fully_replaced']),
  ]),
  q('wr_q31', 'writing-report', 'self_check', '关键过程承担', '你觉得自己在写作时，还能不能把握住文章的整体\"魂\"？', ['deep'], 31, [
    o('能，文章的灵魂还是我自己的', 'continue', [0,0,0,0,0]),
    o('部分还在，但有时候感觉在跟着 AI 走', 'limit', [1,3,2,1,2], ['weakening']),
    o('比较难，我更多是在 AI 的基础上修补', 'pause', [3,7,4,3,5], ['replacement','dependency'], ['dependency_signal_detected']),
  ]),
  q('wr_q32', 'writing-report', 'scenario', '脱离AI可完成度', '你的 AI 工具突然不可用了。你手头有一篇明天要交的报告。你会？', ['deep'], 32, [
    o('没关系，换个普通编辑器照样写', 'continue', [0,0,0,0,0]),
    o('会焦虑，但硬着头皮也能写出来', 'limit', [0,2,2,3,2], ['weakening']),
    o('可能想办法换别的 AI 工具，或者干脆拖到有 AI 再写', 'pause', [1,6,4,5,5], ['dependency'], ['cannot_finish_without_ai']),
  ]),
  q('wr_q33', 'writing-report', 'behavioral', 'AI介入位置', '你最近一次全人工写作（从构思到完稿都不用 AI）是什么体验？', ['deep'], 33, [
    o('挺顺的，没觉得有什么特别', 'continue', [0,0,0,0,0]),
    o('有点不习惯，但写着写着就进入状态了', 'limit', [0,2,2,2,1], ['weakening']),
    o('很难受，一直想打开 AI', 'pause', [1,5,4,5,3], ['dependency'], ['dependency_signal_detected']),
  ]),
  q('wr_q34', 'writing-report', 'self_check', '起始方式', '你是否会在写作中刻意保留一些\"不借助 AI\"的时刻？', ['deep'], 34, [
    o('是的，我有意识地保持纯手动写作的习惯', 'continue', [0,0,0,0,0]),
    o('偶尔会，但没有固定习惯', 'limit', [0,1,1,1,1], ['weakening']),
    o('基本没有，我的写作已经高度依赖 AI 了', 'pause', [2,5,4,4,4], ['dependency']),
  ]),
  q('wr_q35', 'writing-report', 'scenario', '依赖惯性', '想象没有 AI 的帮助下，给你一个小时，写一篇 800 字的短文。你觉得怎样？', ['deep'], 35, [
    o('轻松，一小时绰绰有余', 'continue', [0,0,0,0,0]),
    o('有点紧张，但应该能完成', 'limit', [0,1,1,2,1]),
    o('可能写不完，或者质量不会高', 'pause', [1,5,4,5,4], ['dependency'], ['cannot_finish_without_ai']),
  ]),
  q('wr_q36', 'writing-report', 'behavioral', '关键过程承担', '在写作中，你的\"第一版\"通常是以什么形式存在的？', ['deep'], 36, [
    o('自己手写的草稿或提纲', 'continue', [0,0,0,0,0]),
    o('自己写了开头，后面让 AI 补', 'limit', [1,3,3,3,2], ['replacement']),
    o('AI 生成的完整文稿', 'pause', [3,7,7,6,7], ['replacement','dependency'], ['core_step_fully_replaced']),
  ]),
  q('wr_q37', 'writing-report', 'self_check', 'AI介入位置', '你会在写完文章之后再用 AI 对比你的版本和 AI 的版本吗？', ['deep'], 37, [
    o('不会，我信任自己的版本', 'continue', [0,0,0,0,0]),
    o('偶尔会比较一下，看看哪里可以让 AI 优化', 'limit', [0,1,0,1,1]),
    o('经常先让 AI 写一版对比，很多时候 AI 的更好', 'pause', [2,5,2,2,4], ['dependency'], ['dependency_signal_detected']),
  ]),
  q('wr_q38', 'writing-report', 'scenario', '脱离AI可完成度', '你的主管让你写一篇个人发展总结，强调要\"真实、有深度\"。你会？', ['deep'], 38, [
    o('完全自己写，这类东西 AI 替代不了', 'continue', [0,0,0,0,0]),
    o('自己写主体，让 AI 帮我润色和修正', 'limit', [0,0,1,1,1]),
    o('让 AI 先出一版，我再改得像我', 'pause', [2,5,4,3,5], ['replacement'], ['first_process_replaced']),
  ]),
  q('wr_q39', 'writing-report', 'behavioral', '起始方式', '你的写作能力（指完全不依赖 AI 时）和一年前比？', ['deep'], 39, [
    o('有进步', 'continue', [0,0,0,0,0]),
    o('差不多', 'limit', [0,1,1,1,1], ['weakening']),
    o('退步了', 'pause', [2,4,4,4,4], ['dependency']),
  ], '诚实评价即可。'),
  q('wr_q40', 'writing-report', 'self_check', '依赖惯性', '如果接下来一个月完全不能用 AI 写东西，你的感觉是？', ['deep'], 40, [
    o('没问题，甚至觉得是个好机会', 'continue', [0,0,0,0,0]),
    o('会不方便，但可以接受', 'limit', [0,1,1,1,1], ['weakening']),
    o('非常焦虑，不知道怎么办', 'pause', [2,6,4,6,4], ['dependency'], ['cannot_finish_without_ai']),
  ]),
  // 额外 5 道深度题补充到 45
  q('wr_q41', 'writing-report', 'behavioral', '关键过程承担', '你写文章时，哪个环节你自己动手的时间最长？', ['deep'], 41, [
    o('构思和搭框架', 'continue', [0,0,0,0,0]),
    o('写初稿', 'limit', [0,1,1,1,0]),
    o('审核和修改 AI 的成品', 'pause', [3,6,5,4,5], ['replacement','dependency']),
  ]),
  q('wr_q42', 'writing-report', 'scenario', 'AI介入位置', '你发现 AI 帮你写完一篇文章后，你会去查证里面的数据吗？', ['deep'], 42, [
    o('会，我对 AI 的数据不太放心', 'continue', [0,0,0,0,0]),
    o('偶尔，如果数据看起来不太对的话', 'limit', [1,1,0,0,1]),
    o('基本不会，我信任 AI', 'pause', [4,4,0,0,4], ['dependency']),
  ]),
  q('wr_q43', 'writing-report', 'self_check', '起始方式', '你坐下来开始写作时，先打开的是文档还是 AI 对话窗口？', ['deep'], 43, [
    o('文档', 'continue', [0,0,0,0,0]),
    o('看情况，经常是 AI', 'limit', [1,3,2,0,1]),
    o('几乎总是 AI', 'pause', [3,7,4,1,3], ['dependency','replacement'], ['first_process_replaced']),
  ]),
  q('wr_q44', 'writing-report', 'behavioral', '脱离AI可完成度', '你觉得你在\"写作\"和\"编辑 AI 输出\"这两件事上，哪个花的时间多？', ['deep'], 44, [
    o('写作花的时间明显更多', 'continue', [0,0,0,0,0]),
    o('差不多', 'limit', [1,2,2,2,1]),
    o('编辑 AI 输出花的时间更多，我基本不自己写了', 'pause', [3,7,6,6,6], ['replacement','dependency'], ['core_step_fully_replaced']),
  ]),
  q('wr_q45', 'writing-report', 'scenario', '依赖惯性', '朋友问你为什么写作那么依赖 AI，你会怎么回答？', ['deep'], 45, [
    o('我没有很依赖，该自己写的还是自己写', 'continue', [0,0,0,0,0]),
    o('它确实能帮我省时间，但核心还是我', 'limit', [0,1,1,1,1]),
    o('不用 AI 效率太低了，没必要自己从头写', 'pause', [2,4,4,4,3], ['dependency']),
  ]),
];

// ====== 学习与资料整理场景 (learning-research) ======
const lrQuestions: QDef[] = [
  // Core 8 (quick + standard + deep)
  q('lr_q01', 'learning-research', 'behavioral', '起始方式', '面对一篇新的学习资料，你通常怎么开始？', ['quick','standard','deep'], 1, [
    o('自己先通读一遍，标注重点和疑问', 'continue', [0,0,0,0,1]),
    o('先快速浏览，然后让 AI 帮我总结要点', 'limit', [2,3,2,0,2], ['replacement'], ['first_process_replaced']),
    o('直接把文章发给 AI，让它给我总结', 'pause', [5,6,3,0,4], ['replacement','dependency'], ['core_step_fully_replaced']),
  ]),
  q('lr_q02', 'learning-research', 'behavioral', '脱离AI可完成度', '不用 AI，你能不能自己读完一篇专业文章并整理出要点？', ['quick','standard','deep'], 2, [
    o('可以，这是基本功', 'continue', [0,0,0,0,1]),
    o('可以，但会比较慢，而且可能漏掉一些', 'limit', [1,2,2,1,2], ['weakening']),
    o('比较困难，我现在更习惯 AI 帮我概括', 'pause', [4,6,4,3,5], ['replacement','dependency'], ['cannot_finish_without_ai']),
  ]),
  q('lr_q03', 'learning-research', 'behavioral', 'AI介入位置', '你的学习笔记通常是怎么生成的？', ['quick','standard','deep'], 3, [
    o('自己边读边写，AI 只帮我整理格式', 'continue', [0,0,0,1,0]),
    o('自己写核心，让 AI 帮我补充和扩展', 'limit', [0,2,1,2,1], ['weakening']),
    o('主要靠 AI 生成摘要和笔记，我再筛选', 'pause', [5,6,4,3,6], ['replacement','dependency'], ['first_process_replaced']),
  ]),
  q('lr_q04', 'learning-research', 'behavioral', '关键过程承担', '当 AI 给你总结完一篇文章后，你还会去读原文吗？', ['quick','standard','deep'], 4, [
    o('会，而且会对照原文确认 AI 总结是否准确', 'continue', [0,0,0,0,1]),
    o('偶尔看，但主要信任 AI 的总结', 'limit', [2,3,1,0,2], ['dependency'], ['dependency_signal_detected']),
    o('基本不看了，AI 的总结够用了', 'pause', [5,6,2,0,5], ['dependency','replacement'], ['core_step_fully_replaced']),
  ]),
  q('lr_q05', 'learning-research', 'behavioral', '依赖惯性', '如果现在要求你学习一个新领域的知识，但不能用 AI，你的第一反应是？', ['quick','standard','deep'], 5, [
    o('没问题，学习方法还在', 'continue', [0,0,0,0,0]),
    o('会有点不舒服，但知道怎么做', 'limit', [0,2,1,1,1], ['weakening']),
    o('不太确定从哪里开始，平时都是 AI 带路', 'pause', [4,7,6,2,4], ['dependency'], ['cannot_finish_without_ai']),
  ]),
  q('lr_q06', 'learning-research', 'scenario', '关键过程承担', '你在准备一门考试，需要复习一学期的课程内容。你会？', ['quick','standard','deep'], 6, [
    o('先自己梳理大纲，理清知识结构，再针对薄弱点复习', 'continue', [0,0,0,0,1]),
    o('让 AI 帮我整理知识点和重点，我在此基础上复习', 'limit', [1,3,3,0,2], ['replacement'], ['first_process_replaced']),
    o('直接让 AI 给我生成复习提纲和要点，我背就行了', 'pause', [4,7,6,2,6], ['replacement','dependency'], ['core_step_fully_replaced']),
  ]),
  q('lr_q07', 'learning-research', 'self_check', 'AI介入位置', '诚实评价：你在学习时，AI 帮你的比例大概占多少？', ['quick','standard','deep'], 7, [
    o('20% 以下，主要还是靠自己', 'continue', [0,0,0,0,0]),
    o('40-60%，在不少环节用了 AI', 'limit', [1,2,2,1,2], ['weakening']),
    o('60% 以上，AI 已经是我学习的核心工具', 'pause', [4,6,5,3,5], ['replacement','dependency'], ['dependency_signal_detected']),
  ]),
  q('lr_q08', 'learning-research', 'scenario', '脱离AI可完成度', '你读了一篇很长的研究论文，朋友问你核心观点是什么。没有 AI 帮忙总结的话，你能说清楚吗？', ['quick','standard','deep'], 8, [
    o('能，我一直自己提炼核心观点', 'continue', [0,0,0,0,0]),
    o('大概能说个七八成，细节可能记不清', 'limit', [1,2,0,0,1], ['weakening']),
    o('不太能，这种长文我习惯让 AI 帮我消化', 'pause', [4,6,2,0,5], ['dependency'], ['cannot_finish_without_ai']),
  ]),

  // Standard 12 (standard + deep)
  q('lr_q09', 'learning-research', 'behavioral', '关键过程承担', '你在学习过程中，遇到不懂的概念通常怎么办？', ['standard','deep'], 9, [
    o('自己去查资料，尝试独立理解', 'continue', [0,0,0,0,0]),
    o('先自己想一想，不懂再问 AI', 'limit', [0,1,0,0,0]),
    o('直接问 AI，让它用简单的方式解释', 'pause', [3,5,1,0,2], ['replacement'], ['first_process_replaced']),
  ]),
  q('lr_q10', 'learning-research', 'self_check', '起始方式', '你上一次完完整整读完一本书（不用 AI 辅助）是什么时候？', ['standard','deep'], 10, [
    o('最近三个月', 'continue', [0,0,0,0,0]),
    o('半年以内', 'limit', [0,1,0,0,0], ['weakening']),
    o('超过一年，或者不记得了', 'pause', [2,4,0,0,2], ['dependency']),
  ]),
  q('lr_q11', 'learning-research', 'scenario', 'AI介入位置', '你要写一篇读书报告。以下做法最接近你的是？', ['standard','deep'], 11, [
    o('看完书后自己归纳观点，用自己的话写', 'continue', [0,0,0,0,0]),
    o('看完书后让 AI 帮我梳理框架，然后自己填充', 'limit', [0,2,3,1,2], ['replacement']),
    o('大致翻一下，让 AI 写主要内容，我再调整', 'pause', [5,7,6,3,6], ['replacement','dependency'], ['core_step_fully_replaced']),
  ]),
  q('lr_q12', 'learning-research', 'behavioral', '依赖惯性', '你现在遇到问题，\"先问 AI\"是你的第几个反应？', ['standard','deep'], 12, [
    o('第二个或第三个，先自己想办法', 'continue', [0,0,0,0,0]),
    o('通常是第二个，先想一下再问', 'limit', [0,1,0,0,0]),
    o('第一个反应就是问 AI', 'pause', [2,6,4,0,3], ['dependency'], ['first_process_replaced','dependency_signal_detected']),
  ]),
  q('lr_q13', 'learning-research', 'self_check', '关键过程承担', '你能分辨出 AI 给你总结的内容中哪些是对的、哪些是它编的吗？', ['standard','deep'], 13, [
    o('能，我保持怀疑习惯', 'continue', [0,0,0,0,1]),
    o('大概能，有时候不确定', 'limit', [1,1,0,0,2], ['weakening']),
    o('不太能，基本照单全收', 'pause', [4,4,0,0,5], ['dependency']),
  ]),
  q('lr_q14', 'learning-research', 'scenario', '脱离AI可完成度', '你需要给团队做一个技术分享。没有 AI 辅助，你能准备出来吗？', ['standard','deep'], 14, [
    o('能，以前经常做', 'continue', [0,0,0,0,0]),
    o('能，但内容深度和结构可能差一些', 'limit', [0,2,2,2,1], ['weakening']),
    o('会比较困难，平时都是 AI 帮我准备的', 'pause', [3,6,5,4,5], ['dependency'], ['cannot_finish_without_ai']),
  ]),
  q('lr_q15', 'learning-research', 'behavioral', 'AI介入位置', '你学习一门新技能时，AI 通常扮演什么角色？', ['standard','deep'], 15, [
    o('偶尔参考，主要是辅助查资料', 'continue', [0,0,0,0,0]),
    o('帮我规划和推荐学习路线', 'limit', [1,2,3,0,1]),
    o('直接教学，我听 AI 的', 'pause', [4,6,5,0,4], ['replacement','dependency'], ['first_process_replaced']),
  ]),
  q('lr_q16', 'learning-research', 'self_check', '起始方式', '看视频课时，你会不会边看边让 AI 做笔记？', ['standard','deep'], 16, [
    o('不会，我自己记笔记', 'continue', [0,0,0,0,0]),
    o('偶尔，特别忙的时候', 'limit', [1,1,0,1,0]),
    o('经常，已经习惯让 AI 帮我做笔记了', 'pause', [3,4,2,3,3], ['dependency'], ['dependency_signal_detected']),
  ]),
  q('lr_q17', 'learning-research', 'scenario', '依赖惯性', '你被要求独立分析一份行业报告（不看 AI 总结）。你的感受是？', ['standard','deep'], 17, [
    o('正常，这是该做的', 'continue', [0,0,0,0,0]),
    o('有点费劲但还是能做到', 'limit', [1,2,1,1,1], ['weakening']),
    o('觉得很麻烦，平时都是 AI 做的', 'pause', [3,6,3,3,4], ['dependency']),
  ]),
  q('lr_q18', 'learning-research', 'behavioral', '关键过程承担', 'AI 帮你归纳的内容，你会用自己的话重新组织一遍吗？', ['standard','deep'], 18, [
    o('会，我坚持用自己的语言重新组织', 'continue', [0,0,0,0,0]),
    o('部分会，重要的地方会改', 'limit', [0,1,0,1,1], ['weakening']),
    o('基本不会，AI 的组织已经很清晰了', 'pause', [3,4,2,2,3], ['dependency']),
  ]),
  q('lr_q19', 'learning-research', 'self_check', '脱离AI可完成度', '过去一年里，你觉得自己独立学习新知识的能力？', ['standard','deep'], 19, [
    o('保持或提升', 'continue', [0,0,0,0,0]),
    o('略有下降', 'limit', [0,1,1,1,1]),
    o('明显退步', 'pause', [2,4,3,3,3], ['dependency']),
  ]),
  q('lr_q20', 'learning-research', 'scenario', 'AI介入位置', '你在做研究时，AI 输出的\"相关文献\"和\"引用\"，你会核实吗？', ['standard','deep'], 20, [
    o('会逐个核实', 'continue', [0,0,0,0,0]),
    o('重要的会核实', 'limit', [0,0,0,0,1], ['weakening']),
    o('基本不会，看起来靠谱就用', 'pause', [3,3,0,0,4], ['dependency']),
  ]),

  // Deep 25 (deep only)
  q('lr_q21', 'learning-research', 'behavioral', '起始方式', '当你开始学习一个新课题，你会先自己画一个知识图谱还是让 AI 帮你画？', ['deep'], 21, [
    o('自己画，这本身就是理解过程', 'continue', [0,0,0,0,0]),
    o('自己先画个大概，然后让 AI 补充', 'limit', [0,1,1,1,1]),
    o('直接让 AI 画，我对照着学', 'pause', [3,5,4,0,3], ['replacement'], ['first_process_replaced']),
  ]),
  q('lr_q22', 'learning-research', 'self_check', '关键过程承担', '你在学习中最享受的是哪个环节？', ['deep'], 22, [
    o('自己把复杂的东西理清楚的那一刻', 'continue', [0,0,0,0,0]),
    o('快速掌握核心要点然后能用上', 'limit', [0,0,1,0,0]),
    o('AI 帮我整理好，我直接看结论', 'pause', [3,4,3,1,3], ['dependency']),
  ]),
  q('lr_q23', 'learning-research', 'scenario', '依赖惯性', '你被邀请去讨论一个话题，你准备的方式是？', ['deep'], 23, [
    o('仔细研究话题，形成自己的观点', 'continue', [0,0,0,0,0]),
    o('让 AI 帮我整理资料和论据', 'limit', [1,3,2,0,1]),
    o('让 AI 生成完整的发言提纲和观点', 'pause', [4,6,5,0,5], ['replacement','dependency']),
  ]),
  q('lr_q24', 'learning-research', 'behavioral', 'AI介入位置', '你遇到一个需要深入思考的问题时，会先自己琢磨还是先看 AI 怎么说？', ['deep'], 24, [
    o('先自己琢磨，实在想不通再求助', 'continue', [0,0,0,0,0]),
    o('先想五分钟，没有头绪就问 AI', 'limit', [0,2,1,0,0]),
    o('直接问 AI，看它的思路', 'pause', [3,7,3,0,3], ['replacement','dependency'], ['first_process_replaced']),
  ]),
  q('lr_q25', 'learning-research', 'self_check', '脱离AI可完成度', '你觉得你现在的\"学习能力\"和\"借助 AI 学习的能力\"，哪个更强？', ['deep'], 25, [
    o('前者的底子还在', 'continue', [0,0,0,0,0]),
    o('两者差不多', 'limit', [0,1,1,1,1], ['weakening']),
    o('后者明显更强，前者已经不太行了', 'pause', [3,5,4,3,4], ['dependency']),
  ]),
  q('lr_q26', 'learning-research', 'scenario', '起始方式', '你要准备一个资格考试，备考策略是？', ['deep'], 26, [
    o('先通读教材，做真题，发现问题再针对复习', 'continue', [0,0,0,1,0]),
    o('让 AI 帮我制定学习计划和重点', 'limit', [0,2,3,1,1]),
    o('让 AI 直接给我总结考点和模拟答案', 'pause', [4,6,5,3,5], ['replacement','dependency']),
  ]),
  q('lr_q27', 'learning-research', 'behavioral', '关键过程承担', '你在学习过程中做决策（比如学什么、怎么学）时，依赖谁？', ['deep'], 27, [
    o('主要靠自己判断', 'continue', [0,0,0,0,0]),
    o('参考 AI 的建议，但最终自己决定', 'limit', [0,1,1,0,0]),
    o('基本上按 AI 推荐的来', 'pause', [3,5,4,1,3], ['dependency','replacement']),
  ]),
  q('lr_q28', 'learning-research', 'self_check', 'AI介入位置', '你最近一次\"不用 AI 靠自己学通一个难点\"的经历是什么时候？', ['deep'], 28, [
    o('最近一个月', 'continue', [0,0,0,1,0]),
    o('三个月以内', 'limit', [0,1,0,1,0], ['weakening']),
    o('很久没有了，基本遇到困难就问 AI', 'pause', [2,5,2,3,3], ['dependency']),
  ]),
  q('lr_q29', 'learning-research', 'scenario', '依赖惯性', '如果让你参加一个研讨会，不能提前让 AI 帮你准备，你的感觉是？', ['deep'], 29, [
    o('正常参与，不需要 AI 也能交流', 'continue', [0,0,0,0,0]),
    o('有点紧张，但应该还好', 'limit', [0,1,1,1,1]),
    o('很不安，担心自己说不出有深度的话', 'pause', [2,5,3,3,3], ['dependency']),
  ]),
  q('lr_q30', 'learning-research', 'behavioral', '起始方式', '看到一篇好文章，你的阅读习惯是？', ['deep'], 30, [
    o('从头到尾认真读完', 'continue', [0,0,0,0,0]),
    o('先看摘要和标题，有意思的细读', 'limit', [0,0,0,0,1]),
    o('先让 AI 总结，觉得有用再看原文', 'pause', [4,5,2,0,3], ['replacement','dependency'], ['first_process_replaced']),
  ]),
  q('lr_q31', 'learning-research', 'self_check', '关键过程承担', '你在阅读时，碰到不熟悉的词汇会？', ['deep'], 31, [
    o('自己查字典或查资料', 'continue', [0,0,0,0,0]),
    o('记下来，之后再查或问 AI', 'limit', [0,0,0,0,0]),
    o('直接让 AI 翻译或解释', 'pause', [2,3,1,0,1], ['dependency']),
  ]),
  q('lr_q32', 'learning-research', 'scenario', '脱离AI可完成度', '你被要求在一天内学完一份培训材料并做汇报。不靠 AI，你能行吗？', ['deep'], 32, [
    o('能, 快速阅读和抓重点是基本能力', 'continue', [0,0,0,0,0]),
    o('能，但全面性和深度会下降', 'limit', [1,1,2,2,1]),
    o('不太行，我现在阅读量大一点就想开 AI', 'pause', [3,5,4,4,4], ['dependency'], ['cannot_finish_without_ai']),
  ]),
  q('lr_q33', 'learning-research', 'behavioral', 'AI介入位置', '你觉得自己最有成就感的学习时刻是？', ['deep'], 33, [
    o('自己把一个难题想通的时候', 'continue', [0,0,0,0,0]),
    o('用 AI 高效完成任务的时候', 'limit', [0,0,1,1,1]),
    o('AI 帮我理解了一个本来不懂的东西', 'pause', [2,3,1,1,1], ['dependency']),
  ]),
  q('lr_q34', 'learning-research', 'self_check', '依赖惯性', '你有没有因为用 AI 而放弃学习某项原本想学的技能？', ['deep'], 34, [
    o('没有', 'continue', [0,0,0,0,0]),
    o('有些东西确实想学但没有动力了', 'limit', [0,1,1,1,1], ['weakening']),
    o('有不少，已经习惯用 AI 替代了', 'pause', [2,4,3,4,3], ['dependency']),
  ]),
  q('lr_q35', 'learning-research', 'scenario', '起始方式', '你报了一门在线课程。你会怎么学？', ['deep'], 35, [
    o('认真看视频、做笔记、完成作业', 'continue', [0,0,0,0,0]),
    o('边看边用 AI 辅助做笔记和练习', 'limit', [0,1,0,1,0]),
    o('让 AI 看课程内容然后直接给我总结', 'pause', [5,6,3,2,5], ['replacement','dependency'], ['core_step_fully_replaced']),
  ]),
  q('lr_q36', 'learning-research', 'behavioral', '关键过程承担', '学习新知识时，你更相信自己的理解还是 AI 的解释？', ['deep'], 36, [
    o('自己的理解为主，AI 仅供参考', 'continue', [0,0,0,0,0]),
    o('两者都参考，谁说得清楚信谁', 'limit', [0,1,1,0,1]),
    o('更相信 AI，它解释得比我好', 'pause', [3,5,2,0,3], ['dependency']),
  ]),
  q('lr_q37', 'learning-research', 'self_check', 'AI介入位置', '在学习时你是否经常跳过\"自己尝试\"直接看 AI 的答案？', ['deep'], 37, [
    o('不会，我坚持自己先试', 'continue', [0,0,0,0,0]),
    o('有时候会，特别是时间紧的时候', 'limit', [1,2,0,1,1], ['weakening']),
    o('经常，已经习惯了', 'pause', [3,5,3,3,4], ['dependency','replacement'], ['first_process_replaced']),
  ]),
  q('lr_q38', 'learning-research', 'scenario', '脱离AI可完成度', '你需要在团队面前分享你的学习心得。不靠 AI，你的分享会是什么水平？', ['deep'], 38, [
    o('有深度的个人见解', 'continue', [0,0,0,0,0]),
    o('比较系统但可能不够深入', 'limit', [0,1,1,1,1]),
    o('可能比较表面，平时都是 AI 帮我总结的', 'pause', [3,5,3,3,4], ['dependency']),
  ]),
  q('lr_q39', 'learning-research', 'behavioral', '依赖惯性', '过去半年里，你有没有刻意\"停用 AI 学习\"的经历？', ['deep'], 39, [
    o('有，我定期这样做', 'continue', [0,0,0,0,0]),
    o('偶尔会，但没有固定习惯', 'limit', [0,1,1,1,1]),
    o('没有，AI 已经融入学习过程了', 'pause', [2,4,3,2,3], ['dependency']),
  ]),
  q('lr_q40', 'learning-research', 'self_check', '起始方式', '你现在新学一个东西，第一个打开的软件是？', ['deep'], 40, [
    o('笔记软件或搜索引擎', 'continue', [0,0,0,0,0]),
    o('搜索引擎和 AI 一起用', 'limit', [0,1,1,0,0]),
    o('AI 对话窗', 'pause', [3,5,4,0,2], ['dependency','replacement'], ['first_process_replaced']),
  ]),
  q('lr_q41', 'learning-research', 'scenario', '关键过程承担', '你要用自己的话向别人解释一个你刚学到的概念。不靠 AI，你能说清楚吗？', ['deep'], 41, [
    o('能，用自己的话解释是很好的学习方式', 'continue', [0,0,0,0,0]),
    o('大概能，有些细节需要确认', 'limit', [0,1,0,0,1], ['weakening']),
    o('比较难，因为我还没自己消化', 'pause', [3,5,2,1,4], ['dependency']),
  ]),
  q('lr_q42', 'learning-research', 'behavioral', 'AI介入位置', 'AI 说你理解了某个概念，你自己觉得真的理解了吗？', ['deep'], 42, [
    o('我很清楚自己哪里懂哪里不懂', 'continue', [0,0,0,0,1]),
    o('大多数时候知道，偶尔会高估', 'limit', [0,1,0,0,1]),
    o('说实话不太确定，AI 说我懂我就觉得懂了', 'pause', [3,4,0,0,4], ['dependency']),
  ]),
  q('lr_q43', 'learning-research', 'self_check', '依赖惯性', '你会不会觉得\"没有 AI 推荐我就不太知道该学什么\"？', ['deep'], 43, [
    o('不会，我有自己的学习方向', 'continue', [0,0,0,0,0]),
    o('有时候会参考 AI 的建议', 'limit', [0,1,1,0,0]),
    o('会的，我主要跟着 AI 的推荐走', 'pause', [2,4,3,0,2], ['dependency']),
  ]),
  q('lr_q44', 'learning-research', 'scenario', '脱离AI可完成度', '你需要在 2 小时内看完一份 50 页的报告并提出自己的意见。没有 AI 行吗？', ['deep'], 44, [
    o('可以，快速阅读+提炼观点是我的基本技能', 'continue', [0,0,0,0,0]),
    o('勉强可以，但质量和速度都会打折扣', 'limit', [1,2,2,2,2]),
    o('不行，我习惯 AI 帮我读了', 'pause', [4,6,4,4,5], ['dependency'], ['cannot_finish_without_ai']),
  ]),
  q('lr_q45', 'learning-research', 'behavioral', '关键过程承担', '你学习完之后，检验自己\"真的掌握了\"的方式是？', ['deep'], 45, [
    o('不看资料，自己复述一遍', 'continue', [0,0,0,0,0]),
    o('做练习题或实际应用', 'limit', [0,0,0,1,0]),
    o('让 AI 给我出题测试', 'pause', [1,2,1,1,2], ['dependency']),
  ]),
];

// For brevity, basic-coding and basic-data questions follow the same pattern.
// I'll create them with ~20 core questions each plus deep extensions.
// The full seed file would be prohibitively long inline; I'll generate the
// remaining questions programmatically using templates.

// 根据题目类别生成差异化的维度分数
function dimsForCategory(cat: string, domain: 'coding' | 'data'): { healthy: DimScores; mild: DimScores; severe: DimScores } {
  const emphasis = (u: number, t: number, o: number, e: number, j: number): DimScores => [u, t, o, e, j];
  switch (cat) {
    case '起始方式':
      return { healthy: emphasis(0,0,0,1,0), mild: emphasis(1,3,2,1,1), severe: emphasis(3,7,4,2,3) };
    case '关键过程承担':
      return { healthy: emphasis(0,0,0,0,0), mild: emphasis(2,2,2,2,1), severe: domain==='coding' ? emphasis(4,5,5,5,4) : emphasis(4,3,3,5,4) };
    case 'AI介入位置':
      return { healthy: emphasis(0,0,0,0,0), mild: emphasis(1,2,1,2,1), severe: emphasis(3,5,4,4,4) };
    case '脱离AI可完成度':
      return { healthy: emphasis(0,0,0,0,0), mild: emphasis(1,1,1,2,1), severe: emphasis(3,5,3,6,4) };
    case '依赖惯性':
      return { healthy: emphasis(0,0,0,0,0), mild: emphasis(0,2,1,1,1), severe: emphasis(2,5,3,3,3) };
    default:
      return { healthy: emphasis(0,0,0,0,0), mild: emphasis(1,2,2,2,1), severe: emphasis(3,5,4,4,4) };
  }
}

function generateCodeQuestions(): QDef[] {
  const result: QDef[] = [];
  let sort = 0;

  const scenes = [
    { id: 'basic-coding', name: '基础编程' },
    { id: 'basic-data', name: '基础数据处理' },
  ];

  for (const scene of scenes) {
    const sid = scene.id === 'basic-coding' ? 'bc' : 'bd';
    sort = 0;

    if (scene.id === 'basic-coding') {
      // Quick (8)
      result.push(q(`${sid}_q01`, scene.id, 'behavioral', '起始方式', '遇到一个编程任务，你通常怎么开始？', ['quick','standard','deep'], ++sort, [
        o('先自己分析需求，想清楚逻辑再动手', 'continue', [0,0,1,0,1]),
        o('先问 AI 给一个框架或方案', 'limit', [1,3,5,2,2], ['replacement'], ['first_process_replaced']),
        o('直接让 AI 写代码，我来看结果', 'pause', [3,7,7,5,6], ['replacement','dependency'], ['core_step_fully_replaced','cannot_finish_without_ai']),
      ]));
      result.push(q(`${sid}_q02`, scene.id, 'behavioral', '脱离AI可完成度', '不借助 AI，你能不能独立写出一个简单功能的代码？', ['quick','standard','deep'], ++sort, [
        o('可以，简单功能我能自己实现', 'continue', [0,0,0,0,0]),
        o('比较吃力，我现在更习惯让 AI 写', 'limit', [1,3,2,3,2], ['weakening','dependency']),
        o('不太行，我已经不自己写代码了', 'pause', [3,6,5,7,6], ['replacement','dependency'], ['cannot_finish_without_ai','core_step_fully_replaced']),
      ]));
      result.push(q(`${sid}_q03`, scene.id, 'behavioral', 'AI介入位置', '代码出 bug 时，你通常怎么做？', ['quick','standard','deep'], ++sort, [
        o('先自己读报错、加 log，排查不出来再求助 AI', 'continue', [0,0,1,2,1]),
        o('直接把报错信息贴给 AI，让它帮我看', 'limit', [1,3,3,2,2], ['replacement'], ['first_process_replaced']),
        o('几乎总是让 AI 来调试，我只看结果', 'pause', [3,7,5,5,5], ['replacement','dependency'], ['core_step_fully_replaced','cannot_finish_without_ai']),
      ]));
      result.push(q(`${sid}_q04`, scene.id, 'behavioral', '关键过程承担', 'AI 给你生成了一段代码，你能看懂并修改吗？', ['quick','standard','deep'], ++sort, [
        o('基本能看懂，可以自行修改', 'continue', [0,0,1,1,0]),
        o('大概能看懂，但改起来不太有把握', 'limit', [1,2,2,2,1], ['weakening']),
        o('不太能，能用就行', 'pause', [4,5,4,4,4], ['dependency']),
      ]));
      result.push(q(`${sid}_q05`, scene.id, 'behavioral', '依赖惯性', '编程时如果不能先问 AI，你通常会怎样？', ['quick','standard','deep'], ++sort, [
        o('只是写得慢一些，但还能自己写出基础代码', 'continue', [0,1,1,1,1]),
        o('会比较吃力，很多基础逻辑要想很久', 'limit', [1,4,3,3,2], ['dependency'], ['dependency_signal_detected']),
        o('基本不会了，我的编程能力退化了很多', 'pause', [3,7,6,7,6], ['dependency'], ['cannot_finish_without_ai']),
      ]));
      result.push(q(`${sid}_q06`, scene.id, 'scenario', '起始方式', '你的主管让你实现一个新功能，没有详细说明。你首先做什么？', ['quick','standard','deep'], ++sort, [
        o('自己分析需求，画出流程', 'continue', [0,0,1,0,1]),
        o('先让 AI 帮我理解需求并给出方案', 'limit', [2,3,4,1,2], ['replacement'], ['first_process_replaced']),
        o('直接把需求描述发给 AI 让它写', 'pause', [4,7,6,5,6], ['replacement','dependency'], ['core_step_fully_replaced']),
      ]));
      result.push(q(`${sid}_q07`, scene.id, 'self_check', '关键过程承担', '你能在没有 AI 的情况下，写出一个 API 接口吗？', ['quick','standard','deep'], ++sort, [
        o('能，这是基本操作', 'continue', [0,0,0,0,0]),
        o('能，但可能需要查一下语法', 'limit', [0,1,0,1,0]),
        o('不太确定，我平时都是 AI 写的', 'pause', [2,5,3,6,4], ['dependency'], ['cannot_finish_without_ai']),
      ]));
      result.push(q(`${sid}_q08`, scene.id, 'scenario', '依赖惯性', '如果公司要求接下来一个月同事之间不能用 AI 写代码，你的反应是？', ['quick','standard','deep'], ++sort, [
        o('没问题，我还是能独立开发的', 'continue', [0,0,0,1,0]),
        o('效率会下降，但应该还能撑住', 'limit', [0,2,1,2,1]),
        o('会很慌，我可能会很吃力', 'pause', [2,6,4,6,4], ['dependency'], ['cannot_finish_without_ai']),
      ]));

      // Standard (12 more = 20 total)
      result.push(q(`${sid}_q09`, scene.id, 'behavioral', '关键过程承担', '你写代码时，逻辑结构是自己设计的还是 AI 设计的？', ['standard','deep'], ++sort, [
        o('主要自己设计，AI 辅助实现', 'continue', [0,0,0,1,0]),
        o('自己设计大致方向，AI 补细节', 'limit', [0,2,2,2,1]),
        o('基本 AI 设计，我负责拼装', 'pause', [3,6,6,4,5], ['replacement','dependency'], ['core_step_fully_replaced']),
      ]));
      result.push(q(`${sid}_q10`, scene.id, 'self_check', 'AI介入位置', '你最近写的一段完全没借助 AI 的代码是什么时候？', ['standard','deep'], ++sort, [
        o('最近一周', 'continue', [0,0,0,0,0]),
        o('一个月以内', 'limit', [0,1,0,1,0]),
        o('超过一个月，或记不清了', 'pause', [2,4,2,4,3], ['dependency']),
      ]));
      result.push(q(`${sid}_q11`, scene.id, 'scenario', '起始方式', '老板让你评估一个新技术的可行性。你首先做什么？', ['standard','deep'], ++sort, [
        o('自己查文档、做实验', 'continue', [0,0,0,1,0]),
        o('先问 AI 这个技术是什么', 'limit', [2,3,1,0,1], ['replacement']),
        o('让 AI 帮我出一份评估报告', 'pause', [4,7,4,2,5], ['replacement','dependency'], ['first_process_replaced']),
      ]));
      result.push(q(`${sid}_q12`, scene.id, 'behavioral', '脱离AI可完成度', '你要写一个简单的自动化脚本。用 AI 吗？', ['standard','deep'], ++sort, [
        o('不用，脚本我自己就能写', 'continue', [0,0,0,0,0]),
        o('看情况，简单的不加，复杂的用一下', 'limit', [0,1,0,1,0]),
        o('用，哪怕简单脚本也习惯让 AI 写了', 'pause', [2,4,3,4,3], ['dependency'], ['dependency_signal_detected']),
      ]));
      result.push(q(`${sid}_q13`, scene.id, 'self_check', '关键过程承担', '看着 AI 写的代码，你能识别出它的设计模式吗？', ['standard','deep'], ++sort, [
        o('能，我了解常见设计模式', 'continue', [0,0,0,0,0]),
        o('能看懂部分', 'limit', [0,1,1,0,0]),
        o('不太会看，能用就行', 'pause', [3,4,3,2,3], ['dependency']),
      ]));
      result.push(q(`${sid}_q14`, scene.id, 'scenario', 'AI介入位置', '代码 review 时，你给同事的 comment 是自己写的还是 AI 出的？', ['standard','deep'], ++sort, [
        o('自己写的', 'continue', [0,0,0,0,0]),
        o('自己写主体，AI 帮忙润色', 'limit', [0,0,0,1,0]),
        o('让 AI 给我出 review 意见', 'pause', [3,5,3,2,4], ['replacement','dependency']),
      ]));
      result.push(q(`${sid}_q15`, scene.id, 'behavioral', '依赖惯性', '你的 IDE 自动补全功能坏了，你的编程效率会受到多大影响？', ['standard','deep'], ++sort, [
        o('基本不影响，我习惯自己写', 'continue', [0,0,0,0,0]),
        o('会影响，但还能接受', 'limit', [0,1,0,1,0]),
        o('严重影响，我基本上靠 AI 补全', 'pause', [2,4,2,5,3], ['dependency'], ['dependency_signal_detected']),
      ]));
      result.push(q(`${sid}_q16`, scene.id, 'self_check', '起始方式', '你打开编辑器准备写代码时，第一个动作是？', ['standard','deep'], ++sort, [
        o('开始写代码或画流程图', 'continue', [0,0,0,0,0]),
        o('打开 AI 对话窗', 'limit', [1,3,2,0,1], ['replacement'], ['first_process_replaced']),
        o('复制需求到 AI 对话框', 'pause', [3,6,5,3,4], ['replacement','dependency'], ['first_process_replaced']),
      ]));
      result.push(q(`${sid}_q17`, scene.id, 'scenario', '脱离AI可完成度', '你需要用一门不熟悉的语言写代码。你能靠自己查文档完成吗？', ['standard','deep'], ++sort, [
        o('能，学新语言查文档是常规操作', 'continue', [0,0,0,1,0]),
        o('能，但需要有 AI 辅助', 'limit', [0,2,1,2,1]),
        o('不太能，我都是让 AI 帮我写', 'pause', [3,5,4,5,4], ['dependency'], ['cannot_finish_without_ai']),
      ]));
      result.push(q(`${sid}_q18`, scene.id, 'behavioral', 'AI介入位置', 'AI 给你的代码建议，你会先理解再用还是直接用？', ['standard','deep'], ++sort, [
        o('一定先理解再用', 'continue', [0,0,0,0,0]),
        o('重要的会理解，简单的直接用', 'limit', [0,1,0,1,0]),
        o('基本直接用，能用就行', 'pause', [4,5,3,3,4], ['dependency']),
      ]));
      result.push(q(`${sid}_q19`, scene.id, 'self_check', '关键过程承担', '你觉得\"读代码\"和\"写代码\"的能力，哪个退化更明显？', ['standard','deep'], ++sort, [
        o('两个都没退化', 'continue', [0,0,0,0,0]),
        o('写代码有所退化', 'limit', [0,1,0,2,1]),
        o('两个都退化了', 'pause', [2,4,2,4,3], ['dependency']),
      ]));
      result.push(q(`${sid}_q20`, scene.id, 'scenario', '依赖惯性', '你的同事不会用 AI 写代码，你能理解他为什么不用吗？', ['standard','deep'], ++sort, [
        o('当然能理解，不用 AI 写代码很正常', 'continue', [0,0,0,0,0]),
        o('能理解，但觉得他效率比较低', 'limit', [0,1,0,1,0]),
        o('不太能理解，为什么不用？', 'pause', [2,4,2,2,2], ['dependency']),
      ]));

      // Deep (25 more = 45 total) - programming
      const deepCodeQs = [
        ['起始方式', '你拿到一个新项目时，最先做的事情是？', '先设计架构', '看 AI 的建议', '直接让 AI 出原型'],
        ['关键过程承担', '你在项目中遇到技术难点时，你自己排查的时间多还是 AI 排查的时间多？', '自己排查为主', '两者差不多', '基本靠 AI'],
        ['AI介入位置', '你写单元测试吗？怎么写？', '自己手写', 'AI 写框架我补充', '全让 AI 写'],
        ['脱离AI可完成度', '如果在一次技术面试中被要求手写代码，你的感觉是？', '没问题', '会有点紧张', '很恐慌'],
        ['依赖惯性', '你最近一次独立 debug 不靠 AI 的经历是什么时候？', '最近一周', '一个月内', '很久了'],
        ['起始方式', '产品给你一个模糊的需求，你会怎么推进？', '自己拆解需求', '让 AI 帮我理解', '让 AI 直接出方案'],
        ['关键过程承担', '你最近写的最长的一段完全自己写的代码有多长？', '超过 100 行', '50-100 行', '不超过 50 行'],
        ['AI介入位置', '你在用 GitHub Copilot 或类似工具时，接受建议的比率大概是？', '比较低，很多自己改', '一半一半', '很高，基本照收'],
        ['脱离AI可完成度', '你的 AI 编程工具突然不可用了，你能正常开发吗？', '能', '会比较慢', '基本停摆'],
        ['依赖惯性', '你现在学新技术时，是直接看文档还是先让 AI 解释？', '直接看文档', '两者结合', '先让 AI 解释'],
        ['起始方式', '你考虑用新框架时，会先自己做一个 demo 还是让 AI 帮你做？', '自己做 demo', '让 AI 做一个再改', '让 AI 全做'],
        ['关键过程承担', 'AI 给你生成的代码通过了测试，你还会仔细看它的实现吗？', '会仔细看', '大概浏览', '不会看'],
        ['AI介入位置', '你在团队中 code review，你给的意见主要来自？', '自己的经验判断', '自己的 + AI 辅助', '主要由 AI 生成'],
        ['脱离AI可完成度', '让你写出一个完整的单链表实现（不用 AI），可以吗？', '可以', '需要想一想', '不太确定'],
        ['依赖惯性', '你觉得编程的乐趣还在吗？', '在，和以前一样', '在，但依赖 AI 之后少了些', '基本没有了'],
        ['起始方式', '你如何决定一个项目用什么技术方案？', '自己评估', '自己评估+AI建议', '主要听 AI 的'],
        ['关键过程承担', '你能区分 AI 给你的代码中\"好的实现\"和\"将就能用\"吗？', '能', '大部分能', '不太能'],
        ['AI介入位置', '代码编译不过时你第一反应是？', '仔细看报错', '把报错复制给 AI', '直接让 AI 改'],
        ['脱离AI可完成度', '让你给实习生讲清楚一段代码的逻辑（不用 AI 解释），可以吗？', '可以', '需要准备一下', '比较困难'],
        ['依赖惯性', '你觉得未来 AI 会取代程序员吗？你的心态是？', '不担心，核心能力在', '有些担忧', '已经在准备转型'],
        ['起始方式', '你开始写新功能前，会不会先画流程图或写伪代码？', '会', '有时候会', '不会，直接开写'],
        ['关键过程承担', '你对项目代码的整体结构清晰吗？还是需要 AI 帮你梳理？', '很清晰', '大概知道', '靠 AI 帮我理'],
        ['AI介入位置', '当你发现系统性能瓶颈时，你会？', '自己分析', '自己分析 + AI 建议', '直接问 AI'],
        ['脱离AI可完成度', '给你一个下午，不用 AI，你能独立完成一个小项目吗？', '能', '勉强能', '不太行'],
        ['依赖惯性', '如果从现在起不能用 AI 写代码，你还想继续做开发吗？', '想', '会有点犹豫', '可能不想了'],
      ];

      let deepIdx = 21;
      deepCodeQs.forEach(([cat, title, a, b, c]) => {
        const dm = dimsForCategory(cat, 'coding');
        result.push(q(`${sid}_q${deepIdx++}`, scene.id,
          ['起始方式','AI介入位置','依赖惯性'].includes(cat) ? 'behavioral' : (cat === '脱离AI可完成度' ? 'self_check' : 'scenario'),
          cat, title, ['deep'], ++sort, [
            o(a, 'continue', dm.healthy, [], []),
            o(b, 'limit', dm.mild, ['weakening'], []),
            o(c, 'pause', dm.severe, ['replacement','dependency'], ['dependency_signal_detected']),
          ]));
      });
    }

    if (scene.id === 'basic-data') {
      // Quick (8)
      result.push(q(`${sid}_q01`, scene.id, 'behavioral', '起始方式', '拿到一份原始数据，你通常怎么开始处理？', ['quick','standard','deep'], ++sort, [
        o('先自己看数据结构，理解字段含义', 'continue', [0,1,0,0,1]),
        o('直接让 AI 帮我清洗和分析', 'limit', [2,3,3,2,2], ['replacement'], ['first_process_replaced']),
        o('把原始数据发给 AI，让它从头处理', 'pause', [4,6,5,5,5], ['replacement','dependency'], ['core_step_fully_replaced']),
      ]));
      result.push(q(`${sid}_q02`, scene.id, 'behavioral', '脱离AI可完成度', '不用 AI，你能不能独立完成基础的数据清洗和统计？', ['quick','standard','deep'], ++sort, [
        o('可以，基础操作我没问题', 'continue', [0,0,0,1,0]),
        o('比较困难，我现在习惯交给 AI 处理', 'limit', [2,3,2,4,2], ['weakening','dependency'], ['dependency_signal_detected']),
        o('基本不会了，我已经不用自己操作了', 'pause', [4,6,4,7,5], ['replacement','dependency'], ['cannot_finish_without_ai','core_step_fully_replaced']),
      ]));
      result.push(q(`${sid}_q03`, scene.id, 'behavioral', 'AI介入位置', '数据处理的判断环节（比如选统计方法、识别异常值），谁在做？', ['quick','standard','deep'], ++sort, [
        o('我自己判断，AI 只是执行工具', 'continue', [0,0,0,0,1]),
        o('AI 帮我选方法和判断，我审核结果', 'limit', [1,3,3,1,2], ['replacement'], ['dependency_signal_detected']),
        o('基本是 AI 在判断，我直接用结论', 'pause', [4,6,5,3,5], ['replacement','dependency'], ['core_step_fully_replaced','cannot_finish_without_ai']),
      ]));
      result.push(q(`${sid}_q04`, scene.id, 'behavioral', '关键过程承担', 'AI 给出分析结果后，你能不能判断它的结论是否合理？', ['quick','standard','deep'], ++sort, [
        o('能，我可以验证和质疑 AI 的结论', 'continue', [0,0,0,0,1]),
        o('比较难，我越来越倾向于直接接受', 'limit', [2,2,1,1,3], ['weakening'], ['dependency_signal_detected']),
        o('基本不能，AI 说什么就是什么', 'pause', [4,5,2,2,5], ['dependency','replacement']),
      ]));
      result.push(q(`${sid}_q05`, scene.id, 'behavioral', '依赖惯性', '处理数据时如果不能先问 AI，你通常会怎样？', ['quick','standard','deep'], ++sort, [
        o('只是处理得慢一些，但还能自己完成基础操作', 'continue', [0,1,0,1,0]),
        o('会比较困难，很多判断拿不准', 'limit', [1,3,2,3,2], ['dependency'], ['dependency_signal_detected']),
        o('基本无从下手了', 'pause', [3,6,4,6,5], ['dependency'], ['cannot_finish_without_ai']),
      ]));
      result.push(q(`${sid}_q06`, scene.id, 'scenario', '起始方式', '领导让你分析一组销售数据并给出结论。你的流程是？', ['quick','standard','deep'], ++sort, [
        o('先自己看数据，理解趋势，再决定分析方向', 'continue', [0,0,0,0,1]),
        o('先让 AI 帮我探索数据，我再验证', 'limit', [2,3,3,1,2], ['replacement'], ['first_process_replaced']),
        o('让 AI 做完整分析，我直接看结论', 'pause', [4,7,6,4,6], ['replacement','dependency'], ['core_step_fully_replaced']),
      ]));
      result.push(q(`${sid}_q07`, scene.id, 'self_check', '关键过程承担', '没有 AI 的情况下，你能发现数据中的异常值吗？', ['quick','standard','deep'], ++sort, [
        o('能', 'continue', [0,0,0,0,0]),
        o('能发现明显异常，细微的可能漏掉', 'limit', [0,1,1,1,1]),
        o('不太能，习惯 AI 告诉我', 'pause', [3,4,2,3,4], ['dependency']),
      ]));
      result.push(q(`${sid}_q08`, scene.id, 'scenario', '依赖惯性', '你的 AI 分析工具突然坏了，手头的数据要今天交。你还能搞定吗？', ['quick','standard','deep'], ++sort, [
        o('能，换个工具或不靠 AI 也能完成', 'continue', [0,0,0,0,0]),
        o('能，但效率和准确率会下降', 'limit', [0,2,1,2,1]),
        o('基本搞不定，我依赖 AI 分析', 'pause', [3,5,3,5,4], ['dependency'], ['cannot_finish_without_ai']),
      ]));

      // Standard (12 more = 20 total)
      result.push(q(`${sid}_q09`, scene.id, 'behavioral', 'AI介入位置', '你通常在数据处理中用 AI 做什么？', ['standard','deep'], ++sort, [
        o('格式整理和图表美化', 'continue', [0,0,0,0,0]),
        o('帮我写公式和脚本', 'limit', [0,1,1,2,0], ['weakening']),
        o('端到端处理，从数据进来到报告出去', 'pause', [3,5,5,5,5], ['replacement','dependency'], ['core_step_fully_replaced']),
      ]));
      result.push(q(`${sid}_q10`, scene.id, 'self_check', '起始方式', '你看到一个不熟悉的字段名，先怎么做？', ['standard','deep'], ++sort, [
        o('自己查文档或数据字典', 'continue', [0,0,0,0,0]),
        o('先问 AI', 'limit', [2,2,0,0,0], ['replacement'], ['first_process_replaced']),
        o('直接忽略，靠 AI 判断', 'pause', [4,4,2,1,3], ['dependency']),
      ]));
      result.push(q(`${sid}_q11`, scene.id, 'scenario', '脱离AI可完成度', '让你在 Excel 里用公式做一组统计，不用 AI 辅助能做到吗？', ['standard','deep'], ++sort, [
        o('能，Excel 公式我很熟练', 'continue', [0,0,0,0,0]),
        o('能做一些基本的，复杂的需要 AI', 'limit', [0,1,0,2,0]),
        o('不太能，公式都是 AI 写的', 'pause', [2,4,2,5,3], ['dependency'], ['cannot_finish_without_ai']),
      ]));
      result.push(q(`${sid}_q12`, scene.id, 'behavioral', '关键过程承担', '你对数据源的质量验证是自己做还是交给 AI？', ['standard','deep'], ++sort, [
        o('自己做，数据质量是最关键的一步', 'continue', [0,0,0,0,1]),
        o('自己做一些，让 AI 辅助检查', 'limit', [0,0,0,1,1]),
        o('交给 AI 检查，我信任它的判断', 'pause', [3,4,1,2,4], ['dependency']),
      ]));
      result.push(q(`${sid}_q13`, scene.id, 'self_check', 'AI介入位置', 'AI 生成了一份数据报告，你会核实多少内容？', ['standard','deep'], ++sort, [
        o('几乎全部核实', 'continue', [0,0,0,0,0]),
        o('关键数字和结论会核实', 'limit', [0,1,0,0,1]),
        o('基本不核实', 'pause', [4,4,0,0,4], ['dependency']),
      ]));
      result.push(q(`${sid}_q14`, scene.id, 'scenario', '依赖惯性', '让你给业务部门解释一组数据指标的含义。不靠 AI 能说清楚吗？', ['standard','deep'], ++sort, [
        o('能，数据和业务的关系我很清楚', 'continue', [0,0,0,0,1]),
        o('能说清楚大概，有些细节要确认', 'limit', [0,1,0,0,1]),
        o('不太能，平时都是 AI 帮我整理的', 'pause', [3,5,2,2,4], ['dependency']),
      ]));
      result.push(q(`${sid}_q15`, scene.id, 'behavioral', '起始方式', '你拿到一个新数据集时，你习惯用什么工具打开？', ['standard','deep'], ++sort, [
        o('Excel 或 Pandas 直接看', 'continue', [0,0,0,0,0]),
        o('看情况，复杂数据直接给 AI', 'limit', [1,2,2,1,1]),
        o('直接发给 AI 让它帮我分析', 'pause', [3,5,4,4,4], ['replacement','dependency'], ['first_process_replaced']),
      ]));
      result.push(q(`${sid}_q16`, scene.id, 'self_check', '脱离AI可完成度', '你最近一次完全手动做数据分析（不用 AI）是什么时候？', ['standard','deep'], ++sort, [
        o('最近一周', 'continue', [0,0,0,0,0]),
        o('一个月以内', 'limit', [0,1,0,1,0]),
        o('记不清了', 'pause', [2,4,2,4,3], ['dependency']),
      ]));
      result.push(q(`${sid}_q17`, scene.id, 'scenario', '关键过程承担', 'AI 告诉你一组数据的\"关键发现\"，你习惯怎么处理？', ['standard','deep'], ++sort, [
        o('自己回头去看数据确认', 'continue', [0,0,0,0,0]),
        o('重要的会去确认，简单的直接接受', 'limit', [0,1,0,0,1]),
        o('直接接受，当作自己的分析结论', 'pause', [4,4,1,1,5], ['dependency','replacement']),
      ]));
      result.push(q(`${sid}_q18`, scene.id, 'behavioral', '依赖惯性', '你对数据的\"嗅觉\"和以前比如何？', ['standard','deep'], ++sort, [
        o('更强了', 'continue', [0,0,0,0,0]),
        o('差不多', 'limit', [0,0,0,0,0]),
        o('变钝了，越来越依赖 AI 做判断', 'pause', [2,3,1,2,2], ['dependency']),
      ]));
      result.push(q(`${sid}_q19`, scene.id, 'self_check', 'AI介入位置', '你能否在不靠 AI 的情况下写出 SQL 查询？', ['standard','deep'], ++sort, [
        o('能', 'continue', [0,0,0,0,0]),
        o('能写简单的', 'limit', [0,1,0,1,0]),
        o('不太能，SQL 都是 AI 写的', 'pause', [2,4,2,4,3], ['dependency']),
      ]));
      result.push(q(`${sid}_q20`, scene.id, 'scenario', '起始方式', '你要给领导做一个数据汇报，你会怎么准备？', ['standard','deep'], ++sort, [
        o('自己分析数据，提炼观点', 'continue', [0,0,0,0,0]),
        o('让 AI 辅助分析和生成图表', 'limit', [0,1,2,1,1]),
        o('让 AI 出全套报告', 'pause', [3,5,4,4,5], ['replacement','dependency']),
      ]));

      // Deep (25 more = 45 total) - data processing
      const deepDataQs = [
        ['起始方式', '你看到一个数据可视化图表，你第一反应是让 AI 帮你解读还是自己看？', '自己看', '先自己看再让 AI 补充', '让 AI 解读'],
        ['关键过程承担', 'AI 给你写了一段数据处理脚本，你会运行前检查吗？', '会逐行看', '大概看看', '直接跑'],
        ['AI介入位置', '你做 A/B 测试分析时，假设检验的逻辑是自己判断的还是 AI 判断的？', '自己判断', '自己判断+AI 确认', 'AI 判断'],
        ['脱离AI可完成度', '给你一组数据用 Python 画 3 张图，不用 AI 行吗？', '行', '需要查文档', '不太行'],
        ['依赖惯性', '你现在看到数据的第一反应是先整理还是先丢给 AI？', '先整理', '看数据大小', '先丢给 AI'],
        ['起始方式', '你在看报表时，数据趋势是自己找的还是 AI 提示的？', '自己找', '两者都有', '主要看 AI 的'],
        ['关键过程承担', 'AI 告诉你某两个变量高度相关，你会怎么做？', '自己验证', '大概率接受', '直接当作结论'],
        ['AI介入位置', '你写数据报告时，结论部分是 AI 写的还是自己写的？', '自己写', 'AI 辅助', 'AI 写'],
        ['脱离AI可完成度', '让你用 Excel 做透视表，不用 AI 能做吗？', '能', '需要查一下', '不太会'],
        ['依赖惯性', '你的老板问你对数据的判断，你的回答是自己的想法还是 AI 的想法？', '自己的想法', '两者混合', '主要是 AI 的想法'],
        ['起始方式', '新装了数据分析软件，你怎么学？', '自己摸索+看文档', '让 AI 教我', '让 AI 帮我操作'],
        ['关键过程承担', 'AI 输出的分析结论和你的预期不一致时，你会？', '深挖原因', '两者都参考', '通常接受 AI 的'],
        ['AI介入位置', '你在数据清洗时，去重的逻辑是你写还是 AI 写？', '自己写', 'AI 写我改', 'AI 写'],
        ['脱离AI可完成度', '你还能自己写出复杂的数据透视逻辑吗？', '能', '简单的能', '不太能'],
        ['依赖惯性', '你觉得自己对数据的理解变深了还是变浅了？', '变深了', '持平', '变浅了'],
        ['起始方式', '你打开一份新数据时，最先关注什么？', '数据结构和质量', '业务含义', '让 AI 总结'],
        ['关键过程承担', 'AI 给你推荐的分析方法，你会评估它是否合适吗？', '会', '有时候会', '不会'],
        ['AI介入位置', '你的数据分析工作流中，AI 占比大概？', '<30%', '30-60%', '>60%'],
        ['脱离AI可完成度', '让你不看 AI，自己解释什么是\"统计显著性\"，可以吗？', '可以', '大概能', '不太行'],
        ['依赖惯性', '你觉得数据分析的核心判断力还在自己身上吗？', '在', '部分在', '不太在了'],
        ['起始方式', '你的数据分析项目通常从哪里开始？', '明确业务问题', '探索数据', '直接问 AI'],
        ['关键过程承担', 'AI 帮你做出分析结果后，你会追溯它的分析过程吗？', '会', '偶尔', '不会'],
        ['AI介入位置', '你做数据可视化时，配色和图表类型是自己选还是 AI 选？', '自己选', '参考 AI 建议', 'AI 选'],
        ['脱离AI可完成度', '你还能自己从头到尾完成一个数据分析项目吗（不用 AI）？', '能', '会很费力', '不太能'],
        ['依赖惯性', '如果完全不用 AI，你对数据分析还有信心吗？', '有', '有一点', '没有'],
      ];

      deepIdx = 21;
      deepDataQs.forEach(([cat, title, a, b, c]) => {
        const dm = dimsForCategory(cat, 'data');
        result.push(q(`${sid}_q${deepIdx++}`, scene.id,
          ['起始方式','AI介入位置','依赖惯性'].includes(cat) ? 'behavioral' : (cat === '脱离AI可完成度' ? 'self_check' : 'scenario'),
          cat, title, ['deep'], ++sort, [
            o(a, 'continue', dm.healthy, [], []),
            o(b, 'limit', dm.mild, ['weakening'], []),
            o(c, 'pause', dm.severe, ['replacement','dependency'], ['dependency_signal_detected']),
          ]));
      });
    }
  }

  return result;
}

const codeDataQuestions = generateCodeQuestions();

// ====== 组合全部题目 ======
const allQuestions: QDef[] = [...wrQuestions, ...lrQuestions, ...codeDataQuestions];

async function main() {
  console.log('Seeding database with multi-dimension questions...');

  // Clean
  await prisma.questionOption.deleteMany();
  await prisma.question.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.scene.deleteMany();

  // Scenes
  const scenes = [
    { id: 'writing-report', name: '写作与汇报', slug: 'writing-report', summary: '判断用户在写作与表达类任务中是否已经把关键过程交给 AI。', examples: JSON.stringify(['周报', '课程小结', '汇报提纲']), focusCapabilities: JSON.stringify(['基础理解能力', '自主思考能力', '独立拆解与组织能力']), enabled: true, sortOrder: 1 },
    { id: 'learning-research', name: '学习与资料整理', slug: 'learning-research', summary: '判断用户在理解资料、整理信息和形成笔记时是否过度依赖 AI。', examples: JSON.stringify(['读文章', '整理资料', '课程复习']), focusCapabilities: JSON.stringify(['基础理解能力', '自主思考能力']), enabled: true, sortOrder: 2 },
    { id: 'basic-coding', name: '基础编程', slug: 'basic-coding', summary: '判断用户在基础编程任务里是否把关键理解、排查和实现过程交给 AI。', examples: JSON.stringify(['改 bug', '写小功能', '读代码']), focusCapabilities: JSON.stringify(['独立拆解与组织能力', '基础操作与执行能力', '初步判断与产出能力']), enabled: true, sortOrder: 3 },
    { id: 'basic-data', name: '基础数据处理', slug: 'basic-data', summary: '判断用户在基础数据处理任务中是否已把核心判断过程外包给 AI。', examples: JSON.stringify(['表格清洗', '简单统计', '基础分析']), focusCapabilities: JSON.stringify(['基础理解能力', '基础操作与执行能力', '初步判断与产出能力']), enabled: true, sortOrder: 4 },
  ];

  for (const scene of scenes) {
    await prisma.scene.create({ data: scene });
  }

  // Questions + Options
  for (const qDef of allQuestions) {
    await prisma.question.create({
      data: {
        id: qDef.id,
        sceneId: qDef.sceneId,
        type: 'single_choice',
        questionType: qDef.questionType,
        category: qDef.category,
        title: qDef.title,
        description: qDef.description ?? null,
        weight: qDef.weight,
        isHighWeight: qDef.isHighWeight,
        depthLevels: JSON.stringify(qDef.depthLevels),
        sortOrder: qDef.sortOrder,
        enabled: true,
        options: {
          create: qDef.options.map((opt, idx) => ({
            id: `${qDef.id}_${String.fromCharCode(97 + idx)}`,
            label: opt.label,
            riskLevel: opt.riskLevel,
            riskScore: Math.round(opt.dims.reduce((a, b) => a + b, 0) / 5),
            dimensionScores: JSON.stringify({
              understanding: opt.dims[0],
              thinking: opt.dims[1],
              organization: opt.dims[2],
              execution: opt.dims[3],
              judgment: opt.dims[4],
            }),
            signals: JSON.stringify(opt.signals),
            triggerTags: JSON.stringify(opt.triggers),
            sortOrder: idx + 1,
          })),
        },
      },
    });
  }

  // Follow-ups (keep existing structure)
  const followUps = [
    { id: 'fu_wr_continue', sceneId: 'writing-report', level: 'continue', riskReasons: JSON.stringify([]), retainedCapabilities: JSON.stringify(['你能自己理解任务并启动写作。', '你能独立完成从提纲到初版的全过程。']), actionSuggestions: JSON.stringify(['继续把 AI 限制在润色、检查和补充环节。', '定期脱离 AI 独立完成一版，确认能力没有滑走。']) },
    { id: 'fu_wr_limit', sceneId: 'writing-report', level: 'limit', riskReasons: JSON.stringify(['你越来越依赖 AI 帮你启动第一步。', 'AI 已开始进入结构组织或第一版产出。']), retainedCapabilities: JSON.stringify(['你仍保留部分任务理解能力。', '你仍能完成局部修改。']), actionSuggestions: JSON.stringify(['先自己完成首轮理解和结构，再使用 AI。', '把 AI 限制在润色、检查、补充环节。', '缩减对第一版生成的依赖。']) },
    { id: 'fu_wr_pause', sceneId: 'writing-report', level: 'pause', riskReasons: JSON.stringify(['核心写作过程正被 AI 直接接管。', '你已经较难在没有 AI 的情况下独立完成最小版本。']), retainedCapabilities: JSON.stringify(['你仍可能保留局部修改和理解成品的能力。']), actionSuggestions: JSON.stringify(['先暂停让 AI 生成第一版完整内容。', '把首次理解、提纲搭建和初版输出收回自己完成。', '先从更小任务恢复独立写作能力。']) },
    { id: 'fu_lr_continue', sceneId: 'learning-research', level: 'continue', riskReasons: JSON.stringify([]), retainedCapabilities: JSON.stringify(['你能独立阅读原材料并形成自己的理解。', '你能自己提炼要点并组织信息。']), actionSuggestions: JSON.stringify(['继续把 AI 限制在补充和验证环节。', '保持定期纯手动整理资料的习惯。']) },
    { id: 'fu_lr_limit', sceneId: 'learning-research', level: 'limit', riskReasons: JSON.stringify(['你越来越依赖 AI 帮你总结和提炼信息。', '自己阅读和概括的耐心在降低。']), retainedCapabilities: JSON.stringify(['你仍能部分理解和筛选 AI 的输出。', '你对资料内容仍有一定直觉。']), actionSuggestions: JSON.stringify(['强制自己先读原文再做笔记，再让 AI 补充。', '减少对 AI 摘要的依赖，逐渐恢复自己概括的习惯。', '把 AI 限制在帮你查漏补缺的角色。']) },
    { id: 'fu_lr_pause', sceneId: 'learning-research', level: 'pause', riskReasons: JSON.stringify(['核心理解和概括过程正被 AI 替代。', '你已经很难在不借助 AI 的情况下独立读完并理解一段资料。']), retainedCapabilities: JSON.stringify(['你仍可能保留部分信息直觉和筛选能力。']), actionSuggestions: JSON.stringify(['暂停让 AI 直接替你总结资料。', '先从短文开始恢复独立阅读和概括能力。', '把理解资料的第一遍重新收回自己完成。']) },
    { id: 'fu_bc_continue', sceneId: 'basic-coding', level: 'continue', riskReasons: JSON.stringify([]), retainedCapabilities: JSON.stringify(['你能自己理解需求并编写简单代码。', '你能独立排查基础 bug。']), actionSuggestions: JSON.stringify(['继续把 AI 限制在提供建议和优化环节。', '定期独立完成小功能，确认能力没有退步。']) },
    { id: 'fu_bc_limit', sceneId: 'basic-coding', level: 'limit', riskReasons: JSON.stringify(['你越来越依赖 AI 帮你开始编码。', 'AI 已开始介入调试和问题排查的核心过程。']), retainedCapabilities: JSON.stringify(['你仍能理解 AI 生成的代码。', '你仍可做局部修改。']), actionSuggestions: JSON.stringify(['先自己分析需求和写出伪代码，再让 AI 辅助。', '把调试的第一遍留给自己，排查不出再求助 AI。', '缩减让 AI 直接写完整功能的频率。']) },
    { id: 'fu_bc_pause', sceneId: 'basic-coding', level: 'pause', riskReasons: JSON.stringify(['核心编码和调试过程正被 AI 全面接管。', '你已经较难独立完成一个简单的编程任务。']), retainedCapabilities: JSON.stringify(['你仍可能保留代码阅读和局部修改的能力。']), actionSuggestions: JSON.stringify(['暂停让 AI 直接生成代码。', '从最简单的练习开始恢复独立编码能力。', '把需求分析、方案设计和代码实现都先自己做完。']) },
    { id: 'fu_bd_continue', sceneId: 'basic-data', level: 'continue', riskReasons: JSON.stringify([]), retainedCapabilities: JSON.stringify(['你能自己判断数据质量并选择处理方法。', '你能验证 AI 分析结果的合理性。']), actionSuggestions: JSON.stringify(['继续把 AI 限制在执行和辅助环节。', '定期手动处理数据，保持对数据的直觉。']) },
    { id: 'fu_bd_limit', sceneId: 'basic-data', level: 'limit', riskReasons: JSON.stringify(['你越来越依赖 AI 帮你做数据处理的核心判断。', 'AI 已开始介入统计方法选择和异常识别。']), retainedCapabilities: JSON.stringify(['你仍能部分理解 AI 的处理过程。', '你仍能做一些基础操作。']), actionSuggestions: JSON.stringify(['先自己看数据、判断处理方向，再让 AI 执行。', '把方法选择和结果审核环节收回自己。', '减少直接让 AI 端到端处理数据的频率。']) },
    { id: 'fu_bd_pause', sceneId: 'basic-data', level: 'pause', riskReasons: JSON.stringify(['核心判断过程正被 AI 替代。', '你已经较难独立完成基础的数据清洗和分析。']), retainedCapabilities: JSON.stringify(['你仍可能保留部分数据直觉和简单操作能力。']), actionSuggestions: JSON.stringify(['暂停让 AI 端到端处理数据。', '先从最基础的数据操作恢复手动能力。', '把数据观察、方法选择和结果验证都先自己完成。']) },
  ];

  for (const fu of followUps) {
    await prisma.followUp.create({ data: fu });
  }

  // Stats
  const totalQuestions = allQuestions.length;
  const totalOptions = allQuestions.reduce((sum, q) => sum + q.options.length, 0);
  const quickCount = allQuestions.filter(q => q.depthLevels.includes('quick')).length;
  const standardCount = allQuestions.filter(q => q.depthLevels.includes('standard')).length;
  const deepCount = allQuestions.filter(q => q.depthLevels.includes('deep')).length;

  console.log(`Seed complete:`);
  console.log(`  4 scenes`);
  console.log(`  ${totalQuestions} questions (${quickCount} quick | ${standardCount} standard | ${deepCount} deep)`);
  console.log(`  ${totalOptions} options`);
  console.log(`  12 follow-ups`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
