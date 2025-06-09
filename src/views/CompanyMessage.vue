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
        <li>
          <router-link to="/companyaccepted" class="sidenav-text">
            <img src="/public/agreement.png" class="ikon" /> ACCEPTED
          </router-link>
        </li>
        <li style="font-weight: bold">
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

      <!-- CHATS -->
      <div class="content">
                <!-- Notifications -->
        <div class="right-content">
          <h3>CONTACTS</h3>
          <div class="updates-list">
            <div
              v-for="(notif, index) in filteredNotifications"
              :key="index"
              @click="openChat(notif)"
              style="cursor: pointer"
              class="update-box"
            >
              <h2>{{ extractSenderName(notif.latestContent) }}</h2>
              <p>
                <span v-if="notif.count > 1">
                  ({{ notif.count }} new messages)
                </span>
              </p>
            </div>
          </div>
        </div>
        
        <div class="left-content">
          <div class="message-box">
            <h3 style="text-align: left; font-size: 30px">Messages</h3>
            <div class="form-row">
              <div class="messages-list">
                <div
                  v-for="(msg, index) in uniqueConversations"
                  :key="index"
                  class="message-item received"
                  @click="openChat({ sender_id: msg.sender_id })"
                  style="cursor: pointer"
                >
                  <p>
                    <strong>{{ msg.from }}:</strong>
                    {{ msg.content }}
                  </p>
                  <span class="timestamp">{{
                    new Date(msg.created_at).toLocaleString()
                  }}</span>
                </div>
              </div>
            </div>

            <!-- Current Chat -->
            <div v-if="conversation.length" class="chat-box">
              <h3>Conversation</h3>
              <div
                ref="chatContainer"
                class="chat-messages"
                style="height: 400px; overflow-y: auto; margin-bottom: 1rem"
              >
                <div
                  v-for="(msg, index) in conversation"
                  :key="index"
                  :class="[
                    'message-item',
                    msg.from === 'You' ? 'sent' : 'received',
                  ]"
                >
                  <p>
                    <strong>{{ msg.from }}:</strong> {{ msg.content }}
                  </p>
                  <span class="timestamp">{{
                    new Date(msg.created_at).toLocaleString()
                  }}</span>
                </div>
              </div>

              <div class="reply-box">
                <textarea
                  v-model="newReply"
                  placeholder="Type your message..."
                  @keyup="handleKeyUp"
                  @keydown.enter.prevent="sendReply"
                  class="expanding-textarea"
                ></textarea>
                <button @click="sendReply">Send</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from "vue";
import axiosInstance from '../plugins/axios'; 
import { useRouter } from "vue-router";
import { createToast } from "mosha-vue-toastify";
import "mosha-vue-toastify/dist/style.css";

const router = useRouter();

const unreadMessages = ref(0);
const newNotifications = ref(0);
const isSidenavOpen = ref(true);

const showMail = ref(false);
const showNotif = ref(false);
const showSignOut = ref(false);

const selectedUserId = ref(null);
const newReply = ref("");

const currentUserId = ref(localStorage.getItem("user_id"));
const allMessages = ref([]);
const conversation = ref([]);
const uniqueConversations = computed(() => {
  const map = new Map();
  for (const msg of allMessages.value) {
    if (!map.has(msg.sender_id)) {
      map.set(msg.sender_id, msg);
    }
  }
  return Array.from(map.values());
});

const notifications = ref([]);
const chatContainer = ref(null);

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

async function openChat(obj) {
  const senderId = obj.sender_id;

  if (!senderId) {
    console.warn("No sender ID found in notification:", obj);
    createToast("Invalid conversation selected", {
      type: "warning",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
    });
    return;
  }

  selectedUserId.value = senderId;
  try {
    await fetchConversation(senderId);
  } catch (error) {
    createToast("Failed to load conversation", {
      type: "danger",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
    });
  }
}

async function markMessageAsRead(messageId) {
  try {
    await axiosInstance.post(`/message/mark-as-read/${messageId}`);
    console.log(`Message ${messageId} marked as read`);
  } catch (error) {
    console.error("Error marking message as read:", error);
  }
}

