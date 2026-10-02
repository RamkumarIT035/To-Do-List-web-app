const dateInput = document.getElementById("dateInput");
const taskInput = document.getElementById("taskInput");
const addButton = document.getElementById("addButton");
const buttonText = document.getElementById("buttonText");
const buttonIcon = document.getElementById("buttonIcon");
const cancelButton = document.getElementById("cancelButton");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const emptyState = document.getElementById("emptyState");
const totalTasks = document.getElementById("totalTasks");
const activeTasks = document.getElementById("activeTasks");
const completedTasks = document.getElementById("completedTasks");
const progressPercent = document.getElementById("progressPercent");
const progressBox = document.querySelector(".progress-box");
const clearCompleted = document.getElementById("clearCompleted");
const filterButtons = document.querySelectorAll(".filter");
const statusDialog = document.getElementById("statusDialog");
const completeUpdateButton =
    document.getElementById("completeUpdateButton");
const incompleteUpdateButton =
    document.getElementById("incompleteUpdateButton");
const cancelUpdateButton =
    document.getElementById("cancelUpdateButton");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";
let editingId = null;
let pendingUpdate = null;

function getToday() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatDate(date) {
    if (!date) {
        return "";
    }

    const [year, month, day] = date.split("-");

    const dateObject = new Date(
        year,
        month - 1,
        day
    );

    return dateObject.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}

function saveTasks() {
    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );
}

function addTask() {
    const text = taskInput.value.trim();
    const date = dateInput.value;

    if (text === "") {
        taskInput.focus();
        return;
    }

    if (date === "") {
        dateInput.focus();
        return;
    }

    if (editingId !== null) {
        pendingUpdate = {
            id: editingId,
            text: text,
            date: date
        };
        statusDialog.showModal();
        return;
    }

    const newTask = {
        id: Date.now(),
        date: date,
        text: text,
        completed: false
    };

    tasks.push(newTask);

    saveTasks();

    taskInput.value = "";
    dateInput.value = getToday();

    renderTasks();

    taskInput.focus();
}

function updateTask(id, newText, newDate, completed) {
    const task = tasks.find(
        task => task.id === id
    );

    if (!task) {
        return;
    }

    task.text = newText;
    task.date = newDate;
    task.completed = completed;

    saveTasks();

    editingId = null;

    buttonText.textContent = "Add Task";
    buttonIcon.textContent = "+";

    cancelButton.classList.add("hidden");

    taskInput.value = "";
    dateInput.value = getToday();

    renderTasks();

    taskInput.focus();
}

function finishUpdate(completed) {
    if (pendingUpdate === null) {
        return;
    }

    const update = pendingUpdate;
    pendingUpdate = null;
    statusDialog.close();
    updateTask(
        update.id,
        update.text,
        update.date,
        completed
    );
}

function cancelUpdate() {
    pendingUpdate = null;
    statusDialog.close();
    taskInput.focus();
}

function editTask(id) {
    const task = tasks.find(
        task => task.id === id
    );

    if (!task) {
        return;
    }

    editingId = id;

    taskInput.value = task.text;
    dateInput.value = task.date;

    buttonText.textContent = "Update";
    buttonIcon.textContent = "✓";

    cancelButton.classList.remove("hidden");

    taskInput.focus();
}

function cancelEdit() {
    editingId = null;

    taskInput.value = "";
    dateInput.value = getToday();

    buttonText.textContent = "Add Task";
    buttonIcon.textContent = "+";

    cancelButton.classList.add("hidden");

    taskInput.focus();
}

function toggleTask(id) {
    const task = tasks.find(
        task => task.id === id
    );

    if (!task) {
        return;
    }

    task.completed = !task.completed;

    saveTasks();

    renderTasks();
}

function deleteTask(id, element) {
    element.classList.add("removing");

    setTimeout(() => {

        tasks = tasks.filter(
            task => task.id !== id
        );

        if (editingId === id) {
            cancelEdit();
        }

        saveTasks();

        renderTasks();

    }, 300);
}

function clearCompletedTasks() {
    tasks = tasks.filter(
        task => !task.completed
    );

    saveTasks();

    renderTasks();
}

