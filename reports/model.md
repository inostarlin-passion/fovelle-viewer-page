# Fovelle 首页文案与字号调整的数学模型

## 1. 范围与已确证前提

本任务只处理首页 hero 区域的三项可观察属性：说明文案、系统要求行和语言支持行。仓库中存在两份字节级相同的静态首页：根目录的 `index.html` 和部署用的 `public/index.html`；两份页面都引用对应位置的 `styles.css`，且根目录与 `public/` 中的样式表在修改前相同。因此，为保证开发源文件和部署产物一致，将两份副本作为同一逻辑页面的两个表示同步修改。

本地检查得到以下初始事实：

1. `.hero-copy` 恰有一个段落，文本以 `Fovelle is a lightweight image viewer` 开头。
2. 下载区恰有两个 `p.system-note`：`Requires macOS 15.0 or later` 和 `Available in...` 语言支持行。
3. 两个系统说明通过 `.system-note` 选择器继承同一个 `font-size: 0.71rem`；`.download-status` 也共享该选择器组，但不是本任务的目标。
4. `.system-note` 没有固定高度，语言行允许自然换行；因此增大字号可能改变换行，但不应通过裁剪文本来满足需求。

联网多跳检索得到的外部前提：

- Fovelle 的公开 GitHub 仓库 README 将其描述为面向 macOS 的轻量图像查看器，并列出 `macOS 15.0 or later` 的系统要求：[Fovelle README](https://github.com/inostarlin-passion/Fovelle#readme)。
- 同一公开仓库包含 GPLv3 `LICENSE`；该许可证说明其授予运行、修改和传播软件的权利，并使用 “free software” 的术语：[Fovelle LICENSE](https://raw.githubusercontent.com/inostarlin-passion/Fovelle/main/LICENSE)。这支持在产品文案中称其为开源/自由软件。**“免费”作为本任务要求的产品文案断言处理，不把 GPL 的自由软件含义误当成价格保证。**
- MDN 说明 `font-size` 的 `rem` 值相对于根 `html` 字号计算，并建议使用相对用户默认字号的值以提高可访问性：[MDN `font-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-size)。W3C WAI 的 C14 技术说明也把相对字号与用户缩放能力联系起来：[WAI C14](https://www.w3.org/WAI/WCAG21/Techniques/css/C14)。
- HTML 标准把文本作为 phrasing content，并将段落作为文本运行组织单位：[WHATWG DOM — paragraphs](https://html.spec.whatwg.org/dev/dom.html#paragraphs)。因此保持文案位于原有 `<p>` 中，不以 CSS 生成文本。

## 2. 对象、输入与输出

把一个页面表示为

\[
D=(H,C,J,A,R)
\]

其中：

- `H` 是 HTML DOM 树；
- `C` 是 CSS 规则集合及其选择器匹配关系；
- `J` 是页面脚本及其加载行为；
- `A` 是本地静态资源映射；
- `R` 是浏览器根字号与视口等渲染环境。

输入为

\[
I=(D_r,D_p,U)
\]

其中 `D_r` 是根目录首页，`D_p` 是 `public/` 首页，`U` 是用户要求：

1. 两个指定系统说明行的字号适当增大；
2. `.hero-copy` 在保持原有轻量图像查看器语义的同时，明确包含“开源”和“免费”；
3. 不破坏页面结构、下载行为、轮播行为或响应式换行。

输出为

\[
O=(D'_r,D'_p)
\]

并要求根目录与 `public/` 副本保持字节级一致。

## 3. 形式化目标谓词

令 `class(v)` 表示元素节点 `v` 的 class 集合，`text(v)` 表示其后代文本串。定义目标集合：

\[
N(D)=\{v\mid v\text{ 是 }p\text{ 元素}\land\texttt{system-note}\in class(v)\}
\]

初始检查给出 `|N(D_r)|=|N(D_p)|=2`。令 `n_1` 为系统要求行，`n_2` 为语言支持行；按页面顺序：

\[
text(n_1)=\text{“Requires macOS 15.0 or later”}
\]

\[
text(n_2)\text{ 以“Available in”开头}
\]

定义 hero 文案节点 `h`：

\[
h=\operatorname{唯一节点}\{v\mid \texttt{hero-copy}\in class(v)\}
\]

定义文案谓词：

\[
P_{copy}(D):=\texttt{open-source}\subseteq text(h)\land\texttt{free}\subseteq text(h)
\]

定义字号函数 `size_C(v,R)` 为在渲染环境 `R` 下由 CSS 级联得到的计算字号。令 `r` 为 `html` 的计算字号，旧规则与新规则分别为：

\[
s_0=0.71r,\qquad s_1=0.80r
\]

故

\[
s_1>s_0,\qquad \frac{s_1}{s_0}=\frac{0.80}{0.71}\approx1.1268
\]

定义字号谓词：

\[
P_{size}(D',D):=\forall v\in N(D),\ size_{C'}(v,R)>size_C(v,R)
\]

同时要求 `.download-status` 的字号保持原值，以避免共享选择器造成无关变化：

\[
P_{scope}: size_{C'}(d,R)=size_C(d,R)
\]

其中 `d` 是 `.download-status` 唯一节点。

## 4. 变换、状态与行为

将一次确定性变换 `T` 定义为以下三个原子操作，并对根目录和 `public/` 副本分别执行相同操作：

1. 在唯一 `h` 的文本节点中，将 “Fovelle is a lightweight image viewer designed...” 改为含有 `open-source` 与 `free` 的完整句子，保留其 `<p class="hero-copy">` 结构。
2. 将共享字号规则拆为独立规则：`.download-status { font-size: 0.71rem; }` 与 `.system-note { font-size: 0.80rem; }`；保留 `.system-note` 原有 margin、颜色和选择器语义。
3. 不改动其余 HTML 节点、脚本、资源引用、页面顺序和非目标 CSS 声明。

页面状态用离散状态机表示：

\[
S_0\xrightarrow{\text{建模}}S_1\xrightarrow{\text{证明}}S_2\xrightarrow{\text{实现}}S_3\xrightarrow{\text{验证}}S_4
\]

- `S_0`：现有页面，`P_copy` 与 `P_size` 尚未满足；
- `S_1`：模型和前提写入 `reports/model.md`；
- `S_2`：证明写入 `reports/proof.md`，选定变换 `T`；
- `S_3`：源文件已实施 `T`；
- `S_4`：静态、构建、HTTP 动态检查均通过。

若任一验证谓词失败，则按失败来源回退：文案失败回到 `S_2` 修正 `T`，级联/布局失败回到字号规则设计，镜像或构建失败回到实现步骤；未通过前不得宣称完成。

## 5. 约束与验收性质

输出必须满足：

1. `P_copy(O)` 成立，且文案仍是一个语义 `<p>`，不使用 CSS `content` 伪造可见文字。
2. `|N(D'_r)|=|N(D'_p)|=2`，并且每个节点字号从 `0.71rem` 提升到 `0.80rem`。
3. `.download-status` 仍为 `0.71rem`；除目标文案、目标字号规则和必要的镜像同步外，不发生无关文件变化。
4. `D'_r` 与 `D'_p` 的 HTML 内容相等，根目录与 `public/` 的 CSS 内容相等。
5. HTML 能被构建工具解析，`app.js` 语法检查通过；下载链接初始化、轮播初始化和动态 changelog 初始化所需的节点继续存在。
6. 在至少一个真实 HTTP 页面请求中，首页返回成功状态并包含新文案；构建产物生成成功。

这些性质构成后续证明和代码验证的判定标准。
