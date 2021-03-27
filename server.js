const fs = require(`fs`)
const http = require(`http`)
const WebSocket = require(`ws`)

//newBoard
let myBoard = Array(15).fill(undefined)
for(col = 0; col < 15; col++)
{
    myBoard[col] = Array(15).fill([])
}

myBoard[0][0] = [`blue`, `blue`, `blue`, `blue`]
myBoard[0][14] = [`red`, `red`, `red`, `red`]
myBoard[14][0] = [`yellow`, `yellow`, `yellow`, `yellow`]
myBoard[14][14] = [`green`, `green`, `green`, `green`]

const readFile = (fileName, isPng) => {
    if (isPng)
    {
        return (
            new Promise((resolve, reject) => {
                fs.readFile(fileName, (readErr, fileContents) => {
                  if (readErr) {
                    reject(readErr)
                  } else {
                    resolve(fileContents)
                  }
                })
              })
        )
    }
    else
    {
        return (
            new Promise((resolve, reject) => {
                fs.readFile(fileName, `utf-8`, (readErr, fileContents) => {
                  if (readErr) {
                    reject(readErr)
                  } else {
                    resolve(fileContents)
                  }
                })
              })
        )
    }

}


// const wss = new WebSocket.Server({ port: 8080 })

const server = http.createServer(async (req, resp) => {
    console.log(`browser asked for ${req.url}`)
    if (req.url == `/game`) {
        
        console.log(myBoard)

        const clientHtml = await readFile(`client.html`, false)
        resp.end(clientHtml)
    } else if (req.url == `/test`) {
        const clientJs = await readFile(`myclient.html`, false)
        resp.end(clientJs)
    } else if (req.url == `/myjs`) {
        const clientJs = await readFile(`ludo.js`, false)
        resp.end(clientJs)
    } else if (req.url == `/ludo.css`) {
        const clientJs = await readFile(`ludo.css`, false)
        resp.end(clientJs)
    } else if (req.url == `/center.png`) {
        const clientJs = await readFile(`center.png`, true)
        resp.end(clientJs)
    } else {
        resp.end(`Not found`)
    }
})

server.listen(8000)

const wss = new WebSocket.Server({ port: 8080 })

const step = (color, ox, oy, steps) => {
    const transform = ([ox,oy]) => ({'blue': [+ox,+oy], 'green': [-ox,-oy], 'red': [-oy,+ox], 'yellow': [+oy,-ox]}[color])
    const path = ['-7,-7', '-1,-6', '-1,-5', '-1,-4', '-1,-3', '-1,-2', '-2,-1', '-3,-1', '-4,-1', '-5,-1', '-6,-1', '-7,-1', '-7,0', '-7,1', '-6,1', '-5,1', '-4,1', '-3,1', '-2,1', '-1,2', '-1,3', '-1,4', '-1,5', '-1,6', '-1,7', '0,7', '1,7', '1,6', '1,5', '1,4', '1,3', '1,2', '2,1', '3,1', '4,1', '5,1', '6,1', '7,1', '7,0', '7,-1', '6,-1', '5,-1', '4,-1', '3,-1', '2,-1', '1,-2', '1,-3', '1,-4', '1,-5', '1,-6', '1,-7', '0,-7', '0,-6', '0,-5', '0,-4', '0,-3', '0,-2', '0,-1']
    const [x,y] = transform(transform(transform(path[path.indexOf(transform([ox-7, oy-7]).join(','))+steps].split(','))))
        return [x+7,y+7]
    }

const handleMoveSprite = (cx, cy, cz, steps) => {

    spriteColor = myBoard[cx][cy][cz]
    myBoard[cx][cy].splice(cz, 1)
    console.log(myBoard)
    let [ox, oy] = step(spriteColor, cx, cy, steps)
    // let currentCell = myBoard[6][1]
    // console.log(currentCell)
    // currentCell.push(spriteColor)
    // console.log(currentCell)
    // myBoard[6].splice(1, 1, currentCell)
    myBoard[ox].splice(oy,1, [...myBoard[ox][oy], spriteColor])
    console.log(myBoard)

}

wss.on(`connection`, (ws) => {
  console.log(`Game started\nNew Board Sent`)

  ws.on(`message`, async (message) => {
    console.log(`received: ${message}`)
    const clientMessage = JSON.parse(message)
    console.log(clientMessage)

    if (clientMessage.type === `moveSprite`){
        await handleMoveSprite(clientMessage.cx, clientMessage.cy, clientMessage.cz, clientMessage.steps)
        ws.send(JSON.stringify({
            type: `newboard`,
            board: myBoard
          }))
    }

  })

  ws.send(JSON.stringify({
    type: `newboard`,
    board: myBoard
  }))
})