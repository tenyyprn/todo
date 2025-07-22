import sqlite3
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Database initialization
def init_db():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    cursor.execute('CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, task TEXT, priority TEXT, due_date TEXT, completed BOOLEAN)')
    
    # Check if 'order_index' column exists, if not, add it
    cursor.execute("PRAGMA table_info(todos)")
    columns = [column[1] for column in cursor.fetchall()]
    if 'order_index' not in columns:
        cursor.execute('ALTER TABLE todos ADD COLUMN order_index INTEGER')
        # Populate order_index for existing rows, setting it to id initially
        cursor.execute('UPDATE todos SET order_index = id WHERE order_index IS NULL')
    
    conn.commit()
    conn.close()

# Initialize the database when the app starts
init_db()

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/tasks')
def get_tasks():
    conn = get_db_connection()
    # Order by order_index by default, then by id for consistency
    tasks = conn.execute('SELECT * FROM todos ORDER BY order_index ASC, id DESC').fetchall()
    conn.close()
    return jsonify([dict(ix) for ix in tasks])

@app.route('/api/tasks', methods=['POST'])
def add_task():
    data = request.get_json()
    task = data.get('task')
    priority = data.get('priority')
    due_date = data.get('due_date')

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO todos (task, priority, due_date, completed) VALUES (?, ?, ?, ?)',
                 (task, priority, due_date, False))
    new_id = cursor.lastrowid
    # Set order_index for the new task to its id initially
    cursor.execute('UPDATE todos SET order_index = ? WHERE id = ?', (new_id, new_id))
    conn.commit()
    conn.close()
    return jsonify({'id': new_id, 'task': task, 'priority': priority, 'due_date': due_date, 'completed': False, 'order_index': new_id}), 201

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.get_json()
    task_text = data.get('task')
    priority = data.get('priority')
    due_date = data.get('due_date')
    completed = data.get('completed')

    conn = get_db_connection()
    conn.execute('UPDATE todos SET task = ?, priority = ?, due_date = ?, completed = ? WHERE id = ?',
                 (task_text, priority, due_date, completed, task_id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Task updated successfully'})

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM todos WHERE id = ?', (task_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Task deleted successfully'})

@app.route('/api/tasks/clear_completed', methods=['DELETE'])
def clear_completed_tasks():
    conn = get_db_connection()
    conn.execute('DELETE FROM todos WHERE completed = TRUE')
    conn.commit()
    conn.close()
    return jsonify({'message': 'Completed tasks cleared successfully'})

@app.route('/api/tasks/reorder', methods=['PUT'])
def reorder_tasks():
    data = request.get_json()
    task_ids_in_order = data.get('task_ids') # This will be a list of IDs in the new order

    if not isinstance(task_ids_in_order, list):
        return jsonify({'message': 'Invalid data format'}), 400

    conn = get_db_connection()
    try:
        for index, task_id in enumerate(task_ids_in_order):
            conn.execute('UPDATE todos SET order_index = ? WHERE id = ?', (index, task_id))
        conn.commit()
        return jsonify({'message': 'Tasks reordered successfully'})
    except Exception as e:
        conn.rollback()
        return jsonify({'message': f'Error reordering tasks: {str(e)}'}), 500
    finally:
        conn.close()

@app.route('/api/tasks/export')
def export_tasks():
    conn = get_db_connection()
    tasks = conn.execute('SELECT task, priority, due_date, completed FROM todos ORDER BY id DESC').fetchall()
    conn.close()
    return jsonify([dict(ix) for ix in tasks])

@app.route('/api/tasks/import', methods=['POST'])
def import_tasks():
    data = request.get_json()
    tasks_to_import = data.get('tasks')

    if not isinstance(tasks_to_import, list):
        return jsonify({'message': 'Invalid data format'}), 400

    conn = get_db_connection()
    try:
        for task_data in tasks_to_import:
            task = task_data.get('task')
            priority = task_data.get('priority', 'Medium')
            due_date = task_data.get('due_date')
            completed = task_data.get('completed', False)
            conn.execute('INSERT INTO todos (task, priority, due_date, completed) VALUES (?, ?, ?, ?)',
                         (task, priority, due_date, completed))
        conn.commit()
        return jsonify({'message': 'Tasks imported successfully'})
    except Exception as e:
        conn.rollback()
        return jsonify({'message': f'Error importing tasks: {str(e)}'}), 500
    finally:
        conn.close()

if __name__ == '__main__':
    app.run(debug=True)
