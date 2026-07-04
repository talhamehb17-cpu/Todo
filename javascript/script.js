// script.js – advanced todo logic

document.addEventListener('DOMContentLoaded', () => {
  // DOM refs
  const todoInput = document.getElementById('todoInput');
  const addBtn = document.getElementById('addBtn');
  const searchInput = document.getElementById('searchInput');
  const todoList = document.getElementById('todoList');
  const taskCount = document.getElementById('taskCount');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const notification = document.getElementById('notification');
  const notifMessage = document.getElementById('notifMessage');
  const notifClose = document.getElementById('notifClose');

  // state
  let todos = [];
  let filter = '';

  // helpers
  function formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  function getNow() {
    return new Date().getTime();
  }

  // notification system
  let notifTimer = null;
  function showNotification(msg, duration = 3000) {
    notifMessage.textContent = msg;
    notification.classList.remove('hidden');
    clearTimeout(notifTimer);
    notifTimer = setTimeout(() => {
      notification.classList.add('hidden');
    }, duration);
  }

  function hideNotification() {
    notification.classList.add('hidden');
    clearTimeout(notifTimer);
  }
  notifClose.addEventListener('click', hideNotification);

  // render todos
  function render() {
    const filtered = todos.filter(todo =>
      todo.text.toLowerCase().includes(filter.toLowerCase())
    );

    if (filtered.length === 0) {
      todoList.innerHTML = `<li class="empty-message"><i class="fas fa-inbox"></i> ${todos.length === 0 ? 'nothing yet · add a task' : 'no matching tasks'}</li>`;
    } else {
      todoList.innerHTML = filtered.map(todo => `
        <li class="todo-item" data-id="${todo.id}">
          <span class="task-text">${escapeHTML(todo.text)}</span>
          <span class="task-time"><i class="far fa-clock"></i> ${formatTime(todo.createdAt)}</span>
          <div class="item-actions">
            <button class="duplicate-btn" title="duplicate"><i class="fas fa-copy"></i></button>
            <button class="delete-btn" title="delete"><i class="fas fa-trash-alt"></i></button>
          </div>
        </li>
      `).join('');
    }

    // update counter
    taskCount.textContent = `${todos.length} ${todos.length === 1 ? 'task' : 'tasks'}`;

    // attach event listeners to buttons (delegation)
    document.querySelectorAll('.todo-item .duplicate-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const li = btn.closest('.todo-item');
        const id = Number(li.dataset.id);
        duplicateTodo(id);
      });
    });

    document.querySelectorAll('.todo-item .delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const li = btn.closest('.todo-item');
        const id = Number(li.dataset.id);
        deleteTodo(id);
      });
    });
  }

  // escape html
  function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // CRUD + duplicate
  function addTodo() {
    const text = todoInput.value.trim();
    if (!text) {
      showNotification('❌ cannot add empty task', 2000);
      return;
    }

    // check duplicate (exact match, case-insensitive)
    const exists = todos.some(t => t.text.toLowerCase() === text.toLowerCase());
    if (exists) {
      showNotification('⚠️ task already exists', 2200);
      todoInput.value = '';
      todoInput.focus();
      return;
    }

    const newTodo = {
      id: Date.now() + Math.random() * 1000,
      text: text,
      createdAt: getNow(),
    };
    todos.push(newTodo);
    todoInput.value = '';
    todoInput.focus();
    render();
    showNotification(`✅ added: “${text}”`, 2000);
  }

  function deleteTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    todos = todos.filter(t => t.id !== id);
    render();
    showNotification(`🗑️ deleted: “${todo.text}”`, 1800);
  }

  function duplicateTodo(id) {
    const original = todos.find(t => t.id === id);
    if (!original) return;

    // check duplicate of original text (case-insensitive)
    const exists = todos.some(t => t.text.toLowerCase() === original.text.toLowerCase());
    if (exists) {
      showNotification('⚠️ duplicate not allowed · task already exists', 2200);
      return;
    }

    const newTodo = {
      id: Date.now() + Math.random() * 1000,
      text: original.text,
      createdAt: getNow(),
    };
    todos.push(newTodo);
    render();
    showNotification(`📋 duplicated: “${original.text}”`, 2000);
  }

  function clearAllTodos() {
    if (todos.length === 0) {
      showNotification('no tasks to clear', 1500);
      return;
    }
    todos = [];
    render();
    showNotification('🧹 all tasks cleared', 1800);
  }

  // search / filter
  function updateFilter() {
    filter = searchInput.value.trim();
    render();
  }

  // event listeners
  addBtn.addEventListener('click', addTodo);
  todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
  });

  searchInput.addEventListener('input', updateFilter);

  clearAllBtn.addEventListener('click', clearAllTodos);

  // initial render
  render();
  showNotification('✨ welcome · add your first task', 2500);

  // extra: click on notification to dismiss
  notification.addEventListener('click', (e) => {
    if (e.target === notification || e.target.closest('#notifClose')) {
      hideNotification();
    }
  });
});