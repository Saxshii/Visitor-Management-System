// Signup Validation
const signupForm = document.querySelector("#signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", function (event) {
    const name = document.querySelector("#name").value.trim();
    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#pass").value;
    const confirm = document.querySelector("#confirm").value;

    if (password.length < 6) {
      alert("Password length must be at least 6");
      event.preventDefault();
      return;
    }

    if (password !== confirm) {
      alert("Passwords didn't match. Try again!");
      event.preventDefault();
      return;
    }

    alert("Signup successful");
  });
}

// Login Validation
const loginForm = document.querySelector("#login-form");
if (loginForm) {
  loginForm.addEventListener("submit", function (event) {
    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#pass").value.trim();

    if (email === "" || password === "") {
      alert("Please enter valid email and password");
      event.preventDefault();
      return;
    }

    alert("Login successful");
  });
}

// Camera & Capture Logic
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const photoBtn = document.querySelector(".photo-btn");
const photoInput = document.getElementById("photo-input");
const generateForm = document.querySelector("form");

if (video && canvas && photoBtn && photoInput) {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
      video.srcObject = stream;
    })
    .catch((err) => {
      console.error("Camera access denied:", err);
    });

  photoBtn.addEventListener("click", () => {
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.style.display = "block";
    video.style.display = "none";

    const imageData = canvas.toDataURL("image/png");
    photoInput.value = imageData;
  });

  // Make photo mandatory before submit
  generateForm.addEventListener("submit", function (e) {
    if (!photoInput.value) {
      alert("Please capture the visitor's photo before submitting.");
      e.preventDefault();
    }
  });
}

// Phone Input Validation
const phoneInput = document.getElementById("phone-no");
if (phoneInput) {
  phoneInput.addEventListener("input", () => {
    let cleaned = phoneInput.value.replace(/\D/g, "");
    if (cleaned.length > 10) {
      cleaned = cleaned.slice(0, 10);
    }
    phoneInput.value = cleaned;
  });
}

