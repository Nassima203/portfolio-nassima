// Menu burger (mobile)
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');

if (burger && navLinks) {
  const setMenu = (open) => {
    navLinks.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  };

  burger.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
  navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !burger.contains(e.target)) setMenu(false);
  });
}

// Ombre sur la nav au scroll
const navbar = document.getElementById('navbar');
const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 10);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Apparition des éléments au scroll (décalage entre les éléments qui apparaissent ensemble)
const revealEls = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.filter(entry => entry.isIntersecting).forEach((entry, i) => {
      const el = entry.target;
      el.style.transitionDelay = `${Math.min(i, 5) * 110}ms`;
      el.classList.add('in');
      // Le délai ne doit servir qu'à l'apparition, pas aux survols suivants
      el.addEventListener('transitionend', () => { el.style.transitionDelay = ''; }, { once: true });
      observer.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in'));
}

// Aquarelle dans les cartes : la tache suit le curseur avec du retard,
// et une deuxième couleur traîne encore plus loin derrière, comme de l'eau qui se dilue.
// Le rayon est animé ici (et non en CSS) : à chaque survol la tache repart de sa taille
// actuelle et s'étale progressivement, même si on revient sur la carte très vite.
document.querySelectorAll('.card').forEach(card => {
  const isCta = card.classList.contains('card-cta');
  const brush = { x: 0, y: 0 };
  const trail = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };
  let radius = 0;
  let inside = false;
  let running = false;

  // Rayon visé : fixe pour les cartes, juste assez pour couvrir toute la carte "votre projet"
  const goal = () => {
    if (!inside) return 0;
    if (!isCta) return 360;
    const w = card.offsetWidth;
    const h = card.offsetHeight;
    const far = Math.hypot(Math.max(brush.x, w - brush.x), Math.max(brush.y, h - brush.y));
    return far / 0.58;
  };

  // Vitesse d'étalement : la carte "votre projet" est plus lente ; à la sortie la tache se rétracte en séchant
  const spread = () => (!inside ? 0.03 : isCta ? 0.016 : 0.03);

  const pointer = (e) => {
    const r = card.getBoundingClientRect();
    target.x = e.clientX - r.left;
    target.y = e.clientY - r.top;
  };

  const paint = () => {
    brush.x += (target.x - brush.x) * 0.09;
    brush.y += (target.y - brush.y) * 0.09;
    trail.x += (target.x - trail.x) * 0.035;
    trail.y += (target.y - trail.y) * 0.035;
    const g = goal();
    radius += (g - radius) * spread();

    card.style.setProperty('--mx', `${brush.x}px`);
    card.style.setProperty('--my', `${brush.y}px`);
    card.style.setProperty('--tx', `${trail.x}px`);
    card.style.setProperty('--ty', `${trail.y}px`);
    card.style.setProperty('--paint', `${radius}px`);

    running = Math.abs(target.x - trail.x) + Math.abs(target.y - trail.y) > 0.5 || Math.abs(g - radius) > 0.5;
    if (running) requestAnimationFrame(paint);
  };

  const start = () => {
    if (!running) { running = true; requestAnimationFrame(paint); }
  };

  // La goutte tombe là où le curseur entre (si la carte est sèche) puis s'étale
  card.addEventListener('pointerenter', (e) => {
    pointer(e);
    if (radius < 1) {
      Object.assign(brush, target);
      Object.assign(trail, target);
    }
    inside = true;
    start();
  });

  card.addEventListener('pointermove', (e) => {
    pointer(e);
    start();
  });

  card.addEventListener('pointerleave', () => {
    inside = false;
    start();
  });
});

// Boutons : l'aquarelle part de l'endroit où le curseur entre
document.querySelectorAll('.btn, .project-links a, .contact-links a').forEach(btn => {
  btn.addEventListener('pointerenter', (e) => {
    const r = btn.getBoundingClientRect();
    btn.style.setProperty('--mx', `${e.clientX - r.left}px`);
    btn.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
});

// Formulaire de contact (envoi réel via FormSubmit.co, gratuit et sans inscription)
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const endpoint = contactForm.dataset.endpoint;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours...';
    formStatus.textContent = '';
    formStatus.classList.remove('success', 'error');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(contactForm)
      });

      if (response.ok) {
        formStatus.textContent = 'Merci ! Votre message a bien été envoyé, je vous répondrai rapidement.';
        formStatus.classList.add('success');
        contactForm.reset();
      } else {
        throw new Error('Réponse non valide du serveur');
      }
    } catch (err) {
      formStatus.textContent = 'Une erreur est survenue. Merci de réessayer ou de m\'écrire directement par e-mail.';
      formStatus.classList.add('error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Envoyer le message';
    }
  });
}
