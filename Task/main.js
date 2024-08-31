// script.js

let tasks = []; // Store tasks globally

// Request notification permission
function requestNotificationPermission() {
    if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Notification permission granted.');
            } else {
                console.log('Notification permission denied.');
            }
        });
    }
}

// Create a notification
function createNotification(title, body) {
    if (Notification.permission === 'granted') {
        new Notification(title, { body });
    } else {
        console.log('Notification permission not granted.');
    }
}

// Add a task
function addTask() {
    const taskInput = document.getElementById('taskInput');
    const startTimeInput = document.getElementById('startTimeInput');
    const endTimeInput = document.getElementById('endTimeInput');
    const taskList = document.getElementById('taskList');

    const taskText = taskInput.value.trim();
    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;

    if (taskText === '' || !startTime || !endTime) {
        alert('Please enter a valid task and time.');
        return;
    }

    const now = new Date();
    const startDateTime = new Date(now.toDateString() + ' ' + startTime);
    const endDateTime = new Date(now.toDateString() + ' ' + endTime);

    if (endDateTime <= startDateTime) {
        alert('End time must be after start time.');
        return;
    }

    // Check for overlapping tasks
    for (const task of tasks) {
        if ((startDateTime < task.endTime && endDateTime > task.startTime)) {
            alert('New task overlaps with an existing task.');
            return;
        }
    }

    const task = {
        text: taskText,
        startTime: startDateTime,
        endTime: endDateTime,
        timer: null,
        status: 'Pending'
    };

    tasks.push(task);
    displayTasks();
    resetInputs();
    checkTasks(); // Check tasks immediately after adding
}

// Display tasks
function displayTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    tasks.forEach((task, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <span>${task.text}</span>
            <span>${formatTime(task.startTime)} - ${formatTime(task.endTime)}</span>
            <span class="timer" id="timer-${index}">${task.status === 'Pending' ? 'Not Started' : ''}</span>
            ${task.status === 'Active' ? `<button onclick="completeTask(${index})">Complete Task</button>` : ''}
            <button onclick="deleteTask(${index})">Delete Task</button>
        `;
        taskList.appendChild(listItem);
    });
}

// Format time to HH:MM
function formatTime(date) {
    return date.toTimeString().slice(0, 5);
}

// Format duration in minutes and seconds
function formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

// Check for tasks that need to be started or completed
function checkTasks() {
    const now = new Date();

    tasks.forEach((task, index) => {
        if (now >= task.startTime && now < task.endTime && task.status === 'Pending') {
            startTask(index);
        } else if (now >= task.endTime && task.status === 'Active') {
            completeTask(index);
        }
    });

    setTimeout(checkTasks, 1000); // Check every second
}

// Start a task
function startTask(index) {
    const task = tasks[index];
    if (task.timer) {
        clearInterval(task.timer);
    }
    
    task.status = 'Active';
    const timerElement = document.getElementById(`timer-${index}`);
    timerElement.textContent = 'Active';
    createNotification('Task Started', `Task "${task.text}" has started.`);

    task.timer = setInterval(() => {
        const now = new Date();
        const remainingTime = task.endTime - now;

        if (remainingTime <= 0) {
            clearInterval(task.timer);
            timerElement.textContent = 'Scheduled Time for the current task is completed';
            createNotification('Task Completed', `Scheduled Time for task "${task.text}" is completed.`);
            task.status = 'Completed';
            displayTasks();
            return;
        }

        timerElement.textContent = formatDuration(remainingTime);
    }, 1000);
}

// Complete a task
function completeTask(index) {
    const task = tasks[index];
    clearInterval(task.timer);

    const now = new Date();
    const breakTime = Math.max(0, task.endTime - now);

    if (breakTime > 0) {
        createNotification('Task Completed Early', `Task "${task.text}" completed early. You have ${formatDuration(breakTime)} for a break.`);
    } else {
        createNotification('Task Completed', `Task "${task.text}" completed.`);
    }

    task.status = 'Completed';
    displayTasks();
}

// Delete a task
function deleteTask(index) {
    tasks.splice(index, 1);
    displayTasks();
}

// Reset input fields
function resetInputs() {
    document.getElementById('taskInput').value = '';
    document.getElementById('startTimeInput').value = '';
    document.getElementById('endTimeInput').value = '';
}

// Request notification permission on app load
requestNotificationPermission();

// Initial check for tasks
checkTasks();
