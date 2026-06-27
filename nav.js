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
    { href: '/#features', label: '全機能を見る' },
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
    { href: '/contact/',      label: 'お問い合わせ' },
    { href: 'https://share.hsforms.com/1IXWWQMrUTYGnwg9T3xzplgrvgvr', label: '審査申込', cls: 'btn', target: '_blank' },
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
