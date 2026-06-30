const CONFIG = {
  appId: '936619743392459',
  targetUserId: null,
  targetUsername: ''
};

let dataStore = {
  followers: [],
  following: [],
  notFollowingBack: [],
  iNotFollowingBack: []
};

let currentFilterKey = 'following';

document.getElementById('ig-relations-close-btn').addEventListener('click', () => {
  document.getElementById('ig-relations-modal-overlay').classList.add('ig-relations-hidden');
});

document.getElementById('ig-relations-float-trigger').addEventListener('click', () => {
  if (detectTargetProfile()) {
    document.getElementById('ig-relations-title').innerText = `Relations: @${CONFIG.targetUsername}`;
    loadCachedData();
  } else {
    resetUI();
    updateStatus('Please navigate to a valid Instagram profile page to begin analysis.', true);
  }
});

document.getElementById('btn-fetch-data').addEventListener('click', async () => {
  if (!detectTargetProfile()) {
    updateStatus('Invalid profile page. Please open a profile to sync.', true);
    return;
  }

  setLoading(true);
  clearLists();

  updateStatus(`Syncing @${CONFIG.targetUsername}'s following list...`);
  dataStore.following = await fetchAllRelations('following');

  updateStatus(`Syncing @${CONFIG.targetUsername}'s followers list...`);
  dataStore.followers = await fetchAllRelations('followers');

  processRelations();
  saveCacheData();
  
  renderList(dataStore[currentFilterKey]);
  updateUIElements();
  
  setLoading(false);
});

function detectTargetProfile() {
  const path = window.location.pathname.replace(/^\/|\/$/g, '');
  if (!path || path.includes('/') || ['explore', 'direct', 'reels', 'stories'].includes(path)) {
    CONFIG.targetUserId = null;
    CONFIG.targetUsername = '';
    return false;
  }

  CONFIG.targetUsername = path;
  
  const scripts = document.querySelectorAll('script');
  for (let script of scripts) {
    if (script.innerText.includes('profilePage_')) {
      const match = script.innerText.match(/"profilePage_([0-9]+)"/);
      if (match && match[1]) {
        CONFIG.targetUserId = match[1];
        return true;
      }
    }
  }

  const metaObj = document.querySelector('meta[property="al:ios:url"]');
  if (metaObj) {
    const idMatch = metaObj.getAttribute('content').match(/id=([0-9]+)/);
    if (idMatch && idMatch[1]) {
      CONFIG.targetUserId = idMatch[1];
      return true;
    }
  }

  return false;
}

function updateStatus(message, isWarning = false) {
  const msgEl = document.getElementById('ig-relations-status-message');
  msgEl.innerText = message;
  msgEl.style.display = message ? 'block' : 'none';
  
  if (isWarning) {
    msgEl.classList.add('status-warning');
  } else {
    msgEl.classList.remove('status-warning');
  }
}

function setLoading(isLoading) {
  const spinner = document.getElementById('ig-relations-spinner');
  const btn = document.getElementById('btn-fetch-data');
  
  if (isLoading) {
    spinner.style.display = 'block';
    btn.disabled = true;
    btn.innerText = 'Syncing...';
  } else {
    spinner.style.display = 'none';
    btn.disabled = false;
    btn.innerText = 'Sync Relations';
  }
}

