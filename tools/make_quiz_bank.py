#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""从 tools/content/zh/test.py 的题库生成 Excel（题库 + 领域统计 + 答题卡）。
用法：python3 tools/make_quiz_bank.py [输出路径]
"""
import os
import sys

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "..", "downloads", "MM-quiz-bank.xlsx")

from content.zh import test as T  # noqa: E402

CLR_TITLE = "00396B"
CLR_HEAD = "DCE9F5"
thin = Side(style="thin", color="C3CCD3")
box = Border(left=thin, right=thin, top=thin, bottom=thin)
FONT = "PingFang SC"

rows = []
for d in T.DOMAINS:
    for i, (q, opts, ok, why) in enumerate(d["items"], 1):
        rows.append([d["code"], d["title"], i, q] + list(opts) + ["ABCD"[ok], why])
for i, (q, opts, ok, why) in enumerate(T.CONSOL, 1):
    rows.append(["K", "综合模拟卷", i, q] + list(opts) + ["ABCD"[ok], why])

wb = Workbook()
ws = wb.active
ws.title = "题库"
ws.sheet_view.showGridLines = False

ws.merge_cells("A1:K1")
c = ws["A1"]
c.value = "SAP MM 基础知识题库 · Question Bank（%d 题）" % len(rows)
c.font = Font(name=FONT, size=15, bold=True, color="FFFFFF")
c.fill = PatternFill("solid", fgColor=CLR_TITLE)
c.alignment = Alignment(horizontal="left", vertical="center", indent=1)
ws.row_dimensions[1].height = 28

head = ["领域", "领域名称", "题号", "题干", "选项 A", "选项 B", "选项 C", "选项 D", "答案", "解析", "自测（✓/✗）"]
for j, h in enumerate(head, 1):
    cell = ws.cell(row=3, column=j, value=h)
    cell.font = Font(name=FONT, size=10, bold=True, color="1F3A5F")
    cell.fill = PatternFill("solid", fgColor=CLR_HEAD)
    cell.border = box
    cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)

for r, data in enumerate(rows, start=4):
    for j, val in enumerate(data + [""], 1):
        cell = ws.cell(row=r, column=j, value=val)
        cell.font = Font(name=FONT, size=10)
        cell.border = box
        cell.alignment = Alignment(vertical="top", wrap_text=(j in (4, 10)))
    ws.cell(row=r, column=9).alignment = Alignment(horizontal="center", vertical="top")
    ws.cell(row=r, column=3).alignment = Alignment(horizontal="center", vertical="top")

widths = [7, 24, 6, 52, 22, 22, 22, 22, 6, 58, 10]
for j, w in enumerate(widths, 1):
    ws.column_dimensions[get_column_letter(j)].width = w
ws.freeze_panes = "A4"

# 统计页
ws2 = wb.create_sheet("领域统计")
ws2.sheet_view.showGridLines = False
ws2["A1"] = "按领域统计"
ws2["A1"].font = Font(name=FONT, size=13, bold=True, color=CLR_TITLE)
h2 = ["领域", "名称", "题数", "对应章节"]
for j, h in enumerate(h2, 1):
    cell = ws2.cell(row=3, column=j, value=h)
    cell.font = Font(name=FONT, size=10, bold=True)
    cell.fill = PatternFill("solid", fgColor=CLR_HEAD)
    cell.border = box
r = 4
for d in T.DOMAINS:
    chapter = T._CHAPTER.get(d["code"], "")
    for j, val in enumerate([d["code"], d["title"], len(d["items"]), chapter], 1):
        cell = ws2.cell(row=r, column=j, value=val)
        cell.font = Font(name=FONT, size=10)
        cell.border = box
    r += 1
for j, val in enumerate(["K", "综合模拟卷", len(T.CONSOL), "全部章节"], 1):
    cell = ws2.cell(row=r, column=j, value=val)
    cell.font = Font(name=FONT, size=10)
    cell.border = box
r += 1
ws2.cell(row=r, column=1, value="合计").font = Font(name=FONT, size=10, bold=True)
ws2.cell(row=r, column=3, value=len(rows)).font = Font(name=FONT, size=10, bold=True)
for j, w in enumerate([8, 34, 8, 30], 1):
    ws2.column_dimensions[get_column_letter(j)].width = w

# 答题卡
ws3 = wb.create_sheet("答题卡")
ws3["A1"] = "答题卡（先做卷、再对答案）"
ws3["A1"].font = Font(name=FONT, size=13, bold=True, color=CLR_TITLE)
cols = ["题号", "答案", "题号", "答案", "题号", "答案", "题号", "答案"]
for j, h in enumerate(cols, 1):
    cell = ws3.cell(row=3, column=j, value=h)
    cell.font = Font(name=FONT, size=10, bold=True)
    cell.fill = PatternFill("solid", fgColor=CLR_HEAD)
    cell.border = box
n = len(rows)
per_col = (n + 3) // 4
for i in range(per_col):
    for k in range(4):
        num = i + 1 + k * per_col
        if num > n:
            continue
        ws3.cell(row=4 + i, column=1 + k * 2, value=num).border = box
        ws3.cell(row=4 + i, column=2 + k * 2, value="").border = box
for j, w in enumerate([7, 8, 7, 8, 7, 8, 7, 8], 1):
    ws3.column_dimensions[get_column_letter(j)].width = w

wb.save(OUT)
print("wrote %s  (%d questions)" % (os.path.abspath(OUT), len(rows)))
