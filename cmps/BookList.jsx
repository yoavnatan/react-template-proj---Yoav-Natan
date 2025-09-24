import { BookPreview } from './BookPreview.jsx'
const { useState, useEffect } = React

export function BookList({ books }) {

    console.log(books)
    return (
        <ul className="book-list container">
            {books.map(book =>
                <li key={book.id}>
                    <BookPreview book={book} />
                    <section>
                        <button onClick={ev => onRemoveBook(book.id, ev)}>Remove</button>
                        <button onClick={() => onSelectedBookId(book.id)} >Details</button>
                    </section>
                </li>
            )}
        </ul>
    )
}