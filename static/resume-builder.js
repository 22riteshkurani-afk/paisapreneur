/* ═══════════════════════════════════════════════════════════════════════════
   Paisapreneur AI — Resume Builder Logic
   Multi-step form, dynamic entries, AI suggestions, preview, PDF download
   ═══════════════════════════════════════════════════════════════════════════ */

let currentStep = 0;
const totalSteps = 8; // 0-7
let selectedTemplate = 'modern';
let skills = [];
let savedResumeId = null;

// ── Toast System ────────────────────────────────────────────────────────────
function showToast(message, type = 'info') {
  const container = document.querySelector('.toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function createToastContainer() {
  const c = document.createElement('div');
  c.className = 'toast-container';
  document.body.appendChild(c);
  return c;
}

// ── Step Navigation ─────────────────────────────────────────────────────────
function goToStep(step) {
  if (step < 0 || step >= totalSteps) return;

  // If going forward, validate current step
  if (step > currentStep && !validateStep(currentStep)) return;

  const steps = document.querySelectorAll('.rb-step');
  const progressSteps = document.querySelectorAll('.rb-progress__step');

  steps.forEach(s => s.classList.remove('active'));
  steps[step].classList.add('active');

  // Update progress indicators
  progressSteps.forEach((ps, i) => {
    ps.classList.remove('active', 'completed');
    if (i < step) ps.classList.add('completed');
    if (i === step) ps.classList.add('active');
  });

  currentStep = step;

  // If preview step, render preview
  if (step === 7) renderPreview();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextStep() {
  goToStep(currentStep + 1);
}

function prevStep() {
  goToStep(currentStep - 1);
}

// ── Validation ──────────────────────────────────────────────────────────────
function validateStep(step) {
  if (step === 0) {
    const name = document.getElementById('personal-name').value.trim();
    const email = document.getElementById('personal-email').value.trim();
    if (!name) {
      showToast('Please enter your full name.', 'error');
      document.getElementById('personal-name').focus();
      return false;
    }
    if (!email) {
      showToast('Please enter your email address.', 'error');
      document.getElementById('personal-email').focus();
      return false;
    }
  }
  return true;
}

// ── Gather All Data ─────────────────────────────────────────────────────────
function gatherData() {
  return {
    personal: {
      full_name: document.getElementById('personal-name').value.trim(),
      title: document.getElementById('personal-title').value.trim(),
      email: document.getElementById('personal-email').value.trim(),
      phone: document.getElementById('personal-phone').value.trim(),
      location: document.getElementById('personal-location').value.trim(),
      linkedin: document.getElementById('personal-linkedin').value.trim(),
      github: document.getElementById('personal-github').value.trim(),
      website: document.getElementById('personal-website').value.trim(),
      summary: document.getElementById('personal-summary').value.trim(),
    },
    education: gatherEducation(),
    skills: [...skills],
    experience: gatherExperience(),
    projects: gatherProjects(),
    certifications: gatherCertifications(),
    achievements: gatherAchievements(),
    template: selectedTemplate,
  };
}

// ── Education ───────────────────────────────────────────────────────────────
let educationCount = 0;

function addEducation() {
  const container = document.getElementById('education-entries');
  const idx = educationCount++;
  const entry = document.createElement('div');
  entry.className = 'rb-entry';
  entry.dataset.idx = idx;
  entry.innerHTML = `
    <div class="rb-entry__header">
      <span class="rb-entry__number">Education #${idx + 1}</span>
      <button class="rb-entry__remove" onclick="this.closest('.rb-entry').remove()" title="Remove">×</button>
    </div>
    <div class="rb-form-grid">
      <div class="rb-field">
        <label class="rb-field__label">Degree / Course</label>
        <input class="rb-field__input edu-degree" type="text" placeholder="B.Tech in Computer Science" />
      </div>
      <div class="rb-field">
        <label class="rb-field__label">Institution</label>
        <input class="rb-field__input edu-institution" type="text" placeholder="IIT Delhi" />
      </div>
      <div class="rb-field">
        <label class="rb-field__label">Year</label>
        <input class="rb-field__input edu-year" type="text" placeholder="2020 - 2024" />
      </div>
      <div class="rb-field">
        <label class="rb-field__label">GPA / Percentage</label>
        <input class="rb-field__input edu-gpa" type="text" placeholder="8.5 / 10" />
      </div>
    </div>
  `;
  container.appendChild(entry);
}

function gatherEducation() {
  const entries = document.querySelectorAll('#education-entries .rb-entry');
  return Array.from(entries).map(e => ({
    degree: e.querySelector('.edu-degree').value.trim(),
    institution: e.querySelector('.edu-institution').value.trim(),
    year: e.querySelector('.edu-year').value.trim(),
    gpa: e.querySelector('.edu-gpa').value.trim(),
  })).filter(e => e.degree || e.institution);
}

// ── Skills ──────────────────────────────────────────────────────────────────
function addSkill(value) {
  const input = document.getElementById('skill-input');
  const skill = (value || input.value).trim();
  if (!skill) return;
  if (skills.includes(skill)) {
    showToast('Skill already added.', 'info');
    return;
  }
  skills.push(skill);
  renderSkills();
  input.value = '';
  input.focus();
}

function removeSkill(skill) {
  skills = skills.filter(s => s !== skill);
  renderSkills();
}

function renderSkills() {
  const container = document.getElementById('skills-tags');
  container.innerHTML = skills.map(s => `
    <span class="rb-skill-tag">
      ${s}
      <button class="rb-skill-tag__remove" onclick="removeSkill('${s.replace(/'/g, "\\'")}')">×</button>
    </span>
  `).join('');
}

// Skill input Enter key
document.addEventListener('DOMContentLoaded', () => {
  const skillInput = document.getElementById('skill-input');
  if (skillInput) {
    skillInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addSkill();
      }
    });
  }
  // Add initial entries
  addEducation();
  addExperience();
  addProject();
});

