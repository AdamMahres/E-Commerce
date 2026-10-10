export const getProducts = async ({ search, category } = {}) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category) params.set('category', category)
    const query = params.toString()
    const response = await fetch(`http://localhost:5000/products${query ? `?${query}` : ''}`)
    const data = await response.json()
    return data.products
}

export const getCategories = async () => {
    const response = await fetch('http://localhost:5000/products/categories')
    const data = await response.json()
    return data.categories
}

export const getProduct = async (id) => {
    const response = await fetch(`http://localhost:5000/products/${id}`)
    if (!response.ok) {
        throw new Error('product not found')
    }
    const data = await response.json()
    return data.product
}

export const checkout = async (shippingInfo) => {
    const response = await fetch('http://localhost:5000/orders/checkout', {
        method: 'POST',
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shippingInfo)
    })
    const data = await response.json()
    if (!response.ok) {
        throw new Error(data.message || 'checkout failed')
    }
    return data
}

export const confirmOrder = async (orderId, sessionId) => {
    const response = await fetch(`http://localhost:5000/orders/${orderId}/confirm?session_id=${sessionId}`, {
        credentials: 'include'
    })
    if (!response.ok) {
        throw new Error('order not found')
    }
    const data = await response.json()
    return data
}

export const getOrder = async (orderId) => {
    const response = await fetch(`http://localhost:5000/orders/${orderId}`, {
        credentials: 'include'
    })
    if (!response.ok) {
        throw new Error('order not found')
    }
    const data = await response.json()
    return data
}

export const adminGetProducts = async () => {
    const response = await fetch('http://localhost:5000/admin/products', {
        credentials: 'include'
    })
    if (!response.ok) {
        throw new Error('failed to load products')
    }
    const data = await response.json()
    return data.products
}

export const getOrders = async () => {
    const response = await fetch('http://localhost:5000/orders', {
        credentials: 'include'
    })
    const data = await response.json()
    return data.orders
}

export const adminCreateProduct = async (product) => {
    const response = await fetch('http://localhost:5000/admin/products', {
        method: 'POST',
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product)
    })
    const data = await response.json()
    if (!response.ok) {
        throw new Error(data.message || 'failed to create product')
    }
    return data.product
}

export const adminUpdateProduct = async (id, product) => {
    const response = await fetch(`http://localhost:5000/admin/products/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product)
    })
    const data = await response.json()
    if (!response.ok) {
        throw new Error(data.message || 'failed to update product')
    }
    return data.product
}

export const adminDeleteProduct = async (id) => {
    const response = await fetch(`http://localhost:5000/admin/products/${id}`, {
        method: 'DELETE',
        credentials: 'include'
    })
    const data = await response.json()
    if (!response.ok) {
        throw new Error(data.message || 'failed to delete product')
    }
    return data
}

export const adminGetOrders = async () => {
    const response = await fetch('http://localhost:5000/admin/orders', {
        credentials: 'include'
    })
    if (!response.ok) {
        throw new Error('failed to load orders')
    }
    const data = await response.json()
    return data.orders
}
