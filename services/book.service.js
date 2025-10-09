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
    getEmptyBook,
    getNextbookId,
    getFilterBy,
    setFilterBy,
    getDefaultFilter,
    addReview,
    removeReview,
    searchByGoogle,
    demoSerach,
    addGoogleBook,
    googleQuery,
    getFilterFromSearchParams,
    getEmptyReview
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
            if (filterBy.minPageCount) {
                books = books.filter(book => book.pageCount >= filterBy.minPageCount)
            }
            console.log(books, "books")

            return books
        })
}

function get(bookId) {
    return storageService.get(book_KEY, bookId)
        .then(_setNextPrevBookId)
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

function getEmptyBook(title = '', amount = '', pageCount = 100) {
    return {
        title,
        listPrice: {
            amount
        },
        pageCount
    }
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
    return { title: '', minPrice: '', minPageCount: 100 }
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
                },
                reviews: []
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

function addReview(bookId, review) {

    return get(bookId)
        .then(book => {
            console.log(book)
            book.reviews.push(review)
            return book
        })
        .then(save)
}

function removeReview(bookId, reviewToRemove) {
    return get(bookId)
        .then(book => {
            book.reviews = book.reviews.filter(review => review.id !== reviewToRemove)
            return book
        })
        .then(save)
        .then(book => book.reviews)
}

function _setNextPrevBookId(book) {
    return query().then((books) => {
        const bookIdx = books.findIndex((currBook) => currBook.id === book.id)
        const nextBook = books[bookIdx + 1] ? books[bookIdx + 1] : books[0]
        const prevBook = books[bookIdx - 1] ? books[bookIdx - 1] : books[books.length - 1]
        book.nextBookId = nextBook.id
        book.prevBookId = prevBook.id
        return book
    })
}

function getFilterFromSearchParams(searchParams) {
    const txt = searchParams.get('title') || ''
    const minSpeed = searchParams.get('minPrice') || ''
    const minPageCount = searchParams.get('minPageCount') || 100
    return {
        txt,
        minSpeed,
        minPageCount
    }
}

function getEmptyReview() {
    return {
        id: utilService.makeId(),
        name: '',
        rating: '',
        readAt: '',
    }
}
//GOOGLE BOOKS SERVICE//

const GOOGLE_KEY = 'googleDB'

function searchByGoogle(searchVal) {
    console.log('searching')

    const url = `https://www.googleapis.com/books/v1/volumes?printType=books&q=${searchVal}`
    return axios.get(url)
        .then(res => res.data.items
        )
        .then(googleQuery)

}

function demoSerach() {
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
                isOnSale: Math.random() > 0.7
            },
            reviews: []
        }
        books.push(book)
    }
    return books
}


function getDemoBook() {


}

function addGoogleBook(book) {
    console.log(book)
    return query()
        .then(books => {
            if (books.some(item => item.title === book.title)) return Promise.reject('This book is alreay exist')
            else return storageService.post(book_KEY, book)
        })

}

function convertApiData(item) {

    return (
        {
            id: utilService.makeId(),
            title: item.title,
            categories: item.categories,
            description: item.description ? item.description : utilService.makeLorem(20),
            thumbnail: item.imageLinks.thumbnail,
            authors: [],
            publishedDate: item.publishedDate,
            pageCount: item.pageCount,
            listPrice: {
                amount: utilService.getRandomIntInclusive(80, 500),
                currencyCode: "EUR",
                isOnSale: Math.random() > 0.7
            },
            reviews: []
        }
    )


}


