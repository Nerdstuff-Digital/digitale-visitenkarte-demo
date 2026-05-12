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
    { id: 'darkgreen', label: 'Dark Green', tileStyle: 'background-color:#0d1f15; border:2px solid #d4c6a9; background-image:linear-gradient(to bottom,rgba(255,255,255,0.05) 0%,transparent 100%);' },
    { id: 'light', label: 'Light', tileStyle: 'background:linear-gradient(135deg,#f5f7fa 0%,#c3cfe2 100%); border:2px solid rgba(0,0,0,0.05);' },
    { id: 'dark-minimal', label: 'Dark Minimal', tileStyle: 'background-color:#0a0a0a; border:1px solid #333; box-shadow: inset 0 0 10px rgba(255,255,255,0.02);' },
    { id: 'cyberpunk', label: 'Cyberpunk', tileStyle: 'background-color:#050508; border:2px solid #00f3ff; background-image:linear-gradient(rgba(0,243,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,243,255,0.1) 1px,transparent 1px); background-size:10px 10px; box-shadow:0 0 8px #ff00ff;' },
    { id: 'cosplay', label: 'Cosplay', tileStyle: 'background:linear-gradient(-45deg,#ffb8d1,#e2b0ff,#9fb8ff); border:2px solid #fff; box-shadow: 0 0 10px rgba(255,255,255,0.8);' },
    { id: 'fantasy', label: 'Fantasy', tileStyle: 'background-color:#140f0c; border:3px double #d4af37; background-image:radial-gradient(circle at center,#1f1813 0%,#0b0908 80%); box-shadow: 0 0 10px rgba(212,175,55,0.3);' },
    { id: 'bricks', label: 'Bricks', tileStyle: 'background-color:#e53935; border:2px solid #b71c1c; background-image:radial-gradient(rgba(0,0,0,0.2) 20%,transparent 25%); background-size:12px 12px; background-position: 6px 6px;' },
    { id: 'arcade', label: 'Arcade', tileStyle: 'background-color:#000; border:3px solid #1a1a1a; background-image:linear-gradient(rgba(0,229,255,0.1) 1px,transparent 1px); background-size:100% 3px; box-shadow: 3px 3px 0 #e91e63;' },
    { id: 'tcg', label: 'TCG', tileStyle: 'background-color:#161b22; border:2px solid #a8b2bd; background-image:linear-gradient(115deg,transparent 20%,rgba(0,255,255,0.2) 40%,rgba(255,0,255,0.2) 60%,transparent 80%);' },
    { id: 'manga', label: 'Manga', tileStyle: 'background-color:#fff; border:2px solid #000; background-image:radial-gradient(#ccc 15%,transparent 16%); background-size:6px 6px; box-shadow: 4px 4px 0 #e60000;' },
    { id: 'steampunk', label: 'Steampunk', tileStyle: 'background-color:#2b1d14; border:2px solid #b58231; background-image:radial-gradient(circle at 10px 10px, #1f140d 2px, #e6c27a 3px, transparent 4px); background-size: 100% 100%; box-shadow: inset 0 0 15px #000;' },
    { id: 'hacker', label: 'Hacker', tileStyle: 'background-color:#000; border:1px solid #00ff41; background-image:linear-gradient(rgba(0,255,65,0.1) 1px,transparent 1px); background-size:100% 2px; color:#00ff41; font-family:monospace; font-size:4px;' },
    { id: 'tabletop', label: 'Tabletop', tileStyle: 'background-color:#f9f6f0; border:2px solid #2d2a26; background-image:linear-gradient(rgba(45,42,38,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(45,42,38,0.05) 1px,transparent 1px); background-size:10px 10px; border-radius:2px 8px;' }
];
const ALLOWED_FONTS = ['', "'Courier New', Courier, monospace", "'Comic Sans MS', cursive", "'Impact', fantasy"];
let currentProfileId = null;
let currentImageUrl = '';
let currentTheme = 'darkgreen';
let designGridOpen = false;
let isDirty = false;
let currentUser = null; 
let usernameToastTimer = null;
let uploadInProgress = false;
let saveInFlight = false;
let intentionalNavigation = false;

