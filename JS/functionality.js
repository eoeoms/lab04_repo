    //REMOVE STORED PASSWORD
    $(".removeIcon i").click(function () {
      var item = $(this).parent().parent().children("td.address").text();
      if (confirm("Would you like to remove the stored password for \"" + item + "\"?"))
        $(this).parent().parent().remove();
    });

    //ADD NEW PASSWORD POP-UP
    $("#addNewIcon").click(function () {
      $("#addNewItemModal").css("display", "block");
    });

    //CLOSE ADD MENU
    $("#closeBtn").click(function () {
      $("#addNewItemModal").css("display", "none");
    });

    //SUBMIT BUTTON ON ADD MENU
    $("#submitBtn").click(function () {
      $("#addNewItemModal").css("display", "none");
      ref.once("value").then(function (snapshot) {
        let address = snapshot.child("Master Account/Website/Address").val();
        let tr = $("<tr></tr>");
        $("tbody").append(tr);
        let td1 = $("<td></td>");
        td1.text(address);
        td1.addClass("address");
        let td2 = $("<td></td>");
        td2.addClass("strength");
        td2.text("Strength ");
        let td3 = $("<td></td>");
        td3.addClass("removeIcon");
        let removeIcon = $("<i></i>");
        removeIcon.addClass("fas fa-trash-alt");
        tr.append(td1, td2, td3);
        td3.append(removeIcon);
        removeIcon.click(function () {
          var item = $(this).parent().parent().children("td.address").text();
          if (confirm("Would you like to remove the stored password for \"" + item + "\"?"))
            $(this).parent().parent().remove();
        });
      });
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