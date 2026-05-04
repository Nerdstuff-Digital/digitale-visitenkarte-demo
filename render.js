function renderProfile(profile) {
    const container = document.getElementById('profile-container');
    if (!container || !profile) return;

    if (profile.image) {
        const img = document.createElement('img');
        img.src = profile.image;
        img.classList.add('linktree-logo');
        container.appendChild(img);
    }

    if (profile.name) {
        const h1 = document.createElement('h1');
        h1.textContent = profile.name;
        h1.classList.add('linktree-title');
        container.appendChild(h1);
    }

    if (profile.description) {
        const p = document.createElement('p');
        p.textContent = profile.description;
        p.classList.add('linktree-desc');
        container.appendChild(p);
    }
}

function renderSocialIcons(icons) {
    const container = document.getElementById('profile-container');
    if (!container || !Array.isArray(icons) || icons.length === 0) return;

    const row = document.createElement('div');
    row.classList.add('social-icons-row');

    icons.forEach(iconData => {
        if (!iconData.url && !iconData.icon) return;
        const a = document.createElement('a');
        a.href = iconData.url || '#';
        a.classList.add('social-icon');
        a.target = '_blank';
        a.rel = 'noopener noreferrer';

        if (iconData.icon) {
            const img = document.createElement('img');
            img.src = iconData.icon;
            img.classList.add('custom-icon');
            a.appendChild(img);
        }
        row.appendChild(a);
    });

    container.appendChild(row);
}

function renderVideoModule(videoModule) {
    const container = document.getElementById('video-container');
    if (!container || !videoModule || !videoModule.isVisible) return;

    const card = document.createElement('a');
    card.href = videoModule.url || '#';
    card.classList.add('featured-card');
    card.target = '_blank';
    card.rel = 'noopener noreferrer';

    if (videoModule.thumbnail) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('featured-icon-wrapper');
        const icon = document.createElement('img');
        icon.src = videoModule.thumbnail;
        icon.classList.add('featured-main-icon');
        wrapper.appendChild(icon);
        card.appendChild(wrapper);
    }

    const title = document.createElement('div');
    title.classList.add('featured-title');
    title.textContent = videoModule.title || '';
    card.appendChild(title);

    const subtitle = document.createElement('div');
    subtitle.classList.add('featured-subtitle');
    subtitle.textContent = videoModule.subtitle || '';
    card.appendChild(subtitle);

    const actionBtn = document.createElement('div');
    actionBtn.classList.add('featured-action-btn');
    actionBtn.textContent = videoModule.buttonText || '';
    card.appendChild(actionBtn);

    container.appendChild(card);
}

function renderLinks(links) {
    const container = document.getElementById('links-container');
    if (!container || !Array.isArray(links)) return;

    links.forEach(link => {
        if (link.isVisible === false) return;

        const a = document.createElement('a');
        a.href = link.url || '#';
        a.classList.add('linktree-btn');
        a.target = '_blank';
        a.rel = 'noopener noreferrer';

        const iconWrapper = document.createElement('div');
        iconWrapper.classList.add('link-icon');

        if (link.icon) {
            const icon = document.createElement('img');
            icon.src = link.icon;
            icon.classList.add('custom-icon', 'button-icon');
            iconWrapper.appendChild(icon);
        }

        const text = document.createElement('span');
        text.textContent = link.title || '';
        text.classList.add('btn-text');

        a.appendChild(iconWrapper);
        a.appendChild(text);
        container.appendChild(a);
    });
}
