const AVAILABLE_ICONS = [
    { label: 'Website',     path: './icons/website.png' },
    { label: 'Instagram',   path: './icons/insta.png' },
    { label: 'TikTok',      path: './icons/tiktok.png' },
    { label: 'YouTube',     path: './icons/youtube.png' },
    { label: 'Amazon',      path: './icons/amazon.png' },
    { label: 'Kaffeekasse', path: './icons/cafe.png' },
    { label: 'Mail',        path: './icons/mail.png' },
    { label: 'Affiliate',   path: './icons/affiliate.svg' },
];

const THEMES = [
    {
        id: 'darkgreen', label: 'Dark Green',
        tileStyle: 'background-color:#0d1f15; border:2px solid rgba(255,255,255,0.3); background-image:linear-gradient(to bottom,rgba(255,255,255,0.08) 0%,transparent 60%);',
    },
    {
        id: 'light', label: 'Light',
        tileStyle: 'background:linear-gradient(120deg,#fdfbfb 0%,#c3cfe2 100%); border:2px solid rgba(0,0,0,0.12);',
    },
    {
        id: 'dark-minimal', label: 'Dark Minimal',
        tileStyle: 'background-color:#0a0a0a; border:2px solid #444; background-image:linear-gradient(to bottom,rgba(255,255,255,0.04) 0%,transparent 100%);',
    },
    {
        id: 'cyberpunk', label: 'Cyberpunk',
        tileStyle: 'background-color:#050508; border:2px solid #00f3ff; background-image:linear-gradient(rgba(0,243,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(0,243,255,0.06) 1px,transparent 1px); background-size:8px 8px; box-shadow:0 0 10px rgba(0,243,255,0.5);',
    },
    {
        id: 'cosplay', label: 'Cosplay',
        tileStyle: 'background:linear-gradient(-45deg,#ffb8d1,#e2b0ff,#9fb8ff); border:2px solid rgba(255,255,255,0.5);',
    },
    {
        id: 'fantasy', label: 'Fantasy',
        tileStyle: 'background-color:#110c1c; background-image:radial-gradient(circle at center,#2b1d44 0%,#110c1c 80%); border:2px solid #d4af37; box-shadow:0 0 8px rgba(212,175,55,0.3);',
    },
    {
        id: 'bricks', label: 'Bricks',
        tileStyle: 'background-color:#e53935; border:2px solid #b71c1c; background-image:radial-gradient(#e53935 20%,transparent 20%),radial-gradient(#b71c1c 40%,transparent 40%); background-size:10px 10px; background-position:0 0,1px 1px;',
    },
    {
        id: 'arcade', label: 'Arcade',
        tileStyle: 'background-color:#000; border:2px solid #fbc02d; background-image:linear-gradient(rgba(255,255,255,0.06) 1px,transparent 1px); background-size:100% 4px; box-shadow:3px 3px 0 #00e5ff, inset 0 0 12px rgba(233,30,99,0.5);',
    },
    {
        id: 'tcg', label: 'TCG',
        tileStyle: 'background-color:#161b22; border:2px solid #a8b2bd; background-image:linear-gradient(115deg,transparent 20%,rgba(255,0,0,0.3) 30%,rgba(255,255,0,0.3) 45%,rgba(0,255,255,0.3) 60%,rgba(255,0,255,0.3) 75%,transparent 85%); border-radius:6px;',
    },
    {
        id: 'manga', label: 'Manga',
        tileStyle: 'background-color:#fff; border:3px solid #000; background-image:radial-gradient(#000 15%,transparent 16%),radial-gradient(#000 15%,transparent 16%); background-size:7px 7px; background-position:0 0,3.5px 3.5px; box-shadow:4px 4px 0 #e60000;',
    },
    {
        id: 'steampunk', label: 'Steampunk',
        tileStyle: 'background-color:#2b1d14; border:3px solid #b58231; background-image:radial-gradient(circle at 5px 5px,#8b5a2b 3px,transparent 4px),radial-gradient(circle at calc(100% - 5px) calc(100% - 5px),#8b5a2b 3px,transparent 4px); box-shadow:inset 0 0 10px rgba(0,0,0,0.8);',
    },
    {
        id: 'hacker', label: 'Hacker',
        tileStyle: 'background-color:#000; border:2px solid #00ff41; background-image:linear-gradient(rgba(0,255,65,0.08) 1px,transparent 1px); background-size:100% 4px; box-shadow:0 0 10px rgba(0,255,65,0.4);',
    },
];

