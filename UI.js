function play(){
    const elementsIntro = document.querySelectorAll('.intro, #play, #info, .descInfo');
    elementsIntro.forEach(element => {
        element.style.display = "none";
    })
    const elementsPlay = document.querySelectorAll('.playtime, #back');
    elementsPlay.forEach(element => {
        element.style.display = "block";
    })
}
function back(){
    const elementsIntro = document.querySelectorAll('.intro, #play, #info');
    elementsIntro.forEach(element => {
        element.style.display = "block";
    })
    const elementsPlay = document.querySelectorAll('.playtime, #back');
    elementsPlay.forEach(element => {
        element.style.display = "none";
    })
}
function info(){
    const elementsInfo = document.querySelectorAll('.descInfo');
    elementsInfo.forEach(element => {
        element.style.display = "block";
    })
}
function hide1(){
    const elementsGameDesc = document.querySelectorAll('#gameDesc');
    elementsGameDesc.forEach(element => {
        element.style.display = "none";
    })
}
function hide2(){
    const elementsCreatorDesc = document.querySelectorAll('#creatorDesc');
    elementsCreatorDesc.forEach(element => {
        element.style.display = "none";
    })
}
resetBtn.addEventListener('click', () => {
    currentPlayer = 'white';
    selectedCell = null;
    createBoard();
    renderBoard();
});