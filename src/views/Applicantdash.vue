<template>
  <div class="container">
    <div class="sidebar" :class="{ collapsed: !isSidenavOpen }">
      <img src="/public/gcchnobg.png" alt="GCCH Logo" class="logo" />
      <ul>
        <li style="font-weight: bold">
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
          <div class="search-container">
            <img src="/public/search.png" alt="Search" class="search-icon" />
            <input
              type="text"
              placeholder="Search..."
              class="search-input"
              v-model="searchQuery"
              @input="handleSearch"
            />
          </div>
        </div>

        <div class="icons-right">
          <div class="icon" @click="toggleExpertiseDropdown">
            <img src="/public/expertise.png" />
            <p>Expertise</p>
            <!-- Add the dropdown menu or logic -->
            <div class="expertise-dropdown" v-if="showExpertiseDropdown">
              <div class="dropdown-header">
                <h4>Select Expertise</h4>
              </div>
              <div class="dropdown-options">
                <div
                  v-for="expertise in expertiseOptions"
                  :key="expertise"
                  :value="expertise"
                  class="dropdown-item"
                  :class="{ active: selectedExpertise === expertise }"
                  @click="filterByExpertise(expertise)"
                >
                  {{ expertise }}
                </div>
                <div class="dropdown-item clear" @click="clearExpertiseFilter">
                  Clear Filter
                </div>
              </div>
            </div>
          </div>

          <div class="icon" @click="toggleSalaryDropdown">
            <img src="/public/money.png" />
            <p>Salary</p>
            <!-- Add the dropdown menu -->
            <div class="salary-dropdown" v-if="showSalaryDropdown">
              <div class="dropdown-header">
                <h4>Salary Range</h4>
              </div>
              <div class="dropdown-options">
                <div
                  v-for="range in salaryRanges"
                  :key="range.id"
                  class="dropdown-item"
                  :class="{ active: selectedSalaryRange === range.id }"
                  @click="filterBySalary(range)"
                >
                  ₱{{ range.min.toLocaleString() }}
                  <template v-if="range.max">
                    - ₱{{ range.max.toLocaleString() }}</template
                  >
                  <template v-else> and above</template>
                </div>
                <div class="dropdown-item clear" @click="clearSalaryFilter">
                  Clear Filter
                </div>
              </div>
            </div>
          </div>

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
          <div class="job-content">
            <h3>RECOMMENDED JOBS BASED ON COURSE</h3>

            <div v-if="paginatedJobs.length === 0" class="no-jobs-message">
              <img src="/public/job-loss.png" alt="No Jobs" class="ikon" />
              <p>No job listings available yet</p>
            </div>

            <div
              class="job-box"
              v-for="matchedJob in paginatedJobs"
              :key="matchedJob.id"
            >
              <div class="job-card">
                <!-- Header -->
                <div class="job-header">
                  <div class="job-title-section">
                    <h3 class="company-name">{{ matchedJob.job_title }}</h3>
                  </div>

                  <!-- Apply and Message Buttons -->
                  <div class="button-group">
                    <button
                      class="message-btn"
                      @click="
                        sendMessage(matchedJob.company.user_id, matchedJob)
                      "
                    >
                      Send Message
                    </button>
                    <button
                      class="apply-btn"
                      @click="applyToJob(matchedJob.id)"
                    >
                      Apply
                    </button>
                  </div>
                </div>
                <div class="job-info">
                  <div class="job-detail">
                    <img src="/public/user.png" class="ikon" />
                    <p>{{ matchedJob.company.company_name }}</p>
                  </div>
                </div>

                <!-- Move salary here BELOW description -->
                <div class="job-info">
                  <div class="job-detail">
                    <img src="/public/briefcase.png" class="ikon" />
                    <span class="job-type">{{ matchedJob.job_type }}</span>
                  </div>
                </div>

                <div class="job-info">
                  <div class="job-detail">
                    <img src="/public/money.png" class="ikon" />
                    <span class="salary">₱{{ matchedJob.monthly_salary }}</span>
                  </div>
                </div>

                <!-- Job Slots -->
                <div class="job-info">
                  <div class="job-detail">
                    <img src="/public/people.png" class="ikon" />
                    <p>
                      {{ matchedJob.filled_slots }}/{{ matchedJob.total_slots }}
                    </p>
                  </div>
                </div>
                <!-- Job Status  -->
                <div class="job-info">
                  <div class="job-detail">
                    <img src="/public/updates.png" class="ikon" />
                    <p>Status: {{ matchedJob.status }}</p>
                  </div>
                </div>
                <!--Job Location -->
                <div class="job-info">
                  <div class="job-detail">
                    <img src="/public/location.png" class="ikon" />
                    <p>Location: {{ matchedJob.job_location }}</p>
                  </div>
                </div>
                <!-- Recommended Programs and Expertise -->

                <div class="job-info">
                  <div class="job-detail">
                    <img src="/public/learning.png" class="ikon" />
                    <p>
                      {{
                        [
                          matchedJob.recommended_course,
                          matchedJob.recommended_course_2,
                          matchedJob.recommended_course_3,
                        ]
                          .filter(Boolean)
                          .join(", ")
                      }}
                    </p>
                  </div>
                </div>

                <div class="job-info">
                  <div class="job-detail">
                    <img src="/public/user-experience.png" class="ikon" />
                    <p>
                      {{
                        [
                          matchedJob.recommended_expertise,
                          matchedJob.recommended_expertise_2,
                          matchedJob.recommended_expertise_3,
                        ]
                          .filter(Boolean)
                          .join(", ")
                      }}
                    </p>
                  </div>
                </div>
                <!-- Job Description -->
                <p class="job-description">{{ matchedJob.job_description }}</p>
              </div>
            </div>

            <!-- Pagination Controls -->
            <div class="pagination">
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
          </div>
        </div>

        <!-- Notifications -->
        <div class="right-content">
          <div v-if="hiredApplication" class="hired">
            <div class="hired-status-box">
              <div class="hired-header">
                <img
                  src="/public/checked.png"
                  alt="success icon"
                  class="ikon"
                />
                <h3>YOU'RE HIRED!</h3>
              </div>
              <div class="hired-content" v-if="hiredJobDetails">
                <p>Company Name: {{ hiredJobDetails.company.company_name }}</p>
                <p>Job Title: {{ hiredJobDetails.job_title }}</p>
                <p>Job Type: {{ formatType(hiredJobDetails.job_type) }}</p>
                <p>Started By: {{ formatDate(hiredJobDetails.created_at) }}</p>
                <button @click="downloadCertificate" class="download-btn">
                  Download Certificate
                </button>
              </div>
            </div>
          </div>

          <div v-else class="hired">
            <div class="hired-status-box">
              <div class="hired-header">
                <h3>NO JOB YET</h3>
              </div>
              <div class="hired-content">
                <p>
                  You haven't been hired for any job at the moment. Keep
                  applying!
                </p>
              </div>
            </div>
          </div>

          <div class="cards">
            <div class="card">
              <p>
                <strong>
                  <img
                    src="/public/management.png"
                    alt="total clients Icon"
                    class="ikon"
                  />
                  ONGOING JOB APPLICATIONS</strong
                >
              </p>
              <p>{{ ongoingApplicationsCount }}</p>
            </div>
            <div class="card">
              <p>
                <strong>
                  <img
                    src="/public/counting.png"
                    alt="total job listings Icon"
                    class="ikon"
                  />
                  MATCHING JOBS COUNT</strong
                >
              </p>
              <p>{{ matchedJobCount }}</p>
            </div>
            <div class="card">
              <p>
                <strong>
                  <img
                    src="/public/email.png"
                    alt="pending applications Icon"
                    class="ikon"
                  />
                  OFFERED JOBS</strong
                >
              </p>
              <p>{{ acceptedApplicationsCount }}</p>
            </div>
          </div>

          <!-- Add this after your cards div -->
          <div class="chart-container">
            <canvas id="statsChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Job Application Pop up -->
  <div
    v-if="showApplyPopup"
    class="popup-overlay"
    @click.self="closeApplyPopup"
  >
    <div class="apply-popup">
      <!-- Step 1: Contact Information -->
      <div v-if="applicationStep === 1">
        <h3>📝 Contact Information</h3>
        <div class="form-group">
          <label>Full Name</label>
          <input
            type="text"
            v-model="contactInfo.name"
            placeholder="Enter your full name"
            class="form-input"
          />
        </div>
        <div class="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            v-model="contactInfo.phone"
            placeholder="Enter your phone number"
            class="form-input"
          />
        </div>
        <div class="form-group">
          <label>Email Address</label>
          <input
            type="email"
            v-model="contactInfo.email"
            placeholder="Enter your email address"
            class="form-input"
          />
        </div>
        <div class="popup-buttons">
          <button @click="closeApplyPopup" class="cancel-btn">Cancel</button>
          <button @click="nextStep" class="next-btn">Next</button>
        </div>
      </div>

      <!-- Step 2: Document Upload -->
      <div v-if="applicationStep === 2">
        <h3>📄 Upload Documents</h3>
        <div class="form-group">
          <label>Resume</label>
          <input
            type="file"
            @change="handleFileUploadResume"
            accept=".pdf"
            class="file-input"
            required
          />
          <small class="file-note"
            >Note: File size limit is 2MB (PDF only)</small
          >
        </div>
        <div class="form-group">
          <label>Cover Letter</label>
          <input
            type="file"
            @change="handleFileUploadCoverLetter"
            accept=".pdf"
            class="file-input"
            required
          />
          <small class="file-note"
            >Note: File size limit is 2MB (PDF only)</small
          >
        </div>
        <div class="popup-buttons">
          <button @click="previousStep" class="back-btn">Back</button>
          <button @click="nextStep" class="next-btn">Next</button>
        </div>
      </div>

      <!-- Step 3: Work Experience -->
      <div v-if="applicationStep === 3" class="work-experience-section">
        <h3>💼 Lastest Work Experience (Optional)</h3>
        <div class="form-group">
          <label>Company Name</label>
          <input
            type="text"
            v-model="workExperience.company"
            placeholder="Enter company name"
            class="form-input"
          />
        </div>

        <div class="form-group date-group">
          <label>Employment </label>
          <div class="date-inputs">
            <div class="date-field">
              <span>From</span>
              <input
                type="date"
                v-model="workExperience.dateFrom"
                class="form-input"
              />
            </div>
            <div class="date-field">
              <span>To</span>
              <input
                type="date"
                v-model="workExperience.dateTo"
                class="form-input"
              />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>City</label>
          <input
            type="text"
            v-model="workExperience.city"
            placeholder="Enter city"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label>Industry</label>
          <input
            type="text"
            v-model="workExperience.industry"
            placeholder="Enter industry"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea
            v-model="workExperience.description"
            placeholder="Describe your role and responsibilities"
            class="form-input description-input"
            rows="4"
          ></textarea>
        </div>

        <div class="popup-buttons">
          <button @click="previousStep" class="back-btn">Back</button>
          <button @click="submitApplication" class="submit-btn">Submit</button>
        </div>
      </div>

      <!-- Add this before your form content in the apply-popup div -->
      <div class="step-indicator">
        <div
          class="step"
          :class="{
            active: applicationStep === 1,
            completed: applicationStep > 1,
          }"
        >
          <div class="step-number">1</div>
          <span class="step-text">Contact Info</span>
        </div>
        <div
          class="step"
          :class="{
            active: applicationStep === 2,
            completed: applicationStep > 2,
          }"
        >
          <div class="step-number">2</div>
          <span class="step-text">Documents</span>
        </div>
        <div class="step" :class="{ active: applicationStep === 3 }">
          <div class="step-number">3</div>
          <span class="step-text">Experience</span>
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
      <div v-if="selectedJobForMessage">
        <p>
          <strong>Inquiring about:</strong>
          {{ selectedJobForMessage.job_title }}
        </p>
      </div>
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
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from "vue";
import axiosInstance from "../plugins/axios"; // Adjust the path as necessary
import { useRouter } from "vue-router";
import { createToast } from "mosha-vue-toastify";
import "mosha-vue-toastify/dist/style.css";
import Chart from "chart.js/auto";

