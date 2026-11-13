
import { useEffect, useState } from 'react'

function Checkout({ setView, cartItems, onOrderComplete }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    shippingStreet: '',
    shippingCity: '',
    shippingState: '',
    shippingZip: '',
    billingStreet: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    sameBilling: true,
    cardType: 'Visa',
    last4: ''
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [completedOrder, setCompletedOrder] = useState(null)

  // Load saved account information to prefill checkout.
  useEffect(() => {
    async function loadAccount() {
      try {
        const response = await fetch('/api/account', {
          credentials: 'include'
        })

        if (response.status === 401) {
          setError('Please log in before checking out.')
          return
        }

        const user = await response.json()

        if (!response.ok) {
          setError(user.error || 'Unable to load account.')
          return
        }

        const address = user.shippingAddress || {}

        setForm((previous) => ({
          ...previous,
          name: user.username || '',
          email: user.email || '',
          phone: user.phone || '',
          shippingStreet: address.street || '',
          shippingCity: address.city || '',
          shippingState: address.state || '',
          shippingZip: address.zip || '',
          billingStreet: address.street || '',
          billingCity: address.city || '',
          billingState: address.state || '',
          billingZip: address.zip || ''
        }))
      } catch (error) {
        setError('Unable to reach server.')
      }
    }

    loadAccount()
  }, [])

  // Update checkout fields when the customer types.
  function handleChange(event) {
    const { name, value, type, checked } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Submit checkout information and create the order.
  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!cartItems || cartItems.length === 0) {
      setError('Your cart is empty.')
      return
    }

    const billingAddress = form.sameBilling
      ? {
          street: form.shippingStreet,
          city: form.shippingCity,
          state: form.shippingState,
          zip: form.shippingZip
        }
      : {
          street: form.billingStreet,
          city: form.billingCity,
          state: form.billingState,
          zip: form.billingZip
        }

    const orderDetails = {
      customer: {
        name: form.name,
        email: form.email,
        phone: form.phone
      },
      shippingAddress: {
        street: form.shippingStreet,
        city: form.shippingCity,
        state: form.shippingState,
        zip: form.shippingZip
      },
      billingAddress,
      payment: {
        cardType: form.cardType,
        last4: form.last4
      }
    }

    setLoading(true)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderDetails)
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Unable to submit order.')
        return
      }

      setCompletedOrder(data)

      if (onOrderComplete) {
        onOrderComplete()
      }
    } catch (error) {
      setError('Unable to reach server.')
    } finally {
      setLoading(false)
    }
  }

  const subtotal = (cartItems || []).reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )

  const tax = subtotal * 0.09
  const total = subtotal + tax

  // Display confirmation after the order is submitted.
  if (completedOrder) {
    return (
      <div className="container py-5">
        <h1>Order Confirmation</h1>

        <div className="alert alert-success mt-4">
          Your order has been submitted successfully!
        </div>

        <p>
          <strong>Order ID:</strong> {completedOrder._id}
        </p>

        <p>
          <strong>Status:</strong> {completedOrder.status}
        </p>

        <p>
          <strong>Subtotal:</strong> ${completedOrder.subtotal.toFixed(2)}
        </p>

        <p>
          <strong>Tax:</strong> ${completedOrder.tax.toFixed(2)}
        </p>

        <p>
          <strong>Shipping:</strong> $0.00
        </p>

        <h3>Total: ${completedOrder.total.toFixed(2)}</h3>

        <button
          className="btn btn-dark mt-3"
          onClick={() => setView('shop')}
        >
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <div className="container py-5">
      <h1>Checkout</h1>

      <form onSubmit={handleSubmit} style={{ maxWidth: '700px' }}>
        <h3 className="mt-4">Customer Information</h3>

        <div className="mb-3">
          <label className="form-label">Full Name</label>
          <input
            className="form-control"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Phone</label>
          <input
            className="form-control"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
          />
        </div>

        <h3 className="mt-4">Shipping Address</h3>

        <div className="mb-3">
          <label className="form-label">Street</label>
          <input
            className="form-control"
            name="shippingStreet"
            value={form.shippingStreet}
            onChange={handleChange}
            required
          />
        </div>

        <div className="row">
          <div className="col-md-5 mb-3">
            <label className="form-label">City</label>
            <input
              className="form-control"
              name="shippingCity"
              value={form.shippingCity}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-3 mb-3">
            <label className="form-label">State</label>
            <input
              className="form-control"
              name="shippingState"
              value={form.shippingState}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label">ZIP Code</label>
            <input
              className="form-control"
              name="shippingZip"
              value={form.shippingZip}
              onChange={handleChange}
              maxLength="5"
              required
            />
          </div>
        </div>

        <div className="form-check mt-2">
          <input
            className="form-check-input"
            type="checkbox"
            name="sameBilling"
            checked={form.sameBilling}
            onChange={handleChange}
            id="sameBilling"
          />
          <label className="form-check-label" htmlFor="sameBilling">
            Billing address is the same as shipping address
          </label>
        </div>

        {!form.sameBilling && (
          <>
            <h3 className="mt-4">Billing Address</h3>

            <div className="mb-3">
              <label className="form-label">Street</label>
              <input
                className="form-control"
                name="billingStreet"
                value={form.billingStreet}
                onChange={handleChange}
                required
              />
            </div>

            <div className="row">
              <div className="col-md-5 mb-3">
                <label className="form-label">City</label>
                <input
                  className="form-control"
                  name="billingCity"
                  value={form.billingCity}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">State</label>
                <input
                  className="form-control"
                  name="billingState"
                  value={form.billingState}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">ZIP Code</label>
                <input
                  className="form-control"
                  name="billingZip"
                  value={form.billingZip}
                  onChange={handleChange}
                  maxLength="5"
                  required
                />
              </div>
            </div>
          </>
        )}

        <h3 className="mt-4">Payment Information</h3>

        <div className="mb-3">
          <label className="form-label">Card Type</label>
          <select
            className="form-select"
            name="cardType"
            value={form.cardType}
            onChange={handleChange}
          >
            <option value="Visa">Visa</option>
            <option value="Mastercard">Mastercard</option>
            <option value="American Express">American Express</option>
            <option value="Discover">Discover</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Last 4 Digits of Card</label>
          <input
            className="form-control"
            name="last4"
            value={form.last4}
            onChange={handleChange}
            inputMode="numeric"
            pattern="[0-9]{4}"
            maxLength="4"
            placeholder="1234"
            required
          />
        </div>

        <h3 className="mt-4">Order Summary</h3>

        <p>Subtotal: ${subtotal.toFixed(2)}</p>
        <p>Tax (9%): ${tax.toFixed(2)}</p>
        <p>Shipping: $0.00</p>
        <h4>Total: ${total.toFixed(2)}</h4>

        {error && (
          <div className="alert alert-danger mt-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-dark mt-3"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Place Order'}
        </button>

        <button
          type="button"
          className="btn btn-outline-secondary mt-3 ms-2"
          onClick={() => setView('cart')}
        >
          Back to Cart
        </button>
      </form>
    </div>
  )
}

export default Checkout
