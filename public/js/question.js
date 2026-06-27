
var stream = 'Computer Science Engineering';
if (localStorage.getItem('admintoken')) {
} else {
  window.location.href = '/admin'
}


const selectStream = (value) => {
  stream = value;
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
      'stream': `${stream}`
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
      <div class="mcq" id="${i}">
              <h1><span>${idxnew}. </span> ${data[i].question} <br> <input  type="text" class="${data[i].id}_hideupdate" style="display:none;" id="${data[i].id}_quesChange" value = '${data[i].question}'></input></h1>
              <ul>`

    if (data[i].image.contentType) {

      var img = arrayBufferToBase64(data[i]['image'].data.data);
      var imgSrc = `data:image/${data[i].image.contentType};base64,${img.toString('base64')}`;
      html += `<img src='${imgSrc}' alt='server error'/>
      <div class="${data[i].id}_hideupdate" style="display:none;">
        <form id = "${data[i].id}_changeImage" >
        <label for="image">Upload Image</label>
        <input type="file" name="img" id="image">
        <input type="button" onclick="changeimageoption('${data[i].id}')" value="Add Image">
        </form>
      </div>
      `
    }

    for (j in data[i].choice) {

      var idxoption = (Number)(j) + 1;
      html += `
      <li id="${data[i].id}_option${j}" ><span> ${String.fromCharCode(idxoption + 64)}.  </span> ${data[i].choice[j]}</li>

      <li class="${data[i].id}_hideupdate" style="display:none;" ><span> ${String.fromCharCode(idxoption + 64)}.  </span><input type="text" id="${data[i].id}_option${j}_changeoption" value = '${data[i].choice[j]}'></input></li>

      `
    }
    html += `</ul>
              <div class = "answerDelete">
              <div>
              <div class="answer">Answer : ${data[i].answer}</div>
              <select class="${data[i].id}_hideupdate" style="display:none;" name="answer" id="${data[i].id}_changeanswer" required>
                    <option value="${data[i].answer}">${data[i].answer}</option>
                    <option value="option1">A</option>
                    <option value="option2">B</option>
                    <option value="option3">C</option>
                    <option value="option4">D</option>
                </select>
              </div>
              <button class="delete" id="${data[i].id}_hideupdateoption" onclick= "updatethisquestion('${data[i].id}')" >Update</button>
              <button class="delete ${data[i].id}_hideupdate" style="display:none;" onclick= "updateFinalthisquestion('${data[i].id}')" >Update</button>
              <button class="delete ${data[i].id}_hideupdate" style="display:none;" onclick= "closethisquestion('${data[i].id}')" >Close</button>
              <button class="delete" onclick= "deletethisquestion('${data[i].id}')">Delete</button>
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
    let value = document.getElementsByClassName(`${id}_hideupdate`);
    document.getElementById(`${id}_hideupdateoption`).style.display='none';
    // console.log(value)
    Array.from(value).forEach((e)=>{
      // console.log(e)
      e.style.display = 'block'
    })
  }

  function closethisquestion(id){
    let value = document.getElementsByClassName(`${id}_hideupdate`);
    document.getElementById(`${id}_hideupdateoption`).style.display='block';
    // console.log(value)
    Array.from(value).forEach((e)=>{
      // console.log(e)
      e.style.display = 'none'
    })
}

function updateFinalthisquestion(id){
    let data = {
      id:id,
      stream : stream,
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