const router = useRouter();

// Reactive state variables
const showNotif = ref(false);
const showSignOut = ref(false);
const newNotifications = ref(0);
const showApplyPopup = ref(false);
const isSidenavOpen = ref(true);
// COUNTS
const ongoingApplicationsCount = ref(0);
const matchedJobCount = ref(0);
const acceptedApplicationsCount = ref(0);

//for Message Popup
const showMessagePopup = ref(false);
const selectedCompanyId = ref(null);
const messageContent = ref("");

//for Apply Popup
const selectedJobId = ref(null);
const resumeFile = ref(null);
const coverLetterFile = ref(null);

//for Job Listings
const recommendedJobs = ref([]);
const hiredApplication = ref(null);
const hiredJobDetails = ref(null);

//For Notifications
const notifications = ref([]);

// Pagination state
const currentPage = ref(1);
const jobsPerPage = ref(2); // Number of jobs to show per page

//User Data
const applicant = ref(null);
const applicantProgram = ref(null);

onMounted(async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Set token in axios headers
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // Fetch all data in parallel
    await Promise.all([
      fetchJobs(),
      fetchHiredApplication(),
      fetchNotifications(),
      fetchDashboardCounts(),
    ]);

    // Use longer delay to ensure DOM is ready
    setTimeout(() => {
      updateChart();
    }, 500);
  } catch (error) {
    console.error("Error during initialization:", error);
    if (!error.response) {
      createToast("Connection error. Please check your network.", {
        type: "error",
        position: "top-right",
        timeout: 5000,
      });
    } else if (error.response.status === 401) {
      localStorage.removeItem("token");
      router.push("/login");
    }
  }
});