// ── Experience ──────────────────────────────────────────────────────────────
let experienceCount = 0;

function addExperience() {
  const container = document.getElementById('experience-entries');
  const idx = experienceCount++;
  const entry = document.createElement('div');
  entry.className = 'rb-entry';
  entry.dataset.idx = idx;
  const descId = `exp-desc-${idx}`;
  entry.innerHTML = `
    <div class="rb-entry__header">
      <span class="rb-entry__number">Experience #${idx + 1}</span>
      <div style="display:flex;gap:8px;align-items:center;">
        <button class="rb-ai-btn" onclick="aiSuggest('experience', '${descId}')">✨ AI Improve</button>
        <button class="rb-entry__remove" onclick="this.closest('.rb-entry').remove()" title="Remove">×</button>
      </div>
    </div>
    <div class="rb-form-grid">
      <div class="rb-field">
        <label class="rb-field__label">Company</label>
        <input class="rb-field__input exp-company" type="text" placeholder="Google India" />
      </div>
      <div class="rb-field">
        <label class="rb-field__label">Role / Title</label>
        <input class="rb-field__input exp-role" type="text" placeholder="Software Engineer" />
      </div>
      <div class="rb-field">
        <label class="rb-field__label">Start Date</label>
        <input class="rb-field__input exp-start" type="text" placeholder="Jan 2023" />
      </div>
      <div class="rb-field">
        <label class="rb-field__label">End Date</label>
        <input class="rb-field__input exp-end" type="text" placeholder="Present" />
      </div>
      <div class="rb-field rb-field--full">
        <label class="rb-field__label">Description / Key Achievements</label>
        <textarea class="rb-field__textarea exp-desc" id="${descId}" rows="3" placeholder="Describe your responsibilities and achievements..."></textarea>
      </div>
    </div>
  `;
  container.appendChild(entry);
}

function gatherExperience() {
  const entries = document.querySelectorAll('#experience-entries .rb-entry');
  return Array.from(entries).map(e => ({
    company: e.querySelector('.exp-company').value.trim(),
    role: e.querySelector('.exp-role').value.trim(),
    start_date: e.querySelector('.exp-start').value.trim(),
    end_date: e.querySelector('.exp-end').value.trim(),
    description: e.querySelector('.exp-desc').value.trim(),
  })).filter(e => e.company || e.role);
}

// ── Projects ────────────────────────────────────────────────────────────────
let projectCount = 0;

