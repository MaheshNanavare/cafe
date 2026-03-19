const API_URL = '/api/customers';
let editMode = false;
let currentEditId = null;

// 1. Fetch and Display Customers
async function fetchCustomers() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        const tableBody = document.getElementById('customerTableBody');
        tableBody.innerHTML = '';

        data.forEach(c => {
            // We escape the name string to prevent issues with quotes in the onclick attribute
            const customerData = JSON.stringify(c).replace(/"/g, '&quot;');

            tableBody.innerHTML += `
                <tr class="hover:bg-gray-50 border-b transition-colors">
                    <td class="p-4 text-gray-600">${c.id}</td>
                    <td class="p-4 font-semibold text-gray-800">${c.name}</td>
                    <td class="p-4 text-gray-600">${c.email}</td>
                    <td class="p-4 text-gray-600">${c.age}</td>
                    <td class="p-4 flex gap-4">
                        <button onclick="prepareEdit(${customerData})" 
                                class="text-blue-600 hover:text-blue-800 font-medium transition">
                            Edit
                        </button>
                        <button onclick="deleteCustomer(${c.id})" 
                                class="text-red-600 hover:text-red-800 font-medium transition">
                            Delete
                        </button>
                    </td>
                </tr>`;
        });
    } catch (err) {
        console.error("Error fetching customers:", err);
    }
}

// 2. Prepare the form for Editing
function prepareEdit(customer) {
    editMode = true;
    currentEditId = customer.id;

    // Fill the existing form fields
    document.getElementById('name').value = customer.name;
    document.getElementById('email').value = customer.email;
    document.getElementById('age').value = customer.age;

    // Change button text to reflect we are editing
    const submitBtn = document.querySelector('button[onclick="addCustomer()"]');
    if (submitBtn) {
        submitBtn.innerText = "Update Customer";
        submitBtn.className = "w-full bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition";
    }
}

// 3. Handle Add OR Update
async function handleSubmit() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const age = document.getElementById('age').value;

    if (!name || !email || !age) {
        alert("Please fill all fields");
        return;
    }

    const payload = { name, email, age: parseInt(age) };

    if (editMode) {
        // UPDATE (PUT)
        await fetch(`${API_URL}/${currentEditId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        resetForm();
    } else {
        // CREATE (POST)
        await fetch(API_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });
        resetForm();
    }

    fetchCustomers();
}

// 4. Reset Form to Default State
function resetForm() {
    editMode = false;
    currentEditId = null;

    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('age').value = '';

    const submitBtn = document.querySelector('button[onclick="handleSubmit()"]') || document.querySelector('button');
    submitBtn.innerText = "Add Customer";
    submitBtn.className = "w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition";
}

// 5. Delete Customer
async function deleteCustomer(id) {
    if(confirm("Delete this customer?")) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        fetchCustomers();
    }
}

// Initial load
fetchCustomers();