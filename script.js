
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
        lists[`🔁 ${presetName}`] = lists[currentListName];
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
            updateListWithImportedData(preset.items);
            currentListName = presetName;
            document.getElementById('listTitle').textContent = `${presetName.substring(2)} (preset)`;
            saveList(); // This will ensure the loaded preset is saved in the current format
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
let currentListName = 'CamillesList';
function getListsFromStorage() {
    return JSON.parse(localStorage.getItem('lists')) || {};
}

function saveListsToStorage(lists) {
    localStorage.setItem('lists', JSON.stringify(lists));
}

function saveList() {
    try {
        const items = Array.from(document.querySelectorAll('#goalList li')).map(item => ({
            text: item.textContent,
            checked: item.classList.contains('checked')
        }));
        const lists = getListsFromStorage();
        lists[currentListName] = {
            items: items,
            isPreset: currentListName.startsWith('🔁')
        };
        saveListsToStorage(lists);
        updateListDropdown();
        generateExportLink();
    } catch (error) {
        console.error('Error saving list:', error);
        alert('There was an error saving your list. Please try again.');
    }
}function createListItem(text, checked = false) {
    const li = document.createElement('li');
    li.textContent = text;
    if (checked) li.classList.add('checked');
    return li;
}
function loadList(listName = 'CamillesList') {
    const lists = getListsFromStorage();
    const listData = lists[listName];
    const ul = document.getElementById('goalList');
    ul.innerHTML = '';

    if (listData && Array.isArray(listData.items)) {
        listData.items.forEach(item => {
            ul.appendChild(createListItem(item.text, item.checked));
        });
    } else if (Array.isArray(listData)) {
        listData.forEach(item => {
            ul.appendChild(createListItem(item.text, item.checked));
        });
    } else {
        console.warn(`List "${listName}" not found or in unexpected format. Creating empty list.`);
    }

    currentListName = listName;
    const displayName = listName.startsWith('🔁') ? `${listName.substring(2)} (preset)` : listName;
    document.getElementById('listTitle').textContent = displayName === 'CamillesList' ? "Camille's List" : displayName;
    toggleAddItemView(false);
}
function createNewList() {
    document.getElementById('newListForm').style.display = 'block';
    let input = document.getElementById('newListName');
    input.focus();
    input.addEventListener('keyup', function (event) {
        if (event.key === 'Enter') {
            submitNewList();
        }
    });
}

function submitNewList() {
    let listName = document.getElementById('newListName').value.trim();
    if (listName) {
        currentListName = listName;
        document.getElementById('goalList').innerHTML = '';
        saveList();
        loadList(listName);
        cancelNewList();
        toggleAddItemView(true);
    }
}

function cancelNewList() {
    document.getElementById('newListForm').style.display = 'none';
    document.getElementById('newListName').value = '';
}
function renameList() {
    document.getElementById('renameListForm').style.display = 'block';
    let input = document.getElementById('newListNameInput');
    input.value = currentListName;
    input.focus();
    input.addEventListener('keyup', function (event) {
        if (event.key === 'Enter') {
            submitRenameList();
        }
    });
}

function submitRenameList() {
    let newName = document.getElementById('newListNameInput').value.trim();
    if (newName && newName !== currentListName) {
        let lists = JSON.parse(localStorage.getItem('lists')) || {};
        if (lists[newName]) {
            alert('A list with this name already exists. Please choose a different name.');
            return;
        }
        lists[newName] = lists[currentListName];
        delete lists[currentListName];
        localStorage.setItem('lists', JSON.stringify(lists));
        currentListName = newName;
        let displayTitle = newName === 'CamillesList' ? "Camille's List" : newName;
        document.getElementById('listTitle').textContent = displayTitle;
        updateListDropdown();
        cancelRenameList();
    }
}

function cancelRenameList() {
    document.getElementById('renameListForm').style.display = 'none';
}
function switchList() {
    let listName = document.getElementById('listSelect').value;
    if (listName.startsWith('🔁')) {
        const presetName = listName.substring(2);
        const lists = getListsFromStorage();
        const preset = lists[listName];
        if (preset) {
            updateListWithImportedData(preset);
            document.getElementById('listTitle').textContent = `${presetName} (preset)`;
            currentListName = listName;
        }
    } else {
        loadList(listName);
    }
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
    const reader = new FileReader();    reader.onload = function (e) {
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

    if (isPreset) {
        currentListName = `🔁 ${currentListName}`;
    }
    saveList();
    updateListDropdown();
}function getListData() {
    return Array.from(document.querySelectorAll('#goalList li')).map(item => ({
        text: item.textContent,
        checked: item.classList.contains('checked')
    }));
}
function exportList() {
    const list = getListData();
    const content = JSON.stringify({
        items: list,
        isPreset: currentListName.startsWith('🔁')
    }, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentListName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
function generateExportLink() {
    const list = getListData();
    const encodedList = encodeURIComponent(JSON.stringify(list));
    const encodedListName = encodeURIComponent(currentListName);
    const url = `${window.location.origin}${window.location.pathname}?name=${encodedListName}&list=${encodedList}`;
    window.history.pushState({}, '', url);
    console.log('Copy this link:', url);
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

function handleEnterKey(inputElement, submitFunction) {
    inputElement.addEventListener('keyup', function (event) {
        if (event.key === 'Enter') {
            submitFunction();
        }
    });
}

handleEnterKey(document.getElementById('newListName'), submitNewList);
handleEnterKey(document.getElementById('newListNameInput'), submitRenameList);
handleEnterKey(document.getElementById('newItem'), addNewItem);

const APP_VERSION = '5.2.4';

document.addEventListener('DOMContentLoaded', () => {
    startTour();
});