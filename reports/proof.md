# 截图资源替换的数学证明

## 1. 定理与前提

沿用 [数学模型](./model.md) 的记号。设根目录和 `public/` 中的首页在修改前满足
`D_r = D_p`，且两个页面各自存在唯一的 `q_L`、`q_D`。设本地检查已经确认
`u_L`、`u_D` 存在并是 AVIF 文件。对两份首页分别执行同一个确定性变换 `T`。

要证明：

\[
O\models P_{exact}\land P_{avif}\land P_{structure}\land P_{behavior}
\land P_{mirror}\land P_{scope}
\]

若代码检查、构建和动态检查通过，则再得到 `P_build`。

## 2. 引理一：浅色和深色路径精确满足要求

由变换 `T` 的定义，唯一的浅色目标节点被赋值

\[
src(q_L(D'_r))=u_L=\texttt{/Users/inostarlin/Downloads/1.avif}
\]

唯一的深色目标节点被赋值

\[
src(q_D(D'_r))=u_D=\texttt{/Users/inostarlin/Downloads/2.avif}
\]

`D'_p` 也执行同一赋值。因此两个页面副本均满足 `P_exact`。这不是根据文件扩展名推断的
近似匹配，而是对 DOM 属性字符串的逐字符相等。

## 3. 引理二：目标资源是可识别的 AVIF 图像

本地 `file` 检查将两个输入文件均识别为 `ISO Media, AVIF Image`，故 `P_avif` 的文件存在性与
格式部分成立。外部规范层面，[MDN AVIF 指南](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types#avif_image)
将 AVIF 定义为图像文件格式，[MDN `<img>` 文档](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img)
将 AVIF 列在图像元素可使用的格式中。因此把它们作为 `<img>` 的源在语义上是合法的图像资源选择。

## 4. 引理三：轮播索引与新图像路径保持对应

`app.js` 的 `setSlide(k)` 只根据索引切换 `is-active` 和 `aria-hidden`，没有重写任何 `src` 属性；
前进、后退、圆点和左右箭头键最终都调用该函数。由模型中的图像选择函数：

\[
image(0,D'_r)=src(q_L(D'_r))=u_L
\]

\[
image(1,D'_r)=src(q_D(D'_r))=u_D
\]

所以初始浅色图、切换后的深色图以及反向切换都保留正确的一一对应关系。由于两个目标节点、
`data-slide`、控制按钮和 `alt` 文本未被删除，轮播脚本所需的 DOM 前提保持成立，即
`P_structure` 与 `P_behavior` 的结构部分成立。

## 5. 引理四：两份发布表示一致

已知修改前 `D_r=D_p`。对相同的上下文执行相同的确定性字符串替换，且每个目标上下文唯一，
故函数相等性给出：

\[
D'_r=T(D_r)=T(D_p)=D'_p
\]

因此 `P_mirror` 成立。同步 `public/index.html` 是必要的，因为 `app/page.tsx` 将首页路由导向
`/index.html`，运行时不能只依赖根目录副本。

## 6. 引理五：变更范围是封闭的

实现只替换两处 `src="assets/snapshot*.jpg"` 的值，未改变 HTML 标签数量、属性集合、脚本标签、
样式引用或轮播控制。因而：

\[
\Delta(D,D')=\{src(q_L),src(q_D)\}
\]

除验证文档和为保持发布副本一致的同一对替换外，没有无关源码差异，`P_scope` 成立。由于
`src` 仍是 `<img>` 的属性而非 CSS 伪元素内容，辅助技术可继续从 DOM 读取原有 `alt` 文本。

## 7. 路径解析前提的边界

[WHATWG HTML 图像算法](https://html.spec.whatwg.org/multipage/images.html#updating-the-image-data)
要求把 `src` 相对文档 URL 解析后发起图像请求；[MDN URL 说明](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_URL#absolute_urls_vs_relative_urls)
说明 `/Users/...` 在 HTTP 文档中表示当前 origin 的根路径下的 URL。故本证明保证的是用户指定的
精确属性值及其本地文件有效性，不额外声称任意 HTTP 服务器会把宿主机 `/Users/inostarlin/Downloads`
映射为可请求目录。若部署需求后来变为“通过 HTTP 也必须加载该本地文件”，那是新的服务器/资源
托管约束，需要另行选择复制资源或配置映射，不能由本次 HTML 字符串替换推出。

## 8. 结论与可执行验证义务

引理一至五分别推出路径精确性、AVIF 资源合法性、轮播行为、镜像一致性和变更范围；合取得出
`P_exact ∧ P_avif ∧ P_structure ∧ P_behavior ∧ P_mirror ∧ P_scope`。最后运行静态分析、构建和
HTTP 检查：若全部通过，`P_build` 成立，定理完成；若任一失败，按模型状态机回退到对应步骤。
