'use strict';

/* =========================================================
   UniSphere - one script shared by every page.
   Each feature first checks that its elements exist, so the
   same file is safe to load everywhere.
   ========================================================= */

/* ---------- Small helpers ---------- */

// Create an element with an optional class and text (textContent is safe from HTML injection)
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function plural(count, word) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

// Form readers return either { value } or { error: { field, message } }
function fail(field, message) {
  return { error: { field, message } };
}

// Tiny wrapper around localStorage so lists survive a page refresh
const store = {
  get(key) {
    try {
      return JSON.parse(localStorage.getItem(`unisphere:${key}`)) || [];
    } catch {
      return [];
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(`unisphere:${key}`, JSON.stringify(value));
    } catch {
      /* storage blocked or full: the page still works, it just won't remember */
    }
  },
};

// Convert 24-hour time ("13:30") to 12-hour format ("1:30 PM")
function formatTime(time24) {
  const [hour, minute] = time24.split(':');
  const h = parseInt(hour, 10);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = ((h + 11) % 12) + 1;
  return `${hour12}:${minute} ${suffix}`;
}

/* ---------- Sidebar (defined once, used on every page) ---------- */

const NAV_SECTIONS = [
  {
    heading: 'My Profile',
    links: [
      { href: 'index.html', label: 'Home' },
      { href: 'my-schedule.html', label: 'My Schedule' },
      { href: 'my-notes.html', label: 'My Notes' },
      { href: 'my-deadlines.html', label: 'My Deadlines' },
      { href: 'contact.html', label: 'Contacts' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { href: 'shared-notes.html', label: 'Shared Notes' },
      { href: 'old-testaments.html', label: 'Old Testaments' },
      { href: 'study-groups.html', label: 'Study Groups' },
    ],
  },
  {
    links: [{ href: 'unihub.html', label: 'UniHub', className: 'unihub-link' }],
  },
];

function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const currentPage = location.pathname.split('/').pop() || 'index.html';

  NAV_SECTIONS.forEach(({ heading, links }) => {
    const nav = el('nav');
    nav.setAttribute('aria-label', heading || 'Shortcuts');
    if (heading) nav.append(el('h2', '', heading));

    const list = el('ul');
    links.forEach(({ href, label, className }) => {
      const link = el('a', className, label);
      link.href = href;
      if (href === currentPage) link.setAttribute('aria-current', 'page');
      const item = el('li');
      item.append(link);
      list.append(item);
    });

    nav.append(list);
    sidebar.append(nav);
  });
}

/* ---------- Home: story tray ---------- */

const STORIES = [
  { name: 'Maya', color: '#3d5a80', seen: false },
  { name: 'Diego', color: '#8a3b5c', seen: false },
  { name: 'Priya', color: '#3f7d5f', seen: false },
  { name: 'Sam', color: '#7d6440', seen: true },
  { name: 'Elle', color: '#5a4a8c', seen: false },
  { name: 'Noah', color: '#a06a3c', seen: true },
];

function storyLabel(story) {
  return `${story.name}'s story${story.seen ? ' (seen)' : ''}`;
}

function renderStories() {
  const tray = document.getElementById('tray');
  if (!tray) return;

  STORIES.forEach(story => {
    // A real <button> so stories work with the keyboard too
    const card = el('button', 'story-card');
    card.type = 'button';
    card.style.setProperty('--story-bg', story.color);
    card.classList.toggle('seen', story.seen);
    card.setAttribute('aria-label', storyLabel(story));

    const avatar = el('span', 'story-avatar');
    avatar.append(el('span', 'story-avatar-inner', story.name[0]));
    card.append(avatar, el('span', 'story-caption', story.name));

    card.addEventListener('click', () => {
      story.seen = true;
      card.classList.add('seen');
      card.setAttribute('aria-label', storyLabel(story));
    });

    tray.append(card);
  });
}

/* ---------- Home: feed (posts, likes, comments) ---------- */

