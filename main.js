const $ = document.querySelector.bind(document);

const addBtn = $(".add-btn");
const formAdd = $("#addTaskModal");
const modalClose = $(".modal-close");
const btnCancel = $(".btn-cancel");
const todoForm = $(".todo-app-form");
const titleInput = $("#taskTitle");

// show Modal
function openForm() {
    formAdd.classList.add("show");
    setTimeout(() => {
        titleInput.focus();
    }, 100);
}

// close modal
function closeForm() {
    formAdd.classList.remove("show");
    todoForm.reset();
}

// hiển thị modal "thêm mới"
addBtn.onclick = openForm;

// Đóng modal "thêm mới"
modalClose.onclick = closeForm;
btnCancel.onclick = closeForm;

const todoTask = JSON.parse(localStorage.getItem("todoTasks")) ?? [];

// Xử lý khi form submit
todoForm.onsubmit = (event) => {
    event.preventDefault();

    // lấy tất cả form data có thuộc tính name
    const newTask = Object.fromEntries(new FormData(todoForm));
    newTask.isCompleted = false;

    // thêm task vào đầu danh sách
    todoTask.unshift(newTask);

    // lưu toàn bộ danh sách task vào localStorage
    localStorage.setItem("todoTasks", JSON.stringify(todoTask));

    // Đóng modal
    closeForm();

    // render
    renderTask(todoTask);
};

function renderTask(tasks) {
    const todoList = $("#todoList");

    //Kiểm tra task có trống không
    if (!tasks.length) {
        todoList.innerHTML = "<p>Chưa có công việc nào!</p>";
        return;
    }

    const htmls = tasks
        .map(
            (task) =>
                `<div class="task-card ${task.color} ${task.isCompleted ? "completed" : ""}">
            <div class="task-header">
                <h3 class="task-title">${task.title}</h3>
                <button class="task-menu">
                    <i class="fa-solid fa-ellipsis fa-icon"></i>
                    <div class="dropdown-menu">
                        <div class="dropdown-item">
                            <i
                                class="fa-solid fa-pen-to-square fa-icon"
                            ></i>
                            Edit
                        </div>
                        <div class="dropdown-item complete">
                            <i class="fa-solid fa-check fa-icon"></i>
                            ${task.isCompleted ? "Mark as Active" : "Mark as Complete"}
                        </div>
                        <div class="dropdown-item delete">
                            <i class="fa-solid fa-trash fa-icon"></i>
                            Delete
                        </div>
                    </div>
                </button>
            </div>
            <p class="task-description">
                ${task.description}
            </p>
            <div class="task-time">${task.startTime} - ${task.endTime}</div>
        </div>`,
        )
        .join("");

    todoList.innerHTML = htmls;
}

//Render lần đầu
renderTask(todoTask);
