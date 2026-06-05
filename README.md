# GoneLikeAir.github.io

这是 GitHub 用户主页仓库模板。因为 GitHub Pages 的**个人主页**有固定命名要求，仓库名必须是：

```text
GoneLikeAir.github.io
```

本地项目目录也对应调整为：

```text
/Users/gone/alexli/work/code/GoneLikeAir.github.io
```

部署后访问地址是：

```text
https://GoneLikeAir.github.io
```

## 本地预览

```bash
cd /Users/gone/alexli/work/code/GoneLikeAir.github.io
python3 -m http.server 8080
```

然后打开：

```text
http://127.0.0.1:8080
```

## 推送到 GitHub

先登录 GitHub CLI：

```bash
gh auth login
```

然后在本目录执行：

```bash
gh repo create GoneLikeAir/GoneLikeAir.github.io --public --source . --push
```

如果 GitHub 没有自动启用 Pages，可以进入仓库：

```text
Settings → Pages
```

个人主页仓库通常可以直接从 `main` 分支或 GitHub Actions 部署。本项目已包含 `.github/workflows/deploy.yml`，也可以选择：

```text
Source → GitHub Actions
```
