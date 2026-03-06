// ── State ────────────────────────────────────────────────────────────────────
let state = {
  filePath: null,
  dirty: false,
  data: {
    name: 'JONAS BROWN',
    tagline: 'Molecular Biology & Neural Computation Student \u00b7 University of Washington',
    phone: '360-706-7996',
    email: 'brownjonasa@gmail.com',
    location: 'Seattle, WA',
    linkedin: 'linkedin.com/in/jonas-brown-b5b59b389',
    objective: 'Pre-professional biology and neural computation student seeking an entry-level role in healthcare or life sciences. Combines a rigorous STEM foundation at UW with hands-on certifications (CPR/AED, Bloodborne Pathogen Safety), scientific computing skills (Python, R, MATLAB), and 4+ years of direct-service, coaching, and team leadership experience.',
    competencies: [
      'Data Analysis',
      'Scientific Computing (Python \u00b7 R \u00b7 MATLAB)',
      'CPR / AED Response',
      'Emergency Protocols',
      'Bloodborne Pathogen Safety',
      'Food Safety Compliance',
      'Coaching & Instruction',
      'Team Collaboration',
      'Leadership',
      'Customer-Facing Communication',
      'SolidWorks CAD'
    ],
    skills: {
      programming: 'Python, R, MATLAB, Bash (Command Line)',
      software: 'VS Code, SolidWorks',
      certifications: 'CPR/AED \u00b7 Bloodborne Pathogen Safety \u00b7 Washington State Food Handler Card'
    },
    education: {
      school: 'University of Washington \u2014 Seattle, WA',
      degree: 'Bachelor of Science, Molecular & Cellular Developmental Biology',
      minor: 'Minor in Neural Computation & Engineering',
      date: 'Expected May 2027',
      activities: 'Officer, UW Rowing Club'
    },
    experience: [
      {
        title: 'Team Member',
        company: "Ivar\u2019s at Stadiums",
        location: 'Seattle, WA',
        date: 'Sept 2025 \u2013 Present',
        bullets: [
          'Deliver high-volume customer service during sold-out stadium events, sustaining accuracy and professionalism under continuous time pressure.',
          'Enforce Washington State food safety and cash handling protocols, maintaining zero compliance incidents across every shift.',
          'Coordinate with team members across multiple service stations to meet concurrent demand during peak-capacity events.'
        ]
      },
      {
        title: 'Lifeguard & Swim Instructor',
        company: 'Valley Athletic Center',
        location: 'Seattle, WA',
        date: 'Jan 2021 \u2013 Jun 2023',
        bullets: [
          'Coached 15+ swimmers weekly \u2014 from beginners to competitive athletes \u2014 in stroke mechanics, race strategy, and water safety, achieving consistent skill progression.',
          'Administered emergency response protocols using CPR/AED; conducted ongoing patron safety monitoring across all aquatic areas.',
          'Adapted instruction to diverse age groups and skill levels, delivering individualized feedback to both recreational swimmers and swim team members.'
        ]
      },
      {
        title: 'Chef',
        company: 'Red Wagon',
        location: 'Seattle, WA',
        date: 'Jan 2021 \u2013 Jun 2023',
        bullets: [
          'Executed food preparation in a professional, high-volume kitchen in strict compliance with Washington State health and safety standards.',
          'Managed concurrent prep tasks during peak service hours, maintaining output quality and kitchen organization under sustained pressure.'
        ]
      }
    ],
    additional: [
      'National-Level Competitive Swimmer \u2014 Years of elite training demonstrate discipline, structured goal-setting, and high-performance teamwork under competitive pressure.',
      'Conservation Club \u2014 100+ volunteer hours in community environmental outreach and conservation service.'
    ],
    format: {
      color: '#006e7a',
      fontSize: 10.5,
      margin: 0.75
    }
  }
};

// ── DOM refs ─────────────────────────────────────────────────────────────────
const preview       = document.getElementById('preview');
const fileIndicator = document.getElementById('file-indicator');
const toast         = document.getElementById('toast');

