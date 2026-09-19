function apiConfigured(){
  return CONFIG.API_URL && !CONFIG.API_URL.includes("PASTE_YOUR");
}

function jsonp(action, params = {}) {
  return new Promise((resolve, reject) => {
    if (!apiConfigured()) {
      reject(new Error("Configure CONFIG.API_URL in js/config.js first."));
      return;
    }
    const callback = "cf_cb_" + Date.now() + "_" + Math.floor(Math.random()*10000);
    const script = document.createElement("script");
    const query = new URLSearchParams({action, callback, ...params});
    const cleanup = () => {
      delete window[callback];
      script.remove();
    };
    window[callback] = data => { cleanup(); resolve(data); };
    script.onerror = () => { cleanup(); reject(new Error("Could not reach Google Apps Script.")); };
    script.src = CONFIG.API_URL + "?" + query.toString();
    document.body.appendChild(script);
  });
}

function showMessage(el, message, error=false){
  el.textContent = message;
  el.classList.remove("hidden");
  el.classList.toggle("error", error);
}
function hideMessage(el){ el.classList.add("hidden"); }

function escapeHtml(value=""){
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

function localDateTimeMin(){
  const d = new Date(Date.now() + 5*60*60*1000);
  const pad = n => String(n).padStart(2,"0");
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`
  };
}
