// Story data loading and story list page controller

let _indexCache = null;

function resolveStory(raw, lang, id) {
    const loc = raw[lang];
    return {
        id: id,
        language: lang,
        title: loc.title,
        content: loc.content,
        difficulty: raw.difficulty,
        image: raw.image,
        words: loc.content.split(/\s+/)
    };
}

async function loadIndex() {
    if (_indexCache) return _indexCache;
    const res = await fetch('stories/index.json');
    _indexCache = await res.json();
    return _indexCache;
}

const API = {
    async getStories(lang) {
        const index = await loadIndex();
        return index.map((s, i) => resolveStory(s, lang, i));
    },

    async getStory(id) {
        const res = await fetch(`stories/${id}.json`);
        if (!res.ok) throw new Error('Story not found');
        return res.json();
    }
};

function createStoryCard(story) {
    const card = document.createElement('div');
    card.className = 'story-card';
    card.onclick = () => window.location.href = `read.html?id=${story.id}`;

    const preview = story.content.length > 80
        ? story.content.substring(0, 80) + '...'
        : story.content;

    const imageHtml = story.image
        ? `<img class="story-image" src="${story.image}" alt="${story.title}">`
        : '';

    card.innerHTML = `
        ${imageHtml}
        <div class="title">${story.title}</div>
        <div class="preview">${preview}</div>
        <span class="difficulty difficulty-${story.difficulty}">
            ${t('difficulty.' + story.difficulty)}
        </span>
    `;

    return card;
}

async function loadStoryGrid() {
    const grid = document.getElementById('story-grid');
    if (!grid) return;

    try {
        const stories = await API.getStories(getLang());
        grid.innerHTML = '';
        stories.forEach(story => {
            grid.appendChild(createStoryCard(story));
        });
    } catch (err) {
        grid.innerHTML = '<div class="loading">' + t('home.loadError') + '</div>';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadStoryGrid);
