/* =====================================================
   SUPABASE CONFIG
   ===================================================== */

const SUPABASE_URL = "https://zmgsforefkyxmftuczpz.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_qc8AZryLZDjNz6ZITLACug_-E2OOxnt";


const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    }
);


/* =====================================================
   MENU MOBILE
   ===================================================== */

const menu = document.querySelector(".menu-toggle");
const nav = document.querySelector(".site-header nav");

if (menu && nav) {

    menu.addEventListener("click", () => {
        nav.classList.toggle("open");
    });

}


/* =====================================================
   LỌC CÔNG TRÌNH
   ===================================================== */

document.querySelectorAll(".filter").forEach(btn => {

    btn.addEventListener("click", () => {

        // Xóa active ở tất cả nút
        document.querySelectorAll(".filter").forEach(b => {
            b.classList.remove("active");
        });


        // Thêm active ở nút đang chọn
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

    const scrollImages =
        document.querySelectorAll(".scroll-image");


    if (!scrollImages.length) {
        return;
    }


    const imageObserver =
        new IntersectionObserver(
            function (entries) {

                entries.forEach(function (entry) {

                    if (entry.isIntersecting) {

                        entry.target.classList.add(
                            "is-visible"
                        );


                        /*
                         * Chỉ chạy một lần.
                         * Sau khi hiện sẽ không bị ẩn lại.
                         */

                        imageObserver.unobserve(
                            entry.target
                        );

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


/* =====================================================
   SUPABASE AUTH UI
   ===================================================== */

const authModal =
    document.getElementById("auth-modal");

const loginView =
    document.getElementById("login-view");

const registerView =
    document.getElementById("register-view");

const loginButton =
    document.getElementById("login-button");

const registerButton =
    document.getElementById("register-button");

const authClose =
    document.getElementById("auth-close");

const showRegister =
    document.getElementById("show-register");

const showLogin =
    document.getElementById("show-login");

const guestAuth =
    document.getElementById("guest-auth");

const userMenu =
    document.getElementById("user-menu");

const userTrigger =
    document.getElementById("user-trigger");

const userDropdown =
    document.getElementById("user-dropdown");

const userEmail =
    document.getElementById("user-email");

const logoutButton =
    document.getElementById("logout-button");

const loginForm =
    document.getElementById("login-form");

const registerForm =
    document.getElementById("register-form");

const loginMessage =
    document.getElementById("login-message");

const registerMessage =
    document.getElementById("register-message");

const loginSubmit =
    document.getElementById("login-submit");

const registerSubmit =
    document.getElementById("register-submit");


/* =====================================================
   AUTH MODAL
   ===================================================== */

function openAuthModal(mode = "login") {

    if (!authModal) {
        return;
    }

    authModal.classList.add("show");
    authModal.setAttribute("aria-hidden", "false");

    clearAuthMessages();

    if (mode === "register") {

        showRegisterView();

    } else {

        showLoginView();

    }

}


function closeAuthModal() {

    if (!authModal) {
        return;
    }

    authModal.classList.remove("show");
    authModal.setAttribute("aria-hidden", "true");

    clearAuthMessages();

}


function showLoginView() {

    if (!loginView || !registerView) {
        return;
    }

    loginView.style.display = "block";
    registerView.style.display = "none";

    clearAuthMessages();

}


function showRegisterView() {

    if (!loginView || !registerView) {
        return;
    }

    loginView.style.display = "none";
    registerView.style.display = "block";

    clearAuthMessages();

}


function clearAuthMessages() {

    if (loginMessage) {
        loginMessage.textContent = "";
        loginMessage.className = "auth-message";
    }

    if (registerMessage) {
        registerMessage.textContent = "";
        registerMessage.className = "auth-message";
    }

}


/* =====================================================
   MESSAGE
   ===================================================== */

function showMessage(element, message, type = "error") {

    if (!element) {
        return;
    }

    element.textContent = message;
    element.className = "auth-message " + type;

}


/* =====================================================
   OPEN LOGIN / REGISTER
   ===================================================== */

if (loginButton) {

    loginButton.addEventListener("click", () => {

        openAuthModal("login");

    });

}


if (registerButton) {

    registerButton.addEventListener("click", () => {

        openAuthModal("register");

    });

}


if (showRegister) {

    showRegister.addEventListener("click", () => {

        showRegisterView();

    });

}


if (showLogin) {

    showLogin.addEventListener("click", () => {

        showLoginView();

    });

}


if (authClose) {

    authClose.addEventListener("click", () => {

        closeAuthModal();

    });

}


/* =====================================================
   CLICK OUTSIDE MODAL
   ===================================================== */

if (authModal) {

    authModal.addEventListener("click", (event) => {

        if (event.target === authModal) {

            closeAuthModal();

        }

    });

}


/* =====================================================
   ESC TO CLOSE
   ===================================================== */

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {

        closeAuthModal();

        if (userDropdown) {
            userDropdown.classList.remove("show");
        }

    }

});


/* =====================================================
   LOGIN
   ===================================================== */

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email =
            document.getElementById("login-email")
                ?.value
                .trim();

        const password =
            document.getElementById("login-password")
                ?.value;


        if (!email || !password) {

            showMessage(
                loginMessage,
                "Vui lòng nhập email và mật khẩu."
            );

            return;

        }


        loginSubmit.disabled = true;
        loginSubmit.textContent = "Đang đăng nhập...";

        clearAuthMessages();


        try {

            const {
                data,
                error
            } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });


            if (error) {

                console.error(
                    "Supabase login error:",
                    error
                );

                showMessage(
                    loginMessage,
                    getAuthErrorMessage(error)
                );

                return;

            }


            if (data?.user) {

    showMessage(
        loginMessage,
        "Đăng nhập thành công!",
        "success"
    );

    // Kích hoạt / kiểm tra thiết bị
    await activateCurrentDevice();

    setTimeout(() => {
        closeAuthModal();
    }, 500);
}
        } catch (error) {

            console.error(error);

            showMessage(
                loginMessage,
                "Có lỗi xảy ra. Vui lòng thử lại."
            );

        } finally {

            loginSubmit.disabled = false;
            loginSubmit.textContent = "Đăng nhập";

        }

    });

}


/* =====================================================
   REGISTER
   ===================================================== */

if (registerForm) {

    registerForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        const email =
            document.getElementById("register-email")
                ?.value
                .trim();

        const password =
            document.getElementById("register-password")
                ?.value;

        const confirmPassword =
            document.getElementById("register-password-confirm")
                ?.value;


        clearAuthMessages();


        if (!email || !password || !confirmPassword) {

            showMessage(
                registerMessage,
                "Vui lòng nhập đầy đủ thông tin."
            );

            return;

        }


        if (password.length < 6) {

            showMessage(
                registerMessage,
                "Mật khẩu phải có ít nhất 6 ký tự."
            );

            return;

        }


        if (password !== confirmPassword) {

            showMessage(
                registerMessage,
                "Mật khẩu nhập lại không khớp."
            );

            return;

        }


        registerSubmit.disabled = true;
        registerSubmit.textContent = "Đang tạo tài khoản...";


        try {

            const fullName =
    document.getElementById("register-name")
        ?.value
        .trim();

const {
    data,
    error
} = await supabaseClient.auth.signUp({
    email: email,
    password: password,

    options: {
        data: {
            full_name: fullName
        },

        emailRedirectTo:
    "https://minhvuongarch.io.vn/"
    }
});


            if (error) {

                console.error(
                    "Supabase register error:",
                    error
                );

                showMessage(
                    registerMessage,
                    getAuthErrorMessage(error)
                );

                return;
             /* =====================================================
   LICENSE + DEVICE ACTIVATION
   ===================================================== */
console.log("✅ File Device đã được load");
async function activateCurrentDevice() {

    console.log("🚀 activateCurrentDevice đã được gọi");


    try {

        // Kiểm tra user đang đăng nhập
        const {
            data: userData,
            error: userError
        } = await supabaseClient.auth.getUser();

        if (userError || !userData?.user) {
            console.log(
                "Chưa đăng nhập, không kích hoạt device."
            );
            return;
        }

        const user = userData.user;

        console.log(
            "User hiện tại:",
            user.email
        );

        // ================================================
        // Lấy License của user
        // ================================================

        const {
            data: licenses,
            error: licenseError
        } = await supabaseClient.rpc(
            "get_my_license"
        );

        if (licenseError) {

            console.error(
                "Không lấy được License:",
                licenseError
            );

            return;
        }

        const license = licenses?.[0];

        if (!license) {

            console.log(
                "Tài khoản chưa có License."
            );

            return;
        }

        console.log(
            "License:",
            license.license_key
        );

        // ================================================
        // Tạo ID cho thiết bị
        // ================================================

        let deviceId =
            localStorage.getItem(
                "minhvuong_device_id"
            );

        if (!deviceId) {

            deviceId =
                crypto.randomUUID();

            localStorage.setItem(
                "minhvuong_device_id",
                deviceId
            );
        }

        // ================================================
        // Tên thiết bị
        // ================================================

        const deviceName =
            "Web - " +
            navigator.platform;

        console.log(
            "Device ID:",
            deviceId
        );

        // ================================================
        // Kích hoạt Device
        // ================================================

        const {
            data,
            error
        } = await supabaseClient.rpc(
            "activate_device",
            {
                p_license_id: license.id,
                p_device_id: deviceId,
                p_device_name: deviceName
            }
        );

        if (error) {

            console.error(
                "Kích hoạt thiết bị thất bại:",
                error
            );

            alert(
                "Không thể kích hoạt thiết bị:\n\n" +
                error.message
            );

            return;
        }

        console.log(
            "Thiết bị đã được kích hoạt:",
            data
        );

        console.log(
            "License:",
            license.license_key
        );

        console.log(
            "Thiết bị tối đa:",
            license.max_devices
        );

    } catch (error) {

        console.error(
            "Device activation error:",
            error
        );
    }
}  

            }


            /*
             * Nếu Supabase yêu cầu xác nhận email,
             * session có thể chưa xuất hiện ngay.
             */

            if (data?.user && !data?.session) {

                showMessage(
                    registerMessage,
                    "Đăng ký thành công! Hãy kiểm tra email để xác nhận tài khoản.",
                    "success"
                );

            } else {

                showMessage(
                    registerMessage,
                    "Đăng ký thành công!",
                    "success"
                );

            }


            registerForm.reset();


        } catch (error) {

            console.error(error);

            showMessage(
                registerMessage,
                "Có lỗi xảy ra. Vui lòng thử lại."
            );

        } finally {

            registerSubmit.disabled = false;
            registerSubmit.textContent = "Đăng ký";

        }

    });

}


