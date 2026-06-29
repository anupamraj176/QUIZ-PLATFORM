const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const userID = urlParams.get('user')
// console.log(userID);

let userAnswer;
let userVisited;
var program = 'MTech';

var stream = 'Assistant Professor (Level-10) in CSE Department';
if (localStorage.getItem('admintoken')) {
} else {
    window.location.href = '/admin'
}

const getuser = () => {
    data = {
        id: userID
    }
    fetch(`/user/userDatatoAdmin`, {
        method: 'POST',
        headers: {
            'content-Type': 'application/json',
            'auth_token': `${localStorage.getItem('admintoken')}`
        },
        body: JSON.stringify(data)
    })
        .then((res) => res.json())
        .then((data) => {
            // console.log(data);
            if (data.status == 0) {
                // console.log(data);
                // alert("Question added successfully");
                stream = data.data.stream
                program = data.data.program || 'MTech'
                userAnswer = data.data.answer
                userVisited = data.data.visited

                document.getElementById('userDetail').innerHTML = `
                    <h2>Candidate Information</h2>
                    <div class="info-grid">
                        <p><strong>Application No:</strong> ${data.data.applicationNo}</p>
                        <p><strong>Name:</strong> ${data.data.name}</p>
                        <p><strong>Category:</strong> ${data.data.program}</p>
                        <p><strong>Stream:</strong> ${data.data.stream}</p>
                        <p><strong>Marks Obtained:</strong> ${data.data.marks !== undefined ? data.data.marks : 0}</p>
                    </div>
                `
                // console.log(userAnswer)
                getquiz();
            } else {
                alert("Error");
                localStorage.removeItem('admintoken')
                window.location.href = '/admin'
            }
        })
        .catch((err) => {
            alert("Error");
        });
}

getuser();

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
        <div class="mcq" id="${i}">
                <h1><span>${idxnew}. </span> ${data[i].question}</h1>
                <ul>`

        if (data[i].image.contentType) {

            var img = arrayBufferToBase64(data[i]['image'].data.data);
            var imgSrc = `data:image/${data[i].image.contentType};base64,${img.toString('base64')}`;
            html += `<img src='${imgSrc}' alt='server error'/>`
        }

        for (j in data[i].choice) {

            var idxoption = (Number)(j) + 1;
            html += `<li id="${data[i].id}_option${j}" ><span> ${String.fromCharCode(idxoption + 64)}.  </span> ${data[i].choice[j]}</li>`
        }
        html += `</ul>
                <div class = "answerDelete">
                <div class="answer">Correct Answer : ${data[i].answer}</div>
                <p id = "${data[i].id}_useranswer"></p>
                <p id = "${data[i].id}_Visited" style="color:red; font-weight:900;">Not Aswered</p>
                </div>
                <div>
                `
        html += `</div>`

        html += `</div>`
    }
    document.getElementById('quizdisplay').innerHTML = html;
    document.getElementById('questionshow').innerHTML = htQuestion;

    userAnswerShow();
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


function userAnswerShow() {
    // ${data[i].id}_useranswer
    // console.log(userVisited)
    userAnswer.forEach((e) => {
        document.getElementById(`${e.key}_useranswer`).innerHTML = `Your Answer: ${String.fromCharCode(Number(e.option) + 65)}. ${e.value}`
        const visitedEl = document.getElementById(`${e.key}_Visited`);
        visitedEl.innerHTML = `Answered`
        visitedEl.style.color = `#2e7d32`
    })

    // userVisited.forEach((e)=>{
    //     // console.log(e)
    // })

}

// Bind candidate response excel download
document.getElementById('downloadExcelBtn').addEventListener('click', () => {
    const downloadBtn = document.getElementById('downloadExcelBtn');
    const originalText = downloadBtn.innerHTML;
    downloadBtn.innerHTML = "Generating...";
    downloadBtn.disabled = true;

    fetch(`/admin/result/downloadResponse/${userID}`, {
        method: 'GET',
        headers: {
            'auth_token': `${localStorage.getItem('admintoken')}`
        }
    })
    .then(res => {
        if (res.status === 200) {
            return res.blob();
        } else {
            throw new Error("Unauthorized or user data not found");
        }
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `response_${userID}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        
        downloadBtn.innerHTML = originalText;
        downloadBtn.disabled = false;
    })
    .catch(err => {
        alert("Error exporting response sheet: " + err.message);
        downloadBtn.innerHTML = originalText;
        downloadBtn.disabled = false;
    });
});
