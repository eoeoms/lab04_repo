$(document).ready(function () {

    var userid;
    var numOfItems;
    var rootRef = firebase.database().ref();
    var userRef;
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
          userid = user.uid;
        } else {
  
        }
      });
    
    
    userRef = firebase.database().ref("users/" + userid);

    
    //reading values from database
    rootRef.once("value").then(function (snapshot) {
        numOfItems = snapshot.child("users/" + userid + "/numsites").val();
        
        //builds table off of database
        if (snapshot.child("users/" + userid).hasChild("websites")) {
            
            var query = firebase.database().ref("users/" + userid + "/websites").orderByKey();
            query.once("value").then(function(snapshot) {
                $("#noItems").css("display", "none"); //don't show no item message
                $("#storedWebsites").css("display", "table"); //show table
                
                snapshot.forEach(function(childSnapshot) {
                    
                    // key will be "ada" the first time and "alan" the second time
                    //var key = childSnapshot.child("address").key;
                    // childData will be the actual contents of the child
                    var address = childSnapshot.child("address").val();
                    var rowID = childSnapshot.key;
                    
                    //appending new table row
                    let tr = $("<tr></tr>");
                    tr.attr("id", rowID);
                    $("tbody").append(tr);
            
                    //first td: website address
                    let td1 = $("<td></td>");
                    td1.addClass("address");
                    td1.text(address);
            
                    //second td: strength bar
                    let td2 = $("<td></td>");
                    td2.addClass("strength");
                    td2.text("Strength ");
                    let barImage = $("<img>");
                    barImage.attr("src", "https://dummyimage.com/100x10/000/fff&text=+");
                    td2.append(barImage);
            
                    //third td: remove icon
                    let td3 = $("<td></td>");
                    td3.addClass("removeIcon");
                    let removeIcon = $("<i></i>");
                    removeIcon.addClass("fas fa-trash-alt");
                    td3.append(removeIcon);
            
                    tr.append(td1, td2, td3);
            
                    //add event listener on remove icon
                    removeIcon.click(function () {
                        let item = $(this).parent().parent().children("td.address").text();
                        if (confirm("Would you like to remove the stored password for \"" + item + "\"?")) {
                            
                            firebase.database().ref("users/" + userid + "/websites/" + rowID).remove();
                            
                            $(this).parent().parent().remove();
                            checkItems(); //check if all removed
                        }
                    });
                    
                });
            });
        }
    });
    

    //IF NO STORED PASSWORDS, DISPLAY MESSAGE
    checkItems();

    function checkItems() {
        if (!document.getElementById("tbody").hasChildNodes()) {
            $("#storedWebsites").css("display", "none");
            $("#noItems").css("display", "block");
        }
    }
    
    /*
    //REMOVE STORED PASSWORD
    $(".removeIcon i").click(function () {
        let item = $(this).parent().parent().children("td.address").text();
        if (confirm("Would you like to remove the stored password for \"" + item + "\"?")) {
            $(this).parent().parent().remove();
            checkItems(); //check if all removed
        }
    });
    */

    //ADD NEW PASSWORD POP-UP
    $("#addNewIcon").click(function () {
        $("#addNewItemModal").css("display", "block");
        $("#addNewAddress").focus(); //focuses on first input field
    });

    //triggers submit button when Enter key is pressed inside any input fields
    $("#addNewItemForm input").keyup(function (event) {
        if (event.which === 13) {
            document.getElementById("submitBtn").click();
        }
        //close pop-up if esc pressed
        if (event.which === 27) {
            $("#addNewItemModal").css("display", "none");
        }
    });

    //CLOSE ADD MENU
    $("#closeBtn").click(function () {
        $("#addNewItemModal").css("display", "none");
    });

    //SUBMIT BUTTON ON ADD MENU
    //to add lots of table rows fast, comment out line 40 to 44, and line 95
    $("#submitBtn").click(function (event) {
        event.preventDefault();
        if ($("#addNewAddress").val().length == 0) {
            $("#validation > p").text("Website address should be longer.")
        } else if ($("#addNewPwd").val() == "" || $("#addNewPwd").val() != $("#addNewConfirm").val()) {
            $("#validation > p").text("Passwords must match.")
        } else {
            $("#addNewItemModal").css("display", "none"); //close pop-up
            $("#noItems").css("display", "none"); //don't show no item message
            $("#storedWebsites").css("display", "table"); //show table

            rootRef.once("value").then(function (snapshot) {
                numOfItems = snapshot.child("users/" + userid + "/numsites").val();
            });
            
            let addedAddress = $("#addNewAddress").val(); //get added address
            let userName = $("#addNewUsername").val();
            let password = $("#addNewPwd").val();
            
            let websiteNum = "website" + numOfItems;
            let NewNumOfItems = numOfItems + 1;
            /*
            firebase.database().ref('users/' + userid + '/websites').set({
                websiteNum: {
                "address": addedAddress,
                "userName": userName,
                "password": password
                }
            });
            */
            
            firebase.database().ref('users/' + userid + '/websites/' + websiteNum).set({
                //"arrayValue": numOfItems,
                "address": addedAddress,
                "userName": userName,
                "password": password
                
            });
            
            firebase.database().ref('users/' + userid).update({
                "numsites": NewNumOfItems
            });

            //clear fields
            $("#addNewAddress").val("");
            $("#addNewUsername").val("");
            $("#addNewPwd").val("");
            $("#addNewConfirm").val("");
            $("#validation > p").text("");

            //appending new table row
            let tr = $("<tr></tr>");
            $("tbody").append(tr);

            //first td: website address
            let td1 = $("<td></td>");
            td1.addClass("address");
            td1.text(addedAddress);

            //second td: strength bar
            let td2 = $("<td></td>");
            td2.addClass("strength");
            td2.text("Strength ");
            let barImage = $("<img>");
            barImage.attr("src", "https://dummyimage.com/100x10/000/fff&text=+");
            td2.append(barImage);

            //third td: remove icon
            let td3 = $("<td></td>");
            td3.addClass("removeIcon");
            let removeIcon = $("<i></i>");
            removeIcon.addClass("fas fa-trash-alt");
            td3.append(removeIcon);

            tr.append(td1, td2, td3);

            //add event listener on remove icon
            removeIcon.click(function () {
                let item = $(this).parent().parent().children("td.address").text();
                if (confirm("Would you like to remove the stored password for \"" + item + "\"?")) {
                    $(this).parent().parent().remove();
                    checkItems(); //check if all removed
                }
            });
        }
    });

    //DETAILS
    $("#detailsBar").click(function () {
        if ($("#detailsBar").css("bottom") == "-2px") {
            $("#detailsBar").animate({
                bottom: "298px"
            }, 300);
            $("#detailsPanel").slideDown(300, function () {
                $("#detailsBar i").attr("class", "fas fa-angle-down");
            });
        } else if ($("#detailsBar").css("bottom") == "298px") {
            $("#detailsBar").animate({
                bottom: "-2px"
            }, 300);
            $("#detailsPanel").slideUp(300, function () {
                $("#detailsBar i").attr("class", "fas fa-angle-up");
            });
        }
    });

    //LOG OUT
    $("#logOut").click(function () {
        alert("Not ready yet.");
    });


    
    
});