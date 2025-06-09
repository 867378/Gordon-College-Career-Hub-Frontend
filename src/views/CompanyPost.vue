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
        <li style="font-weight: bold">
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

      <div
        v-if="showPostPopup"
        class="popup-overlay"
        @click.self="togglePostPopup"
      >
        <div class="popup post-popup">
          <h3>Create New Job Post</h3>
          <form @submit.prevent="postJob">
            <input
              v-model="jobData.job_title"
              type="text"
              placeholder="Enter Job Title"
              class="job-title"
            />

            <textarea
              v-model="jobData.job_description"
              placeholder="Describe the job responsibilities, requirements, and any other relevant details."
            ></textarea>

            <div class="form-row">
              <select
                v-model="jobData.job_type"
                class="job-form job-type"
                id="job_type"
              >
                <option disabled selected value="">Job Type</option>
                <option value="full_time">Full-time</option>
                <option value="part_time">Part-time</option>
                <option value="internship">Internship</option>
                <option value="contract">Contract</option>
              </select>

              <input
                v-model="jobData.job_location"
                type="text"
                placeholder="Enter Job Location"
                class="job-input"
              />

              <div class="dropdown-checkbox">
                <button
                  type="button"
                  @click="toggleCourseDropdown"
                  class="dropdown-btn"
                >
                  Recommended Programs
                  <span v-if="selectedCourses.length"
                    >({{ selectedCourses.length }}/3)</span
                  >
                </button>
                <div v-if="showCourseDropdown" class="dropdown-list">
                  <label v-for="course in courseOptions" :key="course">
                    <input
                      type="checkbox"
                      :value="course"
                      :checked="selectedCourses.includes(course)"
                      @change="handleCheckboxChange($event, course)"
                    />
                    {{ courseAcronymMap[course] || course }}
                  </label>
                </div>
              </div>

              <input
                type="number"
                v-model="jobData.monthly_salary"
                placeholder="Enter Estimated Monthly Salary (in Php)"
                class="salary-input"
              />
              <div class="dropdown-checkbox">
                <button
                  type="button"
                  @click="toggleExpertiseDropdown"
                  class="dropdown-btn"
                >
                  Recommended Expertise
                  <span v-if="selectedExpertise.length"
                    >({{ selectedExpertise.length }}/3)</span
                  >
                </button>
                <div v-if="showExpertiseDropdown" class="dropdown-list">
                  <label
                    v-for="expertise in filteredExpertise"
                    :key="expertise"
                  >
                    <input
                      type="checkbox"
                      :value="expertise"
                      :checked="selectedExpertise.includes(expertise)"
                      @change="handleExpertiseCheckboxChange($event, expertise)"
                    />
                    {{ expertise }}
                  </label>
                </div>
              </div>
              <input
                type="number"
                v-model="jobData.total_slots"
                placeholder="Hiring Slot"
                class="slot-input"
              />
            </div>
            <div class="popup-actions">
              <button type="button" class="cancel-btn" @click="togglePostPopup">
                Cancel
              </button>
              <button type="submit" class="submit-btn">Post Job</button>
            </div>
          </form>
        </div>
      </div>

      <div class="content">
        <div class="right-content">
          <h3>POSTED JOBS</h3>
          <div class="posted-jobs">
            <div
              class="posted-jobs-box"
              v-for="(job, index) in paginatedPostedJobs"
              :key="index"
              @click="selectJob(job)"
            >
              <h2>{{ job.job_title }}</h2>
              <p><strong>Location:</strong> {{ job.job_location }}</p>
              <p><strong>Type:</strong> {{ job.job_type }}</p>
              <p><strong>Monthly Salary:</strong> ₱{{ job.monthly_salary }}</p>
              <p><strong>Date Posted:</strong> {{ job.date_posted }}</p>
              <p><strong>Status:</strong> {{ job.status }}</p>
              <p>
                <strong>Slots: </strong> {{ job.filled_slots }}/{{
                  job.total_slots
                }}
              </p>
              <button
                @click.stop="downloadJobReport(job)"
                class="download-report-btn"
              >
                Download Job Report
              </button>
            </div>
            <p v-if="postedJobs.length === 0">No jobs posted yet.</p>

            <div v-if="postedJobs.length > 0" class="pagination">
              <button
                class="pagination-btn"
                :disabled="currentJobPage === 1"
                @click="previousJobPage"
              >
                Previous
              </button>
              <span class="page-info">
                Page {{ currentJobPage }} of {{ totalJobPages }}
              </span>
              <button
                class="pagination-btn"
                :disabled="currentJobPage === totalJobPages"
                @click="nextJobPage"
              >
                Next
              </button>
            </div>
          </div>
        </div>
        <div class="left-content">
          <div class="post-box collapsed" @click="togglePostPopup">
            <h3>Create New Job Post</h3>
            <p>Click to create a new job posting</p>
          </div>

          <div v-if="selectedJob" class="selected-job-box">
            <h2>{{ selectedJob.job_title }}</h2>
            <p>{{ selectedJob.job_description }}</p>
          </div>

          <div v-if="selectedJob" class="selected-job-box">
            <h3>Ongoing Applications</h3>
            <ul v-if="jobApplicants.length > 0">
              <li
                v-for="application in paginatedApplicants"
                :key="application.id"
                class="application-item"
                :class="{ expanded: expandedItems.has(application.id) }"
                @click="toggleItem(application.id)"
              >
                <!-- Always visible header -->
                <div class="application-header">
                  <strong>
                    {{ application.applicant.first_name }}
                    {{ application.applicant.last_name }}'s Application
                  </strong>
                  <span class="status-badge" :class="application.status">
                    {{ statusDescription(application.status) }}
                  </span>
                  <span class="expand-icon">
                    {{ expandedItems.has(application.id) ? "▼" : "▶" }}
                  </span>
                </div>

                <!-- Collapsible content -->
                <div
                  class="application-details"
                  v-if="expandedItems.has(application.id)"
                >
                  <span
                    ><strong>Course:</strong>
                    {{ application.applicant.course }}</span
                  >
                  <span
                    ><strong>Expertise:</strong>
                    {{ application.applicant.expertise }}</span
                  >
                  <span
                    ><strong>Phone:</strong>
                    {{ application.applicant.phone_number }}</span
                  >
                  <span
                    ><strong>Date Applied:</strong>
                    {{ application.date_applied }}</span
                  >
                  <span
                    ><strong>Status:</strong>
                    {{ formatType(application.status) }}</span
                  >
                  <span
                    ><strong>Schedule: </strong
                    >{{ application.scheduled_at }}</span
                  >
                  <span><strong>Venue: </strong>{{ application.venue }}</span>

                  <div class="application-documents">
                    <a
                      :href="application.cover_letter.embed_url"
                      target="_blank"
                    >
                      📄 View Cover Letter
                    </a>
                    <div v-if="application.resume">
                      <a :href="application.resume.embed_url" target="_blank">
                        📄 View Resume
                      </a>
                    </div>
                  </div>

                  <div class="application-actions">
                    <div v-if="!showStatusOptions">
                      <button
                        class="message-btn"
                        @click.stop="sendMessage(application.applicant.user_id)"
                      >
                        Send Message
                      </button>

                      <!-- Show Set Schedule for Interview only if status is screening -->
                      <button
                        v-if="application.status === 'screening'"
                        @click.stop="scheduleInterview(application.id)"
                        class="interviewed-btn"
                      >
                        📅 Set Schedule for Interview
                      </button>

                      <!-- Show Mark as Interviewed only if status is for_interview -->
                      <button
                        v-if="application.status === 'for_interview'"
                        @click.stop="handleMarkAsInterviewed(application)"
                        class="interviewed-btn"
                      >
                        ✅ Mark as Interviewed
                      </button>

                      <!-- Show Accept/Reject only if status is interviewed -->
                      <template v-if="application.status === 'interviewed'">
                        <button
                          @click.stop="
                            openConfirmModal(application.id, 'accepted')
                          "
                          class="accept-btn"
                        >
                          ✅ Offer Job
                        </button>
                        <button
                          @click.stop="
                            openConfirmModal(application.id, 'rejected')
                          "
                          class="reject-btn"
                        >
                          ❌ Decline
                        </button>
                      </template>
                      <p
                        v-if="application.status === 'accepted'"
                        class="waiting-response"
                      >
                        The application has been accepted. Waiting for the
                        applicant's response.
                      </p>
                    </div>

                    <div v-else @click.stop>
                      <textarea
                        v-model="comment"
                        placeholder="Add a comment (optional)"
                        rows="3"
                        class="border p-2 mt-2 w-full"
                      ></textarea>

                      <button
                        @click="showStatusOptions = false"
                        class="cancel-button"
                      >
                        Cancel
                      </button>
                      <button
                        @click="
                          confirmUpdate(
                            selectedApplicationId,
                            decisionType,
                            scheduledAt,
                            comment
                          )
                        "
                      >
                        Submit Update
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            </ul>

            <!-- Add pagination controls -->
            <div v-if="jobApplicants.length > 0" class="pagination">
              <button
                class="pagination-btn"
                @click="previousPage"
                :disabled="currentPage === 1"
              >
                Previous
              </button>

              <div class="page-numbers">
                <button
                  v-for="page in totalPages"
                  :key="page"
                  @click="goToPage(page)"
                  class="page-number"
                  :class="{ active: currentPage === page }"
                >
                  {{ page }}
                </button>
              </div>

              <button
                class="pagination-btn"
                @click="nextPage"
                :disabled="currentPage === totalPages"
              >
                Next
              </button>
            </div>

            <p v-else>No applicants have applied yet.</p>
          </div>

          <div v-else>
            <p>Select a job to view details and applicants.</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Message Function -->
  <div
    v-if="showMessagePopup"
    class="popup-overlay"
    @click.self="showMessagePopup = false"
  >
    <div class="popup">
      <h3>✉️ Message</h3>
      <textarea
        v-model="messageContent"
        placeholder="Type your message here..."
        rows="5"
        style="width: 100%; padding: 8px; resize: none"
      ></textarea>
      <br /><br />
      <button @click="sendActualMessage">Send</button>
      <button @click="showMessagePopup = false" class="cancel-btn">
        Cancel
      </button>
    </div>
  </div>

  <div
    v-if="showConfirmUpdatePopup"
    class="popup-overlay"
    @click.self="showConfirmUpdatePopup = false"
  >
    <div class="confirm-update-popup">
      <h3>Confirm Update</h3>
      <ul>
        <li><strong>Status:</strong> {{ formatType(pendingUpdate.status) }}</li>
        <li v-if="pendingUpdate.scheduled_at">
          <strong>Schedule:</strong> {{ pendingUpdate.scheduled_at }}
        </li>
        <li v-if="pendingUpdate.venue">
          <strong>Venue:</strong> {{ pendingUpdate.venue }}
        </li>
        <li v-if="pendingUpdate.comment">
          <strong>Comment:</strong> {{ pendingUpdate.comment }}
        </li>
      </ul>
      <div class="popup-actions">
        <button @click="showConfirmUpdatePopup = false" class="cancel-btn">
          Cancel
        </button>
        <button @click="submitConfirmedUpdate" class="confirm-btn">
          Confirm
        </button>
      </div>
    </div>
  </div>

  <!-- Schedule Interview Popup -->
