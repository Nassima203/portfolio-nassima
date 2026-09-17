// Carte digitale : génère les QR codes localement (URLs résolues par
// rapport à l'emplacement de déploiement, quel qu'il soit) et gère le
// bouton "scanner / télécharger le CV".

const PORTFOLIO_URL = new URL('index.html', window.location.href).href;

const qrDark = '#2B2E3B';
const qrLight = '#FFFDF8';

function drawQrFallback(canvas, url) {
  // Filet de sécurité si la lib QRCode.js n'a pas pu se charger (hors-ligne, CDN bloqué...)
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = qrLight;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = qrDark;
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('QR indisponible', canvas.width / 2, canvas.height / 2 - 6);
  ctx.fillText(url, canvas.width / 2, canvas.height / 2 + 10, canvas.width - 10);
}

function renderQr(canvas, url) {
  if (!canvas) return;
  if (typeof QRCode === 'undefined') {
    drawQrFallback(canvas, url);
    return;
  }
  QRCode.toCanvas(canvas, url, {
    width: canvas.width,
    margin: 1,
    color: { dark: qrDark, light: qrLight }
  }, (err) => {
    if (err) drawQrFallback(canvas, url);
  });
}

renderQr(document.getElementById('dcPortfolioQr'), PORTFOLIO_URL);

// Bouton CV : télécharge directement sur desktop, et révèle un QR
// dédié pour le scanner/télécharger depuis un téléphone.
const cvBtn = document.getElementById('dcCvBtn');
const cvQrWrap = document.getElementById('dcCvQrWrap');
const cvQrCanvas = document.getElementById('dcCvQr');

if (cvBtn) {
  const CV_URL = new URL(cvBtn.dataset.cvUrl, window.location.href).href;

  cvBtn.addEventListener('click', () => {
    if (cvQrWrap && !cvQrWrap.classList.contains('is-open')) {
      renderQr(cvQrCanvas, CV_URL);
      cvQrWrap.hidden = false;
      cvQrWrap.classList.add('is-open');
    }

    const link = document.createElement('a');
    link.href = CV_URL;
    link.download = 'Nassima-Adli-CV.pdf';
    document.body.appendChild(link);
    link.click();
    link.remove();
  });
}
