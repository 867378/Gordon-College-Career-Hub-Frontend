<template>
  <div class="container">
    <div class="sidebar" :class="{ collapsed: !isSidenavOpen }">
      <img src="/public/gcchnobg.png" alt="GCCH Logo" class="logo" />
      <ul>
        <li style="font-weight: bold">
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
        <li>
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
      <div class="content">
        <div class="left-content">
          <div class="chart-container">
            <canvas id="statsChart"></canvas>
          </div>

          <div class="cards">
            <div class="card">
              <p>
                <strong>
                  <img
                    src="/public/people.png"
                    alt="total clients Icon"
                    class="ikon"
                  />
                  HIRED APPLICANTS
                </strong>
              </p>
              <p>{{ hiredApplicants }}</p>
              <div class="graph-container">
                <div
                  class="graph-bar hired"
                  :style="{ height: `${(hiredApplicants / maxValue) * 100}%` }"
                ></div>
              </div>
            </div>
            <div class="card">
              <p>
                <strong>
                  <img
                    src="/public/checklist.png"
                    alt="total job listings Icon"
                    class="ikon"
                  />
                  POSTED JOBS
                </strong>
              </p>
              <p>{{ totalJobs }}</p>
              <ul>
                <li v-for="job in jobs" :key="job.id">
                  {{ job.job_title }}
                </li>
              </ul>
              <!-- <div class="graph-container">
                <div
                  class="graph-bar jobs"
                  :style="{ height: `${(totalJobs / maxValue) * 100}%` }"
                ></div>
              </div> -->
            </div>
            <div class="card">
              <p>
                <strong>
                  <img
                    src="/public/buffer.png"
                    alt="pending applications Icon"
                    class="ikon"
                  />
                  PENDING APPLICATION
                </strong>
              </p>
              <p>{{ pendingApplications }}</p>
              <div class="pie-chart-container">
                <canvas id="pendingPieChart"></canvas>
                <div class="pie-legend">
                  <div class="legend-item">
                    <span class="legend-color applied"></span>
                    <span>Applied ({{ pendingApplied }})</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-color screening"></span>
                    <span>Screening ({{ pendingScreening }})</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-color interview"></span>
                    <span>For Interview ({{ pendingInterview }})</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-color interview"></span>
                    <span>Interviewed ({{ pendingInterviewed }})</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-color accepted"></span>
                    <span>Accepted ({{ pendingAccepted }})</span>
                  </div>
                </div>
              </div>
            </div>
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
import Chart from "chart.js/auto";

const router = useRouter();

const showNotif = ref(false);
const showSignOut = ref(false);
const newNotifications = ref(0);
const hiredApplicants = ref(0);
const totalJobs = ref(0);
const pendingApplications = ref(0);

const pendingApplied = ref(0);
const pendingScreening = ref(0);
const pendingInterview = ref(0);
const pendingInterviewed = ref(0);
const pendingAccepted = ref(0);

const jobs = ref([]);

const isSidenavOpen = ref(true);

const notifications = ref({});