<div v-if="showScheduleInterviewPopup" class="popup-overlay" @click.self="closeScheduleInterviewPopup">
  <div class="popup">
    <h3>📅 Schedule Interview</h3>
    <label for="interview-date">Interview Date & Time</label>
    <input
      id="interview-date"
      v-model="scheduleInterviewDate"
      type="datetime-local"
      class="schedule-input"
    />
    <label for="venue">Venue:</label>
    <input
      v-model="interviewVenue"
      id="venue"
      type="text"
      placeholder="Enter venue"
    />
    <!-- Add this textarea for comments -->
    <label for="comment">Additional Notes:</label>
    <textarea
      v-model="comment"
      id="comment"
      placeholder="Add any additional instructions or notes..."
      rows="3"
      class="form-input"
    ></textarea>
    <div class="popup-actions">
      <button class="cancel-btn" @click="closeScheduleInterviewPopup">Cancel</button>
      <button class="submit-btn" @click="submitScheduleInterview">Set Schedule</button>
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

// --- ROUTER & UI STATE ---
const router = useRouter();

const isSidenavOpen = ref(true);
const showNotif = ref(false);
const showSignOut = ref(false);
const newNotifications = ref(0);

// --- NOTIFICATIONS ---
const notifications = ref([]);
function toggleNotif() {
  showNotif.value = !showNotif.value;
  if (showNotif.value) newNotifications.value = 0;
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
        grouped.set(key, { ...notif, count: 1, latestContent: notif.content });
      } else {
        const existing = grouped.get(key);
        existing.count += 1;
        existing.latestContent = notif.content;
        grouped.set(key, existing);
      }
    });
    notifications.value = Array.from(grouped.values());
    newNotifications.value = notifications.value.length;
  } catch (error) {
    console.error("Error fetching notifications:", error);
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

// --- SIGN OUT ---
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

// --- JOBS & APPLICANTS ---
const postedJobs = ref([]);
const selectedJob = ref(null);
const jobApplicants = ref([]);
const expandedItems = ref(new Set());

// Pagination for jobs
const jobsPerPage = ref(3);
const currentJobPage = ref(1);
const totalJobPages = computed(() =>
  Math.ceil(postedJobs.value.length / jobsPerPage.value)
);
const paginatedPostedJobs = computed(() => {
  const start = (currentJobPage.value - 1) * jobsPerPage.value;
  return postedJobs.value.slice(start, start + jobsPerPage.value);
});
function nextJobPage() {
  if (currentJobPage.value < totalJobPages.value) currentJobPage.value++;
}
function previousJobPage() {
  if (currentJobPage.value > 1) currentJobPage.value--;
}
function goToJobPage(page) {
  currentJobPage.value = page;
}

// Pagination for applicants
const applicantsPerPage = ref(2);
const currentPage = ref(1);
const totalPages = computed(() =>
  Math.ceil(jobApplicants.value.length / applicantsPerPage.value)
);

const paginatedApplicants = computed(() => {
  const start = (currentPage.value - 1) * applicantsPerPage.value;
  return jobApplicants.value.slice(start, start + applicantsPerPage.value);
});

function previousPage() {
  if (currentPage.value > 1) currentPage.value--;
}
function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}
function goToPage(page) {
  currentPage.value = page;
}

