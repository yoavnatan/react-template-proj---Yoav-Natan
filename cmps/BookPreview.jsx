export function BookPreview({ book }) {

    const { title, listPrice } = book
    // console.log(book)
    const { amount } = listPrice
    return (
        <article className="book-preview">
            <h2>{title}</h2>
            <h4>{amount}</h4>
        </article>
    )
}