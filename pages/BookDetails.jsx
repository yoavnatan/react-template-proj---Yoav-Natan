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
    const { title, subtitle, description, pageCount, authors, thumbnail, publishedDate, listPrice } = book
    const { amount, isOnSale } = listPrice
    console.log(isOnSale)
    const date = new Date()
    let priceClass = ''
    if (amount > 150) priceClass = 'expensive'
    else if (amount < 20) priceClass = 'cheap'
    return (
        <section className="book-details container">
            {pageCount > 500 && <h1>Serious Reading</h1>}
            {pageCount > 200 && pageCount <= 500 && <h1>Descent Reading</h1>}
            {pageCount < 100 && <h1>light Reading</h1>}
            {date.getFullYear() - publishedDate > 10 && <h1>Vintage</h1>}
            {date.getFullYear() - publishedDate < 1 && <h1>New</h1>}
            {isOnSale && <img className='on-sale' src="../assets/img/onsale.png" />}
            <h1>Book Title: {title}</h1>
            <h1>Subtitle: {subtitle}</h1>
            <h1>author: {authors}</h1>
            <h1>description: {description}</h1>
            <h1>pageCount: {pageCount}</h1>
            <h1 className={priceClass}>$ {amount}</h1>
            <img src={thumbnail} alt="Book Image" />
            <button onClick={onBack}>Back</button>
        </section>
    )
}