/* =====================================================
   USER MENU
   ===================================================== */

if (userTrigger) {

    userTrigger.addEventListener("click", (event) => {

        event.stopPropagation();

        if (userDropdown) {

            userDropdown.classList.toggle("show");

        }

    });

}


document.addEventListener("click", (event) => {

    if (
        userMenu &&
        !userMenu.contains(event.target)
    ) {

        if (userDropdown) {

            userDropdown.classList.remove("show");

        }

    }

});


/* =====================================================
   LOGOUT
   ===================================================== */

if (logoutButton) {

    logoutButton.addEventListener("click", async () => {

        logoutButton.disabled = true;
        logoutButton.textContent = "Đang đăng xuất...";


        try {

            const {
                error
            } = await supabaseClient.auth.signOut();


            if (error) {

                console.error(
                    "Supabase logout error:",
                    error
                );

                alert(
                    "Không thể đăng xuất. Vui lòng thử lại."
                );

            }

        } catch (error) {

            console.error(error);

            alert(
                "Có lỗi xảy ra khi đăng xuất."
            );

        } finally {

            logoutButton.disabled = false;
            logoutButton.textContent = "Đăng xuất";

        }

    });

}


/* =====================================================
   UPDATE AUTH UI
   ===================================================== */

function updateAuthUI(user) {

    if (!guestAuth || !userMenu) {
        return;
    }


    if (user) {

        // Đã đăng nhập
        guestAuth.style.display = "none";

        userMenu.classList.add("show");

        const email =
            user.email || "Tài khoản";

        if (userEmail) {

            userEmail.textContent = email;

        }

        if (userTrigger) {

            userTrigger.textContent =
                "👤 " + email;

        }


    } else {

        // Chưa đăng nhập
        guestAuth.style.display = "flex";

        userMenu.classList.remove("show");

        if (userDropdown) {

            userDropdown.classList.remove("show");

        }

        if (userEmail) {

            userEmail.textContent = "—";

        }

        if (userTrigger) {

            userTrigger.textContent =
                "Tài khoản";

        }

    }

}


