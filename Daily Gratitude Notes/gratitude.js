// ✏️ Drawing canvas logic
const canvas = document.getElementById("doodle");
const ctx = canvas.getContext("2d");
let drawing = false;
ctx.lineWidth = 4; // 👈 slightly thicker for darker stroke
ctx.strokeStyle = "#000000"; // pure black = darkest

ctx.lineCap = "round";
ctx.lineJoin = "round";
ctx.lineWidth = 4; // 👈 slightly thicker for darker stroke
ctx.strokeStyle = "#000000"; // pure black = darkest

// match the internal size to the displayed size
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

canvas.addEventListener("mouseup", () => (drawing = false));
canvas.addEventListener("mouseout", () => (drawing = false));
canvas.addEventListener("mouseleave", () => (drawing = false));
canvas.addEventListener("mousedown", (e) => {
  drawing = true;
  ctx.beginPath(); // 👈 resets the path so new stroke starts fresh
  ctx.moveTo(e.offsetX, e.offsetY);
});
canvas.addEventListener("mousemove", draw);

function draw(e) {
  if (!drawing) return;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#333";
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}

// ✋ TOUCH EVENTS (for mobile/tablet)
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  drawing = true;

  const rect = canvas.getBoundingClientRect();
  const x = e.touches[0].clientX - rect.left;
  const y = e.touches[0].clientY - rect.top;

  ctx.beginPath();
  ctx.moveTo(x, y);
});

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  if (!drawing) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.touches[0].clientX - rect.left;
  const y = e.touches[0].clientY - rect.top;

  ctx.lineTo(x, y);
  ctx.stroke();
});

canvas.addEventListener("touchend", () => (drawing = false));


document.getElementById("clearCanvas").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// 📸 Save gratitude section as image
document.getElementById("saveImage").addEventListener("click", () => {
  const gratitudeSection = document.getElementById("gratitude-section");

  html2canvas(gratitudeSection, { scale: 2 }).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");

    // Save image to localStorage
    let savedImages = JSON.parse(localStorage.getItem("gratitudeImages")) || [];
    savedImages.push(imgData);
    localStorage.setItem("gratitudeImages", JSON.stringify(savedImages));

    alert("✅ Gratitude note saved successfully!");
  });
});
