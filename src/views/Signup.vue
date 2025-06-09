<template>
  <div class="container">
    <div class="main-wrapper">
      <div class="photo-panel">
        <img src="/public/gcch logos.png" alt="Login Illustration" />
      </div>

      <div class="content-box">
        <div v-if="currentStep === 'select'">
          <h2 class="title">SELECT YOUR ROLE</h2>

          <select v-model="selectedRole" class="dropdown">
            <option value="" disabled selected>Select a role</option>
            <option value="applicant">APPLICANT</option>
            <option value="company">COMPANY</option>
          </select>

          <div v-if="selectedRole" class="selection-text">
            You selected: <strong>{{ selectedRole }}</strong>
            <button
              class="continue-btn"
              :disabled="!selectedRole"
              @click="continueAction"
            >
              CONTINUE
            </button>
          </div>
        </div>

        <!-- APPLICANT FORM  -->
        <div v-else-if="currentStep === 'applicant'" class="form-view">
          <h2 class="title">Applicant Information</h2>
          <form @submit.prevent="submitApplicantForm">
            <input placeholder="First Name" v-model="form.firstName" required />
            <input
              placeholder="Middle Name (optional)"
              v-model="form.middleName"
            />
            <input placeholder="Last Name" v-model="form.lastName" required />

            <select v-model="form.sex" required>
              <option value="" disabled selected>Select Sex</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="prefer_to_not_say">Prefer Not to Say</option>
            </select>

            <span class="bday">BIRTHDAY</span>
            <input type="date" v-model="form.birthday" @blur="validateAge" />

            <input
              placeholder="Phone Number"
              v-model="form.phone"
              inputmode="numeric"
              pattern="[0-9]*"
              maxlength="11"
              @input="form.phone = form.phone.replace(/\D/g, '')"
            />
            <select v-model="form.course" required>
              <option value="" disabled selected>Select Program</option>
              <option value="BSIT">Bachelor of Science in Information Technology</option>
              <option value="BSCS">Bachelor of Science in Computer Science</option>
              <option value="BSEMC">Bachelor of Science in Entertainment and Multimedia Computing</option>
              <option value="BSN">Bachelor of Science in Nursing</option>
              <option value="BSM">Bachelor of Science in Midwifery</option>
              <option value="BSA">Bachelor of Science in Accountancy</option>
              <option value="BSBA-FM">Bachelor of Science in Business Administration major in Financial Management</option>
              <option value="BSBA-HRM">Bachelor of Science in Business Administration major in Human Resource Management</option>
              <option value="BSBA-MM">Bachelor of Science in Business Administration major in Marketing Management</option>
              <option value="BSCA">Bachelor of Science in Customs Administration</option>
              <option value="BSHM">Bachelor of Science in Hospitality Management</option>
              <option value="BSTM">Bachelor of Science in Tourism Management</option>
              <option value="BAComm">Bachelor of Arts in Communication</option>
              <option value="BECEd">Bachelor of Early Childhood Education</option>
              <option value="BCAEd">Bachelor of Culture and Arts Education</option>
              <option value="BPEd">Bachelor of Physical Education</option>
              <option value="BEED">Bachelor of Elementary Education</option>
              <option value="BSEd-Eng">Bachelor of Secondary Education major in English</option>
              <option value="BSEd-Math">Bachelor of Secondary Education major in Mathematics</option>
              <option value="BSEd-Fil">Bachelor of Secondary Education major in Filipino</option>
              <option value="BSEd-SS">Bachelor of Secondary Education major in Social Studies</option>
              <option value="BSEd-Sci">Bachelor of Secondary Education major in Science</option>
              <option value="Other">Other</option>
            </select>

            <select
              v-model="form.expertise"
              required
              :class="{ placeholder: !form.expertise }"
            >
              <option value="" disabled>Select Expertise</option>
              <option
                v-for="field in filteredExpertise"
                :key="field"
                :value="field"
              >
                {{ field }}
              </option>
            </select>

            <div class="button-group">
              <button type="button" class="back-btn" @click="goBack">
                Back
              </button>
              <button type="next" class="kontinue-btn">Next</button>
            </div>
          </form>
        </div>

        <div v-else-if="currentStep === 'photo'" class="form-view">
          <h2 class="title">Upload Profile Photo</h2>
          <form @submit.prevent="submitPhotoForm">
            <div class="photo-upload-section">
              <input
                placeholder="Street Address"
                v-model="form.address"
                required
              />
              <input placeholder="City" v-model="form.city" required />
              <input placeholder="Province" v-model="form.province" required />
              <input placeholder="Country" v-model="form.country" required />
              <input
                type="file"
                id="photo-upload"
                @change="handlePhotoUpload"
                accept="image/*"
                required
              />
              <small class="file-note">Note: Photo size limit is 2MB</small>
              <div v-if="previewUrl" class="photo-preview">
                <button
                  type="button"
                  class="delete-photo-btn"
                  @click="removePhoto"
                >
                  ×
                </button>
                <img :src="previewUrl" alt="Preview" />
              </div>
            </div>

            <div class="button-group">
              <button type="button" class="back-btn" @click="goToApplicantForm">
                Back
              </button>
              <button type="submit" class="kontinue-btn">Submit</button>
            </div>
          </form>
        </div>

        <!-- COMPANY FORM  -->
        <div v-else-if="currentStep === 'company'" class="form-view">
          <h2 class="title">Company Information</h2>
          <form @submit.prevent="submitCompanyForm">
            <input
              placeholder="Company Name"
              v-model="form.companyName"
              required
            />
            <input
              placeholder="Company Phone"
              v-model="form.telephone"
              inputmode="tel"
              maxlength="11"
              @input="
                form.telephone = form.telephone
                  .replace(/[^0-9()\-]/g, '')
                  .slice(0, 11)
              "
              required
            />
            <input
              placeholder="Street Address"
              v-model="form.address"
              required
            />
            <input placeholder="City" v-model="form.city" required />
            <input placeholder="Province" v-model="form.province" required />
            <input placeholder="Country" v-model="form.country" required />
            <input
              placeholder="Industry Type"
              v-model="form.industry_type"
              required
            />

            <div class="button-group">
              <button type="button" class="back-btn" @click="goBackcompany">
                Back
              </button>
              <button @click="currentStep = 'photos'" class="kontinue-btn">
                Continue
              </button>
            </div>
          </form>
        </div>

        <div v-else-if="currentStep === 'photos'" class="form-view">
          <h2 class="title">Upload Profile Photo</h2>
          <form @submit.prevent="submitPhotoForm">
            <div class="photo-upload-section">
              <input
                type="file"
                id="photo-upload"
                @change="handlePhotoUpload"
                accept="image/*"
                required
              />
              <small class="file-note">Note: Photo size limit is 2MB</small>
              <div v-if="previewUrl" class="photo-preview">
                <button
                  type="button"
                  class="delete-photo-btn"
                  @click="removePhoto"
                >
                  ×
                </button>
                <img :src="previewUrl" alt="Preview" />
              </div>
            </div>

            <div class="button-group">
              <button
                type="button"
                class="back-btn"
                @click="currentStep = 'company'"
              >
                Back
              </button>
              <button type="submit" class="kontinue-btn">Submit</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import axiosInstance from '../plugins/axios'; 
