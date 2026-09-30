// --- 1. DOM ELEMENTS ---
const mealForm = document.getElementById('meal-form');
const daySelect = document.getElementById('day-select');
const mealTypeSelect = document.getElementById('meal-type');
const mealNameInput = document.getElementById('meal-name');
const mealCaloriesInput = document.getElementById('meal-calories');
const totalCaloriesDisplay = document.getElementById('total-calories');
const clearPlanButton = document.getElementById('clear-plan');

// --- 2. STATE MANAGER (LOCALSTORAGE) ---
// Load existing data from the browser storage, or start empty if it's the first run
let plannerData = JSON.parse(localStorage.getItem('mealPlannerData')) || {
    meals: {},      // Structure: { 'monday-breakfast': 'Oatmeal', 'tuesday-lunch': 'Salad' }
    calories: {}    // Structure: { 'monday-breakfast': 350, 'tuesday-lunch': 400 }
};

// --- 3. INITIALIZATION ---
// When the page first loads, populate the grid with any previously saved meals
document.addEventListener('DOMContentLoaded', () => {
    loadSavedPlan();
});

// --- 4. EVENT LISTENERS ---

// Handles adding a new meal when the form is submitted
mealForm.addEventListener('submit', function(event) {
    // Stops the page from refreshing (since you removed onsubmit from the HTML)
    event.preventDefault();

    // Extract raw input data
    const day = daySelect.value;         // e.g., "monday"
    const mealType = mealTypeSelect.value; // e.g., "breakfast"
    const mealName = mealNameInput.value.trim();
    const caloriesValue = parseInt(mealCaloriesInput.value) || 0;

    // Create a unique key combination for storage tracking (e.g., "monday-breakfast")
    const storageKey = `${day}-${mealType}`;

    // Save to our state object
    plannerData.meals[storageKey] = mealName;
    plannerData.calories[storageKey] = caloriesValue;

    // Save updated state to browser storage
    saveToLocalStorage();

    // Render updates dynamically to the screen layout grid
    updateMealUiSlot(day, mealType, mealName);
    calculateAndRenderTotalCalories();

    // Clear the input fields so they are clean for the next entry
    mealNameInput.value = '';
    mealCaloriesInput.value = '';
});

// Resets everything back to factory defaults when clear button is clicked
clearPlanButton.addEventListener('click', function() {
    clearWholeWeek();
});

// --- 5. CORE LOGIC & CORE UTILITIES ---

/**
 * Directly pushes visual data updates to the corresponding HTML element slot.
 */
function updateMealUiSlot(day, mealType, mealName) {
    const targetSelector = `#day-${day} [data-meal="${mealType}"] .meal-text`;
    const mealTextSpan = document.querySelector(targetSelector);

    if (mealTextSpan) {
        mealTextSpan.textContent = mealName;
        // Turn the border line teal to visually signal a filled meal slot
        mealTextSpan.parentElement.style.borderLeftColor = 'var(--primary-color)';
    }
}

/**
 * Calculates and updates the UI with the final global running tally of calories.
 */
function calculateAndRenderTotalCalories() {
    let grandTotal = 0;
    
    // Sum up all structural items inside our local storage tracking object
    for (const key in plannerData.calories) {
        grandTotal += plannerData.calories[key];
    }
    
    totalCaloriesDisplay.textContent = grandTotal;
}

/**
 * Loops through storage object values to paint the screen on fresh browser reloads.
 */
function loadSavedPlan() {
    // 1. Loop through all possible combinations and push existing meal texts to slots
    for (const key in plannerData.meals) {
        // Splitting "monday-breakfast" back into ["monday", "breakfast"]
        const [day, mealType] = key.split('-'); 
        const mealName = plannerData.meals[key];
        updateMealUiSlot(day, mealType, mealName);
    }
    
    // 2. Refresh total numeric summary metric
    calculateAndRenderTotalCalories();
}

/**
 * Converts state variables to strings and pushes updates to local storage cache.
 */
function saveToLocalStorage() {
    localStorage.setItem('mealPlannerData', JSON.stringify(plannerData));
}

/**
 * Flushes all data columns across state variables, UI layouts, and local storage caches.
 */
function clearWholeWeek() {
    // 1. Hard reset our internal tracker storage variables
    plannerData = { meals: {}, calories: {} };
    saveToLocalStorage();

    // 2. Fetch every single slot span container on screen and wipe placeholder texts
    const allMealTexts = document.querySelectorAll('.meal-text');
    allMealTexts.forEach(function(span) {
        span.textContent = 'Not planned yet';
        span.parentElement.style.borderLeftColor = '#cbd5e1'; // Reset side borders to dull gray
    });

    // 3. Reset running summary calorie tally
    calculateAndRenderTotalCalories();
}
