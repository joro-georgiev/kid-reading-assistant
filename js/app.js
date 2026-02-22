// Story data loading and story list page controller

let _indexCache = {};

async function loadIndex(lang) {
    if (_indexCache[lang]) return _indexCache[lang];
    const res = await fetch(`stories/${lang}/index.json`);
    const stories = await res.json();
    stories.forEach((s, i) => {
        s.id = i;
        s.language = lang;
    });
    _indexCache[lang] = stories;
    return stories;
}

const API = {
    async getStories() {
        return loadIndex(getLang());
    },

    async getStory(lang, id) {
        const res = await fetch(`stories/${lang}/${id}.json`);
        if (!res.ok) throw new Error('Story not found');
        const story = await res.json();
        story.id = Number(id);
        story.language = lang;
        story.words = story.content.split(/\s+/);
        return story;
    }
};

function createStoryCard(story) {
    const card = document.createElement('div');
    card.className = 'story-card';
    card.onclick = () => window.location.href = `read.html?lang=${story.language}&id=${story.id}`;

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
        const stories = await API.getStories();
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