function toggleNotif() {
  showNotif.value = !showNotif.value;
  if (showNotif.value) newNotifications.value = 0;
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

async function fetchDashboardCounts() {
  try {
    const [clientsRes, jobsRes, pendingRes] = await Promise.all([
      axiosInstance.get("/company/total-clients"),
      axiosInstance.get("/company/total-jobs"),
      axiosInstance.get("/company/pending-applications"),
    ]);

    hiredApplicants.value = clientsRes.data.count;
    totalJobs.value = jobsRes.data.count;

    // Extract status counts
    const counts = pendingRes.data.counts || {};
    pendingApplied.value = counts.applied || 0;
    pendingScreening.value = counts.screening || 0;
    pendingInterview.value = counts.for_interview || 0;
    pendingAccepted.value = counts.accepted || 0;
    pendingInterviewed.value = counts.interviewed || 0;
    pendingApplications.value = pendingRes.data.total;

    console.log("Dashboard counts fetched successfully:", {
      hiredApplicants: hiredApplicants.value,
      totalJobs: totalJobs.value,
      pendingApplications: pendingRes.data,
    });
  } catch (error) {
    console.error("Error fetching dashboard counts:", error);
    createToast("Failed to fetch dashboard counts. Please try again.", {
      type: "danger",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
    });
  }
}

// Notification Logic
async function fetchNotifications() {
  try {
    const response = await axiosInstance.get("/notifications");
    notifications.value = response.data.notifications;
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
      return "Inquiry";
    case "full_time":
      return "Full-time";
    case "part_time":
      return "Part-time";
    case "other":
      return "Other";
  }
}

async function fetchJobs() {
  try {
    const response = await axiosInstance.get("/company/jobdisplay");
    jobs.value = response.data.jobs;
    console.log("Jobs fetched successfully:", jobs.value);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    createToast("Failed to fetch jobs. Please try again.", {
      type: "danger",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
    });
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

const chartInstance = ref(null);

const updateChart = () => {
  if (chartInstance.value) {
    chartInstance.value.destroy();
  }

  const ctx = document.getElementById("statsChart");
  chartInstance.value = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Hired Applicants", "Total Jobs", "Pending Applications"],
      datasets: [
        {
          label: "Company Statistics",
          data: [
            hiredApplicants.value,
            totalJobs.value,
            pendingApplications.value,
          ],
          backgroundColor: [
            "rgba(4, 93, 86, 0.7)",
            "rgba(4, 93, 86, 0.5)",
            "rgba(4, 93, 86, 0.3)",
          ],
          borderColor: [
            "rgba(4, 93, 86, 1)",
            "rgba(4, 93, 86, 1)",
            "rgba(4, 93, 86, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
          // Add max value to ensure scale goes up to 100
          max: 100,
          // Add grid lines configuration for better visibility
          grid: {
            color: "rgba(0, 0, 0, 0.1)",
            drawBorder: false,
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            font: {
              size: 12,
            },
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: "COMPANY STATISTICS",
          color: "#045d56",
          font: {
            size: 16,
            weight: "bold",
          },
          padding: {
            bottom: 20,
          },
        },
      },
    },
  });
};

watch([hiredApplicants, totalJobs, pendingApplications], () => {
  updateChart();
});

const pendingPieInstance = ref(null);

const updatePendingPieChart = () => {
  if (pendingPieInstance.value) {
    pendingPieInstance.value.destroy();
  }
  const ctx = document.getElementById("pendingPieChart");
  if (!ctx) return;
  pendingPieInstance.value = new Chart(ctx, {
    type: "pie",
    data: {
      labels: [
        "Applied",
        "Screening",
        "For Interview",
        "Interviewed",
        "Offered",
      ],
      datasets: [
        {
          data: [
            pendingApplied.value,
            pendingScreening.value,
            pendingInterview.value,
            pendingInterviewed.value,
            pendingAccepted.value,
          ],
          backgroundColor: [
            "#ffc107", // Applied
            "#42a5f5", // Screening
            "#ab47bc", // For Interview
            "#ff7043", // Interviewed
            "#66bb6a", // Accepted
          ],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          // text: "Pending Applications by Status",
          // color: "#045d56",
          font: { size: 14, weight: "bold" },
        },
      },
    },
  });
};

const maxValue = computed(() => {
  return Math.max(
    hiredApplicants.value,
    totalJobs.value,
    pendingApplications.value,
    1
  );
});

watch(
  [pendingApplied, pendingScreening, pendingInterview, pendingAccepted],
  () => {
    updatePendingPieChart();
  }
);

onMounted(() => {
  fetchJobs();
  fetchNotifications();
  fetchDashboardCounts();

  setTimeout(() => {
    updateChart();
    updatePendingPieChart();
  }, 100);
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
  overflow: auto;
}
.left-content {
  flex: 3;
}

.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.card {
  background: white;
  padding: 25px;
  border-radius: 20px;
  box-shadow: 0 10px 20px rgba(4, 93, 86, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 20vh;
  margin-top: 1vh;
  margin-bottom: 2vh;
  position: relative;
  border: 1px solid rgba(4, 93, 86, 0.1);
  overflow: hidden;
}

.card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #045d56, #00bfa5);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(4, 93, 86, 0.15);
}

.card:hover::before {
  opacity: 1;
}

.card p {
  margin: 0;
  padding: 0;
  line-height: 1.4;
}

.card ul {
  list-style: none;
  padding: 0;
  margin-top: 10px;
}

.card li {
  padding: 8px 10px;
  margin-bottom: 5px;
  background: #f5f5f5;
  border-left: 3px solid #045d56;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #333;
  transition: all 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card li:hover {
  background: #e0f2f1;
  transform: translateX(5px);
  cursor: pointer;
}

.chart-container {
  background: white;
  padding: 25px;

  border-radius: 20px;
  box-shadow: 0 10px 20px rgba(4, 93, 86, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 40vh;
  position: relative;
  border: 1px solid rgba(4, 93, 86, 0.1);
  overflow: hidden;
}

.chart-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #045d56, #00bfa5);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.chart-container:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(4, 93, 86, 0.15);
}

.chart-container:hover::before {
  opacity: 1;
}

.graph-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding: 15px;
  background: linear-gradient(
    to top,
    rgba(255, 255, 255, 0.9),
    rgba(255, 255, 255, 0.5)
  );
  border-top: 1px solid rgba(4, 93, 86, 0.1);
}

.graph-bar {
  width: 100px;
  min-height: 5px;
  border-radius: 6px 6px 0 0;
  transition: height 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.graph-bar.hired {
  background: linear-gradient(to top, #045d56, #00bfa5);
  box-shadow: 0 0 15px rgba(4, 93, 86, 0.3);
}

.graph-bar.jobs {
  background: linear-gradient(to top, #00695c, #00897b);
  box-shadow: 0 0 15px rgba(0, 105, 92, 0.3);
}

.graph-bar.pending {
  background: linear-gradient(to top, #004d40, #00695c);
  box-shadow: 0 0 15px rgba(0, 77, 64, 0.3);
}

.card:hover .ikon {
  transform: scale(1.1);
}
.right-content {
  flex: 1;
  background: white;
  border-radius: 10px;
  padding: 20px;
  height: 85vh;
  overflow: auto;
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

.update-box {
  background-color: #f4f8fc;
  border-bottom: 4px solid #045d56;
  border-radius: 1vh;
  padding: 20px;
  font-size: 10px;
  margin-top: 2vh;
  margin-bottom: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.update-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
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

.pie-chart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.pie-chart {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.pie-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.8rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.legend-color.pending {
  background-color: #004d40;
}

.legend-color.total {
  background-color: #e0e0e0;
}

@media (max-width: 1024px) {
  .hamburger {
    display: flex;
    z-index: 1001;
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

  .content {
    padding: 15px;
    gap: 15px;
  }

  .post-box {
    width: 100%;
    height: 70%;
    padding: 15px;
  }
  .post-box textarea {
    height: 20vh;
  }
  .chart-container {
    min-height: 40vh;
    width: 100%;
    padding: 15px;
    margin-bottom: 20px;
  }
  .card {
    width: 260px;
    padding: 12px !important;
    font-size: 0.8rem !important;
    margin-left: auto;
    margin-right: auto;
  }

  .card .pie-chart-container {
    margin-top: 8px;
    gap: 6px;
  }

  .card .pie-legend {
    font-size: 0.7rem;
    gap: 3px;
  }

  .job-input,
  .salary-input,
  .slot-input {
    width: 100%;
    margin-left: 0;
  }

  .job-type,
  .salary-range {
    width: 100%;
    margin-left: 0;
  }

  .dropdown-checkbox {
    width: 100%;
    margin-left: 0;
  }

  .dropdown-btn {
    width: 100%;
  }

  .posted-jobs-box {
    width: 35vh;
    height: auto;
    margin: 10px;
  }

  .right-content {
    padding: 15px;
  }

  .main {
    margin-left: 0;
  }

  .topbar {
    left: 0;
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
  .left-content {
    flex: 1;
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
  .logo {
    height: 8vh;
    width: 13vh;
    margin-left: 4vh;
    margin-bottom: 10vh;
  }

  .icon img {
    width: 20px;
    height: 20px;
  }

  .chart-container {
    min-height: 40vh;
    width: 100%;
    padding: 15px;
    margin-bottom: 20px;
  }
  .card {
    width: 200px;
    padding: 12px !important;
    font-size: 0.8rem !important;
    margin-left: auto;
    margin-right: auto;
  }

  .card .pie-chart-container {
    margin-top: 8px;
    gap: 6px;
  }

  .card .pie-legend {
    font-size: 0.7rem;
    gap: 3px;
  }

  .sign-out {
    width: 60px;
    height: 40px;
    margin-left: 7.5vh;
  }
}

@media (max-width: 445px) {
  .hamburger {
    display: flex;
    z-index: 1001;
  }

  .logo {
    margin-left: 5vh;
    margin-top: 5vh;
    margin-bottom: 5vh;
  }
  .chart-container {
    min-height: 40vh;
    width: 100%;
    padding: 15px;
    margin-bottom: 20px;
  }
  .cards {
    display: grid;
    grid-template-columns: 1fr;
    gap: 18px;
    width: 100%;
    justify-items: center;
  }

  .card {
    width: 90%;
    max-width: 320px;
    min-width: 180px;
    padding: 12px !important;
    font-size: 0.8rem !important;
    margin-left: auto;
    margin-right: auto;
  }

  .card .pie-chart-container {
    margin-top: 8px;
    gap: 6px;
  }

  .card .pie-legend {
    font-size: 0.7rem;
    gap: 3px;
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
 
}
@media (max-width: 380px) {
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
  .logo {
    height: 6vh;
    width: 10vh;
    margin-left: 3vh;
    margin-bottom: 5vh;
  }
  .chart-container {
    min-height: 40vh;
    width: 100%;
    padding: 15px;
    margin-bottom: 20px;
  }
  .cards {
    display: grid;
    grid-template-columns: 1fr;
    gap: 18px;
    width: 100%;
    justify-items: center;
  }

  .card {
    width: 90%;
    max-width: 320px;
    min-width: 180px;
    padding: 12px !important;
    font-size: 0.8rem !important;
    margin-left: auto;
    margin-right: auto;
  }

  .card .pie-chart-container {
    margin-top: 8px;
    gap: 6px;
  }

  .card .pie-legend {
    font-size: 0.7rem;
    gap: 3px;
  }

}
</style>
