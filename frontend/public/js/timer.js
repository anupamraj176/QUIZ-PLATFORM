var timer;
var checkvalue = false;

var compareDate = new Date('July 16, 2022, 12:30:00');
var startDate = new Date('July 16, 2022, 11:00:00');
var presentDate;

const getDate =()=>{
    fetch('/time/timing')
    .then((res)=>res.json())
    .then((res)=>{
        compareDate = new Date(res.EDate);
        startDate = new Date(res.SDate);
        presentDate = new Date(res.presentDate);

        if (presentDate < startDate) {
            window.location.href = '/instruction';
        }
    })
    .catch((err) => console.error("Error fetching timings:", err));
}
getDate()

timer = setInterval(function() {
    getDate();
    timeBetweenDates(compareDate,presentDate);
}, 1000);

function timeBetweenDates(toDate,present) {
  var dateEntered = toDate;
  var now = present;
  if (!now || !dateEntered) return;
  checkvalue = true;

  var difference = dateEntered.getTime() - now.getTime();
  if (difference <= 0) {
    $("#days").text(0);
    $("#hours").text(0);
    $("#minutes").text(0);
    $("#seconds").text(0);
    clearInterval(timer);
    submitAnswer2();
  } else {
    var seconds = Math.floor(difference / 1000);    
    var minutes = Math.floor(seconds / 60);
    var hours = Math.floor(minutes / 60);
    var days = Math.floor(hours / 24);

    minutes %= 60;
    seconds %= 60;

    $("#days").text(days);
    $("#hours").text(hours);
    $("#minutes").text(minutes);
    $("#seconds").text(seconds);
  }
}