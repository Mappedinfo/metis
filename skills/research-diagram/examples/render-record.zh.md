# 虚构图件制作记录

- 来源：同目录method.mmd，四个节点与四条边；图注保存在两行caption注释。
- profile：journal；使用背景白、主色#0072B2、墨色#1A1A1A、Helvetica/Arial/sans-serif。
  Mermaid逻辑字号16px；物理宽度183mm，按886逻辑宽度换算，标签约9.4pt。
- 后端：公开npm包@mermaid-js/mermaid-cli 11.12.0；实际包元数据与CLI帮助已核对。
  本地Chrome作渲染器；未改项目依赖，也未用远程渲染服务。
- 可复现步骤：mmdc从method.mmd和mermaid-config.json生成method.raw.svg；
  scripts/add_caption.py从源码caption注释追加下方图注，并设183mm物理宽度，生成method.svg。
  完整命令形状见references/production.zh.md；机器浏览器路径是运行配置，不进入公共文件。
- 首次启动使用进程替代JSON读取失败；一次配置重试成功。
- 一次视觉修复：初次兼容性预览丢失HTML节点标签；核对已安装Mermaid官方类型说明后，
  改为根级htmlLabels=false，生成原生SVG文字并使用白背景。没有更改图件逻辑。
- 实际观察：查看导出SVG的692px宽预览（约183mm/96dpi），节点和边标签清楚；
  正向输入、候选、通过和返回提取的反馈方向可辨；未见重叠或裁切，图注位于图下方。
  SVG有10个text对象、0个foreignObject；六个关键节点/分支标签均保留。
- 范围：Mermaid源码＋SVG的演示制作已检查；没有进行draw.io应用编辑，未声称科学结果。
  method.preview.png只是由交付SVG生成的代表性视觉证据，不是独立绘制。
