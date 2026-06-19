// Konfiguracja API

const API_BASE_URL = "http://localhost:8000";

const STORAGE_KEYS = {
    token: "maria_system_token",
};

// Pomocnicze selektory DOM

const getElement = (id) => document.getElementById(id);

const elements = {
    overlay: getElement("overlay"),
    loginModal: getElement("loginModal"),
    registerModal: getElement("registerModal"),

    loginBtn: getElement("loginBtn"),
    registerBtn: getElement("registerBtn"),
    logoutBtn: getElement("logoutBtn"),
    userEmail: getElement("userEmail"),

    loginForm: getElement("loginForm"),
    registerForm: getElement("registerForm"),
    jobForm: getElement("jobForm"),

    loginEmail: getElement("loginEmail"),
    loginPassword: getElement("loginPassword"),

    registerName: getElement("registerName"),
    registerEmail: getElement("registerEmail"),
    registerPassword: getElement("registerPassword"),
    registerPasswordRepeat: getElement("registerPasswordRepeat"),

    loginMessage: getElement("loginMessage"),
    registerMessage: getElement("registerMessage"),
    jobMessage: getElement("jobMessage"),

    dashboardSection: getElement("dashboardSection"),
    engineType: getElement("engineType"),
    inputData: getElement("inputData"),
    jobsList: getElement("jobsList"),
    refreshJobsBtn: getElement("refreshJobsBtn"),

    totalJobs: getElement("totalJobs"),
    completedJobs: getElement("completedJobs"),
    pendingJobs: getElement("pendingJobs"),
    failedJobs: getElement("failedJobs"),
};

const closeButtons = document.querySelectorAll(".close-btn");
const engineButtons = document.querySelectorAll("[data-open-engine]");

// Obsługa tokenu

const getToken = () => localStorage.getItem(STORAGE_KEYS.token);

const setToken = (token) => {
    localStorage.setItem(STORAGE_KEYS.token, token);
};

const clearToken = () => {
    localStorage.removeItem(STORAGE_KEYS.token);
};

// Komunikaty użytkownika

const setMessage = (element, text, type = "success") => {
    if (!element) return;

    element.textContent = text;
    element.classList.remove("success", "error");
    element.classList.add(type);
};

const clearMessage = (element) => {
    if (!element) return;

    element.textContent = "";
    element.classList.remove("success", "error");
};

// API

const apiRequest = async (path, options = {}) => {
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    const token = getToken();

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
    });

    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        const message = data?.detail || "Wystąpił błąd połączenia z API.";
        throw new Error(Array.isArray(message) ? "Niepoprawne dane formularza." : message);
    }

    return data;
};

