# Easy Auth

`NOTE: It's an Work In Progress`

`easy-auth` is a comprehensive authentication package in Node that provides a set of utilities and middleware functions for secure user authentication.

## Features
### 1. Auth Class
The Auth class is a collection of utility functions designed to facilitate authentication processes. It includes methods for:

- User authentication
- Token generation
- Password hashing
- Token validation
- Access control
- etc.
### 2. Middleware Class
The Middleware class consists of middleware functions to be used in the authentication process, including:

- Access token verification
- Refresh token verification
- Input validation for user registration and login
- More to be added

### Installation
To install follow these steps:

```bash
npm i @jyotirmay/easy-auth @jyotirmay/easy-auth-kysely-adapter
```

### Usage

```javascript
const easyAuth = require("@jyotirmay/easy-auth")
const { KyselyAdapter } = require("@jyotirmay/easy-auth-kysely-adapter")
const express = require("express")
const pg = require("pg")
const cookieParser = require('cookie-parser')

const { Auth, Middleware } = easyAuth.init({
    adapter: new KyselyAdapter({
        client: "postgres",
        pool: new pg.Pool({
            host: "localhost",
            port: 5432,
            database: "test",
            user: "postgres",
            password: "password",
        }),
        // refresh: true -> set true on development mode to refresh the migrations
        // migrate: true -> set true if you need the migrations to run
    }),
    jwt: {
        access_token_secret: "secret",
        verification_secret: "secret",
        password_reset_secret: "secret",
        refresh_token_secret: "secret"
    },
    cache: "memory"
})


const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))

app.post('/register', async (req, res) => {
    const data = await Auth.register(req.body, { expiresIn: "15m" })
    console.log(data);
    return res.status(200).json({ message: "okay" })
})

app.post('/verify', async (req, res) =>{
    const token = req.query.token
    const { message, success } = await Auth.verifyEmail({ token })
    if(success) return res.json({ message })
    return res.status(400).json({ message })
})

app.post('/login', async (req, res) =>{
    const data = await Auth.login({ email: req.body.email, password: req.body.password })

    if(!data.success) return res.json({ message: data.message })

    res.cookie('refresh_token', data.refresh_token).json({
        message: data.message,
        refresh_token: data.refresh_token,
        access_token: data.access_token
    })
})

app.get('/secret', Middleware.validateAccessToken({ extractFrom: "bearer" }), async (req, res) =>{
    return res.json({
        message: "Secret data"
    })
})

app.post('/new-access-token', async (req, res) =>{
    const token = req.cookies.refresh_token

    const data = await Auth.generateAccessToken({ token }, { expiresIn: "15m" })
    if(!data.success) return res.status(500).json({message: data.message})
    return res.json({
        message: "access token generared",
        access_token: data.access_token
    })
})


app.listen(5000, () => {
    console.log('Listening on http://localhost:5000');
})

```
### Contribution
Contributions are welcome

### License
This project is licensed under MIT
