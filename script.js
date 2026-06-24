/* The Jain Group — interactions */
document.addEventListener('DOMContentLoaded', function () {

  // Image performance (Core Web Vitals): async-decode all images, and lazy-load
  // everything except the LCP/hero image (marked fetchpriority="high").
  document.querySelectorAll('img').forEach(function (img) {
    if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
    if (img.getAttribute('fetchpriority') === 'high') return;
    if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
  });

  // Sticky header shadow
  const header = document.querySelector('.site-header');
  const onScroll = () => header && header.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll);
  onScroll();

  // Mobile nav
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => { links.classList.toggle('open'); toggle.classList.toggle('open'); });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { links.classList.remove('open'); toggle.classList.remove('open'); }));
  }

  // Tabs
  document.querySelectorAll('[data-tabs]').forEach(group => {
    const btns = group.querySelectorAll('.tab-btn');
    const panels = group.querySelectorAll('.tab-panel');
    btns.forEach(btn => btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = group.querySelector('#' + btn.getAttribute('data-tab'));
      if (panel) panel.classList.add('active');
    }));
  });

  // Horizontal offers scroller
  const track = document.getElementById('offersTrack');
  if (track) {
    const step = () => Math.min(track.clientWidth * 0.85, 760);
    document.querySelectorAll('[data-scroll]').forEach(btn => {
      btn.addEventListener('click', () => track.scrollBy({ left: btn.dataset.scroll === 'next' ? step() : -step(), behavior: 'smooth' }));
    });
  }

  // Scroll reveal (robust — never leaves content permanently hidden)
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(r => {
      // tall blocks (e.g. legal text) can never hit a % threshold — reveal them right away
      if (r.getBoundingClientRect().height > window.innerHeight * 0.85) r.classList.add('in');
      else io.observe(r);
    });
    // safety net: anything already in view after load gets revealed
    setTimeout(() => reveals.forEach(r => {
      if (r.getBoundingClientRect().top < window.innerHeight) r.classList.add('in');
    }), 500);
  } else {
    reveals.forEach(r => r.classList.add('in'));
  }

  /* ---------------- Form validation + Thank You ---------------- */
  const phoneOK = (v) => {
    if (/[a-zA-Z]/.test(v)) return false;
    let n = v.replace(/\D/g, '');
    if (n.length === 12 && n.startsWith('91')) n = n.slice(2);
    if (n.length === 11 && n.startsWith('0')) n = n.slice(1);
    return /^[6-9]\d{9}$/.test(n);
  };
  const emailOK = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
  const messageOK = (v) => {
    const t = v.trim();
    if (t.length < 12) return false;
    if (t.split(/\s+/).filter(Boolean).length < 3) return false;
    const letters = t.replace(/[^a-zA-Z]/g, '');
    if (letters.length < 8) return false;
    const vowels = (t.match(/[aeiouAEIOU]/g) || []).length;
    if (vowels / letters.length < 0.2) return false;          // too few vowels = gibberish
    if (/(.)\1{3,}/.test(t)) return false;                    // 4+ repeated chars
    if (/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(t)) return false; // long consonant runs
    return true;
  };

  const setError = (field, msg) => {
    field.classList.add('invalid');
    let e = field.querySelector('.field-error');
    if (!e) { e = document.createElement('div'); e.className = 'field-error'; field.appendChild(e); }
    e.textContent = msg;
  };
  const clearError = (field) => {
    field.classList.remove('invalid');
    const e = field.querySelector('.field-error');
    if (e) e.remove();
  };

  const showThankYou = (type) => {
    const map = {
      enquiry: ['Thank You!', "Your enquiry has been received. Our team will get in touch with you shortly."],
      career: ['Application Received!', "Thank you for applying to the Jain Group. Our HR team will review your details and reach out."],
      referral: ['Referral Submitted!', "Thank you for your referral. We'll keep you posted and reward you when your referral books with us."]
    };
    const [h, p] = map[type] || map.enquiry;
    const ov = document.createElement('div');
    ov.className = 'thankyou';
    ov.innerHTML = '<div class="inner"><div class="check"><i class="fa-solid fa-check"></i></div>' +
      '<span class="eyebrow">The Jain Group</span><h2>' + h + '</h2><p>' + p + '</p>' +
      '<a href="index.html" class="btn btn--solid">Back to Home</a></div>';
    document.body.appendChild(ov);
    document.body.style.overflow = 'hidden';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    requestAnimationFrame(() => ov.classList.add('show'));
  };

  document.querySelectorAll('form[data-form]').forEach(form => {
    // live clearing
    form.addEventListener('input', (e) => {
      const f = e.target.closest('.field'); if (f) clearError(f);
      const c = e.target.closest('.form-consent');
      if (c) { c.classList.remove('invalid'); const er = document.querySelector('.consent-error'); if (er) er.remove(); }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true, firstBad = null;
      const fail = (field, msg) => { setError(field, msg); ok = false; if (!firstBad) firstBad = field; };

      form.querySelectorAll('.field').forEach(field => {
        clearError(field);
        const el = field.querySelector('input, select, textarea');
        if (!el) return;
        const val = el.value || '';
        const req = el.hasAttribute('required');
        if (el.type === 'tel') {
          if (!val.trim()) { if (req) fail(field, 'This field is required.'); }
          else if (!phoneOK(val)) fail(field, 'Please enter a valid phone number (at least 10 digits).');
        } else if (el.type === 'email') {
          if (!val.trim()) { if (req) fail(field, 'This field is required.'); }
          else if (!emailOK(val)) fail(field, 'Please enter a valid email address.');
        } else if (el.tagName === 'TEXTAREA') {
          if (!val.trim()) { if (req) fail(field, 'This field is required.'); }
          else if (!messageOK(val)) fail(field, 'Please enter a meaningful message.');
        } else if (el.tagName !== 'SELECT' && el.type !== 'file') {
          if (req && !val.trim()) fail(field, 'This field is required.');
        }
      });

      // consent checkbox
      const consent = form.querySelector('.form-consent');
      if (consent) {
        const old = document.querySelector('.consent-error'); if (old) old.remove();
        consent.classList.remove('invalid');
        const cb = consent.querySelector('input[type=checkbox]');
        if (cb && cb.required && !cb.checked) {
          consent.classList.add('invalid');
          const er = document.createElement('div');
          er.className = 'field-error consent-error';
          er.textContent = 'Please accept the Privacy Policy to continue.';
          consent.insertAdjacentElement('afterend', er);
          ok = false; if (!firstBad) firstBad = consent;
        }
      }

      if (!ok) { if (firstBad) firstBad.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
      showThankYou(form.dataset.form);
    });
  });
});
