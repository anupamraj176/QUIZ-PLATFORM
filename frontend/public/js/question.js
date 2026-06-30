
var stream = 'Computer Science Engineering';
var program = 'MTech';
if (localStorage.getItem('admintoken')) {
} else {
  window.location.href = '/admin'
}


const selectStream = (value) => {
  stream = value;
  getquiz();
}

const selectProgram = (value) => {
  program = value;
  getquiz();
}

document.getElementById("question_txt").addEventListener("submit", function (e) {
  e.preventDefault();
  fetch(e.target.action, {
    method: e.target.method,
    headers: {
      'auth_token': `${localStorage.getItem('admintoken')}`
    },
    body: new FormData(e.target),
  })
    .then((res) => res.json())
    .then((data) => {
      // console.log(data);
      if (data.status == 0) {
        // console.log(data);
        alert("Question added successfully");
        getquiz();
      }else {
        alert("Error adding question");
        localStorage.removeItem('admintoken')
        window.location.href = '/admin'
      }
    })
    .catch((err) => {
      alert("Error adding question");
    });
});


const getquiz = () => {
  fetch(`/question/sendAdminquestion`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'auth_token': `${localStorage.getItem('admintoken')}`
    },
    body: JSON.stringify({
      'stream': `${stream}`,
      'program': `${program}`
    })
  })
    .then((res) => res.json())
    .then((res) => {
      // console.log(res);
      if (res.status === 0) {
        displayquestion(res.data);
      }
    })
    .catch()
}

const arrayBufferToBase64 = (buffer) => {
  var binary = '';
  var bytes = [].slice.call(new Uint8Array(buffer));
  bytes.forEach((b) => binary += String.fromCharCode(b));
  return window.btoa(binary);
};

