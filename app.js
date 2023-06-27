const http = require('http');
const fs = require('fs');
const url = require('url');

const booksFilePath = './books.json';

// Read books from the JSON file
let books = [];
fs.readFile(booksFilePath, 'utf8', (err, data) => {
  if (!err) {
    books = JSON.parse(data);
  } else {
    console.error(`Error reading books file: ${err}`);
  }
});

// Create the server
const server = http.createServer((req, res) => {
  const { pathname, query } = url.parse(req.url, true);

  if (pathname === '/books' && req.method === 'GET') {
    // Return books as JSON response
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(books));
  } else if (pathname === '/books' && req.method === 'POST') {
    // Handle adding a new book
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const newBook = JSON.parse(body);
        books.push(newBook);
        fs.writeFile(booksFilePath, JSON.stringify(books), (err) => {
          if (!err) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Book added successfully');
          } else {
            console.error(`Error writing books file: ${err}`);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Internal Server Error');
          }
        });
      } catch (error) {
        console.error(`Error parsing book details: ${error}`);
        res.statusCode = 400;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Bad Request');
      }
    });
  } else if (pathname.startsWith('/books/') && req.method === 'GET') {
    // Return book details by ID
    const bookId = parseInt(pathname.substring(7));
    const book = books.find((b) => b.id === bookId);
    if (book) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(book));
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Book not found');
    }
  } else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Endpoint not found');
  }
});

// Start the server
const port = 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
