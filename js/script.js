// Active les styles "reveal" seulement si le JS tourne réellement
// (sinon le contenu reste visible par défaut, sans dépendre du script)
document.documentElement.classList.add('js-ready');

// Menu burger (mobile)
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');

if (burger && navLinks) {
  burger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// Ombre sur la nav au scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 10) {
    navbar.style.boxShadow = '0 10px 30px -18px rgba(43,46,59,0.35)';
  } else {
    navbar.style.boxShadow = 'none';
  }
});

// Respecte les préférences de mouvement réduit
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Révélation des sections au scroll (effet "la peinture se révèle")
const revealEls = document.querySelectorAll('.reveal');

if (prefersReducedMotion) {
  revealEls.forEach(el => el.classList.add('is-visible'));
} else if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('is-visible'));
}

// Parallax léger des taches d'aquarelle en arrière-plan
const paintBlobs = Array.from(document.querySelectorAll('.paint-blob[data-speed]'));

if (paintBlobs.length && !prefersReducedMotion) {
  let ticking = false;

  const updateParallax = () => {
    const scrollY = window.scrollY;
    paintBlobs.forEach(blob => {
      const speed = parseFloat(blob.dataset.speed) || 0.15;
      blob.style.transform = `translateY(${scrollY * speed}px)`;
    });
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  });
}

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
