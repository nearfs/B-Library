'use strict';

import 'jquery';
import { notifier } from 'notifier';
import { request } from 'requester';
import { header } from 'header-generator';
import { userModel } from 'user-model';
import { validator } from 'validator';
import { kinveyUrls } from 'kinvey-urls';
import CryptoJS from 'cryptojs';

function getUserLoginDetails() {
    let user = {
        "username": $('#login-username').val(),
        "password": CryptoJS.SHA1($('#login-password').val()).toString(),
    }

    return user;
}

function loadFrontPageEvents() {

    $('#sign-in-user').on('click', function(ev) {
        userModel.login(getUserLoginDetails());
    });

    $('#login-password').on('keydown', function(ev) {
        if (ev.which === 13) {
            userModel.login(getUserLoginDetails());
        }
    });

    $('#input-confirm-password').on('input', function(ev) {
        let $this = $(ev.target);

        if ($this.val() !== $('#input-password').val()) {
            $this.parents('.form-group').addClass('has-error');
        } else {
            $this.parents('.form-group').removeClass('has-error');
        }
    })

    $('#input-password').on('input', function(ev) {
        let $this = $(ev.target);
        let confirmPassword = $('#input-confirm-password')
        if ($this.val() === confirmPassword.val()) {
            confirmPassword.parents('.form-group').removeClass('has-error');
        } else {
            confirmPassword.parents('.form-group').addClass('has-error');
        }
    })

    $('#sign-up-user').on('click', function(ev) {

        let user = {
            "username": $('#input-username').val(),
            "password": CryptoJS.SHA1($('#input-password').val()).toString(),
            "firstName": $('#input-first-name').val(),
            "lastName": $('#input-last-name').val(),
            "email": $('#input-email-address').val(),
            "readBooks": []
        };

        if (validator.validateNames(user.firstName, user.lastName) &&
            validator.validateUsername(user.username) &&
            validator.validateEmail(user.email) &&
            validator.validatePassword()) {
            userModel.register(user);
        }
    });
}

function loadUserNavigationEvents() {
    $('#sign-out-user').on('click', function(ev) {
        userModel.logout();
    });
}

function loadModalEvents(data){
     $('.book-learn-more').on('click', function(ev) {
        let bookTitle = $(ev.target).parent().find('h2').html();
        let book = data.books.find(x => x.title === bookTitle);

        $('#book-img').attr('src', book.cover._downloadURL);
        $('#book-info .book-content h2').html(book.title);
        $('#book-info .book-content .book-content-author').html(`by ${book.author}`);
        $('#book-info .book-content .book-content-rating').html(`<b>Rating:</b> ${book.rating}`);
        $('#book-info .book-content .book-content-publish-year').html(`<b>Published:</b> ${book.year}`);
        $('#book-info .book-content .book-content-pages').html(`<b>Pages:</b> ${book.pages}`);
        $('#book-info .book-content .book-content-isbn').html(`ISBN:</b> ${book.isbn}`);
        $('#book-info .book-content .book-content-description').html(book.description);
    });

    $('.mark-as-read').on('click', function(ev) {
        let bookTitle = $(ev.target).parent().find('h2').html();

        $('#book-read').find('legend').html(bookTitle);
    });

    $('.author-learn-more').on('click', function(ev) {
        let authorNames = $(ev.target).parent().find('h2').html().split(' ');
        let author = data.authors.find(x => x.firstName === authorNames[0] && x.lastName === authorNames[1]);

        $('#author-img').attr('src', author.picture._downloadURL);
        $('#author-info .author-content h2').html(`${author.firstName} ${author.lastName}`);
        $('#author-info .author-content .author-content-genre').html(`<b>Genre:</b> ${author.genre}`);
        $('#author-info .author-content .author-content-birth-date').html(`<b>Date of birth:</b> ${author.dateOfBirth}`);
        $('#author-info .author-content .author-content-birth-place').html(`<b>Place of birth:</b> ${author.born}`);
        $('#author-info .author-content .author-content-description').html(author.description);

    });

    let promise = new Promise((resolve, reject) => {
        resolve(data);
    })

    return promise;
}

function loadHomePageEvents(data) {
    loadModalEvents(data);
    let promise = new Promise((resolve, reject) => {
    resolve(data);
    })

    return promise;
}


