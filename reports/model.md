# 截图资源替换的数学模型

## 1. 范围与确证前提

本任务只改变首页截图轮播中两张截图的 `img[src]` 属性：浅色模式对应
`data-slide="0"`，深色模式对应 `data-slide="1"`。页面的文案、样式、脚本、轮播控制和
可访问性文本不属于变更范围。

本地检查得到以下事实：

1. 根目录 `index.html` 有且只有一个 `[data-carousel]` 轮播容器。
2. 该容器有且只有两个 `[data-slide]` 图：序号 `0` 的 `alt` 描述 light appearance，
   序号 `1` 的 `alt` 描述 dark appearance。
3. 根目录 `index.html` 与 `public/index.html` 修改前字节级相同；
   `app/page.tsx` 将首页请求重定向到 `/index.html`，因此 `public/index.html` 是需要同步的
   静态副本。
4. `/Users/inostarlin/Downloads/1.avif` 和 `/Users/inostarlin/Downloads/2.avif` 均存在，且
   `file` 将两者识别为 `ISO Media, AVIF Image`。

联网多跳检索得到的外部前提：

- [MDN：Image file type and format guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types#avif_image)
  将 AVIF 定义为用于图像内容的 AV1 Image File Format。
- [MDN：`<img>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img)
  说明 `<img>` 用于嵌入图像，并把 AVIF 列为可用图像格式。
- [WHATWG HTML：images](https://html.spec.whatwg.org/multipage/images.html#updating-the-image-data)
  规定 `src` 经过 URL 解析后作为图像请求的地址，且相对文档的 URL 解析。
- [MDN：What is a URL?](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_URL#absolute_urls_vs_relative_urls)
  说明以 `/` 开头的路径是相对于当前站点 origin 的根路径，而不是自动等价于 HTTP 服务端的
  任意本地文件路径。

因此，本次用户要求被形式化为“HTML 属性值必须精确等于给出的绝对路径字符串”。不把它改写为
`file://` URL、不复制到仓库中的相对资源，也不额外改变服务器配置。若页面以 `file://` 文档打开，
该字符串可解析到对应本地文件；若页面经 HTTP 提供，能否加载还取决于服务器是否把该路径暴露为
同源根路径，这是部署层前提，不由字符串替换本身保证。

## 2. 对象、输入与输出

将一个首页表示为

\[
D=(H,J,C,A,R)
\]

其中：

- `H` 是 HTML DOM 树；
- `J` 是 `app.js` 及其轮播行为；
- `C` 是 CSS 规则和布局；
- `A` 是页面可引用的外部资源；
- `R` 是文档 URL、浏览器和视口等运行环境。

输入为

\[
I=(D_r,D_p,u_L,u_D)
\]

其中 `D_r` 是根目录首页，`D_p` 是 `public/` 静态副本，且

\[
u_L=\texttt{/Users/inostarlin/Downloads/1.avif},\qquad
u_D=\texttt{/Users/inostarlin/Downloads/2.avif}
\]

输出为

\[
O=(D'_r,D'_p,M,P)
\]

其中 `M`、`P` 分别是本模型和证明文档；页面输出必须只对两个目标 `src` 做有界替换。

## 3. 目标节点和变换

对页面表示 `D`，定义两个唯一目标节点：

\[
q_L(D)=\operatorname{唯一}\{v\mid v\text{ 是 }img\text{ 且其祖先 }figure
\text{ 的 }data-slide=\texttt{"0"}\}
\]

\[
q_D(D)=\operatorname{唯一}\{v\mid v\text{ 是 }img\text{ 且其祖先 }figure
\text{ 的 }data-slide=\texttt{"1"}\}
\]

定义确定性变换 `T`：

\[
src_{T(D)}(q_L)=u_L,\qquad src_{T(D)}(q_D)=u_D
\]

并且对所有其他 DOM 节点、属性、脚本和样式保持不变。对两个镜像文件分别应用同一个 `T`：

\[
D'_r=T(D_r),\qquad D'_p=T(D_p)
\]

## 4. 状态、行为与约束

页面状态沿验证循环表示为：

\[
S_0\xrightarrow{\text{建模}}S_1\xrightarrow{\text{证明}}S_2
\xrightarrow{\text{实现}}S_3\xrightarrow{\text{验证}}S_4
\]

- `S0`：两个目标节点仍引用旧的 `.jpg` 资源；
- `S1`：本模型已写入 `reports/model.md`；
- `S2`：证明已写入 `reports/proof.md`，且 `T` 被选定；
- `S3`：两个首页副本已实施 `T`；
- `S4`：静态检查、代码检查、构建和动态页面检查通过。

轮播行为由 `app.js` 的索引 `k∈{0,1}` 表示：`setSlide(k)` 只切换对应
`figure` 的 `is-active` 与 `aria-hidden`，不改写 `img[src]`。因此图像资源选择函数为：

\[
image(k,D)=
\begin{cases}
src(q_L(D)),&k=0\\
src(q_D(D)),&k=1
\end{cases}
\]

变换后的期望行为为 `image(0,D')=u_L`、`image(1,D')=u_D`。

验收约束如下：

1. `P_exact`：两个 `src` 属性分别精确等于 `u_L`、`u_D`。
2. `P_avif`：两个目标路径存在，并且文件类型为 AVIF。
3. `P_structure`：目标节点仍唯一，轮播仍有两张图，原有 `alt` 文本不变。
4. `P_behavior`：轮播控制、键盘切换和 `aria-hidden` 逻辑的脚本入口仍存在且可解析。
5. `P_mirror`：`D'_r` 与 `D'_p` 的 HTML 内容字节级一致。
6. `P_scope`：除两个目标属性和两份验证文档外，不产生无关源码变化。
7. `P_build`：项目 lint、构建及首页 HTTP 请求均成功；HTTP 检查只验证页面结构和属性值，
   不把本地 Downloads 路径误判为服务器已暴露的资源。

任一性质失败时，依据失败对象回退：目标定位失败回到建模；替换/镜像失败回到实现；脚本、构建
或动态检查失败回到实现和证明前提重新核对，未到 `S4` 不宣称完成。
