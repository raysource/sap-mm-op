/* SAP GUI 8.10 仿真器 · 内核：登录、状态、三语、外壳、路由、数据与号段（Horizon） */
(function () {
  'use strict';

  const LS = 'sapgui810.lab.sim.v1';
  const BASE_DATE = '2026-11-07';
  const PERIOD0 = '2026-11';
  const LANGS = ['zh', 'en', 'ja'];
  const EMBED = /[?&]embed=1/.test(location.search);   // 嵌入引导实操页时隐藏右侧面板

  const state = {
    lang: localStorage.getItem('sapgui810.lab.lang') || 'zh',
    rev: 0, logged: false, session: { client: '', user: '', lang: '' },
    db: null, screen: null, form: {}, status: { icon: 'info', text: '', code: '' }, dialog: null, tab: 0
  };

  // ---------------- 三语 ----------------
  function L(zh, en, ja) { return { zh: zh, en: en, ja: ja }; }
  function t(o) {
    if (o === null || o === undefined) return '';
    if (typeof o === 'string') return o;
    return o[state.lang] || o.zh;
  }
  function fmt(n) {
    const v = Number(n) || 0;
    return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function num(n) { return (Number(n) || 0).toLocaleString('en-US', { maximumFractionDigits: 3 }); }
  function esc(s) {
    if (s && typeof s === 'object') s = t(s);
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function parseNum(s) { return Number(String(s).replace(/[,\s]/g, '')) || 0; }
  function money(n) { return fmt(n); }

  // ---------------- 消息 ----------------
  const M = {
    saved: L('{d} {no} 已创建', '{d} {no} has been created', '{d} {no} を作成しました'),
    posted: L('{d} {no} 已过账', '{d} {no} has been posted', '{d} {no} を転記しました'),
    notfound: L('{d} {no} 不存在', '{d} {no} does not exist', '{d} {no} は存在しません'),
    need: L('请输入 {f}', 'Enter {f}', '{f} を入力してください'),
    badnum: L('{f} 必须是数字', '{f} must be a number', '{f} は数値で入力してください'),
    exists: L('物料 {m} 已存在', 'Material {m} already exists', '品目 {m} は既に存在します'),
    vendorOrg: L('供应商 {v} 未在采购组织 {o} 中维护', 'Vendor {v} is not maintained in purchasing org {o}',
                 '仕入先 {v} は購買組織 {o} で登録されていません'),
    matPlant: L('物料 {m} 未在工厂 {p} 中维护', 'Material {m} is not maintained in plant {p}',
                '品目 {m} はプラント {p} に存在しません'),
    noPrice: L('无法确定净价：采购信息记录 {v} / {m} 不存在', 'No net price: info record {v} / {m} is missing',
               '正味価格を決定できません：購買情報レコード {v} / {m} がありません'),
    noPR: L('采购申请 {n} 不存在', 'Requisition {n} does not exist', '購買依頼 {n} は存在しません'),
    noPO: L('采购订单 {n} 不存在', 'Purchase order {n} does not exist', '購買発注 {n} は存在しません'),
    noGR: L('采购订单 {n} 尚无收货，不能开票', 'No goods receipt for PO {n}', '購買発注 {n} は未入庫のため請求できません'),
    over: L('收货数量超过允许的容差（仍要交货 {q}）', 'Quantity exceeds delivery tolerance (open {q})',
            '数量が許容範囲を超えています（残納入 {q}）'),
    tol: L('价格过高（超出容差限制 1.000 %）—— 消息 M8083', 'Price too high (tolerance limit 1.000 % exceeded) — M8083',
           '価格が高すぎます（許容範囲 1.000 % を超過）— M8083'),
    invoiced: L('该采购订单已全部开票', 'This purchase order is fully invoiced', 'この購買発注は請求済です'),
    stock: L('库存不足：可用 {q} PC', 'Insufficient stock: {q} PC available', '在庫不足：使用可能 {q} PC'),
    noItem: L('没有可清账的未清项', 'No open items to clear', '消込対象の未決済明細がありません'),
    readonly: L('该事务只读，不能保存', 'This transaction is display only', 'このトランザクションは照会専用です'),
    cleared: L('付款已过账并清账', 'Payment posted and cleared', '支払を転記し消し込みました'),
    reset: L('数据已重置为初始状态', 'Data has been reset', 'データを初期状態に戻しました'),
    mrpDone: L('MRP 已运行：生成采购申请 {n}（{q} PC）', 'MRP run: requisition {n} created ({q} PC)',
               'MRP 実行：購買依頼 {n} を生成（{q} PC）'),
    mrpNone: L('MRP 已运行：无净需求，未生成申请', 'MRP run: no net requirement', 'MRP 実行：正味所要量なし'),
    press: L('输入后按 Enter 或点工具栏 ✓', 'Press Enter or the ✓ button', 'Enter またはツールバーの ✓ を押してください'),
    wrongTcode: L('事务码 {c} 不存在（本演练支持：{l}）', 'Transaction {c} does not exist (supported: {l})',
                  'T-code {c} は存在しません（対応：{l}）'),
    cmd: L('命令字段', 'Command field', 'コマンドフィールド'),
    needLogin: L('请先登录（事务码 {c} 需要已登录会话）', 'Log on first (transaction {c} needs a session)', '先にログオンしてください（{c} はセッションが必要です）'),
    loginOk: L('客户端 {c} 用户 {u} 已登录（语言 {l}）', 'Client {c} user {u} logged on (language {l})', 'クライアント {c} ユーザ {u} でログオンしました（言語 {l}）'),
    badClient: L('客户端 {c} 不存在或没有登录权限', 'Client {c} does not exist or is locked', 'クライアント {c} は存在しないかロックされています'),
    needUser: L('请输入用户与口令', 'Enter user and password', 'ユーザとパスワードを入力してください'),
    periodClosed: L('物料期间 {p} 未打开（当前期间 {cur}）—— 消息 M7021', 'Posting period {p} is not open (current {cur}) — M7021', '転記期間 {p} は未オープンです（現行 {cur}）— M7021'),
    autoPO: L('采购订单 {po} 已自动创建', 'Purchase order {po} created automatically', '購買発注 {po} を自動登録しました'),
    noSource: L('未找到有效货源：物料 {m} / 工厂 {p}', 'No valid source of supply: material {m} / plant {p}', '有効な供給元が見つかりません：品目 {m} / プラント {p}'),
    needAutoPO: L('请输入采购订单（物料或移动类型未设置自动采购）', 'Enter a purchase order (automatic PO is not active)', '購買発注を入力してください（自動発注が有効でありません）'),
    cleared: L('GR/IR 已清账：{n} 条，合计 {v}', 'GR/IR cleared: {n} items, total {v}', 'GR/IR を消し込みました：{n} 件、合計 {v}'),
    periodDone: L('物料期间已结转到 {p}', 'Material period advanced to {p}', '品目期間を {p} に繰り越しました'),
    parked: L('预制发票 {no} 已保存（未过账）', 'Parked invoice {no} saved (not posted)', '請求書 {no} を保留保存しました（未転記）'),
    released: L('发票 {no} 已释放并过账', 'Invoice {no} released and posted', '請求書 {no} を解除し転記しました'),
    noGRAllowed: L('该采购订单勾选了「基于收货的 IV」，请先收货（或 ME12/ME22N 取消该勾）',
                   'GR-based IV is set on this PO — post the goods receipt first', '入庫ベース IV が設定されています。先に入庫してください')
  };
  function msg(key, args) {
    let s = t(M[key]) || key;
    Object.keys(args || {}).forEach(function (k) {
      var av = (args[k] && typeof args[k] === 'object') ? t(args[k]) : args[k];
      s = s.split('{' + k + '}').join(av);
    });
    return s;
  }
  function setStatus(icon, text, code) {
    state.status = { icon: icon, text: text, code: code || '' };
    paintStatus();
  }
  function paintStatus() {
    const el = document.getElementById('sapStatus');
    if (!el) return;
    el.className = 'sap-status ' + state.status.icon;
    el.innerHTML = '<i></i><span>' + esc(state.status.text) + '</span>' +
      (state.status.code ? '<span class="code">' + esc(state.status.code) + '</span>' : '');
  }

  // ---------------- 初始数据 ----------------
  function fresh() {
    return {
      // 登录会话（模拟器每次打开都要重新登录，跟真机一致）
      session: { client: '', user: '', lang: '' },
      // 演练用「定制」：移动类型自动建单、货源清单需求、期间、发票容差
      cfg: {
        period: PERIOD0, prevOpen: false,   // 结转后默认不允许再用上一期间记账
        autoPOmvt: false, srcReq: false,
        tol: { BD: 50, PP: 1.0, DQ: 1.0, VP: 1.0 }
      },
      materials: {
        'R-1002': {
          id: 'R-1002', type: 'ROH', industry: 'M', desc: L('铝合金外壳', 'Aluminium Housing', 'アルミ筐体'),
          unit: 'PC', grp: '00101', views: ['basic', 'purch', 'mrp', 'plant', 'acct'],
          purchGroup: '001', autoPO: false, mrpType: 'PD', lotSize: 'EX', safety: 10,
          plant: '1710', sloc: '0002', valClass: '3000', priceControl: 'S', stdPrice: 180
        },
        'R-1003': {
          id: 'R-1003', type: 'ROH', industry: 'M', desc: L('丁腈密封圈', 'NBR Sealing Ring', 'NBR シールリング'),
          unit: 'PC', grp: '00102', views: ['basic', 'purch', 'mrp', 'plant', 'acct'],
          purchGroup: '001', autoPO: false, mrpType: 'PD', lotSize: 'EX', safety: 50,
          plant: '1710', sloc: '0001', valClass: '3000', priceControl: 'S', stdPrice: 12.5
        }
      },
      vendors: {
        '100124': {
          id: '100124', name: L('Bay Area Metals', 'Bay Area Metals', 'ベイエリア金属'),
          city: 'San Jose', country: 'US',
          orgs: { '1710': { currency: 'USD', terms: '0001', group: '001', autoPO: false, grBased: true } },
          co: { '1710': { recon: '160000', terms: '0001', methods: 'C/T' } }
        }
      },
      inforecs: {}, prs: {}, pos: {}, invoices: {}, parked: {},
      matdocs: [], accts: [], payments: [],
      srcList: {},                       // '物料/工厂' -> ['供应商', ...]（货源清单 ME01）
      stock: {
        'R-1002/1710/0002': { unrestricted: 20, qi: 0, blocked: 0 },
        'R-1003/1710/0001': { unrestricted: 500, qi: 0, blocked: 0 }
      },
      // R-1001 建好之前库存为 0；生产需求 400 + 安全库存 20
      req: {
        'R-1001/1710': [{ date: '2026-11-18', qty: 400, ref: L('生产订单 1000234', 'Production order 1000234', '製造指図 1000234') }],
        'R-1002/1710': [{ date: '2026-11-25', qty: 100, ref: L('生产订单 1000235', 'Production order 1000235', '製造指図 1000235') }]
      },
      seq: { pr: 10000000, po: 4500000122, md: 4900000000, inv: 5105600000, acct: 5100000000, info: 5300000122 }
    };
  }
  // ---------- 期间 / 货源 / 会计 ----------
  function periodOf(d) {
    const m = /^(\d{4})-(\d{2})/.exec(String(d || ''));
    return m ? m[1] + '-' + m[2] : '';
  }
  function prevPeriod(p) {
    const m = /^(\d{4})-(\d{2})$/.exec(p || '');
    if (!m) return '';
    let y = +m[1], mo = +m[2] - 1;
    if (mo === 0) { mo = 12; y -= 1; }
    return y + '-' + (mo < 10 ? '0' + mo : mo);
  }
  function periodOpen(d) {
    const p = periodOf(d) || state.db.cfg.period;
    if (p >= state.db.cfg.period) return true;
    return !!(state.db.cfg.prevOpen && p === prevPeriod(state.db.cfg.period));
  }
  function srcVendors(mat, plant) { return (state.db.srcList[mat + '/' + plant] || []).slice(); }
  function acctDate() { return periodOf(state.form.ddate) ? state.form.ddate : BASE_DATE; }
  function postAcct(date, lines, ref) {
    const db = state.db;
    db.seq.acct += 1;
    const rec = { no: String(db.seq.acct), date: date, ref: ref || '', lines: lines,
      value: lines.reduce(function (a, l) { return a + (Number(l.dr) || 0); }, 0) };
    db.accts.push(rec);
    return rec;
  }
  function load() {
    try {
      const raw = localStorage.getItem(LS);
      if (raw) { state.db = JSON.parse(raw); return; }
    } catch (e) {}
    state.db = fresh();
  }
  function save() {
    try { localStorage.setItem(LS, JSON.stringify(state.db)); } catch (e) {}
    state.rev += 1;                       // 供引导实操页轮询判定任务是否达成
    if (typeof window.onSimChange === 'function') { try { window.onSimChange(state.rev); } catch (e) {} }
  }
  function rev() { return state.rev; }
  function reset() {
    const sess = state.session;
    state.db = fresh(); state.session = sess; save();
    open(state.logged ? 'SMENU' : 'LOGIN');
    setStatus('info', msg('reset'));
  }

  // ---------------- 数据访问 ----------------
  function stockOf(mat, plant, sloc) {
    const k = mat + '/' + plant + '/' + sloc;
    if (!state.db.stock[k]) state.db.stock[k] = { unrestricted: 0, qi: 0, blocked: 0 };
    return state.db.stock[k];
  }
  function matAtPlant(mat, plant) {
    const m = state.db.materials[mat];
    return !!(m && (m.plant === plant || m.plant2 === plant));
  }
  function infoRec(v, m, org) { return state.db.inforecs[v + '/' + m + '/' + org]; }
  function prNumber(n) { return state.db.prs[n]; }
  function poNumber(n) { return state.db.pos[n]; }
  function grValue(po) { return (po.receivedQty || 0) * po.price; }

  // ---------------- 外壳 ----------------
  function menuItems() {
    const ja = state.lang === 'ja', en = state.lang === 'en';
    const tc = (state.screen && state.screen.tcode) || '';
    const pick = function (zh, e, j) { return ja ? j : en ? e : zh; };
    const rest = function (first) {
      return [first, pick('编辑', 'Edit', '編集'), pick('转到', 'Goto', 'ジャンプ'),
        pick('环境', 'Environment', '環境'), pick('系统', 'System', 'システム'), pick('帮助', 'Help', 'ヘルプ')];
    };
    if (/^BP|^XK/.test(tc)) return rest(pick('业务伙伴', 'Business Partner', 'ビジネスパートナ'));
    if (/^MM0|^MB0|^MB1|^MIGO/.test(tc)) return rest(pick('物料', 'Material', '品目'));
    if (/^ME/.test(tc)) return rest(pick('采购订单', 'Purchase Order', '購買発注'));
    if (/^MIRO|^MIR|^MRB|^MR1/.test(tc)) return rest(pick('发票校验', 'Invoice Verification', '請求書照合'));
    if (/^MB5|^MMBE|^MD04/.test(tc)) return rest(pick('采购', 'Purchasing', '購買'));
    if (/^FB|^F-/.test(tc)) return rest(pick('会计核算', 'Accounting', '会計'));
    if (/^SU3|^LOGIN/.test(tc)) return rest(pick('系统', 'System', 'システム'));
    return rest(pick('表', 'Table', 'テーブル'));
  }
  function sysline() {
    const cl = state.logged ? state.session.client : '110';
    return 'S4H (1) ' + cl + ' · ' + (state.lang === 'ja' ? 'JA' : state.lang === 'en' ? 'EN' : 'ZH') + ' · OVR';
  }
  function labels() {
    const ja = state.lang === 'ja', en = state.lang === 'en';
    return {
      stage: ja ? '実機演習' : en ? 'Exercise' : '实操仿真',
      steps: ja ? '演習の流れ' : en ? 'Exercise flow' : '演练流程',
      data: ja ? '演習データ' : en ? 'Exercise data' : '演练数据',
      stock: ja ? '在庫' : en ? 'Stock' : '库存',
      balance: ja ? 'GR/IR 残高' : en ? 'GR/IR balance' : 'GR/IR 余额',
      ap: ja ? '買掛金' : en ? 'Payables' : '应付账款',
      reset: ja ? 'データをリセット' : en ? 'Reset data' : '重置数据',
      guide: ja ? '手順ページ' : en ? 'Guide' : '配套手册',
      lang: ja ? '言語' : en ? 'Language' : '语言',
      period: ja ? '期間' : en ? 'Period' : '期间',
      client: ja ? 'クライアント' : en ? 'Client' : '客户端',
      user: ja ? 'ユーザ' : en ? 'User' : '用户',
      cmdhint: ja ? 'T-code を入力して Enter（/nも可）' : en ? 'Type a T-code and press Enter' : '输入 T-code 回车（支持 /n）'
    };
  }
  function toolbarHtml() {
    return '<div class="sap-tool">' +
      '<div class="cmdbox"><input id="cmd" autocomplete="off" placeholder="' + esc(labels().cmdhint) + '" value="' + esc(state.cmd || (state.screen ? state.screen.tcode : '')) + '"><span class="chev">⌄</span></div>' +
      '<button class="tbtn chk" title="Enter" onclick="SIM.enter()">✓</button><span class="sep"></span>' +
      '<button class="tbtn i-back" title="Back" onclick="SIM.back()"></button>' +
      '<button class="tbtn i-save" title="Save" onclick="SIM.save()"></button>' +
      '<button class="tbtn i-prev" title="Prev" onclick="SIM.enter()"></button>' +
      '<button class="tbtn i-exit" title="Exit" onclick="SIM.exit()"></button>' +
      '<button class="tbtn i-find" title="Find" onclick="SIM.find()"></button>' +
      '<button class="tbtn i-print" title="Print" onclick="window.print()"></button>' +
      '<span class="spacer"></span>' +
      '<button class="langbtn" onclick="SIM.lang()">' + (state.lang === 'ja' ? '日本語' : state.lang === 'en' ? 'English' : '中文') + '</button>' +
      '</div>';
  }
  function paint() {
    const root = document.getElementById('simroot');
    if (!root) return;
    const ae = document.activeElement;
    if (ae && ae.dataset && ae.dataset.k) state.focusKey = ae.dataset.k;
    // 每次重画都用当前字段值重建画面：这样「在字段里改了值再回车」才会真的生效
    if (state.screen && S.screens[state.screen.tcode]) {
      try { state.screen = S.screens[state.screen.tcode](); } catch (e) {}
    }
    const sc = state.screen || { tcode: 'SMENU', title: L('SAP Easy Access', 'SAP Easy Access', 'SAP Easy Access'), body: homeBody() };
    const mlist = (sc.menu && sc.menu.length) ? sc.menu : menuItems();
    const men = mlist.map(function (m) { return '<button onclick="return false">' + esc(m) + '</button>'; }).join('');
    root.innerHTML =
      '<div class="simwrap">' +
        '<div class="simstage"><div class="sapwin">' +
          '<div class="sap-title"><button class="bk" onclick="SIM.back()">‹</button><span class="t">' + esc(t(sc.title)) + '</span>' +
          '<span class="bts"><i class="mi"></i><i class="mz"></i><i class="mc"></i></span></div>' +
          '<div class="sap-menu">' + men + '<span class="sys">' + esc(sysline()) + '</span></div>' +
          toolbarHtml() +
          '<div class="sap-screen' + (state.dialog ? ' dim' : '') + '" id="sapScreen">' + sc.body + (state.dialog || '') + '</div>' +
          '<div class="sap-status info" id="sapStatus"><i></i><span></span></div>' +
        '</div></div>' +
        (EMBED ? '' : '<aside class="simside" id="simside">' + sideHtml() + '</aside>') +
      '</div>';
    if (EMBED) document.body.classList.add('embed');
    paintStatus();
    document.querySelectorAll('[data-k]').forEach(function (el) {
      if (state.form[el.dataset.k] === undefined) state.form[el.dataset.k] = el.value;
      el.addEventListener('input', function () { state.form[el.dataset.k] = el.value; });
      el.addEventListener('focus', function () { state.focusKey = el.dataset.k; });
    });
    // 回车后焦点回到刚才那个字段（跟真机一样），没有就回命令字段
    const cmd = document.getElementById('cmd');
    const back = state.focusKey ? root.querySelector('[data-k="' + state.focusKey + '"]') : null;
    if (back && !state.dialog) {
      back.focus();
      try { back.setSelectionRange(back.value.length, back.value.length); } catch (e) {}
    } else if (cmd) {
      cmd.focus();
    }
  }

  function sideHtml() {
    const lb = labels(), db = state.db;
    const done = {
      mat: !!db.materials['R-1001'],
      ven: !!db.vendors['100123'],
      inf: !!infoRec('100123', 'R-1001', '1710'),
      pr: !!(state.prNo || Object.keys(db.prs).length),
      po: !!(Object.keys(db.pos).length),
      gr: !!(Object.keys(db.pos).length && Object.keys(db.pos).some(function (k) { return db.pos[k].receivedQty > 0; })),
      iv: !!(Object.keys(db.invoices).length),
      pay: !!(db.payments.length)
    };
    const steps = [
      ['LOGIN', '登录 110', 'Log on client 110', 'ログオン 110', state.logged],
      ['MM01', '物料 R-1001', 'Material R-1001', '品目 R-1001', done.mat],
      ['BP', '供应商 100123', 'Vendor 100123', '仕入先 100123', done.ven],
      ['ME11', '采购信息记录', 'Info record', '購買情報レコード', done.inf],
      ['ME51N', '采购申请', 'Requisition', '購買依頼', done.pr],
      ['ME21N', '采购订单', 'Purchase order', '購買発注', done.po],
      ['MIGO', '收货', 'Goods receipt', '入庫', done.gr],
      ['MIRO', '发票校验', 'Invoice', '請求書照合', done.iv],
      ['MB01', '无 PO 收货', 'GR without PO', 'PO なし入庫', !!(db.pos && Object.keys(db.pos).some(function (k) { return db.pos[k].auto; }))],
      ['MR11', 'GR/IR 清账', 'GR/IR clearing', 'GR/IR 消込', !!(db.accts || []).some(function (a) { return a.ref && a.ref.indexOf('MR11') === 0; })],
      ['F-53', '付款', 'Payment', '支払', done.pay]
    ];
    const st = stockOf('R-1001', '1710', '0001');
    const grir = Object.keys(db.invoices).reduce(function (a, k) { return a + (db.invoices[k].posted ? 0 : 0); }, 0);
    let grirBal = 0;
    Object.keys(db.pos).forEach(function (k) {
      const po = db.pos[k];
      grirBal += (po.receivedQty || 0) * po.price - (po.invoicedQty || 0) * po.price;
    });
    const ap = Object.keys(db.invoices).reduce(function (a, k) {
      const inv = db.invoices[k];
      return a + (inv.paid ? 0 : (inv.amount || 0));
    }, 0);
    const li = steps.map(function (s) {
      const label = state.lang === 'ja' ? s[3] : state.lang === 'en' ? s[2] : s[1];
      return '<div class="step' + (s[4] ? ' done' : '') + '"><span class="dot"></span><span><b>' + s[0] + '</b><br>' + esc(label) + '</span></div>';
    }).join('');
    return '<h2>' + esc(lb.stage) + '</h2><div class="mini">' + esc(
      state.lang === 'ja' ? 'コマンドフィールドに T-code を入れて Enter。項目を埋めたら ✓ を押します。'
        : state.lang === 'en' ? 'Type a T-code in the command field and press Enter. Fill the fields, then press ✓.'
          : '命令字段输入 T-code 回车。填完字段点工具栏 ✓。') + '</div>' +
      '<h3>' + esc(lb.steps) + '</h3>' + li +
      '<h3>' + esc(lb.data) + '</h3>' +
      '<div class="kv"><span>' + esc(lb.period) + '</span><b>' + esc(db.cfg.period) + '</b></div>' +
      '<div class="kv"><span>' + esc(lb.client) + ' / ' + esc(lb.user) + '</span><b>' + esc(state.logged ? (state.session.client + ' / ' + state.session.user) : '—') + '</b></div>' +
      '<div class="kv"><span>' + esc(lb.stock) + ' R-1001 / 0001</span><b>' + num(st.unrestricted) + ' PC</b></div>' +
      '<div class="kv"><span>' + esc(lb.balance) + '</span><b>' + money(grirBal) + '</b></div>' +
      '<div class="kv"><span>' + esc(lb.ap) + '</span><b>' + money(ap) + '</b></div>' +
      '<div class="btnrow"><button class="gbtn" onclick="SIM.confirmReset()">' + esc(lb.reset) + '</button>' +
      '<a class="gbtn" href="index.html">' + esc(lb.guide) + '</a></div>' +
      '<div class="mini" style="margin-top:10px">' + esc(
        state.lang === 'ja' ? 'データは localStorage に保存します（sapgui810.lab.sim.v1）。'
          : state.lang === 'en' ? 'Data is stored in localStorage (sapgui810.lab.sim.v1).'
            : '数据保存在 localStorage（sapgui810.lab.sim.v1）。') + '</div>';
  }

  function homeBody() {
    const ja = state.lang === 'ja', en = state.lang === 'en';
    const rows = [
      ['LOGIN', ja ? 'ログオン' : en ? 'Log on' : '登录'],
      ['SMENU', ja ? 'SAP Easy Access' : en ? 'SAP Easy Access' : 'SAP Easy Access'],
      ['MM01', ja ? '品目マスタの登録' : en ? 'Create material' : '物料主数据 创建'],
      ['MM02', ja ? '品目マスタの変更' : en ? 'Change material' : '物料主数据 修改'],
      ['MM03', ja ? '品目マスタの照会' : en ? 'Display material' : '物料主数据 显示'],
      ['BP', ja ? '仕入先マスタの登録' : en ? 'Create vendor' : '供应商 创建/修改'],
      ['ME01', ja ? '供給元一覧' : en ? 'Source list' : '货源清单'],
      ['ME11', ja ? '購買情報レコード' : en ? 'Purchasing info record' : '采购信息记录'],
      ['ME12', ja ? '購買情報レコード変更' : en ? 'Change info record' : '修改信息记录'],
      ['ME51N', ja ? '購買依頼の登録' : en ? 'Create requisition' : '采购申请'],
      ['ME21N', ja ? '購買発注の登録' : en ? 'Create purchase order' : '采购订单'],
      ['ME23N', ja ? '購買発注の照会' : en ? 'Display purchase order' : '显示采购订单'],
      ['MIGO', ja ? '入庫' : en ? 'Goods receipt' : '收货'],
      ['MB01', ja ? '入庫（PO なし・101）' : en ? 'GR without PO (101)' : '无 PO 收货（101）'],
      ['MB1A', ja ? '払出（261）' : en ? 'Goods issue (261)' : '发货（261）'],
      ['MB1B', ja ? '転送転記（311）' : en ? 'Transfer posting (311)' : '转储过账（311）'],
      ['MIRO', ja ? '請求書照合' : en ? 'Invoice verification' : '发票校验'],
      ['MIR4', ja ? '請求書の照会' : en ? 'Display invoice' : '显示发票'],
      ['MRBR', ja ? 'ブロック請求書の解除' : en ? 'Release blocked invoice' : '释放冻结发票'],
      ['MR11', ja ? 'GR/IR 消込' : en ? 'GR/IR clearing' : 'GR/IR 清账'],
      ['MB5S', ja ? 'GR/IR 残高' : en ? 'GR/IR balance' : 'GR/IR 余额'],
      ['MMBE', ja ? '在庫概要' : en ? 'Stock overview' : '库存总览'],
      ['MD04', ja ? '在庫所要量一覧' : en ? 'Stock/requirements' : '库存需求清单'],
      ['FB03', ja ? '会計伝票の照会' : en ? 'Display accounting document' : '显示会计凭证'],
      ['F-53', ja ? '手動支払' : en ? 'Manual payment' : '手工付款'],
      ['OMJJ', ja ? '移動タイプの設定' : en ? 'Movement type customizing' : '移动类型定制'],
      ['OMR6', ja ? '請求書照合の許容範囲' : en ? 'Invoice tolerance limits' : '发票容差'],
      ['OB52', ja ? '会計期間' : en ? 'Posting periods' : '会计期间'],
      ['MMPV', ja ? '品目期間の繰越' : en ? 'Close material period' : '物料期间结转'],
      ['SU3', ja ? 'ユーザパラメータ' : en ? 'User parameters' : '个人参数']
    ];
    return '<div class="tree"><div style="font-weight:600;margin-bottom:4px">' +
      (ja ? 'お気に入り' : en ? 'Favorites' : '收藏夹') + '</div>' +
      rows.map(function (r) {
        return '<div class="node" onclick="SIM.go(\'' + r[0] + '\')"><span class="tw">▸</span><span class="tico doc"></span>' +
          '<b>' + r[0] + '</b>　' + esc(r[2]) + '</div>';
      }).join('') + '</div>';
  }

  // ---------------- 表单工具 ----------------
  function rebuild() {
    if (state.screen && S.screens[state.screen.tcode]) {
      try { state.screen = S.screens[state.screen.tcode](); } catch (e) {}
    }
  }
  function syncForm() {
    document.querySelectorAll('[data-k]').forEach(function (el) { state.form[el.dataset.k] = el.value; });
  }
  function val(k, dflt) {
    const v = state.form[k];
    return (v === undefined || v === null) ? (dflt === undefined ? '' : dflt) : v;
  }
  function fld(k, label, opt) {
    opt = opt || {};
    const v = val(k, opt.value || '');
    const cls = 'sap-in' + (opt.cls ? ' ' + opt.cls : '') + (opt.ro ? ' readonly' : '');
    return '<div class="frow' + (opt.req ? ' req' : '') + '"><span class="flabel">' + (opt.mark ? '<span class="n">' + opt.mark + '</span>' : '') +
      esc(label) + '</span>' +
      (opt.ro ? '<input class="' + cls + '" value="' + esc(v) + '" readonly>'
        : '<input class="' + cls + '" data-k="' + k + '" value="' + esc(v) + '"' + (opt.ph ? ' placeholder="' + esc(opt.ph) + '"' : '') + '>') +
      (opt.hint ? '<span class="hint">' + esc(opt.hint) + '</span>' : '') + '</div>';
  }
  function boxT(legend, inner) { return '<div class="gbox"><span class="gleg">' + esc(legend) + '</span>' + inner + '</div>'; }
  function tabs(names, on) {
    return '<div class="tabs">' + names.map(function (n, i) {
      return '<span class="tab' + (i === on ? ' on' : '') + '">' + esc(n) + '</span>';
    }).join('') + '</div>';
  }
  function table(head, rows, cls) {
    return '<div class="' + (cls || 'alv') + '"><table><tr>' + head.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') + '</tr>' +
      rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + (typeof c === 'object' ? esc(c) : c) + '</td>'; }).join('') + '</tr>'; }).join('') +
      '</table></div>';
  }
  function need(k, label) {
    if (!String(val(k)).trim()) { setStatus('err', msg('need', { f: label })); return false; }
    return true;
  }

  // ---------------- 路由 ----------------
  function open(tcode, form) {
    state.form = form || {};
    // 记录「去过哪些画面、带了什么关键值」，引导实操据此判定，避免停留时间太短就判不到
    state.seen = state.seen || {};
    state.seen[tcode.toUpperCase()] = { mat: (form && form.mat) || '', po: (form && form.po) || '', doc: (form && form.doc) || '', at: Date.now() };
    state.cmd = tcode;
    state.dialog = null;
    const f = S.screens[tcode.toUpperCase()];
    if (tcode.toUpperCase() !== 'LOGIN' && !state.logged) {
      const lg = S.screens.LOGIN ? S.screens.LOGIN() : state.screen;
      if (lg) state.screen = lg;
      setStatus('err', msg('needLogin', { c: tcode }));
      paint();
      return;
    }
    if (!f) {
      setStatus('err', msg('wrongTcode', { c: tcode, l: 'LOGIN MM01 MM02 MM03 BP ME01 ME11 ME12 ME21N ME23N ME51N ME12 MIGO MB01 MB1A MB1B MB5S MB52 MR11 MIR4 MIR7 MRBR MMBE MD04 FB03 F-53 OMJJ OMR6 OB52 MMPV SU3' }));
      paint();
      return;
    }
    state.screen = f();
    paint();
  }

  function keyHandler(e) {
    const tag = (e.target && e.target.tagName ? e.target.tagName : '').toUpperCase();
    const inField = tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA';
    if (e.key === 'Enter' || e.key === 'F8') {
      e.preventDefault();
      if (inField && e.target.id === 'cmd') { SIM.go(e.target.value); return; }
      if (state.dialog) {
        if (state.__enterDlg && SIM[state.__enterDlg]) SIM[state.__enterDlg]();
        else SIM.dialogOk();
        return;
      }
      SIM.enter();
      return;
    }
    if (e.key === 'F3') { e.preventDefault(); if (state.dialog) SIM.closeDlg(); else SIM.back(); return; }
    if (e.key === 'Escape') { if (state.dialog) { e.preventDefault(); SIM.closeDlg(); } return; }
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) { e.preventDefault(); SIM.save(); }
  }

  const SIM = {
    go: function (raw) {
      const code = String(raw || '').trim().replace(/^\/(n|o|i|nex)?/i, '').trim() || 'SMENU';
      if (/^\/n$/i.test(String(raw).trim())) { open(state.logged ? 'SMENU' : 'LOGIN'); return; }
      open(code.toUpperCase());
    },
    login: function (client, user, pw, lang) {
      client = String(client || '').trim();
      user = String(user || '').trim();
      if (!user || !String(pw || '').trim()) { setStatus('err', msg('needUser')); paint(); return false; }
      if (client !== '110' && client !== '100') { setStatus('err', msg('badClient', { c: client || '—' })); paint(); return false; }
      state.logged = true;
      state.session = { client: client, user: user, lang: lang || 'ZH' };
      if (lang && { ZH: 'zh', EN: 'en', JA: 'ja' }[String(lang).toUpperCase()]) {
        state.lang = { ZH: 'zh', EN: 'en', JA: 'ja' }[String(lang).toUpperCase()];
        localStorage.setItem('sapgui810.lab.lang', state.lang);
      }
      open('SMENU');
      setStatus('ok', msg('loginOk', { c: client, u: user, l: String(lang || 'ZH').toUpperCase() }));
      paint();
      return true;
    },
    enter: function () {
      syncForm(); rebuild();
      if (state.dialog) {
        if (state.__enterDlg && SIM[state.__enterDlg]) SIM[state.__enterDlg]();
        else SIM.dialogOk();
        return;
      }
      if (state.screen && state.screen.onEnter) state.screen.onEnter();
      else setStatus('info', msg('press'));
      paint();
    },
    save: function () {
      syncForm(); rebuild();
      if (state.dialog) { SIM.dialogOk(); return; }
      if (!state.screen || !state.screen.onSave) { setStatus('err', msg('readonly')); paint(); return; }
      state.screen.onSave();
      paint();
    },
    back: function () { state.dialog = null; open('SMENU'); },
    exit: function () { state.dialog = null; setStatus('info', ''); paint(); },
    find: function () { setStatus('info', msg('press')); paint(); },
    lang: function () {
      const i = LANGS.indexOf(state.lang);
      state.lang = LANGS[(i + 1) % LANGS.length];
      localStorage.setItem('sapgui810.lab.lang', state.lang);
      const code = state.screen ? state.screen.tcode : 'SMENU';
      const form = state.form;
      open(code, form);
      setStatus('info', state.lang === 'ja' ? '言語を日本語に切り替えました' : state.lang === 'en' ? 'Language switched to English' : '界面语言已切换为中文');
      paint();
    },
    confirmReset: function () {
      state.dialog = '<div class="dlg"><div class="dh"><span>' + esc(labels().reset) + '</span><span>✕</span></div>' +
        '<div class="db">' + esc(state.lang === 'ja' ? '演習データ（品目・仕入先・伝票・在庫）を初期状態に戻します。よろしいですか？'
          : state.lang === 'en' ? 'All exercise data (materials, vendors, documents, stock) will be reset. Continue?'
            : '将把演练数据（物料、供应商、单据、库存）恢复为初始状态。继续吗？') + '</div>' +
        '<div class="df"><button class="gbtn" onclick="SIM.closeDlg()">' + esc(state.lang === 'ja' ? '取消' : state.lang === 'en' ? 'Cancel' : '取消') + '</button>' +
        '<button class="gbtn danger" onclick="SIM.resetNow()">' + esc(state.lang === 'ja' ? 'リセット' : state.lang === 'en' ? 'Reset' : '重置') + '</button></div></div>';
      paint();
    },
    closeDlg: function () { state.dialog = null; paint(); },
    dialogOk: function () { state.dialog = null; paint(); },
    resetNow: function () { state.dialog = null; reset(); },
    toast: function (icon, text) { setStatus(icon, text); paintStatus(); }
  };

  // ---------------- 启动 ----------------
  // 立即导出：sim-screens.js 加载时要能用 S / SIM
  window.S = { screens: {}, state: state, db: function () { return state.db; }, save: save, rev: rev,
    t: t, L: L, fmt: fmt, num: num, esc: esc, money: money, parseNum: parseNum,
    fld: fld, box: boxT, tabs: tabs, table: table, need: need, val: val, sync: syncForm,
    setStatus: setStatus, msg: msg, paint: paint, open: open,
    stockOf: stockOf, matAtPlant: matAtPlant, infoRec: infoRec, poNumber: poNumber,
    grValue: grValue, fresh: fresh,
    periodOf: periodOf, prevPeriod: prevPeriod, periodOpen: periodOpen,
    srcVendors: srcVendors, postAcct: postAcct, acctDate: acctDate };
  window.SIM = SIM;

  function init() {
    if (!window.__simKeys) { window.__simKeys = true; document.addEventListener('keydown', keyHandler); }
    const m = /[?&]lang=(zh|en|ja)/.exec(location.search);
    if (m) { state.lang = m[1]; localStorage.setItem('sapgui810.lab.lang', state.lang); }
    load();
    // 每次打开都从 SAP Logon 开始：登录本身就是本课的第一个练习
    state.logged = false;
    open('LOGIN');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
