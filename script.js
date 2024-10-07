function saveAsPreset() {
    document.getElementById('savePresetForm').style.display = 'block';
    let input = document.getElementById('presetNameInput');
    input.value = '';
    input.focus();
}
function submitSavePreset() {
    const presetName = document.getElementById('presetNameInput').value.trim();
    if (presetName) {
        const lists = getListsFromStorage();
        lists[`🔁 ${presetName}`] = { items: getListData(), isPreset: true };
        saveListsToStorage(lists);
        updateListDropdown();
        cancelSavePreset();
    }
}
function cancelSavePreset() {
    document.getElementById('savePresetForm').style.display = 'none';
} function loadPreset() {
    const presetName = document.getElementById('presetSelect').value;
    if (presetName) {
        const lists = getListsFromStorage();
        const preset = lists[presetName];
        if (preset && preset.items) {
            updateListWithImportedData(preset.items, true);
            currentListName = presetName;
            document.getElementById('listTitle').textContent = `${presetName.substring(2)} (preset)`;
            saveList();
        }
    }
}
document.getElementById('goalList').addEventListener('click', function (e) {
    if (e.target.tagName === 'LI') {
        e.target.classList.toggle('checked');
        saveList();
    }
});
function addNewItem() {
    var input = document.getElementById("newItem");
    if (input.value.trim() === "") {
        toggleAddItemView(false);
        return;
    }
    var li = document.createElement("li");
    li.textContent = input.value;
    document.getElementById("goalList").appendChild(li);
    input.value = "";
    input.focus();
    saveList();
}
function clearCompleted() {
    var checkedItems = document.querySelectorAll('li.checked');
    checkedItems.forEach(item => item.remove());
    saveList();
}
let currentListName = "Camille's List";
function getListsFromStorage() {
    return JSON.parse(localStorage.getItem('lists')) || {};
}

function saveListsToStorage(lists) {
    localStorage.setItem('lists', JSON.stringify(lists));
}

function saveList() {
    try {
        const lists = getListsFromStorage();
        lists[currentListName] = {
            items: getListData(),
            isPreset: currentListName.startsWith('🔁')
        };
        saveListsToStorage(lists);
        updateListDropdown();
        generateExportLink();
    } catch (error) {
        console.error('Error saving list:', error);
        alert('There was an error saving your list. Please try again.');
    }
} function createListItem(text, checked = false) {
    const li = document.createElement('li');
    li.textContent = text;
    if (checked) li.classList.add('checked');
    return li;
}
function loadList(listName = "Camille's List") {
    let lists = getListsFromStorage();
    if (!lists[listName]) {
        lists[listName] = { items: [] };
        saveListsToStorage(lists);
    }
    const listData = lists[listName];
    const ul = document.getElementById('goalList');
    ul.innerHTML = '';

    if (Array.isArray(listData.items)) {
        listData.items.forEach(item => {
            ul.appendChild(createListItem(item.text, item.checked));
        });
    } else {
        console.warn(`List "${listName}" in unexpected format. Resetting to empty list.`);
        lists[listName] = { items: [] };
        saveListsToStorage(lists);
    }

    currentListName = listName;
    const displayName = listName.startsWith('🔁') ? `${listName.substring(2)} (preset)` : listName;
    const listTitle = document.getElementById('listTitle');
    listTitle.textContent = displayName;

    // Apply fancy styling for "Camille's List"
    if (listName === "Camille's List") {
        listTitle.classList.add('camilles-list');
    } else {
        listTitle.classList.remove('camilles-list');
    }
    toggleAddItemView(false);
}
function handleListNameChange(action) {
    const formId = action === 'create' ? 'newListForm' : 'renameListForm';
    const inputId = action === 'create' ? 'newListName' : 'newListNameInput';

    document.getElementById(formId).style.display = 'block';
    let input = document.getElementById(inputId);
    input.value = action === 'rename' ? currentListName : '';
    input.focus();
}

