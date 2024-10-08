const sampleList = [
    { text: "Buy groceries", checked: false },
    { text: "Finish project report", checked: true },
    { text: "Call mom", checked: false },
    { text: "Go for a run", checked: false }
];

let originalList = [];

const tourSteps = [
    { element: '#toggleAddItem', content: 'Click here to add a new item to your list.' },
    { element: '#goalList li:nth-child(1)', content: 'This is an unchecked item. Click on it to mark it as complete.' },
    { element: '#goalList li:nth-child(2)', content: 'This is a completed item. Click on it to uncheck it.' },
    { element: '#listSelect', content: 'Switch between different lists using this dropdown.', allowInteraction: true },
    { element: '#themeToggle', content: 'Toggle between light and dark mode here.' },
];

const tourState = {
    active: false,
    currentStep: 0
};

function startTour() {
    console.log('Starting tour');
    tourState.active = true;
    tourState.currentStep = 0;
    document.getElementById('startTourButton').style.display = 'none';
    
    if (window.todoLists && window.currentList) {
        originalList = JSON.parse(JSON.stringify(window.todoLists[window.currentList]));
        window.todoLists[window.currentList] = JSON.parse(JSON.stringify(sampleList));
    } else {
        console.warn('todoLists or currentList is undefined. Using sample list for tour.');
        originalList = [];
    }
    
    if (typeof window.renderList === 'function') {
        window.renderList();
    } else {
        console.warn('renderList function is not available. Tour may not display correctly.');
    }
    
    showTourStep(tourState.currentStep);
}

function showTourStep(step) {
    console.log(`Showing step ${step}`);
    if (step >= tourSteps.length) {
        console.log('Tour completed');
        endTour();
        return;
    }

    removeAllHighlights();

    const { element, content } = tourSteps[step];
    console.log(`Step ${step}: ${element} - ${content}`);
    const targetElement = document.querySelector(element);

    if (!targetElement) {
        console.error(`Element not found: ${element}`);
        return;
    }

    const overlay = createOverlay(content, step);
    document.body.appendChild(overlay);

    const cleanup = highlightElement(targetElement, step);
    
    // Store cleanup function for later use
    tourState.currentCleanup = cleanup;

    addTourEscapeListeners();
}

function createOverlay(content, step) {
    const overlay = document.createElement('div');
    overlay.className = 'tour-overlay';

    overlay.innerHTML = `
        <div class="tour-content">
            <p>${content}</p>
            <div class="tour-buttons">
                ${step > 0 ? '<button class="tour-button prev-button">Previous</button>' : ''}
                <button class="tour-button next-button">${step < tourSteps.length - 1 ? 'Next' : 'Finish'}</button>
            </div>
        </div>
    `;

    const targetElement = document.querySelector(tourSteps[step].element);
    positionTourContent(overlay, targetElement);

    overlay.querySelector('.next-button').addEventListener('click', progressTour);

    if (step > 0) {
        overlay.querySelector('.prev-button').addEventListener('click', () => {
            removeOverlay();
            showTourStep(tourState.currentStep - 1);
        });
    }

    return overlay;
}

function highlightElement(element, step) {
    const tourStep = tourSteps[step];
    
    const highlightEl = document.createElement('div');
    highlightEl.className = 'tour-highlight-fixed';
    
    function updateHighlightPosition() {
        const rect = element.getBoundingClientRect();
        highlightEl.style.top = `${rect.top + window.scrollY}px`;
        highlightEl.style.left = `${rect.left + window.scrollX}px`;
        highlightEl.style.width = `${rect.width}px`;
        highlightEl.style.height = `${rect.height}px`;
    }
    
    updateHighlightPosition();
    document.body.appendChild(highlightEl);
    
    const scrollHandler = throttle(updateHighlightPosition, 100);
    window.addEventListener('scroll', scrollHandler);
    window.addEventListener('resize', scrollHandler);
    
    if (tourStep.allowInteraction) {
        element.addEventListener('change', handleListSelectChange);
    } else {
        highlightEl.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            progressTour();
        });
    }

    // Return a cleanup function
    return () => {
        window.removeEventListener('scroll', scrollHandler);
        window.removeEventListener('resize', scrollHandler);
        if (tourStep.allowInteraction) {
            element.removeEventListener('change', handleListSelectChange);
        }
        highlightEl.remove();
    };
}

