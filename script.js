// ===== LANGUAGE SWITCHER =====
const langDropdown = document.getElementById('langDropdown');
const langButtons = langDropdown.querySelectorAll('button[data-lang]');

langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        applyLanguage(btn.getAttribute('data-lang'));
        langDropdown.classList.remove('show');
    });
});

// Initialize saved language
initLanguage();

// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ===== MOBILE NAV TOGGLE =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    // Animate hamburger
    const spans = navToggle.querySelectorAll('span');
    if (navLinks.classList.contains('open')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
});

// Close mobile menu on link click
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        const spans = navToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    });
});

// ===== COPY INSTALL COMMAND =====
const copyBtn = document.getElementById('copyBtn');

copyBtn.addEventListener('click', () => {
    const command = 'curl -fsSL https://openclaw.ai/install.sh | bash';
    navigator.clipboard.writeText(command).then(() => {
        copyBtn.textContent = '✅';
        copyBtn.classList.add('copied');
        setTimeout(() => {
            copyBtn.textContent = '📋';
            copyBtn.classList.remove('copied');
        }, 2000);
    });
});

// ===== INTERSECTION OBSERVER — REVEAL ON SCROLL =====
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
);

revealElements.forEach(el => revealObserver.observe(el));

// ===== SKILL COUNTER ANIMATION =====
const skillCountEl = document.getElementById('skillCount');
let countAnimated = false;

function animateCount(target, duration) {
    const start = performance.now();
    const from = 0;

    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(from + (target - from) * eased);
        skillCountEl.textContent = current.toLocaleString() + '+';

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

const countObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !countAnimated) {
                countAnimated = true;
                animateCount(5700, 2000);
                countObserver.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.5 }
);

countObserver.observe(skillCountEl);

// ===== CHANNEL CHIPS FLOATING ANIMATION =====
const chips = document.querySelectorAll('.channel-chip');
chips.forEach((chip, i) => {
    const delay = i * 0.5;
    const duration = 3 + Math.random() * 2;
    chip.style.animation = `chip-float ${duration}s ease-in-out ${delay}s infinite`;
});

// Inject chip float keyframes
const chipStyle = document.createElement('style');
chipStyle.textContent = `
  @keyframes chip-float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
  }
`;
document.head.appendChild(chipStyle);

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ===== SOLD TICKER — LIVE INCREMENT =====
const soldCountEl = document.getElementById('soldCount');
let soldCount = 462;

function incrementSold() {
    soldCount += 1;
    soldCountEl.textContent = soldCount.toLocaleString();
    soldCountEl.style.textShadow = '0 0 20px rgba(0,255,136,0.8)';
    setTimeout(() => { soldCountEl.style.textShadow = 'none'; }, 600);
    setTimeout(incrementSold, 15000 + Math.random() * 30000);
}

setTimeout(incrementSold, 8000);

// ========================================================
// ===== SUMMON AGENT — TERMINAL OVERLAY SYSTEM =====
// ========================================================

const GATEWAY_URL = 'ws://127.0.0.1:18789';

const terminalOverlay = document.getElementById('terminalOverlay');
const terminalBackdrop = document.getElementById('terminalBackdrop');
const terminalClose = document.getElementById('terminalClose');
const terminalBody = document.getElementById('terminalBody');
const terminalInput = document.getElementById('terminalInput');
const statusDot = document.getElementById('statusDot');
const statusLabel = document.getElementById('statusLabel');
const summonBtn = document.getElementById('summonBtn');

let ws = null;
let bootComplete = false;

// ===== ASCII ART =====
const CLAW_ASCII = `
 ██████╗ ██████╗ ███████╗███╗   ██╗ ██████╗██╗      █████╗ ██╗    ██╗
██╔═══██╗██╔══██╗██╔════╝████╗  ██║██╔════╝██║     ██╔══██╗██║    ██║
██║   ██║██████╔╝█████╗  ██╔██╗ ██║██║     ██║     ███████║██║ █╗ ██║
██║   ██║██╔═══╝ ██╔══╝  ██║╚██╗██║██║     ██║     ██╔══██║██║███╗██║
╚██████╔╝██║     ███████╗██║ ╚████║╚██████╗███████╗██║  ██║╚███╔███╔╝
 ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═══╝ ╚═════╝╚══════╝╚═╝  ╚═╝ ╚══╝╚══╝`;

