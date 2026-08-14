const menu = document.querySelector(".menu-toggle");
const nav = document.querySelector(".site-header nav");

if (menu && nav) {
    menu.addEventListener("click", () => {
        nav.classList.toggle("open");
    });
}


// ================================
// LỌC CÔNG TRÌNH
// ================================

document.querySelectorAll(".filter").forEach(btn => {

    btn.addEventListener("click", () => {

        // Xóa active ở tất cả nút
        document.querySelectorAll(".filter").forEach(b => {
            b.classList.remove("active");
        });

        // Thêm active cho nút đang chọn
        btn.classList.add("active");

        // Lấy loại đang chọn
        const filter = btn.dataset.filter;

        // Hiển thị / ẩn công trình
        document.querySelectorAll(".portfolio-card").forEach(card => {

            if (
                filter === "all" ||
                card.dataset.category === filter
            ) {
                card.style.display = "";
            } else {
                card.style.display = "none";
            }

        });

    });

});
/* =====================================================
   INDEX PAGE - SCROLL IMAGE REVEAL
   ẢNH CHỈ HIỆN KHI LƯỚT XUỐNG
   ĐÃ HIỆN THÌ KHÔNG BIẾN MẤT
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const scrollImages = document.querySelectorAll(".scroll-image");

    if (!scrollImages.length) {
        return;
    }

    const imageObserver = new IntersectionObserver(
        function (entries) {

            entries.forEach(function (entry) {

                if (entry.isIntersecting) {

                    entry.target.classList.add("is-visible");

                    /*
                     * Chỉ chạy một lần.
                     * Sau khi hiện sẽ không bị ẩn lại.
                     */

                    imageObserver.unobserve(entry.target);
                }

            });

        },
        {
            threshold: 0.15
        }
    );


    scrollImages.forEach(function (image) {

        imageObserver.observe(image);

    });

});