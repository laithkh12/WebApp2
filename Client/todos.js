document.addEventListener('DOMContentLoaded', async function () {
        
    const welcomeMessage = document.getElementById('welcomeMessage');
    const saveAllButton = document.getElementById('saveAllButton');
    const logoutButton = document.getElementById('logoutButton');

    const username = sessionStorage.getItem('username');
    const email = sessionStorage.getItem('email');
        
    //welcome for user 
    if (username && email) {
        welcomeMessage.textContent = `Hi ${username} (${email})`;
    } else {
        welcomeMessage.textContent = 'Welcome';
    }
        
    const form = document.getElementById('todo-form');
    const input = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');

    function saveTodosToSessionStorage(todos) {
        sessionStorage.setItem('todos', JSON.stringify(todos));
    }

    //try to post the todos user have if exist
    try {
        const response = await fetch(`/todos/${email}`);
        const data = await response.json();
        const todos = data.todos;
        todoList.innerHTML = '';

        todos.forEach(todo => {
            addTodoItem(todo.text);      
        });

    }catch(error){
        console.error('Failed to fetch todos:', error);
    }

    //function to allow editing on exist todos
    async function replaceTodosInDatabase(email, todos) {
        try {
            const response = await fetch(`/todos/${email}`);
            if (!response.ok) {
                throw new Error('Failed to fetch todos');
            }
            const data = await response.json();
            const todosData = data.todos;
            todoList.innerHTML = '';
            todosData.forEach(todo => {
                addTodoItem(todo.text);
            });
        }catch(error){
            console.error('Failed to fetch todos:', error);
        }
    }
    
    //Add the newtodo
    form.addEventListener('submit', function (event) {
        event.preventDefault(); 
        const todoText = input.value.trim();
        if (todoText !== '') {
            addTodoItem(todoText);
            input.value = '';
        }
    });

    //fetch to saveAll button
    saveAllButton.addEventListener('click', async function() {
        const todos = Array.from(todoList.querySelectorAll('span')).map(todo => todo.textContent);
        try {
            const response = await fetch('/todos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, todos })
            });
            
            if (!response.ok) {
                throw new Error('Failed to save todos');
            }
            alert('Todos saved successfully');
        }catch(error) {
            alert('Failed to save todos. Please try again.');
        }
    });

    //fetch to logOut button
    logoutButton.addEventListener('click', async () => {   
        try {
            const email = sessionStorage.getItem('email');
            const response = await fetch('/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isConnected: false })
            });
            if (response.ok) {
                sessionStorage.clear();
                window.location.href = '/login';
            } else {
                throw new Error('Logout failed');
            }
        } catch (error) {
            alert('Logout failed. Please try again.');
        }
    });

    //function toAddTodos and be in good look
    function addTodoItem(todoText) {

        const li = document.createElement('li');

        //create div to style the text and buttons
        const todoDiv = document.createElement('div');
        todoDiv.style.display = 'flex';
        todoDiv.style.justifyContent = 'space-between';
        todoDiv.style.alignItems = 'center';
        
        //create the text
        const todoSpan = document.createElement('span');
        todoSpan.textContent = todoText;
        
        //added todo text to the div
        todoDiv.appendChild(todoSpan);

        //create div to style the buttons
        const buttonsDiv = document.createElement('div');
        buttonsDiv.style.marginLeft = 'left';
    
        //create edit button
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        
        editButton.addEventListener('click', function() {
            todoSpan.contentEditable = true;
            todoSpan.focus();
        });
        
        // added edit button to buttonsDiv
        buttonsDiv.appendChild(editButton);

        //create delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';

        deleteButton.addEventListener('click', function () {
            li.remove();
        });
    
        // added edit button to buttonsDiv
        buttonsDiv.appendChild(deleteButton);
        
        todoDiv.appendChild(buttonsDiv);
        li.appendChild(todoDiv);                
        todoList.appendChild(li);
    }
});