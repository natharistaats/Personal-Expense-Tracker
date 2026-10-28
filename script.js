
// Get HTML elements
const transactionForm = document.getElementById("transactionForm");
const typeInput = document.getElementById("type");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const filterInput = document.getElementById("filter");
const transactionTable = document.getElementById("transactionTable");
const emptyMessage = document.getElementById("emptyMessage");

// Load saved transactions from localStorage
let transactions = JSON.parse(
    localStorage.getItem("transactions") || "[]"
);

// Set today's date as the default
function setTodayDate() {
    dateInput.value = new Date().toLocaleDateString("en-CA");
}

setTodayDate();

// Save transactions in localStorage
function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Format amounts in Sri Lankan Rupees
function formatMoney(amount) {
    return "LKR " + amount.toLocaleString("en-LK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Calculate and display totals
function updateSummary() {
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach(function(transaction) {
        if (transaction.type === "Income") {
            totalIncome += transaction.amount;
        } else {
            totalExpenses += transaction.amount;
        }
    });

    const balance = totalIncome - totalExpenses;

    document.getElementById("totalIncome").textContent =
        formatMoney(totalIncome);

    document.getElementById("totalExpenses").textContent =
        formatMoney(totalExpenses);

    document.getElementById("currentBalance").textContent =
        formatMoney(balance);
}

// Display transactions in the table
function displayTransactions() {
    transactionTable.replaceChildren();

    const selectedFilter = filterInput.value;

    const filteredTransactions = transactions.filter(function(transaction) {
        return selectedFilter === "All" ||
               transaction.type === selectedFilter;
    });

    emptyMessage.style.display =
        filteredTransactions.length === 0 ? "block" : "none";

    filteredTransactions.forEach(function(transaction) {
        const row = document.createElement("tr");

        // Date
        const dateCell = document.createElement("td");
        dateCell.textContent = transaction.date;
        row.appendChild(dateCell);

        // Description
        const descriptionCell = document.createElement("td");
        descriptionCell.textContent = transaction.description;
        row.appendChild(descriptionCell);

        // Type
        const typeCell = document.createElement("td");
        typeCell.textContent = transaction.type;
        typeCell.className = transaction.type === "Income"
            ? "income-text"
            : "expense-text";
        row.appendChild(typeCell);

        // Category
        const categoryCell = document.createElement("td");
        categoryCell.textContent = transaction.category;
        row.appendChild(categoryCell);

        // Amount
        const amountCell = document.createElement("td");
        amountCell.textContent = formatMoney(transaction.amount);
        row.appendChild(amountCell);

        // Delete button
        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.type = "button";

        deleteButton.addEventListener("click", function() {
            deleteTransaction(transaction.id);
        });

        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);

        transactionTable.appendChild(row);
    });
}

// Add a new transaction
transactionForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const type = typeInput.value;
    const description = descriptionInput.value.trim();
    const amount = Number(amountInput.value);
    const category = categoryInput.value;
    const date = dateInput.value;

    // Validate the form
    if (!type || !description || !category || !date ||
        !Number.isFinite(amount) || amount <= 0) {

        alert("Please complete all fields and enter an amount greater than zero.");
        return;
    }

    // Create transaction object
    const transaction = {
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        type: type,
        description: description,
        amount: amount,
        category: category,
        date: date
    };

    // Add transaction to the array
    transactions.push(transaction);

    // Save and update the page
    saveTransactions();
    updateSummary();
    displayTransactions();

    // Clear the form
    transactionForm.reset();
    setTodayDate();

    alert("Transaction added successfully!");
});

// Delete a transaction
function deleteTransaction(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) {
        return;
    }

    transactions = transactions.filter(function(transaction) {
        return transaction.id !== id;
    });

    saveTransactions();
    updateSummary();
    displayTransactions();
}

// Filter transactions
filterInput.addEventListener("change", function() {
    displayTransactions();
});

// Restore today's date after clearing the form
transactionForm.addEventListener("reset", function() {
    setTimeout(setTodayDate, 0);
});

// Display saved transactions when the page loads
updateSummary();
displayTransactions();
