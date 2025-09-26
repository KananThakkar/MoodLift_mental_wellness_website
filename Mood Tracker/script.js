document.addEventListener('DOMContentLoaded', () => {
    const moodGrid = document.getElementById('moodGrid');
    const legendOptions = document.querySelectorAll('.mood-option');
    const saveImageBtn = document.getElementById('saveImageBtn');
    
    // We no longer need savedImagesContainer on this page, but we keep the variable for reference
    // const savedImagesContainer = document.getElementById('savedImagesContainer'); 

    let selectedMoodColor = ''; 
    let selectedMoodData = ''; 

    const TODAY = new Date();
    const CURRENT_MONTH = TODAY.getMonth(); 
    const CURRENT_DAY = TODAY.getDate(); 
    
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; 

    // --- Grid Generation ---
    function generateMoodGrid() {
        moodGrid.innerHTML = '';

        // 1. Generate day numbers
        const dayNumbersContainer = document.querySelector('.day-numbers');
        dayNumbersContainer.innerHTML = '';
        for (let i = 1; i <= 31; i++) {
            const span = document.createElement('span');
            span.textContent = i;
            dayNumbersContainer.appendChild(span);
        }

        // 2. Generate grid cells
        for (let day = 1; day <= 31; day++) { 
            for (let month = 0; month < 12; month++) { 
                const pixel = document.createElement('div');
                pixel.classList.add('mood-pixel');
                pixel.dataset.month = month;
                pixel.dataset.day = day;

                let isPastOrToday = true;

                // Check if the day exists in the month
                if (day > daysInMonth[month]) {
                    pixel.classList.add('day-disabled');
                    isPastOrToday = false;
                } 
                
                // Check if the date is in the future
                if (isPastOrToday && (month > CURRENT_MONTH || (month === CURRENT_MONTH && day > CURRENT_DAY))) {
                    pixel.classList.add('future-date');
                    isPastOrToday = false;
                }

                // Highlight today's date
                if (month === CURRENT_MONTH && day === CURRENT_DAY) {
                    pixel.classList.add('today');
                }

                // Attach click listener only for valid past/today dates
                if (isPastOrToday) {
                    pixel.addEventListener('click', () => {
                        if (selectedMoodColor) {
                            pixel.style.backgroundColor = selectedMoodColor;
                            pixel.dataset.mood = selectedMoodData; 
                            saveMoodState();
                        } else {
                            alert("Please select a mood color first!");
                        }
                    });
                } else {
                    pixel.style.cursor = 'not-allowed';
                }

                moodGrid.appendChild(pixel);
            }
        }
    }

    // --- Mood Selection ---
    legendOptions.forEach(option => {
        option.addEventListener('click', () => {
            legendOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedMoodColor = option.style.backgroundColor;
            selectedMoodData = option.dataset.mood;
        });
    });

    // --- Local Storage for Mood State ---
    function saveMoodState() {
        const moodData = {};
        document.querySelectorAll('.mood-pixel').forEach(pixel => {
            if (pixel.dataset.mood && !pixel.classList.contains('day-disabled') && !pixel.classList.contains('future-date')) {
                const month = pixel.dataset.month;
                const day = pixel.dataset.day;
                if (!moodData[month]) {
                    moodData[month] = {};
                }
                moodData[month][day] = pixel.dataset.mood; 
            }
        });
        localStorage.setItem('yearInPixelsMoods', JSON.stringify(moodData));
    }

    function loadMoodState() {
        const storedMoods = localStorage.getItem('yearInPixelsMoods');
        if (storedMoods) {
            const moodData = JSON.parse(storedMoods);
            document.querySelectorAll('.mood-pixel').forEach(pixel => {
                const month = pixel.dataset.month;
                const day = pixel.dataset.day;
                
                if (moodData[month] && moodData[month][day]) {
                    const moodType = moodData[month][day];
                    const correspondingOption = document.querySelector(`.mood-option[data-mood="${moodType}"]`);
                    
                    if (correspondingOption) {
                        pixel.style.backgroundColor = correspondingOption.style.backgroundColor;
                        pixel.dataset.mood = moodType;
                    }
                }
            });
        }
    }

    // --- Image Saving ---
    // --- Image Saving (FIXED: Debounce Logic) ---
    saveImageBtn.addEventListener('click', () => {
        
        // 1. **DISABLE BUTTON IMMEDIATELY** to prevent double-clicks
        saveImageBtn.disabled = true;
        saveImageBtn.textContent = 'Saving... ⏳';

        const trackerToCapture = document.querySelector('.tracker-container');

        const currentSelected = document.querySelector('.mood-option.selected');
        if (currentSelected) {
             currentSelected.classList.remove('selected');
        }

        // html2canvas MUST be loaded in index.html for this to work
        html2canvas(trackerToCapture, {
            scale: 2, 
            logging: false, 
            useCORS: true,
            backgroundColor: '#ffffff'
        }).then(canvas => {
            // Re-apply the highlight after capture
            if (currentSelected) {
                currentSelected.classList.add('selected');
            }

            const imageDataUrl = canvas.toDataURL('image/png');

            // Save the image data URL to local storage
            saveSavedImage(imageDataUrl);
            
            // 2. **RE-ENABLE BUTTON AND CONFIRM** on success
            saveImageBtn.textContent = 'Saved! ✅';
            setTimeout(() => {
                saveImageBtn.textContent = 'Save Current Mood Tracker';
                saveImageBtn.disabled = false; // Re-enable the button after delay
            }, 2000);

        }).catch(error => {
            console.error('Error saving image:', error);
            alert("Could not save image. Check the browser console for details.");
            
            // 3. **RE-ENABLE BUTTON** on failure so user can try again
            saveImageBtn.textContent = 'Save Current Mood Tracker';
            saveImageBtn.disabled = false;
        });
    });

    function saveSavedImage(imageDataUrl) {
        let savedImages = JSON.parse(localStorage.getItem('savedMoodTrackers')) || [];
        savedImages.unshift(imageDataUrl); 
        localStorage.setItem('savedMoodTrackers', JSON.stringify(savedImages));
    }
    
    // ... rest of the script ...
    
    
    // -----------------------------------------------------------------
    // Function to load saved images is REMOVED from the main page script.
    // -----------------------------------------------------------------


    // --- Initial setup ---
    generateMoodGrid();
    loadMoodState();
    // loadSavedImages() is no longer called here!
});