// ==========================================
// لوحة التحكم - Dashboard Logic
// ==========================================

let visitsChart = null;
let activeChart = null;

// ==========================================
// 1. جلب الإحصائيات
// ==========================================

async function fetchDashboardStats() {
    try {
        // إجمالي الزيارات
        const { count: totalVisits } = await supabaseClient
            .from('visits')
            .select('*', { count: 'exact', head: true });

        // الزوار الفريدون
        const { data: uniqueData } = await supabaseClient
            .from('visits')
            .select('visitor_id');

        const uniqueVisitors = uniqueData
            ? new Set(uniqueData.map(v => v.visitor_id)).size
            : 0;

        // الزوار النشطون حالياً
        await cleanInactiveVisitors();
        const { count: activeNow } = await supabaseClient
            .from('active_visitors')
            .select('*', { count: 'exact', head: true });

        // نقرات التواصل
        const { count: contactClicks } = await supabaseClient
            .from('contact_clicks')
            .select('*', { count: 'exact', head: true });

        // تحديث الواجهة
        updateStatsUI({
            totalVisits: totalVisits || 0,
            uniqueVisitors: uniqueVisitors || 0,
            activeNow: activeNow || 0,
            contactClicks: contactClicks || 0
        });

    } catch (err) {
        console.error('خطأ في جلب الإحصائيات:', err);
        if (typeof showToast === 'function') {
            showToast('حدث خطأ في تحميل الإحصائيات', 'error');
        }
    }
}

// ==========================================
// 2. تنظيف الزوار غير النشطين
// ==========================================

async function cleanInactiveVisitors() {
    try {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

        await supabaseClient
            .from('active_visitors')
            .delete()
            .lt('last_seen', fiveMinutesAgo);
    } catch (err) {
        console.error('خطأ في تنظيف الزوار:', err);
    }
}

// ==========================================
// 3. تحديث واجهة الإحصائيات
// ==========================================

function updateStatsUI(stats) {
    const elements = {
        totalVisits: document.getElementById('total-visits'),
        uniqueVisitors: document.getElementById('unique-visitors'),
        activeNow: document.getElementById('active-now'),
        contactClicks: document.getElementById('contact-clicks')
    };

    if (elements.totalVisits) {
        if (typeof animateCounter === 'function') {
            animateCounter(elements.totalVisits, stats.totalVisits);
        } else {
            elements.totalVisits.textContent = stats.totalVisits;
        }
    }

    if (elements.uniqueVisitors) {
        if (typeof animateCounter === 'function') {
            animateCounter(elements.uniqueVisitors, stats.uniqueVisitors);
        } else {
            elements.uniqueVisitors.textContent = stats.uniqueVisitors;
        }
    }

    if (elements.activeNow) {
        if (typeof animateCounter === 'function') {
            animateCounter(elements.activeNow, stats.activeNow);
        } else {
            elements.activeNow.textContent = stats.activeNow;
        }
    }

    if (elements.contactClicks) {
        if (typeof animateCounter === 'function') {
            animateCounter(elements.contactClicks, stats.contactClicks);
        } else {
            elements.contactClicks.textContent = stats.contactClicks;
        }
    }
}

// ==========================================
// 4. جلب بيانات الزيارات اليومية (آخر 7 أيام)
// ==========================================

async function fetchDailyVisits() {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data, error } = await supabaseClient
            .from('visits')
            .select('created_at')
            .gte('created_at', sevenDaysAgo.toISOString())
            .order('created_at', { ascending: true });

        if (error) throw error;

        // تجميع البيانات حسب اليوم
        const dailyData = {};
        const labels = [];

        // إنشاء آخر 7 أيام
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('ar-EG', {
                month: 'short',
                day: 'numeric'
            });
            labels.push(dateStr);
            dailyData[dateStr] = 0;
        }

        // حساب الزيارات لكل يوم
        if (data && data.length > 0) {
            data.forEach(visit => {
                const date = new Date(visit.created_at);
                const dateStr = date.toLocaleDateString('ar-EG', {
                    month: 'short',
                    day: 'numeric'
                });
                if (dailyData.hasOwnProperty(dateStr)) {
                    dailyData[dateStr]++;
                }
            });
        }

        const values = labels.map(label => dailyData[label]);

        // رسم الرسم البياني
        createVisitsChart(labels, values);

    } catch (err) {
        console.error('خطأ في جلب الزيارات اليومية:', err);
    }
}