// Computed properties
const totalPages = computed(() => {
  return Math.ceil(
    recommendedJobs.value.filter(
      (job) =>
        job.status === "open" &&
        (!searchQuery.value ||
          job.job_title.toLowerCase().includes(searchQuery.value.toLowerCase()))
    ).length / jobsPerPage.value
  );
});

const paginatedJobs = computed(() => {
  const filteredJobs = recommendedJobs.value
    .filter(
      (job) =>
        job.status === "open" &&
        (!searchQuery.value ||
          job.job_title.toLowerCase().includes(searchQuery.value.toLowerCase()))
    )
    .sort((a, b) => {
      const dateA = new Date(a.date_posted);
      const dateB = new Date(b.date_posted);
      return dateB - dateA; // newest jobs first
    });

  const start = (currentPage.value - 1) * jobsPerPage.value;
  const end = start + jobsPerPage.value;
  return filteredJobs.slice(start, end);
});

// NavBar Logic
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
    const token = localStorage.getItem("token");
    await axiosInstance.post(
      "/logout",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    localStorage.clear();
    delete axiosInstance.defaults.headers.common["Authorization"];

    createToast("Successfully signed out", {
      type: "success",
      position: "top-right",
      timeout: 2000,
      showIcon: true,
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
      showIcon: true,
    });
  }
}

const fetchJobs = async (filters = {}) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    const response = await axiosInstance.get("/applicant/jobdisplay", {
      params: filters,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.jobs) {
      recommendedJobs.value = response.data.jobs.sort((a, b) => {
        const dateA = new Date(a.date_posted);
        const dateB = new Date(b.date_posted);
        return dateB - dateA;
      });
    }
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      router.push("/login");
    } else {
      createToast("Failed to fetch jobs. Please try again.", {
        type: "error",
        position: "top-right",
        timeout: 3000,
      });
    }
  }
};

