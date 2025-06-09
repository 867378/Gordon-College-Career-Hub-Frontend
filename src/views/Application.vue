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
        <li style="font-weight: bold">
          <router-link to="/Application" class="sidenav-text">
            <img src="/public/resume.png" class="ikon" /> APPLICATION
          </router-link>
        </li>
        <li>
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

        <!-- Notification Popup -->
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

      <!-- Job Applications for Applicants -->
      <div class="content">
        <div class="left-content">
          <div class="resume-box">
            <h3 class="resumeh3">Ongoing Applications</h3>
            <div class="form-row">
              <div class="resume-list">
                <div
                  v-for="application in ongoingApplications"
                  :key="application.id"
                  class="resume-item received"
                >
                  <h4>Job Application for "{{ application.job_title }}"</h4>
                  <br />
                  <p><strong>Status:</strong> {{ formatType(application.status) }}</p>
                  <p>
                    <strong>Schedule:</strong>
                    {{ application.schedule || "To be announced" }}
                  </p>
                  <p>
                    <strong>Venue:</strong>
                    {{ application.venue || "To be announced" }}
                  </p>
                  <p>
                    <strong>Comments:</strong>
                    {{ application.comment || "No comments yet." }}
                  </p>
                  <p>
                    <strong>Updated At:</strong>
                    {{ formatDate(application.updated_at) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="right-content">
          <div class="resume-box">
            <h3 class="resumeh3">Accepted Applications</h3>
            <div class="form-row">
              <div class="resume-list">
                <div
                  v-for="application in acceptedApplications"
                  :key="application.id"
                  class="resume-item received"
                >
                  <h4>Job Application for {{ application.job_title }}</h4>
                  <p><strong>Status:</strong> {{ formatType(application.status) }}</p>
                  <p>
                    <strong>Updated At:</strong>
                    {{ formatDate(application.updated_at) }}
                  </p>
                  <p><strong>Comment: </strong> {{ application.comment }}</p>

                  <div class="button-group">
                    <button
                      v-if="!showDownloadButton.get(application.id)"
                      class="acrj-btn"
                      @click="openConfirmPopup(application.id, 'accepted')"
                    >
                      Accept Offer
                    </button>
                    <button
                      v-if="
                        application.offer_status === 'accepted' &&
                        application.finalized
                      "
                      class="dl-btn"
                      @click="downloadCertificate(application.id)"
                    >
                      <img
                        src="/public/file.png"
                        alt="download"
                        class="btn-icon"
                      />
                      Download Certificate
                    </button>
                    <button
                      v-if="!showDownloadButton.get(application.id)"
                      class="acrj-btn"
                      @click="openConfirmPopup(application.id, 'rejected')"
                    >
                      Reject Offer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showConfirmPopup" class="popup-overlay" @click.self="showConfirmPopup = false">
        <div class="popup">
          <h3>Are you sure?</h3>
          <p>
            Are you sure you want to
            <strong>{{ confirmAction === 'accepted' ? 'accept' : 'reject' }}</strong>
            this job offer?
          </p>
          <div class="signout-actions">
            <button class="cancel-btn" @click="showConfirmPopup = false">Cancel</button>
            <button
              class="signout-btn"
              @click="() => {
                respondToOffer(confirmApplicationId, confirmAction);
                showConfirmPopup = false;
              }"
            >
              Yes, {{ confirmAction === 'accepted' ? 'Accept' : 'Reject' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axiosInstance from '../plugins/axios'; 
import { useRouter } from "vue-router";
import { createToast } from "mosha-vue-toastify";
import "mosha-vue-toastify/dist/style.css";

const router = useRouter();

const isSidenavOpen = ref(true);
const showNotif = ref(false);
const showSignOut = ref(false);
const newNotifications = ref(0);

const notifications = ref([]);

const applications = ref([]);
const ongoingApplications = ref([]);
const acceptedApplications = ref([]);

const showConfirmPopup = ref(false);
const confirmAction = ref("");
const confirmApplicationId = ref(null);

const showDownloadButton = ref(new Map());

//Methods for Nav Bars

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
    case "for_interview":
      return "For Interview";
    case "interviewed":
      return "Interviewed";
    case "screening":
      return "For Screening";
    case "applied":
      return "  Applied";
    case "accepted":
      return "Offered";
    case "other":
      return "Other";
  }
}

async function fetchJobApplications() {
  try {
    const response = await axiosInstance.get("/applicant/applications");
    applications.value = response.data.applications;
    acceptedApplications.value = applications.value.filter(
      (app) => app.status === "accepted"
    );
    ongoingApplications.value = applications.value.filter(
      (app) =>
        app.status !== "accepted" &&
        app.status !== "hired" &&
        app.offer_status !== "none"
    );
    console.log("Fetched applications:", ongoingApplications.value);
  } catch (error) {
    console.error("Error Occurred", error);
    createToast("Failed to fetch applications", {
      type: "danger",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
    });
  }
}

function openConfirmPopup(applicationId, action) {
  confirmApplicationId.value = applicationId;
  confirmAction.value = action;
  showConfirmPopup.value = true;
}

async function respondToOffer(applicationId, response) {
  try {
    const res = await axiosInstance.post(
      `/applicant/job-application/respond-offer/${applicationId}`,
      {
        offer_status: response,
      }
    );

    createToast(res.data.message, {
      type: "success",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
    });

    await fetchJobApplications();
  } catch (error) {
    console.error("Error responding to offer", error.response?.data || error);
    createToast(error.response?.data?.error || "Something went wrong", {
      type: "danger",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
      toastBackgroundColor: "#045d56",
    });
  }
}

async function downloadCertificate(applicationId) {
  try {
    const response = await axiosInstance.get(`/certificate/download/${applicationId}`, {
      responseType: "blob",
    });

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "certificate.pdf");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    createToast("Certificate downloaded successfully!", {
      type: "success",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
      toastBackgroundColor: "#045d56",
    });
  } catch (error) {
    console.error("Download failed:", error);
    createToast("Failed to download certificate", {
      type: "danger",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
    });
  }
}

