import { Database } from "./database.js"
import { randomUUID } from 'node:crypto'
import { buildRoutePath } from './utils/build-route-path.js'

const database = new Database();

export const routes = [
    {
        method: 'GET',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const {search} = req.query
            const tasks = database.select('tasks', search ? {
                title: search,
                description: search
            } : null)

            return res.end(JSON.stringify(tasks))
        }
    },
    {
        method: 'POST',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const { title, description } = req.body

            if( !title || !description ){
                return res.writeHead(422, 'error on request body').end()
            }

            const task = {
                id: randomUUID(),
                title,
                description,
                created_at: new Date(Date.now() - (3 * 60 * 60 * 1000)).toUTCString(),
                updatedAt: new Date(Date.now() - (3 * 60 * 60 * 1000)).toUTCString(),
                completed_at: null,
            }

            database.insert('tasks', task)

            return res.writeHead(201).end()
        }
    },
    {
        method: 'PUT',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params
            const { title, description } = req.body
            const updated_at = new Date(Date.now() - (3 * 60 * 60 * 1000)).toUTCString();

            if( !title || !description ){
                return res.writeHead(422, 'error on request body').end()
            }

            database.update('tasks', id, {title, description, updated_at}, res)
        }
    },
    {
        method: 'PATCH',
        path: buildRoutePath('/tasks/:id/complete'),
        handler: (req, res) => {
            const { id } = req.params

            database.patch('tasks', id, res)
        }
    },
    {
        method: 'DELETE',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params;

            database.delete('tasks', id, res)
        }
    }
]