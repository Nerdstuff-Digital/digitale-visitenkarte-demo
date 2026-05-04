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

let currentProfileId = null;
let currentImageUrl = '';
let isDirty = false;

document.addEventListener('DOMContentLoaded', async () => {
    const session = await requireAuth();
    if (!session) return;
    setupPublicLink();
    setupCollapsibles();
    await loadEditorData();
    setupStaticListeners();
    setupDirtyTracking();
});

function setupPublicLink() {
    const url = window.location.origin + '/index.html';
    document.getElementById('public-link-url').textContent = url;
    document.getElementById('copy-link-btn').addEventListener('click', () => {
        navigator.clipboard.writeText(url).then(() => {
            showToast('Link kopiert!', 'success');
        });
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

async function loadEditorData() {
    const client = await getAuthenticatedClient();
    const { data, error } = await client
        .from('profiles')
        .select('id, tree_data')
        .limit(1)
        .single();

    if (error || !data) {
        showToast('Ladefehler: ' + (error ? error.message : 'Kein Datensatz gefunden'), 'error');
        return;
    }

    currentProfileId = data.id;
    const td = data.tree_data || {};

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
    document.getElementById('video-visible').checked = video.isVisible  === true;
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
        <div class="row-icon-preview">
            <img src="${data.icon || ''}" alt="">
        </div>
        <div class="row-fields">
            <div class="field-group">
                <label>Icon</label>
                ${buildIconSelect('social-icon-' + index, data.icon || '')}
            </div>
            <div class="field-group">
                <label>URL</label>
                <input type="url" class="social-url" placeholder="https://..." value="${escHtml(data.url || '')}">
            </div>
        </div>
        <button type="button" class="row-remove-btn" title="Entfernen">✕</button>
    `;
    const previewImg = row.querySelector('.row-icon-preview img');
    const select = row.querySelector('select');
    select.addEventListener('change', () => {
        previewImg.style.opacity = '1';
        previewImg.src = select.value;
        isDirty = true;
    });
    previewImg.addEventListener('error', () => { previewImg.style.opacity = '0'; });
    previewImg.addEventListener('load', () => { previewImg.style.opacity = '1'; });
    row.querySelector('.row-remove-btn').addEventListener('click', () => {
        row.remove();
        reindexRows(container, 'social-icon-');
        isDirty = true;
    });
    container.appendChild(row);
}

function appendLinkRow(container, data, index) {
    const isVisible = data.isVisible !== false;
    const row = document.createElement('div');
    row.className = 'editor-list-row' + (isVisible ? '' : ' row-hidden');
    row.dataset.index = index;
    row.innerHTML = `
        <div class="row-icon-preview">
            <img src="${data.icon || ''}" alt="">
        </div>
        <div class="row-fields">
            <div class="field-group">
                <label>Icon</label>
                ${buildIconSelect('link-icon-' + index, data.icon || '')}
            </div>
            <div class="field-group">
                <label>Link-Titel</label>
                <input type="text" class="link-title" placeholder="z.B. Meine Webseite" value="${escHtml(data.title || '')}">
            </div>
            <div class="field-group">
                <label>URL</label>
                <input type="url" class="link-url" placeholder="https://..." value="${escHtml(data.url || '')}">
            </div>
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
    select.addEventListener('change', () => {
        previewImg.style.opacity = '1';
        previewImg.src = select.value;
        isDirty = true;
    });
    previewImg.addEventListener('error', () => { previewImg.style.opacity = '0'; });
    previewImg.addEventListener('load', () => { previewImg.style.opacity = '1'; });
    const visibleToggle = row.querySelector('.link-visible');
    visibleToggle.addEventListener('change', () => {
        row.classList.toggle('row-hidden', !visibleToggle.checked);
        isDirty = true;
    });
    row.querySelector('.row-remove-btn').addEventListener('click', () => {
        row.remove();
        reindexRows(container, 'link-icon-');
        isDirty = true;
    });
    row.querySelectorAll('.row-move-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const dir = btn.dataset.dir;
            if (dir === 'up' && row.previousElementSibling) {
                container.insertBefore(row, row.previousElementSibling);
            } else if (dir === 'down' && row.nextElementSibling) {
                container.insertBefore(row.nextElementSibling, row);
            }
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
        const selected = icon.path === currentValue ? 'selected' : '';
        options.push(`<option value="${icon.path}" ${selected}>${icon.label}</option>`);
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
        socialIcons.push({
            icon: row.querySelector('select').value,
            url:  row.querySelector('.social-url').value.trim(),
        });
    });

    const links = [];
    document.querySelectorAll('#links-list .editor-list-row').forEach(row => {
        const visibleCheckbox = row.querySelector('.link-visible');
        links.push({
            icon:      row.querySelector('select').value,
            title:     row.querySelector('.link-title').value.trim(),
            url:       row.querySelector('.link-url').value.trim(),
            isVisible: visibleCheckbox ? visibleCheckbox.checked : true,
        });
    });

    return {
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
    if (!currentProfileId) {
        showToast('Kein Profil geladen. Bitte melde dich mit echten Zugangsdaten an.', 'error');
        return false;
    }
    const saveBtn = document.getElementById('save-btn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Speichert…';

    const treeData = collectFormData();
    const client = await getAuthenticatedClient();
    const { error } = await client
        .from('profiles')
        .update({ tree_data: treeData })
        .eq('id', currentProfileId);

    saveBtn.disabled = false;
    saveBtn.textContent = 'Speichern';

    if (error) {
        showToast('Fehler: ' + error.message, 'error');
        return false;
    }

    isDirty = false;
    showToast('Erfolgreich gespeichert!', 'success');
    return true;
}

async function handleImageUpload(file) {
    if (!file) return;
    showToast('Bild wird hochgeladen…', 'loading');
    const client = await getAuthenticatedClient();
    const ext = file.name.split('.').pop();
    const fileName = 'profile-' + Date.now() + '.' + ext;
    const { data, error } = await client.storage
        .from('visitenkarte')
        .upload(fileName, file, { upsert: true });

    if (error) {
        if (error.message && error.message.includes('row-level security')) {
            showToast('Bitte mit echtem Login anmelden für Uploads.', 'error');
        } else {
            showToast('Upload fehlgeschlagen: ' + error.message, 'error');
        }
        return;
    }

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
        const data = collectFormData();
        localStorage.setItem('visitenkarte_preview', JSON.stringify(data));
        window.open('./vorschau.html', '_blank');
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        if (!isDirty) { logoutUser(); return; }
        document.getElementById('logout-dialog').showModal();
    });

    document.getElementById('dialog-cancel-btn').addEventListener('click', () => {
        document.getElementById('logout-dialog').close();
    });

    document.getElementById('dialog-logout-btn').addEventListener('click', () => {
        logoutUser();
    });

    document.getElementById('dialog-save-logout-btn').addEventListener('click', async () => {
        const saved = await saveData();
        if (saved !== false) logoutUser();
    });

    document.getElementById('change-image-btn').addEventListener('click', () => {
        document.getElementById('profile-image-upload').click();
    });

    document.getElementById('profile-image-upload').addEventListener('change', e => {
        if (e.target.files[0]) handleImageUpload(e.target.files[0]);
    });

    document.getElementById('add-social-btn').addEventListener('click', () => {
        const container = document.getElementById('social-icons-list');
        appendSocialIconRow(container, { icon: '', url: '' }, container.children.length);
        isDirty = true;
    });

    document.getElementById('add-link-btn').addEventListener('click', () => {
        const container = document.getElementById('links-list');
        const body = document.getElementById('links-body');
        if (body.classList.contains('is-collapsed')) {
            body.classList.remove('is-collapsed');
            document.querySelector('[data-target="links-body"]').classList.add('is-open');
        }
        appendLinkRow(container, { icon: '', title: '', url: '', isVisible: true }, container.children.length);
        isDirty = true;
    });
}

function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}