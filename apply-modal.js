/* =========================================================================
   利用申込み プラン選択モーダル ＋ iframe埋め込みフォーム（全ページ共通）
   - 既存の HubSpot 申込リンク（share.hsforms.com）をクリック乗っ取りして起動
   - 3プラン（free / standard / business）選択 → app.mctcompany.net/apply を iframe表示
   - iframe は遅延生成（プラン選択時に初めて生成）
   - postMessage で高さ自動調整・完了通知（オリジン検証必須）
   - GA4ファネル: application_button_click → application_plan_select
                  → application_form_start → application_complete
   - 色は CSS変数を使わず直値（記事ページ等でも崩れないように）
   ========================================================================= */
(function(){
  if (window.__applyModalInit) return;   // 二重初期化防止
  window.__applyModalInit = true;

  var IFRAME_ORIGIN = 'https://app.mctcompany.net';
  var IFRAME_BASE   = IFRAME_ORIGIN + '/apply';

  var PLANS = [
    { key: 'free',     name: '月額無料プラン',       desc: 'まずは無料で。基本機能をご利用いただけます。', badge: '無料' },
    { key: 'standard', name: 'スタンダードプラン',   desc: '商品検索・利益シミュレーション・粗利管理機能が使えます。', badge: '人気' },
    { key: 'business', name: 'ビジネスプラン',       desc: '全機能に加え、送料や手数料が割引になります。', badge: '最上位' }
  ];

  var currentPlan = null;
  var iframeEl = null;

  // GA4: gtag が無いページでも落ちないようにガード
  function track(name, params){
    try { if (typeof window.gtag === 'function') window.gtag('event', name, params || {}); } catch(e){}
  }

  /* ---------- CSS注入 ---------- */
  if (!document.getElementById('applyModalCss')) {
    var s = document.createElement('style');
    s.id = 'applyModalCss';
    s.textContent = ''
      + '.applym-overlay{position:fixed;inset:0;z-index:1100;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(8,14,34,.74);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);opacity:0;visibility:hidden;transition:opacity .3s ease,visibility .3s ease;}'
      + '.applym-overlay.open{opacity:1;visibility:visible;}'
      + '.applym-modal{position:relative;background:#fff;color:#101736;border-radius:20px;width:100%;max-width:560px;max-height:92vh;overflow:auto;-webkit-overflow-scrolling:touch;padding:34px 28px 28px;box-shadow:0 40px 90px rgba(0,0,0,.5);transform:translateY(20px) scale(.97);transition:transform .35s cubic-bezier(.16,.84,.34,1);font-family:"Noto Sans JP",system-ui,sans-serif;}'
      + '.applym-overlay.open .applym-modal{transform:none;}'
      + '.applym-modal[data-step="form"]{max-width:680px;padding:18px;}'
      + '.applym-close{position:absolute;top:14px;right:14px;width:34px;height:34px;border-radius:50%;border:none;background:#F3F6FB;color:#5B668C;font-size:21px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s,color .2s;z-index:2;}'
      + '.applym-close:hover{background:#e9edf5;color:#101736;}'
      + '.applym-step{display:none;}'
      + '.applym-modal[data-step="plans"] .applym-step-plans{display:block;}'
      + '.applym-modal[data-step="form"] .applym-step-form{display:block;}'
      + '.applym-h3{font-weight:900;font-size:23px;margin:0 0 6px;letter-spacing:.01em;}'
      + '.applym-sub{font-size:13.5px;color:#5B668C;margin:0 0 22px;line-height:1.6;}'
      + '.applym-plans{display:flex;flex-direction:column;gap:12px;}'
      + '.applym-plan{display:flex;align-items:center;gap:16px;text-align:left;border:1px solid rgba(16,23,54,.12);border-radius:14px;padding:16px 18px;transition:transform .15s ease,box-shadow .2s ease,border-color .2s;}'
      + '.applym-plan:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(16,23,54,.10);border-color:rgba(240,100,10,.55);}'
      + '.applym-plan-body{flex:1;min-width:0;}'
      + '.applym-plan-name{display:flex;align-items:center;gap:8px;font-size:16.5px;font-weight:800;color:#101736;}'
      + '.applym-plan-badge{flex-shrink:0;font-size:11px;font-weight:700;color:#fff;background:#F0640A;border-radius:999px;padding:2px 9px;letter-spacing:.02em;}'
      + '.applym-plan[data-plan="free"] .applym-plan-badge{background:#5B668C;}'
      + '.applym-plan[data-plan="business"] .applym-plan-badge{background:#14235E;}'
      + '.applym-plan-desc{font-size:12.8px;color:#5B668C;margin-top:4px;line-height:1.55;}'
      + '.applym-plan-btn{flex-shrink:0;border:none;cursor:pointer;background:#F0640A;color:#fff;font-weight:700;font-size:13.5px;border-radius:10px;padding:11px 16px;white-space:nowrap;transition:background .2s,transform .15s;font-family:inherit;}'
      + '.applym-plan-btn:hover{background:#d8550a;transform:translateX(2px);}'
      + '.applym-form-head{display:flex;align-items:center;gap:12px;padding:6px 6px 12px;}'
      + '.applym-back{border:none;background:transparent;color:#5B668C;font-size:13.5px;font-weight:600;cursor:pointer;padding:6px 8px;border-radius:8px;font-family:inherit;transition:background .2s,color .2s;}'
      + '.applym-back:hover{background:#F3F6FB;color:#101736;}'
      + '.applym-form-plan{font-size:13px;color:#101736;font-weight:700;}'
      + '.applym-frame-wrap{position:relative;border-radius:14px;overflow:hidden;background:#fff;min-height:60vh;}'
      + '.applym-iframe{display:block;width:100%;border:0;min-height:60vh;transition:height .2s ease;}'
      + '.applym-loading{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:#fff;color:#5B668C;font-size:13px;}'
      + '.applym-loading.hide{display:none;}'
      + '.applym-spin{width:34px;height:34px;border-radius:50%;border:3px solid rgba(16,23,54,.12);border-top-color:#F0640A;animation:applymspin .8s linear infinite;}'
      + '@keyframes applymspin{to{transform:rotate(360deg);}}'
      + '.applym-done{text-align:center;padding:40px 16px;}'
      + '.applym-done .applym-done-ic{width:64px;height:64px;border-radius:50%;background:#06C755;color:#fff;font-size:32px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;}'
      + '.applym-done h3{font-size:21px;font-weight:900;margin:0 0 8px;color:#101736;}'
      + '.applym-done p{font-size:14px;color:#5B668C;margin:0 0 22px;line-height:1.7;}'
      + '.applym-done-btn{display:inline-block;border:none;cursor:pointer;background:#101736;color:#fff;font-weight:700;font-size:14px;border-radius:10px;padding:13px 28px;font-family:inherit;}'
      + '@media(max-width:560px){'
      + '  .applym-modal{padding:30px 18px 22px;border-radius:16px;}'
      + '  .applym-plan{flex-direction:column;align-items:stretch;gap:12px;}'
      + '  .applym-plan-btn{width:100%;text-align:center;}'
      + '  .applym-h3{font-size:20px;}'
      + '}';
    document.head.appendChild(s);
  }

  /* ---------- モーダルDOM生成 ---------- */
  var overlay = document.getElementById('applyModal');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'applym-overlay';
    overlay.id = 'applyModal';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-hidden','true');

    var planCards = PLANS.map(function(p){
      return ''
        + '<div class="applym-plan" data-plan="'+p.key+'">'
        +   '<div class="applym-plan-body">'
        +     '<div class="applym-plan-name">'+p.name+'<span class="applym-plan-badge">'+p.badge+'</span></div>'
        +     '<div class="applym-plan-desc">'+p.desc+'</div>'
        +   '</div>'
        +   '<button class="applym-plan-btn" type="button" data-plan="'+p.key+'">このプランで申し込む</button>'
        + '</div>';
    }).join('');

    overlay.innerHTML = ''
      + '<div class="applym-modal" data-step="plans">'
      +   '<button class="applym-close" type="button" aria-label="閉じる" data-applym-close>&times;</button>'
      +   '<div class="applym-step applym-step-plans">'
      +     '<h3 class="applym-h3">利用申込み</h3>'
      +     '<p class="applym-sub">ご希望のプランをお選びください。<br>選択後、その場で申し込みフォームが開きます。</p>'
      +     '<div class="applym-plans">'+planCards+'</div>'
      +   '</div>'
      +   '<div class="applym-step applym-step-form">'
      +     '<div class="applym-form-head">'
      +       '<button class="applym-back" type="button" data-applym-back>&lsaquo; プランを選び直す</button>'
      +       '<span class="applym-form-plan" data-applym-planlabel></span>'
      +     '</div>'
      +     '<div class="applym-frame-wrap" data-applym-framewrap>'
      +       '<div class="applym-loading" data-applym-loading><div class="applym-spin"></div><span>申し込みフォームを読み込んでいます…</span></div>'
      +     '</div>'
      +   '</div>'
      + '</div>';
    document.body.appendChild(overlay);
  }

  var modalBox  = overlay.querySelector('.applym-modal');
  var frameWrap = overlay.querySelector('[data-applym-framewrap]');
  var loadingEl = overlay.querySelector('[data-applym-loading]');
  var planLabel = overlay.querySelector('[data-applym-planlabel]');

  /* ---------- 開閉 ---------- */
  function openModal(){
    modalBox.setAttribute('data-step','plans');   // 常にプラン選択から
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden','false');
    document.documentElement.style.overflow = 'hidden';
  }
  function closeModal(){
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden','true');
    document.documentElement.style.overflow = '';
  }
  function backToPlans(){
    modalBox.setAttribute('data-step','plans');
  }

  /* ---------- プラン選択 → iframe遅延生成 ---------- */
  function selectPlan(planKey){
    var plan = PLANS.filter(function(p){ return p.key === planKey; })[0];
    if (!plan) return;
    currentPlan = planKey;
    track('application_plan_select', { plan: planKey });

    planLabel.textContent = plan.name;

    // 既存iframeを破棄して作り直し（プラン切替に対応）
    if (iframeEl && iframeEl.parentNode) iframeEl.parentNode.removeChild(iframeEl);
    loadingEl.classList.remove('hide');

    iframeEl = document.createElement('iframe');
    iframeEl.className = 'applym-iframe';
    iframeEl.setAttribute('title', '利用申込みフォーム');
    iframeEl.setAttribute('loading', 'eager');
    iframeEl.src = IFRAME_BASE + '?plan=' + encodeURIComponent(planKey) + '&embed=1';
    iframeEl.addEventListener('load', function(){ loadingEl.classList.add('hide'); });
    frameWrap.appendChild(iframeEl);

    modalBox.setAttribute('data-step','form');
    track('application_form_start', { plan: planKey });
  }

  /* ---------- 完了表示 ---------- */
  function showComplete(){
    frameWrap.innerHTML = ''
      + '<div class="applym-done">'
      +   '<div class="applym-done-ic">&#10003;</div>'
      +   '<h3>お申し込みありがとうございます</h3>'
      +   '<p>担当者より追ってご連絡いたします。<br>このままモーダルを閉じてください。</p>'
      +   '<button class="applym-done-btn" type="button" data-applym-close>閉じる</button>'
      + '</div>';
    iframeEl = null;
  }

  /* ---------- イベント委譲 ---------- */
  // 既存の HubSpot 申込リンクをクリック乗っ取り
  document.addEventListener('click', function(e){
    if (!e.target.closest) return;

    // HubSpot申込リンク → 新モーダル（自社システムへ完全移行）
    var hs = e.target.closest('a[href*="share.hsforms.com"]');
    if (hs){
      e.preventDefault();
      track('application_button_click', {});
      openModal();
      return;
    }
    // 任意の #apply トリガー（将来用）
    var ap = e.target.closest('a[href$="#apply"], [data-apply-open]');
    if (ap){
      e.preventDefault();
      track('application_button_click', {});
      openModal();
      return;
    }

    // モーダル内操作
    var planBtn = e.target.closest('.applym-plan-btn, .applym-plan');
    if (planBtn && overlay.contains(planBtn)){
      var key = planBtn.getAttribute('data-plan');
      if (key) { selectPlan(key); return; }
    }
    if (e.target.closest('[data-applym-back]')){ backToPlans(); return; }
    if (e.target.closest('[data-applym-close]')){ closeModal(); return; }
    if (e.target === overlay){ closeModal(); return; }   // 背景タップ
  });

  // Escapeで閉じる
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeModal(); });

  /* ---------- postMessage連携（オリジン検証必須） ---------- */
  window.addEventListener('message', function(e){
    if (e.origin !== IFRAME_ORIGIN) return;
    var d = e.data;
    if (!d || typeof d !== 'object') return;

    if (d.type === 'apply-form-resize' && iframeEl){
      var h = parseInt(d.height, 10);
      if (h > 0){ iframeEl.style.height = h + 'px'; }
    }
    if (d.type === 'apply-form-complete'){
      track('application_complete', { plan: currentPlan });
      showComplete();
    }
  });
})();
