//get new user to register in the website with check for correctness of the inputs
document.addEventListener('DOMContentLoaded', function () {

    const registerForm = document.getElementById('registerForm');
    const togglePasswordButton = document.getElementById('togglePassword');
    const passwordField = document.getElementById('password');
    const confirmPasswordField = document.getElementById('confirmPassword');

    registerForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value.toLowerCase();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match'); 
            return;
        }

        if (password.length < 8) {
            alert('Password must be at least 8 characters'); 
            return;
        }

        // try to send registeration data to the server
        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password, confirmPassword })
            });

            if (!response.ok) {
                const data = await response.json();
                alert(data.message); 
                return;
            }
            window.location.href = '/login';
        } catch (error) {
            alert('Registration failed. Please try again.'); 
        }
    });

    //to show password when nedded
    togglePasswordButton.addEventListener('click', function () {
        if (passwordField.type === 'password') {
            passwordField.type = 'text';
            confirmPasswordField.type = 'text'
            togglePasswordButton.textContent = 'Hide Password';
        } else {
            passwordField.type = 'password';
            confirmPasswordField.type = 'password'
            togglePasswordButton.textContent = 'Show Password';
        }
    });
});