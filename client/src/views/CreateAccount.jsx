import { useState } from 'react'

function CreateAccount({ setView }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    phone: ''
  })

  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')

  function handleChange(event) {
    const { name, value } = event.target

    setFormData({
      ...formData,
      [name]: value
    })
  }

  function validateForm() {
    const newErrors = {}

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required.'
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required.'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.'
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = 'Enter a valid email address.'
    }

    const addressStarted =
      formData.street ||
      formData.city ||
      formData.state ||
      formData.zip

    if (addressStarted) {
      if (!formData.street.trim()) {
        newErrors.street = 'Please enter street.'
      }

      if (!formData.city.trim()) {
        newErrors.city = 'Please enter city.'
      }

      if (!formData.state.trim()) {
        newErrors.state = 'Please enter state.'
      }

      if (!/^\d{5}$/.test(formData.zip)) {
        newErrors.zip = 'ZIP code must contain 5 digits.'
      }
    }

    if (
      formData.phone &&
      !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))
    ) {
      newErrors.phone = 'Phone number must contain 10 digits.'
    }

    return newErrors
  }

  async function handleSubmit(event){
    event.preventDefault()
    const validationErrors = validateForm()

    if (Object.keys(validationErrors).length > 0){
      setErrors(validationErrors)
      setSuccess('')
        return
      
    }
    setErrors({})
    setSuccess('')

    try{
      //Send HTTP request express endpoint /api/accounts
      const response = await fetch('/api/accounts', {
        method: 'POST', 
        credentials: 'include', //lets browser send/receive session cookie
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData) //convert form info to json for http traversal
      })

      //convert express json response to JS object
      const data = await response.json()

      if (!response.ok){
        setErrors({
          server: data.error || 'Account creation failed.'
        })
        return
      }

      //Account creation success message then redirection to login page.
      alert(data.message || 'Account Created. Please Log In.')
      setView('account')
    } catch (error) {
      setErrors({
        server: 'Unable to reach server.'
      })
    }
  }

  return (
    <div className="container py-5">
      <h1>Create Account</h1>

      <p className="text-muted">
        Required field *
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-4"
        style={{ maxWidth: '650px' }}
        noValidate
      >

        <div className="mb-3">
          <label className="form-label">
            Username *
          </label>

          <input
            type="text"
            name="username"
            className="form-control"
            value={formData.username}
            onChange={handleChange}
          />

          {errors.username && (
            <div className="text-danger">
              {errors.username}
            </div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">
            Password *
          </label>

          <input
            type="password"
            name="password"
            className="form-control"
            value={formData.password}
            onChange={handleChange}
          />

          {errors.password && (
            <div className="text-danger">
              {errors.password}
            </div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">
            Email *
          </label>

          <input
            type="email"
            name="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
          />

          {errors.email && (
            <div className="text-danger">
              {errors.email}
            </div>
          )}
        </div>

        <hr />

        <div className="mb-3">
          <label className="form-label">
            Street
          </label>

          <input
            type="text"
            name="street"
            className="form-control"
            value={formData.street}
            onChange={handleChange}
          />

          {errors.street && (
            <div className="text-danger">
              {errors.street}
            </div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">
            City
          </label>

          <input
            type="text"
            name="city"
            className="form-control"
            value={formData.city}
            onChange={handleChange}
          />

          {errors.city && (
            <div className="text-danger">
              {errors.city}
            </div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">
            State
          </label>

          <input
            type="text"
            name="state"
            className="form-control"
            value={formData.state}
            onChange={handleChange}
          />

          {errors.state && (
            <div className="text-danger">
              {errors.state}
            </div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">
            ZIP
          </label>

          <input
            type="text"
            name="zip"
            className="form-control"
            value={formData.zip}
            onChange={handleChange}
          />

          {errors.zip && (
            <div className="text-danger">
              {errors.zip}
            </div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">
            Phone
          </label>

          <input
            type="text"
            name="phone"
            className="form-control"
            value={formData.phone}
            onChange={handleChange}
          />

          {errors.phone && (
            <div className="text-danger">
              {errors.phone}
            </div>
          )}

         
        </div>
        
        {errors.server && ( //server error message
          <div className="alert alert-danger">
            {errors.server}
          </div>
        )}


        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-dark"
        >
          Create Account
        </button>

        <button
          type="button"
          className="btn btn-outline-secondary ms-2"
          onClick={() => setView('account')}
        >
          Back to Login
        </button>
      </form>
    </div>
  )
}

export default CreateAccount