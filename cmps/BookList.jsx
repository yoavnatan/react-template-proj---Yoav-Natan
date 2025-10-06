const { Link } = ReactRouterDOM
const { useEffect, useRef } = React
import { utilService } from "../services/util.service.js"
import { BookPreview } from './BookPreview.jsx'

export function BookList({ books, onRemoveBook }) {

    const liRef = useRef()
    console.log(books)

    function onActive({ target }) {
        console.log('hi')
        console.log(target)
        utilService.animateCSS(target, 'bounce')

    }


    return (
        <ul className="book-list container">
            {books.map(book =>
                <li onClick={() => onActive(event)} key={book.id}>
                    <BookPreview book={book} />
                    <section>
                        <button className="animate__animated animate__bounce " onClick={ev => onRemoveBook(book.id, ev)}>Remove</button>
                        <button class="btn-details"><Link to={`/book/${book.id}`}>Details</Link></button>
                        <button ><Link to={`/book/edit/${book.id}`}>Edit</Link></button>
                    </section>
                </li>
            )}
        </ul>
    )
}