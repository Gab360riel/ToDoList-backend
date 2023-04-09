import fs from 'node:fs/promises';

const databasePath = new URL('../db.json', import.meta.url)

export class Database{
    #database = {}

    constructor() {
        fs.readFile(databasePath, 'utf8').then((data) => {
            this.#database = JSON.parse(data)
        }).catch(() => {
            this.#persist()
        })
    }
    
    #persist() {
        fs.writeFile(databasePath, JSON.stringify(this.#database));
    }

    select(table, search) {
        let data = this.#database[table] ?? []

        if(search) {
            data = data.filter(row => {
                return Object.entries(search).some(([key, value]) => {
                    return row[key].toLowerCase().includes(value.toLowerCase())
                })
            })
        }

        return data
    }

    insert(table, data) {
        if(Array.isArray(this.#database[table])) {
            this.#database[table].push(data)
        } else {
            this.#database[table] = [data]
        }

        this.#persist()

        return data
    }

    update(table, id, data, res){
        const rowIndex = this.#database[table].findIndex(row => row.id === id)

        if(rowIndex > -1) {
            this.#database[table][rowIndex] = {...this.#database[table][rowIndex], ...data}
            this.#persist()
            return res.writeHead(204).end()
        } else {
            return res.writeHead(404, 'document not found').end()
        }
    }

    patch(table, id, res){
        const rowIndex = this.#database[table].findIndex(row => row.id === id)

        if(rowIndex > -1) {
            const { completed_at } = this.#database[table][rowIndex]
            const completedAt = completed_at === null ? new Date(Date.now() - (3 * 60 * 60 * 1000)).toUTCString() : null
            const updated_at = new Date(Date.now() - (3 * 60 * 60 * 1000)).toUTCString()

            this.#database[table][rowIndex] = {...this.#database[table][rowIndex], updated_at, completed_at: completedAt}
            this.#persist()
            return res.writeHead(204).end()
        } else {
            return res.writeHead(404, 'document not found').end()
        }
    }

    delete(table, id, res) {
        const rowIndex = this.#database[table].findIndex(row => row.id === id)

        if(rowIndex > -1) {
            this.#database[table].splice(rowIndex, 1)
            this.#persist()
            return res.writeHead(204).end()
        } else {
            return res.writeHead(404, 'document not found').end()
        }
    }
}