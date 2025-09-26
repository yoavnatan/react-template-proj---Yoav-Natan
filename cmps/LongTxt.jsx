
const { useState, useRef } = React
export function LongTxt({ txt, length = 100 }) {

    const [text, setText] = useState(txt.substring(0, length))

    let show = useRef('more')
    let textToUpdate = useRef('short')

    function onToggleShow() {
        console.log(textToUpdate.current)
        if (textToUpdate.current === 'short') {
            setText(txt.substring(txt))
            textToUpdate.current = 'long'
            show.current = 'less'
        }
        else if (textToUpdate.current === 'long') {
            setText(txt.substring(0, length))
            textToUpdate.current = 'short'
            show.current = 'more'
        }
    }
    console.log(txt.split(''))
    return (
        <div>
            <p>{text} {textToUpdate.current === 'short' && <span>...</span>}</p>
            {txt.length > 100 && <h6 onClick={onToggleShow}>show <span>{show.current}</span></h6>}
        </div>
    )
}