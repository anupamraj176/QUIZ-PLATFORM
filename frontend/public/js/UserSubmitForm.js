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
                    <h2 class="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Candidate Information</h2>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-300">
                        <p><strong class="text-slate-400 font-medium">Application No:</strong> <span class="text-white font-semibold ml-1">${data.data.applicationNo}</span></p>
                        <p><strong class="text-slate-400 font-medium">Name:</strong> <span class="text-white font-semibold ml-1">${data.data.name}</span></p>
                        <p><strong class="text-slate-400 font-medium">Category:</strong> <span class="text-white font-semibold ml-1">${data.data.program}</span></p>
                        <p><strong class="text-slate-400 font-medium">Stream:</strong> <span class="text-white font-semibold ml-1">${data.data.stream}</span></p>
                        <p><strong class="text-slate-400 font-medium">Marks Obtained:</strong> <span class="text-white font-bold ml-1 bg-green-500/10 px-2 py-0.5 border border-green-500/20 rounded-md">${data.data.marks !== undefined ? data.data.marks : 0}</span></p>
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
        <div class="mcq bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl space-y-4" id="${i}">
                <h1 class="text-base font-bold text-white leading-relaxed"><span class="text-slate-400 mr-1">${idxnew}.</span> ${data[i].question}</h1>
                <ul class="mcq-options-list space-y-3 mt-4 mb-6">`

        if (data[i].image.contentType) {
            var img = arrayBufferToBase64(data[i]['image'].data.data);
            var imgSrc = `data:image/${data[i].image.contentType};base64,${img.toString('base64')}`;
            html += `<img src='${imgSrc}' alt='server error' class="max-w-xs max-h-60 object-contain mt-3 rounded-lg border border-slate-800 shadow-lg"/>`
        }

        for (j in data[i].choice) {
            var idxoption = (Number)(j) + 1;
            html += `<li id="${data[i].id}_option${j}" class="w-full px-5 py-3 bg-slate-950/40 border border-slate-900 rounded-xl text-slate-400 text-sm flex items-center gap-3"><span class="w-6 h-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500 mr-2 shrink-0"> ${String.fromCharCode(idxoption + 64)} </span> <span class="flex-grow">${data[i].choice[j]}</span></li>`
        }
        html += `</ul>
                <div class="mt-4 p-4 bg-slate-950/60 border border-slate-900/80 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs md:text-sm font-semibold">
                    <div class="text-green-400 flex items-center gap-1.5"><span class="text-slate-500 font-normal">Correct Option: </span> ${data[i].answer}</div>
                    <p id="${data[i].id}_useranswer" class="text-slate-400 font-medium"></p>
                    <p id="${data[i].id}_Visited" class="text-red-400 font-bold tracking-wider uppercase text-xs">Not Answered</p>
                </div>`

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
    userAnswer.forEach((e) => {
        document.getElementById(`${e.key}_useranswer`).innerHTML = `Your Answer: ${String.fromCharCode(Number(e.option) + 65)}. ${e.value}`
        const visitedEl = document.getElementById(`${e.key}_Visited`);
        if (visitedEl) {
            visitedEl.innerHTML = "Answered";
            visitedEl.className = "text-green-400 font-bold tracking-wider uppercase text-xs";
        }
        const selectedOpt = document.getElementById(`${e.key}_option${e.option}`);
        if (selectedOpt) {
            selectedOpt.className = "w-full px-5 py-3 bg-green-950/30 border border-green-900/50 rounded-xl text-green-400 text-sm flex items-center gap-3 font-semibold shadow-inner";
            const badge = selectedOpt.querySelector('span');
            if (badge) badge.className = "w-6 h-6 rounded-full bg-green-900/40 border border-green-900/60 flex items-center justify-center text-[10px] font-bold text-green-300 mr-2 shrink-0";
        }
    })
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
