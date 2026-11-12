# -*- coding: utf-8 -*-
PAGE = {
    "slug": "flow",
    "file": "flow.html",
    "print": "A4 landscape",
    "nav": {"title": "Procure to pay in five steps", "sub": "ME51N → ME21N → MIGO → MIRO → F-53",
            "head": "Procure to pay: one order in five steps (300 PC / 216,000.00 USD)", "group": "Process"},
    "blocks": [
        {"t": "lead", "x": "This is the main line. Five transactions, five documents, with the same quantity and amount carried all the way through: **300 PC × 720.00 = 216,000.00 USD**. "
                          "Each step gives the screen reproduction, the keystrokes, the key fields and what the status bar should say — and at the end the Purchase Order History in ME23N ties it all together."},

        {"t": "chain", "items": [
            {"k": "ME51N", "t": "Requisition 10000001", "s": "300 PC"},
            {"k": "ME21N", "t": "Order 4500000123", "s": "216,000.00"},
            {"k": "MIGO", "t": "Material document 4900000001", "s": "stock +300"},
            {"k": "MIRO", "t": "Invoice 5105600001", "s": "GR/IR back to zero"},
            {"k": "F-53", "t": "Payment", "s": "payables back to zero"},
        ]},

        {"t": "h2", "x": "Step 1 — ME51N: turn \"what we need\" into a requisition"},
        {"t": "fig", "tcode": "ME51N", "title": "Create Purchase Requisition 10000001",
         "inner": [
             {"t": "gbox", "legend": "Purchase requisition", "rows": [
                 {"label": "Document type", "v": "NB", "w": "w90", "mark": 1, "hint": "NB standard purchase requisition"},
                 {"label": "Purchasing organization", "v": "1710", "w": "w90", "mark": 2},
                 {"label": "Purchasing group", "v": "001", "w": "w90", "mark": 3},
             ]},
             {"t": "gbox", "legend": "Item 10", "rows": [
                 {"label": "Material", "v": "R-1001", "w": "w120", "req": True, "mark": 4},
                 {"label": "Quantity", "v": "300", "w": "w90", "req": True, "mark": 5},
                 {"label": "Delivery date", "v": "2026-11-20", "w": "w120"},
                 {"label": "Plant / storage location", "v": "1710 / 0001", "w": "w120"},
                 {"label": "Account assignment category", "v": "(blank)", "w": "w90", "hint": "leave blank for stock material"},
             ]},
             {"t": "status", "kind": "ok", "x": "Purchase requisition 10000001 created"},
         ],
         "caption_b": "Figure 4-1",
         "caption": "A requisition is internal demand only and **creates no accounting document**. Account assignment category: leave it blank for stock material; use K (cost center), F (order) or P (project) for consumables."},

        {"t": "table",
         "head": ["Field", "Value", "Notes"],
         "rows": [
             ["Document type", "NB", "Standard purchase requisition; requisitions needing approval use NB with a release strategy"],
             ["Material / quantity", "R-1001 / 300", "The unit follows the material's base unit of measure, PC"],
             ["Delivery date", "2026-11-20", "Both MRP and the vendor's lead time are scheduled backwards from this date"],
             ["Plant", "1710", "Must already exist in the material master, otherwise \"Material not maintained in plant\""],
         ]},

        {"t": "h2", "x": "Step 2 — ME21N: requisition → purchase order"},
        {"t": "fig", "tcode": "ME21N", "title": "Create Purchase Order 4500000123",
         "inner": [
             {"t": "gbox", "legend": "Header", "rows": [
                 {"label": "Purchase order number", "v": "(assigned on save)", "w": "w120", "ro": True, "mark": 1},
                 {"label": "Vendor", "v": "100123", "w": "w120", "req": True, "mark": 2},
                 {"label": "Order type", "v": "NB", "w": "w90", "mark": 3},
                 {"label": "Purchasing org. / group", "v": "1710 / 001", "w": "w120"},
                 {"label": "Document date", "v": "2026-11-07", "w": "w120"},
             ]},
             {"t": "gbox", "legend": "Reference / item 10", "rows": [
                 {"label": "Requisition", "v": "10000001", "w": "w120", "mark": 4, "hint": "enter the number and press Enter to copy"},
                 {"label": "Material", "v": "R-1001", "w": "w120", "mark": 5},
                 {"label": "Quantity", "v": "300", "w": "w90"},
                 {"label": "Net price", "v": "720.00", "w": "w120", "ro": True, "hint": "from the info record"},
                 {"label": "Delivery date", "v": "2026-11-15", "w": "w120"},
                 {"label": "Plant / storage location", "v": "1710 / 0001", "w": "w120"},
             ]},
             {"t": "status", "kind": "ok", "x": "Purchase order 4500000123 created · net value 216,000.00 USD"},
         ],
         "caption_b": "Figure 4-2",
         "caption": "Referencing the requisition is the fastest route: enter its number, press Enter, and material, quantity and delivery date are copied. **The net price is read-only** — it comes from the ME11 info record, it is not typed here."},

        {"t": "note", "kind": "warn", "b": "Saving the PO is not the end of it",
         "x": "A saved order is still \"not released\", which does not block goods receipt in this course because no release strategy is configured. On real projects a purchase order often has to be **released** before goods may be received, "
              "either with ME29N or through the approval transactions, after which the status reads \"released\"."},

        {"t": "h2", "x": "Step 3 — MIGO: goods receipt 101, stock + and accrual +"},
        {"t": "fig", "tcode": "MIGO", "title": "Goods Receipt, Purchase Order 4500000123",
         "inner": [
             {"t": "gbox", "legend": "Header", "rows": [
                 {"label": "Action", "v": "A01 Goods receipt", "w": "w160", "ro": True, "mark": 1},
                 {"label": "Reference document", "v": "A Purchase order", "w": "w160", "ro": True, "mark": 2},
                 {"label": "Posting date", "v": "2026-11-10", "w": "w120"},
             ]},
             {"t": "gbox", "legend": "Purchase order data", "rows": [
                 {"label": "Purchase order", "v": "4500000123", "w": "w120", "req": True, "mark": 3},
                 {"label": "Movement type", "v": "101", "w": "w90", "mark": 4},
                 {"label": "Material", "v": "R-1001", "w": "w120", "ro": True},
                 {"label": "Still to be delivered", "v": "300", "w": "w90", "ro": True},
                 {"label": "Quantity", "v": "300", "w": "w90", "req": True, "mark": 5},
                 {"label": "Storage location", "v": "0001", "w": "w90"},
             ]},
             {"t": "status", "kind": "ok", "x": "Material document 4900000001 posted (accounting document 5100000001)"},
         ],
         "caption_b": "Figure 4-3",
         "caption": "MIGO is the single entry point for goods movements: choose action A01, reference A Purchase order, enter the number and press Enter — the details are copied. **A quantity above \"still to be delivered × 1.1\" is rejected** (delivery tolerance)."},

        {"t": "table",
         "head": ["Five checks before posting", "What you should see here", "What happens if it is wrong"],
         "rows": [
             ["Is the reference document right?", "A Purchase order → 4500000123", "A wrong reference (for example R Other) copies no order quantity"],
             ["Movement type", "101", "501 would hit a consumption account and raise no GR/IR liability"],
             ["Quantity ≤ still to be delivered ± tolerance", "300 / 300", "Over-receipt gives \"Goods receipt quantity exceeds the allowed tolerance\""],
             ["Storage location", "0001", "A storage location that is not active gives \"Storage location does not exist\""],
             ["Posting date inside an open period", "2026-11-10 (November is open)", "A closed period gives \"Posting period 2026/11 is not open\" (check OB52)"],
         ]},

        {"t": "h2", "x": "Step 4 — MIRO: three-way match, accrual becomes payables"},
        {"t": "fig", "tcode": "MIRO", "title": "Enter Incoming Invoice",
         "inner": [
             {"t": "gbox", "legend": "Document header", "rows": [
                 {"label": "Transaction", "v": "Invoice", "w": "w110", "ro": True, "mark": 1},
                 {"label": "Vendor", "v": "100123", "w": "w120", "req": True, "mark": 2},
                 {"label": "Invoice date", "v": "2026-11-12", "w": "w120", "mark": 3},
                 {"label": "Amount (net)", "v": "216,000.00", "w": "w120", "req": True, "mark": 4},
                 {"label": "Tax code", "v": "V0", "w": "w90", "hint": "V0 0% / V1 19%"},
             ]},
             {"t": "gbox", "legend": "Purchase order reference", "rows": [
                 {"label": "Purchase order", "v": "4500000123", "w": "w120", "req": True, "mark": 5},
                 {"label": "Quantity received", "v": "300", "w": "w90", "ro": True},
                 {"label": "Amount still to be invoiced", "v": "216,000.00", "w": "w120", "ro": True},
             ]},
             {"t": "status", "kind": "ok", "x": "Invoice document 5105600001 posted (accounting document 5100000002)"},
         ],
         "caption_b": "Figure 4-4",
         "caption": "MIRO performs the three-way match: order 300 × 720 = 216,000; goods receipt 300 PC; invoice 216,000. When all three agree it is green all the way and GR/IR returns to zero."},

        {"t": "note", "kind": "err", "b": "What happens if the amount is more than 1% out",
         "x": "Enter 219,000 (more than 1% above 216,000) → the status bar reports **Price too high (exceeds tolerance limit 1.000 %) — message M8083** and the invoice will not post. "
              "Tolerances are configured per company code in OMR6 (BD small difference / DQ quantity deviation / PP price change / VP moving average variance). "
              "A small difference (≤ 1%) is allowed to post, goes to a small-difference account, and **blocks** the invoice, so payment requires MRBR to release it first."},

        {"t": "h2", "x": "Step 5 — F-53: pay and clear"},
        {"t": "fig", "tcode": "F-53", "title": "Post Outgoing Payment",
         "inner": [
             {"t": "gbox", "legend": "Document header", "rows": [
                 {"label": "Vendor", "v": "100123", "w": "w120", "req": True},
                 {"label": "Bank account", "v": "100000", "w": "w120", "mark": 1},
                 {"label": "Amount", "v": "216,000.00", "w": "w120", "req": True, "mark": 2},
                 {"label": "Document date", "v": "2026-11-17", "w": "w120"},
             ]},
             {"t": "gbox", "legend": "Open items", "rows": [
                 {"label": "Invoice 5105600001", "v": "216,000.00 USD", "w": "w160", "ro": True, "mark": 3},
                 {"label": "Status", "v": "Ready for payment (not blocked)", "w": "w160", "ro": True},
             ]},
             {"t": "status", "kind": "ok", "x": "Payment posted and cleared: document 5100000003"},
         ],
         "caption_b": "Figure 4-5",
         "caption": "Manual payment in F-53: enter the vendor → open items are listed → enter the amount and the bank account → save. **If the invoice is blocked, this reports \"Blocked invoices exist, release them in MRBR first\"**."},

        {"t": "h2", "x": "What happened in the books across the five steps"},
        {"t": "table",
         "head": ["Stage", "Document numbers", "Debit", "Credit", "Amount USD", "Balance effect"],
         "rows": [
             ["Goods receipt 101", "4900000001 / 5100000001", "140000 Inventory", "191100 GR/IR clearing", "216,000.00", "Stock 0 → 300 PC"],
             ["Invoice MIRO", "5105600001 / 5100000002", "191100 GR/IR clearing", "160000 Payables", "216,000.00", "GR/IR back to zero"],
             ["Payment F-53", "5100000003", "160000 Payables", "100000 Bank", "216,000.00", "Payables back to zero"],
         ]},
        {"t": "check", "items": [
            "Open 4500000123 in ME23N: item 300 PC, net price 720.00, net value 216,000.00",
            "In the Purchase Order History tab: created / received 300 / invoiced 300 / paid are all present",
            "MMBE: R-1001 at 1710 / 0001 shows 300 PC of unrestricted stock",
            "MB5S: the GR/IR balance for this PO is 0.00, total 0.00",
            "Open 5100000001 and 5100000002 in FB03: debit and credit 216,000.00 each, accounts matching the table above",
            "After F-53, check FBL1N (vendor line items): the invoice is cleared, no open items remain",
        ]},
        {"t": "table",
         "head": ["Status bar message", "Root cause", "First transaction to check"],
         "rows": [
             ["Purchase order 4500000123 does not exist", "Number mistyped, or the order was never saved", "ME23N or ME2L"],
             ["Goods receipt quantity exceeds allowed tolerance", "Quantity > still to be delivered × 1.1", "ME23N for the open quantity; change the MIGO quantity or reverse with 102 first"],
             ["Purchase order 4500000123 has no goods receipt, cannot be invoiced", "Goods receipt was skipped", "Run MIGO first, or switch off GR-based IV and invoice (ME12)"],
             ["Price too high (exceeds tolerance limit 1.000 %) — M8083", "Invoice amount exceeds the order net value by more than 1%", "Check the invoice; handle the variance via OMR6 or correct the amount"],
             ["No open items to clear", "Wrong vendor, or the invoice is blocked", "FBL1N for open items; release in MRBR"],
             ["Posting period 2026/11 is not open", "The GL period is closed", "Check the period in OB52; for MM periods use MMPV/MMRV"],
         ]},
    ],
}
