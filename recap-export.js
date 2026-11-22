(function () {
  const logoUrl = "./LOGO%20MADIN%20REMOVE%20BG.png";
  const configs = [
    { type: "reading", resultId: "readingRecapResult", classId: "readingRecapClass", monthId: "readingRecapMonth", title: "REKAP BULANAN PENILAIAN MEMBACA YANBU'A" },
    { type: "writing", resultId: "writingRecapResult", classId: "writingRecapClass", monthId: "writingRecapMonth", title: "REKAP BULANAN PENILAIAN MENULIS ARAB" }
  ];
  function monthLabel(value) {
    if (!value) return "";
    const p = value.split("-");
    return new Date(Number(p[0]), Number(p[1]) - 1, 1).toLocaleDateString("id-ID", {month:"long",year:"numeric"});
  }
  function makeExportDocument(config) {
    const result = document.getElementById(config.resultId);
    const classSelect = document.getElementById(config.classId);
    const monthInput = document.getElementById(config.monthId);
    if (!result || !result.children.length) throw new Error("Tampilkan rekap terlebih dahulu sebelum menyimpan.");
    const className = classSelect && classSelect.selectedOptions[0] ? classSelect.selectedOptions[0].textContent : "";
    const month = monthLabel(monthInput ? monthInput.value : "");
    const clone = result.cloneNode(true);
    clone.querySelectorAll("*").forEach(el => {
      el.style.position = "static"; el.style.top = "auto"; el.style.left = "auto";
      el.style.maxHeight = "none"; el.style.overflow = "visible";
      el.style.overscrollBehavior = "auto"; el.style.webkitOverflowScrolling = "auto";
    });
    const wrapper = document.createElement("div");
    wrapper.className = "madin-export-sheet";
    wrapper.innerHTML =
      '<header class="madin-export-header"><img src="' + logoUrl + '" alt="Logo Madin"><div>' +
      '<div class="madin-export-madin">MADRASAH DINIYAH KALIGINTUNG</div>' +
      '<div class="madin-export-title">' + config.title + '</div>' +
      '<div class="madin-export-meta">' + className + ' | ' + month + '</div></div></header>' +
      '<div class="madin-export-body"></div><footer>Madrasah Diniyah Kaligintung</footer>';
    wrapper.querySelector(".madin-export-body").appendChild(clone);
    return wrapper;
  }
  function exportCss() {
    return '*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#17251d;background:#fff;margin:0}' +
      '.madin-export-sheet{display:inline-block;background:#fff;padding:22px;width:max-content;min-width:100%;color:#17251d}' +
      '.madin-export-header{display:flex;align-items:center;gap:16px;border-bottom:3px solid #c9a64f;padding:0 0 14px;margin-bottom:16px}' +
      '.madin-export-header img{width:76px;height:76px;object-fit:contain}.madin-export-madin{font-size:20px;font-weight:800;color:#104b32;letter-spacing:.4px}' +
      '.madin-export-title{font-size:15px;font-weight:700;margin-top:5px}.madin-export-meta{font-size:13px;margin-top:5px}' +
      '.madin-export-body{width:max-content;min-width:100%}.madin-export-body>div{max-height:none!important;overflow:visible!important;border-radius:0!important}' +
      '.madin-export-body [style*="position:sticky"]{position:static!important}.madin-export-body [style*="overflow:auto"]{overflow:visible!important;max-height:none!important}' +
      '.madin-export-sheet footer{font-size:10px;color:#65736a;border-top:1px solid #dce5df;margin-top:14px;padding-top:8px}' +
      '@media print{@page{size:landscape;margin:8mm}body{margin:0}.madin-export-sheet{padding:0}.madin-export-header{break-after:avoid}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}}';
  }
  function openPdf(config) {
    const popup = window.open("", "_blank");
    if (!popup) throw new Error("Jendela cetak diblokir browser. Izinkan pop-up untuk situs aplikasi, lalu coba lagi.");
    const wrapper = makeExportDocument(config);
    popup.document.open();
    popup.document.write('<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' +
      config.title + '</title><style>' + exportCss() +
      '@media screen{body{padding:12px;overflow:auto}}</style></head><body>' + wrapper.outerHTML +
      '<script>window.onload=function(){setTimeout(function(){window.focus();window.print();},500)};<\/script></body></html>');
    popup.document.close();
  }
  function loadHtml2Canvas() {
    if (window.html2canvas) return Promise.resolve(window.html2canvas);
    if (window.__madinHtml2CanvasPromise) return window.__madinHtml2CanvasPromise;
    window.__madinHtml2CanvasPromise = new Promise((resolve,reject) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
      script.onload = () => window.html2canvas ? resolve(window.html2canvas) : reject(new Error("Library gambar tidak tersedia."));
      script.onerror = () => reject(new Error("Gagal memuat alat pembuat gambar. Periksa koneksi internet."));
      document.head.appendChild(script);
    });
    return window.__madinHtml2CanvasPromise;
  }
  async function savePng(config) {
    const html2canvas = await loadHtml2Canvas();
    const wrapper = makeExportDocument(config);
    wrapper.style.position = "fixed"; wrapper.style.left = "-100000px"; wrapper.style.top = "0"; wrapper.style.zIndex = "-1";
    document.body.appendChild(wrapper);
    try {
      const logo = wrapper.querySelector("img");
      if (logo && !logo.complete) await new Promise(resolve => {logo.onload=resolve;logo.onerror=resolve;});
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
      const canvas = await html2canvas(wrapper,{scale:2,backgroundColor:"#ffffff",useCORS:true,logging:false,windowWidth:Math.max(wrapper.scrollWidth,document.documentElement.clientWidth)});
      const link = document.createElement("a");
      link.download = "Rekap-" + config.type + "-Madin-" + Date.now() + ".png";
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link); link.click(); link.remove();
    } finally { wrapper.remove(); }
  }
  function addControls(config) {
    const result = document.getElementById(config.resultId);
    if (!result || result.dataset.exportControls === "ready") return;
    result.dataset.exportControls = "ready";
    const controls = document.createElement("div");
    controls.style.cssText = "display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 18px";
    controls.innerHTML = '<button type="button" class="secondary" data-export-format="pdf">Simpan sebagai PDF</button>' +
      '<button type="button" class="secondary" data-export-format="png">Simpan sebagai Gambar (PNG)</button>' +
      '<span class="message" aria-live="polite" style="width:100%;margin:0"></span>';
    result.insertAdjacentElement("afterend",controls);
    controls.querySelectorAll("button").forEach(button => button.addEventListener("click",async () => {
      const format=button.dataset.exportFormat, status=controls.querySelector(".message");
      controls.querySelectorAll("button").forEach(b=>b.disabled=true);
      status.textContent=format==="pdf"?"Menyiapkan dokumen PDF...":"Menyiapkan gambar...";
      status.classList.remove("error");
      try {
        if(format==="pdf") openPdf(config); else await savePng(config);
        status.textContent=format==="pdf"?"Dokumen siap dicetak atau disimpan sebagai PDF.":"Gambar rekap berhasil dibuat.";
      } catch(error) {
        console.error(error); status.textContent=error.message||"Gagal menyiapkan dokumen."; status.classList.add("error");
      } finally {controls.querySelectorAll("button").forEach(b=>b.disabled=false);}
    }));
  }
  function initialize() {
    configs.forEach(addControls);
    const observer=new MutationObserver(()=>configs.forEach(addControls));
    configs.forEach(config=>{const target=document.getElementById(config.resultId);if(target)observer.observe(target,{childList:true,subtree:true});});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initialize);else initialize();
})();