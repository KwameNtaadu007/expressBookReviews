const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
    const { username, password } = req.body;
     console.log(req.body)
    if (!isValid(username) || !password) {
      return res.status(400).json({ message: "Valid username and password are required." });
    }
    if (users.some(user => user.username === username)) {
      return res.sendStatus(409).json({ message: "User already exists." });; // Conflict
    }
    users.push({ username, password });
    return res.status(200).json({ message: `${username} has successfully been registered` });
});

// Get the book list available in the shop
public_users.get('/',async function (req, res) {
  //Write your code here
  try {
  
    return res.status(200).json({ books });
  } catch (error) {
    console.error('Error fetching book list:', error);
    return res.status(500).json({ message: 'Error fetching book list' });
  }

  //return res.status(200).json({ books });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  //Write your code here
      try {
        let isbn = req.params.isbn;
        let book = await books[isbn];
        if (book) {
          return res.status(200).json(book);
        } else {
          return res.status(404).json({message: "Book not found"});
        }
      } catch (error) {
        return res.status(500).json({ message: 'Error fetching book by isbn' });
      }
 });

 
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
  //Write your code here
    try {
      let author = req.params.author;
      let booksByAuthor = await Object.values(books).filter(book => book.author === author);
      if (booksByAuthor.length > 0) {
        return res.status(200).json(booksByAuthor);
      } else {
        return res.status(404).json({message: "No books found for the author"});
      }
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching book detail by author' });
    }

});

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
  //Write your code here
  try {
      let title = req.params.title;
      let booksByTitle = await Object.values(books).filter(book => book.title === title);
      if (booksByTitle.length > 0) {
        return res.status(200).json(booksByTitle);
      } else {
        return res.status(404).json({message: "No books found for the title"});
      }
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching book detail by title' });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  try {
    let isbn = req.params.isbn;
    let book = books[isbn];
    if (book) {
      let reviews = book.reviews;
      if (Object.keys(reviews).length > 0) {
        return res.status(200).json(reviews);
      } else {
        return res.status(404).json({message: "No reviews found for the book"});
      }
    } else {
      return res.status(404).json({message: "Book not found"});
    }
} catch (error) {
  return res.status(500).json({ message: 'Error fetching book detail by title' });
}

});

module.exports.general = public_users;
