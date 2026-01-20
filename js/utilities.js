// ==========================================
// دوال مشتركة لجميع الملفات
// ==========================================

// ==========================================
// Splash Screen Handler
// ==========================================

function initSplashScreen() {
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
        // إزالة الـ splash screen بشكل فوري بعد انتهاء حركة الصورة
        setTimeout(() => {
            splashScreen.classList.add('hidden');
        }, 1500);
    }
}

// استدعاء الـ splash screen عند تحميل الصفحة
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSplashScreen);
} else {
    initSplashScreen();
}

// ==========================================
// 0. Image Modal (Lightbox)
// ==========================================

document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    const modalClose = document.getElementById('modal-close');
    const modalPrev = document.getElementById('modal-prev');
    const modalNext = document.getElementById('modal-next');

    if (!modal) return;

    let currentImages = [];
    let currentIndex = 0;
    let currentCard = null;

    // فتح Modal عند الضغط على الصورة
    document.addEventListener('click', function (e) {
        if (e.target.closest('[data-image]')) {
            const clickedElement = e.target.closest('[data-image]');
            const imageSrc = clickedElement.getAttribute('data-image');

            // الحصول على البطاقة الأب (service-card)
            currentCard = clickedElement.closest('.service-card');

            // جمع الصور من نفس البطاقة فقط
            if (currentCard) {
                currentImages = Array.from(currentCard.querySelectorAll('[data-image]')).map(el => el.getAttribute('data-image'));
                currentIndex = currentImages.indexOf(imageSrc);
            } else {
                // في حالة صور الملف الشخصي في النموذج
                currentImages = [imageSrc];
                currentIndex = 0;
            }

            modalImage.src = imageSrc;
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    });

    // إغلاق Modal
    function closeModal() {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    // الصورة السابقة
    if (modalPrev) {
        modalPrev.addEventListener('click', function () {
            if (currentImages.length > 1) {
                currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
                modalImage.src = currentImages[currentIndex];
            }
        });
    }

    // الصورة التالية
    if (modalNext) {
        modalNext.addEventListener('click', function () {
            if (currentImages.length > 1) {
                currentIndex = (currentIndex + 1) % currentImages.length;
                modalImage.src = currentImages[currentIndex];
            }
        });
    }

    // إغلاق عند الضغط على خلفية سوداء
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // التنقل بلوحة المفاتيح
    document.addEventListener('keydown', function (e) {
        if (modal.classList.contains('hidden')) return;

        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowLeft' && modalPrev && currentImages.length > 1) modalPrev.click();
        if (e.key === 'ArrowRight' && modalNext && currentImages.length > 1) modalNext.click();
    });
});

// ==========================================
// 1. زر Scroll to Top
// ==========================================

document.addEventListener('DOMContentLoaded', function () {
    const scrollToTopBtn = document.getElementById('scroll-to-top');

    if (!scrollToTopBtn) return;

    // إظهار الزر عند التمرير لأسفل
    window.addEventListener('scroll', function () {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.remove('opacity-0', '-translate-y-20', 'pointer-events-none');
            scrollToTopBtn.classList.add('opacity-100', 'translate-y-0');
        } else {
            scrollToTopBtn.classList.add('opacity-0', '-translate-y-20', 'pointer-events-none');
            scrollToTopBtn.classList.remove('opacity-100', 'translate-y-0');
        }
    });

    // التمرير للأعلى عند الضغط
    scrollToTopBtn.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});

// ==========================================
// 2. عرض الإشعارات (Toast)
// ==========================================

function showToast(msg, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed top-0 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-3 pt-6';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';

    toast.className = `flex items-center gap-3 ${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl min-w-[320px] transform -translate-y-32 opacity-0 transition-all duration-500 ease-out`;
    toast.innerHTML = `
        <i class="fa-solid fa-${icon} text-2xl"></i>
        <span class="font-bold text-base flex-1">${msg}</span>
    `;

    container.appendChild(toast);

    // ظهور التنبيه من الأعلى بنزول
    setTimeout(() => {
        toast.classList.remove('-translate-y-32', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');
    }, 10);

    // اختفاء التنبيه بعد 3 ثواني
    setTimeout(() => {
        toast.classList.add('-translate-y-32', 'opacity-0');
        setTimeout(() => toast.remove(), 500);
    }, 3500);
}

// ==========================================
// 2. تحريك العداد
// ==========================================

function animateCounter(element, targetValue) {
    const duration = 1000;
    const startValue = 0;
    const startTime = performance.now();

    function updateCounter(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        const currentValue = Math.floor(progress * targetValue);
        element.textContent = currentValue;

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = targetValue;
        }
    }

    requestAnimationFrame(updateCounter);
}

// ==========================================
// 3. معاينة الصور
// ==========================================

function setupImagePreview(inputId, previewImgId, previewAreaId) {
    const input = document.getElementById(inputId);
    const previewImg = document.getElementById(previewImgId);
    const previewArea = document.getElementById(previewAreaId);

    if (!input) return; // تجنب الخطأ إذا كان العنصر غير موجود

    input.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (!file) return;

        // التحقق من الصورة
        const validation = validateImage(file);
        if (!validation.valid) {
            showToast(validation.error, 'error');
            input.value = '';
            return;
        }

        // عرض المعاينة
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            previewImg.classList.remove('hidden');
            if (previewArea) previewArea.classList.add('opacity-0');
        };
        reader.readAsDataURL(file);
    });
}

