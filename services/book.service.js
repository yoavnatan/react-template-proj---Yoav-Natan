import { utilService } from './util.service.js'
import { storageService } from './async-storage.service.js'

const book_KEY = 'bookDB'
var gFilterBy = { title: '', minPageCount: 0 }
_createBooks()

export const bookService = {
    query,
    get,
    remove,
    save,
    getEmptybook,
    getNextbookId,
    getFilterBy,
    setFilterBy,
    getDefaultFilter
}

function query(filterBy = {}) {
    return storageService.query(book_KEY)
        .then(books => {
            if (filterBy.title) {
                const regex = new RegExp(filterBy.title, 'i')
                books = books.filter(book => regex.test(book.title))
            }
            if (filterBy.minPrice) {
                books = books.filter(book => book.listPrice.amount >= filterBy.minPrice)
            }
            return books
        })
}

function get(bookId) {
    return storageService.get(book_KEY, bookId)
}

function remove(bookId) {
    return storageService.remove(book_KEY, bookId)
}

function save(book) {
    if (book.id) {
        return storageService.put(book_KEY, book)
    } else {
        return storageService.post(book_KEY, book)
    }
}

function getEmptybook(vendor = '', maxSpeed = 0) {
    return { id: '', vendor, maxSpeed }
}

function getFilterBy() {
    return { ...gFilterBy }
}

function setFilterBy(filterBy = {}) {
    if (filterBy.txt !== undefined) gFilterBy.txt = filterBy.txt
    if (filterBy.minPrice !== undefined) gFilterBy.minPrice = filterBy.minPrice
    return gFilterBy
}

function getNextbookId(bookId) {
    return storageService.query(book_KEY)
        .then(books => {
            let nextbookIdx = books.findIndex(book => book.id === bookId) + 1
            if (nextbookIdx === books.length) nextbookIdx = 0
            return books[nextbookIdx].id
        })
}

function getDefaultFilter() {
    return { title: '', minPrice: '' }
}

function _createBooks() {
    let books = utilService.loadFromStorage(book_KEY)
    if (!books || !books.length) {

        const ctgs = ['Love', 'Fiction', 'Poetry', 'Computers', 'Religion']
        const books = []
        for (let i = 0; i < 3; i++) {
            const book = {
                id: utilService.makeId(),
                title: utilService.makeLorem(2),
                subtitle: utilService.makeLorem(4),
                authors: [
                    utilService.makeLorem(1)
                ],
                publishedDate: utilService.getRandomIntInclusive(1950, 2024),
                description: utilService.makeLorem(20),
                pageCount: utilService.getRandomIntInclusive(20, 600),
                categories: [ctgs[utilService.getRandomIntInclusive(0, ctgs.length - 1)]],
                thumbnail: `http://coding-academy.org/books-photos/${i + 1}.jpg`,
                language: "en",
                listPrice: {
                    amount: utilService.getRandomIntInclusive(80, 500),
                    currencyCode: "EUR",
                    // isOnSale: Math.random() > 0.7
                    isOnSale: true
                }
            }
            books.push(book)
        }
        console.log('books', books)
        utilService.saveToStorage(book_KEY, books)
    }
}


function _createbook(vendor, maxSpeed = 250) {
    const book = getEmptybook(vendor, maxSpeed)
    book.id = utilService.makeId()
    return book
}