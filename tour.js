const tourSteps = [
    { element: '#toggleAddItem', content: 'Click here to add a new item to your list.' },
    { element: '#goalList', content: 'Your tasks will appear here. Click on a task to mark it as complete.' },
    { element: '#listSelect', content: 'Switch between different lists using this dropdown.' },
    { element: '#themeToggle', content: 'Toggle between light and dark mode here.' },
    // Add more steps as needed
];
  let currentStep = 0;
  let tourActive = false;

  function startTour() {
      console.log('Tour started');
      tourActive = true;
      showTourStep(currentStep);
      addTourEscapeListeners();
  }

  function addTourEscapeListeners() {
      document.addEventListener('keydown', handleEscapeKey);
      window.addEventListener('popstate', abortTour);
  }

  function removeTourEscapeListeners() {
      document.removeEventListener('keydown', handleEscapeKey);
      window.removeEventListener('popstate', abortTour);
  }

  function handleEscapeKey(event) {
      if (event.key === 'Escape') {
          abortTour();
      }
  }

  function abortTour() {
      if (tourActive) {
          const tooltip = document.querySelector('.tour-tooltip');
          if (tooltip) {
              tooltip.remove();
          }
          tourActive = false;
          removeTourEscapeListeners();
          console.log('Tour aborted');
      }
  }
    function endTour() {
      const finalTooltip = document.querySelector('.tour-final-tooltip');
      if (finalTooltip) {
          finalTooltip.remove();
      }
      tourActive = false;
      removeTourEscapeListeners();
  }
  
    function showTourStep(step) {
        if (!tourActive) return;
        if (step >= tourSteps.length) {
            showFinalStep();
            return;
        }

        const { element, content } = tourSteps[step];
        const targetElement = document.querySelector(element);

        setTimeout(() => {
            const tooltip = document.createElement('div');
            tooltip.className = 'tour-tooltip';

            const textContent = document.createElement('p');
            textContent.textContent = content;
            textContent.className = 'tour-content';
            tooltip.appendChild(textContent);

            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'tour-buttons';
    
            const nextButton = document.createElement('button');
            nextButton.textContent = 'Next';
            nextButton.className = 'tour-button';
            nextButton.onclick = () => {
                tooltip.remove();
                showTourStep(step + 1);
            };
            buttonContainer.appendChild(nextButton);

            if (step > 0) {
                const prevButton = document.createElement('button');
                prevButton.textContent = 'Previous';
                prevButton.onclick = () => {
                    tooltip.remove();
                    showTourStep(step - 1);
                };
                buttonContainer.appendChild(prevButton);
            }

            tooltip.appendChild(buttonContainer);
    
            // Position the tooltip next to the target element
            document.body.appendChild(tooltip);
            const targetRect = targetElement.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            const { top, left } = calculateTooltipPosition(targetRect, tooltipRect);
    
            tooltip.style.position = 'absolute';
            tooltip.style.top = `${top}px`;
            tooltip.style.left = `${left}px`;
        }, 500);
    }
    function calculateTooltipPosition(targetRect, tooltipRect) {
        const margin = 10;
        let top = targetRect.bottom + window.scrollY + margin;
        let left = targetRect.left + window.scrollX;

        if (left + tooltipRect.width > window.innerWidth) {
            left = window.innerWidth - tooltipRect.width - margin;
        }

        if (top + tooltipRect.height > window.innerHeight + window.scrollY) {
            top = targetRect.top + window.scrollY - tooltipRect.height - margin;
        }

        return { top, left };
    }

function showFinalStep() {
    const finalTooltip = document.createElement('div');
    finalTooltip.className = 'tour-final-tooltip';

    const textContent = document.createElement('p');
    textContent.textContent = 'Congratulations! You\'ve completed the tour of Camille\'s List.';
    textContent.className = 'tour-content';
    finalTooltip.appendChild(textContent);

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'tour-buttons';

    const finishButton = document.createElement('button');
    finishButton.textContent = 'Finish Tour';
    finishButton.className = 'tour-button';
    finishButton.onclick = endTour;
    buttonContainer.appendChild(finishButton);

    finalTooltip.appendChild(buttonContainer);

    document.body.appendChild(finalTooltip);

    // Center the tooltip
    finalTooltip.style.position = 'fixed';
    finalTooltip.style.top = '50%';
    finalTooltip.style.left = '50%';
    finalTooltip.style.transform = 'translate(-50%, -50%)';
}
