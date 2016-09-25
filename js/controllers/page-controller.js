'use strict';

import 'jquery';
import { notifier } from 'notifier';
import { userModel } from 'user-model';
import CryptoJS from 'cryptojs';

let ROOT_SELECTOR = '#root';


function loadHomePage(template) {
    let promise = new Promise((resolve, reject) => {
        $(ROOT_SELECTOR).html(template());
        resolve();
    });

    return promise;
}

function loadUserMainPage(template, data) {    
    let promise = new Promise((resolve, reject) => {
        $(ROOT_SELECTOR).append(template(data));
        resolve();
    });

    return promise;
}

function loadAuthorsPage(template, data){
    let promise = new Promise((resoleve, reject) => {
        $(ROOT_SELECTOR).append(template(data));
        resolve();
    });
}

function getUserLoginDetails() {
    let user = {
        "username": $('#login-username').val(),
        "password": CryptoJS.SHA1($('#login-password').val()).toString(),
    }

    return user;
}

function loadAuthorsPageEvents(){
     $('#search-author-button').on('click', function(ev){
                console.log("ubavec");
            });
}

function loadHomePageEvents() {

    $('#sign-in-user').on('click', function(ev) {
        userModel.login(getUserLoginDetails());
    });

    $('#login-password').on('keydown', function(ev) {
        if (ev.which === 13) {
            userModel.login(getUserLoginDetails());
        }
    });

    $('#sign-up-user').on('click', function(ev) {
        let user = {
            "username": $('#input-username').val(),
            "password": CryptoJS.SHA1($('#input-password').val()).toString(),
            "firstName": $('#input-first-name').val(),
            "lastName": $('#input-last-name').val(),
            "email": $('#input-email-address').val(),
            "readBooks": []
        };
        //validate data here
        userModel.register(user);
    });
}

function loadUserNavigation(template) {
    let user = localStorage.getItem('USER_NAME');
    let promise = new Promise((resolve, reject) => {
        $(ROOT_SELECTOR).empty();
        $(ROOT_SELECTOR).append(template(user));
        resolve();
    });

    return promise;
}

function loadUserNavigationEvents() {
    $('#sign-out-user').on('click', function(ev) {
        userModel.logout();
    });
}

let pageLoader = {
    loadHomePage,
    loadHomePageEvents,
    loadUserNavigation,
    loadUserNavigationEvents,
    loadUserMainPage,
    loadAuthorsPageEvents, 
    loadAuthorsPage
};

export { pageLoader };