function loadAuthorsPageEvents(data) {
    $('#no-results-paragraph').hide();
    $('#search-author-button').on('click', function(ev) {

        let firstNameValue = $('#first-name-search').val();
        let lastNameValue = $('#last-name-search').val();
        //TODO:filter(x => x.firstName)

        function searchByFirstName(firstNameValue) {
            if (firstNameValue !== "") {
                let newArray = data.authors.filter(x => x.firstName.indexOf(firstNameValue) >= 0);
                if (newArray.length === 0) {
                    $('#no-results-paragraph').show();
                } else {
                    $('#no-results-paragraph').hide();
                }
                newArray.forEach(function(element) {
                    $(`#${element._id}`).show();
                });
            }
        }

        function searchByLastName(lastNameValue) {
            if (lastNameValue !== "") {
                let newArray = data.authors.filter(x => x.lastName.indexOf(lastNameValue) >= 0);
                if (newArray.length === 0) {
                    $('#no-results-paragraph').show();
                } else {
                    $('#no-results-paragraph').hide();
                }
                newArray.forEach(function(element) {
                    $(`#${element._id}`).show();
                });
            }
        }


        searchByFirstName(firstNameValue);
        searchByLastName(lastNameValue);
    });

    $('#first-name-search').on('input', function(ev) {
        data.authors.forEach(function(element) {
            $(`#${element._id}`).hide();
        });

        $('#search-name-change').text("Search Results");
    });

    $('#last-name-search').on('input', function() {
        data.authors.forEach(function(element) {
            $(`#${element._id}`).hide();
        });

        $('#search-name-change').text("Search Results");
    });

    $('#show-all-authors').on('click', function() {
        data.authors.forEach(function(element) {
            $(`#${element._id}`).show();
        });
    });

    let promise = new Promise((resolve, reject) => {
      resolve(data);
    });

    return promise;
}

function loadBooksPageEvents(data) {

    $('#no-results-paragraph').hide();
    $('#search-book-button').on('click', function() {
        let bookTitleValue = $('#book-title-search').val();
        let bookGenreValue = $('#book-genre-search').val();

        function searchByTitle(bookTitleValue) {
            if (bookTitleValue !== "") {
                let newArray = data.books.filter(x => x.title.indexOf(bookTitleValue) >= 0);
                if (newArray.length === 0) {
                    $('#no-results-paragraph').show();
                } else {
                    $('#no-results-paragraph').hide();
                }
                newArray.forEach(function(element) {
                    $(`#${element._id}`).show();
                });
            }
        }

        function searchByGenre(bookGenreValue) {
            if (bookGenreValue !== "") {
                let newArray = data.books.filter(x => x.genre.indexOf(bookGenreValue) >= 0);
                if (newArray.length === 0) {
                    $('#no-results-paragraph').show();
                } else {
                    $('#no-results-paragraph').hide();
                }
                newArray.forEach(function(element) {
                    $(`#${element._id}`).show();
                });
            }
        }
        searchByTitle(bookTitleValue);
        searchByGenre(bookGenreValue);
    })

    $('#show-all-books').on('click', function() {
        console.log(data.books);
        data.books.forEach(function(element) {
            $(`#${element._id}`).show();
        });
    });

    $('#book-title-search').on('input', function(ev) {
        data.books.forEach(function(element) {
            $(`#${element._id}`).hide();
        });

        $('#search-name-change').text("Search Results");
    });

    $('#book-genre-search').on('input', function() {
        data.books.forEach(function(element) {
            $(`#${element._id}`).hide();
        });

        $('#search-name-change').text("Search Results");
    });

    let promise = new Promise((resolve, reject) => {
      resolve(data);
    });

    return promise;
}