let currentProfileId = null;
let currentImageUrl = '';
let currentTheme = 'darkgreen';
let designGridOpen = false;
let isDirty = false;

document.addEventListener('DOMContentLoaded', async () => {
    const session = await requireAuth();
    if (!session) return;
    setupPublicLink();
    setupCollapsibles();
    buildThemeGrid();
    await loadEditorData();
    setupStaticListeners();
    setupDirtyTracking();
});

function setupPublicLink() {
    const url = window.location.origin + '/index.html';
    document.getElementById('public-link-url').textContent = url;
    document.getElementById('copy-link-btn').addEventListener('click', () => {
        navigator.clipboard.writeText(url).then(() => showToast('Link kopiert!', 'success'));
    });
}

function setupCollapsibles() {
    document.querySelectorAll('.collapsible-trigger').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const targetId = trigger.dataset.target;
            const body = document.getElementById(targetId);
            if (!body) return;
            const isCollapsed = body.classList.contains('is-collapsed');
            body.classList.toggle('is-collapsed', !isCollapsed);
            trigger.classList.toggle('is-open', isCollapsed);
        });
    });
}

function setupDirtyTracking() {
    document.querySelector('.editor-main').addEventListener('input', () => { isDirty = true; });
    document.querySelector('.editor-main').addEventListener('change', () => { isDirty = true; });
}

function getThemeById(id) {
    return THEMES.find(t => t.id === id) || THEMES[0];
}

function applyTileStyle(el, themeId) {
    const theme = getThemeById(themeId);
    el.removeAttribute('style');
    el.setAttribute('style', theme.tileStyle);
}

function buildThemeGrid() {
    const grid = document.getElementById('pd-grid');
    THEMES.forEach(theme => {
        const tile = document.createElement('button');
        tile.type = 'button';
        tile.className = 'pd-tile';
        tile.dataset.themeId = theme.id;
        tile.title = theme.label;

        const preview = document.createElement('div');
        preview.className = 'pd-tile-preview';
        preview.setAttribute('style', theme.tileStyle);

        const label = document.createElement('span');
        label.className = 'pd-tile-label';
        label.textContent = theme.label;

        tile.appendChild(preview);
        tile.appendChild(label);

        tile.addEventListener('click', () => {
            currentTheme = theme.id;
            updateCurrentTile();
            updateTileSelection();
            isDirty = true;
        });

        grid.appendChild(tile);
    });
}

function updateCurrentTile() {
    const tile = document.getElementById('pd-current-tile');
    const name = document.getElementById('pd-current-name');
    const theme = getThemeById(currentTheme);
    applyTileStyle(tile, currentTheme);
    name.textContent = theme.label;
}

function updateTileSelection() {
    document.querySelectorAll('.pd-tile').forEach(tile => {
        tile.classList.toggle('is-active', tile.dataset.themeId === currentTheme);
    });
}

function toggleDesignGrid() {
    designGridOpen = !designGridOpen;
    const gridWrap = document.getElementById('pd-grid-wrap');
    const row = document.getElementById('pd-row');
    const toggleBtn = document.getElementById('pd-toggle-btn');
    const changeBtn = document.getElementById('change-image-btn');

    gridWrap.classList.toggle('is-open', designGridOpen);
    row.classList.toggle('design-open', designGridOpen);
    toggleBtn.classList.toggle('is-open', designGridOpen);
    changeBtn.style.display = designGridOpen ? 'none' : '';
}

