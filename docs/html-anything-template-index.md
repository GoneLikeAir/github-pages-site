# HTML Anything 模板小索引

生成时间：2026-06-05T11:23:45.052Z
模板数量：91

用法：收到文档后先判断内容形态，再选择模板。优先匹配结构性模板（数据、会议、PRD、竞品、Runbook、技术文档），最后再落到通用长文。

## article

- `article-magazine` — 📖 杂志文章 /Magazine Article
  - 适合场景：Substack / Medium 高级感长文排版, 适合公众号、博客发布（marketing · A4 / 长页面）；标签：blog、essay、newsletter、公众号、博客、文章
- `blog-post` — 📰 博客长文 /Blog Post
  - 适合场景：杂志感长文, 含 masthead、hero、figures、pull quote、作者署名（marketing · 长页面）；标签：blog、essay、case study、长文
- `digital-eguide` — 📚 电子指南 /Digital E-Guide
  - 适合场景：两页跨页电子指南, 封面 + 课程页 + pull-quote + 步骤列表（marketing · 双页预览）；标签：eguide、lookbook、lead magnet、playbook

## card

- `card-twitter` — 🐦 Twitter 分享卡 /Twitter Share Card
  - 适合场景：推特金句 / 数据卡, 适合配推文（marketing · 1600×900 (16:9)）；标签：twitter、x、quote、金句
- `card-xiaohongshu` — 📱 小红书图文卡片 /Xiaohongshu Card
  - 适合场景：小红书风格知识卡片, 多张联排可滑动浏览（marketing · 1080×1440 (3:4)）；标签：xhs、小红书、carousel、图文
- `frame-macos-notification` — 🔔 macOS 通知横幅 /macOS Notification Banner
  - 适合场景：拟真 macOS 通知 banner + app icon + 标题正文, 适合 video overlay / 产品发布预告（video · 1920×1080 视频或 480×120 横幅）；标签：macos、notification、banner、overlay、frame
- `social-carousel` — 🎠 社交媒体三联 /Social Carousel
  - 适合场景：三张方形卡片轮播, 标题串联, 品牌 mark + 编号（marketing · 1080×1080 ×3）；标签：instagram、linkedin、thread、carousel、三联
- `social-reddit-card` — 🔺 Reddit 帖子卡 /Reddit Post Card
  - 适合场景：拟真 Reddit 帖子卡 + 上下投票 + 评论数, 适合视频叠加 / 故事分享（marketing · 1280×720 或 800×600）；标签：reddit、social、card、overlay、story
- `social-spotify-card` — 🎵 Spotify 正在播放卡 /Spotify Now-Playing Card
  - 适合场景：Spotify Now Playing 风格卡: 专辑封面 + 进度条 + 播放控制, 适配视频叠加 / 个人主页（personal · 1280×720 或 600×200）；标签：spotify、music、now-playing、card、overlay
- `social-x-post-card` — 𝕏 X (Twitter) 帖子卡 /X / Twitter Post Card
  - 适合场景：拟真 X 推文卡片 + 互动数据 (likes/reposts/views), 适配视频叠加或图卡分享（marketing · 1280×720 或 1080×1080）；标签：twitter、x、social、card、overlay

## dashboard

- `dashboard` — 🎛️ 管理后台仪表板 /Admin Dashboard
  - 适合场景：固定侧栏 + 顶栏 + KPI 网格 + 1-2 张图（operations · 桌面 1440）；标签：dashboard、admin、analytics
- `dating-web` — 💞 社区 / 配对数据墙 /Dating / Community Dashboard
  - 适合场景：消费感配对仪表板: 信号 ticker + KPI + 30 天柱状 + 趋势（personal · 桌面 1440）；标签：dating、community、consumer
- `flowai-team-dashboard` — 🌊 FlowAI 团队管理 /FlowAI Team Dashboard
  - 适合场景：三个 tab 的团队管理后台: 成员、详情、活动日志, 含图表 + CSV 导出（operations · 桌面 1440）；标签：flowai、team、members
- `kanban-board` — 📌 看板 / Kanban /Kanban Board
  - 适合场景：To do / In progress / In review / Done 四列, 卡片 + 头像 + 泳道（operations · 桌面 1440）；标签：kanban、trello、sprint、看板
