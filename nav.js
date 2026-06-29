(function(){
  // ===== 共通ナビゲーション =====
  // このファイルを編集すれば全ページのナビが一括で変わります

  // ドロップダウン用CSSを注入（PCはホバー、モバイルはタップで .open を付与）
  var css = ''
    + '.nav-dropdown { position: relative; }'
    + '.nav-dropdown > span { cursor: pointer; color: rgba(255,255,255,.78); font-size: 14px; font-weight: 500; }'
    + '.nav-dropdown:hover > span, .nav-dropdown.open > span { color: #fff; }'
    + '.nav-dropdown ul { display: none; position: absolute; top: 100%; left: 0; background: #14235E; border-radius: 8px; padding: 8px 0; min-width: 140px; box-shadow: 0 8px 24px rgba(0,0,0,.3); z-index: 100; list-style: none; margin: 0; }'
    + '.nav-dropdown:hover ul, .nav-dropdown.open ul { display: block; }'
    + '.nav-dropdown ul a { display: block; padding: 10px 18px; color: rgba(255,255,255,.78); font-size: 13px; white-space: nowrap; }'
    + '@media(max-width:1100px){'
    + '  .mobile-menu .nav-dropdown{position:static;width:100%;}'
    + '  .mobile-menu .nav-dropdown > span{display:flex;align-items:center;justify-content:space-between;width:100%;color:#fff;font-size:19px;font-weight:700;padding:15px 4px;border-bottom:1px solid rgba(255,255,255,.12);}'
    + '  .mobile-menu .nav-dropdown ul{display:block !important;position:static;background:transparent;box-shadow:none;min-width:0;padding:0;margin:0;}'
    + '  .mobile-menu .nav-dropdown ul a{padding:13px 4px 13px 20px;font-size:16px;color:rgba(255,255,255,.85);white-space:normal;border-bottom:1px solid rgba(255,255,255,.08);}'
    + '}'
    + '.nav-dropdown ul a:hover { color: #fff; background: rgba(255,255,255,.06); }';
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var isTop = (location.pathname === '/' || location.pathname === '/index.html');

  function link(href, label, cls) {
    var a = document.createElement('a');
    // トップページはアンカーリンクそのまま、他ページは絶対パスのまま（/# 形式）で遷移
    if (!isTop && href.charAt(0) === '#') {
      a.href = '/' + href;
    } else {
      a.href = href;
    }
    a.textContent = label;
    if (cls) a.className = cls;
    // 現在のページをアクティブ表示（実ページへのリンクのみ）
    if (href.charAt(0) === '/' && href.indexOf('#') === -1 && href !== '/' &&
        location.pathname.indexOf(href) === 0) {
      a.style.color = '#fff';
      a.style.fontWeight = '700';
    }
    return a;
  }

  var navItems = [
    { href: '/#flagship', label: '目玉機能' },
    { href: '/features/', label: '全機能を見る' },
    { href: '/#pricing',  label: '料金' },
    { href: '/#shipping', label: '送料' },
    {
      label: 'サービス詳細',
      children: [
        { href: '/#leadtime', label: '納期' },
        { href: '/#quality',  label: '現場品質' },
        { href: '/#voices',   label: 'お客様の声' },
        { href: '/#howto',    label: 'ご利用の流れ' },
        { href: '/#faq',      label: 'FAQ' },
        { href: '/company/',  label: '会社概要' },
      ]
    },
    { href: '/archives/421/', label: '初心者ガイド' },
    { href: '/ichiran/',      label: 'ブログ' },
    { href: '#contact',       label: 'お問い合わせ' },
    { href: 'https://share.hsforms.com/1IXWWQMrUTYGnwg9T3xzplgrvgvr', label: '利用申込', cls: 'btn', target: '_blank' },
  ];

  // ドロップダウン要素を生成（PCホバー：CSS / モバイルタップ：clickで .open トグル）
  function buildDropdown(item) {
    var wrap = document.createElement('div');
    wrap.className = 'nav-dropdown';
    var span = document.createElement('span');
    span.textContent = item.label;
    wrap.appendChild(span);
    var ul = document.createElement('ul');
    item.children.forEach(function(child) {
      var li = document.createElement('li');
      var a = link(child.href, child.label, '');
      if (child.target) { a.target = child.target; a.rel = 'noopener'; }
      li.appendChild(a);
      ul.appendChild(li);
    });
    wrap.appendChild(ul);
    span.addEventListener('click', function(e) {
      e.stopPropagation();
      var isOpen = wrap.classList.contains('open');
      // 他に開いているドロップダウンを閉じる
      var others = document.querySelectorAll('.nav-dropdown.open');
      for (var i = 0; i < others.length; i++) others[i].classList.remove('open');
      if (!isOpen) wrap.classList.add('open');
    });
    return wrap;
  }

  // 外側タップでドロップダウンを閉じる
  document.addEventListener('click', function() {
    var open = document.querySelectorAll('.nav-dropdown.open');
    for (var i = 0; i < open.length; i++) open[i].classList.remove('open');
  });

  // メニュー（ヘッダー / モバイル）へ挿入：ドロップダウン対応
  function renderMenu(container) {
    container.innerHTML = '';
    navItems.forEach(function(item) {
      if (item.children) {
        container.appendChild(buildDropdown(item));
        return;
      }
      var a = link(item.href, item.label, item.cls || '');
      if (item.target) { a.target = item.target; a.rel = 'noopener'; }
      container.appendChild(a);
    });
  }

  // グローバルナビに挿入
  var nav = document.querySelector('header .nav-links');
  if (nav) renderMenu(nav);

  // モバイルメニューに挿入
  var mobile = document.getElementById('mobileMenu');
  if (mobile) renderMenu(mobile);

  // フッターナビに挿入（ボタンは除外、ドロップダウンは子要素をフラットに展開）
  var foot = document.getElementById('footMenu');
  if (foot) {
    foot.innerHTML = '';
    navItems.forEach(function(item) {
      if (item.children) {
        item.children.forEach(function(child) {
          foot.appendChild(link(child.href, child.label, ''));
        });
        return;
      }
      if (item.cls && item.cls.indexOf('btn') !== -1) return; // ボタンはフッターに不要
      foot.appendChild(link(item.href, item.label, ''));
    });
  }
})();