import { createToast } from "mosha-vue-toastify";
import "mosha-vue-toastify/dist/style.css";
import { computed } from "vue";

const route = useRoute();
const router = useRouter();
const userId = route.params.userId;
const currentStep = ref("select");
const selectedRole = ref("");
const form = ref({
  firstName: "",
  middleName: "",
  lastName: "",
  birthday: "",
  sex: "",
  phone: "",
  course: "",
  companyName: "",
  telephone: "",
  address: "",
  city: "",
  province: "",
  country: "",
  industry_type: "",
  expertise: "",
  photo: null,
});
const previewUrl = ref(null);

// FIXED: Correct min/max date calculations
const minDate = computed(() => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 60); // 60 years ago
  return date.toISOString().split("T")[0];
});

const maxDate = computed(() => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 18); // 18 years ago
  return date.toISOString().split("T")[0];
});

const validateAge = () => {
  if (!form.value.birthday) return;

  const birthDate = new Date(form.value.birthday);

  // Skip if invalid date (e.g., partially typed)
  if (isNaN(birthDate.getTime())) return;

  const minDateObj = new Date(minDate.value); // 60 years ago
  const maxDateObj = new Date(maxDate.value); // 18 years ago

  if (birthDate > maxDateObj) {
    createToast("You must be at least 18 years old to register", {
      type: "error",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
      toastBackgroundColor: "#FF0000",
    });
    form.value.birthday = "";
  } else if (birthDate < minDateObj) {
    createToast("You must be 60 years old or younger to register", {
      type: "error",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
      toastBackgroundColor: "#FF0000",
    });
    form.value.birthday = "";
  }
};

const filteredExpertise = computed(() => {
  return expertiseMap[form.value.course] || [];
});

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

const removePhoto = () => {
  form.value.photo = null;
  previewUrl.value = null;
  // Reset the file input
  const fileInput = document.getElementById("photo-upload");
  if (fileInput) fileInput.value = "";
};

if (!userId) {
  createToast("User ID not found. Please log in again.", {
    type: "warning",
    position: "top-right",
    timeout: 3000,
    showIcon: true,
    toastBackgroundColor: "#045d56",
  });
  router.push("/login");
}

