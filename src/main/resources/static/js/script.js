const API_URL = '/api/customers';

async function fetchCustomers() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        const tableBody = document.getElementById('customerTableBody');
        tableBody.innerHTML = '';

        data.forEach(c => {
            tableBody.innerHTML += `
                <tr class="hover:bg-gray-50 border-b">
                    <td class="p-4">${c.id}</td>
                    <td class="p-4 font-semibold">${c.name}</td>
                    <td class="p-4">${c.email}</td>
                    <td class="p-4">${c.age}</td>
                    <td class="p-4">
                        <button onclick="deleteCustomer(${c.id})" class="text-red-600 hover:underline font-medium">Delete</button>
                    </td>
                </tr>`;
        });
    } catch (err) {
        console.error("Error fetching customers:", err);
    }
}

async function addCustomer() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const age = document.getElementById('age').value;

    if (!name || !email || !age) {
        alert("Please fill all fields");
        return;
    }

    await fetch(API_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ name, email, age: parseInt(age) })
    });

    // Clear inputs
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('age').value = '';

    fetchCustomers();
}

async function deleteCustomer(id) {
    if(confirm("Delete this customer?")) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        fetchCustomers();
    }
}

// Initial load
fetchCustomers();