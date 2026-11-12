# -*- coding: utf-8 -*-
PAGE = {
    "slug": "master",
    "file": "master.html",
    "nav": {"title": "Master data hands-on", "sub": "MM01 screen by screen · vendor in BP · ME11 price",
            "head": "Master data hands-on: get the material, vendor and price in place first", "group": "Master data"},
    "blocks": [
        {"t": "lead", "x": "Nine times out of ten a purchasing document cannot be created because the master data is incomplete. This chapter follows the real sequence: "
                          "**material (MM01) → vendor (BP) → purchasing info record (ME11)**, giving the screen-by-screen keystrokes, how to fill each field, and what the status bar says when something goes wrong."},

        {"t": "h2", "x": "0. MM01 at a glance (8 screens — do not overfill the first one)"},
        {"t": "table",
         "head": ["#", "Screen", "What you do", "Keys"],
         "rows": [
             ["1", "Initial screen", "Material number R-1001, industry M, material type ROH", "Tab to move → Enter"],
             ["2", "Select views (dialog)", "Tick 5 views: Basic Data 1 / Purchasing / MRP 1 / Plant Data · Storage 1 / Accounting 1", "Enter or click Continue"],
             ["3", "Basic Data 1", "Description \"Steel Bracket\", base unit PC, material group 00101", "Tab"],
             ["4", "Purchasing", "Purchasing group 001; leave automatic PO empty (tick it only for GR without PO)", "Tab"],
             ["5", "MRP 1", "MRP type PD, lot size EX, safety stock 20", "Tab"],
             ["6", "Plant data / Storage 1", "Plant 1710, storage location 0001, MRP controller 001", "Tab"],
             ["7", "Accounting 1", "Valuation class 3000, price control S, standard price 720.00", "Tab"],
             ["8", "Save", "✓ or Ctrl+S; note the material number and the 5 views", "Ctrl+S"],
         ]},

        {"t": "h2", "x": "1. Initial screen: three fields only"},
        {"t": "fig", "tcode": "MM01", "title": "Create Material (initial screen)",
         "inner": [
             {"t": "gbox", "legend": "Material", "rows": [
                 {"label": "Material", "v": "R-1001", "w": "w120", "req": True, "mark": 1, "hint": "leave blank = internal number assignment"},
                 {"label": "Industry sector", "v": "M", "w": "w90", "mark": 2, "hint": "M mechanical engineering"},
                 {"label": "Material type", "v": "ROH", "w": "w90", "mark": 3, "hint": "ROH raw material / FERT finished good / HALB semi-finished"},
             ]},
             {"t": "status", "kind": "info", "x": "Select the views you want to maintain (press Enter)"},
         ],
         "caption_b": "Figure 3-1",
         "caption": "Three fields on the initial screen: material number, industry sector, material type. **The material type decides which views exist and which accounts are used**; changing it later means a different rule set and is practically impossible once created."},

        {"t": "h2", "x": "2. Select views: tick the wrong boxes and you lose a whole block of data"},
        {"t": "fig", "tcode": "MM01", "title": "Create Material R-1001: select views",
         "inner": [
             {"t": "dlg", "title": "Select Views", "cancel": "Cancel", "ok": "Continue",
              "x": "☑ Basic Data 1　☑ Purchasing　☑ MRP 1　☑ Plant Data / Storage 1　☑ Accounting 1<br>"
                   "☐ Sales　☐ Quality Management　☐ Warehouse Management　☐ Costing"},
             {"t": "status", "kind": "info", "x": "5 views selected"},
         ],
         "caption_b": "Figure 3-2",
         "caption": "The Select Views dialog. **A purchased material needs at least these 5**; without the Purchasing view the material cannot be selected in a PO item, and without the Accounting view the goods receipt cannot post."},

        {"t": "h2", "x": "3. Tabbed entry: one tab per screen, Tab to move between fields"},
        {"t": "fig", "tcode": "MM01", "title": "Create Material R-1001: Basic Data 1",
         "inner": [
             {"t": "tabs", "items": ["Basic Data 1", "Purchasing", "MRP 1", "Plant / Storage 1", "Accounting 1"], "on": 0},
             {"t": "gbox", "legend": "Material R-1001 · ROH", "rows": [
                 {"label": "Description", "v": "Steel Bracket", "w": "w220", "req": True, "mark": 1},
                 {"label": "Base unit of measure", "v": "PC", "w": "w90", "mark": 2},
                 {"label": "Material group", "v": "00101", "w": "w90", "mark": 3},
                 {"label": "Product group", "v": "00", "w": "w90", "ro": True},
             ]},
             {"t": "gbox", "legend": "Purchasing / MRP / Plant / Accounting (lower half of the same screen)", "rows": [
                 {"label": "Purchasing group", "v": "001", "w": "w90", "mark": 4},
                 {"label": "MRP type / lot size", "v": "PD / EX", "w": "w120", "mark": 5},
                 {"label": "Safety stock", "v": "20", "w": "w90"},
                 {"label": "Plant / storage location", "v": "1710 / 0001", "w": "w120"},
                 {"label": "Valuation class", "v": "3000", "w": "w90", "mark": 6},
                 {"label": "Price control / standard price", "v": "S / 720.00", "w": "w120", "mark": 7},
             ]},
             {"t": "status", "kind": "ok", "x": "Material R-1001 created (5 views)"},
         ],
         "caption_b": "Figure 3-3",
         "caption": "Seven key fields: description, unit, material group, purchasing group, MRP type/lot size, valuation class, price control/standard price. **Grey fields are defaulted or calculated; only white fields need input**."},

        {"t": "h2", "x": "4. Why those three fields hold those values"},
        {"t": "table",
         "head": ["Field", "Value here", "Why", "Consequence of getting it wrong"],
         "rows": [
             ["Material type ROH", "ROH", "Raw material: bought, never sold, few views, inventory accounts", "FERT would add sales-view requirements and may post the receipt to the wrong account"],
             ["Valuation class 3000", "3000 (raw materials)", "Together with OBYC it determines inventory account 140000 and GR/IR account 191100", "The goods receipt fails with \"Account determination failed\" (M8 147)"],
             ["Price control S + standard price 720", "S / 720.00", "Standard-price material: receipts value stock at 720, any difference to the order price goes to price variance", "With V (moving average) every receipt recalculates the unit price, which is hard to reconcile in a course"],
             ["MRP type PD", "PD", "Plans via MRP and creates purchase requisitions", "ND never participates in planning, so MD04 shows no requirement"],
             ["Lot size EX", "EX", "Orders exactly the net requirement", "FX rounds to a fixed lot size (for example 100 each time)"],
             ["Safety stock 20", "20 PC", "Requirement 400 + safety 20 − available 300 = net requirement 120", "Too high inflates purchasing; 0 causes shortages"],
         ]},

        {"t": "h2", "x": "5. Verifying the result: MM03, four tabs"},
        {"t": "fig", "tcode": "MM03", "title": "Display Material R-1001: basic data",
         "inner": [
             {"t": "tabs", "items": ["Basic Data", "Purchasing", "MRP", "Plant / Storage", "Accounting"], "on": 0},
             {"t": "gbox", "legend": "Material R-1001", "rows": [
                 {"label": "Description", "v": "Steel Bracket", "w": "w220", "ro": True},
                 {"label": "Material type / unit", "v": "ROH / PC", "w": "w120", "ro": True},
                 {"label": "Valuation class / price control", "v": "3000 / S", "w": "w120", "ro": True},
                 {"label": "Standard price", "v": "720.00 USD", "w": "w120", "ro": True},
                 {"label": "Stock 1710 / 0001", "v": "0 PC", "w": "w120", "ro": True},
             ]},
             {"t": "status", "kind": "info", "x": "Displaying material R-1001"},
         ],
         "caption_b": "Figure 3-4",
         "caption": "Check in MM03: all five tabs are there, standard price 720.00, stock 0 (nothing received yet). MD04 already shows the 400 PC demand and the 120 PC net requirement."},

        {"t": "h2", "x": "6. Vendor (BP): three tabs, four data levels"},
        {"t": "p", "x": "S/4HANA keeps vendors and customers in one object, the **business partner (BP)**. The same BP can be both a customer and a vendor; "
                      "**roles** decide which data you see: `FLVN00` (FI vendor: reconciliation account, payment terms) and `FLVN01` (MM vendor: purchasing group, order currency). "
                      "The screen splits that data into four tabs — **Address → Company code → Purchasing → Status** — which is also the entry order."},
        {"t": "steps", "items": [
            {"x": "Business partner **100123**, role **FLVN01**, grouping **BP01**, Enter.", "k": "Enter"},
            {"x": "The **role dialog** opens: tick both `FLVN00` and `FLVN01` (FLVN01 alone lets you order, but invoices will lack company-code data).", "k": "Space"},
            {"x": "Address tab: name 1, city, country (US), language EN. This level is not organisational.", "k": "Tab"},
            {"x": "Company code tab: 1710, reconciliation account 160000, payment terms 0001, tolerance group blank.", "k": "Tab"},
            {"x": "Purchasing tab: org 1710, group 001, order currency USD; tick “automatic PO” only for GR without PO.", "k": "Tab"},
            {"x": "Status tab: confirm no blocks, then ✓ to save.", "k": "Ctrl+S"},
        ]},
        {"t": "fig", "tcode": "BP", "title": "Business Partner (Vendor): initial screen", "menu": ["Business Partner", "Edit", "Goto", "Environment", "System", "Help"],
         "inner": [
             {"t": "gbox", "legend": "Business partner", "rows": [
                 {"label": "Business partner", "v": "100123", "w": "w120", "req": True, "mark": 1, "hint": "blank = internal number"},
                 {"label": "BP role", "v": "FLVN01", "w": "w90", "ro": True, "mark": 2, "hint": "MM vendor"},
                 {"label": "Grouping", "v": "BP01", "w": "w90", "ro": True, "mark": 3, "hint": "external numbering"},
             ]},
             {"t": "status", "kind": "info", "x": "Enter → select roles → data screen"},
         ],
         "caption_b": "Figure 3-5",
         "caption": "The BP initial screen has three fields: number, role, grouping. **An existing number opens in change mode** (the equivalent of XK02); only a new one creates. Chapter 5 uses that to switch on automatic PO for 100124."},

        {"t": "fig", "tcode": "BP", "title": "BP roles: 100123", "menu": ["Business Partner", "Edit", "Goto", "Environment", "System", "Help"],
         "inner": [
             {"t": "dlg", "title": "BP roles: 100123", "cancel": "Cancel", "ok": "Continue",
              "x": "☑ FLVN00　Vendor (FI)\n☑ FLVN01　Vendor (MM)\n☐ FLCU00　Customer (FI)\n☐ FLCU01　Customer (SD)"},
             {"t": "status", "kind": "info", "x": "Purchasing data lives under FLVN01"},
         ],
         "caption_b": "Figure 3-6",
         "caption": "Role dialog. **Purchasing data hangs off FLVN01**; with FLVN00 only, the vendor cannot be picked in a PO. With FLVN01 only you can order, but MIRO fails for lack of company-code data."},

        {"t": "fig", "tcode": "BP", "title": "BP 100123: Address", "menu": ["Business Partner", "Edit", "Goto", "Environment", "System", "Help"],
         "inner": [
             {"t": "tabs", "items": ["Address", "Company code", "Purchasing", "Status"], "on": 0},
             {"t": "gbox", "legend": "Address", "rows": [
                 {"label": "Name 1", "v": "Palo Alto Components Inc.", "w": "w220", "req": True, "mark": 1},
                 {"label": "Search term", "v": "PALOALTO", "w": "w160"},
                 {"label": "Street / house no.", "v": "3901 Fair Oaks Ave", "w": "w160"},
                 {"label": "Postal code / city", "v": "94303 / Palo Alto", "w": "w160", "req": True, "mark": 2},
                 {"label": "Country / region", "v": "US", "w": "w90", "req": True, "mark": 3},
                 {"label": "Language", "v": "EN", "w": "w80"},
                 {"label": "Phone / e-mail", "v": "+1 650 555 0100", "w": "w160"},
             ]},
             {"t": "status", "kind": "info", "x": "Address level: independent of company code and purchasing org"},
         ],
         "caption_b": "Figure 3-7",
         "caption": "Address is the top level and belongs to the BP itself. **The name is changed here only** — there is no name field on the purchasing tab, which is where most beginners look first."},

        {"t": "fig", "tcode": "BP", "title": "BP 100123: Company code", "menu": ["Business Partner", "Edit", "Goto", "Environment", "System", "Help"],
         "inner": [
             {"t": "tabs", "items": ["Address", "Company code", "Purchasing", "Status"], "on": 1},
             {"t": "gbox", "legend": "Company code 1710", "rows": [
                 {"label": "Company code", "v": "1710", "w": "w90", "req": True, "mark": 1, "ro": True},
                 {"label": "Reconciliation account", "v": "160000", "w": "w120", "req": True, "mark": 2, "hint": "payables"},
                 {"label": "Recon. account type", "v": "K vendor", "w": "w90", "ro": True},
                 {"label": "Payment terms", "v": "0001", "w": "w90", "req": True, "mark": 3},
                 {"label": "Tolerance group", "v": "(blank)", "w": "w90", "hint": "blank = default"},
                 {"label": "Payment methods", "v": "C / T", "w": "w110"},
                 {"label": "Tax code / type", "v": "V0", "w": "w110"},
             ]},
             {"t": "status", "kind": "info", "x": "This level decides which payable account the invoice hits"},
         ],
         "caption_b": "Figure 3-8",
         "caption": "The company-code level decides which payable account an invoice hits and when it is due. A wrong reconciliation account makes MIRO fail with **account determination**. A blank tolerance group means the default from OMR6 for that company code."},

        {"t": "fig", "tcode": "BP", "title": "BP 100123: Purchasing", "menu": ["Business Partner", "Edit", "Goto", "Environment", "System", "Help"],
         "inner": [
             {"t": "tabs", "items": ["Address", "Company code", "Purchasing", "Status"], "on": 2},
             {"t": "gbox", "legend": "Purchasing org. 1710", "rows": [
                 {"label": "Purchasing org.", "v": "1710", "w": "w90", "req": True, "mark": 1},
                 {"label": "Purchasing group", "v": "001", "w": "w90", "req": True, "mark": 2},
                 {"label": "Order currency", "v": "USD", "w": "w90", "req": True, "mark": 3},
                 {"label": "Incoterms", "v": "FOB", "w": "w110"},
                 {"label": "Automatic PO", "v": "☐", "w": "w80", "mark": 4, "hint": "only for GR without PO"},
                 {"label": "GR-based IV", "v": "☑", "w": "w80", "hint": "untick for invoice before GR"},
             ]},
             {"t": "status", "kind": "ok", "x": "Vendor 100123 has been created (company code 1710 / purchasing org 1710)"},
         ],
         "caption_b": "Figure 3-9",
         "caption": "The purchasing level applies to this purchasing org only: order currency, purchasing group and the two switches (automatic PO, GR-based IV). **The same vendor can be configured differently in another purchasing org**, which is why PO errors start with “which purchasing org?”."},

        {"t": "table",
         "head": ["Field", "Level", "Req.", "How to fill it / what happens if wrong"],
         "rows": [
             ["Business partner", "General", "Yes", "Enter your own number (100123…) for external numbering, or leave blank; check the number range (BP01)"],
             ["BP role", "General", "Yes", "Tick FLVN00 + FLVN01; without FLVN01 the vendor cannot be selected in a PO"],
             ["Name 1 / city / country", "Address", "Yes", "Printed on POs and invoices; renaming the company elsewhere leaves documents on the old name"],
             ["Reconciliation account", "Company code", "Yes", "160000 (payables); wrong value → MIRO “account determination failed”"],
             ["Payment terms", "Company code", "Yes", "0001 immediate (this course); in practice often 0002 = 14 days 2 % discount"],
             ["Tolerance group", "Company code", "No", "Blank uses the default; only set it to loosen invoice tolerances for one vendor"],
             ["Purchasing org. / group", "Purchasing", "Yes", "1710 / 001; the group decides who follows the order"],
             ["Order currency", "Purchasing", "Yes", "USD; a PO in another currency carries an exchange rate"],
             ["Automatic PO", "Purchasing", "No", "Tick only for GR without PO (chapter 5)"],
             ["GR-based IV", "Purchasing", "No", "Ticked by default; untick for invoice before GR (chapter 6)"],
         ]},

        {"t": "note", "kind": "warn", "b": "Four levels — a missing one blocks the process",
         "x": "**General data** (address) alone creates the BP but it cannot be selected in a PO; **+ purchasing org** lets you order; **+ company code** lets the invoice post. "
              "When something fails, first check which level the message names: “not maintained in purchasing org 1710” is the purchasing level, “account determination” is the company-code level."},

        {"t": "h2", "x": "7. Purchasing info record (ME11): where the price comes from"},
        {"t": "fig", "tcode": "ME11", "title": "Create Purchasing Info Record 5300000123",
         "inner": [
             {"t": "gbox", "legend": "Purchasing info record", "rows": [
                 {"label": "Vendor", "v": "100123", "w": "w120", "req": True, "mark": 1},
                 {"label": "Material", "v": "R-1001", "w": "w120", "req": True, "mark": 2},
                 {"label": "Purchasing organization", "v": "1710", "w": "w90", "mark": 3},
                 {"label": "Info category", "v": "Standard", "w": "w90", "ro": True},
             ]},
             {"t": "gbox", "legend": "Purchasing organization data 1", "rows": [
                 {"label": "Net price", "v": "720.00", "w": "w120", "req": True, "mark": 4},
                 {"label": "Currency / price unit", "v": "USD / 1", "w": "w120"},
                 {"label": "Planned delivery time", "v": "5 days", "w": "w90"},
                 {"label": "Minimum order quantity", "v": "10", "w": "w90"},
             ]},
             {"t": "status", "kind": "ok", "x": "Purchasing info record 5300000123 created"},
         ],
         "caption_b": "Figure 3-10",
         "caption": "An info record is the triangle of vendor + material + purchasing organization, and net price 720.00 lives right here. ME21N does not take a price: the system looks it up in the order info record → contract → scheduling agreement → manual entry (if allowed)."},

        {"t": "h2", "x": "8. Acceptance criteria and common errors"},
        {"t": "check", "items": [
            "MM03 finds R-1001, all five tabs have values, standard price 720.00 USD",
            "In BP, 100123 is visible under purchasing organization 1710 with reconciliation account 160000",
            "ME11 record 5300000123 shows net price 720.00 and price unit 1",
            "In ME21N, choosing vendor 100123 + material R-1001 proposes net price 720.00 automatically (no manual entry)",
        ]},
        {"t": "table",
         "head": ["Status bar message", "Root cause", "Check first"],
         "rows": [
             ["Material R-1001 already exists", "Duplicate creation", "Look it up in MM03 first; change data with MM02"],
             ["Vendor 100123 not maintained in purchasing organization 1710", "BP was created only at general/company-code level", "Add the Purchasing tab in BP, or use XK02"],
             ["Material R-1001 not maintained in plant 1710", "Wrong plant entered in MM01, or no plant view created", "Extend with MM01 (tick only plant/storage when selecting views)"],
             ["No net price could be determined: purchasing info record 100123 / R-1001 does not exist", "ME11 was skipped or the purchasing organization does not match", "Create it in ME11 and check organisation 1710"],
             ["Entry error: valuation class 3000 not defined (M8 147)", "No accounts configured for that valuation class in OBYC", "Ask FI or a consultant to check OBYC BSX/WRX"],
         ]},
    ],
}
