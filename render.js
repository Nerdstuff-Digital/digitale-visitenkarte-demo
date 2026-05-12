function getSafeUrl(url) {
    if (!url) return null;
    const lowerUrl = url.trim().toLowerCase();
    if (lowerUrl.startsWith('http://') || lowerUrl.startsWith('https://') || lowerUrl.startsWith('mailto:') || lowerUrl.startsWith('tel:')) {
        return url.trim();
    }
    return null;
}

function getSafeImageUrl(url) {
    if (!url) return '';
    const trimmed = url.trim();
    const lower = trimmed.toLowerCase();
    if (lower.startsWith('//')) return '';
    if (lower.startsWith('https://') || 
        lower.startsWith('http://')  || 
        lower.startsWith('./')       || 
        lower.startsWith('/')        || 
        !/^[a-z]+:/.test(lower)) {
        return trimmed;
    }
    return '';
}

function sanitizeHTML(str) {
    if (!str) return '';
    
    if (typeof DOMPurify === 'undefined') {
        return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    
    const ALLOWED_CSS_PROPS = new Set([
        'font-weight', 'font-style', 'font-family', 'font-size',
        'text-decoration', 'text-align', 'color'
    ]);
    
    const hookFn = (node, evt) => {
        if (evt.attrName !== 'style') return;
        const safeParts = (evt.attrValue || '').split(';').map(s => s.trim()).filter(Boolean)
            .filter(decl => {
                const prop = decl.split(':')[0].trim().toLowerCase();
                if (!ALLOWED_CSS_PROPS.has(prop)) return false;
                const val = decl.split(':').slice(1).join(':').toLowerCase();
                return !/url\s*\(|expression|behavior|@import|<|>/.test(val);
            });
        evt.attrValue = safeParts.join('; ');
        if (!evt.attrValue) evt.keepAttr = false;
    };
    
    DOMPurify.addHook('uponSanitizeAttribute', hookFn);
    try {
        return DOMPurify.sanitize(str, { 
            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'div', 'br', 'span'], 
            ALLOWED_ATTR: ['style'] 
        });
    } finally {
        DOMPurify.removeHook('uponSanitizeAttribute');
    }
}

function renderProfile(profile) {
    const container = document.getElementById('profile-container');
    if (!container || !profile) return;

    if (profile.image) {
        const safeImg = getSafeImageUrl(profile.image);
        if (safeImg) {
            const img = document.createElement('img');
            img.src = safeImg;
            img.alt = profile.name || '';
            img.classList.add('linktree-logo');
            const rawPos = parseInt(profile.imagePos);
            const pos = Number.isFinite(rawPos) ? Math.max(0, Math.min(100, rawPos)) : 50;
            img.style.objectPosition = `center ${pos}%`;
            container.appendChild(img);
        }
    }

    if (profile.name) {
        const h1 = document.createElement('h1');
        h1.textContent = profile.name;
        h1.classList.add('linktree-title');
        container.appendChild(h1);
    }

    if (profile.description) {
        const p = document.createElement('p');
        p.innerHTML = sanitizeHTML(profile.description);
        p.classList.add('linktree-desc');
        if (profile.descFont) {
            const ALLOWED_FONTS = ['', "'Courier New', Courier, monospace", "'Comic Sans MS', cursive", "'Impact', fantasy"];
            if (ALLOWED_FONTS.includes(profile.descFont)) {
                p.style.fontFamily = profile.descFont;
            }
        }
        container.appendChild(p);
    }
}

function renderSocialIcons(icons) {
    const container = document.getElementById('profile-container');
    if (!container || !Array.isArray(icons) || icons.length === 0) return;

    const validIcons = icons.filter(i => i.url || i.icon);
    if (validIcons.length === 0) return;

    const row = document.createElement('div');
    row.classList.add('social-icons-row');

    validIcons.forEach(iconData => {
        const safeUrl = getSafeUrl(iconData.url);
        const a = document.createElement(safeUrl ? 'a' : 'div');
        if (safeUrl) {
            a.href = safeUrl;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
        }
        a.classList.add('social-icon');
        if (iconData.icon) {
            const safeImg = getSafeImageUrl(iconData.icon);
            if (safeImg) {
                const img = document.createElement('img');
                img.src = safeImg;
                img.alt = '';
                img.classList.add('custom-icon');
                a.appendChild(img);
            }
        }
        row.appendChild(a);
    });

    container.appendChild(row);
}

function renderVideoModule(videoModule) {
    const container = document.getElementById('video-container');
    if (!container || !videoModule || !videoModule.isVisible) return;

    const safeUrl = getSafeUrl(videoModule.url);
    const card = document.createElement(safeUrl ? 'a' : 'div');
    card.classList.add('featured-card');
    
    if (safeUrl) {
        card.href = safeUrl;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
    }

    if (videoModule.thumbnail) {
        const safeImg = getSafeImageUrl(videoModule.thumbnail);
        if (safeImg) {
            const wrapper = document.createElement('div');
            wrapper.classList.add('featured-icon-wrapper');
            const icon = document.createElement('img');
            icon.src = safeImg;
            icon.alt = '';
            icon.classList.add('featured-main-icon');
            wrapper.appendChild(icon);
            card.appendChild(wrapper);
        }
    }

    if (videoModule.title) {
        const title = document.createElement('div');
        title.classList.add('featured-title');
        title.textContent = videoModule.title;
        card.appendChild(title);
    }

    if (videoModule.subtitle) {
        const subtitle = document.createElement('div');
        subtitle.classList.add('featured-subtitle');
        subtitle.textContent = videoModule.subtitle;
        card.appendChild(subtitle);
    }

    if (videoModule.buttonText) {
        const btn = document.createElement('div');
        btn.classList.add('featured-action-btn');
        btn.textContent = videoModule.buttonText;
        card.appendChild(btn);
    }

    container.appendChild(card);
}

function renderLinks(links) {
    const container = document.getElementById('links-container');
    if (!container || !Array.isArray(links)) return;

    links.forEach(link => {
        if (link.isVisible === false) return;

        const safeUrl = getSafeUrl(link.url);
        const a = document.createElement(safeUrl ? 'a' : 'div');
        a.classList.add('linktree-btn');
        if (safeUrl) {
            a.href = safeUrl;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
        }

        const iconWrapper = document.createElement('div');
        iconWrapper.classList.add('link-icon');

        if (link.icon) {
            const safeImg = getSafeImageUrl(link.icon);
            if (safeImg) {
                const icon = document.createElement('img');
                icon.src = safeImg;
                icon.alt = '';
                icon.classList.add('custom-icon', 'button-icon');
                iconWrapper.appendChild(icon);
            }
        }

        const text = document.createElement('span');
        text.textContent = link.title || '';
        text.classList.add('btn-text');

        a.appendChild(iconWrapper);
        a.appendChild(text);
        container.appendChild(a);
    });
}