// ==========================================
// 4. إعادة تعيين معاينة الصور
// ==========================================

function resetPreviews() {
    const profilePreview = document.getElementById('profile-preview-img');
    const profileArea = document.getElementById('profile-preview-area');
    const workPreview = document.getElementById('work-preview-img');
    const workArea = document.getElementById('work-preview-area');

    if (profilePreview) profilePreview.classList.add('hidden');
    if (profileArea) profileArea.classList.remove('opacity-0');
    if (workPreview) workPreview.classList.add('hidden');
    if (workArea) workArea.classList.remove('opacity-0');
}

// ==========================================
// 5. التحقق من صحة الصور
// ==========================================

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

function validateImage(file) {
    if (!file) {
        return { valid: false, error: 'يرجى اختيار الصورة' };
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return { valid: false, error: 'نوع الملف غير مدعوم. استخدم JPG أو PNG' };
    }

    if (file.size > MAX_FILE_SIZE) {
        return { valid: false, error: 'حجم الصورة يجب أن يكون أقل من 5MB' };
    }

    return { valid: true };
}

// ==========================================
// 6. التحقق من صحة الهاتف
// ==========================================

function validatePhone(phone) {
    return phone.length === 11 && phone.startsWith('01');
}

// ==========================================
// 7. رفع الصور إلى Supabase
// ==========================================

async function uploadImage(file, folder) {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop();
    const fileName = `${folder}/${timestamp}_${randomStr}.${extension}`;

    const { error } = await supabaseClient.storage
        .from('users-images')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) throw new Error(`فشل رفع الصورة: ${error.message}`);

    const { data: { publicUrl } } = supabaseClient.storage
        .from('users-images')
        .getPublicUrl(fileName);

    return publicUrl;
}

// ==========================================
// 8. Debounce Function
// ==========================================

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// ==========================================
// 9. Image Edit Button Management
// ==========================================

function setupImageEditButtons() {
    // Profile Image
    const profileImg = document.getElementById('profile-preview-img');
    const profileEditBtn = document.getElementById('profile-edit-btn');
    const profileInput = document.getElementById('profile-image');
    const profilePreviewArea = document.getElementById('profile-preview-area');

    if (profileImg && profileEditBtn && profileInput) {
        // إظهار الزر عند عرض الصورة
        const profileObserver = new MutationObserver(function () {
            if (profileImg.classList.contains('hidden')) {
                profileEditBtn.classList.add('hidden', 'opacity-0', 'translate-y-4');
                profileEditBtn.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
            } else {
                profileEditBtn.classList.remove('hidden', 'opacity-0', 'translate-y-4');
                profileEditBtn.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
            }
        });

        profileObserver.observe(profileImg, { attributes: true, attributeFilter: ['class'] });

        // عند الضغط على الزر، اضغط على input الملف
        profileEditBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            profileInput.click();
        });

        // إعادة تعيين الزر عند إزالة الصورة
        profileInput.addEventListener('change', function () {
            if (this.files.length === 0) {
                profileImg.classList.add('hidden');
                profilePreviewArea.classList.remove('hidden');
            }
        });
    }

    // Work Image
    const workImg = document.getElementById('work-preview-img');
    const workEditBtn = document.getElementById('work-edit-btn');
    const workInput = document.getElementById('work-image');
    const workPreviewArea = document.getElementById('work-preview-area');

    if (workImg && workEditBtn && workInput) {
        // إظهار الزر عند عرض الصورة
        const workObserver = new MutationObserver(function () {
            if (workImg.classList.contains('hidden')) {
                workEditBtn.classList.add('hidden', 'opacity-0', 'translate-y-4');
                workEditBtn.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
            } else {
                workEditBtn.classList.remove('hidden', 'opacity-0', 'translate-y-4');
                workEditBtn.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
            }
        });

        workObserver.observe(workImg, { attributes: true, attributeFilter: ['class'] });

        // عند الضغط على الزر، اضغط على input الملف
        workEditBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            workInput.click();
        });

        // إعادة تعيين الزر عند إزالة الصورة
        workInput.addEventListener('change', function () {
            if (this.files.length === 0) {
                workImg.classList.add('hidden');
                workPreviewArea.classList.remove('hidden');
            }
        });
    }
}

// استدعاء الدالة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', setupImageEditButtons);

// ==========================================
// 10. تحديث شعار Navbar
// ==========================================

function updateNavbarLogo(imageUrl) {
    const navbarLogo = document.getElementById('navbar-logo');
    if (navbarLogo && imageUrl) {
        navbarLogo.innerHTML = `<img src="${imageUrl}" alt="شعار" class="w-full h-full object-cover rounded-full">`;
    }
}

// تحديث الشعار عند عرض صورة في الـ form
document.addEventListener('DOMContentLoaded', function () {
    const profileImg = document.getElementById('profile-preview-img');
    if (profileImg) {
        const observer = new MutationObserver(function () {
            if (!profileImg.classList.contains('hidden') && profileImg.src) {
                updateNavbarLogo(profileImg.src);
            }
        });
        observer.observe(profileImg, { attributes: true, attributeFilter: ['class', 'src'] });
    }
});
