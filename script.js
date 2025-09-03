// Firebase configuration and imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { 
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxQ8R_NkXimalEX65g_OUy_RbNdQPQR3E",
  authDomain: "a3lam-al3rous.firebaseapp.com",
  projectId: "a3lam-al3rous",
  storageBucket: "a3lam-al3rous.firebasestorage.app",
  messagingSenderId: "748824722847",
  appId: "1:748824722847:web:71b801e8622fddfe6151aa"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Enhanced Data Manager with Firebase
class FirebaseDataManager {
  constructor() {
    this.collections = {
      employees: 'employees',
      attendance: 'attendance',
      activities: 'activities',
      settings: 'settings'
    };
    this.listeners = new Map();
  }

  // Employee Management
  async addEmployee(employeeData) {
    try {
      const docRef = await addDoc(collection(db, this.collections.employees), {
        ...employeeData,
        createdAt: new Date(),
        lastUpdated: new Date(),
        isActive: true
      });
      
      await this.logActivity('إضافة موظف', `تم إضافة موظف جديد: ${employeeData.name}`);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error adding employee:', error);
      return { success: false, error: error.message };
    }
  }

  async getAllEmployees() {
    try {
      const q = query(
        collection(db, this.collections.employees),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const employees = [];
      
      querySnapshot.forEach((doc) => {
        employees.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          lastUpdated: doc.data().lastUpdated?.toDate()
        });
      });
      
      return { success: true, data: employees };
    } catch (error) {
      console.error('Error fetching employees:', error);
      return { success: false, error: error.message };
    }
  }

  async updateEmployee(employeeId, updateData) {
    try {
      const employeeRef = doc(db, this.collections.employees, employeeId);
      await updateDoc(employeeRef, {
        ...updateData,
        lastUpdated: new Date()
      });
      
      await this.logActivity('تحديث موظف', `تم تحديث بيانات موظف: ${updateData.name || 'غير محدد'}`);
      return { success: true };
    } catch (error) {
      console.error('Error updating employee:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteEmployee(employeeId) {
    try {
      const employeeRef = doc(db, this.collections.employees, employeeId);
      await updateDoc(employeeRef, { 
        isActive: false,
        deletedAt: new Date() 
      });
      
      await this.logActivity('حذف موظف', 'تم حذف موظف من النظام');
      return { success: true };
    } catch (error) {
      console.error('Error deleting employee:', error);
      return { success: false, error: error.message };
    }
  }

  // Attendance Management
  async addAttendanceRecord(attendanceData) {
    try {
      const docRef = await addDoc(collection(db, this.collections.attendance), {
        ...attendanceData,
        timestamp: new Date(),
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      });
      
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error adding attendance:', error);
      return { success: false, error: error.message };
    }
  }

  async getEmployeeAttendance(employeeId, startDate, endDate) {
    try {
      let q = query(
        collection(db, this.collections.attendance),
        where('employeeId', '==', employeeId),
        orderBy('date', 'desc')
      );

      if (startDate && endDate) {
        q = query(q, 
          where('date', '>=', startDate),
          where('date', '<=', endDate)
        );
      }

      const querySnapshot = await getDocs(q);
      const attendance = [];
      
      querySnapshot.forEach((doc) => {
        attendance.push({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate(),
          timestamp: doc.data().timestamp?.toDate()
        });
      });
      
      return { success: true, data: attendance };
    } catch (error) {
      console.error('Error fetching attendance:', error);
      return { success: false, error: error.message };
    }
  }

  async updateAttendanceRecord(employeeId, date, status) {
    try {
      // Check if record exists
      const q = query(
        collection(db, this.collections.attendance),
        where('employeeId', '==', employeeId),
        where('date', '==', date)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Create new record
        await this.addAttendanceRecord({
          employeeId: employeeId,
          date: date,
          status: status
        });
      } else {
        // Update existing record
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, {
          status: status,
          lastUpdated: new Date()
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating attendance:', error);
      return { success: false, error: error.message };
    }
  }

  // Activity Logging
  async logActivity(type, description) {
    try {
      await addDoc(collection(db, this.collections.activities), {
        type: type,
        description: description,
        user: currentUser?.name || 'نظام',
        timestamp: new Date(),
        date: new Date().toLocaleDateString('ar-SA')
      });
      return { success: true };
    } catch (error) {
      console.error('Error logging activity:', error);
      return { success: false, error: error.message };
    }
  }

  async getRecentActivities(limitCount = 50) {
    try {
      const q = query(
        collection(db, this.collections.activities),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const activities = [];
      
      querySnapshot.forEach((doc) => {
        activities.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        });
      });
      
      return { success: true, data: activities };
    } catch (error) {
      console.error('Error fetching activities:', error);
      return { success: false, error: error.message };
    }
  }

  // Real-time listeners
  listenToEmployees(callback) {
    const q = query(
      collection(db, this.collections.employees),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const employees = [];
      snapshot.forEach((doc) => {
        employees.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          lastUpdated: doc.data().lastUpdated?.toDate()
        });
      });
      callback(employees);
    }, (error) => {
      console.error('Error listening to employees:', error);
    });
    
    this.listeners.set('employees', unsubscribe);
    return unsubscribe;
  }

  listenToActivities(callback) {
    const q = query(
      collection(db, this.collections.activities),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activities = [];
      snapshot.forEach((doc) => {
        activities.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        });
      });
      callback(activities);
    });
    
    this.listeners.set('activities', unsubscribe);
    return unsubscribe;
  }

  // Cleanup listeners
  cleanup() {
    this.listeners.forEach((unsubscribe) => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.listeners.clear();
  }
}

