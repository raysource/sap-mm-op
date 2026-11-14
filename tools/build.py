#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""构建 SAP GUI 8.10 实操课程站（中 / 英 / 日）。
内容在 tools/content/<lang>/<slug>.py，每页一个 PAGE 字典；本脚本只负责渲染与校验。
用法：python3 tools/build.py
"""
import html
import importlib
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
LANGS = ["zh", "en", "ja"]
DIRS = {"zh": "", "en": "en", "ja": "ja"}
VER = "20261107a"
def asset_ver():
    """用资产最新修改时间做缓存版本号，改过 js/css 立刻失效（静态站最常见的坑）。"""
    mx = 0
    for root, _, fs in os.walk(os.path.join(ROOT, "assets")):
        for f in fs:
            mx = max(mx, os.path.getmtime(os.path.join(root, f)))
    return str(int(mx))

# 页面顺序与分组（分组名取各语言的 PAGE['nav']['group']）
PAGES = ["index", "gui", "basics", "master", "flow", "nopo", "grir", "extra", "lab", "handbook", "test", "checklist"]
GROUPS = {"zh": ["开始", "界面与操作", "业务基础", "主数据", "走流程", "进阶操作", "动手实操", "附录"],
          "en": ["Start", "GUI basics", "Business basics", "Master data", "Process", "Advanced", "Hands-on", "Appendix"],
          "ja": ["はじめに", "画面と操作", "業務の基礎", "マスタ", "プロセス", "応用", "実習", "付録"]}
GROUP_OF = {"index": 0, "gui": 1, "basics": 2, "master": 3, "flow": 4, "nopo": 5, "grir": 5,
            "extra": 5, "lab": 6, "handbook": 7, "test": 7, "checklist": 7}

I18N = {
    "zh": dict(lang="zh", title="SAP GUI 8.10 实操教程 · MM 采购与发票校验", brand="SAP GUI 8.10 实操课",
               tag="SAP GUI 8.10 · Horizon · S/4HANA", env="客户端 110 · 公司代码 1710 · 界面语言 中文",
               lab="引导实操", toc="课程目录", back="‹ 返回课程",
               labtitle="引导式实操：17 个任务，做完自动判定",
               simhint="SAP GUI 8.10 仿真器（可真实输入）", popout="新窗口打开",
               printbar="打印版 PDF（A4，可直接打印或发同事）：", footer="依据《MM 100 小时基础设置》《详解 100 小时 MM I/II》《无 PO 收货》《IV 设置》《GR 与 IR》整理 · 界面为 SAP GUI 8.10 Horizon 还原图，非系统截图"),
    "en": dict(lang="en", title="SAP GUI 8.10 hands-on course · MM purchasing and invoice verification", brand="SAP GUI 8.10 hands-on",
               tag="SAP GUI 8.10 · Horizon · S/4HANA", env="Client 110 · Company code 1710 · UI English",
               lab="Guided lab", toc="Contents", back="‹ Back to course",
               labtitle="Guided lab: 17 tasks, checked automatically",
               simhint="SAP GUI 8.10 simulator (real typing)", popout="Open in new window",
               printbar="Printable PDF (A4):", footer="Compiled from the MM 100-hour baseline, MM I/II, GR without PO, IV configuration and GR/IR material · GUI is an 8.10 Horizon reproduction, not a screenshot"),
    "ja": dict(lang="ja", title="SAP GUI 8.10 実践コース · MM 購買と請求書照合", brand="SAP GUI 8.10 実践コース",
               tag="SAP GUI 8.10 · Horizon · S/4HANA", env="クライアント 110 · 会社コード 1710 · 日本語 UI",
               lab="ガイド演習", toc="目次", back="‹ コースに戻る",
               labtitle="ガイド演習：17 タスク（自動判定）",
               simhint="SAP GUI 8.10 シミュレータ（実入力可）", popout="新しいウィンドウで開く",
               printbar="印刷用 PDF（A4）：", footer="「MM 100 時間基礎設定」「詳解 100 時間 MM I/II」「PO なし入庫」「IV 設定」「GR と IR」をもとに構成 · 画面は SAP GUI 8.10 Horizon の再現図です"),
}

# ---------------------------------------------------------------- inline
def md(s):
    if s is None:
        return ""
    s = html.escape(str(s), quote=False)
    s = re.sub(r"`([^`]+)`", r"<code>\1</code>", s)
    s = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", s)
    s = s.replace("\n", "<br>")          # 多行文案用换行即可，不必在内容里写 <br>
    return s

def esc(s):
    return html.escape(str(s if s is not None else ""), quote=True)

# ---------------------------------------------------------------- GUI 组件
MENUS = {
    "zh": ["物料", "编辑", "转到", "环境", "系统", "帮助"],
    "en": ["Material", "Edit", "Goto", "Environment", "System", "Help"],
    "ja": ["品目", "編集", "ジャンプ", "環境", "システム", "ヘルプ"],
}
SYSLINE = {"zh": "S4H (1) 110 · ZH · OVR", "en": "S4H (1) 110 · EN · OVR", "ja": "S4H (1) 110 · JA · OVR"}

def frow(lang, r):
    cls = "frow req" if r.get("req") else "frow"
    w = r.get("w", "w120")
    mark = '<span class="n">%s</span>' % r["mark"] if r.get("mark") else ""
    val = esc(r.get("v", ""))
    if r.get("plain"):
        inp = '<span class="hint" style="font-size:12px">%s</span>' % esc(r.get("v", ""))
        return '<div class="frow"><span class="flabel">%s%s</span>%s</div>' % (
            '<span class="n">%s</span>' % r["mark"] if r.get("mark") else "", esc(r.get("label", "")), inp)
    if r.get("ro"):
        inp = '<span class="inp ro %s">%s</span>' % (w, val)
    else:
        inp = '<span class="inp %s">%s</span>' % (w, val)
    hint = '<span class="hint">%s</span>' % md(r["hint"]) if r.get("hint") else ""
    return '<div class="%s"><span class="flabel">%s%s</span>%s%s</div>' % (cls, mark, esc(r.get("label", "")), inp, hint)

def render_inner(lang, blocks):
    out = []
    for b in blocks:
        t = b["t"]
        if t == "gbox":
            rows = "".join(frow(lang, r) for r in b.get("rows", []))
            out.append('<div class="gbox"><span class="gleg">%s</span>%s%s</div>' % (
                esc(b.get("legend", "")), rows, md(b.get("x", "")) if b.get("x") else ""))
        elif t == "tabs":
            out.append('<div class="tabs">' + "".join(
                '<span class="tab%s">%s</span>' % (" on" if i == b.get("on", 0) else "", esc(n))
                for i, n in enumerate(b["items"])) + "</div>")
        elif t == "tbl":
            head = "".join("<th>%s</th>" % esc(h) for h in b["head"])
            body = []
            for i, r in enumerate(b["rows"]):
                cls = ' class="cur"' if i == b.get("cur") else (' class="sel"' if b.get("sel") is not None and i == b["sel"] else "")
                body.append("<tr%s>%s</tr>" % (cls, "".join("<td>%s</td>" % esc(c) for c in r)))
            out.append('<div class="%s"><table><tr>%s</tr>%s</table></div>' % (b.get("cls", "tctrl"), head, "".join(body)))
        elif t == "status":
            out.append('<div class="wfoot"><span class="sico %s"></span><span class="smsg">%s</span></div>' % (
                b.get("kind", "ok"), md(b.get("x", ""))))
        elif t == "hint":
            out.append('<p class="hint">%s</p>' % md(b.get("x", "")))
        elif t == "p":
            out.append("<p>%s</p>" % md(b.get("x", "")))
        elif t == "h2":
            out.append("<h2>%s</h2>" % md(b.get("x", "")))
        elif t == "dlg":
            out.append('<div class="dlg"><div class="dhead"><span>%s</span><span class="dx">✕</span></div>'
                       '<div class="dbody">%s</div><div class="dfoot"><span class="gbtn">%s</span>'
                       '<span class="gbtn primary">%s</span></div></div>' % (
                           esc(b.get("title", "")), md(b.get("x", "")), esc(b.get("cancel", "取消")),
                           esc(b.get("ok", "确定"))))
        elif t == "tree":
            out.append('<div class="tree">' + "".join(
                '<div class="node"><span class="tw">▸</span><span class="tico doc"></span><b>%s</b>　%s</div>'
                % (esc(i.get("k", "")), md(i.get("v", ""))) for i in b["items"]) + "</div>")
        elif t == "raw":
            out.append(b["x"])
    return "".join(out)

def render_fig(lang, b):
    tcode = b.get("tcode", "")
    title = b.get("title", "")
    menu = b["menu"] if "menu" in b else MENUS[lang]
    icons = "".join('<button class="tbtn i-%s"></button>' % i for i in ["enter", "back", "save", "prev", "exit", "find", "print"])
    if b.get("no_icons"):
        icons = ""
    screen_cls = "wscreen dim" if any(x["t"] == "dlg" for x in b.get("inner", [])) else "wscreen"
    if menu:
        menubar = '<nav class="wmenu">%s<span class="wsys">%s</span></nav>' % (
            "".join("<span>%s</span>" % esc(m) for m in menu), esc(SYSLINE[lang]))
    else:
        menubar = ('<nav class="wmenu" style="justify-content:flex-end">'
                   '<span class="wsys">%s</span></nav>' % esc(SYSLINE[lang]))
    tool = ""
    if not b.get("no_tool"):
        tool = ('<div class="wtool"><span class="okcd">%s</span><button class="tbtn chk" title="Enter">✓</button>'
                '<span class="tsep"></span>%s<span class="spacer"></span>'
                '<button class="tbtn i-help"></button></div>' % (esc(tcode), icons))
    win = (
        '<figure class="gui"><div class="gui-scroll"><div class="win">'
        '<div class="wtitle"><span class="wback">‹</span><span class="wtxt">%s</span>'
        '<span class="wbtns"><i class="mi"></i><i class="mz"></i><i class="mc"></i></span></div>'
        '%s'
        '%s'
        '<div class="%s">%s</div>%s</div></div>'
        '<figcaption><b>%s</b> %s</figcaption></figure>'
    ) % (esc(title), menubar, tool, screen_cls,
         render_inner(lang, [x for x in b.get("inner", []) if x["t"] != "status"]),
         render_inner(lang, [x for x in b.get("inner", []) if x["t"] == "status"][:1]),
         esc(b.get("caption_b", "")), md(b.get("caption", "")))
    return win

# ---------------------------------------------------------------- 块
def render_block(lang, b):
    t = b["t"]
    if t in ("h2", "h3"):
        return "<%s>%s</%s>" % (t, md(b["x"]), t)
    if t == "p":
        return "<p%s>%s</p>" % (' class="%s"' % b["cls"] if b.get("cls") else "", md(b["x"]))
    if t == "lead":
        return '<p class="lead">%s</p>' % md(b["x"])
    if t == "ul":
        return "<ul%s>%s</ul>" % ("" if not b.get("cls") else ' class="%s"' % b["cls"],
                                  "".join("<li>%s</li>" % md(x) for x in b["items"]))
    if t == "ol":
        return '<ol class="steps">%s</ol>' % "".join(
            "<li>%s%s</li>" % (md(x), (' <span class="k">%s</span>' % esc(k)) if k else "")
            for x, k in [(i if isinstance(i, str) else i.get("x"), None if isinstance(i, str) else i.get("k")) for i in b["items"]])
    if t == "steps":
        lis = []
        for i in b["items"]:
            if isinstance(i, str):
                lis.append("<li>%s</li>" % md(i))
            else:
                k = '<span class="k">%s</span>' % esc(i["k"]) if i.get("k") else ""
                lis.append("<li>%s%s</li>" % (md(i["x"]), k))
        return '<ol class="steps">%s</ol>' % "".join(lis)
    if t == "table":
        head = "".join("<th>%s</th>" % md(h) for h in b["head"])
        rows = "".join("<tr>%s</tr>" % "".join(
            '<td%s>%s</td>' % (' class="n"' if b.get("num") and j else "", md(c))
            for j, c in enumerate(r)) for r in b["rows"])
        return '<table%s><tr>%s</tr>%s</table>' % (
            ' class="%s"' % b["cls"] if b.get("cls") else "", head, rows)
    if t == "note":
        head = "<b>%s</b>" % md(b["b"]) if b.get("b") else ""
        return '<div class="note %s">%s%s</div>' % (b.get("kind", ""), head, md(b["x"]))
    if t == "chain":
        parts = []
        for i, n in enumerate(b["items"]):
            if i:
                parts.append('<span class="ar">→</span>')
            parts.append('<span class="cn"><b>%s</b>%s<span>%s</span></span>' % (
                esc(n.get("k", "")), md(n["t"]), md(n.get("s", ""))))
        return '<div class="chain">%s</div>' % "".join(parts)
    if t == "kpi":
        return '<div class="kpi">%s</div>' % "".join(
            "<div><b>%s</b><span>%s</span></div>" % (md(x["b"]), md(x["s"])) for x in b["items"])
    if t == "cards":
        return '<div class="cards">%s</div>' % "".join(
            '<a class="card" href="%s"><b>%s</b><span>%s</span>%s</a>' % (
                esc(x["href"]), esc(x["title"]), esc(x["sub"]),
                '<span class="tcode">%s</span>' % esc(x["k"]) if x.get("k") else "")
            for x in b["items"])
    if t == "check":
        return '<ul class="check">%s</ul>' % "".join("<li>%s</li>" % md(x) for x in b["items"])
    if t == "table_tcode":
        rows = "".join('<tr><td><span class="copyc">%s</span></td><td>%s</td><td>%s</td></tr>' % (
            esc(r[0]), md(r[1]), md(r[2])) for r in b["rows"])
        return '<table class="tcode-table"><tr><th>%s</th><th>%s</th><th>%s</th></tr>%s</table>' % (
            md(b["h"][0]), md(b["h"][1]), md(b["h"][2]), rows)
    if t == "quiz":
        out = []
        for i, q in enumerate(b["items"]):
            out.append('<div class="q" data-ok="%d"><p><b>Q%d.</b> %s</p>%s%s</div>' % (
                q["ok"], i + 1, md(q["q"]),
                "".join("<button>%s</button>" % md(a) for a in q["a"]),
                ('<p class="why">%s</p>' % md(q["why"])) if q.get("why") else ""))
        return '<div class="quiz"%s>%s<p class="score"></p></div>' % (
            (' data-cat="%s"' % esc(b["cat"])) if b.get("cat") else "", "".join(out))
    if t == "defs":
        return '<table class="fld"><tr><th>%s</th><th>%s</th></tr>%s</table>' % (
            md(b["h"][0]), md(b["h"][1]),
            "".join("<tr><td><code>%s</code></td><td>%s</td></tr>" % (esc(k), md(v)) for k, v in b["items"]))
    if t == "fig":
        return render_fig(lang, b)
    if t == "raw":
        return b["x"]
    if t == "hero":
        stats = "".join("<span><b>%s</b>%s</span>" % (md(x["b"]), md(x["s"])) for x in b.get("stats", []))
        btns = "".join('<a href="%s"%s>%s</a>' % (esc(x["href"]), ' class="ghost"' if x.get("ghost") else "", md(x["label"]))
                       for x in b.get("btns", []))
        return ('<section class="hero"><h1>%s</h1>%s<div class="hstats">%s</div><div class="hbtns">%s</div></section>'
                % (md(b["h1"]), "".join("<p>%s</p>" % md(x) for x in b.get("p", [])), stats, btns))
    if t == "dl":
        return ('<p class="dl noprint"><a href="%s" download>%s</a></p>'
                % (esc(b["href"]), md(b.get("x", b["href"]))))
    if t == "hr":
        return "<hr>"
    if t == "two":
        return '<div class="two">%s</div>' % "".join("<div>%s</div>" % render_blocks(lang, col) for col in b["cols"])
    raise SystemExit("unknown block: %s" % t)

def render_blocks(lang, blocks):
    return "".join(render_block(lang, b) for b in blocks)

# ---------------------------------------------------------------- 页面
LAYOUT = """<!DOCTYPE html>
<html lang="{lang}" data-ed="{lang}" data-root="{root}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<title>{title}</title>
<link rel="stylesheet" href="{root}assets/css/main.css?v={ver}">
<link rel="stylesheet" href="{root}assets/css/doc.css?v={ver}">
{css_extra}
</head>
<body>
<header class="coursebar">
  <span class="cb-logo">{brand}</span>
  <span class="cb-tag">{tag}</span>
  <span class="cb-env">{env}</span>
  <span class="cb-prog"><span id="progTxt">0/0</span><span class="bar"><i id="progBar"></i></span></span>
  <a href="{root}lab.html">{lab}</a>
  <span class="langsw">{langs}</span>
