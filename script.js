// User Database (في التطبيق الحقيقي سيكون في قاعدة البيانات)
const users = {
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
        address: 'الرياض، حي النخيل',
        attendanceRecord: {
            '2025-09-01': 'present',
            '2025-09-02': 'present',
            '2025-09-03': 'absent',
            '2025-09-04': 'present',
            '2025-09-05': 'present'
        }
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
        address: 'الرياض، حي الملز',
        attendanceRecord: {
            '2025-09-01': 'present',
            '2025-09-02': 'present',
            '2025-09-03': 'present',
            '2025-09-04': 'present',
            '2025-09-05': 'present'
        }
    }
};

// Current user state
let currentUser = null;
let currentEditingEmployee = null;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    setupLoginForm();
});

// Setup login form
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', handleLogin);
}

// Handle login
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');

    // Show loading state
    loginBtn.textContent = 'جاري التحقق...';
    loginBtn.disabled = true;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const user = users[username];
    
    if (user && user.password === password) {
        currentUser = { username, ...user };
        showDashboard();
        showNotification(`مرحباً ${user.name}! تم تسجيل الدخول بنجاح`, 'success');
    } else {
        showNotification('اسم المستخدم أو كلمة المرور غير صحيحة', 'error');
        loginBtn.textContent = 'تسجيل الدخول';
        loginBtn.disabled = false;
    }
}

// Show dashboard
function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    
    setupUserInfo();
    setupNavigation();
    setupContent();
}

// Setup user info in header
function setupUserInfo() {
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userRole').textContent = currentUser.role === 'admin' ? 'مديرة النظام' : currentUser.position;
    
    const avatar = document.getElementById('userAvatar');
    if (currentUser.role === 'admin') {
        avatar.textContent = '👑';
        avatar.style.background = 'linear-gradient(135deg, #ffd700, #ffed4a)';
    } else {
        avatar.textContent = currentUser.name.charAt(0);
    }
}

// Setup navigation based on user role
function setupNavigation() {
    const navMenu = document.getElementById('navigationMenu');
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
    showTab(navItems[0].id);
}

// Setup content based on user role
function setupContent() {
    if (currentUser.role === 'employee') {
        setupEmployeeContent();
    } else {
        setupAdminContent();
    }
}

