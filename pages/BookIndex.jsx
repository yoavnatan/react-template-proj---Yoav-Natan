const { Link } = ReactRouterDOM

import { BookFilter } from "../cmps/BookFilter.jsx"
import { bookService } from "../services/book.service.js"
import { BookList } from "../cmps/BookList.jsx"
import { BookDetails } from "./BookDetails.jsx"

const { useState, useEffect } = React

export function BookIndex() {

    const [books, setBooks] = useState(null)
    const [filterBy, setFilterBy] = useState(bookService.getDefaultFilter())

    useEffect(() => {
        loadBooks()
    }, [filterBy])

    function loadBooks() {
        bookService.query(filterBy)
            .then(setBooks)
            .catch(err => {
                console.log('err:', err)
                showErrorMsg(`Cannot load books`)
            })

    }

    function onRemoveBook(bookId) {
        bookService.remove(bookId)
            .then(() => {
                showSuccessMsg('Book removed successfully!')
                setBooks(books => books.filter(book => book.id !== bookId))
            })
            .catch(err => console.log('err', err))
    }


    function onSetFilterBy(newFilterBy) {
        setFilterBy(prevFilter => ({ ...prevFilter, ...newFilterBy }))
    }

    if (!books) return <div>Loading...</div>
    return (
        <section className="book-index">
            <BookFilter onSetFilterBy={onSetFilterBy} defaultFilter={filterBy} />
            <section className="container">
                <button className="btn edit-link"><Link to="/book/edit">Add Book</Link></button>
                <button className="btn add-link"><Link to="/book/add">Add by Google</Link></button>
            </section>
            <BookList
                books={books}
                onRemoveBook={onRemoveBook}
            />
        </section>
    )
}