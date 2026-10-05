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
        alert(res.data.message);
        window.location.href = '/login';
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
        alert(res.data.message);
        window.location.href = '/';
    })
    .catch((err)=>{
        console.error(err);
        const message = err.response?.data?.message || 'Something went wrong. Please try again.';

        alert(message);
    })
}