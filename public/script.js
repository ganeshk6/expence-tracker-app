document.addEventListener('DOMContentLoaded', ()=>{
    displayExpenses();
})

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

    axios.post('http://localhost:3000/api/signup', data)
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

    axios.post('http://localhost:3000/api/login', data)
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

    const data = {
        amount:amount,
        category:category,
        description:description
    }
    const token = localStorage.getItem('token');
    axios.post('http://localhost:3000/expenses/api/add',data,{
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

const displayExpenses = () => {
    const token = localStorage.getItem('token');
    axios.post('http://localhost:3000/expenses/list', {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }

        })
        .then((res) => {

            const expensesData = res.data.data;
            const tableBody = document.getElementById('expenseListTableBody');

            tableBody.innerHTML = '';

            if (!expensesData || expensesData.length === 0) {

                tableBody.innerHTML = `
                    <tr>
                        <td colspan="4" class="px-6 py-10 text-center text-gray-500">
                            No expenses added yet.
                        </td>
                    </tr>
                `;

                return;
            }

            expensesData.forEach((expense) => {

                const row = document.createElement('tr');

                row.className = 'hover:bg-gray-50 transition';

                row.innerHTML = `
                    <td class="px-6 py-4">
                        ${expense.amount}
                    </td>

                    <td class="px-6 py-4">
                        ${expense.category}
                    </td>

                    <td class="px-6 py-4">
                        ${expense.description}
                    </td>

                    <td class="px-6 py-4">
                        <button
                            class="bg-red-600 text-white px-5 py-3 rounded-md
                                   hover:bg-red-700 transition"
                            onclick="handleDeleteExpense(${expense.id})"
                        >
                            Delete
                        </button>
                    </td>
                `;

                tableBody.appendChild(row);
            });

        })
        .catch((err) => {

            console.error(err);

        });
};

const handleDeleteExpense = (expenseId) => {
    
    const confirmDelete = confirm(
        'Are you sure you want to delete this expense?'
    );

    if (!confirmDelete) {
        return;
    }
    const token = localStorage.getItem('token');
    axios.delete(`http://localhost:3000/expenses/delete/${expenseId}`,{
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then((res) => {

            alert(res.data.message);
            displayExpenses();

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

document.getElementById("buyPremiumBtn").addEventListener("click", async () => {
    try{

        const token = localStorage.getItem('token');
    
        const res = await axios.post('http://localhost:3000/pay', {}, {
            headers:{
                Authorization: `Bearer ${token}`
            }
        })
        console.log("Backend response:", res.data);
        const paymentSessionId = res.data.data.payment_session_id;
        console.log("Payment Session ID:", paymentSessionId);
    
        if (!paymentSessionId) {
            console.error("Payment session ID missing");
            return;
        }
    
        const checkoutOptions = {
            paymentSessionId: paymentSessionId,
            redirectTarget: "_self",
        };
        console.log("Opening Cashfree...");
    
        const result = await cashfree.checkout(checkoutOptions);
    
        console.log("Checkout result:", result);
    }catch(err){
        console.log("Something error durong payment", err.message);
    }
    
})
