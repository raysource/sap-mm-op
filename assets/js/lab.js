/* 引导式实操：17 个任务、自动判定、进度保存（中 / 英 / 日）
   判定直接读仿真器状态（iframe 同源），不靠学员自己打勾。 */
(function () {
  'use strict';
  const LANG = document.documentElement.dataset.ed || 'zh';
  const KEY = 'sapgui810.lab.tasks.v1';
  const SIMKEY = 'sapgui810.lab.sim.v1';
  const frame = document.getElementById('simframe');
  function t(o) { return (typeof o === 'string') ? o : (o[LANG] || o.zh); }
  function T(zh, en, ja) { return { zh: zh, en: en, ja: ja }; }
  const store = {
    get: function (k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ---------- 任务定义 ---------- */
  const PR = '10000001', PO = '4500000123';
  const TASKS = [
    /* ===== ① 登录与界面 ===== */
    { id: 't01', g: 'g1', tcode: 'LOGIN',
      title: T('登录：客户端 110 / MMUSER01', 'Log on: client 110 / MMUSER01', 'ログオン：110 / MMUSER01'),
      goal: T('在 SAP Logon 里双击「S4H [QAS] 110」，在登录对话框填客户端 110、用户 MMUSER01、口令任意、语言 ZH，点「登录」。状态栏出现「已登录」。',
        'In SAP Logon open S4H [QAS] 110 and log on with client 110, user MMUSER01, any password, language ZH.',
        'SAP Logon で「S4H [QAS] 110」を開き、クライアント 110／ユーザ MMUSER01／任意のパスワード／言語 ZH でログオンします。'),
      steps: [T('仿真器左侧是 SAP Logon 的连接列表，点「S4H [QAS] 110」', 'Click the S4H [QAS] 110 entry', '「S4H [QAS] 110」をクリック'),
        T('登录对话框：客户端 110、用户 MMUSER01、口令随便填、语言 ZH', 'Client 110, user MMUSER01, any password, ZH', 'クライアント 110／ユーザ MMUSER01／任意のパスワード／ZH'),
        T('点「登录」（或按 Enter）→ 进入 SAP Easy Access，状态栏绿色「已登录」', 'Press Log On → SAP Easy Access with a green message', '「ログオン」→ SAP Easy Access、緑のメッセージ'),
        T('注意菜单栏右端：S4H (1) 110 · ZH · OVR —— 8.10 把系统信息放在这里，不在状态栏', 'Note the system info at the right of the menu bar (8.10 moved it here)', 'メニューバー右端のシステム情報（8.10 でここへ移動）')],
      okMsg: T('已登录客户端 110 ✓', 'Logged on to client 110 ✓', 'クライアント 110 にログオン ✓'),
      check: function (db, st) { return !!(st.logged && st.session && st.session.client === '110'); },
      doc: 'gui.html' },

    { id: 't02', g: 'g1', tcode: 'MM03',
      title: T('命令字段 /nMM03 查物料 R-1002', 'Command field /nMM03, material R-1002', 'コマンドフィールド /nMM03'),
      goal: T('在命令字段输入 /nMM03 回车，再输入物料 R-1002 回车，读出描述、物料类型、评估类、标准价与库存。',
        'Type /nMM03, press Enter, then material R-1002 and read the data.', '/nMM03 → Enter、品目 R-1002 → Enter で内容を確認。'),
      steps: [T('命令字段输 /nMM03 回车（/n = 先结束当前事务）', 'Type /nMM03 and press Enter', '/nMM03 を入力して Enter'),
        T('物料填 R-1002，回车 → 画面显示各视图字段', 'Material R-1002, Enter', '品目 R-1002 → Enter'),
        T('核对：铝合金外壳 / ROH / 评估类 3000 / 180.00 USD / 库存 20 PC（0002）', 'Check: Aluminium Housing / ROH / 3000 / 180.00 / 20 PC', '確認：アルミ筐体／ROH／3000／180.00／在庫 20 PC'),
        T('按 F3 返回，再试 /n 单独输入（回主画面）', 'F3 back, then /n alone returns to the start screen', 'F3 で戻り、/n のみで初期画面へ')],
      okMsg: T('已用 /nMM03 读出 R-1002 ✓', 'R-1002 read via /nMM03 ✓', '/nMM03 で R-1002 を照会 ✓'),
      check: function (db, st) { return !!(st.seen && st.seen.MM03 && st.seen.MM03.mat === 'R-1002'); },
      doc: 'gui.html' },

    { id: 't03', g: 'g1', tcode: 'SU3',
      title: T('SU3 设个人参数（语言 / 工厂 / 公司代码）', 'SU3 personal parameters', 'SU3 ユーザパラメータ'),
      goal: T('用 SU3 把 LANG 设为 ZH、WRK 设为 1710、BUKRS 设为 1710 并保存——以后打开画面这些字段会自动带出来。',
        'Set LANG=ZH, WRK=1710, BUKRS=1710 in SU3 and save.', 'SU3 で LANG=ZH／WRK=1710／BUKRS=1710 を保存。'),
      steps: [T('命令字段 SU3 回车', 'SU3', 'SU3'),
        T('参数 LANG = ZH、WRK = 1710、BUKRS = 1710', 'LANG ZH, WRK 1710, BUKRS 1710', 'LANG ZH／WRK 1710／BUKRS 1710'),
        T('✓ 保存 → 状态栏「参数已保存」', '✓ → “Parameters saved”', '✓ → 「パラメータを保存しました」'),
        T('理解：SU3 只改你自己的默认值，不改系统配置', 'SU3 changes your defaults only', 'SU3 は個人の初期値のみ')],
      okMsg: T('个人参数已保存 ✓', 'Personal parameters saved ✓', 'ユーザパラメータを保存 ✓'),
      check: function (db) { return !!(db.cfg.user && db.cfg.user.WRK === '1710' && db.cfg.user.BUKRS === '1710'); },
      doc: 'gui.html' },

    /* ===== ② 主数据 ===== */
    { id: 't04', g: 'g2', tcode: 'MM01',
      title: T('MM01 新建物料 R-1001', 'Create material R-1001', '品目 R-1001 の登録'),
      goal: T('建「钢制支架」：ROH、PC、采购组 001、MRP 类型 PD、批量 EX、安全库存 20、工厂 1710 / 0001、评估类 3000、标准价 720.00 USD，五个视图全要。',
        'Create Steel Bracket: ROH, PC, group 001, MRP PD/EX, safety 20, plant 1710/0001, val. class 3000, 720.00 USD, all five views.',
        '「鋼製ブラケット」：ROH／PC／001／PD・EX／安全在庫 20／1710・0001／評価クラス 3000／720.00 USD、5 ビュー。'),
      steps: [T('MM01 回车 → 物料 R-1001、行业 M、类型 ROH → 回车', 'MM01 → R-1001 / M / ROH → Enter', 'MM01 → R-1001／M／ROH → Enter'),
        T('「选择视图」对话框：5 个视图全勾，点「确定」', 'Tick all five views, Continue', '5 ビューすべてチェック→続行'),
        T('描述：钢制支架；基本单位 PC；物料组 00101', 'Steel Bracket, PC, group 00101', '鋼製ブラケット／PC／00101'),
        T('采购组 001；MRP 类型 PD、批量 EX、安全库存 20', 'Group 001, MRP PD, lot EX, safety 20', 'グループ 001／PD／EX／安全在庫 20'),
        T('工厂 1710、地点 0001；评估类 3000、价格控制 S、标准价 720.00', 'Plant 1710 / 0001; 3000, S, 720.00', 'プラント 1710／0001；3000／S／720.00'),
        T('点工具栏 ✓ → 「物料 R-1001 已创建」', 'Press ✓ → “Material R-1001 has been created”', '✓ → 「品目 R-1001 を作成しました」')],
      okMsg: T('物料 R-1001 已建，五视图齐全 ✓', 'R-1001 created with five views ✓', 'R-1001 を 5 ビューで登録 ✓'),
      check: function (db) {
        const m = db.materials['R-1001'];
        return !!(m && m.stdPrice === 720 && m.plant === '1710' && (m.views || []).length >= 5);
      },
      doc: 'master.html' },

    { id: 't05', g: 'g2', tcode: 'BP',
      title: T('BP 新建供应商 100123', 'Create vendor 100123', '仕入先 100123 の登録'),
      goal: T('建供应商 100123「Palo Alto Components Inc.」，采购组织 1710、货币 USD、付款条件 0001、对账科目 160000。',
        'Create vendor 100123 with org 1710, USD, terms 0001, recon 160000.', '仕入先 100123：購買組織 1710／USD／0001／160000。'),
      steps: [T('命令字段 BP 回车 → 业务伙伴 100123（分组 BP01）、角色 FLVN01 → 回车', 'BP → business partner 100123 (grouping BP01), role FLVN01 → Enter', 'BP → ビジネスパートナ 100123（BP01）、ロール FLVN01 → Enter'),
        T('角色对话框：FLVN00 与 FLVN01 都勾选 → 确定', 'Role dialog: tick FLVN00 and FLVN01 → Continue', 'ロール選択：FLVN00 と FLVN01 をチェック → 続行'),
        T('「地址」页签：名称 1 = Palo Alto Components Inc.、城市、国家 US', 'Address tab: Name 1, city, country US', '「住所」タブ：名称 1／市／国 US'),
        T('「公司代码」页签：公司代码 1710、对账科目 160000、付款条件 0001', 'Company code tab: 1710 / 160000 / 0001', '「会社コード」タブ：1710／160000／0001'),
        T('「采购组织」页签：采购组织 1710、采购组 001、订单货币 USD', 'Purchasing tab: org 1710, group 001, USD', '「購買」タブ：1710／001／USD'),
        T('✓ 保存 → 「供应商 100123 已创建」', '✓ → “Vendor 100123 has been created”', '✓ → 「仕入先 100123 を作成しました」')],
      okMsg: T('供应商 100123 已建（采购组织 1710）✓', 'Vendor 100123 created ✓', '仕入先 100123 を登録 ✓'),
      check: function (db) { const v = db.vendors['100123']; return !!(v && v.orgs && v.orgs['1710']); },
      doc: 'master.html' },

    { id: 't06', g: 'g2', tcode: 'ME11',
      title: T('ME11 建信息记录（净价 720.00）', 'Info record at 720.00', '情報レコード 720.00'),
      goal: T('为 100123 / R-1001 / 1710 建信息记录：净价 720.00 USD、价格单位 1、计划交货 5 天。PO 的净价从这里带出。',
        'Create the info record 100123 / R-1001 / 1710 at 720.00 USD.', '100123／R-1001／1710 の情報レコードを 720.00 USD で登録。'),
      steps: [T('ME11 回车', 'ME11', 'ME11'),
        T('供应商 100123、物料 R-1001、采购组织 1710', '100123 / R-1001 / 1710', '100123／R-1001／1710'),
        T('净价 720.00、USD、价格单位 1、交货 5 天', 'Net 720.00, USD, unit 1, 5 days', '正味 720.00／USD／単位 1／5 日'),
        T('✓ 保存 → 记录号 5300000123', '✓ → record 5300000123', '✓ → 5300000123')],
      okMsg: T('信息记录 720.00 已建 ✓', 'Info record 720.00 created ✓', '情報レコード 720.00 を登録 ✓'),
      check: function (db) { const r = db.inforecs['100123/R-1001/1710']; return !!(r && r.price === 720); },
      doc: 'master.html' },

    { id: 't07', g: 'g2', tcode: 'MM02',
      title: T('MM02 勾上「自动采购单」（为无 PO 收货准备）', 'MM02: switch on automatic PO', 'MM02：自動発注を ON'),
      goal: T('用 MM02 打开 R-1002，在采购视图把「自动采购单」勾上并保存。这是「无 PO 收货自动建单」四个开关中的物料层那个。',
        'In MM02 open R-1002 and tick “Automatic PO” in the purchasing view.', 'MM02 で R-1002 の購買ビューの「自動発注」を ON にします。'),
      steps: [T('MM02 回车 → 物料 R-1002 → 回车', 'MM02 → R-1002 → Enter', 'MM02 → R-1002 → Enter'),
        T('在「采购」页签找「自动采购单」，点下方「切换勾选」变成 ☑', 'Toggle “Automatic PO” to ☑', '「自動発注」を ☑ に切替'),
        T('✓ 保存 → 状态栏「自动采购单 = 已勾选」', '✓ → “Automatic PO = on”', '✓ → 「自動発注 = ON」')],
      okMsg: T('R-1002 已允许自动采购 ✓', 'R-1002 automatic PO on ✓', 'R-1002 自動発注 ON ✓'),
      check: function (db) { const m = db.materials['R-1002']; return !!(m && m.autoPO === true); },
      doc: 'nopo.html' },

    /* ===== ③ 采购到付款 ===== */
    { id: 't08', g: 'g3', tcode: 'ME51N',
      title: T('ME51N 建采购申请 300 PC', 'Requisition 300 PC', '購買依頼 300 PC'),
      goal: T('为 R-1001 建申请：300 PC、交货 2026-11-20、工厂 1710 / 地点 0001，类型 NB、组织 1710、组 001。',
        'Requisition for R-1001: 300 PC, 2026-11-20, plant 1710 / 0001.', 'R-1001：300 PC、2026-11-20、1710／0001。'),
      steps: [T('ME51N 回车', 'ME51N', 'ME51N'),
        T('凭证类型 NB、采购组织 1710、采购组 001', 'NB / 1710 / 001', 'NB／1710／001'),
        T('物料 R-1001、数量 300、交货 2026-11-20、工厂 1710、地点 0001', 'R-1001, 300, 2026-11-20, 1710, 0001', 'R-1001／300／2026-11-20／1710／0001'),
        T('科目分配类别留空；✓ 保存 → 申请 10000001', 'Leave assignment blank; ✓ → 10000001', '勘定割当は空欄。✓ → 10000001')],
      okMsg: T('采购申请 300 PC 已建 ✓', 'Requisition created ✓', '購買依頼を登録 ✓'),
      check: function (db) { return Object.keys(db.prs).some(function (k) { const p = db.prs[k]; return p.mat === 'R-1001' && p.qty === 300; }); },
      doc: 'flow.html' },

    { id: 't09', g: 'g3', tcode: 'ME21N',
      title: T('ME21N 参照申请转订单（216,000.00）', 'Convert to PO (216,000.00)', '発注へ変換（216,000.00）'),
      goal: T('ME21N 里参照申请 ' + PR + ' 带出数据，供应商 100123，保存得订单 ' + PO + '；净价 720.00 来自信息记录，净额 216,000.00 USD。',
        'Reference requisition ' + PR + ' in ME21N with vendor 100123 → PO ' + PO + ' at 216,000.00 USD.',
        'ME21N で購買依頼 ' + PR + ' を参照、仕入先 100123 → 発注 ' + PO + '、216,000.00 USD。'),
      steps: [T('ME21N：供应商 100123、类型 NB、组织 1710、组 001', 'ME21N: 100123 / NB / 1710 / 001', 'ME21N：100123／NB／1710／001'),
        T('参照采购申请填 ' + PR + '，回车 → 物料与数量自动带出', 'Reference ' + PR + ' + Enter', '参照 ' + PR + ' → Enter'),
        T('看「基于收货的 IV」= 是（来自信息记录）；净价 720.00 只读', '“GR-based IV” = Yes (from info record)', '「入庫ベース IV」= はい'),
        T('✓ 保存 → 订单 ' + PO + '，净额 216,000.00 USD', '✓ → ' + PO + ', 216,000.00 USD', '✓ → ' + PO + '、216,000.00 USD')],
      okMsg: T('订单 ' + PO + ' 已建且参照申请 ✓', 'PO created with reference ✓', 'PO を参照付きで登録 ✓'),
      check: function (db) { return Object.keys(db.pos).some(function (k) { const p = db.pos[k]; return p.qty === 300 && p.pr; }); },
      doc: 'flow.html' },

    { id: 't10', g: 'g3', tcode: 'MIGO',
      title: T('MIGO 收货 101（300 PC）', 'Goods receipt 101', '入庫 101'),
      goal: T('参照订单收货 300 PC、移动类型 101、日期 2026-11-10、地点 0001。得到物料凭证与会计凭证：库存 Dr 216,000 / GR/IR Cr 216,000。',
        'GR 300 PC with movement 101: inventory Dr 216,000 / GR/IR Cr 216,000.', '101 で 300 PC 入庫：在庫 Dr／GR/IR Cr 216,000。'),
      steps: [T('MIGO 回车；操作 A01 收货、参考 A 采购订单', 'MIGO: A01 / A Purchase order', 'MIGO：A01／A 購買発注'),
        T('采购订单填 ' + PO + '，回车 → 带出物料、仍要交货 300', 'PO ' + PO + ' + Enter', 'PO ' + PO + ' → Enter'),
        T('数量 300、过账日期 2026-11-10、库存地点 0001', 'Qty 300, date 2026-11-10, SLoc 0001', '数量 300／日付 2026-11-10／0001'),
        T('✓ 过账 → 物料凭证 4900000001 + 会计凭证 5100000001', '✓ → mat doc 4900000001 + acct 5100000001', '✓ → 4900000001／5100000001')],
      okMsg: T('收货 300 PC 已过账 ✓', 'GR 300 PC posted ✓', '入庫 300 PC を転記 ✓'),
      check: function (db) { return db.matdocs.some(function (d) { return d.type === '101' && d.mat === 'R-1001' && d.qty === 300; }); },
      doc: 'flow.html' },

    { id: 't11', g: 'g3', tcode: 'MIRO',
      title: T('MIRO 无差异发票（216,000.00）', 'Invoice with no variance', '差異なしの請求書'),
      goal: T('参照 ' + PO + ' 开票：300 PC / 216,000.00 USD、税码 V0，过账后 GR/IR 归零、应付增加。',
        'Invoice ' + PO + ': 300 PC / 216,000.00 USD, tax V0. GR/IR clears.', PO + ' を 216,000.00 USD で請求。'),
      steps: [T('MIRO 回车；供应商 100123、采购订单 ' + PO + '、金额 216,000.00', 'MIRO: 100123 / ' + PO + ' / 216,000.00', 'MIRO：100123／' + PO + '／216,000.00'),
        T('回车 → 行项目带出（基于收货的 IV = 是，所以必须先收货）', 'Enter — items come from the GR', 'Enter — 入庫済の明細が展開'),
        T('税码 V0；状态栏差额 0.00', 'Tax V0; difference 0.00', '税コード V0、差額 0.00'),
        T('✓ 过账 → 发票 5105600001，MIR4 可查', '✓ → invoice 5105600001', '✓ → 5105600001')],
      okMsg: T('发票已过账，GR/IR 结清 ✓', 'Invoice posted, GR/IR cleared ✓', '請求書を転記、GR/IR 消込 ✓'),
      check: function (db) {
        return Object.keys(db.invoices).some(function (k) {
          const i = db.invoices[k];
          return i.posted && !i.blocked && Math.abs(i.diff || 0) < 0.01 && i.amount >= 216000;
        });
      },
      doc: 'flow.html' },

    { id: 't12', g: 'g3', tcode: 'F-53',
      title: T('F-53 付款并清账', 'Pay and clear in F-53', 'F-53 で支払・消込'),
      goal: T('给供应商 100123 付款 216,000.00 USD：银行科目 100000，保存后应付减少、发票变已清账。',
        'Pay vendor 100123 216,000.00 USD from bank 100000.', '仕入先 100123 へ 216,000.00 USD を支払（銀行 100000）。'),
      steps: [T('F-53 回车；供应商 100123', 'F-53: vendor 100123', 'F-53：仕入先 100123'),
        T('金额 216,000.00、银行科目 100000、凭证日期 2026-11-17', '216,000.00, bank 100000, 2026-11-17', '216,000.00／100000／2026-11-17'),
        T('✓ 保存 → 「付款已过账并清账」', '✓ → “Payment posted and cleared”', '✓ → 「支払を転記し消込」'),
        T('回 ME23N 看订单历史：创建 / 收货 / 发票 / 付款 四条都在', 'ME23N history shows all four records', 'ME23N 履歴に 4 件そろう')],
      okMsg: T('付款完成，一单闭环 ✓', 'Payment posted — cycle closed ✓', '支払完了、サイクル閉じる ✓'),
      check: function (db) { return (db.payments || []).length > 0; },
      doc: 'flow.html' },

    /* ===== ④ 无 PO 收货 ===== */
    { id: 't13', g: 'g4', tcode: 'OMJJ',
      title: T('OMJJ：101 勾上「自动产生的采购订单」', 'OMJJ: automatic PO for 101', 'OMJJ：101 の自動発注'),
      goal: T('在移动类型定制里把 101 的「自动产生的采购订单」打开并保存——这是无 PO 收货能自动建单的第一层开关（配置层）。',
        'Turn on “automatic PO” for movement type 101 in customizing.', '移動タイプ 101 の「自動購買発注」を ON。'),
      steps: [T('命令字段 OMJJ 回车', 'OMJJ', 'OMJJ'),
        T('找到 101 行，点「自动产生的采购订单」列的勾选框', 'Click the checkbox in the 101 row', '101 行のチェックボックスをクリック'),
        T('✓ 保存 → 「表 161 已保存：101 自动建 PO = 开」', '✓ → “Table 161 saved … on”', '✓ → 「テーブル 161 を保存 … ON」'),
        T('理解分层：移动类型（配置）→ 物料（MM02）→ 供应商（BP）→ 货源清单（ME01）', 'Layers: mvt type → material → vendor → source list', '階層：移動タイプ→品目→仕入先→供給元一覧')],
      okMsg: T('101 自动建单已开启 ✓', 'Automatic PO for 101 enabled ✓', '101 の自動発注 ON ✓'),
      check: function (db) { return !!(db.cfg && db.cfg.autoPOmvt === true); },
      doc: 'nopo.html' },

    { id: 't14', g: 'g4', tcode: 'MB01',
      title: T('MB01 无 PO 收货 50 PC（自动建单）', 'GR without PO — 50 PC', 'PO なし入庫 50 PC'),
      goal: T('先把供应商 100124 的自动采购打开、用 ME01 建货源清单、用 ME11 建 100124 / R-1002 / 1710 的信息记录（180.00），再用 MB01 收 50 PC、采购订单留空 → 系统自动生成 PO。',
        'Enable automatic PO for vendor 100124, add it to the source list (ME01), create info record 100124/R-1002/1710 at 180.00, then MB01 50 PC with the PO field blank → automatic PO.',
        '仕入先 100124 の自動発注を ON、ME01 で供給元一覧、ME11 で 100124／R-1002／1710（180.00）、そして MB01 で 50 PC・PO 空欄 → 自動発注。'),
      steps: [T('BP：初始屏输入 100124 回车（已存在→更改模式）→「采购组织」页签勾「自动产生的采购订单」→ ✓ 保存', 'BP: enter 100124 (change mode) → purchasing tab → tick “automatic PO” → ✓', 'BP：100124 を入力（変更モード）→「購買」タブで「自動発注」→ ✓'),
        T('ME01：物料 R-1002、工厂 1710、供应商 100124，✓ 保存', 'ME01: R-1002 / 1710 / 100124, save', 'ME01：R-1002／1710／100124 を保存'),
        T('ME11：100124 / R-1002 / 1710，净价 180.00，✓ 保存', 'ME11: 100124 / R-1002 / 1710 @ 180.00', 'ME11：100124／R-1002／1710 @180.00'),
        T('MB01：移动类型 101、日期 2026-11-20、**采购订单留空**、物料 R-1002、工厂 1710、地点 0002、数量 50、供应商 100124', 'MB01: 101, 2026-11-20, PO blank, R-1002, 1710, 0002, 50, 100124', 'MB01：101／2026-11-20／PO 空欄／R-1002／1710／0002／50／100124'),
        T('✓ 过账 → 状态栏同时出现物料凭证号与「采购订单 … 已自动创建」', '✓ → material doc + “PO created automatically”', '✓ → 品目伝票＋「自動登録」'),
        T('用 ME23N 打开自动生成的 PO，核对 50 PC × 180.00 = 9,000.00', 'Check the PO in ME23N: 50 × 180.00 = 9,000.00', 'ME23N で 50 × 180.00 = 9,000.00 を確認')],
      okMsg: T('无 PO 收货成功，自动生成了采购订单 ✓', 'GR without PO created a PO automatically ✓', 'PO なし入庫で自動発注 ✓'),
      check: function (db) {
        const auto = Object.keys(db.pos).some(function (k) { return db.pos[k].auto === true; });
        const gr = db.matdocs.some(function (d) { return d.type === '101' && d.mat === 'R-1002' && d.qty === 50; });
        return auto && gr;
      },
      doc: 'nopo.html' },

    /* ===== ⑤ 发票差异与 GR/IR ===== */
    { id: 't15', g: 'g5', tcode: 'MIRO',
      title: T('差异发票：217,200（+0.56%）容差内', 'Variance within tolerance', '許容内の差異請求書'),
      goal: T('新建一张 300 PC 的订单并收货，然后用 MIRO 开 217,200.00 的发票（差 1,200.00 / 0.56%，PP 容差 1% 内）：应该过账成功，差额记价格差异科目。',
        'Create another PO, receive it, then invoice 217,200.00 (+0.56 %): it posts, the difference goes to the price-difference account.',
        '別の PO を 300 PC で作成・入庫し、217,200.00 で請求（+0.56 %）：転記され、差額は価格差異へ。'),
      steps: [T('ME21N 新建订单：100123 / R-1001 / 300 PC / 交货 2026-11-25（不参照申请）', 'ME21N: 100123 / R-1001 / 300 PC', 'ME21N：100123／R-1001／300 PC'),
        T('MIGO 对该订单收货 101 / 300 PC / 日期 2026-11-12', 'MIGO 101 for that PO, 300 PC', 'MIGO で 101 入庫 300 PC'),
        T('MIRO 参照该订单，金额**手改成 217,200.00**，税码 V0', 'MIRO: change the amount to 217,200.00', 'MIRO：金額を 217,200.00 に変更'),
        T('✓ 过账 → 状态栏「差异 1,200.00 在容差内，记入价格差异 660100」', '✓ → variance within tolerance', '✓ → 許容内で価格差異へ')],
      okMsg: T('差异发票在容差内过账成功 ✓', 'Variance invoice posted within tolerance ✓', '許容内の差異請求書を転記 ✓'),
      check: function (db) {
        return Object.keys(db.invoices).some(function (k) {
          const i = db.invoices[k];
          return Math.abs((i.diff || 0) - 1200) < 1 && !i.blocked;
        });
      },
      doc: 'grir.html' },

    { id: 't16', g: 'g5', tcode: 'MRBR',
      title: T('超额发票：冻结 → MRBR 释放', 'Over-tolerance invoice → MRBR', '許容超過 → MRBR で解除'),
      goal: T('再建一张 300 PC 订单并收货，MIRO 开 226,800.00（+5%）的发票：超过 PP 容差 1%，发票过账但**付款被冻结**（M8083）；到 MRBR 释放后再付款。',
        'Another PO, GR, then invoice 226,800.00 (+5 %): posted but blocked (M8083). Release it in MRBR.',
        'さらに PO を作成・入庫し、226,800.00（+5 %）で請求：転記されるがブロック（M8083）。MRBR で解除。'),
      steps: [T('ME21N 再建一张：100123 / R-1001 / 300 PC', 'ME21N: another 300 PC PO', 'ME21N：もう 1 件 300 PC'),
        T('MIGO 101 收货 300 PC（日期 2026-11-15）', 'MIGO 101, 300 PC', 'MIGO 101、300 PC'),
        T('MIRO 金额改 226,800.00 → ✓ 过账，状态栏黄色「已过账但被冻结：… M8083」', 'MIRO 226,800.00 → posted but blocked', 'MIRO 226,800.00 → 転記＋ブロック'),
        T('到 MRBR 找到这张冻结发票，点「解冻」→ 状态栏「已解冻」', 'MRBR → Release', 'MRBR → 解除'),
        T('回 F-53 付款，或 MIR4 查看冻结原因已消失', 'Pay in F-53 / check in MIR4', 'F-53 で支払、MIR4 で確認')],
      okMsg: T('冻结 → 释放流程走通 ✓', 'Blocked → released ✓', 'ブロック → 解除 ✓'),
      check: function (db) {
        return Object.keys(db.invoices).some(function (k) {
          const i = db.invoices[k];
          return (i.diff || 0) > 5000 && i.released === true;
        });
      },
      doc: 'grir.html' },
    { id: 't17', g: 'g5', tcode: 'MMPV',
      title: T('MMPV 结转物料期间，验证「过账被拦」', 'MMPV: close the period', 'MMPV：期間繰越'),
      goal: T('把物料期间从 2026-11 结转到 2026-12，然后用 11 月的日期再收一次货——应该被拦下（M7021），这就是月末封账的典型症状。',
        'Close the material period to 2026-12, then try a GR with a November date — it must be rejected (M7021).',
        '品目期間を 2026-12 へ繰越し、11 月の日付で入庫 → M7021 で拒否されることを確認。'),
      steps: [T('MMPV 回车；「结转到」填 2026-12', 'MMPV: close to 2026-12', 'MMPV：「繰越先」2026-12'),
        T('点「执行结转」→ 确认对话框点「结转」', 'Press Close → confirm', '「繰越実行」→ 確認'),
        T('MB01 用日期 2026-11-30 收 R-1003 → 状态栏报「物料期间 2026-11 未打开（M7021）」', 'MB01 with 2026-11-30 → M7021', 'MB01 で 2026-11-30 → M7021'),
        T('把日期改成 2026-12-01 就能过账——凭证日期决定期间', 'Change to 2026-12-01 and it posts', '2026-12-01 なら転記可')],
      okMsg: T('期间结转完成，并验证了拦截 ✓', 'Period closed and blocking verified ✓', '期間繰越とブロックを確認 ✓'),
      check: function (db) { return db.cfg.period > '2026-11'; },
      doc: 'nopo.html' },
  ];

  const GROUPS = [
    { id: 'g1', name: T('① 登录与界面', '1 · Log on & GUI', '① ログオンと画面') },
    { id: 'g2', name: T('② 主数据', '2 · Master data', '② マスタ') },
    { id: 'g3', name: T('③ 采购到付款五步', '3 · Procure to pay', '③ 購買から支払') },
    { id: 'g4', name: T('④ 无 PO 收货与期间', '4 · GR without PO & period', '④ PO なし入庫と期間') },
    { id: 'g5', name: T('⑤ 差异发票、解冻与月结', '5 · Variance, release & period close', '⑤ 差異請求書・解除・月次') }
  ];

  const TXT = {
    zh: { progress: '已完成', tasks: '任务清单', coach: '本任务', goal: '目标', steps: '在仿真器里这样做',
      verify: '系统怎么判定你已完成', open: '在仿真器里打开', prev: '上一个', next: '下一个',
      reset: '清空勾选', resetData: '重置演练数据', sim: 'SAP GUI 8.10 仿真器（真实输入：登录、命令字段、字段、✓ 保存）',
      doc: '看对应章节', done: '已完成', tip: '提示：判定读的是仿真器里的真实数据，不是点按钮。',
      keys: '键盘：Enter / F8 回车检查 · Ctrl+S 保存 · F3 返回 · Esc 关对话框（Tab 换字段）',
      xls: '⤓ 下载 Excel 练习记录表',
      confirmReset: '清空所有任务勾选？（演练数据不受影响）', frame: '如仿真器没显示，点这里在新窗口打开' },
    en: { progress: 'done', tasks: 'Tasks', coach: 'Current task', goal: 'Goal', steps: 'Do this in the simulator',
      verify: 'How completion is detected', open: 'Open in simulator', prev: 'Previous', next: 'Next',
      reset: 'Clear ticks', resetData: 'Reset exercise data', sim: 'SAP GUI 8.10 simulator (real typing: logon, command field, fields, ✓)',
      doc: 'Read the chapter', done: 'done', tip: 'Completion is detected from real simulator data, not from clicking a button.',
      keys: 'Keys: Enter / F8 check · Ctrl+S save · F3 back · Esc close dialog (Tab moves between fields)',
      xls: '⤓ Download the Excel practice log',
      confirmReset: 'Clear all task ticks? (exercise data stays)', frame: 'If the simulator is blank, open it in a new window' },
    ja: { progress: '完了', tasks: 'タスク', coach: '現在のタスク', goal: '目的', steps: 'シミュレータでの操作',
      verify: '完了の判定方法', open: 'シミュレータで開く', prev: '前へ', next: '次へ',
      reset: 'チェックを消す', resetData: '演習データを初期化', sim: 'SAP GUI 8.10 シミュレータ（実際に入力：ログオン・コマンドフィールド・項目・✓）',
      doc: '該当章を読む', done: '完了', tip: '判定はシミュレータの実データで行います。',
      keys: 'キー：Enter / F8 チェック · Ctrl+S 保存 · F3 戻る · Esc ダイアログを閉じる（Tab で項目移動）',
      xls: '⤓ Excel 演習記録表をダウンロード',
      confirmReset: '全タスクのチェックを消しますか？（演習データは保持）', frame: '表示されない場合は新しいウィンドウで開いてください' }
  };
  const X = TXT[LANG] || TXT.zh;

  const done = store.get(KEY, {});
  let current = null;
  const bReset = document.getElementById('btnReset');
  const bResetData = document.getElementById('btnResetData');
  if (bReset) bReset.textContent = X.reset;
  if (bResetData) bResetData.textContent = X.resetData;

  /* ---------- 渲染 ---------- */
  const listEl = document.getElementById('tasklist');
  function renderList() {
    let html = '';
    GROUPS.forEach(function (g) {
      const items = TASKS.filter(function (k) { return k.g === g.id; });
      html += '<div class="lg-head">' + t(g.name) + '</div>';
      items.forEach(function (k) {
        html += '<button class="ltask' + (done[k.id] ? ' done' : '') + (current === k.id ? ' on' : '') +
          '" data-id="' + k.id + '"><span class="lbox">' + (done[k.id] ? '✓' : '') + '</span>' +
          '<span class="ltxt"><b>' + t(k.title) + '</b><i>' + k.tcode + '</i></span></button>';
      });
    });
    listEl.innerHTML = html;
    listEl.querySelectorAll('.ltask').forEach(function (b) {
      b.addEventListener('click', function () { current = b.dataset.id; render(); });
    });
    const n = TASKS.filter(function (k) { return done[k.id]; }).length;
    document.getElementById('labProg').textContent = n + ' / ' + TASKS.length + ' ' + X.progress;
    document.getElementById('labBar').style.width = (n / TASKS.length * 100) + '%';
  }

  function renderCoach() {
    const allDone = TASKS.every(function (k) { return done[k.id]; });
    if (allDone) {
      const box0 = document.getElementById('coach');
      box0.innerHTML = '<div class="ctop"><span class="ceye">' + X.coach + '</span></div>' +
        '<h3>' + (LANG === 'ja' ? '全 17 タスク完了' : LANG === 'en' ? 'All 17 tasks complete' : '17 个任务全部完成') + '</h3>' +
        '<p class="cgoal">' + (LANG === 'ja'
          ? 'ログオンから 購買依頼 → 発注 → 入庫 → 請求書照合 → 支払、PO なし入庫、期間繰越、差異請求書まで実データで通りました。'
          : LANG === 'en'
            ? 'From logon through requisition → PO → GR → invoice → payment, plus GR without PO, period close and invoice variances — all on real data.'
            : '从登录开始，申请 → 订单 → 收货 → 发票 → 付款，再到无 PO 收货、期间结转、差异发票与解冻，全部用真实数据跑通了。') + '</p>' +
        '<div class="crow"><a class="gbtn primary" href="grir.html">' + (LANG === 'ja' ? 'GR と IR を読む' : LANG === 'en' ? 'Read GR & IR' : '去读 GR 与 IR') + '</a>' +
        '<a class="gbtn" href="checklist.html">' + (LANG === 'ja' ? 'チェックリスト' : LANG === 'en' ? 'Checklist' : '验收清单') + '</a></div>' +
        '<div class="crow"><a class="gbtn" href="' + (LANG === 'zh' ? '' : '../') + 'downloads/GUI810-practice-log.xlsx" download>' + X.xls + '</a>' +
        '<button class="gbtn" onclick="Lab.resetData()">' + X.resetData + '</button></div>' +
        '<p class="ctip">' + X.tip + '</p><p class="ctip ckeys">' + X.keys + '</p>';
      return;
    }
    const k = TASKS.filter(function (x) { return x.id === current; })[0] || TASKS[0];
    const i = TASKS.indexOf(k);
    const box = document.getElementById('coach');
    box.innerHTML =
      '<div class="ctop"><span class="ceye">' + X.coach + ' ' + (i + 1) + '/' + TASKS.length + '</span>' +
      '<span class="ctcode">' + k.tcode + '</span></div>' +
      '<h3>' + t(k.title) + '</h3>' +
      '<p class="cgoal">' + t(k.goal) + '</p>' +
      '<div class="clabel">' + X.steps + '</div>' +
      '<ol class="steps">' + k.steps.map(function (s) { return '<li>' + t(s) + '</li>'; }).join('') + '</ol>' +
      '<div class="clabel">' + X.verify + '</div>' +
      '<p class="cverify">' + (done[k.id] ? '✓ ' + t(k.okMsg) : '· ' + t(k.okMsg)) + '</p>' +
      '<div class="crow">' +
      '<button class="gbtn primary" onclick="Lab.open(\'' + k.tcode + '\')">' + X.open + ' ' + k.tcode + '</button>' +
      '<a class="gbtn" href="' + k.doc + '">' + X.doc + '</a>' +
      '</div>' +
      '<div class="crow"><button class="gbtn" onclick="Lab.prev()">‹ ' + X.prev + '</button>' +
      '<button class="gbtn" onclick="Lab.next()">' + X.next + ' ›</button></div>' +
      '<p class="ctip">' + X.tip + '</p><p class="ctip ckeys">' + X.keys + '</p>';
  }

  function render() {
    renderList();
    renderCoach();
  }

  /* ---------- 判定 ---------- */
  function simWin() { try { return frame.contentWindow; } catch (e) { return null; } }
  function checkAll() {
    const w = simWin();
    if (!w || !w.S || !w.S.db()) return;
    let db, st;
    try { db = w.S.db(); st = w.S.state; } catch (e) { return; }
    if (!db) return;
    let changed = false;
    TASKS.forEach(function (k) {
      if (done[k.id]) return;
      let ok = false;
      try { ok = !!(k.check(db, st, w)); } catch (e) { ok = false; }
      if (ok) { done[k.id] = true; changed = true; }
    });
    if (changed) {
      store.set(KEY, done);
      const firstUndone = TASKS.filter(function (k) { return !done[k.id]; })[0];
      current = firstUndone ? firstUndone.id : current;
      render();
    }
  }

  const LabApi = window.Lab = {
    open: function (tcode) {
      const w = simWin();
      if (w && w.SIM) { w.focus(); try { w.SIM.go(tcode); } catch (e) {} }
    },
    next: function () {
      const i = TASKS.findIndex(function (k) { return k.id === current; });
      if (i >= 0 && i < TASKS.length - 1) { current = TASKS[i + 1].id; render(); }
    },
    prev: function () {
      const i = TASKS.findIndex(function (k) { return k.id === current; });
      if (i > 0) { current = TASKS[i - 1].id; render(); }
    },
    reset: function () {
      if (!confirm(X.confirmReset)) return;
      store.set(KEY, {});
      TASKS.forEach(function (k) { delete done[k.id]; });
      current = TASKS[0].id;
      render();
    },
    resetData: function () {
      const w = simWin();
      try {
        if (w && w.localStorage) { w.localStorage.removeItem(SIMKEY); }
        frame.src = frame.src.split('#')[0];
      } catch (e) { frame.src = frame.src; }
    }
  };

  LabApi.__tasks = TASKS;
  LabApi.__done = function () { return done; };

  frame.addEventListener('load', function () {
    const w = simWin();
    try {
      w.onSimChange = function () { setTimeout(checkAll, 60); };
    } catch (e) {}
    setTimeout(checkAll, 300);
  });

  /* 首屏：从第一个未完成任务开始 */
  current = (TASKS.filter(function (k) { return !done[k.id]; })[0] || TASKS[0]).id;
  render();
  setInterval(checkAll, 1200);
  document.getElementById('btnReset').addEventListener('click', window.Lab.reset);
  document.getElementById('btnResetData').addEventListener('click', window.Lab.resetData);
})();
