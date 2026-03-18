const API_URL = '/api/customers';

async function fetchCustomers() {
    const res = await fetch(API_URL);
    const data = await res.json();
    const table = document.getElementById('customerTable');
    table.innerHTML = '<tr><th>ID</th><th>Name</th><th>Email</th><th>Action</th></tr>';
    data.forEach(c => {
        table.innerHTML += `<tr>
            <td>${c.id}</td>
            <td>${c.name}</td>
            <td>${c.email}</td>
            <td><button onclick="deleteCustomer(${c.id})">Delete</button></td>
        </tr>`;
    });
}

async function addCustomer() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    await fetch(API_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ name, email })
    });
    fetchCustomers();
}

async function deleteCustomer(id) {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    fetchCustomers();
}

fetchCustomers();