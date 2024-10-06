const tourSteps = [
    { element: '#toggleAddItem', content: 'Click here to add a new item to your list.' },
    { element: '#goalList', content: 'Your tasks will appear here. Click on a task to mark it as complete.' },
    { element: '#listSelect', content: 'Switch between different lists using this dropdown.' },
    { element: '#themeToggle', content: 'Toggle between light and dark mode here.' },
    // Add more steps as needed
];

let currentStep = 0;

function startTour() {
    console.log('Tour started');
    showTourStep(currentStep);
}
  function showTourStep(step) {
      if (step >= tourSteps.length) {
          endTour();
          return;
      }

      const { element, content } = tourSteps[step];
      const targetElement = document.querySelector(element);
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
      tooltip.style.position = 'absolute';
      tooltip.style.top = `${targetRect.bottom + window.scrollY}px`;
      tooltip.style.left = `${targetRect.left + window.scrollX}px`;
}function endTour() {
    alert('Tour completed! Enjoy using Camille\'s List!');
}
