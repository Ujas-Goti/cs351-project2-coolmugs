import { useEffect, useState } from 'react'

function AccountView({ setView }) {

  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)

  const [editing, setEditing] = useState(false)

  const [orders, setOrders] = useState([])
  const [showOrders, setShowOrders] = useState(false)
  const [ordersError, setOrdersError] = useState('')

  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    password: ''
  })

  // Check whether the user already has an active session.
useEffect(() => {
  async function loadAccount() {
    try {
      const response = await fetch('/api/account', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.status === 401) {
        setUser(null)
        return
      }

      const data = await response.json()

      if (response.ok) {
        setUser(data)
      }
    } catch (error) {
      console.error('Unable to load account:', error)
    }
  }

  loadAccount()
}, [])


  //send login info to Express api
  async function handleLogin(event) {
    event.preventDefault()

    setError('')

    try{

      const response = await fetch('/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        
        },

        body: JSON.stringify({
          login,
          password
        })
      })

    
    const data = await response.json()

    if (!response.ok) {
      setError(data.error || 'Wrong username or password.')
      return
    }
    setUser(data)
  } catch (error) {
    setError('Unable to reach server.')
  }
}

// Log the current user out and destroy the Express session.
async function handleLogout() {
  try {
    const response = await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include'
    })

    if (!response.ok) {
      setError('Unable to log out.')
      return
    }

    setUser(null)
    setLogin('')
    setPassword('')
  } catch (error) {
    setError('Unable to reach server.')
  }
}

// Load the logged-in user's previous orders.
async function handleViewOrders() {
  setOrdersError('')

  try {
    const response = await fetch('/api/orders', {
      method: 'GET',
      credentials: 'include'
    })

    const data = await response.json()

    if (!response.ok) {
      setOrdersError(data.error || 'Unable to load orders.')
      setShowOrders(true)
      return
    }

    // Accept either a direct array or { orders: [...] }.
    setOrders(Array.isArray(data) ? data : data.orders || [])
    setShowOrders(true)

  } catch (error) {
    setOrdersError('Unable to reach server.')
    setShowOrders(true)
  }
}


// Open the edit form with the current account information.
function startEditing() {
  setEditForm({
    username: user.username || '',
    email: user.email || '',
    street: user.shippingAddress?.street || '',
    city: user.shippingAddress?.city || '',
    state: user.shippingAddress?.state || '',
    zip: user.shippingAddress?.zip || '',
    phone: user.phone || '',
    password: ''
  })

  setError('')
  setEditing(true)
}

// Update the edited account fields as the user types.
function handleEditChange(event) {
  const { name, value } = event.target

  setEditForm({
    ...editForm,
    [name]: value
  })
}

// Send updated account information to Express.
async function handleEditSubmit(event) {
  event.preventDefault()

  setError('')

  try {
    const response = await fetch('/api/account', {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(editForm)
    })

    const data = await response.json()

    if (!response.ok) {
      setError(data.error || 'Unable to update account.')
      return
    }

    setUser(data)
    setEditing(false)

  } catch (error) {
    setError('Unable to reach server.')
  }
}


