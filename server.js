const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});
let whoseTurn
winPatterns = [
    [1, 2, 3],
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
    [4, 5, 6],
    [7, 8, 9],
    [1, 5, 9],
    [3, 5, 7]
]

function checkIfWin(arr) {
    for (let i = 0; i < winPatterns.length; i++) {
        let a = 1
        temp = winPatterns[i]
            // console.log(temp)
        for (let j = 0; j < temp.length; j++) {
            if (!arr.includes(temp[j])) {
                // console.log(temp, arr)
                a = 0
            }


        }
        if (a) {
            console.log('WIIIN')
            return 1
        }

    }
    return 0
}
xS = []
oS = []
clients = []
tableDone = []
inGame = 1
io.on('connection', (socket) => {


    if (clients.length < 2) {
        if (!clients.includes(socket.id)) {
            clients.push(socket.id)
            console.log(clients)
            console.log('join', socket.id)
            socket.join('room1')
            socket.emit('room1', 'broski')
            console.log(1)
            whoseTurn = clients[0]
            xS = []
            oS = []

            tableDone = []
            io.to('room1').emit("turn", whoseTurn)
        }
    }
    socket.on('turn', (i) => {
        if (inGame) {
            console.log(whoseTurn, socket.id)
            console.log('turn')
            let pattern
            console.log(socket.id, i)
            if (tableDone.length % 2 == 0) {
                pattern = 'x'
            } else {
                pattern = 'o'
            }

            if (whoseTurn == socket.id && !tableDone.includes(i)) {
                io.to('room1').emit('doneTurn', i, pattern)
                if (pattern == 'x') {
                    xS.push(i)
                } else {
                    oS.push(i)
                }

                if (whoseTurn == clients[0]) {
                    whoseTurn = clients[1]
                } else {
                    whoseTurn = clients[0]
                }
                io.to('room1').emit("turn", whoseTurn)
                tableDone.push(i)
                if (checkIfWin(oS)) {
                    inGame = 0
                    console.log('O wins')
                    io.to('room1').emit("win", clients[1])
                }
                if (checkIfWin(xS)) {
                    inGame = 0
                    console.log('X wins')
                    io.to('room1').emit("win", clients[0])
                }
            }
        }
    })
    socket.on('start', () => {
        console.log('start', socket.id)
    })
    socket.on('room', () => {
        console.log('room')
        io.to('room1').emit('rom')
    })
    socket.on('disconnect', () => {
        if (clients.includes(socket.id)) {
            tableDone = []
            xS = []
            oS = []
            console.log("End", socket.id)
            clients.splice(clients.indexOf(socket.id), 1)
        }
        console.log(clients)
    })

});

server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});