const displayquestion = (data) => {

  var html = ``;
  var htQuestion = `Total Question : ${data.length}`;
  for (var i = 0; i < data.length; i++) {
    var idxnew = (Number)(i) + 1;
    // htQuestion += `<div class="short" onclick="previous(${i},${data.length})">${i + 1}</div>`
    html += `
      <div class="mcq bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl space-y-4" id="${i}">
              <h1 class="text-base font-bold text-white leading-relaxed"><span class="text-slate-400 mr-1">${idxnew}.</span> ${data[i].question} <br> <input type="text" class="${data[i].id}_hideupdate w-full mt-2 px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none" style="display:none;" id="${data[i].id}_quesChange" value='${data[i].question}'></input></h1>
              <ul class="mcq-options-list space-y-3 mt-4 mb-6">`

    if (data[i].image.contentType) {
      var img = arrayBufferToBase64(data[i]['image'].data.data);
      var imgSrc = `data:image/${data[i].image.contentType};base64,${img.toString('base64')}`;
      html += `<img src='${imgSrc}' alt='server error' class="max-w-xs max-h-60 object-contain mt-3 rounded-lg border border-slate-800 shadow-lg"/>
      <div class="${data[i].id}_hideupdate flex items-center gap-3 bg-slate-950/40 border border-slate-800 p-4 rounded-xl mt-3" style="display:none;">
        <form id="${data[i].id}_changeImage" class="flex items-center gap-3 w-full">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Image:</span>
          <input type="file" name="img" id="image" class="text-xs text-slate-300 flex-grow">
          <input type="button" class="px-4 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-md text-xs font-semibold tracking-wide cursor-pointer transition" onclick="changeimageoption('${data[i].id}')" value="Add Image">
        </form>
      </div>
      `
    }

    for (j in data[i].choice) {
      var idxoption = (Number)(j) + 1;
      html += `
      <li id="${data[i].id}_option${j}"><span class="w-6 h-6 rounded-full bg-slate-950/80 border border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 mr-2 shrink-0"> ${String.fromCharCode(idxoption + 64)} </span> <span class="flex-grow">${data[i].choice[j]}</span></li>
      <li class="${data[i].id}_hideupdate" style="display:none;"><span class="w-6 h-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500 mr-2 shrink-0"> ${String.fromCharCode(idxoption + 64)} </span><input type="text" class="flex-grow px-3 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none" id="${data[i].id}_option${j}_changeoption" value='${data[i].choice[j]}'></input></li>
      `
    }
    html += `</ul>
              <div class="mt-4 p-4 bg-slate-950/60 border border-slate-900/80 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm font-semibold">
              <div class="flex items-center gap-2">
              <div class="text-green-400"><span class="text-slate-500 font-normal">Answer Key: </span> ${data[i].answer}</div>
              <select class="${data[i].id}_hideupdate px-2 py-1 bg-slate-900 border border-slate-800 rounded-md text-xs text-slate-350" style="display:none;" name="answer" id="${data[i].id}_changeanswer" required>
                    <option value="${data[i].answer}">${data[i].answer}</option>
                    <option value="option1">A</option>
                    <option value="option2">B</option>
                    <option value="option3">C</option>
                    <option value="option4">D</option>
                </select>
              </div>
              <div class="flex items-center gap-2">
                <button class="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-md text-xs font-semibold tracking-wide cursor-pointer transition" id="${data[i].id}_hideupdateoption" onclick="updatethisquestion('${data[i].id}')">Update</button>
                <button class="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-md text-xs font-semibold tracking-wide cursor-pointer transition ${data[i].id}_hideupdate" style="display:none;" onclick="updateFinalthisquestion('${data[i].id}')">Save</button>
                <button class="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-450 rounded-md text-xs font-semibold tracking-wide cursor-pointer transition ${data[i].id}_hideupdate" style="display:none;" onclick="closethisquestion('${data[i].id}')">Cancel</button>
                <button class="px-3 py-1.5 bg-red-650/10 hover:bg-red-650/20 text-red-400 border border-red-900/30 rounded-md text-xs font-semibold tracking-wide cursor-pointer transition" onclick="deletethisquestion('${data[i].id}')">Delete</button>
              </div>
              </div>`
    html += `</div>`

    html += `</div>`
  }
  document.getElementById('quizdisplay').innerHTML = html;
  document.getElementById('questionshow').innerHTML = htQuestion;
  if (typeof renderMathInElement === 'function') {
      renderMathInElement(document.body, {
          delimiters: [
              {left: '$$', right: '$$', display: true},
              {left: '$', right: '$', display: false},
              {left: '\\(', right: '\\)', display: false},
              {left: '\\[', right: '\\]', display: true}
          ],
          throwOnError: false
      });
  }
  if (typeof MathJax !== 'undefined' && typeof MathJax.typeset === 'function') {
      MathJax.typeset();
  }
}

getquiz();


function deletethisquestion(id){

  fetch(`/question/deleteAdminquetion`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'auth_token': `${localStorage.getItem('admintoken')}`
    },
    body: JSON.stringify({
      'stream': `${stream}`,
      'program': `${program}`,
      'id' : `${id}`
    })
  })
    .then((res) => res.json())
    .then((res) => {

      if (res.status === 0) {
        alert("Question Deleted successfully");
        getquiz();
      }else{
        alert("Unable to Delete");
      }
    })
    .catch(()=>{
      alert("Unable to Delete");
    })
}

function updatethisquestion(id){
  
  var hideupdate = document.getElementsByClassName(`${id}_hideupdate`);
  for(i in hideupdate){
    if(hideupdate[i].style!==undefined){
      
      hideupdate[i].style.display = 'block';
    }
  }
  document.getElementById(`${id}_hideupdateoption`).style.display = 'none';

}

function closethisquestion(id){
  
  var hideupdate = document.getElementsByClassName(`${id}_hideupdate`);
  for(i in hideupdate){
    if(hideupdate[i].style!==undefined){
      
      hideupdate[i].style.display = 'none';
    }
  }
  document.getElementById(`${id}_hideupdateoption`).style.display = 'block';

}

