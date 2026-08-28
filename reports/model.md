# `changelog.html` 删除任务的数学模型

## 1. 范围与已确证前提

- 用户提供的截图对应页面顶部的 changelog hero：返回链接、`Release history` 标签、`Small changes. Better looking.` 标题以及说明文字。
- `changelog.html` 与 `public/changelog.html` 当前字节级相同；两者都属于仓库的静态页面副本，因此把它们建模为同一页面的两个发布表示。
- 页面中该内容由唯一的 `<section class="changelog-hero" ...>` 包含。其后的 release 列表、底部 CTA 和页脚不属于截图目标。
- HTML 标准将 `<section>` 定义为带主题的文档分组，通常包含标题；MDN 还规定 `<section>` 的起止标签不能省略。因此删除目标时以完整元素子树为单位，而不是删除若干文本节点或用 CSS 隐藏。

规范依据：

- [WHATWG HTML Standard — The `section` element](https://html.spec.whatwg.org/dev/sections.html)
- [MDN — `<section>`: The generic Section element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/section)

## 2. 对象定义

令一个 HTML 文档表示为有序带标签树：

\[
D=(V,E,r,\operatorname{tag},\operatorname{attr},\operatorname{children},\operatorname{text})
\]

其中：

- `V` 是 DOM 节点集合，`r` 是根节点；
- `E` 是父子关系；
- `tag(v)` 是节点标签名；
- `attr(v)` 是属性映射；
- `children(v)` 是保持文档顺序的子节点序列；
- `text(v)` 是节点及其后代产生的文本内容。

输入定义为：

\[
I=(H_s,H_p,S)
\]

- `H_s`：仓库根目录的 `changelog.html`；
- `H_p`：`public/changelog.html`；
- `S`：用户提供的截图及其对目标区域的语义指示。

解析后分别得到 `D_s=parse(H_s)` 与 `D_p=parse(H_p)`。已知初始镜像关系为：

\[
H_s=H_p \quad\Longrightarrow\quad D_s\cong D_p
\]

这里的 `\cong` 表示节点、属性和文本在对应位置相同。

## 3. 目标谓词与变换

定义目标节点谓词：

\[
P(v) := \operatorname{tag}(v)=\texttt{section}
\land \texttt{changelog-hero}\in\operatorname{class}(v)
\]

令：

\[
T(D)=\{v\in V\mid P(v)\}
\]

仓库检查得到 `|T(D_s)|=|T(D_p)|=1`。令 `t_s`、`t_p` 分别为两个文档中的唯一目标节点。

定义结构变换 `remove(D,t)`：从 `t` 的父节点子节点序列中删除 `t`，保持其余节点及其相对顺序、属性、文本和事件引用不变；不删除 `t` 之外的祖先、兄弟或后代。

所选实现的输出为：

\[
H'_s=\operatorname{serialize}(remove(D_s,t_s)),
\qquad
H'_p=\operatorname{serialize}(remove(D_p,t_p))
\]

同时生成本模型文件 `reports/model.md` 与证明文件 `reports/proof.md`。

## 4. 行为与约束

实现必须满足以下约束：

1. **精确性**：删除完整 `.changelog-hero` 节点，不能只删除其中部分文案，也不能误删 `.releases-section` 或 `.changelog-footer-cta`。
2. **保留性**：`main`、`section.releases-section`、`#release-list`、`section.changelog-footer-cta`、`footer.site-footer` 及页面脚本引用继续存在。
3. **镜像一致性**：修改后 `changelog.html` 与 `public/changelog.html` 保持字节级一致。
4. **文档有效性**：输出仍是完整的 HTML 文档，`html`、`head`、`body`、`main` 和 `footer` 的嵌套闭合不被破坏。
5. **范围最小化**：不修改与目标无关的 CSS、JavaScript、YAML、图片或其他页面。
6. **渲染行为**：页面加载后截图目标中的文本和布局块不应出现；release 数据加载脚本仍可找到 `#release-list` 并运行。

## 5. 待验证性质

对输出文档 `D'` 验证：

- `count(D', P)=0`；
- `#release-list`、`.releases-section`、`.changelog-footer-cta` 与 `.site-footer` 各出现一次；
- 目标节点删除前后的非目标节点序列相等；
- 两份输出文件内容相等；
- 静态 HTML 结构和动态页面加载均无错误。