onMounted(() => {
  fetchJobApplications();
  fetchNotifications();
});

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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

.ikon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}
.main {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background-color: #eaf4f2;
}
.topbar {
  height: 60px;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid #ccc;
  position: relative;
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
  background: #f1f1f1;
  border-radius: 50%;
}
.topbar input[type="text"] {
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 20px;
  width: 300px;
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

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.content {
  padding: 20px;
  display: flex;
  gap: 20px;
}

.left-content {
  flex: 1;
}

.resume-box {
  background: white;
  padding: 20px;
  margin-top: 3vh;
  margin-bottom: 2vh;
  margin-left: 3vh;
  border-radius: 3vh;
  border-bottom: #045d56 4px solid;
  width: 100%;
  max-height: 80vh;
  overflow: auto;
  overflow-x: hidden;
}
.resumeh3 {
  text-align: left;
  font-size: 1.7rem;
  margin-bottom: 2vh;
  text-transform: uppercase;
}
.resume-list {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 10px;
  margin-top: 1vh;
  max-height: 100%;
  width: 150%;
}

.resume-item {
  padding: 12px 20px;
  border-radius: 10px;
  margin-left: 13vh;
  width: 50%;
  position: relative;
}

.resume-item.received {
  background-color: #f1f1f1;
  align-self: flex-start;
  border-left: 4px solid #045d56;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  max-width: 60%;
  height: 100%;
  margin-left: 5vh;
  margin-bottom: 10px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-transform: capitalize;
}

.resume-item.received:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
}

