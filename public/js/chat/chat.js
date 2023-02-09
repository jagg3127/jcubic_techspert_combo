/**@license
 * JQuery Terminal Chat using firebase
 *
 * Copyright (C) 2017 Jakub Jankiewicz <http://jcubic.pl/me>
 * Released under the MIT license
 *
 */
const firebaseConfig = {
    apiKey: "AIzaSyBPbmaHbZ34hR-KQhb5zdkqgjfPj3_6uj8",
    authDomain: "chat-jcubic.firebaseapp.com",
    projectId: "chat-jcubic",
    storageBucket: "chat-jcubic.appspot.com",
    messagingSenderId: "245061104565",
    appId: "1:245061104565:web:e0894b54a6a53ad47a5ffc"
};
firebase.initializeApp(firebaseConfig);
var database = firebase.database();

function unpollute(cls, thunk) {
    var polluted = {};
    var proto = cls.prototype;
    // save pol;uted prorotype methods
    Object.getOwnPropertyNames(proto).forEach(name => {
        if (!is_native(proto[name])) {
            polluted[name] = proto[name];
            delete proto[name];
        }
    });
    thunk().then(() => {
        // restore prototype
        Object.keys(polluted).forEach(name => {
            proto[name] = polluted[name];
        });
    });
}
function is_native(fn) {
    return fn.toString().match(/\{\s*\[native code\]\s*\}/);
}

function notification(username) {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js', {
            scope: './'
        }).then((registration) => {
            firebase.messaging().useServiceWorker(registration);
            const messaging = firebase.messaging();
            if (Notification.permission === "granted") {
                messaging.getToken().then(handleTokens);
            } else {
                Notification.requestPermission().then(function() {
                    return messaging.getToken();
                }).then(handleTokens);
            }
            function handleTokens(token) {
                messaging.onTokenRefresh(() => {
                    messaging.getToken().then(updateToken);
                });
                updateToken(token);
            }
            function updateToken(token) {
                var data = new FormData();
                data.append('username', username);
                data.append('token', token);
                return fetch('register.php', {
                    body: data,
                    method: 'POST'
                }).then(r => r.text());
            }
        });
    }
}

function send(username, message) {
   const data = new URLSearchParams();
   data.append('username', username);
   data.append('message', message);
   return fetch('new.php', {
       method: 'POST',
       body: data
   }).then(r => r.text());
}

