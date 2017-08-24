
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

//Set an interval to run the wait time update function.
$(document).ready(function() {
  setInterval(update, 60000);
})

//creating a variable to reference the database
var database = firebase.database();
var userEditData = {};

// This is triggered for each item in the database on load. Draws a new row to the table
database.ref().on("child_added", function(snap) {

console.log(snap.key);
  addRow(snap.val().name,
         snap.val().dest,
         snap.val().start,
         snap.val().freq,
         snap.key);
});


// =========== Function Defs ===========


//make all the numbers in the wait time row count down.
//if we're boarding, change the wait time text to the frequency and start over.
function update() {
  $("td#wait-time-live").each( function() {
    var temp = +$(this).text(); //NaN if this is a string... be careful
    var element = $(this);
    if (!temp) {
      element.text(element.prev().text()) //
    } else {
      if (temp > 1) {
        element.text( +element.text() - 1); //Decrement the wait time
      } else {
        element.text("Boarding")
      }
    }
  });
}

//Returns the difference of two dates in months, uses MomentJS
function findMinutesAway(start, freq) {
  var diff = moment().diff(moment(start, "HH:mm A"), 'minutes');

  if (diff > 0) {
    return (diff % freq);
  } else {
    return -diff;
  }
}

// function to create the new row
function addRow(name, dest, start, freq, key) {
  var waitTime = findMinutesAway(start, freq);

  //Looks like soup, but I'm not sure how to make it more consise.
  var newRow = $("<tr>").attr("id",key)
    .append( $("<td>").attr("contenteditable","true").attr("id", "name").text(name).data({"name":name}) )
    .append( $("<td>").attr("contenteditable","true").attr("id", "dest").text(dest).data({"dest":dest}) )
    .append( $("<td>").attr("contenteditable","true").attr("id", "start").text(start).data({"start":start}) )
    .append( $("<td>").text(moment().add(waitTime, 'minutes').format("LT")) )
    .append( $("<td>").attr("contenteditable","true").attr("id", "freq").text(freq).data({"freq":freq}) )
    .append( $("<td>").text(waitTime).attr("id","wait-time-live") )
    .append( $("<button type='button' id ='remove-train' class='close' aria-label='Close'>")
      .html("<span id= 'remove-train' aria-hidden='true'>&times;</span>")
);

  $("tbody").append(newRow);
};

//I stole this wholesale from http://jsbin.com/satutawipo/edit //TODO steal less wholesale.
//I edited it by saving the current data of the item in the table and using that to "undo" edits.
$("tbody").on("keydown", function(event) {
  var elem = $(event.target);
  if ($(event.target).attr("contenteditable") == "true") {

    var esc = event.which == 27,
        newline = event.which == 13,
        input = elem.nodeName != 'INPUT' && elem.nodeName != 'TEXTAREA';
    var currentCell = elem.attr("id");
    var currentData = elem.data();

    if (input) {
      if (esc) {
        // restore state
        elem.text(currentData[currentCell]);
        elem.blur();
      } else if (newline) {
        // save
        userEditData[currentCell] = elem.text();
        console.log("User edit: ");
        console.log(userEditData);
        database.ref(elem.parent().attr("id")).update(userEditData);
        elem.blur();
        event.preventDefault();
      }
    }
  }
});


// =========== click handlers ===========


//TODO Not using this right now. Updates are immediate.
$("#save-edits").on("click", function(){
  $("#save-edits").css("display","none");
})

$(document, "#remove-train").on("click", function(event){
  if ($(event.target).attr("id") == "remove-train") {
    var currentTrain = $(event.target).parents("tr").attr("id");
    database.ref(currentTrain).remove();
    $(event.target).parents("tr").css("display", "none")
  }
});

// submit button to push the data up to the train table
$("#submit-button").on("click", function(event){
	var name = $("#name-input").val().trim();
	var dest = $("#dest-input").val().trim();
	var start = $("#start-input").val().trim();
	var freq = $("#freq-input").val();
  var initialTime = moment(start, "H");

    // clear the fields
    $("#name").val('');
  	$("#dest").val('');
  	$("#start").val('');
  	$("#freq").val('');

    //build the train data
    var trainData = {
      "name": name,
      "dest" : dest,
      "start": start,
      "freq": freq
    };

    database.ref().push(trainData);
    event.preventDefault();
});