const fetchDashboardCounts = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    const [ongoingResponse, matchedResponse, acceptedResponse] =
      await Promise.all([
        axiosInstance.get("/applicant/ongoing-applications"),
        axiosInstance.get("/applicant/matched-jobs"),
        axiosInstance.get("/applicant/accepted-applications"),
      ]);

    ongoingApplicationsCount.value =
      ongoingResponse.data.total_jobs_applied || 0;
    matchedJobCount.value = matchedResponse.data.matched_jobs_count || 0;
    acceptedApplicationsCount.value =
      acceptedResponse.data.accepted_jobs_count || 0;

    console.log("Dashboard counts fetched:", {
      ongoingApplicationsCount: ongoingApplicationsCount.value,
      matchedJobCount: matchedJobCount.value,
      acceptedApplicationsCount: acceptedApplicationsCount.value,
    });
  } catch (error) {
    console.error("Error fetching dashboard counts:", error);
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      router.push("/login");
    } else {
      createToast("Failed to fetch dashboard data", {
        type: "error",
        position: "top-right",
        timeout: 5000,
      });
    }
  }
};

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

async function applyToJob(jobId) {
  selectedJobId.value = jobId;

  await fetchUserData();

  const first = applicant.value.applicant.first_name || "";
  const middle = applicant.value.applicant.middle_name
    ? ` ${applicant.value.applicant.middle_name} `
    : " ";
  const last = applicant.value?.applicant?.last_name || "";

  contactInfo.value = {
    name: `${first}${middle}${last}`.replace(/\s+/g, " ").trim(),
    phone: applicant.value?.applicant?.phone_number,
    email: applicant.value?.user?.email,
  };

  showApplyPopup.value = true;
}

const applicationStep = ref(1);
const contactInfo = ref({
  name: "",
  phone: "",
  email: "",
});

const workExperience = ref({
  company: "",
  dateFrom: "",
  dateTo: "",
  city: "",
  industry: "",
  description: "",
});

function nextStep() {
  if (applicationStep.value === 1) {
    if (
      !contactInfo.value.name ||
      !contactInfo.value.phone ||
      !contactInfo.value.email
    ) {
      createToast("Please fill in all contact information", {
        type: "warning",
        position: "top-right",
        timeout: 3000,
        showIcon: true,
      });
      return;
    }
    applicationStep.value = 2;
  } else if (applicationStep.value === 2) {
    if (!resumeFile.value || !coverLetterFile.value) {
      createToast("Please upload both resume and cover letter", {
        type: "warning",
        position: "top-right",
        timeout: 3000,
        showIcon: true,
      });
      return;
    }
    applicationStep.value = 3;
  } else if (applicationStep.value === 3) {
    if (
      !workExperience.value.company ||
      !workExperience.value.dateFrom ||
      !workExperience.value.dateTo ||
      !workExperience.value.city ||
      !workExperience.value.industry
    ) {
      createToast("Please fill in all work experience details", {
        type: "warning",
        position: "top-right",
        timeout: 3000,
        showIcon: true,
      });
      return;
    }
    submitApplication();
  }
}

function previousStep() {
  if (applicationStep.value > 1) {
    applicationStep.value--;
  }
}