.acrj-btn {
  background-color: #045d56;
  color: #fff;
  width: auto;
  margin-left: 5vh;
  margin-top: 2vh;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  transform: scale(1);
}
.dl-btn {
  background-color: #f1f1f1;
  color: #033f3a;
  width: auto;
  margin-left: 5vh;
  margin-top: 2vh;
  border: #033f3a 1px solid;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  transform: scale(1);
}
.btn-icon {
  width: 16px;
  height: 16px;
}
.right-content {
  flex: 1;
  border-radius: 10px;
  padding: 20px;
  height: fit-content;
  margin-top: -2vh;
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

.app-overlay {
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

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.status-dropdown {
  padding: 6px 12px;
  font-size: 14px;
  border: 1px solid #bbb;
  border-radius: 6px;
  background-color: #f9f9f9;
  color: #333;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  border-radius: 1vh;
  margin-top: 2vh;
}

.status-dropdown:focus {
  outline: none;
  border-color: #045d56;
  box-shadow: 0 0 3px rgba(4, 93, 86, 0.5);
}

.savebtn {
  background-color: #045d56;
  color: white;
  border: none;
  padding: 4px 14px;
  border-radius: 8px;
  font-size: 14px;
  margin-top: 10px;
  margin-left: 1vh;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}
.savebtn:hover {
  background-color: #033f3a;
  transform: translateY(-2px);
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

  .resume-box {
    width: 80%;
    margin-left: 17vh;
    max-height: 85vh;
    overflow-y: auto;
  }
  .left-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-left: -14vh;
  }
  .resume-list {
    grid-template-columns: repeat(1, 1fr);
  }
  .right-content {
    flex: 1;
    border-radius: 10px;
    padding: 20px;
    margin-right: 4vh;
    height: fit-content;
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
    gap: 0;
    padding: 10px;
  }

  .sidebar {
    font-size: 14px;
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 28vh;
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
  .left-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-left: -14vh;
  }

  .resume-box {
    width: 80%;
    max-height: 85vh;
    overflow-y: auto;
  }

  .resumeh3 {
    font-size: 1.5rem;
    margin-bottom: 2vh;
  }
  .resume-item {
    font-size: 12px;
    border-radius: 10px;
    width: 80%;
    position: relative;
  }
  .resume-item.received {
    background-color: #f1f1f1;
    align-self: flex-start;
    border-left: 4px solid #045d56;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    max-width: 90%;
    height: 100%;
    margin-left: 3vh;
    margin-bottom: 20px;
  }

  .resume-list {
    grid-template-columns: repeat(1, 1fr);
    width: 100%;
  }

  .form-row {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .right-content {
    flex: 1;
    border-radius: 10px;
    padding: 20px;
    margin-left: -10vh;
    height: fit-content;
  }
  .sign-out {
    width: 60px;
    height: 40px;
    margin-left: 5.5vh;
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
  .content {
    display: grid;
    flex-direction: column;
    overflow: auto;
  }
  .logo {
    margin-left: 5vh;
    margin-top: 5vh;
    margin-bottom: 5vh;
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
  .left-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-left: -14vh;
  }
  .resume-box {
    overflow: auto;
    width: 80%;
  }
  .resume-item.received {
    width: 80%;
    margin-left: 5vh;
    margin-bottom: 2vh;
  }
  .resume-list {
    grid-template-columns: repeat(1, 1fr);
    width: 100%;
  }
  .resumeh3 {
    font-size: 1.2rem;
    margin-bottom: 2vh;
    text-align: center;
  }
  .right-content {
    flex: 1;
    border-radius: 10px;
    padding: 20px;
    margin-left: -10vh;
    height: fit-content;
  }
  .sign-out {
    width: 40px;
    height: 40px;
    margin-left: 5vh;
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
  .resume-box {
    width: 75%;
    max-height: 50vh;
    margin-right: 2vh;
  }
  .resumeh3 {
    font-size: 1.4rem;
    margin-bottom: 2vh;
    text-align: center;
  }

  .resume-list {
    grid-template-columns: repeat(1, 1fr);
  }
  .resumeh3 {
    font-size: 1.2rem;
    margin-bottom: 2vh;
    text-align: center;
  }

  .left-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-left: -14vh;
  }
  .right-content {
    flex: 1;
    border-radius: 10px;
    padding: 20px;
    margin-left: -15vh;
    height: fit-content;
  }

  .sign-out {
    width: 60px;
    height: 40px;
    margin-left: 7.5vh;
  }
}
</style>
