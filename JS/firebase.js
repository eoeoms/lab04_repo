$(document).ready(function () {

    //USER's ID
    var userid;

    //WEBSITES INDEX
    var siteNum;

    //REFERENCE TO FIREBASE DATABASE
    var rootRef = firebase.database().ref();
    
    //ARRAY OF PASSWORDS
    var passwordAr = [];
    
    //ARRAY OF UNIQUE PASSWORDS
    var uniquePwdAr = [];
    
    //ARRAY OF THE FREQUENCY OF UNIQUE PASSWORDS
    var freqAr = [];

    //TAKES USER ID FROM FIREBASE AUTHENTICATION
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            userid = user.uid;
        }
    });


    //READS VALUES FROM FIREBASE EVERYTIME PAGE LOADS
    rootRef.once("value").then(function (snapshot) {

        if (snapshot.child("users/" + userid).hasChild("sitenum")) {
            siteNum = snapshot.child("users/" + userid + "/sitenum").val();
        } else {
            firebase.database().ref('users/' + userid).update({
                "sitenum": 0
            });
            siteNum = 0;
        }

        //BUILDS TABLE/WEBSITE LIST OFF OF FIREBASE INFORMATION
        if (snapshot.child("users/" + userid).hasChild("websites")) {

            //REFERENCE TO NODE
            var query = firebase.database().ref("users/" + userid + "/websites").orderByKey();
            query.once("value").then(function (snapshot) {

                snapshot.forEach(function (childSnapshot) {
                    var address = childSnapshot.child("address").val();
                    var rowID = childSnapshot.key;
                    var password = childSnapshot.child("password").val();
                    
                    //CREATES AND APPENDS A TABLE ROW TO THE HTML FOR EACH NODE UNDER WEBSITES(line 45)
                    appendRow(address, rowID, password);
                    //ALL THE PASSWORDS ARE STORED INTO AN ARRAY
                    passwordAr.push(password);
                });
                
                //CREATES AN ARRAY FOR ONLY UNIQUE PASSWORDS(NO DUPLICATES), AND ANOTHER ARRAY FOR FREQUENCY
                //EACH ITEM IN THE FREQUENCY ARRAY REPRESENTS THE FREQUENCY OF THE CORRESPONDING
                //PASSWORD FROM THE UNIQUE PASSWORD ARRAY WITH THE SAME INDEX
                //(e.g. THIRD ITEM IN freqAr IS THE FREQUENCY FOR THE THIRD ITEM IN uniquePwdAr)
                passwordAr.sort();
                let prev;
                for (let i = 0; i < passwordAr.length; i++) {
                    if (passwordAr[i] !== prev) {
                        uniquePwdAr.push(passwordAr[i]);
                        freqAr.push(1);
                    } else {
                        freqAr[freqAr.length - 1]++;
                    }
                    prev = passwordAr[i];
                }
                //EDITS HTML FOR THE DETAILS PANNEL
                constructDetails();

            });
        }
    });

    //SUBMIT BUTTON ON ADD MENU
    $("#submitBtn").click(function (event) {
        event.preventDefault();
        if ($("#addNewAddress").val().length == 0) {
            $("#validation > p").text("Website address should be longer.")
        } else if ($("#addNewPwd").val() == "" || $("#addNewPwd").val() != $("#addNewConfirm").val()) {
            $("#validation > p").text("Passwords must match.")
        } else { //validation approved

            //CLOSE POP UP
            $("#addNewItemModal").css("display", "none");

            //GETS ADDED ADDRESS
            let addedAddress = $("#addNewAddress").val();
            //GETS ADDED USER NAME
            let userName = $("#addNewUsername").val();
            //GETS ADDED PASSWORD
            let password = $("#addNewPwd").val();

            //LABELS THE INDEX OF THE WEBSITE
            let websiteNum = "website" + siteNum;
            //NUMBER OF ITEMS
            let incrementedSiteNum = siteNum + 1;

            //BUILDS DATABASE NODES
            firebase.database().ref('users/' + userid + '/websites/' + websiteNum).set({
                "address": addedAddress,
                "userName": userName,
                "password": password

            });

            //UPDATES NUMBER OF SITES NODE
            firebase.database().ref('users/' + userid).update({
                "sitenum": incrementedSiteNum
            });

            location.reload();
        }
    });

    //LOG OUT
    $("#logOut").click(function () {
        firebase.auth().signOut().then(function () {
            window.location.href = "./safestoreV2.html";
        }).catch(function (error) {
            // An error happened.
        });
    });

    
    
    //APPENDS NEW TABLE ROW
    function appendRow(str1, str2, str3) {

        //MAKES NO ITEMS AVAILABLE MESSAGE DISAPPEAR
        $("#noItems").css("display", "none"); 
        //SHOWS TABLE
        $("#storedWebsites").css("display", "table");
        
        let address = str1;
        let rowID = str2;
        let password = str3;
        let path = "";
        let strengthString = "";

        let tr = $("<tr></tr>");
        tr.attr("id", rowID);
        $("tbody").append(tr);

        //FIRST TD: WEBSITE ADDRESS
        let td1 = $("<td></td>");
        td1.addClass("address");
        td1.text(address);

        //SECOND TD: STRENGTH BAR (ICON)
        let td2 = $("<td></td>");
        td2.addClass("strength");
        td2.text("Strength: ");
        let barImage = $("<img>");
        if (password.length < 8) {
            path = "./Images/Red.png"
        } else if (password.length == 8) {
            path = "./Images/Yellow.png"
        } else {
            path = "./Images/Green.jpg"
        }
        barImage.attr("src", path);
        td2.append(barImage);

        //THIRD TD: STRENGTH INDICATOR (STRING)
        let td3 = $("<td></td>");
        td3.addClass("strengthString");
        if (password.length < 8) {
            strengthString = "Weak"
        } else if (password.length == 8) {
            strengthString = "Moderate"
        } else {
            strengthString = "Strong"
        }
        td3.text(strengthString);

        //FOURTH TD: REMOVE WEBSITE ICON
        let td4 = $("<td></td>");
        td4.addClass("removeIcon");
        let removeIcon = $("<i></i>");
        removeIcon.addClass("fas fa-trash-alt");
        td4.append(removeIcon);

        tr.append(td1, td2, td3, td4);

        //REMOVE ICON EVENT LISTENER
        removeIcon.click(function () {
            let item = $(this).parent().parent().children("td.address").text();
            if (confirm("Would you like to remove the stored password for \"" + item + "\"?")) {

                //remove from database
                firebase.database().ref("users/" + userid + "/websites/" + rowID).remove();

                location.reload();
            }
        });
    }
    
    var detailsText = "";

    //TELLS USER THE DETAILS OF PASSWORDS
    function constructDetails() {
        freqAr.forEach(checkPwdFreq);
        if (detailsText == "") {
            detailsText = "<p>All passwords are unique. Good job!</p>"
        }
        let text = $("<div></div>");
        text.html(detailsText);
        $("#detailsPanel").append(text);
    }

    //CHECKS FREQUENCY OF PASSWORDS
    function checkPwdFreq(value, index, array) {
        let frequency = value;
        if (frequency > 1) {
            detailsText += "<p>Password \"" + uniquePwdAr[index] + "\" is used for " + value + " different websites.</p>"
        }
    }
    
    
});