- `live-dashboard` — 📈 Notion 风团队仪表板 /Live Team Dashboard
  - 适合场景：Notion 风团队仪表板, KPI + 7 日 sparkline + activity feed + 任务表（operations · 桌面长页）；标签：notion、team、live、dashboard
- `social-media-dashboard` — 📡 社媒创作者仪表板 /Social Media Dashboard
  - 适合场景：平台切换 + 粉丝/互动 KPI + 增长曲线 + Top post + 热门话题（creator · 桌面 1440）；标签：social、creator、analytics、x、linkedin、tiktok
- `social-media-matrix` — 🛰️ 社媒矩阵追踪面板 /Social Media Matrix Tracker
  - 适合场景：电影感多平台社媒分析: 互动图、悬浮洞察、区间对比、明暗主题（creator · 桌面长页）；标签：matrix、tracker、multi-platform
- `team-okrs` — 🎯 团队 OKR 追踪 /Team OKRs
  - 适合场景：季度 banner + 3 个目标 + KR 进度条 + owner + 状态 pill（product · 桌面 1440）；标签：okr、objectives、key results、目标

## data

- `data-report` — 📊 数据可视化报告 /Data Visualization Report
  - 适合场景：把 CSV/Excel/JSON 数据转成漂亮的可视化报告页（finance · 桌面长页面）；标签：data、report、chart、数据、报告
- `experiment-readout` — 🧪 实验复盘 /Experiment Readout
  - 适合场景：假设 + 指标 + 结果 + 解释 + 决策, 把 A/B 或产品实验转成行动建议（product · 产品实验报告）；标签：experiment、ab-test、growth、product、data、实验

## doc

- `competitive-teardown` — 🧩 竞品拆解 /Competitive Teardown
  - 适合场景：定位图 + 功能矩阵 + 价格对比 + 机会窗口, 把竞品资料转成产品决策报告（product · 战略长页面）；标签：competitive、teardown、strategy、product、竞品、拆解
