const API_URL = '/api/customers';
let editMode = false;
let currentEditId = null;

// This opens and closes the Bristol stats panel at the top of the table
function toggleStats() {
    const panel = document.getElementById('statsPanel');
    panel.classList.toggle('hidden');
}

// Our cafe's rules for valid data entry
function validateInput(name, email, age) {
    // Name check
    if (name.length <= 2) {
        alert("Name must be more than 2 characters.");
        return false;
    }

    // Email check (must have @ and be long enough)
    if (email.length <= 4 || !email.includes("@")) {
        alert("Please add a valid email.");
        return false;
    }

    // Age check (between 5 and 105)
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 5 || ageNum > 105) {
        alert("Age must be between 5 and 105.");
        return false;
    }

    return true;
}

// Pulls the customer list from the database and fills the table
async function fetchCustomers() {
    try {
        const res = await fetch(API_URL);
        let data = await res.json();

        // Sort the list so IDs stay in order
        data.sort((a, b) => a.id - b.id);

        const tableBody = document.getElementById('customerTableBody');
        tableBody.innerHTML = '';

        // Calculate the stats for the "More Info" dashboard
        const total = data.length;
        const avgAge = total > 0
            ? (data.reduce((sum, c) => sum + c.age, 0) / total).toFixed(1)
            : 0;

        // Update the numbers in the hidden stats panel
        document.getElementById('totalStat').innerText = total;
        document.getElementById('avgAgeStat').innerText = avgAge;

        // Loop through the data and create the table rows
        data.forEach(c => {
            const customerData = JSON.stringify(c).replace(/"/g, '&quot;');
            tableBody.innerHTML += `
                <tr class="hover:bg-blue-50/30 transition-colors">
                    <td class="p-5 font-mono text-gray-400">#${c.id}</td>
                    <td class="p-5 font-bold text-gray-800">${c.name}</td>
                    <td class="p-5 text-gray-600">${c.email}</td>
                    <td class="p-5 text-center">
                        <span class="bg-gray-100/50 px-3 py-1 rounded-full text-sm font-medium text-gray-600">${c.age}</span>
                    </td>
                    <td class="p-5 text-center">
                        <div class="flex justify-center gap-4">
                            <button onclick="prepareEdit(${customerData})" class="btn-edit">Edit</button>
                            <button onclick="deleteCustomer(${c.id})" class="btn-delete">Delete</button>
                        </div>
                    </td>
                </tr>`;
        });
    } catch (err) {
        console.error("Could not fetch customers:", err);
    }
}

// Fills the form with an existing customer's data so we can edit it
function prepareEdit(customer) {
    editMode = true;
    currentEditId = customer.id;

    document.getElementById('name').value = customer.name;
    document.getElementById('email').value = customer.email;
    document.getElementById('age').value = customer.age;

    document.getElementById('cancelBtn').classList.remove('hidden');

    const btn = document.getElementById('submitBtn');
    btn.innerText = "Update Customer";
    btn.classList.replace('bg-blue-600', 'bg-orange-500');
    btn.classList.replace('hover:bg-blue-700', 'hover:bg-orange-600');

    // Scroll back to the top so the user sees the form is ready
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Decides to either Save a new customer or Update an existing one
async function handleSubmit() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const age = document.getElementById('age').value;

    // Stop here if the data is invalid
    if (!validateInput(name, email, age)) return;

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
        console.error("Save failed:", err);
    }
}

// Resets the form and puts the button back to blue "Add" mode
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

// Deletes a customer after a quick pop-up confirmation
async function deleteCustomer(id) {
    if (confirm("Permanently delete this customer record?")) {
        try {
            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (response.ok) fetchCustomers();
        } catch (err) {
            console.error("Delete failed:", err);
        }
    }
}

// Load the customer list when the page opens
fetchCustomers();