async function fetchAllRelations(type) {
  let list = [];
  let nextMaxId = '';
  let hasMore = true;

  while (hasMore) {
    const url = `https://www.instagram.com/api/v1/friendships/${CONFIG.targetUserId}/${type}/?count=50&max_id=${nextMaxId}`;
    try {
      const response = await fetch(url, {
        headers: {
          'X-IG-App-ID': CONFIG.appId,
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (response.status === 400 || response.status === 403) {
        updateStatus('Private profile or action blocked by Instagram. Cannot access list.', true);
        return [];
      }

      const data = await response.json();
      
      if (data.users) {
        list = list.concat(data.users);
      }
      
      nextMaxId = data.next_max_id || '';
      hasMore = !!nextMaxId;

      if (hasMore) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    } catch (err) {
      console.error(err);
      hasMore = false;
    }
  }
  return list;
}

function processRelations() {
  const followerIds = new Set(dataStore.followers.map(u => u.pk));
  const followingIds = new Set(dataStore.following.map(u => u.pk));

  dataStore.notFollowingBack = dataStore.following.filter(u => !followerIds.has(u.pk));
  dataStore.iNotFollowingBack = dataStore.followers.filter(u => !followingIds.has(u.pk));
}

function saveCacheData() {
  const cacheKey = `ig_cache_${CONFIG.targetUserId}`;
  const cacheObject = {
    timestamp: new Date().toLocaleString(),
    dataStore: dataStore
  };
  localStorage.setItem(cacheKey, JSON.stringify(cacheObject));
}

function loadCachedData() {
  const cacheKey = `ig_cache_${CONFIG.targetUserId}`;
  const cachedData = localStorage.getItem(cacheKey);
  
  if (cachedData) {
    const cached = JSON.parse(cachedData);
    dataStore = cached.dataStore;
    document.getElementById('ig-cache-timestamp').innerText = `Last synced: ${cached.timestamp}`;
    processRelations();
    renderList(dataStore[currentFilterKey]);
    updateUIElements();
  } else {
    resetUI();
    updateStatus(`No cached data found for @${CONFIG.targetUsername}. Please sync relations.`);
  }
}

function clearLists() {
  dataStore = { followers: [], following: [], notFollowingBack: [], iNotFollowingBack: [] };
  updateUIElements();
  document.getElementById('ig-relations-user-list').innerHTML = '';
}

function resetUI() {
  clearLists();
  document.getElementById('ig-cache-timestamp').innerText = '';
}

function updateUIElements() {
  updateStatus('');
  document.getElementById('cnt-following').innerText = dataStore.following.length;
  document.getElementById('cnt-followers').innerText = dataStore.followers.length;
  document.getElementById('cnt-not-back').innerText = dataStore.notFollowingBack.length;
  document.getElementById('cnt-i-not-back').innerText = dataStore.iNotFollowingBack.length;
}

function renderList(users) {
  const listContainer = document.getElementById('ig-relations-user-list');
  listContainer.innerHTML = '';

  if (!users || users.length === 0) {
    return;
  }

  const isActionRemove = currentFilterKey === 'iNotFollowingBack';
  const buttonText = isActionRemove ? 'Remove' : 'Unfollow';

  users.forEach(user => {
    const li = document.createElement('li');
    li.className = 'ig-user-item';

    li.innerHTML = `
      <div class="ig-user-info">
        <a href="https://instagram.com/${user.username}" target="_blank" class="ig-username">${user.username}</a>
        <span class="ig-fullname">${user.full_name || ''}</span>
      </div>
      <button class="btn-action" data-id="${user.pk}">${buttonText}</button>
    `;

    const actionBtn = li.querySelector('.btn-action');
    if (isActionRemove) {
      actionBtn.className = 'btn-unfollow';
      actionBtn.addEventListener('click', (e) => handleRemoveFollower(e.target, user.pk));
    } else {
      actionBtn.className = 'btn-unfollow';
      actionBtn.addEventListener('click', (e) => handleUnfollow(e.target, user.pk));
    }

    listContainer.appendChild(li);
  });
}

async function handleUnfollow(buttonElement, userId) {
  buttonElement.disabled = true;
  buttonElement.innerText = 'Leaving...';

  const url = `https://www.instagram.com/api/v1/friendships/destroy/${userId}/`;
  const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)?.[1] || '';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-IG-App-ID': CONFIG.appId,
        'X-CSRFToken': csrfToken,
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (response.ok) {
      removeUserFromLocalStore('following', userId);
      processRelations();
      saveCacheData();
      buttonElement.closest('.ig-user-item').remove();
      updateUIElements();
    } else {
      buttonElement.disabled = false;
      buttonElement.innerText = 'Unfollow';
    }
  } catch (err) {
    console.error(err);
    buttonElement.disabled = false;
    buttonElement.innerText = 'Unfollow';
  }
}

async function handleRemoveFollower(buttonElement, userId) {
  buttonElement.disabled = true;
  buttonElement.innerText = 'Removing...';

  const url = `https://www.instagram.com/api/v1/friendships/remove_follower/${userId}/`;
  const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)?.[1] || '';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-IG-App-ID': CONFIG.appId,
        'X-CSRFToken': csrfToken,
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (response.ok) {
      removeUserFromLocalStore('followers', userId);
      processRelations();
      saveCacheData();
      buttonElement.closest('.ig-user-item').remove();
      updateUIElements();
    } else {
      buttonElement.disabled = false;
      buttonElement.innerText = 'Remove';
    }
  } catch (err) {
    console.error(err);
    buttonElement.disabled = false;
    buttonElement.innerText = 'Remove';
  }
}

function removeUserFromLocalStore(storeKey, userId) {
  dataStore[storeKey] = dataStore[storeKey].filter(u => u.pk !== userId && u.pk.toString() !== userId.toString());
}

const filters = [
  { id: 'filter-following', dataKey: 'following' },
  { id: 'filter-followers', dataKey: 'followers' },
  { id: 'filter-not-following-back', dataKey: 'notFollowingBack' },
  { id: 'filter-i-not-following-back', dataKey: 'iNotFollowingBack' }
];

filters.forEach(filter => {
  document.getElementById(filter.id).addEventListener('click', (e) => {
    document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
    
    let targetElement = e.target;
    if (!targetElement.classList.contains('btn-filter')) {
      targetElement = targetElement.closest('.btn-filter');
    }
    
    targetElement.classList.add('active');
    currentFilterKey = filter.dataKey;
    renderList(dataStore[currentFilterKey]);
  });
});