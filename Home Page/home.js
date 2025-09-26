let username=localStorage.getItem('userfullname')
let unameblk=document.getElementById('uname')


let p_icon=document.getElementById('profile-icon')
let p_block=document.getElementById('profile-block')

let l_btn=document.getElementById('lbtn')

//-----------------------------------



async function loadStories(mood) {
  // Map moods to meaningful keywords for Gutendex search
  const mapping = {
    angry: "forgiveness compassion peace",
    anxiety: "courage calm mindfulness",
    bored: "adventure discovery creativity",
    confused: "wisdom clarity journey",
    disappointed: "hope resilience recovery",
    affected: "healing comfort kindness",
    fear: "bravery courage overcoming",
    guilt: "redemption self-acceptance forgiveness",
    annoyed: "patience perspective peace",
    envy: "gratitude contentment joy",
    upset: "soothing comfort inspiration"
  };

  const keyword = mapping[mood] || "inspiration";

  // Call Gutendex API with keyword
  const res = await fetch(`https://gutendex.com/books?search=${encodeURIComponent(keyword)}`);
  const data = await res.json();

  // Show up to 10 results
  const container = document.getElementById("stories");
  container.innerHTML = "";

  if (!data.results.length) {
    container.innerHTML = `<p>No stories found for mood: ${mood}</p>`;
    return;
  }

  data.results.slice(0,10).forEach(book => {
    const div = document.createElement("div");
    div.className = "story-card";
    div.innerHTML = `
      <h3>${book.title}</h3>
      <p><b>Author:</b> ${book.authors?.[0]?.name || "Unknown"}</p>
      <p><b>Theme:</b> ${book.subjects?.[0] || keyword}</p>
      <a href="${book.formats["text/plain; charset=utf-8"] 
               || book.formats["text/html"] 
               || book.formats["application/pdf"]}" 
         target="_blank">📖 Read Full Story</a>
      <hr>
    `;
    container.appendChild(div);
  });
}

// Example: load 10 stories for "anxiety"
loadStories("anxiety");




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
const imagesperPage = 8;
const videosperPage = 13; // Number of images to fetch

async function fetchPexelsImages() {
    try {
        const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${imagesperPage}`, {
            headers: {
                Authorization: API_KEY
            }
        });

        const data = await res.json();
        const container = document.getElementById('images-container');
         
        // Clear previous images

        data.photos.forEach(photo => {
            const card = document.createElement('div');
            card.classList.add('image-card');

            card.innerHTML = `
                <img src="${photo.src.medium}" alt="${photo.alt}">
                
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
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${videosperPage}`,
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
      // Filter horizontal videos only
      const horizontalFiles = video.video_files.filter(
        file => file.width > file.height && file.quality === "sd"
      );

      // Pick the first horizontal video available
      if (horizontalFiles.length > 0) {
        const videoFile = horizontalFiles[0];

        const card = document.createElement("div");
        card.classList.add("video-card");

        card.innerHTML = `
          <video controls>
            <source src="${videoFile.link}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
          
        `;

        container.appendChild(card);
      }
    });
  } catch (err) {
    console.error("Error fetching videos:", err);
  }
}

window.addEventListener("DOMContentLoaded", fetchPexelsVideos);


async function fetchYogaPoses() {
  try {
    const res = await fetch('https://yoga-api-nzy4.onrender.com/v1/poses');
    const data = await res.json();

    const container = document.getElementById('yoga-container');
    container.innerHTML = "";
    
    // Show first 6 poses only
    data.slice(0, 8).forEach(pose => {
      const card = document.createElement('div');
      card.classList.add('yoga-card');

      card.innerHTML = `
        <img src="${pose.url_png}" alt="${pose.english_name}">
        <h3>${pose.english_name}</h3>
        <p><strong>Sanskrit:</strong> ${pose.sanskrit_name}</p>
        <p><strong>Steps:</strong> ${pose.pose_benefits || "Follow standard breathing and posture."}</p>
      `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error("Yoga API Error:", err);
  }
}

window.addEventListener("DOMContentLoaded", fetchYogaPoses);


const FREESOUND_API_KEY = "nHcgFkyw5bOUq9Wqd2NY6u5aFFrAS2LZqlPLM3p6"; // Replace with your key
const audioQuery = "rain birds forest relaxing nature";

let currentlyPlayingAudio = null; // Track the currently playing audio

async function fetchNatureSounds() {
  try {
    const res = await fetch(
      `https://freesound.org/apiv2/search/text/?query=${encodeURIComponent(audioQuery)}&fields=id,name,previews,duration&filter=duration:[0 TO 600]&page_size=8&token=${FREESOUND_API_KEY}`
    );
    const data = await res.json();
    console.log("Freesound data:", data);

    const container = document.getElementById("sound-container");
    container.innerHTML = "";

    if (!data.results || data.results.length === 0) {
      container.innerHTML = "<p>No sounds found.</p>";
      return;
    }

    data.results.forEach(sound => {
      const card = document.createElement("div");
      card.classList.add("sound-card");
      card.innerHTML = `
        <h3>${sound.name}</h3>
        <audio controls>
          <source src="${sound.previews['preview-hq-mp3']}" type="audio/mpeg">
          Your browser does not support the audio element.
        </audio>
      `;
      container.appendChild(card);

      // Add event listener to control multiple audios
      const audioElement = card.querySelector("audio");
      audioElement.addEventListener("play", () => {
        if (currentlyPlayingAudio && currentlyPlayingAudio !== audioElement) {
          currentlyPlayingAudio.pause();
        }
        currentlyPlayingAudio = audioElement;
      });
    });
  } catch (err) {
    console.error("Freesound API Error:", err);
  }
}

window.addEventListener("DOMContentLoaded", fetchNatureSounds);