async function continueAction() {
  try {
    await axiosInstance.post(
      `user/set-role/${userId}`,
      {
        role: selectedRole.value,
      },
      { withCredentials: true }
    );

    localStorage.setItem("onboarding_in_progress", "true");

    currentStep.value = selectedRole.value;
    createToast(`Role set to ${selectedRole.value}`, {
      type: "success",
      position: "top-right",
      timeout: 2000,
      showIcon: true,
      toastBackgroundColor: "#045d56",
    });
  } catch (error) {
    console.error("Error setting role:", error);
    createToast(error.response?.data?.message || "Failed to set role", {
      type: "danger",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
    });
  }
}
const goBack = () => {
  currentStep.value = "select";
};

const goBackcompany = () => {
  currentStep.value = "select";
};
const submitApplicantForm = async () => {
  currentStep.value = "photo";
};

const submitCompanyForm = async () => {
  currentStep.value = "photo";
};

const handlePhotoUpload = (event) => {
  const file = event.target.files[0];
  const maxSize = 2 * 1024 * 1024; // 2MB in bytes

  if (file) {
    if (file.size > maxSize) {
      createToast("Photo size must be less than 2MB", {
        type: "error",
        position: "top-right",
        timeout: 3000,
        showIcon: true,
        toastBackgroundColor: "#FF0000"
      });
      event.target.value = ''; 
      return;
    }
    form.value.photo = file;
    previewUrl.value = URL.createObjectURL(file);
  }
};

const goToApplicantForm = () => {
  currentStep.value = "applicant";
};
const goToCompanyForm = () => {
  currentStep.value = "company";
};
const submitPhotoForm = async () => {
  try {
    const formData = new FormData();

    if (selectedRole.value === "applicant") {
      formData.append("first_name", form.value.firstName);
      formData.append("middle_name", form.value.middleName);
      formData.append("last_name", form.value.lastName);
      formData.append("date_of_birth", form.value.birthday);
      formData.append("sex", form.value.sex);
      formData.append("phone_number", form.value.phone);
      formData.append("course", form.value.course);
      formData.append("expertise", form.value.expertise);
      formData.append("street_address", form.value.address);
      formData.append("city", form.value.city);
      formData.append("province", form.value.province);
      formData.append("country", form.value.country);
    } else if (selectedRole.value === "company") {
      formData.append("company_name", form.value.companyName);
      formData.append("company_telephone", form.value.telephone);
      formData.append("street_address", form.value.address);
      formData.append("city", form.value.city);
      formData.append("province", form.value.province);
      formData.append("country", form.value.country);
      formData.append("industry_type", form.value.industry_type);
    }

    if (form.value.photo) {
      formData.append("profile_picture", form.value.photo);
    }

    // POST to a single unified endpoint (you may want to create this backend route)
    const endpoint = `user/${selectedRole.value}/profile/${userId}`;

    await axiosInstance.post(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });

    createToast("Profile completed successfully!", {
      type: "success",
      position: "top-right",
      timeout: 2000,
      showIcon: true,
      toastBackgroundColor: "#045d56",
    });

    localStorage.setItem("user_role", selectedRole.value);
    localStorage.removeItem("onboarding_in_progress");
    router.push(
      selectedRole.value === "company" ? "/companydash" : "/applicantdash"
    );
  } catch (error) {
    console.error("Error submitting profile:", error);
    createToast(error.response?.data?.message || "Failed to submit profile", {
      type: "danger",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
    });
  }
};
</script>

<style scoped>
.container {
  height: 100vh;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url("/public/bgtest.jpg") no-repeat center center fixed;
  background-size: cover;
  overflow: hidden;
}

.main-wrapper {
  display: flex;
  width: 60%;
  max-width: 60%;
  background-color: #ffffff;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.photo-panel {
  flex: 1;
  background-color: #e0e7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.photo-panel img {
  max-width: 100%;
  height: auto;
  object-fit: contain;
}

.content-box {
  background-color: #ffffff;
  color: #111827;
  padding: 2.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  margin-top: 5vh;
  max-width: 500px;
  text-align: center;
}

.title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.file-note {
  display: block;
  color: #f50b0b;
  font-size: 12px;
  margin-top: 4px;
  font-style: italic;
}

.bday {
  display: block;
  text-align: left;
  padding-left: 0.5rem;
  margin-top: 0.5rem;
  color: #374151;
  font-size: 0.9rem;
  font-weight: 500;
}

.dropdown,
input,
select {
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  outline: none;
  transition: box-shadow 0.2s;
}

.dropdown:focus,
input:focus,
select:focus {
  box-shadow: 0 0 0 2px #60a5fa;
}

.selection-text {
  margin-top: 1rem;
  color: #4b5563;
}

.continue-btn {
  margin-top: 1.5rem;
  background-color: #045d56;
  color: white;
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 70%;
  font-size: 1rem;
}