function addProject() {
  const container = document.getElementById('project-entries');
  const idx = projectCount++;
  const descId = `proj-desc-${idx}`;
  const entry = document.createElement('div');
  entry.className = 'rb-entry';
  entry.innerHTML = `
    <div class="rb-entry__header">
      <span class="rb-entry__number">Project #${idx + 1}</span>
      <div style="display:flex;gap:8px;align-items:center;">
        <button class="rb-ai-btn" onclick="aiSuggest('project', '${descId}')">✨ AI Improve</button>
        <button class="rb-entry__remove" onclick="this.closest('.rb-entry').remove()" title="Remove">×</button>
      </div>
    </div>
    <div class="rb-form-grid">
      <div class="rb-field">
        <label class="rb-field__label">Project Name</label>
        <input class="rb-field__input proj-name" type="text" placeholder="E-Commerce Platform" />
      </div>
      <div class="rb-field">
        <label class="rb-field__label">Tech Stack</label>
        <input class="rb-field__input proj-tech" type="text" placeholder="React, Node.js, MongoDB" />
      </div>
      <div class="rb-field rb-field--full">
        <label class="rb-field__label">Description</label>
        <textarea class="rb-field__textarea proj-desc" id="${descId}" rows="2" placeholder="Briefly describe the project and your role..."></textarea>
      </div>
      <div class="rb-field rb-field--full">
        <label class="rb-field__label">Link (optional)</label>
        <input class="rb-field__input proj-link" type="url" placeholder="https://github.com/..." />
      </div>
    </div>
  `;
  container.appendChild(entry);
}

function gatherProjects() {
  const entries = document.querySelectorAll('#project-entries .rb-entry');
  return Array.from(entries).map(e => ({
    name: e.querySelector('.proj-name').value.trim(),
    description: e.querySelector('.proj-desc').value.trim(),
    tech_stack: e.querySelector('.proj-tech').value.trim(),
    link: e.querySelector('.proj-link').value.trim(),
  })).filter(e => e.name);
}

// ── Certifications ──────────────────────────────────────────────────────────
let certCount = 0;

function addCertification() {
  const container = document.getElementById('certification-entries');
  const idx = certCount++;
  const entry = document.createElement('div');
  entry.className = 'rb-entry';
  entry.innerHTML = `
    <div class="rb-entry__header">
      <span class="rb-entry__number">Certification #${idx + 1}</span>
      <button class="rb-entry__remove" onclick="this.closest('.rb-entry').remove()" title="Remove">×</button>
    </div>
    <div class="rb-form-grid">
      <div class="rb-field">
        <label class="rb-field__label">Certification Name</label>
        <input class="rb-field__input cert-name" type="text" placeholder="AWS Solutions Architect" />
      </div>
      <div class="rb-field">
        <label class="rb-field__label">Issuer</label>
        <input class="rb-field__input cert-issuer" type="text" placeholder="Amazon Web Services" />
      </div>
      <div class="rb-field">
        <label class="rb-field__label">Date</label>
        <input class="rb-field__input cert-date" type="text" placeholder="March 2024" />
      </div>
    </div>
  `;
  container.appendChild(entry);
}

function gatherCertifications() {
  const entries = document.querySelectorAll('#certification-entries .rb-entry');
  return Array.from(entries).map(e => ({
    name: e.querySelector('.cert-name').value.trim(),
    issuer: e.querySelector('.cert-issuer').value.trim(),
    date: e.querySelector('.cert-date').value.trim(),
  })).filter(e => e.name);
}

// ── Achievements ────────────────────────────────────────────────────────────
let achCount = 0;

function addAchievement() {
  const container = document.getElementById('achievement-entries');
  const idx = achCount++;
  const entry = document.createElement('div');
  entry.className = 'rb-simple-entry';
  entry.innerHTML = `
    <textarea class="rb-field__textarea ach-text" placeholder="Describe an achievement, award, or notable accomplishment..."></textarea>
    <button class="rb-simple-entry__remove" onclick="this.closest('.rb-simple-entry').remove()" title="Remove">×</button>
  `;
  container.appendChild(entry);
}

function gatherAchievements() {
  const entries = document.querySelectorAll('#achievement-entries .rb-simple-entry');
  return Array.from(entries)
    .map(e => e.querySelector('.ach-text').value.trim())
    .filter(Boolean);
}

