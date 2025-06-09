<template>
  <div class="container">
    <div class="sidebar" :class="{ collapsed: !isSidenavOpen }">
      <img src="/public/gcchnobg.png" alt="GCCH Logo" class="logo" />
      <ul>
        <li>
          <router-link to="/Applicantdash" class="sidenav-text">
            <img src="/public/job-offer.png" class="ikon" />
            JOB LISTINGS
          </router-link>
        </li>
        <li>
          <router-link to="/Applicantmessage" class="sidenav-text">
            <img src="/public/mail.png" class="ikon" /> MESSAGES
          </router-link>
        </li>
        <li>
          <router-link to="/Application" class="sidenav-text">
            <img src="/public/resume.png" class="ikon" /> APPLICATION
          </router-link>
        </li>
        <li style="font-weight: bold">
          <router-link to="/Applicantprofile" class="sidenav-text">
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
              <label
                class="profile-avatar-label"
                @click="isEditing ? $refs.fileInput.click() : null"
                :style="{ cursor: isEditing ? 'pointer' : 'default' }"
              >
                <img
                  :src="avatarPreview || applicant.profile_picture_url"
                  alt="Profile"
                  class="profile-avatar"
                />
                <input
                  type="file"
                  ref="fileInput"
                  :disabled="!isEditing"
                  @change="handleImageUpload"
                  accept="image/*"
                  style="display: none"
                />
                <div class="avatar-overlay" v-if="isEditing"></div>
              </label>
              <h2>Profile</h2>
            </div>

            <div class="profile-form" v-if="applicant.applicant">
              <div class="form-group">
                <label>Full Name</label>
                <!-- <p>
                  {{ applicant.applicant.first_name }}
                  {{ applicant.applicant.middle_name }}
                  {{ applicant.applicant.last_name }}
                </p> -->

                <input
                  type="text"
                  :readonly="!isEditing"
                  v-model="fullName"
                  :placeholder="`${applicant.applicant?.first_name || ''} ${
                    applicant.applicant?.middle_name || ''
                  } ${applicant.applicant?.last_name || ''}`"
                />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="text"
                    :readonly="!isEditing"
                    v-model="dateOfBirth"
                    :placeholder="
                      applicant.applicant?.date_of_birth
                        ? new Date(
                            applicant.applicant.date_of_birth
                          ).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                          })
                        : ''
                    "
                  />
                </div>
                <div class="form-group">
                  <label>Sex</label>
                  <input
                    type="text"
                    :readonly="!isEditing"
                    v-model="sex"
                    :placeholder="formatType(applicant.applicant?.sex)"
                  />
                </div>
                <!-- Paayos nlng rin boss hahha -->
                <div class="form-group">
                  <label>Program</label>
                  <input
                    type="email"
                    :readonly="!isEditing"
                    v-model="email"
                    :placeholder="applicant.applicant.course || ''"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    :readonly="!isEditing"
                    v-model="phoneNumber"
                    :placeholder="applicant.applicant?.phone_number || ''"
                  />
                </div>
                <div class="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    :readonly="!isEditing"
                    v-model="email"
                    :placeholder="applicant.user.email || ''"
                  />
                </div>
                <!-- Paayos nlng somewhere this div for expertise -->
                <div class="form-group">
                  <label>Expertise</label>
                  <input
                    type="email"
                    :readonly="!isEditing"
                    v-model="email"
                    :placeholder="applicant.applicant.expertise"
                  />
                </div>
              </div>
              <!-- <div class="btn-group">
                <button
                  v-if="!isEditing"
                  @click="enableEditing"
                  class="edit-btn"
                >
                  Edit
                </button>
                <button v-if="isEditing" @click="saveChanges" class="save-btn">
                  Save
                </button>
                <button
                  v-if="isEditing"
                  @click="cancelEditing"
                  class="cancel-btn"
                >
                  Cancel
                </button>
              </div> -->
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
const applicant = ref({});

const isEditing = ref(false);
const fullName = ref("");
const dateOfBirth = ref("");
const sex = ref("");
const phoneNumber = ref("");
const email = ref("");
const originalData = ref({});
const avatarPreview = ref(null);
const fileInput = ref(null);

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

// function enableEditing() {
//   isEditing.value = true;
//   const {
//     first_name,
//     middle_name,
//     last_name,
//     date_of_birth,
//     sex: s,
//     phone_number,
//     email: e,
//   } = applicant.value.applicant;
//   fullName.value = `${first_name} ${middle_name} ${last_name}`.trim();
//   dateOfBirth.value = date_of_birth;
//   sex.value = s;
//   phoneNumber.value = phone_number;
//   email.value = applicant.value.email;
//   originalData.value = {
//     fullName: fullName.value,
//     dateOfBirth: dateOfBirth.value,
//     sex: sex.value,
//     phoneNumber: phoneNumber.value,
//     email: email.value,
//   };
// }

// function cancelEditing() {
//   isEditing.value = false;
//   avatarPreview.value = null;
//   ({
//     fullName: fullName.value,
//     dateOfBirth: dateOfBirth.value,
//     sex: sex.value,
//     phoneNumber: phoneNumber.value,
//     email: email.value,
//   } = originalData.value);
// }

// async function saveChanges() {
//   const [first, middle = "", last = ""] = fullName.value.split(" ");
//   const data = {
//     first_name: first,
//     middle_name: middle,
//     last_name: last,
//     date_of_birth: dateOfBirth.value,
//     sex: sex.value,
//     phone_number: phoneNumber.value,
//     email: email.value,
//   };
//   await updateProfile(data);
//   isEditing.value = false;
// }

async function fetchUserData() {
  try {
    const userId = localStorage.getItem("user_id");
    const response = await axiosInstance.get(`user/applicant/${userId}`);
    applicant.value = response.data;
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

// Add this function for profile updates
async function updateProfile(data) {
  try {
    const response = await axiosInstance.put(`/user/applicant/update`, data);
    createToast("Profile updated successfully", {
      type: "success",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
      toastBackgroundColor: "#045d56",
    });
    await fetchUserData();
  } catch (error) {
    console.error("Failed to update profile", error);
    createToast(error.response?.data?.message || "Failed to update profile", {
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
    createToast("Failed to load notifications", {
      type: "danger",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
    });
  }
}

function formatType(type) {
  switch (type) {
    case "prefer_to_not_say":
      return "Prefer Not to Say";
    case "male":
      return "Male";
    case "female":
      return "Female";
    case "other":
      return "Other";
  }
}

const getNotificationIcon = (type) => {
  switch (type) {
    case "job_application":
      return "/public/resume.png";
    case "inquiry":
      return "/public/question.png";
    case "application_update":
      return "/public/updates.png";
    case "message":
      return "/public/mail.png";
    default:
      return "/public/notification.png";
  }
};

async function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Check file type
  if (!file.type.startsWith("image/")) {
    createToast("Please upload an image file", {
      type: "error",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
    });
    return;
  }

  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    createToast("Image size should be less than 5MB", {
      type: "error",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
    });
    return;
  }

  try {
    // Create preview
    avatarPreview.value = URL.createObjectURL(file);

    // Prepare form data
    const formData = new FormData();
    formData.append("avatar", file);

    // Upload to server
    const response = await axiosInstance.post(
      "/user/applicant/upload-avatar",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    createToast("Profile picture updated successfully", {
      type: "success",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
      toastBackgroundColor: "#045d56",
    });
    avatarPreview.value = null; // Reset preview
    await fetchUserData(); // Refresh data
  } catch (error) {
    console.error("Error uploading image:", error);
    createToast("Failed to upload profile picture", {
      type: "error",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
    });
    // Reset preview on error
    avatarPreview.value = null;
  }
}

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
  margin-top: 15vh;
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
  width: 25%;
  margin-left: 10%;
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

.custom-dropdown {
  position: absolute;
  top: 30px;
  right: 10%;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  display: none;
  width: 200px;
  z-index: 10;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.custom-dropdown .dropdown-label {
  padding: 8px 12px;
  background-color: #045d56;
  color: white;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  font-weight: bold;
}

.custom-dropdown .dropdown-options {
  list-style: none;
  margin: 0;
  padding: 0;
}

.custom-dropdown .dropdown-options li {
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.custom-dropdown .dropdown-options li:hover {
  background-color: #e0f2f1;
}

.industry-dropdown:hover .custom-dropdown {
  display: block;
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
  height: 100%;
  width: 100%;
  margin-left: 25vh;
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
  gap: 1.2rem;
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

.btn-group {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.edit-btn,
.save-btn {
  padding: 0.7rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.edit-btn {
  background: #045d56;
  color: #e0f2f1;
}

.edit-btn:hover {
  background: #d1d5db;
  color: #045d56;
}

.save-btn {
  background: #045d56;
  color: #e0f2f1;
}

.save-btn:hover {
  background: #d1d5db;
  color: #045d56;
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
    margin-left: 15vh;
    width: 100%;
    height: 100%;
  }
  .profile-avatar {
    margin-left: 35vh;
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
    margin-left: 6vh;
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