// Setup employee-specific content
function setupEmployeeContent() {
    // Hide admin-only tabs
    document.getElementById('overview').style.display = 'none';
    document.getElementById('employees').style.display = 'none';
    
    // Update attendance title
    document.getElementById('attendanceTitle').textContent = 'حضوري وغيابي';
    
    // Setup employee attendance stats
    const attendanceStats = document.getElementById('attendanceStats');
    attendanceStats.innerHTML = `
        <div class="stat-card">
            <span class="stat-icon">✅</span>
            <span class="stat-value">${currentUser.attendance}</span>
            <span class="stat-label">أيام الحضور</span>
        </div>
        <div class="stat-card">
            <span class="stat-icon">❌</span>
            <span class="stat-value">${currentUser.absences}</span>
            <span class="stat-label">أيام الغياب</span>
        </div>
        <div class="stat-card">
            <span class="stat-icon">⏰</span>
            <span class="stat-value">${currentUser.delays}</span>
            <span class="stat-label">مرات التأخير</span>
        </div>
        <div class="stat-card">
            <span class="stat-icon">📊</span>
            <span class="stat-value">${Math.round((currentUser.attendance / (currentUser.attendance + currentUser.absences)) * 100)}%</span>
            <span class="stat-label">نسبة الحضور</span>
        </div>
    `;

    // Setup employee salary content
    const salaryContent = document.getElementById('salaryContent');
    const basicSalary = currentUser.salary;
    const allowances = 500;
    const deductions = currentUser.absences * (basicSalary / 30);
    const totalSalary = basicSalary + allowances - deductions;

    salaryContent.innerHTML = `
        <div class="simple-table">
            <div class="table-header">تفاصيل الراتب الشهري - سبتمبر 2025</div>
            <div class="table-row">
                <span class="row-label">الراتب الأساسي</span>
                <span class="row-value positive">${basicSalary.toLocaleString()} ريال</span>
            </div>
            <div class="table-row">
                <span class="row-label">البدلات والحوافز</span>
                <span class="row-value positive">${allowances} ريال</span>
            </div>
            <div class="table-row">
                <span class="row-label">خصم الغياب</span>
                <span class="row-value negative">-${Math.round(deductions)} ريال</span>
            </div>
            <div class="table-row" style="border-top: 2px solid var(--primary-gold); font-weight: 700; font-size: 1.1rem;">
                <span class="row-label">إجمالي الراتب</span>
                <span class="row-value" style="color: var(--primary-gold);">${Math.round(totalSalary).toLocaleString()} ريال</span>
            </div>
        </div>
        <br>
        <div class="simple-table">
            <div class="table-header">سجل المدفوعات</div>
            <div class="table-row">
                <span class="row-label">30 أغسطس 2025</span>
                <span class="row-value positive">${(totalSalary - 150).toLocaleString()} ريال</span>
            </div>
            <div class="table-row">
                <span class="row-label">30 يوليو 2025</span>
                <span class="row-value positive">${totalSalary.toLocaleString()} ريال</span>
            </div>
        </div>
    `;

    // Setup employee reports
    const reportsContent = document.getElementById('reportsContent');
    reportsContent.innerHTML = `
        <div class="stats-container">
            <div class="stat-card">
                <span class="stat-icon">👥</span>
                <span class="stat-value">89</span>
                <span class="stat-label">العملاء المخدومين</span>
            </div>
            <div class="stat-card">
                <span class="stat-icon">⭐</span>
                <span class="stat-value">4.8</span>
                <span class="stat-label">تقييم العملاء</span>
            </div>
            <div class="stat-card">
                <span class="stat-icon">💰</span>
                <span class="stat-value">12,500</span>
                <span class="stat-label">إجمالي المبيعات (ريال)</span>
            </div>
            <div class="stat-card">
                <span class="stat-icon">🏆</span>
                <span class="stat-value">95%</span>
                <span class="stat-label">نسبة الأداء</span>
            </div>
        </div>
        <div class="simple-table">
            <div class="table-header">ملخص الأداء الشهري</div>
            <div class="table-row">
                <span class="row-label">عدد العملاء الجدد</span>
                <span class="row-value positive">23</span>
            </div>
            <div class="table-row">
                <span class="row-label">متوسط قيمة الخدمة</span>
                <span class="row-value">140 ريال</span>
            </div>
            <div class="table-row">
                <span class="row-label">نسبة رضا العملاء</span>
                <span class="row-value positive">96%</span>
            </div>
        </div>
    `;
}