const registerUser = (email, password) => {
    return apiRequest("/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
};

const loginUser = (email, password) => {
    return apiRequest("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
};

const getCurrentUser = () => {
    return apiRequest("/me");
};

const createJob = (engineType, inputData) => {
    return apiRequest("/jobs/", {
        method: "POST",
        body: JSON.stringify({
            engine_type: engineType,
            input_data: inputData,
        }),
    });
};

const getJobs = () => {
    return apiRequest("/jobs/");
};

const deleteJob = (jobId) => {
    return apiRequest(`/jobs/${jobId}`, {
        method: "DELETE",
    });
};

// Modal

const openModal = (modal) => {
    elements.overlay.style.display = "flex";
    elements.loginModal.style.display = "none";
    elements.registerModal.style.display = "none";
    modal.style.display = "block";
};

const closeModals = () => {
    elements.overlay.style.display = "none";
    elements.loginModal.style.display = "none";
    elements.registerModal.style.display = "none";

    clearMessage(elements.loginMessage);
    clearMessage(elements.registerMessage);
};

const requireLogin = () => {
    if (!getToken()) {
        openModal(elements.loginModal);
        return false;
    }

    return true;
};

// UI

const updateAuthUI = async () => {
    const token = getToken();

    if (!token) {
        elements.loginBtn.classList.remove("hidden");
        elements.registerBtn.classList.remove("hidden");
        elements.logoutBtn.classList.add("hidden");
        elements.userEmail.classList.add("hidden");
        elements.dashboardSection.classList.add("hidden");
        return;
    }

    try {
        const user = await getCurrentUser();

        elements.userEmail.textContent = user.email;
        elements.userEmail.classList.remove("hidden");
        elements.logoutBtn.classList.remove("hidden");
        elements.loginBtn.classList.add("hidden");
        elements.registerBtn.classList.add("hidden");
        elements.dashboardSection.classList.remove("hidden");

        await renderJobs();
    } catch {
        clearToken();
        await updateAuthUI();
    }
};

const getStatusLabel = (status) => {
    const labels = {
        PENDING: "Oczekuje",
        RUNNING: "Liczy",
        COMPLETED: "Gotowe",
        FAILED: "Błąd",
    };

    return labels[status] || status;
};

const updateStatistics = (jobs) => {

    elements.totalJobs.textContent = jobs.length;

    elements.completedJobs.textContent =
        jobs.filter(job => job.status === "COMPLETED").length;

    elements.pendingJobs.textContent =
        jobs.filter(job =>
            job.status === "PENDING" ||
            job.status === "RUNNING"
        ).length;

    elements.failedJobs.textContent =
        jobs.filter(job => job.status === "FAILED").length;
};

const renderJobs = async () => {
    if (!getToken()) return;

    try {
        const jobs = await getJobs();

        updateStatistics(jobs);

        if (!jobs.length) {
            elements.jobsList.innerHTML = `<p class="text-sm text-[#6B7280]">Nie masz jeszcze żadnych zadań.</p>`;
            return;
        }

        elements.jobsList.innerHTML = jobs
    .slice()
    .reverse()
    .map((job) => `
        <article class="job-card">
            <div class="job-card-header">
                <div>
                    <h3 class="text-white font-semibold">
                        Zadanie #${job.id}
                    </h3>

                    <p class="text-xs text-[#6B7280]">
                        ${job.engine_type} • dane: ${job.input_data ?? "-"}
                    </p>
                </div>

                <div>
                    <span class="job-status ${job.status}">
                        ${getStatusLabel(job.status)}
                    </span>

                    <button
                        data-delete-job="${job.id}"
                        class="delete-job-btn"
                    >
                        Usuń
                    </button>
                </div>
            </div>

            <p class="text-sm">
                ${
                    job.result
                        ? job.result
                        : "Wynik pojawi się po zakończeniu obliczeń."
                }
            </p>
        </article>
    `)
            .join("");
    } catch (error) {
        setMessage(elements.jobMessage, error.message, "error");
    }
};
const handleDeleteJobClick = async (event) => {

    const button = event.target.closest("[data-delete-job]");

    if (!button) {
        return;
    }

    const jobId = button.dataset.deleteJob;

    const confirmed = confirm(
        `Czy usunąć zadanie #${jobId}?`
    );

    if (!confirmed) {
        return;
    }

    try {

        await deleteJob(jobId);

        setMessage(
            elements.jobMessage,
            `Zadanie #${jobId} usunięte.`,
            "success"
        );

        await renderJobs();

    } catch (error) {

        setMessage(
            elements.jobMessage,
            error.message,
            "error"
        );

    }
};

// Zdarzenia

elements.loginBtn.addEventListener("click", () => {
    openModal(elements.loginModal);
});

elements.registerBtn.addEventListener("click", () => {
    openModal(elements.registerModal);
});

elements.logoutBtn.addEventListener("click", async () => {
    clearToken();
    await updateAuthUI();
});

closeButtons.forEach((button) => {
    button.addEventListener("click", closeModals);
});

elements.overlay.addEventListener("click", (event) => {
    if (event.target === elements.overlay) {
        closeModals();
    }
});

engineButtons.forEach((button) => {
    button.addEventListener("click", () => {
        if (!requireLogin()) return;

        elements.engineType.value = button.dataset.openEngine;
        elements.dashboardSection.scrollIntoView({ behavior: "smooth" });
    });
});

elements.loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    clearMessage(elements.loginMessage);

    try {
        const data = await loginUser(
            elements.loginEmail.value.trim(),
            elements.loginPassword.value
        );

        setToken(data.access_token);
        setMessage(elements.loginMessage, "Zalogowano poprawnie.", "success");

        closeModals();
        await updateAuthUI();
    } catch (error) {
        setMessage(elements.loginMessage, error.message, "error");
    }
});

elements.registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    clearMessage(elements.registerMessage);

    const password = elements.registerPassword.value;
    const passwordRepeat = elements.registerPasswordRepeat.value;

    if (password !== passwordRepeat) {
        setMessage(elements.registerMessage, "Hasła nie są takie same.", "error");
        return;
    }

    try {
        await registerUser(
            elements.registerEmail.value.trim(),
            password
        );

        setMessage(
            elements.registerMessage,
            "Konto utworzone. Sprawdź email i zweryfikuj konto.",
            "success"
        );

        elements.registerForm.reset();
    } catch (error) {
        setMessage(elements.registerMessage, error.message, "error");
    }
});

elements.jobForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!requireLogin()) return;

    clearMessage(elements.jobMessage);

    try {
        const job = await createJob(
            elements.engineType.value,
            elements.inputData.value.trim()
        );

        setMessage(elements.jobMessage, `Zadanie #${job.id} zostało uruchomione.`, "success");
        elements.jobForm.reset();

        await renderJobs();

        setTimeout(renderJobs, 1500);
        setTimeout(renderJobs, 4000);
        setTimeout(renderJobs, 11000);
    } catch (error) {
        setMessage(elements.jobMessage, error.message, "error");
    }
});

elements.refreshJobsBtn.addEventListener("click", renderJobs);

elements.jobsList.addEventListener(
    "click",
    handleDeleteJobClick
);

// Start aplikacji

updateAuthUI();

setInterval(async () => {
    if (getToken()) {
        await renderJobs();
    }
}, 5000);
