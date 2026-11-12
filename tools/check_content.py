#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""结构校验（不写 HTML）：python3 tools/check_content.py en|ja

比对块类型/块数、table 列数与行数、table_tcode 行数、
quiz 题数与选项数与 ok 索引、fig.inner 块数、nav 键数。
翻译子代理用它自检，避免两个子代理并发跑 build.py 互相覆盖 HTML。

用法：cd <site> && python3 tools/check_content.py en   （退出码 0 = 结构一致）
"""
import importlib
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

try:
    import build
    PAGES = list(getattr(build, "PAGES"))
except Exception:
    PAGES = ["index", "gui", "basics", "master", "flow", "nopo", "grir", "extra",
             "lab", "handbook", "checklist"]


def load(lang, errs=None):
    out = {}
    for s in PAGES:
        try:
            out[s] = importlib.import_module("content.%s.%s" % (lang, s)).PAGE
        except ModuleNotFoundError:
            if errs is not None:
                errs.append("%s/%s: module missing (tools/content/%s/%s.py)" % (lang, s, lang, s))
            out[s] = {"slug": s, "file": s + ".html", "nav": {"title": "", "sub": "", "head": "", "group": ""}, "blocks": []}
    return out


def walk(a, b, path, errs):
    if len(a) != len(b):
        errs.append("%s: %d vs %d blocks" % (path, len(a), len(b)))
        return
    for i, (x, y) in enumerate(zip(a, b)):
        if x.get("t") != y.get("t"):
            errs.append("%s[%d]: %s vs %s" % (path, i, x.get("t"), y.get("t")))
            continue
        t = x.get("t")
        if t == "table":
            if len(x["head"]) != len(y["head"]):
                errs.append("%s[%d]: head %d vs %d" % (path, i, len(x["head"]), len(y["head"])))
            if len(x["rows"]) != len(y["rows"]):
                errs.append("%s[%d]: rows %d vs %d" % (path, i, len(x["rows"]), len(y["rows"])))
            else:
                for j, (r1, r2) in enumerate(zip(x["rows"], y["rows"])):
                    if len(r1) != len(r2):
                        errs.append("%s[%d].row%d: %d vs %d cells" % (path, i, j, len(r1), len(r2)))
        if t == "table_tcode" and len(x["rows"]) != len(y["rows"]):
            errs.append("%s[%d]: tcode rows %d vs %d" % (path, i, len(x["rows"]), len(y["rows"])))
        if t == "quiz":
            if len(x["items"]) != len(y["items"]):
                errs.append("%s[%d]: quiz %d vs %d" % (path, i, len(x["items"]), len(y["items"])))
            else:
                for j, (q1, q2) in enumerate(zip(x["items"], y["items"])):
                    if len(q1["a"]) != len(q2["a"]):
                        errs.append("%s[%d].q%d: answers %d vs %d" % (path, i, j, len(q1["a"]), len(q2["a"])))
                    if q1.get("ok") != q2.get("ok"):
                        errs.append("%s[%d].q%d: ok index %s vs %s" % (path, i, j, q1.get("ok"), q2.get("ok")))
        if t in ("fig", "raw") and "inner" in x:
            walk(x.get("inner", []), y.get("inner", []), "%s/%s%d" % (path, t, i), errs)
        if t == "two":
            for j, (c1, c2) in enumerate(zip(x["cols"], y["cols"])):
                walk(c1, c2, "%s/two%d.%d" % (path, i, j), errs)


def main():
    lang = sys.argv[1] if len(sys.argv) > 1 else "en"
    if lang not in ("en", "ja"):
        sys.exit("only en / ja")
    errs = []
    zh = load("zh")
    other = load(lang, errs)
    for s in PAGES:
        walk(zh[s]["blocks"], other[s]["blocks"], "%s/%s" % (lang, s), errs)
        if zh[s]["file"] != other[s]["file"]:
            errs.append("%s/%s file" % (lang, s))
        if len(zh[s].get("nav", {})) != len(other[s].get("nav", {})):
            errs.append("%s/%s nav keys" % (lang, s))
    if errs:
        print("structure mismatch (%s):" % lang)
        for e in errs:
            print("  -", e)
        sys.exit(1)
    print("structure OK: %s, %d pages" % (lang, len(PAGES)))


if __name__ == "__main__":
    main()
