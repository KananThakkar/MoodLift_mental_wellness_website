let username=localStorage.getItem('userfullname')
let unameblk=document.getElementById('uname')


let p_icon=document.getElementById('profile-icon')
let p_block=document.getElementById('profile-block')

let l_btn=document.getElementById('lbtn')




let m_btn=document.getElementById('mbtn')
let menu=document.getElementById('menu')       
m_btn.addEventListener('click',()=>{
    menu.classList.toggle("active")
})
function toggleSidebar() {
      let sidebar = document.getElementById("menu");
      let main = document.getElementById("main");
      let nav = document.getElementById("nav");
      if (sidebar.style.width === "0px") {
        sidebar.style.width = "250px";
        main.style.marginLeft = "250px";
        nav.style.marginLeft = "250px";
      } else {
        sidebar.style.width = "0px";
        main.style.marginLeft = "0px";
        nav.style.marginLeft = "0px";
      }
}



const API_KEY = 'VrzngQzv2f12Yx0A4gexwxTBZLVcwynONmclhZGXuyW8fmZolJViHdH1';  // Replace with your Pexels API Key
const query = 'mental wellness, calm, relaxation, mindfulness, nature, positive vibes, healing, peaceful, meditation, stress relief, self-care, happy life, soothing music, positive quotes, breathing exercises, yoga'; // Soothing keywords
const perPage = 12; // Number of images to fetch

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

async function fetchPexelsVideos() {
  try {
    const res = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${perPage}`,
      {
        headers: { Authorization: API_KEY }
      }
    );

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const data = await res.json();
    console.log("Video Data:", data);

    const container = document.getElementById("videos-container");
    container.innerHTML = "";

    data.videos.forEach(video => {
      // Pick a small/medium quality file for faster loading
      const videoFile = video.video_files.find(
        file => file.quality === "sd" && file.width <= 640
      );

      if (videoFile) {
        const card = document.createElement("div");
        card.classList.add("video-card");

        card.innerHTML = `
          <video controls>
            <source src="${videoFile.link}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
          <p>Video by ${video.user.name}</p>
        `;

        container.appendChild(card);
      }
    });
  } catch (err) {
    console.error("Error fetching videos:", err);
  }
}

window.addEventListener("DOMContentLoaded", fetchPexelsVideos);