async function submitApplication() {
  const formData = new FormData();
  formData.append("job_id", selectedJobId.value);
  formData.append("cover_letter", coverLetterFile.value);
  formData.append("name", contactInfo.value.name);
  formData.append("phone", contactInfo.value.phone);
  formData.append("email", contactInfo.value.email);

  // Add work experience data
  formData.append("work_experience", JSON.stringify(workExperience.value));

  if (resumeFile.value) {
    formData.append("resume", resumeFile.value);
  }

  try {
    const response = await axiosInstance.post("/applicant/jobapply", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    await fetchDashboardCounts();
    createToast(response.data.message, {
      type: "success",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
      toastBackgroundColor: "#045d56",
    });
    closeApplyPopup();
  } catch (error) {
    if (error.response && error.response.status === 422) {
      const errors = error.response.data.error;
      let errorMessages = Object.values(errors).flat().join("\n");
      createToast(errorMessages, {
        type: "danger",
        position: "top-right",
        timeout: 5000,
        showIcon: true,
        toastBackgroundColor: "#045d56",
      });
    } else {
      createToast("An unexpected error occurred.", {
        type: "danger",
        position: "top-right",
        timeout: 3000,
        showIcon: true,
      });
    }
  }
}

function handleFileUploadResume(event) {
  const file = event.target.files[0];
  const maxSize = 2 * 1024 * 1024; // 2MB in bytes

  if (file.size > maxSize) {
    createToast("Resume file must be less than 2MB", {
      type: "error",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
      toastBackgroundColor: "#FF0000",
    });
    event.target.value = ""; // Clear the input
    return;
  }
  resumeFile.value = file;
}

function handleFileUploadCoverLetter(event) {
  const file = event.target.files[0];
  const maxSize = 2 * 1024 * 1024; // 2MB in bytes

  if (file.size > maxSize) {
    createToast("Cover letter file must be less than 2MB", {
      type: "error",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
      toastBackgroundColor: "#FF0000",
    });
    event.target.value = ""; // Clear the input
    return;
  }
  coverLetterFile.value = file;
}

function closeApplyPopup() {
  showApplyPopup.value = false;
  applicationStep.value = 1;
  contactInfo.value = {
    name: "",
    phone: "",
    email: "",
  };
  workExperience.value = {
    company: "",
    dateFrom: "",
    dateTo: "",
    city: "",
    industry: "",
    description: "",
  };
  resumeFile.value = null;
  coverLetterFile.value = null;
  selectedJobId.value = null;
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

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

async function fetchHiredApplication() {
  try {
    const response = await axiosInstance.get("/applicant/applications");
    console.log("Applications:", response.data.applications);

    hiredApplication.value =
      response.data.applications.find((app) => app.status === "hired") || null;

    if (hiredApplication.value) {
      const allJobs = [...recommendedJobs.value];
      hiredJobDetails.value =
        allJobs.find(
          (job) => String(job.id) === String(hiredApplication.value.job_id)
        ) || null;

      console.log("Hired job details:", hiredJobDetails.value);
    }
  } catch (error) {
    console.error("Error Occurred fetching applications", error);
  }
}

const downloadCertificate = async () => {
  if (!hiredApplication.value || !hiredApplication.value.id) {
    createToast("No hired application found.", {
      type: "warning",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
    });
    return;
  }

  try {
    const response = await axiosInstance.get(
      `/certificate/download/${hiredApplication.value.id}`,
      {
        responseType: "blob",
      }
    );

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `acceptance_certificate_${hiredApplication.value.id}.pdf`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed:", error);
    createToast("Failed to download certificate.", {
      type: "danger",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
    });
  }
};

const selectedJobForMessage = ref(null);

function sendMessage(companyId, job = null) {
  selectedCompanyId.value = companyId;
  selectedJobForMessage.value = job;
  showMessagePopup.value = true;
}

async function sendActualMessage() {
  try {
    let messageToSend = messageContent.value;
    if (selectedJobForMessage.value) {
      messageToSend =
        `[Job Inquiry: ${selectedJobForMessage.value.job_title}] ` +
        messageToSend;
    }
    const response = await axiosInstance.post("/message/send", {
      receiver_id: selectedCompanyId.value,
      message: messageToSend,
    });

    showMessagePopup.value = false;
    messageContent.value = "";
    selectedJobForMessage.value = null;
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

// Pagination methods
function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}

function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}

function goToPage(page) {
  currentPage.value = page;
}

// Chart.js logic
const chartInstance = ref(null);

const updateChart = () => {
  nextTick(() => {
    const ctx = document.getElementById("statsChart");
    if (!ctx) {
      console.error("Chart canvas element not found");
      return;
    }

    if (chartInstance.value) {
      chartInstance.value.data.datasets[0].data = [
        ongoingApplicationsCount.value,
        matchedJobCount.value,
        acceptedApplicationsCount.value,
      ];
      chartInstance.value.update();
      return;
    }

    chartInstance.value = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Ongoing Applications", "Matching Jobs", "Offered Jobs"],
        datasets: [
          {
            label: "Application Statistics",
            data: [
              ongoingApplicationsCount.value,
              matchedJobCount.value,
              acceptedApplicationsCount.value,
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
            max:100,
            ticks: {
              stepSize: 1,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: "JOB STATISTICS",
            color: "#045d56",
            font: {
              size: 16,
              weight: "bold",
            },
          },
        },
      },
    });
  });
};

watch(
  [ongoingApplicationsCount, matchedJobCount, acceptedApplicationsCount],
  () => {
    updateChart();
  }
);

const searchQuery = ref("");

const handleSearch = () => {
  console.log("Searching for:", searchQuery.value);
};

const showSalaryDropdown = ref(false);
const selectedSalaryRange = ref(null);
const salaryRanges = ref([
  { id: 1, min: 0, max: 15000 },
  { id: 2, min: 15001, max: 25000 },
  { id: 3, min: 25001, max: 35000 },
  { id: 4, min: 35001, max: 45000 },
  { id: 5, min: 45001, max: 55000 },
  { id: 6, min: 55001 },
]);

const toggleSalaryDropdown = () => {
  showSalaryDropdown.value = !showSalaryDropdown.value;
};

const filterBySalary = async (range) => {
  selectedSalaryRange.value = range.id;

  try {
    await fetchJobs({
      min_salary: range.min,
      max_salary: range.max ?? undefined,
      expertises: selectedExpertise.value ? [selectedExpertise.value] : [],
    });

    showSalaryDropdown.value = false;

    createToast(
      range.max
        ? `Showing jobs with salary range: ₱${range.min.toLocaleString()} - ₱${range.max.toLocaleString()}`
        : `Showing jobs with salary: ₱${range.min.toLocaleString()} and above`,
      {
        type: "info",
        position: "top-right",
        timeout: 3000,
        showIcon: true,
      }
    );
  } catch {
    createToast("Error filtering jobs. Please try again.", {
      type: "error",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
    });
  }
};

const showExpertiseDropdown = ref(false);
const selectedExpertise = ref(null);

const toggleExpertiseDropdown = () => {
  showExpertiseDropdown.value = !showExpertiseDropdown.value;
};

const expertiseMap = {
  BSIT: [
    "Web Development",
    "Networking",
    "Cybersecurity",
    "System Administration",
    "Other",
  ],
  BSCS: ["Data Science", "AI", "Software Engineering", "Algorithms", "Other"],
  BSEMC: ["Multimedia Arts", "Animation", "Game Development", "Other"],
  BSN: [
    "Clinical Nursing",
    "Community Health",
    "Medical-Surgical Nursing",
    "Other",
  ],
  BSM: [
    "Strategic Management",
    "Operations Management",
    "Entrepreneurship",
    "Other",
  ],
  BSA: ["Financial Accounting", "Auditing", "Taxation", "Other"],
  "BSBA-FM": ["Corporate Finance", "Investment Analysis", "Banking", "Other"],
  "BSBA-HRM": [
    "Human Resources",
    "Talent Management",
    "Organizational Development",
    "Other",
  ],
  "BSBA-MM": ["Marketing Strategy", "Advertising", "Sales Management", "Other"],
  BSCA: ["Customs Brokerage", "Trade Compliance", "Logistics", "Other"],
  BSHM: [
    "Hotel Management",
    "Food & Beverage Service",
    "Customer Relations",
    "Other",
  ],
  BSTM: ["Tourism Planning", "Event Management", "Travel Services", "Other"],
  BAComm: ["Journalism", "Public Relations", "Media Production", "Other"],
  BECEd: ["Early Childhood Development", "Preschool Education", "Other"],
  BCAEd: ["Arts Education", "Cultural Studies", "Creative Expression", "Other"],
  BPEd: ["Sports Science", "Physical Fitness", "Coaching", "Other"],
  BEED: [
    "Elementary Teaching",
    "Child Psychology",
    "Classroom Management",
    "Other",
  ],
  "BSEd-Eng": ["English Education", "Literature", "Language Teaching", "Other"],
  "BSEd-Math": ["Mathematics Education", "Algebra", "Calculus", "Other"],
  "BSEd-Fil": [
    "Filipino Language",
    "Philippine Literature",
    "Language Teaching",
    "Other",
  ],
  "BSEd-SS": [
    "Social Studies",
    "Philippine History",
    "Civics & Culture",
    "Other",
  ],
  "BSEd-Sci": ["General Science", "Biology", "Chemistry", "Physics", "Other"],
  Other: ["Other"],
};

const expertiseOptions = computed(() => {
  return applicantProgram.value
    ? expertiseMap[applicantProgram.value] || []
    : [];
});

const filterByExpertise = async (expertiseName) => {
  selectedExpertise.value = expertiseName;

  try {
    await fetchJobs({
      expertises: [expertiseName],
      min_salary: selectedSalaryRange.value
        ? salaryRanges.value.find((r) => r.id === selectedSalaryRange.value).min
        : null,
      max_salary: selectedSalaryRange.value
        ? salaryRanges.value.find((r) => r.id === selectedSalaryRange.value).max
        : null,
    });

    showExpertiseDropdown.value = false;

    createToast(`Showing jobs requiring expertise: ${expertiseName}`, {
      type: "info",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
    });
  } catch {
    createToast("Error filtering jobs. Please try again.", {
      type: "error",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
    });
  }
};

const clearSalaryFilter = async () => {
  selectedSalaryRange.value = null;

  await fetchJobs({
    expertises: selectedExpertise.value ? [selectedExpertise.value] : [],
  });

  showSalaryDropdown.value = false;
};

const clearExpertiseFilter = async () => {
  selectedExpertise.value = null;

  await fetchJobs({
    min_salary: selectedSalaryRange.value
      ? salaryRanges.value.find((r) => r.id === selectedSalaryRange.value).min
      : null,
    max_salary: selectedSalaryRange.value
      ? salaryRanges.value.find((r) => r.id === selectedSalaryRange.value).max
      : null,
  });

  showExpertiseDropdown.value = false;
};

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
  flex: 1;
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

.topbar p {
  font-size: 0.5rem;
  color: #333;
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

.search-container {
  position: relative;
  margin-left: 20px;
}

.search-input {
  padding: 8px 15px;
  padding-left: 40px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  width: 300px;
  font-size: 14px;
  transition: all 0.3s ease;
  text-indent: 4vh;
  background-color: #f5f5f5;
}

.search-input:focus {
  outline: none;
  border-color: #045d56;
  background-color: #fff;
  box-shadow: 0 0 0 2px rgba(4, 93, 86, 0.1);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  opacity: 0.6;
}
.sidebar.collapsed {
  width: 0px;
  overflow: hidden;
  transition: width 0.3s ease;
}

.programs-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 200px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin-top: 10px;
  border: 1px solid #e0e0e0;
}

.programs-dropdown .dropdown-header {
  padding: 12px 15px;
  border-bottom: 1px solid #e0e0e0;
  color: #045d56;
}

.programs-dropdown .dropdown-header h4 {
  margin: 0;
  font-size: 14px;
}

.programs-dropdown .dropdown-options {
  max-height: 250px;
  overflow-y: auto;
}

.programs-dropdown .dropdown-item {
  padding: 10px 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
}

.programs-dropdown .dropdown-item:hover {
  background-color: #f5f5f5;
}

.programs-dropdown .dropdown-item.active {
  background-color: #e0f2f1;
  color: #045d56;
  font-weight: bold;
}

.programs-dropdown .dropdown-item.clear {
  border-top: 1px solid #e0e0e0;
  color: #666;
  font-weight: bold;
}

.programs-dropdown .dropdown-item.clear:hover {
  background-color: #fee8e7;
  color: #d32f2f;
}

.salary-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 200px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin-top: 10px;
  border: 1px solid #e0e0e0;
}