function getFilteredTasks() {
    let filteredTasks = tasks;

    if (currentFilter === "active") {
        filteredTasks = tasks.filter(
            task => !task.completed
        );
    }

    if (currentFilter === "completed") {
        filteredTasks = tasks.filter(
            task => task.completed
        );
    }

    const searchText =
        searchInput.value
            .toLowerCase()
            .trim();

    if (searchText !== "") {
        filteredTasks = filteredTasks.filter(
            task =>
                task.text
                    .toLowerCase()
                    .includes(searchText) ||
                formatDate(task.date)
                    .toLowerCase()
                    .includes(searchText)
        );
    }

    return filteredTasks;
}

function renderTasks() {
    taskList.innerHTML = "";

    const filteredTasks =
        getFilteredTasks();

    filteredTasks.forEach(task => {

        const li =
            document.createElement("li");

        li.className = "task";

        if (task.completed) {
            li.classList.add("completed");
        }

        const checkButton =
            document.createElement("button");

        checkButton.className = "check-btn";

        checkButton.addEventListener(
            "click",
            () => toggleTask(task.id)
        );

        const taskContent =
            document.createElement("div");

        taskContent.className =
            "task-content";

        const taskDate =
            document.createElement("div");

        taskDate.className = "task-date";

        taskDate.textContent =
            `📅 ${formatDate(task.date)}`;

        const taskText =
            document.createElement("span");

        taskText.className = "task-text";

        taskText.textContent =
            task.text;

        const taskStatus =
            document.createElement("span");

        taskStatus.className =
            "task-status";

        taskStatus.textContent =
            task.completed
                ? "Completed"
                : "Incomplete";

        taskContent.appendChild(taskDate);
        taskContent.appendChild(taskText);
        taskContent.appendChild(taskStatus);

        const actions =
            document.createElement("div");

        actions.className = "actions";

        const editButton =
            document.createElement("button");

        editButton.className =
            "action-btn edit-btn";

        editButton.textContent = "✎";

        editButton.title = "Edit task";

        editButton.addEventListener(
            "click",
            () => editTask(task.id)
        );

        const deleteButton =
            document.createElement("button");

        deleteButton.className =
            "action-btn delete-btn";

        deleteButton.textContent = "×";

        deleteButton.title = "Delete task";

        deleteButton.addEventListener(
            "click",
            () => deleteTask(task.id, li)
        );

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);

        li.appendChild(checkButton);
        li.appendChild(taskContent);
        li.appendChild(actions);

        taskList.appendChild(li);
    });

    updateStatistics();
    updateEmptyState();
    updateProgress();
}

function updateStatistics() {
    const total = tasks.length;

    const completed =
        tasks.filter(
            task => task.completed
        ).length;

    const active =
        total - completed;

    totalTasks.textContent = total;
    activeTasks.textContent = active;
    completedTasks.textContent = completed;
}

function updateEmptyState() {
    emptyState.style.display =
        getFilteredTasks().length === 0
            ? "block"
            : "none";
}

function updateProgress() {
    const total = tasks.length;

    const completed =
        tasks.filter(
            task => task.completed
        ).length;

    let percent = 0;

    if (total > 0) {
        percent =
            Math.round(
                (completed / total) * 100
            );
    }

    progressPercent.textContent =
        `${percent}%`;

    const degrees =
        percent * 3.6;

    progressBox.style.background =
        `conic-gradient(
            #6366f1 ${degrees}deg,
            #e5e7eb ${degrees}deg
        )`;
}

addButton.addEventListener(
    "click",
    addTask
);

cancelButton.addEventListener(
    "click",
    cancelEdit
);

completeUpdateButton.addEventListener(
    "click",
    () => finishUpdate(true)
);

incompleteUpdateButton.addEventListener(
    "click",
    () => finishUpdate(false)
);

cancelUpdateButton.addEventListener(
    "click",
    cancelUpdate
);

taskInput.addEventListener(
    "keydown",
    event => {
        if (event.key === "Enter") {
            addTask();
        }

        if (
            event.key === "Escape" &&
            editingId !== null
        ) {
            cancelEdit();
        }
    }
);

dateInput.addEventListener(
    "keydown",
    event => {
        if (event.key === "Enter") {
            addTask();
        }
    }
);

searchInput.addEventListener(
    "input",
    renderTasks
);

filterButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            filterButtons.forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            currentFilter =
                button.dataset.filter;

            renderTasks();
        }
    );
});

clearCompleted.addEventListener(
    "click",
    clearCompletedTasks
);

dateInput.value = getToday();

renderTasks();