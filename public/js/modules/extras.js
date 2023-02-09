function range(x, min, max) {
    if (x >= min && x <= max) {
        return false;
    } else {
        return true;
    }
}

function echo(term, text, bold=null, color="white", typing=true){
    if (typing != true){typing=false}
    if (bold   != null){
        setTimeout(() => term.echo("<strong>" + "<" + color + ">" + text + "</" + color + ">" + "</strong>", {typing: typing}), 0);
    } else {
        setTimeout(() => term.echo("<" + color + ">" + text + "</" + color + ">", {typing: typing}), 0);
    }

}


export {range, echo};