async function loadEditorData() {
    const client = await getAuthenticatedClient();
    const { data: { user } } = await client.auth.getUser();

    if (!user) { showToast('Nicht eingeloggt.', 'error'); return; }

    let { data, error } = await client
        .from('profiles')
        .select('id, tree_data')
        .eq('user_id', user.id)
        .limit(1)
        .single();

    if (error && error.code === 'PGRST116') {
        const empty = {
            theme: 'darkgreen',
            profile: { name: '', description: '', image: '' },
            socialIcons: [],
            videoModule: { isVisible: false, url: '', thumbnail: './icons/youtube.png', title: '', subtitle: '', buttonText: 'Jetzt ansehen' },
            links: [],
        };
        const { data: inserted, error: insertError } = await client
            .from('profiles')
            .insert({ user_id: user.id, tree_data: empty })
            .select('id, tree_data')
            .single();
        if (insertError) { showToast('Profil konnte nicht erstellt werden: ' + insertError.message, 'error'); return; }
        data = inserted;
    } else if (error) {
        showToast('Ladefehler: ' + error.message, 'error');
        return;
    }

    currentProfileId = data.id;
    const td = data.tree_data || {};

    currentTheme = td.theme || 'darkgreen';
    updateCurrentTile();
    updateTileSelection();
    populateProfile(td.profile || {});
    populateSocialIcons(td.socialIcons || []);
    populateVideoModule(td.videoModule || {});
    populateLinks(td.links || []);

    isDirty = false;
}

function populateProfile(profile) {
    document.getElementById('profile-name').value        = profile.name        || '';
    document.getElementById('profile-description').value = profile.description || '';
    currentImageUrl = profile.image || '';
    updateImagePreview(currentImageUrl);
}

function populateSocialIcons(icons) {
    const container = document.getElementById('social-icons-list');
    container.innerHTML = '';
    icons.forEach((icon, i) => appendSocialIconRow(container, icon, i));
}

function populateVideoModule(video) {
    document.getElementById('video-visible').checked  = video.isVisible  === true;
    document.getElementById('video-url').value        = video.url        || '';
    document.getElementById('video-title').value      = video.title      || '';
    document.getElementById('video-subtitle').value   = video.subtitle   || '';
    document.getElementById('video-btn-text').value   = video.buttonText || '';
    setIconSelect(document.getElementById('video-thumbnail'), video.thumbnail || '');
}

function populateLinks(links) {
    const container = document.getElementById('links-list');
    container.innerHTML = '';
    links.forEach((link, i) => appendLinkRow(container, link, i));
}

function appendSocialIconRow(container, data, index) {
    const row = document.createElement('div');
    row.className = 'editor-list-row';
    row.dataset.index = index;
    row.innerHTML = `
        <div class="row-icon-preview"><img src="${data.icon || ''}" alt=""></div>
        <div class="row-fields">
            <div class="field-group"><label>Icon</label>${buildIconSelect('social-icon-' + index, data.icon || '')}</div>
            <div class="field-group"><label>URL</label><input type="url" class="social-url" placeholder="https://..." value="${escHtml(data.url || '')}"></div>
        </div>
        <button type="button" class="row-remove-btn" title="Entfernen">✕</button>
    `;
    const previewImg = row.querySelector('.row-icon-preview img');
    const select = row.querySelector('select');
    select.addEventListener('change', () => { previewImg.style.opacity = '1'; previewImg.src = select.value; isDirty = true; });
    previewImg.addEventListener('error', () => { previewImg.style.opacity = '0'; });
    previewImg.addEventListener('load',  () => { previewImg.style.opacity = '1'; });
    row.querySelector('.row-remove-btn').addEventListener('click', () => { row.remove(); reindexRows(container, 'social-icon-'); isDirty = true; });
    container.appendChild(row);
}