jQuery(function($) {
    var database, last_messages, messages, username;
    window.firebase_chat = function(...args) {
        ready.then(() => init(...args));
    };
    var ready = $.Deferred();
    figlet.defaults({ fontPath: 'https://unpkg.com/figlet/fonts' });
    // figlet.js bug #75
    unpollute(Array, function() {
        figlet.preloadFonts(['Standard', 'Slant'], function() {
            ready.resolve();
        });
        return ready.promise();
    });
    function render_text(term, text, font) {
        return figlet.textSync(text, {
            font: font || 'Standard',
            width: !term ? 80 : term.cols(),
            whitespaceBreak: true
        });
    }
    function init(term, username) {
        database = firebase.database();
        messages = database.ref('messages');
        last_messages = messages.limitToLast(10);
        push_formatter(function(string) {
            return string.replace(/([^`]|^)`([^`]+)`([^`]|$)/g, '$1[[b;#fff;]$2]$3');
        });
        push_formatter([/```[^\n`]```/g, '[[b;#fff;]$2]']); // `
        push_formatter(function(string) {
            return string.replace(/\b\/me\b/g, username);
        });
        push_formatter(function(string) {
            if (username) {
                return format(string);
            } else {
                return string;
            }
        });
        var state = term.export_view();
        term.clear();
        /*
         * This is ASCII Art that you can change render_text function
         * has message and font for figlet.js library that renders ASCII Art
         */
        term.echo(() => render_text(term, 'Terminal Chat', 'Slant'), { formatters: false });
        start(username);
        var focus = true;
        $(window).off('.chat').on('focus.chat', function() {
            focus = true;
            resetNotifications();
        }).on('blur.chat', function() {
            focus = false;
        });
        var favicon = new Favico({
            animation: 'none'
        });
        var newItems = false;
        var random_value = Math.random();
        var sound = new Audio('/button-9.mp3');
        sound.volume = 0.3;
        var silent = true;
        var new_messages = 0;
        function show_message(data) {
            var message = format(data.message, data.user);
            term.echo(message);
            if (!focus) {
                if (!silent) {
                    sound.play();
                }
                if (!document.hasFocus()) {
                    new_messages += 1;
                    favicon.badge(new_messages);
                }
            }
            term.scroll_to_bottom();
        }
        var newMessages = false;
        last_messages.on('child_added', function(snapshot) {
            if (!newMessages) {
                //return;
            }
            var data = snapshot.val();
            if (data.random != random_value) {
                show_message(data);
            }
        });
        last_messages.once('value', function() {
            term.echo('type [[;#fff;]/help] for help');
            newMessages = true;
        });
        function help() {
            term.echo([
                '',
                '[[b;#fff;]/login \[twitter|github|facebook\]] - to be able to post messages',
                '[[b;#fff;]/help] - this screen',
                '',
                'After Login:',
                '[[b;#fff;]/logout] - logout from the app',
                '[[b;#fff;]/sound true|false] - turn on/off sound notifications',
                '[[b;#fff;]/user <name>] - set new username',
                //'[[b;#fff;]/unregister] - remove push notifications',
                '[[b;#fff;]/quit] - logout and exit from chat',
                'everything else is a message',
                'use &#96;code&#96; or',
                '&#96;&#96;&#96;language',
                'code snippet',
                '&#96;&#96;&#96;',
                'markdown don\'t work, only code snippets',
                ''
            ].join('\n'));
        }
        function quit() {
            while (term.level() > 1) {
                term.pop();
            }
            logout();
            sysend.off('login', login_handler);
            sysend.off('logout', logout_handler);
        }
        function logout() {
            last_messages.off();
            username = null;
            unsubscribe();
        }
        function start(user) {
            notification(user);
            username = user.displayName;
            if (!username) {
                term.echo('Coudn\'t acquire username, you need to set one');
                term.read('username: ').then(function(user) {
                    username = user;
                });
            } else {
                push();
            }
            function push() {
                term.resume().push(function(message) {
                    var cmd = $.terminal.parse_command(message);
                    if (cmd.name == '/sound') {
                        var flag = message.replace(/^\s*\/sound\s*/, '').toLowerCase();
                        if (flag == 'true') {
                            silent = false;
                        } else if (flag == 'false') {
                            silent = true;
                        } else {
                            term.error('wrong flag, only [[;#fff;]true] or [[;#fff;]false]' +
                                       ' are accepted');
                        }
                    } else if (cmd.name == '/user') {
                        username = cmd.args[0];
                    } else if (cmd.name == '/quit') {
                        term.exec('/logout', true);
                        quit();
                    } else if (cmd.name == '/logout') {
                        firebase.auth().signOut();
                        last_messages.off();
                        sysend.broadcast('logout');
                        username = null;
                    } else if (cmd.name == '/help') {
                        help();
                    } else if (message !== '') {
                        var newMessageRef = messages.push();
                        newMessageRef.setWithPriority({
                            user: username,
                            message: message,
                            random: random_value
                        }, firebase.database.ServerValue.TIMESTAMP);
                        send(username, message);
                    }
                }, {
                    prompt: function(callback) {
                        callback('[[;' + color(username) + ';]' +
                                 username + ']> ');
                    }
                });
            }
        }
        var auth = firebase.auth();
        var login = false;
        function login_handler() {
            login = false;
        }
        function logout_handler() {
            messages.off();
        }
        function resetNotifications() {
            new_messages = 0;
            favicon.reset();
        }
        sysend.on('login', login_handler);
        sysend.on('logout', logout_handler);
        var unsubscribe = auth.onAuthStateChanged(function(user) {
            if (user) {
                if (username != (user.displayName || 'Anonymous')) {
                    start(user);
                }
            }
        });
    }
    var limit = 80;
    var formatter_count = 0;
    function push_formatter(formatter) {
        $.terminal.defaults.formatters.push(formatter);
        formatter_count++;
    }
    function pop_formatters() {
        while (formatter_count--) {
            $.terminal.defaults.formatters.pop();
        }
    }
    var colors = {};
    function color(username) {
        return colors[username] = colors[username] || randomColor({
            luminosity: 'light'
        });
    }
    function format(string, username) {
        var user_color = color(username);
        if (string === '' && username) {
            return '[[;' + user_color + ';]' + $.terminal.escape_brackets(username) + ']>';
        }
        // single line broken code snippet
        string = string.split(/(```[^`\n]+```)/).filter(Boolean).map(function(string) {
            var m = string.match(/```([^`\n]+)\n```/);
            if (m) {
                return '`' + $.terminal.escape_brackets(m[1]) + '`';
            }
            return string;
        }).join('');
        return string.split(/\n?(```[\s\S]+?```)\s*\n?/).filter(Boolean).map(function(string) {
            var m = string.match(/```(.*?)\n([\s\S]+?)\n```/);
            if (m) {
                var lang = m[1];
                string = $.terminal.prism(lang, $.terminal.escape_brackets(m[2]));
            } else {
                string = $.terminal.escape_brackets(string);
            }
            if (!username) {
                return string;
            }
            var prefix = '[[;' + user_color + ';]' +
                $.terminal.escape_brackets(username) + ']> ';
            return string.split(/\n/).map(function(line) {
                return prefix + line;
            }).join('\n');
        }).join('\n');
    }
});