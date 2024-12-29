const express = require('express');
const { table } = require('node:console');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});



whoseTurn = []
xS = []
nicknames = []
oS = []
clients = []
tableDone = []
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
        for (let j = 0; j < temp.length; j++) {
            if (!arr.includes(temp[j])) {
                a = 0
            }
        }
        if (a) {
            console.log('WIN')
            return 1
        }
    }
    return 0
}

function inClients(id) {
    for (let i = 0; i < clients.length; i++) {
        if (id == clients[i][0] || id == clients[i][1]) {
            return i
        }
    }
    return -1
}

function addSocket(id, nickname) {
    if (clients.length == 0) {
        clients.push([id])
        nicknames.push([nickname])
        tableDone.push([])
        xS.push([])
        oS.push([])

        whoseTurn.push(id)
    } else {
        if (clients[clients.length - 1].length == 1) {
            clients[clients.length - 1][1] = id

            nicknames[clients.length - 1][1] = nickname
            tableDone.push([])
            xS.push([])
            oS.push([])
            let i = inClients(id)
            whoseTurn[i] = clients[i][0]
            io.to(clients[i][0]).emit('opponent', nicknames[i][1])
            io.to(clients[i][1]).emit('opponent', nicknames[i][0])
        } else {
            clients.push([id])
            nicknames.push([nickname])

            whoseTurn.push(id)

            tableDone.push([])
            xS.push([])
            oS.push([])
            let i = inClients(id)
            whoseTurn[i] = clients[i][0]
        }

        console.log('C', clients)
        console.log('T', tableDone)
        console.log('W', whoseTurn)
        console.log('N', nicknames)

    }
}

function ifInGame(id) {
    temp = inClients(id)
    if (temp == -1) {
        return false
    } else {
        if (clients[temp].length == 2) {
            return true
        } else {
            return false
        }
    }
}

io.on('connection', (socket) => {

    socket.on('start', (nickname) => {
        if (inClients(socket.id) == -1) {
            addSocket(socket.id, nickname)
            let i = inClients(socket.id)

            whoseTurn[i] = clients[i][0]

            io.to(clients[i][0]).emit("turn", whoseTurn[i])
            io.to(clients[i][1]).emit("turn", whoseTurn[i])
                // io.to('room' + i).emit("turn", whoseTurn[i])
        }
    })



    let index

    socket.on('turn', (i) => {
        index = inClients(socket.id)
        console.log('C', clients)
        console.log('T', tableDone)
        console.log('W', whoseTurn)
        console.log('N', nicknames)

        if (ifInGame(socket.id)) {
            // console.log(whoseTurn[index], socket.id)
            // console.log('turn')
            let pattern
            console.log(socket.id, i)
            if (tableDone[index].length % 2 == 0) {
                pattern = 'x'
            } else {
                pattern = 'o'
            }

            if (whoseTurn[index] == socket.id && !tableDone[index].includes(i)) {
                // io.to('room' + index).emit('doneTurn', i, pattern)
                io.to(clients[index][0]).emit("doneTurn", i, pattern)
                io.to(clients[index][1]).emit("doneTurn", i, pattern)
                if (pattern == 'x') {
                    xS[index].push(i)
                } else {
                    oS[index].push(i)
                }

                if (whoseTurn[index] == clients[index][0]) {
                    whoseTurn[index] = clients[index][1]
                } else {
                    whoseTurn[index] = clients[index][0]
                }
                // io.to('room' + index).emit("turn", whoseTurn[index])
                io.to(clients[index][0]).emit("turn", whoseTurn[index])
                io.to(clients[index][1]).emit("turn", whoseTurn[index])
                tableDone[index].push(i)
                if (checkIfWin(oS[index])) {
                    io.to(clients[index][0]).emit("win", clients[index][1])
                    io.to(clients[index][1]).emit("win", clients[index][1])
                    clients.splice(index, 1)

                    whoseTurn.splice(index, 1)
                    xS.splice(index, 1)
                    oS.splice(index, 1)
                    tableDone.splice(index, 1)
                    nicknames.splice(index, 1)

                    console.log('C', clients)
                    console.log('T', tableDone)
                    console.log('W', whoseTurn)
                    console.log('N', nicknames)

                    console.log('O wins')
                        // io.to('room' + index).emit("win", clients[index][1])

                }
                if (checkIfWin(xS[index])) {
                    io.to(clients[index][0]).emit("win", clients[index][0])
                    io.to(clients[index][1]).emit("win", clients[index][0])
                    clients.splice(index, 1)

                    whoseTurn.splice(index, 1)
                    xS.splice(index, 1)
                    oS.splice(index, 1)
                    tableDone.splice(index, 1)
                    nicknames.splice(index, 1)

                    console.log('C', clients)
                    console.log('T', tableDone)
                    console.log('W', whoseTurn)
                    console.log('N', nicknames)

                    console.log('X wins')

                    // io.to('room' + index).emit("win", clients[index][0])
                }
            }
        }
    })
    socket.on('start', () => {
        console.log('start', socket.id)
    })


    socket.on('disconnect', () => {
        let i = inClients(socket.id)
        if (i != -1) {
            if (clients[i].length == 2) {
                if (socket.id == clients[i][0]) {
                    tempN = nicknames[i][1]
                    temp = clients[i][1]
                    nicknames.splice(i, 1)
                    clients.splice(i, 1)
                    addSocket(temp, tempN)
                    whoseTurn.splice(i, 1)
                    xS.splice(i, 1)
                    oS.splice(i, 1)

                    tableDone.splice(i, 1)


                } else {
                    tempN = nicknames[i][0]
                    temp = clients[i][0]
                    clients.splice(i, 1)
                    nicknames.splice(i, 1)
                    addSocket(temp, tempN)
                    whoseTurn.splice(i, 1)
                    xS.splice(i, 1)
                    oS.splice(i, 1)
                    tableDone.splice(i, 1)

                }
            } else {
                clients.splice(i, 1)
                xS.splice(i, 1)
                oS.splice(i, 1)
                whoseTurn.splice(i, 1)
                tableDone.splice(i, 1)
                nicknames.splice(i, 1)

            }
            console.log(clients)


        }
    })
})



server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});