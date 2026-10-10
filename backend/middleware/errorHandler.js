export const notFound = (req, res) => {
    res.status(404).json({ message: "not found" })
}

// Express 5 automatically forwards rejected promises from async route handlers
// here, so route handlers don't need their own try/catch just to turn a DB/
// network error into a JSON 500 response.
export const errorHandler = (err, req, res, next) => {
    console.error(err)
    const status = err.status || 500
    res.status(status).json({ message: status === 500 ? "something went wrong" : err.message })
}