// Setup admin-specific content
function setupAdminContent() {
    // Update titles for admin view
    document.getElementById('attendanceTitle').textContent = 'إدارة الحضور';
    document.getElementById('salaryTitle').textContent = 'إدارة الرواتب';
    
    // Setup admin attendance stats (all employees)
    const attendanceStats = document.getElementById('attendanceStats');
    attendanceStats.innerHTML = `
        <div class="stat-card">
            <span class="stat-icon">✅</span>
            <span class="stat-value">95%</span>
            <span class="stat-label">متوسط الحضور</span>
        </div>
        <div class="stat-card">
            <span class="stat-icon">❌</span>
            <span class="stat-value">3</span>
            <span class="stat-label">إجمالي الغيابات</span>
        </div>
        <div class="stat-card">
            <span class="stat-icon">⏰</span>
            <span class="stat-value">1</span>
            <span class="stat-label">التأخيرات</span>
        </div>
        <div class="stat-card">
            <span class="stat-icon">👥</span>
            <span class="stat-value">12</span>
            <span class="stat-label">الموظفين النشطين</span>
        </div>
    `;

    // Setup admin salary management
    const salaryContent = document.getElementById('salaryContent');
    salaryContent.innerHTML = `
        <div class="stats-container">
            <div class="stat-card">
                <span class="stat-icon">💰</span>
                <span class="stat-value">54,200</span>
                <span class="stat-label">إجمالي الرواتب (ريال)</span>
            </div>
            <div class="stat-card">
                <span class="stat-icon">➕</span>
                <span class="stat-value">6,500</span>
                <span class="stat-label">البدلات والحوافز (ريال)</span>
            </div>
            <div class="stat-card">
                <span class="stat-icon">➖</span>
                <span class="stat-value">1,200</span>
                <span class="stat-label">إجمالي الخصومات (ريال)</span>
            </div>
            <div class="stat-card">
                <span class="stat-icon">📊</span>
                <span class="stat-value">59,500</span>
                <span class="stat-label">الإجمالي النهائي (ريال)</span>
            </div>
        </div>
        <div style="text-align: center; margin: 30px 0;">
            <button class="btn btn-primary" onclick="manageSalaries()">
                <span>⚙️</span> إدارة رواتب الموظفين
            </button>
            <button class="btn btn-success" onclick="generatePayroll()">
                <span>📄</span> إنشاء كشف المرتبات
            </button>
        </div>
        <div class="simple-table">
            <div class="table-header">ملخص رواتب الموظفين</div>
            <div class="table-row">
                <span class="row-label">فاطمة أحمد - أخصائية مكياج</span>
                <span class="row-value">4,650 ريال</span>
            </div>
            <div class="table-row">
                <span class="row-label">نورا سالم - مصففة شعر</span>
                <span class="row-value">3,800 ريال</span>
            </div>
            <div class="table-row">
                <span class="row-label">سارة محمد - أخصائية بشرة</span>
                <span class="row-value">3,900 ريال</span>
            </div>
        </div>
    `;

    // Setup employee grid
    setupEmployeeGrid();

    // Setup admin reports
    const reportsContent = document.getElementById('reportsContent');
    reportsContent.innerHTML = `
        <div class="stats-container">
            <div class="stat-card">
                <span class="stat-icon">📈</span>
                <span class="stat-value">+15.2%</span>
                <span class="stat-label">نمو الإيرادات</span>
            </div>
            <div class="stat-card">
                <span class="stat-icon">👥</span>
                <span class="stat-value">+23</span>
                <span class="stat-label">عملاء جدد</span>
            </div>
            <div class="stat-card">
                <span class="stat-icon">⭐</span>
                <span class="stat-value">4.9</span>
                <span class="stat-label">متوسط التقييمات</span>
            </div>
            <div class="stat-card">
                <span class="stat-icon">📊</span>
                <span class="stat-value">92%</span>
                <span class="stat-label">نسبة رضا العملاء</span>
            </div>
        </div>
        <div style="text-align: center; margin: 30px 0;">
            <button class="btn btn-primary" onclick="generateMonthlyReport()">
                <span>📋</span> تقرير شهري شامل
            </button>
            <button class="btn btn-primary" onclick="generateFinancialReport()">
                <span>💰</span> التقرير المالي
            </button>
        </div>
        <div class="simple-table">
            <div class="table-header">أداء الموظفين</div>
            <div class="table-row">
                <span class="row-label">فاطمة أحمد</span>
                <span class="row-value positive">ممتاز (96%)</span>
            </div>
            <div class="table-row">
                <span class="row-label">نورا سالم</span>
                <span class="row-value positive">ممتاز (98%)</span>
            </div>
            <div class="table-row">
                <span class="row-label">سارة محمد</span>
                <span class="row-value positive">جيد جداً (89%)</span>
            </div>
        </div>
    `;
}

// Setup employee grid for admin
function setupEmployeeGrid() {
    const employeeGrid = document.getElementById('employeeGrid');
    employeeGrid.innerHTML = '';

    Object.entries(users).forEach(([username, user]) => {
        if (user.role === 'employee') {
            const employeeCard = createEmployeeCard(user);
            employeeGrid.appendChild(employeeCard);
        }
    });
}