function appendLinkRow(container, data, index) {
    const isVisible = data.isVisible !== false;
    const row = document.createElement('div');
    row.className = 'editor-list-row' + (isVisible ? '' : ' row-hidden');
    row.dataset.index = index;
    row.innerHTML = `
        <div class="row-icon-preview"><img src="${data.icon || ''}" alt=""></div>
        <div class="row-fields">
            <div class="field-group"><label>Icon</label>${buildIconSelect('link-icon-' + index, data.icon || '')}</div>
            <div class="field-group"><label>Link-Titel</label><input type="text" class="link-title" placeholder="z.B. Meine Webseite" value="${escHtml(data.title || '')}"></div>
            <div class="field-group"><label>URL</label><input type="url" class="link-url" placeholder="https://..." value="${escHtml(data.url || '')}"></div>
        </div>
        <div class="row-actions">
            <button type="button" class="row-move-btn" data-dir="up" title="Nach oben">↑</button>
            <button type="button" class="row-move-btn" data-dir="down" title="Nach unten">↓</button>
            <label class="toggle-switch row-visibility-toggle" title="${isVisible ? 'Sichtbar' : 'Ausgeblendet'}">
                <input type="checkbox" class="link-visible" ${isVisible ? 'checked' : ''}>
                <span class="toggle-slider"></span>
            </label>
            <button type="button" class="row-remove-btn" title="Entfernen">✕</button>
        </div>
    `;
    const previewImg = row.querySelector('.row-icon-preview img');
    const select = row.querySelector('select');
    select.addEventListener('change', () => { previewImg.style.opacity = '1'; previewImg.src = select.value; isDirty = true; });
    previewImg.addEventListener('error', () => { previewImg.style.opacity = '0'; });
    previewImg.addEventListener('load',  () => { previewImg.style.opacity = '1'; });
    row.querySelector('.link-visible').addEventListener('change', e => { row.classList.toggle('row-hidden', !e.target.checked); isDirty = true; });
    row.querySelector('.row-remove-btn').addEventListener('click', () => { row.remove(); reindexRows(container, 'link-icon-'); isDirty = true; });
    row.querySelectorAll('.row-move-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.dataset.dir === 'up' && row.previousElementSibling)  container.insertBefore(row, row.previousElementSibling);
            if (btn.dataset.dir === 'down' && row.nextElementSibling)    container.insertBefore(row.nextElementSibling, row);
            reindexRows(container, 'link-icon-');
            isDirty = true;
        });
    });
    container.appendChild(row);
}

function buildIconSelect(name, currentValue) {
    const knownMatch = AVAILABLE_ICONS.some(i => i.path === currentValue);
    const options = [];
    if (!knownMatch) {
        options.push(`<option value="${escHtml(currentValue)}" selected>${currentValue ? 'Aktuell: ' + currentValue : '– Icon wählen –'}</option>`);
    } else {
        options.push(`<option value="">– Icon wählen –</option>`);
    }
    AVAILABLE_ICONS.forEach(icon => {
        options.push(`<option value="${icon.path}" ${icon.path === currentValue ? 'selected' : ''}>${icon.label}</option>`);
    });
    return `<select name="${name}">${options.join('')}</select>`;
}

function setIconSelect(selectEl, value) {
    for (const opt of selectEl.options) {
        if (opt.value === value) { selectEl.value = value; return; }
    }
}

function reindexRows(container, prefix) {
    container.querySelectorAll('.editor-list-row').forEach((row, i) => {
        row.dataset.index = i;
        const select = row.querySelector('select');
        if (select) select.name = prefix + i;
    });
}

function updateImagePreview(url) {
    const preview = document.getElementById('profile-image-preview');
    const placeholder = document.getElementById('profile-img-placeholder');
    if (url) {
        preview.src = url;
        preview.style.display = 'block';
        placeholder.style.display = 'none';
    } else {
        preview.src = '';
        preview.style.display = 'none';
        placeholder.style.display = 'flex';
    }
}

