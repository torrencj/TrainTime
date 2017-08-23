

// Initialize Firebase
var config = {
  apiKey: "AIzaSyAGdf64xfL75q6PnezLLb3aZszYIqdhHyc",
  authDomain: "traintime-65569.firebaseapp.com",
  databaseURL: "https://traintime-65569.firebaseio.com",
  projectId: "traintime-65569",
  storageBucket: "",
  messagingSenderId: "10275659791"
};
firebase.initializeApp(config);

//creating a variable to reference the database
var database = firebase.database();

//is this the initial load? (Used when drawing all previous items)
// var initial = true;

//set html to the values from the database
// database.ref().on("value", function(snap) {
//   console.log(snap.val());
// });

// This is triggered for each item in the database on load.
database.ref().on("child_added", function(snap) {
// addRow by name, dest, start, freq
addRow(snap.val().name,snap.val().dest, snap.val().start, snap.val().freq);
});

//TODO This works.
// database.ref().orderByChild("dateAdded").limitToLast(1).on("child_added", function(snapshot) {
//   console.log("orderByChild");
//   console.log(snapshot.val());
// });

//Returns the difference of two dates in months, uses MomentJS
function findMonthsWorked(inputDate) {
  return moment().diff(moment(inputDate), 'months')
}

//Returns the total value paid to the employee
function findTotalPaid(freq, months) {
  return freq * months;
}

// function to create the new row
function addRow(name, dest, start, freq) {
  var monthsworked = findMonthsWorked(start);

  var newRow = $("<tr>").append( $("<td>").text(name) )
                        .append( $("<td>").text(dest) )
                        .append( $("<td>").text(start) )
                        .append( $("<td>").text(monthsworked) )
                        .append( $("<td>").text(freq) )
                        .append( $("<td>").text(findTotalPaid(freq, monthsworked)) );
  $("tbody").append(newRow);




};

 // submit button to push the data up to the employees table
$("#submit-button").on("click", function(event){
	event.preventDefault();

	var name = $("#name").val().trim();
	var dest = $("#dest").val().trim();
	var start = moment($("#start").val().trim());
	var freq = $("#freq").val();

  console.log(start);

  //clear the fields
  $("#name").val('');
	$("#dest").val('');
	$("#start").val('');
	$("#freq").val('');

  database.ref().push({
    "name": name,
    "dest" : dest,
    "start": start,
    "freq": freq
  })
});