function createNewList() {
    handleListNameChange('create');
}

function renameList() {
    handleListNameChange('rename');
}

function submitListNameChange(action) {
    const inputId = action === 'create' ? 'newListName' : 'newListNameInput';
    let listName = document.getElementById(inputId).value.trim();

    if (listName) {
        if (action === 'rename' && listName === currentListName) return;

        let lists = getListsFromStorage();
        if (lists[listName]) {
            alert('A list with this name already exists. Please choose a different name.');
            return;
        }

        if (action === 'rename') {
            lists[listName] = lists[currentListName];
            delete lists[currentListName];
        } else {
            lists[listName] = { items: [] };
        }

        saveListsToStorage(lists);
        currentListName = listName;
        document.getElementById('listTitle').textContent = listName;
        if (listName === "Camille's List") {
            document.getElementById('listTitle').classList.add('camilles-list');
        } else {
            document.getElementById('listTitle').classList.remove('camilles-list');
        }
        updateListDropdown();
        loadList(listName);

        if (action === 'create') {
            toggleAddItemView(true);
        }

        document.getElementById(action === 'create' ? 'newListForm' : 'renameListForm').style.display = 'none';
    }
}

function submitNewList() {
    submitListNameChange('create');
}

function submitRenameList() {
    submitListNameChange('rename');
}

function cancelListNameChange(formId) {
    document.getElementById(formId).style.display = 'none';
}

function switchList() {
    let listName = document.getElementById('listSelect').value;
    loadList(listName);
}

function deleteList() {
    let deleteButton = document.getElementById('deleteListButton');
    if (deleteButton.textContent === 'Delete List') {
        deleteButton.textContent = 'Confirm Delete';
        deleteButton.style.backgroundColor = 'red';
        setTimeout(() => {
            deleteButton.textContent = 'Delete List';
            deleteButton.style.backgroundColor = '';
        }, 3000);
    } else {
        let lists = JSON.parse(localStorage.getItem('lists')) || {};
        delete lists[currentListName];
        localStorage.setItem('lists', JSON.stringify(lists));
        updateListDropdown();
        loadList(Object.keys(lists)[0] || 'default');
    }
}
function updateListDropdown() {
    let lists = getListsFromStorage();
    let select = document.getElementById('listSelect');
    select.innerHTML = '';
    Object.keys(lists).forEach(listName => {
        let option = document.createElement('option');
        option.value = listName;
        option.textContent = listName;
        select.appendChild(option);
    });
    select.value = currentListName;
}

function getListFromURI() {
    const params = new URLSearchParams(window.location.search);
    const listParam = params.get('list');
    const listNameParam = params.get('name');
    const isPresetParam = params.get('isPreset');

    if (listNameParam) {
        currentListName = decodeURIComponent(listNameParam);
        document.getElementById('listTitle').textContent = currentListName;
    }

    if (listParam) {
        try {
            const list = JSON.parse(decodeURIComponent(listParam));
            const isPreset = isPresetParam === 'true';
            if (Array.isArray(list)) {
                updateListWithImportedData(list, isPreset);
            } else {
                console.error('List parameter is not an array');
            }
        } catch (e) {
            console.error('Error parsing list parameter:', e);
        }
    }
}
function generateExportLink() {
    const list = getListData();
    const encodedList = encodeURIComponent(JSON.stringify(list));
    const encodedListName = encodeURIComponent(currentListName);
    const isPreset = currentListName.startsWith('🔁');
    const url = `${window.location.origin}${window.location.pathname}?name=${encodedListName}&list=${encodedList}&isPreset=${isPreset}`;
    window.history.pushState({}, '', url);
    console.log('Copy this link:', url);
}

function doneAddingItems() {
    toggleAddItemView(false);
    saveList();
}