async function fetchConversation(senderId) {
  try {
    const response = await axiosInstance.get(`/message/conversation/${senderId}`);
    const data = Array.isArray(response.data) ? response.data : [];

    // Format the conversation with "You" or "Them"
    conversation.value = data.map((msg) => ({
      ...msg,
      from: msg.sender_id == currentUserId.value ? "You" : "Them",
      content: msg.message, // alias 'message' as 'content' for display if needed
    }));

    for (const msg of data) {
      if (msg.receiver_id == currentUserId.value && !msg.read_at) {
        await markMessageAsRead(msg.id);
      }
    }

    scrollToBottom();
  } catch (error) {
    console.error("Error fetching conversation:", error);
    conversation.value = [];
  }
}

const scrollToBottom = () => {
  if (chatContainer.value) {
    nextTick(() => {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    });
  }
};

async function sendReply() {
  if (!newReply.value.trim()) {
    createToast("Please enter a message", {
      type: "warning",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
      toastBackgroundColor: "#045d56",
    });
    return;
  }

  try {
    await axiosInstance.post("/message/send", {
      receiver_id: selectedUserId.value,
      message: newReply.value.trim(),
    });

    conversation.value.push({
      sender_id: currentUserId.value,
      receiver_id: selectedUserId.value,
      message: newReply.value.trim(),
      from: "You",
      content: newReply.value.trim(),
      created_at: new Date().toISOString(),
    });

    newReply.value = "";
    scrollToBottom();
    createToast("Message sent successfully", {
      type: "success",
      position: "top-right",
      timeout: 2000,
      showIcon: true,
      toastBackgroundColor: "#045d56",
    });
  } catch (error) {
    console.error("Error sending message:", error);
    createToast("Failed to send message", {
      type: "danger",
      position: "top-right",
      timeout: 3000,
      showIcon: true,
    });
  }
}

// function closeChat() {
//   showMessagePopup.value = false;
//   selectedUserId.value = null;
//   messages.value = [];
// }

// function handleKeyUp(event) {
//   const textarea = event.target;
//   textarea.style.height = "auto";
//   textarea.style.height = `${textarea.scrollHeight}px`;
//   if (event.key === "Enter" && !event.shiftKey) {
//     event.preventDefault();
//     sendReply();
//   }
// }

//Notification Logic
const filteredNotifications = computed(() =>
  notifications.value.filter(
    (notif) => notif && ["message", "inquiry"].includes(notif.type)
  )
);

function extractSenderName(content) {
  const match = content.match(/from (.+)$/);
  return match ? match[1] : "Unknown Sender";
}