// Create employee card
function createEmployeeCard(user) {
    const card = document.createElement('div');
    card.className = 'employee-card';
    
    const initials = user.name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2);
    const attendanceRate = user.attendance ? Math.round((user.attendance / (user.attendance + user.absences)) * 100) : 100;
    
    card.innerHTML = `
        <div class="employee-header">
            <div class="employee-avatar">${initials}</div>
            <div class="employee-info">
                <h4>${user.name}</h4>
                <p>${user.position}</p>
                <span style="font-size: 0.8rem; color: var(--primary-gold); font-weight: 600;">${user.id}</span>
            </div>
        </div>
        <div class="employee-stats">
            <div class="employee-stat">
                <span class="value">${user.salary.toLocaleString()}</span>
                <span class="label">الراتب (ريال)</span>
            </div>
            <div class="employee-stat">
                <span class="value">${attendanceRate}%</span>
                <span class="label">نسبة الحضور</span>
            </div>
        </div>
        <div class="employee-actions">
            <button class="btn btn-primary btn-sm" onclick="editEmployee('${user.id}')">
                <span>✏️</span> تعديل
            </button>
            <button class="btn btn-success btn-sm" onclick="manageSalary('${user.id}')">
                <span>💰</span> الراتب
            </button>
            <button class="btn btn-danger btn-sm" onclick="manageAttendance('${user.id}')">
                <span>📅</span> الحضور
            </button>
        </div>
    `;
    
    return card;
}

// Generate calendar
function generateCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';
    
    // Sample calendar data for September 2025
    const daysInMonth = 30;
    const startDay = 1; // Monday
    
    // Add empty cells for days before month start
    for (let i = 0; i < startDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        // Sample attendance data
        if (day === 2) {
            dayElement.classList.add('today');
            dayElement.classList.add('present');
        } else if ([6, 7, 13, 14, 20, 21, 27, 28].includes(day)) {
            dayElement.classList.add('weekend');
        } else if ([3, 15].includes(day)) {
            dayElement.classList.add('absent');
        } else if (day < 2) {
            dayElement.classList.add('present');
        }
        
        calendarGrid.appendChild(dayElement);
    }
}

// Show tab function
function showTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to the correct nav item
    const selectedNavItem = document.querySelector(`[data-tab="${tabId}"]`);
    if (selectedNavItem) {
        selectedNavItem.classList.add('active');
    }
    
    // Generate calendar if attendance tab is shown
    if (tabId === 'attendance') {
        setTimeout(generateCalendar, 100);
    }
}

// Modal functions
function openModal() {
    document.getElementById('employeeModal').style.display = 'block';
    document.getElementById('modalOverlay').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('employeeModal').style.display = 'none';
    document.getElementById('modalOverlay').style.display = 'none';
    document.body.style.overflow = 'auto';
    currentEditingEmployee = null;
}

// Find employee by ID
function findEmployeeById(employeeId) {
    for (let [username, user] of Object.entries(users)) {
        if (user.id === employeeId) {
            return { username, ...user };
        }
    }
    return null;
}

