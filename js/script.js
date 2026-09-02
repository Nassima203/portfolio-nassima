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
    navbar.style.boxShadow = '0 4px 0 rgba(43,27,18,0.08)';
  } else {
    navbar.style.boxShadow = 'none';
  }
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
