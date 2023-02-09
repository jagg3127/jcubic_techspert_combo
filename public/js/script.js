import {find_database, find_help} from "./modules/async_promises.js";
import {range, echo} from "./modules/extras.js";
import {valid_day} from "./modules/news_date_stuff.js";
import {fetch_user, fetch_rank, rank} from "./modules/user_info.js";

var animation = false;
var prompt;
var string;
var timer;

function wrap(fn, command) {
    return function(...args) {
    return new Promise((resolve, reject) => {
        find_help(command).then((arr) => {
            for (let index = 0; index < arr.length; index++) {
                const element = arr[index];
                var   admin   = Number(element["admin"])
                var   rank    = Number(fetch_rank(this.token()))
                if (this.token()) {
                        if (rank <= admin) {
                            var ret = fn.apply(this, args);
                            resolve(ret);
                        } else {
                            reject('No access');
                        }
                };
            }
        });
        });
   };
 }
 

function progress(percent, width, token, phrase, color) {
    var size = Math.round(width*percent/100);
    var left = '', taken = '', i;
    for (i=size; i--;) {
        taken += token;
    }
    if (taken.length > 0) {
        taken = taken.replace(/=$/, '>');
    }
    for (i=width-size; i--;) {
        left += ' ';
    }
    if (phrase===0) {
        return '[' + taken + left + '] ' + percent + '%';    
    } else {
        return '[' + "<"+ color +">" + phrase + taken + left + '] ' + percent + '%' + "</"+ color +">";  
    }
}

function progress_run(term, phrase, size, token, color) {
    var i = 0;
    prompt = term.get_prompt();
    string = progress(0, size);
    term.set_prompt(progress);
    animation = true;
    (function loop() {
        string = progress(i++, size, token, phrase, color);
        term.set_prompt(string);
        if (i < 100) {
            timer = setTimeout(loop, 100);
        } else {
            term.echo(progress(i, size, token, phrase, color) + ' [[b;green;]OK]')
                .set_prompt(prompt);
            animation = false
        }
    })();
}
$(function() {
    var term=$('body').terminal({
        current: wrap(function(data) {
            if (data==="user") {
                echo(this, "Current user is " + fetch_user(this.token()) + " rank " + fetch_rank(this.token()) + " or " + rank(this.token))
            } else if (data==="news") {
                var today = new Date();
                var day   =  today.getDate()
                var month =  today.getMonth() + 1;
                var year  =  today.getFullYear();

                var string_constructed = month + "/" + day + "/" + year 

                echo(this, "2/4/23" + "-" + string_constructed)
            } else {
                echo(this, "command not found in database", null, "white", false)
            }
        }, "current news"),

        read:  wrap(function(month, day, year) {
            var condition=month === undefined || day === undefined || year === undefined
            if (condition && month != "current") {
                return echo(this, "Please make sure youve defined the whole date") 
            } else {
                if (month==="current") {
                    var today = new Date();
                    var day   =  today.getDate()
                    var month =  today.getMonth() + 1;
                    var year  =  today.getFullYear().toString().substring(2);
                }
                if (range(month, 1, 12)) { return echo(this, "That is not a valid month") }
                if (valid_day(month, day, year)) { return echo(this, "That is not a valid month") }
                find_database(month, day, year, false).then((arr) => {
                    if (arr != undefined){
                        var text=arr[0]
                        var User=arr[1]
                        var Admin=arr[2]                                    
                        this.clear()
                        this.echo("[[b;blue;]Daily Techland News: ]")
                        echo(this, "Welcome "+ fetch_user(this.token()) + " rank " + fetch_rank(this.token()), true, "green", false)  
                        this.echo("[[;white;]" + month + "/" + day + "/" + year + "]")
                        this.echo("[[;white;]" +text + "\n\n---" + User+ "]")
                        
                    } else{ return echo(this, "Cannot find log in database") }
                });
            }
        }, "read"),

        help: function(command) {
            find_help(command).then((arr) => {
                for (let index = 0; index < arr.length; index++) {
                    const element = arr[index];
                    var   admin   = Number(element["admin"])
                    var   com     = element["command"]
                    var   rank    = Number(fetch_rank(this.token()))
                    if (rank <= admin) {
                        if (command != undefined) {
                            echo(this, com)
                        } else {
                            this.echo("<white>"+com+"</white>")
                        }
                    } else if (command != undefined) {
                        echo(this, "YOU DO NOT HAVE CLEARENCE")                        
                    }

                }
            });
        }

        
    }, {
        /*
        */
        onCommandNotFound() {
            echo(this, "command not found in database", null, "white", false)
        },
        onInit() {
            this.clear()
            this.echo("[[b;blue;]TECHLAND Terminal loaded]")
            echo(this, "Welcome "+ fetch_user(this.token()) + " rank " + fetch_rank(this.token()), true, "green")   
        },
        login: function(user, pass) {
            return $.ajax({
                type: "POST",
                url: 'php/command.php',
                data: {user: user, pass: pass},
            
            }).done(function(data) {
                return data                
            });
        },
        prompt: function() {
            return "&lt;&lt;"+ rank(this.token()) +"&gt;&gt;"
        },
        onExit: function() {
            term.clear()
            term.echo("[[b;blue;]Terminal loading...]")
            progress_run(term, "Initializing", 60, ".", "red")
        },
        keydown: function(e, term) {
            if (animation) {
                if (e.which == 68 && e.ctrlKey) { // CTRL+D
                    return true;
                }
            }
        },

        greetings: false,
        clear: false,
        checkArity: false

    });
    if (term.token()=== undefined) {
        term.clear()
        term.echo("[[b;blue;]Terminal loading...]")
        progress_run(term, "Initializing", 30, ".", "red")
    } 
    

});     