// ── Template Selection ──────────────────────────────────────────────────────
function selectTemplate(template) {
  selectedTemplate = template;
  document.querySelectorAll('.rb-template-option').forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.template === template);
  });
  renderPreview();
}

// ── AI Suggestions ──────────────────────────────────────────────────────────
async function aiSuggest(section, textareaId) {
  const textarea = document.getElementById(textareaId);
  if (!textarea) return;

  const content = textarea.value.trim();
  if (!content) {
    showToast('Write something first, then let AI improve it.', 'info');
    textarea.focus();
    return;
  }

  const title = document.getElementById('personal-title')?.value || '';

  // Find the AI button for this textarea
  const btn = textarea.closest('.rb-field, .rb-field--full, .rb-entry')
    ?.querySelector('.rb-ai-btn');
  
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="rb-ai-btn__spinner"></span> Improving...';
  }

  try {
    const res = await fetch('/api/resume/ai-suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        section: section,
        content: content,
        context: title,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.detail || 'Request failed');
    }

    const data = await res.json();
    textarea.value = data.suggestion;

    // Highlight the textarea briefly
    textarea.style.borderColor = 'var(--success)';
    textarea.style.boxShadow = '0 0 0 3px var(--success-glow)';
    setTimeout(() => {
      textarea.style.borderColor = '';
      textarea.style.boxShadow = '';
    }, 2000);

    showToast('AI improved your text!', 'success');
  } catch (err) {
    showToast(err.message || 'AI suggestion failed.', 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '✨ AI Improve';
    }
  }
}

async function aiSuggestSkills() {
  const title = document.getElementById('personal-title')?.value?.trim() || '';
  const existing = skills.join(', ');

  if (!title && skills.length === 0) {
    showToast('Add your job title or some skills first.', 'info');
    return;
  }

  const btn = document.querySelector('.rb-card__title .rb-ai-btn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="rb-ai-btn__spinner"></span> Suggesting...';
  }

  try {
    const res = await fetch('/api/resume/ai-suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        section: 'skills',
        content: existing || 'none yet',
        context: title || 'professional',
      }),
    });

    if (!res.ok) throw new Error('Request failed');

    const data = await res.json();
    const suggested = data.suggestion
      .split(/[,\n]/)
      .map(s => s.replace(/^[-•*\d.)\s]+/, '').trim())
      .filter(s => s && s.length < 40 && !skills.includes(s));

    suggested.slice(0, 8).forEach(s => {
      if (!skills.includes(s)) {
        skills.push(s);
      }
    });

    renderSkills();
    showToast(`Added ${Math.min(suggested.length, 8)} suggested skills!`, 'success');
  } catch (err) {
    showToast('AI suggestion failed.', 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '✨ AI Suggest More';
    }
  }
}

