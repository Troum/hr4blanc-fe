document.addEventListener("DOMContentLoaded", function() {
  fetchAllTasks();
});

let globalTasks = [];
let globalTasksPerPage = 10;
let currentPage = 1;

async function fetchAllTasks() {
  try {
    const response = await fetch(`http://localhost:8080/api/v1/tasks`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    globalTasks = await response.json();
    displayTasks(currentPage);
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
}

function displayTasks(page) {
  currentPage = page;
  const start = (page - 1) * globalTasksPerPage;
  const end = start + globalTasksPerPage;
  const paginatedTasks = globalTasks.items.slice(start, end);

  const table = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
  table.innerHTML = '';
  paginatedTasks.forEach(task => {
    const row = table.insertRow();
    row.innerHTML = `<td>${task.id}</td><td>${task.title}</td><td>${convertDate(task.date)}</td>`;
    row.addEventListener('click', () => onRowClick(task.id));
  });

  setupPagination();
}

function setupPagination() {
  const totalPages = Math.ceil(globalTasks.items.length / globalTasksPerPage);
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';

  addButtonToPagination('<<', currentPage - 1, currentPage > 1, pagination);

  let startPage = Math.max(1, currentPage - 2);
  let endPage = startPage + 4;
  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - 4);
  }

  for (let i = startPage; i <= endPage; i++) {
    addButtonToPagination(i, i, true, pagination, currentPage === i);
  }

  addButtonToPagination('>>', currentPage + 1, currentPage < totalPages, pagination);
}

function addButtonToPagination(text, page, isEnabled, container, isActive = false) {
  const button = document.createElement('button');
  button.innerText = text;
  button.disabled = !isEnabled;
  if (isActive) {
    button.classList.add('active');
  }
  button.addEventListener('click', () => displayTasks(page));
  container.appendChild(button);
}

function workWithLocalStorage(key) {
  if (localStorage.getItem(key)) {
    return JSON.parse(localStorage.getItem(key))
  }
  return null
}
async function onRowClick(id) {
  try {
    const result = workWithLocalStorage(id)
    if (!result) {
      const response = await fetch(`http://localhost:8080/api/v1/tasks/${id}`);

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const task = await response.json();
      localStorage.setItem(id, JSON.stringify(task))

      openModal(task.item);
    } else {
      openModal(result?.item);
    }

  } catch (error) {
    console.error('Error fetching task details:', error);
  }
}

function convertDate (dateString) {
  return dateString.split('-').reverse().join('.')
}
function openModal(task) {
  const modal = document.getElementById('modal');
  modal.style.display = 'block';
  modal.innerHTML = `<div class="modal-content">
                            <div class="modal-header">
                            <strong>Подробная информация по ${task.title}</strong>
                            <span role="button" class="close">&times;</span>
                            </div>
                            <div class="modal-body">
                            <p><strong>Номер:</strong> ${task.id}</p>
                            <p><strong>Заголовок:</strong> ${task.title}</p>
                            <p><strong>Дата:</strong> ${convertDate(task.date)}</p>
                            <p><strong>Описание:</strong> ${task.description}</p>
                            <p><strong>Автор:</strong> ${task.author}</p>
                            <p><strong>Статус:</strong> ${task.status}</p>
                            </div>
                        </div>`;
  modal.querySelector('.close').addEventListener('click', () => {
    modal.style.display = 'none';
  });
}

window.onclick = function(event) {
  const modal = document.getElementById('modal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
}
