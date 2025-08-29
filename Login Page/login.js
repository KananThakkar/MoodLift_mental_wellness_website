let registereddata=JSON.parse(localStorage.getItem('registereddata'))
console.log(registereddata)

let email=document.getElementById('email')
let pswd=document.getElementById('pswd')
let btn=document.getElementById('btn')

btn.addEventListener('click',(e)=>{
    e.preventDefault()
    let userdata=registereddata.find(ele=>ele.email===email.value && ele.password===pswd.value)
    if(userdata){
        alert('Login Successfull!!!')
        location.href='../Home Page/home.html'
        localStorage.setItem('userfullname',userdata.uname)
    }
    else{
        alert('Wrong Credentials or User Not Found!!!')
    }
})