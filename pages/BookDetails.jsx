import { bookService } from "../services/book.service.js"
import { LongTxt } from "../cmps/LongTxt.jsx"

const { useState, useEffect } = React
const { useParams, useNavigate, Link } = ReactRouterDOM


export function BookDetails({ bookId, onBack }) {

    const [book, setBook] = useState(null)
    const params = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        loadBook()
    }, [params.bookId])

    function loadBook() {
        bookService.get(params.bookId)
            .then(book => setBook(book))
            .catch(err => console.log('err:', err))
    }

    function onBack() {
        navigate('/book')
    }

    if (!book) return <div>Loading Details...</div>
    const { title, subtitle, description, pageCount, authors, thumbnail, publishedDate, listPrice } = book
    const { amount, isOnSale } = listPrice
    const date = new Date()
    let priceClass = ''

    return (
        <section className="book-details container">
            {pageCount > 500 && <h1>Serious Reading</h1>}
            {pageCount < 100 && <h1>light Reading</h1>}
            {date.getFullYear() - publishedDate > 10 && <h1>Vintage</h1>}
            {date.getFullYear() - publishedDate < 1 && <h1>New</h1>}
            {isOnSale && <img className='on-sale' src="../assets/img/onsale.png" />}
            <h1>Book Title: {title}</h1>
            <h2>Subtitle: {subtitle}</h2>
            <h3>author: {authors}</h3>
            <p>description:</p> <LongTxt txt={description} />
            <h4>pageCount: {pageCount}</h4>
            <h5 className={amount > 150 ? 'expensive' : 'cheap'}>$ {amount}</h5>
            {pageCount > 200 && pageCount <= 500 && <h3>Descent Reading</h3>}
            <img src={thumbnail} alt="Book Image" />
            <button className="btn-back" onClick={onBack}>Back</button>
        </section>
    )
}