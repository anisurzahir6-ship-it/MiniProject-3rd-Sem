/* script.js — Learnify with Login/Signup system
   - per-user storage (learnify_data_v1)
   - tutorials, quiz, contact, admin
   - new: simple login/register using localStorage
*/

document.addEventListener('DOMContentLoaded', () => {
  // ---------- Storage helpers ----------
  const ROOT_KEY = 'learnify_data_v1';
  const USERS_KEY = 'learnify_users';

  function loadRoot() {
    try {
      const raw = localStorage.getItem(ROOT_KEY);
      return raw ? JSON.parse(raw) : { users: {}, messages: [] };
    } catch (e) {
      return { users: {}, messages: [] };
    }
  }
  function saveRoot(data) {
    try {
      localStorage.setItem(ROOT_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('saveRoot failed', e);
    }
  }

  function loadUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
    } catch {
      return {};
    }
  }
  function saveUsers(data) {
    localStorage.setItem(USERS_KEY, JSON.stringify(data));
  }

  // ---------- Current user helpers ----------
  function getCurrentUser() {
    return localStorage.getItem('learnify_current_user') || 'guest';
  }
  function setCurrentUser(name) {
    if (!name) return;
    localStorage.setItem('learnify_current_user', name);
  }

  // ---------- Navbar login/logout display ----------
  const authArea = document.getElementById('authArea');
  if (authArea) {
    const user = getCurrentUser();
    if (user && user !== 'guest') {
      authArea.innerHTML = `
        <span>👋 ${user}</span>
        <button id="logoutBtn" class="btn-ghost" style="padding:6px 10px;">Logout</button>
      `;
    } else {
      authArea.innerHTML = `
        <a href="login.html" class="btn-ghost" style="padding:6px 10px;">Login</a>
        <a href="register.html" class="btn-primary" style="padding:6px 10px;">Register</a>
      `;
    }
  }

  // ---------- Logout logic ----------
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('learnify_current_user');
      alert('Logged out.');
      location.href = 'index.html';
    });
  }

  // ---------- Registration page ----------
  const regForm = document.getElementById('registerForm');
  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const u = document.getElementById('regUsername').value.trim();
      const p = document.getElementById('regPassword').value.trim();
      if (!u || !p) return alert('Please enter username and password.');
      const users = loadUsers();
      if (users[u]) return alert('Username already exists!');
      users[u] = { password: p };
      saveUsers(users);
      alert('Registration successful! You can now log in.');
      location.href = 'home.html';
    });
  }

  // ---------- Login page ----------
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const u = document.getElementById('loginUsername').value.trim();
      const p = document.getElementById('loginPassword').value.trim();
      const users = loadUsers();
      if (!users[u] || users[u].password !== p) {
        alert('Invalid username or password.');
        return;
      }
      setCurrentUser(u);
      alert('Welcome back, ' + u + '!');
      location.href = 'home.html';
    });
  }

  // ---------- User creation helper ----------
  function ensureUser(data, username) {
    if (!data.users[username]) {
      data.users[username] = { completedTutorials: [], quizResult: null, transcripts: {}, messages: [] };
    }
  }

  // ---------- Tutorials logic ----------
  const TUTORIALS = [
    { id: 't1', title: 'HTML Basics — Page Structure', youtube: 'https://www.youtube.com/embed/PkZNo7MFNFg?rel=0&autoplay=0&cc_load_policy=1', desc: 'Basics of HTML structure & tags.' },
    { id: 't2', title: 'Python Full Course', youtube: 'https://www.youtube.com/embed/rfscVS0vtbw?rel=0&autoplay=0&cc_load_policy=1', desc: 'Python crash course / fundamentals.' },
    { id: 't3', title: 'JavaScript Full Course', youtube: 'https://www.youtube.com/embed/G3e-cpL7ofc?rel=0&autoplay=0&cc_load_policy=1', desc: 'Comprehensive JS tutorial.' },
    { id: 't4', title: 'React / Frontend Concepts', youtube: 'https://www.youtube.com/embed/xTtL8E4LzTQ?rel=0&autoplay=0&cc_load_policy=1', desc: 'React basics & project examples.' },
    { id: 't5', title: 'Data Structures & Algorithms', youtube: 'https://www.youtube.com/embed/Ez8F0nW6S-w?rel=0&autoplay=0&cc_load_policy=1', desc: 'DSA concepts and examples.' }
  ];

  const tutorialListEl = document.getElementById('tutorialList');
  const tutorialVideoArea = document.getElementById('tutorialVideoArea');
  const tutorialProgressWrap = document.getElementById('tutorialProgressWrap');

  if (tutorialListEl && tutorialVideoArea) {
    const root = loadRoot();
    const username = getCurrentUser();
    ensureUser(root, username);

    if (tutorialProgressWrap) tutorialProgressWrap.style.display = 'block';

    function renderList() {
      tutorialListEl.innerHTML = '';
      const userData = loadRoot().users[username] || { completedTutorials: [], transcripts: {} };
      TUTORIALS.forEach((t, idx) => {
        const done = userData.completedTutorials && userData.completedTutorials.includes(t.id);
        const item = document.createElement('div');
        item.className = 'tutorial-item';
        item.innerHTML = `
          <div style="flex:1">
            <strong>${idx+1}. ${t.title}</strong>
            <div class="muted" style="margin-top:6px">${t.desc}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
            <button class="btn-ghost view-btn" data-id="${t.id}">Watch</button>
            <button class="mark-btn" data-id="${t.id}">${done ? 'Completed ✓' : 'Mark complete'}</button>
          </div>
        `;
        tutorialListEl.appendChild(item);
      });
      updateTutorialProgress();
    }

    function loadTutorial(tid) {
      const t = TUTORIALS.find(x => x.id === tid) || TUTORIALS[0];
      const data = loadRoot();
      const userTranscripts = (data.users[getCurrentUser()] && data.users[getCurrentUser()].transcripts) || {};
      const savedTranscript = userTranscripts[t.id] || '';
      tutorialVideoArea.innerHTML = `
        <h3 style="color:#58a6ff">${t.title}</h3>
        <iframe class="video-frame" src="${t.youtube}" title="${t.title}" frameborder="0" allowfullscreen></iframe>
        <p class="muted" style="margin-top:8px">${t.desc}</p>
        <div style="margin-top:12px;">
          <button id="toggleTranscript" class="btn-ghost">Show / Edit Transcript</button>
        </div>
        <div id="transcriptArea" style="display:none;margin-top:8px">
          <textarea id="transcriptInput" rows="6" style="width:100%;border-radius:8px;padding:8px;background:rgba(2,6,12,0.5);color:#e6f3ff;border:1px solid rgba(255,255,255,0.03)">${escapeHtml(savedTranscript)}</textarea>
          <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px">
            <button id="saveTranscriptBtn" class="btn-primary">Save Transcript</button>
            <button id="clearTranscriptBtn" class="btn-ghost">Clear</button>
          </div>
        </div>
      `;
      const toggle = document.getElementById('toggleTranscript');
      const transcriptArea = document.getElementById('transcriptArea');
      toggle.addEventListener('click', () => {
        transcriptArea.style.display = transcriptArea.style.display === 'none' ? 'block' : 'none';
      });
      document.getElementById('saveTranscriptBtn').addEventListener('click', () => {
        const txt = document.getElementById('transcriptInput').value || '';
        const root2 = loadRoot();
        ensureUser(root2, getCurrentUser());
        root2.users[getCurrentUser()].transcripts[t.id] = txt;
        saveRoot(root2);
        alert('Transcript saved locally.');
      });
      document.getElementById('clearTranscriptBtn').addEventListener('click', () => {
        if (!confirm('Clear transcript for this tutorial?')) return;
        document.getElementById('transcriptInput').value = '';
        const root3 = loadRoot();
        if (root3.users && root3.users[getCurrentUser()] && root3.users[getCurrentUser()].transcripts) {
          delete root3.users[getCurrentUser()].transcripts[t.id];
          saveRoot(root3);
        }
        alert('Transcript cleared.');
      });
    }

    function updateTutorialProgress() {
      const root = loadRoot();
      const user = root.users[getCurrentUser()] || { completedTutorials: [] };
      const pct = Math.round(((user.completedTutorials || []).length / TUTORIALS.length) * 100);
      const fill = document.getElementById('tutorialBarFill');
      const label = document.getElementById('tutorialProgressLabel');
      if (fill) fill.style.width = pct + '%';
      if (label) label.textContent = `Tutorials completed: ${(user.completedTutorials || []).length}/${TUTORIALS.length} (${pct}%)`;
    }

    renderList();
    loadTutorial(TUTORIALS[0].id);

    tutorialListEl.addEventListener('click', (ev) => {
      const view = ev.target.closest('.view-btn');
      if (view) return loadTutorial(view.dataset.id);
      const mark = ev.target.closest('.mark-btn');
      if (mark) {
        const id = mark.dataset.id;
        const root4 = loadRoot();
        ensureUser(root4, getCurrentUser());
        root4.users[getCurrentUser()].completedTutorials ||= [];
        if (!root4.users[getCurrentUser()].completedTutorials.includes(id)) {
          root4.users[getCurrentUser()].completedTutorials.push(id);
          saveRoot(root4);
        }
        renderList();
      }
    });
  }

  // ---------- QUIZ logic ----------
  const quizArea = document.getElementById('quizArea');
  const startBtn = document.getElementById('startQuizBtn');
  const quizProgressWrap = document.getElementById('quizProgressWrap');
  const resetQuizBtn = document.getElementById('resetQuizBtn');
  const resetAllBtn = document.getElementById('resetAllBtn');

  if (quizArea && startBtn) {
    const QUIZ = [
      { q: 'What does HTML stand for?', options: ['HyperText Markup Language','HighText Machine Language','Hyper Trainer Mix','Home Tool Markup'], correct:0 },
      { q: 'Which tag includes JavaScript?', options: ['<script>','<js>','<link>','<code>'], correct:0 },
      { q: 'CSS property for text color?', options: ['text-color','color','font-color','fgcolor'], correct:1 },
      { q: 'Block-scoped variable in JS?', options: ['var','let','const','set'], correct:1 },
      { q: 'Single-line comment in Python?', options: ['//','#','/*','--'], correct:1 },
      { q: 'Element for hyperlink?', options: ['<link>','<a>','<href>','<url>'], correct:1 },
      { q: 'One-dimensional layout in CSS?', options: ['grid','flexbox','float','table'], correct:1 },
      { q: 'Add item to end of array?', options: ['pop','push','shift','unshift'], correct:1 },
      { q: 'JSON.parse does?', options: ['Stringify object','Parse JSON string to object','Send JSON','Validate JSON'], correct:1 },
      { q: 'Open link in new tab attribute?', options: ['target="_blank"','rel="external"','newtab','open="_blank"'], correct:0 }
    ];

    if (quizProgressWrap) quizProgressWrap.style.display = 'block';

    function showLastQuiz() {
      const root = loadRoot();
      const user = root.users[getCurrentUser()];
      const fill = document.getElementById('quizBarFill');
      const label = document.getElementById('quizProgressLabel');
      if (user && user.quizResult) {
        const s = user.quizResult.score;
        const pct = Math.round((s / QUIZ.length) * 100);
        if (fill) fill.style.width = pct + '%';
        if (label) label.textContent = `Last score: ${s}/${QUIZ.length} (${pct}%)`;
      } else if (label) label.textContent = 'No quiz taken yet';
    }
    showLastQuiz();

    let current = 0, score = 0, busy = false;

    startBtn.addEventListener('click', () => {
      startBtn.style.display = 'none';
      current = 0; score = 0;
      renderQuestion();
    });

    function renderQuestion() {
      busy = false;
      const q = QUIZ[current];
      quizArea.innerHTML = `
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-bottom:8px">
          <button id="resetQuizSmall" class="btn-ghost">Reset Quiz</button>
        </div>
        <h3>${escapeHtml(q.q)}</h3>
        <div id="optionsArea" style="margin-top:12px;">
          ${q.options.map((o,i)=>`<button class="option-btn" data-i="${i}">${escapeHtml(o)}</button>`).join('')}
        </div>
        <div id="feedback" class="feedback"></div>
        <div style="margin-top:12px" class="muted">Question ${current+1}/${QUIZ.length}</div>
      `;
      const resetSmall = document.getElementById('resetQuizSmall');
      if (resetSmall) resetSmall.addEventListener('click', resetQuizForUser);

      quizArea.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (busy) return; busy = true;
          const chosen = Number(btn.dataset.i);
          const correct = QUIZ[current].correct;
          const feedback = document.getElementById('feedback');
          if (chosen === correct) {
            btn.classList.add('correct');
            feedback.textContent = '✅ Correct';
            score++;
          } else {
            btn.classList.add('incorrect');
            const correctBtn = quizArea.querySelector(`.option-btn[data-i="${correct}"]`);
            if (correctBtn) correctBtn.classList.add('correct');
            feedback.textContent = '❌ Incorrect';
          }
          setTimeout(() => {
            current++;
            if (current < QUIZ.length) renderQuestion();
            else finishQuiz();
            busy = false;
          }, 900);
        });
      });
    }

    function finishQuiz() {
      const root = loadRoot();
      ensureUser(root, getCurrentUser());
      root.users[getCurrentUser()].quizResult = { score, total: QUIZ.length, takenAt: new Date().toISOString() };
      saveRoot(root);
      const fill = document.getElementById('quizBarFill');
      const label = document.getElementById('quizProgressLabel');
      const pct = Math.round((score / QUIZ.length) * 100);
      if (fill) fill.style.width = pct + '%';
      if (label) label.textContent = `Last score: ${score}/${QUIZ.length} (${pct}%)`;
      quizArea.innerHTML = `
        <h3>Quiz Completed</h3>
        <p><strong>Your score: ${score}/${QUIZ.length}</strong></p>
        <div style="margin-top:12px;display:flex;gap:8px;justify-content:center">
          <button id="retryBtn" class="btn-primary">Retry Quiz</button>
          <button id="toTutorials" class="btn-ghost">Back to Tutorials</button>
        </div>
      `;
      document.getElementById('retryBtn').addEventListener('click', () => { current=0; score=0; renderQuestion(); });
      document.getElementById('toTutorials').addEventListener('click', () => location.href = 'tutorials.html');
    }

    function resetQuizForUser() {
      if (!confirm('Reset your quiz result?')) return;
      const root = loadRoot();
      if (root.users && root.users[getCurrentUser()]) {
        root.users[getCurrentUser()].quizResult = null;
        saveRoot(root);
        showLastQuiz();
        alert('Quiz result cleared for user: ' + getCurrentUser());
        location.reload();
      }
    }

    if (resetQuizBtn) resetQuizBtn.addEventListener('click', resetQuizForUser);
    if (resetAllBtn) resetAllBtn.addEventListener('click', () => {
      if (!confirm('Reset ALL users progress and messages?')) return;
      localStorage.removeItem(ROOT_KEY);
      alert('All Learnify data cleared.');
      location.reload();
    });
  }

  // ---------- Contact form ----------
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const name = (document.getElementById('contactName') || {}).value || '';
      const email = (document.getElementById('contactEmail') || {}).value || '';
      const message = (document.getElementById('contactMessage') || {}).value || '';
      const root = loadRoot();
      const username = getCurrentUser();
      ensureUser(root, username);
      root.messages ||= [];
      root.messages.unshift({ user: username, name, email, message, at: new Date().toISOString() });
      root.users[username].messages ||= [];
      root.users[username].messages.unshift({ name, email, message, at: new Date().toISOString() });
      saveRoot(root);
      alert('Message saved locally (demo).');
      contactForm.reset();
    });
  }

  // ---------- Admin page ----------
  const adminUsersTableBody = document.querySelector('#adminUsersTable tbody');
  const adminMessagesTableBody = document.querySelector('#adminMessagesTable tbody');
  const adminResetBtn = document.getElementById('adminResetBtn');

  if (adminUsersTableBody && adminMessagesTableBody) {
    function renderAdmin() {
      const root = loadRoot();
      adminUsersTableBody.innerHTML = '';
      adminMessagesTableBody.innerHTML = '';
      Object.keys(root.users).forEach(user => {
        const u = root.users[user];
        const completed = (u.completedTutorials || []).map(id => {
          const t = TUTORIALS.find(tt => tt.id === id);
          return t ? t.title : id;
        }).join('; ') || '-';
        const quiz = u.quizResult ? `${u.quizResult.score}/${u.quizResult.total} @ ${new Date(u.quizResult.takenAt).toLocaleString()}` : '-';
        const messagesCount = (u.messages || []).length || 0;
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${escapeHtml(user)}</td><td>${escapeHtml(completed)}</td><td>${escapeHtml(quiz)}</td><td>${messagesCount}</td>`;
        adminUsersTableBody.appendChild(tr);
      });

      (root.messages || []).forEach(m => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${escapeHtml(m.user || '')}</td><td>${escapeHtml(m.name || '')}</td><td>${escapeHtml(m.email || '')}</td><td>${escapeHtml(m.message || '')}</td><td>${new Date(m.at).toLocaleString()}</td>`;
        adminMessagesTableBody.appendChild(tr);
      });
    }
    renderAdmin();

    if (adminResetBtn) {
      adminResetBtn.addEventListener('click', () => {
        if (!confirm('Reset ALL Learnify data (progress, messages)?')) return;
        localStorage.removeItem(ROOT_KEY);
        alert('All Learnify data cleared.');
        renderAdmin();
      });
    }
  }

  // ---------- Utility ----------
  function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }
});
