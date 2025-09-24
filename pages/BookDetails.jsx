import { bookDetails, bookService } from "../services/book.service.js"

const { useState, useEffect } = React

export function BookDetails({ bookId, onBack }) {

    const [book, setBook] = useState(null)

    useEffect(() => {
        loadBook()
    }, [])

    function loadBook() {
        bookService.get(bookId)
            .then(book => setBook(book))
            .catch(err => console.log('err:', err))
    }

    if (!book) return <div>Loading Details...</div>
    const { title, subtitle, description, pageCount, authors, thumbnail } = book
    return (
        <section className="book-details container">
            <h1>Book Titlte: {title}</h1>
            <h1>Subtitle: {subtitle}</h1>
            <h1>author: {authors}</h1>
            <h1>description: {description}</h1>
            <h1>pageCount: {pageCount}</h1>
            <img src={thumbnail} alt="Book Image" />
            <button onClick={onBack}>Back</button>
        </section>
    )
}