// Initialize Firebase Data Manager
const dataManager = new FirebaseDataManager();

// Application State
let currentUser = null;
let currentEditingEmployee = null;
let employeeCache = [];
let activitiesCache = [];

// Default users for fallback
const defaultUsers = {
  'ebtsamsaleh': {
    password: 'L987654r',
    role: 'admin',
    name: 'ابتسام صالح',
    id: 'ADM001',
    salary: 8500,
    position: 'مديرة المشغل',
    phone: '0501234567',
    email: 'ebtisam@alamalarous.com',
    joinDate: '2020-01-15',
    address: 'الرياض، المملكة العربية السعودية'
  },
  'fatima_ahmed': {
    password: 'emp123',
    role: 'employee',
    name: 'فاطمة أحمد',
    id: 'EMP001',
    salary: 4200,
    position: 'أخصائية مكياج',
    attendance: 24,
    absences: 2,
    delays: 1,
    phone: '0507654321',
    email: 'fatima@alamalarous.com',
    joinDate: '2021-03-10',
    address: 'الرياض، حي النخيل'
  },
  'nora_salem': {
    password: 'emp456',
    role: 'employee',
    name: 'نورا سالم',
    id: 'EMP002',
    salary: 3800,
    position: 'مصففة شعر',
    attendance: 25,
    absences: 1,
    delays: 0,
    phone: '0509876543',
    email: 'nora@alamalarous.com',
    joinDate: '2021-06-20',
    address: 'الرياض، حي الملز'
  }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  setupLoginForm();
  initializeFirebaseListeners();
});

// Firebase Authentication State Listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User authenticated:', user.email);
  } else {
    console.log('User not authenticated');
  }
});

// Initialize real-time listeners
function initializeFirebaseListeners() {
  // Listen to employee changes
  dataManager.listenToEmployees((employees) => {
    employeeCache = employees;
    if (currentUser && currentUser.role === 'admin') {
      updateEmployeeGrid();
    }
  });

  // Listen to activity changes
  dataManager.listenToActivities((activities) => {
    activitiesCache = activities;
    if (currentUser && currentUser.role === 'admin') {
      displayRecentActivities();
    }
  });
}

// Enhanced Login System
function setupLoginForm() {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
}

