const $ = document.querySelector.bind(document);

const addBtn = $(".add-btn");
const formAdd = $("#addTaskModal");
const modalClose = $(".modal-close");
const btnCancel = $(".btn-cancel");
const todoForm = $(".todo-app-form");
const titleInput = $("#taskTitle");
const todoList = $("#todoList");

// Khai báo biến editIndex để kiểm tra có đang trong trạng thái edit không
let editIndex = null;

// show Modal
function openFormModal() {
    formAdd.classList.add("show");
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

    // gán lại editIndex về null
    editIndex = null;
}

// hiển thị modal "thêm mới"
addBtn.onclick = openFormModal;

// Đóng modal "thêm mới"
modalClose.onclick = closeForm;
btnCancel.onclick = closeForm;

const todoTasks = JSON.parse(localStorage.getItem("todoTasks")) ?? [];

// Xử lý khi form submit
todoForm.onsubmit = (event) => {
    event.preventDefault();

    // lấy tất cả form data có thuộc tính name (dữ liệu từ các input, textarea...)
    const formData = Object.fromEntries(new FormData(todoForm));

    // Kiểm tra có đang trong trạng thái Edit hay không
    if (editIndex) {
        todoTasks[editIndex] = formData;
    }
    // logic thêm mới
    else {
        formData.isCompleted = false;
        // thêm task vào đầu danh sách
        todoTasks.unshift(formData);
    }

    // lưu toàn bộ danh sách task vào localStorage
    localStorage.setItem("todoTasks", JSON.stringify(todoTasks));

    // Đóng modal
    closeForm();

    // render
    renderTask(todoTasks);
};

//lắng nghe sự kiện trên todoList khi click các options nó nổi bọt lên
todoList.onclick = (event) => {
    // closest tìm selector click không thấy tìm lên cha
    const editBtn = event.target.closest(".edit-btn");

    //khi click vào editBtn
    if (editBtn) {
        const taskIndex = editBtn.dataset.index;
        const task = todoTasks[taskIndex];

        // gán giá trị cho biến editIndex
        editIndex = taskIndex;

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
};

function renderTask(tasks) {
    //Kiểm tra task có trống không
    if (!tasks.length) {
        todoList.innerHTML = "<p>Chưa có công việc nào!</p>";
        return;
    }

    const htmls = tasks
        .map(
            (task, index) =>
                `<div class="task-card ${task.color} ${task.isCompleted ? "completed" : ""}">
            <div class="task-header">
                <h3 class="task-title">${task.title}</h3>
                <button class="task-menu">
                    <i class="fa-solid fa-ellipsis fa-icon"></i>
                    <div class="dropdown-menu">
                        <div class="dropdown-item edit-btn" data-index="${index}">
                            <i
                                class="fa-solid fa-pen-to-square fa-icon"
                            ></i>
                            Edit
                        </div>
                        <div class="dropdown-item complete">
                            <i class="fa-solid fa-check fa-icon"></i>
                            ${task.isCompleted ? "Mark as Active" : "Mark as Complete"}
                        </div>
                        <div class="dropdown-item delete delete-btn">
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

    // Thêm vào html
    todoList.innerHTML = htmls;
}

//Render lần đầu
renderTask(todoTasks);
