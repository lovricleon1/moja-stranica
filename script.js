// DATABASE
const data = {
    'Main': [
        { id: 1, seats: 4, taken: true, guest: "Ivan H." },
        { id: 2, seats: 2, taken: false },
        { id: 3, seats: 4, taken: false },
        { id: 4, seats: 6, taken: true, guest: "Ana M." }
    ],
    'Terrace': [
        { id: 10, seats: 2, taken: false },
        { id: 11, seats: 4, taken: false }
    ],
    'VIP': [
        { id: 101, seats: 12, taken: true, guest: "VIP Grupa" }
    ]
};

let currentZone = 'Main';

// NAVIGATION
function showSection(id, el) {
    document.querySelectorAll('.content-page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
}

// SWITCH ZONE
function switchZone(zone, el) {
    currentZone = zone;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('current-zone-name').innerText = zone;
    renderGrid();
}

// RENDER GRID
function renderGrid() {
    const grid = document.getElementById('grid');
    const invGrid = document.getElementById('inventory-grid');
    const filter = parseInt(document.getElementById('seat-filter').value);
    
    grid.innerHTML = '';
    invGrid.innerHTML = '';

    let free = 0, taken = 0;

    data[currentZone].forEach(t => {
        if (t.seats < filter) return;
        t.taken ? taken++ : free++;

        // Render for Tlocrt
        const node = document.createElement('div');
        node.className = `table-node ${t.taken ? 'taken' : ''}`;
        node.innerHTML = `
            <small>STOL ${t.id}</small>
            <h2>${t.seats} MJESTA</h2>
            <p>${t.taken ? '🔴 ' + t.guest : '🟢 Slobodno'}</p>
        `;
        if (!t.taken) node.onclick = () => reserve(t.id);
        grid.appendChild(node);

        // Render for Inventory
        const invNode = document.createElement('div');
        invNode.style.padding = "10px";
        invNode.style.borderBottom = "1px solid #262626";
        invNode.innerHTML = `Stol ${t.id} - ${t.seats} mjesta <button onclick="deleteTable(${t.id})" style="float:right; color:red; background:none; border:none; cursor:pointer">Ukloni</button>`;
        invGrid.appendChild(invNode);
    });

    document.getElementById('free-stat').innerText = free;
    document.getElementById('taken-stat').innerText = taken;
    updateLog();
}

// RESERVE
function reserve(id) {
    const name = document.getElementById('guest-name').value;
    if (!name) { showToast("⚠️ Unesite ime gosta!"); return; }

    const table = data[currentZone].find(t => t.id === id);
    table.taken = true;
    table.guest = name;
    
    showToast(`✅ Rezervirano: Stol ${id}`);
    document.getElementById('guest-name').value = '';
    renderGrid();
}

// ADD TABLE
function addNewTable() {
    const id = document.getElementById('new-id').value;
    const seats = document.getElementById('new-seats').value;
    
    if (!id || !seats) return;

    data[currentZone].push({ id: parseInt(id), seats: parseInt(seats), taken: false });
    renderGrid();
    showToast("✨ Novi stol dodan!");
}

function deleteTable(id) {
    data[currentZone] = data[currentZone].filter(t => t.id !== id);
    renderGrid();
}

// LOG
function updateLog() {
    const container = document.getElementById('log-container');
    container.innerHTML = '';
    Object.keys(data).forEach(zone => {
        data[zone].forEach(t => {
            if (t.taken) {
                const item = document.createElement('div');
                item.className = 'log-item';
                item.innerHTML = `<strong>${t.guest}</strong><br><small>${zone} • Stol ${t.id}</small>`;
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

// CLOCK
setInterval(() => {
    const now = new Date();
    document.getElementById('time').innerText = now.toLocaleTimeString('hr-HR', {hour: '2-digit', minute:'2-digit'});
}, 1000);

renderGrid();