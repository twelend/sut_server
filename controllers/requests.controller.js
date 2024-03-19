const db = require('../db')

class RequsetsController {
    async createRec(req, res) {
        const {
            parentName,
            name,
            date,
            phone,
            email,
            time
        } = req.body || {};

        if (!phone || !email || !name || !parentName || !date || !time) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
    
        const newRequest = await db.query(`INSERT INTO requests (parentName, name, date, phone, email, time) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [parentName, name, date, phone, email, time]);
        
        res.json(newRequest.rows[0]);
    }
    async getAll(req, res) {
        const requests = await db.query(`SELECT * FROM requests`)
        res.json(requests.rows)
    }
    async deleteAll(req, res) {
        await db.query(`ALTER SEQUENCE requests_id_seq RESTART WITH 1`);
        const requests = await db.query(`DELETE FROM requests`)
        res.json(requests.rows[0])
    }
}

module.exports = new RequsetsController()