function handleListSelectChange(event) {
    event.preventDefault();
    event.stopPropagation();
    const listSelect = document.getElementById('listSelect');
    const selectedValue = listSelect.value;
    
    // Call the switchList function if it exists
    if (typeof window.switchList === 'function') {
        window.switchList();
    }
    
    // Don't progress the tour automatically
    // The user will need to click the "Next" button to continue
}

function removeAllHighlights() {
    document.querySelectorAll('.tour-highlight').forEach(el => {
        el.classList.remove('tour-highlight');
        el.style.position = '';
        el.style.zIndex = '';
        el.removeEventListener('click', progressTour);
    });
    document.querySelectorAll('.tour-highlight-fixed').forEach(el => {
        el.remove();
    });
    const listSelect = document.getElementById('listSelect');
    if (listSelect) {
        listSelect.removeEventListener('change', handleListSelectChange);
    }
}

function endTour() {
    console.log('Ending tour');
    tourState.active = false;
    removeAllHighlights();
    
    // Call cleanup function if it exists
    if (tourState.currentCleanup) {
        tourState.currentCleanup();
        tourState.currentCleanup = null;
    }

    // Restore the original list
    window.todoLists[window.currentList] = originalList;
    window.renderList();
    
    localStorage.setItem('tourCompleted', 'true');
    document.getElementById('startTourButton').style.display = 'block';
}

function removeTooltip(selector) {
    const tooltip = document.querySelector(selector);
    if (tooltip) {
        tooltip.remove();
    }
}

function addTourEscapeListeners() {
    document.addEventListener('keydown', handleTourEscape);
    window.addEventListener('popstate', handleTourEscape);
}

function removeTourEscapeListeners() {
    document.removeEventListener('keydown', handleTourEscape);
    window.removeEventListener('popstate', handleTourEscape);
}

function handleTourEscape(event) {
    if (event.type === 'popstate' || event.key === 'Escape') {
        abortTour();
    } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        progressTour();
    }
}

function abortTour() {
    if (tourState.active) {
        removeTooltip('.tour-tooltip');
        tourState.active = false;
        removeTourEscapeListeners();
        
        // Restore the original list
        window.todoLists[window.currentList] = originalList;
        window.renderList();
        
        document.getElementById('startTourButton').style.display = 'block';
        console.log('Tour aborted');
    }
}

function progressTour() {
    removeOverlay();
    showTourStep(tourState.currentStep + 1);
}

function removeOverlay() {
    const overlay = document.querySelector('.tour-overlay');
    if (overlay) {
        overlay.remove();
    }
}

function positionTourContent(overlay, targetElement) {
    const tourContent = overlay.querySelector('.tour-content');
    const rect = targetElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Reset styles
    tourContent.style.position = 'absolute';
    tourContent.style.top = '';
    tourContent.style.bottom = '';
    tourContent.style.left = '';
    tourContent.style.right = '';
    
    if (rect.top > viewportHeight / 2) {
        // If target is in the bottom half, position content above
        tourContent.style.bottom = `${viewportHeight - rect.top + 10}px`;
    } else {
        // Otherwise, position content below
        tourContent.style.top = `${rect.bottom + 10}px`;
    }
    
    if (rect.left > viewportWidth / 2) {
        // If target is in the right half, align content to the right
        tourContent.style.right = '20px';
    } else {
        // Otherwise, align content to the left
        tourContent.style.left = '20px';
    }
}

function handleScroll() {
    const listTitle = document.getElementById('listTitle');
    if (window.scrollY > 50 && !listTitle.classList.contains('shrunk')) {
        shrinkTitle();
    }
}