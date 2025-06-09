<template>
  <div class="container-wrapper">
    <!-- Login Section -->

    <section class="login-section" id="login">
      <div class="login-page">
        <nav class="navbar">
          <div class="logo">
            <img src="/public/gcchnobg.png" alt="GCCH Logo" />
          </div>

          <ul class="nav-links">
            <li><a href="#login">Home</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#footer">Contact</a></li>
          </ul>
          <div class="datetime-container">
            <div class="datetime-wrapper">
              <span class="time-display">{{ currentTime }}</span>
              <span class="date-display">{{ currentDate }}</span>
            </div>
          </div>
        </nav>

        <div class="welcome-text">
          WELCOME TO GCCH
          <p>Explore New Career Opportunities and Build Your Future</p>
        </div>
      </div>

      <div class="login-container">
        <form class="login-form">
          <h2>LOGIN INTO YOUR ACCOUNT</h2>
          <button
            type="button"
            @click="redirectToGoogle"
            class="google-login-btn"
          >
            SIGN IN WITH GOOGLE
          </button>
        </form>
      </div>
    </section>

    <!-- About Us Section -->
    <section class="about-section" id="about">
      <div class="about-container">
        <h1 class="about-title">About us</h1>
        <div class="about-content">
          <div class="about-gcch">
            <div class="about-heading">
              <h2>About GCCH</h2>
            </div>
            <p>
              Our website connects individuals with job opportunities that match
              their interests. We aim to simplify the application process,
              helping job seekers find employment quickly and efficiently.
              Additionally, our platform benefits companies by providing access
              to a pool of talented students and graduates from Gordon College,
              ready to contribute their skills and knowledge.
            </p>
          </div>
          <div class="about-mission-vision">
            <div class="about-mission">
              <div class="about-heading">
                <h3>Our Mission</h3>
              </div>
              <p>
                To connect students and job seekers with meaningful
                opportunities, empowering them to achieve career growth through
                a simplified and efficient platform.
              </p>
            </div>
            <div class="about-vision">
              <div class="about-heading">
                <h4>Our Vision</h4>
              </div>
              <p>
                To become the leading platform that bridges students, graduates,
                and employers, fostering a future where talent meets opportunity
                seamlessly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="footer-section" id="footer">
      <footer class="footer">
        <div class="footer-container">
          <div class="footer-section">
            <h3>Navigation</h3>
            <a href="#login">Home</a>
            <a href="#about">About Us</a>
          </div>
          <div class="footer-section">
            <h3>CONTACT US</h3>
            <p>&#9993; GCCH@gordoncollege.edu.ph</p>
            <p>&#9742; 09991225486</p>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2025 GCCH. All Rights Reserved.</p>
        </div>
      </footer>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { createToast } from "mosha-vue-toastify";
import "mosha-vue-toastify/dist/style.css";

async function redirectToGoogle() {
  try {
    window.location.href = "https://Gordon-College-Career-Hub-Backend.onrender.com/auth/google/redirect";
  } catch (error) {
    console.error("Google redirect error:", error);
    createToast("Failed to connect with Google. Please try again.", {
      type: "danger",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
    });
  }
}

// Add error handling for authentication
function handleAuthError(error) {
  let message = "Authentication failed. Please try again.";

  if (error.response) {
    switch (error.response.status) {
      case 401:
        message = "Invalid credentials. Please check your email.";
        break;
      case 403:
        message = "Access denied. Please use a valid Gordon College email.";
        break;
      default:
        message = error.response.data.message || message;
    }
  }

  createToast(message, {
    type: "danger",
    position: "top-right",
    timeout: 4000,
    showIcon: true,
    toastBackgroundColor: "#045d56",
  });
}

// Update datetime functions with error handling
const currentTime = ref("");
const currentDate = ref("");
let timeInterval;

const updateDateTime = () => {
  try {
    const now = new Date();

    currentTime.value = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(now);

    currentDate.value = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(now);
  } catch (error) {
    console.error("DateTime update error:", error);
    createToast("Failed to update date/time display", {
      type: "warning",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
    });
  }
};

onMounted(() => {
  try {
    updateDateTime();
    timeInterval = setInterval(updateDateTime, 1000);
  } catch (error) {
    console.error("Mount error:", error);
    createToast("Failed to initialize date/time display", {
      type: "warning",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
    });
  }
});

onBeforeUnmount(() => {
  if (timeInterval) clearInterval(timeInterval);
});
</script>

