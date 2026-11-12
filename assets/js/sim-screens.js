/* SAP MM 引导实操仿真器 · 画面层
   覆盖：SMENU MM01 MM03 BP ME11 ME51N ME21N ME23N MIGO MIRO MIR4 MRBR MB5S MB1B MMBE MD04 FB03 F-53
   约定：金额自洽（R-1001 净价 720.00 USD，PR/PO 300 PC，GR=IR=216,000.00） */
(function () {
  'use strict';
  const F = S.fld, B = S.box, TB = S.tabs, TBL = S.table;
  const st = S.state;

  function head(title, tcode) { return { tcode: tcode, title: title }; }
  // 直接返回当前语言字符串：这样拼在消息里不会出现 [object Object]
  function tr(zh, en, ja) { return S.t(S.L(zh, en, ja)); }
  function refresh(tcode) { st.screen = S.screens[tcode.toUpperCase()](); }
  function plantStock(mat, plant) {
    const db = S.db();
    let n = 0;
    Object.keys(db.stock).forEach(function (k) {
      const p = k.split('/');
      if (p[0] === mat && p[1] === plant) n += db.stock[k].unrestricted || 0;
    });
    return n;
  }
  function money(n) { return S.fmt(n); }

  /* ============ 首页 ============ */
  S.screens.SMENU = function () {
    const rows = [
      ['MM01', tr('物料主数据 · 创建', 'Create material', '品目マスタの登録')],
      ['MM03', tr('物料主数据 · 显示', 'Display material', '品目マスタの照会')],
      ['BP', tr('供应商 · 创建', 'Create vendor', '仕入先の登録')],
      ['ME11', tr('采购信息记录', 'Purchasing info record', '購買情報レコード')],
      ['ME51N', tr('采购申请', 'Purchase requisition', '購買依頼')],
      ['ME21N', tr('采购订单', 'Purchase order', '購買発注')],
      ['ME23N', tr('采购订单 · 显示与历史', 'Display PO / history', '購買発注の照会・履歴')],
      ['MIGO', tr('收货 / 退货 / 无 PO 收货', 'Goods receipt / return', '入庫・返品・PO なし入庫')],
      ['MIRO', tr('发票校验', 'Invoice verification', '請求書照合')],
      ['MIR4', tr('显示发票', 'Display invoice', '請求書の照会')],
      ['MRBR', tr('释放冻结发票', 'Release blocked invoice', 'ブロック請求書の解除')],
      ['MB5S', tr('GR/IR 余额清单', 'GR/IR balance', 'GR/IR 残高一覧')],
      ['MB1B', tr('转储 / 发货过账', 'Transfer / issue', '転送・払出')],
      ['MMBE', tr('库存总览', 'Stock overview', '在庫概要')],
      ['MD04', tr('库存需求清单', 'Stock/requirements', '在庫所要量一覧')],
      ['FB03', tr('显示会计凭证', 'Display accounting document', '会計伝票の照会')],
      ['F-53', tr('付款与清账', 'Payment', '支払')]
    ];
    const body = B(tr('收藏夹', 'Favorites', 'お気に入り'),
      '<div class="tree">' + rows.map(function (r) {
        return '<div class="node" onclick="SIM.go(\'' + r[0] + '\')"><span class="tw">▸</span>' +
          '<span class="tico doc"></span><b>' + r[0] + '</b>　' + S.esc(r[2]) + '</div>';
      }).join('') + '</div>') +
      '<p class="hint" style="margin-top:10px">' +
      S.esc(tr('命令字段也能直接输入事务码（含 /n 前缀）。本演练数据：R-1001 / 100123 / 720.00 USD。',
        'You can type any T-code in the command field (/n prefix supported). Exercise key data: R-1001 / 100123 / 720.00 USD.',
        'コマンドフィールドに直接 T-code を入力できます（/n 可）。演習データ：R-1001 / 100123 / 720.00 USD。')) + '</p>';
    return Object.assign(head(tr('SAP Easy Access', 'SAP Easy Access', 'SAP Easy Access'), 'SMENU'), {
      body: body,
      onEnter: function () { S.setStatus('info', S.msg('press')); }
    });
  };

  /* ============ MM01 物料主数据（初始屏 → 选择视图 → 分屏录入） ============ */
  function viewsDlg() {
    const f = st.form;
    function row(k, zh, en, ja) {
      return '<div class="frow"><span class="inp' + (f[k] === false ? '' : ' focus') + '" style="cursor:pointer;width:24px;text-align:center" ' +
        'onclick="SIM.mmView(\'' + k + '\')">' + (f[k] === false ? '☐' : '☑') + '</span>' +
        '<span style="font-size:12.5px">' + S.esc(tr(zh, en, ja)) + '</span></div>';
    }
    return '<div class="dlg"><div class="dh"><span>' +
      S.esc(tr('选择视图', 'Select Views', 'ビュー選択')) + '</span><span>✕</span></div>' +
      '<div class="db"><p class="hint" style="margin:0 0 8px">' +
      S.esc(tr('勾选要维护的视图，确定后逐个分屏录入。生产物料至少需要：基本数据 1、采购、MRP 1、工厂数据/存储 1、会计 1。',
        'Tick the views to maintain. A purchasable material needs Basic data 1, Purchasing, MRP 1, Plant data/storage 1 and Accounting 1.',
        '登録するビューにチェックを入れます。購買品目は基本データ 1・購買・MRP 1・プラント/保管 1・会計 1 が必要です。')) + '</p>' +
      row('vBasic', '基本数据 1', 'Basic data 1', '基本データ 1') +
      row('vPurch', '采购', 'Purchasing', '購買') +
      row('vMrp', 'MRP 1', 'MRP 1', 'MRP 1') +
      row('vPlant', '工厂数据 / 存储 1', 'Plant data / storage 1', 'プラントデータ／保管 1') +
      row('vAcct', '会计 1', 'Accounting 1', '会計 1') +
      '</div><div class="df"><button class="gbtn" onclick="SIM.closeDlg()">' +
      S.esc(tr('取消', 'Cancel', '取消')) + '</button>' +
      '<button class="gbtn primary" onclick="SIM.mmGo()">' +
      S.esc(tr('确定', 'Continue', '続行')) + '</button></div></div>';
  }

  S.screens.MM01 = function () {
    const v = S.val, f = st.form;
    const step = f.mmStep || 'init';
    let body;
    if (step === 'init') {
      body = B(tr('物料', 'Material', '品目'),
        F('mat', tr('物料', 'Material', '品目'), { req: true, mark: 1, ph: 'R-1001' }) +
        F('industry', tr('行业类别', 'Industry sector', '業界部門'), { value: v('industry', 'M'), cls: 'w80', mark: 2 }) +
        F('mtype', tr('物料类型', 'Material type', '品目タイプ'), { value: v('mtype', 'ROH'), cls: 'w80', mark: 3 })) +
        '<p class="hint">' + S.esc(tr('物料号留空则由系统内部给号；本演练请直接输入 R-1001。按 Enter 进入「选择视图」。',
          'Leave the material blank to let the system number it. For this exercise type R-1001. Press Enter to open Select Views.',
          '品目コードを空欄にすると内部採番されます。本演習では R-1001 を入力。Enter で「ビュー選択」へ。')) + '</p>';
    } else {
      const on = function (k) { return f[k] !== false; };
      body = TB([tr('基本数据 1', 'Basic data 1', '基本データ 1'), tr('采购', 'Purchasing', '購買'),
        tr('MRP 1', 'MRP 1', 'MRP 1'), tr('工厂 / 存储 1', 'Plant / storage 1', 'プラント／保管 1'),
        tr('会计 1', 'Accounting 1', '会計 1')], 0) +
        B(tr('物料 ' + v('mat') + ' · ' + v('mtype', 'ROH'), 'Material ' + v('mat'), '品目 ' + v('mat')),
          F('desc', tr('描述', 'Description', '品目テキスト'), { req: true, cls: 'w220', mark: 1, ph: tr('钢制支架', 'Steel Bracket', '鋼製ブラケット') }) +
          F('unit', tr('基本计量单位', 'Base unit of measure', '基本単位'), { value: v('unit', 'PC'), cls: 'w80', mark: 2 }) +
          F('grp', tr('物料组', 'Material group', '品目グループ'), { value: v('grp', '00101'), cls: 'w80' }) +
          F('division', tr('产品组', 'Division', '事業領域'), { value: v('division', '00'), cls: 'w80', ro: true })) +
        (on('vPurch') ? B(tr('采购', 'Purchasing', '購買'),
          F('pgroup', tr('采购组', 'Purchasing group', '購買グループ'), { value: v('pgroup', '001'), cls: 'w80', mark: 3 }) +
          F('punit', tr('订单单位', 'Order unit', '発注単位'), { value: v('punit', 'PC'), cls: 'w80' }) +
          F('autoPO', tr('自动采购单', 'Automatic PO', '自動発注'), { value: v('autoPO', ''), cls: 'w80', hint: tr('无 PO 收货场景才勾选', 'Only for GR without PO', 'PO なし入庫のときのみ') }) +
          '<div class="frow"><span class="flabel"></span><span class="inp" style="width:120px;cursor:pointer;text-align:center" onclick="SIM.mm2Toggle()">' +
          S.esc(tr('切换勾选', 'Toggle', '切替')) + '</span></div>' +
          F('matgrp', tr('物料组（采购）', 'Mat. group', '品目グループ'), { value: v('grp', '00101'), cls: 'w80', ro: true })) : '') +
        (on('vMrp') ? B(tr('MRP 1', 'MRP 1', 'MRP 1'),
          F('mrp', tr('MRP 类型', 'MRP type', 'MRP タイプ'), { value: v('mrp', 'PD'), cls: 'w80', mark: 4, hint: 'PD / ND' }) +
          F('lot', tr('批量', 'Lot size', 'ロットサイズ'), { value: v('lot', 'EX'), cls: 'w80', hint: 'EX / FX' }) +
          F('mrpgrp', tr('MRP 组', 'MRP group', 'MRP グループ'), { value: v('mrpgrp', ''), cls: 'w80' }) +
          F('safety', tr('安全库存', 'Safety stock', '安全在庫'), { value: v('safety', '20'), cls: 'w80' }) +
          F('strategy', tr('计划策略', 'Strategy group', '計画戦略'), { value: v('strategy', '10'), cls: 'w80' })) : '') +
        (on('vPlant') ? B(tr('工厂 / 存储 1', 'Plant data / storage 1', 'プラント／保管 1'),
          F('plant', tr('工厂', 'Plant', 'プラント'), { value: v('plant', '1710'), cls: 'w80', mark: 5 }) +
          F('sloc', tr('库存地点', 'Storage location', '保管場所'), { value: v('sloc', '0001'), cls: 'w80' }) +
          F('mrpctrl', tr('MRP 控制者', 'MRP controller', 'MRP 管理者'), { value: v('mrpctrl', '001'), cls: 'w80' }) +
          F('temp', tr('存储条件', 'Storage conditions', '保管条件'), { value: v('temp', '0001'), cls: 'w80' })) : '') +
        (on('vAcct') ? B(tr('会计 1', 'Accounting 1', '会計 1'),
          F('valclass', tr('评估类', 'Valuation class', '評価クラス'), { value: v('valclass', '3000'), cls: 'w80', mark: 6 }) +
          F('pc', tr('价格控制', 'Price control', '価格管理'), { value: v('pc', 'S'), cls: 'w80', hint: 'S 标准价 / V 移动平均' }) +
          F('std', tr('标准价格', 'Standard price', '標準価格'), { value: v('std', '720.00'), cls: 'w110', mark: 7 }) +
          F('curr', tr('货币', 'Currency', '通貨'), { value: v('curr', 'USD'), cls: 'w80', ro: true })) : '');
    }
    return Object.assign(head(step === 'init'
      ? tr('创建物料（初始屏）', 'Create Material (initial)', '品目マスタの登録（初期画面）')
      : tr('创建物料：数据视图', 'Create Material: data screens', '品目マスタの登録：データ画面'), 'MM01'), {
      body: body,
      onEnter: function () {
        if (step === 'init') {
          if (!S.need('mat', tr('物料', 'Material', '品目'))) return;
          if (S.db().materials[String(v('mat')).toUpperCase()]) {
            S.setStatus('err', S.msg('exists', { m: String(v('mat')).toUpperCase() })); return;
          }
          st.form.mmStep = 'data';
          st.dialog = viewsDlg();
          st.__enterDlg = 'mmGo';          // 对话框里按回车 = 点「确定」
          S.setStatus('info', tr('已选定视图，请逐屏录入后点 ✓ 保存', 'Views selected — fill in the screens and press ✓', 'ビュー選択済み。入力後に ✓ で保存'));
        } else {
          S.setStatus('info', tr('检查物料（未保存）', 'Check material (not saved)', '品目をチェック（未保存）'));
        }
      },
      onSave: function () {
        const db = S.db(), f = st.form;
        if (!f.mmStep || f.mmStep !== 'data') {
          S.setStatus('err', tr('请先按 Enter 并选择视图', 'Press Enter and select views first', 'まず Enter でビューを選択してください')); return;
        }
        if (!S.need('desc', tr('描述', 'Description', '品目テキスト'))) return;
        if (!S.need('std', tr('标准价格', 'Standard price', '標準価格'))) return;
        const mat = String(v('mat')).toUpperCase();
        if (db.materials[mat]) { S.setStatus('err', S.msg('exists', { m: mat })); return; }
        const views = [];
        if (f.vBasic !== false) views.push('basic');
        if (f.vPurch !== false) views.push('purch');
        if (f.vMrp !== false) views.push('mrp');
        if (f.vPlant !== false) views.push('plant');
        if (f.vAcct !== false) views.push('acct');
        db.materials[mat] = {
          id: mat, type: v('mtype', 'ROH'), industry: v('industry', 'M'), desc: v('desc'),
          unit: v('unit', 'PC'), grp: v('grp', '00101'), views: views,
          purchGroup: v('pgroup', '001'), mrpType: v('mrp', 'PD'), lotSize: v('lot', 'EX'),
          autoPO: String(v('autoPO')).indexOf('☑') >= 0 || String(v('autoPO')).toUpperCase() === 'X',
          safety: Number(v('safety', '20')) || 0, plant: v('plant', '1710'), sloc: v('sloc', '0001'),
          valClass: v('valclass', '3000'), priceControl: v('pc', 'S'), stdPrice: S.parseNum(v('std', '720'))
        };
        S.save();
        st.form = {};
        refresh('MM01');
        S.setStatus('ok', S.msg('saved', { d: tr('物料', 'Material', '品目'), no: mat }) + ' · ' +
          tr('视图：' + views.length + ' 个', views.length + ' views', views.length + ' ビュー'));
      }
    });
  };

  window.SIM.mmView = function (k) {
    st.form[k] = st.form[k] === false ? true : false;
    st.dialog = viewsDlg();
    st.__enterDlg = 'mmGo';
    S.paint();
  };
  window.SIM.mmGo = function () {
    st.dialog = null;
    st.__enterDlg = null;
    S.paint();
  };

  /* ============ MM03 显示物料 ============ */
  S.screens.MM03 = function () {
    const db = S.db();
    const mat = String(S.val('mat', 'R-1001')).toUpperCase();
    const m = db.materials[mat];
    let body;
    if (!m) {
      body = B(tr('物料', 'Material', '品目'), F('mat', tr('物料', 'Material', '品目'), { value: mat, cls: 'w110' })) +
        '<p class="hint">' + S.esc(tr('输入物料号后回车。种子数据里有 R-1002 / R-1003。', 'Enter a material number and press Enter. Seeded: R-1002 / R-1003.', '品目コードを入力して Enter。初期データ：R-1002 / R-1003。')) + '</p>';
    } else {
      const stock = S.stockOf(mat, m.plant, m.sloc);
      body = TB([tr('基本数据', 'Basic data', '基本データ'), tr('采购', 'Purchasing', '購買'), tr('MRP', 'MRP', 'MRP'),
        tr('工厂 / 存储', 'Plant / storage', 'プラント／保管'), tr('会计', 'Accounting', '会計')], 0) +
        B(tr('物料 ' + mat, 'Material ' + mat, '品目 ' + mat),
          '<div class="frow"><span class="flabel">' + S.esc(tr('描述', 'Description', '品目テキスト')) + '</span><span class="inp ro w220">' + S.esc(S.t(m.desc)) + '</span></div>' +
          '<div class="frow"><span class="flabel">' + S.esc(tr('物料类型 / 单位', 'Type / unit', 'タイプ／単位')) + '</span><span class="inp ro w110">' + m.type + ' / ' + m.unit + '</span></div>' +
          '<div class="frow"><span class="flabel">' + S.esc(tr('采购组', 'Purchasing group', '購買グループ')) + '</span><span class="inp ro w80">' + m.purchGroup + '</span></div>' +
          '<div class="frow"><span class="flabel">' + S.esc(tr('MRP 类型 / 批量', 'MRP type / lot', 'MRP タイプ／ロット')) + '</span><span class="inp ro w110">' + m.mrpType + ' / ' + m.lotSize + '</span></div>' +
          '<div class="frow"><span class="flabel">' + S.esc(tr('评估类 / 价格控制', 'Val. class / price ctrl', '評価クラス／価格管理')) + '</span><span class="inp ro w110">' + m.valClass + ' / ' + m.priceControl + '</span></div>' +
          '<div class="frow"><span class="flabel">' + S.esc(tr('标准价格', 'Standard price', '標準価格')) + '</span><span class="inp ro w110">' + money(m.stdPrice) + ' USD</span></div>') +
        B(tr('库存 ' + m.plant + '/' + m.sloc, 'Stock ' + m.plant + '/' + m.sloc, '在庫 ' + m.plant + '/' + m.sloc),
          '<div class="frow"><span class="flabel">' + S.esc(tr('非限制使用', 'Unrestricted', '非制限使用')) + '</span><span class="inp ro w110">' + S.num(stock.unrestricted) + ' ' + m.unit + '</span></div>');
    }
    return Object.assign(head(tr('显示物料', 'Display Material', '品目マスタの照会'), 'MM03'), {
      body: body,
      onEnter: function () {
        const mm = S.db().materials[String(S.val('mat')).toUpperCase()];
        if (mm) S.setStatus('info', tr('物料 ' + mm.id + ' 显示中（只读）', 'Material ' + mm.id + ' displayed (read only)',
          '品目 ' + mm.id + ' を照会中（照会のみ）'));
        S.open('MM03', { mat: mat });
      },
      onSave: function () { S.setStatus('err', S.msg('readonly')); }
    });
  };

  /* ============ BP 业务伙伴（供应商）：初始屏 → 角色 → 地址/公司代码/采购组织/状态 ============ */
  function bpTabs(on) {
    const names = [tr('地址', 'Address', '住所'), tr('公司代码', 'Company Code', '会社コード'),
      tr('采购组织', 'Purchasing', '購買'), tr('状态', 'Status', 'ステータス')];
    return '<div class="tabs bp-tabs">' + names.map(function (n, i) {
      return '<span class="tab' + (i === on ? ' on' : '') + '" style="cursor:pointer" onclick="SIM.bpTab(' + i + ')">' + S.esc(n) + '</span>';
    }).join('') + '</div>';
  }
  // key 为空 = 只读展示；有 key = 可输入（data-k 交给 syncForm 收集）
  function bpRow(key, label, value, opt) {
    opt = opt || {};
    const w = opt.w || 'w120';
    const cell = (key && !opt.ro)
      ? '<input class="sap-in ' + w + '" data-k="' + key + '" value="' + S.esc(value) + '"' + (opt.ph ? ' placeholder="' + S.esc(opt.ph) + '"' : '') + '>'
      : '<span class="inp ' + w + (opt.ro ? ' ro' : '') + '">' + S.esc(value) + '</span>';
    return '<div class="frow' + (opt.req ? ' req' : '') + '"><span class="flabel">' +
      (opt.mark ? '<span class="n">' + opt.mark + '</span>' : '') + S.esc(label) + '</span>' + cell +
      (opt.hint ? '<span class="hint">' + S.esc(opt.hint) + '</span>' : '') + '</div>';
  }
  function bpToggleRow(key, label, val) {
    return '<div class="frow"><span class="flabel">' + S.esc(label) + '</span>' +
      '<span class="inp w80" style="cursor:pointer;text-align:center" onclick="SIM.bpToggle(\'' + key + '\')">' +
      (val ? '☑' : '☐') + '</span></div>';
  }
  function bpFlag(key) { return String(st.form[key] || '☐').indexOf('☑') >= 0; }

  S.screens.BP = function () {
    const v = S.val, db = S.db();
    const step = v('bpStep', 'init');
    const no = String(v('ven', '')).trim();
    const ex = no ? db.vendors[no] : null;
    let body;

    if (step === 'init') {
      body = B(tr('业务伙伴', 'Business Partner', 'ビジネスパートナ'),
        '<div class="frow req"><span class="flabel"><span class="n">1</span>' + S.esc(tr('业务伙伴', 'Business partner', 'ビジネスパートナ')) + '</span>' +
        '<input class="sap-in w120" data-k="ven" value="' + S.esc(no) + '" placeholder="100123">' +
        '<span class="hint">' + S.esc(tr('留空 = 系统内部给号', 'Blank = internal number', '空欄＝内部採番')) + '</span></div>' +
        bpRow(null, tr('业务伙伴角色', 'BP role', 'BP ロール'), v('brole', 'FLVN01'), { w: 'w160', mark: 2, ro: true, hint: 'FLVN01 供应商（采购）' }) +
        bpRow(null, tr('分组', 'Grouping', 'グループ'), v('bgrp', 'BP01'), { w: 'w90', mark: 3, ro: true, hint: tr('BP01 外部给号的供应商', 'BP01 vendor, external numbering', 'BP01 外部採番の仕入先') })) +
        '<div class="frow" style="margin-top:6px"><span class="flabel"></span>' +
        [['创建', 'Create', '登録'], ['更改', 'Change', '変更'], ['显示', 'Display', '照会'], ['列出', 'List', '一覧']].map(function (x, i) {
          return '<span class="inp" style="width:64px;text-align:center;cursor:pointer' + (i === 0 ? ' focus' : '') + '">' + S.esc(tr(x[0], x[1], x[2])) + '</span>';
        }).join('') + '</div>' +
        '<p class="hint">' + S.esc(tr('输入编号回车 → 选择角色 → 进数据屏。编号已存在就是「更改」（相当于 XK02），不存在就是新建。',
          'Enter a number → pick roles → data screen. An existing number opens in change mode (like XK02).',
          '番号を入力して Enter → ロール選択 → データ画面。既存番号は変更モード（XK02 相当）。')) + '</p>';
      return Object.assign(head(tr('业务伙伴（供应商）', 'Business Partner (Vendor)', 'ビジネスパートナ（仕入先）'), 'BP'), {
        menu: [tr('业务伙伴', 'Business Partner', 'ビジネスパートナ'), tr('编辑', 'Edit', '編集'), tr('转到', 'Goto', 'ジャンプ'),
          tr('环境', 'Environment', '環境'), tr('系统', 'System', 'システム'), tr('帮助', 'Help', 'ヘルプ')],
        body: body,
        onEnter: function () {
          const code = String(S.val('ven')).trim();
          if (code && !S.db().vendors[code]) {
            st.form.ven = code;
            st.form.bpStep = 'role';
            st.form.bpRoles = { FLVN00: true, FLVN01: true };
            st.dialog = bpRoleDlg(code);
            st.__enterDlg = 'bpRoleOk';
            S.setStatus('info', tr('请选择要创建的角色（FLVN01 采购供应商必须选）', 'Select the BP roles (FLVN01 is required for purchasing)',
              '作成するロールを選択（FLVN01 は必須）'));
            return;
          }
          if (code && S.db().vendors[code]) {
            st.form.ven = code;
            st.form.bpStep = 'edit';
            st.form.bpTab = 0;
            bpLoad(st.form, S.db().vendors[code]);
            S.open('BP', st.form);
            S.setStatus('ok', tr('业务伙伴 ' + code + ' 已读取（更改模式）', 'Business partner ' + code + ' loaded (change mode)',
              'ビジネスパートナ ' + code + ' を読み込みました（変更モード）'));
            return;
          }
          S.setStatus('err', S.msg('need', { f: tr('业务伙伴', 'Business partner', 'ビジネスパートナ') }));
        }
      });
    }

    if (step === 'role') {
      body = B(tr('角色', 'Roles', 'ロール'),
        '<p class="hint">' + S.esc(tr('该业务伙伴还没有分配角色。按 Enter 打开角色选择。', 'No role assigned yet. Press Enter to choose.',
          'ロールが未割当です。Enter でロール選択を開きます。')) + '</p>') +
        '<div class="frow"><span class="flabel"></span><span class="inp w160" style="cursor:pointer;text-align:center" onclick="SIM.bpRoles()">' +
        S.esc(tr('选择角色…', 'Select roles…', 'ロール選択…')) + '</span></div>';
      return Object.assign(head(tr('业务伙伴（供应商）', 'Business Partner (Vendor)', 'ビジネスパートナ（仕入先）'), 'BP'), {
        body: body,
        onEnter: function () { st.dialog = bpRoleDlg(String(S.val('ven'))); st.__enterDlg = 'bpRoleOk'; S.paint(); },
        onSave: function () { S.setStatus('err', tr('先选择角色', 'Select roles first', '先にロールを選択')); }
      });
    }

    // ---- 数据屏：四个视图（每屏一页签） ----
    const tab = Number(v('bpTab', 0)) || 0;
    const org = v('org', '1710');
    const addr = (ex && ex.addr) || {};
    const co = (ex && ex.co && ex.co[org]) || {};
    const vo = (ex && ex.orgs && ex.orgs[org]) || {};
    const blk = (ex && ex.blocked) || {};

    let view = '';
    if (tab === 0) {
      view = B(tr('地址', 'Address', '住所'),
        bpRow('bname', tr('名称 1', 'Name 1', '名称 1'), v('bname', S.t(ex ? ex.name : '')), { w: 'w220', req: true, mark: 1 }) +
        bpRow('bname2', tr('名称 2', 'Name 2', '名称 2'), v('bname2', addr.name2 || ''), { w: 'w220' }) +
        bpRow('bsearch', tr('搜索词', 'Search term', '検索語'), v('bsearch', addr.search || ''), { w: 'w160' }) +
        bpRow('bstreet', tr('街道 / 门牌', 'Street / house no.', '通り／番地'), v('bstreet', addr.street || ''), { w: 'w160' }) +
        bpRow('bcity', tr('邮编 / 城市', 'Postal code / city', '郵便番号／市'), v('bcity', addr.city || ''), { w: 'w160', req: true, mark: 2 }) +
        bpRow('bcountry', tr('国家 / 地区', 'Country / region', '国／地域'), v('bcountry', addr.country || 'US'), { w: 'w120', req: true, mark: 3 }) +
        bpRow('blang', tr('语言', 'Language', '言語'), v('blang', addr.lang || 'EN'), { w: 'w80' }) +
        bpRow('bphone', tr('电话', 'Telephone', '電話'), v('bphone', addr.phone || ''), { w: 'w160' }) +
        bpRow('bmail', tr('电子邮件', 'E-mail', '電子メール'), v('bmail', addr.mail || ''), { w: 'w160' })) +
        '<p class="hint">' + S.esc(tr('地址是最上面一层：它属于业务伙伴本身，不分公司代码、不分采购组织。改名称只动这里。',
          'Address is the top layer: it belongs to the BP itself, not to a company code or purchasing org.',
          '住所は最上位の層です。会社コードや購買組織には依存しません。')) + '</p>';
    } else if (tab === 1) {
      view = B(tr('公司代码 1710', 'Company code 1710', '会社コード 1710'),
        bpRow(null, tr('公司代码', 'Company code', '会社コード'), org, { w: 'w80', req: true, mark: 1, ro: true }) +
        bpRow('brecon', tr('对账科目', 'Reconciliation account', '照合勘定'), v('brecon', co.recon || '160000'), { w: 'w120', req: true, mark: 2, hint: tr('160000 应付账款', '160000 payables', '160000 買掛金') }) +
        bpRow(null, tr('统驭科目类型', 'Recon. account type', '照合勘定タイプ'), 'K ' + tr('供应商', 'Vendor', '仕入先'), { w: 'w90', ro: true }) +
        bpRow('bterms', tr('付款条件', 'Payment terms', '支払条件'), v('bterms', co.terms || '0001'), { w: 'w80', req: true, mark: 3, hint: tr('0001 立即付款', '0001 immediate', '0001 即時') }) +
        bpRow('btol', tr('容差组', 'Tolerance group', '許容グループ'), v('btol', co.tolgroup || ''), { w: 'w80' }) +
        bpRow('bpay', tr('付款方式', 'Payment methods', '支払方法'), v('bpay', co.methods || 'C/T'), { w: 'w120' }) +
        bpRow('btax', tr('税码 / 税分类', 'Tax code / tax type', '税コード／税タイプ'), v('btax', co.taxcode || 'V0'), { w: 'w120' })) +
        '<p class="hint">' + S.esc(tr('这一层决定「发票记到哪个应付科目、什么时候到期」。对账科目 160000 填错，MIRO 过账会报「科目确定失败」。',
          'This layer decides which payable account the invoice hits and when it is due. A wrong recon account breaks MIRO.',
          'この層で買掛金の勘定と支払期日が決まります。照合勘定が違うと MIRO で勘定決定エラーになります。')) + '</p>';
    } else if (tab === 2) {
      view = B(tr('采购组织 1710', 'Purchasing org. 1710', '購買組織 1710'),
        bpRow(null, tr('采购组织', 'Purchasing org.', '購買組織'), org, { w: 'w80', req: true, mark: 1 }) +
        bpRow('bpgroup', tr('采购组', 'Purchasing group', '購買グループ'), v('bpgroup', vo.pgroup || '001'), { w: 'w80', req: true, mark: 2 }) +
        bpRow('bcurr', tr('订单货币', 'Order currency', '発注通貨'), v('bcurr', vo.currency || 'USD'), { w: 'w80', req: true, mark: 3 }) +
        bpRow('bterms2', tr('付款条件', 'Payment terms', '支払条件'), v('bterms2', vo.terms || '0001'), { w: 'w80' }) +
        bpRow('bincoterms', tr('国际贸易条件', 'Incoterms', 'インコタームズ'), v('bincoterms', vo.incoterms || 'FOB'), { w: 'w120' }) +
        bpToggleRow('autoPO', tr('自动产生的采购订单', 'Automatic purchase order', '購買発注の自動生成'), bpFlag('autoPO')) +
        bpToggleRow('grBased', tr('基于收货的 IV', 'GR-based IV', '入庫ベース IV'), v('grBased', vo.grBased === false ? '☐' : '☑').indexOf('☑') >= 0)) +
        '<p class="hint">' + S.esc(tr('这一层只对「这个采购组织」有效。无 PO 收货要的「自动产生的采购订单」就在这一屏；同一供应商在别的采购组织可以是另一种设置。',
          'This layer applies per purchasing org only. The “automatic PO” switch used by GR without PO sits here.',
          'この層は購買組織ごとです。PO なし入庫で使う「購買発注の自動生成」はここにあります。')) + '</p>';
    } else {
      view = B(tr('状态', 'Status', 'ステータス'),
        bpRow(null, tr('供应商状态', 'Vendor status', '仕入先ステータス'), tr('有效', 'Active', '有効'), { w: 'w120', ro: true }) +
        bpToggleRow('blkCentral', tr('中央冻结', 'Central block', '中央ブロック'), bpFlag('blkCentral') || !!blk.central && v('blkCentral') === undefined) +
        bpToggleRow('blkPurch', tr('采购冻结', 'Purchasing block', '購買ブロック'), bpFlag('blkPurch') || !!blk.purch && v('blkPurch') === undefined) +
        bpToggleRow('blkPay', tr('付款冻结', 'Payment block', '支払ブロック'), bpFlag('blkPay') || !!blk.pay && v('blkPay') === undefined)) +
        '<p class="hint">' + S.esc(tr('冻结不影响已存在的单据，但会拦住新建与付款；解冻后再保存。', 'Blocks do not touch existing documents but stop new ones and payments.',
          'ブロックは既存伝票を変えませんが、新規作成と支払を止めます。')) + '</p>';
    }

    body = '<div class="frow" style="margin:0 0 8px"><span class="flabel">' + S.esc(tr('业务伙伴', 'Business partner', 'ビジネスパートナ')) + '</span>' +
      '<span class="inp ro w120">' + S.esc(no) + '</span>' +
      '<span class="inp ro w160">FLVN01 ' + S.esc(tr('供应商', 'Vendor', '仕入先')) + '</span>' +
      '<span class="hint">' + S.esc(tr('角色：FLVN00 财务 + FLVN01 采购', 'Roles: FLVN00 FI + FLVN01 MM', 'ロール：FLVN00 会計＋FLVN01 購買')) + '</span></div>' +
      bpTabs(tab) + view;

    return Object.assign(head(tr('业务伙伴（供应商）', 'Business Partner (Vendor)', 'ビジネスパートナ（仕入先）'), 'BP'), {
      menu: [tr('业务伙伴', 'Business Partner', 'ビジネスパートナ'), tr('编辑', 'Edit', '編集'), tr('转到', 'Goto', 'ジャンプ'),
        tr('环境', 'Environment', '環境'), tr('系统', 'System', 'システム'), tr('帮助', 'Help', 'ヘルプ')],
      body: body,
      onEnter: function () {
        if (S.val('bpTab') === undefined) st.form.bpTab = 0;
        S.setStatus('info', tr('检查已通过；切页签看其它视图，✓ 保存', 'Check passed; switch tabs, then ✓', 'チェック OK。タブを切り替えて ✓'));
      },
      onSave: function () {
        const dbx = S.db();
        const code = String(S.val('ven')).trim();
        if (!code) { S.setStatus('err', S.msg('need', { f: tr('业务伙伴', 'Business partner', 'ビジネスパートナ') })); return; }
        const name = String(S.val('bname', S.t(ex ? ex.name : ''))).trim();
        if (!name) { S.setStatus('err', tr('字段 名称 1 未维护（必填）', 'Field Name 1 is required', '項目 名称 1 は必須です'), 'BP'); return; }
        const recon = String(S.val('brecon', '160000')).trim();
        if (!recon) { S.setStatus('err', tr('公司代码 1710：请输入对账科目', 'Company code 1710: reconciliation account required', '会社コード 1710：照合勘定を入力してください'), 'BP'); return; }
        const pgroup = String(S.val('bpgroup', '001')).trim();
        if (!pgroup) { S.setStatus('err', tr('采购组织 1710：请输入采购组', 'Purchasing org. 1710: purchasing group required', '購買組織 1710：購買グループを入力してください'), 'BP'); return; }
        const orgx = v('org', '1710');
        const isNew = !dbx.vendors[code];
        const v0 = dbx.vendors[code] || { id: code, name: name, city: '', country: '', orgs: {}, co: {}, addr: {}, blocked: {} };
        v0.name = name;
        v0.addr = Object.assign({}, v0.addr, {
          name2: S.val('bname2', ''), search: S.val('bsearch', ''), street: S.val('bstreet', ''),
          city: S.val('bcity', ''), country: S.val('bcountry', 'US'),
          lang: S.val('blang', 'EN'), phone: S.val('bphone', ''), mail: S.val('bmail', '')
        });
        v0.city = v0.addr.city;
        v0.country = v0.addr.country;
        v0.co[orgx] = Object.assign(v0.co[orgx] || {}, {
          recon: recon, terms: S.val('bterms', '0001'), methods: S.val('bpay', 'C/T'),
          tolgroup: S.val('btol', ''), taxcode: S.val('btax', 'V0')
        });
        v0.orgs[orgx] = Object.assign(v0.orgs[orgx] || {}, {
          currency: S.val('bcurr', 'USD'), terms: S.val('bterms2', '0001'), group: pgroup,
          pgroup: pgroup, incoterms: S.val('bincoterms', 'FOB'),
          autoPO: bpFlag('autoPO'), grBased: String(S.val('grBased', '☑')).indexOf('☑') >= 0
        });
        v0.blocked = { central: bpFlag('blkCentral'), purch: bpFlag('blkPurch'), pay: bpFlag('blkPay') };
        dbx.vendors[code] = v0;
        S.save();
        st.form.bpTab = Number(S.val('bpTab', 0));
        refresh('BP');
        S.setStatus('ok', (isNew
          ? S.msg('saved', { d: tr('供应商', 'Vendor', '仕入先'), no: code })
          : tr('供应商 ' + code + ' 已更改', 'Vendor ' + code + ' has been changed', '仕入先 ' + code + ' を変更しました')) +
          ' · ' + tr('公司代码 ' + orgx + ' / 采购组织 ' + orgx + ' / 角色 FLVN00+FLVN01',
            'Company code ' + orgx + ' / purchasing org ' + orgx + ' / roles FLVN00+FLVN01',
            '会社コード ' + orgx + ' / 購買組織 ' + orgx + ' / ロール FLVN00+FLVN01'));
      }
    });
  };

  function bpLoad(f, v0) {
    f.bname = S.t(v0.name);
    f.bname2 = (v0.addr || {}).name2 || '';
    f.bsearch = (v0.addr || {}).search || '';
    f.bstreet = (v0.addr || {}).street || '';
    f.bcity = (v0.addr || {}).city || '';
    f.bcountry = (v0.addr || {}).country || 'US';
    f.blang = (v0.addr || {}).lang || 'EN';
    f.bphone = (v0.addr || {}).phone || '';
    f.bmail = (v0.addr || {}).mail || '';
    const org = '1710';
    const co = (v0.co || {})[org] || {};
    const vo = (v0.orgs || {})[org] || {};
    f.brecon = co.recon || '160000';
    f.bterms = co.terms || '0001';
    f.bpay = co.methods || 'C/T';
    f.btol = co.tolgroup || '';
    f.btax = co.taxcode || 'V0';
    f.bpgroup = vo.pgroup || vo.group || '001';
    f.bcurr = vo.currency || 'USD';
    f.bterms2 = vo.terms || '0001';
    f.bincoterms = vo.incoterms || 'FOB';
    f.autoPO = vo.autoPO ? '☑' : '☐';
    f.grBased = vo.grBased === false ? '☐' : '☑';
    const blk = v0.blocked || {};
    f.blkCentral = blk.central ? '☑' : '☐';
    f.blkPurch = blk.purch ? '☑' : '☐';
    f.blkPay = blk.pay ? '☑' : '☐';
    f.ven = v0.id;
    f.bpStep = 'edit';
    f.bpTab = 0;
  }

  function bpRoleDlg(code) {
    const roles = [['FLVN00', tr('财务供应商（FI）', 'Vendor (FI)', '仕入先（会計）')],
      ['FLVN01', tr('采购供应商（MM）', 'Vendor (MM)', '仕入先（購買）')],
      ['FLCU00', tr('财务客户（FI）', 'Customer (FI)', '得意先（会計）')],
      ['FLCU01', tr('销售客户（SD）', 'Customer (SD)', '得意先（販売）')]];
    const sel = st.form.bpRoles || { FLVN00: true, FLVN01: true };
    return '<div class="dlg"><div class="dh"><span>' + S.esc(tr('业务伙伴角色：' + code, 'BP roles: ' + code, 'BP ロール：' + code)) +
      '</span><span>✕</span></div><div class="db">' +
      '<p class="hint" style="margin:0 0 8px">' + S.esc(tr('勾选要启用的角色。采购必须在 FLVN01 下维护采购组织数据。',
        'Tick the roles. Purchasing data lives under FLVN01.', 'ロールにチェック。購買データは FLVN01 配下です。')) + '</p>' +
      roles.map(function (r) {
        const on = r[0].indexOf('FLVN') === 0 ? sel[r[0]] !== false : false;
        return '<div class="frow"><span class="inp" style="width:26px;text-align:center;cursor:pointer" onclick="SIM.bpRolePick(\'' + r[0] + '\')">' +
          (on ? '☑' : '☐') + '</span><span style="font-size:12.5px">' + r[0] + '　' + S.esc(r[1]) + '</span></div>';
      }).join('') +
      '</div><div class="df"><button class="gbtn" onclick="SIM.closeDlg()">' + S.esc(tr('取消', 'Cancel', '取消')) +
      '</button><button class="gbtn primary" onclick="SIM.bpRoleOk()">' + S.esc(tr('确定', 'Continue', '続行')) +
      '</button></div></div>';
  }

  window.SIM.bpRoles = function () {
    st.dialog = bpRoleDlg(String(S.val('ven')));
    st.__enterDlg = 'bpRoleOk';
    S.paint();
  };
  window.SIM.bpRolePick = function (k) {
    st.form.bpRoles = st.form.bpRoles || { FLVN00: true, FLVN01: true };
    st.form.bpRoles[k] = st.form.bpRoles[k] === false;
    st.dialog = bpRoleDlg(String(S.val('ven')));
    S.paint();
  };
  window.SIM.bpRoleOk = function () {
    const sel = st.form.bpRoles || {};
    if (!sel.FLVN01) { S.setStatus('err', tr('采购供应商角色 FLVN01 必须选中', 'Role FLVN01 (MM vendor) is required', 'ロール FLVN01 は必須です')); S.paint(); return; }
    st.dialog = null; st.__enterDlg = null;
    st.form.bpStep = 'edit';
    st.form.bpTab = 0;
    st.form.autoPO = '☐';
    st.form.grBased = '☑';
    S.open('BP', st.form);
    S.setStatus('info', tr('角色已分配：按页签维护 地址 / 公司代码 / 采购组织，最后 ✓ 保存',
      'Roles assigned: fill Address / Company code / Purchasing, then ✓',
      'ロール割当済：住所／会社コード／購買を入力して ✓'));
  };
  window.SIM.bpTab = function (i) {
    S.sync();                     // 先把当前屏输入收进 state，切页签不丢已填内容
    S.state.form.bpTab = i;
    S.paint();
  };
  window.SIM.bpToggle = function (k) {
    S.sync();
    const cur = String(S.state.form[k] || '☐');
    S.state.form[k] = cur.indexOf('☑') >= 0 ? '☐' : '☑';
    S.paint();
  };

  /* ============ ME11 采购信息记录 ============ */
  S.screens.ME11 = function () {
    const v = S.val;
    const body = B(tr('采购信息记录', 'Purchasing info record', '購買情報レコード'),
      F('ven', tr('供应商', 'Vendor', '仕入先'), { req: true, mark: 1, ph: '100123' }) +
      F('mat', tr('物料', 'Material', '品目'), { req: true, mark: 2, ph: 'R-1001' }) +
      F('org', tr('采购组织', 'Purchasing org.', '購買組織'), { value: v('org', '1710'), cls: 'w80', mark: 3 }) +
      F('type', tr('信息类别', 'Info category', '情報カテゴリ'), { value: v('type', '标准'), cls: 'w80', ro: true })) +
      B(tr('采购组织数据 1', 'Purchasing org. data 1', '購買組織データ 1'),
        F('price', tr('净价', 'Net price', '正味価格'), { req: true, cls: 'w110', mark: 4, ph: '720.00' }) +
        F('curr', tr('货币', 'Currency', '通貨'), { value: v('curr', 'USD'), cls: 'w80' }) +
        F('punit', tr('价格单位', 'Price unit', '価格単位'), { value: v('punit', '1'), cls: 'w80' }) +
        F('lead', tr('计划交货时间（天）', 'Planned delivery time', '計画納入期間（日）'), { value: v('lead', '5'), cls: 'w80' }) +
        F('minq', tr('最小订货量', 'Minimum order qty', '最小発注数量'), { value: v('minq', '10'), cls: 'w80' })) +
      '<p class="hint">' + S.esc(tr('信息记录是 PO 价格的来源：PO 不带价，净价自动从 ME11 带出。',
        'The info record is the price source: the PO takes its net price from here.',
        '購買情報レコードが発注価格の源泉です。PO の正味価格はここから自動決定されます。')) + '</p>';
    return Object.assign(head(tr('创建采购信息记录', 'Create Info Record', '購買情報レコードの登録'), 'ME11'), {
      body: body,
      onEnter: function () {
        const db = S.db();
        const ven = String(v('ven')), mat = String(v('mat')).toUpperCase();
        if (ven && !db.vendors[ven]) S.setStatus('err', S.msg('notfound', { d: tr('供应商', 'Vendor', '仕入先'), no: ven }));
        else if (mat && !db.materials[mat]) S.setStatus('err', S.msg('notfound', { d: tr('物料', 'Material', '品目'), no: mat }));
        else S.setStatus('info', tr('输入净价后保存', 'Enter the net price and save', '正味価格を入力して保存'));
      },
      onSave: function () {
        const db = S.db();
        const ven = String(v('ven')), mat = String(v('mat')).toUpperCase(), org = v('org', '1710');
        if (!S.need('ven', tr('供应商', 'Vendor', '仕入先'))) return;
        if (!S.need('mat', tr('物料', 'Material', '品目'))) return;
        if (!db.vendors[ven]) { S.setStatus('err', S.msg('notfound', { d: tr('供应商', 'Vendor', '仕入先'), no: ven })); return; }
        if (!db.materials[mat]) { S.setStatus('err', S.msg('notfound', { d: tr('物料', 'Material', '品目'), no: mat })); return; }
        if (!(db.vendors[ven].orgs || {})[org]) { S.setStatus('err', S.msg('vendorOrg', { v: ven, o: org })); return; }
        const price = S.parseNum(v('price'));
        if (!price) { S.setStatus('err', S.msg('need', { f: tr('净价', 'Net price', '正味価格') })); return; }
        db.seq.info += 1;
        const no = String(db.seq.info);
        db.inforecs[ven + '/' + mat + '/' + org] = {
          no: no, vendor: ven, mat: mat, org: org, price: price, curr: v('curr', 'USD'),
          punit: Number(v('punit', '1')) || 1, lead: Number(v('lead', '5')) || 5
        };
        S.save();
        S.setStatus('ok', S.msg('saved', { d: tr('采购信息记录', 'Info record', '購買情報レコード'), no: no }));
      }
    });
  };

  /* ============ ME51N 采购申请 ============ */
  S.screens.ME51N = function () {
    const v = S.val;
    const body = B(tr('采购申请', 'Purchase requisition', '購買依頼'),
      F('type', tr('凭证类型', 'Doc. type', '伝票タイプ'), { value: v('type', 'NB'), cls: 'w80', mark: 1 }) +
      F('org', tr('采购组织', 'Purchasing org.', '購買組織'), { value: v('org', '1710'), cls: 'w80', mark: 2 }) +
      F('pgroup', tr('采购组', 'Purchasing group', '購買グループ'), { value: v('pgroup', '001'), cls: 'w80', mark: 3 })) +
      B(tr('项目 10', 'Item 10', '明細 10'),
        F('mat', tr('物料', 'Material', '品目'), { req: true, ph: 'R-1001' }) +
        F('qty', tr('数量', 'Quantity', '数量'), { req: true, cls: 'w80', ph: '300' }) +
        F('deliv', tr('交货日期', 'Delivery date', '納入日'), { value: v('deliv', '2026-11-20'), cls: 'w110' }) +
        F('plant', tr('工厂', 'Plant', 'プラント'), { value: v('plant', '1710'), cls: 'w80' }) +
        F('sloc', tr('库存地点', 'Storage loc.', '保管場所'), { value: v('sloc', '0001'), cls: 'w80' }) +
        F('acct', tr('科目分配类别', 'Acct assignment cat.', '勘定割当カテゴリ'), { value: v('acct', ''), cls: 'w80', hint: tr('库存物料留空', 'Blank for stock material', '在庫品目は空欄') })) +
      '<p class="hint">' + S.esc(tr('申请是「内部需求」。保存后到 ME57/ME21N 转成采购订单，否则不会发给供应商。',
        'A requisition is an internal demand. Convert it in ME57/ME21N to a purchase order.',
        '購買依頼は社内要求です。ME57／ME21N で発注に変換します。')) + '</p>';
    return Object.assign(head(tr('创建采购申请', 'Create Purchase Requisition', '購買依頼の登録'), 'ME51N'), {
      body: body,
      onEnter: function () {
        const mat = String(v('mat')).toUpperCase(), plant = v('plant', '1710');
        if (mat && !S.matAtPlant(mat, plant)) S.setStatus('err', S.msg('matPlant', { m: mat, p: plant }));
        else S.setStatus('info', S.msg('press'));
      },
      onSave: function () {
        const db = S.db();
        if (!S.need('mat', tr('物料', 'Material', '品目'))) return;
        const mat = String(v('mat')).toUpperCase(), plant = v('plant', '1710');
        if (!S.matAtPlant(mat, plant)) { S.setStatus('err', S.msg('matPlant', { m: mat, p: plant })); return; }
        const qty = S.parseNum(v('qty'));
        if (!qty) { S.setStatus('err', S.msg('need', { f: tr('数量', 'Quantity', '数量') })); return; }
        db.seq.pr += 1;
        const no = String(db.seq.pr);
        db.prs[no] = { no: no, mat: mat, qty: qty, deliv: v('deliv', '2026-11-20'), plant: plant,
          sloc: v('sloc', '0001'), org: v('org', '1710'), group: v('pgroup', '001'),
          status: 'open', approved: true, source: 'manual' };
        st.prNo = no;
        S.save();
        S.setStatus('ok', S.msg('saved', { d: tr('采购申请', 'Requisition', '購買依頼'), no: no }) +
          ' · ' + tr('接下来在 ME21N 输入该单号回车', 'Next: enter this number in ME21N', '次に ME21N でこの番号を入力'));
      }
    });
  };

  /* ============ ME21N 采购订单 ============ */
  S.screens.ME21N = function () {
    const v = S.val;
    const pr = v('pr') ? S.db().prs[String(v('pr'))] : null;
    const body = B(tr('抬头', 'Header', 'ヘッダ'),
      F('po', tr('采购订单号', 'Purchase order', '購買発注番号'), { ro: true, value: tr('（保存后给号）', '(assigned on save)', '（保存後に採番）'), cls: 'w110', mark: 1 }) +
      F('ven', tr('供应商', 'Vendor', '仕入先'), { req: true, mark: 2, ph: '100123' }) +
      F('type', tr('订单类型', 'PO type', '発注タイプ'), { value: v('type', 'NB'), cls: 'w80', mark: 3 }) +
      F('org', tr('采购组织', 'Purchasing org.', '購買組織'), { value: v('org', '1710'), cls: 'w80' }) +
      F('pgroup', tr('采购组', 'Purchasing group', '購買グループ'), { value: v('pgroup', '001'), cls: 'w80' }) +
      F('date', tr('凭证日期', 'Doc. date', '伝票日付'), { value: v('date', '2026-11-07'), cls: 'w110' })) +
      B(tr('参照 / 项目 10', 'Reference / Item 10', '参照／明細 10'),
        F('pr', tr('参照采购申请', 'Reference requisition', '参照購買依頼'), { cls: 'w110', ph: '10000001', hint: tr('输单号回车即带出', 'Enter → copies', '入力して Enter でコピー') }) +
        F('mat', tr('物料', 'Material', '品目'), { req: true, ph: 'R-1001' }) +
        F('qty', tr('数量', 'Quantity', '数量'), { req: true, cls: 'w80', ph: '300' }) +
        F('price', tr('净价（信息记录带出）', 'Net price (from info record)', '正味価格（情報レコード）'), { ro: true, cls: 'w110', value: pr ? S.fmt((S.infoRec(String(v('ven')), pr.mat, v('org', '1710')) || {}).price || 0) : '—' }) +
        F('deliv', tr('交货日期', 'Delivery date', '納入日'), { value: v('deliv', '2026-11-15'), cls: 'w110' }) +
        F('plant', tr('工厂', 'Plant', 'プラント'), { value: v('plant', '1710'), cls: 'w80' }) +
        F('sloc', tr('库存地点', 'Storage loc.', '保管場所'), { value: v('sloc', '0001'), cls: 'w80' }) +
        F('grflag', tr('基于收货的 IV', 'GR-based IV', '入庫ベース IV'), { ro: true, cls: 'w80',
          value: (S.infoRec(String(v('ven')), pr ? pr.mat : String(v('mat')).toUpperCase(), v('org', '1710')) || {}).grBased === false ? tr('否（可先票后货）', 'No', 'いいえ') : tr('是', 'Yes', 'はい'),
          hint: tr('来自信息记录（ME12 可改）', 'From info record (ME12)', '情報レコード由来（ME12）') })) +
      (pr ? '<p class="hint">' + S.esc(tr('已参照申请 ' + pr.no + '：' + pr.qty + ' PC / 交货 ' + pr.deliv,
        'Referencing ' + pr.no + ': ' + pr.qty + ' PC', '購買依頼 ' + pr.no + ' を参照：' + pr.qty + ' PC')) + '</p>' : '');
    return Object.assign(head(tr('创建采购订单', 'Create Purchase Order', '購買発注の登録'), 'ME21N'), {
      body: body,
      onEnter: function () {
        const db = S.db();
        const prNo = String(v('pr') || '');
        if (prNo) {
          const p = db.prs[prNo];
          if (!p) { S.setStatus('err', S.msg('noPR', { n: prNo })); return; }
          st.form.mat = p.mat; st.form.qty = String(p.qty); st.form.deliv = p.deliv;
          st.form.plant = p.plant; st.form.sloc = p.sloc;
          S.setStatus('ok', tr('已复制申请 ' + prNo + '：物料 ' + p.mat + '，数量 ' + p.qty,
            'Requisition ' + prNo + ' copied: ' + p.mat + ' / ' + p.qty, '購買依頼 ' + prNo + ' をコピー：' + p.mat + ' / ' + p.qty));
          return;
        }
        const ven = String(v('ven')), mat = String(v('mat')).toUpperCase(), plant = v('plant', '1710');
        if (ven && !(db.vendors[ven] && (db.vendors[ven].orgs || {})[v('org', '1710')])) {
          S.setStatus('err', S.msg('vendorOrg', { v: ven, o: v('org', '1710') })); return;
        }
        if (mat && !S.matAtPlant(mat, plant)) { S.setStatus('err', S.msg('matPlant', { m: mat, p: plant })); return; }
        S.setStatus('info', S.msg('press'));
      },
      onSave: function () {
        const db = S.db();
        const ven = String(v('ven')), org = v('org', '1710');
        if (!S.need('ven', tr('供应商', 'Vendor', '仕入先'))) return;
        if (!S.need('mat', tr('物料', 'Material', '品目'))) return;
        if (!db.vendors[ven]) { S.setStatus('err', S.msg('notfound', { d: tr('供应商', 'Vendor', '仕入先'), no: ven })); return; }
        if (!(db.vendors[ven].orgs || {})[org]) { S.setStatus('err', S.msg('vendorOrg', { v: ven, o: org })); return; }
        const mat = String(v('mat')).toUpperCase(), plant = v('plant', '1710');
        if (!S.matAtPlant(mat, plant)) { S.setStatus('err', S.msg('matPlant', { m: mat, p: plant })); return; }
        const rec = S.infoRec(ven, mat, org);
        if (!rec) { S.setStatus('err', S.msg('noPrice', { v: ven, m: mat })); return; }
        const qty = S.parseNum(v('qty'));
        if (!qty) { S.setStatus('err', S.msg('need', { f: tr('数量', 'Quantity', '数量') })); return; }
        db.seq.po += 1;
        const no = String(db.seq.po);
        db.pos[no] = { no: no, vendor: ven, type: v('type', 'NB'), org: org, group: v('pgroup', '001'),
          date: v('date', '2026-11-07'), mat: mat, qty: qty, price: rec.price, curr: rec.curr || 'USD',
          grBased: rec.grBased !== false,
          deliv: v('deliv', '2026-11-15'), plant: plant, sloc: v('sloc', '0001'),
          receivedQty: 0, invoicedQty: 0, status: 'open', pr: String(v('pr') || '') };
        if (v('pr') && db.prs[String(v('pr'))]) db.prs[String(v('pr'))].status = 'po';
        st.poNo = no;
        S.save();
        S.setStatus('ok', S.msg('saved', { d: tr('采购订单', 'Purchase order', '購買発注'), no: no }) +
          ' · ' + tr('净额 ' + money(qty * rec.price) + ' ' + (rec.curr || 'USD'), 'Net ' + money(qty * rec.price), '正味額 ' + money(qty * rec.price)));
      }
    });
  };

  /* ============ ME23N 显示采购订单 ============ */
  function grDocFor(no) {
    const md = S.db().matdocs.filter(function (d) { return d.po === no && d.type === '101'; });
    return md.length ? md[md.length - 1].no : '';
  }
  function invFor(no) {
    const db = S.db();
    const k = Object.keys(db.invoices).filter(function (x) { return db.invoices[x].po === no; });
    return k.length ? k[k.length - 1] : '';
  }
  S.screens.ME23N = function () {
    const db = S.db();
    const no = String(S.val('po', st.poNo || '4500000123'));
    const po = db.pos[no];
    let body = B(tr('采购订单', 'Purchase order', '購買発注'),
      F('po', tr('采购订单', 'Purchase order', '購買発注'), { cls: 'w110', value: no }) +
      (po ? '' : '<p class="hint">' + S.esc(tr('输单号后回车。', 'Enter the PO number.', '伝票番号を入力して Enter。')) + '</p>'));
    if (po) {
      const openQ = po.qty - po.receivedQty;
      const inv = db.invoices[invFor(po.no)];
      body += TB([tr('行项目', 'Items', '明細'), tr('采购订单历史', 'PO history', '購買発注履歴'), tr('发票', 'Invoice', '請求書')], 1) +
        B(tr('抬头', 'Header', 'ヘッダ'),
          '<div class="frow"><span class="flabel">' + S.esc(tr('供应商', 'Vendor', '仕入先')) + '</span><span class="inp ro w110">' + po.vendor + '</span></div>' +
          '<div class="frow"><span class="flabel">' + S.esc(tr('类型 / 组织 / 组', 'Type / org / group', 'タイプ／組織／グループ')) + '</span><span class="inp ro w160">' + po.type + ' / ' + po.org + ' / ' + po.group + '</span></div>' +
          '<div class="frow"><span class="flabel">' + S.esc(tr('净额', 'Net value', '正味額')) + '</span><span class="inp ro w110">' + money(po.qty * po.price) + ' ' + po.curr + '</span></div>' +
          '<div class="frow"><span class="flabel">' + S.esc(tr('参照申请', 'Requisition', '購買依頼')) + '</span><span class="inp ro w110">' + (po.pr || '—') + '</span></div>') +
        TBL([tr('项目', 'Item', '明細'), tr('物料', 'Material', '品目'), tr('数量', 'Qty', '数量'),
          tr('净价', 'Net price', '正味価格'), tr('净额', 'Net', '正味額'), tr('交货', 'Deliv.', '納入'),
          tr('工厂', 'Plant', 'プラント'), tr('地点', 'SLoc', '保管場所')],
        [['10', po.mat, S.num(po.qty), money(po.price), money(po.qty * po.price), po.deliv, po.plant, po.sloc]], 'tctrl') +
        TBL([tr('日期', 'Date', '日付'), tr('单据', 'Document', '伝票'), tr('号码', 'Number', '番号'),
          tr('数量', 'Qty', '数量'), tr('金额', 'Amount', '金額'), tr('状态', 'Status', 'ステータス')],
        [
          [po.date, tr('采购订单', 'PO', '購買発注'), po.no, S.num(po.qty), money(po.qty * po.price), tr('已创建', 'created', '登録済')],
          ['—', tr('收货', 'GR', '入庫'), grDocFor(po.no) || '—', S.num(po.receivedQty), money(po.receivedQty * po.price), po.receivedQty ? tr('已过账', 'posted', '転記済') : '—'],
          ['—', tr('发票', 'Invoice', '請求書'), invFor(po.no) || '—', S.num(po.invoicedQty), money(po.invoicedQty * po.price), po.invoicedQty ? tr('已过账', 'posted', '転記済') : '—'],
          ['—', tr('付款', 'Payment', '支払'), (inv && inv.paid) ? tr('已清账', 'cleared', '消込済') : '—', '—', '—', (inv && inv.blocked) ? tr('发票冻结中', 'invoice blocked', '請求書ブロック中') : '—']
        ]) +
        '<div class="frow" style="margin-top:8px"><span class="flabel">' + S.esc(tr('仍要交货 / 仍要开票', 'Still to deliver / invoice', '残納入／残請求')) + '</span>' +
        '<span class="inp ro w110">' + S.num(openQ) + ' PC</span><span class="inp ro w110">' + money(Math.max(0, (po.receivedQty - po.invoicedQty)) * po.price) + ' ' + po.curr + '</span></div>';
    }
    return Object.assign(head(tr('显示采购订单', 'Display Purchase Order', '購買発注の照会'), 'ME23N'), {
      body: body,
      onEnter: function () { S.open('ME23N', { po: String(S.val('po')) }); },
      onSave: function () { S.setStatus('err', S.msg('readonly')); }
    });
  };

  /* ============ MIGO 收货 / 退货 / 无 PO 收货 ============ */
  S.screens.MIGO = function () {
    const v = S.val;
    const mtype = String(v('mtype', '101'));
    const needPO = mtype === '101' || mtype === '122';
    const po = needPO ? S.poNumber(String(v('po', st.poNo || '4500000123'))) : null;
    const openQty = po ? po.qty - po.receivedQty : 0;
    const mat = po ? po.mat : String(v('mat', '')).toUpperCase();
    const m = S.db().materials[mat];
    const qty = S.parseNum(v('qty', po && mtype === '101' ? String(openQty) : ''));
    const unitPrice = po ? po.price : (m ? m.stdPrice : 0);
    const body = B(tr('抬头', 'Header', 'ヘッダ'),
      F('action', tr('操作', 'Action', '処理'), { ro: true, value: mtype === '122' ? tr('A07 退货交货', 'A07 Return delivery', 'A07 返品') : tr('A01 收货', 'A01 Goods receipt', 'A01 入庫'), cls: 'w160', mark: 1 }) +
      F('ref', tr('参考凭证', 'Reference document', '参照伝票'), { value: needPO ? tr('A 采购订单', 'A Purchase order', 'A 購買発注') : tr('R 其它', 'R Other', 'R その他'), cls: 'w160', mark: 2 }) +
      F('date', tr('过账日期', 'Posting date', '転記日付'), { value: v('date', '2026-11-10'), cls: 'w110' })) +
      B(tr('收货数据', 'Goods receipt data', '入庫データ'),
        (needPO ? F('po', tr('采购订单', 'Purchase order', '購買発注'), { req: true, cls: 'w110', mark: 3 }) : F('mat', tr('物料', 'Material', '品目'), { req: true, cls: 'w110', mark: 3, ph: 'R-1002' })) +
        F('mtype', tr('移动类型', 'Movement type', '移動タイプ'), { value: mtype, cls: 'w80', mark: 4, hint: '101 / 122 / 501 / 561' }) +
        (needPO ? F('matro', tr('物料', 'Material', '品目'), { ro: true, value: po ? po.mat : '—', cls: 'w110' })
          + F('openq', tr('仍要交货', 'Still to be delivered', '残納入'), { ro: true, value: po ? S.num(openQty) : '—', cls: 'w80' }) : '') +
        F('qty', tr('数量', 'Quantity', '数量'), { req: true, cls: 'w80', value: qty ? String(qty) : (po && mtype === '101' ? String(openQty) : ''), mark: 5 }) +
        F('plant', tr('工厂', 'Plant', 'プラント'), { value: po ? po.plant : v('plant', '1710'), cls: 'w80' }) +
        F('sloc', tr('库存地点', 'Storage loc.', '保管場所'), { value: v('sloc', po ? po.sloc : '0001'), cls: 'w80' })) +
      '<p class="hint">' + S.esc(needPO
        ? tr('金额 = 数量 × 订单净价 ' + money(unitPrice) + ' = ' + money(qty * unitPrice) + ' ' + (po ? po.curr : 'USD') + '；过账后同时生成物料凭证与会计凭证。',
          'Value = qty × net price ' + money(unitPrice) + ' = ' + money(qty * unitPrice) + '. A material and an accounting document are created.',
          '金額 = 数量 × 正味価格 ' + money(unitPrice) + ' = ' + money(qty * unitPrice) + '。入庫で品目伝票と会計伝票が生成されます。')
        : tr('501 / 561 不参照采购订单：金额按物料标准价 ' + money(unitPrice) + ' 计算，501 计入消耗科目、561 计为期初。',
          '501 / 561 post without a PO: valued at the material standard price, 501 to consumption, 561 to initial stock.',
          '501／561 は PO 参照なし：品目標準価格で評価し、501 は消費、561 は期首残高に計上します。')) +
      '</p>';
    return Object.assign(head(tr('收货 采购订单', 'Goods Receipt', '入庫'), 'MIGO'), {
      body: body,
      onEnter: function () {
        if (needPO) {
          const p = S.poNumber(String(v('po')));
          if (!p) { S.setStatus('err', S.msg('noPO', { n: v('po') })); return; }
          if (!String(v('qty')).trim()) st.form.qty = String(p.qty - p.receivedQty);   // 已填过的数量不要覆盖
          S.setStatus('ok', tr('已带出明细：仍要交货 ' + (p.qty - p.receivedQty) + ' PC、净价 ' + money(p.price),
            'Item loaded: open ' + (p.qty - p.receivedQty) + ' PC at ' + money(p.price),
            '明細を展開：残納入 ' + (p.qty - p.receivedQty) + ' PC、正味価格 ' + money(p.price)));
        } else {
          const mm = S.db().materials[String(v('mat')).toUpperCase()];
          if (!mm) { S.setStatus('err', S.msg('notfound', { d: tr('物料', 'Material', '品目'), no: v('mat') })); return; }
          S.setStatus('info', tr('按标准价 ' + money(mm.stdPrice) + ' 收货，无需采购订单', 'Valued at standard price ' + money(mm.stdPrice), '標準価格 ' + money(mm.stdPrice) + ' で入庫'));
        }
      },
      onSave: function () {
        const db = S.db();
        const mt = String(v('mtype', '101'));
        const qty = S.parseNum(v('qty'));
        if (!qty) { S.setStatus('err', S.msg('need', { f: tr('数量', 'Quantity', '数量') })); return; }
        const pd = v('date', '2026-11-10');
        if (!S.periodOpen(pd)) { S.setStatus('err', S.msg('periodClosed', { p: S.periodOf(pd), cur: db.cfg.period }), 'M7021'); return; }
        if (mt === '101' || mt === '122') {
          const p = S.poNumber(String(v('po')));
          if (!p) { S.setStatus('err', S.msg('noPO', { n: v('po') })); return; }
          const openQty = p.qty - p.receivedQty;
          if (mt === '101' && qty > openQty * 1.1) { S.setStatus('err', S.msg('over', { q: S.num(openQty) })); return; }
          if (mt === '122' && qty > p.receivedQty) { S.setStatus('err', S.msg('stock', { q: S.num(p.receivedQty) })); return; }
          const amount = qty * p.price;
          db.seq.md += 1; db.seq.acct += 1;
          const md = String(db.seq.md), acct = String(db.seq.acct);
          db.matdocs.push({ no: md, type: mt, mat: p.mat, qty: qty, po: p.no, plant: p.plant,
            sloc: v('sloc', p.sloc), date: v('date', '2026-11-10'), amount: amount, acct: acct });
          db.accts.push({ no: acct, date: v('date', '2026-11-10'), ref: md, type: 'WE',
            lines: mt === '101'
              ? [{ pk: '40', acct: '140000', name: tr('库存商品（原材料）', 'Inventory', '棚卸資産'), dc: 'S', amt: amount },
                 { pk: '50', acct: '191100', name: tr('GR/IR 暂估应计', 'GR/IR clearing', 'GR/IR 仮勘定'), dc: 'H', amt: amount }]
              : [{ pk: '40', acct: '191100', name: tr('GR/IR 暂估应计', 'GR/IR clearing', 'GR/IR 仮勘定'), dc: 'S', amt: amount },
                 { pk: '50', acct: '140000', name: tr('库存商品（原材料）', 'Inventory', '棚卸資産'), dc: 'H', amt: amount }] });
          if (mt === '101') { p.receivedQty += qty; p.status = p.receivedQty >= p.qty ? 'received' : 'partial'; }
          else { p.receivedQty -= qty; p.status = 'partial'; }
          S.stockOf(p.mat, p.plant, v('sloc', p.sloc)).unrestricted += (mt === '101' ? qty : -qty);
          S.save();
          S.setStatus('ok', tr('物料凭证 ' + md + ' 已过账（会计凭证 ' + acct + '）：' + money(amount) + ' ' + p.curr,
            'Material document ' + md + ' posted (acct doc ' + acct + '): ' + money(amount),
            '品目伝票 ' + md + ' を転記（会計伝票 ' + acct + '）：' + money(amount)), mt);
          return;
        }
        // 501 / 561：无采购订单收货
        const mat = String(v('mat')).toUpperCase();
        const m = db.materials[mat];
        if (!m) { S.setStatus('err', S.msg('notfound', { d: tr('物料', 'Material', '品目'), no: mat })); return; }
        if (!S.matAtPlant(mat, v('plant', '1710'))) { S.setStatus('err', S.msg('matPlant', { m: mat, p: v('plant', '1710') })); return; }
        const amount = qty * m.stdPrice;
        db.seq.md += 1; db.seq.acct += 1;
        const md = String(db.seq.md), acct = String(db.seq.acct);
        const off = mt === '561'
          ? { acct: '300000', name: tr('期初库存调整', 'Opening balance', '期首残高') }
          : { acct: '410101', name: tr('生产成本-原材料消耗', 'Consumption', '製造原価−材料消費') };
        db.matdocs.push({ no: md, type: mt, mat: mat, qty: qty, po: '', plant: v('plant', '1710'),
          sloc: v('sloc', '0001'), date: v('date', '2026-11-10'), amount: amount, acct: acct });
        db.accts.push({ no: acct, date: v('date', '2026-11-10'), ref: md, type: 'WE',
          lines: [{ pk: '40', acct: '140000', name: tr('库存商品（原材料）', 'Inventory', '棚卸資産'), dc: 'S', amt: amount },
            { pk: '50', acct: off.acct, name: off.name, dc: 'H', amt: amount }] });
        S.stockOf(mat, v('plant', '1710'), v('sloc', '0001')).unrestricted += qty;
        S.save();
        S.setStatus('ok', tr('物料凭证 ' + md + ' 已过账（' + mt + ' 无 PO 收货，会计凭证 ' + acct + '，金额 ' + money(amount) + '）',
          'Material document ' + md + ' posted (' + mt + ' without PO, acct doc ' + acct + ', ' + money(amount) + ')',
          '品目伝票 ' + md + ' を転記（' + mt + ' PO なし入庫、会計伝票 ' + acct + '、' + money(amount) + '）'), mt);
      }
    });
  };

  /* ============ MIRO 发票校验 ============ */
  S.screens.MIRO = function () {
    const v = S.val;
    const po = S.poNumber(String(v('po', st.poNo || '4500000123')));
    const grBased = !po || po.grBased !== false;
    const openQ = po ? Math.max(0, (grBased ? po.receivedQty : po.qty) - po.invoicedQty) : 0;
    const openV = po ? openQ * po.price : 0;
    const body = B(tr('凭证抬头', 'Document header', '伝票ヘッダ'),
      F('btype', tr('业务处理', 'Transaction', '処理'), { value: v('btype', '发票'), cls: 'w110', ro: true, mark: 1 }) +
      F('ven', tr('供应商', 'Vendor', '仕入先'), { req: true, mark: 2, value: v('ven', po ? po.vendor : '100123'), cls: 'w110' }) +
      F('invdate', tr('发票日期', 'Invoice date', '請求書日付'), { value: v('invdate', '2026-11-12'), cls: 'w110', mark: 3 }) +
      F('postdate', tr('过账日期', 'Posting date', '転記日付'), { value: v('postdate', '2026-11-12'), cls: 'w110' }) +
      F('amount', tr('发票金额（净）', 'Amount (net)', '金額（正味）'), { req: true, cls: 'w110', value: v('amount', po ? String(openV) : ''), mark: 4 }) +
      F('tax', tr('税码', 'Tax code', '税コード'), { value: v('tax', 'V0'), cls: 'w80', hint: 'V0 0% / V1 19%' })) +
      B(tr('采购订单参考', 'PO reference', '購買発注参照'),
        F('po', tr('采购订单', 'Purchase order', '購買発注'), { req: true, cls: 'w110', mark: 5 }) +
        F('item', tr('项目', 'Item', '明細'), { value: v('item', '10'), cls: 'w80' }) +
        F('grq', tr('已收货数量', 'Goods received', '入庫済数量'), { ro: true, value: po ? S.num(po.receivedQty) : '—', cls: 'w80' }) +
        F('grbased', tr('基于收货的 IV', 'GR-based IV', '入庫ベース IV'), { ro: true, value: po ? (po.grBased === false ? tr('否', 'No', 'いいえ') : tr('是', 'Yes', 'はい')) : '—', cls: 'w80' }) +
        F('openv', tr('仍可开票金额', 'Open to invoice', '残請求可能額'), { ro: true, value: po ? money(openV) : '—', cls: 'w110' })) +
      (po ? TBL([tr('PO 项目', 'PO item', 'PO 明細'), tr('物料', 'Material', '品目'), tr('收货数量', 'GR qty', '入庫数量'),
        tr('订单净价', 'Net price', '正味価格'), tr('金额', 'Amount', '金額'), tr('差异', 'Variance', '差異')],
      [['10', po.mat, S.num(po.receivedQty), money(po.price), money(S.parseNum(v('amount', String(openV)))),
        money(S.parseNum(v('amount', String(openV))) - openV)]], 'tctrl') : '') +
      '<p class="hint">' + S.esc(tr('容差（OMR6）：|差异| ≤ 50.00 记小额差异；≤ 1.000 % 记价格差异，都可直接过账；超过 1 % 仍过账但**冻结付款**（M8083），需 MRBR 解冻。',
        'Tolerance (OMR6): |variance| ≤ 50.00 → small difference; ≤ 1.000 % → price difference, both post directly; above 1 % posts but blocks payment (M8083) until MRBR.',
        '許容範囲（OMR6）：|差異| ≤ 50.00 は少額差異、≤ 1.000 % は価格差異でそのまま転記。1 % 超は転記後に支払ブロック（M8083）、MRBR で解除。')) + '</p>';
    return Object.assign(head(tr('输入进货发票', 'Enter Incoming Invoice', '入庫請求書の入力'), 'MIRO'), {
      body: body,
      onEnter: function () {
        const p = S.poNumber(String(v('po')));
        if (!p) { S.setStatus('err', S.msg('noPO', { n: v('po') })); return; }
        if (p.grBased !== false && !p.receivedQty) { S.setStatus('err', S.msg('noGRAllowed')); return; }
        const oq = (p.grBased === false ? p.qty : p.receivedQty) - p.invoicedQty;
        if (oq <= 0) { S.setStatus('err', S.msg('invoiced')); return; }
        if (!String(S.val('amount')).trim()) {
          S.state.form.amount = String(oq * p.price);
        }
        S.setStatus('ok', tr('已带出 PO 项目：可开票 ' + S.num(oq) + ' PC / ' + money(oq * p.price),
          'PO item loaded: ' + S.num(oq) + ' PC open', 'PO 明細を展開：残 ' + S.num(oq) + ' PC'));
      },
      onSave: function () {
        const db = S.db();
        if (!S.need('po', tr('采购订单', 'Purchase order', '購買発注'))) return;
        const p = S.poNumber(String(v('po')));
        if (!p) { S.setStatus('err', S.msg('noPO', { n: v('po') })); return; }
        if (p.grBased !== false && !p.receivedQty) { S.setStatus('err', S.msg('noGRAllowed')); return; }
        const openQ = (p.grBased === false ? p.qty : p.receivedQty) - p.invoicedQty;
        if (openQ <= 0) { S.setStatus('err', S.msg('invoiced')); return; }
        const amount = S.parseNum(v('amount'));
        if (!amount) { S.setStatus('err', S.msg('need', { f: tr('金额', 'Amount', '金額') })); return; }
        const grVal = openQ * p.price;
        const diff = amount - grVal;
        const tol = db.cfg.tol;
        const pct = grVal ? Math.abs(diff) / grVal * 100 : 0;
        if (pct > tol.PP && Math.abs(diff) > tol.BD) {
          // 超过容差：照真实系统 —— 发票仍然过账，但付款被冻结
          const taxX = v('tax', 'V0') === 'V1' ? amount * 0.19 : 0;
          db.seq.inv += 1; db.seq.acct += 1;
          const noX = String(db.seq.inv), acctX = String(db.seq.acct);
          const linesX = [{ pk: '40', acct: '191100', name: tr('GR/IR 暂估应计', 'GR/IR clearing', 'GR/IR 仮勘定'), dc: 'S', amt: grVal },
            { pk: '50', acct: '160000', name: tr('应付账款-供应商', 'Accounts payable', '買掛金'), dc: 'H', amt: amount + taxX }];
          if (taxX) linesX.push({ pk: '40', acct: '154000', name: tr('进项税', 'Input tax', '仮払消費税'), dc: 'S', amt: taxX });
          linesX.push({ pk: diff > 0 ? '40' : '50', acct: '660100', name: tr('价格差异（PRD）', 'Price difference', '価格差異'), dc: diff > 0 ? 'S' : 'H', amt: Math.abs(diff) });
          db.invoices[noX] = { no: noX, vendor: p.vendor, po: p.no, date: v('invdate', '2026-11-12'),
            amount: amount + taxX, net: amount, tax: taxX, diff: diff, pct: pct, qty: openQ,
            blocked: true, paid: false, posted: true, blockedBy: 'PP ' + tol.PP + '% / M8083' };
          db.accts.push({ no: acctX, date: v('postdate', '2026-11-12'), ref: noX, type: 'RE', lines: linesX });
          p.invoicedQty += openQ;
          S.save();
          S.setStatus('warn', tr('发票 ' + noX + ' 已过账但被冻结：差异 ' + money(diff) + '（' + pct.toFixed(3) + ' %）超出 PP 容差 ' + tol.PP + ' %，消息 M8083 · 用 MRBR 解冻后才能付款',
            'Invoice ' + noX + ' posted but blocked: variance ' + money(diff) + ' (' + pct.toFixed(3) + ' %) exceeds PP tolerance ' + tol.PP + ' % (M8083). Release with MRBR.',
            '請求書 ' + noX + ' は転記済だがブロック：差異 ' + money(diff) + '（' + pct.toFixed(3) + ' %）が PP 許容 ' + tol.PP + ' % を超過（M8083）。MRBR で解除してください。'), 'M8083');
          return;
        }
        // 容差内：|差额| ≤ BD 记小额差异，其余记价格差异；都可以直接过账
        const small = Math.abs(diff) <= tol.BD;
        const tax = v('tax', 'V0') === 'V1' ? amount * 0.19 : 0;
        db.seq.inv += 1; db.seq.acct += 1;
        const no = String(db.seq.inv), acct = String(db.seq.acct);
        const lines = [{ pk: '40', acct: '191100', name: tr('GR/IR 暂估应计', 'GR/IR clearing', 'GR/IR 仮勘定'), dc: 'S', amt: grVal },
          { pk: '50', acct: '160000', name: tr('应付账款-供应商', 'Accounts payable', '買掛金'), dc: 'H', amt: amount + tax }];
        if (tax) lines.push({ pk: '40', acct: '154000', name: tr('进项税', 'Input tax', '仮払消費税'), dc: 'S', amt: tax });
        if (Math.abs(diff) > 0.005) {
          lines.push({ pk: diff > 0 ? '40' : '50', acct: small ? '660000' : '660100',
            name: small ? tr('小额差异', 'Small difference', '少額差異') : tr('价格差异（PRD）', 'Price difference', '価格差異'),
            dc: diff > 0 ? 'S' : 'H', amt: Math.abs(diff) });
        }
        db.invoices[no] = { no: no, vendor: p.vendor, po: p.no, date: v('invdate', '2026-11-12'),
          amount: amount + tax, net: amount, tax: tax, diff: diff, pct: pct, qty: openQ,
          blocked: false, paid: false, posted: true };
        db.accts.push({ no: acct, date: v('postdate', '2026-11-12'), ref: no, type: 'RE', lines: lines });
        p.invoicedQty += openQ;
        S.save();
        S.setStatus('ok', tr('发票凭证 ' + no + ' 已过账（会计凭证 ' + acct + '）' + (Math.abs(diff) > 0.005
            ? '；差异 ' + money(diff) + ' 在容差内，记入' + (small ? '小额差异 660000' : '价格差异 660100')
            : (p.grBased === false ? '；未做收货，GR/IR 形成借方余额（先票后货）' : '；与收货金额一致，GR/IR 已结清')),
          'Invoice ' + no + ' posted (acct doc ' + acct + ')' + (Math.abs(diff) > 0.005 ? '; variance ' + money(diff) + ' within tolerance' : (p.grBased === false ? '; no GR yet — GR/IR is a debit balance' : '; matches GR, GR/IR cleared')),
          '請求書 ' + no + ' を転記（会計伝票 ' + acct + '）' + (Math.abs(diff) > 0.005 ? '；差異 ' + money(diff) + ' は許容内' : (p.grBased === false ? '；未入庫のため GR/IR は借方残' : '；入庫額と一致、GR/IR 消込済'))), 'IV');
      }
    });
  };

  /* ============ MIR4 显示发票 ============ */
  S.screens.MIR4 = function () {
    const db = S.db();
    const no = String(S.val('inv', Object.keys(db.invoices).slice(-1)[0] || ''));
    const inv = db.invoices[no];
    let body = B(tr('发票凭证', 'Invoice document', '請求書伝票'),
      F('inv', tr('发票凭证号', 'Invoice document', '請求書伝票番号'), { cls: 'w160', value: no }) +
      (inv ? '' : '<p class="hint">' + S.esc(tr('输入发票号后回车（先做 MIRO）。', 'Enter an invoice number (run MIRO first).', '請求書番号を入力して Enter（先に MIRO）。')) + '</p>'));
    if (inv) {
      const acct = db.accts.filter(function (a) { return a.ref === inv.no; })[0];
      body += B(tr('抬头', 'Header', 'ヘッダ'),
        '<div class="frow"><span class="flabel">' + S.esc(tr('供应商', 'Vendor', '仕入先')) + '</span><span class="inp ro w110">' + inv.vendor + '</span></div>' +
        '<div class="frow"><span class="flabel">' + S.esc(tr('采购订单 / 日期', 'PO / date', 'PO／日付')) + '</span><span class="inp ro w160">' + inv.po + ' / ' + inv.date + '</span></div>' +
        '<div class="frow"><span class="flabel">' + S.esc(tr('净额 / 税额 / 总额', 'Net / tax / total', '正味／税／合計')) + '</span><span class="inp ro w220">' + money(inv.net) + ' / ' + money(inv.tax) + ' / ' + money(inv.amount) + '</span></div>' +
        '<div class="frow"><span class="flabel">' + S.esc(tr('状态', 'Status', 'ステータス')) + '</span><span class="inp ro w160">' +
        (inv.blocked ? tr('冻结（待 MRBR 解冻）', 'Blocked (MRBR)', 'ブロック（MRBR）') : inv.paid ? tr('已付款清账', 'Paid', '支払済') : tr('已过账/未付款', 'Posted', '転記済')) + '</span></div>') +
        (acct ? TBL([tr('PK', 'PK', 'PK'), tr('科目', 'G/L account', '勘定科目'), tr('名称', 'Name', '名称'),
          tr('借/贷', 'D/C', '借/貸'), tr('金额', 'Amount', '金額')],
        acct.lines.map(function (l) { return [l.pk, l.acct, S.esc(l.name), l.dc === 'S' ? tr('借', 'Debit', '借方') : tr('贷', 'Credit', '貸方'), money(l.amt)]; })) : '');
    }
    return Object.assign(head(tr('显示发票凭证', 'Display Invoice Document', '請求書伝票の照会'), 'MIR4'), {
      body: body,
      onEnter: function () { S.open('MIR4', { inv: String(S.val('inv')) }); },
      onSave: function () { S.setStatus('err', S.msg('readonly')); }
    });
  };

  /* ============ MRBR 释放冻结发票 ============ */
  S.screens.MRBR = function () {
    const db = S.db();
    const list = Object.keys(db.invoices).filter(function (k) { return db.invoices[k].blocked && !db.invoices[k].paid; });
    const rows = list.map(function (k) {
      const i = db.invoices[k];
      return [i.no, i.po, i.vendor, i.date, money(i.amount), money(i.diff),
        '<button class="gbtn primary" onclick="SIM.release(\'' + i.no + '\')">' + S.esc(tr('解冻', 'Release', '解除')) + '</button>'];
    });
    const body = B(tr('冻结发票', 'Blocked invoices', 'ブロック請求書'),
      list.length ? TBL([tr('发票', 'Invoice', '請求書'), tr('PO', 'PO', 'PO'), tr('供应商', 'Vendor', '仕入先'),
        tr('日期', 'Date', '日付'), tr('金额', 'Amount', '金額'), tr('差异', 'Variance', '差異'), tr('操作', 'Action', '操作')], rows)
        : '<p class="hint">' + S.esc(tr('没有冻结发票。MIRO 里做一张有差异的发票就会出现在这里。', 'No blocked invoices. Post a PO invoice with a variance in MIRO.', 'ブロック請求書はありません。MIRO で差異のある請求書を転記すると表示されます。')) + '</p>');
    return Object.assign(head(tr('释放冻结发票', 'Release Blocked Invoices', 'ブロック請求書の解除'), 'MRBR'), {
      body: body,
      onEnter: function () { S.setStatus('info', tr('按发票解冻后即可付款', 'Release, then pay in F-53', '解除後に F-53 で支払')); },
      onSave: function () { S.setStatus('err', S.msg('readonly')); }
    });
  };
  window.SIM.bpToggle = function () {
    st.form.autoPO = String(st.form.autoPO || '☐').indexOf('☑') >= 0 ? '☐' : '☑';
    S.paint();
  };
  window.SIM.release = function (no) {
    const inv = S.db().invoices[no];
    if (!inv) { S.setStatus('err', S.msg('notfound', { d: tr('发票', 'Invoice', '請求書'), no: no })); S.paint(); return; }
    inv.blocked = false;
    inv.released = true;
    S.save();
    st.screen = S.screens.MRBR();
    S.setStatus('ok', tr('发票 ' + no + ' 已解冻，可在 F-53 付款', 'Invoice ' + no + ' released', '請求書 ' + no + ' を解除しました'));
  };

  /* ============ MB5S GR/IR 余额 ============ */
  S.screens.MB5S = function () {
    const db = S.db();
    const rows = [];
    let total = 0;
    Object.keys(db.pos).forEach(function (k) {
      const p = db.pos[k];
      const grv = (p.receivedQty || 0) * p.price;
      const irv = (p.invoicedQty || 0) * p.price;
      const bal = grv - irv;
      total += bal;
      rows.push([p.no, '10', p.mat, p.vendor, S.num(p.receivedQty), money(grv), S.num(p.invoicedQty), money(irv), money(bal)]);
    });
    let body = B(tr('GR/IR 暂估科目明细', 'GR/IR clearing items', 'GR/IR 仮勘定明細'),
      rows.length ? TBL([tr('PO', 'PO', 'PO'), tr('项目', 'Item', '明細'), tr('物料', 'Material', '品目'),
        tr('供应商', 'Vendor', '仕入先'), tr('已收货', 'Received', '入庫済'), tr('收货金额', 'GR value', '入庫金額'),
        tr('已开票', 'Invoiced', '請求済'), tr('发票金额', 'IR value', '請求金額'), tr('余额', 'Balance', '残高')], rows)
        : '<p class="hint">' + S.esc(tr('还没有采购订单。', 'No purchase orders yet.', '購買発注がありません。')) + '</p>');
    body += '<div class="frow" style="margin-top:10px"><span class="flabel">' + S.esc(tr('GR/IR 余额合计', 'Total GR/IR balance', 'GR/IR 残高合計')) +
      '</span><span class="inp ro w110">' + money(total) + ' USD</span>' +
      '<span class="hint">' + S.esc(tr('收货未开票为正（暂估负债），开票未收货为负（预付款）', 'Positive = received not invoiced', '正＝入庫未請求')) + '</span></div>';
    return Object.assign(head(tr('GR/IR 余额清单', 'GR/IR Balance', 'GR/IR 残高一覧'), 'MB5S'), {
      body: body,
      onEnter: function () { S.setStatus('info', tr('收货与发票一致时余额应为 0', 'Balance is 0 when GR and IR match', '入庫と請求が一致すれば残高 0')); },
      onSave: function () { S.setStatus('err', S.msg('readonly')); }
    });
  };

  /* ============ MB1B 转储 / 发货 ============ */
  S.screens.MB1B = function () {
    const v = S.val;
    const mt = String(v('mtype', '311'));
    const issue = mt === '261';
    const body = B(tr('抬头', 'Header', 'ヘッダ'),
      F('mtype', tr('移动类型', 'Movement type', '移動タイプ'), { value: mt, cls: 'w80', mark: 1, hint: '311 库位转储 / 261 发货' }) +
      F('date', tr('过账日期', 'Posting date', '転記日付'), { value: v('date', '2026-11-18'), cls: 'w110' }) +
      F('order', tr('订单（261）', 'Order (261)', '指図（261）'), { value: v('order', '1000234'), cls: 'w110' })) +
      B(tr('项目 1', 'Item 1', '明細 1'),
        F('mat', tr('物料', 'Material', '品目'), { req: true, value: v('mat', 'R-1001'), cls: 'w110' }) +
        F('qty', tr('数量', 'Quantity', '数量'), { req: true, cls: 'w80', ph: '50' }) +
        F('plant', tr('工厂', 'Plant', 'プラント'), { value: v('plant', '1710'), cls: 'w80' }) +
        F('from', tr('发出库存地点', 'Issuing SLoc', '払出保管場所'), { value: v('from', '0001'), cls: 'w80' }) +
        F('to', tr('接收库存地点 / 收货方', 'Receiving SLoc', '受入保管場所'), { value: v('to', '0002'), cls: 'w80', hint: issue ? tr('261 不填', 'Not used for 261', '261 では不要') : '' })) +
      '<p class="hint">' + S.esc(issue
        ? tr('261 发料到生产订单：库存减少，费用增加（不产生 GR/IR）。', '261 issues to a production order: stock down, consumption up.', '261 は製造指図へ払出：在庫減・消費増。')
        : tr('311 库位间转储：只在库存地点之间挪动，不产生会计凭证。', '311 moves stock between storage locations, no accounting document.', '311 は保管場所間の移動のみで会計伝票は生成されません。')) + '</p>';
    return Object.assign(head(tr('转储过账', 'Transfer Posting', '転送転記'), 'MB1B'), {
      body: body,
      onEnter: function () { S.setStatus('info', S.msg('press')); },
      onSave: function () {
        const db = S.db();
        if (!S.need('mat', tr('物料', 'Material', '品目'))) return;
        const mat = String(v('mat')).toUpperCase(), qty = S.parseNum(v('qty'));
        const plant = v('plant', '1710'), from = v('from', '0001'), to = v('to', '0002');
        const m = db.materials[mat];
        if (!m) { S.setStatus('err', S.msg('notfound', { d: tr('物料', 'Material', '品目'), no: mat })); return; }
        if (!qty) { S.setStatus('err', S.msg('need', { f: tr('数量', 'Quantity', '数量') })); return; }
        const src = S.stockOf(mat, plant, from);
        if (src.unrestricted < qty) { S.setStatus('err', S.msg('stock', { q: S.num(src.unrestricted) })); return; }
        src.unrestricted -= qty;
        db.seq.md += 1;
        const md = String(db.seq.md);
        if (issue) {
          db.seq.acct += 1;
          const acct = String(db.seq.acct);
          const amount = qty * m.stdPrice;
          db.accts.push({ no: acct, date: v('date', '2026-11-18'), ref: md, type: 'WA',
            lines: [{ pk: '40', acct: '410101', name: tr('生产成本-原材料消耗', 'Consumption', '製造原価−材料消費'), dc: 'S', amt: amount },
              { pk: '50', acct: '140000', name: tr('库存商品（原材料）', 'Inventory', '棚卸資産'), dc: 'H', amt: amount }] });
          db.matdocs.push({ no: md, type: '261', mat: mat, qty: qty, plant: plant, sloc: from,
            from: from, date: v('date', '2026-11-18'), amount: amount, acct: acct });
          S.save();
          S.setStatus('ok', tr('物料凭证 ' + md + '（261 发货，会计凭证 ' + acct + '，金额 ' + money(amount) + '）',
            'Material document ' + md + ' (261, acct doc ' + acct + ')', '品目伝票 ' + md + '（261、会計伝票 ' + acct + '）'), '261');
          return;
        }
        S.stockOf(mat, plant, to).unrestricted += qty;
        db.matdocs.push({ no: md, type: mt, mat: mat, qty: qty, plant: plant, sloc: to,
          from: from, date: v('date', '2026-11-18'), amount: 0 });
        S.save();
        S.setStatus('ok', S.msg('posted', { d: tr('物料凭证', 'Material document', '品目伝票'), no: md }) +
          ' · ' + tr('0001 → 0002', '0001 → 0002', '0001 → 0002'), mt);
      }
    });
  };

  /* ============ MMBE 库存总览 ============ */
  S.screens.MMBE = function () {
    const db = S.db();
    const rows = [];
    Object.keys(db.materials).forEach(function (m) {
      Object.keys(db.stock).forEach(function (k) {
        const p = k.split('/');
        if (p[0] !== m) return;
        const s = db.stock[k];
        if (!s.unrestricted && !s.qi && !s.blocked) return;
        rows.push([m, S.esc(S.t(db.materials[m].desc)), p[1], p[2], S.num(s.unrestricted), S.num(s.qi), S.num(s.blocked), db.materials[m].unit]);
      });
    });
    const body = TBL([tr('物料', 'Material', '品目'), tr('描述', 'Description', '品目テキスト'), tr('工厂', 'Plant', 'プラント'),
      tr('库存地点', 'SLoc', '保管場所'), tr('非限制', 'Unrestricted', '非制限'), tr('质检', 'QI', '検査'),
      tr('冻结', 'Blocked', 'ブロック'), tr('单位', 'Unit', '単位')], rows) +
      '<p class="hint">' + S.esc(tr('入库（101/501/561）增加非限制库存；261 / 122 减少。合计 = 各库位相加。',
        'Receipts increase unrestricted stock; 261 / 122 decrease it.', '入庫で非制限在庫が増え、261／122 で減ります。')) + '</p>';
    return Object.assign(head(tr('库存总览', 'Stock Overview', '在庫概要'), 'MMBE'), {
      body: body, onEnter: function () { S.setStatus('info', tr('按工厂 / 库存地点汇总', 'Summarised by plant / SLoc', 'プラント／保管場所別')); },
      onSave: function () { S.setStatus('err', S.msg('readonly')); }
    });
  };

  /* ============ MD04 库存需求清单 ============ */
  S.screens.MD04 = function () {
    const db = S.db();
    const mat = String(S.val('mat', 'R-1001')).toUpperCase();
    const plant = S.val('plant', '1710');
    const m = db.materials[mat];
    let body = B(tr('物料 / 工厂', 'Material / plant', '品目／プラント'),
      F('mat', tr('物料', 'Material', '品目'), { value: mat, cls: 'w110' }) +
      F('plant', tr('工厂', 'Plant', 'プラント'), { value: plant, cls: 'w80' }));
    if (!m) {
      body += '<p class="hint">' + S.esc(tr('物料不存在。先用 MM01 建 R-1001。', 'Material does not exist. Create R-1001 in MM01 first.', '品目がありません。先に MM01 で R-1001 を作成。')) + '</p>';
    } else {
      const avail = plantStock(mat, plant);
      const demands = (db.req[mat + '/' + plant] || []);
      const need = demands.reduce(function (a, d) { return a + d.qty; }, 0);
      const net = Math.max(0, need + (m.safety || 0) - avail);
      const rows = demands.map(function (d) {
        return [d.date, S.esc(S.t(d.ref)), S.num(d.qty), '0', S.num(avail)];
      });
      if (m.safety) rows.push(['—', tr('安全库存', 'Safety stock', '安全在庫'), S.num(m.safety), '0', '—']);
      if (net > 0) rows.push([tr('按提前期倒推', 'Backward scheduled', '逆算'), tr('采购申请（建议）', 'Requisition (proposal)', '購買依頼（提案）'), '0', S.num(net), '0']);
      body += B(tr('MRP 参数', 'MRP parameters', 'MRP パラメータ'),
        '<div class="frow"><span class="flabel">' + S.esc(tr('MRP 类型 / 批量', 'MRP type / lot size', 'MRP タイプ／ロット')) + '</span><span class="inp ro w160">' + m.mrpType + ' / ' + m.lotSize + '</span></div>' +
        '<div class="frow"><span class="flabel">' + S.esc(tr('安全库存', 'Safety stock', '安全在庫')) + '</span><span class="inp ro w80">' + S.num(m.safety) + '</span></div>' +
        '<div class="frow"><span class="flabel">' + S.esc(tr('可用库存（工厂合计）', 'Available stock (plant)', '有効在庫（プラント計）')) + '</span><span class="inp ro w80">' + S.num(avail) + ' ' + m.unit + '</span></div>' +
        '<div class="frow"><span class="flabel">' + S.esc(tr('净需求 = 需求 + 安全库存 − 可用', 'Net = demand + safety − stock', '正味 = 需要 + 安全在庫 − 有効在庫')) +
        '</span><span class="inp ro w80">' + S.num(net) + ' ' + m.unit + '</span></div>') +
        TBL([tr('日期', 'Date', '日付'), tr('MRP 元素', 'MRP element', 'MRP 要素'), tr('需求', 'Requirement', '需要'),
          tr('收货/在途', 'Receipt', '入庫'), tr('可用数量', 'Available', '有効数量')], rows) +
        '<div class="btnrow" style="margin-top:8px">' +
        '<button class="gbtn primary" onclick="SIM.mrp()">' + S.esc(tr('运行 MRP（MD02）', 'Run MRP (MD02)', 'MRP 実行（MD02）')) + '</button></div>';
    }
    return Object.assign(head(tr('库存需求清单', 'Stock/Requirements List', '在庫所要量一覧'), 'MD04'), {
      body: body,
      onEnter: function () { S.open('MD04', { mat: mat, plant: plant }); },
      onSave: function () { S.setStatus('err', S.msg('readonly')); }
    });
  };

  /* ============ FB03 会计凭证 ============ */
  S.screens.FB03 = function () {
    const db = S.db();
    const no = String(S.val('doc', Object.keys(db.accts).slice(-1)[0] || ''));
    const a = db.accts.filter(function (x) { return x.no === no; })[0];
    const recent = db.accts.slice(-5).reverse().map(function (x) {
      return '<div class="frow"><span class="inp ro w160" style="cursor:pointer" onclick="SIM.go(\'FB03\');document.getElementById(\'cmd\')">' + x.no + '</span>' +
        '<span class="hint">' + S.esc(x.date + ' · ' + (x.type || '') + ' · ' + x.ref) + '</span></div>';
    }).join('');
    let body = B(tr('凭证', 'Document', '伝票'),
      F('doc', tr('会计凭证号', 'Accounting document', '会計伝票番号'), { cls: 'w160', value: no }));
    if (a) {
      const sum = a.lines.reduce(function (s, l) { return s + (l.dc === 'S' ? l.amt : 0); }, 0);
      body += B(tr('凭证 ' + a.no + ' · ' + a.date, 'Document ' + a.no, '伝票 ' + a.no),
        '<div class="frow"><span class="flabel">' + S.esc(tr('参考凭证', 'Reference', '参照伝票')) + '</span><span class="inp ro w160">' + a.ref + '</span></div>' +
        '<div class="frow"><span class="flabel">' + S.esc(tr('凭证类型', 'Doc. type', '伝票タイプ')) + '</span><span class="inp ro w80">' + (a.type || '') + '</span></div>') +
        TBL([tr('PK', 'PK', 'PK'), tr('科目', 'G/L', '勘定'), tr('名称', 'Name', '名称'), tr('借/贷', 'D/C', '借/貸'), tr('金额', 'Amount', '金額')],
        a.lines.map(function (l) {
          return [l.pk, l.acct, S.esc(l.name), l.dc === 'S' ? tr('借', 'Debit', '借方') : tr('贷', 'Credit', '貸方'), money(l.amt)];
        })) +
        '<div class="frow" style="margin-top:8px"><span class="flabel">' + S.esc(tr('借方合计', 'Debit total', '借方合計')) + '</span><span class="inp ro w110">' + money(sum) + '</span></div>';
    } else {
      body += '<p class="hint">' + S.esc(tr('输入凭证号回车；下面最近 5 张可直接点。', 'Enter a document number; the last 5 are listed below.', '伝票番号を入力して Enter。直近 5 件は下に表示。')) + '</p>' + recent;
    }
    return Object.assign(head(tr('显示会计凭证', 'Display Accounting Document', '会計伝票の照会'), 'FB03'), {
      body: body,
      onEnter: function () { S.open('FB03', { doc: String(S.val('doc')) }); },
      onSave: function () { S.setStatus('err', S.msg('readonly')); }
    });
  };

  /* ============ F-53 付款 ============ */
  S.screens['F-53'] = function () {
    const v = S.val;
    const db = S.db();
    const open = Object.keys(db.invoices).filter(function (k) { return !db.invoices[k].paid; });
    const rows = open.map(function (k) {
      const i = db.invoices[k];
      return [i.no, i.date, i.po, money(i.amount), i.vendor, i.blocked ? tr('冻结', 'blocked', 'ブロック') : tr('可付款', 'open', '可払')];
    });
    const first = open.filter(function (k) { return !db.invoices[k].blocked; })[0];
    const body = B(tr('凭证抬头', 'Document header', '伝票ヘッダ'),
      F('ven', tr('供应商', 'Vendor', '仕入先'), { req: true, value: v('ven', '100123'), cls: 'w110' }) +
      F('bank', tr('银行科目', 'Bank account', '銀行勘定'), { value: v('bank', '100000'), cls: 'w110', mark: 1 }) +
      F('amount', tr('金额', 'Amount', '金額'), { req: true, cls: 'w110', mark: 2, value: v('amount', first ? String(db.invoices[first].amount) : '') }) +
      F('date', tr('凭证日期', 'Doc. date', '伝票日付'), { value: v('date', '2026-11-17'), cls: 'w110' })) +
      B(tr('未清项', 'Open items', '未決済明細'),
        open.length ? TBL([tr('凭证', 'Document', '伝票'), tr('日期', 'Date', '日付'), tr('PO', 'PO', 'PO'),
          tr('金额', 'Amount', '金額'), tr('供应商', 'Vendor', '仕入先'), tr('状态', 'Status', '状態')], rows)
          : '<p class="hint">' + S.esc(tr('没有未清项。先做 MIRO 发票校验。', 'No open items. Post an invoice in MIRO first.', '未決済がありません。先に MIRO で請求書を転記。')) + '</p>');
    return Object.assign(head(tr('付款凭证', 'Payment', '支払伝票'), 'F-53'), {
      body: body,
      onEnter: function () { S.setStatus('info', S.msg('press')); },
      onSave: function () {
        const ven = String(v('ven'));
        const all = Object.keys(db.invoices).filter(function (k) { return !db.invoices[k].paid && db.invoices[k].vendor === ven; });
        if (!all.length) { S.setStatus('err', S.msg('noItem')); return; }
        const usable = all.filter(function (k) { return !db.invoices[k].blocked; });
        if (!usable.length) {
          S.setStatus('err', tr('供应商有冻结发票：请先在 MRBR 解冻', 'Blocked invoices exist: release them in MRBR first', 'ブロック請求書があります：先に MRBR で解除'), 'MRBR'); return;
        }
        const inv = db.invoices[usable[0]];
        db.seq.acct += 1;
        const acct = String(db.seq.acct);
        db.accts.push({ no: acct, date: v('date', '2026-11-17'), ref: inv.no, type: 'KZ',
          lines: [{ pk: '40', acct: '160000', name: tr('应付账款-供应商', 'Accounts payable', '買掛金'), dc: 'S', amt: inv.amount },
            { pk: '50', acct: v('bank', '100000'), name: tr('银行存款', 'Bank', '預金'), dc: 'H', amt: inv.amount }] });
        inv.paid = true;
        db.payments.push({ no: acct, vendor: ven, invoice: inv.no, amount: inv.amount, date: v('date', '2026-11-17') });
        S.save();
        S.setStatus('ok', tr('付款已过账并清账：会计凭证 ' + acct + '，金额 ' + money(inv.amount),
          'Payment posted and cleared: doc ' + acct + ', ' + money(inv.amount),
          '支払を転記し消込：会計伝票 ' + acct + '、' + money(inv.amount)), 'F-53');
      }
    });
  };

  /* ============ MRP 动作 ============ */
  window.SIM.mrp = function () {
    const db = S.db();
    const mat = String(S.val('mat', 'R-1001')).toUpperCase();
    const plant = S.val('plant', '1710');
    const m = db.materials[mat];
    if (!m) { S.setStatus('err', S.msg('notfound', { d: tr('物料', 'Material', '品目'), no: mat })); S.paint(); return; }
    if (m.mrpType === 'ND') { S.setStatus('err', tr('MRP 类型 ND：不参与计划', 'MRP type ND: not planned', 'MRP タイプ ND：計画対象外')); S.paint(); return; }
    const avail = plantStock(mat, plant);
    const need = (db.req[mat + '/' + plant] || []).reduce(function (a, d) { return a + d.qty; }, 0);
    const net = Math.max(0, need + (m.safety || 0) - avail);
    if (!net) { S.setStatus('info', S.msg('mrpNone')); S.paint(); return; }
    db.seq.pr += 1;
    const no = String(db.seq.pr);
    db.prs[no] = { no: no, mat: mat, qty: net, deliv: '2026-11-18', plant: plant, sloc: m.sloc,
      org: '1710', group: '001', status: 'open', approved: true, source: 'MRP' };
    S.state.prNo = no;
    S.save();
    st.screen = S.screens.MD04();
    S.setStatus('ok', S.msg('mrpDone', { n: no, q: S.num(net) }) + ' · ' + tr('来源标记 MRP', 'source MRP', 'ソース MRP'));
    S.paint();
  };
})();
