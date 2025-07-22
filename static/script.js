document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const priorityInput = document.getElementById('priorityInput');
    const dueDateInput = document.getElementById('dueDateInput');
    const addButton = document.getElementById('addButton');
    const taskList = document.getElementById('taskList');
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filters button');
    const sortSelect = document.getElementById('sortSelect');
    const clearCompletedButton = document.getElementById('clearCompletedButton');
    const activeTasksCountSpan = document.getElementById('activeTasksCount');
    const exportButton = document.getElementById('exportButton');
    const importButton = document.getElementById('importButton');
    const importFile = document.getElementById('importFile');

    let currentFilter = 'all';
    let currentSort = 'id_desc';
    let allTasks = []; // Store all tasks fetched from the server
    let draggedItem = null;

    // Fetch and display tasks on page load
    fetchTasks();

    addButton.addEventListener('click', async () => {
        const taskText = taskInput.value.trim();
        const priority = priorityInput.value;
        const dueDate = dueDateInput.value;

        if (taskText !== '') {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ task: taskText, priority, due_date: dueDate }),
            });
            const newTask = await response.json();
            allTasks.push(newTask);
            renderTasks();
            taskInput.value = '';
            dueDateInput.value = '';
        }
    });

    searchInput.addEventListener('input', renderTasks);

    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderTasks();
        });
    });

    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderTasks();
    });

    clearCompletedButton.addEventListener('click', async () => {
        if (confirm('Are you sure you want to clear all completed tasks?')) {
            await fetch('/api/tasks/clear_completed', {
                method: 'DELETE',
            });
            allTasks = allTasks.filter(task => !task.completed);
            renderTasks();
        }
    });

    exportButton.addEventListener('click', async () => {
        const response = await fetch('/api/tasks/export');
        const tasksToExport = await response.json();
        const dataStr = JSON.stringify(tasksToExport, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'todo_tasks.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    importButton.addEventListener('click', () => {
        importFile.click(); // Trigger the hidden file input click
    });

    importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const importedTasks = JSON.parse(event.target.result);
                    if (confirm('Importing tasks will add them to your current list. Continue?')) {
                        const response = await fetch('/api/tasks/import', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ tasks: importedTasks }),
                        });
                        if (response.ok) {
                            alert('Tasks imported successfully!');
                            fetchTasks(); // Re-fetch all tasks to update the list
                        } else {
                            alert('Failed to import tasks.');
                        }
                    }
                } catch (error) {
                    alert('Invalid JSON file.');
                    console.error('Error parsing JSON:', error);
                }
            };
            reader.readAsText(file);
        }
    });

    async function fetchTasks() {
        const response = await fetch('/api/tasks');
        allTasks = await response.json();
        renderTasks();
    }

    function renderTasks() {
        taskList.innerHTML = '';
        let filteredTasks = [...allTasks];

        // Search
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            filteredTasks = filteredTasks.filter(task =>
                task.task.toLowerCase().includes(searchTerm)
            );
        }

        // Filter
        if (currentFilter === 'active') {
            filteredTasks = filteredTasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = filteredTasks.filter(task => task.completed);
        }

        // Sort
        filteredTasks.sort((a, b) => {
            if (currentSort === 'due_date_asc') {
                if (!a.due_date) return 1;
                if (!b.due_date) return -1;
                return new Date(a.due_date) - new Date(b.due_date);
            } else if (currentSort === 'priority_desc') {
                const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            } else if (currentSort === 'id_desc') {
                return b.id - a.id;
            }
            return 0;
        });

        filteredTasks.forEach(addTaskToDOM);
        updateActiveTasksCount();
    }

    function addTaskToDOM(task) {
        const li = document.createElement('li');
        li.dataset.id = task.id;
        li.draggable = true; // Make it draggable
        if (task.completed) {
            li.classList.add('completed');
        }

        const taskDetails = document.createElement('div');
        taskDetails.classList.add('task-details');

        const taskTextSpan = document.createElement('span');
        taskTextSpan.classList.add('task-text');
        taskTextSpan.textContent = task.task;
        taskTextSpan.addEventListener('click', () => {
            toggleComplete(task, li);
        });
        taskTextSpan.addEventListener('dblclick', () => {
            editTask(task, taskTextSpan);
        });

        const priorityDueDate = document.createElement('div');
        priorityDueDate.classList.add('priority-due-date');
        priorityDueDate.textContent = `Priority: ${task.priority || 'N/A'} | Due: ${task.due_date || 'N/A'}`;

        taskDetails.appendChild(taskTextSpan);
        taskDetails.appendChild(priorityDueDate);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-button');
        deleteButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this task?')) {
                deleteTask(task.id, li);
            }
        });

        li.appendChild(taskDetails);
        li.appendChild(deleteButton);
        taskList.appendChild(li);

        // Drag and Drop Event Listeners
        li.addEventListener('dragstart', handleDragStart);
        li.addEventListener('dragover', handleDragOver);
        li.addEventListener('dragleave', handleDragLeave);
        li.addEventListener('drop', handleDrop);
        li.addEventListener('dragend', handleDragEnd);
    }

    async function toggleComplete(task, li) {
        const updatedTask = { ...task, completed: !task.completed };
        const response = await fetch(`/api/tasks/${task.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedTask),
        });
        if (response.ok) {
            task.completed = updatedTask.completed; // Update local task object
            renderTasks(); // Re-render to apply filter/sort if needed
        }
    }

    async function deleteTask(taskId, li) {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            allTasks = allTasks.filter(task => task.id !== taskId);
            renderTasks();
        }
    }

    function editTask(task, taskTextSpan) {
        const currentText = task.task;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        taskTextSpan.replaceWith(input);
        input.focus();

        input.addEventListener('blur', async () => {
            const newText = input.value.trim();
            if (newText && newText !== currentText) {
                const updatedTask = { ...task, task: newText };
                const response = await fetch(`/api/tasks/${task.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedTask),
                });
                if (response.ok) {
                    task.task = newText; // Update local task object
                }
            }
            input.replaceWith(taskTextSpan);
            taskTextSpan.textContent = task.task; // Ensure text is updated even if no change
            renderTasks(); // Re-render to apply filter/sort if needed
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                input.blur();
            }
        });
    }

    function updateActiveTasksCount() {
        const activeTasks = allTasks.filter(task => !task.completed).length;
        activeTasksCountSpan.textContent = `${activeTasks} items left`;
    }

    // Drag and Drop Handlers
    function handleDragStart(e) {
        draggedItem = this; // 'this' refers to the li element being dragged
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.innerHTML);
        this.classList.add('dragging');
    }

    function handleDragOver(e) {
        e.preventDefault(); // Necessary to allow dropping
        e.dataTransfer.dropEffect = 'move';
        const target = e.target.closest('li');
        if (target && target !== draggedItem) {
            const bounding = target.getBoundingClientRect();
            const offset = bounding.y + (bounding.height / 2);
            if (e.clientY > offset) {
                target.classList.remove('drag-over');
                target.classList.add('drag-below'); // Add a class for styling below
            } else {
                target.classList.remove('drag-below');
                target.classList.add('drag-over'); // Add a class for styling above
            }
        }
    }

    function handleDragLeave(e) {
        const target = e.target.closest('li');
        if (target) {
            target.classList.remove('drag-over', 'drag-below');
        }
    }

    async function handleDrop(e) {
        e.preventDefault();
        const target = e.target.closest('li');
        if (target && target !== draggedItem) {
            const bounding = target.getBoundingClientRect();
            const offset = bounding.y + (bounding.height / 2);

            if (e.clientY > offset) {
                taskList.insertBefore(draggedItem, target.nextSibling);
            }
            else {
                taskList.insertBefore(draggedItem, target);
            }

            // Update allTasks array to reflect new order
            const newOrderIds = Array.from(taskList.children).map(li => parseInt(li.dataset.id));
            allTasks.sort((a, b) => newOrderIds.indexOf(a.id) - newOrderIds.indexOf(b.id));

            // Send new order to backend
            await fetch('/api/tasks/reorder', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ task_ids: newOrderIds }),
            });
        }
        // Clean up classes
        document.querySelectorAll('.drag-over, .drag-below').forEach(el => {
            el.classList.remove('drag-over', 'drag-below');
        });
    }

    function handleDragEnd(e) {
        this.classList.remove('dragging');
        document.querySelectorAll('.drag-over, .drag-below').forEach(el => {
            el.classList.remove('drag-over', 'drag-below');
        });
        draggedItem = null;
        renderTasks(); // Re-render to ensure correct display and order
    }
});