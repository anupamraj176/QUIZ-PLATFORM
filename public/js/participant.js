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


    let html = `<table>
                <tr>
                    <th>S.No.</th>
                    <th>Application No.</th>
                    <th>Name</th>
                    <th>Program</th>
                    <th>Department</th>
                    <th>Marks Obtained</th>
                    <th>Submission</th>
                </tr>`;
    for (let index = 0; index < data.length; index++) {

        html += `
                <tr>
                    <td>${index+1}</td>
                    <td>${data[index].applicationNo}</td>
                    <td>${data[index].name}</td>
                    <td>${data[index].program}</td>
                    <td>${data[index].stream}</td>
                    <td>${data[index].marks}</td>
                    <td><button onclick='window.location.href="/submitform?user=${data[index]._id}"'>show</button></td>
                </tr>
        `
    }

    html += `</table>`

    document.getElementById('participantsDatadesign').innerHTML = html
}


function generateResult(){
    fetch('/admin/result/Generateresult')
    .then((res)=>res.json())
    .then((res)=>{
        // console.log(res)
        if(res.status==0){

            alert('Result Created')
            getParticipantsDetail();
        }else{

            alert('Unable to generate')
        }
    })
    .catch((err)=>{
        alert('Unable to generate')
    })
}
