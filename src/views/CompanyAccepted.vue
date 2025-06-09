<template>
  <div class="container">
    <div class="sidebar" :class="{ collapsed: !isSidenavOpen }">
      <img src="/public/gcchnobg.png" alt="GCCH Logo" class="logo" />
      <ul>
        <li>
          <router-link to="/companydash" class="sidenav-text">
            <img src="/public/home.png" class="ikon" />
            DASHBOARD
          </router-link>
        </li>
        <li>
          <router-link to="/companypost" class="sidenav-text">
            <img src="/public/laptop.png" class="ikon" /> POSTED JOBS
          </router-link>
        </li>
        <li style="font-weight: bold">
          <router-link to="/companyaccepted" class="sidenav-text">
            <img src="/public/agreement.png" class="ikon" /> ACCEPTED
          </router-link>
        </li>
        <li>
          <router-link to="/companymessage" class="sidenav-text">
            <img src="/public/message.png" class="ikon" />
            MESSAGES
          </router-link>
        </li>

        <li>
          <router-link to="/companyprofile" class="sidenav-text">
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

      <!-- JOB POSTING -->
      <div class="content">
        <div class="right-content">
          <h3>POSTED JOBS</h3>
          <div class="posted-jobs">
            <div
              class="posted-jobs-box"
              v-for="(job, index) in paginatedJobs"
              :key="index"
              @click="selectJob(job)"
            >
              <h2>{{ job.job_title }}</h2>
              <p>{{ job.job_description }}</p>
              <p><strong>Location:</strong> {{ job.job_location }}</p>
              <p><strong>Type:</strong> {{ job.job_type }}</p>
              <p><strong>Monthly Salary:</strong> ₱{{ job.monthly_salary }}</p>
              <p><strong>Date Posted:</strong> {{ job.date_posted }}</p>
              <p>Status: {{ job.status }}</p>
            </div>

            <!-- Pagination Controls -->
            <div class="pagination" v-if="postedJobs.length > 0">
              <button
                class="pagination-btn"
                :disabled="currentPage === 1"
                @click="currentPage--"
              >
                Previous
              </button>
              <span class="page-info">
                Page {{ currentPage }} of {{ totalPages }}
              </span>
              <button
                class="pagination-btn"
                :disabled="currentPage === totalPages"
                @click="currentPage++"
              >
                Next
              </button>
            </div>

            <p v-if="postedJobs.length === 0">No jobs posted yet.</p>
          </div>
        </div>

        <div class="left-content">
          <div v-if="selectedJob" class="selected-job-box">
            <h3>Hired Applicants for {{ selectedJob.job_title }}</h3>
            <template v-if="jobApplicants.length > 0">
              <ul>
                <li
                  v-for="application in jobApplicants"
                  :key="application.id"
                  class="mb-4"
                >
                  <strong
                    >{{ application.applicant.first_name }}
                    {{ application.applicant.last_name }}</strong
                  >
                  <span
                    ><strong>Course:</strong>
                    {{ application.applicant.course }}</span
                  >
                  <span
                    ><strong>Phone:</strong>
                    {{ application.applicant.phone_number }}</span
                  >
                  <span
                    ><strong>Email:</strong> {{ application.user.email }}</span
                  >
                </li>
              </ul>
            </template>
            <template v-else>
              <div class="no-hired-message">
                <p>No hired applicants for this job yet.</p>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import axiosInstance from '../plugins/axios'; 
import { useRouter } from "vue-router";
import { createToast } from "mosha-vue-toastify";
import "mosha-vue-toastify/dist/style.css";

const router = useRouter();

const showMail = ref(false);
const showNotif = ref(false);
const showSignOut = ref(false);
const unreadMessages = ref(0);
const newNotifications = ref(0);
const isSidenavOpen = ref(true);

const selectedJob = ref(null);
const jobApplicants = ref([]);
const applicantUsers = ref({});

const notifications = ref([]);
const postedJobs = ref([]);

const currentPage = ref(1);
const itemsPerPage = ref(3); // Number of jobs to show per page

const totalPages = computed(() =>
  Math.ceil(postedJobs.value.length / itemsPerPage.value)
);
const paginatedJobs = computed(() => {
  // Sort jobs by date (most recent first)
  const sortedJobs = [...postedJobs.value].sort((a, b) => {
    const dateA = new Date(a.date_posted);
    const dateB = new Date(b.date_posted);
    return dateB - dateA; // Most recent first
  });

  // Then paginate the sorted jobs
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return sortedJobs.slice(start, end);
});

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
    case "job_application":
      return "Job Application";
    case "inquiry":
      return "Inquiry";
    case "application_update":
      return "Application Update";
    case "message":
      return "Message";
    case "other":
      return "Other";
    default:
      return type;
  }
}

