# -*- coding: utf-8 -*-
PAGE = {
    "slug": "nopo",
    "file": "nopo.html",
    "print": "A4 landscape",
    "nav": {"title": "Goods receipt without PO", "sub": "Six prerequisites for an automatic PO · MB01 · posting periods",
            "head": "Goods receipt without PO: the goods are here but no order exists — make the system create one", "group": "Advanced"},
    "blocks": [
        {"t": "lead", "x": "The normal sequence is order first, receipt second. In reality someone always sends goods ahead: a verbal order, an urgent top-up, a vendor shipping on their own initiative. "
                          "If the warehouse can only say \"no order, no receipt\", the pallet sits at the gate. SAP's answer is to let **movement type 101 create the purchase order itself** — "
                          "provided four switches are on; miss one and you are back to keying an order number by hand."},

        {"t": "h2", "x": "1. How it works: the receipt looks up a source and creates the PO"},
        {"t": "p", "x": "In MB01 (goods movement) you choose movement type 101 and enter material / plant / quantity / vendor, **leaving the purchase order field empty**. "
                      "The system then looks for a source in this order: the purchasing view of the material master → the source list of the plant → the price in the info record. "
                      "If all three exist and all four \"allow automatic creation\" switches are on, the system creates a purchase order and posts the receipt against it, "
                      "and the status bar shows **both the material document number and the automatically created purchase order number**."},
        {"t": "chain", "items": [
            {"k": "MB01", "t": "Goods receipt 101", "s": "no PO entered"},
            {"k": "auto", "t": "PO created", "s": "from source list + info record"},
            {"k": "", "t": "Material document", "s": "49xxxxxx stock +"},
            {"k": "FB03", "t": "Accounting document", "s": "stock Dr / GR/IR Cr"},
        ]},

        {"t": "h2", "x": "2. The six prerequisites (miss one and it fails — set them in this order)"},
        {"t": "table",
         "head": ["#", "Where to set it", "What to do", "If it is missing"],
         "rows": [
             ["1", "IMG: Materials Management → Inventory Management → Goods Receipt → Create purchase order automatically (or OMJJ, movement type)", "Tick the third indicator, Automatic purchase order, on the 101 GR receipt", "MB01 reports \"Please enter purchase order\" and creates nothing"],
             ["2", "IMG: Enterprise Structure → Assignment → Materials Management → Assign standard purchasing organization to plant", "Plant 1710 must have a default purchasing organization", "The system does not know which purchasing organization to use and stops"],
             ["3", "Vendor master (XK02 / BP), purchasing data → Control data", "Tick Automatic purchase order", "Message: automatic purchasing is not set for the vendor"],
             ["4", "IMG: Materials Management → Purchasing → Source List → Define source list requirements at plant level", "Tick Source list for the plant 1710 line", "The system never reads the source list, so neither vendor nor price is found"],
             ["5", "ME01 (source list)", "Maintain the allowed vendors for material + plant (a fixed source can be set)", "Message: no valid source found — in practice the most critical of the six"],
             ["6", "MM02 → Purchasing view", "Tick Automatic purchase order", "The system does not consider this material eligible for automatic creation"],
         ]},
        {"t": "note", "kind": "warn", "b": "One more implicit prerequisite",
         "x": "**The info record (ME11) must exist with the right price**, otherwise the automatically created PO has no net price, the receipt is valued at 0 and the accounting document carries nothing. "
              "The source document puts it plainly: with the settings above in place, when you post a 101 receipt in MB01 without entering a purchase order, the system creates one for you — "
              "four switches + source list + price, not one of them optional."},

        {"t": "fig", "tcode": "OMJJ", "title": "Customising: Maintain Movement Types (101)", "menu": ["Table", "Edit", "Goto", "Environment", "System", "Help"],
         "inner": [
             {"t": "gbox", "legend": "Movement type", "rows": [
                 {"label": "Movement type", "v": "101", "w": "w90", "mark": 1},
                 {"label": "Text", "v": "GR goods receipt", "w": "w220", "ro": True},
             ]},
             {"t": "tbl", "cls": "alv", "head": ["Indicator", "Effect", "Setting", "Remark"], "sel": 2, "rows": [
                 ["1", "Goods movement", "X", "Stock increases"],
                 ["2", "Goods receipt / inspection", "X", "—"],
                 ["3", "Automatic purchase order", "X", "★ the key switch for this scenario"],
                 ["4", "Stock / receipt quantity update", "X", "Stock updated in real time"],
             ]},
             {"t": "status", "kind": "ok", "x": "Table 161 saved (request 1710K901234)"},
         ],
         "caption_b": "Figure 5-1",
         "caption": "The IMG activity Create purchase order automatically lands on exactly this row of this table: the **third indicator** of 101 has to be ticked. Saving it generates a request number, "
                    "and this is configuration (usually done by a consultant or key user, business users have no authorisation) — for practice it is enough to know where to look."},

        {"t": "fig", "tcode": "MM02", "title": "Change Material R-1002 (Purchasing view)", "menu": ["Material", "Edit", "Goto", "Environment", "System", "Help"],
         "inner": [
             {"t": "gbox", "legend": "Material", "rows": [
                 {"label": "Material", "v": "R-1002", "w": "w120", "mark": 1},
                 {"label": "Material type / unit", "v": "ROH / PC", "w": "w110", "ro": True},
             ]},
             {"t": "tabs", "items": ["Basic Data", "Purchasing", "MRP 1", "Plant / Stor. 1", "Accounting 1"], "on": 1},
             {"t": "gbox", "legend": "Purchasing", "rows": [
                 {"label": "Purchasing group", "v": "001", "w": "w90"},
                 {"label": "Order unit", "v": "PC", "w": "w90", "ro": True},
                 {"label": "Automatic purchase order", "v": "☑ ticked", "w": "w120", "mark": 2},
             ]},
             {"t": "status", "kind": "ok", "x": "Material R-1002 saved"},
         ],
         "caption_b": "Figure 5-2",
         "caption": "Tick **Automatic purchase order** in the Purchasing view of MM02. Note that this is a switch at material level: other materials in the same plant are unaffected; "
                    "and it also has to be ticked once at **vendor** level (Figure 5-3) — only both together take effect."},

        {"t": "fig", "tcode": "BP", "title": "Change Vendor 100124 (Purchasing data)", "menu": ["Business Partner", "Edit", "Goto", "Environment", "System", "Help"],
         "inner": [
             {"t": "gbox", "legend": "Business partner · vendor", "rows": [
                 {"label": "Vendor", "v": "100124", "w": "w120", "mark": 1},
                 {"label": "Name", "v": "Bay Area Metals", "w": "w220", "ro": True},
                 {"label": "Purchasing organization", "v": "1710", "w": "w90"},
                 {"label": "Order currency", "v": "USD", "w": "w90", "ro": True},
             ]},
             {"t": "gbox", "legend": "Control data", "rows": [
                 {"label": "Automatic purchase order", "v": "☑", "w": "w90", "mark": 2},
                 {"label": "GR-based invoice verification", "v": "☑", "w": "w90", "hint": "Relevant to IR before GR, see the GR and IR chapter"},
             ]},
             {"t": "status", "kind": "ok", "x": "Vendor 100124 saved"},
         ],
         "caption_b": "Figure 5-3",
         "caption": "Control data in the vendor master carries **Automatic purchase order** as well. The SAP switches come in three layers — movement type + material + vendor — "
                    "and facilities and purchasing often own one layer each, so after setting them always verify with a test receipt."},

        {"t": "h2", "x": "3. Execution: post the receipt in MB01 without an order number"},
        {"t": "steps", "items": [
            {"x": "Type **MB01** in the command field and press Enter. (MIGO can do it in 8.10 too, but most courses demonstrate automatic PO creation in MB01 — fewer fields, easier to read.)", "k": "MB01"},
            {"x": "Enter movement type **101** and press Enter; the system opens the GR goods receipt screen.", "k": "Enter"},
            {"x": "Keep the document date as today (or inside the current period) and **leave the purchase order field empty**.", "k": "Tab"},
            {"x": "Material **R-1002**, plant **1710**, storage location **0002**, quantity **50**, vendor **100124**.", "k": "F4"},
            {"x": "Press Enter to check: with no errors the status bar only says the check passed; click ✓ to post.", "k": "Ctrl+S"},
            {"x": "Note two numbers: material document **4900000002** and the automatically created purchase order **4500000124** (the ranges depend on how many documents you posted before — trust your own screen).", "k": "—"},
            {"x": "Open the generated PO in **ME23N**: the item reads R-1002 / 50 PC / 180.00 USD, net value 9,000.00 USD.", "k": "ME23N"},
        ]},

        {"t": "fig", "tcode": "MB01", "title": "Goods Movement: Goods Receipt (101)", "menu": ["Material", "Edit", "Goto", "Environment", "System", "Help"],
         "inner": [
             {"t": "gbox", "legend": "Header", "rows": [
                 {"label": "Movement type", "v": "101", "w": "w90", "mark": 1},
                 {"label": "Document date", "v": "2026-11-20", "w": "w110", "mark": 2},
                 {"label": "Purchase order", "v": "(empty)", "w": "w120", "hint": "★ leave blank so the system creates it"},
             ]},
             {"t": "tbl", "cls": "tctrl", "head": ["Item", "Material", "Plant", "Storage loc.", "Quantity", "Unit", "Vendor"], "cur": 0,
              "rows": [["1", "R-1002", "1710", "0002", "50", "PC", "100124"]]},
             {"t": "status", "kind": "ok", "x": "Material document 4900000002 posted · purchase order 4500000124 created automatically"},
         ],
         "caption_b": "Figure 5-4",
         "caption": "The 101 screen in MB01. **Leaving the purchase order empty** is the whole point; as soon as you enter an order number the system runs an ordinary receipt and creates nothing. "
                    "Two numbers in the status bar mean automatic PO creation worked."},

        {"t": "fig", "tcode": "ME23N", "title": "Display Purchase Order 4500000124", "menu": ["Purchase Order", "Edit", "Goto", "Environment", "System", "Help"],
         "inner": [
             {"t": "gbox", "legend": "Header", "rows": [
                 {"label": "Purchase order", "v": "4500000124", "w": "w110", "mark": 1},
                 {"label": "Vendor", "v": "100124", "w": "w110", "mark": 2},
                 {"label": "Document date", "v": "2026-11-20", "w": "w110", "ro": True},
                 {"label": "Net value", "v": "9,000.00 USD", "w": "w110", "ro": True},
             ]},
             {"t": "tbl", "cls": "tctrl", "head": ["Item", "Material", "Quantity", "Net price", "Net value", "Plant", "Stor. loc.", "GR qty"], "cur": 0,
              "rows": [["10", "R-1002", "50", "180.00", "9,000.00", "1710", "0002", "50"]]},
             {"t": "status", "kind": "info", "x": "Purchase order 4500000124 displayed"},
         ],
         "caption_b": "Figure 5-5",
         "caption": "The generated PO is indistinguishable from a hand-made one: it has a vendor, a net price (from the info record) and the received quantity posted back as 50. "
                    "The only difference is that **nobody was ever in ME21N** — so always confirm it in the order history, or someone will ask at month-end where the document came from."},

        {"t": "h2", "x": "4. Accounting: automatic creation changes no entry, only whether there is a reference"},
        {"t": "table", "num": True,
         "head": ["Account", "Name", "Debit", "Credit", "Explanation"],
         "rows": [
             ["140100", "Raw materials (stock)", "9,000.00", "", "50 PC × standard price 180.00, valuation class 3000"],
             ["191100", "GR/IR clearing", "", "9,000.00", "Goods received, invoice outstanding — an accrual liability"],
             ["", "Total", "9,000.00", "9,000.00", "Debits equal credits"],
         ]},
        {"t": "p", "x": "Automatic PO creation only solves where the document comes from; the posting logic is still a standard receipt: stock up, GR/IR raised. "
                      "When the invoice arrives in MIRO, GR/IR is cleared and turned into payables. If no invoice ever arrives for this PO, GR/IR stays open — "
                      "which is exactly what the month-end GR/IR balance report (MB5S) has to explain."},

        {"t": "h2", "x": "5. Posting periods: why last month's goods cannot be received this month"},
        {"t": "p", "x": "A goods receipt writes to the material ledger and to accounting at the same time, so **both periods must be open**: the accounting period (OB52) and the material period (MMRV/MMPV). "
                      "Forgetting to open the new period after closing the month is the wall beginners hit most often, and the error looks unrelated to the business."},
        {"t": "table",
         "head": ["Object", "Transaction", "What it controls", "Typical error"],
         "rows": [
             ["Accounting period", "OB52", "Opens periods 1–12 and the 13–16 adjustment periods per account type (K vendor / A asset / D customer / M material / S G/L / V contract)", "Posting period is not open / period is closed"],
             ["Period lock", "OKP1", "Locks plan and actual cost periods per controlling area", "Period is locked, posting not possible"],
             ["Material period", "MMRV / MMPV", "Shows the current material period and whether the previous one may still be posted; MMPV closes one period at a time", "Material period 11/2026 is not open"],
             ["Fiscal year variant", "OB29", "Decides how many posting periods a year has (commonly 12 + 4 special periods)", "Period number outside the fiscal year variant"],
         ]},
        {"t": "fig", "tcode": "OB52", "title": "Maintain Posting Periods (period variant A001)", "menu": ["Table", "Edit", "Goto", "Environment", "System", "Help"],
         "inner": [
             {"t": "gbox", "legend": "Period", "rows": [
                 {"label": "Period variant", "v": "A001", "w": "w90", "mark": 1},
                 {"label": "Fiscal year", "v": "2026", "w": "w90"},
             ]},
             {"t": "tbl", "cls": "alv", "head": ["Account type", "From period", "To period", "Fiscal year", "Account from", "Account to", "Auth. group"],
              "rows": [
                  ["S G/L", "11", "11", "2026", "", "", ""],
                  ["M Material", "11", "11", "2026", "", "", ""],
                  ["K Vendor", "11", "11", "2026", "", "", ""],
                  ["D Customer", "11", "11", "2026", "", "", ""],
                  ["A Asset", "11", "11", "2026", "", "", ""],
              ]},
             {"t": "status", "kind": "info", "x": "Period variant A001 changed (not saved)"},
         ],
         "caption_b": "Figure 5-6",
         "caption": "Each row in OB52 is one **account type**: M is material, K vendor, S G/L. A goods receipt touches both stock and GR/IR, "
                    "so both the M and the S row must include the current month; open M without S and the error points at a G/L account, which sends beginners off to check account configuration and further from the cause."},
        {"t": "note", "kind": "err", "b": "The order of the two periods",
         "x": "**Open the material period first, then the accounting period** (or both together). Open accounting only and the receipt reports \"material period not open\"; "
              "the other way round it reports \"posting period not open\". With both closed the accounting message comes first, so do not assume the material period is fine."},

        {"t": "h2", "x": "6. Pass criteria and common errors"},
        {"t": "check", "items": [
            "MB01 with 101, no PO, R-1002 / 1710 / 0002 / 50 / 100124: after ✓ the status bar shows both the material document and the PO number.",
            "ME23N opens the automatically created PO with the right quantity and net price (50 PC / 180.00 USD / 9,000.00 USD).",
            "MMBE shows the stock of R-1002 in 0002 rising from 20 to 70 PC.",
            "FB03 opens the accounting document: stock debit 9,000.00, GR/IR credit 9,000.00, balanced.",
            "Switch off Automatic purchase order on the material and receive again on purpose: the system must report \"Please enter purchase order\" instead of quietly creating one.",
            "Close MMPV into the next period and then post a receipt with this month's date: the system must report a material period error — the classic month-end symptom.",
        ]},
        {"t": "table",
         "head": ["Screen message (as shown)", "Root cause", "Check first"],
         "rows": [
             ["Please enter purchase order", "One of the four switches is off (most often at material or movement type level)", "MM02 purchasing view, OMJJ 101 third indicator"],
             ["No valid source found / no available source", "No source list entry, or the source list requirement is not active at plant level", "ME01 / ME03; IMG source list requirement"],
             ["Vendor 100124 not maintained in purchasing organization 1710", "The vendor has no purchasing organization data", "BP / XK02 purchasing data"],
             ["No net price could be determined", "The info record is missing or has no price", "ME11 / ME13"],
             ["Material period 11/2026 is not open", "MMPV has not been advanced to this period, or the receipt date falls in a closed period", "MMRV / MMPV"],
             ["Posting period is not open (period 11 2026)", "The M or S account type in OB52 does not include the current month", "OB52 / SU3 (user parameters)"],
         ]},

        {"t": "note", "kind": "", "b": "When not to use automatic PO creation",
         "x": "Automatic creation suits small, low-value, verbally ordered purchases. It bypasses purchasing approval and price comparison, so for large amounts, contracts or framework agreements "
              "insist on creating the PO before the goods arrive. Many companies simply switch automatic creation off for 101 and use 501 (goods receipt without purchase order) to expense such deliveries — "
              "the difference being that 101 with automatic creation still goes into stock and still creates GR/IR, while 501 goes straight to an expense and never touches stock."},
    ],
}
