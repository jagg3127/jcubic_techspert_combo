var employee= [
    {
        'employee':  1, //owners or co-owners
        'id':        ['LHVTA920']   
    }, 
        
    {
        'employee':  2, //moderators or workers
        'id':        ['ARW2EDS4', 'VP58B76A'] 
    },

    {
        'employee':  3, //somehow in the login but not really
        'id':        ['DEV']
    },

    {
        'employee': 4,
        'id': ['GUEST']
    }

]

var users= {
    'LHVTA920': 'Techspert',
    'ARW2EDS4': 'Pixel',
    'VP58B76A': 'Mrs. Pointer',
    
    'GUEST':    'unknown',
    'DEV':      'Devlin the crownless',
}

function fetch_user(id) {
    return users[id]
}

function fetch_rank(id) {
    for (let index = 0; index < employee.length; index++) {
        const element = employee[index];
        for (let index2 = 0; index2 < element['id'].length; index2++) {
            const element2 = element['id'][index2];
            if (element2===id){
                return element['employee']
            }
        }
    }
    return null
}
function rank(token) {
    var num=fetch_rank(token)
    if (num === 1) {
        return "Leader"
    } else if (num === 2) {
        return "Admin"
    } else if (num === 3) {
        return "Watcher"
    } else if (num === 4) {
        return "GUEST"
    } else {
        return null
    } 
}

export {fetch_user, fetch_rank, rank};