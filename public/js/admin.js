// console.log("All ProductsAll ProductsAll ProductsAll Products")

const deleteProduct = (btn) => {
    console.log(btn.parentNode.querySelector('[name=_csrf]').value)
    const prodId = btn.parentNode.querySelector('[name=productId]').value;
    const csrfToken = btn.parentNode.querySelector('[name=_csrf]').value;

    const productElement = btn.closest('article')

    fetch(`/admin/product/${prodId}`,{
        method:"DELETE",
        headers: {
            'Content-Type': 'application/json',
            // 'Content-Type': 'application/x-www-form-urlencoded',
            'csrf-token': csrfToken
        },
    })
    .then((res) => {
        return res.json()
    })
    .then((data) => {
        console.log(data," DDDDDDDDDDDDDDDDDDDDDD")
        productElement.remove()
    })
}