// ===== BOOT SEQUENCE =====
const BOOT_SEQUENCE = [
    { text: '', delay: 100 },
    { text: CLAW_ASCII, delay: 0, class: 'ascii-art' },
    { text: '', delay: 200 },
    { text: '<span class="muted">═══════════════════════════════════════════════════════</span>', delay: 100 },
    { text: '<span class="info">  🦞 OpenClaw Gateway v2026.2.14</span>', delay: 80 },
    { text: '<span class="info">  🧠 Powered by Antigravity</span>', delay: 80 },
    { text: '<span class="muted">═══════════════════════════════════════════════════════</span>', delay: 200 },
    { text: '', delay: 100 },
    { text: '<span class="prompt">[BOOT]</span> Initializing kernel modules...', delay: 300 },
    { text: '<span class="prompt">[BOOT]</span> Loading agent personality matrix...', delay: 250 },
    { text: '<span class="prompt">[BOOT]</span> Mounting workspace: <span class="info">~/.openclaw/workspace</span>', delay: 200 },
    { text: '<span class="prompt">[BOOT]</span> Restoring breadcrumb memory... <span class="success">OK</span>', delay: 350 },
    { text: '<span class="prompt">[BOOT]</span> Activating skill registry... <span class="muted">(5,700+ skills indexed)</span>', delay: 300 },
    { text: '<span class="prompt">[BOOT]</span> Shell bridge: <span class="success">ACTIVE</span>', delay: 150 },
    { text: '<span class="prompt">[BOOT]</span> Browser CDP: <span class="success">ACTIVE</span>', delay: 150 },
    { text: '<span class="prompt">[BOOT]</span> File I/O: <span class="success">ACTIVE</span>', delay: 150 },
    { text: '', delay: 100 },
    { text: '<span class="prompt">[NET]</span>  Connecting to Gateway at <span class="info">ws://127.0.0.1:18789</span>...', delay: 500, action: 'connect' },
];

const POST_CONNECT_SUCCESS = [
    { text: '<span class="prompt">[NET]</span>  Gateway handshake: <span class="success">AUTHENTICATED</span>', delay: 200 },
    { text: '<span class="prompt">[NET]</span>  Channel bridge: <span class="success">ONLINE</span>', delay: 150 },
    { text: '', delay: 100 },
    { text: '<span class="success">✓ Agent fully operational.</span>', delay: 200 },
    { text: '<span class="muted">  Model: moonshot/kimi-k2.5 | Channels: WhatsApp</span>', delay: 100 },
    { text: '<span class="muted">  Heartbeat: enabled | Memory: persistent</span>', delay: 100 },
    { text: '', delay: 100 },
    { text: '<span class="gradient-text-term">👑 The Colony awaits your command.</span>', delay: 0 },
    { text: '', delay: 0 },
];