const POSTS = [
  {
    author: 'Alex',
    text: 'Just as plants turn sunlight, water, and carbon dioxide into energy to grow, students turn time, effort, and curiosity into knowledge. Both need steady care, a good environment, and patience to flourish, and both give back by supporting the world around them.',
    image: 'https://randomwordgenerator.com/img/picture-generator/53e3d1454855ae14f1dc8460962e33791c3ad6e04e507440702d79d39f4dc3_640.jpg',
    likes: 41,
  },
  {
    author: 'Aimee',
    text: 'Like dogs, students learn best through consistency, encouragement, and routine. Dogs are loyal companions, and many campuses use therapy dogs to help students relax and feel less stressed during exams. Both thrive on attention, regular exercise, and a sense of belonging.',
    image: 'https://randomwordgenerator.com/img/picture-generator/54e0d1444e54a514f1dc8460962e33791c3ad6e04e507440762879dc954fc5_640.jpg',
    likes: 24,
  },
  {
    author: 'Tryke',
    text: 'Dreams are seeds, and plans are the water and sunlight that help them grow. For a student, schedules, deadlines, and steady habits turn a dream into progress.',
    image: 'https://randomwordgenerator.com/img/picture-generator/55e9dd474d50a914f1dc8460962e33791c3ad6e04e507440742a7ad2974bc1_640.jpg',
    likes: 3,
  },
  {
    author: 'Prof. Lumen',
    text: "Student life is basically rock 'n' roll 🎸 Late nights, big dreams, group projects that are like band practice, and a whole lot of noise. Stay loud, stay original, and dont be afraid to go off-script 🤘",
    image: 'https://randomwordgenerator.com/img/picture-generator/50e6d1474950b10ff3d8992cc12c30771037dbf85254794e702673d2924b_640.jpg',
    likes: 66,
  },
  {
    author: 'Dr. Nova',
    text: 'You bring the questions, I bring the answers, and together we figure out the rest."* ✨',
    image: 'https://randomwordgenerator.com/img/picture-generator/hands-423794_640.jpg',
    likes: 10,
  },
];

function renderFeed() {
  const feed = document.getElementById('feed');
  const template = document.getElementById('post-template');
  if (!feed || !template) return;

  const now = new Date();

  POSTS.forEach(post => {
    const node = template.content.cloneNode(true);

    const article = node.querySelector('.post');
    article.dataset.likes = post.likes; // base count; the "liked" state adds 1 on top

    const avatar = node.querySelector('.post-avatar');
    avatar.alt = `${post.author}'s profile picture`;

    node.querySelector('.post-name').textContent = post.author;

    const time = node.querySelector('.timestamp');
    time.dateTime = now.toISOString();
    time.textContent = now.toLocaleString();

    node.querySelector('.post-text').textContent = post.text;

    const image = node.querySelector('.post-image');
    image.src = post.image;
    image.alt = `Photo shared by ${post.author}`;

    node.querySelector('.like-count').textContent = plural(post.likes, 'like');

    feed.append(node);
  });

  // One listener for the whole feed instead of one per button/form
  feed.addEventListener('click', event => {
    const button = event.target.closest('.like-btn');
    if (!button) return;

    const post = button.closest('.post');
    const liked = button.classList.toggle('liked');
    const count = Number(post.dataset.likes) + (liked ? 1 : 0);

    button.setAttribute('aria-pressed', liked);
    button.querySelector('.like-text').textContent = liked ? 'Liked' : 'Like';
    button.querySelector('.like-icon').textContent = liked ? '❤️' : '👍';
    post.querySelector('.like-count').textContent = plural(count, 'like');
  });

  feed.addEventListener('submit', event => {
    const form = event.target.closest('.comment-form');
    if (!form) return;
    event.preventDefault();

    const input = form.querySelector('.comment-input');
    const text = input.value.trim();
    if (!text) return;

    // append(text) inserts a plain text node, so typed HTML can never run as code
    const bubble = el('div', 'comment-bubble');
    bubble.append(el('span', 'comment-name', 'You'), text);
    const comment = el('div', 'comment');
    comment.append(bubble);

    form.closest('.comments-section').querySelector('.comment-list').append(comment);
    input.value = '';
  });
}

/* ---------- Shared logic for Notes / Schedule / Deadlines ---------- */

function setupListPage({ storageKey, formId, listId, emptyId, deleteLabel, readForm, sortItems, renderItem }) {
  const form = document.getElementById(formId);
  const list = document.getElementById(listId);
  const empty = document.getElementById(emptyId);
  if (!form || !list || !empty) return;

  const errorBox = form.querySelector('.form-error');
  let items = store.get(storageKey);

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = !message;
  }

  function save() {
    store.set(storageKey, items);
  }

  function draw() {
    list.replaceChildren();

    const ordered = sortItems ? sortItems([...items]) : items;
    ordered.forEach(item => {
      const li = renderItem(item);

      const remove = el('button', 'delete-button', '×');
      remove.type = 'button';
      remove.setAttribute('aria-label', `Delete ${deleteLabel}: ${item.text}`);
      remove.addEventListener('click', () => {
        items = items.filter(other => other.id !== item.id);
        save();
        draw();
      });

      li.append(remove);
      list.append(li);
    });

    empty.hidden = items.length > 0;
  }

  form.addEventListener('submit', event => {
    event.preventDefault();

    const { value, error } = readForm(form);
    if (error) {
      showError(error.message);
      form.elements[error.field].focus();
      return;
    }

    showError('');
    items.push({ id: makeId(), ...value });
    save();
    draw();
    form.reset();
    form.querySelector('input, select').focus();
  });

  draw();
}