//Fetch Jobs
async function fetchPostedJobs() {
  try {
    const response = await axiosInstance.get("/company/jobdisplay");
    postedJobs.value = response.data.jobs;
    console.log(response.data);

    if (postedJobs.value.length > 0) {
      selectedJob.value = postedJobs.value[0];
      await fetchApplicants(selectedJob.value.id);
    } else {
      jobApplicants.value = [];
      createToast("No jobs found", {
        type: "info",
        position: "top-right",
        timeout: 3000,
        showIcon: true,
        toastBackgroundColor: "#045d56",
      });
    }
  } catch (error) {
    console.error("Error fetching posted jobs:", error);
    createToast("Failed to fetch jobs", {
      type: "danger",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
    });
  }
}

async function fetchApplicants(jobId) {
  try {
    const response = await axiosInstance.get(`/job/${jobId}/applications`);
    const acceptedApplicants = response.data.applications.filter(
      (applicant) => applicant.status === "hired"
    );

    // Fetch user data for each applicant and attach to application.user
    await Promise.all(
      acceptedApplicants.map(async (app) => {
        const applicantId = app.applicant.user_id;
        if (applicantId) {
          try {
            const userResponse = await axiosInstance.get(
              `user/applicant/${applicantId}`
            );
            app.user =
              userResponse.data && userResponse.data.user
                ? userResponse.data.user
                : userResponse.data;
          } catch (err) {
            app.user = { email: "N/A" };
          }
        } else {
          app.user = { email: "N/A" };
        }
      })
    );

    jobApplicants.value = acceptedApplicants;
  } catch (error) {
    jobApplicants.value = [];
  }
}

function selectJob(job) {
  selectedJob.value = job;
  fetchApplicants(job.id);
}

onMounted(() => {
  fetchPostedJobs();
  fetchNotifications();
});

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