</header>
<div class="layout">
  <aside id="sidebar"></aside>
  <main id="main" data-page="{slug}">
{content}
    <div class="pn noprint"></div>
    <div class="docfoot"><span>{footer}</span><span>{verlabel}</span></div>
  </main>
</div>
<script>window.CHAPTERS={chapters};</script>
<script src="{root}assets/js/app.js?v={ver}"></script>
</body>
</html>
"""

LANG_LINK = '<a href="{href}"{cls}>{name}</a>'

def rel_lang_link(cur, target, filename):
    """同一份文件在另一语言目录里的相对路径（中文在根，英文 en/，日文 ja/）。"""
    import posixpath
    cur_dir = DIRS[cur] or "."
    tgt = posixpath.join(DIRS[target], filename) if DIRS[target] else filename
    return posixpath.relpath(tgt, cur_dir)

def chapters_js(pages, lang):
    items = []
    for slug in PAGES:
        p = pages[slug]
        items.append({"id": slug, "file": p["file"],
                      "title": p["nav"]["title"], "sub": p["nav"].get("sub", ""),
                      "group": GROUPS[lang][GROUP_OF[slug]]})
    import json
    return json.dumps(items, ensure_ascii=False)

def build_lang(lang, pages):
    t = I18N[lang]
    root = ("" if DIRS[lang] == "" else "../")
    out_dir = os.path.join(ROOT, DIRS[lang]) if DIRS[lang] else ROOT
    os.makedirs(out_dir, exist_ok=True)
    for slug in PAGES:
        p = pages[slug]
        links = []
        for l2 in LANGS:
            href = rel_lang_link(lang, l2, p["file"])
            links.append(LANG_LINK.format(href=href, name={"zh": "中文", "en": "English", "ja": "日本語"}[l2],
                                          cls=' class="on"' if l2 == lang else ""))
        css_extra = ('<link rel="stylesheet" href="%sassets/css/ja.css?v=%s">' % (root, VER)) if lang == "ja" else ""
        if p.get("print"):
            css_extra += '<style>@media print{@page{size:%s;margin:12mm}}</style>' % p["print"]
        content = render_blocks(lang, p["blocks"]).replace("{root}", root)
        # 打印版 PDF 链接（文件由 Chrome --print-to-pdf 生成，见 README）
        pdf = "downloads/%s%s.pdf" % (p["slug"], "" if lang == "zh" else "-" + lang)
        if p["slug"] in ("flow", "checklist", "handbook", "gui", "nopo", "grir", "master", "test") and os.path.exists(os.path.join(ROOT, pdf)):
            content += ('<p class="small noprint" style="margin-top:18px">%s <a href="%s%s">%s</a></p>'
                        % (esc(t["printbar"]), root, pdf, esc(pdf.split("/")[-1])))
        htmlout = LAYOUT.format(lang=lang, root=root, title=esc(p["nav"].get("head", p["nav"]["title"])) + " · " + esc(t["brand"]),
                                brand=esc(t["brand"]), tag=esc(t["tag"]), env=esc(t["env"]),
                                lab=esc(t["lab"]), langs="".join(links), file=p["file"], slug=p["slug"], content=content,
                                chapters=chapters_js(pages, lang), ver=VER,
                                verlabel="v1.0 · 2026-11-07", css_extra=css_extra,
                                footer=esc(t["footer"]))
        with open(os.path.join(out_dir, p["file"]), "w", encoding="utf-8") as f:
            f.write(htmlout)
    return len(PAGES)

def write_lab(lang):
    t = I18N[lang]
    root = ("" if DIRS[lang] == "" else "../")
    out_dir = os.path.join(ROOT, DIRS[lang]) if DIRS[lang] else ROOT
    tpl_path = os.path.join(HERE, "lab_template.html")
    with open(tpl_path, encoding="utf-8") as f:
        tpl = f.read()
    links = []
    for l2 in LANGS:
        href = rel_lang_link(lang, l2, "lab.html")
        links.append(LANG_LINK.format(href=href, name={"zh": "中文", "en": "English", "ja": "日本語"}[l2],
                                      cls=' class="on"' if l2 == lang else ""))
    out = (tpl.replace("{lang}", lang).replace("{root}", root).replace("{ver}", VER)
              .replace("{brand}", esc(t["brand"])).replace("{title}", esc(t["title"])))
    out = out.replace("{langs}", "".join(links))
    out = (out.replace("{back}", esc(t["back"])).replace("{labtitle}", esc(t["labtitle"]))
              .replace("{simhint}", esc(t["simhint"])).replace("{popout}", esc(t["popout"])))
    css_extra = ('<link rel="stylesheet" href="%sassets/css/ja.css?v=%s">' % (root, VER)) if lang == "ja" else ""
    out = out.replace("{css_extra}", css_extra)
    with open(os.path.join(out_dir, "lab.html"), "w", encoding="utf-8") as f:
        f.write(out)

def load_lang(lang):
    pages = {}
    for slug in PAGES:
        mod = importlib.import_module("content.%s.%s" % (lang, slug))
        pages[slug] = importlib.import_module("content.%s.%s" % (lang, slug)).PAGE
    return pages

def check_structure(zh, other, lang):
    """其他语言必须与中文同结构：块类型、块数、表格行列数一致。"""
    errs = []
    def walk(a, b, path):
        if len(a) != len(b):
            errs.append("%s: %d vs %d blocks" % (path, len(a), len(b)))
            return
        for i, (x, y) in enumerate(zip(a, b)):
            if x["t"] != y["t"]:
                errs.append("%s[%d]: %s vs %s" % (path, i, x["t"], y["t"]))
                continue
            if x["t"] == "table":
                if len(x["head"]) != len(y["head"]):
                    errs.append("%s[%d]: head %d vs %d" % (path, i, len(x["head"]), len(y["head"])))
                if len(x["rows"]) != len(y["rows"]):
                    errs.append("%s[%d]: rows %d vs %d" % (path, i, len(x["rows"]), len(y["rows"])))
            if x["t"] == "fig":
                walk(x.get("inner", []), y.get("inner", []), path + "/fig%d" % i)
            if x["t"] == "two":
                for j, (c1, c2) in enumerate(zip(x["cols"], y["cols"])):
                    walk(c1, c2, path + "/two%d.%d" % (i, j))
    for slug in PAGES:
        walk(zh[slug]["blocks"], other[slug]["blocks"], "%s/%s" % (lang, slug))
        if len(zh[slug]["nav"]) != len(other[slug]["nav"]):
            errs.append("%s/%s nav keys" % (lang, slug))
    return errs

def main():
    global VER
    VER = asset_ver()
    sys.path.insert(0, HERE)
    wanted = [a for a in sys.argv[1:] if a in LANGS] or LANGS
    zh = load_lang("zh")
    total = 0
    for lang in wanted:
        pages = zh if lang == "zh" else load_lang(lang)
        if lang != "zh":
            errs = check_structure(zh, pages, lang)
            if errs:
                print("结构不一致（%s）：" % lang)
                for e in errs[:20]:
                    print("  -", e)
                sys.exit(1)
        n = build_lang(lang, pages)
        write_lab(lang)
        total += n + 1
        print("wrote %-3s %2d pages + lab.html" % (lang, n))
    # sim.html 也是静态入口，版本号跟着资产走
    sp = os.path.join(ROOT, "sim.html")
    if os.path.exists(sp):
        with open(sp, encoding="utf-8") as f:
            s = f.read()
        import re as _re
        s = _re.sub(r"\?v=[0-9a-zA-Z]+", "?v=" + VER, s)
        with open(sp, "w", encoding="utf-8") as f:
            f.write(s)
    print("asset ver %s" % VER)
    print("total %d html files" % total)

if __name__ == "__main__":
    main()
