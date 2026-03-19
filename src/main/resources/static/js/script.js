const API_URL = '/api/customers';
let editMode = false;
let currentEditId = null;

// Opens and closes the extra stats section at the top of the table
function toggleStats() {
    const panel = document.getElementById('statsPanel');
    panel.classList.toggle('hidden');
}

// Helper to check if the user entered valid information
function validateInput(name, email, age) {
    // Name must be at least 3 characters
    if (name.length <= 2) {
        alert("Name must be more than 2 characters.");
        return false;
    }

    // Email must have an @ symbol and be at least 5 characters long
    if (email.length <= 4 || !email.includes("@")) {
        alert("Please add a valid email.");
        return false;
    }

    // Age must be a number between 5 and 105
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 5 || ageNum > 105) {
        alert("Age must be between 5 and 105.");
        return false;
    }

    return true;
}

// Fetches the latest customer list from the server and updates the page
async function fetchCustomers() {
    try {
        const res = await fetch(API_URL);
        let data = await res.json();

        // Sort by ID so the list stays in order
        data.sort((a, b) => a.id - b.id);

        const tableBody = document.getElementById('customerTableBody');
        tableBody.innerHTML = '';

        // Calculate data for the "More Info" dashboard
        const total = data.length;
        const avgAge = total > 0
            ? (data.reduce((sum, c) => sum + c.age, 0) / total).toFixed(1)
            : 0;

        // Update the visual badges and stats labels
        document.getElementById('customerCount').innerText = `${total} Active Records`;
        document.getElementById('totalStat').innerText = total;
        document.getElementById('avgAgeStat').innerText = avgAge;

        // Create the HTML for each table row
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
        console.error("Error loading customers:", err);
    }
}

// Takes a customer's details and puts them back into the form for editing
function prepareEdit(customer) {
    editMode = true;
    currentEditId = customer.id;

    document.getElementById('name').value = customer.name;
    document.getElementById('email').value = customer.email;
    document.getElementById('age').value = customer.age;

    // Show the cancel button and change the submit button to orange
    document.getElementById('cancelBtn').classList.remove('hidden');

    const btn = document.getElementById('submitBtn');
    btn.innerText = "Update Customer";
    btn.classList.replace('bg-blue-600', 'bg-orange-500');
    btn.classList.replace('hover:bg-blue-700', 'hover:bg-orange-600');

    // Smoothly scroll to the top so the user sees the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Handles saving new customers or updating existing ones
async function handleSubmit() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const age = document.getElementById('age').value;

    // Only proceed if all validation rules pass
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
        console.error("Error saving customer:", err);
    }
}

// Clears the form and switches the UI back to "Add" mode
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

// Deletes a customer after getting a quick confirmation
async function deleteCustomer(id) {
    if (confirm("Are you sure you want to remove this customer?")) {
        try {
            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (response.ok) fetchCustomers();
        } catch (err) {
            console.error("Error deleting customer:", err);
        }
    }
}

// Run the fetch function once when the page first loads
fetchCustomers();