- `doc-kami-parchment` — 📜 Kami 羊皮纸文档 /Kami Parchment Document
  - 适合场景：暖羊皮纸底 (#f5f4ed) + 墨蓝单色 accent (#1B365D) + 单一衬线字体, 编辑级排印（personal · A4 / Letter 长页）；标签：kami、parchment、serif、editorial、report、letter
- `docs-page` — 📘 技术文档页 /Docs Page
  - 适合场景：三栏文档页: 侧导航 + 正文 + 右 TOC（engineering · 桌面 1440）；标签：docs、api、tutorial、guide
- `eng-runbook` — 📕 工程 Runbook /Engineering Runbook
  - 适合场景：服务概述 + alerts 表 + dashboards + 操作命令 + on-call + 事故清单（engineering · 长页面）；标签：runbook、ops、oncall、sre
- `exec-briefing-memo` — ⚖️ 高管决策简报 /Executive Briefing Memo
  - 适合场景：Decision needed + recommendation + evidence + tradeoffs, 把复杂材料压成可拍板的一页（operations · 一页决策 memo）；标签：executive、briefing、memo、decision、strategy、简报
- `hr-onboarding` — 👋 新员工入职页 /HR Onboarding
  - 适合场景：首周日程 + buddy + 学习路径 + 设备 + 完成标准（hr · 长页面）；标签：onboarding、入职、first week
- `meeting-notes` — 🗒️ 会议纪要 /Meeting Notes
  - 适合场景：标题 + 出席 + 议程 + 决议 + action items + 下次（operations · 长页面）；标签：minutes、meeting、1:1、纪要
- `pm-spec` — 🧭 PRD / 产品 Spec /Product Spec / PRD
  - 适合场景：问题 + 成功指标 + 范围 + user stories + 设计 + 发布 + 待解决（product · 长页面）；标签：prd、spec、需求、product

## email

- `email-marketing` — 📧 营销邮件 /Marketing Email
  - 适合场景：产品发布邮件, 含 masthead、hero、CTA、规格表, table-fallback（marketing · 600 邮件宽）；标签：email、newsletter、mjml

## finance

- `finance-report` — 💼 季度财报 /Finance Report
  - 适合场景：Masthead + KPI + 收入/烧钱图 + P&L 表 + 重点 + 展望（finance · 长页面）；标签：financial、p&l、mrr、财报
- `invoice` — 🧾 可打印发票 /Printable Invoice
  - 适合场景：标准发票: 寄件/收件 + 明细 + 税 + 总额 + 付款指引（finance · A4）；标签：invoice、bill、发票

## mobile

- `gamified-app` — 🕹️ 游戏化 App 多屏 /Gamified App
  - 适合场景：三屏: 封面 / 今日任务带 XP / 任务详情, 暗色舞台（personal · 3 × iPhone）；标签：gamified、habit、rpg、quest、xp
- `mobile-app` — 📲 iPhone App 单屏 /Mobile App Screen
  - 适合场景：像素级 iPhone 15 Pro 边框, 一屏 app 截图（design · iPhone 15 Pro frame）；标签：mobile、ios、app、phone
- `mobile-onboarding` — 🪂 App 引导多屏 /Mobile Onboarding
  - 适合场景：三个手机框并排: splash / value-prop / sign-in（design · 3 × iPhone）；标签：onboarding、ios、signup、引导

## other

- `pkg-Leonxlnx__taste-skill--brandkit` — ✨ brandkit /pkg-Leonxlnx__taste-skill--brandkit
  - 适合场景：Premium brand-kit image generation skill for creating high-end brand-guidelines boards, logo systems, identity decks, and visual-world presentations. Trained for minimalist, cinematic, editorial, dark-tech, luxury, cultural, security, gaming, developer-tool, and consumer-app brand systems. Optimized for intentional logo concepting, refined composition, sparse typography, strong symbolic meaning, premium mockups, art-directed imagery, and flexible grid layouts.（marketing）
- `pkg-Leonxlnx__taste-skill--brutalist-skill` — ✨ industrial-brutalist-ui /pkg-Leonxlnx__taste-skill--brutalist-skill
  - 适合场景：Raw mechanical interfaces fusing Swiss typographic print with military terminal aesthetics. Rigid grids, extreme type scale contrast, utilitarian color, analog degradation effects. For data-heavy dashboards, portfolios, or editorial sites that need to feel like declassified blueprints.（marketing）
- `pkg-Leonxlnx__taste-skill--gpt-tasteskill` — ✨ gpt-taste /pkg-Leonxlnx__taste-skill--gpt-tasteskill
  - 适合场景：Elite UX/UI & Advanced GSAP Motion Engineer. Enforces Python-driven true randomization for layout variance, strict AIDA page structure, wide editorial typography (bans 6-line wraps), gapless bento grids, strict GSAP ScrollTriggers (pinning, stacking, scrubbing), inline micro-images, and massive section spacing.（marketing）
- `pkg-Leonxlnx__taste-skill--image-to-code-skill` — ✨ image-to-code /pkg-Leonxlnx__taste-skill--image-to-code-skill
  - 适合场景：Elite website image-to-code skill for Codex. For visually important web tasks, it must first generate the design image(s) itself, deeply analyze them, then implement the website to match them as closely as possible. In Codex, it must prefer large, readable, section-specific images instead of tiny compressed boards, generate fresh standalone images for sections or detail views instead of cropping old ones, avoid lazy under-generation, avoid cards-inside-cards-inside-cards UI, and keep the hero clean, spacious, readable, and visible on a small laptop.（marketing）
- `pkg-Leonxlnx__taste-skill--imagegen-frontend-mobile` — ✨ imagegen-frontend-mobile /pkg-Leonxlnx__taste-skill--imagegen-frontend-mobile
  - 适合场景：Elite mobile app image-generation skill for creating premium, app-native screen concepts and flows. Designed for iOS, Android, and cross-platform mobile products. Prioritizes clean hierarchy, comfortably readable text, strong multi-screen consistency, controlled color palettes, non-generic creative direction, textured surfaces, image-led composition, tasteful custom iconography, and clean phone mockup framing. By default, screens should be shown inside a subtle premium iPhone or similar phone mockup with a visible frame, while the main focus stays on the app content itself. This skill generates images only. It does not write code.（marketing）
- `pkg-Leonxlnx__taste-skill--imagegen-frontend-web` — ✨ imagegen-frontend-web /pkg-Leonxlnx__taste-skill--imagegen-frontend-web
  - 适合场景：Elite frontend image-direction skill for generating premium, conversion-aware website design references. CRITICAL OUTPUT RULE — generate ONE separate horizontal image FOR EVERY section. A landing page with 8 sections produces 8 images. Never compress multiple sections into one image. Enforces composition variety (not always left-text / right-image), background-image freedom, varied CTAs, varied hero scales (giant / mid / mini minimalist), narrative concept spine, second-read moments, and a single consistent palette across all images. Optimized for landing pages, marketing sites, and product comps that developers or coding models can accurately recreate.（marketing）
- `pkg-Leonxlnx__taste-skill--minimalist-skill` — ✨ minimalist-ui /pkg-Leonxlnx__taste-skill--minimalist-skill
  - 适合场景：Clean editorial-style interfaces. Warm monochrome palette, typographic contrast, flat bento grids, muted pastels. No gradients, no heavy shadows.（marketing）
- `pkg-Leonxlnx__taste-skill--output-skill` — ✨ full-output-enforcement /pkg-Leonxlnx__taste-skill--output-skill
  - 适合场景：Overrides default LLM truncation behavior. Enforces complete code generation, bans placeholder patterns, and handles token-limit splits cleanly. Apply to any task requiring exhaustive, unabridged output.（marketing）
- `pkg-Leonxlnx__taste-skill--redesign-skill` — ✨ redesign-existing-projects /pkg-Leonxlnx__taste-skill--redesign-skill
  - 适合场景：Upgrades existing websites and apps to premium quality. Audits current design, identifies generic AI patterns, and applies high-end design standards without breaking functionality. Works with any CSS framework or vanilla CSS.（marketing）
- `pkg-Leonxlnx__taste-skill--soft-skill` — ✨ high-end-visual-design /pkg-Leonxlnx__taste-skill--soft-skill
  - 适合场景：Teaches the AI to design like a high-end agency. Defines the exact fonts, spacing, shadows, card structures, and animations that make a website feel expensive. Blocks all the common defaults that make AI designs look cheap or generic.（marketing）
- `pkg-Leonxlnx__taste-skill--stitch-skill` — ✨ stitch-design-taste /pkg-Leonxlnx__taste-skill--stitch-skill
  - 适合场景：Semantic Design System Skill for Google Stitch. Generates agent-friendly DESIGN.md files that enforce premium, anti-generic UI standards — strict typography, calibrated color, asymmetric layouts, perpetual micro-motion, and hardware-accelerated performance.（marketing）
- `pkg-Leonxlnx__taste-skill--taste-skill` — ✨ design-taste-frontend /pkg-Leonxlnx__taste-skill--taste-skill
  - 适合场景：Anti-slop frontend skill for landing pages, portfolios, and redesigns. The agent reads the brief, infers the right design direction, and ships interfaces that do not look templated. Real design systems when applicable, audit-first on redesigns, strict pre-flight check.（marketing）
- `pkg-Leonxlnx__taste-skill--taste-skill-v1` — ✨ design-taste-frontend-v1 /pkg-Leonxlnx__taste-skill--taste-skill-v1
  - 适合场景：The original v1 taste-skill, preserved for projects depending on its exact behavior. The current default is `design-taste-frontend` (v2 experimental), which is a substantial rewrite. Use this v1 install name only if you need exact backward compatibility.（marketing）

## poster

- `frame-liquid-bg-hero` — 🌊 流体背景 Hero 帧 /Liquid Background Hero
  - 适合场景：WebGL 风流体置换背景 + 顶部叠加金句, 适合视频片头 / landing hero / 海报（video · 1920×1080 (16:9) 或 1080×1920 (9:16)）；标签：liquid、fluid、background、hero、html-in-canvas、vfx
- `magazine-poster` — 🗞️ 杂志风海报 /Magazine Poster
  - 适合场景：Sunday-paper 风格, 大字 serif headline + 双栏正文 + 编号 sections（marketing · 竖版长图）；标签：magazine、newsprint、editorial、manifesto
- `mockup-device-3d` — 📱 iPhone × MacBook 立体展架 /Device 3D Showcase
  - 适合场景：iPhone + MacBook 仿 GLTF 静态展架, 屏幕内嵌真实 HTML 内容, 玻璃镜头折射, 360° 转盘构图（product · 1920×1080 (16:9)）；标签：device、mockup、iphone、macbook、html-in-canvas、product
- `poster-hero` — 🖼️ 营销海报 /Marketing Poster
  - 适合场景：竖版海报 / 朋友圈分享图, 强视觉冲击（marketing · 1080×1920 竖版）；标签：poster、海报、朋友圈
- `sprite-animation` — 🕹️ 像素动画解说 /Sprite Animation
  - 适合场景：像素美术 + kinetic 字体的解说帧, 纯 CSS 循环, 可录视频（marketing · 竖版/横版均可）；标签：pixel、8-bit、复古、explainer

## prototype

- `pricing-page` — 💳 定价页 /Pricing Page
  - 适合场景：三档定价 + 特性对比表 + FAQ（sales · 桌面 1440）；标签：pricing、plans、定价
- `prototype-web` — 🛠️ Web 产品原型 /Web Prototype
  - 适合场景：可点击的功能性 Web 原型, 含导航、英雄区、特性区、CTA（design · 1440×900 桌面）；标签：prototype、landing、原型
- `saas-landing` — 🚀 SaaS Landing
  - 适合场景：单页 SaaS 落地页, 含 hero/features/social-proof/pricing/CTA（marketing · 桌面 1440）；标签：saas、landing、marketing
- `waitlist-page` — ✉️ 等候名单页 /Waitlist Page
  - 适合场景：极简产品预发布落地页, 含邮箱捕获、logo、装饰图层（marketing · 桌面 1440）；标签：waitlist、launch、预发布
- `web-proto-brutalist` — ⬛ Brutalist 原型 /Brutalist Prototype
  - 适合场景：Swiss industrial-print 风: 单字 grotesque、巨数字、ASCII 装饰（design · 桌面 1440）；标签：brutalist、swiss、industrial、hairline
- `web-proto-editorial` — 📜 Editorial 原型 /Editorial Prototype
  - 适合场景：Editorial-minimalist: 暖色单色 canvas + serif display + grotesque body（design · 桌面 1440）；标签：editorial、minimalist、serif
- `web-proto-soft` — 🫧 Apple Soft 原型 /Apple-tier Soft Prototype
  - 适合场景：Apple 调: 银/奶 canvas + 双层斜面卡片 + button-in-button + spring（design · 桌面 1440）；标签：apple、soft、squircle、spring
- `wireframe-sketch` — ✏️ 手绘线框图 /Wireframe Sketch
  - 适合场景：网格背景 + marker 笔触 + 多 tab + sticky note + scribble 图表（design · 桌面 1440）；标签：wireframe、lo-fi、sketch、草稿、手绘

## resume

- `resume-modern` — 📄 极简简历 /Modern Resume
  - 适合场景：现代极简简历, A4 单页, 适合打印或导出 PDF（personal · A4 (210×297mm)）；标签：resume、cv、简历

## slides

- `deck-blueprint` — 📐 蓝图架构 Deck /Knowledge Arch Blueprint
  - 适合场景：奶油纸 + 锈红 + 蓝图网格 mask + 黑边硬卡片 + pipeline 盒（engineering · 16:9）；标签：blueprint、architecture、engineering
- `deck-course-module` — 🎓 课程 / 培训 Deck /Course Module Deck
  - 适合场景：暖纸背景 + Playfair, 左侧学习目标常驻, 含 MCQ 自测页（education · 16:9）；标签：course、workshop、training、教学
- `deck-dir-key-nav` — ▶︎ 极简方向键 Keynote /Dir-Key Nav Minimal Deck
  - 适合场景：8 页单色背景, 160px display + 4px accent + Mono 箭头列表（personal · 16:9）；标签：minimal、kbd、monocolor
- `deck-graphify-dark` — 🌌 暗底图谱 Deck /Graphify Dark Deck
  - 适合场景：深夜渐变 + 漂浮 orbs + SVG 力导向图谱 + JetBrains Mono（engineering · 16:9）；标签：graph、dev tool、ai、cli
- `deck-guizang-editorial` — 🖋️ 贵赞编辑墨水 Deck /Guizang Editorial E-Ink Deck
  - 适合场景：电子杂志 × 电子墨水; 10 个版面 + 5 套调色板 (墨水/靛蓝瓷/森林墨/牛皮纸/沙丘)（marketing · 16:9 横向翻页）；标签：editorial、e-ink、magazine、narrative、guizang
- `deck-hermes-cyber` — 🟢 Cyber Terminal Deck /Hermes Cyber Terminal Deck
  - 适合场景：黑底 + CRT 网格扫描线 + $ 命令行标题 + 薄荷绿大字 + 三档 tag（engineering · 16:9）；标签：cyber、terminal、review、cli
- `deck-magazine-web` — 📰 杂志风网页 PPT /Magazine Web Deck
  - 适合场景：电子杂志 × 电子墨水风, WebGL 流体背景 + 衬线 display（marketing · 16:9 横向翻页）；标签：magazine、editorial、e-ink、horizontal swipe
- `deck-obsidian-claude` — 🌃 GitHub Dark 紫渐变 Deck /Obsidian Claude Gradient Deck
  - 适合场景：GitHub-dark + 紫蓝环境光 + 三色渐变标题 + GitHub 风代码（engineering · 16:9）；标签：github、dark、purple、mcp、agent
- `deck-open-slide-canvas` — 🎨 1920 画布自由 Deck /Open-Slide 1920 Canvas Deck
  - 适合场景：锁死 1920×1080 画布, React 组件级自由组合, 不绑模板（design · 1920×1080 (16:9)）；标签：canvas、open-slide、freeform、1920、react
- `deck-pitch` — 🚀 投资人 Pitch Deck /Investor Pitch Deck
  - 适合场景：10 页融资 deck, 白底 + 蓝紫渐变 hero, traction 柱状, $X.XM ask（finance · 16:9 ×10）；标签：pitch、investor、seed、vc
- `deck-presenter-mode` — 🎤 演讲者模式 Deck /Presenter Mode Deck
  - 适合场景：tokyo-night 默认主题, T 切换 5 主题, S 打开提词器 popup（engineering · 16:9）；标签：presenter、notes、提词、teleprompter
- `deck-product-launch` — 🎉 产品发布 Keynote /Product Launch Deck
  - 适合场景：暗 hero + 亮内容, 橙→桃 accent, 特性卡 + 定价 + CTA（marketing · 16:9）；标签：launch、keynote、product
- `deck-replit` — 🟣 Replit Slides 风 Deck /Replit Slides Deck
  - 适合场景：Replit Slides 八套主题 (helix/holm/vance/bevel/world/atlas/bluehouse)（product · 16:9）；标签：replit、themed、memo
- `deck-safety-alert` — ⚠️ 安全 / 风险红色 Deck /Testing / Safety Alert Deck
  - 适合场景：红琥珀警示色 + hazard 条纹 + L1/L2/L3 tier 卡片 + 删除线标题（engineering · 16:9）；标签：safety、security、policy、incident
- `deck-simple` — ▫️ 通用 Simple Deck /Simple Deck
  - 适合场景：通用 horizontal-swipe HTML deck, 不要 magazine 调（product · 16:9）；标签：deck、simple、swipe
- `deck-swiss-international` — 🟦 瑞士国际主义 Deck /Swiss International Deck
  - 适合场景：16 列网格 + 单一饱和 accent + 22 个锁死版面 (Klein Blue / Lemon / Mint / Safety Orange)（marketing · 16:9 横向翻页）；标签：swiss、grid、international、ikb、editorial、facts
- `deck-tech-sharing` — 💻 技术分享 Deck /Tech Sharing Deck
  - 适合场景：GitHub-dark + JetBrains Mono + 终端代码块, 含 agenda + Q&A（engineering · 16:9）；标签：tech talk、conference、engineering
- `deck-xhs-pastel` — 🍡 马卡龙慢生活 Deck /Pastel Slow-life Deck
  - 适合场景：奶油底 + 柔光 blob + 马卡龙圆角卡片 + Playfair 斜体序号（personal · 16:9）；标签：xhs、pastel、lifestyle、lifestyle
- `deck-xhs-post` — 🎀 小红书图文 Deck /Xiaohongshu Post Deck
  - 适合场景：9 页 3:4 竖版图文, 暖 pastel + 虚线 sticker 卡片（marketing · 810×1080 ×9）；标签：xhs、instagram、carousel
- `deck-xhs-white` — 🌈 白底杂志风 Deck /White Editorial Deck
  - 适合场景：纯白 + 顶部彩虹 bar + 渐变文字 + 马卡龙软卡片 + 黑底 pill（marketing · 16:9 / 3:4）；标签：editorial、rainbow、macaron
- `ppt-keynote` — 🎬 Keynote 风格 PPT /Keynote-style Slides
  - 适合场景：苹果 Keynote 级别幻灯片, 一屏一卡, 键盘左右切换（marketing · 16:9 (1280×720)）；标签：slides、deck、presentation、幻灯片、演讲
- `weekly-update` — 🗓️ 团队周报 Deck /Weekly Update Deck
  - 适合场景：6-8 页横向滑动周报: 已发布 / 进行中 / 阻塞 / 指标 / 求助（operations · 16:9 ×8）；标签：weekly、周报、status

## video

- `frame-data-chart-nyt` — 📈 NYT 风数据图表帧 /NYT-Style Data Chart Frame
  - 适合场景：NYT-newsroom 排版 + 错峰揭示动画 + 编辑级图表 (折线/柱/范围带)（video · 1920×1080 (16:9)）；标签：data、chart、nyt、editorial、frame
- `frame-flowchart-sticky` — 📝 便利贴流程图帧 /Sticky Flowchart Frame
  - 适合场景：SVG 曲线连接 + 便利贴节点 + 光标交互, 像白板 brainstorm（operations · 1920×1080 (16:9)）；标签：flowchart、diagram、sticky、whiteboard、frame
- `frame-glitch-title` — ⚡ 故障艺术标题帧 /Glitch Title Frame
  - 适合场景：数字故障 / 像散偏移 / 数据腐败标题, 适合视频转场 / cyberpunk hero（video · 1920×1080 (16:9)）；标签：glitch、cyberpunk、title、transition、vfx、frame
- `frame-light-leak-cinema` — 🎞️ 胶片漏光电影帧 /Light-Leak Cinematic Frame
  - 适合场景：胶片漏光 + 颗粒噪点 + 16:9 letterbox + 衬线大字, 电影感开场 / 章节卡（video · 2.39:1 letterbox (1920×800) 或 16:9 (1920×1080)）；标签：cinema、film、light-leak、grain、letterbox、frame
- `frame-logo-outro` — 🎬 品牌 Logo 收尾帧 /Logo Outro Frame
  - 适合场景：Logo 分块组装入场 + glow bloom + tagline 揭示, 适合视频片尾 / 品牌闭幕（video · 1920×1080 (16:9)）；标签：logo、outro、branding、end-card、frame
- `motion-frames` — 🌀 动效英雄帧 /Motion Frames
  - 适合场景：可循环 CSS 动效组合: 旋转环、地球仪、计时器、视差标签（marketing · 桌面 hero）；标签：motion、title card、loop、video poster
- `vfx-text-cursor` — ✨ VFX 文字光标 /VFX Text Cursor
  - 适合场景：光标拖光 + 彩色像散射线 + 定向光斑, 适合视频片头逐字揭示金句（video · 1920×1080 (16:9)）；标签：vfx、text、cursor、chromatic、reveal、frame
- `video-hyperframes` — 🎞️ Hyperframes 视频脚本 /Hyperframes Video
  - 适合场景：Hyperframes / Remotion 兼容的连续帧动画, 可自动播放（video · 1920×1080 (16:9)）；标签：video、hyperframes、remotion、视频
