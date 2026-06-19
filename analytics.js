/* فست لایف — ردیابِ سادهٔ بازدید (نسخهٔ تست)
   داده‌ها در Supabase ذخیره می‌شود. هیچ اطلاعاتِ شخصی‌ای جمع نمی‌شود:
   فقط یک شناسهٔ تصادفیِ مرورگر، نام ابزار، و مدت زمانِ حضور. */
(function () {
  "use strict";
  var SUPABASE_URL = "https://tgkoksukglkcnqkydafb.supabase.co";
  var SUPABASE_KEY = "sb_publishable_33ulCqJBPT5btXV8cFuShg_OMDAKKpC";
  if (SUPABASE_URL.indexOf("__SUPABASE") === 0) return; // هنوز پیکربندی نشده

  var TOOL = document.body.getAttribute("data-tool") || document.title || location.pathname;

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  var vid;
  try {
    vid = localStorage.getItem("fl_vid");
    if (!vid) { vid = uuid(); localStorage.setItem("fl_vid", vid); }
  } catch (e) { vid = uuid(); }

  var sid = uuid();
  var startedAt = new Date().toISOString();
  var activeSeconds = 0;
  var STEP = 15; // هر ۱۵ ثانیه یک‌بار به‌روزرسانی

  function endpoint() {
    return SUPABASE_URL.replace(/\/+$/, "") + "/rest/v1/events?on_conflict=session_id";
  }

  function send(isFinal) {
    var row = [{
      session_id: sid,
      visitor_id: vid,
      tool: TOOL,
      started_at: startedAt,
      updated_at: new Date().toISOString(),
      active_seconds: activeSeconds,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null
    }];
    try {
      fetch(endpoint(), {
        method: "POST",
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": "Bearer " + SUPABASE_KEY,
          "Content-Type": "application/json",
          "Prefer": "resolution=merge-duplicates,return=minimal"
        },
        body: JSON.stringify(row),
        keepalive: !!isFinal
      });
    } catch (e) {}
  }

  send(false); // ثبتِ ورود

  var hb = setInterval(function () {
    if (document.visibilityState === "visible") {
      activeSeconds += STEP;
      send(false);
    }
  }, STEP * 1000);

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") send(true);
  });
  window.addEventListener("pagehide", function () { clearInterval(hb); send(true); });
})();
