// router.post(
//   "/addimagequestion",
//   upload.array(["ques", "opt1", "opt2", "opt3", "opt4"]),
//   (req, res) => {
//     var stream = req.body.stream;
//     var arr = new Array();
//     arr.push(
//       fs.readFileSync(
//         path.join(__dirname, "../uploads/" + req.files[1].filename)
//       )
//     );
//     arr.push(
//       fs.readFileSync(
//         path.join(__dirname, "../uploads/" + req.files[2].filename)
//       )
//     );
//     arr.push(
//       fs.readFileSync(
//         path.join(__dirname, "../uploads/" + req.files[3].filename)
//       )
//     );
//     arr.push(
//       fs.readFileSync(
//         path.join(__dirname, "../uploads/" + req.files[4].filename)
//       )
//     );
//     var ans = req.body[req.body.answer];
//     try {
//       if (stream === "CSE") {
//         CSE.create({
//           type: "img",
//           quesImg: fs.readFileSync(
//             path.join(__dirname, "../uploads/" + req.files[0].filename)
//           ),
//           choiceImg: arr,
//           answer: answer,
//         })
//           .then(() => {
//             res.json({ status: 0 });
//           })
//           .catch(() => {
//             res.json({ status: -1 });
//           });
//       } else if (stream === "MEA") {
//         MEA.create({
//           type: "img",
//           quesImg: fs.readFileSync(
//             path.join(__dirname, "../uploads/" + req.files[0].filename)
//           ),
//           choice: arr,
//           answer: answer,
//         })
//           .then(() => {
//             res.json({ status: 0 });
//           })
//           .catch(() => {
//             res.json({ status: -1 });
//           });
//       } else if (stream === "ECE") {
//         ECE.create({
//           type: "img",
//           quesImg: fs.readFileSync(
//             path.join(__dirname, "../uploads/" + req.files[0].filename)
//           ),
//           choice: arr,
//           answer: answer,
//         })
//           .then(() => {
//             res.json({ status: 0 });
//           })
//           .catch(() => {
//             res.json({ status: -1 });
//           });
//       } else if (stream === "Math") {
//         Math.create({
//           type: "img",
//           quesImg: fs.readFileSync(
//             path.join(__dirname, "../uploads/" + req.files[0].filename)
//           ),
//           choice: arr,
//           answer: answer,
//         })
//           .then(() => {
//             res.json({ status: 0 });
//             // fs.unlinkSync(
//             //   path.join(__dirname, "../uploads/" + req.files[0].filename)
//             // );
//             // fs.unlinkSync(
//             //   path.join(__dirname, "../uploads/" + req.files[1].filename)
//             // );
//             // fs.unlinkSync(
//             //   path.join(__dirname, "../uploads/" + req.files[2].filename)
//             // );
//             // fs.unlinkSync(
//             //   path.join(__dirname, "../uploads/" + req.files[3].filename)
//             // );
//             // fs.unlinkSync(
//             //   path.join(__dirname, "../uploads/" + req.files[4].filename)
//             // );
//           })
//           .catch(() => {
//             res.json({ status: -1 });
//           });
//       } else {
//         res.json({ status: -1 });
//       }
//     } catch (err) {
//       res.json({ status: -1 });
//     }
//   }
// );