/* ============================================================
   watch.js — Video watch page: player, info, related videos
   ============================================================ */
// Root Cause Fix: Backend is on 5000, Frontend on 5500. Needs absolute URL.
const API = 'http://localhost:5000/api/v1';

const spinner = document.getElementById('spinner');
const playerContainer = document.getElementById('playerContainer');
const videoPlayer = document.getElementById('videoPlayer');
const videoInfo = document.getElementById('videoInfo');
const errorState = document.getElementById('errorState');
const relatedList = document.getElementById('relatedList');

// ── Helpers ───────────────────────────────────────────────────
const show = (el) => el.classList.remove('hidden');
const hide = (el) => el.classList.add('hidden');

const formatViews = (n) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M views';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K views';
    return n + ' views';
};

const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

// ── Build embed URL ───────────────────────────────────────────
const buildEmbedUrl = (url) => {
    // Already an embed link
    if (url.includes('/embed/')) return url;
    // Convert youtube.com/watch?v=ID → embed
    const ytMatch = url.match(/[?&]v=([^&#]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    // youtu.be/ID
    const shortMatch = url.match(/youtu\.be\/([^?#]+)/);
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
    // Return as-is (direct video file)
    return url;
};

// ── Load video ────────────────────────────────────────────────
const loadVideo = async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        show(errorState); hide(spinner);
        return;
    }

    try {
        const res = await fetch(`${API}/videos/${id}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message);

        const { video, relatedVideos } = json.data;

        // Set page title
        document.title = `${video.title} — RSV`;

        // Set player
        const embedUrl = buildEmbedUrl(video.videoUrl);
        videoPlayer.src = embedUrl;

        // Set info
        document.getElementById('watchTitle').textContent = video.title;
        document.getElementById('watchCategory').textContent = video.category;
        document.getElementById('watchViews').textContent = formatViews(video.views);
        document.getElementById('watchDate').textContent = formatDate(video.createdAt);
        document.getElementById('watchDescription').textContent = video.description || 'No description.';

        hide(spinner);
        show(playerContainer);
        show(videoInfo);

        // Related videos
        renderRelated(relatedVideos);
    } catch (err) {
        console.error('Failed to load video:', err);
        hide(spinner);
        show(errorState);
    }
};

// ── Render related videos ─────────────────────────────────────
const renderRelated = (videos) => {
    relatedList.innerHTML = '';
    if (!videos?.length) {
        relatedList.innerHTML = '<p style="color:var(--text-muted);font-size:13px">No related videos found.</p>';
        return;
    }
    videos.forEach((v) => {
        const card = document.createElement('div');
        card.className = 'related-card';
        card.innerHTML = `
      <div class="related-thumb">
        <img src="${v.thumbnailUrl}" alt="${v.title}" loading="lazy"
             onerror="this.src='https://picsum.photos/seed/${v._id}/160/90'"/>
        <span class="related-duration">${v.duration || '0:00'}</span>
      </div>
      <div class="related-info">
        <p class="related-title">${v.title}</p>
        <p class="related-meta">${v.category} • ${formatViews(v.views)}</p>
      </div>`;
        card.addEventListener('click', () => {
            window.location.href = `watch.html?id=${v._id}`;
        });
        relatedList.appendChild(card);
    });
};

// ── Search from watch page ─────────────────────────────────────
document.getElementById('searchForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = document.getElementById('searchInput').value.trim();
    if (q.length < 2) return;
    document.querySelector('.nav-center')?.classList.remove('mobile-search-open');
    window.location.href = `../index.html?q=${encodeURIComponent(q)}`;
});

// ── Mobile search toggle ──────────────────────────────────────
const navCenter = document.querySelector('.nav-center');
document.getElementById('searchToggleBtn')?.addEventListener('click', () => {
    navCenter?.classList.toggle('mobile-search-open');
    if (navCenter?.classList.contains('mobile-search-open')) {
        document.getElementById('searchInput')?.focus();
    }
});

// ── Init ──────────────────────────────────────────────────────
loadVideo();