<style>
body,
html {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: "Poppins", sans-serif;
  overflow: auto;
  overflow-x: hidden;
}

.container-wrapper {
  width: 100%;
}

.welcome-text {
  font-size: 5rem;
  font-weight: bold;
  color: #fff;
  margin-top: 8vh;
}

.welcome-text p {
  font-size: 1.9rem;
  color: #fff;
  margin-top: 1vh;
}

section {
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100vh;
  width: 100%;
}

.login-section {
  flex-shrink: 0;
  height: 100vh;
}

.login-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: url("/public/bgtest.jpg") no-repeat center center fixed;
  background-size: cover;
  min-height: 100vh;
}

.navbar {
  position: sticky;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 2rem;
  background-color: #f1f6f3;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid #ddd;
  z-index: 1000;
}

.logo img {
  height: 7vh;
  width: 13vh;
  margin-top: 1vh;
  margin-left: 4vh;
}

.nav-links {
  font-family: sans-serif;
  list-style: none;
  display: flex;
  gap: 20px;
  margin-top: 1.5vh;
  margin-right: 100vh;
}

.nav-links li a {
  text-decoration: none;
  color: #045d56;
  font-size: 1.2rem;
  padding: 10px 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.nav-links li a:hover {
  transform: scale(1.1) translateY(-3px);
  border-bottom: 2px solid #045d56;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  color: #033f3a;
}

.sign-up {
  padding: 10px 20px;
  margin-right: 6vh;
  font-family: sans-serif;
  background: #045d56;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  color: #eaedea;
}

.sign-up:hover {
  background: #97bbb7;
  color: #151515;
  transition: background 0.3s ease;
}

.overlay-modal {
  display: none;
  position: fixed;
  z-index: 9999;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: rgba(0, 0, 0, 0.7);
}

.signup-modal {
  background: #ffffff;
  padding: 2rem 2rem;
  border-radius: 16px;
  width: 60vh;
  height: 25vh;
  max-height: 65vh;
  max-width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  position: center;
  margin-left: 72vh;
  margin-top: 30vh;
  border: 1px solid #e5e7eb;
}

.signup-modal h2 {
  color: #045d56;
  font-weight: 700;
  font-size: 2.1rem;
  margin: 0 0 1.5rem;
  text-align: center;
}

.signup-form button {
  width: 12%;
  min-width: 110px;
  padding: 10px 20px;
  background: #045d56;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  margin-left: auto;
  margin-right: auto;
  display: block;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.signup-form button:hover {
  background-color: #045d56;
  transform: translateY(-2px);
}

.google-btn {
  background-color: #ffffff;
  color: #111827;
  border: 1px solid #d1d5db;
  transition: all 0.3s ease;
}
.google-btn:hover {
  background-color: #f3f4f6;
}

.auth-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;
}

.auth-buttons img {
  width: 24px;
  height: 24px;
}

.auth-buttons button {
  width: 40vh;
  max-width: 90%;
  padding: 12px 24px;
  font-size: 15px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  color: #111827;
  cursor: pointer;
  transition: all 0.3s ease;
}

.auth-buttons button:hover {
  background-color: #045d56;
  color: #ffffff;
  border-color: #3b82f6;
}

.login-container {
  position: absolute;
  top: 65%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff8f0;
  padding: 3rem;
  border-radius: 20px;
  border-color: #086972;
  border-width: 2px;
  border-style: solid;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.6);
  text-align: center;
  height: 30vh;
  width: 50vh;
}

.login-form h2 {
  font-size: 5vh;
  margin-top: -0.5vh;
  margin-bottom: 1.5 rem;
  font-family: "Arial", sans-serif;
  color: #17224d;
  letter-spacing: 0.5px;
}

.login-form p {
  font-size: 1rem;
  font-weight: bold;
  font-family: "Arial", sans-serif;
  color: #17224d;
  text-align: left;
}

.login-input {
  padding: 12px;
  font-size: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  width: 100%;
  box-sizing: border-box;
}

.login-input:focus {
  border-color: #045d56;
  outline: none;
  box-shadow: 0 0 5px rgba(4, 93, 86, 0.5);
}

.login-btn {
  padding: 12px 20px;
  background-color: #045d56;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  width: 80%;
  margin-top: 1rem;
}

.login-btn:hover {
  background-color: #f1f1f1;
  color: #045d56;
  transition: background-color 0.3s ease;
}

.google-login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 12px 14px;
  background-color: #ffffff;
  color: #3c4043;
  border: 1px solid #dadce0;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  margin-top: 8vh;
  position: relative;
}

