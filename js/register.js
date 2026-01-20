// ==========================================
// ملف التسجيل - صفحة registration.html
// ==========================================

const TABLE_NAME = 'workers';

// متغيرات عامة
let jobSelect, jobCustom, form, phoneInput;

// ==========================================
// تهيئة الصفحة
// ==========================================

document.addEventListener('DOMContentLoaded', function () {
    // الحصول على العناصر
    jobSelect = document.getElementById('job-select');
    jobCustom = document.getElementById('job-custom');
    form = document.getElementById('add-worker-form');
    phoneInput = document.getElementById('phone');

    // ==========================================
    // معالجة المهنة - Dropdown + Custom Input
    // ==========================================

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

    // ==========================================
    // التحقق من رقم الهاتف أثناء الكتابة
    // ==========================================

    if (phoneInput) {
        phoneInput.addEventListener('input', function () {
            this.value = this.value.replace(/[^0-9]/g, '').slice(0, 11);
        });
    }

    // ==========================================
    // معاينة الصور
    // ==========================================

    setupImagePreview('profile-image', 'profile-preview-img', 'profile-preview-area');
    setupImagePreview('work-image', 'work-preview-img', 'work-preview-area');

    // ==========================================
    // معالجة نموذج التسجيل
    // ==========================================

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn = document.getElementById('submit-btn');
            const originalHTML = btn.innerHTML;

            // جمع البيانات
            const formData = {
                name: document.getElementById('name').value.trim(),
                job: getJobValue(),
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
                showToast('تم التسجيل بنجاح! ✅...', 'success');

                // إعادة تعيين النموذج
                form.reset();
                resetPreviews();

                // إعادة تفعيل الزر
                btn.disabled = false;
                btn.innerHTML = originalHTML;

                // إعادة توجيه للصفحة الرئيسية
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);

            } catch (err) {
                console.error('خطأ في التسجيل:', err);
                showToast(err.message || 'حدث خطأ أثناء التسجيل', 'error');

                btn.disabled = false;
                btn.innerHTML = originalHTML;
            }
        });
    }
});

// ==========================================
// دوال مساعدة
// ==========================================

function getJobValue() {
    if (!jobSelect) return '';
    if (jobSelect.value === 'other') {
        return jobCustom ? jobCustom.value.trim() : '';
    }
    return jobSelect.value;
}
