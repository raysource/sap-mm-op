# -*- coding: utf-8 -*-
PAGE = {
    "slug": "gui",
    "file": "gui.html",
    "print": "A4 landscape",
    "nav": {"title": "GUI and navigation", "sub": "Logon · five areas · command field /n · shortcuts · F1/F4",
            "head": "The SAP GUI 8.10 screen: learn where to type and which key to press", "group": "GUI basics"},
    "blocks": [
        {"t": "lead", "x": "SAP GUI 8.10 uses the Horizon theme: dark blue title bar, white menu bar, system information moved to the right end of the menu bar, thin-line icons. "
                          "Learn the logon and the five areas first — every transaction afterwards is the same sequence: type the transaction code → Enter → fill the fields → Enter to check → ✓ to save."},

        {"t": "h2", "x": "1. Logon: three fields decide which system you enter"},
        {"t": "fig", "tcode": "", "title": "SAP System Logon", "menu": [], "no_tool": True,
         "inner": [
             {"t": "gbox", "legend": "Logon", "rows": [
                 {"label": "Client", "v": "110", "w": "w90", "mark": 1},
                 {"label": "User", "v": "MMUSER01", "w": "w120", "mark": 2},
                 {"label": "Password", "v": "••••••••", "w": "w120", "mark": 3},
                 {"label": "Language", "v": "ZH", "w": "w90", "mark": 4, "hint": "ZH Chinese / EN English / JA Japanese"},
                 {"label": "System / instance", "v": "S4H / 00", "w": "w120", "ro": True},
             ]},
             {"t": "status", "kind": "info", "x": "New password (appears on first logon or when the password has expired)"},
         ],
         "caption_b": "Figure 2-1",
         "caption": "The logon screen. The **client** is an independent data area inside the same system (client 110 is for practice — never practise in a production client); **language** sets the interface text, and you can change the default later with SU3."},

        {"t": "h2", "x": "2. SAP Logon 8.10: choose the system before you log on"},
        {"t": "p", "x": "The entry point in 8.10 is called **SAP Logon**, and it is not an SAP screen at all but a connection manager: on the left are your saved connections, "
                      "and only a double-click (or selecting one and choosing Log On) opens the real logon dialog. The first time you use it you have to create a connection and fill in the system ID, instance number and message server."},
        {"t": "fig", "tcode": "", "title": "SAP Logon 8.10", "menu": [], "no_tool": True,
         "inner": [
             {"t": "gbox", "legend": "Connections", "rows": [
                 {"label": "S4H [test] 110", "v": "Training (this course)", "w": "w160", "mark": 1},
                 {"label": "S4H [prod] 100", "v": "Production — do not practise here", "w": "w220", "ro": True},
                 {"label": "IDES [sandbox] 00", "v": "Old demo system", "w": "w160", "ro": True},
             ]},
             {"t": "dlg", "title": "SAP System Logon", "ok": "Log On", "cancel": "Cancel",
              "x": "Client      110\nUser        MMUSER01\nPassword    ••••••••\nLanguage    ZH (Chinese)\nSystem      S4H / 00 (instance 00)"},
             {"t": "status", "kind": "info", "x": "Select a connection and choose Log On; the language field decides the interface language after logon"},
         ],
         "caption_b": "Figure 2-2",
         "caption": "The connection list and logon dialog in SAP Logon. The **client** decides which data set you enter (100 production / 110 test); "
                    "**language** decides the interface text, and SU3 can change the default later. Connection details are distributed by Basis through saplogon.ini or a central configuration file."},

        {"t": "h2", "x": "3. The theme: what 8.10 looks like, and why your company's screen differs"},
        {"t": "p", "x": "8.10 defaults to the **Horizon** theme (the successor to the Quartz family), with Morning and Evening light and dark variants. "
                      "From 8.10 on there are also **custom themes**: a company can build a shared theme with the UI Theme Designer, or in the SAP GUI options use "
                      "Quick Theming to change just 6 main colours, from which every other colour is derived."},
        {"t": "table",
         "head": ["Screen element", "How it looks under Horizon", "Difference from 7.70 / Quartz"],
         "rows": [
             ["Title bar", "Dark blue with white text: back arrow, current transaction name, window buttons only", "7.70 used a grey 3D gradient"],
             ["Menu bar", "White with black text; the right end holds the system info (system · client · language · INS/OVR)", "In 7.70 the system info sat in the **status bar**"],
             ["Toolbar", "White with thin-line icons; the command field is a rounded input with a dropdown arrow on the right", "7.70 icons are heavier and have a raised border"],
             ["Editable / read-only fields", "Editable is white with a thin border, read-only is grey with no border", "The contrast is much stronger in 8.10, including inside tables"],
             ["Status bar", "Messages and message numbers only, and shorter", "7.70 also showed system info and keyboard status"],
             ["Theme customisation", "Quick Theming for 6 main colours, or a full custom theme", "7.70 offered only a handful of fixed themes"],
         ]},
        {"t": "note", "kind": "",
         "b": "A different theme changes no operation",
         "x": "Every screenshot and the simulator on this site are reproduced in Horizon. If your company uses custom colours or the Morning variant, the colours change but the button positions do not — "
              "so the rules below about where to type and which key to press hold in any theme."},

        {"t": "h2", "x": "4. The five areas of the main screen (SAP Easy Access)"},
        {"t": "fig", "tcode": "", "title": "SAP Easy Access", "menu": ["Menu", "Edit", "Favorites", "Extras", "System", "Help"],
         "inner": [
             {"t": "tree", "items": [
                 {"k": "MM01", "v": "Create material master"},
                 {"k": "ME51N", "v": "Create purchase requisition"},
                 {"k": "MIGO", "v": "Goods receipt / return"},
                 {"k": "MIRO", "v": "Invoice verification"},
                 {"k": "MMBE", "v": "Stock overview"},
             ]},
             {"t": "status", "kind": "info", "x": "Type a transaction code in the command field, or double-click an entry in Favorites"},
         ],
         "caption_b": "Figure 2-3",
         "caption": "**① Title bar** (current transaction name plus window buttons) | **② Menu bar** (system info at the right end: S4H (1) 110 · language · OVR means overwrite input) | "
                    "**③ Toolbar** (command field plus Enter/Back/Save/Exit buttons) | **④ Work area** (fields, tabs, tables — grey is read-only, white accepts input) | **⑤ Status bar** (message and message number)."},

        {"t": "h2", "x": "5. The command field: the single most important box on the screen"},
        {"t": "fig", "tcode": "/nMM03", "title": "Display Material", "menu": ["Material", "Edit", "Goto", "Environment", "System", "Help"],
         "inner": [
             {"t": "gbox", "legend": "Material", "rows": [
                 {"label": "Material", "v": "R-1002", "w": "w120", "req": True, "mark": 1},
                 {"label": "Material type", "v": "ROH", "w": "w90", "ro": True},
                 {"label": "Plant", "v": "1710", "w": "w90"},
             ]},
             {"t": "status", "kind": "ok", "x": "Displaying material R-1002 (read-only)"},
         ],
         "caption_b": "Figure 2-4",
         "caption": "Type **/nMM03** into the command field: /n ends the current transaction before starting the new one, so a typo never stacks a second transaction on top. Then press **Enter** — no button needed."},

        {"t": "table",
         "head": ["What you type", "Meaning", "When to use it"],
         "rows": [
             ["MM03", "Jump straight there (no /n)", "The everyday case; starting a second transaction inside the current one stacks the transaction buffer"],
             ["/nMM03", "End the current transaction, then start MM03", "When you are stuck on a screen and want a clean restart"],
             ["/n", "End the current transaction only, back to the main screen", "Equivalent to closing the current document (unsaved input is lost)"],
             ["/oMM03", "Open MM03 in a new window", "When you need to compare two screens"],
             ["/i", "Delete the current session", "When you have too many sessions open"],
             ["/nex", "End the current transaction and log off", "Switching users, or going home"],
         ]},
        {"t": "note", "kind": "warn", "b": "Two traps",
         "x": "① The command field takes a transaction code, not a menu path; a wrong entry gives \"Transaction code XXX does not exist\" and does not damage the document you were typing. "
              "② /n discards unsaved input — do not type /n out of habit halfway through a form; press ✓ to save or F3 to go back instead."},

        {"t": "note", "kind": "", "b": "From 8.10 the command field also searches",
         "x": "Type `*purchase order` or part of a menu name and press Enter: the system lists matching transaction codes and menu paths (transaction search). "
              "Before you have memorised full T-codes it beats hunting through menus; but mixing a Chinese menu name with an English T-code narrows the results, so for exams and real work nothing beats knowing the T-code."},

        {"t": "h2", "x": "6. Six toolbar buttons (beginners need only these six)"},
        {"t": "table",
         "head": ["Button", "Name", "Shortcut", "What it does"],
         "rows": [
             ["✓", "Enter", "Enter / F8", "Runs checks, expands details, confirms dialogs — **it does not save**"],
             ["◀", "Back", "F3", "Up one level; asks whether to save if there is unsaved input"],
             ["💾 (blue)", "Save", "Ctrl+S", "Actually writes to the database and issues the document number; only this step creates documents"],
             ["✕ (red)", "Exit", "Shift+F3", "Leaves the transaction, unsaved input is lost"],
             ["🔍", "Find", "Ctrl+F", "Searches a list or table for a keyword"],
             ["🖨", "Print", "Ctrl+P", "Prints the current document or list"],
         ]},
        {"t": "note", "kind": "err", "b": "The most common misunderstanding",
         "x": "\"I pressed Enter, why wasn't it saved?\" — Enter only runs checks. In SAP, saving is ✓ or Ctrl+S, and nothing is in the database until the status bar says \"... saved / posted\"."},

        {"t": "h2", "x": "7. Keyboard: Tab and the function keys double your speed"},
        {"t": "table",
         "head": ["Key", "What it does", "Why it matters"],
         "rows": [
             ["Tab", "Next field", "**Use Tab between fields**; Enter (/ F8) runs a full-screen check — good after finishing a block, bad for stringing fields together"],
             ["Shift+Tab", "Previous field", "When you need to correct the field you just left"],
             ["F4", "Field help (value list)", "When you do not know which plant or material group to use, F4 is faster than guessing"],
             ["F1", "Field documentation", "When a field's meaning is unclear, F1 also exposes the technical information (parameter ID, table name)"],
             ["Ctrl+Y", "Copy field content", "Put the cursor in the field and press Ctrl+Y to copy the value"],
             ["Ctrl+S", "Save", "Same as ✓"],
             ["F12", "Cancel", "Abandons input on the current screen and returns to the initial screen"],
         ]},
        {"t": "note", "kind": "", "b": "F1 is the most underrated feature",
         "x": "Press F1, then the Technical Information icon, and you see the table the field lives in (MARC, MARD), the field name (WERKS, LGORT) and the parameter ID. "
              "Those are exactly the names you need when writing documentation, checking configuration or talking to a consultant."},

        {"t": "h2", "x": "8. Status bar messages: three colours tell you whether it worked"},
        {"t": "table",
         "head": ["Icon", "Type", "Example", "What to do"],
         "rows": [
             ["✓ green", "Success / saved", "Material R-1001 created", "Note the document number and continue"],
             ["! yellow", "Warning (can continue)", "Delivery date is in the past; invoice blocked due to variance", "Decide whether it is acceptable, correct it if not"],
             ["✕ red", "Error (hard stop)", "Vendor 100123 not maintained in purchasing organization 1710", "Fix the master data or the field as instructed — do not force a save"],
             ["i blue", "Information", "Press Enter after input, or click ✓ in the toolbar", "Notification only"],
         ]},
        {"t": "p", "x": "Message numbers in the status bar (M8083, M7021) are searchable: Help → Application Help → search the message number to see the trigger conditions and the remedy."},

        {"t": "h2", "x": "9. Personal settings (SU3) and language"},
        {"t": "steps", "items": [
            {"x": "Enter transaction **SU3** to open Maintain User Profile.", "k": "SU3"},
            {"x": "Set parameter ID **LANG** to ZH / EN / JA: that becomes your default interface language at logon."},
            {"x": "Set parameter ID **WRK** to 1710: many screens then prefill the Plant field with it."},
            {"x": "Set parameter ID **BUKRS** to 1710: the default company code."},
            {"x": "Save (✓). It applies at your next logon; in the current session, User → Parameters applies it immediately."},
        ]},
        {"t": "note", "kind": "warn", "b": "Defaults are not configuration",
         "x": "SU3 only changes what you see as a default; it changes no system data. A colleague logging in still sees empty fields, and real documents always use the value actually entered."},

        {"t": "h2", "x": "10. Help and tables: F1 / F4 and the keyboard inside ALV"},
        {"t": "table",
         "head": ["Action", "Key / operation", "What you get"],
         "rows": [
             ["Field documentation", "Put the cursor in the field and press **F1**", "Field meaning plus technical information (table, field name, parameter ID, data element)"],
             ["Value list (help)", "Put the cursor in the field and press **F4**", "The list of allowed values; you can also search within the list"],
             ["Table column choice", "Click the small arrow to the right of a column header", "Sort, filter, totals, column width, export to Excel"],
             ["Table cell", "In ALV press **F2** to switch to cell editing", "Multi-line text and long numbers without losing precision"],
             ["Export", "List → Spreadsheet / Local file", "ALV exports to xlsx / csv / text"],
             ["Favourites", "Menu → Favorites → Add to Favorites", "Pins frequently used T-codes to the left of the main screen"],
         ]},
        {"t": "note", "kind": "warn", "b": "Technical information in F1 is the master key",
         "x": "When an error says \"field XXX not maintained\", use F1 → Technical Information to confirm which table and which parameter ID the field belongs to, then check SU3 or SPRO. "
              "That single step turns a \"mysterious error\" into \"one configuration item is missing\"."},

        {"t": "h2", "x": "11. When a screen \"does nothing\", check these four things"},
        {"t": "ul", "cls": "fld", "items": [
            "**A dialog may be hidden behind the window**: SAP confirmation boxes sometimes open off-screen — check the taskbar or press Alt+F6 to bring it back.",
            "**Required fields are marked with a red underline**: SAP marks mandatory fields with a red frame or tick, not an asterisk; leave one empty and you will keep bouncing back.",
            "**You may have pressed the wrong button**: Enter ≠ Save; Back (F3) asks whether to save and choosing No loses everything.",
            "**Missing authorisation**: the message \"You are not authorised for XXX\" — run SU53 to see which authorisation object is missing, then ask Basis to grant it.",
        ]},
    ],
}
