async function find_database(month, day, year, type=Boolean) {
    var z=fetch('https://opensheet.elk.sh/1lpZvoY7c_hxDe5qDEGKO1LBj33RXeElIc-7jV6mT5Eg/news')
        .then((res) => res.json())
        .then((data) => {
            for (let index = 0; index < data.length; index++) {
                const row = data[index];
                if (String(row['MONTH'])===String(month) && String(row['DAY'])===String(day) && String(row['YEAR'])===String(year)) {
                    if (type) {
                        return true;
                    } else {
                        return [row['TEXT'], row['USER'], Boolean(row['USER_ADMIN'])];
                    }
                }

            }
            if (type) {
                return false;
            } else {
                return undefined;                
            }
        
        });
    return z
}

async function find_help(command) {
    if (command === undefined) {
        var z=fetch('https://opensheet.elk.sh/1lpZvoY7c_hxDe5qDEGKO1LBj33RXeElIc-7jV6mT5Eg/help')
            .then((res) => res.json())
            .then((data) => {  
                var arr = []
                for (let index = 0; index < data.length; index++) {
                    const row = data[index];
                    var com= row["command"]
                    var des= row["description"]
                    var adm= row["admin"] 
                    if (com != undefined && des != undefined) {
                        arr.push({
                            "command": com,
                            "admin":   adm
                        })
                    }
                }
                return arr
            });
    } else {
        var z=fetch('https://opensheet.elk.sh/1lpZvoY7c_hxDe5qDEGKO1LBj33RXeElIc-7jV6mT5Eg/help')
            .then((res) => res.json())
            .then((data) => {  
                for (let index = 0; index < data.length; index++) {
                    const row = data[index];
                    var com= row["command"]
                    var des= row["description"]
                    var adm= row["admin"] 
                    if (com===command) {
                        if (com != undefined && des != undefined) {
                            return [{
                                "command": com + ": \n" + des,
                                "admin":   adm
                            }]
                        }
                    }
                }
                
        });
    }

    return z
    
}


export {find_database, find_help};