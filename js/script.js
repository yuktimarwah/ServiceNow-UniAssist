/* UniAssist demo routing engine
   Production path: replace analyzeQuestion() with an LLM API call
   that returns the same structured object.
*/
document.addEventListener("DOMContentLoaded", () => {
    const question = document.getElementById("question");
    const analyzeBtn = document.getElementById("analyzeBtn");
    const resultSection = document.getElementById("resultSection");
    const userSummary = document.getElementById("userSummary");
    const concernsEl = document.getElementById("concerns");
    const routeEl = document.getElementById("route");
    const nextStepEl = document.getElementById("nextStep");
    const reasonEl = document.getElementById("reason");
    const priorityBadge = document.getElementById("priorityBadge");
    const supportButtons = document.getElementById("supportButtons");
    const emergencyBanner = document.getElementById("emergencyBanner");
    const welcomeUser = document.getElementById("welcomeUser");
    const logoutBtn = document.getElementById("logoutBtn");

    const user = JSON.parse(localStorage.getItem("uniassistUser") || "null");
    if (!user) {
        window.location.href = "login.html";
        return;
    }
    welcomeUser.textContent = `Hi, ${user.name.split(" ")[0]} · Student Support`;

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("uniassistUser");
        window.location.href = "login.html";
    });

    document.querySelectorAll(".example-chip").forEach(chip => {
        chip.addEventListener("click", () => {
            question.value = chip.dataset.example;
            question.focus();
        });
    });

    function analyzeQuestion(text) {
        const t = text.toLowerCase();

        const emergencyWords = [
            "don't feel safe", "do not feel safe", "unsafe", "immediate danger",
            "hurt myself", "harm myself", "suicide", "kill myself", "self harm",
            "someone is threatening me", "emergency", "danger"
        ];

        if (emergencyWords.some(word => t.includes(word))) {
            return {
                concerns: ["Immediate safety concern"],
                priority: "URGENT",
                route: "Emergency / authorised campus safety support",
                nextStep: "Contact trained human or emergency support immediately.",
                reason: "Your message contains language that may indicate an immediate safety concern, so we do not treat it like a normal appointment request.",
                buttons: ["Contact Emergency Support", "Campus Safety / Security"],
                emergency: true
            };
        }

        const financial = ["fee", "fees", "money", "financial", "afford", "scholarship", "loan", "payment"];
        const hostel = ["hostel", "roommate", "room", "mess", "accommodation", "warden"];
        const academic = ["exam", "assignment", "deadline", "marks", "grade", "attendance", "class", "study", "academic", "concentrate", "concentration", "workload"];
        const wellbeing = ["stress", "stressed", "anxious", "anxiety", "overwhelmed", "sleep", "sad", "lonely", "mental", "burnout", "panic", "worried", "worry"];
        const personal = ["relationship", "friend", "family", "bully", "bullying", "personal", "social"];

        const matches = (words) => words.filter(word => t.includes(word));
        const a = matches(academic), w = matches(wellbeing), f = matches(financial), h = matches(hostel), p = matches(personal);

        if (!a.length && !w.length && !f.length && !h.length && !p.length) {
            return {
                concerns: ["General support request"],
                priority: "LOW",
                route: "Student Support / Help Desk",
                nextStep: "Start with the student support team; they can route you to the right service.",
                reason: "Your question does not clearly match one specialist category, so we recommend a general support entry point.",
                buttons: ["Contact Student Support", "Ask a Support Advisor"],
                emergency: false
            };
        }

        const concerns = [];
        if (a.length) concerns.push("Academic");
        if (w.length) concerns.push("Wellbeing");
        if (f.length) concerns.push("Financial");
        if (h.length) concerns.push("Hostel / campus life");
        if (p.length) concerns.push("Personal / social");

        const routes = [];
        const buttons = [];
        if (w.length) { routes.push("Counselling / wellbeing support"); buttons.push("Request Counselling"); }
        if (a.length) { routes.push("Academic Advisor"); buttons.push("Contact Academic Advisor"); }
        if (f.length) { routes.push("Financial Aid / Student Finance"); buttons.push("Contact Financial Support"); }
        if (h.length) { routes.push("Hostel / Student Welfare"); buttons.push("Contact Student Welfare"); }
        if (p.length) { routes.push("Student Welfare / support advisor"); buttons.push("Contact Support Advisor"); }

        const priority = (w.length && a.length) || w.length > 1 ? "MODERATE" : "LOW";
        let reason = "We matched your words to the support areas that best fit your question.";
        if (a.length && w.length) reason = "You mentioned academic pressure along with wellbeing concerns, so we recommend both academic and wellbeing support.";
        else if (a.length) reason = "You mentioned studies, exams, workload or concentration, so an academic support pathway is appropriate.";
        else if (w.length) reason = "You mentioned stress, sleep, anxiety or feeling overwhelmed, so wellbeing support may be helpful.";
        else if (f.length) reason = "You mentioned fees or financial pressure, so student finance support is the most relevant starting point.";
        else if (h.length) reason = "You mentioned a hostel or accommodation issue, so student welfare/hostel support is the most relevant route.";
        else if (p.length) reason = "You described a personal or social concern, so a support advisor can help you identify the next step.";

        return {
            concerns,
            priority,
            route: routes.join(" + "),
            nextStep: "Choose a support option below and start the appropriate conversation.",
            reason,
            buttons,
            emergency: false
        };
    }

    analyzeBtn.addEventListener("click", () => {
        const text = question.value.trim();
        if (!text) {
            question.focus();
            question.classList.add("input-error");
            setTimeout(() => question.classList.remove("input-error"), 1200);
            return;
        }

        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = `Finding your path <span>...</span>`;

        setTimeout(() => {
            const result = analyzeQuestion(text);

            userSummary.textContent = text.length > 150 ? text.slice(0, 147) + "..." : text;
            concernsEl.textContent = result.concerns.join(" • ");
            routeEl.textContent = result.route;
            nextStepEl.textContent = result.nextStep;
            reasonEl.textContent = result.reason;
            priorityBadge.textContent = result.priority;

            priorityBadge.className = "priority-badge " + result.priority.toLowerCase();
            emergencyBanner.classList.toggle("hidden", !result.emergency);

            supportButtons.innerHTML = "";
            result.buttons.forEach((label, index) => {
                const btn = document.createElement("button");
                btn.className = result.emergency && index === 0 ? "danger-btn" : "secondary-btn";
                btn.textContent = label;
                btn.addEventListener("click", () => {
                    if (result.emergency && index === 0) {
                        alert("Demo: In a real deployment this would connect to the university's approved emergency number/pathway.");
                    } else {
                        alert("Demo: Your request would now be routed to the selected support team.");
                    }
                });
                supportButtons.appendChild(btn);
            });

            resultSection.classList.remove("hidden");
            resultSection.scrollIntoView({ behavior: "smooth", block: "start" });

            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = `Find My Support Path <span>→</span>`;
        }, 900);
    });
});
