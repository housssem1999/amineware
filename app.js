const express = require('express');
const multer = require('multer');
const fs = require('fs');

const app = express();
const port = 3000;

const upload = multer({ dest: 'uploads/' });
app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

function sortEmployeeCodes(employeeCodes) {
    return employeeCodes.sort((a, b) => {
        const keyA = getSortingKey(a);
        const keyB = getSortingKey(b);
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
    });
}

function getSortingKey(code) {
    const firstLetter = code.charAt(0);
    const lastLetter = code.charAt(9);
    const middleNumber = code.slice(1, 9);
    return [firstLetter, lastLetter, middleNumber];
}

app.post('/upload', upload.single('file'), (req, res) => {
    try {
        const filePath = req.file.path;
        const employeeCodes = fs.readFileSync(filePath, 'utf8').trim().split('\n');
        if(isValidFileFormat(employeeCodes)){
            const sortedCodes = sortEmployeeCodes(employeeCodes);
            res.json({ sortedCodes });
        }else{
            res.status(400).json({error: 'Invalid Employees Code'})
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error' });
    }
});

function isValidFileFormat(content) {
    const codeRegex = /^[A-Z]\d{8}[A-Z]$/;
    for (const line of content) {
        const trimmedLine = line.trim();
        if (!codeRegex.test(trimmedLine)) {
            return false;
        }
    }
    return true;
}