async function handleLogin(event) {
  event.preventDefault();
  
  const username = document.getElementById('username')?.value.trim();
  const password = document.getElementById('password')?.value;
  const loginBtn = document.getElementById('loginBtn');

  if (!username || !password) {
    showNotification('يرجى إدخال اسم المستخدم وكلمة المرور', 'error');
    return;
  }

  // Show loading state with enhanced animation
  if (loginBtn) {
    loginBtn.textContent = 'جاري التحقق...';
    loginBtn.disabled = true;
    loginBtn.classList.add('loading');
  }

  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Check default users (in production, this would be Firebase Auth)
    const user = defaultUsers[username];
    
    if (user && user.password === password) {
      currentUser = { username, ...user };
      
      // Log login activity
      await dataManager.logActivity('تسجيل دخول', `${user.name} قام بتسجيل الدخول للنظام`);
      
      showDashboard();
      showNotification(`مرحباً ${user.name}! تم تسجيل الدخول بنجاح`, 'success');
    } else {
      showNotification('اسم المستخدم أو كلمة المرور غير صحيحة', 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    showNotification('حدث خطأ في تسجيل الدخول', 'error');
  } finally {
    if (loginBtn) {
      loginBtn.textContent = 'تسجيل الدخول';
      loginBtn.disabled = false;
      loginBtn.classList.remove('loading');
    }
  }
}

// Enhanced Dashboard Display
function showDashboard() {
  const loginScreen = document.getElementById('loginScreen');
  const dashboard = document.getElementById('dashboard');
  
  if (loginScreen) loginScreen.style.display = 'none';
  if (dashboard) {
    dashboard.style.display = 'block';
    dashboard.style.animation = 'fadeIn 0.6s ease-out';
  }
  
  setupUserInfo();
  setupNavigation();
  setupContent();
}

// Enhanced User Info Setup
function setupUserInfo() {
  const userName = document.getElementById('userName');
  const userRole = document.getElementById('userRole');
  const userAvatar = document.getElementById('userAvatar');
  
  if (userName) userName.textContent = currentUser.name;
  if (userRole) {
    userRole.textContent = currentUser.role === 'admin' ? 'مديرة النظام' : currentUser.position;
  }
  
  if (userAvatar) {
    if (currentUser.role === 'admin') {
      userAvatar.textContent = '👑';
      userAvatar.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
    } else {
      userAvatar.textContent = currentUser.name.charAt(0);
      userAvatar.style.background = 'linear-gradient(135deg, #6366f1, #4338ca)';
    }
  }
}

// Enhanced Navigation Setup
function setupNavigation() {
  const navMenu = document.getElementById('navigationMenu');
  if (!navMenu) return;
  
  navMenu.innerHTML = '';

  let navItems = [];

  if (currentUser.role === 'admin') {
    navItems = [
      { id: 'overview', icon: '📊', text: 'نظرة عامة' },
      { id: 'employees', icon: '👥', text: 'إدارة الموظفين' },
      { id: 'attendance', icon: '📅', text: 'إدارة الحضور' },
      { id: 'salary', icon: '💰', text: 'إدارة الرواتب' },
      { id: 'schedule', icon: '📋', text: 'جدول العمل' },
      { id: 'reports', icon: '📈', text: 'التقارير المتقدمة' }
    ];
  } else {
    navItems = [
      { id: 'attendance', icon: '📅', text: 'حضوري وغيابي' },
      { id: 'salary', icon: '💰', text: 'راتبي ومستحقاتي' },
      { id: 'schedule', icon: '📋', text: 'جدولي اليومي' },
      { id: 'reports', icon: '📈', text: 'تقارير أدائي' }
    ];
  }

  navItems.forEach((item, index) => {
    const navItem = document.createElement('button');
    navItem.className = `nav-item ${index === 0 ? 'active' : ''}`;
    navItem.innerHTML = `<span class="icon">${item.icon}</span> ${item.text}`;
    navItem.setAttribute('data-tab', item.id);
    navItem.onclick = () => showTab(item.id);
    navMenu.appendChild(navItem);
  });

  // Show first tab
  if (navItems.length > 0) {
    showTab(navItems[0].id);
  }
}

// Enhanced Tab Management
function showTab(tabId) {
  // Hide all tabs with animation
  document.querySelectorAll('.tab-content').forEach(tab => {
    if (tab.classList.contains('active')) {
      tab.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => {
        tab.classList.remove('active');
        tab.style.animation = '';
      }, 300);
    }
  });
  
  // Remove active class from nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Show selected tab with animation
  setTimeout(() => {
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
      selectedTab.classList.add('active');
      selectedTab.style.animation = 'slideInContent 0.5s ease-out';
    }
    
    const selectedNavItem = document.querySelector(`[data-tab="${tabId}"]`);
    if (selectedNavItem) {
      selectedNavItem.classList.add('active');
    }
  }, 300);
  
  // Special tab handling
  if (tabId === 'attendance') {
    setTimeout(() => generateCalendar(), 400);
  }
  
  if (tabId === 'employees' && currentUser.role === 'admin') {
    setTimeout(() => updateEmployeeGrid(), 400);
  }
}

