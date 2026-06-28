var timer;
var checkvalue = false;
let next = document.getElementById("nextbutton");
next.disabled = true;

var compareDate = new Date('July 16, 2022, 12:30:00');
var startDate = new Date('July 16, 2022, 11:00:00');
var presentDate;

const getDate = () => {
    fetch('/time/timing')
    .then((res) => res.json())
    .then((res) => {
        compareDate = new Date(res.EDate);
        startDate = new Date(res.SDate);
        presentDate = new Date(res.presentDate);

        if (presentDate >= compareDate) {
            next.disabled = true;
            next.style.cursor = 'not-allowed';
            next.style.backgroundColor = '#ccc';
            next.style.color = '#666';
            next.onclick = null;
            document.getElementById("timer").innerHTML = "The exam has already ended.";
            clearInterval(timer);
        } else if (presentDate >= startDate) {
            next.disabled = false;
            next.style.cursor = 'pointer';
            next.style.backgroundColor = 'Green';
            next.style.color = '#fff';
            next.onclick = () => { window.location.href = '/quiz'; };
            document.getElementById("timer").innerHTML = "The exam has started.";
            clearInterval(timer);
        }
    })
    .catch((err) => console.error("Error fetching timings:", err));
}
getDate();

timer = setInterval(function() {
    getDate();
    timeBetweenDates(startDate, presentDate);
}, 1000);

function timeBetweenDates(toDate, present) {
  var dateEntered = toDate;
  var now = present;
  if (!now || !dateEntered) return;
  checkvalue = true;

  var difference = dateEntered.getTime() - now.getTime();

  if (difference <= 0) {
    next.disabled = false;
    next.style.cursor = 'pointer';
    next.style.backgroundColor = 'Green';
    next.style.color = '#fff';
    next.onclick = () => { window.location.href = '/quiz'; };
    clearInterval(timer);
    
    $("#hours").text(0);
    $("#minutes").text(0);
    $("#seconds").text(0);
  } else {
    next.disabled = true;
    next.style.cursor = 'not-allowed';
    next.style.backgroundColor = '#ccc';
    next.style.color = '#666';
    next.onclick = null;

    var seconds = Math.floor(difference / 1000);    
    var minutes = Math.floor(seconds / 60);
    var hours = Math.floor(minutes / 60);
    var days = Math.floor(hours / 24);

    minutes %= 60;
    seconds %= 60;

    $("#hours").text(hours + (days * 24));
    $("#minutes").text(minutes);
    $("#seconds").text(seconds);
  }
}