function selectJob(job) {
  selectedJob.value = job;
  fetchApplicants(job.id);
}

// --- JOB POSTING ---
const showPostPopup = ref(false);
const jobData = ref({
  job_title: "",
  job_description: "",
  job_location: "",
  monthly_salary: "",
  job_type: "",
  total_slots: "",
});

const selectedCourses = ref([]);
const selectedExpertise = ref([]);
const showCourseDropdown = ref(false);
const showExpertiseDropdown = ref(false);

const courseAcronymMap = {
  BSIT: "Bachelor of Science in Information Technology",
  BSCS: "Bachelor of Science in Computer Science",
  BSEMC: "Bachelor of Science in Entertainment and Multimedia Computing",
  BSN: "Bachelor of Science in Nursing",
  BSM: "Bachelor of Science in Midwifery",
  BSA: "Bachelor of Science in Accountancy",
  "BSBA-FM": "Bachelor of Science in Business Administration major in Financial Management",
  "BSBA-MM": "Bachelor of Science in Business Administration major in Marketing Management",
  "BSBA-MHRM": "Bachelor of Science in Business Administration major in Human Resource Management",
  BSCA: "Bachelor of Science in Customs Administration",
  BSHM: "Bachelor of Science in Hospitality Management",
  BSTM: "Bachelor of Science in Tourism Management",
  BAComm: "Bachelor of Arts in Communication",
  BECEd: "Bachelor of Early Childhood Education",
  BCAEd: "Bachelor of Culture and Arts Education",
  BPEd: "Bachelor of Physical Education",
  BEEd: "Bachelor of Elementary Education",
  "BSEd-Eng": "Bachelor of Secondary Education major in English",
  "BSEd-Math": "Bachelor of Secondary Education major in Mathematics",
  "BSEd-Fil": "Bachelor of Secondary Education major in Filipino",
  "BSEd-SS": "Bachelor of Secondary Education major in Social Studies",
  "BSEd-Sci": "Bachelor of Secondary Education major in Science",
  Other: "Other"
};

const courseOptions = [
  "BSIT",
  "BSCS",
  "BSEMC",
  "BSN",
  "BSM",
  "BSA",
  "BSBA-FM",
  "BSBA-MM",
  "BSBA-HRM",
  "BSCA",
  "BSHM",
  "BSTM",
  "BAComm",
  "BECEd",
  "BCAEd",
  "BPEd",
  "BEEd",
  "BSEd-Eng",
  "BSEd-Math",
  "BSEd-Fil",
  "BSEd-SS",
  "BSEd-Sci",
  "Other"
];

