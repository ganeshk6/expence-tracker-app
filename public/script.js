const API_URL = 'http://15.252.146.151';
// const API_URL = 'http://localhost:3000';

let currentPage = 1;
let currentLimit = 10;
const displayExpenses = (page = 1) => {
    const token = localStorage.getItem('token');
    currentPage = page

    axios.post(
        `${API_URL}/expenses/list?page=${page}&limit=${currentLimit}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    )
    .then((res) => {

        const data = res.data.data;
        const expensesData = data.expenses;
        const tableBody = document.getElementById('expenseListTableBody');

        tableBody.innerHTML = '';

        if (!expensesData || expensesData.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="4"
                        class="px-6 py-10 text-center text-gray-500">
                        No expenses added yet.
                    </td>
                </tr>
            `;

            document.getElementById('pagination').innerHTML = '';
            return;
        }

        expensesData.forEach((expense) => {

            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50 transition';

            row.innerHTML = `

                <td class="px-6 py-4">
                    ₹${expense.amount}
                </td>
                <td class="px-6 py-4">
                    ${expense.category}
                </td>
                <td class="px-6 py-4">
                    ${expense.description}
                </td>
                <td class="px-6 py-4">
                    ${expense.note}
                </td>
                <td class="px-6 py-4">
                    <button
                        class="bg-red-600 text-white px-5 py-3
                               rounded-md hover:bg-red-700 transition"
                        onclick="handleDeleteExpense(${expense.id})"
                    >
                        Delete
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        createPagination(data.currentPage, data.totalPages);
    })
    .catch((err) => {
        console.error(err);
    });
};
const limitSelect = document.getElementById('limit');

if (limitSelect) {
    limitSelect.addEventListener('change', function () {
        currentLimit = parseInt(this.value);
        displayExpenses(1);
    });
}

const createPagination = (currentPage, totalPages) => {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    if (totalPages <= 1) {
        return;
    }
    if (currentPage > 1) {

        pagination.innerHTML += `
            <button
                onclick="displayExpenses(${currentPage - 1})"
                class="px-3 py-2 border rounded-md
                       hover:bg-gray-100"
            >
                Previous
            </button>
        `;
    }

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(
        totalPages,
        startPage + 4
    );

    if (endPage - startPage < 4) {
        startPage = Math.max(1,endPage - 4);
    }

    if (startPage > 1) {
        pagination.innerHTML += `
            <button
                onclick="displayExpenses(1)"
                class="px-3 py-2 border rounded-md
                       hover:bg-gray-100"
            >
                1
            </button>
        `;

        if (startPage > 2) {
            pagination.innerHTML += `
                <span class="px-2">...</span>
            `;
        }
    }

    for (let i = startPage; i <= endPage; i++) {

        pagination.innerHTML += `
            <button
                onclick="displayExpenses(${i})"
                class="px-3 py-2 border rounded-md
                    ${
                        i === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-100'
                    }"
            >
                ${i}
            </button>
        `;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            pagination.innerHTML += `
                <span class="px-2">...</span>
            `;
        }

        pagination.innerHTML += `
            <button
                onclick="displayExpenses(${totalPages})"
                class="px-3 py-2 border rounded-md
                       hover:bg-gray-100"
            >
                ${totalPages}
            </button>
        `;
    }

    if (currentPage < totalPages) {
        pagination.innerHTML += `
            <button
                onclick="displayExpenses(${currentPage + 1})"
                class="px-3 py-2 border rounded-md
                       hover:bg-gray-100"
            >
                Next
            </button>
        `;
    }
};

const initCategorySuggestion = () => {

    const descriptionInput = document.getElementById('description');
    const categorySelect = document.getElementById('category');
    const categorySuggestion = document.getElementById('categorySuggestion');

    if (!descriptionInput || !categorySelect || !categorySuggestion) {
        return;
    }

    let suggestionTimer;

    descriptionInput.addEventListener('input', () => {

        clearTimeout(suggestionTimer);

        const description = descriptionInput.value.trim();

        if (!description) {
            categorySuggestion.classList.add('hidden');
            return;
        }

        suggestionTimer = setTimeout(() => {
            suggestCategory(description);
        }, 800);
    });

    const suggestCategory = async (description) => {

        try {

            const token = localStorage.getItem('token');
            categorySuggestion.classList.remove('hidden');
            categorySuggestion.textContent = 'AI is suggesting a category...';

            const response = await axios.post(
                `${API_URL}/expenses/suggest-category`,
                {
                    description: description
                },{
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const category = response.data.data.category;
            categorySelect.value = category;

            categorySuggestion.textContent = `AI suggested: ${category}`;

        } catch (error) {

            console.error('Category suggestion error:',error);
            categorySuggestion.textContent = 'Unable to suggest category';

        }
    };
}

document.addEventListener('DOMContentLoaded', () => {
    initCategorySuggestion();
});
document.addEventListener('DOMContentLoaded', () => {
    currentLimit = 10;
    currentPage = 1;

    displayExpenses(1);
});

const forgotPasswordForm =
    document.getElementById('forgotPasswordForm');

if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = e.target.email.value;

        try {

            const response = await axios.post(
                `${API_URL}/password/forgotpassword`,
                {
                    email: email
                }
            );

            console.log(response.data);
            alert(response.data.message);

        } catch (error) {
            console.error(error);
            const message = error.response?.data?.message || 'Something went wrong';
            alert(message);
        }
    });
}
const resetPasswordForm = document.getElementById('resetPasswordForm');

if(resetPasswordForm){
    resetPasswordForm.addEventListener('submit', async (event) => {    
        event.preventDefault();

        const requestId = document.getElementById('requestId').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
    
        try {
            const response = await axios.post(
                `${API_URL}/password/resetpassword`,
                {
                    requestId,
                    password,
                    confirmPassword
                }
            );
            alert(response.data.message);
            window.location.href = '/login';
    
        } catch (error) {
            console.log(error);
            alert(error.response?.data?.message || 'Something went wrong');
        }
    });
}

const handlecreateAccount = (event) => {
    event.preventDefault();

    const full_name = event.target.name.value;
    const email = event.target.email.value;
    const password = event.target.password.value;

    const data = {
        full_name:full_name,
        email:email,
        password:password
    }

    axios.post(`${API_URL}/api/signup`, data)
    .then((res)=>{
        const token = res.data.data.token;
        localStorage.setItem('token',token);
        alert(res.data.message);
        window.location.href = '/expenses';
    })
    .catch((err)=>{
        console.error(err);
        const message = err.response?.data?.message || 'Something went wrong. Please try again.';

        alert(message);
    })
}

const handleLogin = (event) => {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;

    const data = {
        email:email,
        password:password
    }

    axios.post(`${API_URL}/api/login`, data)
    .then((res)=>{
        const token = res.data.data.token;
        localStorage.setItem('token',token);
        alert(res.data.message);
        window.location.href = '/expenses';
    })
    .catch((err)=>{
        console.error(err);
        const message = err.response?.data?.message || 'Something went wrong. Please try again.';

        alert(message);
    })
}

const handleAddExpence = (event) => {
    event.preventDefault();

    const amount = event.target.amount.value;
    const category = event.target.category.value;
    const description = event.target.description.value;
    const note = event.target.note.value;

    const data = {
        amount:amount,
        category:category,
        description:description,
        note:note
    }
    const token = localStorage.getItem('token');
    axios.post(`${API_URL}/expenses/api/add`,data,{
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then((res)=>{
        if(res.data){
            alert(res.data.message);
            window.location.href = '/expenses';
        }
    })
    .catch((err)=>{
        console.error(err);
        const message = err.response?.data?.message || 'Something went wrong. Please try again.';

        alert(message);
    })
}

const handleDeleteExpense = (expenseId) => {
    
    const confirmDelete = confirm(
        'Are you sure you want to delete this expense?'
    );

    if (!confirmDelete) {
        return;
    }
    const token = localStorage.getItem('token');
    axios.delete(`${API_URL}/expenses/delete/${expenseId}`,{
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then((res) => {

            alert(res.data.message);
            displayExpenses(currentPage);

        })
        .catch((err) => {

            console.error(err);

            const message =
                err.response?.data?.message ||
                'Something went wrong. Please try again.';

            alert(message);
        });
};

const cashfree = Cashfree({
    mode: 'sandbox',
});
const handlePremiumPayment = async (redirectTarget) => {

    try {

        const token = localStorage.getItem('token');

        const res = await axios.post(
            `${API_URL}/pay`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        
        const orderId = res.data.data.order_id;
        const paymentSessionId = res.data.data.payment_session_id;
        
        if (!paymentSessionId) {
            console.error("Payment session ID missing");
            return;
        }

        const checkoutOptions = {
            paymentSessionId,
            redirectTarget
        };

        // let checkoutOptions = {
        //       paymentSessionId,
        //       redirectTarget: document.getElementById("cashfree-checkout"),
        //       appearance:{
        //           width:"325px",
        //           height:"325px",
        //       },
        //   };  

        const result = await cashfree.checkout(checkoutOptions);
        
        if(redirectTarget === "_modal" || redirectTarget === "_inline"){
            console.log(result)
            if(result.error){
                console.log("User as closed the popup or there is some payment error.")
                console.log(result.error);
            }
            if(result.redirect){
                console.log("Payment will be redirected");
            }
            if(result.paymentDetails){
                console.log("Payment has been completed, check for payment status")
                console.log(result.paymentDetails.paymentMessage)
                const statusResponse = await axios.get(`${API_URL}/payment-status/${orderId}`);
    
                alert("Your payment is "+ statusResponse.data.message)
            }
        }
        
    } catch (err) {

        console.error(
            "Payment Error:",
            err.response?.data || err.message
        );

    }
};


// Same tab
document.getElementById("buyPremiumBtn").addEventListener("click", ()=>{
    handlePremiumPayment("_self");
});


// Modal
// document.getElementById("buyPremiumModalBtn")
//     .addEventListener("click", () => {
//         handlePremiumPayment("_modal");
//     });


// New tab
// document.getElementById("buyPremiumNewTabBtn")
//     .addEventListener("click", () => {
//         handlePremiumPayment("_inline");
//     });

const downloadExpenseFile = () => {

    const token = localStorage.getItem("token");

    axios.post(
        `${API_URL}/expenses/download`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    )
    .then((res) => {

        const fileUrl = res.data.data.fileUrl;
        const link = document.createElement("a");

        link.href = fileUrl;
        link.setAttribute("download", "");

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

    })
    .catch((err) => {

        console.error(err);

        alert(
            err.response?.data?.message ||
            "Failed to download expenses"
        );

    });
};

const downloadButton = document.getElementById("download-expense-btn");

if (downloadButton) {
    downloadButton.addEventListener("click",
        downloadExpenseFile
    );
}