function importFile() {
    const file = document.getElementById('fileInput').files[0];
    const reader = new FileReader(); reader.onload = function (e) {
        const content = e.target.result;
        processImportedData(content, file.name.split('.').pop());
    };
    reader.readAsText(file);
}

function importTextData() {
    const content = document.getElementById('importTextArea').value;
    const format = detectFormat(content);
    processImportedData(content, format);
}

function detectFormat(content) {
    try {
        JSON.parse(content);
        return 'json';
    } catch (e) {
        return 'csv';
    }
}
function processImportedData(content, format) {
    const list = format === 'json' ? JSON.parse(content) : parseCSV(content);
    updateListWithImportedData(list);
}

function parseCSV(content) {
    const lines = content.split('\n');
    return lines.map(line => {
        const [text, checked] = line.split(',');
        return {
            text: text.trim(),
            checked: checked.trim().toLowerCase() === 'true'
        };
    }).filter(item => item.text !== '');
}
function updateListWithImportedData(list, isPreset) {
    const ul = document.getElementById('goalList');
    ul.innerHTML = '';

    const items = Array.isArray(list) ? list : (list && Array.isArray(list.items) ? list.items : []);

    items.forEach(item => {
        ul.appendChild(createListItem(item.text, item.checked));
    });

    if (isPreset && !currentListName.startsWith('🔁')) {
        currentListName = `🔁 ${currentListName}`;
    }
    saveList();
    updateListDropdown();
} function getListData() {
    return Array.from(document.querySelectorAll('#goalList li')).map(item => ({
        text: item.textContent,
        checked: item.classList.contains('checked')
    }));
}
function toggleImportExportControls() {
    const controls = document.getElementById('importExportControls');
    controls.classList.toggle('visible');
}
function toggleAddItemView(show) {
    var addItemDiv = document.getElementById('addItem');
    var toggleButton = document.getElementById('toggleAddItem');
    if (show) {
        addItemDiv.style.display = 'flex';
        addItemDiv.style.justifyContent = 'space-between';
        toggleButton.style.display = 'none';
        document.getElementById('newItem').focus();
    } else {
        addItemDiv.style.display = 'none';
        toggleButton.style.display = 'block';
    }
}
function loadThemePreference() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('themeToggle').textContent = '☀️';
    }
}
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const themeToggle = document.getElementById('themeToggle');
    const isDarkMode = document.body.classList.contains('dark-mode');
    themeToggle.textContent = isDarkMode ? '☀️' : '🌙';

    // Store the theme preference in localStorage
    localStorage.setItem('darkMode', isDarkMode);
}
function openTab(evt, tabName) {
    var i, tabContent, tabButtons;
    tabContent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
    }
    tabButtons = document.getElementsByClassName("tab-button");
    for (i = 0; i < tabButtons.length; i++) {
        tabButtons[i].className = tabButtons[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}
function initializeApp() {
    loadThemePreference();
    const lists = getListsFromStorage();
    if (!lists["Camille's List"]) {
        lists["Camille's List"] = { items: [] };
        saveListsToStorage(lists);
    }
    updateListDropdown();
    getListFromURI();
    loadList(currentListName);
    generateExportLink();
    document.getElementById('toggleAddItem').addEventListener('click', function () {
        toggleAddItemView(true);
    });
    document.getElementById('app-version').textContent = APP_VERSION;
}
window.onload = initializeApp;

// Consolidated function for handling Enter key press
function handleEnterKey(inputId, submitFunction) {
    document.getElementById(inputId).addEventListener('keyup', function (event) {
        if (event.key === 'Enter') {
            submitFunction();
        }
    });
}

// Use the consolidated function
handleEnterKey('newListName', submitNewList);
handleEnterKey('newListNameInput', submitRenameList);
handleEnterKey('newItem', addNewItem);
handleEnterKey('presetNameInput', submitSavePreset);

const APP_VERSION = '5.2.4';

document.addEventListener('DOMContentLoaded', () => {
    startTour();
});