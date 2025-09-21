
const API_KEY = 'VrzngQzv2f12Yx0A4gexwxTBZLVcwynONmclhZGXuyW8fmZolJViHdH1';  // Replace with your Pexels API Key
const query = 'nature, calm, forest, relaxation'; // Soothing keywords
const perPage = 8; // Number of images to fetch

async function fetchPexelsImages() {
    try {
        const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}`, {
            headers: {
                Authorization: API_KEY
            }
        });

        const data = await res.json();
        const container = document.getElementById('images-container');
        console.log("Container:", container);  // Should NOT be null
        console.log("API Response:", data);   
        // Clear previous images

        data.photos.forEach(photo => {
            const card = document.createElement('div');
            card.classList.add('image-card');

            card.innerHTML = `
                <img src="${photo.src.medium}" alt="${photo.alt}">
                <p>${photo.photographer}</p>
            `;

            container.appendChild(card);
        });

    } catch (err) {
        console.error('Error fetching images:', err);
    }
}

// Call the function when page loads
window.addEventListener('DOMContentLoaded', fetchPexelsImages);