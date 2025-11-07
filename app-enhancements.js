// App enhancements: theme persistence + WebCrypto-based encryption helpers
// This script expects `window.biobalanceApp` to be available (app.js now sets it).

(function () {
  'use strict';

  // Utility: base64 helpers
  const bufToBase64 = (buf) => {
    return btoa(String.fromCharCode(...new Uint8Array(buf)));
  };
  const base64ToBuf = (b64) => {
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return arr.buffer;
  };

  // Derive AES-GCM key from a password using PBKDF2
  async function deriveKey(password, salt, keyLen = 256) {
    const enc = new TextEncoder();
    const passKey = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 250000,
        hash: 'SHA-256'
      },
      passKey,
      { name: 'AES-GCM', length: keyLen },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Encrypt JSON object -> returns base64 payload (salt:iv:ciphertext)
  async function encryptJSON(obj, password) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const key = await deriveKey(password, salt);
    const enc = new TextEncoder();
    const data = enc.encode(JSON.stringify(obj));
    const cipher = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
    // Concatenate as base64 parts
    return [
      bufToBase64(salt.buffer),
      bufToBase64(iv.buffer),
      bufToBase64(cipher)
    ].join(':');
  }

  // Decrypt base64 payload (salt:iv:ciphertext) -> JSON object
  async function decryptJSON(payload, password) {
    try {
      const parts = payload.split(':');
      if (parts.length !== 3) throw new Error('Invalid payload format');
      const salt = base64ToBuf(parts[0]);
      const iv = base64ToBuf(parts[1]);
      const cipher = base64ToBuf(parts[2]);
      const key = await deriveKey(password, new Uint8Array(salt));
      const plain = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(iv) }, key, cipher);
      const dec = new TextDecoder();
      return JSON.parse(dec.decode(plain));
    } catch (err) {
      throw new Error('Decryption failed: ' + err.message);
    }
  }

  // Theme helpers: store in localStorage key 'bio_theme' with values 'light'|'dark'|'system'
  function applyTheme(theme) {
    const html = document.documentElement;
    const body = document.body;
    if (theme === 'dark') {
      html.setAttribute('data-color-scheme', 'dark');
      body.classList.add('dark-mode');
      localStorage.setItem('bio_theme', 'dark');
      const btn = document.getElementById('dark-mode-toggle');
      if (btn) {
        btn.setAttribute('aria-pressed', 'true');
        btn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor" />
          </svg>
          <span>Dark</span>`;
      }
    } else if (theme === 'light') {
      html.setAttribute('data-color-scheme', 'light');
      body.classList.remove('dark-mode');
      localStorage.setItem('bio_theme', 'light');
      const btn = document.getElementById('dark-mode-toggle');
      if (btn) {
        btn.setAttribute('aria-pressed', 'false');
        btn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12 3v2M12 19v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
          </svg>
          <span>Light</span>`;
      }
    } else {
      // system
      html.removeAttribute('data-color-scheme');
      // follow system prefers-color-scheme
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) body.classList.add('dark-mode'); else body.classList.remove('dark-mode');
      localStorage.setItem('bio_theme', 'system');
      const btn = document.getElementById('dark-mode-toggle');
      if (btn) {
        btn.setAttribute('aria-pressed', prefersDark ? 'true' : 'false');
        btn.innerHTML = prefersDark ? `
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor" />
          </svg>
          <span>Dark</span>` : `
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12 3v2M12 19v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
          </svg>
          <span>Light</span>`;
      }
    }
  }

  function toggleThemeCycle() {
    const cur = localStorage.getItem('bio_theme') || 'system';
    const next = cur === 'system' ? 'dark' : cur === 'dark' ? 'light' : 'system';
    applyTheme(next);
  }

  // Passphrase modal helper: returns a Promise<string|null>
  function showPassphraseModal(message = 'Enter passphrase') {
    return new Promise((resolve) => {
      const modal = document.getElementById('passphrase-modal');
      const msg = document.getElementById('passphrase-modal-message');
      const input = document.getElementById('passphrase-input');
      const submit = document.getElementById('passphrase-submit');
      const cancel = document.getElementById('passphrase-cancel');
      if (!modal || !input || !submit || !cancel || !msg) return resolve(null);
      msg.textContent = message;
      input.value = '';
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
      input.focus();

      const cleanup = () => {
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
        submit.removeEventListener('click', onSubmit);
        cancel.removeEventListener('click', onCancel);
        input.removeEventListener('keydown', onKey);
      };

      const onSubmit = () => {
        const val = input.value;
        cleanup();
        resolve(val || null);
      };
      const onCancel = () => {
        cleanup();
        resolve(null);
      };
      const onKey = (e) => {
        if (e.key === 'Enter') onSubmit();
        if (e.key === 'Escape') onCancel();
      };

      submit.addEventListener('click', onSubmit);
      cancel.addEventListener('click', onCancel);
      input.addEventListener('keydown', onKey);
    });
  }

  // Save current user profile (this.biobalanceApp.currentUser) encrypted in localStorage
  async function saveCurrentProfile() {
    const app = window.biobalanceApp;
    if (!app || !app.currentUser) {
      alert('No current profile to save. Load a sample profile or submit the form first.');
      return;
    }
    const pass = await showPassphraseModal('Enter a passphrase to encrypt your profile (keep it safe)');
    if (!pass) return alert('Passphrase required to save profile');
    try {
      const payload = await encryptJSON(app.currentUser, pass);
      localStorage.setItem('bio_profile_encrypted', payload);
      alert('Profile saved encrypted in browser storage. Use the same passphrase to restore or export.');
      renderSavedIndicator(true);
    } catch (err) {
      console.error(err);
      alert('Failed to encrypt and save profile: ' + err.message);
    }
  }

  // Export encrypted profile from storage or current user
  async function exportEncryptedProfile() {
    const app = window.biobalanceApp;
    let payload = localStorage.getItem('bio_profile_encrypted');
    if (!payload) {
      if (!app || !app.currentUser) {
        alert('No profile available to export. Save a profile first or submit the form.');
        return;
      }
      const pass = await showPassphraseModal('No saved encrypted profile found. Enter a passphrase to encrypt current profile for export');
      if (!pass) return;
      payload = await encryptJSON(app.currentUser, pass);
    }
    // Create file and download
    const blob = new Blob([JSON.stringify({ encrypted: payload }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'biobalance_profile_encrypted.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // Import encrypted profile file and decrypt
  function importEncryptedFile() {
    const fileInput = document.getElementById('import-encrypted-file');
    if (!fileInput) return;
    fileInput.value = '';
    fileInput.click();
  }

  async function handleFileChosen(file) {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const payload = parsed.encrypted || parsed.payload || parsed.data || null;
      if (!payload) {
        alert('File does not appear to contain an encrypted payload under `encrypted`/`payload`/`data`.');
        return;
      }
      const pass = await showPassphraseModal('Enter passphrase to decrypt the imported profile');
      if (!pass) return;
      const obj = await decryptJSON(payload, pass);
      // Load into app
      const app = window.biobalanceApp;
      if (!app) {
        alert('App not ready. Try again after the page finishes loading.');
        return;
      }
      // Map imported object to expected currentUser fields
      app.currentUser = {
        name: obj.name || 'Imported',
        age: obj.age || obj.age || 0,
        systolic: obj.systolic || (obj.vitals && parseInt((obj.vitals.blood_pressure || '').split('/')[0])) || 0,
        diastolic: obj.diastolic || (obj.vitals && parseInt((obj.vitals.blood_pressure || '').split('/')[1])) || 0,
        bloodSugar: obj.bloodSugar || (obj.vitals && obj.vitals.blood_sugar) || 0,
        oxygen: obj.oxygen || (obj.vitals && obj.vitals.oxygen_saturation) || 0,
        conditions: obj.conditions || []
      };
      // Store in localStorage encrypted for future
      const storePass = confirm('Would you like to save this encrypted profile to browser storage (requires passphrase)? Click OK to save with the same passphrase used for import.');
      if (storePass) {
        const payload2 = await encryptJSON(app.currentUser, pass);
        localStorage.setItem('bio_profile_encrypted', payload2);
      }
      app.generateRecommendations();
      app.showResults();
      renderSavedIndicator(true);
      alert('Profile imported and loaded successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to import or decrypt file: ' + err.message);
    }
  }

  function renderSavedIndicator(saved) {
    // small visual cue on Save button
    const btn = document.getElementById('save-profile-btn');
    if (!btn) return;
    if (saved) {
      btn.textContent = 'Profile Saved 🔒';
      setTimeout(() => (btn.textContent = 'Save Profile'), 2500);
    }
  }

  // Hook up UI once DOM content loaded
  function initEnhancements() {
    // Theme: initialize from localStorage
    const stored = localStorage.getItem('bio_theme') || 'system';
    applyTheme(stored);

    // Toggle button - override previous bindings to ensure consistent behavior
    const darkBtn = document.getElementById('dark-mode-toggle');
    if (darkBtn) {
      darkBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleThemeCycle();
      });
    }

    // Get Started button: show health form and smooth-scroll to it
    const getStartedBtn = document.getElementById('get-started-btn');
    if (getStartedBtn) {
      getStartedBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const app = window.biobalanceApp;
        if (app && typeof app.showHealthForm === 'function') {
          app.showHealthForm();
        }
        const section = document.getElementById('health-form');
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // focus first input (age) after a short delay so it's visible
          setTimeout(() => {
            const input = document.getElementById('age') || section.querySelector('input, select, textarea');
            if (input) input.focus({ preventScroll: true });
          }, 300);
        }
      });
    }

    // Save / Export / Import buttons
    const saveBtn = document.getElementById('save-profile-btn');
    if (saveBtn) saveBtn.addEventListener('click', (e) => { e.preventDefault(); saveCurrentProfile(); });

    const exportBtn = document.getElementById('export-encrypted-btn');
    if (exportBtn) exportBtn.addEventListener('click', (e) => { e.preventDefault(); exportEncryptedProfile(); });

    const importBtn = document.getElementById('import-encrypted-btn');
    if (importBtn) importBtn.addEventListener('click', (e) => { e.preventDefault(); importEncryptedFile(); });

    const fileInput = document.getElementById('import-encrypted-file');
    if (fileInput) {
      fileInput.addEventListener('change', (ev) => {
        const f = ev.target.files && ev.target.files[0];
        if (f) handleFileChosen(f);
      });
    }

    // If there is an encrypted profile stored, show a subtle indicator
    if (localStorage.getItem('bio_profile_encrypted')) renderSavedIndicator(true);

    // Listen to system theme change if user chose system
    if (window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener && mq.addEventListener('change', (e) => {
        const stored2 = localStorage.getItem('bio_theme') || 'system';
        if (stored2 === 'system') applyTheme('system');
      });
    }
  }

  // Wait for biobalanceApp or DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(initEnhancements, 50));
  } else {
    setTimeout(initEnhancements, 50);
  }

})();