async function fetchMessageNotifications() {
  try {
    const response = await axiosInstance.get("/notifications");
    const rawNotifications = response.data.notifications || [];

    const grouped = new Map();

    rawNotifications.forEach((notif) => {
      if (!notif || !notif.sender_id || !notif.type) return;

      const key = `${notif.sender_id}_${notif.type}`;
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
      return "Inquiry";
    case "other":
      return "Other";
    default:
      return type;
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
  fetchMessageNotifications();
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
.message-box {
  background: white;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  border-radius: 3vh;
  border-left: #045d56 4px solid;
  width: 95%;
  height: 83vh;
  margin-left: 3vh;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.messages-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin-top: 20px;
  margin-left: 20vh;
  max-height: 100%;
  max-width: 100%;
  overflow-y: auto;
}

.message-item {
  padding: 12px 20px;
  border-radius: 10px;
  max-width: 75%;
  position: relative;
}

.message-item.received {
  background-color: #f1f1f1;
  align-self: flex-start;
  border-left: 4px solid #045d56;
  max-width: 50%;
  margin-top: 3vh;
  margin-bottom: 3vh;
  max-height: fit-content;
}

.message-item.sent {
  background-color: #d1f4ec;
  align-self: flex-end;
  border-right: 4px solid #045d56;
  text-align: right;
  margin-left: 58vh;
  margin-top: 3vh;
  margin-bottom: 3vh;
  max-width: 50%;
}

.timestamp {
  font-size: 11px;
  color: #666;
  margin-top: 5px;
  display: block;
  text-align: right;
}

.right-content {
  flex: 1;
  background: white;
  border-radius: 10px;
  padding: 20px;
  height: fit-content;
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
  text-transform: uppercase;

  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.update-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
}

.popup.chat-popup {
  display: flex;
  flex-direction: column;
  height: auto;
  width: 90vh;
  padding: 20px;
  border-radius: 16px;
  background: white;
  overflow: hidden;
}

.popup.chat-popup h3 {
  margin-bottom: 15px;
  font-size: 22px;
  color: #045d56;
}

.popup.chat-popup .message-item {
  padding: 12px 15px;
  border-radius: 10px;
  max-width: 75%;
  position: relative;
  margin-bottom: 10px;
  font-size: 14px;
  word-wrap: break-word;
}

.popup.chat-popup .sent {
  background-color: #d1f4ec;
  align-self: flex-end;
  border-right: 4px solid #045d56;
  margin-left: 18vh;
}

.popup.chat-popup .received {
  background-color: #f1f1f1;
  align-self: flex-start;
  border-left: 4px solid #045d56;
}

.popup.chat-popup .timestamp {
  font-size: 11px;
  color: #666;
  margin-top: 5px;
  text-align: right;
  display: block;
}

.popup.chat-popup button {
  background-color: #045d56;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 10px;
}

.popup.chat-popup button:hover {
  background-color: #033f3a;
}

.reply-box {
  display: flex;
  gap: 10px;
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  border-top: 1px solid #ccc;
}

.reply-box input {
  flex: 1;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  margin-top: 1vh;
}

.reply-box button {
  background-color: #045d56;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1vh;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.reply-box button:hover {
  background-color: #e0f2f1;
  color: #045d56;
}

.expanding-textarea {
  flex: 1;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  resize: none;
  overflow: hidden;
  line-height: 1.4;
  font-family: inherit;
  font-size: 1rem;
  max-height: 150px;
  transition: height 0.2s ease;
  margin-top: 1vh;
  overflow-y: auto;
}

.chat-messages {
  scroll-behavior: smooth;
  padding-right: 10px;
}

.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #045d56;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #033f3a;
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
  .right-content {
    padding-top: 3vh;
    margin-right: 1vh;
    max-height: 85vh;
    width: 50vh;
    overflow: auto;
  }
  .message-box {
    height: 78vh;
    overflow-y: hidden;
  }
  .chat-box {
    width: 100%;
    height: 63vh;
    overflow-y: auto;
    margin-top: 2vh;
  }
  .update-box {
    width: 35vh;
    height: auto;
    margin: 10px;
    font-size: 14px;
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

  .avatar {
    width: 30px;
    height: 30px;
  }

  .message-box {
    width: 93%;
  }
  .message-item {
    padding: 10px 5px;
    font-size: 12px;
  }
  .message-item.received {
    max-width: 90%;
  }
  .form-row {
    margin-left: -10vh;
  }

  .right-content {
    padding: 15px;
    height: auto;
    min-height: 300px;
    width: 90%;
    margin-left: 5vh;
    overflow: auto;
  }
  .update-box {
    width: 100%;
    margin: 10px 0;
    padding: 8px;
    font-size: 12px;
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

  .message-box {
    width: 95%;
    margin: 10px auto;
    padding: 15px;
    height: auto;
    min-height: 70vh;
  }

  .messages-list {
    margin-left: 0;
    width: 100%;
    padding: 10px;
  }

  .message-item {
    padding: 10px 15px;
    font-size: 12px;
    width: 100%;
    margin: 5px 0;
  }

  .message-item.received {
    max-width: 80%;
    margin-right: auto;
    margin-left: 0;
  }

  .message-item.sent {
    max-width: 80%;
    margin-left: auto;
    margin-right: 0;
    text-align: right;
  }

  .chat-box {
    height: 60vh;
    margin-top: 15px;
  }

  .reply-box {
    padding: 10px;
  }

  .reply-box textarea {
    font-size: 12px;
    padding: 8px;
  }

  .reply-box button {
    padding: 8px 12px;
    font-size: 12px;
  }

  .right-content {
    width: 90%;
    margin-left: 3vh;
    overflow: auto;
  }

  .update-box {
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
