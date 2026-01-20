const TABLE_NAME = 'workers';

//is verified icon SVG
const VERIFIED_ICON_SVG = '<svg width="26" height="26" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L14.6 4.4L18 4L18.8 7.4L22 9L20.4 12L22 15L18.8 16.6L18 20L14.6 19.6L12 22L9.4 19.6L6 20L5.2 16.6L2 15L3.6 12L2 9L5.2 7.4L6 4L9.4 4.4Z" fill="#1D72D8"/><path d="M8.2 12.3L10.6 14.7L15.8 9.5" fill="none" stroke="#EDEDED" stroke-width="2.4" stroke-linecap="butt" stroke-linejoin="miter"/></svg>';

// متغيرات عامة

let allWorkers = []; // تخزين جميع البيانات مرة واحدة
let filteredWorkers = []; // البيانات بعد الفلترة

// ==========================================
// 1. جلب البيانات من Supabase (مرة واحدة فقط)

async function fetchWorkers() {
    const loading = document.getElementById('loading-indicator');
    const counterElement = document.getElementById('workers-count');

    loading.classList.remove('hidden');

    try {
        const { data, error } = await supabaseClient
            .from(TABLE_NAME)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        allWorkers = data || [];
        filteredWorkers = allWorkers;

        // تحديث العداد مع أنيميشن
        animateCounter(counterElement, allWorkers.length);

        // ملء قائمة المهن
        populateJobFilter();

        // عرض البيانات
        renderWorkers(filteredWorkers);

    } catch (err) {
        console.error('خطأ في جلب البيانات:', err);
        showToast('حدث خطأ في تحميل البيانات', 'error');
    } finally {
        loading.classList.add('hidden');
    }
}

// 2. ملء قائمة المهن من البيانات
// ==========================================

function populateJobFilter() {
    const jobFilter = document.getElementById('filter-job');

    // استخراج المهن الفريدة
    const uniqueJobs = [...new Set(allWorkers.map(w => w.job))].sort();

    // إضافة الخيارات
    uniqueJobs.forEach(job => {
        const option = document.createElement('option');
        option.value = job;
        option.textContent = job;
        jobFilter.appendChild(option);
    });
}

// ==========================================
// 3. الفلترة (Frontend - سريع جداً)
// ==========================================

function applyFilters() {
    const searchName = document.getElementById('search-name').value.trim().toLowerCase();
    const filterJob = document.getElementById('filter-job').value;

    filteredWorkers = allWorkers.filter(worker => {
        const nameMatch = !searchName || worker.name.toLowerCase().includes(searchName);
        const jobMatch = !filterJob || worker.job === filterJob;
        return nameMatch && jobMatch;
    });

    renderWorkers(filteredWorkers);
    updateFilterResults();
}

const debouncedFilter = debounce(applyFilters, 300);

// ==========================================
// 4. عرض البيانات (Render)
// ==========================================

function renderWorkers(workers) {
    const grid = document.getElementById('workers-grid');
    const empty = document.getElementById('empty-state');

    grid.innerHTML = '';

    if (!workers || workers.length === 0) {
        empty.classList.remove('hidden');
        return;
    }

    empty.classList.add('hidden');

    workers.forEach(worker => {
        grid.innerHTML += createCardHTML(worker);
    });
}

function createCardHTML(worker) {
    return `
<div class="service-card bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100 flex flex-col h-full relative group hover:shadow-xl transition-shadow duration-300" data-worker-id="${worker.id}" data-worker-name="${worker.name}">
    <!-- صورة العمل -->
    <div class="h-40 overflow-hidden relative">
        <img src="${worker.work_image}" alt="Work" loading="lazy" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 cursor-pointer" data-image="${worker.work_image}">
        <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
    </div>

    <!-- الصورة الشخصية -->
    <div class="absolute top-28 right-4 w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-lg bg-white cursor-pointer" data-image="${worker.profile_image}">
        <img src="${worker.profile_image}" alt="${worker.name}" loading="lazy" class="w-full h-full object-cover">
    </div>

    <!-- التفاصيل -->
    <div class="pt-16 pb-5 px-5 flex-1 flex flex-col">
        <div class="flex items-center gap-2 mb-1">
            <h3 class="text-2xl font-bold text-dark truncate">
                ${worker.name}
            </h3>

            ${worker.is_verified ? VERIFIED_ICON_SVG : ''}
        </div>


        <div class="flex items-center gap-3 mb-3 text-lg font-semibold">
            <span class="text-primary truncate">${worker.job}</span>
            <span class="flex items-center gap-1 text-secondary text-sm">
                <i class="fa-solid fa-location-dot"></i> 
                <span class="truncate">${worker.location}</span>
            </span>
        </div>

        <div class="text-dark text-xl font-bold mb-4 flex items-center gap-2">
            <i class="fa-solid fa-phone text-primary text-lg"></i>
            <span dir="ltr">${worker.phone}</span>
        </div>

        ${worker.phone_other ? `
        <div class="text-dark text-sm mb-3 flex items-center gap-2 text-slate-600">
            <i class="fa-solid fa-phone text-slate-400 text-sm"></i>
            <span dir="ltr">${worker.phone_other}</span>
        </div>
        ` : ''}

        <div class="mt-auto pt-2 border-t border-slate-100">
            <a href="tel:${worker.phone}" 
               class="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primaryDark text-white font-bold py-3 rounded-xl transition-colors text-lg">
                <i class="fa-solid fa-phone"></i> 
                <span>تواصل الآن</span>
            </a>
        </div>
    </div>
</div>
    `;
}




