document.addEventListener('DOMContentLoaded', () => {
    const galleryContainer = document.getElementById('galleryContainer');

    // --- Image Loading ---
    function loadSavedImages() {
        // Clear the current container
        galleryContainer.innerHTML = '';
        
        // Get the array of image data URLs from Local Storage
        const savedImages = JSON.parse(localStorage.getItem('savedMoodTrackers')) || [];

        if (savedImages.length === 0) {
            galleryContainer.innerHTML = '<p>No saved trackers yet. Go to the main page to save one!</p>';
            return;
        }

        // Display images in reverse order (newest first)
        savedImages.forEach((imageDataUrl, index) => {
            const card = document.createElement('div');
            card.classList.add('saved-image-card');
            
            const img = document.createElement('img');
            img.src = imageDataUrl;
            img.alt = `Saved Mood Tracker #${savedImages.length - index}`; // Unique label

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.textContent = 'Delete 🗑️';
            // Use the index of the image in the current array
            deleteBtn.dataset.index = index; 

            // Attach deletion handler
            deleteBtn.addEventListener('click', handleDelete);

            card.appendChild(img);
            card.appendChild(deleteBtn);
            galleryContainer.appendChild(card);
        });
    }

    // --- Image Deletion ---
    function handleDelete(event) {
        // Get the index of the image to delete from the button's data attribute
        const indexToDelete = parseInt(event.target.dataset.index);

        if (confirm("Are you sure you want to permanently delete this saved tracker?")) {
            let savedImages = JSON.parse(localStorage.getItem('savedMoodTrackers')) || [];
            
            // Remove the image data URL at the specific index
            savedImages.splice(indexToDelete, 1); 
            
            // Save the updated list back to Local Storage
            localStorage.setItem('savedMoodTrackers', JSON.stringify(savedImages));
            
            // Reload the gallery to reflect the change
            loadSavedImages();
        }
    }

    // Load the images when the gallery page opens
    loadSavedImages();
});