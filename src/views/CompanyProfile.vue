<template>
  <div class="container">
    <div class="sidebar" :class="{ collapsed: !isSidenavOpen }">
      <img src="/public/gcchnobg.png" alt="GCCH Logo" class="logo" />
      <ul>
        <li>
          <router-link to="/CompanyDash" class="sidenav-text">
            <img src="/public/home.png" class="ikon" />
            DASHBOARD
          </router-link>
        </li>
        <li>
          <router-link to="/CompanyPost" class="sidenav-text">
            <img src="/public/laptop.png" class="ikon" /> POSTED JOBS
          </router-link>
        </li>
        <li>
          <router-link to="/companyaccepted" class="sidenav-text">
            <img src="/public/agreement.png" class="ikon" /> ACCEPTED
          </router-link>
        </li>
        <li>
          <router-link to="/CompanyMessage" class="sidenav-text">
            <img src="/public/message.png" class="ikon" />
            MESSAGES
          </router-link>
        </li>

        <li style="font-weight: bold">
          <router-link to="/CompanyProfile" class="sidenav-text">
            <img src="/public/user.png" class="ikon" />
            PROFILE
          </router-link>
        </li>
      </ul>
      <button class="sign-out" @click="toggleSignOut">
        <img src="/public/logout.png" alt="Sign Out Icon" />
      </button>

      <div v-if="showSignOut" class="popup-overlay" @click.self="toggleSignOut">
        <div class="popup signout-popup">
          <h3>⚠️ Sign Out</h3>
          <p>Are you sure you want to sign out?</p>
          <div class="signout-actions">
            <button class="cancel-btn" @click="toggleSignOut">Cancel</button>
            <button class="signout-btn" @click="confirmSignOut">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="main">
      <div class="topbar">
        <div class="left-top">
          <div class="hamburger" @click="isSidenavOpen = !isSidenavOpen">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <div class="icons-right">
          <div class="icon" @click="toggleNotif">
            <img src="/public/notification.png" />
            <span v-if="newNotifications > 0">{{ newNotifications }}</span>
          </div>
        </div>

        <div v-if="showNotif" class="popup-overlay" @click.self="toggleNotif">
          <div class="popup">
            <h3>🔔 Notifications</h3>
            <div
              v-for="(notif, index) in notifications"
              :key="index"
              class="notification-item"
            >
              <div class="notification-icon">
                <img
                  :src="getNotificationIcon(notif.type)"
                  alt="notification icon"
                  class="notif-icon"
                />
              </div>
              <div class="notification-content">
                <div class="notification-header">
                  <strong class="notification-type">{{
                    formatType(notif.type)
                  }}</strong>
                  <span v-if="notif.count > 1" class="notification-badge">
                    {{ notif.count }} new
                  </span>
                </div>
                <p class="notification-message">{{ notif.content }}</p>
                <small class="notification-time">
                  {{ new Date(notif.created_at).toLocaleString() }}
                </small>
              </div>
            </div>
            <button @click="toggleNotif">Close</button>
          </div>
        </div>
      </div>
      <div class="content">
        <div class="profile-wrapper">
          <div class="profile-card">
            <div class="form-group">
              <label class="profile-avatar-label">
                <img
                  :src="company.profile_picture_url"
                  alt="Profile"
                  class="profile-avatar"
                />
                <input
                  v-if="isEditing"
                  type="file"
                  accept="image/*"
                  @change="onImageChange"
                  style="display: none"
                />
              </label>
            </div>

            <div class="profile-form" v-if="company.company">
              <div class="form-row">
                <div class="form-group">
                  <label>Company Name</label>
                  <input
                    type="text"
                    :readonly="!isEditing"
                    v-model="fullName"
                    :placeholder="company.company.company_name"
                  />
                </div>
                <div class="form-group">
                  <label>Industry Type</label>
                  <input
                    type="text"
                    :readonly="!isEditing"
                    v-model="type"
                    :placeholder="company.company.industry_type"
                  />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Company Telephone</label>
                  <input
                    type="text"
                    oninput="this.value = this.value.replace(/[^0-9]/g, '')"
                    maxlength="11"
                    :readonly="!isEditing"
                    :placeholder="company.company.company_telephone"
                  />
                </div>
                <div class="form-group">
                  <label> Company Email Address</label>
                  <input
                    type="email"
                    :readonly="!isEditing"
                    v-model="email"
                    :placeholder="company.user.email"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    :readonly="!isEditing"
                    v-model="location"
                    :placeholder="company.company.street_address"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <input
                    type="text"
                    :readonly="!isEditing"
                    v-model="location"
                    :placeholder="company.company.city"
                  />
                </div>
                <div class="form-group">
                  <input
                    type="text"
                    :readonly="!isEditing"
                    v-model="location"
                    :placeholder="company.company.province"
                  />
                </div>
                <div class="form-group">
                  <input
                    type="text"
                    :readonly="!isEditing"
                    v-model="location"
                    :placeholder="company.company.country"
                  />
                </div>
              </div>

              <div class="btn-group"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axiosInstance from '../plugins/axios'; 
