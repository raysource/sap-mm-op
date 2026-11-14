# -*- coding: utf-8 -*-
PAGE = {
    "slug": "index",
    "file": "index.html",
    "nav": {
        "title": "Course home",
        "sub": "Learning paths · Practice data · Document chain",
        "head": "SAP GUI 8.10 hands-on: from logon to invoice verification, all practised in the simulator",
        "group": "Start",
    },
    "blocks": [
        {"t": "hero",
         "h1": "SAP GUI 8.10 hands-on: learn the screen first, then run a purchase order on your own",
         "p": ["The course has two halves. The first drills the SAP GUI 8.10 logon (Horizon theme), the five screen areas, the command field, shortcuts and the help system until they are muscle memory; "
               "the second moves into MM business and walks material master → purchase requisition → purchase order → goods receipt → invoice verification → payment, together with goods receipt without a PO and GR/IR reconciliation.",
               "Every action can really be typed in the simulator on the page: enter a transaction code, press Enter, fill the fields, press ✓ to save — the system issues document numbers, raises errors and posts to the books. No SAP account and no virtual machine required."],
         "stats": [{"b": "17", "s": "hands-on tasks, auto-graded"},
                   {"b": "11", "s": "course chapters"},
                   {"b": "30", "s": "interactive screens"},
                   {"b": "3", "s": "interface languages (ZH / EN / JA)"}],
         "btns": [{"href": "gui.html", "label": "Start with the GUI basics →"},
                  {"href": "lab.html", "label": "Go straight to the guided lab", "ghost": True},
                  {"href": "basics.html", "label": "Business basics first", "ghost": True}]},

        {"t": "h2", "x": "How to take this course (pick the path that fits your time)"},
        {"t": "table",
         "head": ["Path", "Time", "What you do", "Pages to read"],
         "rows": [
             ["① Seeing SAP GUI for the first time", "30 minutes", "Log on, recognise the five areas, use the command field, learn the difference between Enter and Save, F1/F4 — get comfortable with the screen", "GUI and navigation + lab tasks 1–3"],
             ["② Running a purchase order on your own", "2–3 hours", "Create material/vendor/info record → requisition → order → goods receipt → invoice → payment; all tasks 1–11", "GUI + business basics + master data + procure to pay + guided lab"],
             ["③ Goods receipt without PO and GR/IR", "Half a day", "Everything in ② plus: the six prerequisites for an automatically created PO, receipt in MB01, IR before GR, the four tolerances, blocking and release, month-end", "The two advanced chapters + lab tasks 12–17"],
         ]},

        {"t": "h2", "x": "Why 8.10 gets its own chapter: this screen is not 7.70"},
        {"t": "table",
         "head": ["Item", "What SAP GUI 8.10 actually does", "Effect on your work"],
         "rows": [
             ["Delivery and support", "Generally available 2026-07-16, supported until 2029-06-30 (SAP Note 147519)", "Many companies are upgrading from 7.70 / 8.00, so screen elements in older screenshots no longer line up"],
             ["Theme", "Horizon replaces the Quartz family; Morning and Evening variants exist", "Dark blue title bar, white menu bar, thin-line icons, and a much clearer editable / read-only distinction"],
             ["Where the system info sits", "Moved from the status bar to the right end of the menu bar (S4H (1) 110 · language · OVR)", "The status bar now carries messages only; look top right for the current client and language"],
             ["Theme customisation", "From 8.10 on: custom themes (UI Theme Designer) and Quick Theming (change 6 main colours)", "Corporate colours may differ, but field positions, transaction codes and shortcuts do not"],
             ["Runtime", "Windows 11 / Server 2016–2025; BEx must be installed separately (Note 3691456)", "macOS and Linux use SAP GUI for Java, with minor differences in the screen detail"],
         ]},
        {"t": "note", "kind": "",
         "b": "Version differences only change how it looks",
         "x": "Transaction codes, field names, Enter = check, Ctrl+S = save, F3 = back, F4 = value help — none of that has changed since R/3. "
              "So every step in this course works the same on 7.70, 8.00 and 8.10; only button positions and colours differ (full list in SAP Note 3549180)."},

        {"t": "h2", "x": "Practice data card (identical everywhere, so the numbers add up)"},
        {"t": "table",
         "head": ["Category", "Value", "Notes"],
         "rows": [
             ["Client / user", "110 / MMUSER01 (typed at logon)", "110 is the practice client; data is isolated between clients of the same system"],
             ["Company code / purchasing organization / purchasing group", "1710 / 1710 / 001", "The purchasing organization owns the purchasing conditions; the purchasing group is the buyer's team"],
             ["Plant / storage location", "1710 / 0001 (main warehouse), 0002 (line-side store)", "Stock is managed in three layers: material + plant + storage location"],
             ["Material (you create this)", "R-1001 Steel Bracket · ROH · PC", "Standard price 720.00 USD, valuation class 3000, MRP type PD / lot size EX, safety stock 20"],
             ["Material (already in the system)", "R-1002 Aluminium Housing 180.00 USD · R-1003 Sealing Ring 12.50 USD", "R-1002 has 20 PC in stock (0002), kept for the goods receipt without PO exercise"],
             ["Vendor (you create this)", "100123 Palo Alto Components Inc.", "Purchasing organization 1710, currency USD, payment terms 0001, reconciliation account 160000"],
             ["Purchasing info record", "100123 / R-1001 / 1710 → 720.00 USD", "The PO takes its net price from here; without it the PO reports \"No net price could be determined\""],
             ["Quantity / amount", "300 PC / 300 × 720.00 = 216,000.00 USD", "The quantity must be identical in requisition, order, goods receipt, invoice and payment"],
             ["Goods receipt without PO", "R-1002 / 100124 / plant 1710 / 50 PC", "A purchase order is created automatically and then received — the second integrated scenario of this course"],
         ]},

        {"t": "h2", "x": "The full chain behind one purchase order (with two branches)"},
        {"t": "chain",
         "items": [
             {"k": "MM01", "t": "Master data", "s": "material / vendor / price"},
             {"k": "ME51N", "t": "Purchase requisition", "s": "internal demand"},
             {"k": "ME21N", "t": "Purchase order", "s": "commitment to the vendor"},
             {"k": "MIGO", "t": "Goods receipt 101", "s": "stock +, GR/IR −"},
             {"k": "MIRO", "t": "Invoice verification", "s": "GR/IR cleared, payables +"},
             {"k": "F-53", "t": "Payment and clearing", "s": "payables −, bank −"},
         ]},
        {"t": "p", "x": "Branch one (goods receipt without a PO, MB01): the goods arrive with no order, so the system uses the Automatic purchase order indicator on movement type 101, "
                      "together with the matching switches in the material master, the vendor master and the source list, to create a PO and post the receipt against it. Branch two (IR before GR): switch off GR-based IV in the info record "
                      "and you can invoice before the goods arrive. Both branches are shown screen by screen in the two Advanced chapters."},

        {"t": "h2", "x": "Number ranges and document numbers (examples — your system's ranges will differ)"},
        {"t": "table",
         "head": ["Document", "Transaction", "Number used in this course", "What happens on posting"],
         "rows": [
             ["Purchase requisition", "ME51N", "10000001", "Internal demand only; no accounting document"],
             ["Purchase order", "ME21N", "4500000123", "No accounting document; net value 216,000.00 USD"],
             ["Material document (goods receipt)", "MIGO / MB01", "4900000001", "Stock +300; accounting document 5100000001: stock Dr / GR/IR Cr 216,000.00"],
             ["Invoice document", "MIRO", "5105600001", "GR/IR Dr / payables Cr 216,000.00; GR/IR for that PO back to zero"],
             ["Payment document", "F-53", "5100000003", "Payables Dr / bank Cr 216,000.00; invoice cleared"],
         ]},

        {"t": "h2", "x": "Five sentences to memorise before you start"},
        {"t": "ul", "cls": "fld", "items": [
            "**Enter is not Save**: Enter only runs checks and expands details; the step that writes to the database and issues a number is ✓ or Ctrl+S.",
            "**Incomplete master data means no documents**: no purchasing view on the material → you cannot select it in a PO; no info record → the PO reports \"No net price could be determined\".",
            "**Goods receipt and invoice are two separate events**: the receipt puts stock on the books and raises a GR/IR accrual liability; invoice verification converts that accrual into real payables.",
            "**Quantities and amounts must match**: receive 300 and the invoice must also be 300; an amount difference beyond tolerance (1.000 % in this course) triggers M8083 or blocks the invoice.",
            "**Every stock change carries a document**: either a material document only (311, value-neutral transfer) or a material document plus an accounting document (101 / 261 / 501).",
        ]},

        {"t": "h2", "x": "Chapter overview"},
        {"t": "cards", "items": [
            {"href": "gui.html", "title": "GUI and navigation", "sub": "Logon · five areas · command field /n · shortcuts · F1/F4 · what changed in 8.10", "k": "GUI"},
            {"href": "basics.html", "title": "Business basics", "sub": "What MM controls · organisational levels · master data · movement types · GR/IR", "k": "Concept"},
            {"href": "master.html", "title": "Master data hands-on", "sub": "MM01 screen by screen · MM02 changes · vendor in BP · ME11 price", "k": "MM01"},
            {"href": "flow.html", "title": "Procure to pay in five steps", "sub": "ME51N → ME21N → MIGO → MIRO → F-53, screen by screen plus the document flow", "k": "P2P"},
            {"href": "nopo.html", "title": "Goods receipt without PO", "sub": "Six prerequisites for an automatic PO · MB01 · posting periods OB52 / MMPV", "k": "MB01"},
            {"href": "grir.html", "title": "GR and IR", "sub": "GR-based IV · IR before GR · four tolerances · blocks and release · MR11", "k": "IV"},
            {"href": "extra.html", "title": "Advanced operations", "sub": "Returns 122/102 · 311/261 · MRP · month-end · automatic account determination", "k": "Advanced"},
            {"href": "lab.html", "title": "Guided lab", "sub": "17 tasks in the embedded SAP GUI 8.10 simulator, graded as you go", "k": "Lab"},
            {"href": "handbook.html", "title": "Quick reference", "sub": "Full T-code table · error lookup · trilingual glossary · self-test", "k": "Appendix"},
            {"href": "test.html", "title": "Knowledge test", "sub": "10 domains, 106 questions + a 20-question mock, with explanations", "k": "Test"},
            {"href": "checklist.html", "title": "Acceptance checklist", "sub": "Tick each item plus a practice record sheet; printable", "k": "Print"},
        ]},

        {"t": "note", "kind": "",
         "b": "About the screens and the data",
         "x": "The SAP windows on this site are reproductions of the SAP GUI 8.10 Horizon theme (dark blue title bar, system info at the right end of the menu bar, thin-line SVG toolbar icons), not screenshots; "
              "the simulator, by contrast, is a web app that really accepts input, really raises errors and really issues document numbers — good for practising muscle memory and sequence, "
              "but no substitute for a live system. Field positions, required entries and number ranges differ between clients and support packs, so your SPRO configuration and authorisations are the final word."},
    ],
}
