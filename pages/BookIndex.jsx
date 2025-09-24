import { BookFilter } from "../cmps/BookFilter.jsx"
import { bookService } from "../services/book.service.js"
import { BookList } from "../cmps/BookList.jsx"
import { BookDetails } from "./BookDetails.jsx"

const { useState, useEffect, Fragment } = React

export function BookIndex() {

    const [books, setBooks] = useState(null)
    const [selectedBookId, setSelectedBookId] = useState(null)
    const [filterBy, setFilterBy] = useState(bookService.getDefaultFilter())

    useEffect(() => {
        loadBooks()
    }, [filterBy])

    function loadBooks() {
        bookService.query(filterBy)
            .then(setBooks)
            .catch(err => console.log('err:', err))
    }

    function onRemoveBook(bookId) {
        bookService.remove(bookId)
            .then(() => {
                setBooks(books => books.filter(book => book.id !== bookId))
            })
            .catch(err => console.log('err', err))
    }

    function onSelectedBookId(bookId) {
        setSelectedBookId(bookId)
    }

    function onSetFilterBy(newFilterBy) {
        setFilterBy(prevFilter => ({ ...prevFilter, ...newFilterBy }))
    }


    if (!books) return <div>Loading...</div>
    return (
        <section className="book-index">
            {selectedBookId
                ? <BookDetails onBack={() => setSelectedBookId(null)} bookId={selectedBookId} />
                : <Fragment>
                    <BookFilter onSetFilterBy={onSetFilterBy} defaultFilter={filterBy} />
                    <BookList books={books}
                        onRemoveBook={onRemoveBook}
                        onSelectedBookId={onSelectedBookId}
                    />
                </Fragment>
            }
        </section>
    )
}