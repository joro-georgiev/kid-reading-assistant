// Story data loading and story list page controller

let _storiesCache = null;

async function loadAllStories() {
    if (_storiesCache) return _storiesCache;
    const res = await fetch('stories.json');
    const stories = await res.json();
    // Assign index-based IDs and split content into words
    stories.forEach((s, i) => {
        s.id = i;
        s.words = s.content.split(/\s+/);
    });
    _storiesCache = stories;
    return stories;
}

const API = {
    async getStories() {
        return loadAllStories();
    },

    async getStory(id) {
        const stories = await loadAllStories();
        const story = stories[Number(id)];
        if (!story) throw new Error('Story not found');
        return story;
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
        const allStories = await API.getStories();
        const stories = allStories.filter(s => s.language === getLang());
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