/* =====================================================
   SUPABASE AUTH STATE
   ===================================================== */

supabaseClient.auth.onAuthStateChange(
    (event, session) => {

        console.log(
            "Supabase Auth:",
            event
        );

        updateAuthUI(
            session?.user || null
        );

        if (session?.user) {

            setTimeout(() => {
                activateCurrentDevice();
            }, 0);

        }

    }
);


/* =====================================================
   LOAD CURRENT SESSION
   ===================================================== */

async function loadCurrentUser() {

    try {

        const {
            data,
            error
        } = await supabaseClient.auth.getSession();


        if (error) {

            console.error(
                "Get session error:",
                error
            );

            updateAuthUI(null);

            return;

        }


        updateAuthUI(
            data?.session?.user || null
        );


    } catch (error) {

        console.error(error);

        updateAuthUI(null);

    }

}


loadCurrentUser();


/* =====================================================
   AUTH ERROR MESSAGE
   ===================================================== */

function getAuthErrorMessage(error) {

    if (!error) {
        return "Có lỗi xảy ra.";
    }


    const message =
        (error.message || "").toLowerCase();


    if (
        message.includes("invalid login credentials")
    ) {

        return "Email hoặc mật khẩu không chính xác.";

    }


    if (
        message.includes("email not confirmed")
    ) {

        return "Email chưa được xác nhận. Hãy kiểm tra hộp thư.";

    }


    if (
        message.includes("user already registered")
    ) {

        return "Email này đã được đăng ký.";

    }


    if (
        message.includes("password should be at least")
    ) {

        return "Mật khẩu chưa đủ độ dài.";

    }


    if (
        message.includes("rate limit")
    ) {

        return "Bạn thao tác quá nhiều lần. Vui lòng thử lại sau.";

    }


    return error.message || "Có lỗi xảy ra. Vui lòng thử lại.";

}