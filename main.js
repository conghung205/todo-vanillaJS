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

const todoTasks = JSON.parse(localStorage.getItem("todoTasks")) ?? [];

// search
searchInput.oninput = function (event) {
    //lưu giá trị input vào state searchValue
    searchValue = event.target.value.trim().toLowerCase();
    // gọi hàm render
    render();
};

// Hàm filter chung
function getFilteredTasks() {
    //copy todoTasks để xử lý filter
    let result = [...todoTasks];

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

// Hàm render
function render() {
    //nhận giá trị trả về từ hàm getFilteredTasks
    const tasks = getFilteredTasks();

    // và truyền cho hàm renderTask để render ra ui
    renderTask(tasks);
}

// xử lý active tab
function setActiveTab(activeTab) {
    [tabAll, tabActive, tabComplete].forEach((tab) =>
        tab.classList.remove("active"),
    );

    activeTab.classList.add("active");
}

// Khi chọn tab set lại state và thêm class active
tabAll.onclick = () => {
    currentFilter = "all";
    setActiveTab(tabAll);
    render();
};

tabComplete.onclick = () => {
    currentFilter = "complete";
    setActiveTab(tabComplete);
    render();
};

tabActive.onclick = () => {
    currentFilter = "active";
    setActiveTab(tabActive);
    render();
};

// Khai báo biến editId để kiểm tra có đang trong trạng thái edit không
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

// hiển thị modal "thêm mới"
addBtn.onclick = openFormModal;

// Đóng modal "thêm mới"
modalClose.onclick = closeForm;
btnCancel.onclick = closeForm;

// Xử lý khi form submit
todoForm.onsubmit = (event) => {
    event.preventDefault();

    // lấy tất cả form data có thuộc tính name (dữ liệu từ các input, textarea...)
    const formData = Object.fromEntries(new FormData(todoForm));

    // Kiểm tra có đang trong trạng thái Edit hay không
    if (editId !== null) {
        //tìm vị trí index của task đang edit
        const index = todoTasks.findIndex((task) => task.id === Number(editId));

        //Nếu tìm được
        if (index !== -1) {
            //Nhận lại giá trị cũ để giữ lại id và trạng thái khi cập nhật
            const oldTask = todoTasks[index];

            // cập nhật lại giá trị mới
            todoTasks[index] = {
                ...formData,
                id: oldTask.id,
                isCompleted: oldTask.isCompleted,
            };
        }
    }
    // logic thêm mới
    else {
        // thêm 2 thuộc tính để xử lý và nhận diện
        formData.isCompleted = false;
        formData.id = Date.now();
        // thêm task vào đầu danh sách
        todoTasks.unshift(formData);
    }

    // lưu toàn bộ danh sách task vào localStorage
    saveTasks();

    // Đóng modal
    closeForm();

    // render
    render();
};

// lưu vào localStorage
function saveTasks() {
    localStorage.setItem("todoTasks", JSON.stringify(todoTasks));
}

//lắng nghe sự kiện trên todoList khi click các options nó nổi bọt lên
todoList.onclick = (event) => {
    // closest tìm selector click không thấy tìm lên cha
    const editBtn = event.target.closest(".edit-btn");
    const deleteBtn = event.target.closest(".delete-btn");
    const completeBtn = event.target.closest(".complete-btn");

    //khi click vào editBtn
    if (editBtn) {
        const taskId = Number(editBtn.dataset.id);
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
            //Khi lấy được thì set lại value cho các thẻ đó

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
        const index = todoTasks.findIndex((task) => task.id === Number(taskId));
        const task = todoTasks[index];

        if (confirm(`Bạn chắc chắn muốn xóa công việc "${task.title}" ?`)) {
            todoTasks.splice(index, 1);
            saveTasks();
            render();
        }
    }

    // complete
    if (completeBtn) {
        const taskId = completeBtn.dataset.id;
        const index = todoTasks.findIndex((task) => task.id === Number(taskId));
        const task = todoTasks[index];
        task.isCompleted = !task.isCompleted;
        saveTasks();
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
setActiveTab(tabAll);
render();

// Chuyển chuỗi thành dạng an toàn HTML (tránh XSS)
//// Escape ký tự HTML (<, >, &, ...) để hiển thị như text, không bị render thành tag
function escapeHTML(html) {
    const div = document.createElement("div");
    div.textContent = html;
    return div.innerHTML;
}
