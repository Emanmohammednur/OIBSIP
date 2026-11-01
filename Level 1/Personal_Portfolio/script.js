(function () {
  'use strict';

  var menuButton = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.primary-nav');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));

  function setActiveLink(activeLink) {
    navLinks.forEach(function (link) {
      var active = link === activeLink;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  function closeMenu() {
    if (!menuButton || !nav) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    nav.classList.remove('is-open');
  }

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      var isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
      nav.classList.toggle('is-open', !isOpen);
    });
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu();
        setActiveLink(link);
      });
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeMenu();
        if (dialog && dialog.open) dialog.close();
      }
    });
  }

  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var activeSectionFrame = 0;
  function updateActiveSection() {
    activeSectionFrame = 0;
    if (!sections.length) return;
    var header = document.querySelector('.site-header');
    var position = window.scrollY + (header ? header.offsetHeight : 0) + window.innerHeight * 0.35;
    var currentSection = sections[0];
    sections.forEach(function (section) {
      if (section.getBoundingClientRect().top + window.scrollY <= position) currentSection = section;
    });
    var activeLink = navLinks.find(function (link) { return link.getAttribute('href') === '#' + currentSection.id; });
    if (activeLink) setActiveLink(activeLink);
  }
  window.addEventListener('scroll', function () {
    if (!activeSectionFrame) activeSectionFrame = window.requestAnimationFrame(updateActiveSection);
  }, { passive: true });
  window.addEventListener('resize', updateActiveSection);
  updateActiveSection();

  var revealItems = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    revealItems.forEach(function (item) { revealObserver.observe(item); });
  } else {
    revealItems.forEach(function (item) { item.classList.add('is-visible'); });
  }

  var carousels = Array.prototype.slice.call(document.querySelectorAll('[data-carousel]'));
  carousels.forEach(function (carousel) {
    var track = carousel.querySelector('.carousel-track');
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.carousel-dots button'));
    var slides = track ? Array.prototype.slice.call(track.children) : [];
    var controlsScope = carousel.parentElement || carousel;
    var previous = controlsScope.querySelector('.carousel-arrow.previous');
    var next = controlsScope.querySelector('.carousel-arrow.next');
    var cardRail = carousel.getAttribute('data-carousel') === 'cards';
    if (!track || !slides.length || (!cardRail && (!dots.length || slides.length !== dots.length))) return;

    function cardStep() {
      if (slides.length > 1) {
        return slides[1].getBoundingClientRect().left - slides[0].getBoundingClientRect().left;
      }
      return slides[0].getBoundingClientRect().width;
    }

    function cardMaxIndex() {
      var step = cardStep();
      if (!step) return 0;
      return Math.max(0, Math.round((track.scrollWidth - track.clientWidth) / step));
    }

    function currentSlide() {
      if (cardRail) {
        var step = cardStep();
        return step ? Math.min(Math.round(track.scrollLeft / step), cardMaxIndex()) : 0;
      }
      var trackLeft = track.getBoundingClientRect().left;
      var closestIndex = 0;
      var closestDistance = Infinity;
      slides.forEach(function (slide, index) {
        var distance = Math.abs(slide.getBoundingClientRect().left - trackLeft);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      return closestIndex;
    }

    function showSlide(index, shouldScroll) {
      var maxIndex = cardRail ? cardMaxIndex() : dots.length - 1;
      var selected = Math.max(0, Math.min(index, maxIndex));
      dots.forEach(function (dot, dotIndex) {
        dot.setAttribute('aria-current', String(dotIndex === selected));
      });
      if (shouldScroll) {
        var targetLeft;
        if (cardRail) {
          targetLeft = track.scrollLeft + slides[selected].getBoundingClientRect().left -
            track.getBoundingClientRect().left;
        } else {
          targetLeft = slides[selected].getBoundingClientRect().left -
            track.getBoundingClientRect().left + track.scrollLeft;
        }
        track.scrollTo({
          left: targetLeft,
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
        });
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () { showSlide(index, true); });
    });
    if (previous) previous.addEventListener('click', function () {
      var current = currentSlide();
      var lastIndex = cardRail ? cardMaxIndex() : dots.length - 1;
      showSlide(current <= 0 ? lastIndex : current - 1, true);
    });
    if (next) next.addEventListener('click', function () {
      var current = currentSlide();
      var lastIndex = cardRail ? cardMaxIndex() : dots.length - 1;
      showSlide(current >= lastIndex ? 0 : current + 1, true);
    });
    track.addEventListener('scroll', function () {
      window.requestAnimationFrame(function () {
        if (!cardRail) showSlide(currentSlide(), false);
      });
    }, { passive: true });
    window.addEventListener('resize', function () {
      showSlide(currentSlide(), true);
    });

    if (carousel.getAttribute('data-autoplay') === 'true' &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      var paused = false;
      var inView = true;
      window.setInterval(function () {
        if (paused || !inView || document.hidden || (dialog && dialog.open)) return;
        var current = currentSlide();
        var lastIndex = cardRail ? cardMaxIndex() : dots.length - 1;
        showSlide(current >= lastIndex ? 0 : current + 1, true);
      }, 6000);
      carousel.addEventListener('pointerenter', function () { paused = true; });
      carousel.addEventListener('pointerleave', function () { paused = false; });
      carousel.addEventListener('focusin', function () { paused = true; });
      carousel.addEventListener('focusout', function (event) {
        if (!carousel.contains(event.relatedTarget)) paused = false;
      });
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) paused = true;
        else paused = carousel.matches(':hover') || carousel.contains(document.activeElement);
      });
      if ('IntersectionObserver' in window) {
        var carouselObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) { inView = entry.isIntersecting; });
        }, { threshold: 0.15 });
        carouselObserver.observe(carousel);
      }
    }
  });

  var dialog = document.getElementById('certificate-dialog');
  var dialogImage = document.getElementById('dialog-img');
  var dialogTitle = document.getElementById('dialog-title');
  var openCertificate = document.getElementById('open-certificate');
  var closeDialog = document.querySelector('.dialog-close');
  var certificateButtons = Array.prototype.slice.call(document.querySelectorAll('[data-certificate]'));
  if (dialog && dialogImage && dialogTitle) {
    certificateButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var imagePath = button.getAttribute('data-certificate');
        var title = button.getAttribute('data-title') || 'Certificate';
        dialogTitle.textContent = title;
        dialogImage.src = imagePath;
        dialogImage.alt = 'Certificate: ' + title;
        if (openCertificate) openCertificate.href = imagePath;
        if (typeof dialog.showModal === 'function') dialog.showModal();
        else window.open(imagePath, '_blank', 'noopener,noreferrer');
      });
    });
    if (closeDialog) closeDialog.addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('cancel', function (event) {
      event.preventDefault();
      dialog.close();
    });
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) dialog.close();
    });
  }

  var form = document.getElementById('contact-form');
  var feedback = document.getElementById('form-feedback');
  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      var formData = new FormData(form);
      var name = String(formData.get('name') || '').trim();
      var email = String(formData.get('email') || '').trim();
      var subject = String(formData.get('subject') || '').trim();
      var message = String(formData.get('message') || '').trim();
      var body = 'Name: ' + name + '\nEmail: ' + email + '\n\n' + message;
      var mailto = 'mailto:emanmohammednur79@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      if (feedback) feedback.textContent = 'Opening your email app with the message details…';
      window.location.href = mailto;
    });
  }

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
}());
