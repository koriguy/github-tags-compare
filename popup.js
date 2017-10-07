(function () {

  const REPO_ID = 'repoName';
  const REPO_LIST_ID = 'repos';
  const USER_NAME_ID = 'userName';
  const USER_LIST_ID = 'users';
  const TOKEN_ID = 'accessToken';
  const SOURCE_TAGS_ELEMENT_ID = 'sourceTags';
  const DESTINATION_TAGS_ELEMENT_ID = 'destinationTags';
  const TAGS_LIMIT = 10;
  let data = {
    repos: [],
    users: [],
    token: ''
  };


  function initApp(cb) {
    getSavedData(items => {
      data.repos = items.repos || [];
      data.users = items.users || [];
      data.token = items.token || '';
      prefillData();
      initEventListeneres();
      if (getRepoName() && getUserName() && getToken()) {
        fillTags();
      }
      cb ? cb() : null;
    });
  }

  function fillItems(items, itemsId, itemId) {
    const optionsElem = document.getElementById(itemsId);
    for (var i = 0; i < items.length; i++) {
      var opt = document.createElement('option')
      opt.innerHTML = items[i];
      opt.value = items[i];
      optionsElem.appendChild(opt)
    }
    if (optionsElem.options.length) {
      document.getElementById(itemId).value = optionsElem.options[0].value
    }
  }

  function fillTags() {
    getTags(getRepoName(), tags => {
      if (tags) {
        fillDestinationTag(tags);
        fillSourceTags(tags);
        saveRepos();
        saveUsers();
        saveToken();
      }
    })
  }

  function prefillData() {
    fillItems(data.repos, REPO_LIST_ID, REPO_ID);
    fillItems(data.users, USER_LIST_ID, USER_NAME_ID);
  }

  function initEventListeneres() {
    document.getElementById('clearRepos').addEventListener('click', () => {
      chrome.storage.sync.set({ repos: [] });
    });
    document.getElementById('clearUsers').addEventListener('click', () => {
      chrome.storage.sync.set({ users: [] });
    });
    document.getElementById('tagsCompare').addEventListener('click', () => {
      const selectedTag = getSourceTag();
      const lastTag = getDestinationTag();
      document.getElementById("resp").innerHTML = selectedTag + lastTag;
      window.open('https://github.com/' + getUserName() + '/' + getRepoName() + '/compare/' + selectedTag + '...' + lastTag)
    });

    document.getElementById('getTags').addEventListener('click', () => {
      clearTags();
      fillTags();
    })
  }

  function saveToken() {
    const currentToken = getUserToken();
    data.token = currentToken;
    chrome.storage.sync.set({ token: data.token });
  }
  function saveUsers() {
    const currentUser = getUserName();
    if (!data.users.includes(currentUser)) {
      data.users.push(currentUser);
      chrome.storage.sync.set({ users: data.users });
    }
  }

  function saveRepos() {
    const currentRepo = getRepoName();
    if (!data.repos.includes(currentRepo)) {
      data.repos.push(currentRepo);
      chrome.storage.sync.set({ repos: data.repos });
    }
  }

  function getSavedData(cb) {
    chrome.storage.sync.get(null, (items) => {
      cb(chrome.runtime.lastError ? {} : items);
    });
  }

  function getRepoName() {
    return document.getElementById(REPO_ID).value;
  }

  function getUserName() {
    return document.getElementById(USER_NAME_ID).value;
  }

  function getToken() {
    return document.getElementById(TOKEN_ID).value;
  }
  function addTagsToOption(optionsElementId, tags) {
    var optionsElem = document.getElementById(optionsElementId);
    var tagsLimit = tags.length <= TAGS_LIMIT ? tags.length : TAGS_LIMIT;
    for (var i = 0; i < tagsLimit; i++) {
      var opt = document.createElement('option')
      opt.innerHTML = tags[i].name;
      opt.value = tags[i].name;
      optionsElem.appendChild(opt)
    }
  }

  function clearTags() {
    document.getElementById(DESTINATION_TAGS_ELEMENT_ID).innerHTML = '';
    document.getElementById(SOURCE_TAGS_ELEMENT_ID).innerHTML = '';
  }

  function fillDestinationTag(tags) {
    addTagsToOption(DESTINATION_TAGS_ELEMENT_ID, tags)
    document.getElementById(DESTINATION_TAGS_ELEMENT_ID).options[0].selected = true;
  }

  function fillSourceTags(tags) {
    addTagsToOption(SOURCE_TAGS_ELEMENT_ID, tags);
    document.getElementById(SOURCE_TAGS_ELEMENT_ID).options[1].selected = true;
  }

  function getDestinationTag() {
    return document.getElementById(DESTINATION_TAGS_ELEMENT_ID).value;
  }

  function getSourceTag() {
    return document.getElementById(SOURCE_TAGS_ELEMENT_ID).value;
  }

  function getTags(repo, cb) {
    if (getRepoName()) {
      var xhr = new XMLHttpRequest();

      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          var resp = JSON.parse(xhr.responseText);
          var result = [];
          if (Array.isArray(resp)) {
            result = resp;
          }
          cb(result);
        }
      }
      xhr.open("GET", 'https://api.github.com/repos/' + getUserName() + '/' + repo + '/tags?access_token='+ getToken(), true);
      xhr.send();
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initApp();
  });
})();