// Enhanced Content Setup
function setupContent() {
  if (currentUser.role === 'employee') {
    setupEmployeeContent();
  } else {
    setupAdminContent();
  }
}

// Enhanced Employee Content
function setupEmployeeContent() {
  // Hide admin-only tabs
  const adminTabs = ['overview', 'employees'];
  adminTabs.forEach(tabId => {
    const tab = document.getElementById(tabId);
    if (tab) tab.style.display = 'none';
  });
  
  setupEmployeeAttendance();
  setupEmployeeSalary();
  setupEmployeeReports();
}

function setupEmployeeAttendance() {
  const attendanceTitle = document.getElementById('attendanceTitle');
  const attendanceStats = document.getElementById('attendanceStats');
  
  if (attendanceTitle) {
    attendanceTitle.textContent = 'حضوري وغيابي';
  }
  
  if (attendanceStats) {
    const attendanceRate = Math.round((currentUser.attendance / (currentUser.attendance + currentUser.absences)) * 100);
    
    attendanceStats.innerHTML = `
      <div class="stat-card" data-aos="fade-up" data-aos-delay="100">
        <span class="stat-icon">✅</span>
        <span class="stat-value">${currentUser.attendance}</span>
        <span class="stat-label">أيام الحضور</span>
      </div>
      <div class="stat-card" data-aos="fade-up" data-aos-delay="200">
        <span class="stat-icon">❌</span>
        <span class="stat-value">${currentUser.absences}</span>
        <span class="stat-label">أيام الغياب</span>
      </div>
      <div class="stat-card" data-aos="fade-up" data-aos-delay="300">
        <span class="stat-icon">⏰</span>
        <span class="stat-value">${currentUser.delays}</span>
        <span class="stat-label">مرات التأخير</span>
      </div>
      <div class="stat-card" data-aos="fade-up" data-aos-delay="400">
        <span class="stat-icon">📊</span>
        <span class="stat-value">${attendanceRate}%</span>
        <span class="stat-label">نسبة الحضور</span>
      </div>
    `;
  }
}

// Enhanced Admin Content
async function setupAdminContent() {
  setupAdminStats();
  await loadEmployeesData();
  setupAdminReports();
}

async function loadEmployeesData() {
  try {
    const result = await dataManager.getAllEmployees();
    if (result.success) {
      employeeCache = result.data;
      updateEmployeeGrid();
    }
  } catch (error) {
    console.error('Error loading employees:', error);
  }
}

