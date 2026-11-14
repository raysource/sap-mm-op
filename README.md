# SAP GUI 8.10 实操课程站 · MM 采购与发票校验

把本目录 `../*.pdf`（MM 100 小时基础设置、详解 100 小时 MM I/II、无 PO 收货、IV 设置、GR 与 IR）
整理成一门**能动手操作**的课程：先讲 SAP GUI 8.10（Horizon 主题）的登录与界面操作，再走
物料主数据 → 采购申请 → 采购订单 → 收货 → 发票校验 → 付款，并单独讲「无 PO 收货自动建单」
与「GR/IR、发票差异」。

站点是纯静态页 + 一个网页版 SAP GUI 8.10 仿真器，不需要 SAP 账号，也不需要虚拟机。

## 启动

```bash
bash serve.sh                 # 默认 8846
# 或指定端口
PORT=8850 bash serve.sh
```

| 入口 | 说明 |
| --- | --- |
| `http://127.0.0.1:8846/` | 课程首页（学习路径、8.10 版本差异、演练数据卡） |
| `/gui.html` | 界面与操作：SAP Logon、五区、命令字段 /n、快捷键、F1/F4、主题 |
| `/basics.html` | 业务基础：组织、主数据、单据链、移动类型、GR/IR、配置十项 |
| `/master.html` | 主数据实操：MM01 逐屏、MM02、BP 供应商、ME11 价格 |
| `/flow.html` | 采购到付款五步（含凭证流与会计影响） |
| `/nopo.html` | 无 PO 收货：自动建 PO 六个前提、MB01、会计期间 OB52/MMPV |
| `/grir.html` | GR 与 IR：基于收货的 IV、先 IR 后 GR、四种容差、冻结/解冻、MR11 |
| `/extra.html` | 进阶：501、退货 122/102、311/261、MRP、月结 |
| `/lab.html` | **引导式实操**：17 个任务，内嵌仿真器，做完自动判定 |
| `/sim.html` | 仿真器单独打开（30 个画面，可登录、输 T-code、保存出单号） |
| `/handbook.html` | 速查：T-code 全表、报错速查、三语术语、24 题自测 |
| `/test.html` | **基础测试**：10 个领域 106 题 + 20 题综合卷，含解析（中/英/日） |
| `/checklist.html` | 验收清单 + 演练记录表（可打印） |

## 仿真器能做什么

- **登录**：SAP Logon 连接列表 → 登录对话框（客户端 110 / 用户 / 口令 / 语言），未登录时输入事务码会被拦下。
- **操作**：命令字段（支持 `/n`、`/o`、`/nex`）、回车检查、✓ 保存、F3 返回、F4/F1 提示、SU3 参数（改 LANG 会真的切界面语言）。
- **业务画面 29 个**：SMENU、MM01/02/03、BP、ME01、ME11/12、ME51N、ME21N、ME23N、MIGO、MB01、MB1A、MB1B、MB5S、MMBE、MD04、MIRO、MIR4、MRBR、MR11、FB03、F-53、OMJJ、OMR6、OB52、MMPV、SU3、LOGIN。
- **真实规则**：物料未在工厂维护、供应商缺采购组织、没有信息记录导致「无法确定净价」、收货超容差、
  发票差异在容差内记价格差异、超容差过账后冻结付款（M8083）、MRBR 解冻、MMPV 结转后用上期日期过账报 M7021、
  无 PO 收货的四个开关缺一就报「请输入采购订单」。
- **借贷平衡**：每张会计凭证都会断言借贷相等；GR/IR 冲销额永远取「收货金额」，差异单独进 660000（小额差异）/ 660100（价格差异）。
- **数据**：存在 localStorage（`sapgui810.lab.sim.v1`），右侧「重置数据」可恢复初始种子数据。

## 目录结构

