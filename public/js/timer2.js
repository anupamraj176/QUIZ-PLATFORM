var timer;
var checkvalue = false;
let next = document.getElementById("nextbutton");
next.disabled = true
// console.log(next.disabled);
var compareDate = new Date('July 16, 2022, 12:30:00');
var startDate = new Date('July 16, 2022, 11:00:00');
// compareDate.setDate(compareDate.getDate() + 1); //just for this demo today + 7 days

const getDate =()=>{
    fetch('/time/timing')
    .then((res)=>res.json())
    .then((res)=>{
      // console.log(res.SDate);
        compareDate = new Date(res.EDate);
        startDate = new Date(res.SDate);
        presentDate = new Date(res.presentDate);
    })
    .catch()
}
getDate()

timer = setInterval(function() {
    getDate();
  timeBetweenDates(startDate,presentDate);
}, 1000);

function timeBetweenDates(toDate,present) {
  var dateEntered = toDate;
  var now = present;
  checkvalue = true;

  // if(now > dateEntered){
  //   submitAnswer();
  // }
  var difference = dateEntered.getTime() - now.getTime();

  if (difference <= 0) {
    next.disabled = false
    next.style.backgroundColor = 'Green'
    clearInterval(timer);
    var seconds = Math.floor(0 / 1000);    
    var minutes = Math.floor(0 / 60);
    var hours = Math.floor(0 / 60);
    var days = Math.floor(0 / 24);

    hours %= 3;
    minutes %=60;
    seconds %= 60;

    $("#days").text(days);
    $("#hours").text(hours);
    $("#minutes").text(minutes);
    $("#seconds").text(seconds);
  
  } else {
    
    var seconds = Math.floor(difference / 1000);    
    var minutes = Math.floor(seconds / 60);
    var hours = Math.floor(minutes / 60);
    var days = Math.floor(hours / 24);

    hours %= 3;
    minutes %=60;
    seconds %= 60;

    $("#days").text(days);
    $("#hours").text(hours);
    $("#minutes").text(minutes);
    $("#seconds").text(seconds);
    // if(#days)
  }
}