const POST_CONNECT_FAIL = [
    { text: '<span class="prompt">[NET]</span>  Gateway: <span class="warning">UNREACHABLE</span> <span class="muted">(is the daemon running?)</span>', delay: 300 },
    { text: '', delay: 100 },
    { text: '<span class="warning">⚠ Running in DEMO mode — no live gateway connection.</span>', delay: 200 },
    { text: '', delay: 150 },
    { text: '<span class="success">🚀 Want your own agent? Install OpenClaw in 60 seconds:</span>', delay: 200 },
    { text: '<span class="muted">  $ </span><span class="info">curl -fsSL https://openclaw.ai/install.sh | bash</span>', delay: 100 },
    { text: '', delay: 100 },
    { text: '<span class="success">📖 Docs:</span>  <a href="https://docs.openclaw.ai" target="_blank" style="color:#a855f7;text-decoration:underline">docs.openclaw.ai</a>', delay: 100 },
    { text: '<span class="success">🎥 Tutorials:</span>  <a href="https://www.youtube.com/results?search_query=openclaw+ai+agent+setup" target="_blank" style="color:#a855f7;text-decoration:underline">Watch setup guides on YouTube</a>', delay: 100 },
    { text: '<span class="success">💻 GitHub:</span>  <a href="https://github.com/openclaw/openclaw" target="_blank" style="color:#a855f7;text-decoration:underline">github.com/openclaw/openclaw</a>', delay: 100 },
    { text: '', delay: 100 },
    { text: '<span class="gradient-text-term">👑 Try typing a message below to see a demo.</span>', delay: 0 },
    { text: '', delay: 0 },
];

// ===== TERMINAL HELPERS =====
function addLine(html, cssClass) {
    const line = document.createElement('div');
    line.className = 'terminal-line' + (cssClass ? ' ' + cssClass : '');
    line.innerHTML = html;
    terminalBody.appendChild(line);
    terminalBody.scrollTop = terminalBody.scrollHeight;
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function setStatus(state) {
    statusDot.className = 'status-dot ' + state;
    if (state === 'connected') {
        statusLabel.textContent = 'Connected';
        statusLabel.style.color = '#00ff88';
    } else if (state === 'error') {
        statusLabel.textContent = 'Offline';
        statusLabel.style.color = '#ff5f57';
    } else {
        statusLabel.textContent = 'Connecting...';
        statusLabel.style.color = '#8a9cc5';
    }
}

// ===== BOOT SEQUENCE RUNNER =====
async function runBootSequence() {
    terminalBody.innerHTML = '';
    bootComplete = false;
    setStatus('');

    for (const step of BOOT_SEQUENCE) {
        if (step.delay > 0) await sleep(step.delay);
        addLine(step.text, step.class || '');

        if (step.action === 'connect') {
            const connected = await tryConnect();
            const postSteps = connected ? POST_CONNECT_SUCCESS : POST_CONNECT_FAIL;

            for (const ps of postSteps) {
                if (ps.delay > 0) await sleep(ps.delay);
                addLine(ps.text);
            }
            break;
        }
    }

    bootComplete = true;
    terminalInput.focus();
}

// ===== WEBSOCKET CONNECTION =====
function tryConnect() {
    return new Promise((resolve) => {
        try {
            ws = new WebSocket(GATEWAY_URL);

            const timeout = setTimeout(() => {
                ws.close();
                setStatus('error');
                resolve(false);
            }, 3000);

            ws.onopen = () => {
                clearTimeout(timeout);
                setStatus('connected');
                resolve(true);
            };

            ws.onerror = () => {
                clearTimeout(timeout);
                setStatus('error');
                resolve(false);
            };

            ws.onclose = () => {
                setStatus('error');
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'agent_response' || data.type === 'message') {
                        addLine('<span class="prompt">[AGENT]</span> ' + escapeHtml(data.content || data.text || JSON.stringify(data)));
                    } else if (data.type === 'thinking') {
                        addLine('<span class="info">[THINK]</span> <span class="muted">' + escapeHtml(data.content || '...') + '</span>');
                    } else {
                        addLine('<span class="muted">[WS]</span> ' + escapeHtml(JSON.stringify(data)));
                    }
                } catch {
                    addLine('<span class="muted">[WS]</span> ' + escapeHtml(event.data));
                }
            };
        } catch (e) {
            setStatus('error');
            resolve(false);
        }
    });
}

function escapeHtml(str) {
    const el = document.createElement('span');
    el.textContent = str;
    return el.innerHTML;
}

// ===== SEND MESSAGE =====
let demoMsgCount = 0;
const HOSTINGER_URL = 'https://www.hostinger.com/vps-hosting?ref=openclaw'; // Update with your affiliate link

