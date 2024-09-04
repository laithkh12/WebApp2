//get user to Login in the website with check for correctness of the inputs
document.addEventListener('DOMContentLoaded', async function () {
    const loginForm = document.getElementById('loginForm');
    const togglePasswordButton = document.getElementById('togglePassword');
    const passwordField = document.getElementById('password');

    loginForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const email = document.getElementById('email').value.toLowerCase();
        const password = document.getElementById('password').value;

        // try to send login data to the server
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                sessionStorage.setItem('email', data.email);
                sessionStorage.setItem('username', data.username);
                window.location.href = '/todos.html';
            } else {
                //login failed
                throw new Error(data.message);
            }
        } catch (error) {
            alert('Login failed. Please try again.');
        }
    });

    //to show password when nedded
    togglePasswordButton.addEventListener('click', function () {
        if (passwordField.type === 'password') {
            passwordField.type = 'text';
            togglePasswordButton.textContent = 'Hide Password';
        } else {
            passwordField.type = 'password';
            togglePasswordButton.textContent = 'Show Password';
        }
    });
});