const expertiseMap = {
  "Bachelor of Science in Information Technology": [
    "Web Development",
    "Networking",
    "Cybersecurity",
    "System Administration",
    "Other",
  ],
  "Bachelor of Science in Computer Science": [
    "Data Science",
    "AI",
    "Software Engineering",
    "Algorithms",
    "Other",
  ],
  "Bachelor of Science in Entertainment and Multimedia Computing": [
    "Multimedia Arts",
    "Animation",
    "Game Development",
    "Other",
  ],
  "Bachelor of Science in Nursing": [
    "Clinical Nursing",
    "Community Health",
    "Medical-Surgical Nursing",
    "Other",
  ],
  "Bachelor of Science in Midwifery": [
    "Strategic Management",
    "Operations Management",
    "Entrepreneurship",
    "Other",
  ],
  "Bachelor of Science in Accountancy": [
    "Financial Accounting",
    "Auditing",
    "Taxation",
    "Other",
  ],
  "Bachelor of Science in Business Administration major in Financial Management":
    ["Corporate Finance", "Investment Analysis", "Banking", "Other"],
  "Bachelor of Science in Business Administration major in Human Resource Management":
    [
      "Human Resources",
      "Talent Management",
      "Organizational Development",
      "Other",
    ],
  "Bachelor of Science in Business Administration major in Marketing Management":
    ["Marketing Strategy", "Advertising", "Sales Management", "Other"],
  "Bachelor of Science in Customs Administration": [
    "Customs Brokerage",
    "Trade Compliance",
    "Logistics",
    "Other",
  ],
  "Bachelor of Science in Hospitality Management": [
    "Hotel Management",
    "Food & Beverage Service",
    "Customer Relations",
    "Other",
  ],
  "Bachelor of Science in Tourism Management": [
    "Tourism Planning",
    "Event Management",
    "Travel Services",
    "Other",
  ],
  "Bachelor of Arts in Communication": [
    "Journalism",
    "Public Relations",
    "Media Production",
    "Other",
  ],
  "Bachelor of Early Childhood Education": [
    "Early Childhood Development",
    "Preschool Education",
    "Other",
  ],
  "Bachelor of Culture and Arts Education": [
    "Arts Education",
    "Cultural Studies",
    "Creative Expression",
    "Other",
  ],
  "Bachelor of Physical Education": [
    "Sports Science",
    "Physical Fitness",
    "Coaching",
    "Other",
  ],
  "Bachelor of Elementary Education": [
    "Elementary Teaching",
    "Child Psychology",
    "Classroom Management",
    "Other",
  ],
  "Bachelor of Secondary Education major in English": [
    "English Education",
    "Literature",
    "Language Teaching",
    "Other",
  ],
  "Bachelor of Secondary Education major in Mathematics": [
    "Mathematics Education",
    "Algebra",
    "Calculus",
    "Other",
  ],
  "Bachelor of Secondary Education major in Filipino": [
    "Filipino Language",
    "Philippine Literature",
    "Language Teaching",
    "Other",
  ],
  "Bachelor of Secondary Education major in Social Studies": [
    "Social Studies",
    "Philippine History",
    "Civics & Culture",
    "Other",
  ],
  "Bachelor of Secondary Education major in Science": [
    "General Science",
    "Biology",
    "Chemistry",
    "Physics",
    "Other",
  ],
  Other: ["Other"],
};

const filteredExpertise = computed(() => {
  const set = new Set();
  selectedCourses.value.forEach((course) => {
    const fullname = courseAcronymMap[course] || course;
    (expertiseMap[fullname] || []).forEach((exp) => set.add(exp));
  });
  return Array.from(set);
});
function togglePostPopup() {
  showPostPopup.value = !showPostPopup.value;
  if (!showPostPopup.value) {
    jobData.value = {
      job_title: "",
      job_description: "",
      job_location: "",
      monthly_salary: "",
      job_type: "",
      total_slots: "",
    };
    selectedCourses.value = [];
    selectedExpertise.value = [];
  }
}
function toggleCourseDropdown() {
  showCourseDropdown.value = !showCourseDropdown.value;
}
function toggleExpertiseDropdown() {
  showExpertiseDropdown.value = !showExpertiseDropdown.value;
}
const handleCheckboxChange = (event, course) => {
  if (event.target.checked) {
    if (selectedCourses.value.length < 3) {
      selectedCourses.value.push(course);
    } else {
      selectedCourses.value.shift();
      selectedCourses.value.push(course);
    }
  } else {
    selectedCourses.value = selectedCourses.value.filter((c) => c !== course);
  }
};
const handleExpertiseCheckboxChange = (event, expertise) => {
  if (event.target.checked) {
    if (selectedExpertise.value.length < 3) {
      selectedExpertise.value.push(expertise);
    } else {
      selectedExpertise.value.shift();
      selectedExpertise.value.push(expertise);
    }
  } else {
    selectedExpertise.value = selectedExpertise.value.filter(
      (e) => e !== expertise
    );
  }
};
async function postJob() {
  try {
    jobData.value.recommended_course = selectedCourses.value[0] || null;
    jobData.value.recommended_course_2 = selectedCourses.value[1] || null;
    jobData.value.recommended_course_3 = selectedCourses.value[2] || null;
    jobData.value.recommended_expertise = selectedExpertise.value[0] || null;
    jobData.value.recommended_expertise_2 = selectedExpertise.value[1] || null;
    jobData.value.recommended_expertise_3 = selectedExpertise.value[2] || null;
    const response = await axiosInstance.post("/company/postjob", { ...jobData.value });
    createToast(response.data.message, {
      type: "success",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
      toastBackgroundColor: "#045d56",
    });
    jobData.value = {
      job_title: "",
      job_description: "",
      job_location: "",
      monthly_salary: "",
      job_type: "",
      total_slots: "",
    };
    selectedCourses.value = [];
    selectedExpertise.value = [];
    await fetchPostedJobs();
  } catch (error) {
    if (error.response && error.response.status === 422) {
      const errors = error.response.data.error;
      let errorMessages = Object.values(errors).flat().join("\n");
      createToast(errorMessages, {
        type: "danger",
        position: "top-right",
        timeout: 5000,
        showIcon: true,
      });
    } else {
      console.error("Unexpected error:", error);
      createToast("An unexpected error occurred.", {
        type: "danger",
        position: "top-right",
        timeout: 3000,
        showIcon: true,
      });
    }
  }
}