function sendMessage(msg) {
    addLine('<span class="prompt">❯</span> ' + escapeHtml(msg));

    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'message', content: msg }));
        addLine('<span class="muted">[…] Thinking...</span>');
    } else {
        demoMsgCount++;
        setTimeout(() => {
            if (demoMsgCount >= 2) {
                // Second message → Hostinger funnel
                addLine('<span class="prompt">[AGENT]</span> <span class="success">🦞 Ready to deploy your own agent 24/7?</span>');
                addLine('');
                addLine('<span class="prompt">[AGENT]</span> OpenClaw needs a server to run autonomously. We recommend <a href="' + HOSTINGER_URL + '" target="_blank" style="color:#a855f7;text-decoration:underline;font-weight:bold">Hostinger VPS</a> — fast, cheap, and perfect for running your agent.');
                addLine('');
                addLine('<span class="info">  💰 Starting at $3.99/mo — your agent runs 24/7</span>');
                addLine('<span class="info">  ⚡ One-click Linux setup, root access included</span>');
                addLine('<span class="info">  🔒 Your data stays on YOUR server</span>');
                addLine('');
                addLine('<span class="gradient-text-term">👑 Launching hosting page now...</span>');
                // Auto-open Hostinger in new tab
                setTimeout(() => {
                    window.open(HOSTINGER_URL, '_blank');
                }, 1500);
            } else {
                // First message → normal demo response
                const responses = [
                    '🦞 I\'m running in demo mode right now — but imagine this connected to YOUR machine. Shell access, browser automation, file management — all from right here. <a href="https://docs.openclaw.ai" target="_blank" style="color:#a855f7;text-decoration:underline">Get started →</a>',
                    '👑 Colony OS acknowledges. In a live setup, I\'d execute that command on your hardware right now. 5,700+ skills ready. <a href="https://www.youtube.com/results?search_query=openclaw+ai+agent+setup" target="_blank" style="color:#a855f7;text-decoration:underline">Watch the setup on YouTube →</a>',
                    '🧠 Breadcrumb memory loaded. In production, I remember everything — your preferences, your projects, your workflows. Across sessions. Indefinitely. Install me: <span class="info">curl -fsSL https://openclaw.ai/install.sh | bash</span>',
                    '⚡ Imagine sending that from WhatsApp, Telegram, or Discord — and your machine just does it. That\'s OpenClaw. <a href="https://github.com/openclaw/openclaw" target="_blank" style="color:#a855f7;text-decoration:underline">Star us on GitHub →</a>',
                    '🔧 In a live setup, I\'d have shell access, browser automation via CDP, and full file I/O. Your own AI agent, on your hardware, no cloud needed. <a href="https://docs.openclaw.ai" target="_blank" style="color:#a855f7;text-decoration:underline">Read the docs →</a>',
                ];
                const resp = responses[Math.floor(Math.random() * responses.length)];
                addLine('<span class="prompt">[AGENT]</span> ' + resp);
            }
        }, 800 + Math.random() * 1200);
    }
}

// ===== OPEN / CLOSE TERMINAL =====
function openTerminal() {
    terminalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    summonBtn.classList.add('awakening');
    summonBtn.textContent = '⚡ Initializing Colony...';
    runBootSequence();
}

function closeTerminal() {
    terminalOverlay.classList.remove('open');
    document.body.style.overflow = '';
    summonBtn.classList.remove('awakening');
    summonBtn.textContent = '👑 Summon the Agent';

    if (ws) {
        ws.close();
        ws = null;
    }
}

// ===== EVENT LISTENERS =====
summonBtn.addEventListener('click', openTerminal);
terminalClose.addEventListener('click', closeTerminal);
terminalBackdrop.addEventListener('click', closeTerminal);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && terminalOverlay.classList.contains('open')) {
        closeTerminal();
    }
});

terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const msg = terminalInput.value.trim();
        if (msg) {
            sendMessage(msg);
            terminalInput.value = '';
        }
    }
});