// ── Debounced preview update ──────────────────────────────────────────────────
let updateTimer = null;
function scheduleUpdate() {
  if (updateTimer) clearTimeout(updateTimer);
  updateTimer = setTimeout(() => {
    updatePreview();
    updateTitle();
  }, 120);
}

// ── Toast ─────────────────────────────────────────────────────────────────────
let toastTimer = null;
function showToast(msg, isError = false) {
  toast.textContent = msg;
  toast.classList.toggle('error', isError);
  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ── Window title ──────────────────────────────────────────────────────────────
function updateTitle() {
  const name  = state.filePath ? state.filePath.split(/[\\/]/).pop() : 'Untitled';
  const dirty = state.dirty ? ' \u2022' : '';
  window.resumeAPI.setTitle(`Resume Builder \u2014 ${name}${dirty}`);
  fileIndicator.textContent = state.filePath ? name + dirty : dirty ? '(unsaved)' : '';
}

// ── HTML escape helpers ───────────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ── Read form → state ─────────────────────────────────────────────────────────
function readForm() {
  const d = state.data;
  d.name     = document.getElementById('f-name').value;
  d.tagline  = document.getElementById('f-tagline').value;
  d.phone    = document.getElementById('f-phone').value;
  d.email    = document.getElementById('f-email').value;
  d.location = document.getElementById('f-location').value;
  d.linkedin = document.getElementById('f-linkedin').value;
  d.objective = document.getElementById('f-objective').value;
  d.skills.programming  = document.getElementById('f-skills-prog').value;
  d.skills.software     = document.getElementById('f-skills-soft').value;
  d.skills.certifications = document.getElementById('f-skills-cert').value;
  d.education.school     = document.getElementById('f-edu-school').value;
  d.education.degree     = document.getElementById('f-edu-degree').value;
  d.education.minor      = document.getElementById('f-edu-minor').value;
  d.education.date       = document.getElementById('f-edu-date').value;
  d.education.activities = document.getElementById('f-edu-activities').value;
  d.format.color    = document.getElementById('f-color').value;
  d.format.fontSize = parseFloat(document.getElementById('f-fontsize').value) || 10.5;
  d.format.margin   = parseFloat(document.getElementById('f-margin').value) || 0.75;
  state.dirty = true;
}

// ── Populate form from state ──────────────────────────────────────────────────
function populateForm() {
  const d = state.data;
  document.getElementById('f-name').value     = d.name;
  document.getElementById('f-tagline').value  = d.tagline;
  document.getElementById('f-phone').value    = d.phone;
  document.getElementById('f-email').value    = d.email;
  document.getElementById('f-location').value = d.location;
  document.getElementById('f-linkedin').value = d.linkedin;
  document.getElementById('f-objective').value = d.objective;
  document.getElementById('f-skills-prog').value = d.skills.programming;
  document.getElementById('f-skills-soft').value = d.skills.software;
  document.getElementById('f-skills-cert').value = d.skills.certifications;
  document.getElementById('f-edu-school').value     = d.education.school;
  document.getElementById('f-edu-degree').value     = d.education.degree;
  document.getElementById('f-edu-minor').value      = d.education.minor;
  document.getElementById('f-edu-date').value       = d.education.date;
  document.getElementById('f-edu-activities').value = d.education.activities;
  document.getElementById('f-color').value    = d.format.color;
  document.getElementById('f-fontsize').value = d.format.fontSize;
  document.getElementById('f-margin').value   = d.format.margin;
  renderCompTags();
  renderExperience();
  renderAddlTags();
}

// ── Competencies tags ─────────────────────────────────────────────────────────
function renderCompTags() {
  const container = document.getElementById('comp-tags');
  container.innerHTML = '';
  state.data.competencies.forEach((comp, i) => {
    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.innerHTML =
      `<span class="tag-text" title="${escAttr(comp)}">${escHtml(comp)}</span>` +
      `<button class="tag-remove" data-i="${i}">\u00d7</button>`;
    container.appendChild(tag);
  });
  container.querySelectorAll('.tag-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      state.data.competencies.splice(parseInt(btn.dataset.i), 1);
      state.dirty = true;
      renderCompTags();
      scheduleUpdate();
    });
  });
}

