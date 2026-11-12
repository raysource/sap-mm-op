#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成「SAP GUI 8.10 实操练习记录」Excel（学习者用）。

表头汇总区自动统计下方每次练习的时长；「练习内容」是下拉框，取自本文件的
「内容清单」页（17 个任务，与 assets/js/lab.js 的 TASKS 一一对应）。
用法：python3 tools/make_practice_log.py [输出路径]
"""
import os
import sys

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import CellIsRule

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "downloads", "GUI810-practice-log.xlsx")

CLR_TITLE = "00396B"
CLR_HEAD = "DCE9F5"
CLR_SUM = "F2F8FE"
CLR_LINE = "C3CCD3"

TASKS = [
    ("t01", "① 登录 110 / MMUSER01（SAP Logon）", "界面", "LOGIN", 10),
    ("t02", "② 命令字段 /nMM03 查物料 R-1002", "界面", "MM03", 10),
    ("t03", "③ SU3 个人参数（LANG/WRK/BUKRS）", "界面", "SU3", 10),
    ("t04", "④ MM01 新建物料 R-1001（720.00）", "主数据", "MM01", 30),
    ("t05", "⑤ BP 新建供应商 100123", "主数据", "BP", 20),
    ("t06", "⑥ ME11 采购信息记录 720.00", "主数据", "ME11", 15),
    ("t07", "⑦ MM02 勾「自动采购单」（R-1002）", "主数据", "MM02", 12),
    ("t08", "⑧ ME51N 采购申请 300 PC", "采购到付款", "ME51N", 15),
    ("t09", "⑨ ME21N 参照申请转采购订单", "采购到付款", "ME21N", 20),
    ("t10", "⑩ MIGO 收货 101（300 PC）", "采购到付款", "MIGO", 20),
    ("t11", "⑪ MIRO 无差异发票 216,000.00", "采购到付款", "MIRO", 20),
    ("t12", "⑫ F-53 付款并清账", "采购到付款", "F-53", 15),
    ("t13", "⑬ OMJJ 打开 101 自动建单", "无 PO 收货", "OMJJ", 15),
    ("t14", "⑭ MB01 无 PO 收货 50 PC（自动建 PO）", "无 PO 收货", "MB01", 25),
    ("t15", "⑮ MIRO 差异发票 217,200（容差内）", "发票校验", "MIRO", 20),
    ("t16", "⑯ 超额发票冻结 → MRBR 释放", "发票校验", "MRBR", 20),
    ("t17", "⑰ MMPV 结转期间并验证拦截", "月结", "MMPV", 15),
]
FIRST, LAST = 7, 66          # 明细行 7..66（60 行）
HDR = 6                      # 表头行

thin = Side(style="thin", color=CLR_LINE)
box = Border(left=thin, right=thin, top=thin, bottom=thin)

wb = Workbook()

# ---------------------------------------------------------------- 练习记录
ws = wb.active
ws.title = "练习记录"
ws.sheet_view.showGridLines = False

ws.merge_cells("A1:F1")
c = ws["A1"]
c.value = "SAP GUI 8.10 实操练习记录 · Practice Log"
c.font = Font(name="PingFang SC", size=16, bold=True, color="FFFFFF")
c.fill = PatternFill("solid", fgColor=CLR_TITLE)
c.alignment = Alignment(horizontal="left", vertical="center", indent=1)
ws.row_dimensions[1].height = 30

ws["A2"] = "学习者 Learner"
ws["B2"] = ""
ws.merge_cells("B2:C2")
ws["D2"] = "开始日期 Start"
ws["E2"] = None
ws["E2"].number_format = "yyyy-mm-dd"
ws["F2"] = "目标：17 个任务（SAP GUI 8.10 实操课）"
for ref in ("A2", "D2", "F2"):
    ws[ref].font = Font(name="PingFang SC", size=10, bold=True, color="556B81")
ws["B2"].border = box
ws["E2"].border = box

# 汇总区（表头之上，汇总下面每一次练习的时长）
ws.merge_cells("A3:F3")
ws["A3"] = "汇总 Summary（自动统计下方每一次练习）"
ws["A3"].font = Font(name="PingFang SC", size=11, bold=True, color="0A4FA0")
ws["A3"].fill = PatternFill("solid", fgColor=CLR_SUM)
ws["A3"].alignment = Alignment(vertical="center", indent=1)
ws.row_dimensions[3].height = 22

sum_cells = [
    ("A4", "练习次数", "B4", "=COUNT($A${0}:$A${1})", "0 次"),
    ("C4", "累计时长（分钟）", "D4", "=SUM($D${0}:$D${1})", "0 分钟"),
    ("E4", "折合小时", "F4", "=ROUND($D$4/60,1)", "0.0 小时"),
    ("A5", "平均每次（分钟）", "B5", "=IFERROR(ROUND(AVERAGE($D${0}:$D${1}),0),0)", "0 分钟"),
    ("C5", "覆盖任务数", "D5", '=SUMPRODUCT(($E${0}:$E${1}<>"")/COUNTIF($E${0}:$E${1},$E${0}:$E${1}&""))', "0 / 17"),
    ("E5", "最近练习", "F5", "=IFERROR(MAX($A${0}:$A${1}),\"\")", "yyyy-mm-dd"),
]
for lab_ref, lab, val_ref, formula, fmt in sum_cells:
    ws[lab_ref] = lab
    ws[lab_ref].font = Font(name="PingFang SC", size=10, bold=True, color="556B81")
    vc = ws[val_ref]
    vc.value = formula.format(FIRST, LAST)
    vc.font = Font(name="PingFang SC", size=12, bold=True, color="131E29")
    vc.alignment = Alignment(horizontal="left", indent=1)
    vc.number_format = fmt
    vc.fill = PatternFill("solid", fgColor="F7FBFF")
    vc.border = box

ws.merge_cells("A5:D5") if False else None
ws["A5"].alignment = Alignment(indent=1)

# 表头
heads = ["日期 Date", "开始 Start", "结束 End", "练习时长(分钟) Min", "练习内容 Content", "备考 Notes / 備考"]
for i, h in enumerate(heads, start=1):
    cell = ws.cell(row=HDR, column=i, value=h)
    cell.font = Font(name="PingFang SC", size=10.5, bold=True, color="26323C")
    cell.fill = PatternFill("solid", fgColor=CLR_HEAD)
    cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    cell.border = box
ws.row_dimensions[HDR].height = 30

# 第 7 行：一条示例记录（学员照着填，不用了就删整行，汇总会跟着归零）
import datetime as _dt
EX = {
    1: _dt.date(2026, 11, 7),
    2: _dt.time(9, 0),
    3: _dt.time(9, 40),
    5: "⑦ ME21N 参照申请转采购订单",
    6: "示例：PO 净价是只读的，来自 ME11 信息记录；要改价回 ME11，别在 PO 上改",
}
for col, val in EX.items():
    ws.cell(row=FIRST, column=col, value=val)
from openpyxl.comments import Comment
ws.cell(row=FIRST, column=1).comment = Comment(
    "示例记录：换成你自己的日期/时间即可，也可删掉整行；删掉后上方汇总自动归零。", "课程组", width=260, height=80)

for r in range(FIRST, LAST + 1):
    ws.cell(row=r, column=1).number_format = "yyyy-mm-dd"
    ws.cell(row=r, column=2).number_format = "hh:mm"
    ws.cell(row=r, column=3).number_format = "hh:mm"
    d = ws.cell(row=r, column=4)
    d.value = '=IF(COUNT(B{r}:C{r})=2,ROUND((C{r}-B{r})*1440,0),"")'.format(r=r)
    d.number_format = "0"
    for col in range(1, 7):
        cc = ws.cell(row=r, column=col)
        cc.border = box
        cc.font = Font(name="PingFang SC", size=10.5)
        if col in (1, 2, 3, 4):
            cc.alignment = Alignment(horizontal="center")

# 示例行淡黄底 + 斜体，一眼看出是样例
for col in range(1, 7):
    cc = ws.cell(row=FIRST, column=col)
    cc.fill = PatternFill("solid", fgColor="FFF9E8")
    cc.font = Font(name="PingFang SC", size=10.5, italic=True, color="8A5A00")

widths = {"A": 13, "B": 9, "C": 9, "D": 15, "E": 40, "F": 26}
for k, v in widths.items():
    ws.column_dimensions[k].width = v

ws.freeze_panes = "A7"
ws.auto_filter.ref = "A{0}:F{1}".format(HDR, LAST)

# 练习内容下拉（来自「内容清单」B 列）
dv = DataValidation(
    type="list",
    formula1="'内容清单'!$B$4:$B$20",
    allow_blank=True,
    showDropDown=False,
)
dv.error = "请从下拉列表里选练习内容（见「内容清单」页）"
dv.errorTitle = "练习内容"
dv.prompt = "从 17 个任务里选一个（SAP GUI 8.10 实操课）"
dv.promptTitle = "练习内容"
ws.add_data_validation(dv)
dv.add("E{0}:E{1}".format(FIRST, LAST))

# 长时段提醒：一次 ≥ 90 分钟标黄
ws.conditional_formatting.add(
    "D{0}:D{1}".format(FIRST, LAST),
    CellIsRule(operator="greaterThanOrEqual", formula=["90"],
               fill=PatternFill("solid", bgColor="FFF6E0"), font=Font(color="8A5A00")),
)

ws.page_setup.orientation = "landscape"
ws.page_setup.paperSize = ws.PAPERSIZE_A4
ws.page_setup.fitToWidth = 1
ws.page_setup.fitToHeight = 0
ws.sheet_properties.pageSetUpPr.fitToPage = True
ws.print_title_rows = "1:{0}".format(HDR)
ws.print_area = "A1:F{0}".format(LAST)

# ---------------------------------------------------------------- 内容清单
ws2 = wb.create_sheet("内容清单")
ws2.sheet_view.showGridLines = False
ws2.merge_cells("A1:H1")
ws2["A1"] = "练习内容清单（17 个任务，与课程「引导式实操」一致）"
ws2["A1"].font = Font(name="PingFang SC", size=13, bold=True, color="FFFFFF")
ws2["A1"].fill = PatternFill("solid", fgColor=CLR_TITLE)
ws2["A1"].alignment = Alignment(vertical="center", indent=1)
ws2.row_dimensions[1].height = 26

ws2.merge_cells("A2:H2")
ws2["A2"] = "这一页是下拉框的来源，也是按任务的统计。改任务名请连「练习记录」页的旧记录一起改。"
ws2["A2"].font = Font(name="PingFang SC", size=10, color="556B81")
ws2["A2"].alignment = Alignment(indent=1)

h2 = ["序号", "练习内容", "章节", "T-code", "计划分钟", "已练次数", "累计时长(分钟)", "状态"]
for i, h in enumerate(h2, start=1):
    cell = ws2.cell(row=3, column=i, value=h)
    cell.font = Font(name="PingFang SC", size=10.5, bold=True, color="26323C")
    cell.fill = PatternFill("solid", fgColor=CLR_HEAD)
    cell.alignment = Alignment(horizontal="center", vertical="center")
    cell.border = box

for idx, (tid, title, chapter, tcode, mins) in enumerate(TASKS, start=1):
    r = 3 + idx
    ws2.cell(row=r, column=1, value=idx).alignment = Alignment(horizontal="center")
    ws2.cell(row=r, column=2, value=title)
    ws2.cell(row=r, column=3, value=chapter)
    ws2.cell(row=r, column=4, value=tcode).alignment = Alignment(horizontal="center")
    ws2.cell(row=r, column=5, value=mins).alignment = Alignment(horizontal="center")
    ws2.cell(row=r, column=6, value="=COUNTIF('练习记录'!$E${0}:$E${1},$B{2})".format(FIRST, LAST, r)).alignment = Alignment(horizontal="center")
    ws2.cell(row=r, column=7, value="=SUMIF('练习记录'!$E${0}:$E${1},$B{2},'练习记录'!$D${0}:$D${1})".format(FIRST, LAST, r)).alignment = Alignment(horizontal="center")
    ws2.cell(row=r, column=8, value='=IF($F{0}>0,"✓","")'.format(r)).alignment = Alignment(horizontal="center")
    for col in range(1, 9):
        cc = ws2.cell(row=r, column=col)
        cc.border = box
        if not cc.font or not cc.font.name:
            cc.font = Font(name="PingFang SC", size=10.5)

tot = 3 + len(TASKS) + 1
ws2.cell(row=tot, column=2, value="合计 / 计划").font = Font(name="PingFang SC", size=10.5, bold=True)
ws2.cell(row=tot, column=5, value="=SUM(E4:E20)").font = Font(name="PingFang SC", size=10.5, bold=True)
ws2.cell(row=tot, column=6, value="=SUM(F4:F20)").font = Font(name="PingFang SC", size=10.5, bold=True)
ws2.cell(row=tot, column=7, value="=SUM(G4:G20)").font = Font(name="PingFang SC", size=10.5, bold=True)
ws2.cell(row=tot, column=8, value='=IF(COUNTIF($H$4:$H$20,"✓")=17,"全部完成","进行中")').font = Font(name="PingFang SC", size=10.5, bold=True)
for col in range(1, 9):
    ws2.cell(row=tot, column=col).fill = PatternFill("solid", fgColor=CLR_SUM)
    ws2.cell(row=tot, column=col).border = box

for k, v in {"A": 6, "B": 38, "C": 14, "D": 10, "E": 10, "F": 10, "G": 16, "H": 8}.items():
    ws2.column_dimensions[k].width = v
ws2.freeze_panes = "A4"

# ---------------------------------------------------------------- 说明
ws3 = wb.create_sheet("说明")
ws3.sheet_view.showGridLines = False
ws3.column_dimensions["A"].width = 4
ws3.column_dimensions["B"].width = 100

lines = [
    ("h", "怎么用这张表"),
    ("t", "0. 第 7 行是一条示例（淡黄底、斜体）：照它的写法填你自己的记录；不需要了就删掉整行，上方汇总会自动归零。"),
    ("t", "1. 每次练习开始前，在「练习记录」页最下面空行填日期；结束时补齐开始/结束时间，时长自动算出（分钟）。"),
    ("t", "2. 「练习内容」必须从下拉框选——列表来自「内容清单」页的 17 个任务，选过之后该页会自动累计次数与时长。"),
    ("t", "3. 「备考」写卡住的地方：报错原文、根因、下次要注意什么（例：M8083 价格容差 1%，见附录报错表）。"),
    ("t", "4. 表头上方「汇总 Summary」随录入自动更新：练习次数 / 累计时长 / 折合小时 / 平均每次 / 覆盖任务数 / 最近练习日期。"),
    ("t", "5. 只记得时长、没记开始结束？把 D 列公式删掉直接填数字即可（公式在 D7:D66）。"),
    ("h", "口径"),
    ("t", "· 时长 =（结束 − 开始）× 1440，单位分钟，四舍五入到整数；跨零点请拆成两条记录。"),
    ("t", "· 覆盖任务数按「练习内容」去重统计；17 个任务全做过就是 17 / 17。"),
    ("t", "· 一次 ≥ 90 分钟会在时长格标黄，提示分两段练、中间休息。"),
    ("h", "配套"),
    ("t", "· 课程站点：bash serve.sh 后打开 http://127.0.0.1:8838/index.html ，引导实操在 lab.html。"),
    ("t", "· 仿真器里的单号是固定的练习基线：申请 10000001 / 订单 4500000123 / 物料凭证 4900000001 / 发票 5105600001。"),
    ("t", "· 验收清单（网页可打印）对应「内容清单」页的 17 项，两边勾选口径一致。"),
]
r = 2
for kind, text in lines:
    cell = ws3.cell(row=r, column=2, value=text)
    if kind == "h":
        cell.font = Font(name="PingFang SC", size=12, bold=True, color="0A4FA0")
        ws3.row_dimensions[r].height = 26
    else:
        cell.font = Font(name="PingFang SC", size=10.5)
        cell.alignment = Alignment(wrap_text=True, vertical="top")
        ws3.row_dimensions[r].height = 22
    r += 1

wb.calculation.fullCalcOnLoad = True

os.makedirs(os.path.dirname(os.path.abspath(OUT)), exist_ok=True)
wb.save(OUT)
print("wrote", os.path.abspath(OUT), os.path.getsize(OUT), "bytes")
