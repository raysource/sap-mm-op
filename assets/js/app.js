/* 课程站交互：侧栏、进度、清单勾选、自测判分、T-code 复制、上一页/下一页。
   页面只需提供 window.CHAPTERS（由构建器内联）与 data-ed / data-root。 */
(function () {
  const LANG = document.documentElement.dataset.ed || 'zh';
  const ROOT = document.documentElement.dataset.root || '';
  const UI = {
    zh: { mark: '标记本页完成', done: '✓ 本页已完成（点击取消）', note: '演练数据', env: '客户端 110 · 1710 / 1710 / 001',
      side: '课程目录', right: '回答正确', wrong: '再想想：先回章节看对应表格', score: '得分',
      copy: '已复制', lab: '引导实操 ▶' },
    en: { mark: 'Mark page complete', done: '✓ Page complete (click to undo)', note: 'Exercise data', env: 'Client 110 · 1710 / 1710 / 001',
      side: 'Contents', right: 'Correct', wrong: 'Not quite — check the chapter table', score: 'Score',
      copy: 'Copied', lab: 'Guided lab ▶' },
    ja: { mark: 'このページを完了にする', done: '✓ 完了（クリックで取消）', note: '演習データ', env: 'クライアント 110 · 1710 / 1710 / 001',
      side: '目次', right: '正解', wrong: 'もう一度：該当章の表を確認', score: '得点',
      copy: 'コピー済', lab: 'ガイド演習 ▶' }
  }[LANG] || {};
  const P_KEY = 'gui810.progress.' + LANG + '.v1';
  const C_KEY = 'gui810.check.' + LANG + '.v1';
  const store = {
    get: function (k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const chapters = window.CHAPTERS || [];
  const main = document.getElementById('main');
  const page = main ? main.dataset.page : '';
  const done = store.get(P_KEY, {});

  /* ---- 侧栏 ---- */
  const side = document.getElementById('sidebar');
  if (side && chapters.length) {
    const byId = {}; chapters.forEach(function (c) { byId[c.id] = c; });
    const groups = [];
    chapters.forEach(function (c) {
      let g = groups.filter(function (x) { return x.name === c.group; })[0];
      if (!g) { g = { name: c.group, items: [] }; groups.push(g); }
      g.items.push(c);
    });
    let html = '';
    groups.forEach(function (g) {
      html += '<div class="side-head">' + g.name + '</div>';
      g.items.forEach(function (c) {
        html += '<a class="snav' + (c.id === page ? ' active' : '') + '" href="' + ROOT + c.file + '">' +
          '<span class="dot' + (done[c.id] ? ' done' : '') + '"></span><span>' + c.title + '</span></a>';
      });
    });
    html += '<div class="side-note" style="font-size:11.5px;color:#7d8f9e;margin-top:16px;line-height:1.7">' +
      UI.note + '<br>' + (UI.env || '') + '<br>R-1001 · 100123 · 720.00 USD</div>';
    side.innerHTML = html;
  }

  /* ---- 进度 ---- */
  function paintProgress() {
    const n = chapters.filter(function (c) { return done[c.id]; }).length;
    const t = chapters.length || 1;
    const pt = document.getElementById('progTxt');
    const pb = document.getElementById('progBar');
    if (pt) pt.textContent = n + '/' + t;
    if (pb) pb.style.width = (n / t * 100) + '%';
  }
  paintProgress();

  /* ---- 标记完成 ---- */
  if (main && page) {
    const btn = document.createElement('button');
    btn.className = 'markdone noprint';
    btn.textContent = done[page] ? UI.done : UI.mark;
    btn.addEventListener('click', function () {
      if (done[page]) { delete done[page]; } else { done[page] = true; }
      store.set(P_KEY, done);
      btn.textContent = done[page] ? UI.done : UI.mark;
      const d = side && side.querySelector('.snav.active .dot');
      if (d) d.classList.toggle('done', !!done[page]);
      paintProgress();
    });
    main.appendChild(btn);
  }

  /* ---- 清单勾选 ---- */
  const chk = store.get(C_KEY, {});
  document.querySelectorAll('ul.check li').forEach(function (li, i) {
    const key = page + '#' + i;
    if (chk[key]) li.classList.add('done');
    li.addEventListener('click', function () {
      li.classList.toggle('done');
      chk[key] = li.classList.contains('done');
      store.set(C_KEY, chk);
    });
  });

  /* ---- T-code 复制 ---- */
  document.querySelectorAll('.copyc').forEach(function (b) {
    b.addEventListener('click', function () {
      const txt = b.textContent.trim();
      try { navigator.clipboard.writeText(txt); } catch (e) {}
      const old = b.textContent;
      b.classList.add('ok'); b.textContent = UI.copy;
      setTimeout(function () { b.textContent = old; b.classList.remove('ok'); }, 900);
    });
  });

  /* ---- 自测 ---- */
  document.querySelectorAll('.quiz .q').forEach(function (q) {
    const ans = Number(q.dataset.ok);
    const scoreEl = document.getElementById('quizScore');
    q.querySelectorAll('button').forEach(function (b, i) {
      b.addEventListener('click', function () {
        if (q.dataset.answered) return;
        q.dataset.answered = '1';
        q.dataset.got = (i === ans) ? '1' : '0';
        q.querySelectorAll('button')[ans].classList.add('right');
        if (i !== ans) b.classList.add('wrong');
        q.querySelectorAll('button').forEach(function (x) { x.disabled = true; });
        const all = document.querySelectorAll('.quiz .q');
        const got = Array.prototype.filter.call(all, function (x) { return x.dataset.got === '1'; }).length;
        const answered = Array.prototype.filter.call(all, function (x) { return !!x.dataset.answered; }).length;
        if (scoreEl) scoreEl.textContent = UI.score + ' ' + got + ' / ' + all.length +
          (answered < all.length ? '（已答 ' + answered + '）' : '');
      });
    });
  });

  /* ---- 上一页 / 下一页 ---- */
  const pn = document.querySelector('.pn');
  if (pn && chapters.length) {
    const idx = chapters.findIndex(function (c) { return c.id === page; });
    const prev = chapters[idx - 1], next = chapters[idx + 1];
    pn.innerHTML = (prev ? '<a href="' + ROOT + prev.file + '">‹ ' + prev.title + '</a>' : '<span></span>') +
      (next ? '<a href="' + ROOT + next.file + '">' + next.title + ' ›</a>' : '<span></span>');
  }
})();