.dropdown-header {
  padding: 12px 15px;
  border-bottom: 1px solid #e0e0e0;
  color: #045d56;
}

.dropdown-header h4 {
  margin: 0;
  font-size: 14px;
}

.dropdown-options {
  max-height: 250px;
  overflow-y: auto;
}

.dropdown-item {
  padding: 10px 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.dropdown-item.active {
  background-color: #e0f2f1;
  color: #045d56;
  font-weight: bold;
}

.dropdown-item.clear {
  border-top: 1px solid #e0e0e0;
  color: #666;
  font-weight: bold;
}

.dropdown-item.clear:hover {
  background-color: #fee8e7;
  color: #d32f2f;
}

.expertise-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 200px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin-top: 10px;
  border: 1px solid #e0e0e0;
}

.expertise-dropdown .dropdown-header {
  padding: 12px 15px;
  border-bottom: 1px solid #e0e0e0;
  color: #045d56;
}

.expertise-dropdown .dropdown-header h4 {
  margin: 0;
  font-size: 14px;
}

.expertise-dropdown .dropdown-options {
  max-height: 250px;
  overflow-y: auto;
}

.expertise-dropdown .dropdown-item {
  padding: 10px 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
}

.expertise-dropdown .dropdown-item:hover {
  background-color: #f5f5f5;
}