// --- APPLICANT ACTIONS ---
async function fetchApplicants(jobId) {
  try {
    const response = await axiosInstance.get(`/job/${jobId}/applications`);
    jobApplicants.value = response.data.applications.filter(
      (applicant) =>
        applicant.status !== "rejected" && applicant.status !== "hired"
    );
  } catch (error) {
    console.error("Failed to fetch applicants", error);
    jobApplicants.value = [];
  }
}
const toggleItem = async (applicationId) => {
  if (expandedItems.value.has(applicationId)) {
    expandedItems.value.delete(applicationId);
  } else {
    const application = jobApplicants.value.find(
      (app) => app.id === applicationId
    );
    if (application && application.status === "applied") {
      await setApplicationToScreening(applicationId);
    }
    expandedItems.value.add(applicationId);
  }
};
async function setApplicationToScreening(applicationId) {
  try {
    await axiosInstance.post(`/company/job-applications/${applicationId}/assess`, {
      status: "screening",
    });
    const idx = jobApplicants.value.findIndex(
      (app) => app.id === applicationId
    );
    if (idx !== -1) {
      jobApplicants.value[idx].status = "screening";
    }
  } catch (error) {
    console.error("Failed to update status to screening", error);
    createToast("Failed to update status", { type: "danger" });
  }
}
function canMarkAsInterviewed(application) {
  if (!application.scheduled_at) return false;
  const now = new Date();
  const scheduled = new Date(application.scheduled_at.replace(" ", "T"));
  return now >= scheduled;
}
function handleMarkAsInterviewed(application) {
  if (!canMarkAsInterviewed(application)) {
    createToast(
      "You can only mark as interviewed after the scheduled date/time.",
      {
        type: "warning",
        position: "top-right",
        timeout: 3000,
        showIcon: true,
      }
    );
    return;
  }
  markAsInterviewed(application.id);
}
async function markAsInterviewed(applicationId) {
  try {
    await assessApplication(applicationId, "interviewed");
    createToast("Application marked as interviewed!", {
      type: "success",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
      toastBackgroundColor: "#045d56",
    });
    await fetchApplicants(selectedJob.value.id);
  } catch (error) {
    console.error("Failed to mark as interviewed", error);
    createToast("Failed to update status", { type: "danger" });
  }
}

// --- INTERVIEW SCHEDULING ---
const scheduledAt = ref(null);
const showScheduleInterviewPopup = ref(false);
const scheduleInterviewDate = ref("");
const interviewVenue = ref("");
let scheduleInterviewAppId = null;

function closeScheduleInterviewPopup() {
  showScheduleInterviewPopup.value = false;
  scheduleInterviewDate.value = "";
  interviewVenue.value = "";
  scheduleInterviewAppId = null;
}

function scheduleInterview(applicationId) {
  scheduleInterviewAppId = applicationId;
  scheduleInterviewDate.value = "";
  showScheduleInterviewPopup.value = true;
}

async function submitScheduleInterview() {
  const date = scheduleInterviewDate.value;
  const venue = interviewVenue.value;
  if (!date) {
    createToast("Please select a date and time.", {
      type: "danger",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
    });
    return;
  }
  if (!venue) {
    createToast("Please enter the interview venue.", {
      type: "danger",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
    });
    return;
  }
  const inputDate = new Date(date);
  const now = new Date();
  if (isNaN(inputDate.getTime())) {
    createToast("Invalid date format. Please use the date picker.", {
      type: "danger",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
    });
    return;
  }
  if (inputDate <= now) {
    createToast("Interview date must be in the future.", {
      type: "warning",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
    });
    return;
  }
  selectedApplicationId.value = scheduleInterviewAppId;
  decisionType.value = "for_interview";
  const formattedDate = date.replace("T", " ") + ":00";
  scheduledAt.value = formattedDate;

  pendingUpdate.value = {
    applicationId: scheduleInterviewAppId,
    status: "for_interview",
    scheduled_at: formattedDate,
    venue: venue,
    comment: comment.value,
  };

  showConfirmUpdatePopup.value = true;
  closeScheduleInterviewPopup();
}

// --- STATUS UPDATE & CONFIRMATION POPUP ---
const showStatusOptions = ref(false);
const comment = ref("");
const showConfirmUpdatePopup = ref(false);
const pendingUpdate = ref({
  status: "",
  scheduled_at: "",
  venue: "",
  comment: "",
  applicationId: null,
});
const selectedApplicationId = ref(null);
const decisionType = ref("");
function confirmUpdate(applicationId, status, scheduled_at, comment, venue) {
  pendingUpdate.value = { applicationId, status, scheduled_at, comment, venue };
  showConfirmUpdatePopup.value = true;
}
async function submitConfirmedUpdate() {
  showConfirmUpdatePopup.value = false;
  try {
    const payload = {
      status: pendingUpdate.value.status,
      scheduled_at: pendingUpdate.value.scheduled_at,
      comment: pendingUpdate.value.comment,
      venue: pendingUpdate.value.venue,
    };

    await axiosInstance.post(
      `/company/job-applications/${pendingUpdate.value.applicationId}/assess`,
      payload
    );

    createToast("Application status updated successfully", {
      type: "success",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
      toastBackgroundColor: "#045d56",
    });
    comment.value = ""; // Clear the comment
        showStatusOptions.value = false; // Hide status options


    // Update local state
    await fetchApplicants(selectedJob.value.id);
  } catch (error) {
    console.error("Error updating application:", error);
    createToast("Failed to update application", {
      type: "error",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
    });
  }
}
function openConfirmModal(applicationId, status) {
  selectedApplicationId.value = applicationId;
  decisionType.value = status;
  showStatusOptions.value = true;
}

