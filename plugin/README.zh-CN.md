<div align="center">
  <h1>@xxs3315/univer-chart-plugin</h1>
</div>

<div align="center">

univer chart plugin插件封装了[Univer](https://univer.ai/zh-CN)中绘制浮动图表的能力

[English][readme-en-link] | **简体中文** <br />

[![][github-license-shield]][github-license-link]
[![][npm-version-shield]][npm-version-link]
[![][language-shield]][language-link]

[官网][official-site-link] | [文档][documentation-link] | [在线体验][playground-link]

</div>

## 🌟 插件使用

### 安装

```bash
# npm
$ npm install @xxs3315/univer-chart-plugin

# pnpm
$ pnpm add @xxs3315/univer-chart-plugin
```

## 📦 开发配置

### 初始化

```bash
git clone https://github.com/xxs3315/univer-chart-plugin.git
cd univer-chart-plugin
pnpm install
```

### 开发

```bash
pnpm run dev
```

### 使用vitepress编写文档

```bash
pnpm run docs:dev
```

### 编译

```bash
pnpm run build
```

## 🔨 使用stackblitz进行开发

若您不想安装本地开发环境，亦或本地环境不适配开发要求，

可以点击下边的stackblitz链接进行查看或开发：

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/~/github.com/xxs3315/univer-chart-plugin)


## 🎁 插件特性
- 使用图表管理侧边栏进行图表的add/remove/show/hide;
- 图表面板支持移动位置/尺寸调整;
- 支持Line/Area/Bar/Column/Pie/Doughnut等六种图表类型;
- 支持多达14种图表主题;
- 图表标题可以配置;
- 支持反转图表坐标轴;
- 支持预定义图表数据用以数据输入;
- 支持图表数据输出;
- 图表操作支持Undo/Redo;
- 表格数据变动实时响应至图表;
- 更多...

<!-- Links -->
[github-license-shield]: https://img.shields.io/github/license/xxs3315/univer-chart-plugin?style=flat-square
[github-license-link]: ./LICENSE
[npm-version-shield]: https://img.shields.io/npm/v/@xxs3315/univer-chart-plugin.svg?style=flat-square
[npm-version-link]: https://www.npmjs.com/package/@xxs3315/univer-chart-plugin
[language-shield]: https://img.shields.io/badge/language-TypeScript-red.svg?style=flat-square
[language-link]: https://www.typescriptlang.org/

[official-site-link]: https://github.com/xxs3315/univer-chart-plugin
[documentation-link]: https://github.com/xxs3315/univer-chart-plugin
[playground-link]: https://stackblitz.com/~/github.com/xxs3315/univer-chart-plugin

[readme-en-link]: ./README.md
[readme-zh-link]: ./README.zh-CN.md