watch(postedJobs, () => {
  currentPage.value = 1;
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
  flex: 3;
}

.selected-job-box {
  background: white;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  border-radius: 3vh;
  border-left: #045d56 4px solid;
  width: 95%;
  max-height: 80vh;
  margin-left: 3vh;
  overflow-y: auto;
  text-transform: uppercase;
}

.selected-job-box h2 {
  margin-top: 0;
  font-size: 30px;
  font-weight: bold;
  color: #151718;
}

.selected-job-box h3 {
  margin-top: 3vh;
  margin-bottom: 3vh;
  font-size: 20px;
  color: #151718;
}

.selected-job-box p {
  margin: 8px 0;
  color: #151718;
}

.selected-job-box ul {
  list-style: none;
  padding: 10px;
}

.selected-job-box li {
  background-color: #f9f9f9;
  padding: 16px;
  border-radius: 10px;
  border: 2px solid #e0e6ed;
  border-bottom: #045d56 4px solid;
  width: 60%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.selected-job-box li:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.selected-job-box li strong {
  display: inline-block;
  font-weight: bold;
  color: #333;
  margin-bottom: 2px;
}

.selected-job-box li span {
  display: block;
  margin: 2px 0;
  color: #444;
  font-size: 14px;
}

.selected-job-box button {
  margin-top: 2vh;
  margin-bottom: 2vh;
  padding: 5px 14px;
  font-size: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.selected-job-box button:hover {
  opacity: 0.9;
}
.cancel-button {
  margin-left: 8px;
  margin-right: 30vh;
}

.button-group {
  display: flex;
  gap: 10px;
}
.selected-job-box button {
  background-color: #045d56;
  color: white;
  font-size: 10px;
}

.selected-job-box a {
  color: #2980b9;
  text-decoration: none;
}

.selected-job-box a:hover {
  text-decoration: underline;
}

textarea {
  border: 1px solid #ccc;
  padding: 10px 22px;
  border-radius: 8px;
  font-size: 14px;
  width: 100%;
  resize: none;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.right-content {
  flex: 1;
  background: white;
  border-radius: 10px;
  padding: 20px;
  height: 85vh;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

.posted-jobs {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
  padding: 10px;
}

.pagination-btn {
  background-color: #045d56;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.pagination-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.7;
}

.pagination-btn:not(:disabled):hover {
  background-color: #034442;
  transform: translateY(-2px);
}

.page-info {
  color: #045d56;
  font-weight: 500;
  font-size: 14px;
  position: bottom;
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

.posted-jobs-box {
  background: #f9fbfa;
  border: 1.5px solid #e0e6ed;
  border-left: 5px solid #045d56;
  border-radius: 18px;
  margin: 18px 0;
  width: 100%;
  max-width: 420px;
  padding: 28px 28px 18px 28px;
  box-shadow: 0 4px 18px rgba(4, 93, 86, 0.07);
  transition: transform 0.18s, box-shadow 0.18s;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.posted-jobs-box:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 32px rgba(4, 93, 86, 0.13);
  background: #f3f8f7;
}

.posted-jobs-box h2 {
  font-size: 1.5rem;
  color: #151718;
  margin-bottom: 8px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: capitalize;
}

.posted-jobs-box p {
  margin: 0;
  font-size: 15px;
  color: #222;
  line-height: 1.5;
  display: flex;
  align-items: center;
  gap: 6px;
}

.posted-jobs-box strong {
  color: #045d56;
  font-weight: 600;
  min-width: 90px;
  display: inline-block;
}

.sidebar.collapsed {
  width: 0px;
  overflow: hidden;
  transition: width 0.3s ease;
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

  .post-box {
    border-radius: 3vh;
    width: 95%;
  }
  .post-box textarea {
    width: 100%;
    margin-top: 2vh;
    height: 25vh;
  }

  .right-content {
    padding-top: 3vh;
    margin-right: 1vh;
    height: 85vh;
    width: 50vh;
    overflow: auto;
  }

  .posted-jobs-box {
    width: 100%;
    margin: 10px 0;
    padding: 15px;
    font-size: 14px;
  }
  .posted-jobs-box h2 {
    font-size: 20px;
  }
  .posted-jobs-box p {
    font-size: 12px;
  }
  .selected-job-box {
    width: 95%;
    max-height: 43vh;
    margin-left: 2vh;
    font-size: 14px;
    padding: 20px;
    border-radius: 3vh;
  }
  .selected-job-box li {
    width: 90%;
  }
  .selected-job-box h3 {
    font-size: 30px;
  }
  .pagination-btn {
    padding: 8px 12px;
    font-size: 12px;
  }
  .page-info {
    font-size: 10px;
    color: #045d56;
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

  .right-content {
    padding: 15px;
    height: auto;
    min-height: 300px;
    width: 90%;
    margin-left: 5vh;
    margin-bottom: 2vh;
    overflow: auto;
  }

  .posted-jobs-box {
    width: 100%;
    margin: 10px 0;
    padding: 8px;
    font-size: 12px;
  }

  .selected-job-box {
    width: 95%;
    max-height: 43vh;
    margin-left: 2vh;
    font-size: 14px;
    padding: 20px;
    border-radius: 3vh;
  }
  .selected-job-box h3 {
    font-size: 30px;
  }

  .sign-out {
    margin-left: 7.5vh;
  }
}

@media (max-width: 435px) {
  .hamburger {
    display: flex;
    z-index: 1001;
  }
  .topbar {
    height: 12.5vh;
  }
  .content {
    display: flex;
    flex-direction: column;
  }
  .left-content {
    padding-left: 3vh;
    flex: 1;
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

  .sidebar.active {
    transform: translateX(0);
  }
  .selected-job-box {
    width: 90%;
    max-height: 50vh;
    margin-left: 1.5vh;
    font-size: 12px;
    padding: 15px;
    border-radius: 3vh;
  }
  .selected-job-box h3 {
    font-size: 20px;
  }
  .selected-job-box p {
    font-size: 10px;
  }
  .selected-job-box li {
    font-size: 10px;
    width: 100%;
  }

  .right-content {
    width: 85%;
    margin-left: 5vh;
    overflow: auto;
  }

  .posted-jobs-box {
    margin-left: 3vh;
    font-size: 10px;
    width: 40vh;
    padding: 10px 10px;
  }
  .sign-out {
    width: 60px;
    height: 40px;
    margin-left: 7.5vh;
  }
}
@media (max-width: 385px) {
  .sidebar {
    width: 20vh;
    font-size: 8px;
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
  .left-content {
    padding-left: 2vh;
    margin-top: 2vh;
  }
  .right-content {
    flex: 1;
    margin-left: 2vh;
    padding-top: 3vh;
    height: auto;
    overflow: auto;
  }
  .posted-jobs-box {
    width: 100%;
    margin: 10px 0;
    padding: 8px;
    font-size: 12px;
  }
  .selected-job-box {
    width: 95%;
    max-height: 43vh;
    margin-left: -2vh;
    font-size: 14px;
    padding: 20px;
    border-radius: 3vh;
  }
  .sign-out {
    width: 60px;
    height: 40px;
    margin-left: 7.5vh;
  }
}
</style>