// ==========================================
// 5. تحديث نتائج الفلترة
// ==========================================

function updateFilterResults() {
    const resultsDiv = document.getElementById('filter-results');
    const filteredCount = document.getElementById('filtered-count');
    const totalCount = document.getElementById('total-count');

    const searchName = document.getElementById('search-name').value.trim();
    const filterJob = document.getElementById('filter-job').value;

    if (searchName || filterJob) {
        resultsDiv.classList.remove('hidden');
        filteredCount.textContent = filteredWorkers.length;
        totalCount.textContent = allWorkers.length;
    } else {
        resultsDiv.classList.add('hidden');
    }
}

// ==========================================
// 6. مسح الفلترة
// ==========================================

function clearFilters() {
    document.getElementById('search-name').value = '';
    document.getElementById('filter-job').value = '';

    filteredWorkers = allWorkers;
    renderWorkers(filteredWorkers);
    updateFilterResults();
}

// ==========================================
// 7. Event Listeners
// ==========================================

document.addEventListener('DOMContentLoaded', function () {
    // تتبع الزيارة
    tracker.trackPageVisit();

    // جلب البيانات عند تحميل الصفحة
    fetchWorkers();

    // البحث بالاسم (مع Debounce)
    const searchInput = document.getElementById('search-name');
    if (searchInput) {
        searchInput.addEventListener('input', debouncedFilter);
    }

    // البحث بالمهنة
    const jobFilter = document.getElementById('filter-job');
    if (jobFilter) {
        jobFilter.addEventListener('change', applyFilters);
    }

    // مسح الفلترة
    const clearBtn = document.getElementById('clear-filters');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearFilters);
    }

    // ==========================================
    // معالجة نموذج إضافة الحرفي
    // ==========================================

    handleWorkerFormInIndex();
});

// ==========================================
// معالجة نموذج إضافة الحرفي في الصفحة الرئيسية
// ==========================================

function handleWorkerFormInIndex() {
    const jobSelect = document.getElementById('job-select');
    const jobCustom = document.getElementById('job-custom');
    const form = document.getElementById('add-worker-form');

    // معالجة اختيار المهنة
    if (jobSelect && jobCustom) {
        jobSelect.addEventListener('change', function () {
            if (this.value === 'other') {
                jobCustom.classList.remove('hidden');
                jobCustom.setAttribute('required', 'required');
                jobCustom.focus();
            } else {
                jobCustom.classList.add('hidden');
                jobCustom.removeAttribute('required');
                jobCustom.value = '';
            }
        });
    }

    // معالجة نموذج التسجيل
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn = document.getElementById('submit-btn');
            const originalHTML = btn.innerHTML;

            // جمع البيانات
            const formData = {
                name: document.getElementById('name').value.trim(),
                job: getJobValueFromForm(),
                location: document.getElementById('location').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                phone_other: document.getElementById('phone-other').value.trim() || null,
                profileFile: document.getElementById('profile-image').files[0],
                workFile: document.getElementById('work-image').files[0]
            };

            // التحقق من البيانات
            if (!formData.name || !formData.job || !formData.location) {
                showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
                return;
            }

            if (!validatePhone(formData.phone)) {
                showToast('رقم الهاتف يجب أن يبدأ بـ 01 ويكون 11 رقم', 'error');
                return;
            }

            // التحقق من الهاتف الإضافي إن وجد
            if (formData.phone_other && !validatePhone(formData.phone_other)) {
                showToast('رقم الهاتف الإضافي يجب أن يبدأ بـ 01 ويكون 11 رقم', 'error');
                return;
            }

            const profileValidation = validateImage(formData.profileFile);
            if (!profileValidation.valid) {
                showToast(profileValidation.error, 'error');
                return;
            }

            const workValidation = validateImage(formData.workFile);
            if (!workValidation.valid) {
                showToast(workValidation.error, 'error');
                return;
            }

            // تعطيل الزر وإظهار Loader
            btn.disabled = true;
            btn.innerHTML = `
                <svg class="animate-spin h-5 w-5 text-white inline-block ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>جاري الحفظ...</span>
            `;

            try {
                // رفع الصورتين معاً (أسرع)
                const [profileUrl, workUrl] = await Promise.all([
                    uploadImage(formData.profileFile, 'profile'),
                    uploadImage(formData.workFile, 'work')
                ]);

                // حفظ البيانات في قاعدة البيانات
                const { error } = await supabaseClient
                    .from(TABLE_NAME)
                    .insert({
                        name: formData.name,
                        job: formData.job,
                        location: formData.location,
                        phone: formData.phone,
                        phone_other: formData.phone_other,
                        profile_image: profileUrl,
                        work_image: workUrl
                    });

                if (error) throw new Error(`فشل حفظ البيانات: ${error.message}`);

                // نجح التسجيل
                // التمرير للأعلى
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });

                // عرض التنبيه بعد التمرير
                setTimeout(() => {
                    showToast('تم التسجيل بنجاح! ...', 'success');
                }, 500);

                // إعادة تعيين النموذج
                form.reset();
                resetPreviews();

                // تحديث البيانات المعروضة
                fetchWorkers();

                // إعادة تفعيل الزر بعد النجاح
                btn.disabled = false;
                btn.innerHTML = originalHTML;

            } catch (err) {
                console.error('خطأ في التسجيل:', err);
                showToast(err.message || 'حدث خطأ أثناء التسجيل', 'error');

                btn.disabled = false;
                btn.innerHTML = originalHTML;
            }
        });
    }

    // معالجة رقم الهاتف
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function () {
            this.value = this.value.replace(/[^0-9]/g, '').slice(0, 11);
        });
    }

    // معاينة الصور
    setupImagePreview('profile-image', 'profile-preview-img', 'profile-preview-area');
    setupImagePreview('work-image', 'work-preview-img', 'work-preview-area');
}

