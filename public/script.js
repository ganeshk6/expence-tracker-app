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
const handlePremiumPayment = async (redirectTarget) => {

    try {

        const token = localStorage.getItem('token');

        const res = await axios.post(
            'http://localhost:3000/pay',
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
                const statusResponse = await axios.get(`http://localhost:3000/payment-status/${orderId}`);
    
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