function updateFinalthisquestion(id){
    let data = {
      id:id,
      stream : stream,
      program : program,
      ques : document.getElementById(`${id}_quesChange`).value,
      option1 : document.getElementById(`${id}_option${0}_changeoption`).value,
      option2 : document.getElementById(`${id}_option${1}_changeoption`).value,
      option3 : document.getElementById(`${id}_option${2}_changeoption`).value,
      option4 : document.getElementById(`${id}_option${3}_changeoption`).value,
      answer : document.getElementById(`${id}_changeanswer`).value
    }
    // console.log(data);

    fetch(`/question/updatequestion`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'auth_token': `${localStorage.getItem('admintoken')}`,
      },
      body: JSON.stringify(data)
    })
      .then((res) => res.json())
      .then((res) => {
        // console.log(res);
        if (res.status === 0) {
          alert("Question Updated successfully");
          getquiz();
        }else{
          alert("Unable to update");
        }
      })
      .catch(()=>{
        alert("Unable to update");
      })

}


function changeimageoption(id){
  console.log(id);
  fetch(`/question/updatequestionImage`, {
    method: 'POST',
    headers: {
      'auth_token': `${localStorage.getItem('admintoken')}`,
      'stream' : stream,
      'program' : program,
      'id' : id
    },
    body: new FormData(document.getElementById(`${id}_changeImage`)),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      if (data.status == 0) {
        // console.log(data);
        alert("Image updated successfully");
        getquiz();
      }else {
        alert("Error adding image");
        // localStorage.removeItem('admintoken')
        // window.location.href = '/admin'
      }
    })
    .catch((err) => {
      alert("Error adding image");
    });
}

// Convert date to local ISO format for datetime-local input
const toLocalISOString = (date) => {
  const tzoffset = date.getTimezoneOffset() * 60000;
  return (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
};

// Fetch current timing from DB and set input values
const loadExamTimings = () => {
  fetch('/time/timing')
    .then(res => res.json())
    .then(data => {
      if (data.SDate && data.EDate) {
        document.getElementById('startTimeInput').value = toLocalISOString(new Date(data.SDate));
        document.getElementById('endTimeInput').value = toLocalISOString(new Date(data.EDate));
      }
    })
    .catch(err => console.error("Error loading exam timings:", err));
};

// Bind timing form submission
document.getElementById('timingConfigForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const startTime = document.getElementById('startTimeInput').value;
  const endTime = document.getElementById('endTimeInput').value;

  fetch('/time/settiming', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'auth_token': `${localStorage.getItem('admintoken')}`
    },
    body: JSON.stringify({ startTime, endTime })
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === 0) {
        const msg = document.getElementById('timingSuccessMsg');
        msg.style.display = 'block';
        setTimeout(() => msg.style.display = 'none', 3000);
      } else {
        alert("Error saving timings: " + (data.message || "Unauthorized"));
      }
    })
    .catch(err => {
      console.error(err);
      alert("Network error saving timings");
    });
});

// Run load on init
loadExamTimings();

// Bind Excel form submission
document.getElementById('excelUploadForm').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  
  fetch(e.target.action, {
    method: 'POST',
    headers: {
      'auth_token': `${localStorage.getItem('admintoken')}`
    },
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === 0) {
        const msg = document.getElementById('excelSuccessMsg');
        msg.innerText = `Successfully imported ${data.count} questions!`;
        msg.style.display = 'block';
        setTimeout(() => {
          msg.style.display = 'none';
        }, 5000);
        // Refresh the list of questions currently displayed
        getquiz();
      } else {
        alert("Error uploading Excel: " + (data.message || "Unknown error"));
      }
    })
    .catch(err => {
      console.error(err);
      alert("Network error uploading Excel file");
    });
});

// Bind Candidates Excel form submission
document.getElementById('candidatesUploadForm').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const msg = document.getElementById('candidatesSuccessMsg');
  msg.style.display = 'none';

  fetch(e.target.action, {
    method: 'POST',
    headers: {
      'auth_token': `${localStorage.getItem('admintoken')}`
    },
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === 0) {
        msg.innerText = data.message;
        msg.style.display = 'block';
        setTimeout(() => {
          msg.style.display = 'none';
        }, 6000);
      } else {
        alert("Error importing candidates: " + (data.message || "Unknown error"));
      }
    })
    .catch(err => {
      console.error(err);
      alert("Network error importing candidates file");
    });
});
