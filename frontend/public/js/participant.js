// const { json } = require("body-parser");

let stream = CSEvalue;

function getParticipantsDetail() {
    // console.log(stream);
    fetch(`/user/sendDatatoAdmin`, {
        method: 'POST',
        headers: {
            'Content-Type' :'application/json',
            'auth_token': `${localStorage.getItem('admintoken')}`
        },
        body : JSON.stringify({
            stream : stream
        })
    })
        .then((res) => res.json())
        .then((data) => {
            // console.log(data);
            if (data.status == 0) {
                // console.log(data);
                // alert("Question added successfully");
                displayparticpants(data.data)
            } else {
                alert("Error adding question");
                localStorage.removeItem('admintoken')
                window.location.href = '/admin'
            }
        })
        .catch((err) => {
            alert("Error adding question");
        });
}

getParticipantsDetail();

function changestream(val){
    stream = val
    getParticipantsDetail();
}


function displayparticpants(data){
    // console.log(data)

    data.sort(function(a, b) {
        var keyA = new Date(a.marks),
          keyB = new Date(b.marks);
        // Compare the 2 dates
        if (keyA < keyB) return 1;
        if (keyA > keyB) return -1;
        return 0;
      });


    let html = `<table class="w-full border-collapse text-left text-sm text-slate-300">
                <thead class="bg-slate-950/60 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                        <th class="px-6 py-4">S.No.</th>
                        <th class="px-6 py-4">Application No.</th>
                        <th class="px-6 py-4">Name</th>
                        <th class="px-6 py-4">Category</th>
                        <th class="px-6 py-4">Stream</th>
                        <th class="px-6 py-4">Marks</th>
                        <th class="px-6 py-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/80">`;
    for (let index = 0; index < data.length; index++) {
        html += `
                <tr class="hover:bg-slate-900/40 transition duration-150">
                    <td class="px-6 py-4 text-slate-400 font-semibold">${index+1}</td>
                    <td class="px-6 py-4 font-mono font-medium text-slate-200">${data[index].applicationNo}</td>
                    <td class="px-6 py-4 font-medium text-white">${data[index].name}</td>
                    <td class="px-6 py-4">${data[index].program}</td>
                    <td class="px-6 py-4 text-slate-400 text-xs">${data[index].stream}</td>
                    <td class="px-6 py-4"><span class="bg-green-500/10 px-2 py-0.5 border border-green-500/20 rounded-md text-green-400 font-bold">${data[index].marks !== undefined ? data[index].marks : 0}</span></td>
                    <td class="px-6 py-4 text-right"><a href="/submitform?user=${data[index]._id}" class="inline-flex items-center text-blue-400 hover:text-blue-300 font-semibold hover:underline">View Response &rarr;</a></td>
                </tr>
        `
    }

    html += `</tbody></table>`

    document.getElementById('participantsDatadesign').innerHTML = html
}


function generateResult(){
    const btn = document.querySelector('.btn-result-action');
    const originalText = btn.innerHTML;
    btn.innerHTML = "Generating...";
    btn.disabled = true;

    fetch('/admin/result/Generateresult', {
        method: 'GET',
        headers: {
            'auth_token': `${localStorage.getItem('admintoken')}`
        }
    })
    .then((res) => {
        if (res.status === 200) {
            return res.blob();
        } else {
            throw new Error("Unauthorized or server calculation failed");
        }
    })
    .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Exam_Results_Summary.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        
        btn.innerHTML = originalText;
        btn.disabled = false;
        alert('Results calculated and summary Excel downloaded successfully!');
        getParticipantsDetail();
    })
    .catch((err) => {
        alert('Unable to generate results: ' + err.message);
        btn.innerHTML = originalText;
        btn.disabled = false;
    });
}