// ==========================================
// 5. رسم الزيارات اليومية
// ==========================================

function createVisitsChart(labels, data) {
    const ctx = document.getElementById('visitsChart');
    if (!ctx) return;

    if (visitsChart) {
        visitsChart.destroy();
    }

    visitsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'عدد الزيارات',
                data: data,
                borderColor: '#0D9488',
                backgroundColor: 'rgba(13, 148, 136, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: '#0D9488',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    align: 'end',
                    labels: {
                        font: {
                            family: 'Cairo',
                            size: 12
                        },
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        family: 'Cairo',
                        size: 14
                    },
                    bodyFont: {
                        family: 'Cairo',
                        size: 13
                    },
                    cornerRadius: 8,
                    rtl: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: {
                            family: 'Cairo',
                            size: 12
                        },
                        precision: 0
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    ticks: {
                        font: {
                            family: 'Cairo',
                            size: 12
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// ==========================================
// 6. جلب بيانات الزوار النشطون (آخر 24 ساعة)
// ==========================================

async function fetchHourlyActive() {
    try {
        const oneDayAgo = new Date();
        oneDayAgo.setHours(oneDayAgo.getHours() - 24);

        const { data, error } = await supabaseClient
            .from('visits')
            .select('created_at')
            .gte('created_at', oneDayAgo.toISOString())
            .order('created_at', { ascending: true });

        if (error) throw error;

        // تجميع البيانات حسب الساعة
        const hourlyData = {};
        const labels = [];

        // إنشاء آخر 24 ساعة (كل 3 ساعات للوضوح)
        for (let i = 21; i >= 0; i -= 3) {
            const date = new Date();
            date.setHours(date.getHours() - i);
            const hourStr = date.getHours() + ':00';
            labels.push(hourStr);
            hourlyData[hourStr] = 0;
        }

        // حساب الزيارات لكل ساعة
        if (data && data.length > 0) {
            data.forEach(visit => {
                const date = new Date(visit.created_at);
                const hour = date.getHours();
                // تقريب إلى أقرب 3 ساعات
                const roundedHour = Math.floor(hour / 3) * 3;
                const hourStr = roundedHour + ':00';
                if (hourlyData.hasOwnProperty(hourStr)) {
                    hourlyData[hourStr]++;
                }
            });
        }

        const values = labels.map(label => hourlyData[label]);

        // رسم الرسم البياني
        createActiveChart(labels, values);

    } catch (err) {
        console.error('خطأ في جلب الزوار النشطون:', err);
    }
}

// ==========================================
// 7. رسم الزوار النشطون
// ==========================================

function createActiveChart(labels, data) {
    const ctx = document.getElementById('activeChart');
    if (!ctx) return;

    if (activeChart) {
        activeChart.destroy();
    }

    activeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'عدد الزيارات',
                data: data,
                backgroundColor: 'rgba(139, 92, 246, 0.8)',
                borderColor: '#8B5CF6',
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    align: 'end',
                    labels: {
                        font: {
                            family: 'Cairo',
                            size: 12
                        },
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        family: 'Cairo',
                        size: 14
                    },
                    bodyFont: {
                        family: 'Cairo',
                        size: 13
                    },
                    cornerRadius: 8,
                    rtl: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: {
                            family: 'Cairo',
                            size: 12
                        },
                        precision: 0
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    ticks: {
                        font: {
                            family: 'Cairo',
                            size: 11
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// ==========================================
// 8. جلب أكثر الأشخاص تواصلاً
// ==========================================

async function fetchTopContacts() {
    try {
        // استخدام JOIN لجلب المهنة من جدول workers
        const { data, error } = await supabaseClient
            .from('contact_clicks')
            .select(`
                worker_id,
                worker_name,
                worker_phone,
                workers(job)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            renderTopContactsTable([]);
            return;
        }

        // تجميع حسب worker_id وعد التكرارات
        const contactCounts = {};

        data.forEach(contact => {
            if (!contactCounts[contact.worker_id]) {
                const jobData = Array.isArray(contact.workers) ? contact.workers[0]?.job : contact.workers?.job;
                contactCounts[contact.worker_id] = {
                    name: contact.worker_name,
                    phone: contact.worker_phone,
                    job: jobData || 'غير متوفر',
                    count: 0
                };
            }
            contactCounts[contact.worker_id].count++;
        });

        // تحويل إلى array وترتيب
        const sortedContacts = Object.entries(contactCounts)
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        // عرض الجدول
        renderTopContactsTable(sortedContacts);

    } catch (err) {
        console.error('خطأ في جلب أكثر الأشخاص تواصلاً:', err);
        renderTopContactsTable([]);
    }
}

// ==========================================
// 9. عرض جدول أكثر الأشخاص تواصلاً
// ==========================================

function renderTopContactsTable(contacts) {
    const tbody = document.getElementById('top-contacts-table');
    if (!tbody) return;

    if (!contacts || contacts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-8 text-secondary">
                    <i class="fa-regular fa-folder-open text-4xl mb-2 block"></i>
                    <p>لا توجد بيانات حتى الآن</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = contacts.map((contact, index) => {
        const medals = ['🥇', '🥈', '🥉'];
        const medal = index < 3 ? medals[index] : '';

        return `
            <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td class="py-4 px-4">
                    <span class="text-lg font-bold text-primary">${medal} #${index + 1}</span>
                </td>
                <td class="py-4 px-4 font-bold text-dark">${contact.name}</td>
                <td class="py-4 px-4 text-secondary">${contact.job}</td>
                <td class="py-4 px-4 font-mono text-dark" dir="ltr">${contact.phone}</td>
                <td class="py-4 px-4">
                    <span class="bg-primary/10 text-primary px-4 py-2 rounded-full font-bold">
                        ${contact.count} مرة
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

// ==========================================
// 10. جلب آخر التواصلات
// ==========================================

async function fetchRecentContacts() {
    try {
        const { data, error } = await supabaseClient
            .from('contact_clicks')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;

        renderRecentContacts(data || []);

    } catch (err) {
        console.error('خطأ في جلب آخر التواصلات:', err);
        renderRecentContacts([]);
    }
}

// ==========================================
// 11. عرض آخر التواصلات
// ==========================================

function renderRecentContacts(contacts) {
    const container = document.getElementById('recent-contacts');
    if (!container) return;

    if (!contacts || contacts.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-secondary">
                <i class="fa-regular fa-folder-open text-4xl mb-2 block"></i>
                <p>لا توجد تواصلات حتى الآن</p>
            </div>
        `;
        return;
    }

    container.innerHTML = contacts.map(contact => {
        const date = new Date(contact.created_at);
        const timeStr = date.toLocaleString('ar-EG', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-primary transition-colors">
                <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fa-solid fa-phone text-primary text-lg"></i>
                </div>
                <div class="flex-1">
                    <h4 class="font-bold text-dark mb-1">${contact.worker_name}</h4>
                    <p class="text-sm text-secondary" dir="ltr">${contact.worker_phone}</p>
                </div>
                <div class="text-left flex-shrink-0">
                    <p class="text-xs text-secondary">${timeStr}</p>
                </div>
            </div>
        `;
    }).join('');
}

// ==========================================
// 12. تحديث كل البيانات
// ==========================================

async function refreshDashboard() {
    const refreshBtn = document.getElementById('refresh-btn');
    const icon = refreshBtn?.querySelector('i');

    // إضافة أنيميشن دوران
    if (icon) {
        icon.classList.add('refresh-spin');
    }

    try {
        await Promise.all([
            fetchDashboardStats(),
            fetchDailyVisits(),
            fetchHourlyActive(),
            fetchTopContacts(),
            fetchRecentContacts()
        ]);

        if (typeof showToast === 'function') {
            showToast('تم تحديث البيانات بنجاح', 'success');
        }
    } catch (err) {
        console.error('خطأ في تحديث البيانات:', err);
        if (typeof showToast === 'function') {
            showToast('حدث خطأ في التحديث', 'error');
        }
    } finally {
        // إزالة أنيميشن بعد الانتهاء
        if (icon) {
            setTimeout(() => {
                icon.classList.remove('refresh-spin');
            }, 500);
        }
    }
}

// ==========================================
// 13. Event Listeners
// ==========================================

document.addEventListener('DOMContentLoaded', async function () {
    console.log('Dashboard loaded');

    // التحقق من وجود Supabase
    if (typeof supabaseClient === 'undefined') {
        console.error('Supabase client not found!');
        alert('خطأ: لم يتم العثور على اتصال قاعدة البيانات');
        return;
    }

    // تحميل البيانات عند فتح الصفحة
    await refreshDashboard();

    // زر التحديث
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshDashboard);
    }

    // زر تنزيل CSV
    const exportBtn = document.getElementById('export-csv-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportWorkersToCSV);
    }

    // تحديث تلقائي كل دقيقة
    setInterval(() => {
        fetchDashboardStats();
        fetchRecentContacts();
    }, 60000);
});

// ==========================================
// 14. تنزيل البيانات كملف CSV
// ==========================================

/**
 * تحويل البيانات إلى صيغة CSV
 * @param {Array} data - مصفوفة الكائنات
 * @returns {String} النص بصيغة CSV
 */
function convertToCSV(data) {
    if (!data || data.length === 0) {
        return 'لا توجد بيانات';
    }

    // جلب أسماء الأعمدة من أول عنصر
    const headers = Object.keys(data[0]);

    // إنشاء الصف الأول (الرؤوس)
    const headerRow = headers
        .map(header => escapeCSVField(header))
        .join(',');

    // إنشاء الصفوف البيانية
    const dataRows = data.map(row => {
        return headers
            .map(header => {
                const value = row[header];
                return escapeCSVField(value);
            })
            .join(',');
    });

    // دمج الرؤوس مع الصفوف
    return [headerRow, ...dataRows].join('\n');
}

/**
 * معالجة قيمة لجعلها آمنة في CSV
 * @param {*} field - القيمة
 * @returns {String} القيمة المعالجة
 */
function escapeCSVField(field) {
    // التعامل مع القيم الفارغة أو null أو undefined
    if (field === null || field === undefined || field === '') {
        return '""';
    }

    // تحويل إلى نص
    let value = String(field);

    // إذا كانت القيمة تحتوي على فاصلة أو علامات اقتباس أو أسطر جديدة
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        // تبديل علامات الاقتباس بعلامات مزدوجة
        value = value.replace(/"/g, '""');
        // إحاطة بعلامات اقتباس
        return `"${value}"`;
    }

    return value;
}

/**
 * تنزيل ملف
 * @param {String} content - محتوى الملف
 * @param {String} filename - اسم الملف
 * @param {String} mimeType - نوع الملف
 */
function downloadFile(content, filename, mimeType = 'text/csv;charset=utf-8;') {
    // إنشاء Blob من المحتوى
    const blob = new Blob([content], { type: mimeType });

    // إنشاء رابط تحميل
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    // إضافة الرابط للـ DOM وتفعيل التحميل
    document.body.appendChild(link);
    link.click();

    // تنظيف الموارد
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * تنزيل بيانات العمال كملف CSV
 */
async function exportWorkersToCSV() {
    const btn = document.getElementById('export-csv-btn');
    const originalHTML = btn.innerHTML;

    try {
        // تعطيل الزر وإظهار جاري التحميل
        btn.disabled = true;
        btn.innerHTML = `
            <svg class="animate-spin h-5 w-5 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            جاري التنزيل...
        `;

        // جلب البيانات من Supabase
        console.log('📥 جاري جلب بيانات العمال...');
        const { data, error } = await supabaseClient
            .from('workers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`خطأ من Supabase: ${error.message}`);
        }

        if (!data || data.length === 0) {
            throw new Error('لا توجد بيانات للتنزيل');
        }

        console.log(`✅ تم جلب ${data.length} عامل`);

        // تحويل البيانات إلى CSV
        console.log('🔄 تحويل البيانات إلى CSV...');
        const csvContent = convertToCSV(data);

        // إنشاء اسم الملف مع التاريخ والوقت
        const timestamp = new Date().toLocaleString('ar-EG').replace(/\//g, '-').replace(/:/g, '-');
        const filename = `workers_${timestamp}.csv`;

        // تنزيل الملف
        downloadFile(csvContent, filename);

        console.log(`✅ تم تنزيل الملف: ${filename}`);

        // إظهار رسالة نجاح
        if (typeof showToast === 'function') {
            showToast(`✅ تم تنزيل ${data.length} عامل بنجاح`, 'success');
        }

    } catch (err) {
        console.error('❌ خطأ في تنزيل البيانات:', err);

        if (typeof showToast === 'function') {
            showToast(`❌ خطأ: ${err.message}`, 'error');
        } else {
            alert(`خطأ: ${err.message}`);
        }

    } finally {
        // إعادة تفعيل الزر
        btn.disabled = false;
        btn.innerHTML = originalHTML;
    }
}