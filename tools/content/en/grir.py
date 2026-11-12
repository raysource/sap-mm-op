# -*- coding: utf-8 -*-
PAGE = {
    "slug": "grir",
    "file": "grir.html",
    "print": "A4 landscape",
    "nav": {"title": "GR and IR", "sub": "GR-based IV · four tolerances · blocks and release · GR/IR clearing",
            "head": "GR and IR: how receipt and invoice line up, and how the system stops them when they do not", "group": "Advanced"},
    "blocks": [
        {"t": "lead", "x": "The most confusing part of MM is not creating documents but what happens in the books while the goods are in and the invoice is not. "
                          "The answer is a temporary account, **GR/IR (goods receipt / invoice receipt clearing)**: a liability at goods receipt, cleared when the invoice arrives. This page explains the three-way match, "
                          "GR-based IV, the four tolerances, invoice blocking and release, and the inverted route of invoicing before receipt."},

        {"t": "h2", "x": "1. What GR/IR is: an account that exists purely to wait for an invoice"},
        {"t": "table", "num": True,
         "head": ["Point in time", "Business step", "Accounting entry", "GR/IR balance"],
         "rows": [
             ["① Goods receipt", "MIGO 101", "Stock Dr 216,000.00 / GR/IR Cr 216,000.00", "Credit 216,000.00 (accrual liability)"],
             ["② Invoice", "MIRO", "GR/IR Dr 216,000.00 / payables Cr 216,000.00", "0 (that order cleared)"],
             ["③ Payment", "F-53", "Payables Dr 216,000.00 / bank Cr 216,000.00", "0"],
         ]},
        {"t": "p", "x": "The GR/IR balance is itself a to-do list: a non-zero balance means either goods received without an invoice (credit), an invoice without goods (debit), "
                      "or a quantity / amount difference. At month-end finance pulls **MB5S** and walks it line by line; anything long outstanding has to be accrued or cleared."},
        {"t": "note", "kind": "warn", "b": "It is not a normal payable",
         "x": "GR/IR carries no vendor, so **you cannot pay it directly** and you cannot age it. Its only exit is invoice verification (or manual clearing with MR11). "
              "Vendor reconciliation runs through accounts payable (reconciliation account 160000), not through GR/IR."},

        {"t": "h2", "x": "2. The three-way match and GR-based IV"},
        {"t": "p", "x": "Invoice verification looks at three documents at once: the **purchase order (how much should be paid)**, the **goods receipt (how much actually arrived)** and the **invoice (how much the vendor wants)**. "
                      "On the Invoice tab of the PO item there is a **GR-based IV** checkbox, and it decides whether an invoice may be posted before the receipt:"},
        {"t": "table",
         "head": ["GR-based IV", "Behaviour", "Typical scenario"],
         "rows": [
             ["Ticked (default)", "When MIRO references the PO it only proposes the quantity **already received**; with no receipt no item appears and no invoice can be posted", "The vast majority of purchasing: receive first, invoice second"],
             ["Not ticked", "When MIRO references the PO it proposes the **ordered quantity**, so the invoice can be posted before the goods arrive (invoice first)", "Prepayments, service purchasing, vendors who invoice early"],
         ]},
        {"t": "note", "kind": "err", "b": "The most common reason MIRO \"will not open\"",
         "x": "You enter the purchase order in MIRO and the item list stays empty, with only \"no items to be invoiced\" — nine times out of ten GR-based IV is ticked and **nothing has been received yet**. "
              "Either post the receipt in MIGO first, or remove the tick as described in the next section. The source material records this verbatim as \"this one matters, this is where I had not ticked it\"."},

        {"t": "h2", "x": "3. IR before GR: removing GR-based IV"},
        {"t": "steps", "items": [
            {"x": "Copy two POs (create them in ME21N with reference to an existing order, or use the copy function), for example 4500014508 and 4500014509.", "k": "ME21N"},
            {"x": "Receive **neither** of them, go straight into MIRO and reference the first one (GR-based IV still ticked) — no item appears. That is the default behaviour.", "k": "MIRO"},
            {"x": "Change the info record with **ME12** and remove GR-based IV; then use ME22N to untick the same checkbox on the item of the second PO.", "k": "ME12"},
            {"x": "Back in MIRO, reference the second PO: this time quantity and amount appear; enter the invoice amount and press ✓ to **post directly** (an invoice document is created).", "k": "MIRO"},
            {"x": "The PO history now has an invoice number but still no receipt — GR/IR carries a **debit** balance (invoice in, goods missing).", "k": "ME23N"},
            {"x": "Now post MIGO 101: stock +, GR/IR credited back, GR/IR returns to zero; the PO history has both lines and still-to-be-delivered drops to 0.", "k": "MIGO"},
        ]},
        {"t": "fig", "tcode": "ME12", "title": "Change Purchasing Info Record (purchasing organization data)", "menu": ["Purchasing Info Record", "Edit", "Goto", "Environment", "System", "Help"],
         "inner": [
             {"t": "gbox", "legend": "Purchasing info record", "rows": [
                 {"label": "Vendor", "v": "100123", "w": "w110", "mark": 1},
                 {"label": "Material", "v": "R-1001", "w": "w110", "mark": 2},
                 {"label": "Purchasing organization", "v": "1710", "w": "w90"},
                 {"label": "Net price", "v": "720.00 USD", "w": "w110", "ro": True},
             ]},
             {"t": "gbox", "legend": "Control data", "rows": [
                 {"label": "GR-based IV", "v": "☐ not ticked", "w": "w120", "mark": 3},
                 {"label": "Price unit", "v": "1", "w": "w80", "ro": True},
                 {"label": "Planned delivery time", "v": "5 days", "w": "w90", "ro": True},
             ]},
             {"t": "status", "kind": "ok", "x": "Purchasing info record 5300000122 changed"},
         ],
         "caption_b": "Figure 6-1",
         "caption": "Removing **GR-based IV** in ME12 only affects POs created **afterwards**; POs that already exist need ME22N, unticking it on the Invoice tab of the item. "
                    "This is easy to miss: change only ME12 and the old PO still refuses to propose unreceived items."},

        {"t": "fig", "tcode": "ME23N", "title": "Purchase Order History (invoice before receipt)", "menu": ["Purchase Order", "Edit", "Goto", "Environment", "System", "Help"],
         "inner": [
             {"t": "gbox", "legend": "Header", "rows": [
                 {"label": "Purchase order", "v": "4500014509", "w": "w110", "mark": 1},
                 {"label": "Vendor", "v": "100123", "w": "w110", "ro": True},
                 {"label": "Net value", "v": "216,000.00 USD", "w": "w120", "ro": True},
             ]},
             {"t": "tabs", "items": ["Items", "Purchase Order History", "Invoice"], "on": 1},
             {"t": "tbl", "cls": "alv", "head": ["Date", "Document", "Number", "Quantity", "Amount", "Status"],
              "head2": "History order when IR comes first", "rows": [
                  ["2026-11-18", "Purchase order", "4500014509", "300", "216,000.00", "Created"],
                  ["2026-11-20", "Invoice", "5105606304", "300", "216,000.00", "Posted"],
                  ["2026-11-22", "Goods receipt", "5000006982", "300", "216,000.00", "Posted"],
              ]},
             {"t": "status", "kind": "info", "x": "Still to be delivered: 0 PC · still to be invoiced: 0.00 USD"},
         ],
         "caption_b": "Figure 6-2",
         "caption": "With invoice first, the PO history shows **invoice above receipt**, yet both lines eventually exist. The two figures \"still to be delivered / still to be invoiced\" are more reliable than the status: "
                    "only when both are 0 is the order finished."},

        {"t": "h2", "x": "4. The MIRO entry screen: five fields decide whether the invoice posts"},
        {"t": "fig", "tcode": "MIRO", "title": "Enter Incoming Invoice (with reference to a purchase order)", "menu": ["Invoice Verification", "Edit", "Goto", "Environment", "System", "Help"],
         "inner": [
             {"t": "gbox", "legend": "Header", "rows": [
                 {"label": "Company code", "v": "1710", "w": "w90", "mark": 1},
                 {"label": "Document type", "v": "RE Invoice", "w": "w110", "mark": 2, "hint": "RE gross / RN net"},
                 {"label": "Posting date", "v": "2026-11-22", "w": "w110"},
                 {"label": "Invoice date", "v": "2026-11-20", "w": "w110"},
             ]},
             {"t": "gbox", "legend": "Purchase order / delivery note", "rows": [
                 {"label": "Purchase order", "v": "4500000123", "w": "w120", "mark": 3},
                 {"label": "Amount", "v": "216,000.00", "w": "w110", "mark": 4},
                 {"label": "Calculate tax", "v": "☑", "w": "w80"},
                 {"label": "Tax code", "v": "J1", "w": "w80", "mark": 5, "hint": "A default tax code can be configured"},
             ]},
             {"t": "tbl", "cls": "tctrl", "head": ["Item", "PO item", "Material", "Quantity", "Unit price", "Amount", "Tax code"], "cur": 0,
              "rows": [["1", "10", "R-1001", "300", "720.00", "216,000.00", "J1"]]},
             {"t": "status", "kind": "info", "x": "Difference: 0.00 · check passed, ready to post"},
         ],
         "caption_b": "Figure 6-3",
         "caption": "MIRO needs only five key values: company code, document type (RE invoice / RN credit memo), purchase order, invoice amount and tax code. "
                    "After the check, the **difference** in the status bar must be 0.00 before you may post; a non-zero difference goes into variance handling (next section)."},

        {"t": "h2", "x": "5. The four tolerances (OMR6): how much difference counts as acceptable"},
        {"t": "table",
         "head": ["Tolerance key", "Name", "How the system calculates it", "What happens beyond it"],
         "rows": [
             ["BD", "Form small differences (rounding)", "If the absolute invoice balance is within the upper limit it is posted to a small-difference account and the gap is closed", "Above the limit the difference cannot be absorbed — error"],
             ["DQ", "Quantity deviation", "With a receipt: net price × (invoice quantity − (delivered − invoiced)); without a receipt: net price × (invoice quantity − (ordered − invoiced))", "Beyond it: quantity deviation exceeds tolerance"],
             ["PP", "Price change", "Per line, the difference between invoice quantity × net price and the order net price, compared with the upper and lower limits (amount and percentage)", "Beyond it: M8083 price too high — the invoice must be blocked or the amount corrected"],
             ["VP", "Moving average variance", "After posting, the moving average price is recalculated and the percentage deviation from the old price compared", "Beyond it: moving average price variance exceeds tolerance"],
         ]},
        {"t": "note", "kind": "warn", "b": "Tolerances are configured per company code",
         "x": "The first key in OMR6 is the **company code** (because invoices are booked per company code). Different company codes in one group can therefore use different tolerances; "
              "on top of that a tolerance group can be assigned in the **vendor master** (one per vendor per company code), used to loosen or tighten the limits for specific vendors."},

        {"t": "fig", "tcode": "OMR6", "title": "Set Tolerance Limits: Invoice Verification", "menu": ["Table", "Edit", "Goto", "Environment", "System", "Help"],
         "inner": [
             {"t": "gbox", "legend": "Company code", "rows": [
                 {"label": "Company code", "v": "1710", "w": "w90", "mark": 1},
             ]},
             {"t": "tbl", "cls": "alv", "head": ["Tolerance key", "Description", "Upper limit (abs.)", "Upper limit %", "Lower limit (abs.)", "Lower limit %"],
              "rows": [
                  ["BD", "Form small differences", "50.00", "—", "50.00", "—"],
                  ["DQ", "Quantity deviation", "—", "1.000", "—", "1.000"],
                  ["PP", "Price change", "1,000.00", "1.000", "1,000.00", "1.000"],
                  ["VP", "Moving average variance", "—", "1.000", "—", "1.000"],
              ]},
             {"t": "status", "kind": "ok", "x": "Tolerance limits for company code 1710 saved"},
         ],
         "caption_b": "Figure 6-4",
         "caption": "One row per tolerance key in OMR6. **Absolute amount** and **percentage** can both be set and the system checks both, taking the stricter one. "
                    "The table above shows typical teaching values: rounding differences up to 50 are absorbed, a price difference up to 1 % passes and anything beyond reports M8083."},

        {"t": "h2", "x": "6. Invoices with a variance: two possible outcomes"},
        {"t": "table", "num": True,
         "head": ["Situation", "Example (300 PC, order net price 720.00)", "System behaviour", "Accounting result"],
         "rows": [
             ["Difference within tolerance", "Invoice 217,200.00, difference +1,200.00 (+0.56 %, inside PP 1 %)", "Posting allowed, the difference goes to the price variance account", "GR/IR Dr 216,000 / price variance Dr 1,200 / payables Cr 217,200"],
             ["Difference within tolerance and very small", "Invoice 216,030.00, difference 30.00 (inside BD 50)", "A small-difference line is created automatically", "GR/IR Dr 216,000 / small difference Dr 30 / payables Cr 216,030"],
             ["Difference beyond tolerance", "Invoice 226,800.00, difference +10,800.00 (+5 %)", "M8083 price too high; the invoice can be saved as **blocked** and released later in MRBR", "No accounting document until it is posted"],
             ["Quantity mismatch", "Invoice 320 PC (receipt 300 PC)", "DQ quantity deviation beyond tolerance → error; inside tolerance it is handled through the variance account", "Depends on the tolerance"],
         ]},
        {"t": "p", "x": "To post to a variance account by hand, enter the account number on the G/L account tab of MIRO. Note that **the debit/credit direction is the opposite of a normal invoice**: "
                      "a normal invoice credits payables, and the direction of a variance line follows the increase or decrease of the invoice amount — get it wrong and the system reports that debits and credits do not balance."},
        {"t": "fig", "tcode": "MIRO", "title": "Invoice Verification: variance beyond tolerance (blocked)", "menu": ["Invoice Verification", "Edit", "Goto", "Environment", "System", "Help"],
         "inner": [
             {"t": "gbox", "legend": "Header", "rows": [
                 {"label": "Company code", "v": "1710", "w": "w90"},
                 {"label": "Document type", "v": "RE Invoice", "w": "w110"},
                 {"label": "Purchase order", "v": "4500000123", "w": "w120"},
                 {"label": "Amount", "v": "226,800.00", "w": "w110", "mark": 1},
             ]},
             {"t": "tbl", "cls": "tctrl", "head": ["Item", "Material", "Quantity", "Unit price", "Amount", "Difference"],
              "rows": [["1", "R-1001", "300", "756.00", "226,800.00", "+10,800.00"]]},
             {"t": "status", "kind": "err", "x": "Price too high: tolerance limit 1.000 % exceeded (message M8083)", "code": "M8083"},
         ],
         "caption_b": "Figure 6-5",
         "caption": "Beyond tolerance the invoice cannot be posted directly, but it can be **saved as a blocked invoice** (the status bar returns the invoice number). A blocked invoice never reaches payables until MRBR releases it; "
                    "before release MIR4 shows the blocking reason."},

        {"t": "h2", "x": "7. Blocking, release and parked invoices"},
        {"t": "table",
         "head": ["Transaction", "Purpose", "When to use it"],
         "rows": [
             ["MIRO", "Enter and post an invoice (or save it as blocked)", "The normal check"],
             ["MIR7", "Park invoice: saved without an accounting document, editable any number of times", "While the amount is still being negotiated or approval is pending"],
             ["MIR4", "Display the invoice document (blocking reason, variance lines, follow-on documents)", "To find out why this invoice has not reached payables"],
             ["MRBR", "Release blocked invoices (in bulk by company code / vendor)", "Once approval has been given"],
             ["MR11", "GR/IR clearing: write off long-outstanding receipt / invoice differences by hand", "Month-end clean-up of small residuals and dormant GR/IR"],
             ["MB5S", "GR/IR balance list (per PO item)", "Month-end reconciliation, hunting \"received but not invoiced\""],
         ]},
        {"t": "fig", "tcode": "MRBR", "title": "Release Blocked Invoices", "menu": ["Invoice Verification", "Edit", "Goto", "Environment", "System", "Help"],
         "inner": [
             {"t": "gbox", "legend": "Selection", "rows": [
                 {"label": "Company code", "v": "1710", "w": "w90", "mark": 1},
                 {"label": "Vendor", "v": "100123", "w": "w110"},
                 {"label": "Invoice date from", "v": "2026-11-01", "w": "w110"},
             ]},
             {"t": "tbl", "cls": "alv", "head": ["Select", "Invoice", "Vendor", "Amount", "Blocking reason", "Status"],
              "sel": 0, "rows": [["☑", "5105600002", "100123", "226,800.00", "Price variance M8083", "Blocked"]]},
             {"t": "status", "kind": "ok", "x": "1 invoice released and posted: 5105600002"},
         ],
         "caption_b": "Figure 6-6",
         "caption": "Tick the row in MRBR and execute: the invoice posts immediately and payables appear. The release itself changes no amount, it only opens the manual-approval gate — "
                    "so the variance account and tax code must already be correct before release."},

        {"t": "h2", "x": "8. The GR/IR balance: the last report of the month"},
        {"t": "fig", "tcode": "MB5S", "title": "GR/IR Balance List (by purchase order)", "menu": ["Purchasing", "Edit", "Goto", "Environment", "System", "Help"],
         "inner": [
             {"t": "gbox", "legend": "Selection", "rows": [
                 {"label": "Company code", "v": "1710", "w": "w90", "mark": 1},
                 {"label": "Material", "v": "R-1001", "w": "w110"},
                 {"label": "Plant", "v": "1710", "w": "w90"},
             ]},
             {"t": "tbl", "cls": "alv", "head": ["Purchase order", "Item", "GR quantity", "Invoiced qty", "GR amount", "Invoice amount", "Balance"],
              "rows": [
                  ["4500000123", "10", "300", "300", "216,000.00", "216,000.00", "0.00"],
                  ["4500014509", "10", "300", "300", "216,000.00", "216,000.00", "0.00"],
                  ["4500000124", "10", "50", "0", "9,000.00", "0.00", "−9,000.00"],
              ]},
             {"t": "status", "kind": "info", "x": "3 items · total balance −9,000.00 (credit: received, not invoiced)"},
         ],
         "caption_b": "Figure 6-7",
         "caption": "One row per PO item in MB5S. **A negative figure means a credit balance, i.e. received but not invoiced** (GR/IR is a liability account, so a credit is often shown with a minus in reconciliation reports); "
                    "a positive figure means invoiced but not received. Whatever is left on this report at month-end must be chased, accrued or cleared with MR11."},

        {"t": "h2", "x": "9. Pass criteria and error comparison"},
        {"t": "check", "items": [
            "MIRO posts 300 PC / 216,000.00 successfully and the status bar returns the invoice number; the Invoice line in the ME23N history carries it.",
            "The balance for that PO in MB5S returns to 0.00.",
            "Change the invoice amount to 226,800.00 and try again: M8083 is reported; saved as blocked, MIR4 shows the blocking reason.",
            "After MRBR releases the blocked invoice, payables rise by 226,800.00 and the price variance account shows 10,800.00.",
            "Remove GR-based IV in ME12, create a new PO and go straight to MIRO without a receipt: items appear and the invoice posts, while the PO history has no receipt.",
            "Receive afterwards in MIGO: the MB5S balance returns to zero and both PO history lines are complete.",
        ]},
        {"t": "table",
         "head": ["Screen message (as shown)", "Root cause", "Check first"],
         "rows": [
             ["No items to be invoiced / no items selected", "GR-based IV is ticked on the PO but nothing has been received", "ME23N item Invoice tab; post MIGO first, or untick in ME12/ME22N"],
             ["Price too high: tolerance limit 1.000 % exceeded (M8083)", "The invoice unit price deviates from the order net price beyond the PP tolerance", "The PP row in OMR6; whether the net price in ME23N was changed"],
             ["Quantity deviation exceeds tolerance (M8147 and similar)", "Invoice quantity deviates from received / invoiced quantity beyond the DQ tolerance", "The DQ row in OMR6; whether MIGO received too little"],
             ["Invoice is blocked, payment not possible", "The invoice is still blocked and has not been released", "MIR4 for the blocking reason → MRBR to release"],
             ["Account 191100 cannot be used (or similar)", "The GR/IR account is not configured in OBYC under WRX, or the valuation class has no account", "OBYC (WRX), OMWB automatic postings"],
             ["Difference is not zero, posting not possible", "The invoice amount does not match the net value and exceeds tolerance, or the tax code is wrong", "Recalculate tax; use a variance account line if needed"],
         ]},
        {"t": "note", "kind": "", "b": "One sentence to remember how GR and IR relate",
         "x": "**GR increases stock and credits GR/IR; IR brings GR/IR back to zero and increases payables.** Either can come first, but quantity and amount must agree on both sides; "
              "when they do not, the system does not \"work it out\" — it uses the tolerance to decide whether to pass the difference to a variance account or stop and ask a human."},
    ],
}