/* ---------- My Notes ---------- */

setupListPage({
  storageKey: 'notes',
  formId: 'noteForm',
  listId: 'noteList',
  emptyId: 'noteEmpty',
  deleteLabel: 'note',
  readForm(form) {
    const text = form.elements.text.value.trim();
    if (!text) return fail('text', 'Please enter a note.');
    return { value: { text } };
  },
  renderItem(item) {
    const li = el('li', 'note');
    li.append(el('p', 'note-text', item.text));
    return li;
  },
});

/* ---------- My Schedule ---------- */

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SCHEDULE_MIN = '06:00';
const SCHEDULE_MAX = '19:00';

setupListPage({
  storageKey: 'schedule',
  formId: 'scheduleForm',
  listId: 'itemList',
  emptyId: 'scheduleEmpty',
  deleteLabel: 'schedule item',
  readForm(form) {
    const text = form.elements.text.value.trim();
    const day = form.elements.day.value;
    const time = form.elements.time.value;

    if (!text) return fail('text', 'Please enter what the schedule item is.');
    if (!day) return fail('day', 'Please select a day for the schedule item.');
    if (!time) return fail('time', 'Please select a time for the schedule item.');
    if (time < SCHEDULE_MIN || time > SCHEDULE_MAX) {
      return fail('time', `Please choose a time between ${formatTime(SCHEDULE_MIN)} and ${formatTime(SCHEDULE_MAX)}.`);
    }
    return { value: { text, day, time } };
  },
  // Monday to Sunday, earliest first
  sortItems: items => items.sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.time.localeCompare(b.time)),
  renderItem(item) {
    const li = el('li', 'schedule-item');
    li.append(
      el('span', 'slot-day', item.day),
      el('span', 'slot-title', item.text),
      el('span', 'slot-time', formatTime(item.time))
    );
    return li;
  },
});

/* ---------- My Deadlines ---------- */

// Whole days from today until the date ("YYYY-MM-DD"); negative means overdue
function daysUntil(dateString) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${dateString}T00:00`); // local time avoids timezone off-by-one
  return Math.round((due - today) / 86400000);
}

function urgencyFor(daysLeft) {
  if (daysLeft <= 3) return 'urgent'; // 3 days or fewer, including overdue
  if (daysLeft <= 7) return 'soon'; // within a week
  return 'far';
}

function describeDaysLeft(daysLeft) {
  if (daysLeft < 0) return `Overdue by ${plural(-daysLeft, 'day')}`;
  if (daysLeft === 0) return 'Due today';
  if (daysLeft === 1) return 'Due tomorrow';
  return `${daysLeft} days left`;
}

setupListPage({
  storageKey: 'deadlines',
  formId: 'deadlineForm',
  listId: 'deadlinesList',
  emptyId: 'deadlineEmpty',
  deleteLabel: 'deadline',
  readForm(form) {
    const text = form.elements.text.value.trim();
    const date = form.elements.date.value;

    if (!text) return fail('text', 'Please enter what the deadline is for.');
    if (!date) return fail('date', 'Please select a date for the deadline.');
    return { value: { text, date } };
  },
  sortItems: items => items.sort((a, b) => a.date.localeCompare(b.date)),
  // Urgency is worked out every time the list is drawn, so colours stay correct as days pass
  renderItem(item) {
    const daysLeft = daysUntil(item.date);
    const prettyDate = new Date(`${item.date}T00:00`).toLocaleDateString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const li = el('li', 'deadline');
    li.dataset.urgency = urgencyFor(daysLeft);
    li.append(
      el('span', 'deadline-title', item.text),
      el('span', 'deadline-date', prettyDate),
      el('span', 'deadline-when', describeDaysLeft(daysLeft))
    );
    return li;
  },
});

/* ---------- Start ---------- */

renderSidebar();
renderStories();
renderFeed();