// دالة للحصول على قيمة المهنة من النموذج
function getJobValueFromForm() {
    const jobSelect = document.getElementById('job-select');
    const jobCustom = document.getElementById('job-custom');

    if (!jobSelect) return '';

    if (jobSelect.value === 'other') {
        return jobCustom ? jobCustom.value.trim() : '';
    }
    return jobSelect.value;
}
// ==========================================
// نظام تتبع الزيارات والتواصل
// ==========================================

class VisitorTracker {
    constructor() {
        this.visitorId = this.getOrCreateVisitorId();
    }

    getOrCreateVisitorId() {
        let visitorId = localStorage.getItem('visitor_id');
        if (!visitorId) {
            visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('visitor_id', visitorId);
        }
        return visitorId;
    }

    // تسجيل زيارة جديدة
    async trackPageVisit() {
        try {
            const { error } = await supabaseClient.from('visits').insert({
                visitor_id: this.visitorId,
                page_url: window.location.pathname
            });

            if (error) console.error('خطأ في تسجيل الزيارة:', error);

            // تحديث الزائر النشط
            await this.updateActiveVisitor();
        } catch (err) {
            console.error('خطأ في trackPageVisit:', err);
        }
    }

    // تحديث حالة الزائر النشط
    async updateActiveVisitor() {
        try {
            await supabaseClient.from('active_visitors').upsert(
                {
                    visitor_id: this.visitorId,
                    last_seen: new Date().toISOString(),
                    page_url: window.location.pathname
                },
                { onConflict: 'visitor_id' }
            );
        } catch (err) {
            console.error('خطأ في updateActiveVisitor:', err);
        }
    }

    // تسجيل نقرة تواصل
    async trackContactClick(workerId, workerName, workerPhone) {
        try {
            const { error } = await supabaseClient.from('contact_clicks').insert({
                visitor_id: this.visitorId,
                worker_id: workerId,
                worker_name: workerName,
                worker_phone: workerPhone
            });

            if (error) console.error('خطأ في تسجيل التواصل:', error);
        } catch (err) {
            console.error('خطأ في trackContactClick:', err);
        }
    }

    // إيقاف التتبع عند مغادرة الصفحة
    async stopTracking() {
        try {
            await supabaseClient
                .from('active_visitors')
                .delete()
                .eq('visitor_id', this.visitorId);
        } catch (err) {
            console.error('خطأ في stopTracking:', err);
        }
    }
}

// إنشاء instance للتتبع
const tracker = new VisitorTracker();

// إضافة event listeners لأزرار التواصل
document.addEventListener('click', (e) => {
    const contactLink = e.target.closest('a[href^="tel:"]');
    if (contactLink) {
        const workerId = contactLink.closest('.service-card')?.dataset.workerId;
        const workerName = contactLink.closest('.service-card')?.dataset.workerName;
        const workerPhone = contactLink.href.replace('tel:', '');

        if (workerName && workerPhone) {
            tracker.trackContactClick(
                workerId || null,
                workerName,
                workerPhone
            );
        }
    }
});

// إيقاف التتبع عند مغادرة الصفحة
window.addEventListener('beforeunload', () => {
    tracker.stopTracking();
});