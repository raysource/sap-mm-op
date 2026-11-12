# -*- coding: utf-8 -*-
PAGE = {
    "slug": "basics",
    "file": "basics.html",
    "nav": {"title": "Business basics", "sub": "What MM controls · organisation · master data · movement types · GR/IR · customising",
            "head": "Business basics: what MM actually controls, and how the money is recorded", "group": "Business basics"},
    "blocks": [
        {"t": "lead", "x": "MM (Materials Management) is the part of SAP that answers: what do we buy, how much, when does it arrive, where is it booked, and how is the money recorded. "
                          "It connects the purchasing process (requisition, order, goods receipt) on one side with Financial Accounting (stock, accruals, payables) on the other, "
                          "and the material master plus the organisational structure hold the two together."},

        {"t": "h2", "x": "1. The four business areas of MM"},
        {"t": "table",
         "head": ["Area", "What it does", "Typical transactions", "Documents produced"],
         "rows": [
             ["Material master", "Gives every material an identity card: type, unit, purchasing group, MRP, valuation class, price", "MM01 / MM02 / MM03", "None (changes are logged as change documents)"],
             ["Purchasing", "Requisition → RFQ and quotation → order → contract / scheduling agreement", "ME51N / ME21N / ME41 / ME31K", "Purchase order (no accounting document)"],
             ["Inventory management", "Goods receipt, goods issue, transfer, physical inventory, return to stock", "MIGO / MB1B / MI01", "Material document (+ accounting document when value is involved)"],
             ["Invoice verification (IV)", "Three-way match of vendor invoice against order and goods receipt; variances handled by tolerance", "MIRO / MIR4 / MRBR", "Invoice document + accounting document"],
             ["Requirements planning (MRP)", "Calculates net requirements from demand, stock and safety stock, then creates purchase requisitions", "MD01 / MD02 / MD04", "Purchase requisition"],
         ]},

        {"t": "h2", "x": "2. Organisational structure: five levels, and a missing one blocks every document"},
        {"t": "chain", "items": [
            {"k": "BUKRS", "t": "Company code", "s": "1710 the legal entity that reports externally"},
            {"k": "EKORG", "t": "Purchasing organization", "s": "1710 the unit that negotiates conditions"},
            {"k": "EKGRP", "t": "Purchasing group", "s": "001 the buyer's team"},
            {"k": "WERKS", "t": "Plant", "s": "1710 the place that receives, stores and plans"},
            {"k": "LGORT", "t": "Storage location", "s": "0001 / 0002 the exact spot inside the warehouse"},
        ]},
        {"t": "table",
         "head": ["Organisational unit", "Parameter ID", "Value used here", "What it determines"],
         "rows": [
             ["Company code", "BUKRS", "1710", "Accounts, posting periods, currency, tax; every invoice ends up in one company code"],
             ["Purchasing organization", "EKORG", "1710", "Purchasing conditions, vendor data at purchasing-organisation level, order number range"],
             ["Purchasing group", "EKGRP", "001", "No accounting impact; only decides who owns the order, used for authorisations and reporting"],
             ["Plant", "WERKS", "1710 (1711 exists as a spare)", "MRP, stock, goods receipt and valuation (standard price) all live at plant level"],
             ["Storage location", "LGORT", "0001 main warehouse / 0002 line-side store", "Only distinguishes physical positions; no effect on price or accounting"],
         ]},
        {"t": "note", "kind": "", "b": "How to remember it",
         "x": "Company code = the company that reports; purchasing organization = the purchasing department that negotiates; plant = the site that receives and stores; purchasing group = the person chasing the order. "
              "One purchasing organization can serve several company codes and plants (cross-company purchasing), which is why requisitions and orders always carry both an organisation and a plant."},

        {"t": "h2", "x": "3. Three master data objects that carry the whole chain"},
        {"t": "table",
         "head": ["Master data", "Transaction", "Key content", "Levels", "If it is missing"],
         "rows": [
             ["Material master", "MM01", "Material type ROH, base unit PC, purchasing group, MRP type / lot size, valuation class 3000, price control S, standard price 720.00",
              "Client level (basic data) + plant + storage location + valuation", "The material cannot be selected in a PO at all; error \"Material not maintained in plant\""],
             ["Vendor master", "BP (formerly XK01)", "Name, currency and payment terms at purchasing-organisation level, reconciliation account 160000 at company-code level",
              "General data + company code + purchasing organization", "Error \"Vendor not maintained in purchasing organization 1710\""],
             ["Purchasing info record", "ME11", "Vendor + material + purchasing organization → net price 720.00, price unit 1, planned delivery time 5 days",
              "Vendor + material + purchasing organization", "The PO reports \"No net price could be determined\" and you have to key the price by hand (not allowed on real projects)"],
         ]},
        {"t": "note", "kind": "warn", "b": "The three most common sequencing mistakes",
         "x": "① Creating the PO before the vendor → the vendor cannot be selected. ② Creating only basic data on the material without the purchasing view → the PO item cannot find it. "
              "③ Leaving the purchasing organization out of the info record → no price is proposed. The guided lab reproduces all three as real errors."},

        {"t": "h2", "x": "4. Document chain: which document follows which"},
        {"t": "table",
         "head": ["Stage", "Transaction", "Document", "Key point", "Accounting impact"],
         "rows": [
             ["Demand", "ME51N", "Purchase requisition 10000001", "Internal demand only; can be approved or converted", "None"],
             ["Purchasing", "ME21N", "Purchase order 4500000123", "Commitment to the vendor, carrying net price and delivery date", "None"],
             ["Goods receipt", "MIGO 101", "Material document 4900000001", "Stock increases and a GR/IR accrual is raised at the same time", "Stock Dr / GR/IR Cr"],
             ["Invoice", "MIRO", "Invoice document 5105600001", "Three-way match; variances go through tolerance", "GR/IR Dr / payables Cr"],
             ["Payment", "F-53", "Payment document", "The invoice closes once it is cleared", "Payables Dr / bank Cr"],
         ]},
        {"t": "note", "kind": "ok", "b": "How to see how far an order has got",
         "x": "Enter the order number in ME23N and open the Purchase Order History tab: created / received / invoiced / paid at a glance. "
              "It is the first screen to open when someone asks about status, chases a delivery or reconciles an account."},

        {"t": "h2", "x": "5. Movement types: the coding of every stock action"},
        {"t": "p", "x": "A movement type decides three things: whether stock goes up or down, whether an accounting document is created, and which offsetting account is used."},
        {"t": "table",
         "head": ["Movement type", "Meaning", "Stock", "Accounting document", "Typical case"],
         "rows": [
             ["101", "Goods receipt against purchase order", "+", "Stock Dr / GR/IR Cr", "Vendor delivers to the plant"],
             ["102", "Reversal of goods receipt", "−", "Reversed", "Received in error, sent back"],
             ["122", "Return to vendor (with reference to PO)", "−", "GR/IR Dr / stock Cr", "Incoming material rejected"],
             ["501", "Goods receipt without purchase order", "+", "Stock Dr / consumption Cr", "Petty purchases, deliveries without a PO"],
             ["561", "Initial stock entry", "+", "Stock Dr / opening balance Cr", "Loading legacy stock at go-live"],
             ["311", "Transfer between storage locations (same plant)", "Down here, up there", "None", "Main warehouse → line-side store"],
             ["301", "Transfer between plants", "Down here, up there", "Only when valuation prices differ", "1710 → 1711"],
             ["261", "Goods issue to production order", "−", "Consumption Dr / stock Cr", "Issuing material to the line"],
             ["201", "Goods issue to cost center", "−", "Expense Dr / stock Cr", "Departmental withdrawals"],
         ]},
        {"t": "note", "kind": "warn", "b": "101 versus 501",
         "x": "Both increase stock; the difference is whether there is a purchase order. 101 requires a PO, values the receipt at the order's net price and posts to GR/IR. "
              "501 has no PO, values the receipt at the material's standard price and posts straight to a consumption (expense) account. "
              "So 501 never creates a GR/IR balance and can never be matched in invoice verification — such deliveries are either expensed or covered by a PO created afterwards and reversed."},

        {"t": "h2", "x": "6. Accounting: why a GR/IR account exists at all"},
        {"t": "p", "x": "In reality goods and invoices never arrive at the same moment. SAP uses the GR/IR (Goods Receipt / Invoice Receipt) account to record that gap: "
                      "at goods receipt it recognises a liability for goods received but not yet invoiced, and when the invoice arrives it converts that accrual into real payables."},
        {"t": "table",
         "head": ["Point in time", "Document", "Debit", "Credit", "Amount", "GR/IR balance"],
         "rows": [
             ["Goods receipt 300 PC", "Material document 4900000001 + accounting document 5100000001", "140000 Inventory — raw materials", "191100 GR/IR clearing", "216,000.00", "216,000.00 (credit)"],
             ["Invoice received", "Invoice document 5105600001 + accounting document 5100000002", "191100 GR/IR clearing", "160000 Payables — vendor", "216,000.00", "0.00"],
             ["Payment", "Accounting document 5100000003 (F-53)", "160000 Payables — vendor", "100000 Bank", "216,000.00", "0.00"],
         ]},
        {"t": "note", "kind": "", "b": "Three rules of thumb",
         "x": "① Goods received but not invoiced → GR/IR shows a credit balance (an accrual liability). ② Invoiced before receipt (requires GR-based IV to be switched off) → GR/IR shows a debit balance (a prepayment). "
              "③ At month-end, use MB5S to inspect GR/IR items that never clear, and MR11 to reclassify them if needed."},

        {"t": "h2", "x": "7. Automatic account determination (OBYC): nobody keys the accounts"},
        {"t": "p", "x": "The accounts on stock-related documents are derived by the system from transaction key + valuation class + account modifier, configured in OBYC. "
                      "That is why valuation class 3000 in the material master is not a comment field — it decides which inventory account the goods land in."},
        {"t": "table",
         "head": ["Transaction key", "Purpose", "Example value used here"],
         "rows": [
             ["BSX", "Inventory posting (stock account)", "Valuation class 3000 → 140000 Inventory — raw materials"],
             ["WRX", "GR/IR clearing account", "191100 GR/IR clearing"],
             ["PRD", "Price difference (standard price vs actual)", "660200 Purchase price variance"],
             ["GBB", "Offsets for reversals and consumption (VBR = production consumption, VAX/VAY = expense)", "410101 Production cost — raw material consumption"],
             ["UMB", "Difference between valuation classes (transfers)", "Configured as required"],
         ]},
        {"t": "note", "kind": "", "b": "The fastest way to read a document",
         "x": "After any posting, note the accounting document number and open it in FB03: the line items show the posting key (PK — 40 = debit, 50 = credit), the account, the debit/credit indicator and the amount. "
              "The single biggest step for a beginner is going from \"I clicked something\" to \"these lines appeared in the books\"."},

        {"t": "h2", "x": "8. Customising: the ten items to walk through before a new system goes live"},
        {"t": "p", "x": "Business users never touch configuration, yet eight times out of ten \"why won't my document save\" comes down to something missing here. The ten items below are in go-live order: "
                      "the first four are organisational, the middle four cover planning and goods receipt, and the last two are the accounting interface. Each one names the IMG path and who you should ask."},
        {"t": "table",
         "head": ["#", "Configuration item", "IMG path (short)", "Impact"],
         "rows": [
             ["1", "Plant and storage location", "Enterprise Structure → Definition → Logistics → Define, copy, delete, check plant / storage location", "The smallest unit of stock and MRP; without a plant you cannot even finish the material master"],
             ["2", "Purchasing organization and assignment", "Enterprise Structure → Assignment → Materials Management → Assign standard purchasing organization to plant", "Decides which purchasing organization an order uses and which vendor data level has to be maintained"],
             ["3", "Material group", "Logistics General → Material Master → Material Groups → Define material groups", "The extra dimension used for purchasing statistics and account determination"],
             ["4", "Material type attributes", "Logistics General → Material Master → Basic Settings → Material Types → Define attributes of material types", "Decides which views exist, whether numbering is internal or external, and whether valuation is mandatory"],
             ["5", "Plant parameters (MRP / inventory)", "Materials Management → Consumption-Based Planning → Plant Parameters", "Whether MRP is active, whether receipt creates a storage location automatically, whether reservations are allowed"],
             ["6", "Goods receipt tolerances", "Materials Management → Inventory Management and Physical Inventory → Goods Receipt → Set tolerance limits", "Whether an over-delivery in quantity or date raises an error"],
             ["7", "Source list requirement", "Materials Management → Purchasing → Source List → Define source list requirements at plant level", "Whether the system insists on a valid source (needed for goods receipt without PO)"],
             ["8", "Purchase price variance tolerance", "Materials Management → Purchasing → Environment → Define tolerance limits for price differences", "How far an order price may deviate from the info record or valuation before it counts as an exception"],
             ["9", "Valuation control and valuation class", "Materials Management → Valuation and Account Assignment → Valuation Control / Define valuation classes", "Whether a material is valued at plant or company code level; the valuation class picks the account group"],
             ["10", "Automatic account determination (OBYC)", "Materials Management → Valuation and Account Assignment → Account Determination → Configure automatic postings (OBYC)", "BSX inventory, WRX GR/IR, PRD price difference, KBS receipt reversal … this is where the accounts come from"],
         ]},
        {"t": "note", "kind": "warn", "b": "Configuration versus master data",
         "x": "Configuration (IMG) is the rule set, owned by consultants and key users, and one change affects the whole company; master data (MM01/BP/ME11) is the data business users maintain every day. "
              "Treat a configuration problem as master data and you will trial-and-error in MM01; treat master data as configuration and you will change something for the whole company. The test: "
              "**does a different material or vendor fail the same way** — if yes, check configuration; if only this one fails, check master data."},

        {"t": "h2", "x": "9. Common misconceptions (clear these before going further)"},
        {"t": "ul", "cls": "fld", "items": [
            "**\"Posting a purchase order reserves stock\"** — no. A PO moves no stock; only a goods receipt (101) does.",
            "**\"Invoice verification just means typing the invoice in\"** — no. It performs a three-way match (order / goods receipt / invoice); quantities and amounts must agree and variances go through tolerance.",
            "**\"Stock value = quantity × order price\"** — true only for standard-price materials whose invoice price did not change. A moving-average material recalculates its unit price on every receipt.",
            "**\"Transfers affect profit\"** — a 311 transfer inside one plant moves no value and creates no accounting document; only a cross-valuation-area transfer (301) at a different price produces a variance account.",
            "**\"Deleting a goods receipt makes it disappear\"** — you cannot delete it, only reverse it (102 or 122); and if it has been invoiced you must reverse the invoice first (MR8M).",
        ]},
    ],
}
