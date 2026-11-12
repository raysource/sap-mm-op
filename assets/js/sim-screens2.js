/* SAP GUI 8.10 仿真器 · 画面层（二）：登录、物料变更、货源清单、信息记录、定制、无 PO 收货、发货、GR/IR 清账、期间 */
(function () {
  'use strict';
  const F = S.fld, B = S.box, TB = S.tabs, TBL = S.table;
  const st = S.state;

  function tr(zh, en, ja) { return S.t(S.L(zh, en, ja)); }
  function head(title, tcode) { return { tcode: tcode, title: title }; }
  function refresh(tcode) { st.screen = S.screens[tcode.toUpperCase()](); }

  // 收货过账：物料凭证 + 会计凭证（库存 Dr / GR/IR Cr），库存增加
  function postGR(o) {
    const db = S.db();
    db.seq.md += 1;
    const md = String(db.seq.md);
    const acct = S.postAcct(o.date, [
      { pk: '40', acct: '140000', name: tr('库存商品（原材料）', 'Inventory', '棚卸資産'), dc: 'S', amt: o.amount },
      { pk: '50', acct: '191100', name: tr('GR/IR 暂估应计', 'GR/IR clearing', 'GR/IR 仮勘定'), dc: 'H', amt: o.amount }
    ], md);
    db.matdocs.push({ no: md, type: o.type || '101', mat: o.mat, plant: o.plant, sloc: o.sloc,
      qty: o.qty, po: o.po || '', date: o.date, amount: o.amount, acct: acct.no, vendor: o.vendor || '' });
    S.stockOf(o.mat, o.plant, o.sloc).unrestricted += o.qty;
    return { md: md, acct: acct.no };
  }

  /* ================= SAP Logon 8.10 ================= */
  S.screens.LOGIN = function () {
    const CONNS = [
      { sys: 'S4H', desc: tr('SAP S/4HANA 生产', 'SAP S/4HANA Production', 'SAP S/4HANA 本番'), client: '100', env: 'PRD', note: tr('生产系统 —— 不要练手', 'Production — do not practise here', '本番環境 — 練習禁止') },
      { sys: 'S4H', desc: tr('SAP S/4HANA 测试', 'SAP S/4HANA Quality', 'SAP S/4HANA テスト'), client: '110', env: 'QAS', note: tr('培训客户端（本课）', 'Training client (this course)', '研修クライアント（本コース）') },
      { sys: 'IDES', desc: tr('IDES 教学沙箱', 'IDES sandbox', 'IDES サンドボックス'), client: '00', env: 'DEV', note: tr('旧版演示系统', 'Legacy demo system', '旧デモシステム') }
    ];
    const rows = CONNS.map(function (c) {
      return '<div class="node" onclick="SIM.loginDlg(\'' + c.client + '\')">' +
        '<span class="tw">▸</span><span class="tico"></span>' +
        '<b>' + c.sys + ' [' + c.env + '] ' + c.client + '</b>　' + S.esc(c.desc) +
        '　<span class="hint">' + S.esc(c.note) + '</span></div>';
    }).join('');
    const body = B(tr('连接', 'Connections', '接続'), '<div class="tree">' + rows + '</div>') +
      '<p class="hint">' + S.esc(tr('双击连接（或点一下）打开登录对话框。客户端 110 是本课的培训客户端；语言决定界面文字。',
        'Click a connection to open the logon dialog. Client 110 is the training client; the language field sets the UI language.',
        '接続をクリックするとログオンダイアログが開きます。クライアント 110 が研修用です。言語で UI が変わります。')) + '</p>' +
      '<p class="hint">' + S.esc(tr('登录后：命令字段输 T-code → 回车 → 填字段 → ✓ 保存。忘了 T-code 就点左侧「SAP Easy Access」。',
        'After logon: type a T-code in the command field → Enter → fill fields → ✓ to save.',
        'ログオン後：コマンドフィールドに T-code → Enter → 項目入力 → ✓ で保存。')) + '</p>';
    return Object.assign(head(tr('SAP Logon 8.10', 'SAP Logon 8.10', 'SAP Logon 8.10'), 'LOGIN'), {
      menu: [tr('连接', 'Connections', '接続'), tr('编辑', 'Edit', '編集'), tr('登录', 'Log On', 'ログオン'),
        tr('系统', 'System', 'システム'), tr('帮助', 'Help', 'ヘルプ')],
      body: body,
      onEnter: function () { S.setStatus('info', tr('请先登录（选中连接）', 'Select a connection and log on', '接続を選んでログオンしてください')); }
    });
  };

  window.SIM.loginDlg = function (client) {
    const f = st.form;
    if (!f.cc) f.cc = client || '110';
    if (!f.cu) f.cu = 'MMUSER01';
    if (!f.clang) f.clang = 'ZH';
    st.dialog = '<div class="dlg"><div class="dh"><span>' + S.esc(tr('SAP 系统登录', 'SAP System Logon', 'SAP システムログオン')) +
      '</span><span>✕</span></div><div class="db">' +
      F('cc', tr('客户端', 'Client', 'クライアント'), { value: S.val('cc', '110'), cls: 'w80', mark: 1 }) +
      F('cu', tr('用户', 'User', 'ユーザ'), { value: S.val('cu', 'MMUSER01'), cls: 'w120', mark: 2 }) +
      F('cpw', tr('口令', 'Password', 'パスワード'), { value: S.val('cpw', 'sap12345'), cls: 'w120', mark: 3 }) +
      F('clang', tr('语言', 'Language', '言語'), { value: S.val('clang', 'ZH'), cls: 'w80', mark: 4, hint: 'ZH / EN / JA' }) +
      '<p class="hint" style="margin:6px 0 0">' + S.esc(tr('本仿真器不校验真实口令：只要能坚持「客户端 110 + 用户 + 口令」这三格，就跟真机登录一样。',
        'The simulator does not check the real password; it only requires client, user and password like the real logon.',
        'このシミュレータは実パスワードを検証しません。クライアント・ユーザ・パスワードの 3 項目が揃えば本番と同じ動きです。')) + '</p>' +
      '</div><div class="df"><button class="gbtn" onclick="SIM.closeDlg()">' + S.esc(tr('取消', 'Cancel', '取消')) +
      '</button><button class="gbtn primary" onclick="SIM.loginOk()">' + S.esc(tr('登录', 'Log On', 'ログオン')) +
      '</button></div></div>';
    st.__enterDlg = 'loginOk';
    S.paint();
  };
  window.SIM.loginOk = function () {
    const f = st.form;
    st.dialog = null; st.__enterDlg = null;
    window.SIM.login(f.cc, f.cu, f.cpw, f.clang);
  };

  /* ================= MM02 更改物料 ================= */
  S.screens.MM02 = function () {
    const v = S.val, db = S.db();
    const mat = String(v('mat', '')).toUpperCase();
    const m = db.materials[mat];
    const step = v('mm2Step', 'init');
    let body;
    if (step === 'init' || !m) {
      body = B(tr('物料', 'Material', '品目'),
        F('mat', tr('物料', 'Material', '品目'), { req: true, mark: 1, value: mat || '', ph: 'R-1002' }) +
        '<p class="hint">' + S.esc(tr('输入物料号回车。种子数据：R-1002（铝合金外壳，180.00）、R-1003（密封圈，12.50）。',
          'Enter a material number. Seeded: R-1002 (180.00) and R-1003 (12.50).',
          '品目コードを入力して Enter。初期データ：R-1002（180.00）、R-1003（12.50）。')) + '</p>');
    } else {
      const onAuto = v('autoPO') === 'X' || v('autoPO') === '☑';
      body = TB([tr('基本数据', 'Basic data', '基本データ'), tr('采购', 'Purchasing', '購買'),
        tr('MRP 1', 'MRP 1', 'MRP 1'), tr('工厂 / 存储', 'Plant / storage', 'プラント／保管'),
        tr('会计 1', 'Accounting 1', '会計 1')], 1) +
        B(tr('物料 ' + mat + ' · ' + m.type, 'Material ' + mat, '品目 ' + mat),
          F('desc', tr('描述', 'Description', '品目テキスト'), { value: v('desc', S.t(m.desc)), cls: 'w220', mark: 1 }) +
          F('unit', tr('基本计量单位', 'Base unit', '基本単位'), { value: v('unit', m.unit), cls: 'w80', ro: true })) +
        B(tr('采购', 'Purchasing', '購買'),
          F('pgroup', tr('采购组', 'Purchasing group', '購買グループ'), { value: v('pgroup', m.purchGroup), cls: 'w80' }) +
          F('autoPO', tr('自动采购单', 'Automatic PO', '自動発注'), { value: onAuto ? '☑ X' : '☐', cls: 'w80', mark: 2,
            hint: tr('点右侧勾选框切换', 'Click to toggle', 'クリックで切替') }) +
          '<div class="frow"><span class="flabel"></span><span class="inp" style="width:120px;cursor:pointer;text-align:center" onclick="SIM.mm2Toggle()">' +
          S.esc(tr('切换勾选', 'Toggle', '切替')) + '</span></div>') +
        B(tr('MRP 1', 'MRP 1', 'MRP 1'),
          F('mrp', tr('MRP 类型', 'MRP type', 'MRP タイプ'), { value: v('mrp', m.mrpType), cls: 'w80' }) +
          F('lot', tr('批量', 'Lot size', 'ロット'), { value: v('lot', m.lotSize), cls: 'w80' }) +
          F('safety', tr('安全库存', 'Safety stock', '安全在庫'), { value: v('safety', String(m.safety)), cls: 'w80' })) +
        B(tr('工厂 / 存储 1', 'Plant / storage 1', 'プラント／保管 1'),
          F('plant', tr('工厂', 'Plant', 'プラント'), { value: v('plant', m.plant), cls: 'w80' }) +
          F('sloc', tr('库存地点', 'Storage loc.', '保管場所'), { value: v('sloc', m.sloc), cls: 'w80' })) +
        B(tr('会计 1', 'Accounting 1', '会計 1'),
          F('valclass', tr('评估类', 'Valuation class', '評価クラス'), { value: v('valclass', m.valClass), cls: 'w80' }) +
          F('pc', tr('价格控制', 'Price control', '価格管理'), { value: v('pc', m.priceControl), cls: 'w80' }) +
          F('std', tr('标准价格', 'Standard price', '標準価格'), { value: v('std', S.fmt(m.stdPrice)), cls: 'w110' }));
    }
    return Object.assign(head(tr('更改物料', 'Change Material', '品目マスタの変更'), 'MM02'), {
      body: body,
      onEnter: function () {
        const code = String(S.val('mat')).toUpperCase();
        if (!code) { S.setStatus('err', S.msg('need', { f: tr('物料', 'Material', '品目') })); return; }
        const mm = S.db().materials[code];
        if (!mm) { S.setStatus('err', S.msg('notfound', { d: tr('物料', 'Material', '品目'), no: code })); return; }
        if (S.val('mm2Step') !== 'edit') {
          st.form.mm2Step = 'edit';
          st.form.mat = code;
          st.form.desc = S.t(mm.desc);
          st.form.unit = mm.unit;
          st.form.pgroup = mm.purchGroup;
          st.form.autoPO = mm.autoPO ? '☑ X' : '☐';
          st.form.mrp = mm.mrpType; st.form.lot = mm.lotSize; st.form.safety = String(mm.safety);
          st.form.plant = mm.plant; st.form.sloc = mm.sloc;
          st.form.valclass = mm.valClass; st.form.pc = mm.priceControl; st.form.std = S.fmt(mm.stdPrice);
          S.open('MM02', st.form);
          S.setStatus('ok', tr('物料 ' + code + ' 已读出，修改后点 ✓ 保存', 'Material ' + code + ' loaded', '品目 ' + code + ' を読み込みました'));
          return;
        }
        S.setStatus('info', tr('检查已通过（未保存）', 'Check passed (not saved)', 'チェック OK（未保存）'));
      },
      onSave: function () {
        if (S.val('mm2Step') !== 'edit') { S.setStatus('err', tr('先输入物料号并回车', 'Enter a material first', '先に品目コードを入力')); return; }
        const db = S.db();
        const code = String(S.val('mat')).toUpperCase();
        const mm = db.materials[code];
        if (!mm) { S.setStatus('err', S.msg('notfound', { d: tr('物料', 'Material', '品目'), no: code })); return; }
        mm.desc = S.val('desc');
        mm.purchGroup = S.val('pgroup', mm.purchGroup);
        mm.autoPO = String(S.val('autoPO')).indexOf('☑') >= 0;
        mm.mrpType = S.val('mrp', mm.mrpType);
        mm.lotSize = S.val('lot', mm.lotSize);
        mm.safety = S.parseNum(S.val('safety', String(mm.safety)));
        mm.plant = S.val('plant', mm.plant);
        mm.sloc = S.val('sloc', mm.sloc);
        mm.valClass = S.val('valclass', mm.valClass);
        mm.priceControl = S.val('pc', mm.priceControl);
        mm.stdPrice = S.parseNum(S.val('std', String(mm.stdPrice)));
        S.save();
        st.form.mm2Step = 'init';
        refresh('MM02');
        S.setStatus('ok', tr('物料 ' + code + ' 已更改', 'Material ' + code + ' has been changed', '品目 ' + code + ' を変更しました') +
          ' · ' + tr('自动采购单 = ' + (mm.autoPO ? '已勾选' : '未勾选'), 'Automatic PO = ' + (mm.autoPO ? 'on' : 'off'),
            '自動発注 = ' + (mm.autoPO ? 'ON' : 'OFF')));
      }
    });
  };
  window.SIM.mm2Toggle = function () {
    st.form.autoPO = String(st.form.autoPO || '').indexOf('☑') >= 0 ? '☐' : '☑ X';
    S.paint();
  };

  /* ================= ME01 货源清单 ================= */
  S.screens.ME01 = function () {
    const v = S.val, db = S.db();
    const mat = String(v('mat', '')).toUpperCase();
    const plant = v('plant', '1710');
    const list = S.srcVendors(mat, plant);
    const rows = list.map(function (x) { return [mat, plant, x, tr('有效', 'valid', '有効')]; });
    const body = B(tr('货源清单：物料 / 工厂', 'Source list: material / plant', '供給元一覧：品目／プラント'),
      F('mat', tr('物料', 'Material', '品目'), { req: true, mark: 1, value: mat, ph: 'R-1002' }) +
      F('plant', tr('工厂', 'Plant', 'プラント'), { value: plant, cls: 'w80', mark: 2 }) +
      F('ven', tr('供应商', 'Vendor', '仕入先'), { req: true, mark: 3, value: v('ven', '100124'), cls: 'w110' })) +
      (rows.length ? TBL([tr('物料', 'Material', '品目'), tr('工厂', 'Plant', 'プラント'),
        tr('供应商', 'Vendor', '仕入先'), tr('状态', 'Status', '状態')], rows)
        : '<p class="hint">' + S.esc(tr('该物料/工厂还没有货源：回车后点 ✓ 增加一条。', 'No source yet — press ✓ to add one.',
          '供給元がありません。✓ で追加します。')) + '</p>') +
      '<p class="hint">' + S.esc(tr('无 PO 收货时，系统就是在这张清单里找「该向谁买」，再用信息记录取价格。工厂层若要强制查货源，还要在 IMG 里勾「货源清单需求」。',
        'With GR without PO the system looks up this list to find the vendor and price. Plant-level "source list requirement" must also be active in IMG.',
        'PO なし入庫では、この一覧から仕入先を探し、情報レコードで価格を決定します。IMG の「供給元一覧要求」も必要です。')) + '</p>';
    return Object.assign(head(tr('维护货源清单', 'Maintain Source List', '供給元一覧の登録'), 'ME01'), {
      body: body,
      onEnter: function () { S.setStatus('info', tr('填物料/工厂/供应商后点 ✓ 保存', 'Fill material, plant, vendor then press ✓', '品目／プラント／仕入先を入れて ✓')); },
      onSave: function () {
        if (!S.need('mat', tr('物料', 'Material', '品目'))) return;
        if (!S.need('ven', tr('供应商', 'Vendor', '仕入先'))) return;
        const mm = String(v('mat')).toUpperCase();
        if (!db.materials[mm]) { S.setStatus('err', S.msg('notfound', { d: tr('物料', 'Material', '品目'), no: mm })); return; }
        const ven = String(v('ven'));
        if (!db.vendors[ven]) { S.setStatus('err', S.msg('notfound', { d: tr('供应商', 'Vendor', '仕入先'), no: ven })); return; }
        db.srcList[mm + '/' + plant] = db.srcList[mm + '/' + plant] || [];
        if (db.srcList[mm + '/' + plant].indexOf(ven) < 0) db.srcList[mm + '/' + plant].push(ven);
        S.save();
        refresh('ME01');
        S.setStatus('ok', tr('货源清单已更新：' + mm + ' / ' + plant + ' → ' + ven,
          'Source list updated: ' + mm + ' / ' + plant + ' → ' + ven,
          '供給元一覧を更新：' + mm + ' / ' + plant + ' → ' + ven));
      }
    });
  };

  /* ================= ME12 更改信息记录 ================= */
  S.screens.ME12 = function () {
    const v = S.val, db = S.db();
    const ven = String(v('ven', '100123')), mat = String(v('mat', '')).toUpperCase(), org = v('org', '1710');
    const rec = S.infoRec(ven, mat, org);
    const gr = String(v('grBased', rec ? (rec.grBased === false ? '☐' : '☑') : '☑'));
    const body = B(tr('采购信息记录', 'Purchasing info record', '購買情報レコード'),
      F('ven', tr('供应商', 'Vendor', '仕入先'), { req: true, mark: 1, value: ven, cls: 'w110' }) +
      F('mat', tr('物料', 'Material', '品目'), { req: true, mark: 2, value: mat, ph: 'R-1001' }) +
      F('org', tr('采购组织', 'Purchasing org.', '購買組織'), { value: org, cls: 'w80' }) +
      F('price', tr('净价', 'Net price', '正味価格'), { value: rec ? S.fmt(rec.price) : '', cls: 'w110', ro: !rec, req: !rec })) +
      B(tr('控制数据', 'Control data', '制御データ'),
        F('grBased', tr('基于收货的 IV', 'GR-based IV', '入庫ベース IV'), { value: gr, cls: 'w80', mark: 3,
          hint: tr('点下面按钮切换：去掉后可以先开票后收货', 'Toggle below: off → invoice before GR', '下のボタンで切替：OFF なら先に請求可') }) +
        '<div class="frow"><span class="flabel"></span><span class="inp" style="width:120px;cursor:pointer;text-align:center" onclick="SIM.me12Toggle()">' +
        S.esc(tr('切换勾选', 'Toggle', '切替')) + '</span></div>' +
        F('punit', tr('价格单位', 'Price unit', '価格単位'), { value: rec ? String(rec.punit) : '1', cls: 'w80', ro: true }) +
        F('lead', tr('计划交货时间（天）', 'Planned delivery time', '計画納入期間（日）'), { value: rec ? String(rec.lead) : '5', cls: 'w80', ro: true })) +
      (rec ? '<p class="hint">' + S.esc(tr('记录号 ' + rec.no + '。改「基于收货的 IV」后，只有**之后新建**的 PO 才继承；已有 PO 要用 ME22N 改行项目的「发票」页。',
        'Record ' + rec.no + '. The flag only applies to POs created afterwards; change existing POs in ME22N (item → Invoice).',
        'レコード ' + rec.no + '。以降に作成する PO にのみ反映。既存 PO は ME22N の「請求書」タブで変更。')) + '</p>'
        : '<p class="hint">' + S.esc(tr('该组合还没有信息记录：先用 ME11 建（净价 720.00），再回来改勾选。',
          'No info record yet: create it in ME11 first (net price 720.00).', '情報レコードがありません。先に ME11 で登録してください。')) + '</p>');
    return Object.assign(head(tr('更改采购信息记录', 'Change Info Record', '購買情報レコードの変更'), 'ME12'), {
      body: body,
      onEnter: function () {
        const r = S.infoRec(ven, mat, org);
        if (!r) { S.setStatus('err', tr('采购信息记录不存在（' + ven + ' / ' + mat + ' / ' + org + '）—— 用 ME11 创建',
          'Info record does not exist — create it in ME11', '情報レコードが存在しません — ME11 で登録'), 'ME11'); return; }
        S.setStatus('info', tr('已带出净价 ' + S.fmt(r.price) + '；勾选状态见「控制数据」', 'Net price ' + S.fmt(r.price) + ' loaded', '正味価格 ' + S.fmt(r.price)));
      },
      onSave: function () {
        const r = S.infoRec(ven, mat, org);
        if (!r) { S.setStatus('err', tr('采购信息记录不存在', 'Info record does not exist', '情報レコードがありません')); return; }
        r.grBased = String(S.val('grBased')).indexOf('☐') < 0;
        S.save();
        refresh('ME12');
        S.setStatus('ok', tr('信息记录 ' + r.no + ' 已更改：基于收货的 IV = ' + (r.grBased ? '勾选' : '未勾选'),
          'Info record ' + r.no + ' changed: GR-based IV = ' + (r.grBased ? 'on' : 'off'),
          '情報レコード ' + r.no + ' を変更：入庫ベース IV = ' + (r.grBased ? 'ON' : 'OFF')));
      }
    });
  };
  window.SIM.me12Toggle = function () {
    st.form.grBased = String(st.form.grBased || '☑').indexOf('☑') >= 0 ? '☐' : '☑';
    S.paint();
  };

  /* ================= OMJJ 移动类型定制 ================= */
  S.screens.OMJJ = function () {
    const db = S.db();
    const on = !!db.cfg.autoPOmvt;
    const rows = [
      ['101', tr('收货采购订单', 'Goods receipt for PO', '購買発注への入庫'), 'X', on ? '☑' : '☐'],
      ['102', tr('收货冲销', 'Reversal of GR', '入庫取消'), 'X', '☐'],
      ['122', tr('退货交货', 'Return delivery', '返品納入'), 'X', '☐'],
      ['501', tr('无采购订单收货', 'GR without PO', 'PO なし入庫'), 'X', '☐']
    ].map(function (r, i) {
      return [r[0], r[1], r[2], i === 0
        ? '<span class="inp" style="width:44px;text-align:center;cursor:pointer" onclick="SIM.omjjToggle()">' + r[4] + '</span>'
        : r[4]];
    });
    const body = TBL([tr('移动类型', 'Mvt', '移動タイプ'), tr('文本', 'Text', 'テキスト'),
      tr('库存更新', 'Stock update', '在庫更新'), tr('自动产生的采购订单', 'Automatic PO', '自動購買発注')], rows) +
      '<p class="hint">' + S.esc(tr('这是配置（IMG：物料管理 → 总量控制 → 收货 → 自动创建采购订单）。改完点 ✓ 保存到本演练的定制里；真实系统改这里要传输请求与权限。',
        'This is customizing (IMG: Materials Management → Inventory Management → Goods Receipt → Automatic PO). Saving here only changes the simulation.',
        'これはカスタマイズです（IMG：在庫管理 → 入庫 → 自動購買発注）。保存はシミュレーション内のみ。')) + '</p>';
    return Object.assign(head(tr('维护移动类型（定制）', 'Maintain Movement Types (Customizing)', '移動タイプの設定'), 'OMJJ'), {
      menu: [tr('表', 'Table', 'テーブル'), tr('编辑', 'Edit', '編集'), tr('转到', 'Goto', 'ジャンプ'),
        tr('环境', 'Environment', '環境'), tr('系统', 'System', 'システム'), tr('帮助', 'Help', 'ヘルプ')],
      body: body,
      onEnter: function () { S.setStatus('info', tr('切换 101 的自动建单开关后点 ✓', 'Toggle 101 then press ✓', '101 を切替えて ✓')); },
      onSave: function () {
        S.save();
        S.setStatus('ok', tr('表 161 已保存：101 自动建 PO = ' + (db.cfg.autoPOmvt ? '开' : '关'),
          'Table 161 saved: automatic PO for 101 = ' + (db.cfg.autoPOmvt ? 'on' : 'off'),
          'テーブル 161 を保存：101 自動発注 = ' + (db.cfg.autoPOmvt ? 'ON' : 'OFF')));
      }
    });
  };
  window.SIM.omjjToggle = function () {
    S.db().cfg.autoPOmvt = !S.db().cfg.autoPOmvt;
    S.save(); S.paint();
  };

  /* ================= MB01 无 PO 收货（101） ================= */
  S.screens.MB01 = function () {
    const v = S.val, db = S.db();
    const mat = String(v('mat', '')).toUpperCase();
    const m = db.materials[mat];
    const po = v('po') ? S.poNumber(String(v('po'))) : null;
    const qty = S.parseNum(v('qty'));
    const price = po ? po.price : (m ? m.stdPrice : 0);
    const ven = String(v('ven', ''));
    const auto = db.cfg.autoPOmvt && m && m.autoPO &&
      ((db.vendors[ven] || {}).orgs || {})[v('plant', '1710')] &&
      ((db.vendors[ven].orgs[v('plant', '1710')] || {}).autoPO);
    const body = B(tr('抬头', 'Header', 'ヘッダ'),
      F('mtype', tr('移动类型', 'Movement type', '移動タイプ'), { value: v('mtype', '101'), cls: 'w80', mark: 1,
        hint: tr('101 收货采购订单', '101 GR for PO', '101 購買発注への入庫') }) +
      F('ddate', tr('凭证日期', 'Document date', '伝票日付'), { value: v('ddate', '2026-11-20'), cls: 'w110', mark: 2 }) +
      F('po', tr('采购订单', 'Purchase order', '購買発注'), { value: v('po', ''), cls: 'w110', mark: 3,
        hint: tr('留空 → 系统按货源清单自动建单', 'Leave blank → auto PO', '空欄 → 自動発注') })) +
      B(tr('收货数据', 'Goods receipt data', '入庫データ'),
        F('mat', tr('物料', 'Material', '品目'), { req: true, value: mat, mark: 4, ph: 'R-1002' }) +
        F('plant', tr('工厂', 'Plant', 'プラント'), { value: v('plant', '1710'), cls: 'w80', mark: 5 }) +
        F('sloc', tr('库存地点', 'Storage loc.', '保管場所'), { value: v('sloc', '0002'), cls: 'w80' }) +
        F('qty', tr('数量', 'Quantity', '数量'), { req: true, value: v('qty', ''), cls: 'w80', mark: 6 }) +
        F('ven', tr('供应商', 'Vendor', '仕入先'), { req: true, value: ven, cls: 'w110', mark: 7 })) +
      '<p class="hint">' + S.esc(tr('金额 = 数量 × ' + S.fmt(price) + ' = ' + S.fmt(qty * price) + ' USD。自动建单的状态：' +
        (auto ? '四个开关已满足，可以自动生成采购订单' : '尚未满足（检查 OMJJ / MM02 / BP / ME01 与 IMG 货源清单需求）'),
        'Value = qty × ' + S.fmt(price) + ' = ' + S.fmt(qty * price) + ' USD. Auto-PO conditions: ' + (auto ? 'satisfied' : 'not satisfied'),
        '金額 = 数量 × ' + S.fmt(price) + ' = ' + S.fmt(qty * price) + ' USD。自動発注条件：' + (auto ? '充足' : '未充足'))) + '</p>';
    return Object.assign(head(tr('货物移动：收货', 'Goods Movement: Receipt', '入出庫：入庫'), 'MB01'), {
      body: body,
      onEnter: function () {
        const code = String(S.val('mat')).toUpperCase();
        if (code && !db.materials[code]) { S.setStatus('err', S.msg('notfound', { d: tr('物料', 'Material', '品目'), no: code })); return; }
        if (S.val('po')) {
          const p = S.poNumber(String(S.val('po')));
          if (!p) { S.setStatus('err', S.msg('noPO', { n: S.val('po') })); return; }
          if (!String(S.val('qty')).trim()) st.form.qty = String(p.qty - p.receivedQty);
          st.form.mat = p.mat; st.form.plant = p.plant; st.form.sloc = p.sloc;
          S.open('MB01', st.form);
          S.setStatus('ok', tr('已带出订单 ' + p.no + '：' + p.mat + ' / 仍要交货 ' + S.num(p.qty - p.receivedQty),
            'PO ' + p.no + ' loaded: ' + p.mat + ' / open ' + S.num(p.qty - p.receivedQty),
            'PO ' + p.no + ' を読込：' + p.mat + ' / 残 ' + S.num(p.qty - p.receivedQty)));
          return;
        }
        S.setStatus('info', tr('不输采购订单时按「自动建单」检查；点 ✓ 过账', 'Without a PO the system checks auto-PO; press ✓ to post',
          'PO 未入力なら自動発注をチェック。✓ で転記'));
      },
      onSave: function () {
        const dbx = S.db();
        if (!S.need('mat', tr('物料', 'Material', '品目'))) return;
        const q = S.parseNum(S.val('qty'));
        if (!q) { S.setStatus('err', S.msg('need', { f: tr('数量', 'Quantity', '数量') })); return; }
        const mk = String(S.val('mat')).toUpperCase();
        const mm = dbx.materials[mk];
        if (!mm) { S.setStatus('err', S.msg('notfound', { d: tr('物料', 'Material', '品目'), no: mk })); return; }
        const pl = S.val('plant', '1710');
        if (!S.matAtPlant(mk, pl)) { S.setStatus('err', S.msg('matPlant', { m: mk, p: pl })); return; }
        const dd = S.val('ddate', '2026-11-20');
        if (!S.periodOpen(dd)) { S.setStatus('err', S.msg('periodClosed', { p: S.periodOf(dd), cur: dbx.cfg.period }), 'M7021'); return; }
        const sl = S.val('sloc', '0002');
        const vn = String(S.val('ven'));
        let poRec = S.val('po') ? S.poNumber(String(S.val('po'))) : null;
        if (!poRec) {
          if (!dbx.cfg.autoPOmvt) { S.setStatus('err', S.msg('needAutoPO') + ' · ' + tr('OMJJ：101 未勾「自动产生的采购订单」', 'OMJJ: automatic PO not active for 101', 'OMJJ：101 の自動発注が未設定'), 'OMJJ'); return; }
          if (!mm.autoPO) { S.setStatus('err', S.msg('needAutoPO') + ' · ' + tr('MM02 采购视图未勾「自动采购单」', 'MM02: material automatic PO is off', 'MM02：自動発注が OFF'), 'MM02'); return; }
          if (!vn || !dbx.vendors[vn]) { S.setStatus('err', S.msg('notfound', { d: tr('供应商', 'Vendor', '仕入先'), no: vn || '—' })); return; }
          const vOrg = ((dbx.vendors[vn].orgs || {})[pl]) || null;
          if (!vOrg) { S.setStatus('err', S.msg('vendorOrg', { v: vn, o: pl })); return; }
          if (!vOrg.autoPO) { S.setStatus('err', S.msg('needAutoPO') + ' · ' + tr('BP 供应商未勾「自动产生的采购订单」', 'Vendor master: automatic PO is off', '仕入先マスタ：自動発注が OFF'), 'BP'); return; }
          const src = S.srcVendors(mk, pl);
          if (!src.length || src.indexOf(vn) < 0) { S.setStatus('err', S.msg('noSource', { m: mk, p: pl }), 'ME01'); return; }
          const rec = S.infoRec(vn, mk, pl);
          if (!rec) { S.setStatus('err', S.msg('noPrice', { v: vn, m: mk }), 'ME11'); return; }
          dbx.seq.po += 1;
          poRec = { no: String(dbx.seq.po), vendor: vn, type: 'NB', org: pl, group: '001', date: dd,
            mat: mk, qty: q, price: rec.price, curr: rec.curr || 'USD', deliv: dd, plant: pl, sloc: sl,
            receivedQty: 0, invoicedQty: 0, status: 'open', pr: '', grBased: true, auto: true };
          dbx.pos[poRec.no] = poRec;
          st.poNo = poRec.no;
        }
        const openQ = poRec.qty - poRec.receivedQty;
        if (q > openQ * 1.1) { S.setStatus('err', S.msg('over', { q: S.num(openQ) })); return; }
        const amount = q * poRec.price;
        const docs = postGR({ mat: poRec.mat, plant: poRec.plant, sloc: sl, qty: q, po: poRec.no,
          date: dd, amount: amount, vendor: poRec.vendor, type: '101' });
        poRec.receivedQty += q;
        poRec.status = poRec.receivedQty >= poRec.qty ? 'received' : 'partial';
        S.save();
        const extra = poRec.auto ? ' · ' + S.msg('autoPO', { po: poRec.no }) : ' · PO ' + poRec.no;
        S.setStatus('ok', tr('物料凭证 ' + docs.md + ' 已过账（会计凭证 ' + docs.acct + '，' + S.fmt(amount) + ' USD）' + extra,
          'Material doc ' + docs.md + ' posted (acct ' + docs.acct + ', ' + S.fmt(amount) + ' USD)' + extra,
          '品目伝票 ' + docs.md + ' を転記（会計 ' + docs.acct + '、' + S.fmt(amount) + ' USD）' + extra), 'MB01');
      }
    });
  };

  /* ================= MB1A 发货（261） ================= */
  S.screens.MB1A = function () {
    const v = S.val, db = S.db();
    const mat = String(v('mat', '')).toUpperCase();
    const m = db.materials[mat];
    const qty = S.parseNum(v('qty'));
    const price = m ? m.stdPrice : 0;
    const body = B(tr('抬头', 'Header', 'ヘッダ'),
      F('mtype', tr('移动类型', 'Movement type', '移動タイプ'), { value: v('mtype', '261'), cls: 'w80', mark: 1, hint: '261 生产发料' }) +
      F('ddate', tr('凭证日期', 'Document date', '伝票日付'), { value: v('ddate', '2026-11-21'), cls: 'w110' })) +
      B(tr('项目', 'Item', '明細'),
        F('mat', tr('物料', 'Material', '品目'), { req: true, value: mat, ph: 'R-1003', mark: 2 }) +
        F('plant', tr('工厂', 'Plant', 'プラント'), { value: v('plant', '1710'), cls: 'w80' }) +
        F('sloc', tr('库存地点', 'Storage loc.', '保管場所'), { value: v('sloc', '0001'), cls: 'w80' }) +
        F('qty', tr('数量', 'Quantity', '数量'), { req: true, value: v('qty', ''), cls: 'w80', mark: 3 }) +
        F('order', tr('生产订单', 'Production order', '製造指図'), { value: v('order', '1000234'), cls: 'w110', mark: 4 })) +
      '<p class="hint">' + S.esc(tr('金额 = 数量 × 标准价 ' + S.fmt(price) + ' = ' + S.fmt(qty * price) + ' USD；借方记消耗/生产成本，贷方记库存。',
        'Value = qty × standard price ' + S.fmt(price) + ' = ' + S.fmt(qty * price) + ' USD: consumption Dr / inventory Cr.',
        '金額 = 数量 × 標準価格 ' + S.fmt(price) + ' = ' + S.fmt(qty * price) + ' USD：消費 Dr／在庫 Cr。')) + '</p>';
    return Object.assign(head(tr('货物移动：发货（261）', 'Goods Issue (261)', '払出（261）'), 'MB1A'), {
      body: body,
      onEnter: function () {
        const code = String(S.val('mat')).toUpperCase();
        if (code && !db.materials[code]) { S.setStatus('err', S.msg('notfound', { d: tr('物料', 'Material', '品目'), no: code })); return; }
        S.setStatus('info', tr('检查库存后点 ✓', 'Press ✓ after checking stock', '在庫を確認して ✓'));
      },
      onSave: function () {
        if (!S.need('mat', tr('物料', 'Material', '品目'))) return;
        const q = S.parseNum(S.val('qty'));
        if (!q) { S.setStatus('err', S.msg('need', { f: tr('数量', 'Quantity', '数量') })); return; }
        const mk = String(S.val('mat')).toUpperCase(), pl = S.val('plant', '1710'), sl = S.val('sloc', '0001');
        const mm = db.materials[mk];
        if (!mm) { S.setStatus('err', S.msg('notfound', { d: tr('物料', 'Material', '品目'), no: mk })); return; }
        const dd = S.val('ddate', '2026-11-21');
        if (!S.periodOpen(dd)) { S.setStatus('err', S.msg('periodClosed', { p: S.periodOf(dd), cur: db.cfg.period }), 'M7021'); return; }
        const stock = S.stockOf(mk, pl, sl);
        if (stock.unrestricted < q) { S.setStatus('err', S.msg('stock', { q: S.num(stock.unrestricted) })); return; }
        const amount = q * mm.stdPrice;
        db.seq.md += 1;
        const md = String(db.seq.md);
        const acct = S.postAcct(dd, [
          { pk: '40', acct: '410000', name: tr('生产成本-材料消耗', 'Production cost — material', '製造原価−材料費'), dc: 'S', amt: amount },
          { pk: '50', acct: '140000', name: tr('库存商品（原材料）', 'Inventory', '棚卸資産'), dc: 'H', amt: amount }
        ], md);
        db.matdocs.push({ no: md, type: '261', mat: mk, plant: pl, sloc: sl, qty: q, po: '', date: dd,
          amount: amount, acct: acct.no, order: S.val('order', '1000234') });
        stock.unrestricted -= q;
        S.save();
        S.setStatus('ok', tr('物料凭证 ' + md + ' 已过账：发料 ' + S.num(q) + ' PC（' + S.fmt(amount) + ' USD），库存剩 ' + S.num(stock.unrestricted),
          'Material doc ' + md + ' posted: issue ' + S.num(q) + ' PC (' + S.fmt(amount) + ' USD), stock ' + S.num(stock.unrestricted),
          '品目伝票 ' + md + ' を転記：払出 ' + S.num(q) + ' PC（' + S.fmt(amount) + ' USD）、在庫 ' + S.num(stock.unrestricted)), '261');
      }
    });
  };

  /* ================= MR11 GR/IR 清账 ================= */
  S.screens.MR11 = function () {
    const v = S.val, db = S.db();
    const rows = [], items = [];
    Object.keys(db.pos).forEach(function (k) {
      const p = db.pos[k];
      if (p.grirCleared) return;
      const bal = (p.receivedQty || 0) * p.price - (p.invoicedQty || 0) * p.price;
      if (Math.abs(bal) < 0.005) return;
      items.push({ no: p.no, bal: bal, price: p.price });
      rows.push([k, p.vendor, S.num(p.receivedQty), S.num(p.invoicedQty), S.fmt(bal),
        v('sel') === p.no ? '☑' : '☐']);
    });
    const sel = v('sel') ? items.filter(function (x) { return x.no === v('sel'); })[0] : null;
    const body = B(tr('GR/IR 余额（未清项目）', 'GR/IR open items', 'GR/IR 未決済明細'),
      rows.length ? TBL([tr('采购订单', 'PO', 'PO'), tr('供应商', 'Vendor', '仕入先'), tr('收货', 'Received', '入庫'),
        tr('已开票', 'Invoiced', '請求済'), tr('余额', 'Balance', '残高'), tr('选择', 'Sel.', '選択')], rows)
        : '<p class="hint">' + S.esc(tr('没有未清的 GR/IR 项目（收货与发票已配平）。', 'No open GR/IR items.', '未決済の GR/IR はありません。')) + '</p>') +
      (rows.length ? '<p class="hint">' + S.esc(tr('点一行选择，再点 ✓ 清账；正数=票到货未到，负数=货到票未到。',
        'Click a row to select, then ✓ to clear. Positive = invoiced before GR; negative = GR before invoice.',
        '行をクリックして選択、✓ で消込。正＝請求先行、負＝入庫先行。')) + '</p>' : '') +
      (sel ? '<div class="frow"><span class="flabel">' + S.esc(tr('清账金额', 'Clearing amount', '消込額')) + '</span><span class="inp ro w110">' +
        S.fmt(Math.abs(sel.bal)) + '</span>' +
        '<span class="inp" style="width:110px;cursor:pointer;text-align:center" onclick="SIM.mr11Sel(\'' + sel.no + '\')">' +
        S.esc(tr('取消选择', 'Clear selection', '選択解除')) + '</span></div>' : '');
    return Object.assign(head(tr('GR/IR 清账', 'GR/IR Clearing', 'GR/IR 消込'), 'MR11'), {
      body: body,
      onEnter: function () { S.setStatus('info', tr('点行选择 → ✓ 清账', 'Select a row, then ✓', '行を選択 → ✓')); },
      onSave: function () {
        const sel2 = S.val('sel');
        if (!sel2) { S.setStatus('err', tr('请先点一行选择要清账的项目', 'Select an item first', '先に明細を選択してください')); return; }
        const p = S.poNumber(String(sel2));
        if (!p) { S.setStatus('err', S.msg('noPO', { n: sel2 })); return; }
        const bal = (p.receivedQty || 0) * p.price - (p.invoicedQty || 0) * p.price;
        if (Math.abs(bal) < 0.005) { S.setStatus('err', tr('该项目已无余额', 'No balance left', '残高がありません')); return; }
        const dd = db.cfg.period + '-30';
        const amt = Math.abs(bal);
        const acct = S.postAcct(dd, bal < 0
          ? [{ pk: '40', acct: '191100', name: tr('GR/IR 暂估应计', 'GR/IR clearing', 'GR/IR 仮勘定'), dc: 'S', amt: amt },
             { pk: '50', acct: '599100', name: tr('GR/IR 清账差异', 'GR/IR clearing difference', 'GR/IR 消込差異'), dc: 'H', amt: amt }]
          : [{ pk: '40', acct: '599100', name: tr('GR/IR 清账差异', 'GR/IR clearing difference', 'GR/IR 消込差異'), dc: 'S', amt: amt },
             { pk: '50', acct: '191100', name: tr('GR/IR 暂估应计', 'GR/IR clearing', 'GR/IR 仮勘定'), dc: 'H', amt: amt }],
          'MR11 ' + p.no);
        p.grirCleared = true;
        st.form.sel = '';
        S.save();
        refresh('MR11');
        S.setStatus('ok', S.msg('cleared', { n: 1, v: S.fmt(amt) + ' USD' }) + ' · ' + tr('会计凭证 ' + acct.no, 'Accounting doc ' + acct.no, '会計伝票 ' + acct.no));
      }
    });
  };
  window.SIM.mr11Sel = function (no) {
    st.form.sel = (st.form.sel === no) ? '' : no;
    S.paint();
  };

  /* ================= MMPV 物料期间结转 ================= */
  S.screens.MMPV = function () {
    const db = S.db(), v = S.val;
    const cm = /^(\d{4})-(\d{2})$/.exec(db.cfg.period);
    let ny = +cm[1], nm = +cm[2] + 1;
    if (nm > 12) { nm = 1; ny += 1; }
    const next = ny + '-' + (nm < 10 ? '0' + nm : nm);
    const rows = [];
    for (let i = -1; i <= 1; i++) {
      const d = new Date(2000, 0, 1);
      d.setFullYear(+cm[1], (+cm[2]) - 1 + i, 1);
      const p = d.getFullYear() + '-' + (d.getMonth() + 1 < 10 ? '0' : '') + (d.getMonth() + 1);
      rows.push([p, i < 0 ? tr('已关闭', 'closed', 'クローズ済') : i === 0 ? tr('当前期间', 'current', '現行') : tr('未打开', 'not open', '未オープン')]);
    }
    const body = B(tr('物料期间', 'Material period', '品目期間'),
      F('period', tr('当前期间', 'Current period', '現行期間'), { value: db.cfg.period, cls: 'w110', ro: true, mark: 1 }) +
      F('next', tr('结转到', 'Close to', '繰越先'), { value: v('next', next), cls: 'w110', mark: 2 })) +
      TBL([tr('期间', 'Period', '期間'), tr('状态', 'Status', '状態')], rows) +
      '<div class="frow" style="margin-top:10px"><span class="flabel"></span>' +
      '<span class="inp" style="width:150px;text-align:center;cursor:pointer" onclick="SIM.mmpvAsk()">' +
      S.esc(tr('执行结转（MMPV）', 'Close period (MMPV)', '繰越実行（MMPV）')) + '</span></div>' +
      '<p class="hint">' + S.esc(tr('结转后，用上一期间的日期收货会被拦下（M7021）。真实系统必须逐月结转、不能跳月，且要先把上一期的物料凭证都处理完。',
        'After closing, posting with a date in the previous period is rejected (M7021). Periods must be closed one by one.',
        '繰越後、前期間の日付での転記は拒否されます（M7021）。1 か月ずつ繰り越します。')) + '</p>';
    return Object.assign(head(tr('物料期间结转', 'Close Material Period', '品目期間の繰越'), 'MMPV'), {
      body: body,
      onEnter: function () { S.setStatus('info', tr('核对期间后点「执行结转」', 'Check the period, then close', '期間を確認して繰越')); },
      onSave: function () { S.setStatus('err', tr('请点「执行结转」（结转有确认框）', 'Use the Close button', '「繰越実行」を押してください')); }
    });
  };
  window.SIM.mmpvAsk = function () {
    const v = S.val, db = S.db();
    const tgt = String(v('next', '')).trim();
    if (!/^\d{4}-\d{2}$/.test(tgt)) { S.setStatus('err', tr('期间格式应为 YYYY-MM', 'Format must be YYYY-MM', '形式は YYYY-MM')); S.paint(); return; }
    if (tgt <= db.cfg.period) { S.setStatus('err', tr('只能向后结转', 'Only forward', '先へ繰り越すのみ')); S.paint(); return; }
    st.dialog = '<div class="dlg"><div class="dh"><span>' + S.esc(tr('结转物料期间', 'Close material period', '品目期間の繰越')) +
      '</span><span>✕</span></div><div class="db">' +
      S.esc(tr('把物料期间从 ' + db.cfg.period + ' 结转到 ' + tgt + '？结转后上一期间不能再过账（除非常允许上一期记账）。',
        'Close the material period from ' + db.cfg.period + ' to ' + tgt + '? Postings in the old period will be rejected.',
        '品目期間を ' + db.cfg.period + ' から ' + tgt + ' へ繰り越しますか？旧期間への転記は拒否されます。')) +
      '</div><div class="df"><button class="gbtn" onclick="SIM.closeDlg()">' + S.esc(tr('取消', 'Cancel', '取消')) +
      '</button><button class="gbtn primary" onclick="SIM.mmpvOk(\'' + tgt + '\')">' + S.esc(tr('结转', 'Close', '繰越')) +
      '</button></div></div>';
    st.__enterDlg = null;
    S.paint();
  };
  window.SIM.mmpvOk = function (tgt) {
    const db = S.db();
    db.cfg.period = tgt;
    st.dialog = null;
    S.save();
    refresh('MMPV');
    S.setStatus('ok', S.msg('periodDone', { p: tgt }));
  };

  /* ================= OB52 会计期间 ================= */
  S.screens.OB52 = function () {
    const db = S.db(), v = S.val;
    const per = db.cfg.period.split('-');
    const rows = [
      ['S', tr('总账科目', 'G/L accounts', '総勘定元帳'), per[1], per[1], per[0]],
      ['M', tr('物料管理', 'Materials management', '購買管理'), per[1], per[1], per[0]],
      ['K', tr('供应商', 'Vendors', '仕入先'), per[1], per[1], per[0]],
      ['D', tr('客户', 'Customers', '得意先'), per[1], per[1], per[0]],
      ['A', tr('资产', 'Assets', '固定資産'), per[1], per[1], per[0]]
    ];
    const body = B(tr('期间', 'Periods', '期間'),
      F('var', tr('期间变式', 'Period variant', '期間変式'), { value: v('var', 'A001'), cls: 'w90', mark: 1 }) +
      F('year', tr('年度', 'Fiscal year', '年度'), { value: per[0], cls: 'w80', ro: true })) +
      TBL([tr('期间类型', 'Account type', '期間タイプ'), tr('名称', 'Name', '名称'),
        tr('从期间', 'From', '開始'), tr('至期间', 'To', '終了'), tr('年度', 'Year', '年度')], rows) +
      B(tr('附加设置', 'Additional settings', '追加設定'),
        F('prevOpen', tr('允许上一期间记账', 'Allow previous period', '前期間の転記を許可'),
          { value: db.cfg.prevOpen ? '☑ 是' : '☐ 否', cls: 'w110', mark: 2,
            hint: tr('点按钮切换；关掉后上一期收货会被拦', 'Toggle: off blocks previous-period postings', 'OFF で前期間の転記を拒否') }) +
        '<div class="frow"><span class="flabel"></span><span class="inp" style="width:120px;cursor:pointer;text-align:center" onclick="SIM.ob52Toggle()">' +
        S.esc(tr('切换', 'Toggle', '切替')) + '</span></div>') +
      '<p class="hint">' + S.esc(tr('期间类型：K 供应商 / A 资产 / D 客户 / M 物料 / S 总账 / V 合同账户（+ 为必设）。收货同时写库存与 GR/IR，所以 M 与 S 都要包含当月。',
        'Account types: K vendors, A assets, D customers, M materials, S G/L, V contract accounts. GR touches stock and GR/IR, so M and S must both be open.',
        '期間タイプ：K 仕入先／A 固定資産／D 得意先／M 品目／S 総勘定元帳／V 契約。入庫は在庫と GR/IR の両方を更新するため M と S が必要。')) + '</p>';
    return Object.assign(head(tr('维护会计期间', 'Maintain Posting Periods', '会計期間の保守'), 'OB52'), {
      menu: [tr('表', 'Table', 'テーブル'), tr('编辑', 'Edit', '編集'), tr('转到', 'Goto', 'ジャンプ'),
        tr('环境', 'Environment', '環境'), tr('系统', 'System', 'システム'), tr('帮助', 'Help', 'ヘルプ')],
      body: body,
      onEnter: function () { S.setStatus('info', tr('核对当前期间；要改上一期开关点「切换」后 ✓', 'Check the period; toggle then ✓', '期間を確認し、切替後に ✓')); },
      onSave: function () {
        S.save();
        S.setStatus('ok', tr('期间变式 A001 已保存：' + db.cfg.period + '，上一期间记账 = ' + (db.cfg.prevOpen ? '允许' : '不允许'),
          'Period variant A001 saved for ' + db.cfg.period + '; previous period = ' + (db.cfg.prevOpen ? 'allowed' : 'blocked'),
          '期間変式 A001 を保存：' + db.cfg.period + '、前期間 = ' + (db.cfg.prevOpen ? '可' : '不可')));
      }
    });
  };
  window.SIM.ob52Toggle = function () {
    S.db().cfg.prevOpen = !S.db().cfg.prevOpen;
    S.save(); st.form.prevOpen = S.db().cfg.prevOpen ? '☑ 是' : '☐ 否'; S.paint();
  };


  /* ================= OMR6 发票容差 ================= */
  S.screens.OMR6 = function () {
    const v = S.val, db = S.db();
    const t = db.cfg.tol;
    const body = B(tr('容差限制：发票校验（公司代码 1710）', 'Tolerance limits: invoice verification (company code 1710)',
      '許容範囲：請求書照合（会社コード 1710）'),
      F('bd', tr('BD 小额差异上限（绝对值）', 'BD small difference (abs.)', 'BD 少額差異（絶対額）'), { value: v('bd', String(t.BD)), cls: 'w110', mark: 1 }) +
      F('pp', tr('PP 价格变化上限（%）', 'PP price variance (%)', 'PP 価格差異（%）'), { value: v('pp', String(t.PP)), cls: 'w80', mark: 2 }) +
      F('dq', tr('DQ 数量偏差上限（%）', 'DQ quantity variance (%)', 'DQ 数量差異（%）'), { value: v('dq', String(t.DQ)), cls: 'w80', mark: 3 }) +
      F('vp', tr('VP 移动平均价差异上限（%）', 'VP moving average variance (%)', 'VP 移動平均価格差異（%）'), { value: v('vp', String(t.VP)), cls: 'w80', mark: 4 })) +
      TBL([tr('容差码', 'Key', 'キー'), tr('含义', 'Meaning', '意味'), tr('本课默认', 'Default here', '既定値')], [
        ['BD', tr('差额自动记入小额差异科目', 'Difference posted to small differences', '少額差異へ自動計上'), '50.00'],
        ['PP', tr('发票单价与订单净价的偏差', 'Invoice price vs. PO net price', '請求単価と発注正味価格の差'), '1.000 %'],
        ['DQ', tr('发票数量与已收货/已订数量的偏差', 'Invoice qty vs. delivered/ordered', '請求数量と入庫／発注数量の差'), '1.000 %'],
        ['VP', tr('过账后移动平均价的变化', 'Change of moving average price', '移動平均価格の変動'), '1.000 %']
      ]) +
      '<p class="hint">' + S.esc(tr('改小 PP（例如 0.3），再把发票金额改成 217,200.00，就会从「容差内过账」变成「过账后冻结」。容差是按公司代码配的。',
        'Lower PP (e.g. to 0.3) and invoice 217,200.00 again: it turns from “posted” into “posted + blocked”. Tolerances are per company code.',
        'PP を 0.3 に下げて 217,200.00 で請求すると「転記」から「転記＋ブロック」に変わります。許容範囲は会社コード単位です。')) + '</p>';
    return Object.assign(head(tr('容差限制：发票校验', 'Tolerance Limits: Invoice Verification', '許容範囲：請求書照合'), 'OMR6'), {
      menu: [tr('表', 'Table', 'テーブル'), tr('编辑', 'Edit', '編集'), tr('转到', 'Goto', 'ジャンプ'),
        tr('环境', 'Environment', '環境'), tr('系统', 'System', 'システム'), tr('帮助', 'Help', 'ヘルプ')],
      body: body,
      onEnter: function () { S.setStatus('info', tr('改完数值点 ✓ 保存', 'Change values, then ✓', '値を変更して ✓')); },
      onSave: function () {
        const dbx = S.db();
        dbx.cfg.tol = {
          BD: S.parseNum(S.val('bd', '50')) || 0,
          PP: S.parseNum(S.val('pp', '1')) || 0,
          DQ: S.parseNum(S.val('dq', '1')) || 0,
          VP: S.parseNum(S.val('vp', '1')) || 0
        };
        S.save();
        S.setStatus('ok', tr('公司代码 1710 的容差已保存：BD ' + dbx.cfg.tol.BD + ' / PP ' + dbx.cfg.tol.PP + ' %',
          'Tolerances saved: BD ' + dbx.cfg.tol.BD + ' / PP ' + dbx.cfg.tol.PP + ' %',
          '許容範囲を保存：BD ' + dbx.cfg.tol.BD + ' / PP ' + dbx.cfg.tol.PP + ' %'));
      }
    });
  };

  /* ================= SU3 个人参数 ================= */
  S.screens.SU3 = function () {
    const v = S.val, db = S.db();
    const cur = (db.cfg.user = db.cfg.user || { LANG: 'ZH', WRK: '1710', BUKRS: '1710' });
    const body = B(tr('用户参数文件', 'User profile', 'ユーザパラメータ'),
      F('p_lang', tr('参数 LANG（语言）', 'Parameter LANG', 'パラメータ LANG'), { value: v('p_lang', cur.LANG), cls: 'w90', mark: 1, hint: 'ZH / EN / JA' }) +
      F('p_wrk', tr('参数 WRK（工厂）', 'Parameter WRK', 'パラメータ WRK'), { value: v('p_wrk', cur.WRK), cls: 'w90', mark: 2 }) +
      F('p_bukrs', tr('参数 BUKRS（公司代码）', 'Parameter BUKRS', 'パラメータ BUKRS'), { value: v('p_bukrs', cur.BUKRS), cls: 'w90', mark: 3 })) +
      '<p class="hint">' + S.esc(tr('SU3 只改你自己的默认值：以后打开画面时「工厂」「公司代码」会自动带出来，系统配置一点没变。',
        'SU3 only changes your personal defaults (plant, company code). No customizing is touched.',
        'SU3 は個人の初期値のみ変更します。カスタマイズは変わりません。')) + '</p>';
    return Object.assign(head(tr('维护用户参数文件', 'Maintain User Profile', 'ユーザパラメータの保守'), 'SU3'), {
      body: body,
      onEnter: function () { S.setStatus('info', S.msg('press')); },
      onSave: function () {
        const dbx = S.db();
        dbx.cfg.user = { LANG: String(S.val('p_lang', 'ZH')).toUpperCase(), WRK: S.val('p_wrk', '1710'), BUKRS: S.val('p_bukrs', '1710') };
        const map = { ZH: 'zh', EN: 'en', JA: 'ja' };
        let msgTxt = tr('参数已保存', 'Parameters saved', 'パラメータを保存しました');
        S.save();
        if (map[dbx.cfg.user.LANG] && map[dbx.cfg.user.LANG] !== st.lang) {
          st.lang = map[dbx.cfg.user.LANG];
          localStorage.setItem('sapgui810.lab.lang', st.lang);
          S.open('SU3', st.form);
          msgTxt = tr('参数已保存，界面语言切换为' + (st.lang === 'ja' ? '日语' : st.lang === 'en' ? '英语' : '中文'),
            'Saved. UI language switched to ' + st.lang.toUpperCase(),
            '保存しました。UI 言語を ' + st.lang.toUpperCase() + ' に切替');
        }
        S.setStatus('ok', msgTxt);
      }
    });
  };
})();
