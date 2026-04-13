const data = {
    'Main': [
        { id: 1, seats: 4, taken: true, guest: "Vladimir Š." },
        { id: 2, seats: 2, taken: false },
        { id: 3, seats: 4, taken: false },
        { id: 4, seats: 6, taken: true, guest: "Marko M." },
        { id: 5, seats: 2, taken: false },
        { id: 6, seats: 4, taken: false },
        { id: 7, seats: 2, taken: false },
        { id: 8, seats: 8, taken: true, guest: "Goran L." },
        { id: 9, seats: 4, taken: true, guest: "Hrvoje L." },
        { id: 10, seats: 2, taken: false }
    ],
    'Terrace': [
        { id: 11, seats: 2, taken: false },
        { id: 12, seats: 4, taken: true, guest: "Nataša Ć." },
        { id: 13, seats: 2, taken: false },
        { id: 14, seats: 4, taken: false },
        { id: 15, seats: 6, taken: true, guest: "Dijana E." }
    ],
    'VIP': [
        { id: 101, seats: 12, taken: true, guest: "Širaz N." },
        { id: 102, seats: 6, taken: false }
    ]
};

let currentZone = 'Main';
let currentUserRole = null;

function handleLogin() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const card = document.querySelector('.login-card');

    if (user === 'admin' && pass === 'sdjb1') {
        loginAs('admin');
    } else if (user === 'gost' && pass === '12345') {
        loginAs('gost');
    } else {
       showToast("❌ Pogrešni podaci za prijavu!");
       card.classList.add('shake');
       setTimeout(() => card.classList.remove('shake'), 300);
    }
}

function loginAs(role) {
    currentUserRole = role;
    const loginScreen = document.getElementById('login-screen');

    loginScreen.style.transition = "opacity 0.4s ease, transform 0.4s ease";
    loginScreen.style.opacity = "0";
    loginScreen.style.transform = "scale(0.95)";
    loginScreen.style.pointerEvents = "none";

    setTimeout(() => {
        loginScreen.style.display = 'none';
        document.body.classList.remove('logged-out');
        document.body.classList.add('logged-in');
        document.body.classList.add('user-' + role);
        
        document.getElementById('role-display').innerText = role === 'admin' ? "👑 ADMIN " : "👤 GOST ";
        
        renderGrid();
        showToast(`Dobrodošli, ${role}!`);
    }, 400);
}

function logout() {
    location.reload();
}

function showSection(id, el) {
    if (currentUserRole === 'gost' && (id === 'analytics-view' || id === 'inventory-view' || id === 'settings-view')) {
        showToast("🚫 Nemate ovlasti za ovu sekciju!");
        return;
    }
    document.querySelectorAll('.content-page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(id);
    if(target) target.classList.add('active');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
    if(id === 'inventory-view') renderInventory();
}

function switchZone(zone, el) {
    currentZone = zone;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    const targetSpan = document.getElementById('target-zone-name');
    if(targetSpan) targetSpan.innerText = zone === 'Main' ? 'Glavna Sala' : zone;
    renderGrid();
    renderInventory();
}

function renderGrid() {
    const grid = document.getElementById('grid');
    if(!grid) return;
    const filter = parseInt(document.getElementById('seat-filter').value);
    grid.innerHTML = '';
    let free = 0, taken = 0;
    data[currentZone].forEach(t => {
        if (t.seats < filter) return;
        t.taken ? taken++ : free++;
        const node = document.createElement('div');
        node.className = `table-node ${t.taken ? 'taken' : ''}`;
        node.innerHTML = `<small>STOL ${t.id}</small><h2>${t.seats} MJESTA</h2><p>${t.taken ? '🔴 ' + t.guest : '🟢 Slobodno'}</p>`;
        if (!t.taken) node.onclick = () => reserve(t.id);
        grid.appendChild(node);
    });
    document.getElementById('free-stat').innerText = free;
    document.getElementById('taken-stat').innerText = taken;
    updateLog();
}

function renderInventory() {
    const invGrid = document.getElementById('inventory-grid');
    if(!invGrid) return;
    invGrid.innerHTML = '';
    data[currentZone].forEach(t => {
        const item = document.createElement('div');
        item.style.cssText = "display:flex; justify-content:space-between; padding:15px; background:var(--card); border:1px solid var(--border); border-radius:10px; margin-bottom:10px; align-items:center;";
        const deleteBtn = currentUserRole === 'admin' ? `<button onclick="deleteTable(${t.id})" style="color:#ef4444; background:none; border:none; cursor:pointer; font-weight:600">UKLONI</button>` : '';
        item.innerHTML = `<span><strong>Stol ${t.id}</strong> — ${t.seats} mjesta</span> ${deleteBtn}`;
        invGrid.appendChild(item);
    });
}

function reserve(id) {
    const name = document.getElementById('guest-name').value;
    if (!name) { showToast("⚠️ Unesite ime gosta!"); return; }
    const table = data[currentZone].find(t => t.id === id);
    table.taken = true;
    table.guest = name;
    showToast(`Stol ${id} rezerviran: ${name}`);
    document.getElementById('guest-name').value = '';
    renderGrid();
}

function addNewTable() {
    if(currentUserRole !== 'admin') return;
    const idInput = document.getElementById('new-id');
    const seatInput = document.getElementById('new-seats');
    if (!idInput.value || !seatInput.value) return;
    data[currentZone].push({ id: parseInt(idInput.value), seats: parseInt(seatInput.value), taken: false });
    idInput.value = ''; seatInput.value = '';
    showToast("✨ Stol dodan!");
    renderInventory();
    renderGrid();
}

function deleteTable(id) {
    if(currentUserRole !== 'admin') return;
    data[currentZone] = data[currentZone].filter(t => t.id !== id);
    renderInventory();
    renderGrid();
}

function updateLog() {
    const container = document.getElementById('log-container');
    if(!container) return;
    container.innerHTML = '';
    Object.keys(data).forEach(zone => {
        data[zone].forEach(t => {
            if (t.taken) {
                const item = document.createElement('div');
                item.style.cssText = "padding:12px; background:#1e1e26; border-radius:8px; margin-bottom:8px; border-left:3px solid var(--accent); font-size:0.8rem;";
                item.innerHTML = `<strong>${t.guest}</strong><br><span style="color:var(--text-dim)">${zone} • Stol ${t.id}</span>`;
                container.appendChild(item);
            }
        });
    });
}

function showToast(msg) {
    const t = document.getElementById('toast');
    t.innerText = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
}

setInterval(() => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('hr-HR', {hour: '2-digit', minute:'2-digit'});
    const timeEl = document.getElementById('time');
    if(timeEl) timeEl.innerText = timeStr;
}, 1000);

renderGrid();

function toggleFAQ(btn) {
    const item = btn.parentElement;
    const isActive = item.classList.contains('active');
    
    // Zatvori sve ostale
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
    
    // Otvori kliknuti ako nije bio aktivan
    if (!isActive) {
        item.classList.add('active');
    }
}
