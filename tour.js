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
    console.log('Tour started');
    tourState.active = true;
    tourState.currentStep = 0;
    document.getElementById('startTourButton').style.display = 'none'; // Hide the button
    showTourStep(tourState.currentStep);
    addTourEscapeListeners();
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

function endTour() {
    removeTooltip('.tour-final-tooltip');
    tourState.active = false;
    removeTourEscapeListeners();
    localStorage.setItem('tourCompleted', 'true');
    document.getElementById('startTourButton').style.display = 'block'; // Show the button
}

function removeTooltip(selector) {
    const tooltip = document.querySelector(selector);
    if (tooltip) {
        tooltip.remove();
    }
}

function showTourStep(step) {
    if (!tourState.active) return;
    if (step >= tourSteps.length) {
        showFinalStep();
        return;
    }

    const { element, content } = tourSteps[step];
    const targetElement = document.querySelector(element);
    if (!targetElement) return;

    const isDarkModeStep = element === '#themeToggle';
    const initialTheme = isDarkModeStep ? document.body.classList.contains('dark-mode') : null;

    targetElement.addEventListener('click', function onTargetClick() {
        targetElement.removeEventListener('click', onTargetClick);

        if (isDarkModeStep) {
            setTimeout(() => {
                if (initialTheme !== document.body.classList.contains('dark-mode')) {
                    document.querySelector('#themeToggle').click();
                }
            }, 1000);
        }

        progressTour();
    });

    setTimeout(() => {
        const tooltip = createTooltip(content, step > 0);
        document.body.appendChild(tooltip);

        const targetRect = targetElement.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const { top, left, arrowPosition } = calculateTooltipPosition(targetRect, tooltipRect, step);

        tooltip.style.position = 'absolute';
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;

        const arrowSpan = tooltip.querySelector('.tour-arrow');
        arrowSpan.className = `tour-arrow tour-arrow-${arrowPosition}`;
        arrowSpan.textContent = getArrowDirection(targetRect, tooltipRect, arrowPosition);

        console.log('Step:', step);
        console.log('Target rect:', targetRect);
        console.log('Tooltip rect:', tooltipRect);
        console.log('Calculated position:', { top, left, arrowPosition });
    }, 500);
}

function createTooltip(content, showPrevButton) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tour-tooltip';

    tooltip.innerHTML = `
        <span class="tour-arrow"></span>
        <p class="tour-content">${content}</p>
        <div class="tour-buttons">
            <button class="tour-button next-button">Next</button>
            ${showPrevButton ? '<button class="tour-button prev-button">Previous</button>' : ''}
        </div>
    `;

    tooltip.querySelector('.next-button').onclick = () => {
        tooltip.remove();
        showTourStep(++tourState.currentStep);
    };

    if (showPrevButton) {
        tooltip.querySelector('.prev-button').onclick = () => {
            tooltip.remove();
            showTourStep(--tourState.currentStep);
        };
    }

    return tooltip;
}

function calculateTooltipPosition(targetRect, tooltipRect, step) {
    const margin = 10;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    let top, left, arrowPosition;

    // Special case for the theme toggle (step 4)
    if (step === 3) {  // 0-based index, so step 4 is index 3
        left = targetRect.left - tooltipRect.width - margin;
        top = targetRect.top;
        arrowPosition = 'right';

        // Adjust if the tooltip goes off the left side of the screen
        if (left < margin) {
            left = margin;
            arrowPosition = 'left';
        }

        // Adjust if the tooltip goes off the bottom of the screen
        if (top + tooltipRect.height > screenHeight - margin) {
            top = screenHeight - tooltipRect.height - margin;
        }

        // Adjust if the tooltip goes off the top of the screen
        if (top < margin) {
            top = margin;
        }
    } else {
        // Existing positioning logic for other steps
        if (targetRect.bottom + tooltipRect.height + margin <= screenHeight) {
            top = targetRect.bottom + margin;
            arrowPosition = 'top';
        } else if (targetRect.top - tooltipRect.height - margin >= 0) {
            top = targetRect.top - tooltipRect.height - margin;
            arrowPosition = 'bottom';
        } else {
            if (targetRect.left > screenWidth / 2) {
                left = targetRect.left - tooltipRect.width - margin;
                arrowPosition = 'right';
            } else {
                left = targetRect.right + margin;
                arrowPosition = 'left';
            }
            top = Math.max(margin, Math.min(screenHeight - tooltipRect.height - margin, targetRect.top));
        }

        if (left === undefined) {
            left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
            if (left < margin) {
                left = margin;
            } else if (left + tooltipRect.width > screenWidth - margin) {
                left = screenWidth - tooltipRect.width - margin;
            }
        }
    }

    return { top, left, arrowPosition };
}

function getArrowDirection(targetRect, tooltipRect, arrowPosition) {
    switch (arrowPosition) {
        case 'top': return arrowDirections.up;
        case 'bottom': return arrowDirections.down;
        case 'left': return arrowDirections.left;
        case 'right': return arrowDirections.right;
    }
}

function showFinalStep() {
    const finalTooltip = document.createElement('div');
    finalTooltip.className = 'tour-final-tooltip';
    finalTooltip.innerHTML = `
        <p class="tour-content">Congratulations! You've completed the tour of Camille's List.</p>
        <div class="tour-buttons">
            <button class="tour-button">Finish Tour</button>
        </div>
    `;

    finalTooltip.querySelector('.tour-button').onclick = endTour;
    document.body.appendChild(finalTooltip);

    finalTooltip.style.position = 'fixed';
    finalTooltip.style.top = '50%';
    finalTooltip.style.left = '50%';
    finalTooltip.style.transform = 'translate(-50%, -50%)';
}

function progressTour() {
    if (tourState.active) {
        const nextButton = document.querySelector('.tour-tooltip .next-button');
        if (nextButton) {
            nextButton.click();
        } else {
            const finishButton = document.querySelector('.tour-final-tooltip .tour-button');
            if (finishButton) {
                finishButton.click();
            }
        }
    }
}