.expertise-dropdown .dropdown-item.active {
  background-color: #e0f2f1;
  color: #045d56;
  font-weight: bold;
}

.expertise-dropdown .dropdown-item.clear {
  border-top: 1px solid #e0e0e0;
  color: #666;
  font-weight: bold;
}

.expertise-dropdown .dropdown-item.clear:hover {
  background-color: #fee8e7;
  color: #d32f2f;
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
  width: 28%;
  max-height: 400px;
  overflow-y: auto;
  text-align: left;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  animation: popIn 0.3s ease;
  resize: none;
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
  margin-right: 2vh;
}

.popup button:hover {
  background-color: #033f3a;
}

.apply-popup {
  background-color: #fff;
  padding: 30px 40px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-height: 90%;
  max-width: 500px;
  z-index: 1000;
  animation: fadeIn 0.3s ease-in-out;
  overflow: auto;
}

.apply-popup h3 {
  margin-bottom: 20px;
  font-size: 1.5rem;
  color: #333;
}

.apply-popup span {
  display: block;
  margin-bottom: 6px;
  font-weight: bold;
  color: #333;
}

.apply-popup input[type="file"] {
  width: 100%;
  padding: 8px;
  margin-bottom: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.apply-popup button {
  padding: 10px 20px;
  border: none;
  margin-right: 2vh;
  border-radius: 8px;
  cursor: pointer;
  background-color: #045d56;
  color: #fff;
  font-weight: bold;
  transition: background-color 0.2s ease;
}

.apply-popup button:hover {
  background-color: #f1f1f1;
  color: #045d56;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: bold;
  background: none;
  padding: 0;
}

.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.file-input {
  width: 100%;
  padding: 10px;
  border: 1px dashed #ddd;
  border-radius: 8px;
  margin-top: 5px;
}
.file-note {
  display: block;
  color: #f50b0b;
  font-size: 12px;
  margin-top: 4px;
  font-style: italic;
}
.popup-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.next-btn,
.submit-btn {
  background-color: #045d56;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.back-btn,
.cancel-btn {
  background-color: #666;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.next-btn:hover,
.submit-btn:hover {
  background-color: #033f3a;
}

.back-btn:hover,
.cancel-btn:hover {
  background-color: #555;
}
.date-group {
  margin-bottom: 20px;
}

.date-inputs {
  display: flex;
  gap: 20px;
}

.date-field {
  flex: 1;
}

.date-field span {
  display: block;
  margin-bottom: 5px;
  color: #666;
  font-size: 0.9em;
}

.description-input {
  resize: vertical;
  min-height: 100px;
  resize: none;
}

.work-experience-section {
  animation: slideIn 0.3s ease-out;
}

.step-indicator {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  position: relative;
  padding: 0 20px;
}

.step-indicator::before {
  content: "";
  position: absolute;
  top: 20px;
  left: 50px;
  right: 50px;
  height: 2px;
  background: #ddd;
  z-index: 1;
}

.step {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #999;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.step.active .step-number {
  background: #045d56;
  border-color: #045d56;
  color: white;
}

.step.completed .step-number {
  background: #045d56;
  border-color: #045d56;
  color: white;
}

.step.completed .step-number::after {
  content: "✓";
}

.step-text {
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.step.active .step-text {
  color: #045d56;
  font-weight: bold;
}

.step.completed .step-text {
  color: #045d56;
}
.content {
  margin-top: 10px;
  padding: 20px;
  display: flex;
  gap: 20px;
  overflow-y: auto;
}

.left-content {
  flex: 3;
}

.left-content h3 {
  margin-bottom: 2vh;
}

.cards {
  margin-bottom: 20px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}
.card {
  background: white;
  padding: 15px;
  border-radius: 3vh;
  text-align: center;
  font-size: 15px;
  flex: 1;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease-in-out;
  cursor: pointer;
  margin-bottom: 1vh;
  border-bottom: #045d56 solid 4px;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.company-name {
  font-size: 20px;
  margin-top: 2vh;
  font-weight: bold;
}

.apply-btn {
  background-color: #045d56;
  color: #fff;
  border: none;
  margin-left: 0;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  transform: scale(1);
}

.apply-btn:hover {
  background-color: #f1f1f1;
  color: #045d56;
  transform: scale(1.08);
}

.message-btn {
  background-color: #045d56;
  color: #fff;
  width: auto;
  margin-left: 0;
  margin-right: 10px;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  transform: scale(1);
}

.message-btn:hover {
  background-color: #f1f1f1;
  color: #045d56;
  transform: scale(1.08);
}
.no-jobs-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  background: #f8f9fa;
  border-radius: 12px;
  margin: 20px;
  border-left: 4px solid #045d56;
}

.no-jobs-message img {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.no-jobs-message p {
  color: #666;
  font-size: 18px;
  margin: 0;
}
.job-content {
  flex: 3;
  background: white;
  border-radius: 10px;
  border-bottom: #045d56 4px solid;
  padding: 15px;
  overflow: auto;
}
.job-box {
  border: 1px solid #edf2f7;
  padding: 25px;
  max-width: 95%;
  margin: 0 auto 25px auto;
  border-radius: 16px;
  white-space: pre-line;
  background-color: #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.job-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(4, 93, 86, 0.1);
  border-color: #045d56;
}
.job-box::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background: #045d56;
}
.job-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 15px;
  border-bottom: 1px solid #edf2f7;
  margin-bottom: 20px;
}

.job-title-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.job-title-section h3 {
  font-size: 1.5rem;
  color: #2d3748;
  margin: 0;
}
.job-description {
  font-size: 15px;
  margin-top: 3vh;
  margin-bottom: 3vh;
  margin-left: 10vh;
  margin-right: 10vh;
  line-height: 1.1;
  font-size: 18px;
  text-align: justify;
  text-indent: 2em;
}

.job-media {
  max-width: 100%;
  max-height: 60vh;
  margin-left: 25vh;
  margin-bottom: 10px;
}

.job-type,
.salary {
  font-weight: 500;
}
.job-info {
  display: flex;
  margin-top: 10px;
}

.job-detail {
  display: flex;
  margin-right: 5vh;
  align-items: center;
  gap: 5px;
}

label {
  background-color: #045d56;
  color: #fff;
  padding: 8px 10px;
  margin-top: 10px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  margin-right: 70%;
  transition: color 0.5s ease-in-out;
}

.right-content {
  flex: 1;
  border-radius: 10px;
  padding: 20px;
  height: fit-content;
  margin-top: -2vh;
}
.upd-content {
  flex: 1;
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  height: fit-content;
}
.hired-status-box {
  background-color: white;
  border-bottom: 4px solid #2e7d32;
  border-radius: 1vh;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.hired-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.download-btn {
  background-color: #045d56;
  color: white;
  border: none;
  padding: 8px 16px;
  margin-top: 3vh;
  margin-left: 7vh;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.download-btn:hover {
  background-color: #f1f1f1;
  color: #045d56;
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
  text-transform: capitalize;
}

.update-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
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

.chart-container {
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin-top: 20px;
  height: 35vh;
  border-bottom: 4px solid #045d56;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
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
  .content {
    flex-direction: column;
    gap: 0;
    padding: 10px;
  }
  .left-content,
  .right-content {
    width: 100%;
    max-width: 100%;
    margin: 0;
    padding: 0 0 20px 0;
  }
  .job-content {
    padding: 10px;
  }
  .cards {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}

@media (max-width: 768px) {
  .hamburger {
    display: flex;
    z-index: 1001;
  }

  .popup {
    width: 60%;
    max-width: 60%;
    padding: 20px;
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
  .topbar input[type="text"] {
    width: 25vh;
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
  .job-content {
    width: 100%;
    margin-top: 10px;
    border-radius: 10px;
    border-bottom: #045d56 4px solid;
    overflow: auto;
  }
  .job-box {
    width: 100%;
    padding: 15px;
    margin: 0 auto 15px auto;
    border-radius: 16px;
  }
  .job-description {
    font-size: 14px;
    margin-left: 5vh;
    margin-right: 5vh;
    line-height: 1.2;
    text-align: justify;
    text-indent: 2em;
  }
  .message-btn,
  .apply-btn {
    font-size: 10px;
  }
  .sign-out {
    width: 60px;
    height: 40px;
    margin-left: 7.5vh;
  }
}

@media (max-width: 380px) {
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
    height: 6vh;
    width: 10vh;
    margin-left: 3vh;
    margin-bottom: 5vh;
  }
  .ikon {
    height: 15px;
    width: 15px;
  }
  .topbar input[type="text"] {
    width: 20vh;
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
  .job-content {
    width: 100%;
    margin-top: 10px;
    border-radius: 10px;
    border-bottom: #045d56 4px solid;
    margin-left: -1vh;
  }
  .job-box {
    width: 100%;
    padding: 15px;
    margin: 0 auto 15px auto;
    border-radius: 16px;
  }
  .job-description {
    font-size: 14px;
    margin-left: 5vh;
    margin-right: 5vh;
    line-height: 1.2;
    text-align: justify;
    text-indent: 2em;
  }
  .message-btn,
  .apply-btn {
    font-size: 10px;
  }
  .right-content {
    flex: 1;
    margin-left: 3vh;
    padding-top: 3vh;
    height: auto;
  }
  .sign-out {
    width: 60px;
    height: 40px;
    margin-left: 7.5vh;
  }
}
@media (max-width: 320px) {
  .topbar input[type="text"] {
    width: 15vh;
  }
}
</style>
