import express from "express";
import cors from 'cors';
import path from 'path'; // Import path module
import { adminRouter } from "./Routes/AdminRoute.js";
import { EmployeeRouter } from "./Routes/EmployeeRoute.js";
import Jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { fileURLToPath } from 'url';

// Create __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(cors({
    origin: ["http://localhost:5173"],
    methods: ['GET', 'POST', 'PUT', "DELETE"],
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Route handlers
app.use('/auth', adminRouter);
app.use('/employee', EmployeeRouter);


// JWT verification middleware
const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        Jwt.verify(token, "jwt_secret_key", (err, decoded) => {
            if (err) return res.json({ Status: false, Error: "Wrong Token" });
            req.id = decoded.id;
            req.role = decoded.role;
            next();
        });
    } else {
        return res.json({ Status: false, Error: "Not authenticated" });
    }
};

// Route that requires authentication
app.get('/verify', verifyUser, (req, res) => {
    return res.json({ Status: true, role: req.role, id: req.id });
});


// Serve static files from the dist folder
const distPath = path.join(__dirname, './frontend/dist');

app.use(express.static(distPath));

app.get("*", (req, res) => {
    try {
        res.sendFile(path.join(distPath, 'index.html'));
    } catch (error) {
        console.error('Error sending file:', error);
        res.status(500).send('Internal Server Error');  //for error handling
    }
});

// Start the server
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
