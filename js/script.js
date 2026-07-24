// ============================
// Navbar Scroll
// ============================

const navbar = document.getElementById("navbar");

window.addEventListener("scroll", () => {

    if(window.scrollY > 30){

        navbar.classList.add("scrolled");

    }

    else{

        navbar.classList.remove("scrolled");

    }

});

// ============================
// Mobile Menu
// ============================

const menuBtn = document.getElementById("menuBtn");

const mobileMenu = document.getElementById("mobileMenu");

menuBtn.addEventListener("click",()=>{

    mobileMenu.classList.toggle("active");

});
// ============================
// Hero Dashboard Animations
// ============================

(function () {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Chart line draws itself in
    const chartLine = document.querySelector(".chart-line");

    if (chartLine && !reduceMotion) {
        const length = chartLine.getTotalLength();
        chartLine.style.strokeDasharray = length;
        chartLine.style.strokeDashoffset = length;
        chartLine.getBoundingClientRect(); // force reflow before transition starts
        chartLine.style.transition = "stroke-dashoffset 2s cubic-bezier(.65,0,.35,1) .5s";

        requestAnimationFrame(() => {
            chartLine.style.strokeDashoffset = "0";
        });
    }

    // KPI numbers count up
    function animateCountUp(el, duration) {
        const text = el.textContent.trim();
        const match = text.match(/^([^\d]*)([\d.,]+)([^\d]*)$/);
        if (!match) return;

        const [, prefix, numStr, suffix] = match;
        const target = parseFloat(numStr.replace(/,/g, ""));
        const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0;
        const start = performance.now();

        function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    if (!reduceMotion) {
        document.querySelectorAll(".kpi-card h2").forEach((el, i) => {
            setTimeout(() => animateCountUp(el, 1300), 700 + i * 150);
        });
    }
})();
// ============================
// Industries Section Animations
// ============================
(function () {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cards = document.querySelectorAll(".industry-card");
    if (!cards.length || reduceMotion) return;

    function animateCountUp(el, duration) {
        const text = el.textContent.trim();
        const match = text.match(/^([^\d]*)([\d.,]+)([^\d]*)$/);
        if (!match) return;
        const [, prefix, numStr, suffix] = match;
        const target = parseFloat(numStr.replace(/,/g, ""));
        const decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0;
        const hasComma = numStr.includes(",");
        const start = performance.now();
        function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = target * eased;
            const formatted = hasComma
                ? value.toLocaleString("en-IN", { maximumFractionDigits: decimals, minimumFractionDigits: decimals })
                : value.toFixed(decimals);
            el.textContent = prefix + formatted + suffix;
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const card = entry.target;
            if (card.dataset.animated) return;
            card.dataset.animated = "true";

            // Draw mini chart line
            const line = card.querySelector(".mini-chart-line");
            if (line) {
                const length = line.getTotalLength();
                line.style.strokeDasharray = length;
                line.style.strokeDashoffset = length;
                line.getBoundingClientRect();
                line.style.transition = "stroke-dashoffset 1.4s cubic-bezier(.65,0,.35,1) .1s";
                requestAnimationFrame(() => {
                    line.style.strokeDashoffset = "0";
                });
            }

            // Count up the stat
            const statEl = card.querySelector(".industry-stat h2");
            if (statEl) animateCountUp(statEl, 1100);

            observer.unobserve(card);
        });
    }, { threshold: 0.4 });

    cards.forEach((card) => observer.observe(card));
})();
// ============================
// Process — PCB Circuit (ball-driven note sync)
// ============================
(function () {

    const stepNotes = [
        { index: "01", text: `Most "ad problems" are actually audience-research problems. I start here before touching a single creative.` },
        { index: "02", text: `If the offer doesn't convert cold traffic, no landing page fixes it. This is where I check first.` },
        { index: "03", text: `Beautiful pages that load slow or don't match ad intent quietly kill conversion rate.` },
        { index: "04", text: `Wrong hook, not wrong budget — usually the real fix at this stage.` },
        { index: "05", text: `Leads go cold within 48 hours without a follow-up sequence. This is the leak nobody notices.` },
        { index: "06", text: `You can't optimize what you're not measuring correctly. Half of "bad campaigns" are bad tracking.` },
        { index: "07", text: `Optimization isn't a one-time task — it's the loop that keeps the whole system honest.` }
    ];

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const pathDesktop = document.getElementById("circuitPathDesktop");
    const pathMobile = document.getElementById("circuitPathMobile");
    const ballDesktop = document.getElementById("circuitBallDesktop");
    const ballMobile = document.getElementById("circuitBallMobile");
    const noteEl = document.getElementById("circuitNote");

    if (!pathDesktop || !pathMobile || !noteEl) return;

    const indexEl = noteEl.querySelector(".note-index");
    const textEl = noteEl.querySelector(".note-text");

    const lenDesktop = pathDesktop.getTotalLength();
    const lenMobile = pathMobile.getTotalLength();

    const allNodes = document.querySelectorAll(".circuit-node, .circuit-node-mobile");

    const DESKTOP_DURATION = 8000;
    const MOBILE_DURATION = 16000; // ms for one full pass
    let lastStep = -1;

    function setActiveStep(step) {
        if (step === lastStep) return;
        lastStep = step;

        allNodes.forEach((n) => {
            n.classList.toggle("active", parseInt(n.dataset.step, 10) === step);
        });

        // sync ball color to the active step's accent (mobile nodes carry --accent)
        const activeMobileNode = document.querySelector(`.circuit-node-mobile[data-step="${step}"]`);
        if (activeMobileNode) {
            const accent = getComputedStyle(activeMobileNode).getPropertyValue("--accent").trim();
            if (accent) {
                ballDesktop.style.setProperty("--ball-color", accent);
                ballMobile.style.setProperty("--ball-color", accent);
            }
        }

        const data = stepNotes[step];
        if (!data) return;
        noteEl.style.opacity = "0";
        setTimeout(() => {
            indexEl.textContent = data.index;
            textEl.textContent = data.text;
            noteEl.style.opacity = "1";
        }, 150);
    }

    function getDuration() {
        return window.matchMedia("(max-width: 768px)").matches ? MOBILE_DURATION : DESKTOP_DURATION;
    }

    function frame(now) {
        const duration = getDuration();
        const progress = (now % duration) / duration; // 0 -> 1
        const step = Math.min(6, Math.floor(progress * 7));

        const pD = pathDesktop.getPointAtLength(progress * lenDesktop);
        ballDesktop.setAttribute("cx", pD.x);
        ballDesktop.setAttribute("cy", pD.y);

        const pM = pathMobile.getPointAtLength(progress * lenMobile);
        ballMobile.setAttribute("cx", pM.x);
        ballMobile.setAttribute("cy", pM.y);

        setActiveStep(step);

        requestAnimationFrame(frame);
    }

    if (reduceMotion) {
        // static first-step state, no animation loop
        setActiveStep(0);
    } else {
        requestAnimationFrame(frame);
    }

    // Scroll reveal
    const revealEls = document.querySelectorAll(".reveal-in");
    if (revealEls.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.25 });

        revealEls.forEach((el) => observer.observe(el));
    }

})();
// ============================
// Work Log — accordion, filters, lightbox
// ============================
(function () {

    // Accordion
    document.querySelectorAll(".work-toggle").forEach((btn) => {
        btn.addEventListener("click", () => {
            const row = btn.closest(".work-row");
            const isOpen = row.classList.contains("is-open");
            row.classList.toggle("is-open");
            btn.setAttribute("aria-expanded", String(!isOpen));
        });
    });

    // Filters
    const filterBtns = document.querySelectorAll(".work-filters .filter-btn");
    const workRows = document.querySelectorAll(".work-row");

    filterBtns.forEach((fb) => {
        fb.addEventListener("click", () => {
            filterBtns.forEach((b) => b.classList.remove("active"));
            fb.classList.add("active");
            const val = fb.dataset.filter;

            workRows.forEach((row) => {
                const plats = row.dataset.platform.split(" ");
                if (val === "all" || plats.indexOf(val) !== -1) {
                    row.classList.remove("hidden");
                } else {
                    row.classList.add("hidden");
                }
            });
        });
    });

    // Lightbox
    const lightbox = document.getElementById("workLightbox");
    const lightboxImg = document.getElementById("workLightboxImg");
    const lightboxClose = document.getElementById("workLightboxClose");

    document.querySelectorAll(".shot-thumb").forEach((btn) => {
        btn.addEventListener("click", () => {
            const img = btn.querySelector("img");
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightbox.classList.add("open");
        });
    });

    function closeLightbox() {
        lightbox.classList.remove("open");
        lightboxImg.src = "";
    }

    if (lightbox) {
        lightbox.addEventListener("click", closeLightbox);
        lightboxClose.addEventListener("click", (e) => {
            e.stopPropagation();
            closeLightbox();
        });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closeLightbox();
        });
    }

})();
// ============================
// Skills — Mesh Network
// ============================
(function () {

    const meshWrap = document.querySelector(".mesh-wrap");
    if (!meshWrap) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
        meshWrap.classList.add("is-visible");
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            meshWrap.classList.add("is-visible");
            observer.unobserve(meshWrap);
        });
    }, { threshold: 0.2 });

    observer.observe(meshWrap);

})();
// ============================
// Experience — Timeline
// ============================
(function () {

    const items = document.querySelectorAll(".timeline-item");
    if (!items.length) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
        items.forEach((el) => el.classList.add("is-visible"));
    } else {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.15 });

        items.forEach((el) => observer.observe(el));
    }

    // Bullet expand/collapse toggle
    const toggle = document.getElementById("restaurantToggle");
    const list = document.getElementById("restaurantBullets");
    if (toggle && list) {
        const extras = list.querySelectorAll(".bullet-extra");
        const toggleText = toggle.querySelector(".toggle-text");

        toggle.addEventListener("click", () => {
            const isOpen = toggle.classList.toggle("is-open");
            extras.forEach((li) => li.classList.toggle("hidden", !isOpen));
            toggleText.textContent = isOpen ? "Show less" : "+5 more responsibilities";
        });
    }

})();
// ============================
// Contact — copy email to clipboard
// ============================
(function () {

    const emailBtn = document.getElementById("emailBtn");
    const emailText = document.getElementById("emailText");
    if (!emailBtn || !emailText) return;

    const email = emailBtn.dataset.email;

    emailBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(email).then(() => {
            const original = emailText.textContent;
            emailText.textContent = "Copied ✓";
            setTimeout(() => {
                emailText.textContent = original;
            }, 1800);
        }).catch(() => {
            // Fallback for browsers blocking clipboard access
            window.location.href = `mailto:${email}`;
        });
    });

})();