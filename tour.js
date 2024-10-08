const tourSteps = [
    { element: '#toggleAddItem', content: 'Click here to add a new item to your list.' },
    { element: '#goalList', content: 'Your tasks will appear here. Click on a task to mark it as complete.' },
    { element: '#listSelect', content: 'Switch between different lists using this dropdown.' },
    { element: '#themeToggle', content: 'Toggle between light and dark mode here.' },
];

const tourState = {
    active: false,
    currentStep: 0
};

const arrowDirections = {
    left: '⬅️',
    right: '➡️',
    up: '⬆️',
    down: '⬇️'
};

function startTour() {
    console.log('Starting tour');
    tourState.active = true;
    tourState.currentStep = 0;
    document.getElementById('startTourButton').style.display = 'none';
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

    highlightElement(targetElement, step);
    
    tourState.currentStep = step;
    
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

    if (step === 3) { // Theme toggle step
        const tourContent = overlay.querySelector('.tour-content');
        tourContent.style.position = 'absolute';
        tourContent.style.bottom = '80px'; // Increase bottom margin
        tourContent.style.right = '20px';
        tourContent.style.left = 'auto';
        tourContent.style.maxWidth = '250px'; // Limit width to avoid covering the button
    }

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
    if (step === 3) { // Theme toggle step
        // Create a fixed position highlight that doesn't move the original element
        const rect = element.getBoundingClientRect();
        const highlightEl = document.createElement('div');
        highlightEl.className = 'tour-highlight-fixed';
        highlightEl.style.top = `${rect.top}px`;
        highlightEl.style.left = `${rect.left}px`;
        highlightEl.style.width = `${rect.width}px`;
        highlightEl.style.height = `${rect.height}px`;
        document.body.appendChild(highlightEl);
        
        // Add click event to the highlight element
        highlightEl.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            element.click(); // Trigger the original button's click
            progressTour();
        });
    } else {
        // For other elements, use the original highlighting method
        element.classList.add('tour-highlight');
        element.style.position = 'relative';
        element.style.zIndex = '1002';
    }

    element.addEventListener('click', progressTour);
}

function removeAllHighlights() {
    document.querySelectorAll('.tour-highlight').forEach(el => {
        el.classList.remove('tour-highlight');
        el.style.position = '';
        el.style.zIndex = '';
        el.removeEventListener('click', progressTour);
    });
    document.querySelectorAll('.tour-highlight-fixed').forEach(el => {
        el.removeEventListener('click', progressTour);
        el.remove();
    });
}

function endTour() {
    console.log('Ending tour');
    tourState.active = false;
    removeAllHighlights();
    localStorage.setItem('tourCompleted', 'true');
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
        document.getElementById('startTourButton').style.display = 'block'; // Show the button
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