function getPublicUrl() {
    const username = document.getElementById('profile-username')?.value?.trim();
    if (!username) return null;
    return window.location.origin + '/u/' + username;
}
function updatePublicLinkDisplay() {
    const url = getPublicUrl();
    document.getElementById('public-link-url').textContent = url || 'Erst Link-Namen setzen und speichern';
}
function validateUsername(username) {
    if (!username) return 'Link-Name darf nicht leer sein.';
    if (username.length < 3) return 'Mindestens 3 Zeichen.';
    if (username.length > 30) return 'Maximal 30 Zeichen.';
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(username)) return 'Nur Kleinbuchstaben, Zahlen und Bindestriche (nicht am Anfang/Ende).';
    return null;
}
function autoGenerateUsername(email) {
    const base = email.split('@')[0].toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '').substring(0, 20);
    const arr = new Uint8Array(6);
    crypto.getRandomValues(arr);
    const suffix = Array.from(arr).map(b => b.toString(36)).join('').substring(0, 8);
    return (base.length > 0 ? base + '-' : 'user-') + suffix;
}
function normalizeRichText(html) {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.body.querySelectorAll('span[style*="font-weight"]').forEach(s => {
        const b = doc.createElement('b'); b.innerHTML = s.innerHTML; s.replaceWith(b);
    });
    doc.body.querySelectorAll('span[style*="font-style: italic"]').forEach(s => {
        const i = doc.createElement('i'); i.innerHTML = s.innerHTML; s.replaceWith(i);
    });
    return sanitizeHTML(doc.body.innerHTML);
}
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
    updatePublicLinkDisplay();
    document.getElementById('copy-link-btn').addEventListener('click', () => {
        const url = getPublicUrl();
        if (!url) { showToast('Erst Link-Namen setzen.', 'error'); return; }
        navigator.clipboard.writeText(url).then(() => showToast('Link kopiert!', 'success')).catch(() => showToast('Kopieren fehlgeschlagen.', 'error'));
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
function setDirty(state) {
    isDirty = state;
    const saveBtn = document.getElementById('save-btn');
    if (state) {
        saveBtn.classList.add('has-changes');
        saveBtn.textContent = 'Speichern *';
    } else {
        saveBtn.classList.remove('has-changes');
        saveBtn.textContent = 'Speichern';
    }
}
function setupDirtyTracking() {
    const main = document.querySelector('.editor-main');
    main.addEventListener('input', () => setDirty(true));
    main.addEventListener('change', () => setDirty(true));
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
            setDirty(true);
        });
        grid.appendChild(tile);
    });
}
function updateCurrentTile() {
    const tile = document.getElementById('pd-current-tile');
    const name = document.getElementById('pd-current-name');
    const theme = getThemeById(currentTheme);
    applyTileStyle(tile, currentTheme);
    if(name) name.textContent = theme.label;
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
    const imageActions = document.querySelector('.pd-profile-actions');
    const imagePosWrapper = document.getElementById('profile-image-pos-wrapper');
    gridWrap.classList.toggle('is-open', designGridOpen);
    row.classList.toggle('design-open', designGridOpen);
    toggleBtn.classList.toggle('is-open', designGridOpen);
    imageActions.style.display = designGridOpen ? 'none' : 'flex';
    imagePosWrapper.classList.add('is-collapsed');
}
async function loadEditorData() {
    const side = document.querySelector('.pd-design-side');
    try {
        const client = await getAuthenticatedClient();
        const { data: { user } } = await client.auth.getUser();
        if (!user) { showToast('Nicht eingeloggt.', 'error'); return; }
        currentUser = user;
        let { data, error } = await client.from('profiles').select('id, tree_data, username').eq('user_id', user.id).limit(1).single();
        if (error && error.code === 'PGRST116') {
            const generatedUsername = autoGenerateUsername(user.email || '');
            const empty = { theme: 'darkgreen', profile: { name: '', description: '', descFont: '', image: '', imagePos: 50 }, socialIcons: [], videoModule: { isVisible: false, url: '', thumbnail: './icons/youtube.png', title: '', subtitle: '', buttonText: 'Jetzt ansehen' }, links: [] };
            const { data: inserted, error: insertError } = await client.from('profiles').insert({ user_id: user.id, username: generatedUsername, tree_data: empty }).select('id, tree_data, username').single();
            if (insertError) {
                if (insertError.code === '23505') { 
                    const { data: retryData, error: retryErr } = await client.from('profiles').select('id, tree_data, username').eq('user_id', user.id).limit(1).single();
                    if (retryErr) {
                        showToast('Fehler bei der Konto-Einrichtung. Bitte Seite neu laden.', 'error');
                        return;
                    }
                    data = retryData;
                }
                else { 
                    showToast('Profil konnte nicht erstellt werden: ' + insertError.message, 'error'); 
                    return; 
                }
            } else {
                data = inserted;
            }
        } else if (error) {
            showToast('Ladefehler: ' + error.message, 'error');
            return;
        }
        currentProfileId = data.id;
        const td = data.tree_data || {};
        document.getElementById('profile-username').value = data.username || '';
        updatePublicLinkDisplay();
        currentTheme = td.theme || 'darkgreen';
        updateCurrentTile();
        updateTileSelection();
        populateProfile(td.profile || {});
        populateSocialIcons(td.socialIcons || []);
        populateVideoModule(td.videoModule || {});
        populateLinks(td.links || []);
        setDirty(false);
    } catch (err) {
        // Jede Exception (Netzwerk, JWT, RLS) – sonst hängt der Skeleton-Block für immer
        showToast('Profil konnte nicht geladen werden: ' + (err.message || err), 'error');
    } finally {
        if (side) {
            side.querySelector('.pd-skeleton-text')?.remove();
            const wrap = side.querySelector('.pd-current-wrap');
            const nameBtn = side.querySelector('.pd-name-btn');
            if (wrap) wrap.style.display = '';
            if (nameBtn) nameBtn.style.display = '';
            side.style.visibility = 'visible';
            side.style.background = '';
            side.style.minHeight = '';
        }
    }
}
function populateProfile(profile) {
    if (typeof DOMPurify === 'undefined') {
        showToast('Sicherheits-Modul (DOMPurify) konnte nicht geladen werden. Bitte Seite neu laden.', 'error');
        document.querySelectorAll('input, button, select, [contenteditable]').forEach(el => el.disabled = true);
        return;
    }
    document.getElementById('profile-name').value = profile.name || '';
    const descField = document.getElementById('profile-description');
    if (descField) {
        descField.innerHTML = sanitizeHTML(profile.description || '');
        const fontSelect = document.getElementById('tool-font');
        const safeFont = ALLOWED_FONTS.includes(profile.descFont || '') ? (profile.descFont || '') : '';
        if (fontSelect) fontSelect.value = safeFont;
        descField.style.fontFamily = safeFont;
    }
    currentImageUrl = profile.image || '';
    updateImagePreview(currentImageUrl);
    const posField = document.getElementById('profile-image-pos');
    if (posField) {
        posField.value = profile.imagePos !== undefined ? profile.imagePos : 50;
        document.getElementById('profile-image-preview').style.objectPosition = `center ${posField.value}%`;
    }
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
        <div class="row-icon-preview"><img alt=""></div>
        <div class="row-fields">
            <div class="field-group"><label>Icon</label>${buildIconSelect('social-icon-' + index, data.icon || '')}</div>
            <div class="field-group"><label>URL</label><input type="url" class="social-url" placeholder="https://..."></div>
        </div>
        <button type="button" class="row-remove-btn" title="Entfernen">✕</button>
    `;
    const previewImg = row.querySelector('.row-icon-preview img');
    previewImg.src = getSafeImageUrl(data.icon || '');
    row.querySelector('.social-url').value = data.url || '';
    const select = row.querySelector('select');
    select.addEventListener('change', () => { previewImg.style.opacity = '1'; previewImg.src = getSafeImageUrl(select.value); setDirty(true); });
    previewImg.addEventListener('error', () => { previewImg.style.opacity = '0'; });
    previewImg.addEventListener('load',  () => { previewImg.style.opacity = '1'; });
    row.querySelector('.row-remove-btn').addEventListener('click', () => { row.remove(); reindexRows(container, 'social-icon-'); setDirty(true); });
    container.appendChild(row);
}
function appendLinkRow(container, data, index) {
    const isVisible = data.isVisible !== false;
    const row = document.createElement('div');
    row.className = 'editor-list-row' + (isVisible ? '' : ' row-hidden');
    row.dataset.index = index;
    row.innerHTML = `
        <div class="row-icon-preview"><img alt=""></div>
        <div class="row-fields">
            <div class="field-group"><label>Icon</label>${buildIconSelect('link-icon-' + index, data.icon || '')}</div>
            <div class="field-group"><label>Link-Titel</label><input type="text" class="link-title" placeholder="z.B. Meine Webseite"></div>
            <div class="field-group"><label>URL</label><input type="url" class="link-url" placeholder="https://..."></div>
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
    previewImg.src = getSafeImageUrl(data.icon || '');
    row.querySelector('.link-title').value = data.title || '';
    row.querySelector('.link-url').value = data.url || '';
    const select = row.querySelector('select');
    select.addEventListener('change', () => { previewImg.style.opacity = '1'; previewImg.src = getSafeImageUrl(select.value); setDirty(true); });
    previewImg.addEventListener('error', () => { previewImg.style.opacity = '0'; });
    previewImg.addEventListener('load',  () => { previewImg.style.opacity = '1'; });
    row.querySelector('.link-visible').addEventListener('change', e => { row.classList.toggle('row-hidden', !e.target.checked); setDirty(true); });
    row.querySelector('.row-remove-btn').addEventListener('click', () => { row.remove(); reindexRows(container, 'link-icon-'); setDirty(true); });
    row.querySelectorAll('.row-move-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.dataset.dir === 'up' && row.previousElementSibling)  container.insertBefore(row, row.previousElementSibling);
            if (btn.dataset.dir === 'down' && row.nextElementSibling)    container.insertBefore(row.nextElementSibling, row);
            reindexRows(container, 'link-icon-');
            setDirty(true);
        });
    });
    container.appendChild(row);
}
function buildIconSelect(name, currentValue) {
    const value = (currentValue || '').trim();
    const knownMatch = AVAILABLE_ICONS.some(i => i.path === value);
    const options = [];
    if (!knownMatch && value) {
        options.push(`<option value="" selected>– Unbekanntes Icon (bitte neu wählen) –</option>`);
    } else {
        options.push(`<option value="">– Icon wählen –</option>`);
    }
    AVAILABLE_ICONS.forEach(icon => {
        options.push(`<option value="${icon.path}" ${icon.path === value ? 'selected' : ''}>${icon.label}</option>`);
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
    const removeBtn = document.getElementById('remove-image-btn');
    if (url) {
        preview.src = url;
        preview.style.display = 'block';
        placeholder.style.display = 'none';
        if(removeBtn) removeBtn.style.display = 'block';
    } else {
        preview.src = '';
        preview.style.display = 'none';
        placeholder.style.display = 'flex';
        if(removeBtn) removeBtn.style.display = 'none';
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
    const descField = document.getElementById('profile-description');
    const fontSelect = document.getElementById('tool-font');
    const posField = document.getElementById('profile-image-pos');
    return {
        theme: currentTheme,
        profile: {
            name:        document.getElementById('profile-name').value.trim(),
            description: descField ? normalizeRichText(descField.innerHTML) : '',
            descFont:    fontSelect ? fontSelect.value : '',
            image:       currentImageUrl,
            imagePos:    posField ? parseInt(posField.value) : 50,
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
    if (saveInFlight) return false;
    if (!currentProfileId || !currentUser) { showToast('Kein Profil geladen.', 'error'); return false; }
    saveInFlight = true;
    const usernameInput = document.getElementById('profile-username');
    const username = usernameInput.value.trim().toLowerCase().replace(/^-+|-+$/g, '');
    usernameInput.value = username; 
    const usernameError = validateUsername(username);
    if (usernameError) { showToast(usernameError, 'error'); saveInFlight = false; return false; }
    const saveBtn = document.getElementById('save-btn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Speichert…';
    let userTypedDuringSave = false;
    const dirtyDuringSave = () => { userTypedDuringSave = true; };
    const main = document.querySelector('.editor-main');
    main.addEventListener('input', dirtyDuringSave);
    main.addEventListener('change', dirtyDuringSave);
    try {
        const snapshot = collectFormData();
        const client = await getAuthenticatedClient();
        const { error } = await client.from('profiles').update({ tree_data: snapshot, username }).eq('id', currentProfileId).eq('user_id', currentUser.id);
        if (error) {
            setDirty(true);
            if (error.code === '23505') showToast('Dieser Link-Name ist bereits vergeben.', 'error');
            else showToast('Fehler: ' + error.message, 'error');
            return false;
        }
        if (!userTypedDuringSave) {
            setDirty(false);
            sessionStorage.removeItem('visitenkarte_preview');
        }
        updatePublicLinkDisplay();
        showToast('Erfolgreich gespeichert!', 'success');
        return true;
    } catch (err) {
        setDirty(true);
        showToast('Netzwerkfehler beim Speichern: ' + (err.message || err), 'error');
        return false;
    } finally {
        main.removeEventListener('input', dirtyDuringSave);
        main.removeEventListener('change', dirtyDuringSave);
        saveBtn.disabled = false;
        if (saveBtn.textContent === 'Speichert…') {
            saveBtn.textContent = isDirty ? 'Speichern *' : 'Speichern';
        }
        saveInFlight = false;
    }
}
async function handleImageUpload(file) {
    if (uploadInProgress) { showToast('Bitte warten – Upload läuft.', 'error'); return; }
    if (!file || !currentUser) return;
    const MAX_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_BYTES) { showToast('Bild ist zu groß (max. 5 MB).', 'error'); return; }
    const allowed = ['jpg', 'jpeg', 'png', 'gif'];
    const ext = file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) { showToast('Nur JPG, PNG und GIF erlaubt.', 'error'); return; }
    uploadInProgress = true;
    const removeBtn = document.getElementById('remove-image-btn');
    if (removeBtn) removeBtn.disabled = true;
    showToast('Bild wird hochgeladen…', 'loading');
    try {
        const client = await getAuthenticatedClient();
        const newPath = `${currentUser.id}/profile-${Date.now()}.${ext}`;
        const { data: uploaded, error: upErr } = await client.storage.from('visitenkarte').upload(newPath, file, { upsert: true });
        if (upErr) { showToast('Upload fehlgeschlagen: ' + upErr.message, 'error'); return; }
        const { data: urlData } = client.storage.from('visitenkarte').getPublicUrl(uploaded.path);
        currentImageUrl = urlData.publicUrl;
        updateImagePreview(currentImageUrl);
        setDirty(true);
        try {
            const { data: oldFiles } = await client.storage.from('visitenkarte').list(currentUser.id, { limit: 1000 });
            const stale = (oldFiles || []).filter(f => `${currentUser.id}/${f.name}` !== uploaded.path);
            if (stale.length) {
                await client.storage.from('visitenkarte').remove(stale.map(f => `${currentUser.id}/${f.name}`));
            }
        } catch (cleanupErr) { console.warn('Storage cleanup fehlgeschlagen:', cleanupErr); }
        showToast('Bild hochgeladen!', 'success');
    } catch (err) {
        // Echte Exception (Offline, CORS, abgebrochener Request) – Loading-Toast überschreiben
        showToast('Netzwerkfehler beim Upload: ' + (err.message || err), 'error');
    } finally {
        uploadInProgress = false;
        if (removeBtn) removeBtn.disabled = false;
        // File-Input zurücksetzen, damit der User dieselbe Datei erneut wählen kann
        const fileInput = document.getElementById('profile-image-upload');
        if (fileInput) fileInput.value = '';
    }
}
function showToast(message, type) {
    const toast = document.getElementById('save-toast');
    toast.textContent = message;
    toast.className = 'save-toast visible ' + type;
    clearTimeout(toast._timer);
    toast._timer = null;
    // Loading-Toasts bleiben unendlich stehen, bis ein Success/Error-Toast sie überschreibt
    if (type !== 'loading') {
        toast._timer = setTimeout(() => { toast.className = 'save-toast'; }, 3500);
    }
}
function setupStaticListeners() {
    document.getElementById('save-btn').addEventListener('click', saveData);
    document.getElementById('preview-btn').addEventListener('click', () => {
        if (isDirty) sessionStorage.setItem('visitenkarte_preview', JSON.stringify(collectFormData()));
        else sessionStorage.removeItem('visitenkarte_preview');
        window.open('./vorschau.html', '_blank');
    });
    document.getElementById('logout-btn').addEventListener('click', () => {
        if (!isDirty) { logoutUser(); return; }
        document.getElementById('logout-dialog').showModal();
    });
    document.getElementById('dialog-cancel-btn').addEventListener('click', () => { document.getElementById('logout-dialog').close(); });
    document.getElementById('dialog-logout-btn').addEventListener('click', () => { intentionalNavigation = true; logoutUser(); });
    document.getElementById('dialog-save-logout-btn').addEventListener('click', async () => { 
        document.getElementById('logout-dialog').close();
        const ok = await saveData();
        if (ok !== false) { intentionalNavigation = true; logoutUser(); return; }
        document.getElementById('logout-dialog').showModal();
    });
    document.getElementById('pd-toggle-btn').addEventListener('click', toggleDesignGrid);
    document.getElementById('change-image-btn').addEventListener('click', () => { document.getElementById('profile-image-upload').click(); });
    document.getElementById('remove-image-btn').addEventListener('click', async () => {
        if (uploadInProgress || !currentUser) return;
        currentImageUrl = '';
        updateImagePreview('');
        setDirty(true);
        // 'success' statt 'loading' – sonst bliebe der Toast unendlich stehen (Fix-Effekt von showToast)
        showToast('Klicke „Speichern“, damit das Bild auch öffentlich verschwindet.', 'success');
        try {
            const client = await getAuthenticatedClient();
            const { data: files } = await client.storage.from('visitenkarte').list(currentUser.id, { limit: 1000 });
            if (files && files.length) { await client.storage.from('visitenkarte').remove(files.map(f => `${currentUser.id}/${f.name}`)); }
        } catch (err) { console.warn('Bild konnte im Storage nicht gelöscht werden:', err); }
    });
    const deleteAccBtn = document.getElementById('delete-account-btn');
    const deleteDialog = document.getElementById('delete-account-dialog');
    const deleteConfirmInput = document.getElementById('delete-confirm-input');
    const deleteConfirmBtn = document.getElementById('delete-confirm-btn');
    const deleteCancelBtn = document.getElementById('delete-cancel-btn');
    if (deleteAccBtn && deleteDialog) {
        deleteAccBtn.addEventListener('click', () => {
            if (!currentUser) { showToast('Profil wird noch geladen.', 'error'); return; }
            deleteConfirmInput.value = '';
            deleteConfirmBtn.disabled = true;
            deleteDialog.showModal();
        });
        deleteConfirmInput.addEventListener('input', e => { deleteConfirmBtn.disabled = e.target.value !== 'LÖSCHEN'; });
        deleteCancelBtn.addEventListener('click', () => deleteDialog.close());
        deleteConfirmBtn.addEventListener('click', async () => {
            if (deleteConfirmBtn.disabled) return;
            deleteConfirmBtn.disabled = true;
            deleteCancelBtn.disabled = true;
            deleteConfirmBtn.textContent = 'Wird gelöscht…';
            let success = false;
            try {
                const client = await getAuthenticatedClient();
                const { error: rpcErr } = await client.rpc('delete_my_account');
                if (rpcErr) throw rpcErr;
                try {
                    const { data: files } = await client.storage.from('visitenkarte').list(currentUser.id, { limit: 1000 });
                    if (files?.length) await client.storage.from('visitenkarte').remove(files.map(f => `${currentUser.id}/${f.name}`));
                } catch (cleanupErr) { console.warn('Storage cleanup fehlgeschlagen:', cleanupErr); }
                deleteDialog.close();
                showToast('Konto unwiderruflich gelöscht.', 'success');
                intentionalNavigation = true;
                success = true;
                setTimeout(() => logoutUser(), 1200);
            } catch (err) {
                // Jede Art von Exception (Netzwerkfehler, JWT abgelaufen, RPC fehlt)
                showToast('Fehler beim Löschen: ' + (err.message || err), 'error');
            } finally {
                // Bei Erfolg: Button bleibt disabled, bis logoutUser greift (verhindert Doppelklick im 1.2s-Fenster).
                // Bei Misserfolg: Button + Cancel wieder freigeben, damit der User reagieren kann.
                if (!success) {
                    deleteConfirmBtn.disabled = false;
                    deleteCancelBtn.disabled = false;
                    deleteConfirmBtn.textContent = 'Konto löschen';
                }
            }
        });
    }
    document.getElementById('toggle-image-settings-btn').addEventListener('click', () => { document.getElementById('profile-image-pos-wrapper').classList.toggle('is-collapsed'); });
    document.getElementById('profile-image-upload').addEventListener('change', e => { if (e.target.files[0]) handleImageUpload(e.target.files[0]); });
    document.getElementById('add-social-btn').addEventListener('click', () => {
        const c = document.getElementById('social-icons-list');
        const body = document.getElementById('social-body');
        if (body.classList.contains('is-collapsed')) {
            body.classList.remove('is-collapsed');
            document.querySelector('[data-target="social-body"]').classList.add('is-open');
        }
        appendSocialIconRow(c, { icon: '', url: '' }, c.children.length);
        setDirty(true);
    });
    document.getElementById('add-link-btn').addEventListener('click', () => {
        const c = document.getElementById('links-list');
        const body = document.getElementById('links-body');
        if (body.classList.contains('is-collapsed')) {
            body.classList.remove('is-collapsed');
            document.querySelector('[data-target="links-body"]').classList.add('is-open');
        }
        appendLinkRow(c, { icon: '', title: '', url: '', isVisible: true }, c.children.length);
        setDirty(true);
    });
    document.getElementById('profile-username').addEventListener('input', e => {
        const raw = e.target.value;
        const cleaned = raw.toLowerCase().replace(/[^a-z0-9-]/g, '');
        if (cleaned !== raw) {
            clearTimeout(usernameToastTimer);
            usernameToastTimer = setTimeout(() => showToast('Nur a-z, 0-9 und „-“ erlaubt.', 'error'), 400);
        }
        e.target.value = cleaned;
        updatePublicLinkDisplay();
        setDirty(true);
    });
    document.getElementById('profile-username').addEventListener('blur', e => {
        e.target.value = e.target.value.replace(/^-+|-+$/g, '');
        updatePublicLinkDisplay();
    });
    const posField = document.getElementById('profile-image-pos');
    if (posField) { posField.addEventListener('input', (e) => { document.getElementById('profile-image-preview').style.objectPosition = `center ${e.target.value}%`; setDirty(true); }); }
    const toolBold = document.getElementById('tool-bold');
    if (toolBold) {
        toolBold.addEventListener('mousedown', (e) => { e.preventDefault(); });
        toolBold.addEventListener('click', () => { try { document.execCommand('bold', false, null); setDirty(true); } catch(e){} });
    }
    const toolItalic = document.getElementById('tool-italic');
    if (toolItalic) {
        toolItalic.addEventListener('mousedown', (e) => { e.preventDefault(); });
        toolItalic.addEventListener('click', () => { try { document.execCommand('italic', false, null); setDirty(true); } catch(e){} });
    }
    const toolFont = document.getElementById('tool-font');
    if (toolFont) {
        toolFont.addEventListener('change', (e) => {
            const v = ALLOWED_FONTS.includes(e.target.value) ? e.target.value : '';
            const descField = document.getElementById('profile-description');
            if (descField) descField.style.fontFamily = v;
            e.target.value = v;
            setDirty(true);
        });
    }
    const descField = document.getElementById('profile-description');
    if (descField) { descField.addEventListener('input', () => setDirty(true)); }
    window.addEventListener('beforeunload', (e) => { if (!intentionalNavigation && isDirty) { e.preventDefault(); e.returnValue = ''; } });
    document.addEventListener('click', (e) => {
        if (!designGridOpen) return;
        const wrap = document.getElementById('pd-grid-wrap');
        const btn  = document.getElementById('pd-toggle-btn');
        if (wrap && !wrap.contains(e.target) && btn && !btn.contains(e.target)) toggleDesignGrid();
    });
}
function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}