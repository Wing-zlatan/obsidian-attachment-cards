# Attachment Cards

让附件清楚可见，让笔记保持好读。

将 PDF、Word、Excel 等文档附件显示为紧凑、易辨认的卡片，点击即可打开。已有的 `![[文件]]` 直接生效，不需要专用代码块、转换笔记或配置。

[English](README.md)

![同一篇项目笔记启用前后的对比：正文、文档附件和保持原样的图片](docs/images/attachment-cards-comparison.png)

会议纪要里的材料、课程笔记里的讲义、项目记录里的交付文件：附件留在讨论旁边，正文保持易读。

## 安装

在 Obsidian 中打开“设置 → 社区插件 → 浏览”，搜索 **Attachment Cards**，点击“安装”和“启用”。

[在 Obsidian 中打开](obsidian://show-plugin?id=attachment-cards) · [社区插件页面](https://community.obsidian.md/plugins/attachment-cards)

打开已有文档附件的笔记，即可看到卡片。停用插件恢复原生显示，Markdown 正文不变。

## 功能

| 类型 | 扩展名 | 图标颜色 |
| --- | --- | --- |
| PDF | `.pdf` | 红色 |
| Word | `.doc`、`.docx` | 蓝色 |
| Excel | `.xls`、`.xlsx` | 绿色 |
| PowerPoint | `.ppt`、`.pptx` | 橙色 |
| 纯文本 | `.txt` | 灰蓝色 |
| 其他附件 | 其他非图片、非笔记、非音视频文件 | 灰色 |

短文件名单行紧凑显示；长文件名完整换行，保留日期、版本和扩展名。卡片只显示图标和文件名，没有设置页面。阅读视图与实时预览均可使用，源代码模式保留 Markdown。图片、笔记、Canvas 以及音视频继续使用原生显示和播放器。

## 手动安装

1. 从本仓库的 **Releases** 页面下载 `main.js`、`manifest.json`、`styles.css`。
2. 在笔记库的 `.obsidian/plugins/` 下创建 `attachment-cards` 文件夹，将三个文件放入其中。
3. 重新加载 Obsidian，在“设置 → 社区插件”中启用 **Attachment Cards**。

安装不需要 Node.js、Python 或编译。打包脚本另外生成的 ZIP 已包含 `attachment-cards/` 这一层目录。

## 使用

附件已位于笔记库时，照常插入：

```markdown
![[Report.pdf]]
![[Document.docx]]
![[Workbook.xlsx]]
![[Slides.pptx]]
![[Notes.txt]]
![[Archive.zip]]
```

也支持 `![Report](Report.pdf)`。普通正文链接 `[[Report.pdf]]` 不变。长文件名完整换行，悬停也可查看完整名称；获得键盘焦点后，Enter 或空格可打开。跨卡片选择文字时不会触发打开。

PDF 嵌入显示为卡片，点击后在 Obsidian 中打开；Office 文件由系统关联应用打开。插件不新增预览功能，不移动附件，不修改笔记正文，不发送网络请求，不收集使用数据。

## 兼容与开发

manifest 声明最低 Obsidian 版本为 1.5.0，实际检查环境为 Windows、Obsidian 1.15.0 和 Blue Topaz 主题；旧版本与移动端尚未验证。插件装饰原生嵌入节点，Obsidian 更新 DOM 结构后可能需要适配。

源码入口为 `main.js`，样式为 `styles.css`，不需要构建。发布打包方法见 [英文 README](README.md)，GitHub 和社区目录的发布步骤见 [发布说明](docs/publishing.md)。

许可证：[MIT](LICENSE)。图标通过 Obsidian 内置 Lucide 图标 API 获取。

作者：[wing-zlatan](https://github.com/wing-zlatan)。