.google-login-btn::before {
  content: "";
  background-image: url("/public/google.png");
  background-size: 18px;
  background-repeat: no-repeat;
  width: 18px;
  height: 18px;
  position: absolute;
  left: 5vh;
  top: 50%;
  transform: translateY(-50%);
}

.google-login-btn:hover {
  background-color: #f8f9fa;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.about-section {
  flex-grow: 1;
}

.about-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #374151;
  background: linear-gradient(to right, #e8f5f2, #cfeeea);
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
}

.about-title {
  font-size: 4.5rem;
  font-weight: 800;
  color: #045d56;
  margin-top: 5vh;
  margin-bottom: 2vh;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 3px;
}

.about-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  width: 100%;
  max-width: 180vh;
}

.about-gcch {
  background: #ffffff;
  height: 61vh;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.about-mission,
.about-vision {
  background: #ffffff;
  height: fit-content;
  padding: 2rem;
  height: 25vh;
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.about-gcch:hover,
.about-mission:hover,
.about-vision:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.about-heading h2,
.about-heading h3,
.about-heading h4 {
  color: #045d56;
  margin-top: -1vh;
  margin-bottom: 1rem;
  font-size: 3rem;
  text-align: center;
}

.about-gcch p,
.about-mission p,
.about-vision p {
  font-size: 1.3rem;
  line-height: 1.6;
  text-align: justify;
}

.about-mission-vision {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.footer-section {
  background-color: #0f8073;
  color: white;
  height: 18vh;
  text-align: center;
}

.footer-container {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  max-width: 100%;
}

.footer-section h3 {
  font-weight: bold;
}
.footer-section a {
  color: white;
  text-decoration: none;
  display: block;
  margin-top: 5px;
}
.footer-section a:hover {
  text-decoration: underline;
}
.footer-bottom {
  border-top: 1px solid white;
  background-color: #0f8073;
  margin-top: 1px;
  font-size: 14px;
}
.footer-bottom p {
  margin: 0;
  padding: 10px;
  color: white;
  font-size: 14px;
  text-align: center;
}
.datetime-container {
  background: linear-gradient(135deg, #40c9a2, #045d56);
  background-size: 400% 400%;
  animation: gradientShift 6s ease infinite;
  padding: 6px 20px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(4, 93, 86, 0.1);
  margin-right: 20px;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.datetime-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.time-display {
  color: #ffffff;
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 1px;
}

.date-display {
  color: #e0f2f1;
  font-size: 0.65rem;
  font-weight: 500;
}

@media (max-width: 1024px) {
  /* login part */

  .navbar {
    position: sticky;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 2rem;
    background-color: #f1f6f3;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    border-bottom: 1px solid #ddd;
    z-index: 1000;
  }

  .nav-links {
    font-family: sans-serif;
    list-style: none;
    display: flex;
    gap: 20px;
    margin-top: 1.5vh;
    margin-right: 10vh;
  }

  .nav-links li a:hover {
    transform: scale(1.1) translateY(-3px);
    border-bottom: 2px solid #045d56;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    color: #033f3a;
  }

  .welcome-text {
    font-size: 3rem;
    font-weight: bold;
    color: #fff;
    margin-top: 5vh;
  }

  .welcome-text p {
    font-size: 1rem;
    margin-top: 1vh;
    text-align: center;
  }

  .signup-modal {
    background: #ffffff;
    padding: 2.5rem 3rem;
    border-radius: 16px;
    width: 50vh;
    height: 30vh;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    position: center;
    margin-left: 49vh;
    margin-top: 33vh;
    border: 1px solid #e5e7eb;
  }

  .signup-modal h2 {
    color: #045d56;
    font-weight: 700;
    font-size: 1.5rem;
    margin: 0 0 1.5rem;
    text-align: center;
  }

  .signup-form button {
    width: 40vh;
    background: #045d56;
    color: #ffffff;
    border: none;
    font-weight: 400;
    cursor: pointer;
    margin-top: 5vh;
    transition: background-color 0.3s ease, transform 0.2s ease;
  }

  .signup-form button:hover {
    background-color: #045d56;
    transform: translateY(-2px);
  }

  .signup-toggle {
    display: flex;
    justify-content: center;
    margin-bottom: 1vh;
    gap: 2rem;
  }
  /* about us section */
  .about-section {
    flex-grow: 1;
  }

  .about-title {
    font-size: 4.3rem;
    font-weight: 800;
    color: #045d56;
    margin-top: 5vh;
    margin-bottom: 2vh;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 3px;
  }

  .about-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    width: 80%;
    max-width: 180vh;
  }

  .about-gcch {
    background: #ffffff;
    height: 50vh;
    padding: 2rem;
    border-radius: 15px;
    margin-top: 6vh;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  .about-gcch p,
  .about-mission p,
  .about-vision p {
    font-size: 1.1rem;
    line-height: 1.6;
    text-align: justify;
  }
  /* footer */
  .footer-section {
    background-color: #0f8073;
    color: white;
    height: 14vh;
    font-size: 12px;
    text-align: center;
  }
  .footer-bottom p {
    font-size: 12px;
  }
}

@media (max-width: 768px) {
  /* login part */
  .login-container {
    top: 65%;
    left: 50%;
    padding: 2rem;
    height: 50vh;
    width: 50vh;
  }

  .login-form h2 {
    font-size: 1.5rem;
    margin-top: -0.5vh;
  }

  .login-form p {
    font-size: 1rem;
  }

  .login-btn {
    margin-top: 1vh;
  }

  .nav-links li a {
    font-size: 1.1rem;
  }
  .signup-modal {
    background: #ffffff;
    padding: 2.5rem 3rem;
    border-radius: 16px;
    width: 50vh;
    height: 30vh;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    position: center;
    margin-left: 28.5vh;
    margin-top: 33vh;
    border: 1px solid #e5e7eb;
  }

  /* about us section */
  .about-section {
    flex-grow: 1;
  }

  .about-title {
    font-size: 3.5rem;
    font-weight: 800;
    color: #045d56;
    margin-top: 5vh;
    margin-bottom: 2vh;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 3px;
  }

  .about-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    width: 80%;
    max-width: 180vh;
  }

  .about-gcch {
    background: #ffffff;
    height: 50vh;
    padding: 2rem;
    border-radius: 15px;
    margin-top: 6vh;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }
  .about-heading h2,
  .about-heading h3,
  .about-heading h4 {
    font-size: 2rem;
  }
  .about-gcch p,
  .about-mission p,
  .about-vision p {
    font-size: 0.9rem;
    line-height: 1.6;
    text-align: justify;
  }
  .datetime-container {
    padding: 8px 15px;
  }

  .time-display {
    font-size: 1rem;
  }

  .date-display {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .welcome-text {
    font-size: 2rem;
    font-weight: bold;
    color: #fff;
    margin-top: 10vh;
    text-align: center;
  }

  .welcome-text p {
    font-size: 0.9rem;
    margin-top: 1vh;
    text-align: center;
  }
  .login-container {
    top: 65%;
    left: 50%;
    padding: 2rem;
    height: 29vh;
    width: 30vh;
  }

  .login-form h2 {
    font-size: 1rem;
    margin-top: -0.5vh;
  }

  .login-form p {
    font-size: 1rem;
  }

  .login-btn {
    margin-top: 1vh;
  }

  /* about us section */
  .about-section {
    flex-grow: 1;
  }

  .about-title {
    font-size: 2.5rem;
    font-weight: 800;
    color: #045d56;
    margin-top: 5vh;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 3px;
  }

  .about-content {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-top: -5vh;
  }

  .about-gcch {
    background: #ffffff;
    height: 20vh;
    padding: 2rem;
    border-radius: 15px;
    margin-top: 6vh;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  .about-mission,
  .about-vision {
    background: #ffffff;
    height: fit-content;
    padding: 2rem;
    height: 10vh;
    border-radius: 15px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }
  .about-heading h2,
  .about-heading h3,
  .about-heading h4 {
    font-size: 1rem;
  }
  .about-gcch p,
  .about-mission p,
  .about-vision p {
    font-size: 0.5rem;
    line-height: 1.6;
    text-align: justify;
  }
  .datetime-container {
    padding: 6px 12px;
    margin-right: 10px;
  }

  .time-display {
    font-size: 0.9rem;
  }

  .date-display {
    font-size: 0.7rem;
  }

  .nav-links {
    display: none;
  }

  .google-login-btn {
    padding: 10px 20px;
    font-size: 14px;
  }

  .google-login-btn::before {
    left: 10px;
    background-size: 16px;
    width: 16px;
    height: 16px;
  }
}

@media (max-width: 320px) {
  .signup-modal {
    padding: 0.8rem;
  }

  .close-btn {
    font-size: 20px;
  }

  form input,
  form button {
    font-size: 12px;
  }
}
</style>