function addComp() {
  const input = document.getElementById('comp-input');
  const val = input.value.trim();
  if (!val) return;
  state.data.competencies.push(val);
  input.value = '';
  state.dirty = true;
  renderCompTags();
  scheduleUpdate();
}

document.getElementById('comp-add').addEventListener('click', addComp);
document.getElementById('comp-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); addComp(); }
});

// ── Additional tags ───────────────────────────────────────────────────────────
function renderAddlTags() {
  const container = document.getElementById('addl-tags');
  container.innerHTML = '';
  state.data.additional.forEach((item, i) => {
    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.innerHTML =
      `<span class="tag-text">${escHtml(item)}</span>` +
      `<button class="tag-remove" data-i="${i}">\u00d7</button>`;
    container.appendChild(tag);
  });
  container.querySelectorAll('.tag-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      state.data.additional.splice(parseInt(btn.dataset.i), 1);
      state.dirty = true;
      renderAddlTags();
      scheduleUpdate();
    });
  });
}

function addAddl() {
  const input = document.getElementById('addl-input');
  const val = input.value.trim();
  if (!val) return;
  state.data.additional.push(val);
  input.value = '';
  state.dirty = true;
  renderAddlTags();
  scheduleUpdate();
}

document.getElementById('addl-add').addEventListener('click', addAddl);
document.getElementById('addl-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); addAddl(); }
});

// ── Experience ────────────────────────────────────────────────────────────────
function renderExperience() {
  const container = document.getElementById('exp-entries');
  container.innerHTML = '';

  state.data.experience.forEach((exp, ei) => {
    const card = document.createElement('div');
    card.className = 'exp-entry-card';

    const bulletsHtml = exp.bullets.map((b, bi) =>
      `<div class="bullet-row">` +
        `<textarea class="bullet-text" data-ei="${ei}" data-bi="${bi}" rows="2">${escHtml(b)}</textarea>` +
        `<button class="bullet-remove" data-ei="${ei}" data-bi="${bi}">\u00d7</button>` +
      `</div>`
    ).join('');

    card.innerHTML =
      `<div class="exp-entry-header">` +
        `<span class="exp-entry-label">Position ${ei + 1}</span>` +
        `<button class="exp-remove-btn" data-ei="${ei}">\u00d7</button>` +
      `</div>` +
      `<label>Title<input type="text" class="exp-title" data-ei="${ei}" value="${escAttr(exp.title)}"></label>` +
      `<label>Company<input type="text" class="exp-company" data-ei="${ei}" value="${escAttr(exp.company)}"></label>` +
      `<label>Location<input type="text" class="exp-loc" data-ei="${ei}" value="${escAttr(exp.location)}"></label>` +
      `<label>Date<input type="text" class="exp-date" data-ei="${ei}" value="${escAttr(exp.date)}"></label>` +
      `<label>Bullets</label>` +
      `<div class="bullets-list">${bulletsHtml}</div>` +
      `<button class="add-bullet-btn" data-ei="${ei}">+ Add Bullet</button>`;

    container.appendChild(card);
  });

  // Remove position
  container.querySelectorAll('.exp-remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.data.experience.splice(parseInt(btn.dataset.ei), 1);
      state.dirty = true;
      renderExperience();
      scheduleUpdate();
    });
  });

  // Field changes
  const fieldMap = [
    ['.exp-title',   'title'],
    ['.exp-company', 'company'],
    ['.exp-loc',     'location'],
    ['.exp-date',    'date']
  ];
  fieldMap.forEach(([sel, key]) => {
    container.querySelectorAll(sel).forEach(inp => {
      inp.addEventListener('input', () => {
        state.data.experience[parseInt(inp.dataset.ei)][key] = inp.value;
        state.dirty = true;
        scheduleUpdate();
      });
    });
  });

  // Bullet changes
  container.querySelectorAll('.bullet-text').forEach(ta => {
    ta.addEventListener('input', () => {
      state.data.experience[parseInt(ta.dataset.ei)].bullets[parseInt(ta.dataset.bi)] = ta.value;
      state.dirty = true;
      scheduleUpdate();
    });
  });

  // Remove bullet
  container.querySelectorAll('.bullet-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      state.data.experience[parseInt(btn.dataset.ei)].bullets.splice(parseInt(btn.dataset.bi), 1);
      state.dirty = true;
      renderExperience();
      scheduleUpdate();
    });
  });

  // Add bullet
  container.querySelectorAll('.add-bullet-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.data.experience[parseInt(btn.dataset.ei)].bullets.push('');
      state.dirty = true;
      renderExperience();
      scheduleUpdate();
    });
  });
}