// ── Preview Rendering ───────────────────────────────────────────────────────
function renderPreview() {
  const data = gatherData();
  const preview = document.getElementById('resume-preview');
  const p = data.personal;
  const templateClass = `resume--${selectedTemplate}`;

  // Build contact line
  let contactParts = [];
  if (p.email) contactParts.push(`<a href="mailto:${p.email}">${p.email}</a>`);
  if (p.phone) contactParts.push(`<span>${p.phone}</span>`);
  if (p.location) contactParts.push(`<span>${p.location}</span>`);
  if (p.linkedin) contactParts.push(`<a href="${ensureUrl(p.linkedin)}" target="_blank">LinkedIn</a>`);
  if (p.github) contactParts.push(`<a href="${ensureUrl(p.github)}" target="_blank">GitHub</a>`);
  if (p.website) contactParts.push(`<a href="${ensureUrl(p.website)}" target="_blank">Website</a>`);

  let html = `<div class="resume ${templateClass}">`;

  // Header
  html += `
    <div class="resume-header">
      <h1 class="resume-header__name">${esc(p.full_name || 'Your Name')}</h1>
      ${p.title ? `<div class="resume-header__title">${esc(p.title)}</div>` : ''}
      <div class="resume-header__contact">${contactParts.join(' · ')}</div>
    </div>
  `;

  // Summary
  if (p.summary) {
    html += `
      <div class="resume-section">
        <h2>Summary</h2>
        <p class="resume-summary">${esc(p.summary)}</p>
      </div>
    `;
  }

  // Experience
  if (data.experience.length > 0) {
    html += `<div class="resume-section"><h2>Experience</h2>`;
    data.experience.forEach(exp => {
      html += `
        <div class="resume-exp-item">
          <div class="resume-exp-item__header">
            <h3>${esc(exp.role)}</h3>
            <span class="resume-exp-item__meta">${esc(exp.start_date)}${exp.end_date ? ' – ' + esc(exp.end_date) : ''}</span>
          </div>
          <div class="resume-exp-item__meta">${esc(exp.company)}</div>
          ${exp.description ? `<p class="resume-exp-item__desc">${esc(exp.description)}</p>` : ''}
        </div>
      `;
    });
    html += `</div>`;
  }

  // Projects
  if (data.projects.length > 0) {
    html += `<div class="resume-section"><h2>Projects</h2>`;
    data.projects.forEach(proj => {
      html += `
        <div class="resume-proj-item">
          <div class="resume-proj-item__header">
            <h3>${esc(proj.name)}</h3>
            ${proj.link ? `<a href="${proj.link}" target="_blank" style="font-size:0.8rem; color:#6366f1;">View →</a>` : ''}
          </div>
          ${proj.description ? `<p class="resume-proj-item__desc">${esc(proj.description)}</p>` : ''}
          ${proj.tech_stack ? `<div class="resume-proj-item__tech">Tech: ${esc(proj.tech_stack)}</div>` : ''}
        </div>
      `;
    });
    html += `</div>`;
  }

  // Skills
  if (data.skills.length > 0) {
    html += `<div class="resume-section"><h2>Skills</h2><div class="resume-skills-list">`;
    data.skills.forEach(s => {
      html += `<span class="resume-skill-chip">${esc(s)}</span>`;
    });
    html += `</div></div>`;
  }

  // Education
  if (data.education.length > 0) {
    html += `<div class="resume-section"><h2>Education</h2>`;
    data.education.forEach(edu => {
      html += `
        <div class="resume-edu-item">
          <h3>${esc(edu.degree)}</h3>
          <div class="resume-edu-item__meta">${esc(edu.institution)}${edu.year ? ' · ' + esc(edu.year) : ''}${edu.gpa ? ' · GPA: ' + esc(edu.gpa) : ''}</div>
        </div>
      `;
    });
    html += `</div>`;
  }

  // Certifications
  if (data.certifications.length > 0) {
    html += `<div class="resume-section"><h2>Certifications</h2>`;
    data.certifications.forEach(cert => {
      html += `
        <div class="resume-cert-item">
          <span class="resume-cert-item__date">${esc(cert.date)}</span>
          <span>${esc(cert.name)}${cert.issuer ? ' — ' + esc(cert.issuer) : ''}</span>
        </div>
      `;
    });
    html += `</div>`;
  }

  // Achievements
  if (data.achievements.length > 0) {
    html += `<div class="resume-section"><h2>Achievements</h2>`;
    data.achievements.forEach(ach => {
      html += `<div class="resume-ach-item">${esc(ach)}</div>`;
    });
    html += `</div>`;
  }

  html += `</div>`;
  preview.innerHTML = html;
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function esc(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function ensureUrl(url) {
  if (!url) return '#';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return 'https://' + url;
}

// ── PDF Download ────────────────────────────────────────────────────────────
function downloadPDF() {
  renderPreview(); // Ensure up-to-date

  // Create print-only window
  const previewEl = document.getElementById('resume-preview');
  const printWin = window.open('', '_blank');

  printWin.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Resume — ${document.getElementById('personal-name')?.value || 'Resume'}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', system-ui, sans-serif; }
        ${getResumeStyles()}
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      ${previewEl.innerHTML}
      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); window.close(); }, 400);
        };
      <\/script>
    </body>
    </html>
  `);
  printWin.document.close();
  showToast('Print dialog opened — save as PDF!', 'info');
}

function getResumeStyles() {
  // Extract just the resume template styles for the print window
  return `
    .resume { color: #1a1a2e; font-family: 'Inter', system-ui, sans-serif; line-height: 1.6; font-size: 13px; padding: 40px; }
    .resume h1 { font-size: 1.8rem; font-weight: 800; letter-spacing: -0.02em; }
    .resume h2 { font-size: 1rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 12px; padding-bottom: 6px; }
    .resume h3 { font-size: 0.95rem; font-weight: 600; }
    .resume p { margin: 4px 0; }
    .resume-header { margin-bottom: 24px; }
    .resume-header__name { margin-bottom: 2px; }
    .resume-header__title { font-size: 1rem; color: #555; font-weight: 400; margin-bottom: 8px; }
    .resume-header__contact { display: flex; flex-wrap: wrap; gap: 12px; font-size: 0.8rem; color: #666; }
    .resume-header__contact a { color: inherit; text-decoration: none; }
    .resume-section { margin-bottom: 20px; }
    .resume-summary { font-size: 0.9rem; color: #444; line-height: 1.7; }
    .resume-exp-item, .resume-edu-item, .resume-proj-item, .resume-cert-item { margin-bottom: 14px; }
    .resume-exp-item__header, .resume-proj-item__header { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; }
    .resume-exp-item__meta, .resume-edu-item__meta { font-size: 0.8rem; color: #888; }
    .resume-exp-item__desc, .resume-proj-item__desc { font-size: 0.85rem; color: #555; margin-top: 4px; white-space: pre-line; }
    .resume-proj-item__tech { font-size: 0.75rem; color: #888; margin-top: 2px; font-style: italic; }
    .resume-skills-list { display: flex; flex-wrap: wrap; gap: 6px; }
    .resume-skill-chip { padding: 3px 10px; border-radius: 100px; font-size: 0.75rem; font-weight: 500; }
    .resume-cert-item { display: flex; align-items: baseline; gap: 8px; }
    .resume-cert-item__date { font-size: 0.75rem; color: #888; flex-shrink: 0; }
    .resume-ach-item { padding: 4px 0; font-size: 0.85rem; color: #444; }
    .resume-ach-item::before { content: '▸ '; color: #888; }

    /* Classic */
    .resume--classic { font-family: 'Georgia', 'Times New Roman', serif; }
    .resume--classic .resume-header { border-bottom: 3px solid #1a365d; padding-bottom: 16px; }
    .resume--classic .resume-header__name { color: #1a365d; }
    .resume--classic h2 { color: #1a365d; border-bottom: 1px solid #cbd5e0; }
    .resume--classic .resume-skill-chip { background: #ebf4ff; color: #1a365d; border: 1px solid #bee3f8; }

    /* Modern */
    .resume--modern .resume-header { background: linear-gradient(135deg, #6366f1, #3b82f6); color: white; padding: 32px; margin: -40px -40px 24px; }
    .resume--modern .resume-header__name { color: white; }
    .resume--modern .resume-header__title { color: rgba(255,255,255,0.85); }
    .resume--modern .resume-header__contact { color: rgba(255,255,255,0.75); }
    .resume--modern .resume-header__contact a { color: rgba(255,255,255,0.85); }
    .resume--modern h2 { color: #6366f1; border-bottom: 2px solid #e0e7ff; }
    .resume--modern .resume-skill-chip { background: #eef2ff; color: #4338ca; border: 1px solid #c7d2fe; }

    /* Minimal */
    .resume--minimal { padding: 48px; }
    .resume--minimal .resume-header { border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; }
    .resume--minimal .resume-header__name { font-weight: 600; font-size: 1.5rem; color: #111; }
    .resume--minimal h2 { font-weight: 600; font-size: 0.85rem; color: #999; border-bottom: none; margin-bottom: 10px; }
    .resume--minimal .resume-skill-chip { background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; }
  `;
}

// ── Save & Portfolio ────────────────────────────────────────────────────────
async function saveAndGetPortfolio() {
  const data = gatherData();

  const btn = document.querySelector('.rb-btn--primary[onclick*="saveAndGetPortfolio"]');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '⏳ Saving...';
  }

  try {
    const res = await fetch('/api/resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error('Failed to save');

    const result = await res.json();
    savedResumeId = result.id;

    const portfolioUrl = `${window.location.origin}/portfolio/${result.id}`;

    showToast('Resume saved! Opening portfolio...', 'success');

    // Open portfolio in new tab
    setTimeout(() => {
      window.open(portfolioUrl, '_blank');
    }, 500);

  } catch (err) {
    showToast(err.message || 'Failed to save resume.', 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '🌐 Generate Portfolio';
    }
  }
}
