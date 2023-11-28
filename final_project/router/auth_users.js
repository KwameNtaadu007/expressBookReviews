const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();
const SECRET_KEY = "fingerprint_verification";

let users = [
  { username: "user1", password: "password1" },
  { username: "user2", password: "password2" },
  { username: "user3", password: "password3" },
  { username: "kwame", password: "backend@IBM" },
];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
  const regex = /^[a-zA-Z0-9_]{3,16}$/; //must be between 3 and 16 alphanumeric char & _
  return regex.test(username);
};

const authenticatedUser = (username, password) => {
  //returns boolean
  //write code to check if username and password match the one we have in records.
  return users.some(
    (user) => user.username === username && user.password === password
  );
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  //Write your code here
  const { username, password } = req.body;

  // Check if the username is valid and the password is not empty
  if (!isValid(username) || !password) {
    return res
      .status(400)
      .json({ message: "Valid username and password are required." });
  }
  // Check if the username and password are correct
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password." });
  }
  let accessToken = jwt.sign(
    {
      data: username,
    },
    SECRET_KEY,
    { expiresIn: 60 * 60 }
  );
  req.session.authorization = {
    accessToken,
  }; console.log(accessToken)
  return res.status(200).send("User successfully logged in");
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const { isbn } = req.params;
  const { review } = req.body;
  const username = req?.user.data;
  console.log(req.body.review);

  if (!username) {
    return res.status(401).json({ message: "User not authenticated." });
  }

  if (!review) {
    return res.status(400).json({ message: "Review is required." });
  }

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  const existingReviewIndex = book.reviews.findIndex(
    (r) => r.username === username && r.isbn === isbn
  );

  if (existingReviewIndex !== -1) {
    // Update the existing review
    book.reviews[existingReviewIndex].review = review;
    return res.status(200).json({ message: "Review updated successfully." });
  } else {
    // Add a new review
    book.reviews.push({ isbn, username, review });
    return res.status(200).json({ message: "Review added successfully." });
  }
  //return res.status(300).json({message: "Yet to be implemented"});
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const username = req?.user.data;

  if (!username) {
    return res.status(401).json({ message: "User not authenticated." });
  }

  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (Array.isArray(book.reviews)) {
    // Filter out the review belonging to the logged-in user
    const filteredReviews = book.reviews.filter(
      review => review.username === username
    );

    if (filteredReviews.length === book.reviews.length) {
      // No review was removed (the user may not have had a review for this book)
      return res.status(404).json({ message: "User review not found." });
    }

    // Update book reviews with filtered reviews
    book.reviews = filteredReviews;

    return res.status(200).json({ message: "Review deleted successfully." });
  } else {
    return res.status(404).json({ message: "No reviews found for the book." });
  }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
