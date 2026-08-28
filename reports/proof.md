# Fovelle 首页文案与字号调整的数学证明

## 1. 前提与方案

沿用 [数学模型](./model.md) 的记号。验证驱动方案 `T` 只做两类有界修改：

1. 在唯一 `.hero-copy` 段落中加入 `open-source` 和 `free` 的可读文本；
2. 将 `.download-status, .system-note` 的共享字号声明拆开，使 `.system-note` 从 `0.71rem` 变为 `0.80rem`，而 `.download-status` 继续为 `0.71rem`。

相同的 `T` 应用于 `index.html`/`styles.css` 与 `public/index.html`/`public/styles.css`。实施前已确证两份 HTML 与两份 CSS 相同，且目标节点均唯一。

## 2. 定理

设 `O=T(I)`。若实现严格遵守模型中的三个原子操作，且 CSS 级联、HTML 解析和构建验证通过，则：

\[
O\models
\{P_{copy},P_{size},P_{scope},P_{mirror},P_{behavior},P_{structure}\}
\]

即输出同时满足文案、字号、变更范围、镜像一致性、页面行为和结构有效性要求。

## 3. 引理一：文案包含开源与免费声明

由模型的初始事实，`.hero-copy` 存在且唯一。方案在该节点的文本中执行一次确定性替换，并且替换结果显式包含字符串 `open-source` 与 `free`，不删除 `<p class="hero-copy">` 标签。

因此：

\[
\texttt{open-source}\subseteq text(h')\land\texttt{free}\subseteq text(h')
\]

所以 `P_copy(O)` 成立。由于文本仍属于原 `<p>` 节点，HTML 语义和辅助技术可读取的文档文本保持在 DOM 中；不会因把文案放到 CSS 伪元素而丢失。

## 4. 引理二：两个指定行的字号严格增大

模型中 `N(D)` 恰包含系统要求行和语言支持行两个节点，且这两个节点都匹配 `.system-note`。新规则对 `.system-note` 的声明为 `0.80rem`，旧规则为 `0.71rem`。对任意根字号 `r>0`：

\[
0.80r-0.71r=0.09r>0
\]

故每个 `v\in N(D)` 均有：

\[
size_{C'}(v,R)=0.80r>0.71r=size_C(v,R)
\]

所以 `P_size(O,I)` 成立。两者都使用 `rem`，依据 [MDN `font-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-size) 和 [WAI C14](https://www.w3.org/WAI/WCAG21/Techniques/css/C14)，该增大保留相对于根字号的缩放关系，而非把文字锁死为不可随用户设置变化的像素值。

## 5. 引理三：无关下载状态字号不变

方案把原共享声明拆分为两个互斥选择器声明：`.download-status` 的值仍为 `0.71rem`，`.system-note` 的值为 `0.80rem`。由于 `d` 匹配 `.download-status` 而不匹配 `.system-note`，CSS 级联给出：

\[
size_{C'}(d,R)=0.71r=size_C(d,R)
\]

因此 `P_scope` 成立，任务范围不会因共享选择器而意外放大。

## 6. 引理四：结构、换行和可访问文本保持有效

方案不改变两个 `p.system-note` 的节点、顺序、文本节点类型或父节点，只改变其继承的 `font-size`。`.system-note` 没有固定高度，且语言支持文本仍在原段落内，因此字号变大时浏览器可以通过正常行盒和自然换行容纳文本；不会产生因截断或删除文字造成的语义损失。

`.hero-copy` 仍是原有段落，只增加普通文本。根据 [WHATWG HTML 的段落模型](https://html.spec.whatwg.org/dev/dom.html#paragraphs)，该结构仍为合法的文本段落。方案也不触及 `#download-button`、`[data-carousel]`、`#release-list` 或脚本标签，所以这些行为所需的 DOM 锚点仍可达。

因此 `P_structure` 和 `P_behavior` 的静态部分成立；其运行时部分由后续 HTTP/build 动态检查确认。

## 7. 引理五：两份静态副本保持一致

设修改前 `D_r=D_p`（字节级相等）。对两份文件应用同一个确定性替换 `T`，且替换目标和上下文均唯一。因此：

\[
T(D_r)=T(D_p)
\]

同理，若 `C_r=C_p`，则 `T(C_r)=T(C_p)`。于是 `P_mirror` 成立：根目录和 `public/` 的部署副本不会出现一份更新、一份旧内容的状态。

## 8. 结论与验证义务

由引理一和二，用户可见的两类需求直接满足；由引理三，未请求的下载状态没有被放大；由引理四，HTML 结构、语义文本、自然换行和脚本锚点保持；由引理五，实际发布副本一致。合取引入得出定理。

剩余的实现义务是检验前提的实际实例化：

1. 静态检查目标文本、规则数值、两份副本相等以及非目标节点存在；
2. 运行 lint/build，证明源码可解析并生成部署产物；
3. 启动本地开发服务器并以 HTTP 请求验证首页成功返回且含新文案；
4. 若任何判定失败，按模型状态机回退到对应设计或实现步骤。
