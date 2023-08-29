window.addEventListener('load', () => {
    const loadingScreen = document.querySelector('.loading-screen');
    const loadingProgress = document.querySelector('.loading-progress');
    const ruleNamesDiv = document.querySelector('.rule-names');
    const functionNamesDiv = document.querySelector('.function-names');
    const ruleNamesContainer = document.querySelector('.rule-names-container');
    const content = document.querySelector('.content');

    // Define the linkPromises array
    const linkPromises = [];
    let totalRuleCount = 0;
    let loadedRuleCount = 0;

    // Load CSS asynchronously and store promises in linkPromises
    function loadCSS(cssHref) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssHref;
        document.head.appendChild(link);
        const promise = new Promise((resolve, reject) => {
        link.onload = () => {
            const ruleCount = extractRuleCount(link.sheet);
            totalRuleCount += ruleCount;
            linkPromises.push({ link, ruleCount });
            resolve(link);
        };
        link.onerror = reject;
        });
        return promise;
    }

    function updateLoading() {
    if (linkPromises.length > 0) {
        const { link, ruleCount } = linkPromises.shift();
        loadedRuleCount += ruleCount;
        const classNames = extractClassNames(link.sheet);

        const stimulationInterval = 15; // Adjust stimulation interval as needed
        let currentIndex = 0;
        let currentLoadedCount = 0; // Track the count of class names that have reached 100%

        function stimulateNextClassName() {
            if (currentIndex < classNames.length) {
                const className = classNames[currentIndex];
                const progress = (currentIndex + 1) / classNames.length * 100;

                ruleNamesDiv.innerHTML += `<p>${className} - ${progress.toFixed(2)}%</p>`;
                ruleNamesContainer.scrollTop = ruleNamesDiv.scrollHeight;

                const classNameElement = ruleNamesDiv.querySelector(`p:last-child`);
                const interval = setInterval(() => {
                    const currentProgress = parseFloat(classNameElement.textContent.match(/- (\d+\.\d+)%/)[1]);
                    if (currentProgress < 100.00) {
                        const newProgress = Math.min(currentProgress + 1, 100.00);
                        classNameElement.textContent = `${className} - ${newProgress.toFixed(2)}%`;
                        functionNamesDiv.textContent = `Loaded rules: ${currentLoadedCount}/${totalRuleCount}`;
                    } else {
                        clearInterval(interval);
                        currentIndex++;
                        currentLoadedCount++;
                        functionNamesDiv.textContent = `Loaded rules: ${currentLoadedCount}/${totalRuleCount}`;
                        loadedRuleCount++; // Update loadedRuleCount in real time
                        stimulateNextClassName();
                    }
                }, stimulationInterval);
            } else {
                setTimeout(updateLoading, 100); // Continue loading other stylesheets
            }
        }

        stimulateNextClassName();
    } else {
        functionNamesDiv.textContent = `Loading Complete!\nAll rules loaded.`;

        // // Gradually lighten the loading screen background
        let alpha = 1;
        const alphaInterval = setInterval(() => {
            alpha -= 0.01; // Decrease the alpha to lighten the background
            loadingScreen.style.backgroundColor = `rgba(0, 0, 0, ${alpha})`;

        if (alpha <= 0) {
            clearInterval(alphaInterval);
            // Hide loading screen
            loadingScreen.style.display = 'none'; 
            // Show content
            content.style.display = 'block'; 
        }
        // Adjust the interval to control the speed of transition
        }, 30); 
        }
    }
    // Load CSS and update loading progress
    loadCSS('/static/openAI.css') // Load your CSS here
        .then(() => {
        updateLoading();
    });
});

function extractRuleCount(styleSheet) {
    const ruleCount = styleSheet.cssRules.length;
    return ruleCount;
}

function extractClassNames(styleSheet) {
    const classNames = [];
    for (const rule of styleSheet.cssRules) {
        if (rule.selectorText && rule.selectorText.startsWith('.')) {
        const className = rule.selectorText.substring(1);
        classNames.push(className);
        }
    }
    return classNames;
}