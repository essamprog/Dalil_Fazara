function createNavbar(currentPage = 'home') {
    const navbarHTML = `
        <nav class="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md z-[100] border-b border-slate-200 shadow-sm">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <a href="index.html" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div id="navbar-logo" class="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-white flex items-center justify-center shadow-sm border border-slate-200">
                            <img src="images/fazara.png" alt="Dalil Fazzara" class="w-full h-full object-cover">
                        </div>
                        <span class="font-bold text-xl text-dark">Dalil Fazara</span>
                    </a>
                    
                    ${currentPage === 'home' ? `
                        <a href="registration.html"
                            class="bg-primary hover:bg-primaryDark text-white px-5 py-2 rounded-full font-bold transition-all shadow-md flex items-center gap-2 text-sm">
                            <i class="fa-solid fa-plus"></i> 
                            <span>سجل مهنتك</span>
                        </a>
                    ` : `
                        <a href="index.html"
                            class="bg-slate-600 hover:bg-slate-700 text-white px-5 py-2 rounded-full font-bold transition-all shadow-md flex items-center gap-2 text-sm">
                            <i class="fa-solid fa-home"></i> 
                            <span>الصفحة الرئيسية</span>
                        </a>
                    `}
                </div>
            </div>
        </nav>
        <div class="h-16"></div>
    `;

    return navbarHTML;
}

// تحديث شعار الـ Navbar عند رفع صورة
function updateNavbarLogo(imageUrl) {
    const navbarLogo = document.getElementById('navbar-logo');
    if (navbarLogo && imageUrl) {
        navbarLogo.innerHTML = `<img src="${imageUrl}" alt="شعار" class="w-full h-full object-cover">`;
    }
}

// تهيئة Navbar تلقائياً

document.addEventListener('DOMContentLoaded', function () {
    const navbarContainer = document.getElementById('navbar-container');
    if (navbarContainer) {
        const currentPage = navbarContainer.dataset.page || 'home';
        navbarContainer.innerHTML = createNavbar(currentPage);
    }
});