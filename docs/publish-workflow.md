# 文档发布自动化工作流

这个目录把「文档 → HTML Anything → 加密页面 → GitHub Pages」固化成脚本，减少后续手工操作和 token 开销。

## 1. 更新 HTML Anything 模板索引

```bash
node scripts/html-anything-template-index.mjs
```

输出：

```text
data/html-anything-templates.json
 docs/html-anything-template-index.md
```

`docs/html-anything-template-index.md` 是给人看的小索引；`data/html-anything-templates.json` 是给后续选择脚本用的缓存。

## 2. 收到文档后先选模板

```bash
node scripts/select-html-template.mjs /path/to/input.md --json
```

输出包含：

```json
{
  "title": "...",
  "slug": "...",
  "description": "...",
  "format": "markdown",
  "templateId": "docs-page",
  "reason": "..."
}
```

选择逻辑优先匹配结构化模板：

- 数据 / CSV / KPI → `data-report`
- 会议 / 决议 / action items → `meeting-notes`
- PRD / 用户故事 / 成功指标 → `pm-spec`
- 竞品 / 价格 / 矩阵 → `competitive-teardown`
- API / 使用文档 / wiki 索引 → `docs-page`
- Runbook / 告警 / on-call → `eng-runbook`
- 技术分享 / slides / Q&A → `deck-tech-sharing`
- 其他长文 → `article-magazine`

## 3. 一键发布文档

```bash
SITE_PAGE_PASSWORD='***' node scripts/publish-document.mjs /path/to/input.md
```

脚本会自动完成：

1. 读取文档并选择 HTML Anything 模板。
2. 调用本地 HTML Anything：`http://127.0.0.1:3001/api/convert`。
3. 生成临时 HTML 到 `.publish-cache/<slug>.html`。
4. 加密页面并写入 `pages/<slug>/index.html`。
5. 更新 `manifest.json`。
6. 跑验证脚本：
   - `verify-auth-gate.mjs`
   - `verify-cross-page-session.mjs`
   - `verify-publish-workflow.mjs`
7. commit。
8. `git push origin main`，失败会自动 `fetch + rebase` 并重试。
9. 使用 `gh run watch` 等 GitHub Pages 部署完成。

常用参数：

```bash
# 只看模板选择，不发布
node scripts/publish-document.mjs /path/to/input.md --dry-run

# 手动指定模板
SITE_PAGE_PASSWORD='***' node scripts/publish-document.mjs /path/to/input.md --template=docs-page

# 手动指定标题 / slug / 摘要
SITE_PAGE_PASSWORD='***' node scripts/publish-document.mjs /path/to/input.md \
  --title='Wiki Index' \
  --slug=wiki-index \
  --description='Content catalog'

# 只生成和验证，不提交
SITE_PAGE_PASSWORD='***' node scripts/publish-document.mjs /path/to/input.md --no-commit

# 提交但不推送
SITE_PAGE_PASSWORD='***' node scripts/publish-document.mjs /path/to/input.md --no-push

# 网络不稳时增加 push 重试次数
SITE_PAGE_PASSWORD='***' node scripts/publish-document.mjs /path/to/input.md --push-attempts=8
```

## 4. 单独转换 HTML Anything

```bash
node scripts/html-anything-convert.mjs /path/to/input.md /tmp/output.html --template=docs-page
```

也可以用环境变量：

```bash
HTML_ANYTHING_TEMPLATE_ID=docs-page node scripts/html-anything-convert.mjs /path/to/input.md /tmp/output.html
```

## 5. 验证

```bash
node scripts/verify-auth-gate.mjs
node scripts/verify-cross-page-session.mjs
node scripts/verify-publish-workflow.mjs
```

如果要验证真实密码能解开当前页面：

```bash
SITE_TEST_PASSWORD='***' node scripts/verify-auth-gate.mjs
```

不要把真实密码写进代码、commit message 或日志。
