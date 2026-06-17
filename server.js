import express from 'express'
import cors from 'cors'

const app = express()

app.get('/', (req,res) => {
    res.send("API is working")
})

const port = 5000;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})