// Admin functions - تم تحسينها للعمل فعلياً
function showAddEmployeeForm() {
    document.getElementById('modalTitle').textContent = 'إضافة موظف جديد';
    document.getElementById('modalBody').innerHTML = `
        <form id="addEmployeeForm">
            <div class="modal-form-row">
                <div class="modal-form-group">
                    <label for="employeeName">اسم الموظف *</label>
                    <input type="text" id="employeeName" required placeholder="أدخل اسم الموظف">
                </div>
                <div class="modal-form-group">
                    <label for="employeePosition">المنصب *</label>
                    <select id="employeePosition" required>
                        <option value="">اختر المنصب</option>
                        <option value="أخصائية مكياج">أخصائية مكياج</option>
                        <option value="مصففة شعر">مصففة شعر</option>
                        <option value="أخصائية بشرة">أخصائية بشرة</option>
                        <option value="أخصائية أظافر">أخصائية أظافر</option>
                        <option value="مساعدة إدارية">مساعدة إدارية</option>
                    </select>
                </div>
            </div>
            <div class="modal-form-row">
                <div class="modal-form-group">
                    <label for="employeeSalary">الراتب الأساسي *</label>
                    <input type="number" id="employeeSalary" required placeholder="مثال: 4000">
                </div>
                <div class="modal-form-group">
                    <label for="employeePhone">رقم الهاتف *</label>
                    <input type="tel" id="employeePhone" required placeholder="مثال: 0501234567">
                </div>
            </div>
            <div class="modal-form-row">
                <div class="modal-form-group">
                    <label for="employeeEmail">البريد الإلكتروني</label>
                    <input type="email" id="employeeEmail" placeholder="مثال: name@alamalarous.com">
                </div>
                <div class="modal-form-group">
                    <label for="employeeJoinDate">تاريخ التوظيف</label>
                    <input type="date" id="employeeJoinDate" value="${new Date().toISOString().split('T')[0]}">
                </div>
            </div>
            <div class="modal-form-group">
                <label for="employeeAddress">العنوان</label>
                <textarea id="employeeAddress" placeholder="أدخل عنوان الموظف"></textarea>
            </div>
        </form>
    `;
    
    document.getElementById('saveBtn').onclick = saveNewEmployee;
    openModal();
}

function editEmployee(employeeId) {
    const employee = findEmployeeById(employeeId);
    if (!employee) {
        showNotification('لم يتم العثور على الموظف!', 'error');
        return;
    }
    
    currentEditingEmployee = employeeId;
    document.getElementById('modalTitle').textContent = `تعديل بيانات ${employee.name}`;
    document.getElementById('modalBody').innerHTML = `
        <form id="editEmployeeForm">
            <div class="modal-form-row">
                <div class="modal-form-group">
                    <label for="editEmployeeName">اسم الموظف *</label>
                    <input type="text" id="editEmployeeName" required value="${employee.name}">
                </div>
                <div class="modal-form-group">
                    <label for="editEmployeePosition">المنصب *</label>
                    <select id="editEmployeePosition" required>
                        <option value="أخصائية مكياج" ${employee.position === 'أخصائية مكياج' ? 'selected' : ''}>أخصائية مكياج</option>
                        <option value="مصففة شعر" ${employee.position === 'مصففة شعر' ? 'selected' : ''}>مصففة شعر</option>
                        <option value="أخصائية بشرة" ${employee.position === 'أخصائية بشرة' ? 'selected' : ''}>أخصائية بشرة</option>
                        <option value="أخصائية أظافر" ${employee.position === 'أخصائية أظافر' ? 'selected' : ''}>أخصائية أظافر</option>
                        <option value="مساعدة إدارية" ${employee.position === 'مساعدة إدارية' ? 'selected' : ''}>مساعدة إدارية</option>
                    </select>
                </div>
            </div>
            <div class="modal-form-row">
                <div class="modal-form-group">
                    <label for="editEmployeeSalary">الراتب الأساسي *</label>
                    <input type="number" id="editEmployeeSalary" required value="${employee.salary}">
                </div>
                <div class="modal-form-group">
                    <label for="editEmployeePhone">رقم الهاتف *</label>
                    <input type="tel" id="editEmployeePhone" required value="${employee.phone || ''}">
                </div>
            </div>
            <div class="modal-form-row">
                <div class="modal-form-group">
                    <label for="editEmployeeEmail">البريد الإلكتروني</label>
                    <input type="email" id="editEmployeeEmail" value="${employee.email || ''}">
                </div>
                <div class="modal-form-group">
                    <label for="editEmployeeJoinDate">تاريخ التوظيف</label>
                    <input type="date" id="editEmployeeJoinDate" value="${employee.joinDate || ''}">
                </div>
            </div>
            <div class="modal-form-group">
                <label for="editEmployeeAddress">العنوان</label>
                <textarea id="editEmployeeAddress">${employee.address || ''}</textarea>
            </div>
        </form>
    `;
    
    document.getElementById('saveBtn').onclick = saveEmployeeChanges;
    openModal();
}

