'use strict';

import 'jquery';
import Sammy from 'sammy';
import { appUrls } from 'application-urls';
import { kinveyUrls } from 'kinvey-urls';
import { request } from 'requester';
import { header } from 'header-generator';
import { template } from 'template-generator';
import { pageLoader } from 'page-controller';

let app = new Sammy(function() {

    this.get(appUrls.MAIN_URL, function() {
        template.get('front-page')
            .then(temp => pageLoader.loadHomePage(temp))
            .then(() => pageLoader.loadHomePageEvents());
    });

    this.get(appUrls.HOME_URL, function() {
        template.get('user-navigation')
            .then(temp => pageLoader.loadUserNavigation(temp))
            .then(() => pageLoader.loadUserNavigationEvents());

        let head = header.getHeader(true, false);
        let data = {};
        request.get(`https://baas.kinvey.com/appdata/${kinveyUrls.KINVEY_APP_ID}/books`, head)
            .then((res) => { data.books = res })
            .then(() => {
                request.get(`https://baas.kinvey.com/appdata/${kinveyUrls.KINVEY_APP_ID}/authors`, head)
                    .then((res) => { data.authors = res })
                    .then(() => {
                        template.get('home-page')
                            .then(temp => pageLoader.loadUserMainPage(temp, data))
                    })
            });



        $('#root').html('HOMEPAGE WHEN USER IS LOGGED IN');
    });

    this.bind('redirectToUrl', function(event, url) {
        this.redirect(url);
    });

});

app.run(appUrls.MAIN_URL);