async function assessApplication(
  applicationId,
  status,
  scheduleAt = null,
  comment = "",
  venue = ""
) {
  try {
    const payload = { status, scheduled_at: scheduleAt, comment, venue };
    await axiosInstance.post(`/company/job-applications/${applicationId}/assess`, payload);


    // Update the specific application in the current list
    const applicationIndex = jobApplicants.value.findIndex(
      (app) => app.id === applicationId
    );
    if (applicationIndex !== -1) {
      jobApplicants.value[applicationIndex] = {
        ...jobApplicants.value[applicationIndex],
        status,
        scheduled_at: scheduleAt,
        comment,
        venue,
      };
    }

    createToast("Application status updated successfully", {
      type: "success",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
      toastBackgroundColor: "#045d56",
    });

    // Only do the job offer logic if needed, remove fetchApplicants
    if (status === "accepted") {
      try {
        await axiosInstance.post(`/company/offer-job/${applicationId}`);
        createToast("Job offer sent successfully", {
          type: "success",
          position: "top-right",
          timeout: 3000,
          showIcon: true,
          toastBackgroundColor: "#045d56",
        });
      } catch (offerError) {
        console.error("Error sending job offer:", offerError);
        createToast(
          offerError.response?.data?.error || "Failed to send job offer",
          {
            type: "danger",
            position: "top-right",
            timeout: 3000,
            showIcon: true,
          }
        );
      }
    }

    // Update job counts without fetching all applicants again

    // const jobResponse = await axios.get(`/company/job/${selectedJob.value.id}`);
    // const jobIndex = postedJobs.value.findIndex(
    //   (job) => job.id === selectedJob.value.id
    // );
    // if (jobIndex !== -1) {
    //   postedJobs.value[jobIndex] = jobResponse.data.job;
    // }
  } catch (error) {
    console.error("Error updating application status:", error);
    createToast(error.response?.data?.error || "Failed to update application", {
      type: "danger",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
    });
  }
}

// --- MESSAGING ---
const selectedApplicantId = ref(null);
const showMessagePopup = ref(false);
function sendMessage(applicationId) {
  selectedApplicantId.value = applicationId;
  showMessagePopup.value = true;
}
const messageContent = ref("");
async function sendActualMessage() {
  try {
    await axiosInstance.post("/message/send", {
      receiver_id: selectedApplicantId.value,
      message: messageContent.value,
    });
    showMessagePopup.value = false;
    messageContent.value = "";
    createToast("Message sent successfully!", {
      type: "success",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
      toastBackgroundColor: "#045d56",
    });
  } catch (error) {
    console.error("Error sending message:", error);
    createToast("Failed to send message. Please try again.", {
      type: "danger",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
    });
  }
}

// --- STATUS & DESCRIPTION HELPERS ---
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
    case "for_interview":
      return "For Interview";
    case "accepted":
      return "Accepted";
    case "applied":
      return "Applied";
    case "screening":
      return "Screening";
    default:
      return type;
  }
}
function formatCourse(course){
  return courseAcronymMap[course] || course;
};
function statusDescription(status) {
  switch (status) {
    case "applied":
      return "Awaiting Review";
    case "screening":
      return "Under Screening";
    case "for_interview":
      return "Interview Scheduled";
    case "accepted":
      return "Job Offered";
    case "rejected":
      return "Application Rejected";
    case "hired":
      return "Hired";
    default:
      return status;
  }
}

