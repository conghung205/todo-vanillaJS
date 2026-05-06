const $ = document.querySelector.bind(document);

const addBtn = $(".add-btn");
const formAdd = $("#addTaskModal");
const modalClose = $(".modal-close");
const btnCancel = $(".btn-cancel");
const todoForm = $(".todo-app-form");
const titleInput = $("#taskTitle");
const todoList = $("#todoList");
const searchInput = $(".search-input");
const tabComplete = $(".tab-complete");
const tabActive = $(".tab-active");
const tabAll = $(".tab-all");

// state
let searchValue = "";
let currentFilter = "all";
let todoTasks = [];

let debounceTimer;

// search
searchInput.oninput = async (event) => {
    const value = event.target.value || "";

    clearTimeout(debounceTimer);

    //lưu giá trị input vào state searchValue
    debounceTimer = setTimeout(() => {
        searchValue = value.trim().toLowerCase();
        render();
    }, 300);
};

// Hàm filter chung
function getFilteredTasks(tasks) {
    //copy todoTasks để xử lý filter
    let result = [...tasks];

    //nếu currentFilter là "complete"
    if (currentFilter === "complete") {
        result = result.filter((task) => task.isCompleted);
    }

    //nếu currentFilter là "active"
    if (currentFilter === "active") {
        result = result.filter((task) => !task.isCompleted);
    }

    // Nếu search
    if (searchValue) {
        result = result.filter((task) =>
            task.title.toLowerCase().includes(searchValue),
        );
    }

    return result;
}

