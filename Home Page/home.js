let username=localStorage.getItem('userfullname')
let unameblk=document.getElementById('uname')
unameblk.innerHTML=`<p>Hello ${username}!</p>`

let p_icon=document.getElementById('profile-icon')
let p_block=document.getElementById('profile-block')
p_icon.addEventListener('click',()=>{
    p_block.style.display='block'
})
let p_close=document.getElementById('close')
p_close.addEventListener('click',()=>{
    p_block.style.display='none'
})
let l_btn=document.getElementById('lbtn')
l_btn.addEventListener('click',()=>{
    location.href='../Login Page/login.html'
})

let fetchdata=async function(){
    let result=await fetch('https://dummyjson.com/products')
    let data=await result.json()
    displaydata(data)
}
fetchdata()
let product_block=document.getElementById('product-block')
let displaydata=(data)=>{
    data.products.forEach(element => {
       console.log(element)
       let subdiv=document.createElement('div')
       subdiv.innerHTML=`
       <img src=${element.images} height='200px' width='150px'>
       <p>${element.title}</p>
       <strong>Price : ${element.price}$</strong>
       <div>
       <a href="../Wishlist Page/wishlist.html"><button>Add to wishlist</button></a>
       <a href="../Cart Page/cart.html"><button>Add to cart</button></a>
       </div>`
       product_block.appendChild(subdiv)
    });
}

let m_btn=document.getElementById('mbtn')
let menu=document.getElementById('menu')       
m_btn.addEventListener('click',()=>{
    menu.classList.toggle("active")
})
function toggleSidebar() {
      let sidebar = document.getElementById("menu");
      let main = document.getElementById("main");
      let nav = document.getElementById("nav");
      if (sidebar.style.width === "0px") {
        sidebar.style.width = "250px";
        main.style.marginLeft = "250px";
        nav.style.marginLeft = "250px";
      } else {
        sidebar.style.width = "0px";
        main.style.marginLeft = "0px";
        nav.style.marginLeft = "0px";
      }
}