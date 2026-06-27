(function(){
  // ===== 共通ナビゲーション =====
  // このファイルを編集すれば全ページのナビが一括で変わります

  var isTop = (location.pathname === '/' || location.pathname === '/index.html');

  function link(href, label, cls) {
    var a = document.createElement('a');
    // トップページはアンカーリンクそのまま、他ページは /# に変換
    if (!isTop && href.startsWith('#')) {
      a.href = '/' + href;
    } else {
      a.href = href;
    }
    a.textContent = label;
    if (cls) a.className = cls;
    // 現在のページをアクティブ表示
    if (href === '/features/' && location.pathname.startsWith('/features')) {
      a.style.color = '#fff';
      a.style.fontWeight = '700';
    }
    if (href === '/archives/' && location.pathname.startsWith('/archives')) {
      a.style.color = '#fff';
      a.style.fontWeight = '700';
    }
    return a;
  }

  var navItems = [
    { href: '#flagship',  label: '目玉機能' },
    { href: '/features/', label: '全機能を見る' },
    { href: '#pricing',   label: '料金' },
    { href: '#shipping',  label: '送料' },
    { href: '#leadtime',  label: '納期' },
    { href: '#quality',   label: '現場品質' },
    { href: '#voices',    label: 'お客様の声' },
    { href: '#howto',     label: 'ご利用の流れ' },
    { href: '#faq',       label: 'FAQ' },
    { href: '#contact',   label: 'お問い合わせ', cls: 'btn ghost' },
    { href: 'https://share.hsforms.com/1IXWWQMrUTYGnwg9T3xzplgrvgvr', label: '審査申込', cls: 'btn', target: '_blank' },
  ];

  // グローバルナビに挿入
  var nav = document.querySelector('header .nav-links');
  if (nav) {
    nav.innerHTML = '';
    navItems.forEach(function(item) {
      var a = link(item.href, item.label, item.cls || '');
      if (item.target) { a.target = item.target; a.rel = 'noopener'; }
      nav.appendChild(a);
    });
  }

  // モバイルメニューに挿入
  var mobile = document.getElementById('mobileMenu');
  if (mobile) {
    mobile.innerHTML = '';
    navItems.forEach(function(item) {
      var a = link(item.href, item.label, item.cls || '');
      if (item.target) { a.target = item.target; a.rel = 'noopener'; }
      mobile.appendChild(a);
    });
  }

  // フッターナビに挿入
  var foot = document.getElementById('footMenu');
  if (foot) {
    foot.innerHTML = '';
    navItems.forEach(function(item) {
      if (item.cls && item.cls.includes('btn')) return; // ボタンはフッターに不要
      var a = link(item.href, item.label, '');
      foot.appendChild(a);
    });
  }
})();
