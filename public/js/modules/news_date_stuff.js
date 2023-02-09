function range(x, min, max) {
    if (x >= min && x <= max) {
        return false;
    } else {
        return true;
    }
}

function checkLeapYear(year) {
    //three conditions to find out the leap year
    if ((0 == year % 4) && (0 != year % 100) || (0 == year % 400)) {
        return true;
    } else {
        return false;
    }
}

function valid_day(month, day, year) {
    if ([4, 6, 9, 11].includes(month)) {
        if (range(day, 1, 30)) {
            return true;
        } else {
            return false;
        }
    }
    if ([1, 3, 5, 7, 8, 10, 12].includes(month)) {
        if (range(day, 1, 31)) {
            return true;
        } else {
            return false;
        }
    }
    if (month === 2) {
        if (checkLeapYear(year)) {
            if (range(day, 1, 29)) {
                return true;
            } else {
                return false;
            }
        } else {
            if (range(day, 1, 28)) {
                return true;
            } else {
                return false;
            }
        }
    }

    return false;
}


export {valid_day}