function manageSalary(employeeId) {
    const employee = findEmployeeById(employeeId);
    if (!employee) {
        showNotification('لم يتم العثور على الموظف!', 'error');
        return;
    }
    
    currentEditingEmployee = employeeId;
    const basicSalary = employee.salary;
    const allowances = 500;
    const deductions = employee.absences * (basicSalary / 30);
    const totalSalary = basicSalary + allowances - deductions;
    
    document.getElementById('modalTitle').textContent = `إدارة راتب ${employee.name}`;
    document.getElementById('modalBody').innerHTML = `
        <div class="stats-container" style="margin-bottom: 30px;">
            <div class="stat-card">
                <span class="stat-icon">💰</span>
                <span class="stat-value">${basicSalary.toLocaleString()}</span>
                <span class="stat-label">الراتب الحالي</span>
            </div>
            <div class="stat-card">
                <span class="stat-icon">📊</span>
                <span class="stat-value">${Math.round(totalSalary).toLocaleString()}</span>
                <span class="stat-label">الراتب بعد الخصومات</span>
            </div>
        </div>
        
        <form id="manageSalaryForm">
            <div class="modal-form-row">
                <div class="modal-form-group">
                    <label for="newBasicSalary">الراتب الأساسي الجديد *</label>
                    <input type="number" id="newBasicSalary" required value="${basicSalary}" min="3000" max="20000">
                </div>
                <div class="modal-form-group">
                    <label for="salaryAllowances">البدلات والحوافز</label>
                    <input type="number" id="salaryAllowances" value="${allowances}" min="0">
                </div>
            </div>
            <div class="modal-form-group">
                <label for="salaryNotes">ملاحظات على التعديل</label>
                <textarea id="salaryNotes" placeholder="أدخل سبب تعديل الراتب (اختياري)"></textarea>
            </div>
        </form>
    `;
    
    document.getElementById('saveBtn').onclick = saveSalaryChanges;
    openModal();
}

function manageAttendance(employeeId) {
    const employee = findEmployeeById(employeeId);
    if (!employee) {
        showNotification('لم يتم العثور على الموظف!', 'error');
        return;
    }
    
    currentEditingEmployee = employeeId;
    document.getElementById('modalTitle').textContent = `إدارة حضور ${employee.name}`;
    
    // Generate attendance calendar for current month
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    let attendanceGrid = '';
    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const attendanceStatus = employee.attendanceRecord && employee.attendanceRecord[dateKey] ? employee.attendanceRecord[dateKey] : '';
        
        attendanceGrid += `
            <div class="day-selector ${attendanceStatus}" 
                 data-date="${dateKey}" 
                 onclick="toggleAttendance('${dateKey}', this)">
                <div>${day}</div>
                <div style="font-size: 0.7rem;">
                    ${attendanceStatus === 'present' ? '✅' : attendanceStatus === 'absent' ? '❌' : '⚪'}
                </div>
            </div>
        `;
    }
    
    document.getElementById('modalBody').innerHTML = `
        <div class="stats-container" style="margin-bottom: 30px;">
            <div class="stat-card">
                <span class="stat-icon">✅</span>
                <span class="stat-value">${employee.attendance || 0}</span>
                <span class="stat-label">أيام الحضور</span>
            </div>
            <div class="stat-card">
                <span class="stat-icon">❌</span>
                <span class="stat-value">${employee.absences || 0}</span>
                <span class="stat-label">أيام الغياب</span>
            </div>
            <div class="stat-card">
                <span class="stat-icon">⏰</span>
                <span class="stat-value">${employee.delays || 0}</span>
                <span class="stat-label">مرات التأخير</span>
            </div>
        </div>
        
        <h4 style="text-align: center; margin: 20px 0; color: var(--primary-gold);">
            تقويم الحضور - ${today.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}
        </h4>
        <p style="text-align: center; margin-bottom: 20px; color: var(--charcoal);">
            انقر على الأيام لتسجيل الحضور أو الغياب
        </p>
        
        <div class="attendance-day-selector">
            ${attendanceGrid}
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
            <div style="display: inline-flex; gap: 20px; font-size: 0.9rem;">
                <span>✅ حضور</span>
                <span>❌ غياب</span>
                <span>⚪ لم يتم التسجيل</span>
            </div>
        </div>
    `;
    
    document.getElementById('saveBtn').onclick = saveAttendanceChanges;
    openModal();
}

