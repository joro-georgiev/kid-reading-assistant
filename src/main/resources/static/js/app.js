// API helpers and story list page controller

const API = {
    async getStories() {
        const res = await fetch('/api/stories');
        return res.json();
    },

    async getStory(id) {
        const res = await fetch(`/api/stories/${id}`);
        return res.json();
    },

    async evaluateReading(storyId, spokenWords) {
        const res = await fetch('/api/reading/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ storyId, spokenWords })
        });
        return res.json();
    }
};

function createStoryCard(story) {
    const card = document.createElement('div');
    card.className = 'story-card';
    card.onclick = () => window.location.href = `/read.html?id=${story.id}`;

    const preview = story.content.length > 80
        ? story.content.substring(0, 80) + '...'
        : story.content;

    card.innerHTML = `
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