function googleQuery(items) {
    // const items = [
    //     {
    //         "kind": "books#volume",
    //         "id": "qWs20foSm_4C",
    //         "etag": "qIWhS9f3/c0",
    //         "selfLink": "https://www.googleapis.com/books/v1/volumes/qWs20foSm_4C",
    //         "volumeInfo": {
    //             "title": "Toxicological Profile for DDT/DDD/DDE (Update)",
    //             "authors": [
    //                 "Obaid Faroon"
    //             ],
    //             "publisher": "DIANE Publishing",
    //             "publishedDate": "2010-08",
    //             "description": "DDT is a pesticide that was once widely used to control insects. Both DDD and DDE are breakdown products of DDT. This profile includes: (1) The examination, summary, and interpretation of available toxicologic info. and epidemiologic evaluations on DDT/DDD/DDE to ascertain the levels of significant human exposure for the substance and the associated chronic health effects; (2) A determination of whether adequate info. on the health effects of DDT/DDD/DDE is available to determine levels of exposure that present a significant risk to human health of chronic health effects; and (3) Identification of toxicologic testing needed to identify the types or levels of exposure that may present significant risk of adverse health effects in humans. Illus.",
    //             "industryIdentifiers": [
    //                 {
    //                     "type": "ISBN_13",
    //                     "identifier": "9781437930672"
    //                 },
    //                 {
    //                     "type": "ISBN_10",
    //                     "identifier": "1437930670"
    //                 }
    //             ],
    //             "readingModes": {
    //                 "text": true,
    //                 "image": true
    //             },
    //             "pageCount": 497,
    //             "printType": "BOOK",
    //             "categories": [
    //                 "Medical"
    //             ],
    //             "maturityRating": "NOT_MATURE",
    //             "allowAnonLogging": false,
    //             "contentVersion": "0.3.4.0.preview.3",
    //             "panelizationSummary": {
    //                 "containsEpubBubbles": false,
    //                 "containsImageBubbles": false
    //             },
    //             "imageLinks": {
    //                 "smallThumbnail": "http://books.google.com/books/content?id=qWs20foSm_4C&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api",
    //                 "thumbnail": "http://books.google.com/books/content?id=qWs20foSm_4C&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api"
    //             },
    //             "language": "en",
    //             "previewLink": "http://books.google.com/books?id=qWs20foSm_4C&pg=PA196&dq=ddd&hl=&as_pt=BOOKS&cd=1&source=gbs_api",
    //             "infoLink": "http://books.google.com/books?id=qWs20foSm_4C&dq=ddd&hl=&as_pt=BOOKS&source=gbs_api",
    //             "canonicalVolumeLink": "https://books.google.com/books/about/Toxicological_Profile_for_DDT_DDD_DDE_Up.html?hl=&id=qWs20foSm_4C"
    //         },
    //         "saleInfo": {
    //             "country": "IL",
    //             "saleability": "NOT_FOR_SALE",
    //             "isEbook": false
    //         },
    //         "accessInfo": {
    //             "country": "IL",
    //             "viewability": "ALL_PAGES",
    //             "embeddable": true,
    //             "publicDomain": false,
    //             "textToSpeechPermission": "ALLOWED",
    //             "epub": {
    //                 "isAvailable": true
    //             },
    //             "pdf": {
    //                 "isAvailable": true
    //             },
    //             "webReaderLink": "http://play.google.com/books/reader?id=qWs20foSm_4C&hl=&as_pt=BOOKS&source=gbs_api",
    //             "accessViewStatus": "SAMPLE",
    //             "quoteSharingAllowed": false
    //         },
    //         "searchInfo": {
    //             "textSnippet": "... <b>DDD</b>, and DDE reproductive toxicity by interfering with the mechanism of action in this organ. Mitigation strategies developed in the future for other lipophilic pesticides should be investigated for their applicability to DDT, DDE, and <b>DDD</b>&nbsp;..."
    //         }
    //     },
    //     {
    //         "kind": "books#volume",
    //         "id": "MkkdEuXYeOMC",
    //         "etag": "z7vLTdW6UDo",
    //         "selfLink": "https://www.googleapis.com/books/v1/volumes/MkkdEuXYeOMC",
    //         "volumeInfo": {
    //             "title": "Toxicological Profile for DDT, DDE, and DDD",
    //             "subtitle": "Draft",
    //             "publishedDate": "1989",
    //             "industryIdentifiers": [
    //                 {
    //                     "type": "OTHER",
    //                     "identifier": "MINN:31951D01977683X"
    //                 }
    //             ],
    //             "readingModes": {
    //                 "text": false,
    //                 "image": true
    //             },
    //             "pageCount": 448,
    //             "printType": "BOOK",
    //             "categories": [
    //                 "DDT (Insecticide)"
    //             ],
    //             "maturityRating": "NOT_MATURE",
    //             "allowAnonLogging": false,
    //             "contentVersion": "0.2.2.0.full.1",
    //             "panelizationSummary": {
    //                 "containsEpubBubbles": false,
    //                 "containsImageBubbles": false
    //             },
    //             "imageLinks": {
    //                 "smallThumbnail": "http://books.google.com/books/content?id=MkkdEuXYeOMC&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api",
    //                 "thumbnail": "http://books.google.com/books/content?id=MkkdEuXYeOMC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api"
    //             },
    //             "language": "en",
    //             "previewLink": "http://books.google.com/books?id=MkkdEuXYeOMC&pg=PA270&dq=ddd&hl=&as_pt=BOOKS&cd=2&source=gbs_api",
    //             "infoLink": "https://play.google.com/store/books/details?id=MkkdEuXYeOMC&source=gbs_api",
    //             "canonicalVolumeLink": "https://play.google.com/store/books/details?id=MkkdEuXYeOMC"
    //         },
    //         "saleInfo": {
    //             "country": "IL",
    //             "saleability": "FREE",
    //             "isEbook": true,
    //             "buyLink": "https://play.google.com/store/books/details?id=MkkdEuXYeOMC&rdid=book-MkkdEuXYeOMC&rdot=1&source=gbs_api"
    //         },
    //         "accessInfo": {
    //             "country": "IL",
    //             "viewability": "ALL_PAGES",
    //             "embeddable": true,
    //             "publicDomain": true,
    //             "textToSpeechPermission": "ALLOWED",
    //             "epub": {
    //                 "isAvailable": false,
    //                 "downloadLink": "http://books.google.com/books/download/Toxicological_Profile_for_DDT_DDE_and_DD.epub?id=MkkdEuXYeOMC&hl=&output=epub&source=gbs_api"
    //             },
    //             "pdf": {
    //                 "isAvailable": false
    //             },
    //             "webReaderLink": "http://play.google.com/books/reader?id=MkkdEuXYeOMC&hl=&as_pt=BOOKS&source=gbs_api",
    //             "accessViewStatus": "FULL_PUBLIC_DOMAIN",
    //             "quoteSharingAllowed": false
    //         },
    //         "searchInfo": {
    //             "textSnippet": "... <b>DDD</b> was found in monitoring wells from the upper aquifer at Pristine , Inc. , an industrial site in Reading , Ohio at 0-0.14 μg / L but not in the lower aquifer or in water supply samples that were taken from the lower aquifer . No p&nbsp;..."
    //         }
    //     },
    //     {
    //         "kind": "books#volume",
    //         "id": "K6L3Jc2ab7gC",
    //         "etag": "kNOLiofTFR8",
    //         "selfLink": "https://www.googleapis.com/books/v1/volumes/K6L3Jc2ab7gC",
    //         "volumeInfo": {
    //             "title": "Proceedings of the Chemotherapy Conference on Ortho Para'DDD",
    //             "subtitle": "November 6, 1970, Jack Masur Auditorium, Bethesda, Maryland",
    //             "authors": [
    //                 "Lawrence E. Broder",
    //                 "Stephen K. Carter"
    //             ],
    //             "publishedDate": "1970",
    //             "industryIdentifiers": [
    //                 {
    //                     "type": "OTHER",
    //                     "identifier": "MINN:30000010688384"
    //                 }
    //             ],
    //             "readingModes": {
    //                 "text": false,
    //                 "image": true
    //             },
    //             "pageCount": 94,
    //             "printType": "BOOK",
    //             "categories": [
    //                 "Cancer"
    //             ],
    //             "maturityRating": "NOT_MATURE",
    //             "allowAnonLogging": false,
    //             "contentVersion": "0.5.6.0.full.1",
    //             "panelizationSummary": {
    //                 "containsEpubBubbles": false,
    //                 "containsImageBubbles": false
    //             },
    //             "imageLinks": {
    //                 "smallThumbnail": "http://books.google.com/books/content?id=K6L3Jc2ab7gC&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api",
    //                 "thumbnail": "http://books.google.com/books/content?id=K6L3Jc2ab7gC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api"
    //             },
    //             "language": "en",
    //             "previewLink": "http://books.google.com/books?id=K6L3Jc2ab7gC&pg=PA19&dq=ddd&hl=&as_pt=BOOKS&cd=3&source=gbs_api",
    //             "infoLink": "https://play.google.com/store/books/details?id=K6L3Jc2ab7gC&source=gbs_api",
    //             "canonicalVolumeLink": "https://play.google.com/store/books/details?id=K6L3Jc2ab7gC"
    //         },
    //         "saleInfo": {
    //             "country": "IL",
    //             "saleability": "FREE",
    //             "isEbook": true,
    //             "buyLink": "https://play.google.com/store/books/details?id=K6L3Jc2ab7gC&rdid=book-K6L3Jc2ab7gC&rdot=1&source=gbs_api"
    //         },
    //         "accessInfo": {
    //             "country": "IL",
    //             "viewability": "ALL_PAGES",
    //             "embeddable": true,
    //             "publicDomain": true,
    //             "textToSpeechPermission": "ALLOWED",
    //             "epub": {
    //                 "isAvailable": false,
    //                 "downloadLink": "http://books.google.com/books/download/Proceedings_of_the_Chemotherapy_Conferen.epub?id=K6L3Jc2ab7gC&hl=&output=epub&source=gbs_api"
    //             },
    //             "pdf": {
    //                 "isAvailable": false
    //             },
    //             "webReaderLink": "http://play.google.com/books/reader?id=K6L3Jc2ab7gC&hl=&as_pt=BOOKS&source=gbs_api",
    //             "accessViewStatus": "FULL_PUBLIC_DOMAIN",
    //             "quoteSharingAllowed": false
    //         },
    //         "searchInfo": {
    //             "textSnippet": "... <b>DDD</b> - treated dogs in either a medium containing ACTH or a medium not containing ACTH , we determined that <b>DDD</b> has no effect on baseline steroid production but completely inhibits steroid production in re- sponse to ACTH . The attempt&nbsp;..."
    //         }
    //     },
    //     {
    //         "kind": "books#volume",
    //         "id": "Pz8XwzHZ90wC",
    //         "etag": "McvwJ6/XveA",
    //         "selfLink": "https://www.googleapis.com/books/v1/volumes/Pz8XwzHZ90wC",
    //         "volumeInfo": {
    //             "title": "Draft Toxicological Profile for DDT, DDE, and DDD",
    //             "publishedDate": "2000",
    //             "industryIdentifiers": [
    //                 {
    //                     "type": "OTHER",
    //                     "identifier": "UOM:39015050549990"
    //                 }
    //             ],
    //             "readingModes": {
    //                 "text": false,
    //                 "image": true
    //             },
    //             "pageCount": 446,
    //             "printType": "BOOK",
    //             "categories": [
    //                 "DDT (Insecticide)"
    //             ],
    //             "maturityRating": "NOT_MATURE",
    //             "allowAnonLogging": false,
    //             "contentVersion": "0.12.9.0.full.1",
    //             "panelizationSummary": {
    //                 "containsEpubBubbles": false,
    //                 "containsImageBubbles": false
    //             },
    //             "imageLinks": {
    //                 "smallThumbnail": "http://books.google.com/books/content?id=Pz8XwzHZ90wC&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api",
    //                 "thumbnail": "http://books.google.com/books/content?id=Pz8XwzHZ90wC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api"
    //             },
    //             "language": "en",
    //             "previewLink": "http://books.google.com/books?id=Pz8XwzHZ90wC&pg=PA270&dq=ddd&hl=&as_pt=BOOKS&cd=4&source=gbs_api",
    //             "infoLink": "https://play.google.com/store/books/details?id=Pz8XwzHZ90wC&source=gbs_api",
    //             "canonicalVolumeLink": "https://play.google.com/store/books/details?id=Pz8XwzHZ90wC"
    //         },
    //         "saleInfo": {
    //             "country": "IL",
    //             "saleability": "FREE",
    //             "isEbook": true,
    //             "buyLink": "https://play.google.com/store/books/details?id=Pz8XwzHZ90wC&rdid=book-Pz8XwzHZ90wC&rdot=1&source=gbs_api"
    //         },
    //         "accessInfo": {
    //             "country": "IL",
    //             "viewability": "ALL_PAGES",
    //             "embeddable": true,
    //             "publicDomain": true,
    //             "textToSpeechPermission": "ALLOWED",
    //             "epub": {
    //                 "isAvailable": false,
    //                 "downloadLink": "http://books.google.com/books/download/Draft_Toxicological_Profile_for_DDT_DDE.epub?id=Pz8XwzHZ90wC&hl=&output=epub&source=gbs_api"
    //             },
    //             "pdf": {
    //                 "isAvailable": false
    //             },
    //             "webReaderLink": "http://play.google.com/books/reader?id=Pz8XwzHZ90wC&hl=&as_pt=BOOKS&source=gbs_api",
    //             "accessViewStatus": "FULL_PUBLIC_DOMAIN",
    //             "quoteSharingAllowed": false
    //         },
    //         "searchInfo": {
    //             "textSnippet": "... <b>DDD</b> was found in monitoring wells from the upper aquifer at Pristine , Inc. , an industrial site in Reading , Ohio at 0-0.14 μg / L but not in the lower aquifer or in water supply samples that were taken from the lower aquifer . No p&nbsp;..."
    //         }
    //     },
    //     {
    //         "kind": "books#volume",
    //         "id": "PgYvDwAAQBAJ",
    //         "etag": "5JDMqmihOO4",
    //         "selfLink": "https://www.googleapis.com/books/v1/volumes/PgYvDwAAQBAJ",
    //         "volumeInfo": {
    //             "title": "The Art of Debugging with GDB, DDD, and Eclipse",
    //             "authors": [
    //                 "Norman Matloff",
    //                 "Peter Jay Salzman"
    //             ],
    //             "publisher": "No Starch Press",
    //             "publishedDate": "2008-09-15",
    //             "description": "Debugging is crucial to successful software development, but even many experienced programmers find it challenging. Sophisticated debugging tools are available, yet it may be difficult to determine which features are useful in which situations. The Art of Debugging is your guide to making the debugging process more efficient and effective. The Art of Debugging illustrates the use three of the most popular debugging tools on Linux/Unix platforms: GDB, DDD, and Eclipse. The text-command based GDB (the GNU Project Debugger) is included with most distributions. DDD is a popular GUI front end for GDB, while Eclipse provides a complete integrated development environment. In addition to offering specific advice for debugging with each tool, authors Norm Matloff and Pete Salzman cover general strategies for improving the process of finding and fixing coding errors, including how to: –Inspect variables and data structures –Understand segmentation faults and core dumps –Know why your program crashes or throws exceptions –Use features like catchpoints, convenience variables, and artificial arrays –Avoid common debugging pitfalls Real world examples of coding errors help to clarify the authors’ guiding principles, and coverage of complex topics like thread, client-server, GUI, and parallel programming debugging will make you even more proficient. You'll also learn how to prevent errors in the first place with text editors, compilers, error reporting, and static code checkers. Whether you dread the thought of debugging your programs or simply want to improve your current debugging efforts, you'll find a valuable ally in The Art of Debugging.",
    //             "industryIdentifiers": [
    //                 {
    //                     "type": "ISBN_13",
    //                     "identifier": "9781593272319"
    //                 },
    //                 {
    //                     "type": "ISBN_10",
    //                     "identifier": "1593272316"
    //                 }
    //             ],
    //             "readingModes": {
    //                 "text": true,
    //                 "image": false
    //             },
    //             "pageCount": 280,
    //             "printType": "BOOK",
    //             "categories": [
    //                 "Computers"
    //             ],
    //             "maturityRating": "NOT_MATURE",
    //             "allowAnonLogging": true,
    //             "contentVersion": "0.4.3.0.preview.2",
    //             "panelizationSummary": {
    //                 "containsEpubBubbles": false,
    //                 "containsImageBubbles": false
    //             },
    //             "imageLinks": {
    //                 "smallThumbnail": "http://books.google.com/books/content?id=PgYvDwAAQBAJ&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api",
    //                 "thumbnail": "http://books.google.com/books/content?id=PgYvDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api"
    //             },
    //             "language": "en",
    //             "previewLink": "http://books.google.com/books?id=PgYvDwAAQBAJ&pg=PA241&dq=ddd&hl=&as_pt=BOOKS&cd=5&source=gbs_api",
    //             "infoLink": "http://books.google.com/books?id=PgYvDwAAQBAJ&dq=ddd&hl=&as_pt=BOOKS&source=gbs_api",
    //             "canonicalVolumeLink": "https://books.google.com/books/about/The_Art_of_Debugging_with_GDB_DDD_and_Ec.html?hl=&id=PgYvDwAAQBAJ"
    //         },
    //         "saleInfo": {
    //             "country": "IL",
    //             "saleability": "NOT_FOR_SALE",
    //             "isEbook": false
    //         },
    //         "accessInfo": {
    //             "country": "IL",
    //             "viewability": "PARTIAL",
    //             "embeddable": true,
    //             "publicDomain": false,
    //             "textToSpeechPermission": "ALLOWED",
    //             "epub": {
    //                 "isAvailable": true
    //             },
    //             "pdf": {
    //                 "isAvailable": false
    //             },
    //             "webReaderLink": "http://play.google.com/books/reader?id=PgYvDwAAQBAJ&hl=&as_pt=BOOKS&source=gbs_api",
    //             "accessViewStatus": "SAMPLE",
    //             "quoteSharingAllowed": false
    //         },
    //         "searchInfo": {
    //             "textSnippet": "... <b>DDD</b> operations as usual. 8.1.3. Using. <b>DDD</b>. as. a. GUI. for. JDB. <b>DDD</b> can be used directly with the Java Development Kit&#39;s JDB debugger. The command $ <b>ddd</b> -jdb TestLL.java will start <b>DDD</b>, which then invokes JDB. However, we have found that&nbsp;..."
    //         }
    //     },
    //     {
    //         "kind": "books#volume",
    //         "id": "FBgTkFO4Ph0C",
    //         "etag": "9gX+Wnh17/A",
    //         "selfLink": "https://www.googleapis.com/books/v1/volumes/FBgTkFO4Ph0C",
    //         "volumeInfo": {
    //             "title": "Department Of Defense Index of Specifications and Standards Numerical Canceled Listing Part IV July 2005",
    //             "publisher": "DIANE Publishing",
    //             "industryIdentifiers": [
    //                 {
    //                     "type": "ISBN_13",
    //                     "identifier": "9781428983434"
    //                 },
    //                 {
    //                     "type": "ISBN_10",
    //                     "identifier": "1428983430"
    //                 }
    //             ],
    //             "readingModes": {
    //                 "text": false,
    //                 "image": true
    //             },
    //             "pageCount": 1246,
    //             "printType": "BOOK",
    //             "maturityRating": "NOT_MATURE",
    //             "allowAnonLogging": false,
    //             "contentVersion": "3.3.1.0.preview.1",
    //             "panelizationSummary": {
    //                 "containsEpubBubbles": false,
    //                 "containsImageBubbles": false
    //             },
    //             "imageLinks": {
    //                 "smallThumbnail": "http://books.google.com/books/content?id=FBgTkFO4Ph0C&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api",
    //                 "thumbnail": "http://books.google.com/books/content?id=FBgTkFO4Ph0C&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api"
    //             },
    //             "language": "en",
    //             "previewLink": "http://books.google.com/books?id=FBgTkFO4Ph0C&pg=PA1073&dq=ddd&hl=&as_pt=BOOKS&cd=6&source=gbs_api",
    //             "infoLink": "http://books.google.com/books?id=FBgTkFO4Ph0C&dq=ddd&hl=&as_pt=BOOKS&source=gbs_api",
    //             "canonicalVolumeLink": "https://books.google.com/books/about/Department_Of_Defense_Index_of_Specifica.html?hl=&id=FBgTkFO4Ph0C"
    //         },
    //         "saleInfo": {
    //             "country": "IL",
    //             "saleability": "NOT_FOR_SALE",
    //             "isEbook": false
    //         },
    //         "accessInfo": {
    //             "country": "IL",
    //             "viewability": "ALL_PAGES",
    //             "embeddable": true,
    //             "publicDomain": false,
    //             "textToSpeechPermission": "ALLOWED",
    //             "epub": {
    //                 "isAvailable": false
    //             },
    //             "pdf": {
    //                 "isAvailable": true
    //             },
    //             "webReaderLink": "http://play.google.com/books/reader?id=FBgTkFO4Ph0C&hl=&as_pt=BOOKS&source=gbs_api",
    //             "accessViewStatus": "SAMPLE",
    //             "quoteSharingAllowed": false
    //         },
    //         "searchInfo": {
    //             "textSnippet": "... <b>DDD</b> - P - 00360A <b>DDD</b> - L - 391A ( 1 ) PILLOWCASE , AND COVER , HEADREST ( DISPOSABLE ) ( S / S BY A - A - 163 ) A 7210 # FSS 18 - MAR - 94 LINEN , TABLE ( DOILIES , NAPKINS , AND TABLE - CLOTHS ) A 7210 # 27 - AUG - 37 <b>DDD</b> - F - 410C&nbsp;..."
    //         }
    //     },
    //     {
    //         "kind": "books#volume",
    //         "id": "C9dbAAAAQAAJ",
    //         "etag": "2ASHvsqkk9s",
    //         "selfLink": "https://www.googleapis.com/books/v1/volumes/C9dbAAAAQAAJ",
    //         "volumeInfo": {
    //             "title": "Marwood's confession [signed D.D.D.].",
    //             "authors": [
    //                 "D D. D."
    //             ],
    //             "publishedDate": "1883",
    //             "industryIdentifiers": [
    //                 {
    //                     "type": "OTHER",
    //                     "identifier": "OXFORD:590279648"
    //                 }
    //             ],
    //             "readingModes": {
    //                 "text": false,
    //                 "image": true
    //             },
    //             "printType": "BOOK",
    //             "maturityRating": "NOT_MATURE",
    //             "allowAnonLogging": false,
    //             "contentVersion": "0.1.6.0.full.1",
    //             "panelizationSummary": {
    //                 "containsEpubBubbles": false,
    //                 "containsImageBubbles": false
    //             },
    //             "imageLinks": {
    //                 "smallThumbnail": "http://books.google.com/books/content?id=C9dbAAAAQAAJ&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api",
    //                 "thumbnail": "http://books.google.com/books/content?id=C9dbAAAAQAAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api"
    //             },
    //             "language": "en",
    //             "previewLink": "http://books.google.com/books?id=C9dbAAAAQAAJ&pg=PA6&dq=ddd&hl=&as_pt=BOOKS&cd=7&source=gbs_api",
    //             "infoLink": "https://play.google.com/store/books/details?id=C9dbAAAAQAAJ&source=gbs_api",
    //             "canonicalVolumeLink": "https://play.google.com/store/books/details?id=C9dbAAAAQAAJ"
    //         },
    //         "saleInfo": {
    //             "country": "IL",
    //             "saleability": "FREE",
    //             "isEbook": true,
    //             "buyLink": "https://play.google.com/store/books/details?id=C9dbAAAAQAAJ&rdid=book-C9dbAAAAQAAJ&rdot=1&source=gbs_api"
    //         },
    //         "accessInfo": {
    //             "country": "IL",
    //             "viewability": "ALL_PAGES",
    //             "embeddable": true,
    //             "publicDomain": true,
    //             "textToSpeechPermission": "ALLOWED",
    //             "epub": {
    //                 "isAvailable": false,
    //                 "downloadLink": "http://books.google.com/books/download/Marwood_s_confession_signed_D_D_D.epub?id=C9dbAAAAQAAJ&hl=&output=epub&source=gbs_api"
    //             },
    //             "pdf": {
    //                 "isAvailable": true,
    //                 "downloadLink": "http://books.google.com/books/download/Marwood_s_confession_signed_D_D_D.pdf?id=C9dbAAAAQAAJ&hl=&output=pdf&sig=ACfU3U29rLkdgOaMDqvocdvfUH7G3UPpBw&source=gbs_api"
    //             },
    //             "webReaderLink": "http://play.google.com/books/reader?id=C9dbAAAAQAAJ&hl=&as_pt=BOOKS&source=gbs_api",
    //             "accessViewStatus": "FULL_PUBLIC_DOMAIN",
    //             "quoteSharingAllowed": false
    //         },
    //         "searchInfo": {
    //             "textSnippet": "... hungered for the life of a fellow creature , whom he had never seen : shall disappoint that class of people I am afraid . <b>D. D. D.</b> The Armley Gaol Catastrophe . co In April , 1877 6 exhibit him and his calling in their true colours. ..."
    //         }
    //     },
    //     {
    //         "kind": "books#volume",
    //         "id": "ZpggidEI8CMC",
    //         "etag": "U9olxBsfFcU",
    //         "selfLink": "https://www.googleapis.com/books/v1/volumes/ZpggidEI8CMC",
    //         "volumeInfo": {
    //             "title": "Calendar of State Papers, Domestic Series, [during the Commonwealth] ...: 1655",
    //             "authors": [
    //                 "Great Britain. Public Record Office"
    //             ],
    //             "publishedDate": "1881",
    //             "industryIdentifiers": [
    //                 {
    //                     "type": "OTHER",
    //                     "identifier": "UOMDLP:abd6186:0008.001"
    //                 }
    //             ],
    //             "readingModes": {
    //                 "text": false,
    //                 "image": true
    //             },
    //             "pageCount": 783,
    //             "printType": "BOOK",
    //             "categories": [
    //                 "Great Britain"
    //             ],
    //             "maturityRating": "NOT_MATURE",
    //             "allowAnonLogging": false,
    //             "contentVersion": "0.3.7.0.full.1",
    //             "panelizationSummary": {
    //                 "containsEpubBubbles": false,
    //                 "containsImageBubbles": false
    //             },
    //             "imageLinks": {
    //                 "smallThumbnail": "http://books.google.com/books/content?id=ZpggidEI8CMC&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api",
    //                 "thumbnail": "http://books.google.com/books/content?id=ZpggidEI8CMC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api"
    //             },
    //             "language": "en",
    //             "previewLink": "http://books.google.com/books?id=ZpggidEI8CMC&pg=PR27&dq=ddd&hl=&as_pt=BOOKS&cd=8&source=gbs_api",
    //             "infoLink": "https://play.google.com/store/books/details?id=ZpggidEI8CMC&source=gbs_api",
    //             "canonicalVolumeLink": "https://play.google.com/store/books/details?id=ZpggidEI8CMC"
    //         },
    //         "saleInfo": {
    //             "country": "IL",
    //             "saleability": "FREE",
    //             "isEbook": true,
    //             "buyLink": "https://play.google.com/store/books/details?id=ZpggidEI8CMC&rdid=book-ZpggidEI8CMC&rdot=1&source=gbs_api"
    //         },
    //         "accessInfo": {
    //             "country": "IL",
    //             "viewability": "ALL_PAGES",
    //             "embeddable": true,
    //             "publicDomain": true,
    //             "textToSpeechPermission": "ALLOWED",
    //             "epub": {
    //                 "isAvailable": false,
    //                 "downloadLink": "http://books.google.com/books/download/Calendar_of_State_Papers_Domestic_Series.epub?id=ZpggidEI8CMC&hl=&output=epub&source=gbs_api"
    //             },
    //             "pdf": {
    //                 "isAvailable": true,
    //                 "downloadLink": "http://books.google.com/books/download/Calendar_of_State_Papers_Domestic_Series.pdf?id=ZpggidEI8CMC&hl=&output=pdf&sig=ACfU3U2dNJqHkdK3Ok277CF2m7tGQYeGrQ&source=gbs_api"
    //             },
    //             "webReaderLink": "http://play.google.com/books/reader?id=ZpggidEI8CMC&hl=&as_pt=BOOKS&source=gbs_api",
    //             "accessViewStatus": "FULL_PUBLIC_DOMAIN",
    //             "quoteSharingAllowed": false
    //         },
    //         "searchInfo": {
    //             "textSnippet": "... <b>ddd</b> - d d -- <b>ddd</b> - dddd - d d - - - <b>d d d</b> - dd <b>ddd</b> --d - d -- dddd - <b>d d d</b> dd - Lord Protector Cromwell President Lawrence Desborow , Major - General Fiennes , Colonel - - Jones , Colonel P. - - Lambert , Major - General - Lisle&nbsp;..."
    //         }
    //     },
    //     {
    //         "kind": "books#volume",
    //         "id": "3BErSZVWUFwC",
    //         "etag": "9p3x8e8qiqk",
    //         "selfLink": "https://www.googleapis.com/books/v1/volumes/3BErSZVWUFwC",
    //         "volumeInfo": {
    //             "title": "Calendar of State Papers, Domestic Series, [during the Commonwealth] ...: 1655-1656",
    //             "authors": [
    //                 "Great Britain. Public Record Office"
    //             ],
    //             "publishedDate": "1882",
    //             "industryIdentifiers": [
    //                 {
    //                     "type": "OTHER",
    //                     "identifier": "UOMDLP:abd6186:0009.001"
    //                 }
    //             ],
    //             "readingModes": {
    //                 "text": false,
    //                 "image": true
    //             },
    //             "pageCount": 757,
    //             "printType": "BOOK",
    //             "categories": [
    //                 "Great Britain"
    //             ],
    //             "maturityRating": "NOT_MATURE",
    //             "allowAnonLogging": false,
    //             "contentVersion": "0.3.6.0.full.1",
    //             "panelizationSummary": {
    //                 "containsEpubBubbles": false,
    //                 "containsImageBubbles": false
    //             },
    //             "imageLinks": {
    //                 "smallThumbnail": "http://books.google.com/books/content?id=3BErSZVWUFwC&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api",
    //                 "thumbnail": "http://books.google.com/books/content?id=3BErSZVWUFwC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api"
    //             },
    //             "language": "en",
    //             "previewLink": "http://books.google.com/books?id=3BErSZVWUFwC&pg=PR29&dq=ddd&hl=&as_pt=BOOKS&cd=9&source=gbs_api",
    //             "infoLink": "https://play.google.com/store/books/details?id=3BErSZVWUFwC&source=gbs_api",
    //             "canonicalVolumeLink": "https://play.google.com/store/books/details?id=3BErSZVWUFwC"
    //         },
    //         "saleInfo": {
    //             "country": "IL",
    //             "saleability": "FREE",
    //             "isEbook": true,
    //             "buyLink": "https://play.google.com/store/books/details?id=3BErSZVWUFwC&rdid=book-3BErSZVWUFwC&rdot=1&source=gbs_api"
    //         },
    //         "accessInfo": {
    //             "country": "IL",
    //             "viewability": "ALL_PAGES",
    //             "embeddable": true,
    //             "publicDomain": true,
    //             "textToSpeechPermission": "ALLOWED",
    //             "epub": {
    //                 "isAvailable": false,
    //                 "downloadLink": "http://books.google.com/books/download/Calendar_of_State_Papers_Domestic_Series.epub?id=3BErSZVWUFwC&hl=&output=epub&source=gbs_api"
    //             },
    //             "pdf": {
    //                 "isAvailable": true,
    //                 "downloadLink": "http://books.google.com/books/download/Calendar_of_State_Papers_Domestic_Series.pdf?id=3BErSZVWUFwC&hl=&output=pdf&sig=ACfU3U2R-dT5IKtHXYJpFkvZxHtJQ-NZ1w&source=gbs_api"
    //             },
    //             "webReaderLink": "http://play.google.com/books/reader?id=3BErSZVWUFwC&hl=&as_pt=BOOKS&source=gbs_api",
    //             "accessViewStatus": "FULL_PUBLIC_DOMAIN",
    //             "quoteSharingAllowed": false
    //         },
    //         "searchInfo": {
    //             "textSnippet": "... <b>ddd</b> dddddd d - - <b>ddd</b> dddd - - d - - d d - - dd d_d_d_ddddd d_d_d_d_ddd a_d_d_ddd_d <b>ddd</b> dddd a_d_d_d_d_d d_ddd - d - dd - d_dd___dddd d_ddd_ddddd dd <b>ddd</b> - __dd - d a - dd _dddd - d - d- <b>ddd</b> - - - __<b>ddd</b> d __dd_d_dd _ddd__d - d- _ddd__&nbsp;..."
    //         }
    //     },
    //     {
    //         "kind": "books#volume",
    //         "id": "2b-HS7m1RTsC",
    //         "etag": "U9qnUTB5yLE",
    //         "selfLink": "https://www.googleapis.com/books/v1/volumes/2b-HS7m1RTsC",
    //         "volumeInfo": {
    //             "title": "Calendar of state papers, domestic series",
    //             "subtitle": "preserved in the State Paper Department of Her Majesty's Public Record Office. 1655 - 6",
    //             "authors": [
    //                 "Mary Anne Everett Green"
    //             ],
    //             "publishedDate": "1882",
    //             "industryIdentifiers": [
    //                 {
    //                     "type": "OTHER",
    //                     "identifier": "BSB:BSB11576089"
    //                 }
    //             ],
    //             "readingModes": {
    //                 "text": false,
    //                 "image": true
    //             },
    //             "pageCount": 756,
    //             "printType": "BOOK",
    //             "maturityRating": "NOT_MATURE",
    //             "allowAnonLogging": false,
    //             "contentVersion": "0.4.4.0.full.1",
    //             "panelizationSummary": {
    //                 "containsEpubBubbles": false,
    //                 "containsImageBubbles": false
    //             },
    //             "imageLinks": {
    //                 "smallThumbnail": "http://books.google.com/books/content?id=2b-HS7m1RTsC&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api",
    //                 "thumbnail": "http://books.google.com/books/content?id=2b-HS7m1RTsC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api"
    //             },
    //             "language": "en",
    //             "previewLink": "http://books.google.com/books?id=2b-HS7m1RTsC&pg=PR28&dq=ddd&hl=&as_pt=BOOKS&cd=10&source=gbs_api",
    //             "infoLink": "https://play.google.com/store/books/details?id=2b-HS7m1RTsC&source=gbs_api",
    //             "canonicalVolumeLink": "https://play.google.com/store/books/details?id=2b-HS7m1RTsC"
    //         },
    //         "saleInfo": {
    //             "country": "IL",
    //             "saleability": "FREE",
    //             "isEbook": true,
    //             "buyLink": "https://play.google.com/store/books/details?id=2b-HS7m1RTsC&rdid=book-2b-HS7m1RTsC&rdot=1&source=gbs_api"
    //         },
    //         "accessInfo": {
    //             "country": "IL",
    //             "viewability": "ALL_PAGES",
    //             "embeddable": true,
    //             "publicDomain": true,
    //             "textToSpeechPermission": "ALLOWED",
    //             "epub": {
    //                 "isAvailable": false,
    //                 "downloadLink": "http://books.google.com/books/download/Calendar_of_state_papers_domestic_series.epub?id=2b-HS7m1RTsC&hl=&output=epub&source=gbs_api"
    //             },
    //             "pdf": {
    //                 "isAvailable": false
    //             },
    //             "webReaderLink": "http://play.google.com/books/reader?id=2b-HS7m1RTsC&hl=&as_pt=BOOKS&source=gbs_api",
    //             "accessViewStatus": "FULL_PUBLIC_DOMAIN",
    //             "quoteSharingAllowed": false
    //         },
    //         "searchInfo": {
    //             "textSnippet": "... <b>ddd</b> - <b>ddd</b> - d - dd - d- --- ddddd --- _dd__dddd - dd -- d _dd__d_ddddddd_ _d__d_dd__d__dd __dd_dddddd_ddd _ddd_dd_ddd_dd_ _dd__<b>ddd</b> - dd - <b>ddd</b> 6 NOVEMBER 1655 . 13 14 15 16 20 21 27 28 29 30 Totals 16 . ddd_d___ddddddd dd__ddddddd&nbsp;..."
    //         }
    //     }
    // ]

    // console.log(items[0].volumeInfo)
    // const item = items[0].volumeInfo
    // return convertApiData(item)

    console.log(items)
    const convertedItems = items.map(item => convertApiData(item.volumeInfo))
    return convertedItems
}