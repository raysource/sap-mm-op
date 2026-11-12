# -*- coding: utf-8 -*-
PAGE = {
    "slug": "extra",
    "file": "extra.html",
    "nav": {"title": "Advanced operations", "sub": "GR without PO · returns · transfers · invoice variance · MRP · month-end",
            "head": "Advanced operations: goods without an order, goods going back, invoices that do not match", "group": "Advanced"},
    "blocks": [
        {"t": "lead", "x": "Once the main flow works, the cases you meet every day are these: goods that arrive with no purchase order, incoming material that fails inspection and goes back, "
                          "stock moved between warehouses, invoices whose amount does not match the receipt, and a pile of GR/IR balances at month-end. This chapter takes each one apart and runs it."},

        {"t": "h2", "x": "1. Other goods receipt 501: how it differs from the 101 automatic PO"},
        {"t": "p", "x": "Spare parts, samples and urgent deliveries keep turning up without an order. Without an order you cannot post a 101, so you use **movement type 501 (goods receipt without purchase order)**: "
                      "stock increases, the value comes from the **material's standard price**, the offset goes straight to a consumption (expense) account, **no GR/IR is created**, and nothing appears in the three-way match at invoice verification."},
        {"t": "fig", "tcode": "MIGO", "title": "Goods Receipt Without PO, 501",
         "inner": [
             {"t": "gbox", "legend": "Header", "rows": [
                 {"label": "Action", "v": "A01 Goods receipt", "w": "w160", "ro": True},
                 {"label": "Reference document", "v": "R Other", "w": "w160", "ro": True, "mark": 1, "hint": "no order reference"},
                 {"label": "Posting date", "v": "2026-11-10", "w": "w120"},
             ]},
             {"t": "gbox", "legend": "Goods receipt data", "rows": [
                 {"label": "Material", "v": "R-1002", "w": "w120", "req": True, "mark": 2},
                 {"label": "Movement type", "v": "501", "w": "w90", "mark": 3},
                 {"label": "Quantity", "v": "30", "w": "w90", "req": True},
                 {"label": "Plant / storage location", "v": "1710 / 0001", "w": "w120"},
             ]},
             {"t": "status", "kind": "ok", "x": "Material document 4900000002 posted (501 GR without PO, amount 5,400.00)"},
         ],
         "caption_b": "Figure 5-1",
         "caption": "Three things differ with 501: the reference document becomes \"R Other\", the purchase order field is replaced by direct material entry, and the amount is calculated automatically from standard price 180.00 × 30 = **5,400.00 USD**."},

        {"t": "table",
         "head": ["Movement type", "When to use it", "Where the value comes from", "Offsetting account", "GR/IR"],
         "rows": [
             ["501", "Small deliveries with no order, spare parts", "Material standard price (S) or moving average (V)", "Consumption / expense account (GBB-VBR etc.)", "Not involved"],
             ["561", "Initial stock load at go-live", "Material standard price", "Opening stock adjustment account", "Not involved"],
             ["101", "Normal goods receipt against an order", "Order net price", "GR/IR clearing", "Creates a liability"],
         ]},
        {"t": "note", "kind": "warn", "b": "There is another route: let the system create the order",
         "x": "SAP can generate a purchase order automatically on goods receipt without a PO, but 7 conditions must all hold: ① movement type 101 has \"automatic PO\" ticked "
              "(SPRO → Materials Management → Inventory Management → Goods Receipt → Create Purchase Order Automatically); ② the plant has a standard purchasing organization; ③ the vendor master has \"automatic PO\" ticked; "
              "④ the source list is active at plant level; ⑤ the material has a source list record; ⑥ the material's purchasing view has \"automatic PO\" ticked; ⑦ the info record price is correct. "
              "Miss one and you get \"No valid source found\". In the exercises we use 501, which is faster than configuring those 7."},

        {"t": "h2", "x": "2. Returns: do not mix up 122 and 102"},
        {"t": "table",
         "head": ["Scenario", "Transaction / movement type", "What it does", "Accounting impact"],
         "rows": [
             ["Return a whole batch to the vendor (received, not yet invoiced)", "MIGO, movement type 122, with reference to the PO", "Stock decreases, GR/IR reversed", "GR/IR Dr / stock Cr"],
             ["Wrong receipt, just reverse it", "MIGO, movement type 102, with reference to the material document", "Reverses the 101 in full", "Stock Cr / GR/IR Dr"],
             ["Return after invoicing", "MR8M to reverse the invoice → then 122 → then ME22N to adjust the order", "The order matters", "Invoice, stock and GR/IR roll back in sequence"],
         ]},
        {"t": "note", "kind": "err", "b": "The wrong order gets you stuck",
         "x": "Posting a 122 against an invoiced order gives \"Invoice already exists, return not possible\". The correct sequence is **MR8M to reverse the invoice → 122 to return the goods → ME22N to adjust the order quantity if needed**. "
              "In the guided lab, always reverse before correcting, so the stock never disagrees with the books."},

        {"t": "h2", "x": "3. Stock movements: 311 / 301 / 261 / 201"},
        {"t": "fig", "tcode": "MB1B", "title": "Transfer Posting 311",
         "inner": [
             {"t": "gbox", "legend": "Header", "rows": [
                 {"label": "Movement type", "v": "311", "w": "w90", "mark": 1, "hint": "311 between storage locations / 261 goods issue"},
                 {"label": "Posting date", "v": "2026-11-18", "w": "w120"},
             ]},
             {"t": "gbox", "legend": "Item 1", "rows": [
                 {"label": "Material", "v": "R-1001", "w": "w120", "req": True},
                 {"label": "Quantity", "v": "50", "w": "w90", "req": True},
                 {"label": "Plant", "v": "1710", "w": "w90"},
                 {"label": "Issue / receipt location", "v": "0001 → 0002", "w": "w120", "mark": 2},
             ]},
             {"t": "status", "kind": "ok", "x": "Material document 4900000003 posted · 0001 → 0002"},
         ],
         "caption_b": "Figure 5-2",
         "caption": "311 only moves the goods: 0001 drops by 50 and 0002 rises by 50, still 300 in total, and **no accounting document is created**. A quantity above the issuing location's available stock gives \"Insufficient stock\"."},

        {"t": "table",
         "head": ["Movement type", "Meaning", "Accounting document", "Common use"],
         "rows": [
             ["311", "Transfer between storage locations in one plant", "None", "Main warehouse → line-side store"],
             ["301", "Transfer between plants (same company code)", "None if valuation prices agree; otherwise a variance account", "1710 → 1711"],
             ["261", "Goods issue to production order", "Consumption Dr / stock Cr", "Issuing material to the line"],
             ["201", "Goods issue to cost center", "Expense Dr / stock Cr", "Departmental use, maintenance material"],
             ["309", "Material number conversion (old → new material)", "None", "Part number upgrade"],
         ]},
        {"t": "p", "x": "The old MB1A (goods issue), MB1B (transfer) and MB1C (other goods receipt) still work in S/4HANA, but SAP recommends MIGO for everything; "
                      "batch input (BDC/CATT) is the exception, where the old transaction codes are often easier because MIGO's screen elements are more complex."},

        {"t": "h2", "x": "4. Invoice variance and blocking: tolerance quick reference (see the GR and IR chapter)"},
        {"t": "p", "x": "When the invoice amount differs from the receipt amount, SAP runs a tolerance check first. Tolerances are configured per company code in **OMR6**, and four keys cover most cases:"},
        {"t": "table",
         "head": ["Tolerance key", "What it checks", "Setting used here", "What happens beyond it"],
         "rows": [
             ["BD", "Small difference (absolute difference between invoice total and debit/credit)", "Upper limit 50 USD", "Within the limit it posts to a small-difference account and the invoice still posts"],
             ["DQ", "Quantity deviation (invoice quantity vs received / ordered)", "Upper limit 1 PC or 0.5%", "Beyond it, a quantity variance is reported and the invoice is parked"],
             ["PP", "Price change (invoice unit price vs order net price)", "Upper limit 1%", "Beyond it, **M8083** is raised and the invoice is stopped outright"],
             ["VP", "Price variance for moving-average materials", "Upper limit 1%", "Beyond it the invoice is parked and the variance account needs manual handling"],
         ]},
        {"t": "fig", "tcode": "MIRO", "title": "Invoice with a variance (within 1,000.00 it posts but is blocked)",
         "inner": [
             {"t": "gbox", "legend": "Document header", "rows": [
                 {"label": "Vendor", "v": "100123", "w": "w120", "req": True},
                 {"label": "Amount (net)", "v": "216,500.00", "w": "w120", "req": True, "mark": 1},
                 {"label": "Order net value (received)", "v": "216,000.00", "w": "w120", "ro": True},
                 {"label": "Variance", "v": "+500.00 (0.23%)", "w": "w120", "ro": True, "mark": 2},
             ]},
             {"t": "tbl", "cls": "tctrl", "head": ["Item", "Account", "Name", "Debit/credit", "Amount"],
              "rows": [["1", "191100", "GR/IR clearing", "Debit", "216,500.00"],
                       ["2", "160000", "Payables — vendor", "Credit", "216,500.00"]]},
             {"t": "status", "kind": "warn", "x": "Invoice 5105600002 posted; variance 500.00 blocked, release with MRBR"},
         ],
         "caption_b": "Figure 5-3",
         "caption": "A variance of 500.00 (0.23%) is inside the 1% PP tolerance → the invoice is allowed to post but is flagged as **blocked**, so payment in F-53 is stopped until it is released in MRBR."},

        {"t": "steps", "items": [
            {"x": "**MIR4** with the invoice number: check net amount, tax, gross amount, block status and both debit/credit lines.", "k": "MIR4"},
            {"x": "**MRBR**: lists every blocked invoice; release them one by one, or in bulk per vendor."},
            {"x": "**F-53**: payment only works after release; otherwise \"Blocked invoices exist, release them in MRBR first\"."},
            {"x": "**MR8M**: for reversing a wrong invoice; only after reversal can you re-invoice or return the goods."},
        ]},

        {"t": "h2", "x": "5. Month-end: GR/IR balance, closing periods and carry-forward"},
        {"t": "fig", "tcode": "MB5S", "title": "GR/IR Balance List",
         "inner": [
             {"t": "gbox", "legend": "GR/IR clearing line items", "rows": [
                 {"label": "PO 4500000123 / 10", "v": "received 216,000.00 / invoiced 216,000.00", "w": "w220", "ro": True, "mark": 1},
                 {"label": "Balance", "v": "0.00", "w": "w120", "ro": True, "mark": 2},
                 {"label": "Total", "v": "0.00 USD", "w": "w120", "ro": True},
             ]},
             {"t": "status", "kind": "info", "x": "Balance should be 0 when receipt and invoice agree"},
         ],
         "caption_b": "Figure 5-4",
         "caption": "MB5S lists received value / invoiced value / balance per PO. **Positive = received but not invoiced (an accrual liability); negative = invoiced but not received (a prepayment)**; this list must be clean before month-end."},

        {"t": "table",
         "head": ["Month-end task", "Transaction", "What it does", "Owner"],
         "rows": [
             ["Review GR/IR details", "MB5S", "Balance per PO; find the ones that never clear", "Purchasing / accounting"],
             ["GR/IR reclassification", "MR11", "Reclassify long-outstanding GR/IR to the correct accounts", "Accounting"],
             ["Open/close GL period", "OB52", "GL posting periods; a closed period accepts no postings", "Accounting"],
             ["Open/close material period", "MMPV / MMRV", "Material periods advance one month at a time (no skipping)", "Material accounting"],
             ["Physical inventory", "MI01 → MI04 → MI07", "Freeze the book quantity → enter the count → post the differences", "Warehouse"],
             ["Vendor reconciliation", "FBL1N / F110", "Open item list and the automatic payment proposal", "Accounting"],
         ]},
        {"t": "note", "kind": "", "b": "Invoice before receipt also works",
         "x": "By default GR-based invoice verification requires the goods receipt before the invoice. To remove that restriction, change the info record in **ME12** and untick GR-based IV, "
              "so the material's POs no longer carry the indicator; MIRO can then invoice first (GR/IR becomes a debit balance) and the receipt clears it. "
              "Useful for prepayments and for vendors who invoice before shipping."},

        {"t": "h2", "x": "6. MRP: how the net requirement is calculated"},
        {"t": "p", "x": "MD04 puts demand, stock and receipts on one timeline. For R-1001 in this course: demand 400 (production order 1000234, 2026-11-18) + safety stock 20 − available 300 = **net requirement 120 PC**. "
                      "Available stock is summed at plant level (0001 + 0002), so a 311 does not change it; but if you had issued 20 PC with 261 first, available would be 280 and the net requirement 140 — **MRP always works from the stock at the time it runs**."},
        {"t": "fig", "tcode": "MD04", "title": "Stock/Requirements List R-1001 / 1710",
         "inner": [
             {"t": "gbox", "legend": "MRP parameters", "rows": [
                 {"label": "MRP type / lot size", "v": "PD / EX", "w": "w120", "ro": True},
                 {"label": "Safety stock", "v": "20", "w": "w90", "ro": True},
                 {"label": "Available stock", "v": "300 PC", "w": "w120", "ro": True, "mark": 1},
                 {"label": "Net requirement", "v": "120 PC", "w": "w120", "ro": True, "mark": 2},
             ]},
             {"t": "tbl", "cls": "alv", "head": ["Date", "MRP element", "Requirement", "Receipt", "Available"],
              "rows": [["2026-11-18", "Production order 1000234", "400", "0", "300"],
                       ["—", "Safety stock", "20", "0", "—"],
                       ["2026-11-18", "Purchase requisition (proposed)", "0", "120", "0"]]},
             {"t": "status", "kind": "ok", "x": "MRP run: purchase requisition 10000002 created (120 PC)"},
         ],
         "caption_b": "Figure 5-5",
         "caption": "Pressing \"Run MRP (MD02)\" creates a purchase requisition with MRP as its source. **MRP creates requisitions, not orders** — a buyer still has to convert them."},

        {"t": "table",
         "head": ["MRP topic", "Meaning", "Values here / common values"],
         "rows": [
             ["MRP type", "Whether it is planned, and how", "PD demand-driven / ND not planned / VB manual reorder point"],
             ["Lot size", "How much to buy at once", "EX exactly the net requirement / FX fixed lot size / HB top up to maximum"],
             ["Safety stock", "Replenish when stock drops below it", "20 PC"],
             ["MRP controller", "Which planner owns the material", "001"],
             ["MD01 / MD02 / MD04", "Plant-wide run / single-material run / view the result", "For practice, the button inside MD04 is the most direct"],
         ]},
        {"t": "check", "items": [
            "After a 501 goods receipt: R-1002 stock goes 20 → 50 and the GR/IR balance does not change",
            "After a 122 return: stock decreases and GR/IR is reversed",
            "After 311: the two storage locations still total the same, with no new accounting document",
            "Variance invoice: MIR4 shows a blocked status, and only after MRBR release can F-53 pay",
            "MB5S total 0.00 (once P2P is complete); if a balance remains you can name the exact PO",
            "MD04 shows a net requirement of 120, and running MRP creates a requisition with source MRP",
        ]},
    ],
}