// --- INIT ---
onMounted(() => {
  fetchPostedJobs();
  fetchNotifications();
});
const downloadJobReport = async (job) => {
  const jobToDownload = job || selectedJob.value;
  if (!jobToDownload) {
    createToast("Please select a job first", {
      type: "warning",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
      toastBackgroundColor: "#045d56",
    });
    return;
  }

  try {
    const response = await axiosInstance.get(
      `/report/job/${jobToDownload.id}/download`,
      {
        responseType: "blob",
      }
    );

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${jobToDownload.job_title}_report.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    createToast("Report downloaded successfully!", {
      type: "success",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
      toastBackgroundColor: "#045d56",
    });
  } catch (error) {
    console.error("Error downloading job report:", error);
    createToast("Failed to download report", {
      type: "danger",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
    });
  }
};
async function fetchPostedJobs() {
  try {
    const response = await axiosInstance.get("/company/jobdisplay");
    postedJobs.value = response.data.jobs.sort(
      (a, b) => new Date(b.date_posted) - new Date(a.date_posted)
    );
    if (postedJobs.value.length > 0) {
      selectedJob.value = postedJobs.value[0];
      await fetchApplicants(selectedJob.value.id);
    } else {
      jobApplicants.value = [];
    }
  } catch (error) {
    console.error("Error fetching posted jobs:", error);
  }
}
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
  height: auto;
  overflow: AUTO;
}
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 200px;
  background: #fafafa;
  padding: 20px 0;
  border-radius: 2vh;
  border-right: 3.5px solid #045d56;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  z-index: 1000;
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
  margin-left: 200px;
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
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.popup {
  background: #fff;
  padding: 2rem;
  border-radius: 10px;
  min-width: 300px;
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

.confirm-update-popup {
  background: #fff;
  padding: 2.5rem 2.5rem 2rem 2.5rem;
  border-radius: 18px;
  min-width: 340px;
  max-width: 95vw;
  box-shadow: 0 8px 32px rgba(4, 93, 86, 0.18);
  animation: popIn 0.25s;
  font-family: "Work Sans", sans-serif;
}

.confirm-update-popup h3 {
  margin-bottom: 18px;
  font-size: 26px;
  color: #045d56;
  text-align: center;
  letter-spacing: 1px;
}

.confirm-update-popup ul {
  list-style: none;
  padding: 0;
  margin: 0 0 18px 0;
}

.confirm-update-popup ul li {
  padding: 10px 0;
  border-bottom: 1px solid #e0e6ed;
  font-size: 16px;
  color: #222;
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.confirm-update-popup ul li:last-child {
  border-bottom: none;
}

.confirm-update-popup ul strong {
  min-width: 90px;
  color: #045d56;
  font-weight: 600;
}

.confirm-update-popup .popup-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 18px;
}

.confirm-update-popup .cancel-btn,
.confirm-update-popup .confirm-btn {
  padding: 8px 22px;
  border-radius: 8px;
  border: none;
  font-size: 15px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s, color 0.2s;
}

.confirm-update-popup .cancel-btn {
  background: #b0b0b0;
  color: #fff;
}

.confirm-update-popup .cancel-btn:hover {
  background: #888;
}

.confirm-update-popup .confirm-btn {
  background: #045d56;
  color: #fff;
}

.confirm-update-popup .confirm-btn:hover {
  background: #033f3a;
}

.content {
  padding: 20px;
  display: flex;
  gap: 20px;
  overflow: auto;
  margin-bottom: 0.5vh;
}
.left-content {
  flex: 3;
}

.post-box {
  background: white;
  padding: 20px;
  margin-bottom: 10px;
  border-radius: 5vh;
  width: 130vh;
  height: 75vh;
  border-bottom: #045d56 solid 4px;
  overflow: auto;
}

.post-box.collapsed {
  background: white;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 15px;
  text-align: center;
  text-transform: uppercase;
  width: 100%;
  height: auto;
  border-bottom: #045d56 solid 4px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.post-box.collapsed:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.post-box.collapsed h3 {
  margin: 0;
  font-size: 30px;
  text-align: center;
  text-transform: uppercase;
}

.post-box.collapsed p {
  margin: 10px 0 0;
  color: #666;
  font-size: 14px;
}

.post-popup {
  width: 100%;
  max-width: 125vh;
  max-height: 90vh;
  overflow-y: auto;
}

.popup-actions {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.submit-btn {
  background-color: #045d56;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.submit-btn:hover {
  background-color: #033f3a;
}

.post-box textarea {
  width: 100%;
  background-color: #f1f1f1;
  padding: 10px 15px;
  margin-top: 2vh;
  border-radius: 13px;
  height: 30vh;
  border: none;
  font-size: 14px;
  resize: none;
  outline: none;
}

.post-box h3 {
  text-align: left;
  font-size: 30px;
}

.post-box button {
  background: #00695c;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 10px;
  margin-top: -30px;
  margin-bottom: 5px;
  cursor: pointer;
  transition: color 0.3s ease-in-out;
  float: right;
}

.post-box button:hover {
  color: #045d56;
  background: #f1f1f1;
}

.schedule-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e6ed;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  background-color: #f9f9f9;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.schedule-input:focus {
  outline: none;
  border-color: #045d56;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(4, 93, 86, 0.1);
}

#venue {
  width: 100%;
  padding: 12px;
  margin: 10px 0 20px 0;
  border: 1px solid #e0e6ed;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  background-color: #f9f9f9;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

#venue:focus {
  outline: none;
  border-color: #045d56;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(4, 93, 86, 0.1);
}

#venue::placeholder {
  color: #999;
  font-size: 14px;
}
.form-row {
  display: grid;
  grid-template-columns: repeat(2, 3fr);
  gap: 1vh;
  align-items: center;
  margin-top: 3vh;
}

.job-form {
  flex: 1;
  position: relative;
  width: 41vh;
  padding: 8px 6px;
  margin-left: 3vh;
  border-radius: 2vh;
  background-color: #f5f5f5;
  color: #333;
  font-size: 14px;
  transition: background-color 0.3s ease-in-out;
  z-index: 1;
}

.job-form:hover {
  background-color: #e0e0e0;
  color: #045d56;
}

.job-title {
  width: 100%;
  padding: 10px 15px;
  margin-bottom: 2vh;
  border: none;
  border-radius: 12px;
  background-color: #f1f1f1;
  font-size: 14px;
  color: #333;
  transition: all 0.3s ease-in-out;
  box-shadow: inset 0 0 0 1px transparent;
  outline: none;
}

.dropdown-checkbox {
  position: relative;
  display: flex;
  margin-top: 4vh;
}

.dropdown-btn {
  width: 88%;
  margin-left: 2.5vh;
  padding: 10px 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  text-align: left;
  font-size: 14px;
  color: #333;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dropdown-list {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #ccc;
  width: 90%;
  margin-left: 2vh;
  max-height: 400px;
  overflow-y: auto;
  z-index: 10;
}

.dropdown-list label {
  display: block;
  padding: 5px 10px;
  cursor: pointer;
}

.job-input,
.salary-input,
.slot-input {
  width: 44vh;
  margin-top: 2vh;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 14px;
  margin-left: 2.5vh;
}

.selected-job-box {
  background: white;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 3vh;
  border-radius: 3vh;
  border-left: #045d56 4px solid;
  width: 95%;
  max-height: 100vh;
  margin-left: 3vh;
  overflow-y: auto;
  text-transform: capitalize;
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
  white-space: pre-line;
  line-height: 1.5;
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
  width: 100vh;
  max-height: 80vh;
  margin-left: 8vh;
  margin-bottom: 10vh;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
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
  margin-bottom: 2vh;
  padding: 5px 24px;
  font-size: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background-color: #045d56;
  color: white;
  transition: background-color 0.2s ease;
}