.continue-btn:hover:enabled {
  background-color: #f3f4f6;
  color: #045d56;
}

.continue-btn:disabled {
  background-color: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

.kontinue-btn {
  margin-top: 1.5rem;
  background-color: #045d56;
  color: white;
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 20%;
  font-size: 1rem;
}

.kontinue-btn:hover:enabled {
  background-color: #f3f4f6;
  color: #045d56;
}

.kontinue-btn:disabled {
  background-color: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

.back-btn {
  background-color: #e5e7eb;
  color: #111827;
  margin-bottom: 0.5rem;
  padding: 0.5rem 1.25rem;
  border: none;
  margin-right: 10vh;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease,
    box-shadow 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.back-btn:hover {
  background-color: #d1d5db;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-view {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label[for="birthday"] {
  color: #045d56;
  font-size: 0.8rem;
  text-align: left;
  display: block;
  margin-top: 0.5rem;
  margin-bottom: 0.25rem;
  padding-left: 0.25rem;
}

/* .form-view label{
  font-size: 1rem;
text-align: left;
margin-right: 100vh;
margin-top: 0.5rem;

} */

/* label[for="birthday"] {
  color: #6B7280;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  text-align: left;
  font-weight: 500;
} */

.photo-panel {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: #f9fafb;
  border-radius: 1rem;
}

.photo-panel img {
  max-width: 100%;
  height: 100%;
  border-radius: 1rem;
  object-fit: contain;
}

.photo-preview {
  position: relative;
  margin-top: 1rem;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 2px solid #045d56;
  background-color: #f3f4f6;
  width: 40%;
  margin-left: 20vh;
}

.photo-preview img {
  width: 100%;
  display: block;
}

.delete-photo-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid #045d56;
  color: #045d56;
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s ease;
}

.delete-photo-btn:hover {
  background-color: #045d56;
  color: white;
}

input[type="file"] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background-color: white;
}

@media (max-width: 1024px) {
  .main-wrapper {
    display: flex;
    width: 90%;
    max-width: 90%;
    min-height: 70vh;
    overflow: hidden;
    margin: 2rem auto;
  }

  .photo-panel {
    width: 45%;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .photo-panel img {
    max-width: 80%;
    height: auto;
    object-fit: contain;
  }

  .kontinue-btn {
    width: 30%;
    margin-top: 1rem;
  }

  .content-box {
    max-width: 450px;
    margin-top: 2vh;
    padding: 2rem;
  }
}

@media (max-width: 768px) {
  .main-wrapper {
    flex-direction: column;
    padding: 1.5rem;
    width: 95%;
    height: 90vh;
    max-width: 50%;
    background-color: #ffffff;
    overflow: auto;
  }

  .photo-panel {
    width: 90%;
    max-height: 25vh;
    padding: 0.5rem;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f9fafb;
  }

  .photo-panel img {
    max-width: 45%;
    height: auto;
    object-fit: contain;
  }

  .content-box {
    width: 90%;
    max-width: 90%;
    padding: 1rem;
    margin: 1vh auto 0;
    box-shadow: none;
  }

  .title {
    font-size: 1.3rem;
    margin-bottom: 0.5rem;
  }

  .button-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    padding: 0 1rem;
  }

  .kontinue-btn,
  .back-btn {
    width: 45%;
    margin: 0;
  }
}

@media (max-width: 480px) {
  .main-wrapper {
    width: 90%;
    max-width: 90%;
    padding: 1rem;
    height: 85vh;
    margin: 2rem auto;
  }

  .photo-panel {
    width: 90%;
    max-height: 15vh;
    padding: 0.5rem;
  }

  .photo-panel img {
    max-width: 35%;
    height: auto;
  }

  .content-box {
    width: 90%;
    padding: 0.75rem;
    margin: 0.5rem auto;
    box-shadow: none;
  }

  .title {
    font-size: 1.2rem;
    margin-bottom: 0.75rem;
  }

  .dropdown,
  input,
  select {
    font-size: 0.9rem;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .button-group {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0;
    margin-top: 0.75rem;
  }

  .kontinue-btn,
  .back-btn {
    width: 100%;
    margin: 0;
    padding: 0.6rem;
  }
}

@media (max-width: 380px) {
  .main-wrapper {
    width: 85%;
    height: 80vh;
    padding: 0.5rem;
    margin: 1rem auto;
  }

  .photo-panel {
    max-height: 12vh;
  }

  .photo-panel img {
    max-width: 30%;
  }

  .content-box {
    width: 95%;
    padding: 0.5rem;
  }

  .title {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }

  .dropdown,
  input,
  select {
    font-size: 0.85rem;
    padding: 0.4rem;
  }

  .kontinue-btn,
  .back-btn {
    font-size: 0.85rem;
    padding: 0.5rem;
  }

  .button-group {
    gap: 0.3rem;
  }
}
</style>
