const API_URL = '/api/customers';
let editMode = false;
let currentEditId = null;

// Grab initial data on page load
async function fetchCustomers() {
    try {
        const res = await fetch(API_URL);
        let data = await res.json();

        // Keep the list sorted by ID so the UI stays consistent
        data.sort((a, b) => a.id - b.id);

        const tableBody = document.getElementById('customerTableBody');
        const countBadge = document.getElementById('customerCount');

        tableBody.innerHTML = '';

        // Sync the badge count with the current list size
        if (countBadge) {
            countBadge.innerText = `${data.length} Active Records`;
        }

        data.forEach(c => {
            const customerData = JSON.stringify(c).replace(/"/g, '&quot;');
            tableBody.innerHTML += `
                <tr class="hover:bg-blue-50/30 transition-colors">
                    <td class="p-5 font-mono text-gray-400">#${c.id}</td>
                    <td class="p-5 font-bold text-gray-800">${c.name}</td>
                    <td class="p-5 text-gray-600">${c.email}</td>
                    <td class="p-5 text-center">
                        <span class="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-600">
                            ${c.age}
                        </span>
                    </td>
                    <td class="p-5 text-center">
                        <div class="flex justify-center gap-4">
                            <button onclick="prepareEdit(${customerData})" class="btn-edit">
                                Edit
                            </button>
                            <button onclick="deleteCustomer(${c.id})" class="btn-delete">
                                Delete
                            </button>
                        </div>
                    </td>
                </tr>`;
        });
    } catch (err) {
        console.error("Fetch error:", err);
    }
}

// Populate form fields and toggle UI to edit state
function prepareEdit(customer) {
    editMode = true;
    currentEditId = customer.id;

    document.getElementById('name').value = customer.name;
    document.getElementById('email').value = customer.email;
    document.getElementById('age').value = customer.age;

    document.getElementById('cancelBtn').classList.remove('hidden');

    // Switch button to warning color to show we're in edit mode
    const btn = document.getElementById('submitBtn');
    btn.innerText = "Update Customer";
    btn.classList.replace('bg-blue-600', 'bg-orange-500');
    btn.classList.replace('hover:bg-blue-700', 'hover:bg-orange-600');

    // Scroll up so the user sees the form immediately
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Determine if we need a POST or PUT based on current state
async function handleSubmit() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const age = document.getElementById('age').value;

    if (!name || !email || !age) {
        alert("All fields are required");
        return;
    }

    const payload = { name, email, age: parseInt(age) };

    try {
        const method = editMode ? 'PUT' : 'POST';
        const url = editMode ? `${API_URL}/${currentEditId}` : API_URL;

        const response = await fetch(url, {
            method: method,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            resetForm();
            fetchCustomers();
        }
    } catch (err) {
        console.error("Operation failed:", err);
    }
}

// Clear form and revert button back to 'Add' state
function resetForm() {
    editMode = false;
    currentEditId = null;

    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('age').value = '';

    document.getElementById('cancelBtn').classList.add('hidden');

    const btn = document.getElementById('submitBtn');
    btn.innerText = "Add Customer";
    btn.classList.replace('bg-orange-500', 'bg-blue-600');
    btn.classList.replace('hover:bg-orange-600', 'hover:bg-blue-700');
}

async function deleteCustomer(id) {
    if (confirm("Are you sure you want to delete this record?")) {
        try {
            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (response.ok) fetchCustomers();
        } catch (err) {
            console.error("Delete failed:", err);
        }
    }
}

fetchCustomers();