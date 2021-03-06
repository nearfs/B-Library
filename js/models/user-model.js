'use strict';

import { header } from 'header-generator';
import { request } from 'requester';
import { notifier } from 'notifier';
import { kinveyUrls } from 'kinvey-urls';
import CryptoJS from 'cryptojs';
import Sammy from 'sammy';

let userModel = (function(){
  class User {

    register(data) {
      let promise = new Promise((resolve, reject) => {
        let head = header.getHeader(false, true);
        request.post(`${kinveyUrls.KINVEY_USER_URL}`, head, data)
            .then(response => {
                notifier.show('SIGN UP SUCCESSFUL', 'success');
                let user = {
                    username: response.username,
                    password: response.password
                }
                resolve(response);
            })
            .catch((err) => {
                err = err.responseJSON.description;
                notifier.show(err, 'error');
            });
          });

          return promise;
    }

    login(user) {
        var promise = new Promise(function(resolve, reject) {
            var data = {
                username: user.username,
                password: user.password
            };

            let head = header.getHeader(false, true);

            request.post(`${kinveyUrls.KINVEY_USER_URL}/login`, head, data)
                .then(response => {
                    localStorage.setItem('AUTH_TOKEN', response._kmd.authtoken);
                    localStorage.setItem('USER_NAME', response.username);
                    localStorage.setItem('USER_ID', response._id);
                    notifier.show('SIGN IN SUCCESSFUL', 'success');
                    setTimeout(function() {
                        Sammy(function() {
                            this.trigger('redirectToUrl', '#/home');
                        });
                    });

                    resolve();
                })
                .catch((error) => {
                    notifier.show('Invalid username or password', 'error');
                });
        });

        return promise;
    };

    logout() {
        var promise = new Promise((resolve, reject) => {
            localStorage.clear();
            notifier.show('SIGN OUT SUCCESSFUL', 'success');
            setTimeout(function() {
                Sammy(function() {
                    this.trigger('redirectToUrl', '#/')
                });
            });

            resolve();
        });

        return promise;
    };

    current() {
        return {
            authtoken: localStorage.getItem('AUTH_TOKEN'),
            username: localStorage.getItem('USER_NAME'),
            id: localStorage.getItem('ID')
        }
    };
  }

  return new User();
}());

export { userModel };
