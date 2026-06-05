# GitHub Pages Starter

这是一个放在 `/Users/gone/alexli/work/code/github-pages-site` 下的静态网页项目，可直接用于 GitHub Pages。

## 本地预览

```bash
python3 -m http.server 8080
```

然后打开：

```text
http://127.0.0.1:8080
```

## 推送到 GitHub 并开启 Pages

如果你想创建普通项目页：

```bash
gh auth login
gh repo create GoneLikeAir/github-pages-site --public --source . --push
```

然后进入 GitHub 仓库：

```text
Settings → Pages → Deploy from a branch → main / root
```

访问地址通常是：

```text
https://GoneLikeAir.github.io/github-pages-site/
```

如果你想做个人主页，把仓库名改成：

```text
GoneLikeAir.github.io
```

访问地址就是：

```text
https://GoneLikeAir.github.io
```
