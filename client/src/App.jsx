
import { useEffect, useState } from 'react'
import Navbar from './components/navigationbar'
import Home from './views/Home'
import Shop from './views/Shop'
import ProductDetail from './views/ProductsDetail'
import Account from './views/Account'
import CreateAccount from './views/CreateAccount'
import Cart from './views/Cart'
import Checkout from './views/Checkout'

function App() {
  const [view, setView] = useState(
    () => sessionStorage.getItem('currentView') || 'home'
  )
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [cartItems, setCartItems] = useState([])
  const [products, setProducts] = useState([])

  // Load the shop from Express instead of the local JSON file.
  useEffect(() => {
    fetch('/api/products', { credentials: 'include' })
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch(() => setProducts([]))
  }, [])

  // Load the cart saved in the server session.
  useEffect(() => {
    fetch('/api/cart', { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Unable to load cart.')
        }
        return response.json()
      })
      .then((data) => setCartItems(data))
      .catch((error) => console.error(error))
  }, [])

  // Save the current page so refresh stays on the same view.
  useEffect(() => {
    sessionStorage.setItem('currentView', view)
  }, [view])

  // Open the selected product detail page.
  function openProduct(product) {
    setSelectedProduct(product)
    setView('product')
  }

  // Add a product to the server cart.
  async function addToCart(product, color, capacity, quantity) {
    const response = await fetch('/api/cart', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        productId: product.id,
        color,
        capacity,
        quantity
      })
    })

      // Clear the frontend cart after a successful order.
    function handleOrderComplete() {
      setCartItems([])
    }

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Unable to add item to cart.')
    }

    setCartItems(data)
  }

  // Increase the quantity of a cart item.
  async function increaseQuantity(cartId) {
    const item = cartItems.find((item) => item.cartId === cartId)

    if (!item) return

    const response = await fetch(`/api/cart/${encodeURIComponent(cartId)}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        quantity: item.quantity + 1
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error(data.error || 'Unable to update quantity.')
      return
    }

    setCartItems(data)
  }

  // Decrease the quantity of a cart item.
  async function decreaseQuantity(cartId) {
    const item = cartItems.find((item) => item.cartId === cartId)

    if (!item) return

    const response = await fetch(`/api/cart/${encodeURIComponent(cartId)}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        quantity: Math.max(1, item.quantity - 1)
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error(data.error || 'Unable to update quantity.')
      return
    }

    setCartItems(data)
  }

  // Remove an item from the server cart.
  async function removeItem(cartId) {
    const response = await fetch(`/api/cart/${encodeURIComponent(cartId)}`, {
      method: 'DELETE',
      credentials: 'include'
    })

    const data = await response.json()

    if (!response.ok) {
      console.error(data.error || 'Unable to remove item.')
      return
    }

    setCartItems(data)
  }

  // Clear the frontend cart after a successful order.
  function handleOrderComplete() {
    setCartItems([])
  }

  // Calculate the total number of items in the cart.
  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  )

  // Display the selected page.
  function renderView() {
    switch (view) {
      case 'shop':
        return <Shop products={products} onSelectProduct={openProduct} />

      case 'product':
        return (
          <ProductDetail
            product={selectedProduct}
            setView={setView}
            addToCart={addToCart}
          />
        )

      case 'account':
        return <Account setView={setView} />

      case 'createAccount':
        return <CreateAccount setView={setView} />

      case 'cart':
        return (
          <Cart
            cartItems={cartItems}
            increaseQuantity={increaseQuantity}
            decreaseQuantity={decreaseQuantity}
            removeItem={removeItem}
            setView={setView}
          />
        )

      case 'checkout':
        return (
          <Checkout
            setView={setView}
            cartItems={cartItems}
            onOrderComplete={handleOrderComplete}
          />
        )

      case 'home':
      default:
        return (
          <Home
            setView={setView}
            products={products}
            onSelectProduct={openProduct}
          />
        )
    }
  }

  return (
    <>
      <Navbar setView={setView} cartCount={cartCount} />
      {renderView()}
    </>
  )
}

export default App
