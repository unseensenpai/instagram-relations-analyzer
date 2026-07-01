const CONFIG = {
  appId: '936619743392459',
  targetUserId: null,
  targetUsername: ''
};

// Her profilin verisini ayırmak için ana depo yapısı
let profileCaches = {};
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
  clearCurrentProfileList();

  // Aktif profil için boş bir veri yapısı oluştur veya sıfırla
  profileCaches[CONFIG.targetUserId] = {
    followers: [],
    following: [],
    notFollowingBack: [],
    iNotFollowingBack: []
  };

  updateStatus(`Syncing @${CONFIG.targetUsername}'s following list...`);
  profileCaches[CONFIG.targetUserId].following = await fetchAllRelations('following');

  updateStatus(`Syncing @${CONFIG.targetUsername}'s followers list...`);
  profileCaches[CONFIG.targetUserId].followers = await fetchAllRelations('followers');

  processRelations(CONFIG.targetUserId);
  saveCacheData(CONFIG.targetUserId);
  
  renderList(profileCaches[CONFIG.targetUserId][currentFilterKey]);
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

function processRelations(userId) {
  const currentCache = profileCaches[userId];
  if (!currentCache) return;

  const followerIds = new Set(currentCache.followers.map(u => u.pk));
  const followingIds = new Set(currentCache.following.map(u => u.pk));

  currentCache.notFollowingBack = currentCache.following.filter(u => !followerIds.has(u.pk));
  currentCache.iNotFollowingBack = currentCache.followers.filter(u => !followingIds.has(u.pk));
}

function saveCacheData(userId) {
  const cacheKey = `ig_cache_${userId}`;
  const cacheObject = {
    timestamp: new Date().toLocaleString(),
    dataStore: profileCaches[userId]
  };
  localStorage.setItem(cacheKey, JSON.stringify(cacheObject));
}

function loadCachedData() {
  const cacheKey = `ig_cache_${CONFIG.targetUserId}`;
  const cachedData = localStorage.getItem(cacheKey);
  
  if (cachedData) {
    const cached = JSON.parse(cachedData);
    // Hafızadaki profileCaches havuzuna ilgili ID'yi kaydediyoruz
    profileCaches[CONFIG.targetUserId] = cached.dataStore;
    
    document.getElementById('ig-cache-timestamp').innerText = `Last synced: ${cached.timestamp}`;
    processRelations(CONFIG.targetUserId);
    renderList(profileCaches[CONFIG.targetUserId][currentFilterKey]);
    updateUIElements();
  } else {
    resetUI();
    updateStatus(`No cached data found for @${CONFIG.targetUsername}. Please sync relations.`);
  }
}

function clearCurrentProfileList() {
  if (CONFIG.targetUserId && profileCaches[CONFIG.targetUserId]) {
    profileCaches[CONFIG.targetUserId] = { followers: [], following: [], notFollowingBack: [], iNotFollowingBack: [] };
  }
  updateUIElements();
  document.getElementById('ig-relations-user-list').innerHTML = '';
}

function resetUI() {
  document.getElementById('ig-relations-user-list').innerHTML = '';
  document.getElementById('cnt-following').innerText = '0';
  document.getElementById('cnt-followers').innerText = '0';
  document.getElementById('cnt-not-back').innerText = '0';
  document.getElementById('cnt-i-not-back').innerText = '0';
  document.getElementById('ig-cache-timestamp').innerText = '';
}

function updateUIElements() {
  updateStatus('');
  const currentCache = profileCaches[CONFIG.targetUserId];
  
  if (currentCache) {
    document.getElementById('cnt-following').innerText = currentCache.following.length;
    document.getElementById('cnt-followers').innerText = currentCache.followers.length;
    document.getElementById('cnt-not-back').innerText = currentCache.notFollowingBack.length;
    document.getElementById('cnt-i-not-back').innerText = currentCache.iNotFollowingBack.length;
  } else {
    resetUI();
  }
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
      processRelations(CONFIG.targetUserId);
      saveCacheData(CONFIG.targetUserId);
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
      processRelations(CONFIG.targetUserId);
      saveCacheData(CONFIG.targetUserId);
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
  const currentCache = profileCaches[CONFIG.targetUserId];
  if (currentCache && currentCache[storeKey]) {
    currentCache[storeKey] = currentCache[storeKey].filter(u => u.pk !== userId && u.pk.toString() !== userId.toString());
  }
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
    
    const currentCache = profileCaches[CONFIG.targetUserId];
    if (currentCache) {
      renderList(currentCache[currentFilterKey]);
    }
  });
});

// Dışa aktarma butonuna tıklama olayını dinle
document.getElementById('btn-export-data').addEventListener('click', () => {
  const currentCache = profileCaches[CONFIG.targetUserId];
  if (!currentCache) {
    alert('İndirilecek veri bulunamadı. Lütfen önce profili senkronize edin.');
    return;
  }

  const exportType = document.getElementById('ig-relations-export-type').value;
  const currentListName = currentFilterKey; // 'following', 'notFollowingBack' vb.
  const currentUsers = currentCache[currentListName] || [];

  if ((exportType === 'current-csv' || exportType === 'current-json') && currentUsers.length === 0) {
    alert('Şu an açık olan listede indirilecek kullanıcı yok.');
    return;
  }

  const dateStr = new Date().toISOString().slice(0, 10);

  if (exportType === 'current-csv') {
    // Excel ile tam uyumlu (UTF-8 BOM ile birlikte) CSV oluşturma
    let csvContent = '\uFEFF'; // Türkçe karakterlerin Excel'de düzgün görünmesi için BOM
    csvContent += 'Instagram ID,Kullanıcı Adı,Tam Adı\n';
    
    currentUsers.forEach(user => {
      const fullName = (user.full_name || '').replace(/"/g, '""'); // Tırnak işaretlerini escape et
      csvContent += `"${user.pk}","${user.username}","${fullName}"\n`;
    });

    downloadBlob(csvContent, `ig-${CONFIG.targetUsername}-${currentListName}-${dateStr}.csv`, 'text/csv;charset=utf-8;');
  } 
  
  else if (exportType === 'current-json') {
    const jsonContent = JSON.stringify(currentUsers, null, 2);
    downloadBlob(jsonContent, `ig-${CONFIG.targetUsername}-${currentListName}-${dateStr}.json`, 'application/json');
  } 
  
  else if (exportType === 'all-json') {
    // Takipçi, takip edilen ve filtrelenmiş tüm listeleri tek JSON'da paketle
    const allDataContent = JSON.stringify({
      target_username: CONFIG.targetUsername,
      target_id: CONFIG.targetUserId,
      exported_at: new Date().toLocaleString(),
      summary: {
        following_count: currentCache.following.length,
        followers_count: currentCache.followers.length,
        not_following_back_count: currentCache.notFollowingBack.length,
        i_not_following_back_count: currentCache.iNotFollowingBack.length
      },
      details: currentCache
    }, null, 2);

    downloadBlob(allDataContent, `ig-${CONFIG.targetUsername}-all-data-${dateStr}.json`, 'application/json');
  }
});

// Tarayıcıya dosyayı indirtmek için yardımcı fonksiyon
function downloadBlob(content, filename, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  // Temizlik
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
}