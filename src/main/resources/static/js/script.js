const API_URL = '/api/customers';
let allCustomers = []; // Stores the full list so we can search instantly
let editMode = false;
let currentEditId = null;

// 1. Fetch data from the database
async function fetchCustomers() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();

        // Sort by ID to keep the table organized, then save to global variable
        allCustomers = data.sort((a, b) => a.id - b.id);

        // Draw the table
        renderTable(allCustomers);
    } catch (err) {
        console.error("Fetch error:", err);
    }
}

// 2. The Live Search Logic
function filterCustomers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    // Filter the global array based on name or email
    const filtered = allCustomers.filter(c =>
        c.name.toLowerCase().includes(searchTerm) ||
        c.email.toLowerCase().includes(searchTerm)
    );

    // Redraw the table with only the matches
    renderTable(filtered);
}

// 3. Toggle the Stats Panel
function toggleStats() {
    const panel = document.getElementById('statsPanel');
    panel.classList.toggle('hidden');
}

// 4. Render Table and Update Dynamic Stats
function renderTable(customerList) {
    const tableBody = document.getElementById('customerTableBody');
    tableBody.innerHTML = '';

    // Calculate real-time stats
    const total = customerList.length;
    const avgAge = total > 0
        ? (customerList.reduce((sum, c) => sum + c.age, 0) / total).toFixed(1)
        : 0;

    // Update the UI text
    document.getElementById('totalStat').innerText = total;
    document.getElementById('avgAgeStat').innerText = avgAge;

    // Update the badge next to the search bar
    document.getElementById('customerCount').innerText = `${total} Active Records`;

    // Handle empty search results
    if (customerList.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="p-10 text-center text-gray-400 italic">No customers found.</td></tr>`;
        return;
    }

    // Build the table rows
    customerList.forEach(c => {
        // Escape quotes so we can pass the object safely to the edit function
        const customerData = JSON.stringify(c).replace(/"/g, '&quot;');

        tableBody.innerHTML += `
            <tr class="hover:bg-blue-50/30 transition-all border-b border-gray-50 last:border-0">
                <td class="p-5 font-mono text-xs text-gray-400">#${c.id}</td>
                <td class="p-5 font-bold text-gray-800">${c.name}</td>
                <td class="p-5 text-gray-600 text-sm">${c.email}</td>
                <td class="p-5 text-center">
                    <span class="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold text-gray-500">${c.age}</span>
                </td>
                <td class="p-5 text-center">
                    <div class="flex justify-center gap-4">
                        <button onclick="prepareEdit(${customerData})" class="btn-edit">Edit</button>
                        <button onclick="deleteCustomer(${c.id})" class="btn-delete">Delete</button>
                    </div>
                </td>
            </tr>`;
    });
}

// 5. Add or Update a Customer
async function handleSubmit() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const age = document.getElementById('age').value;

    if (!name || !email || !age) {
        alert("Please fill in all fields.");
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
            fetchCustomers(); // Refresh the list from the database
        }
    } catch (err) {
        console.error("Save error:", err);
    }
}

// 6. Prepare the form for editing
function prepareEdit(customer) {
    editMode = true;
    currentEditId = customer.id;

    document.getElementById('name').value = customer.name;
    document.getElementById('email').value = customer.email;
    document.getElementById('age').value = customer.age;

    document.getElementById('cancelBtn').classList.remove('hidden');
    document.getElementById('submitBtn').innerText = "Update Record";

    // Smoothly scroll back up to the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 7. Reset the form back to "Add" mode
function resetForm() {
    editMode = false;
    currentEditId = null;

    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('age').value = '';

    document.getElementById('cancelBtn').classList.add('hidden');
    document.getElementById('submitBtn').innerText = "Add Customer";
}

// 8. Delete a Customer
async function deleteCustomer(id) {
    if (confirm("Are you sure you want to delete this record?")) {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            fetchCustomers(); // Refresh the list
        } catch (err) {
            console.error("Delete error:", err);
        }
    }
}

// 9. Initialize the app on page load
fetchCustomers();