function updateEmployeeGrid() {
  const employeeGrid = document.getElementById('employeeGrid');
  if (!employeeGrid) return;
  
  employeeGrid.innerHTML = '';
  
  if (employeeCache.length === 0) {
    employeeGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">👥</div>
        <h3 style="color: var(--text-secondary); margin-bottom: 1rem;">لا توجد موظفين</h3>
        <button class="btn btn-primary" onclick="showAddEmployeeForm()">
          <span>➕</span> إضافة أول موظف
        </button>
      </div>
    `;
    return;
  }

  employeeCache.forEach((employee, index) => {
    const employeeCard = createEnhancedEmployeeCard(employee, index);
    employeeGrid.appendChild(employeeCard);
  });
}

function createEnhancedEmployeeCard(employee, index) {
  const card = document.createElement('div');
  card.className = 'employee-card';
  card.style.animation = `slideInUp 0.6s ease-out ${index * 0.1}s both`;
  
  const initials = employee.name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2);
  const attendanceRate = employee.attendance ? 
    Math.round((employee.attendance / (employee.attendance + employee.absences)) * 100) : 100;
  
  card.innerHTML = `
    <div class="employee-header">
      <div class="employee-avatar">${initials}</div>
      <div class="employee-info">
        <h4>${employee.name}</h4>
        <p>${employee.position}</p>
        <span style="font-size: 0.8rem; color: var(--primary-purple); font-weight: 600;">${employee.id || 'ID غير محدد'}</span>
      </div>
    </div>
    <div class="employee-stats">
      <div class="employee-stat">
        <span class="value">${employee.salary?.toLocaleString() || '0'}</span>
        <span class="label">الراتب (ريال)</span>
      </div>
      <div class="employee-stat">
        <span class="value">${attendanceRate}%</span>
        <span class="label">نسبة الحضور</span>
      </div>
    </div>
    <div class="employee-actions">
      <button class="btn btn-primary btn-sm" onclick="editEmployee('${employee.id}')">
        <span>✏️</span> تعديل
      </button>
      <button class="btn btn-success btn-sm" onclick="manageSalary('${employee.id}')">
        <span>💰</span> الراتب
      </button>
      <button class="btn btn-danger btn-sm" onclick="manageAttendance('${employee.id}')">
        <span>📅</span> الحضور
      </button>
    </div>
  `;
  
  return card;
}

// Enhanced Notification System
function showNotification(message, type = 'success', duration = 4000) {
  // Remove existing notification if any
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.75rem;">
      <span style="font-size: 1.25rem;">
        ${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
      </span>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove after duration
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'notificationFadeOut 0.4s ease-out forwards';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 400);
    }
  }, duration);
}

// Enhanced Modal Functions
function openModal() {
  const modal = document.getElementById('employeeModal');
  const overlay = document.getElementById('modalOverlay');
  
  if (modal && overlay) {
    modal.style.display = 'block';
    overlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Animate modal
    setTimeout(() => {
      modal.style.animation = 'modalSlideIn 0.4s ease-out';
      overlay.style.animation = 'fadeIn 0.3s ease-out';
    }, 10);
  }
}

function closeModal() {
  const modal = document.getElementById('employeeModal');
  const overlay = document.getElementById('modalOverlay');
  
  if (modal && overlay) {
    modal.style.animation = 'modalSlideOut 0.4s ease-out';
    overlay.style.animation = 'fadeOut 0.3s ease-out';
    
    setTimeout(() => {
      modal.style.display = 'none';
      overlay.style.display = 'none';
      document.body.style.overflow = 'auto';
    }, 400);
  }
  
  currentEditingEmployee = null;
}

// Enhanced Logout
async function logout() {
  if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
    try {
      // Log logout activity
      if (currentUser) {
        await dataManager.logActivity('تسجيل خروج', `${currentUser.name} قام بتسجيل الخروج من النظام`);
      }
      
      // Cleanup listeners
      dataManager.cleanup();
      
      // Reset state
      currentUser = null;
      employeeCache = [];
      activitiesCache = [];
      
      // Show login screen
      const dashboard = document.getElementById('dashboard');
      const loginScreen = document.getElementById('loginScreen');
      
      if (dashboard) {
        dashboard.style.animation = 'fadeOut 0.5s ease-out';
        setTimeout(() => {
          dashboard.style.display = 'none';
        }, 500);
      }
      
      if (loginScreen) {
        setTimeout(() => {
          loginScreen.style.display = 'flex';
          loginScreen.style.animation = 'fadeIn 0.5s ease-out';
        }, 500);
      }
      
      // Reset login form
      const loginForm = document.getElementById('loginForm');
      if (loginForm) {
        loginForm.reset();
      }
      
      showNotification('تم تسجيل الخروج بنجاح', 'success');
    } catch (error) {
      console.error('Logout error:', error);
      showNotification('حدث خطأ أثناء تسجيل الخروج', 'error');
    }
  }
}

// Add CSS animations for enhanced effects
const additionalStyles = `
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes modalSlideOut {
  from {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  to {
    opacity: 0;
    transform: translate(-50%, -60%) scale(0.9);
  }
}

.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  margin: -10px 0 0 -10px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Placeholder functions for features to be implemented
function showAddEmployeeForm() {
  showNotification('ميزة إضافة الموظفين قيد التطوير', 'warning');
}

function editEmployee(employeeId) {
  showNotification('ميزة تعديل الموظف قيد التطوير', 'warning');
}

function manageSalary(employeeId) {
  showNotification('ميزة إدارة الراتب قيد التطوير', 'warning');
}

function manageAttendance(employeeId) {
  showNotification('ميزة إدارة الحضور قيد التطوير', 'warning');
}

function generateCalendar() {
  // Calendar generation logic will be implemented
  console.log('Generating calendar...');
}

function setupEmployeeSalary() {
  // Employee salary setup
  console.log('Setting up employee salary...');
}

function setupEmployeeReports() {
  // Employee reports setup
  console.log('Setting up employee reports...');
}

function setupAdminStats() {
  // Admin statistics setup
  console.log('Setting up admin statistics...');
}

function setupAdminReports() {
  // Admin reports setup
  console.log('Setting up admin reports...');
}

function displayRecentActivities() {
  // Display recent activities
  console.log('Displaying recent activities...');
}