/* ===== お問い合わせモーダル（全ページ共通） ===== */
(function(){
  if (!document.getElementById('contactModalCss')) {
    var mcss = document.createElement('style');
    mcss.id = 'contactModalCss';
    mcss.textContent = ''
      + '.modal-overlay{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(8,14,34,.72);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);opacity:0;visibility:hidden;transition:opacity .3s ease,visibility .3s ease;}'
      + '.modal-overlay.open{opacity:1;visibility:visible;}'
      + '.modal{background:#fff;color:#101736;border-radius:20px;max-width:440px;width:100%;padding:36px 30px 30px;position:relative;box-shadow:0 40px 90px rgba(0,0,0,.5);transform:translateY(20px) scale(.97);transition:transform .35s cubic-bezier(.16,.84,.34,1);font-family:"Noto Sans JP",system-ui,sans-serif;}'
      + '.modal-overlay.open .modal{transform:none;}'
      + '.modal-close{position:absolute;top:16px;right:16px;width:34px;height:34px;border-radius:50%;border:none;background:#F3F6FB;color:#5B668C;font-size:20px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s,color .2s;}'
      + '.modal-close:hover{background:#e9edf5;color:#101736;}'
      + '.modal h3{font-family:"Noto Sans JP",system-ui,sans-serif;font-weight:900;font-size:23px;margin:0 0 6px;letter-spacing:.01em;}'
      + '.modal .msub{font-size:13.5px;color:#5B668C;margin-bottom:24px;line-height:1.6;}'
      + '.contact-opts{display:flex;flex-direction:column;gap:12px;}'
      + '.copt{display:flex;align-items:center;gap:16px;text-align:left;border:1px solid rgba(16,23,54,.10);border-radius:14px;padding:16px 18px;transition:transform .15s ease,box-shadow .2s ease,border-color .2s;}'
      + '.copt:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(16,23,54,.10);border-color:rgba(240,100,10,.5);}'
      + '.copt .cico{flex-shrink:0;width:46px;height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:13px;letter-spacing:.02em;color:#fff;font-weight:700;}'
      + '.copt .cico.line{background:#06C755;}'
      + '.copt .cico.cw{background:#2E7CE4;}'
      + '.copt .ctxt{flex:1;}'
      + '.copt .ctxt b{display:block;font-size:15.5px;font-weight:700;color:#101736;}'
      + '.copt .ctxt small{display:block;font-size:12.5px;color:#5B668C;margin-top:2px;line-height:1.5;}'
      + '.copt .carr{color:#5B668C;flex-shrink:0;font-size:18px;transition:transform .2s,color .2s;}'
      + '.copt:hover .carr{color:#F0640A;transform:translateX(3px);}';
    document.head.appendChild(mcss);
  }

  var overlay = document.getElementById('contactModal');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'contactModal';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-hidden','true');
    overlay.innerHTML = ''
      + '<div class="modal">'
      + '<button class="modal-close" id="modalClose" aria-label="閉じる">&times;</button>'
      + '<h3 id="modalTitle">お問い合わせ</h3>'
      + '<p class="msub">ご都合のよい方法でお気軽に。<br>「うちの場合、どう変わる？」をそのままお聞かせください。</p>'
      + '<div class="contact-opts">'
      + '<a class="copt" href="https://lin.ee/51gfGsk" target="_blank" rel="noopener"><span class="cico line">LINE</span><span class="ctxt"><b>LINEで相談する</b><small>ふだん使いのLINEで、気軽にやり取り</small></span><span class="carr">&rsaquo;</span></a>'
      + '<a class="copt" href="https://www.chatwork.com/mct_takemura" target="_blank" rel="noopener"><span class="cico cw">CW</span><span class="ctxt"><b>Chatworkで相談する</b><small>ビジネスチャットでしっかりやり取り</small></span><span class="carr">&rsaquo;</span></a>'
      + '</div>'
      + '</div>';
    document.body.appendChild(overlay);
  }

  function openModal(){ overlay.classList.add('open'); overlay.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
  function closeModal(){ overlay.classList.remove('open'); overlay.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }

  document.addEventListener('click', function(e){
    if (!e.target.closest) return;
    var a = e.target.closest('a[href$="#contact"]');
    if (a){ e.preventDefault(); openModal(); return; }
    if (e.target.closest('#modalClose')){ closeModal(); return; }
    if (e.target === overlay){ closeModal(); }
  });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeModal(); });
})();

/* ===== 利用申込みモーダルの共通JSを読み込み（全ページ共通） ===== */
(function(){
  if (document.getElementById('applyModalScript')) return;
  var sc = document.createElement('script');
  sc.id = 'applyModalScript';
  sc.src = '/apply-modal.js';
  sc.defer = true;
  document.head.appendChild(sc);
})();