function loadBooksButtonEvent(data) {
    $('.read-review').on('click', function(ev) {
        let reviewModal = $(ev.target).parent().parent();

        let bookTitle = reviewModal.find('legend').html();
        let book = data.books.find(x => x.title === bookTitle);

        let review = reviewModal.find('textarea').val();
        let rating = reviewModal.find('select').val() | 0;

        let oldCountRead = book.countRead;
        let oldRating = book.rating;

        let newCountRead = oldCountRead + 1;
        let newBookRating = ((oldRating * oldCountRead) + rating) / newCountRead;
        newBookRating = Math.round(newBookRating * 10) / 10;

        book.countRead = newCountRead;
        book.rating = newBookRating;

        let head = header.getHeader(true, false);
        request.put(`https://baas.kinvey.com/appdata/${kinveyUrls.KINVEY_APP_ID}/books/${book._id}`, head, book)
            .then(() => {
                return request.get(`https://baas.kinvey.com/user/${kinveyUrls.KINVEY_APP_ID}/${localStorage.USER_ID}`, head)
            })
            .then((user) => {
                let readBook = {
                    'rating': rating,
                    'review': review,
                    'book': {
                        '_type': "KinveyRef",
                        '_id': book._id,
                        '_collection': "books"
                    }
                }
                user.readBooks.push(readBook);
                return request.put(`https://baas.kinvey.com/user/${kinveyUrls.KINVEY_APP_ID}/${localStorage.USER_ID}`, head, user);
            }).then((response) => {
                notifier.show('Book added successfully', 'success');
            })
            .catch((err) => {
                err = err.responseJSON.description;
                notifier.show(err, 'error');
            });

        setTimeout(() => {
            $('.close-read').trigger('click');
        }, 500);
    });

    $('.close-read').on('click', function(ev) {
        let reviewModal = $(ev.target).parent().parent();

        reviewModal.find('textarea').val('');
        reviewModal.find('select').val('1');
    });
}

function loadProfilePageEvents(data) {
    $('.page').on('click', function(ev) {
        let $this = $(ev.target);
        let pageNumebr = $this.html();
        let startIndex = (pageNumebr * 4) - 4;

        for (let i = startIndex; i < startIndex + 4; i += 1) {
            if ($this.parents('#read-books').length > 0) {
                let fieldID = `#book-field-${i - startIndex}`;
                let selectorCover = `${fieldID} .thumbnail img`;
                let selectorHiddenTitle = `${fieldID} .thumbnail h2`;
                if (data.readBooks[i]) {
                    $(selectorCover).attr('src', data.readBooks[i].book.cover._downloadURL)
                    $(selectorHiddenTitle).html(data.readBooks[i].book.title);
                    $(fieldID).show();
                } else {
                    $(fieldID).hide();
                }

            } else {
                let fieldID = `#author-field-${i - startIndex}`;
                let selector = `${fieldID} .thumbnail img`
                if (data.favoriteAuthors[i]) {
                    $(selector).attr('src', data.favoriteAuthors[i].picture._downloadURL);
                    $(fieldID).show();
                } else {
                    $(fieldID).hide();
                }
            }
        };
    });

    $('.book-learn-more').on('click', function(ev) {
       let bookTitle = $(ev.target).parents().eq(2).find('h2').html();

       let reviewedBook = data.readBooks.find(x => x.book.title === bookTitle);
       let book = reviewedBook.book;

       $('#book-img').attr('src', book.cover._downloadURL);
       $('#book-info .book-content h2').html(book.title);
       $('#book-info .book-content .book-content-author').html(`by ${book.author}`);
       $('#book-info .book-content .book-content-rating').html(`<b>Rating:</b> ${book.rating}`);
       $('#book-info .book-content .book-content-publish-year').html(`<b>Published:</b> ${book.year}`);
       $('#book-info .book-content .book-content-pages').html(`<b>Pages:</b> ${book.pages}`);
       $('#book-info .book-content .book-content-isbn').html(`ISBN:</b> ${book.isbn}`);
       $('#book-info .book-content .book-content-description').html(book.description);
   });

   $('.book-read-review').on('click', function(ev) {
      let bookTitle = $(ev.target).parents().eq(2).find('h2').html();

      let reviewedBook = data.readBooks.find(x => x.book.title === bookTitle);

      console.log(reviewedBook.book.cover._downloadURL);

      $('#book-review-img').attr('src', reviewedBook.book.cover._downloadURL);
      $('#book-review .book-content h2').html(reviewedBook.book.title);
      $('#book-review .book-content .book-content-rating').html(`<b>Rating:</b> ${reviewedBook.rating}`);
      $('#book-review .book-content .book-content-review').html(`${reviewedBook.review}`);
  });

    let promise = new Promise((resolve, reject) => {
      resolve(data);
    });

    return promise;
}

let eventLoader = {
    loadFrontPageEvents,
    loadAuthorsPageEvents,
    loadUserNavigationEvents,
    loadHomePageEvents,
    loadBooksPageEvents,
    loadBooksButtonEvent,
    loadProfilePageEvents,
    loadModalEvents
}

export { eventLoader }
