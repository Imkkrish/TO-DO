import { useEffect, useState } from 'react';
import './App.css'; // Should include Tailwind CSS

const PRIORITY_ORDER = { urgent: 0, normal: 1, chill: 2 };
const PRIORITY_ICONS = {
  urgent: '🔥',
  normal: '📌',
  chill: '🧘',
};

export default function App() {
  const [tasks, setTasks] = useState(() => {
    const stored = localStorage.getItem('tasks');
    return stored ? JSON.parse(stored) : [];
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const [filter, setFilter] = useState('active');
  const [text, setText] = useState('');
  const [priority, setPriority] = useState('normal');
  const [toast, setToast] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme);
    localStorage.setItem('theme', theme ? 'dark' : 'light');
  }, [theme]);

  const filteredTasks = tasks
    .filter((task) => {
      if (filter === 'active') return !task.completed;
      if (filter === 'done') return task.completed;
      return true;
    })
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  const activeCount = tasks.filter((task) => !task.completed).length;

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setTasks([...tasks, { text: text.trim(), priority, completed: false }]);
    setText('');
    setPriority('normal');
    showToast('✅ Task Added!');
  };

  const toggleComplete = (index) => {
    const updated = [...tasks];
    updated[index].completed = !updated[index].completed;
    setTasks(updated);
  };

  const deleteTask = (index) => {
    const updated = tasks.filter((_, i) => i !== index);
    setTasks(updated);
    showToast('🗑️ Task Deleted!');
  };

  const startEditTask = (index) => {
    setEditingIndex(index);
    setEditingText(tasks[index].text);
  };

  const saveEditTask = (index) => {
    if (editingText.trim()) {
      const updated = [...tasks];
      updated[index].text = editingText.trim();
      setTasks(updated);
      showToast('✏️ Task Updated!');
    }
    setEditingIndex(null);
    setEditingText('');
  };

  const cancelEditTask = () => {
    setEditingIndex(null);
    setEditingText('');
  };

  const clearCompleted = () => {
    setTasks(tasks.filter((task) => !task.completed));
    if (filter === 'done') setFilter('active');
    showToast('🧹 Cleared Completed!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-600 dark:from-gray-900 dark:to-black font-poppins text-white transition-colors duration-300">
      <div className="max-w-md mx-auto p-6 backdrop-blur-lg bg-white/10 dark:bg-white/5 rounded-2xl shadow-xl ">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold tracking-wider">To-Do's</h1>
          <button
            onClick={() => setTheme((prev) => !prev)}
            className="text-xl p-2 hover:bg-white/20 rounded-full"
          >
          </button>
        </header>

        <div className="text-sm text-white/70 mb-2 text-center">
          {tasks.length === 0
            ? 'All clear! 😌'
            : activeCount === 0
            ? 'All tasks done! 🎉'
            : `You have ${activeCount} task${activeCount > 1 ? 's' : ''} left. Let’s go! 🚀`}
        </div>

        <form onSubmit={addTask} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="What’s poppin’ today?"
            className="flex-1 p-3 rounded-lg bg-white/30 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-pink-400"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="bg-white/20 text-white text-sm rounded-lg px-2"
          >
            <option value="chill">🧘 Chill</option>
            <option value="normal">📌 Normal</option>
            <option value="urgent">🔥 Urgent</option>
          </select>
          <button
            type="submit"
            className="px-4 py-3 bg-pink-500 font-bold rounded-lg hover:scale-105 transform transition"
          >
            Add
          </button>
        </form>

        <div className="flex justify-around mb-4">
          {['all', 'active', 'done'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`relative overflow-hidden px-4 py-2 ${
                filter === type ? 'font-bold' : ''
              }`}
            >
              {type === 'all' && '💀 All'}
              {type === 'active' && '🆕 Active'}
              {type === 'done' && '✅ Done'}
              <span
                className={`underline-bar absolute bottom-0 left-0 h-0.5 bg-white transition-all duration-300 ${
                  filter === type ? 'w-full' : 'w-0'
                }`}
              ></span>
            </button>
          ))}
          <button
            onClick={clearCompleted}
            className="relative overflow-hidden px-4 py-2"
          >
            🗑️ Clear
            <span className="underline-bar absolute bottom-0 left-0 h-0.5 bg-white w-0 transition-all duration-300"></span>
          </button>
        </div>

        <ul className="space-y-2">
          {filteredTasks.length === 0 ? (
            <div className="text-center mt-6 opacity-60">
              <p className="text-xl">✨ Nothing here. Manifesting productivity...</p>
            </div>
          ) : (
            filteredTasks.map((task, i) => {
              const realIndex = tasks.indexOf(task);
              const isEditing = editingIndex === realIndex;
              return (
                <li
                  key={i}
                  className={`flex justify-between items-center p-3 rounded-lg bg-white/20 hover:bg-white/30 transition ${
                    task.completed ? 'opacity-60 line-through' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 cursor-pointer">
                    <span>{PRIORITY_ICONS[task.priority]}</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="bg-white/80 text-black rounded px-2 py-1 focus:outline-none"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEditTask(realIndex);
                          if (e.key === 'Escape') cancelEditTask();
                        }}
                      />
                    ) : (
                      <span onClick={() => toggleComplete(realIndex)}>
                        {task.text}
                      </span>
                    )}
                  </div>
                  <div className="space-x-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => saveEditTask(realIndex)}
                          className="hover:scale-110 transform px-2"
                          aria-label="Save task"
                        >
                          💾
                        </button>
                        <button
                          onClick={cancelEditTask}
                          className="hover:scale-110 transform px-2"
                          aria-label="Cancel edit"
                        >
                          ❌
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditTask(realIndex)}
                          className="hover:scale-110 transform"
                          aria-label="Edit task"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteTask(realIndex)}
                          className="hover:scale-110 transform"
                          aria-label="Delete task"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
      {toast && (
        <div className="fixed bottom-4 right-4 bg-pink-600 text-white px-4 py-2 rounded-xl shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