```
site/
  index.html … checklist.html      构建产物（勿手改）
  sim.html                         仿真器入口（手写，不参与构建）
  serve.sh                         本地预览
  assets/css/{main,doc,sim,ja}.css GUI 还原组件 / 文档版式 / 仿真器 / 日文排版
  assets/js/{
    sim-core.js                    登录、状态、外壳、路由、号段、期间与凭证
    sim-screens.js                 业务画面（MM/ME/MIGO/MIRO/MB…）
    sim-screens2.js                登录、MM02、ME01、ME12、OMJJ、MB01、MB1A、MR11、MMPV、OB52、SU3
    lab.js                         17 个任务的判定逻辑
    app.js                         侧栏、进度、清单、自测、T-code 复制
  }
  tools/
    build.py                       三语构建 + 结构校验（内容在 tools/content/<lang>）
    check_content.py               翻译结构自检（不写 HTML）
    make_practice_log.py           生成 Excel 练习记录表
    content/{zh,en,ja}/*.py        每页一个 PAGE 字典
  downloads/                       练习记录表 + 打印版 PDF
  en/ ja/                          英文 / 日文构建产物
```

重建：

```bash
python3 tools/build.py            # 三语（会校验结构一致性，缺页直接报错退出）
python3 tools/build.py zh         # 只重建中文
python3 tools/check_content.py en # 只做结构校验
python3 tools/make_practice_log.py
```

## 数据口径（全站统一）

| 项目 | 值 |
| --- | --- |
| 客户端 / 用户 | 110 / MMUSER01 |
| 公司代码 / 采购组织 / 采购组 | 1710 / 1710 / 001 |
| 工厂 / 库存地点 | 1710 / 0001（主仓）、0002（线边仓） |
| 物料 | R-1001 钢制支架（ROH，720.00，评估类 3000）；R-1002 铝合金外壳 180.00；R-1003 密封圈 12.50 |
| 供应商 | 100123 Palo Alto Components Inc.（主流程）；100124 Bay Area Metals（无 PO 收货） |
| 主流程 | 申请 10000001 → 订单 4500000123（300 × 720.00 = 216,000.00）→ 收货 4900000001 / 5100000001 → 发票 5105600001 / 5100000002 → 付款 5100000003 |
| 无 PO 收货 | 50 PC × 180.00 = 9,000.00，物料凭证 4900000002 + 自动生成 PO 4500000124 |
| 差异发票 | 217,200.00（+0.56 %，PP 容差 1 % 内）→ 价格差异 1,200.00；226,800.00（+5 %）→ 过账并冻结（M8083）→ MRBR 释放 |

> 单号取决于演练时的先后顺序，正文里标注的是「按教材顺序第一次走完」的结果。

## 已验证 / 未验证

已验证（本机实测）：

- 三语构建（`python3 tools/build.py`，结构校验通过）+ 11 页 × 3 语 + lab.html + sim.html。
- 仿真器全流程脚本实跑：登录 → MM01 → BP → ME11 → ME51N → ME21N → MIGO → MIRO → F-53，
  以及 OMJJ/MM02/BP/ME01 四开关 → MB01 自动建 PO、MIRO 差异/冻结、MRBR 解冻、MMPV 结转拦截，
  末态 `17 / 17 已完成`（`Lab.__done()` 全 true）。
- 会计凭证借贷平衡与 GR/IR 归零、库存 20 → 70 PC、自动生成 PO 净额 9,000.00。
- Excel 练习记录表生成（17 项下拉、汇总公式）。

未验证 / 需注意：

- 界面是 **SAP GUI 8.10 Horizon 的还原图与网页仿真器**，不是系统截图；字段位置与按钮文案随补丁/主题略有差异。
- 未连接任何真实 SAP 系统；配置类画面（OMJJ、OB52、OMR6）只做「看得懂、知道改哪」的程度，不替代真实定制。
- 8.10 版本事实（2026-07-16 交付、支持到 2029-06-30、Horizon/Quick Theming、BEx 单独安装）来自 SAP Note 147519 / 3549180 与 SAP Help Portal，实施前请以你手上的 Note 为准。