// Toggle attendance status
function toggleAttendance(dateKey, element) {
    const currentStatus = element.classList.contains('present') ? 'present' : 
                         element.classList.contains('absent') ? 'absent' : '';
    
    // Remove all status classes
    element.classList.remove('present', 'absent');
    
    let newStatus = '';
    let icon = '⚪';
    
    if (currentStatus === '') {
        newStatus = 'present';
        icon = '✅';
        element.classList.add('present');
    } else if (currentStatus === 'present') {
        newStatus = 'absent';
        icon = '❌';
        element.classList.add('absent');
    }
    
    // Update icon
    element.children[1].textContent = icon;
    
    // Store the change temporarily
    element.setAttribute('data-status', newStatus);
}

// Save functions
function saveNewEmployee() {
    const form = document.getElementById('addEmployeeForm');
    const formData = new FormData(form);
    
    const name = document.getElementById('employeeName').value.trim();
    const position = document.getElementById('employeePosition').value;
    const salary = parseInt(document.getElementById('employeeSalary').value);
    const phone = document.getElementById('employeePhone').value.trim();
    const email = document.getElementById('employeeEmail').value.trim();
    const joinDate = document.getElementById('employeeJoinDate').value;
    const address = document.getElementById('employeeAddress').value.trim();
    
    if (!name || !position || !salary || !phone) {
        showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    // Generate new employee ID
    const employeeCount = Object.values(users).filter(u => u.role === 'employee').length;
    const newId = `EMP${String(employeeCount + 1).padStart(3, '0')}`;
    const username = name.replace(/\s+/g, '_').toLowerCase();
    
    // Add new employee to users object
    users[username] = {
        password: 'emp123', // Default password
        role: 'employee',
        name: name,
        id: newId,
        salary: salary,
        position: position,
        phone: phone,
        email: email,
        joinDate: joinDate,
        address: address,
        attendance: 0,
        absences: 0,
        delays: 0,
        attendanceRecord: {}
    };
    
    showNotification(`تم إضافة الموظف ${name} بنجاح!`, 'success');
    closeModal();
    setupEmployeeGrid(); // Refresh the employee grid
}

function saveEmployeeChanges() {
    const name = document.getElementById('editEmployeeName').value.trim();
    const position = document.getElementById('editEmployeePosition').value;
    const salary = parseInt(document.getElementById('editEmployeeSalary').value);
    const phone = document.getElementById('editEmployeePhone').value.trim();
    const email = document.getElementById('editEmployeeEmail').value.trim();
    const joinDate = document.getElementById('editEmployeeJoinDate').value;
    const address = document.getElementById('editEmployeeAddress').value.trim();
    
    if (!name || !position || !salary || !phone) {
        showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    // Find and update the employee
    for (let [username, user] of Object.entries(users)) {
        if (user.id === currentEditingEmployee) {
            users[username] = {
                ...user,
                name: name,
                position: position,
                salary: salary,
                phone: phone,
                email: email,
                joinDate: joinDate,
                address: address
            };
            break;
        }
    }
    
    showNotification(`تم تحديث بيانات ${name} بنجاح!`, 'success');
    closeModal();
    setupEmployeeGrid(); // Refresh the employee grid
}

function saveSalaryChanges() {
    const newSalary = parseInt(document.getElementById('newBasicSalary').value);
    const allowances = parseInt(document.getElementById('salaryAllowances').value) || 0;
    const notes = document.getElementById('salaryNotes').value.trim();
    
    if (!newSalary || newSalary < 3000) {
        showNotification('يرجى إدخال راتب صالح (لا يقل عن 3000 ريال)', 'error');
        return;
    }
    
    // Find and update employee salary
    for (let [username, user] of Object.entries(users)) {
        if (user.id === currentEditingEmployee) {
            const oldSalary = user.salary;
            users[username].salary = newSalary;
            
            // Log the change
            console.log(`تم تحديث راتب ${user.name} من ${oldSalary} إلى ${newSalary}`);
            if (notes) {
                console.log(`ملاحظات: ${notes}`);
            }
            
            showNotification(`تم تحديث راتب ${user.name} بنجاح!`, 'success');
            break;
        }
    }
    
    closeModal();
    setupAdminContent(); // Refresh admin content
}

function saveAttendanceChanges() {
    // Get all day selectors and update attendance record
    const daySelectors = document.querySelectorAll('.day-selector[data-status]');
    const employee = findEmployeeById(currentEditingEmployee);
    
    if (!employee) return;
    
    // Find employee in users object and update
    for (let [username, user] of Object.entries(users)) {
        if (user.id === currentEditingEmployee) {
            if (!users[username].attendanceRecord) {
                users[username].attendanceRecord = {};
            }
            
            let presentCount = 0;
            let absentCount = 0;
            
            daySelectors.forEach(selector => {
                const date = selector.getAttribute('data-date');
                const status = selector.getAttribute('data-status');
                
                if (status) {
                    users[username].attendanceRecord[date] = status;
                    if (status === 'present') presentCount++;
                    else if (status === 'absent') absentCount++;
                }
            });
            
            // Update attendance counters
            const totalPresent = Object.values(users[username].attendanceRecord).filter(s => s === 'present').length;
            const totalAbsent = Object.values(users[username].attendanceRecord).filter(s => s === 'absent').length;
            
            users[username].attendance = totalPresent;
            users[username].absences = totalAbsent;
            
            break;
        }
    }
    
    showNotification(`تم تحديث سجل حضور ${employee.name} بنجاح!`, 'success');
    closeModal();
    setupEmployeeGrid(); // Refresh the employee grid
}

function saveChanges() {
    // This function will be overwritten by specific save functions
    showNotification('تم حفظ التغييرات بنجاح!', 'success');
    closeModal();
}

function manageSalaries() {
    showNotification('تم فتح نظام إدارة الرواتب المتقدم', 'success');
}

function generatePayroll() {
    showNotification('جاري إنشاء كشف المرتبات...', 'success');
    
    // Create a simple payroll report
    setTimeout(() => {
        let payrollData = 'كشف المرتبات - سبتمبر 2025\n\n';
        
        Object.values(users).forEach(user => {
            if (user.role === 'employee') {
                const basicSalary = user.salary;
                const allowances = 500;
                const deductions = user.absences * (basicSalary / 30);
                const totalSalary = basicSalary + allowances - deductions;
                
                payrollData += `${user.name} - ${user.position}\n`;
                payrollData += `الراتب الأساسي: ${basicSalary.toLocaleString()} ريال\n`;
                payrollData += `البدلات: ${allowances} ريال\n`;
                payrollData += `الخصومات: ${Math.round(deductions)} ريال\n`;
                payrollData += `الإجمالي: ${Math.round(totalSalary).toLocaleString()} ريال\n\n`;
            }
        });
        
        console.log(payrollData);
        showNotification('تم إنشاء كشف المرتبات بنجاح!', 'success');
    }, 2000);
}

function generateMonthlyReport() {
    showNotification('جاري إنشاء التقرير الشهري الشامل...', 'success');
}

function generateFinancialReport() {
    showNotification('جاري إنشاء التقرير المالي...', 'success');
}

// Logout function
function logout() {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
        currentUser = null;
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('loginForm').reset();
        showNotification('تم تسجيل الخروج بنجاح', 'success');
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}