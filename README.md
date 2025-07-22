# Todo List Application

This is a simple, yet feature-rich Todo List web application built with Flask (Python) for the backend and HTML, CSS, and JavaScript for the frontend. It allows users to manage their tasks efficiently with various functionalities.

## Features

-   **Add Tasks**: Easily add new tasks with a description, priority, and due date.
-   **Edit Tasks**: Double-click on a task to edit its description.
-   **Delete Tasks**: Remove tasks from the list with a confirmation dialog.
-   **Mark as Completed**: Toggle task completion status (strike-through effect).
-   **Task Persistence**: All tasks are stored in a SQLite database, so they persist even after closing the browser or restarting the application.
-   **Filtering**: Filter tasks by "All", "Active" (uncompleted), or "Completed" status.
-   **Sorting**: Sort tasks by due date (ascending), priority (descending), or default order (creation date).
-   **Search**: Search for tasks by their description.
-   **Drag & Drop Reordering**: Reorder tasks in the list by dragging and dropping them. The new order is saved to the database.
-   **Clear Completed Tasks**: A button to delete all completed tasks at once, with a confirmation dialog.
-   **Active Tasks Count**: Displays the number of uncompleted tasks remaining.
-   **Export/Import Tasks**: Export your current task list to a JSON file or import tasks from a JSON file.

## Technologies Used

-   **Backend**: Python 3, Flask
-   **Database**: SQLite3
-   **Frontend**: HTML5, CSS3, JavaScript

## Setup Instructions

Follow these steps to get the application up and running on your local machine.

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
cd todo-gemini2
```

### 2. Create a Virtual Environment (Recommended)

It's good practice to use a virtual environment to manage project dependencies.

```bash
python -m venv venv
```

### 3. Activate the Virtual Environment

-   **On Windows:**
    ```bash
    .\venv\Scripts\activate
    ```
-   **On macOS/Linux:**
    ```bash
    source venv/bin/activate
    ```

### 4. Install Dependencies

Install the required Python packages using `pip`:

```bash
pip install -r requirements.txt
```

### 5. Run the Application

Once the dependencies are installed, you can run the Flask application:

```bash
python app.py
```

### 6. Access the Application

Open your web browser and navigate to `http://127.0.0.1:5000/` (or the address shown in your terminal).

## Usage

-   **Adding a Task**: Type your task in the input field, select a priority, choose a due date, and click "Add".
-   **Editing a Task**: Double-click on the task text in the list to make it editable. Press Enter or click outside to save changes.
-   **Deleting a Task**: Click the "Delete" button next to a task. Confirm the deletion when prompted.
-   **Marking as Completed**: Click on a task to toggle its completed status.
-   **Filtering**: Use the "All", "Active", and "Completed" buttons to filter the task list.
-   **Sorting**: Use the "Sort by" dropdown to change the order of tasks.
-   **Searching**: Type in the "Search tasks..." field to find tasks by their description.
-   **Reordering**: Click and drag a task to change its position in the list.
-   **Clear Completed**: Click the "Clear Completed" button to remove all tasks marked as completed.
-   **Export Tasks**: Click "Export Tasks" to download your tasks as a JSON file.
-   **Import Tasks**: Click "Import Tasks", then select a JSON file to import tasks into your list.

## Future Enhancements (Ideas)

-   **Notifications/Reminders**: Implement browser notifications for upcoming due dates.
-   **User Authentication**: Add user login/registration to allow multiple users to have their own separate todo lists.
-   **Categories/Tags**: Allow users to assign categories or tags to tasks for better organization.
-   **Subtasks**: Enable the creation of subtasks under a main task.

\"# todo\" 