.selected-job-box button:hover {
  opacity: 0.9;
}
.cancel-button {
  margin-left: 8px;
  margin-right: 5vh;
}

.application-item {
  background-color: #ffffff;
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid #e0e6ed;
  border-left: 4px solid #045d56;
  width: 100vh;
  margin: 0 0 16px 8vh;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.application-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.application-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.application-header strong {
  font-size: 16px;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.status-badge.applied {
  background-color: #e0f7fa;
  color: #00695c;
}

.status-badge.screening {
  background-color: #fff3e0;
  color: #e65100;
}

.status-badge.accepted {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-badge.rejected {
  background-color: #ffebee;
  color: #c62828;
}

.expand-icon {
  color: #045d56;
  font-size: 14px;
  transition: transform 0.3s ease;
}

.application-item.expanded .expand-icon {
  transform: rotate(180deg);
}

.application-details {
  margin-top: 12px;
  padding-top: 16px;
  border-top: 1px solid #e0e6ed;
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: slideDown 0.3s ease;
}

.application-details span {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #4a5568;
}

.application-details strong {
  color: #2d3748;
  min-width: 100px;
}

.application-documents {
  display: flex;
  gap: 16px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e6ed;
}

.application-documents a {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #e0f2f1;
  color: #045d56;
  border-radius: 8px;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s ease;
}

.application-documents a:hover {
  background-color: #045d56;
  color: white;
}

.application-actions {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e6ed;
}

.application-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.message-btn {
  background-color: #e0f2f1;
  color: #045d56;
  margin-right: 12px;
}

.message-btn:hover {
  background-color: #045d56;
  color: white;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 1vh;
  margin-left: 5vh;
  margin-bottom: 1vh;
}

.button-group label {
  display: flex;
  align-items: center;
  background-color: #045d56;
  color: white;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
  font-size: 10px;
  transition: background-color 0.2s ease;
}

.button-group label:hover {
  background-color: #033f3a;
}

.button-group input[type="checkbox"] {
  margin-right: 6px;
  width: 14px;
  height: 14px;
  cursor: pointer;
  accent-color: #e0f2f1; /* Modern color for check */
}

.button-group input[type="checkbox"]:focus {
  outline: 2px solid #e0f2f1;
  outline-offset: 2px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  padding: 20px 30px;
  border-radius: 10px;
  text-align: center;
}
.modal-buttons button {
  margin: 20px 20px;
  padding: 6px 15px;
  background-color: #d32f2f;
  color: white;
  border-radius: 10px;
  border: none;
  cursor: pointer;
}

textarea {
  border: 1px solid #ccc;
  padding: 10px 22px;
  border-radius: 8px;
  font-size: 14px;
  width: 100%;
  height:11vh;    
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

.posted-jobs-box .download-report-btn {
  margin-top: 18px;
  align-self: center;
  background-color: #045d56;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 22px;
  font-size: 15px;
  font-weight: 400;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.08);
}

.posted-jobs-box .download-report-btn:hover {
  background-color: #033f3a;
  color: #e3f2fd;
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.18);
}

.sidebar.collapsed {
  width: 0px;
  overflow: hidden;
  transition: width 0.3s ease;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
  padding: 20px 0;
}

.pagination-btn {
  background-color: #045d56;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #033f3a;
  transform: translateY(-2px);
}

.pagination-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 8px;
  align-items: center;
}

.page-number {
  width: 35px;
  height: 35px;
  border: none;
  border-radius: 50%;
  background-color: #f1f1f1;
  color: #045d56;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-number:hover {
  background-color: #e0e0e0;
}

.page-number.active {
  background-color: #045d56;
  color: white;
}
.accept-btn {
  background-color: #1976d2;
  color: white;
  margin-right: 8px;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
}
.accept-btn:hover {
  background-color: #1565c0;
}
.reject-btn {
  background-color: #d32f2f;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
}
.reject-btn:hover {
  background-color: #b71c1c;
}

.waiting-response {
  margin-top: 12px;
  color: #1976d2;
  font-style: italic;
  font-weight: 500;
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

  .main {
    margin-left: 0;
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
  .post-box.collapsed {
    width: 100%;
  }
  .logo {
    margin-top: 4vh;
    margin-left: 4vh;
    margin-bottom: 8vh;
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
  .posted-jobs-box .download-report-btn {
    width: 100%;
    font-size: 10px;
  }

  .selected-job-box {
    width: 90%;
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
    overflow: auto;
  }

  .posted-jobs-box {
    width: 100%;
    margin: 5px 0;
    padding: 8px;
    font-size: 10px;
    margin-left: 15vh;
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
    display: grid;
    flex-direction: column;
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
  .selected-job-box {
    width: 100%;
    max-height: 50vh;
    margin-left: -1vh;
    font-size: 12px;
    padding: 15px;
    border-radius: 3vh;
  }
  .selected-job-box h2 {
    font-size: 20px;
  }
  .selected-job-box h3 {
    font-size: 20px;
  }
  .selected-job-box p {
    font-size: 10px;
  }
  .selected-job-box ul {
    margin-left: -10vh;
  }
  .selected-job-box li {
    width: 90%;
  }
  .selected-job-box li strong {
    font-size: 12px;
  }
  .application-header {
    font-size: 12px;
  }
  .right-content {
    width: 90%;
    margin-left: 3vh;
    overflow: auto;
  }

  .posted-jobs-box {
    width: 90%;
    margin: 10px 0;
    padding: 15px;
    font-size: 12px;
    margin-left: 2vh;
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

  .right-content {
    flex: 1;
    margin-left: 3.5vh;
    padding-top: 3vh;
    height: auto;
    overflow: auto;
  }
  .sign-out {
    width: 60px;
    height: 40px;
    margin-left: 7.5vh;
  }
}
</style>
