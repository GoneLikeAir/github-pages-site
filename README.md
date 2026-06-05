# GitHub Pages Project Site Starter

这是一个放在 `/Users/gone/alexli/work/code/github-pages-site` 下的 GitHub Pages **项目网页**模板。

项目网页和个人主页的区别：

- 个人主页仓库名必须是 `<用户名>.github.io`，访问地址是 `https://<用户名>.github.io/`
- 项目网页仓库名可以是普通项目名，比如 `github-pages-site`，访问地址是 `https://<用户名>.github.io/<仓库名>/`

本项目当前启用了纯前端加密密码门：公开部署出去的 `index.html` 只显示解锁表单，实际页面目录被 AES-GCM 加密后保存在 `encrypted-content.js`。浏览器输入正确访问密码后，才会在前端解密并显示目录。

单篇文档页面会发布到 `pages/<slug>/`，每个页面都有独立的前端加密壳，正文 HTML 以密文形式内嵌在该页面中。主页通过 `manifest.json` 渲染导航入口。

注意：这不是服务器鉴权，适合降低公开暴露；如果要真正的用户权限控制，需要迁移到带后端/边缘鉴权的平台。

## 本地预览

```bash
cd /Users/gone/alexli/work/code/github-pages-site
python3 -m http.server 8080
```

然后打开：

```text
http://127.0.0.1:8080
```

## 文档发布工作流

示例：把 Markdown 文档转换成 HTML Anything 页面，并加密挂到项目目录下。

```bash
# 1. 用本地 HTML Anything 生成 HTML
node scripts/html-anything-convert.mjs /path/to/input.md /tmp/output.html

# 2. 加密并发布到 pages/<slug>/，同时更新 manifest.json
SITE_PAGE_PASSWORD='你的访问密码' PAGE_CREATED_AT='2026-06-05' \
  node scripts/encrypt-doc-page.mjs /tmp/output.html wiki-index 'Wiki Index' '页面摘要'

# 3. 如果修改了首页目录壳，重新生成首页密文
SITE_PAGE_PASSWORD='你的访问密码' node scripts/encrypt-home.mjs

# 4. 验证
SITE_TEST_PASSWORD='你的访问密码' node scripts/verify-auth-gate.mjs
```

## 推送到 GitHub

先登录 GitHub CLI：

```bash
gh auth login
```

然后在本目录执行：

```bash
gh repo create GoneLikeAir/github-pages-site --public --source . --push
```

## 启用 GitHub Pages

方式一：用本项目自带的 GitHub Actions。

进入仓库：

```text
Settings → Pages → Source → GitHub Actions
```

本项目已包含：

```text
.github/workflows/deploy.yml
```

后续每次 push 到 `main`，都会自动部署。

方式二：直接从分支部署。

```text
Settings → Pages → Source → Deploy from a branch → main / root
```

## 子路径注意事项

项目网页部署在 `/github-pages-site/` 子路径下。本模板使用相对路径：

```html
<link rel="stylesheet" href="./styles.css" />
<script src="./script.js"></script>
```

所以直接适配项目网页子路径，不需要额外配置 base path。
