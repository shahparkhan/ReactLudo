const ws = new WebSocket(`ws://localhost:8080`)

// class Ludo extends React.Component{

//     constructor() {
//         super()
//         [this.board, this.setBoard] = React.useState([])
        
//     }

//     render(){
//         return <h1>Testing</h1>
//     }

    
// }

const Ludo = () => {

    const [myBoard, setMyBoard] = React.useState([])
    const [myRows, setMyRows] = React.useState([])

    const moveSprite = (cx, cy, cz, steps) => {
        let moveSpriteObj = {
            type: "moveSprite",
            cx: cx,
            cy: cy,
            cz: cz,
            steps: steps
        }
        ws.send(JSON.stringify(moveSpriteObj))
    }
    
    const renderCol = (cols, rowNumber, colNumber) => {
        
        let items = []

        for(let i = 0; i < cols.length; i++){

            let spriteKey = cols[i].concat(i.toString())
            items.push(<div key={spriteKey} className={cols[i]} onClick={() => moveSprite(Number(rowNumber), Number(colNumber), i, 1)}></div>)

        }

        console.log(typeof(rowNumber))
        const cellNumber = rowNumber.concat(colNumber)
        console.log(cellNumber)
        
        return (
            <div key={cellNumber} className={"cell".concat(cellNumber)}>
                {items}
            </div>
        )
        

    }
    
    const renderRow = (row, rowNumber) => {
        
        let cols = []

        for (let i = 0; i < 15; i++){

            cols.push(renderCol(row[i], rowNumber, i.toString()))

        }

        return (
            <div key={rowNumber}>
                {cols}
            </div>
        )
    }

    const handleBoard = (board) => {
        console.log(board)
        console.log(board[0])
        console.log(board[0][0])
        // setMyBoard(serverMessage.board)
        // console.log(myBoard)
        // render()
        let rows = []
        
        for(let i = 0; i < 15; i++){
            // console.log(board[i])
            rows.push(renderRow(board[i], i.toString()))
            // console.log(`rendered`)
            // console.log(rows)
        }
        setMyRows(rows)
    } 
    
    ws.onmessage = (event) => {
        const serverMessage = JSON.parse(event.data)
        setMyBoard(serverMessage.board)
        handleBoard(serverMessage.board)

    }

    return(
        
        <div>
            <div>{myRows}</div>
        </div>
    )
}

ReactDOM.render(<Ludo />, document.querySelector(`#root`))