async function getTasks() {
    const res = await fetch("http://localhost:3000/tasks");
    return await res.json();
}
async function addTasks(data) {
    const res = await fetch("http://localhost:3000/tasks", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    return await res.json();
}
async function updateTasks(id, data) {
    const res = await fetch(`http://localhost:3000/tasks/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    return await res.json();
}
async function deleteTasks(id) {
    const res = await fetch(`http://localhost:3000/tasks/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });
    return await res.json();
}

// init
async function init() {
    todoTasks = await getTasks();
    render();
}

// function render
function render() {
    const todoTasksFilter = getFilteredTasks(todoTasks);

    renderTask(todoTasksFilter);
}

// xử lý active tab
function setActiveTab(activeTab) {
    [tabAll, tabActive, tabComplete].forEach((tab) =>
        tab.classList.remove("active"),
    );

    activeTab.classList.add("active");
}

// Khi chọn tab set lại state và thêm class active
tabAll.onclick = async () => {
    currentFilter = "all";
    setActiveTab(tabAll);
    render();
};

tabComplete.onclick = async () => {
    currentFilter = "complete";
    setActiveTab(tabComplete);
    render();
};

tabActive.onclick = async () => {
    currentFilter = "active";
    setActiveTab(tabActive);
    render();
};

let editId = null;

// show Modal
function openFormModal() {
    formAdd.classList.add("show");

    //do thuộc tính transition từ css nên setTimeout lại để focus
    setTimeout(() => {
        titleInput.focus();
    }, 100);
}

// close modal
function closeForm() {
    formAdd.classList.remove("show");

    const formTitle = formAdd.querySelector(".modal-title");
    if (formTitle) {
        formTitle.textContent =
            formTitle.dataset.original || formTitle.textContent;
        delete formTitle.dataset.original;
    }
    const submitBtn = formAdd.querySelector(".btn-submit");
    if (submitBtn) {
        submitBtn.textContent =
            submitBtn.dataset.original || submitBtn.textContent;
        delete submitBtn.dataset.original;
    }

    // khi close: scroll lên đầu và reset lại form về default value
    setTimeout(() => {
        formAdd.querySelector(".modal").scrollTop = 0;
    }, 300);
    todoForm.reset();

    // gán lại editId về null
    editId = null;
}

addBtn.onclick = openFormModal;

modalClose.onclick = closeForm;
btnCancel.onclick = closeForm;

// Xử lý khi form submit
todoForm.onsubmit = async (event) => {
    event.preventDefault();

    // lấy tất cả form data có thuộc tính name (dữ liệu từ các input, textarea...)
    const formData = Object.fromEntries(new FormData(todoForm));

    // Kiểm tra có đang trong trạng thái Edit hay không
    if (editId !== null) {
        //Nếu tìm được
        const newTask = {
            ...formData,
        };

        // update and render
        const updatedTask = await updateTasks(editId, newTask);

        todoTasks = todoTasks.map((task) =>
            task.id == editId ? { ...task, ...updatedTask } : task,
        );
    }
    // logic thêm mới
    else {
        const newTask = {
            ...formData,
            isCompleted: false,
            createdAt: new Date(),
        };

        const createdTask = await addTasks(newTask);
        todoTasks.push(createdTask);
    }

    // close and render
    closeForm();
    render();
};

//lắng nghe sự kiện trên todoList khi click các options nó nổi bọt lên
todoList.onclick = async (event) => {
    // closest tìm selector click không thấy tìm lên cha
    const editBtn = event.target.closest(".edit-btn");
    const deleteBtn = event.target.closest(".delete-btn");
    const completeBtn = event.target.closest(".complete-btn");

    //khi click vào editBtn
    if (editBtn) {
        const taskId = editBtn.dataset.id;
        const task = todoTasks.find((task) => task.id === taskId);

        // nếu không tìm thấy
        if (!task) return;

        // gán giá trị cho biến editId
        editId = taskId;

        // lặp qua để lấy key và value trong object task
        for (const key in task) {
            const value = task[key];

            // selector đến các thẻ có attribute "name"
            const input = $(`[name="${key}"]`);

            //Khi lấy được thì lấy giá trị cũ đưa vào input
            if (input) {
                input.value = value;
            }
        }

        // Đổi text
        const formTitle = formAdd.querySelector(".modal-title");
        const submitBtn = formAdd.querySelector(".btn-submit");

        if (formTitle) {
            formTitle.dataset.original = formTitle.textContent;
            formTitle.textContent = "Edit Task";
        }
        if (submitBtn) {
            submitBtn.dataset.original = submitBtn.textContent;
            submitBtn.textContent = "Save Task";
        }

        openFormModal();
    }

    // delete
    if (deleteBtn) {
        const taskId = deleteBtn.dataset.id;
        const currentTask = todoTasks.find((t) => t.id == taskId);

        if (!currentTask) return;

        if (
            confirm(`Bạn chắc chắn muốn xóa công việc "${currentTask.title}" ?`)
        ) {
            await deleteTasks(taskId);
            todoTasks = todoTasks.filter((task) => task.id != taskId);

            render();
        }
    }

    // complete
    if (completeBtn) {
        const taskId = completeBtn.dataset.id;
        const task = todoTasks.find((t) => t.id === taskId);

        const updated = await updateTasks(taskId, {
            isCompleted: !task.isCompleted,
        });

        todoTasks = todoTasks.map((t) =>
            t.id == taskId ? { ...t, ...updated } : t,
        );

        render();
    }
};

// render
function renderTask(tasks) {
    //Kiểm tra task có trống không
    if (!tasks.length) {
        todoList.innerHTML = "<p>Không có công việc!</p>";
        return;
    }

    const htmls = tasks
        .map(
            (task) =>
                `<div class="task-card ${escapeHTML(task.color)} ${task.isCompleted ? "completed" : ""}">
            <div class="task-header">
                <h3 class="task-title">${escapeHTML(task.title)}</h3>
                <button class="task-menu">
                    <i class="fa-solid fa-ellipsis fa-icon"></i>
                    <div class="dropdown-menu">
                        <div class="dropdown-item edit-btn" data-id="${task.id}">
                            <i
                                class="fa-solid fa-pen-to-square fa-icon"
                            ></i>
                            Edit
                        </div>
                        <div class="dropdown-item complete complete-btn" data-id="${task.id}">
                            <i class="fa-solid fa-check fa-icon"></i>
                            ${task.isCompleted ? "Mark as Active" : "Mark as Complete"}
                        </div>
                        <div class="dropdown-item delete delete-btn" data-id="${task.id}">
                            <i class="fa-solid fa-trash fa-icon"></i>
                            Delete
                        </div>
                    </div>
                </button>
            </div>
            <p class="task-description">
                ${escapeHTML(task.description)}
            </p>
            <div class="task-time">${escapeHTML(task.startTime)} - ${escapeHTML(task.endTime)}</div>
        </div>`,
        )
        .join("");

    // Thêm vào html
    todoList.innerHTML = htmls;
}

// mặc định filter là all

init();
setActiveTab(tabAll);

// Chuyển chuỗi thành dạng an toàn HTML (tránh XSS)
//// Escape ký tự HTML (<, >, &, ...) để hiển thị như text, không bị render thành tag
function escapeHTML(html) {
    const div = document.createElement("div");
    div.textContent = html;
    return div.innerHTML;
}