document.getElementById('btn-add-exp').addEventListener('click', () => {
  state.data.experience.push({ title: '', company: '', location: '', date: '', bullets: [''] });
  state.dirty = true;
  renderExperience();
  scheduleUpdate();
});

// ── Collapsible card headers ──────────────────────────────────────────────────
document.querySelectorAll('.card-header').forEach(header => {
  const body  = document.getElementById(header.dataset.target);
  const arrow = header.querySelector('.card-arrow');
  header.classList.add('open');  // start expanded

  header.addEventListener('click', () => {
    const open = !body.classList.contains('hidden');
    body.classList.toggle('hidden', open);
    header.classList.toggle('open', !open);
    arrow.classList.toggle('rotated', open);
  });
});

// ── General input → state pipeline ───────────────────────────────────────────
document.querySelectorAll(
  'input[type="text"], input[type="number"], input[type="color"], textarea'
).forEach(el => {
  if (el.closest('#exp-entries')) return; // handled by renderExperience
  el.addEventListener('input', () => { readForm(); scheduleUpdate(); });
  if (el.type === 'color') {
    el.addEventListener('change', () => { readForm(); scheduleUpdate(); });
  }
});

// ── Build resume HTML string ──────────────────────────────────────────────────
function buildResumeHTML(d) {
  const c  = d.format.color;
  const fs = d.format.fontSize;
  const mg = d.format.margin;

  // Competencies inline with · separators
  const compItems = d.competencies.map((comp, i) =>
    i === 0 ? escHtml(comp) : `<span class="dot">\u00b7</span>${escHtml(comp)}`
  ).join('\n    ');

  // Experience entries
  const expHtml = d.experience.map(exp => {
    const bullets = exp.bullets
      .filter(b => b.trim())
      .map(b => `      <li>${escHtml(b)}</li>`)
      .join('\n');
    return (
      `  <div class="exp-entry">\n` +
      `    <div class="row">\n` +
      `      <span class="row-left">\n` +
      `        <span class="job-title">${escHtml(exp.title)}</span>` +
      (exp.company  ? `<span class="job-company"> &mdash; ${escHtml(exp.company)}</span>`   : '') +
      (exp.location ? `<span class="job-location">, ${escHtml(exp.location)}</span>` : '') +
      `\n      </span>\n` +
      `      <span class="date">${escHtml(exp.date)}</span>\n` +
      `    </div>\n` +
      `    <ul class="bul">\n${bullets}\n    </ul>\n` +
      `  </div>`
    );
  }).join('\n');

  // Additional items — detect "Bold Part — rest" and render bold
  const addlHtml = d.additional.map(item => {
    const m = item.match(/^(.+?)\s*[\u2014\u2013]\s*(.+)$/);
    if (m) return `<strong>${escHtml(m[1].trim())}</strong> &mdash; ${escHtml(m[2].trim())}`;
    return escHtml(item);
  }).join('<br>\n    ');

  const linkedinHref = d.linkedin
    ? (d.linkedin.startsWith('http') ? d.linkedin : 'https://' + d.linkedin)
    : '';
  const linkedinDisplay = d.linkedin.replace(/^https?:\/\//i, '');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: Arial, sans-serif;
  font-size: ${fs}pt;
  color: #1a1a1a;
  background: #fff;
  width: 8.5in;
  margin: 0 auto;
  padding: ${mg}in 0.78in ${Math.max(0.3, mg - 0.1)}in 0.78in;
}
.name { font-size: 23pt; font-weight: 700; color: ${c}; letter-spacing: 0.4px; line-height: 1; }
.tagline { font-size: 9.5pt; color: #555; margin-top: 3px; font-style: italic; letter-spacing: 0.2px; }
.contact-bar { margin-top: 5px; font-size: 9.5pt; color: #333; display: flex; flex-wrap: wrap; align-items: center; }
.contact-bar a { color: #333; text-decoration: none; }
.sep { color: #bbb; margin: 0 7px; font-size: 9pt; }
.sh { font-size: 9.5pt; font-weight: 700; color: ${c}; text-transform: uppercase; letter-spacing: 1.8px; border-bottom: 1.5px solid ${c}; padding-bottom: 2px; margin-top: 11px; margin-bottom: 5px; }
.objective { font-size: 10pt; line-height: 1.45; }
.comp-list { font-size: 9.5pt; line-height: 1.7; }
.comp-list .dot { color: ${c}; font-weight: 700; margin: 0 7px; }
.skill-row { display: flex; font-size: 10pt; line-height: 1.45; margin-bottom: 1px; }
.skill-label { font-weight: 700; min-width: 118px; flex-shrink: 0; padding-right: 6px; }
.row { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
.row-left { flex: 1; min-width: 0; }
.date { font-size: 9.5pt; color: #555; font-style: italic; white-space: nowrap; flex-shrink: 0; }
.school { font-weight: 700; font-size: 10.5pt; }
.degree { font-size: 10pt; margin-top: 1px; }
.edu-sub { font-size: 9.5pt; color: #484848; margin-top: 1px; }
.exp-entry { margin-bottom: 8px; }
.job-title { font-weight: 700; font-size: 10.5pt; }
.job-company { font-weight: 400; color: #484848; font-size: 10pt; }
.job-location { font-size: 9.5pt; color: #555; }
ul.bul { list-style: none; padding-left: 0; margin-top: 3px; }
ul.bul li { position: relative; padding-left: 13px; margin-bottom: 2px; font-size: 10pt; line-height: 1.38; }
ul.bul li::before { content: "\u25b8"; position: absolute; left: 0; top: 0; color: ${c}; font-size: 9pt; }
.addl { font-size: 10pt; line-height: 1.5; }
.addl strong { color: #1a1a1a; }
@media print {
  html, body { margin: 0; padding: ${mg}in 0.78in ${Math.max(0.3, mg - 0.1)}in 0.78in; width: 8.5in; }
  @page { size: letter; margin: 0; }
}
</style></head>
<body>

<div class="name">${escHtml(d.name)}</div>
${d.tagline ? `<div class="tagline">${escHtml(d.tagline)}</div>` : ''}
<div class="contact-bar">
  <span>${escHtml(d.phone)}</span>
  ${d.email ? `<span class="sep">|</span><span><a href="mailto:${escAttr(d.email)}">${escHtml(d.email)}</a></span>` : ''}
  ${d.location ? `<span class="sep">|</span><span>${escHtml(d.location)}</span>` : ''}
  ${d.linkedin ? `<span class="sep">|</span><span><a href="${escAttr(linkedinHref)}">${escHtml(linkedinDisplay)}</a></span>` : ''}
</div>

${d.objective ? `<div class="sh">Objective</div>\n<div class="objective">${escHtml(d.objective)}</div>` : ''}

${d.competencies.length ? `<div class="sh">Core Competencies</div>\n<div class="comp-list">\n    ${compItems}\n</div>` : ''}

<div class="sh">Technical Skills &amp; Certifications</div>
<div class="skill-row"><span class="skill-label">Programming:</span><span>${escHtml(d.skills.programming)}</span></div>
<div class="skill-row"><span class="skill-label">Software:</span><span>${escHtml(d.skills.software)}</span></div>
<div class="skill-row"><span class="skill-label">Certifications:</span><span>${escHtml(d.skills.certifications)}</span></div>

<div class="sh">Education</div>
<div class="edu-block">
  <div class="row">
    <span class="row-left school">${escHtml(d.education.school)}</span>
    <span class="date">${escHtml(d.education.date)}</span>
  </div>
  <div class="degree"><em>${escHtml(d.education.degree)}</em>${d.education.minor ? ` &nbsp;\u00b7&nbsp; ${escHtml(d.education.minor)}` : ''}</div>
  ${d.education.activities ? `<div class="edu-sub">${escHtml(d.education.activities)}</div>` : ''}
</div>

${d.experience.length ? `<div class="sh">Professional Experience</div>\n${expHtml}` : ''}

${d.additional.length ? `<div class="sh">Additional</div>\n<div class="addl">\n    ${addlHtml}\n</div>` : ''}

</body></html>`;
}

// ── Render preview ────────────────────────────────────────────────────────────
function updatePreview() {
  preview.srcdoc = buildResumeHTML(state.data);
}

// ── File operations ───────────────────────────────────────────────────────────
async function saveFile(saveAs = false) {
  const fp = saveAs ? null : state.filePath;
  const result = await window.resumeAPI.saveFile(state.data, fp);
  if (result.success) {
    state.filePath = result.filePath;
    state.dirty = false;
    updateTitle();
    showToast('Saved: ' + result.filePath.split(/[\\/]/).pop());
  } else if (result.error) {
    showToast('Save failed: ' + result.error, true);
  }
}

async function openFile() {
  const result = await window.resumeAPI.openFile();
  if (result.success) {
    state.data     = result.data;
    state.filePath = result.filePath;
    state.dirty    = false;
    populateForm();
    updatePreview();
    updateTitle();
    showToast('Opened: ' + result.filePath.split(/[\\/]/).pop());
  } else if (result.error) {
    showToast('Open failed: ' + result.error, true);
  }
}

async function exportPDF() {
  showToast('Generating PDF\u2026');
  const result = await window.resumeAPI.exportPDF(buildResumeHTML(state.data));
  if (result.success) {
    showToast('PDF saved: ' + result.filePath.split(/[\\/]/).pop());
  } else if (result.error) {
    showToast('Export failed: ' + result.error, true);
  }
}

function newFile() {
  state.data = {
    name: '', tagline: '', phone: '', email: '', location: '', linkedin: '',
    objective: '',
    competencies: [],
    skills: { programming: '', software: '', certifications: '' },
    education: { school: '', degree: '', minor: '', date: '', activities: '' },
    experience: [],
    additional: [],
    format: { color: '#006e7a', fontSize: 10.5, margin: 0.75 }
  };
  state.filePath = null;
  state.dirty    = false;
  populateForm();
  updatePreview();
  updateTitle();
}

// ── Toolbar buttons ───────────────────────────────────────────────────────────
document.getElementById('btn-open').addEventListener('click', openFile);
document.getElementById('btn-save').addEventListener('click', () => saveFile(false));
document.getElementById('btn-pdf').addEventListener('click', exportPDF);

// ── Menu actions from main process ────────────────────────────────────────────
window.resumeAPI.onMenuAction(action => {
  switch (action) {
    case 'new':        newFile();        break;
    case 'open':       openFile();       break;
    case 'save':       saveFile(false);  break;
    case 'save-as':    saveFile(true);   break;
    case 'export-pdf': exportPDF();      break;
  }
});

// ── Init ──────────────────────────────────────────────────────────────────────
populateForm();
updatePreview();
updateTitle();