import { useRouter } from "vue-router";
import { createToast } from "mosha-vue-toastify";
import "mosha-vue-toastify/dist/style.css";

const router = useRouter();

// Reactive state variables
const showMail = ref(false);
const showNotif = ref(false);
const showSignOut = ref(false);
const unreadMessages = ref(0);
const newNotifications = ref(0);
const isSidenavOpen = ref(true);

//For Notifications
const notifications = ref([]);

//User Data
const company = ref({});

// NavBar Logic
function toggleMail() {
  showMail.value = !showMail.value;
  if (showMail.value) {
    unreadMessages.value = 0;
  }
}
function toggleNotif() {
  showNotif.value = !showNotif.value;
  if (showNotif.value) {
    newNotifications.value = 0;
  }
}
function toggleSignOut() {
  showSignOut.value = !showSignOut.value;
}
async function confirmSignOut() {
  try {
    const token = localStorage.getItem('token');
    await axiosInstance.post("/logout", {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    localStorage.clear();
    delete axiosInstance.defaults.headers.common['Authorization'];

    createToast("Successfully signed out", {
      type: "success",
      position: "top-right",
      timeout: 2000,
      showIcon: true
    });

    // Wait a moment for the toast to show, then redirect
    setTimeout(() => {
      router.push("/login");
    }, 500);

  } catch (error) {
    console.error("Error signing out:", error);
    createToast("Failed to sign out", {
      type: "danger",
      position: "top-right",
      timeout: 3000,
      showIcon: true
    });
  }
}

async function fetchUserData() {
  try {
    const userId = localStorage.getItem("user_id");
    const response = await axiosInstance.get(`user/company/${userId}`);
    company.value = response.data;
    console.log("Fetched User Data", response.data);
    createToast("Profile loaded successfully", {
      type: "success",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
      toastBackgroundColor: "#045d56",
    });
  } catch (error) {
    console.error("Failed to fetch user data", error);
    createToast("Failed to load profile data", {
      type: "danger",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
    });
  }
}

async function fetchNotifications() {
  try {
    const response = await axiosInstance.get("/notifications");
    const rawNotifications = response.data.notifications || [];

    const grouped = new Map();

    rawNotifications.forEach((notif) => {
      if (!notif || !notif.type) return;

      const key = `${notif.sender_id || "system"}_${notif.type}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          ...notif,
          count: 1,
          latestContent: notif.content,
        });
      } else {
        const existing = grouped.get(key);
        existing.count += 1;
        existing.latestContent = notif.content; // latest content
        grouped.set(key, existing);
      }
    });

    notifications.value = Array.from(grouped.values());
    newNotifications.value = notifications.value.length;

    console.log("Fetched notifications:", rawNotifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
  }
}

function formatType(type) {
  switch (type) {
    case "job_application":
      return "Job Application";
    case "inquiry":
      return "Inquiry";
    case "application_update":
      return "Application Update";
    case "message":
      return "Message";
    case "full_time":
      return "Full-Time";
    case "part_time":
      return "Part-Time";
    case "internship":
      return "Internship";
    case "contract":
      return "Contract";
    case "other":
      return "Other";
  }
}

async function onImageChange(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.match("image.*")) {
    createToast("Please select an image file", {
      type: "warning",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
      toastBackgroundColor: "#045d56",
    });
    return;
  }

  try {
    const formData = new FormData();
    formData.append("profile_image", file);

    await axiosInstance.post("/upload/profile-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    createToast("Profile image updated successfully", {
      type: "success",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
      toastBackgroundColor: "#045d56",
    });

    await fetchUserData();
  } catch (error) {
    console.error("Failed to upload image:", error);
    createToast("Failed to update profile image", {
      type: "danger",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
    });
  }
}

async function updateProfile() {
  try {
    const response = await axiosInstance.put(`/company/profile/update`, {
      company_name: fullName.value,
      industry_type: type.value,
      company_telephone: telephone.value,
      email: email.value,
      street_address: location.value,
      city: city.value,
      province: province.value,
      country: country.value,
    });

    createToast("Profile updated successfully", {
      type: "success",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
      toastBackgroundColor: "#045d56",
    });

    await fetchUserData();
  } catch (error) {
    console.error("Failed to update profile:", error);
    createToast(error.response?.data?.message || "Failed to update profile", {
      type: "danger",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
    });
  }
}
const getNotificationIcon = (type) => {
  switch (type) {
    case 'job_application':
      return '/public/resume.png';
    case 'inquiry':
      return '/public/question.png';
    case 'application_update':
      return '/public/updates.png';
    case 'message':
      return '/public/mail.png';
    default:
      return '/public/notification.png';
  }
};

onMounted(() => {
  fetchUserData();
  fetchNotifications();
});
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: work-sans, sans-serif;
}
body,
.container {
  display: flex;
  background: #e6f0ea;
  height: 100vh;
  overflow: hidden;
}
.sidebar {
  width: 200px;
  background: #fafafa;
  padding: 20px 0;
  border-radius: 2vh;
  border-right: 3.5px solid #045d56;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.logo {
  height: 8vh;
  width: 14vh;
  margin-left: 5.5vh;
  margin-bottom: 15vh;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}
.sidebar ul li {
  padding: 20px 20px;
  margin-bottom: 10px;
  gap: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: 10px;
  transition: all 0.3s ease-in-out;
}

.sidebar ul li:hover {
  color: #045d56;
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #f0f0f0;
}

.sidenav-text {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.sign-out {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: transform 0.3s ease, background-color 0.3s ease;
  padding: 15px 20px;
  margin-top: 10vh;
  margin-left: 8.5vh;
  border-radius: 10px;
}

.sign-out img {
  width: 20px;
  height: 20px;
}

.sign-out:hover {
  background-color: #e0f2f1;
  transform: translateX(5px);
  color: #045d56;
}

.signout-popup {
  text-align: center;
}

.signout-popup p {
  margin: 10px 0 20px;
}

.signout-actions {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.signout-btn {
  background-color: #d32f2f;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.signout-btn:hover {
  background-color: #b71c1c;
}
.cancel-btn {
  background-color: gray;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.cancel-btn:hover {
  background-color: #555;
}

.ikon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}
.main {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}
.topbar {
  height: 60px;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid #ccc;
  flex-shrink: 0;
}

.hamburger {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 25px;
  height: 20px;
  cursor: pointer;
  margin: 0 10px;
  transition: transform 0.3s ease-in-out;
}

.hamburger span {
  display: block;
  height: 3px;
  background-color: #333;
  border-radius: 3px;
}

.sidebar.collapsed {
  width: 0px;
  overflow: hidden;
  transition: width 0.3s ease;
}

.left-top {
  display: flex;
  align-items: center;
  gap: 10px;
}
.avatar {
  width: 40px;
  height: 40px;
  background: #ffffff;
  border-radius: 50%;
}

.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup {
  background: white;
  padding: 25px;
  border-radius: 15px;
  width: 350px;
  max-height: 400px;
  overflow-y: auto;
  text-align: left;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  animation: popIn 0.3s ease;
}

.popup h3 {
  margin-bottom: 15px;
  font-size: 22px;
  color: #045d56;
}

.popup-list {
  list-style-type: none;
  padding: 0;
  margin-bottom: 20px;
}

.popup-list li {
  padding: 10px 0;
  border-bottom: 1px solid #ddd;
}

.popup button {
  background-color: #045d56;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.popup button:hover {
  background-color: #033f3a;
}

.content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  gap: 20px;
}
.left-content {
  flex: 3;
}

.icons-right {
  display: flex;
  gap: 20px;
  align-items: center;
}
.icon {
  position: relative;
  cursor: pointer;
}
.icon img {
  width: 25px;
  height: 25px;
}

.icon span {
  font-size: 12px;
  position: absolute;
  top: -10px;
  right: -10px;
  background: red;
  color: white;
  border-radius: 50%;
  padding: 2px 5px;
}

.profile-wrapper {
  justify-content: center;
}

.profile-card {
  background: #ffffff;
  border: 1px solid #ccc;
  border-radius: 2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
  border-left: #045d56 solid 4px;
  padding: 2rem;
  height: 95%;
  width: 100%;
  margin-left: 27vh;
  gap: 3rem;
}

.profile-avatar {
  width: 30vh;
  height: 30vh;
  object-fit: cover;
  margin-top: 2vh;
  margin-left: 45vh;
  margin-bottom: 3vh;
  border-radius: 50%;
  border: 4px solid #045d56;
}

.profile-avatar-label {
  cursor: pointer;
  display: inline-block;
}

.profile-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2vh;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  color: #374151;
}

.form-group input::placeholder {
  color: #000000;
  text-align: center;
  text-transform: capitalize;
}

.form-group input,
.form-group select {
  padding: 0.6rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #4f46e5;
  outline: none;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
  min-width: 200px;
}

.notification-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s ease;
}

.notification-item:hover {
  background-color: #f8f9fa;
}

.notification-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background-color: #e0f2f1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notif-icon {
  width: 20px;
  height: 20px;
}

.notification-content {
  flex: 1;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.notification-type {
  color: #045d56;
  font-size: 14px;
}

.notification-badge {
  background-color: #045d56;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.notification-message {
  color: #333;
  margin: 4px 0;
  font-size: 14px;
}

.notification-time {
  color: #666;
  font-size: 12px;
  display: block;
  margin-top: 4px;
}

@media (max-width: 1024px) {
  .hamburger {
    display: flex;
    z-index: 1001;
  }
  .content {
    gap: 0;
    overflow: hidden;
  }
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 35vh;
    z-index: 1000;
    transition: transform 0.3s ease;
  }

  .sidebar.active {
    transform: translateX(0);
  }

  .logo {
    margin-top: 4vh;
    margin-left: 4vh;
    margin-bottom: 8vh;
  }

  .profile-card {
    margin-left: 17vh;
    width: 90%;
    height: 100%;
  }
  .profile-avatar {
    margin-left: 40vh;
  }
  .sign-out {
    margin-left: 7.5vh;
  }
}

@media (max-width: 768px) {
  .hamburger {
    display: flex;
    z-index: 1001;
  }
  .content {
    flex-direction: column;
    height: calc(100vh - 60px);
    padding: 20px;
    margin-top: 10px;
    overflow: auto;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 35vh;
    z-index: 1000;
    transition: transform 0.3s ease;
  }

  .sidebar.active {
    transform: translateX(0);
  }

  .ikon {
    height: 15px;
    width: 15px;
  }

  .icon img {
    width: 20px;
    height: 20px;
  }

  .logo {
    height: 8vh;
    width: 13vh;
    margin-left: 4vh;
    margin-bottom: 10vh;
  }

  .avatar {
    width: 30px;
    height: 30px;
  }
  .profile-card {
    margin-left: 8vh;
    width: 90%;
    height: 100%;
  }
  .profile-avatar {
    height: 20vh;
    width: 20vh;
    margin-left: 36vh;
  }
  .profile-form {
    gap: 0.5rem;
    font-size: 15px;
  }
  .sign-out {
    width: 60px;
    height: 40px;
    margin-left: 7.5vh;
  }
}

@media (max-width: 480px) {
  .hamburger {
    display: flex;
    z-index: 1001;
  }
  .topbar {
    height: 12.5vh;
  }

  .logo {
    margin-left: 5vh;
    margin-top: 5vh;
    margin-bottom: 5vh;
  }

  .ikon {
    height: 15px;
    width: 15px;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 35vh;
    z-index: 1000;
    transition: transform 0.3s ease;
  }

  .sidebar.active {
    transform: translateX(0);
  }

  .profile-card {
    margin-left: 1vh;
    width: 100%;
    height: auto;
  }
  .profile-avatar {
    height: 20vh;
    width: 20vh;
    margin-left: 15vh;
  }
  .profile-form {
    gap: 0.5rem;
    font-size: 15px;
  }

  .sign-out {
    width: 60px;
    height: 40px;
    margin-left: 7.5vh;
  }
}
@media (max-width: 385px) {
  .sidebar {
    font-size: 12px;
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 35vh;
    z-index: 1000;
    transition: transform 0.3s ease;
  }
  .logo {
    height: 6vh;
    width: 10vh;
    margin-left: 3vh;
    margin-bottom: 5vh;
  }
  .ikon {
    height: 20px;
    width: 20px;
  }
  .profile-card {
    margin-left: 1vh;
    width: 100%;
    height: auto;
  }
  .profile-avatar {
    height: 20vh;
    width: 20vh;
    margin-left: 12vh;
  }
  .profile-form {
    gap: 0.5rem;
    font-size: 15px;
  }

  .sign-out {
    width: 60px;
    height: 40px;
    margin-left: 7.5vh;
  }
}

@media (max-width: 320px) {
  .sidebar {
    font-size: 12px;
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 35vh;
    z-index: 1000;
    transition: transform 0.3s ease;
  }
  .logo {
    height: 6vh;
    width: 10vh;
    margin-left: 3vh;
    margin-bottom: 5vh;
  }
  .ikon {
    height: 20px;
    width: 20px;
  }

  .profile-avatar {
    height: 20vh;
    width: 20vh;
    margin-left: 6vh;
  }
}
</style>