if (user && showOrders) {
  return (
    <div className="container py-5">
      <h1>Order History</h1>

      {ordersError && (
        <div className="alert alert-danger">
          {ordersError}
        </div>
      )}

      {!ordersError && orders.length === 0 && (
        <p>You do not have any orders yet.</p>
      )}

      {!ordersError && orders.length > 0 && (
        <div className="mt-4">
      {orders.map((order) => (
  <div
    className="card mb-3"
    key={order._id || order.id}
  >
    <div className="card-body">
      <h5 className="card-title">Order Details</h5>

      <p>
        <strong>Order ID:</strong>{' '}
        {order._id || order.id}
      </p>

      <p>
        <strong>Date:</strong>{' '}
        {order.orderDate
          ? new Date(order.orderDate).toLocaleString()
          : 'No date available'}
      </p>

      <p>
        <strong>Status:</strong>{' '}
        {order.status || 'Submitted'}
      </p>

      <hr />

      <h6>Items Purchased</h6>

      {order.items && order.items.length > 0 ? (
        order.items.map((item, index) => (
          <div
            className="d-flex align-items-center mb-3"
            key={`${item.productId}-${index}`}
          >
            <img
              src={item.image}
              alt={item.name}
              style={{
                width: '75px',
                height: '75px',
                objectFit: 'cover'
              }}
              className="rounded me-3"
            />

            <div>
              <strong>{item.name}</strong>
              <p className="mb-0">
                Quantity: {item.quantity}
              </p>
              <p className="mb-0">
                Price: ${(item.unitPrice || 0).toFixed(2)}
              </p>
              <p className="mb-0">
                Line Total: ${(item.lineTotal || 0).toFixed(2)}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p>No item details available.</p>
      )}

      <hr />

      <h6>Shipping Address</h6>

      {order.shippingAddress ? (
        <p>
          {order.shippingAddress.street}<br />
          {order.shippingAddress.city},{' '}
          {order.shippingAddress.state}{' '}
          {order.shippingAddress.zip}
        </p>
      ) : (
        <p>No shipping address available.</p>
      )}

      <hr />

      <h5 className="text-end">
        Total: ${Number(order.total || 0).toFixed(2)}
      </h5>
    </div>
  </div>
      ))}
        </div>
      )}

      <button
        className="btn btn-outline-secondary mt-3"
        onClick={() => setShowOrders(false)}
      >
        Back to Account
      </button>
    </div>
  )
}

if (user && editing) {
  return (
    <div className="container py-5">
      <h1>Edit Account</h1>

      <form
        onSubmit={handleEditSubmit}
        style={{ maxWidth: '650px' }}
        className="mt-4"
      >
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input
            type="text"
            name="username"
            className="form-control"
            value={editForm.username}
            onChange={handleEditChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={editForm.email}
            onChange={handleEditChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Street</label>
          <input
            type="text"
            name="street"
            className="form-control"
            value={editForm.street}
            onChange={handleEditChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">City</label>
          <input
            type="text"
            name="city"
            className="form-control"
            value={editForm.city}
            onChange={handleEditChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">State</label>
          <input
            type="text"
            name="state"
            className="form-control"
            value={editForm.state}
            onChange={handleEditChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">ZIP</label>
          <input
            type="text"
            name="zip"
            className="form-control"
            value={editForm.zip}
            onChange={handleEditChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Phone</label>
          <input
            type="text"
            name="phone"
            className="form-control"
            value={editForm.phone}
            onChange={handleEditChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">
            New Password
          </label>

          <input
            type="password"
            name="password"
            className="form-control"
            value={editForm.password}
            onChange={handleEditChange}
          />

          <small className="text-muted">
            Leave blank to keep your current password.
          </small>
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <button type="submit" className="btn btn-dark">
          Save Changes
        </button>

        <button
          type="button"
          className="btn btn-outline-secondary ms-2"
          onClick={() => setEditing(false)}
        >
          Cancel
        </button>
      </form>
    </div>
  )
}



  if (user) {
  return (
    <div className="container py-5">
      <h1>Account</h1>

      <h2 className="mb-4">
        Welcome, {user.username}
      </h2>

      <div className="card" style={{ maxWidth: '650px' }}>
        <div className="card-body">

          <p>
            <strong>Username:</strong> {user.username}
          </p>

          <p>
            <strong>Email:</strong> {user.email}
          </p>

          <p>
            <strong>Shipping Address:</strong><br />
            {user.shippingAddress?.street || 'No address provided'}
            {user.shippingAddress?.city && `, ${user.shippingAddress.city}`}
            {user.shippingAddress?.state && `, ${user.shippingAddress.state}`}
            {user.shippingAddress?.zip && ` ${user.shippingAddress.zip}`}
          </p>

          <p>
            <strong>Phone:</strong> {user.phone || 'No phone provided'}
          </p>

          <div className="d-flex gap-2 mt-4">
            <button
              className="btn btn-dark"
              onClick={startEditing}
            >
              Edit Account
            </button>

            <button
              className="btn btn-outline-dark"
              onClick={handleViewOrders}
            >
              View Orders
            </button>

            <button
            className="btn btn-outline-danger"
            onClick={handleLogout}
            >
            Log Out
          </button>
          </div>

        </div>
      </div>
    </div>
  )
}




  return (
    <div className="container py-5">
      <h1>Account</h1>

      <form onSubmit={handleLogin} className="mt-4" style={{ maxWidth: '500px' }}>
        <div className="mb-3">
          <label className="form-label">Username or Email</label>

          <input
            type="text"
            className="form-control"
            value={login}
            onChange={(event) => setLogin(event.target.value)}
            required
          />
         
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input type="password" className="form-control" value={password} onChange={(event) => setPassword(event.target.value)}required/>
        </div>
        {error && (<div className="alert alert-danger"> {error}</div>)}
        <button type="submit" className="btn btn-dark">
          Login
        </button>
      </form>

      <hr className="my-4" />

      <p>Create an account here:</p>

      <button
        className="btn btn-outline-dark"
        onClick={() => setView('createAccount')}
      >
        Create Account
      </button>
    </div>
  )
}

export default AccountView