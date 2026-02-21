/* ============================================================
   main.js — RSV Homepage: video grid, search, category filter
   ============================================================ */
const API = '/api/v1';
const ITEMS_PER_PAGE = 20;

let currentCategory = 'all';
let currentPage = 1;
let currentQuery = '';

// ── DOM ──────────────────────────────────────────────────────
const videoGrid = document.getElementById('videoGrid');
const spinner = document.getElementById('spinner');
const emptyState = document.getElementById('emptyState');
const pagination = document.getElementById('pagination');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const searchBanner = document.getElementById('searchBanner');
const searchQuery = document.getElementById('searchQuery');
const clearSearch = document.getElementById('clearSearch');

// ── Helpers ───────────────────────────────────────────────────
const show = (el) => el.classList.remove('hidden');
const hide = (el) => el.classList.add('hidden');

const formatViews = (n) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M views';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K views';
  return n + ' views';
};

// ── Render video grid ─────────────────────────────────────────
const renderGrid = (videos) => {
  videoGrid.innerHTML = '';
  if (!videos.length) { show(emptyState); return; }
  hide(emptyState);
  videos.forEach((v) => {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.innerHTML = `
      <div class="video-thumb">
        <img src="${v.thumbnailUrl}" alt="${v.title}" loading="lazy"
             onerror="this.src='https://picsum.photos/seed/${v._id}/320/180'"/>
        <span class="video-duration">${v.duration || '0:00'}</span>
      </div>
      <div class="video-card-body">
        <p class="video-card-title">${v.title}</p>
        <div class="video-card-meta">
          <span class="video-card-category">${v.category}</span>
          <span>•</span>
          <span>${formatViews(v.views)}</span>
        </div>
      </div>`;
    card.addEventListener('click', () => {
      window.location.href = `pages/watch.html?id=${v._id}`;
    });
    videoGrid.appendChild(card);
  });
};

// ── Render pagination ─────────────────────────────────────────
const renderPagination = (totalPages) => {
  pagination.innerHTML = '';
  if (totalPages <= 1) return;

  const addBtn = (label, page, disabled = false) => {
    const btn = document.createElement('button');
    btn.className = 'page-btn' + (page === currentPage ? ' active' : '');
    btn.textContent = label;
    btn.disabled = disabled;
    btn.addEventListener('click', () => {
      currentPage = page;
      loadVideos();
    });
    pagination.appendChild(btn);
  };

  addBtn('«', currentPage - 1, currentPage === 1);
  for (let i = 1; i <= totalPages; i++) addBtn(i, i);
  addBtn('»', currentPage + 1, currentPage === totalPages);
};

// ── Fetch & load videos ───────────────────────────────────────
const loadVideos = async () => {
  show(spinner); hide(emptyState);
  videoGrid.innerHTML = '';
  pagination.innerHTML = '';

  try {
    let url;
    if (currentQuery) {
      url = `${API}/videos/search?q=${encodeURIComponent(currentQuery)}&page=${currentPage}&limit=${ITEMS_PER_PAGE}`;
    } else if (currentCategory && currentCategory !== 'all') {
      url = `${API}/videos/category/${encodeURIComponent(currentCategory)}?page=${currentPage}&limit=${ITEMS_PER_PAGE}`;
    } else {
      url = `${API}/videos?page=${currentPage}&limit=${ITEMS_PER_PAGE}`;
    }

    const res = await fetch(url);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);

    const { videos, pagination: pg } = json.data;
    renderGrid(videos);
    renderPagination(pg.pages);
  } catch (err) {
    console.error('Failed to load videos:', err);
    videoGrid.innerHTML = `<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:40px">
      Could not connect to the server.<br>Make sure the backend is running on port 5000.</p>`;
  } finally {
    hide(spinner);
  }
};

// ── Category (sidebar + chips) ────────────────────────────────
const setCategory = (cat) => {
  currentCategory = cat;
  currentPage = 1;
  currentQuery = '';
  searchInput.value = '';
  hide(searchBanner);

  // Sync sidebar
  document.querySelectorAll('.sidebar-item').forEach((el) =>
    el.classList.toggle('active', el.dataset.category === cat)
  );
  // Sync chips
  document.querySelectorAll('.chip').forEach((el) =>
    el.classList.toggle('active', el.dataset.category === cat)
  );

  loadVideos();
};

document.querySelectorAll('.sidebar-item').forEach((btn) =>
  btn.addEventListener('click', () => setCategory(btn.dataset.category))
);
document.querySelectorAll('.chip').forEach((btn) =>
  btn.addEventListener('click', () => setCategory(btn.dataset.category))
);

// ── Search ────────────────────────────────────────────────────
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = searchInput.value.trim();
  if (!q || q.length < 2) return;
  currentQuery = q;
  currentCategory = 'all';
  currentPage = 1;

  searchQuery.textContent = q;
  show(searchBanner);

  document.querySelectorAll('.sidebar-item').forEach((el) => el.classList.remove('active'));
  document.querySelectorAll('.chip').forEach((el) => el.classList.remove('active'));
  loadVideos();
});

clearSearch?.addEventListener('click', () => {
  currentQuery = '';
  searchInput.value = '';
  hide(searchBanner);
  setCategory('all');
});

// ── Sidebar toggle (responsive: overlay on mobile/tablet, toggle on desktop) ─
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebarOverlay');

const openSidebar = () => {
  sidebar?.classList.add('open');
  overlay?.classList.add('visible');
  document.body.style.overflow = 'hidden';
};
const closeSidebar = () => {
  sidebar?.classList.remove('open');
  overlay?.classList.remove('visible');
  document.body.style.overflow = '';
};

document.getElementById('hamburgerBtn')?.addEventListener('click', () => {
  if (sidebar?.classList.contains('open')) closeSidebar();
  else openSidebar();
});
overlay?.addEventListener('click', closeSidebar);

// Close sidebar when a category is selected on mobile
document.querySelectorAll('.sidebar-item').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (window.innerWidth <= 768) closeSidebar();
  });
});

// ── Mobile search toggle ──────────────────────────────────────
const navCenter = document.querySelector('.nav-center');
document.getElementById('searchToggleBtn')?.addEventListener('click', () => {
  navCenter?.classList.toggle('mobile-search-open');
  if (navCenter?.classList.contains('mobile-search-open')) {
    searchInput?.focus();
  }
});

// Close mobile search after submit
searchForm?.addEventListener('submit', () => {
  navCenter?.classList.remove('mobile-search-open');
});

// ── ESC key closes sidebar & mobile search ────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeSidebar();
    navCenter?.classList.remove('mobile-search-open');
  }
});

// ── Init ──────────────────────────────────────────────────────
loadVideos();