function collectFormData() {
    const socialIcons = [];
    document.querySelectorAll('#social-icons-list .editor-list-row').forEach(row => {
        socialIcons.push({ icon: row.querySelector('select').value, url: row.querySelector('.social-url').value.trim() });
    });
    const links = [];
    document.querySelectorAll('#links-list .editor-list-row').forEach(row => {
        links.push({
            icon:      row.querySelector('select').value,
            title:     row.querySelector('.link-title').value.trim(),
            url:       row.querySelector('.link-url').value.trim(),
            isVisible: row.querySelector('.link-visible').checked,
        });
    });
    return {
        theme: currentTheme,
        profile: {
            name:        document.getElementById('profile-name').value.trim(),
            description: document.getElementById('profile-description').value.trim(),
            image:       currentImageUrl,
        },
        socialIcons,
        videoModule: {
            isVisible:  document.getElementById('video-visible').checked,
            url:        document.getElementById('video-url').value.trim(),
            thumbnail:  document.getElementById('video-thumbnail').value,
            title:      document.getElementById('video-title').value.trim(),
            subtitle:   document.getElementById('video-subtitle').value.trim(),
            buttonText: document.getElementById('video-btn-text').value.trim(),
        },
        links,
    };
}

async function saveData() {
    if (!currentProfileId) { showToast('Kein Profil geladen. Bitte mit echtem Login anmelden.', 'error'); return false; }
    const saveBtn = document.getElementById('save-btn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Speichert…';
    const treeData = collectFormData();
    const client = await getAuthenticatedClient();
    const { error } = await client.from('profiles').update({ tree_data: treeData }).eq('id', currentProfileId);
    saveBtn.disabled = false;
    saveBtn.textContent = 'Speichern';
    if (error) { showToast('Fehler: ' + error.message, 'error'); return false; }
    isDirty = false;
    showToast('Erfolgreich gespeichert!', 'success');
    return true;
}

async function handleImageUpload(file) {
    if (!file) return;
    showToast('Bild wird hochgeladen…', 'loading');
    const client = await getAuthenticatedClient();
    const ext = file.name.split('.').pop();
    const { data, error } = await client.storage.from('visitenkarte').upload('profile-' + Date.now() + '.' + ext, file, { upsert: true });
    if (error) { showToast('Upload fehlgeschlagen: ' + error.message, 'error'); return; }
    const { data: urlData } = client.storage.from('visitenkarte').getPublicUrl(data.path);
    currentImageUrl = urlData.publicUrl;
    updateImagePreview(currentImageUrl);
    isDirty = true;
    showToast('Bild hochgeladen!', 'success');
}

function showToast(message, type) {
    const toast = document.getElementById('save-toast');
    toast.textContent = message;
    toast.className = 'save-toast visible ' + type;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.className = 'save-toast'; }, 3500);
}

function setupStaticListeners() {
    document.getElementById('save-btn').addEventListener('click', saveData);
    document.getElementById('preview-btn').addEventListener('click', () => {
        localStorage.setItem('visitenkarte_preview', JSON.stringify(collectFormData()));
        window.open('./vorschau.html', '_blank');
    });
    document.getElementById('logout-btn').addEventListener('click', () => {
        if (!isDirty) { logoutUser(); return; }
        document.getElementById('logout-dialog').showModal();
    });
    document.getElementById('dialog-cancel-btn').addEventListener('click', () => { document.getElementById('logout-dialog').close(); });
    document.getElementById('dialog-logout-btn').addEventListener('click', () => { logoutUser(); });
    document.getElementById('dialog-save-logout-btn').addEventListener('click', async () => { if (await saveData() !== false) logoutUser(); });
    document.getElementById('pd-toggle-btn').addEventListener('click', toggleDesignGrid);
    document.getElementById('change-image-btn').addEventListener('click', () => { document.getElementById('profile-image-upload').click(); });
    document.getElementById('profile-image-upload').addEventListener('change', e => { if (e.target.files[0]) handleImageUpload(e.target.files[0]); });
    document.getElementById('add-social-btn').addEventListener('click', () => {
        const c = document.getElementById('social-icons-list');
        appendSocialIconRow(c, { icon: '', url: '' }, c.children.length);
        isDirty = true;
    });
    document.getElementById('add-link-btn').addEventListener('click', () => {
        const c = document.getElementById('links-list');
        const body = document.getElementById('links-body');
        if (body.classList.contains('is-collapsed')) {
            body.classList.remove('is-collapsed');
            document.querySelector('[data-target="links-body"]').classList.add('is-open');
        }
        appendLinkRow(c, { icon: '', title: '', url: '', isVisible: true }, c.children.length);
        isDirty = true;
    });
}

function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
